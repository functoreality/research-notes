> 2022-11-05 将 MR.md 中 ROM 部分转移至 dynSys.md，2023-10-21 从 dynSys.md 独立
* 将动力系统的态空间分类为离散状态的 `GDyNet-1902.06836`
* `2008.10263`: （后补）似为动力学用 reservoir computer 有记忆编码到隐空间，并在其中 Koopman 时间推进
	* "Two methods to approximate the Koopman operator with a reservoir computer"
	> [AISC-list](http://www.fields.utoronto.ca/activities/20-21/dynamical) 网页推荐，Koopman 部分；2020-12-11 时还没有被引
	* 基于 EDMD，要寻找状态空间“字典”$\phi$ s.t. $(\mathcal{K}I_n)\phi\approx K\phi$，$K$ 在确定 $\phi$ 后容易求出
		* $\phi=\mathrm{id}$ 为 DMD，针对动力学近似线性的情形
		* 实验 baseline 为 Gaussian radial basis func 表达字典，结论为同维数下不如提出的方法；另有用多项式做法
		* 提出的方法使用 reservoir computer 表达字典；
			* 另外，为了预测任务，$\phi$ 信息已经包含 $x$（即有 id 分量），即通过扩充维度升维来使非线性动力系统线性化
			> 注意引入 RNN 之后，字典 $\phi(x_t)$ 已经不只依赖于当前输入，还包括 memory $s_t$（或者按文中解读为输入的 time-delay coordinates）！预测时还是需要用到 $K$，因为 RNN 本身不能够恢复出 $x_t$；
			* [下方](#collected) Koopman 有我的评述；根据 eqn(16)，EDMD 多步预测应该使用的是 (1) 版本；p22:1 提到 (2) 版本
			> 这里我们有的映射是 $\phi\mapsto x$, $\phi\xrightarrow{K}\phi$, 但是没有直接的 $x\mapsto\phi$，除非保留 $s$ 的值，或者迭代多次初始化（可能需要精确的 $F$ 映射）；下面我的评述里的 (1) 需要初始化迭代多步后再得到 $\phi$，(2) 版本则需要保留和更新 $s$
			* alg1 求 $K$ 时使用的 $\psi$ 要抛弃初始化阶段的（假设观测的动力学 $x(t)$ 已经精确给定）
		> TDA 里用到的 Vamp-2 score 则是
		> 1. 受 SVD 启发提出了一种“什么字典好”的判断标准（本文则没有这样非平凡的标准），并以它为 loss 训练 NN 表达字典，
		> 1. 寻找字典需要非线性优化；
		> 1. 字典仅依赖于当前 $x$ 状态（即属于传统 Koopman 设定）；
		> 1. 没有强制字典包含 $x$，全部元素根据判断标准求出，
		> 1. 且标准只适用 $F$ 随机情形，不适用这里确定性情形
		* 本文比较的标准，
			* fig2 直接用线性近似误差，method2 eqn(10) 的优化目标也是这个，而这只有在保证 $\phi$ “非退化程度”（即：不是常数）相同的前提下才是合理标准；
			* eqn(16) 后的 NRMSE 是一种保证方式，对“非退化程度”（这里使用的是关于时间的方差）归一化；注意这里的区别还有：使用长期预测误差而不是单步误差，也不是只用 $E(T)$ 因为末态准确未必中间也准确
			* 由于字典包含状态自身，可以直接比较预测结果 $x(t+1)$；见 fig3-5
	* eqn(5), fig1 回忆 reservoir computer，状态受输入和前一步的影响方式均随机给定，每步加噪声，只有状态加输入 $\bar s=[s;u]$ 到输出 $y$ 的变换 $W_\text{out}$ 待训练
	* method1 用 $\bar s=[s,x]$ 作为状态空间的字典
		* p8 rmk1 可以看做 time-delay 坐标的非线性表达，之前已经有工作这样处理 Koopman；因此需要初始化足够时间
		> 应该就是让字典 $\psi$ 不仅依赖于当前步骤的 motivation；前序工作似乎有的显式使用 time-delay 坐标，这里改 RNN 隐式使用；此外，本文相较这些前序工作有只需要线性优化的特性，也许可以帮助估计 $\mathcal{K}$ 特征值；
		> 注意实验用到的动力系统 c 本身涉及 time-delay coordinates；
		> 关于 time-delay 坐标：20fall 组会我讲 TDA 时，分析时间序列的任务也涉及，提取局部信息，结果能够看出有效性；此外差分方程的高阶依赖，在 time-delay 坐标下可以表示成只依赖于前一个时间步，类似高阶 ODE 化为一阶高维的做法；
		> `~/AISC/others/why-time-delay-emb` 为jpf学长的解释，有两篇参考文献 "Chaos as an intermittently forced linear system", "Ergodic Theory, Dynamic Mode Decomposition, and Computation of Spectral Properties of the Koopman Operator"；似乎类似把字典函数取为 $[\mathcal{K}x(t_1),\dots,\mathcal{K}^mx(t_1)]$
		* 字典部分参数都是 reservoir 部分的，没有进行训练的部分，只最后求 $K$；下一个方法倒是有可训练参数
	* method2 减少维度用 $y$ 做字典
		* 似乎要保证 $y$ 的后一个分量为 $u=x$，从而取定 $W_2=[0,I]$
		* $K,W_1$ 交替优化，均有显式表达
		* 对 $W_1$ 优化有两种做法，eqn(13) 直接优化 和 eqn(14) 对 $\Psi_1=W_1 S$ 优化，最后再恢复 $W_1$
		* eqn(14) 后，注意 $S^+S'=\operatorname*{\arg\min}_{L}\|SL-S'\|$，应该一个次对角线为 1、其余 0（除了最后一列）
		* secIV.E.1 需要低维逼近时适合用，训练代价大于 method1，且随数据集规模增大；预测任务上效果稍好（> 为什么降维反而好？）
			> (?)  secIV.B:1 又说 method1 表现通常还是更好
	> method1 类似 random feature model，method2 则是先取足够多的 random feature 然后找一些组合来减少用到的（组合）feature 个数
	* 实验，包括 Lorentz 混沌系统
		* p15:1 EDMD+RBF 的维数与 method1 相同，从而可以比较
		> (?) secIV.B:2 "reconstruct the trajectories from the initial state"，初始化 reservoir 并忘记其随机初值的阶段怎么体现？
		* fig2 应该是绝对误差而不是相对误差，系统本身取值较小；否则精度高于机器精度不合理；当然也有可能是因为没有开方，开方后精度确实不到机器精度
		* table2, method2 维度低于 RBF-EDMD，有时候表现好有时候差一些
		* reconstruct + predict；似乎都是用训练数据，前者输入训练数据的 initial state，后者用 final state
			> 相当于分别考察拟合能力和泛化能力；下面的结论是自然的，应该是 method1 会出现过拟合，如 fig5 method1 短期很精确但是误差发散，method2 一开始就不怎么精确但是误差没有立刻随时间放大，只是 fig6 长时间收敛到均值，表现得更稳定
			* reconstruct 任务 method1 表现好，predict 任务 method2 好
		* secIV.D 用 $\lambda(K)$ 近似表达 $\lambda(\mathcal{K})$
			> 摘要提到的只使用线性优化算法，是否是因为显式解便于提高精度？
			* EDMD 很多特征值算出来在原点，是因为 dictionary 有冗余，而提出的方法 redundancy 少，method2 得到满秩矩阵
			* EDMD 在一个动力系统里出现许多大特征值（> 应该不能要，因为本来的动力系统并不会发散，不应该有大特征值），而 method1 大量特征值落在单位圆上（> 不知道这些模长 1 辐角非零的特征值是否提供有效信息），method2 圆周和内部都有一些
			> 是否可以认为 method2 字典总数少且有提取重要分量的过程，从而得到的特征值都是比较重要的那些；大的特征值未必重要，也许对应的特征向量可以一直模很小？
			> Koopman 算子的谱可以用来做时间序列的 classification；文中提到有使用类似做法分析 SGD 的工作
	* secV:2 本文目标不是达到更高预测精度，尽管可以改进做到
		* secIV.E.3:1 "best global linear approximation of the dynamics"
		* 摘要 表明卖点：reservoir computer，优化算法只涉及线性
		> 非线性都在 reservoir 部分，是直接给定的，不需要训练
		* secC.1:3 "provide the basis functions that yield the most accurate approximation of the Koopman operator" (>?)
	* secIV.D $K$ 的特征值分布；EDMD 有模大于 1 特征值从而不稳定，method1 特征值覆盖了整个单位圆 (> 因为维数高，特征值也多)，method2 两个实验表现稍不同
		> 为什么用 reservoir 可以使得 $K$ 特征值模长被控制？
* `2105.14633` POD 基底依赖于参数，用无网格 NN 生成，线性系数训练时 NO 生成、预测时解线性方程组
	* "A learning-based projection method for model order reduction of transport problems"
		> created on 2022-04-11, citing `1911.06598`
	* 方程参数 $\mu$，为每组 $(t,\mu)$ 选用不同基底 $\phi_i$
	* eqn(3.9) 训练时 $u(-,t)=\sum_i\alpha_i(t,\mu;\theta)\phi_i(-,t,\mu;\theta)$
		* eqn(3.10) loss 即有监督、有网格 NO loss
		* （评）这种表达方式没有假设解流形低维结构（例如 $\mu$ 无穷维时）
	* alg1 预测时时间推进：已有 $\phi_i$ 代入 $(t_{n+1},\mu)$ 后在网格离散，原方程离散为线性方程组，从中解出系数 $\alpha_i$
		* eqn(3.19) 若改写为极小化 loss 形式，则线性方程组改写，为加权形式
	* eqn(3.17) 比较基线方法：训练 AE 表达解流形，预测时只用解码器、优化隐向量 $\hat u_r$，可能涉及解码器的二阶导数 eg. `1909.09754`
		* （评）预测时用法和 AD 很像？看起来也是无网格，TODO check
		* 相比之下，本文方法不涉及对 $\phi$ 求导（> 不过解线性方程组还是有代价，虽然或许维数不高）
		* 且不需要像 AE 那样输入完整/降阶后的解，更灵活，可用于不同 mesh
	* 与基于最优传输的基线方法比较：本文无需找出显式变换形式
	* 实验：1D、2D 线性 advection、Burgers 方程，可压流体 Euler 方程算激波
* `DL-ROM-2001.04001`: #parametrized_PDE, #solution_manifold
	* 参数化含时 PDE，据解流形观点在解算子架构内引入低维瓶颈 $(t,\mu)\mapsto u_n\mapsto u_h$
		> 只考察了向量形式的 PDE 参数 $\mu$
	* "A comprehensive deep learning-based approach to reduced order modeling of nonlinear time-dependent parametrized PDEs"
		* [published](https://link.springer.com/article/10.1007/s10915-021-01462-7)
	* 针对特定的 PDE，即 $f$ 给定；似乎是希望泛化到其他参数 $\mu$
	* notation: $u$ 真解（eqn(18)），$u_h$ 离散化数值解（高精度版本），$\tilde u_h$ 近似的数值解，来自降维后解 $u_n$
	* (preliminary) sec2.2:-2 阐述后一段提到的两种 RB 方法
		> fig16 实验中 RB 再求解和求解后 RB 的结果差很大
		* eqn(6) 是 $\approx$，eqn(8) 才是严格等号
	* (preliminary) sec2.3:1 非线性降维相当于数据聚类后每个类局部 POD
		> 应该是在 $u_h$ 的空间进行聚类，eqn(4) 分成子集再分别用于 RB 训练
		* 实验 sec4.3 table5 展示了聚类个数与（最大局部）维数关系（要求局部达到本文方法的精度）；聚类数目太多时维数不再减少，因为局部数据量太少导致误差增大
		> 似乎没有考虑动力学，只是考察降维+恢复本身的误差？或者在 ref[35] 里？
	* eqn(11) 非线性情形需要恢复的动力学不再是方程形式（对比线性情形 eqn(6)），而是直接给出映射形式，
		> 描述 reduced manifold 上的时间方向（向量场；反正用 NN 表达也可以 BP）；如果 $\mu$ 为初值，只看 $t$-维度相当于描述了时间演化算子；
		> 和只描述 $(t,\mu)\mapsto\tilde u_h$ 的映射相比有什么好处？便于理解动力学的低维结构，进行后续分析？精度方面也许与引入 encoder loss 的作用类似
	* fig2 本文方法使用两个模块：表达 reduced dynamics 和 reduced trial manifold
		* eqn(18) 再加上 encoder, 只有训练时用到
		* AE 部分用 CNN，原因 secA.3:-1 减少参数量
			* CNN 只对离散化空间 sec4.1:1 (finite element) 而不对时间卷积，sec3.1:-3 "applying row-wise", reshape 成为方阵后使用二维卷积
			> 注意 CNN 最后还会 reshape 回向量再全连接；因此是在需要卷积时才用到 reshape 后的版本；
			> (?) 动机？table1,2 ref[17] 里是两个空间坐标所以用 CNN 正常，这里强行 reshape 成二维有点奇怪
		* eqn(20) training/validation loss 包括在 $u_h$, $u_n$ 处的误差；
		* p8:-1 testing 不涉及 encoder sec3.1:-1，只涉及 $u_h$ 误差；实验中通常只使用 $\epsilon_\text{rel}$ eqn(23) 描述 test 结果
			> 可能 fig19 的图除外？似乎只有这里涉及 test loss
		* 额外的 encoder loss (at $u_n$) 能改进训练结果，见实验 3 fig21
		* 实验中，训练使用的 $\mu$ 等间距选取，相邻两个训练 $\mu$ 的中点用作测试（sec4.2.2 两个参数情形，对各个参数分别这么选）；时间似乎一样，都是 $N_t$
			> (?) 时间点相同是否会带来问题？
	* $n\ge n_\mu+1$，解流形维数稍高于时间+参数维数
		* 实验使用小的 $n_\mu$, 1 or 2
	> 相当于下图，拟合离散解+AE寻找离散解的降维；只是跳过了 $\hat u_h$ 直接使用复合映射，encoder eqn(18) 没有直接用到；从而最后一个映射描述时间、参数依赖，一个映射 decode 描述解流形
	> $$\begin{matrix}
		(t,\mu)&&
		\\\dashdownarrow&\searrow&
		\\\hat u_h&\to&u_n\to\tilde u_h
	\end{matrix}$$
	> (?) 降维是否并不用于预测（加速 PDE 求解）？那降维意义在哪？也许引入解流形和 $u_n$ 方便泛化/低代价迁移到更大的 $N_h$ 网格；泛化到更大的 $t$（如果约简后还是 PDE 则可以保证这个）？
	> idea: 也许可以试着对解流形 TDA；回忆 TDA 在低维好做；如何体现时间和参数的方向（如 time-delay emb）；
	* alg1 输入有 snapshot $S$ 来自 FOM 精确解
	* 实验
		* Burgers' eqn 对线性 ROM 还好；输运方程则需要 90 (sec4.2.1) / 165 (sec4.2.2) 维线性流形
		* sec4.3 方程组，$u,w$ coupled, $w$ "recovery variable"
			> 猜测下面是只针对 $u$ 做降维？因为前面 settings 都用 $u$ 来描述提出的算法
		* p15 hyperparameter tuning，取定一组初始参数 table3，逐个参数搜索最优（其他不变），最后认为这些参数组合也是最优 table4
			> 不是用的联合寻找最优，而是假定各个参数的影响独立，应该只是为了减少测试数目而这么做
	* 讨论 2020-11-21
		* 同样考虑不同参数的问题；本文与传统 POD 假设解有低维结构；MgNet 则是假设求解数值格式中有特殊结构，用 NN 改进传统方法（多重网格）的一部分架构；可能后一种更好一些，NN 只修改人们不清楚的部分，很清楚的就不改，保留可解释性
		* 泛化到不同 $h$ 网格需要重新训练 encoder/decoder
		* 一维网格 reshape 为二维再 CNN 可能引入了 nonlocal 结构，也许可以帮助一些事情；类似的有图像打 patch 然后堆叠、做 3D 变换卷积
		* 实验 1 有耗散的 Burgers 相对好解，且这里的 $\mu$ 没有达到出现难度的大小
		* 一维空间 PDE 一般不难解，但是本文没有尝试维数高一些的例子
	* 后续工作 `DL-ROM-2111.12511`, `DL-ROM-2103.06183`
	* related: `1812.08373` CNN AE 降维，分析了时间离散带来的后验误差估计
		* `NIF-2204.03216` 物理场空间表征用参数化（无网格）而非网格离散
* `DL-ROM-2103.06183`: #Kolmogorov_n-width, #NO
	* `DL-ROM-2001.04001` 中 encoder 换为 transcoder 以减少隐空间维数，有定理为依据
	* "A Deep Learning approach to Reduced Order Modelling of Parameter Dependent Partial Differential Equations"
		> created on 2022-02-06
	* eqn(3) nonlinear Kolmogorov n-width $\delta_n$ 定义为 $n$-维隐空间的 AE 最小 loss，编码解码器只要求为连续映射，未必 NN
	* $n_{\min}(S)$ 定义为使 $\delta_n=0$ 的最小 $n$，即完全恢复的 AE 最小隐空间维数
		> 实验 2 其实只要求 $\delta_n$ 充分小，不需严格为 0
	* thm2 $p$ 维拓扑流形 $S$ 满足 $n_{\min}(S)\le 2p+1$
		> DINH DUNG AND VU QUOC THANH "ON NONLINEAR n-WIDTHS" 里的结论：$\delta_{2n+1}\le a_n\le\delta_n$，其中 $a_n$ 为 Aleksandrov nonlinear n-width，定义类似 AD；
		> 应来源于拓扑结论：$p$ 维拓扑流形可嵌入 $2p+1$ 维欧氏空间
	* thm3 设参数空间 $H$（原文记号 $\Theta$）紧致 $p$ 维，Hilbert-valued map $G:\mu\mapsto u_\mu$ 连续，像集记为 $S\subset V$，图像集合记为 $S_H\subset H\times V$
		* $G$ Lipschitz 则 $n_{\min}(S)\le 2p+1$
		* $n_{\min}(S_H)=n_{\min}(H)$
	* thm4 椭圆方程的例子：$\nabla\cdot(\sigma\nabla u)+b\cdot\nabla u=f$（弱形式），$u|\partial\Omega=g$，
		* $\mu\mapsto(\sigma,b,f,g)$ 连续（$\sigma$ 矩阵值），且满足一定条件，则：
		* 若 $\mu\mapsto(\sigma,b,f,g)$ Lipschitz（$\sigma$ 矩阵值），则 $G$ Lipschitz
		* $n_{\min}(S_H)=p$；而 $S$ 满足相同性质需要 $G$ 单射的额外条件
	* 算法：给定网格，原来是先学 AE 表达解流形 $S^h$，隐向量记为 $u^n$，$n\le 2p+1$
		* 然后扔掉编码器，学 $\mu\mapsto u^n$ 映射；最后可与解码器联合 fine-tune
		> 基本同 `DL-ROM-2001.04001`
		* 另一种可能性：改对 $S_H^h$ 降维；由于对重建 $\mu$ 不感兴趣，将编码器换为 transcoder，形如 $H\times V^h\to\R^p\to V^h$
		> transcoder 训练出 $(\mu,u_\mu^h)\mapsto\mu$ 也是有可能的，但这意味着解码器直接可起到解算子的作用；
		> 从而用 NN 训练时，这种通过中间低维结构做中介的方法 效果不会差于直接训练解算子做法
	* 实验 1 稳定反应扩散方程，源项为 Dirac 函数，用 $\epsilon$-磨光，secA 证明 $\epsilon\to 0$ 收敛到真解
	* 实验 2 Poisson 方程，系数场由高斯过程给出，KL 展开中 truncate 到前 $k$ 项故低维
	> 两个实验均不含时，与前序工作略有不同
	* fig7 解流形示意图，这里组成 $p>n$ 的圆形
	* sec5:-1 结论，multi-query 的苛刻任务包括敏感性分析、UQ、多尺度方法典型任务；{n26e9k}
	* lemC.2（arXiv-v2）椭圆方程解关于系数 Lipschitz（$Lu=\nabla\cdot(\sigma\nabla u+b\cdot\nabla u=f$，边界值 $g$，要求 $\nabla\cdot b=0$）
		* （评）感觉结论应该是在任意有界集合上 Lipschitz，不一定要是紧集
		* p37:-1 不是用的 $L^2$ 内积，故用一致椭圆条件时是分解为 $q,q'$ 范数而非 $\|\nabla\phi\|_2^2$
			* 用到 $\nabla\cdot b=0$：是为了 $\int b\phi\nabla\phi=0$，进而首项一致椭圆直接得出整个算子 $A$ coercive
		* 连续性证明纲要：lemC.1 $a(\tilde u,w)=F(w)$ 有 $(a,F)\mapsto \tilde u$ 连续，lemC.2 再证 $(\sigma,b)\mapsto a,(\sigma,b,f,g)\mapsto F$ 都连续，$u=\tilde u+Tg$ 当然连续
		* lemC.1 由 $\tilde u-\tilde u'$ 为某方程解，估出其范数，表达式涉及 $\lambda(a),\|\delta a\|$
		* lemC.2 估计了 $\lambda(a)\ge\epsilon$，以及用 $\|\delta\sigma\|,\|\delta b\|$ 表达 $\|\delta a\|$；$\delta F$ 类似
* `DL-ROM-2111.12511`: #NO
	* `DL-ROM-2001.04001` 用于具体问题，精确模型生成小数据集后传统 POD 生成大数据集再训 NO
	* "Deep learning-based reduced order models for the real-time simulation of the nonlinear dynamics of microstructures"
		> created on 2022-02-07
	* eqn(1) 考察的系统，关于时间二阶的 PDE，多个方程，时间周期边界（即：只考察周期 $T$ 的解）
	* fig POD-Galerkin DL-ROM 流程图，sec3.2:5
	* 先随机抽取少部分参数 $\mu$，用 full-order model 算解，解记为 $u_h\in\R^{N_h}$
	* 这些解 SVD 后获得 POD 基底，共 $N$ 个
	* 更密集地选取参数 $\mu$，用 POD 降阶模型算解，解记为 $u_N\in\R^N$
	* 将各 $u_N$ 组成的数据集用于训练 AE，隐向量 $u_n\in\R^n$
	> 据 eqn(11-1) 无需恢复到原网格 $Vu_N\in\R^{N_h}$，故应该不是 CNN 架构
	* 像之前工作一样训练 $\mu\mapsto u_n$ 网络，从而获得神经算子，可用于推断
* `POD-LSTM-ROM-2201.10215`: #NO, #RNN
	* `DL-ROM-2103.06183` 中为增强时间外推能力，AE 改对时间序列降维，再增加 LSTM 预测时间推进
	* "Long-time prediction of nonlinear parametrized dynamical systems by deep learning-based reduced order models"
		> created on 2022-02-08
	* 像前序工作用 POD 生成数据 $u_N$，只是这里时间离散明确为 $(t_0,\dots,t_{N_t})$
	* fig2 step1：$\mu$-POD-LSTM-ROM，相当于前序工作改成时间批量编解码版本
		* 整体目标：训练解算子 $(t_i,\mu)\mapsto u_N(\{t_i,\dots,t_{i+K-1}\})$
		* AE 改用 LSTM 接收长 $K$ 时间序列 $u_N(\{t_i,\dots,t_{i+K-1}\})$
		* 隐向量 $u_n(t_i)$ 不含时
		* 前向算子 $\phi:(t_i,\mu)\mapsto u_n(t_i)$，LSTM 解码器再将之映回 $u_N(\{\cdots\})$
		* 训练 loss1：$(t_i,\mu)\mapsto u_n\mapsto u_N$；loss2：编码器与 $\phi$ 给出的 $u_n$ 之差
		> 与前序工作不同；前序工作先训 AE，再训 $\phi$；
		> 这里同步训练，且组合方式不同，解码器接收的 $u_n$ 来自 $\phi$ 而非编码器，从而非 AE loss；
		> 这里的解读：loss1 解算子 loss，loss2 试图使解算子中间层 $u_n$ 部分可解释——能由编码器获得
		* eqn(11) 对每个 $\mu$，上面的 loss 要对 $i\le N_t-K$ 求和
		> (?) eqn(12) 中 $u_N$ 没看出有多个时间步，不同于 fig2；可能只是角标没写明白
	* fig3 step2：$t$-POD-LSTM-ROM
		* 训练时间外推算子 $u_N(\{t_{i-p+1},\dots,t_i\})\mapsto u_N(\{t_{i+1},\dots,t_{i+k}\})$
		> 没用到上一步训好的网络，所有 LSTM 等均新训练
		* LSTM 编码器：$u_N(\{t_{i-p+1},\dots,t_i\})\mapsto h_n(t_i)$
		* 解码器前的网络：输入 $\mu$，中间层 concat $h_n$，输出 $h_n'$ 作为解码 LSTM 输入
		* LSTM 解码器输出 $u_N(\{t_{i+1},\dots,t_{i+k}\})$，loss 即与真解的误差
	* fig1 用于实际推断：给定新的 $\mu$，$\mu$- 模型预测 $(0,T)$ 范围的解，解输入 $t$- 模型预测后续
		* 实验中考察的系统都取定初值，无需在 $\mu$ 中体现，$\mu$ 有限维
	* 实验：
		* Lotka-Volterra 竞争模型（3 物种），ODE 系统用于 proof-of-concept 无需 POD，常数初值
		* 不稳定 advection-diffusion-reaction eqn、不稳定 NS，零初值
		* 时间外推效果好于前序工作
	* 摘要声称至多可外推至训练时长的 15 倍
	> 前序工作的解算子形式上就没考虑时间外推；这里的外推能力可能只来自训练时间演化算子，未必比 ((o5sm3k))singleDyn 中其他做法外推能力更强？
	* > (mine) 关于方法使用的内（LSTM）外（NO 多次复合）双重时间推进架构
		* 原则上可输入单时间步信息后，用一个 RNN 无限迭代输出所有时间预测的信息
		* 这里的 RNN 输出总时长有上限 $k$，后续迭代需要外层时间推进，将刚预测的时间步重新输入 RNN
		* 并且此处 RNN 输入为多时间步，实现上真正输入的为另一 RNN 编码的结果
		* 也许上述两处做法是考虑 RNN 表达能力有限，只让其负责短时预测，回到外层用 NO 复合来长时演化的精度更高？
* `2110.03442` （备用）参化含时 PDE 用 AE ROM，传统卷积 AE 与简单全连接、图卷积比较
	* "A Comparison of Neural Network Architectures for Data-Driven Reduced-Order Modeling"
		> created on 2022-07-27
* `1812.08373` （备用）含参含时 PDE 用 AE ROM，时间演化推断只用解码器、解优化问题求隐向量时间导数
	* "Model reduction of dynamical systems on nonlinear manifolds using deep convolutional autoencoders", JCP 2020
		> created on 2022-07-27
	* （我的记号）原动力学 $\dot u=f(u,t;\mu)$，有解码器 $D(z)$ 后时间更新 $\dot z$ 根据极小化问题 eqn(3.12) $\min|\nabla D(z)\cdot\dot z-f(g(z),t;\mu)|$ 得出
		* 可视为求流形上的最佳切向量
		* eqn(3.17) 离散时间时为优化 $r^t(D(z);\mu)$ 得 $z^{t+1}$，eqn(2.2,3) $r^t$ 由 Runge-Kutta 得出
		* （评）相关：同组的工作 `CROM-2206.02607` 是先 RK 算出 $u^{t+1}$，再找最优 $z$ 接近这个目标值；由于此时优化问题为非线性最小二乘，优化算法用 Gauss-Newton 而非 SGD 类
		* 注：后续工作 `1909.09754` 回顾本文时也说可用 Gauss-Newton 优化隐向量
	* 解码器形如 $D(z)=u_\text{ref}(\mu)+g(z)$，sec5 由 AE 学出，尽管一般流形学习方法均可用
		* （评）训 AE 需传统模拟生成的数据 $\{u_{\mu,t}\}$，尽管不需要呈现为有监督数据对的形式 $((\mu,t),u)$；或许算需要数据的无监督，PINN 类是真不需数据
	* （评）arXiv 页面引文的大量流形学习相关的 PDE ROM 文章
* `1909.09754` 同理预测时间推进只用解码器、据 PDE loss 优化隐向量，并能使 ROM 保持物理守恒律
	* "Deep Conservation: A latent dynamics model for exact satisfaction of physical conservation laws"
		> created on 2022-04-11, cited by `2105.14633`；2022-11-06 重写 TLDR
	* sec1:-1 综合自己之前的二工作优点：`1812.08373` 学非线性嵌入，以及另一篇使 ROM 保持原方程守恒律
	* 方程解记为 $u(x,t;\mu)$（原文记号 $\pmb{x}$ 而非 $u$）
	* 对 $\{u(-,t;\mu)|t,\mu\}$ 训练 AE
	* 预测时用编码器获得初始隐向量 $z^0$（原文记号 $\hat{\pmb{x}}^0$）
		* eqn(10) 时间推进：只用解码器，极小化第 $n$ 步的 PDE loss 以获得隐向量 $z^n$
		* eqn(6) PDE loss 在空间离散化下由代数方程的残差大小给出
		* LSPG (least-square Petrov-Galerkin)
	* （如何保持守恒律的未看，仅备用）
* `CROM-2206.02607` 使用 INR 表达无网格 ROM，仿 AE 有监督训练，时间演化先在少数特定离散点（离线贪心生成）算更新的场、再 Gauss-Newton 算法优化隐向量以接近该场
	* "CROM: Continuous Reduced-Order Modeling of PDEs Using Implicit Neural Representations"
		> created on 2022-11-05
	* （评）引了 AD 但训练用了 AE；原文符号 $f(x,t)=g(x,q(t))$ 我仍沿用 $u(x,z(t))$
	* sec1 有网格 ROM 的限制：
		* 换网格，包括改分辨率、改离散化类型（如网格到点云）要重建流形
		* 增加离散化样本数目时，内存使用量激增
		* 建立流形后，无法自适应更新空间分辨率、离散化类型、基函数
		* 没有空间梯度信息 $\nabla_xf$
	* sec3 训练有 AD 与 AE 两种方法，本文用 AE：取定特定网格、生成数据向量 $f(x_i,t_j)$ 后，极小化 $\|u_\theta(x_i,z_\theta(f_t))-f(x_i,t)\|^2$
		* 仅在训练阶段用特定网格，解码器使用时不依赖于网格
		* 各实验中训练所用数据量（参数x时间步）与隐空间维度：热方程 8x100、16，无粘有源项 Burgers 只变源项参数 8x?、2（等于真实解流形维数），不可压 NS 只变粘度 3x50、6，固体力学重力冲击 4x200、2，固体力学 torsion tension 9x100、2
		* （评）真实解流形都相对低维，故可用较低隐空间维数
	* 时间演化推断，sec4.1 选取离散格点 $M$、自动微分求 $\nabla_xf$，sec4.2 代入方程（及边界条件）求 $\dot f$、RK 计算 $f_{j+1}$（这步不涉及 NN），sec4.3 投影回流形找 $z_{j+1}$
		* （评）要用 RK 算时间演化，可能得先把方程改写成类似于 $(f,\nabla_xf,\nabla_x^2f)'=F(f,\nabla_xf,\nabla_x^2f)$；只用 $\dot f=F(f,\nabla_xf,\nabla_x^2f)$ 不够
			* 但是要使映射只有逐点依赖，似乎得写成 $(f,\nabla_xf,\nabla_x^2f)'=F(f,\nabla_xf,\nabla_x^2f,\nabla_x^3f,\dots)$，从而如果用再高阶的 RK 还得补更多变量
			* 不确定文中怎么实现的
	* sec4.3 投影回流形，通过在离散格点上解优化问题找 $z_{j+1}$，用 Gauss-Newton 算法（默认）或解线性最小二乘近似问题，算梯度靠前传而非 BP 以加速
		* sec4.3 不使用 SGD 求解极小化，而是用 Gauss-Newton 算法做快速反演，有条件二次收敛性
		* secC Gauss-Newton 算法用于非线性最小二乘问题，无需 Hessian；结合了回溯线搜索；{_o3196t}
		* （评）可能的另一原因：时间更新量小，$z$ 初始化本身已在最优值附近，故无需用考虑全局收敛性能的 SGD 类方法，直接用局部快速收敛的 Newton 类方法更好
		* secC.1 初值对收敛重要，通常用上一步 $z$ 即可，极端情况可将 $f_{j+1}$ 输入训练所得 encoder
			* 例如流体前几步可能有压强剧烈变化
			* （评）该极端情况需在训练数据的完整网格 $P$ 上对 INR 求值，再 RK 得到 $P$ 上定义的 $f_{j+1}$；一般情形只需在稀疏格点 $M$ 上求值即可
			* 未来工作可考虑给出在 $M$ 上定义的 encoder；另有改进隐空间质量的一些可能做法（有引文）
		* secC.2 可进一步线性化得到线性最小二乘问题，$\min\|\nabla_zu\cdot\Delta z-\Delta f\|^2$，有显式解；由于 $\dim Z$ 小，线性方程组好解，代价主要在算 $\nabla_zu$
			* （评）这种设定下接近 `1812.08373`，其优化对象是 $\dot z$，相应残差定义也涉及 RK；应该也是局部优化，具体细节未 check
		* secE.1.1 BP 速度不满足高性能计算需求，故前传求值时同步前传 Jacobian（全连接网络实现不难）{_o3196d}
		* 另：secO fig30 画了隐空间的 $z(t)$ 轨迹（PCA 前两个成分）
	* sec4.4 离散格点选择，远少于传统方法所用的格点；格点位置需小心选取
		* 使用的空间格点个数可远小于原始离散化，只需控制维数使求解关于 $z\in\R^r$ 的优化问题良态（最小二乘方程个数多于自变量个数）
			* （评）原始离散化需密网格，部分由于需要算空间导数；本文靠自动微分可在稀疏网格上算准空间导数
		* fig4 热方程只用 22 格点，原始离散化 501 个
		* 需适当选取格点位置，fig4 若均匀选取则精度很低
		> 在实际应用中，我们发现随机抽样可以消除这种误差，这与现有模型约简文献中的超约简（hyper-reduction）策略是一致的（引文）
		* 本文用比随机抽样更精细的做法：贪心算法不断添加新的离散点，直至达到给定精度要求
		* （评）原理上允许使用稀疏网格的可能性，推测主要是：解码器完全表达解流形，且散点多到使最小二乘良态。故类似做法有可能用于不含时方程求解
			* 前者要求 训练数据够多、解流形 width 衰减够快。本文实验设定确实满足（数据量远大于隐空间维数）
	* secB 用贪心算法选取最优格点位置（> 离线阶段）
		* （评）离散点基于训练数据生成，即离线阶段不仅建立 ROM 还选好离散点，以对新参数、初值快速推断
		* 对给定离散点集 $M$，计算相应残差（定义在数据格点 $P$ 上）如下：
			* 对给定 PDE 参数 $\mu$，用 $M$ 作离散点演化至终态
			* 计算该终态在 $P$ 上的残差（与真解终态比较）
			* （评）演化过程 INR 只在 $M$ 上求值，只在终态比较时在整个 $P$ 上求值
			* 对所有 $\mu$ 求和
		* 计算当前 $M$ 的残差，取残差最大的 $q$ 个顶点（均为数据格点）组成集合 $Q\subset P$
		* 对 $x\in Q$ 计算 $M\cup\{x\}$ 对应残差，用残差的 $\|-\|_2+\|_\|_\infty$-范数度量 $x$ 的性能
		* 将性能最好的 $x$ 加入 $M$ 中。如此反复，直至达到给定精度要求
	* （评）这套做法应也可用于不含时方程求解，我在 `paramPDE%`“ROM”确实按该框架叙述本文做法
		* 若不含时方程设置一个迭代格式，则对 $z$ 迭代与本文时间推进类似
			* 具体讨论需有合适的迭代格式才行；似乎对稀疏散点不太好给出合理的格式
		* 若直接优化 $z$ 得到解，本文的启示在于可以只采样全区域的少量散点 $M$ 来算 PINN loss
			* 预计可用条件与我上面对本文讨论的相同：解流形被 INR 完全拟合、散点数多使最小二乘良态
			* 具体对不含时问题表现如何还需要进一步确认
			* 另可考虑随迭代进行动态改变散点选取（类似这里 remesh），而非离线生成一套固定散点；可能需仔细设计，或离线训一个类似 RL 的机制来学选取方式
	* 实验
		* fig8 弹性体下落撞击固定物体，过程中可动态加密网格 remesh（> 怎么调整的网格？没找到）
		* 极端变形问题；fig9 本文方法在隐空间 2 维即有很高精度
		* 与传统 POD 比，精度、速度、内存效率均明显提高
	* （其他细节）secE 弹性问题测试 $\nabla_xu$ 计算准确性
		* secE.1.2 自动微分时，ELU 激活好于 SIREN，因为 SIREN 的高频先验更适合拟合高频函数
		* secE.2 数值微分（带空间离散）+SIREN 梯度估计最准；{_o1sa2w}
			* 无网格表示仍有意义，可自行 remesh 等；{_o1sa7r}
		* （评）对一般框架 ((n3pj3j))coordLoss 有参考价值，当时的说法是 gradient masking
	* 前序工作，也是 INR ROM：2109.12390，处理材料变形，$\psi(-,t):\Omega^{ref}\to\Omega_t$，边界条件由表面移动速度给出，基于点云方法 material point method MPM；{_q4rf3b}
* `NIF-2204.03216` 与 DeepONet 可类比：参化含时 PDE 的时间推进 NO，空间无网格，主网络的低维 modulation 据参数生成
	* "Neural Implicit Flow: a mesh-agnostic dimensionality reduction paradigm of spatio-temporal data"
		> created on 2022-11-05, 被 `CROM-2206.02607` 引用；另外 `2022-12-02`(CSImeet3) 提到
	* fig1 架构：INR，$x$（不包括 $t$）输入 ShapeNet，该网络 weight, bias 通过瓶颈隐向量做线性变换生成，$t,\mu$ 输入 ParameterNet 给出该隐向量
		* （评）架构类似 modulation `functa-2201.12204`，只是隐向量不靠优化获得，而用 NO 直接给出
	* fig2 与 DeepONet 比较：DeepONet 可视为仅参化最后一层权重的 NIF
		* 名称对应，ShapeNet 对应 trunk net（> 图里画反了），ParameterNet 对应 branch net
		* DeepONet 重点在学 NO，NIF 重点在学时空动力学的隐空间约简表征
	* 实验
		* fig10 2D Rayleigh-Taylor instability（> 初始重流体在轻流体上，流动会出漩涡）；比较对象包括 CAE（即有网格的卷积 AE 表征）
		* sec3.3 3D 全湍流时空数据集、不同 mesh、超 2 百万 cells，实现非线性降维，是作者已知的首个
		* 全球海面温度分布的稀疏重建（> 应该算小样本任务），1990-2006 年数据用于训练，之后 15 年用于测试；最少至 5 个 sensor 可恢复
	* sec4.1 方法局限性：空间上复杂的数据需要大 ShapeNet，训练时间长于 SVD、CAE，内存开销大，常缺少不变性（相较基于 graph 的网络）而可能影响泛化性能
	* sec4.2 方法优势：模型复杂度不随数据复杂度（离散网格点数）增长，训练可用不同来源（从而不同网格）的数据，spatial query（获得若干空间位置上的取值）方便
* `Quarteroni2016book-RBM` RBM 传统方法教材（未必含时）
	* "Reduced Basis Methods For Partial Differential Equations: An Introduction"
		> 导师 2022-06-01 推荐
	* prop5.1 方程 $a(u,v)=f(v)$ 则 $(a,f)\mapsto u$ Lipschitz
* Benner2015ASurveyPB 传统 ROM 综述文章
	* "A Survey of Projection-Based Model Reduction Methods for Parametric Dynamical Systems"
		* Peter Benner, Serkan Gugercin, Karen Willcox
		> 2024-02-12 导师在 MAD 小群推荐
	* 在线成本敏感的场景包括：设计，控制，优化，UQ；{_o2dg2c}
		* sec1.1:2 “设计”指评估特定设计在多种工况下的性能；sec1.1:4 设计与控制都可能涉及优化；{_o2dg0v}
		* sec1.1.5 UQ 包括正问题与反问题，前者考虑参数随机性、考察其在系统中的正向传播，后者包括 BIP；{_o2dg14}
		* sec1.1:-1 优化场景对 ROM 的需求稍有区别，只关注优化器会探索的区域即可，适宜在优化过程中调整/重建 ROM；{_o2dg1z}
	* sec1.3 ROM 有收益的许多真实场景例子（同时考虑离线成本）{_o2dg2j}

