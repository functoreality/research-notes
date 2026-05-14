> 2022-01-05 从原版 `~/nutstoreFiles/research/freeNotes.md` 修改而来
* $P(X)$ 上定义的Wasserstein metric与Optimal transport有关（相关研究还有Sinkhorn distance?）；其他metric有Levy-Prokhorov metric，total variation distance（不涉及X的度量）
* [导师采访-培养学生的思路](http://mp.weixin.qq.com/s?__biz=MzI1ODQ2MTkwOQ==&mid=2247488432&idx=1&sn=add41d0cafd03fa91e3cf08725b581f6)

## Traditional Probability/Statistics
* from ADEPT:: HMM (Hidden Markov Model), importance sampling, 
	> 来自 `ADEPT-Smith2019MEV`
	* HMM 模型：隐状态 $s_t$，从中生成观测 $o_t$；任务情景是通过观测反推隐状态、新观测的出现概率
	* importance sampling 做法：choose $w_t^m,s_t^m$ s.t. $\operatorname*{\mathbb{E}}_{s_t\sim p(s_t|o_{\le t})}\left[f(s_t)\right]\approx\sum_mw_t^mf(s_t^m)$
	* update $s_t^m\sim p(s_t|s_{t-1}^m)$, $w_t^m\propto w_{t-1}^mp(o_t|s_t^m)$, $\sum^mw_t^m=1$ normalized
	* usage eg. $p(o_t|o_{<t})\approx\sum_mw_{t-1}^mp(o_t|s_t^m)$
	* 以下推导；abbrieviate $s_{t-1}=s_-$, $w_{t-1}=w_-$, $o_{\le t-1}=o_-$; 
	* 推导 update of $w_t$:
		* $p(s_t|o_t,o_-)=\int_{s_-}p(s_t,s_-,o_t|o_-)\,\mathrm{d}s_-/\int_{s_-}p(s_t,s_-,o_t|o_-)\,\mathrm{d}s_-\,\mathrm{d}s_t$, $p(s_t,s_-,o_t|o_-)=p(s_-|o_-)p(s_t|s_-)p(o_t|s_t)$，这一变换达到 HMM 回溯一步的效果
		> 推导技巧：一般地，推导时涉及到的所有（条件）概率都用联合分布的积分表达出来，然后联合分布就可以用概率图简化
		* 分母乘 $f$ 积分 $\approx\sum_mw_-^m\int f(s_t)p(s_t|s_-^m)p(o_t|s_t)\,\mathrm{d}s_t\approx\sum_mw_-^mf(s_t^m)p(o_t|s_t^m)$，即先采样 $s_-$ 的积分，再采样 $s_t$ 的积分，后者为单样本采样
		* 注意分母中 $f$ 换为 1 即得分子，从而相当于对 $w_t$ 归一化
* Fisher information matrix (FIM)
	* [标量情形-知乎](https://www.zhihu.com/question/26561604/answer/33275982)
		* $n$ 次独立观测的结果为随机变量 $X=(x_1,\dots,x_n)$，概率模型 $p(x|\theta)$，log likelihood 记为 LL，其对 $\theta$ 导数定义为 score func $S(X;\theta)$（其期望总为 0），定义 $I(\theta)=\mathbb{E}[S^2]$；注意期望都针对当前 $\theta$ 下的概率模型求
		* $n$ 越大，$I(\theta)$ 越大，即含义 1. 得到的信息越来越多；2. 对参数估计能力越准确
	* [FIM 与自然梯度法](https://zhuanlan.zhihu.com/p/228099600) 极大似然时求 $\max_\theta\text{LL}$，牛顿法快于 GD，需要求 Hessian
		> 原文说度量指标其实是 KL 散度 $\min_\theta\text{KL}(p(x;\theta^*)\|p(x;\theta))$，但实际上若真实数据的分布就是 $p(x;\theta_*)$，数据充分多（或者对数据采样求期望）时有 
		> $\text{LL}=\frac1n\sum\log p(x_i;\theta)\approx\operatorname*{\mathbb{E}}_{x\sim p(x;\theta_*)}\left[\log p(x;\theta)\right]$，
		> 此时 LL 和 KL 仅相差不依赖于 $\theta$ 的常数
		* 自行计算可得，当 $\theta=\theta_*$ 时 FIM其实就是 Hessian
		* 一般情形认为 FIM（计算只需一阶梯度）能够近似 Hessian，相应下降方向即自然梯度
		* 此外若认为 $\theta$ 可表达所有分布组成流形，而 FIM 取为其上的黎曼度量，则自然梯度即为流形上最速下降
	* [自然梯度法理解](https://www.zhihu.com/question/266846405/answer/314354512) 另一种设定：$\min_\theta\operatorname*{\mathbb{E}}_{p(x;\theta)}\left[f(x)\right]$
		* 优化时进行局部搜索，更新满足 $\text{KL}(p(x;\theta+\delta\theta)\|p(x;\theta))=\epsilon$
		* 使用 Lagrange 乘子即可得到 $\delta\theta=-\alpha I(\theta)^{-1}\nabla_\theta\mathbb{E}[f]$
* [density ratio trick](https://blog.shakirm.com/2018/01/machine-learning-trick-of-the-day-7-density-ratio-trick/)
	* 求 density ratio $r(x)=\rho(x)/q(x)$ 等价于求解分类问题 $S(x)=p(y=\rho|x)$，其中概率模型 $y\in\{\rho,q\}$ 等概率，$p(x|y)=y(x)$；我们有 $r(x)=S(x)/(1-S(x))$
* mutual info `2021-09-01`(AISCmeet)
	* $I(X;Y)=KL(p(x,y)\|p(x)p(y))=I(Y;X)$
	* $KL(p\|q)=\sup_{T:\Omega\to\R}\mathbb{E}_p[T]-\log\mathbb{E}_q[\exp(T)]$，计算时用 NN 表达 $T$
* `probGrphDataDepend:` 对概率图 $a\to x$，$p(x_1,x_2)\ne p(x_1)p(x_2)$，观测仅条件独立（给定 $a$）
	* 由于可根据观测 $x$ 反推 $a$ 信息，不能认为不同观测独立；极端例子为 $a\to x$ 为确定性模型，此时左式 0 右式非零
* [Kalman滤波](https://zhuanlan.zhihu.com/p/39912633)
	* 动力学当前状态 $s_t$ 用高斯分布估计，线性动力学下，后一时间步为变换后高斯分布
	* 假设线性动力学本身有不确定性，修改该高斯分布
	* 有带噪声观测 $o_{t+1}=O(s_{t+1})$，它也给出高斯分布 $p(s_{t+1}|o_{t+1})$
	* 二高斯分布相乘得 $s_{t+1}$ 高斯分布最终估计
	* 综上，不确定性来源：初值、动力学、观测
	* （评）相关：`2202.05122` 求解反问题的 ensemble Kalman inversion 算法用于训练封闭模型
		* `2022-05-18`(AISCmeet2) Deep Kalman filter 概率分布用生成模型表达，客观世界建模 $p_\theta(o_t|a_t)$，类似 VAE 的 ELBO 给出反向推断映射 $q_\phi(s_t|o_{\le t},a_{\le t})$，并在生成模型中引入额外 indicator 变量以能表达（统计因果推断的）do 算子
	* （评）动力学相关的一般框架见 ((ncmk5t))数据同化
* 转移至“随机模拟方法”课程笔记后的补注
	* Brownian sheet, i.e. multivariate Wiener process，其 KL 展开形式：
		* mean-centered 版本简单一些，见 [Karhunen-Loève Expansions of Mean-Centered Wiener Processes](https://www.jstor.org/stable/4356433)
	* Gaussian random fields (GRFs), eg. $X\sim\mathcal{N}(0,(-\Delta+I)^{-1})$ 表示的分布；见教材（GSM199）sec10.2
		* 刻画的为分布而不是普通函数，此时均值 $m(\phi)$，$m$ 为广义函数，$K(\phi,\psi)=\langle\phi,\Sigma\psi\rangle$ 为双线性型，特征函数 $S(\phi)=\mathbb{E}\exp(-\langle\phi,X\rangle)$
		* 沿用多元高斯分布的记号的合理性，有限维也是考虑对偶空间，对测试向量 $y$, $y^\mathrm{T}\Sigma y=\mathbb{E}(y^\mathrm{T}x)^2$ 确实成立，其中 $x\sim\mathcal{N}(0,\Sigma)$
		* $\Sigma=I$ 对应白噪声（只能视为广义函数）；我推导了 $W_t$ 1 维布朗运动对应 $\Sigma=(-\Delta)^{-1}$；根据书中的结论推测 $\Sigma=(-\Delta+kI)^{-1}$ 对应 $\mathrm{d}X_t=-kX_t\,\mathrm{d}t+\mathrm{d}W_t$
		* KL 展开，比较有限维 $\Sigma=V\Lambda V^\mathrm{T}$ 有 $x=V\sqrt\Lambda\xi=\sum\xi_i\sqrt{\lambda_i}v_i$ 满足 $\mathbb{E}xx^\mathrm{T}=\Sigma$；
			* 无穷维 GRF 对简单的 $\Sigma=(\tau^2I-\Delta)^{-\alpha}$ 情形（此时几乎处处是普通函数）可以代入 $\cos(\pi k\cdot x)$ 求出特征值即可
		* 代码生成（网格版本）：FNO（Fourier Neural Operator）官方实现，数据生成的 Darcy flow 版本 `GRF.m` 可以参考；求和直接使用离散余弦变换 `idct2()` 实现，相当于二重求和截断到网格分辨率
		* 注：关于 GRF 的更多可参考资料，[知乎回答](https://zhuanlan.zhihu.com/p/643434159) 给了不少不同方面的
	* 核函数（而非微分算子）给出的 GRF：
		* 一维问题若归一化使 $k(x,x)\equiv 1$，则可推导时间无记忆（即 $f(x_1),f(x_3)$ 关于 $f(x_2)$ 条件独立，$x_1<x_2<x_3$）等价于 $k(x_1,x_3)=k(x_1,x_2)k(x_2,x_3)$
			* 例如归一化布朗运动 $W_t/\sqrt t$ 满足 $k(t_1,t_2)=\sqrt{t_1/t_2}$
			* 高斯核 $k(x,x')=\exp(-\gamma\|x-x'\|^2)$ 不满足（即使一维），不是条件独立而是负相关，$f(x_1)$ 大时会把 $f(x_3)$ 压低
	* RKHS（Mercer 定理给出的 feature map 与 KL 展开的相似性）
		* [zhihu](https://zhuanlan.zhihu.com/p/352966538)
			* RKHS $H$（由 $f:X\to\R$ 组成） 定义为 $\delta_x$ 为连续线性泛函的 Hilbert 空间；等价于它有唯一再生核 $k(-,-)$，$\delta_x=k(x,-)$（内积意义下）
			* 由 kernel 构造 $H$：对形如 $\sum a_ik(x_i,-)$ 的空间做完备化（Cauchy 序列收敛）
			* $k_1+k_2$ 以及 $k_1\otimes k_2$ 给出的 $H$
			* 若 $X$ compact，Mercer 定理 $k(x,y)=\sum\lambda_je_j(x)e_j(y)$
			* 同构 $\ell^2(J)\cong H$：$(a_j)\mapsto\sum a_j\sqrt{\lambda_j}e_j$，与 $X$ 测度选取无关
			> 内积不是通常 $L^2$ 内积
		* 注意同构形式同 GRF $\mathcal{N}(0,k(-,-))$ 的 KL 展开很像
			* 区别在于 GRF 中 $(a_j)$ 独立 $\mathcal{N}(0,1)$，这里要平方求和收敛
			* 从而光滑性还要好于 GRF，$\delta_x$ 连续性不难理解
			* 我算的例子：$k(x,y)=x\cdot y$ 则 $H$ 由线性函数组成（用 kernel 构造 $H$ 的方式），内积为线性系数的内积
			* RBF kernel $\exp(-\gamma\|x-y\|^2)$ 我没构造出来，只知道一维也不是无记忆的
	* 一般 GP/GRF 刻画自变量多元、因变量一元的随机函数；若因变量也多元，可参考 `2110.13361`(AISC2)

## Traditional Scientific Computing
* 传统方法为主（否则放在专门文件中）
* [航空结冰问题背景](https://mp.weixin.qq.com/s/yEyIkMIhWUBO99gm40NRCQ)（备用，作为科学计算场景，多物理、气液固耦合过程例子）
### Monte Carlo
* DMC [ref](https://www.zhihu.com/question/30454088/answer/48587942), 
	* 先区域按函数符号划分（常需要 VMC 等其他方法帮忙），每个区域当做扩散方程（短时间间隔），采样点随机扩散、依概率复制、消失；相当于把难度集中在划分符号区域上，“划分精度决定求解精度”
	* 求特征值（能量 $E$）更准，但不显式给出特征函数 $\psi$，只用相应采样点的概率密度表示
	* 可以求激发态情形，只要零点集合选取恰当
* general MC methods（补注：不如 SMCM 课程内容详细）
	* LMC [Zhihu](https://www.zhihu.com/question/348483881/answer/871584499), Langevin dynamics, Brownian motion
	* HMC, Hamiltonian dynamics
	* NUTS (No U-Turn Sampler), [Zhihu](https://zhuanlan.zhihu.com/p/59473302), improved from HMC; basic sampler of PyMC3 packages
### PDE
* JAX-FLUIDS-2203.13760
	* [src](https://mp.weixin.qq.com/s/FwKvY-AUdXeG-cHbjYH7DQ)
	* 2022-08-19(AISCmeet) 推荐
		> （li+1）他就相当于使用jax重写了传统的cfd算法，速度上应该和基于cuda的传统算法差不多。
		> 优势在于jax是全程可微的，很容易将其中任意模块替换成神经网络然后端到端训练。{_o1ok9d}
		> （lzc）他这里面用水平集法处理两相流，但感觉还是很复杂。没搞通用有限元/有限体积网格。{_o1ok9y}
	* 传统做法先 ML 生成数据才被 AI 使用，为纯数据驱动，未利用动力学性质
		* 本框架“提供 ML 和 CFD 之间无缝衔接”，可微分的传统算法
* GitHub 项目：生成 PDE 数据集，用 ARCSim, FEniCS and SU2（都是 FEM 软件包？）{_o1ol26}
	* [2024-01-24](https://hub.nuaa.cf/DiffEqML/pde-dataset-generator)，该网站为 GitHub 镜像
	* 结果保存为 DGL graph 格式，便于在图模型中使用；此外也提供 NumPy 工具
* `Decapodes-2401.17432` PDE 用外微分形式写、表示为交换图，有范畴论含义，可用于自动生成数值算法
	* "Decapodes: A Diagrammatic Tool for Representing, Composing, and Computing Spatialized Partial Differential Equations"
		* Morris, Luke; Baas, Andrew; Arias, Jesus; Gatlin, Maia; Patterson, Evan; Fairbanks, James P.; 
		> created on 2024-02-15
	* sec1.1:1 科学中已有的帮助理解复杂、耦合现象的图形化工具例子：Feynman diagrams, circuit diagrams, free body diagrams, bond graphs
	* sec1.1:3 之前给出 PDE 图形化表示的工作 Tonti diagram，电磁学中叫 Maxwell's house；{_o2fm01}
	* p5:-2 图表视为 small category，可考虑其到 analytic category（如 vector space, cochains over a manifold）的函子
	* fig3b $u_t=\nabla\cdot(k\nabla u)$ 等式用交换图表示，左式一个箭头，右式为三箭头复合
	* fig5b 对流扩散方程的交换图，加法运算通过某顶点发出 $\pi_1,\pi_2,+$ 三条边表示
	* 正式的表示使用 离散外微分（DEC），理论上允许推广到流形上的 PDE
	* fig9 BC 指定方式；代码实现时使用 masking（相应场边界直接强制设为给定值，虽会破坏场连续性，但数值实验中表现还行）
	* fig12 可压 NS 方程示例（用外微分形式改写）；为对流（而非守恒）形式，sec2:-1 其中的随体导数 $D_t$ 用 Lie 导数计算
	* （评）若该图表可用于自动生成数值算法，能否用于 PDEformer 无监督训练？
* `2110.10323` ODE、PDE 表达为计算图，定义“计算图补全”问题（根据多次部分观测数据补全未知函数关系）
	* "Computational Graph Completion"
		* Owhadi, Houman; 
		> 2024-03-17 导师在 Pf 群推荐，可能是当日和上交老师交流时得知的
	* sec2 顶点表示变量，边表示函数关系；{_o3hc3c}
		* 求和：用多入边表示，默认对所有入边求和
		* aggregate variable 用圆圈表示（其他用方框），对所有入边 concat
			* 如 $x,y$ 指向 $z$，二边分别标记为 $z_1,z_2$
	* sec3 fig1 本文考虑的“计算图补全”问题：
		* 设一个图顶点集合 V；我感觉似乎假设了图结构已知，只是某些边对应的函数关系未知
		* 观测数据 N 个，每次可观测到图中一部分顶点的变量取值，每次观测到的变量集合大小不固定
		* 要求恢复图中的未知函数关系（回归问题）、补全各次观测的所有未观测到变量（矩阵补全问题）
		* sec4.1 fig5 例子，从稀疏观测构建电路的 digital twin，电路 ODE 形式已知，其中涉及的函数 $R(I),L_1(I),L_2(I),C(V)$ 未知，各物理量变化轨迹 $V_j(t),I_j(t)$ 也未知
### Koopman
> 原文件：`papers/ModelReduction/+ModRedNotes.md`
* notation: dictionary $\chi:X\to V$, $X=\R^d$, $V=\R^n$
* 对 VAMP-2 score 的理解，SVD 启发的方式寻找 Koopman 表述对应的编码器；{n2bf1x}
	* （见 `GDyNet`(MR) ref[13] 及其 ref[47]）
	* 随机性动力学用 $F\in\mathsf{Top}(X)$ 未必能很好表达，应该用 $\mathcal{K}\in\mathsf{TVec}(C(X))$, $(\mathcal{K}g)(x)\coloneqq\operatorname*{\mathbb{E}}[g(x_\tau)\mid x_0=x]$；有 $F$ 时 $K=\mathsf{Top}(-,\R)[F]$
	* 基本假设：$\mathcal{K}$ Hilbert-Schmidt, i.e. $\mathrm{tr}(\mathcal{K^*K})<\infty$
	* 我的转置记号：对于 $\chi\in L^2(X)\otimes\R^n$，矩阵转置 $(-)^\mathrm{T}=I\otimes(-)^\mathrm{T}$（量子力学为 $(-)^\dagger$），函数空间 $L^2(X;\rho_i)$ 上对偶 $(f)^\mathrm{ti}=\langle f,-\rangle_{\rho_i}\otimes I$（量子力学中不带权的 $\langle-|$）；$\rho_0,\rho_1$ 分别为 $x_0,x_\tau$ 的分布，计算时为经验分布，相当于 $f^\mathrm{t0}\phi=\operatorname*{\mathbb{E}}_{x_0}\left[f(x_0)\phi(x_0)\right]$；对于 $\mathcal{K}\in L^2_0\otimes (L^2_1)^\vee$，对偶 $(-)^\mathrm{t0}\otimes(-)^\mathrm{t1}$ 后 $\mathcal{K}^\mathrm{t}\in (L^2_0)^\vee\otimes L^2_1$
	* 对线性算子 $\mathcal{K}$ 用 SVD $\mathcal{K}\approx f^\mathrm{T}D g^\mathrm{t1}$, $f^\mathrm{t0}f^\mathrm{T}=g^\mathrm{t1}g^\mathrm{T}=I_n$; $D\approx f^\mathrm{t0}\mathcal{K}g^\mathrm{T}$
	* SVD 等价于最小化误差问题，在正交性条件下 maximize $f^\mathrm{t0}\mathcal{K}g^\mathrm{T}$ 的对角元素和，或 $r$ 次方和（记为 $R_r(D)\coloneqq\sum D_{ii}^r$），以下 $r=2$
		* 用 Reyleigh quotient 也可以解释；猜测 fig3 的 singular func ground truth 就是这么算出来的
	* ansatz: $f=UC_{00}^{-1/2}\chi$, $g=VC_{11}^{-1/2}\chi$; $C_{00}^{-1/2}$ 为了简化对 $U$ 的约束条件：$I_n=f^\mathrm{t0}f^\mathrm{T}=UC_{00}^{-1/2}\chi^\mathrm{t0}\chi^\mathrm{T}C_{00}^{-1/2}U^\mathrm{T}=UU^\mathrm{T}$
		> 注意记号冲突，这里 $V$ 是矩阵
		<!-- $$\begin{array}{rl} -->
		$$R_2=R_2(UC_{00}^{-1/2}\chi^\mathrm{t0}\mathcal{K}\chi^\mathrm{T}C_{11}^{-1/2}V^\mathrm{T})$$
		$$=R_2(UC_{00}^{-1/2}C_{01}C_{11}^{-1/2}V^\mathrm{T})$$
		$$\le\|UC_{00}^{-1/2}C_{01}C_{11}^{-1/2}V^\mathrm{T}\|_F^2$$
		$$=\|C_{00}^{-1/2}C_{01}C_{11}^{-1/2}\|_F^2$$
		<!-- \end{array}$$ -->
		等号成立当且仅当 $R_2$ 作用于对角矩阵，这总可以在适当的 $U,V$ 选取下达到（又一个 SVD）
	* $\max_{f,g}R_2=\max_\chi\max_{U,V}R_2=\max_\chi\|\cdots\|_F^2$
	* 恢复 $K$ 矩阵，理论上有 $\mathcal{K}\chi^\mathrm{T}=\chi^\mathrm{T}C_{00}^{-1/2}U^\mathrm{T}DVC_{11}^{-1/2}\chi^\mathrm{t1}\chi^\mathrm{T}=\chi^\mathrm{T}K$, $K=C_{00}^{-1/2}U^\mathrm{T}DVC_{11}^{1/2}$，代入 $D=f^\mathrm{T}\mathcal{K}g^\mathrm{T}$ 确实有 $K=C_{00}^{-1}C_{01}$
	> 计算时不应该是 $\mathcal{K}\chi$，这样应该写为 $(\mathcal{K}I_n)\chi$；转置情形数乘等于矩阵乘，故 $\mathcal{K}\chi^\mathrm{T}$ 合法
	* 确定性 $F$ 情形 $\mathcal{K}$ 不 Hilbert-Schmidt (recall: $\mathrm{tr}<\infty$) 不适合 SVD: secA.5 证明的是此时总有 $\sigma_j=1$（$F_\#(\rho_0\,\mathrm{d}x)=\rho_1\,\mathrm{d}x$ 根据定义）
	* 感觉如果对 $\chi$ 加上太强限制，如这里的 softmax 输出，可能最优值和 $\mathcal{K}$ SVD 结果还有一定距离；但是较低几个奇异值可以比较接近，如 [47] fig3
	> $\mathcal{K}$ eg.，$F$ 为加上正态随机偏移，此时 $\mathcal{K}$ 为卷积 Gaussian kernel，也即热方程演化一定时间；对于欧氏空间可能不适合 SVD，如果紧流形则分立特征值可以：设 $-\Delta$ 特征值为 $\lambda_n$，则 $\mathcal{K}$ 奇异值 $e^{-\lambda_n\tau}$
	* 讨论 date: 2020-10-24
* 关于 DMD, EDMD 可以用于预测 $x$；{n2bf23}
	* $\mathcal{K}$ 作用于函数而不是点，此时算子才是线性的；但是 DMD, EDMD 可以给出 $x$ 演化结果，通过线性方式得到，EDMD 通过升维得到了线性动力学
	* 以下讨论 $F$ 确定性情形；$F$ 随机时，由 $\mathcal{K}$ 定义，这种方式给出的是 $\operatorname*{\mathbb{E}}_FF(x)$
		* $\mathcal{K}=C(-)[F]=\mathsf{Top}(-,\R)[F]\in\mathsf{Top}(C(X))$ ($F\in\mathsf{Top}(X)$)
	* （旧）大意：从函数空间看是线性，和升维后动力学（近似）线性，这两者其实是一致的
	* 不是用 $x\leftrightarrow\delta_x$ 以给出 $X\hookrightarrow C(X)\to X$！
	* 对 $\mathcal{K}$ 进行有限维近似；但是不是要求在整个 $C(X)$ 上近似，而是在给定 dictionary $\chi\in C(X)\otimes V$ 情形下，局限于 $\R\{\chi_i\}=\mathrm{Im}(\chi:V^\vee\to C(X))\cong V^\vee$ 子空间上要求近似（这通常不是不变子空间）（同构假定了 $\chi$ 非退化）
		> 在考虑如何优化 dictionary 时才考虑在全空间 $C(X)$ 上近似，如 VAMP-2 score 用一种类似 SVD 的方法给出确定 $\chi$ 的标准，不过只在 $F$ 随机时才有可能用这种方式得到较好的全空间近似；
		> EDMD 通常根据经验取定 $\chi$，故不涉及全空间近似；
		* 限制在该子空间上，近似的变换为 $K^\vee$（有限维线性变换）
		* i.e. $\min_K\|(\mathcal{K}\otimes I-\mathrm{id}\otimes K)\chi\|^2_{x\sim\rho}$，即作用 $\mathcal{K}$ 后离开该子空间，需要接一步投影才能回来，希望投影导致的误差最小
		* 注意，此时 $C(X)$ 上的变换 $\mathcal{K}$ 已经被 $V$ 上的变换 $K$ 近似，即：对函数的作用被对点的作用近似（只是这里的“点”在 $V$ 而不是一开始的 $X$ 中）
	* 对 DMD: $X=V$, $\chi=\mathrm{id}\in C(X)\otimes X$，近似的结果 $K$ 直接作用于 $X$
	* 对 EDMD: $V=V_1\oplus X$, $\chi=\chi_1\oplus\mathrm{id}$, 预测方式为 $F:X\xrightarrow{\chi_1\oplus\mathrm{id}}V\xrightarrow{K}V\xrightarrow{\pi_2}X$；
		* $F(x)=((\mathcal{K}\otimes I_d)\mathrm{id})(x)=((\mathcal{K}\otimes I_d)(\mathrm{id}\otimes\pi_2)\chi)(x)=((\mathrm{id}\otimes\pi_2)(\mathcal{K}\otimes I_n)\chi)(x)\approx((\mathrm{id}\otimes\pi_2)(\mathrm{id}\otimes K)\chi)(x)=\pi_2K\bigl((\chi:X\to V)(x)\bigr)$
		* 由于 $\mathrm{Im}(\chi:X\to V)\subset V$ 只是一个 $d$-维流形，通常非线性，在 $K$ 下不封闭，导致多步预测有两种可能性
		1. 不限制在这个流形内（允许“无意义”的元素），似乎一般都用这种，并且通过对角化可以方便计算 $K^t$
		> $$\begin{matrix}
		> V&\to V\to\cdots\to&V
		> \\\uparrow&&\downarrow
		> \\X&&X
		> \end{matrix}$$
		2. 
		> $$\begin{matrix}
		> V&&V&
		> \\\uparrow&\searrow&\uparrow&\searrow
		> \\X&&X&\cdots
		> \end{matrix}$$
	* 如果用一般的 $\pi:V\to X$，效果未必好，因为这里求 $K$ 的 loss 用的是 $V$ 上的 norm，已经隐含了子空间 $X$ 上误差的限制
* (mine) 用于预测 $x$ 的另一种可能（暂不严格）：$\mathcal{K}$ 限制在 $L^2(X)$ 上；{n2bf26}
	> DMD，EDMD 不属于这种情况，因为 id 不可积
	* L2 基底 $(\phi_i)$，$\phi:X\to\R^\mathbb{N}$ 单射（应能证基底必给出单射）
		> 可数基底例如量子谐振子的本征态；Fourier 变换的基底不是可数的
	* $\mathcal{K}$ 现能用 $K\in\mathsf{Vec}(\R^\mathbb{N})$ 表示，$\mathcal{K}\phi_i=K_{ij}\phi_j$，代入特定 $x$ 也成立
		* 以下说明不重要
		* 即 $L^2(X)\otimes\R^\mathbb{N}$ 上 $(\mathcal{K}\otimes I)\phi=(I\otimes K)\phi$，此处 $\otimes$ 为无穷求和版本张量积，不是常用的有限和
		* 注意这里使用的同构是 $\ell^2(\mathbb{N})\to L^2(X)$，据此给出 $K\in\mathsf{TVec}(\ell^2(\mathbb{N}))$；另一种同构 $L^2(X)\to\ell^2(\mathbb{N})$ 给出的矩阵有不同
		* 若认为 $L^2(X)$ 由正常函数组成，则 $\ell^2(\mathbb{N})\to(X\to\R)$ 给出 $X\to(\ell^2(\mathbb{N})\to\R)\cong\ell^2(\mathbb{N})^\vee$，但像事实上未必 l2（说明不好用由正常函数组成的假设）
	* 直观上如果能做某种无穷维 SVD 将 $K$ 简化至有限维，对应字典 $\xi$，若字典像 $\phi$ 一样为单射，则隐空间的线性变换能够完全对应原空间的更新
* related: `DeepGreen-2101.07206`(AISC) 非线性方程转化为线性的，解用 Green 函数表达；有限维表达下为矩阵乘法
	* 含时 PDE 时间推进算子通常比单个不含时 PDE 解算子简单
		* 故这里对系统线性化的做法可能不如含时问题的 Koopman 高效
		* 并且也没有含时多步迭代的优势（Koopman 隐空间用线性算子时间推进较为高效）

## Optimization
* [BO](https://zhuanlan.zhihu.com/p/76269142) (Baysian Optimization)
	* #active-learning, #UQ, #surrogate, #BNN
	* 使用场景：1. 目标函数计算代价高，2. 无导数；例如 NN 超参优化
		> 物理的 simulator 也属于这种情形
		* > (mine) 比较：((n32e4v))polGradOpt，policy gradient 方法可处理高维，但需要目标函数计算代价较低
	* 效果受影响场景：高维（要调的参数太多）、离散变量多
	* 要点：替换成对 acquisition func（> 相当于 surrogate？）的优化，探索开采平衡
		> 对 surrogate 的训练样本收集属于 #active-learning
	* 使用 GP（高斯过程）描述对目标函数 $f$ 的估计；以下为一些算法
		* 根据前 $t$ 步的信息，GP 的后验由 $\mu_t(x),\sigma_t(x)$ 给出
		> 刻画随机函数的方式汇总((n32f2t))，GP 只是一种；用其他方式做 BO 的例子 `DEBOSH-2109.13337`
	* GP-UCB 算法：下一步要输入 $f$ 的样本为 $x_{t+1}=\arg\max\mu_t(x)+\sqrt{\beta_{t+1}}\sigma_t(x)$
		* 基于多臂老虎机里的 upper-confidence bound 算法提出
		* 理论分析给出的 $\beta_t$ 随时间递增，实际可取常数
	* EI（Expected Improvement），假设对 $f(x)$ 的观测无噪声
		* 记 $f_t^+=\max(f(x_1),\dots,f(x_t))$，选择 $x_{t+1}$ 以最大化 $\mathbb{E}f_{t+1}^+=\mathbb{E}_f\max(0,f(x)-f_t^+)$；后者可用 $\mu_t(x),\sigma_t(x)$ 表出
	* ES (entropy search), PES (predictive ES) 基于信息论的策略，新输入尽可能减小对最优点 $x^*$ 分布的不确定性
		> 属于贪心算法？每一步都只关注当前步骤的提升
	* TS（Thompson Sampling），少用，能用的时候一般也能 GP-UCB
	* > 相关：BO 用于元学习选超参 `1910.09098`; `BOtutorial-1807.02811`
		* `2201.00272` 灰盒 BO，假定目标函数的内部计算方式可部分观察甚至修改（否则为黑盒）
			* "Thinking inside the box: A tutorial on grey-box Bayesian optimization"
			* 目标函数为复合形式，利用对内部的观察
			* 多保真（multi-fidelity），开始用速度更快精度较低的做法，如 PDE 粗网格
			* 可只对目标函数内部部分成分求值
		* 连续优化，无解析导数的方法还有 ensemble，包括 ensemble Kalman inversion 近似二阶优化算法 `2202.05122`
* 加速优化算法按数值 ODE 理解；{_n3vj72}
	* [2023-03-31 重整](https://mp.weixin.qq.com/s/ppHrekTj0RSrMSZZtKTjpA)
	* "From Differential Equation Solvers to Accelerated First-Order Methods for Convex Optimization"
	* 普通梯度下降对应 ODE $x_t=-\nabla f(x)$ 显式 Euler
	* proximal 算法对应隐式 Euler（严格来说要求函数严格凸）
	* proximal gradient 对应 IMEX（算子分裂后一个显式一个隐式）{_n3sf9e}
	* 动量、NAG 等加速优化算法对应修改的 ODE（反正能完成优化任务就行），此时是二阶 ODE（阻尼谐振子）
	* 这些算法能加速的原因：条件数变小从而时间步长可以增大（显式格式；隐式格式无条件 A-stable 但求逆有代价）
		* $A=\nabla^2f$ 考察它给出的线性系统，时间步长 $O(1/\kappa(A))$
		* 升维后系数矩阵特征值模长被开根号，条件数为 $\sqrt{\kappa(A)}$
		* 例如 heavy ball 系数矩阵 $[0,I;-A/\mu,-2I]$（$\mu$ 为 $A$ 最小特征值，先考虑非零情形）
			* 来自 $[0,1;-\lambda,-2]$ 的特征值模长为 $\sqrt\lambda$ 级别
		* 保留升维后的一阶 ODE 形式对其离散（而不是直接离散二阶 ODE），Gauss-Seidel，形式半隐式（实现显式）从而更 A-stable
		* 离散后消元去掉额外变量，此时更像时间二阶的 ODE
	* $\mu=0$ 情形用 dynamic time-rescaling 处理；由于是非自治系统，谱分析相对更繁琐
	* 下一篇推送讲 Lyapunov analysis 用于严格分析算法全局收敛性（本文仅对最优附近成立，且有局限性）
* `1807.04222` 正则化表达稀疏约束，l1 正则化用 SGD（batch training）无法近似 l0，需改优化算法：正则化对偶平均方法，凸问题下收敛性分析
	* "Modified Regularized Dual Averaging Method for Training Sparse Convolutional Neural Networks" by Juncai He, Jinchao Xu
		> 在 `2021-11-03`(lectures) 已推荐
	* 导师解释的 batch training 下问题：不同 batch 对应的最优稀疏性不同（非零元位置不同），对不同 batch 平均之后就没有稀疏性了；而 full-batch 下 l1 仍是 l0 的好近似
	* （评）网络稀疏性相关问题：MAML 学初始参数时使内循环引入稀疏约束 `MSCN-2205.08957`
### NN
* FIM 相关的超一阶算法：NG+
	> 2021-08-07 文再文，武汉 AISC 会议，用于训练全连接 NN
	* 对系数矩阵更新使用“GFIM”（generalized FIM），原版 empirical FIM 为 $\oplus\text{vec}(S_i)\text{vec}(S_i)^\mathrm{T}$，GFIM 为 $\oplus S_iS_i^\mathrm{T}$ 和 $\oplus S_i^\mathrm{T}S_i$ 中较小的那个（$S=\nabla_WL$，$i$ 表示 datapoint）
	* 更新方向 $F^{-1}S$ 或 $SF^{-1}$（实际求逆时有 $+\lambda I$），取决于用哪种定义；“相当于矩阵版本的 AdaGrad”
	* 领域中类似的做法还有 Shampoo、KFAC；一些实验中效果好于 Adam
* [NTK-zhihu](https://zhuanlan.zhihu.com/p/102993231): NN theory/NTK
	* $y:\Theta\to(S\to\R^d)$, $S=\{x_i\}$ training set; 
	* 需要假设 $\partial y/\partial\theta$ 近似为常数，在模型足够宽时才可能成立；（小模型时 $y$ 不是满射，即不足以完全拟合训练集；大一些时成为满射但非线性，可能相当于 double descent 的临界点；趋于无穷宽时成为线性满射）
	* kernel $K\in\R^{nd\times nd}$，注意尺寸与趋于无穷的 $\dim\Theta$ 无关
		* 使用 $\operatorname*{\mathbb{E}}_{x\sim p}$ 形式的 loss 时，$K(\cdot,\cdot)$ 为核函数（输出为 $\R^{d\times d}$ 张量）
	* 训练误差 $u=y-y^*$ 满足 $\dot u=-Ku$ 故能够趋于 0；（从而如果 $K$ 各个特征值量级差异大，则有些分量收敛慢，如 PINN 的边界项）
	> “无穷宽神经网络输出近似高斯过程”：网络初始化参数 $w(\omega)$；以两层 NN 为例，输出类似 $\sum a_i(\omega)\phi_i(x)$，求和项趋于无穷时接近高斯过程
* Google 提出新优化器 Lion-2302.06675，只用动量故内存需求小于 Adam、速度提高，适用于大模型
	* [wx:2023-02-19](https://mp.weixin.qq.com/s/QK7mBxmjkNfWyLKiNhTL2Q)
	* 程序自动设计优化算法；之前 L2O 难泛化到大模型；{_n2jj1b}
		> L2O（learning to optimize），该方法通过训练神经网络来发现优化器。然而，这些黑盒优化器通常是在有限数量的小任务上训练而成，很难泛化到大模型。
	* 采用的技术：具有热启动和重启的进化搜索、抽象执行、funnel 选择和程序简化。{_n2jj25}
		* 程序搜索优化算法过程，自动删除冗余语句；研究者进一步删除 cosh、arcsin、clip，只保留 sgn
	* 提出的新优化器： Lion（evoLved sIgn mOmeNtum）
		* 动量衰减因子 0.99，大于 Adam 0.9
	* 不像 Adam 要保存二阶矩，Lion 只需要动量、并利用符号操作计算更新，额外内存占用减半。{_n2jj3c}
		* 还考虑了 AdamW，Adafactor 等自适应算法
	* 单个 step 用时缩短，即使按 steps 计算也可提效率
		* 有人将之用于 124M 参数 GPT2，同 loss 所需 steps 减少 37%
	* 有效性解释：
		* 符号更新和正则化：
			* 保证各维度更新幅度一致靠 sgn 而非二阶矩；{_n2jj46}
				> 算法通过符号操作在所有维度上产生了具有统一幅度的更新，这在原理上不同于各种自适应优化器。
			* sgn 还起加噪声作用；{_n2jj4y}
				> 直观来看，符号操作为更新添加了噪声，作为了一种正则化形式并有助于泛化。下图 11（右）展示了一个证据。
		* 超参数更少
* `Adan-2208.06677` （仅用于链接）Adam 的 Nesterov 改进
	* "Adan: Adaptive Nesterov Momentum Algorithm for Faster Optimizing Deep Models"
		* Xie, Xingyu; Zhou, Pan; Li, Huan; Lin, Zhouchen; Yan, Shuicheng; 
		> created on 2023-11-06
	* 注：据说其直观解释为 Nesterov 外推点帮助优化器更好理解局部 landscape，帮助跳出尖锐的局部最优；{_nb6f41}
	* 注：据说原论文声称达到与 Adam 相同精度所需 epoch 数减半，其实验针对 ViT、SWin 等
	* 注：被 `MPP-2310.02994` 使用，且在其代码 config 中称其效果好于 Adam
* `D-Adaptation-2301.07733` （仅用于链接）优化器自适应学习率
	* "Learning-Rate-Free Learning by D-Adaptation"
		* Defazio, Aaron; Mishchenko, Konstantin; 
		> created on 2023-11-06
	* 注：被 `MPP-2310.02994` 使用
	* 注：PyTorch 版本安装 pip install dadaptation，其中实现了 SGD、AdaGrad、Adam、Lion、Adan 这些算法
* Dropout 用于缓解欠拟合-2303.01500，建议在训练初期开启，训练后期无需 dropout
	* [2023-03-07](https://mp.weixin.qq.com/s/0Ss1zUXED_dxlH16xttD9A)
	* dropout 在最新的 AI 模型中仍发挥作用
		> 比如 AlphaFold 蛋白质预测、DALL-E 2 图像生成等，{_n37m4t}
	* 强度下降，即 drop rate 比当年低，主要由于数据增长、过拟合少、正则化需求降低；{_n3886u}
		> 最初的 dropout 工作中使用了 0.5 的默认drop rate。
		> 然而近年来常常采用较低的drop rate，比如 0.1，
			> 相关示例可见训练 BERT 和 ViT。{_n37m4x}
		> 这一趋势的主要动力是可用训练数据的爆炸式增长，使得过拟合越来越困难。
		> 加之其他因素，我们可能很快会遇到更多欠拟合而非过拟合问题。
	* fig1 画出完整数据集的 loss landscape，并在 batch 数据集上算梯度、在图中画出
		* 观察：batch 梯度与完整数据集 loss 梯度¹不一致、有夹角，（训练初期）有 dropout 时夹角变小；{_n38883}
			* （评）¹算完整数据集梯度时应该一直没用 dropout
			* （评）后文 fig8 还表明，训练后期 dropout 使夹角变大((_n3895l))，文中分界线大致在 1k 步左右
		> 得出了一个关键的实证发现：在训练初始阶段，dropout 降低小批量的梯度方差，{_n38908}
			* （评）降低方差在后文实验 fig7 有验证((_n38959))，分界线大约 1k 步左右
		> 并允许模型在更一致的方向上更新。这些方向也更与整个数据集的梯度方向保持一致，
		> dropout 抵消了随机梯度下降（SGD）并防止训练早期采样小批量的随机性所造成的过度正则化。
	> 提出了 early dropout（即 dropout 仅在训练早期使用），来帮助欠拟合模型更好地拟合。{_n3891b}
		> 与无 dropout 和标准 dropout 相比，early dropout 降低了最终的训练损失。
	* 过拟合模型：late dropout，即 dropout 仅在训练晚期使用；{_n38914}
		> 相反，对于已经使用标准 dropout 的模型，研究者建议在早期训练 epoch 阶段移除 dropout 以降低过拟合。
		> 他们将这一方法称为 late dropout，并证明它可以提升大模型的泛化准确率。
		* fig2 示意图
	> 研究者在图像分类和下游任务上使用不同的模型来评估 early dropout 和 late dropout，结果显示二者始终比标准 dropout 和无 dropout 产生了更好的效果。
	* 最开始实验分析 dropout 影响，全程 0.1 drop rate 与不 dropout 比较
		* 梯度范数：dropout 后梯度范数变小
			* （评）不奇怪，某些参数分量在前传时置零，反传时也置零，梯度的非零分量个数变少了
		* 模型距离：dropout 后，相同迭代步数下，参数与其初始化的距离变大
			* （评）作者感觉和梯度范数变小不一致；我怀疑它是用了 Adam 优化器，其特点是只考虑梯度的方向、不考虑其模长（这点与 naive SGD 完全不同），从而模型距离大小主要取决于各步梯度夹角
		* 梯度方向方差：fig7 大约 1k 步前，dropout 模型在小批量中产生更一致的梯度方向，之后二者都在较低水平波动；{_n38959}
		* 梯度方向（与 full-batch 相比）误差：fig8 大约 1k 步前减小，之后为增大；{_n3895l}
	* 提出判断是否发生过拟合、欠拟合的标准：引入 dropout 后表现提升是过拟合，下降是欠拟合；{_n3896i}
		> 模型所处的状态不仅取决于模型架构，还取决于所使用的数据集和其他训练参数。
	* 实验
		> 为了评估 late dropout，研究者选择了更大的模型，即分别具有 59M 和 86M 参数的 ViT-B 和 Mixer-B，使用了基础的训练方法。{_n38a01}
* 介绍 DeltaTuning-2203.06904，NLP 大模型高效微调方式；{_n3pe96}
	* [2023-03-25](https://mp.weixin.qq.com/s/3LUKkovbEQssC0DgHSHILg)，AISC 群推荐
	* Nature 发表版本："Parameter-efficient Fine-tuning of Large-scale Pre-trained Language Models"
	* arXiv 版本："Delta Tuning: A Comprehensive Study of Parameter Efficient Methods for Pre-trained Language Models"
		* Ning Ding, Yujia Qin, Guang Yang, Fuchao Wei, Zonghan Yang, Yusheng Su, Shengding Hu, Yulin Chen, Chi-Min Chan, Weize Chen, Jing Yi, Weilin Zhao, Xiaozhi Wang, Zhiyuan Liu, Hai-Tao Zheng, Jianfei Chen, Yang Liu, Jie Tang, Juanzi Li, Maosong Sun
	> 团队还开发了一个开源工具包 OpenDelta，使从业者能够高效、灵活地在 PLM上实现 Delta Tuning。 
	> 参数高效微调方法冻结预训练模型99%以上的参数，仅利用少量下游任务数据微调少于1%模型规模的参数，
		> 作为模型插件实现大模型对下游任务的适配，达到媲美全参数微调的性能，并显著降了微调过程的计算和存储开销。
	* 增量微调现有方法，分三类：添加式（Addition-based）、指定式（Specification-based）和重参数化（Reparameterization-based）方法。{_n3pe9k}
	* 设计新目标函数，出发点：利用问题内在低维特性
		> 一般而言，在实践中有两种思路被证明是有用的：一，在特定的低维的子空间内寻找解向量；二，在特定的低维的函数空间内近似目标函数。
* `AlphaTuning-2210.03858` （未读，仅看到后顺手记录）NLP 大模型微调方式
	* "AlphaTuning: Quantization-Aware Parameter-Efficient Adaptation of Large-Scale Pre-Trained Language Models"
		> created on 2023-03-25
* loss问题汇总（不收敛、震荡、nan） - 知乎；{_n51f5t}
	* [2023-05-01](https://zhuanlan.zhihu.com/p/420053831)
	* 不再下降
		* 检查是否 BP 正确；确认数据无问题（标签错乱等）
		* 调学习率，从大开始每次除以 5；
		* batchsize 与学习率联合调整；{_n9kg83}
			> 5.如果学习率调好后,需要调节batchsize大小,如batchsize调大2倍,则将学习率对应调大(项目测试调大2~3倍OK),反之,学习率对应调小
			* 注：后文又提到“随着batch size增大，达到相同精度的epoch数量变多”
	* 震荡剧烈…
	* NaN…
* NN 训练 trick
	* [2023-07-12](https://www.zhihu.com/question/26934313/answer/3115650451)
	* cycle LR
		> 每隔一段时间重启学习率，这样在单位时间内能收敛到多个局部最小值，可以得到很多个模型做集成。{_n7d88o}
	* flooding
		> 当training loss大于一个阈值时，进行正常的梯度下降；
		> 当training loss低于阈值时，会反过来进行梯度上升，
		> 让training loss保持在一个阈值附近，让模型持续进行“random walk”，并期望模型能被优化到一个平坦的损失区域，这样发现test loss进行了double decent。{_n7de3l}
		> 代码：flood = (loss - b).abs() + b
	* BN（batch normalization），代码 x = (x - x.mean()) / x.std()
* OpenAI 研究科学家 Hyung Won Chung 关于 LLM 的演讲
	* [2023-10-28](https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2650893355&idx=1&sn=5911ccc05abf5177bb71a47ea5a748c8)
	* 提到 PaLM 训练过程中，最大的模型出现 loss spike
		> 现在进行规模扩展是比几年前容易多了，但整体依然很困难，并不是说改一些参数就能实现。
		> 举个例子，在 PaLM 的训练过程中，出现了损失突刺（loss spike）现象（比如损失从 2 突然变成了 6），这让很多人都感到不安。{_nask1j}
			* 图片内容：8B、62B、540B 三个模型，只有 540B 出现，且约有 20 个 loss spikes
		> 他们使用同样的数据训练了三个不同规模的模型，但只有最大的一个出现了损失突刺现象。这让研究者很难进行调试，因为无法在更小的模型上复现出来。而且这也不是由数据质量差导致的。
	* 认为最大似然适合有唯一正确答案的问题，有多种可能答案的适合用 RLHF，靠比较二回答好坏而非打分；{_nask2u}
		* 前者例子：计算；后者例子：写信，写程序完成给定功能

## NN architecture
* `PDE-G-CNN-2001.09046` CNN 层替换为含时 PDE 演化，卷积、池化、ReLU 均对应（> 或功能上可替换为）PDE 项，算子分裂后前传有显式表达式，架构保群作用等变性
	* "PDE-based Group Equivariant Convolutional Neural Networks"
		> recommended at `2022-08-03`(AISCmeet2)；笔记对应 arXiv-v6
	* 原文按群作用叙述，函数定义域为 $G/H$，从而可讨论 $G$-作用等变等性质
		* 除了 $\R^d$ 外，还考察 homogeneous space $M^d=\R^d\times S^{d-1}$（作为集合）$=SE(d)/O(d-1)$，即每点加其上的一个方向
		* sec3.2 向量场与（黎曼度量）张量场，在群作用下等变性定义
	* fig5 图像输入后先 lift 到 $M^2$ 上，在这上面演化 PDE，最后输出时再投影回原空间
		* fig3 原图放到 $M^2$ 空间后的示意图；不同物体相互遮挡情形，拉开第三维后，同一物体不再明显被切断
			* （评）单看图感觉可根据颜色区分，不过正文似乎是根据线条走向？
		* 为传统做法；如血管图像分割，该做法便于分离交叉的血管
		* lift、投影算子定义 sec4.1，lift 按已有文献，有可训练、不可训练版本；投影为对 $\theta$ 取 max 池化，也有文献用更复杂版本
	* CNN 架构对应的含时 PDE 项：convection, diffusion, dilation, erosion（CCDE）
		* （评）直观上，bump function 在 dilation 下变胖，在 erosion 下变瘦
		* 各（表达瞬时变化率的）项对应 $T$-时间演化算子：resampling（> 特征线，相当于定义域形变），线性卷积（与 heat kernel），后两者为 morphological 卷积
		* （评）相关：`INSP-Net-2210.08772`（连续域）线性卷积可用微分算子一致逼近
	* 网络架构特点：无需池化、ReLU（因已被 morphological 卷积包含），参数量远小于传统 CNN
		* sec4.2 PDE 演化分多层，每层 4 项算子分裂，分别作用 $T$-预测算子（均有解析表达式）{_n3sf6t}
			* eqn(23) 各通道分别过演化算子，最后仿射变换得下一层各通道
		* sec4.3 要求对流向量场、度量张量场 $G$-不变，故参数空间有限维；$M^2$ 为 12 维
			* 四项各 3 维（对流项为平移向量，其他项用对角形式的度量张量；非对角张量作为后续工作）
			* $d\ge 3$ 时 $M^d$ 更少，为 7；因为 $SE(d)$-不变向量场由单个基元素生成，而非 $d=2$ 三个
		* （评）我在 sec6.2,3 记录中认为它是用 PDE 非线性项给出了新的非线性形式，替换传统的池化、ReLU 非线性
	* sec5.1 convection 项演化算子由特征线给出，sec5.2 diffusion $-(-\Delta_g)^\alpha$（黎曼度量 $g$）演化算子为线性卷积，卷积核 $K_t^\alpha$
		* sec6.1 离散卷积能表达为 convection，diffusion（> 进而表达为沿特征线演化、连续卷积）
	* morphological 卷积定义 $(k\square f)(x)=\inf_yk(x-y)+f(y)$（$\R^d$，原文定义于 $G/H$）
		* fig12 $\R^1$ 上的例子
		* （评）可自己算 $k=x^\beta$，$f=\chi_{[-1,1]}$ 时，$k\square f=(\min(|x|,1)-1)^\beta$ 相较 $f$ 变尖，$-(k\square-f)=1(|x|<1),0(|x|>2),1-(|x|-1)^\beta$ 变胖
		* （评）与其他变换比较：线性卷积为乘积后取积分平均，这里是求和、取 inf 或 sup；另 Legendre 变换 $\inf_xf(x)+xy$ 新增的一项 $xy$ 与这里 $k(x-y)$ 不同
	* sec5.3 dilation，erosion $\dot W=\pm\|\nabla_gW\|_g^{2\alpha}$ 演化算子为 morphological 卷积
		* （按 $\R^d$ 改写）方程解对应 kernel $k_t^\alpha=v^\alpha t^{-\beta}|x|_g^{1+\beta}$，$\beta=1/(2\alpha-1)$（$\alpha>1/2$）
		* thm5.21 方程 (+) 对应 $k_t^\alpha\square f$，(-) 对应 $-(k_t^\alpha\square-f)$；kernel 满足 $k_t\square k_s=k_{t+s}$
		* def5.25 kernel 不好算，计算用的近似 kernel，cor5.26 近似程度
	* sec6.2,3 morphological 卷积能表达 max pooling，逐点 ReLU
		* cor6.2 紧集 $S$（> 常关于原点对称），取逐点 $S$-邻域极大 $\max_{y\in S}f(x-y)=-(k\square-f)(x)$，其中 $k$ 在 $S$ 上为 0、其余 $+\infty$
		* prop6.3 $\max(f(x),0)=-(k\square-f)(x)$，$k$ 在 $x=0$ 为 0，其他所有点为 $\sup f$
		* （评）有点神奇，ReLU 是逐点作用，morphological 卷积是综合空间不同部分信息，但它却能把逐点作用表达出来
		* （评）感觉没能论证 CNN 架构全部能表达为 PDE；只说了 dilation，erosion PDE 能表达为特殊的 morphological 卷积，max pooling、逐点 ReLU 也能，但这两类还是不同的
			* 不过功能上（网络表达能力）不排除可以替代，毕竟 dilation，erosion 为非线性 PDE，对应的 morphological 卷积当然也非线性；可认为只是引入了另一种非线性的形式
	* （评）PDE 似乎只用于 NN 架构设计，不太适用于科学问题（从数据中恢复 PDE），因为 PDE 项形式过于特殊
		* 相关：`Diff-ResNet-2105.03155` PDE 空间点对应（特征空间中的）一个数据点，不同于这里的 PDE 空间点对应图像像素
* `Diff-ResNet-2105.03155` ResNet 连续所得 ODE 视为 PDE 特征线，加扩散项（各数据点前传中交互）用于半监督；另有图上扩散
	* "Diff-ResNets for Few-shot Learning: an ODE Perspective"
		> `2022-08-18`(lectures) CSML 史作强介绍自己的工作时提到
	* 注：原文似乎角度只有 ODE 加扩散项体现交互，未像报告时提到 PDE、特征线
		* 相关：((n3sf7z))PDE 空间点对应图像像素，这里 PDE 空间点对应（特征空间中的）一个数据点
		* （评）图上数据处理更像 GDE 观点 `neuralGDE-2106.11581`，PDE 所在空间的点变为 graph 上各顶点
			* PDE 所在空间中点邻近关系基于度量，数据分布中的点连续排列，只是由于实际数据来自有限采样，计算时用的是离散的数据点
			* graph 顶点邻近关系基于边连接的拓扑结构、边上的 feature
			* graph 顶点交互所依赖的邻近关系（边连接关系）是问题本身给定的，而 PDE 点由 NN 学出的 feature 向量给出
			* graph 上默认有各顶点交互，本文算法在 graph 上和普通 GNN 差别不大（算普通的半监督设定），不像在普通单数据点前传任务上那么有新意
	* fig1 架构上只需在 ResNet 加自身后多一个 diffusion layer
	* fig2 衡量学到的特征对分类问题的有效性，标准：距离直径比（类间最小距离，同类最大直径）
	* 实验，sec5.1 合成数据二分类问题（内外两个圆，带小噪声）
		* ResNet 隐空间 2 维（便于可视化）
		* 扩散可降低噪声，本文带扩散项网络中间层特征很干净，看不出数据自带的噪声
		* 特征在无扩散情形不线性可分，且仅 12 参数，故 ResNet 失败
		* 带扩散之后则能成功，两个圆方便地被拉开
		* 相关：`2021-09-29`(dbGrpMeet) jpf学长讲的普通 ODE 分开瑞士卷的可视化
	* sec5.2 图半监督学习问题，较 GCN/GAT/GraphSAGE 聚合步骤换为对流+扩散，效果稍好
		* 论文引用网络，节点为论文，边为引用，边 feature 为稀疏的 bag-of-words 向量
		> 邻接矩阵仅用于扩散步骤。
		> 对流步骤充分利用标签（> 标签包括有标注的少量节点+边 feature？）信息，而扩散步骤在数据样本之间交换特征信息。
	* sec5.3 小样本学习，按半监督学习做，支撑集为有标注数据，查询集为无标注数据；效果好于 MAML 等
		* 有标注数据用交叉熵 loss，无标注数据用基于原型的（prototypical）loss
			* 后者：数据点（> 可能是已提取 feature 向量）与各类原型间的距离，对该点预测分类（为分布）求期望，再对所有（无论有无标注）数据求和
		* 消融实验：扩散与基于原型 loss，有一个即很接近最佳精度；表明扩散机制强大
		* 扩散权重选取：数据点用隐向量表达（> 按现有方法预训练的特征提取器？）后，用引文中方法设置
		* 每任务样本不超过 100，计算代价不高
		* t-SNE 可视化特征提取：同类点距离更近，更易分类
	* 另：`2022-08-18`(lectures) 报告提问环节，鄂维南老师提到蛋白质折叠（重要问题）可视为半监督，已知折叠方式的基因序列少
* `RKNet-1802.08831` （备用）CNN 时间推进用 Runge-Kutta，DenseNet、CliqueNet 分别对应显式、隐式格式
	* "Convolutional Neural Networks combined with Runge-Kutta Methods", ICLR2019
		> `2022-08-19`(CSImeet2) 提到
	* （评）似乎是将不同 block 对应不同时间步，而不是 ResNet 那样单个 block 内不同层对应不同时间步
	* （评）CliqueNet 可见 `[CNN发展历史]`
	* $\dot y=f(y)$ Runge-Kutta 时间推进要算对 $f(y_n)$ 的多个估计 $z_i$
		* 显式格式每个 $z_i$ 依赖于之前算出的所有 $z_j$，相当于 DenseNet 算出的各特征图 concat 到一起
		* 隐式格式每个 $z_i$ 依赖于所有 $z_j$，用牛顿迭代计算，NN 可进一步表达解算子、立刻输出结果，从而 CliqueNet 第二个 stage 可直接结束，无需迭代多个 stage
	* fig2 DenseNet 对应显式格式 ERKNet
		* 设 $y_n$ 有 $mk$ 通道，每次卷积生成 $k$ 个新通道，做 $m$ 次相当于给出了一个新 $z_i$（其实是考虑了时间步长、第 $i$ 点权重的 $hb_iz_i$）
		* 这样重复 $s$ 轮直到有 $z_1,\dots,z_s$，最后求和给出 $y_{n+1}$
		* （评）感觉完全可以取 $m=1$，否则内外层套这么多卷积，感觉功能上有重复
	* fig3 CliqueNet 对应隐式格式 IRKNet，stage 1 生成的叫 $v_i$，stage2 更新后的才叫 $hb_iz_i$
	* fig1 最后输出用了多尺度特征技巧（multi-scale feature strategy；同 CliqueNet）
* `1710.10348` 加速 ResNet 训练，开始训浅层网络，之后不断添新中间层，新层参数初始化用 ODE 视角
	* "Multi-level Residual Networks from Dynamical Systems View", ICLR2018
		> `2022-11-30`(ADmeet) 提到，似乎是很久以前组会lyp学长讲过
	* fig5 开始训的 ResNet 只有 3 block，训好后每个 block 复制成两个
		* 复制后步长减半（ODE 视角下显然）
		* 从而得 6 block；可再训再加
		* 复制包括了卷积权重、batch normalization 参数
	* 摘要：训练成本下降 40%
* `dynamicNNreview-2102.04906` 对不同数据/图像空间区域/时间序列不同时段 采用不同网络架构
	* "Dynamic Neural Networks: A Survey"
		> recommended in (AISCmeet)，未细看，备用
		* （评）[知乎解读](https://zhuanlan.zhihu.com/p/354507714)
	* fig3 动态选择合适的网络深度、输入的空间尺度；fig4 动态跳过一些 ResNet 块
	* fig5 MoE（mixture of experts）也算，软与硬的方式；{_n2pj9o}
	* fig6 动态参数生成，包括注意力（> 单任务分解为多任务 hypernet 可视为此类）
	* fig9 时间序列，跳过某输入、隐向量部分分量跳过某输入、hierarchical RNN
	> hierarchical RNN 看起来有意思，快速层 RNN 隐状态隔几步作为慢速 RNN 输入，看起来比 LSTM 更体现时间的多尺度
* `Chang2020PrincipledWI` （备用）超网络初始化方案
	* "principled weight initialization for hypernetworks", ICLR2020
		* [OpenReview](https://openreview.net/forum?id=H1lma24tPB)
		> created on 2023-08-18
* OptDNN 一阶优化算法启发，北大林宙辰团队提出具有万有逼近性质的神经网络架构的设计方法
	* [2024-04-29](https://mp.weixin.qq.com/s/7lpPSYJX1qCEyBsFCsiOvQ)
		* "Designing Universally-Approximating Deep Neural Networks: A First-Order Optimization Approach"
	> 论文首次在有限宽度¹设定下证明了具有一般跨层连接的神经网络的万有逼近性质；{_o4tn18}
		* ¹逼近误差 $\epsilon\to 0$ 时，网络宽度 $O(1)$ 为常数
	> 利用提出的框架设计了 ConvNext、ViT 的变种网络，取得了超越 baseline 的结果。
* `KAN-2404.19756`
	* "KAN: Kolmogorov-Arnold Networks"
		* Liu, Ziming; Wang, Yixuan; Vaidya, Sachin; Ruehle, Fabian; Halverson, James; Soljačić, Marin; Hou, Thomas Y.; Tegmark, Max; 
		> created on 2024-05-06
	* [中文翻译](https://mp.weixin.qq.com/s/PMoZAVNXmy5awegCSZWSdQ)
		* 与传统 MLP 区别：MLP 节点为固定激活函数、边为可学线性权重；KAN 节点为固定求和运算、边为可学激活函数；{_o5899x}
			* （评）理论上 KAN 也可等价改写为 MLP
		* Kolmogorov-Arnold 逼近定理固定 2 层，涉及的连续激活函数可能为分形等；KAN 允许加宽加深，并且只关注通常（而非极端）情形，此时连续激活函数一般足够
		* 激活函数形式 $\phi(x)=w(b(x)+spline(x))$，常取 $b=SiLU$，spline 为 B 样条 $\sum c_iB_i(x)$
			> 原则上 w 是多余的,因为它可以被吸收到 b(x) 和 spline 中。但我们仍然包含这个 w 因子,以更好地控制激活函数的整体幅度。
			> 初始化比例。每个激活函数都被初始化为 $spline\approx 0$, w 根据 Xavier 初始化方法进行初始化,这种方法已被用于初始化 MLP 中的线性层。
		* 相关逼近定理；{_o5a94p}
		* 图 2.4 用于符号回归，步骤：1. 带稀疏要求训练，2. 剪枝（裁剪多余的神经元），3. 对各边拟合的函数选取相应解析表达式，4. 进一步训练，确定各项 affine 系数，5. 得出符号表达式；{_o58a2i}
			* 1. 稀疏化要求在节点（而非边）层面进行
				> KAN中没有线性"权重"。线性权重被可学习的激活函数取代,所以我们应该定义这些激活函数的L1范数。
					* 定义为在 $N_p$ 个输入上的平均幅度
				> 我们发现L1对KAN的稀疏化效果不够,需要额外的熵正则化(详见附录C)。
			* 3. 符号表达式带 affine，形如 $cf(ax+b)+d$
		* 图 3.4 函数拟合的持续学习问题（待拟合函数的观测区间不断向右平移），MLP 出现灾难性遗忘，KAN 没有；{_o5a94x}
		* 训 PINN 比 MLP 快
		* 相比传统符号回归的优势：连续优化从而更稳健，架构透明允许用户做 surgery，可数值拟合未事先提供解析表达式的特殊函数（如 Bessel 函数）
			> 符号回归方法通常很脆弱，难以调试。它们要么最终返回成功，要么失败，而不会输出可解释的中间结果。
			> 相比之下，KANs在函数空间中进行连续搜索（使用梯度下降），因此它们的结果更加连续，因而更加稳健。{_o58a4h}
			> 此外，由于KANs的透明性，用户对KANs拥有更多的控制权，与SR相比。{_o58a4i}
				> 我们将KANs的可视化方式类比为向用户展示KANs的“大脑”，用户可以对KANs进行“手术”（调试）。这种控制水平通常对于SR是不可用的。
			> 当目标函数不是符号时，符号回归将失败，但KANs仍然可以提供一些有意义的东西。{_o58a4q}
				> 例如，特殊函数（例如贝塞尔函数）是不可能通过SR学习的，除非提前提供，但KANs仍然可以使用样条数值近似（见图4.1（ ）。
		* 符号回归相关文献
			> 有许多基于遗传算法（Eureka、GPLearn、PySR）、{_o58a20}
			> 基于神经网络的方法（EQL、OccamNet）、{_o58a21}
			> 受物理启发的方法（AI Feynman）、{_o58a12}
			> 以及基于强化学习的方法的现成符号回归方法。
			> KANs 与基于神经网络的方法最相似，但与先前的工作不同之处在于我们的激活函数在符号捕捉之前是连续学习的，而不是手动固定。
		* 局限性——效率低，来自并行计算困难；一种方案是用介于 KAN 与 MLP 之间的架构
			> (2) 效率。KAN 运行缓慢的一个主要原因是不同的激活函数无法利用批量计算（大量数据通过相同的函数）。
			> 实际上，可以在激活函数全部相同（多层感知机）和全部不同（KAN）之间进行插值，通过将激活函数分组到多个组（"多头"）来实现，组内成员共享同一个激活函数。
	* 2024-05-19 群聊讨论(('q4rk1o))
* 2406.02917 （备用）George 对 KAN 和 MLP 使用 FAIR 原则的对比，网络 PIKAN、DeepOKAN；{_o7e91c}
	* "A comprehensive and FAIR comparison between MLP and KAN representations for differential equations and operator networks"
		* Shukla, Khemraj; Toscano, Juan Diego; Wang, Zhicheng; Zou, Zongren; Karniadakis, George Em; 
		> created on 2024-06-22
	* 摘要
		> 我们发现，尽管基于B样条参数化的原始KAN缺乏准确性和效率，但基于低阶正交多项式的修改版本具有与PINN和DeepONet相当的性能，
		> 尽管它们仍然缺乏鲁棒性，因为它们可能会对不同的随机种子或更高阶正交多项式产生分歧。
		> 我们将他们相应的损失景观可视化，并使用信息瓶颈理论分析他们的学习动态。
* KAN2.0-2408.10205 （备用）增加乘法层，拟合前可加入先验知识（除公式还可有重要特征、模块结构），拟合后也可从结果中提取这三类知识
	* "KAN 2.0: Kolmogorov-Arnold Networks Meet Science"
		* Liu, Ziming; Ma, Pingchuan; Wang, Yixuan; Matusik, Wojciech; Tegmark, Max; 
		> created on 2024-08-31
	* [公众号报道](https://mp.weixin.qq.com/s/wPxsKdXk2SwljsuEZFFDiA)
		* 不强求公式表达，只发现关键特征、模块化结构也可以
			> 初代 KAN 对可解释的定义还是有点狭隘，把可解释性等价于能否用数学符号表示。
			> 实际上科学不是总能够或者需要用符号来表示。比如化学和生物的问题，有时用公式表达反而过于复杂。
			> 在这些领域中，发现关键的特征和模块化的结构可能就够了。
		* 允许结合先验知识
			> KAN 2.0 的作者们提出把先验知识用 KAN 表达出来，并且可以结合数据，在 KAN 中发现新的知识。
		* 架构调整：增加乘法层
			> 作者在第二节提出了一个改进的 KAN，即MultKAN，这是一种加入了乘法操作的 KAN。因为在科学中乘法无处不在，加入乘法可以在许多情况让训练出来的KAN网络结构更简洁。
		> 第三节为 KAN 注入三种科学知识：辅助变量（特征）、模块化结构和符号公式，这个路径是从科学到AI (Science for AI)。
		> 第四节从 KAN 中发现重要特征、模块化结构和符号公式，这个路径是从 AI 到科学 (AI for Science)。

## Intepretability
* wx_DZOIUzA ：NN结合符号模型讨论
	* [2023-02-12 修改格式](https://mp.weixin.qq.com/s/yL7vaQfTFOEsXF-DZOIUzA)
	* 推测 LeCun 的观点是：AI 不应从设计上成为符号+NN 的混合模型，但学习之后可能按混合模型运作
		> （均为作者推测）学习了符号处理的模型并不是混合模型。
		> 学习是一个发展中的问题（系统是如何产生的？），
		> 而已经发展好的系统如何运作（是用一种机制还是两种）是一个计算问题：
		> 无论以哪种合理的标准来衡量，同时利用了符号和神经网络两种机制的系统都是一个混合系统。
		> AI 更像是一种习得的混合系统（learned hybrid），而不是先天的混合系统（innate hybrid）。{_n2cf28}
		> 但习得的混合系统仍然是混合系统。）
	* 提到心理学证据，人类婴儿、其他动物还小时就表现出符号推理能力，说明生物的符号推理能力可能有先天因素，而不完全是后天习得的；{_n2cf2f}
		> 人类婴儿表现出一些拥有符号处理能力的证据。在我实验室的一组经常被引用的规则学习实验中，婴儿将抽象模式的范围泛化了，超越了他们训练中的具体例子。人类婴儿隐含逻辑推理能力的后续工作会进一步证实这一点。
		> 如果一只小羊在出生后不久就可以爬下山坡，那为什么一个新生的神经网络不能加入一点符号处理呢？
		> 当前的系统仍然无法可靠地提取符号处理（例如乘法），即使面对庞大的数据集和训练也是如此。
		> 人类婴幼儿的例子表明，在正规教育之前，人类是能够归纳复杂的自然语言和推理概念的（假定是符号性质的）。
	* DL 面临原则性挑战：组合性、系统性和语言理解问题，涉及泛化、分布偏移（distribution shift）。分布偏移 是当前 NN 致命弱点；{_n2cf4b}
	> 符号处理最大的不同在于需要固有结构的数量，以及利用现有知识的能力。
	> 符号处理希望尽可能多地利用现有知识，而深度学习则希望系统尽可能多地从零开始。{_n2cf64}
* `2207.05952` （备用）dropout 在训练中起隐式正则化作用
	* "Implicit regularization of dropout" by 许志钦
		> `2022-08-19`(lectures) CSML2022 提到
	* 摘要：带 dropout 训练可达到（NN 参数空间）更平坦的极小值，权重倾向于 condensed regime
* "Dynamical Systems and Machine Learning"
	* ResNet 数据 $x$ 前传视为 $\theta(t)$ 控制的 ODE $\dot x=f(x,\theta)$，找最优控制 $\theta(t)$；
	* p46 thm3.2 HJB 方程，状态空间为 $\{\rho\}=\mathbb{P}(\mathcal{X\times Y})$（假设数据真实分布为 $(x,y)\sim\rho(x,y)$）
* [可解释性研究的范畴by张拳石](https://zhuanlan.zhihu.com/p/382413346) （备用）
	* 图片-内容树（这里仅摘抄最浅层）：双下降根本原因，信息瓶颈现象根本原因，统一各因素建模 NN 泛化能力，彩票理论（现象）根本原因
	* 该系列似乎主要讨论“神经网络的博弈交互解释性”
* [书《神经网络的统计力学》](https://mp.weixin.qq.com/s/6Drkch9R70jAYlxXcsfsNw)（备用）
* [DL可解释性综述2001.02522]()
	* "On Interpretability of Artificial Neural Networks: A Survey"
		> 2022-09-23，来自导师转发
	* 评价近年已有的若干篇深度学习可解释性综述，不如这篇综述兼顾全面、细致性
	* 可解释性含义：高层次理解，各组分作用分别理解，对训练动态的理解
		* Simulatability: 指的是对整个模型的高层次的理解
			> 比如一个线性分类器就是完全透明、可解释的。
		* Decomposability: 指的是通过了解一个网络每个组分的作用来达到理解一个模型的作用。
			> 这正是工程中常见的模块化思想。在机器学习里面，决策树的可解释性较强，从输入到输出，节点一路走下来，每一个节点和分支都有一个特定的功能，所以理解决策树就相对比较简单。
		* Algorithmic transparency: 指的是理解网络的训练和动态行为。
	* 困难之处：人类局限性（如预测是否是伪随机数；或可用于验证量子力学是否真随机），商业阻碍（可解释性有成本，不可解释能帮助保护知识产权），数据异质化（模态等的多样性，高维），算法复杂性（参数量大，复杂非线性组件）
	*  可解释性研究好坏的评价：精准度，一致性，完整性，普遍性和实用性。
		> 精准度：精准度是指解释方法的准确性。通常，定量解释方法比定性解释方法更为可取。
		> 一致性：一致性表明解释中没有任何矛盾。对于多个相似的样本，好的解释应该产生一致的答案。
			> 此外，解释方法应符合真实模型的预测。例如，基于代理的方法是利用它们对原始模型的复制准确程度进行评估的。
		> 完整性：一个好的解释方法应该显示出在最大数量的数据实例和数据类型方面的有效性，而不是只对某些数据有效。
		> 通用性：深度学习方法库已大大丰富。我们是否可以开发一种通用解释器，该解释器可以解释尽可能多的模型以节省人工和时间？但由于模型之间的高度可变性，通用解释器在技术上非常具有挑战性。
		> 实用性：对神经网络的了解使我们获得了什么？
			> 除了获得从业者和用户的信任之外，可解释性的成果还可以是对网络设计，训练等的深刻见解。
			> 由于其黑盒性质，使用神经网络在很大程度上是一个反复试验的过程，有时会产生矛盾的直觉。可解释性的增强应当要帮助我们理清这些矛盾之处。
	* 事后可解释性，在充分学习模型之后进行。
		> 一个主要优点是，由于预测和解释是两个独立的过程而不会相互干扰，因此不需要为了追求预测性能来牺牲可解释性。
		> 但是，事后解释通常并不完全忠实于原始模型。此类别中的任何解释方法或多或少都是不准确的。
		> 我们常常不知道时哪里出现了细微差别，因此我们很难完全信任事后解释方法。
		> 七个子类：特征分析（Feature Analysis）、模型检查（Model Inspection）、显著表征（Saliency）、代理模型（Proxy）、先进数理（Advanced Math/Physics Method）、案例解释（Explaining-by-Case）、文本解释（Explaining-by-Text）。
		* 显著表征，一种办法是删除某特征看模型变化；可使用合作博弈 Shapley 值，也有借助梯度的
			> 应考虑输入的间接影响。例如，在房屋贷款决策系统中，种族不应成为决策的因素。但是……一些剩余的因素例如“邮政编码”与种族高度相关（邮编对应居住区域，黑人区，白人区泾渭分明）。
			> Shapley值的多项式时间逼近方法，该方法基本上计算了一个随机联合的期望值，而不是枚举每个联合，这样就降低了shapley value计算的复杂性。{_n2lh0f}
			> 为在一个住房数据集上训练的全连接层网络计算Shapley值，该网络包括八个属性，例如房屋年龄和房间号作为输入，房屋价格作为标签。{_n2lh0l}
			* 用该方法发现模型可能有异常：Shapley 值表明其中房屋年龄与价格正相关
		* 先进数理，如 ODE 理解 ResNet，WGAN 与最优传输联系表明生成器、判别器可闭式解相互表示、无需竞争训练，深网络表达能力强论据，ResNet shortcut 连接有集成学习行为而可只用窄网络做通用逼近；非凸问题为何好优化；泛化能力
		* 案例解释，如为解释新输入，提供一个数据集中与当前输入相似的例子，有 kNN 等做法
		* 文本解释需要任务本身同时包含 NLP
	* 事前可解释的建模，从头设计可解释性的模型。
		> 事前可解释模型可以避免事后可解释性分析中的偏见。
		> 尽管通常认为在可解释性和模型可表达性之间存在权衡，但仍然有可能找到功能强大且可解释的模型。
		> 可再分成可解释表示（Interpretable Representation）、模型修缮（Model Renovation）。
		* 可解释表示：正则化不仅可用于避免过拟合，还可从分解性[1]，[2]， [3]，单调性[4]，非负性[5]，稀疏性[6], 包括human-in-the-loop的先验[7] 方面设计正则化技术，来增强可解释的表示
			> 如 InfoGAN 最大化了潜在代码和观测值之间的相互信息，从而迫使噪声的每个维度对语义概念进行编码，这样我们就知道每个噪声维度所代表的意义。
* `2010.13871` （备用）似乎是解释给定参数的网络如何做预测，用信息论工具、统计 do 算子
	* "Examining the Causal Structures of Deep Neural Networks Using Information Theory"
	* 定义了前馈网络输入、输出层之间的有效信息（effective information，EI）
	* 涉及 intervention distribution, ID
* [综述：通过可解释AI获得遗传学见解](https://mp.weixin.qq.com/s/fpPrw3Ym33vlj7ucSo-TRQ)
	* "Obtaining genetics insights from deep learning via explainable artificial intelligence", Nature Reviews Genetics 2022
		> created at 2022-11-10
	* 基因组学研究中功能预测 AI 性能最佳，但缺失的解释信息往往比预测本身更有价值
	> 对四种解释方法进行了分类：基于模型的解释、影响的数学传播、特征之间相互作用的识别以及透明模型的先验知识的使用（fig1）
	* 作者总结了 DNN 模型解释三大挑战（略）
	* 基于模型的解释，两种主要方法：看激活值或注意力值
		> 最简单的方法是直接检查隐藏神经元的活动，以提取一组相关特征
		> 第二种方法是使用注意机制训练模型，通过一组学习的注意权重直接产生每个输入特征的相关性度量。
		* 解释第一层卷积节点：
			> 在卷积序列-活性模型中，第一层神经元（滤波器）捕获短序列模体，编码在卷积权重矩阵中。
			> 从数学上讲，将卷积权重矩阵应用于序列所执行的操作相当于使用位置权重矩阵（PWM）扫描序列（图2a）。
			* 测量 PWM 对模型的贡献：对每个 filter 置零，测量对模型预测结果的影响
		> 注意力可以被视为一种权重正则化形式，其为输入序列引入了权重，以对输入中的位置进行优先级排序，尽可能保留相关信息以进行处理。
	* 影响的数学传播，两大类：向前、向后
		> 该算法通过在模型中传播扰动数据并观察对预测的影响，直接对输入示例进行操作。
		* 从局部传播结果到全局解释：用基于传播的方法生成的逐序列属性图后，希望从中进行概括，以揭示对重要模体的全局理解；需要聚合许多输入示例的结果。
	* 特征之间相互作用的识别
		> 在基因调控的背景下，人们普遍认识到，转录因子（TF）之间的相互作用可以解释除单独附着于每个TF之外的活动。
		* 基于模型的交互识别：检查较深层神经元
			> 搜索那些最大限度地激活给定隐藏神经元的输入，效果最好。
			> 可以应用自注意机制模型来实现对神经元重要程度的量化。
		* 通过数学传播解释相互作用
			> 基于ISM的传播方法（向前和向后）可以用于解释模型内的交互。但该领域应用ISM的计算成本非常高。可以以受限的方式应用来降低其计算成本，包括（略）
	* 透明模型中先验知识的应用
		* 透明神经网络模型中，隐藏的节点被构造成在物理上对应于粒度级别上的生物单元，这有助于解释更深层的隐藏节点（图5）。
* 大语言模型的涌现能力：现象与解释 - 知乎
	* [2023-04-13](https://zhuanlan.zhihu.com/p/621438653)
	> 用Grokking解释涌现现象，尽管我把它称为”用玄学解释玄学“，但是觉得还是值得深入探索的方向，
		> 也许可以把上面的说法，优化为”用含玄量较低的玄学解释另外一个含玄量较高的玄学“。
	* 认为可导致涌现的因素（不只是模型大小）：参数量，数据量，训练充分程度，具体任务类型
	* 三类任务，知识密集型任务效果持续增长，多步骤复杂任务则出现涌现，另有少量 U 型曲线（用 CoT 后成为持续增长型）
		> 第一类任务表现出伸缩法则：这类任务一般是知识密集型任务。随着模型规模的不断增长，任务效果也持续增长，说明这类任务对大模型中知识蕴涵的数量要求较高。
		> 第二类任务表现出涌现能力：这类任务一般是由多步骤构成的复杂任务。只有当模型规模大到一定程度时，效果才会急剧增长，在模型规模小于某个临界值之前，模型基本不具备任务解决能力。
		> 第三类任务数量较少，随着模型规模增长，任务效果体现出一个U 形曲线。
			> 如上图所示，随着模型规模增长，刚开始模型效果会呈下降趋势，但当模型规模足够大时，效果反而会提升。
			> 如果对这类任务使用 思维链CoT技术，这些任务的表现就会转化成伸缩法则，效果也会随着模型规模增长而持续上升。{_n4d99h}
	* 表现出涌现的两类典型任务：in-context learning（不 fine-tune 纯靠输入即可小样本），CoT
	* 顿悟（grokking）现象，训练三阶段：记忆期、平台期、泛化期
		* 一二阶段分界为 训练集误差迅速降低，二三阶段分界为 验证集误差迅速降低
		> 后续研究表明：Grokking 本质上是在学习输入数字的一个好的表征。如图所示，可以看到由初始化向记忆期再到顿悟现象出现的过程，数字的表征逐步开始体现当前学习任务的任务结构。{_n4d98y}
	* （现有文献）涌现机理的猜想 1：任务评价指标不平滑；{_n4d99x}
		* 例子，根据 emoji 猜电影名字：若要求完全猜对，出现涌现；若改为选择题（多选），则效果持续增长
	* （现有文献）涌现机理猜想 2：由多子任务构成，各子任务持续增长，而组合结果为突然提升；{_n4d99z}
		> 展现出涌现现象的任务有一个共性，就是任务往往是由多个子任务构成的复杂任务。
		> 也就是说，最终任务过于复杂，如果仔细分析，可以看出它由多个子任务构成，
		> 这时候，子任务效果往往随着模型增大，符合 Scaling Law，而最终任务则体现为涌现现象。
		* 国际象棋任务例子
	* 作者自己试图用 Grokking 来解释涌现
* 斯坦福最新研究警告：别太迷信大模型涌现能力，那是度量选择的结果 2304.15004
	* [2023-05-03](https://mp.weixin.qq.com/s/tt9xYESUgw3V2c4XJu5ZVw)
	* 考虑 任务-度量-模型 的三元组
	* 非线性度量下有涌现，线性、连续度量下没有
	* 用度量选择在其他网络中也产生涌现能力，如 FC,CNN,Transformer 用于 MNIST、CIFAR、Omniglot；{_n53e72}
* `1912.02292` double descent，同时考虑训练 epoch 数、模型大小
	* "Deep Double Descent: Where Bigger Models and More Data Hurt"
		* Nakkiran, Preetum; Kaplun, Gal; Bansal, Yamini; Yang, Tristan; Barak, Boaz; Sutskever, Ilya; 
		* 注：最后一作是 OpenAI 的人
		> `2023-04-19`(dbGrpMeet2)
	* （评）fig2，测试集误差表现定性情况类似于 $l=f(NT)$，$N$ 网络参数量，$T$ 训练 epoch 数；{_n4kk7x}
* `invScaling-2306.09479` （仅备用）
	* "Inverse Scaling: When Bigger Isn't Better"
		* McKenzie, Ian R.; Lyzhov, Alexander; Pieler, Michael; Parrish, Alicia; Mueller, Aaron; Prabhu, Ameya; McLean, Euan; Kirtland, Aaron; Ross, Alexis; Liu, Alisa; Gritsevskiy, Andrew; Wurgaft, Daniel; Kauffman, Derik; Recchia, Gabriel; Liu, Jiacheng; Cavanagh, Joe; Weiss, Max; Huang, Sicong; Droid, The Floating; Tseng, Tom; Korbak, Tomasz; Shen, Xudong; Zhang, Yuhui; Zhou, Zhengping; Kim, Najoung; Bowman, Samuel R.; Perez, Ethan; 
		> 2023-06-21 组会群，fyv推荐
* （备用）直接压缩一切！OpenAI首席科学家Ilya Sutskever这么看无监督学习；{_n8un69}
	* [2023-08-30](https://mp.weixin.qq.com/s/DrjMOM5LhUgko6dUe6MSHA)
	> 首先，Ilya Sutskever 提出了一连串有关「学习」的广义问题：学习究竟是什么？为什么学习有用？为什么学习应该有用？计算机为什么应该具备学习能力？为什么神经网络可以学习？为什么机器学习模型可以学习到数据的规律？我们能否用数学形式来描述学习？
	> Sutskever 先从监督学习谈起。他表示，监督学习方面已经有了重要的形式化工作，这是多位研究者在多年前得到的成果；这些成果通常被称为统计学习理论。
	* 分布匹配作为无监督学习方法
		> 假设有两个数据源 X 和 Y，它们之间并无对应关系；模型的目标是找到函数 F，使得 F (X) 的分布与 Y 的分布近似 —— 这是对 F 的约束（constraint）。
		> 对于机器翻译和语音识别等许多应用场景，这个约束可能是有意义的。举个例子，如果有一个英语句子的分布，使用函数 F 后，可以得到接近法语句子分布的分布，那么就可以说我们得到了 F 的真实约束。
		> 假设你有两个数据集 X 和 Y，它们是你的硬盘上的两个文件；然后你有一个很棒的压缩算法 C。再假设你对 X 和 Y 进行联合压缩，也就是先将它们连接起来，然后将其馈送给压缩器。
		* 认为好的压缩器会利用 X 中的模式帮助压缩 Y，反之亦然
		> 两种压缩结果之间的差就是共有结构，即算法互信息（algorithmic mutual information）。
		> 对应地，可以把 Y 视为监督任务的数据，X 视为无监督任务的数据，而你对这些信息有某种形式的数学推理 —— 可以使用 X 中的模式来帮助 Y 任务。{_n8un78}
	> 他觉得另一个有趣的地方是自回归模型在线性表征方面的表现优于 BERT。但目前人们还不清楚其中的缘由。{_n8un7x}
		> 不过 Sutskever 倒是给出了自己的推测：在根据之前所有的像素预测下一个像素时，模型需要观察数据的长程结构。BERT 在处理向量时会丢弃一些像素 token，通过兼顾地考虑一点过去和一点未来，模型实际上能得到相当好的预测结果。这样一来就去除了所有困难任务，任务的难度就下降了很多。预测下一个像素中最困难的预测任务比 BERT 预测情况中最困难的预测任务难多了。{_n8un7p}
* `2309.06979` 自回归 NTP 预测范式的理论分析框架，认为该训练方式具有一般性，不限于网络架构
	* "Auto-Regressive Next-Token Predictors are Universal Learners"
		* Malach, Eran; 
		> 2023-09-15 导师在组会群推荐
	* 摘要
		> 我们证明，即使是简单的模型，如在思想链（CoT）数据上训练的线性下一个令牌预测器，也可以近似图灵机有效计算的任何函数。
		> 我们引入了一种新的复杂性度量——长度复杂性——它测量CoT序列中近似某个目标函数所需的中间标记的数量，并分析了长度复杂性和其他复杂性概念之间的相互作用。
		> 最后，我们通过实验表明，简单的下一个令牌预测器，如线性网络和浅层多层感知器（MLP），在文本生成和算术任务上表现出非平凡的性能。
		> 我们的结果表明，语言模型的强大在很大程度上可以归因于自回归的下一个令牌训练方案，而不一定归因于特定的架构选择。
* 如何可视化深度学习模型，博客总结
	* [2023-12-09](https://neptune.ai/blog/deep-learning-visualization)
	* 方法概览
		> 深度学习模型架构可视化： 神经网络的图形表示，其中节点表示层，边表示神经元之间的连接。
		> 激活热图： 深度神经网络中激活的分层可视化，可深入了解模型对哪些输入元素敏感。
		> 特征可视化： 热图可视化深度学习模型可以在其输入中检测到的特征或模式。
		> 深度特征分解： 揭示深度学习模型在训练过程中学到的高级概念的高级方法。
		> 训练动态图： 跨训练时期模型性能指标的可视化。
		> 梯度图： 深度学习模型中不同层的损失函数梯度的表示。 数据科学家经常使用这些图来检测模型训练期间的梯度爆炸或消失。
		> 损失景观： 深度学习模型输入空间中损失函数值的三维表示。
		> 可视化注意力： 变压器模型注意力的热图和类图视觉表示，可用于验证模型是否关注输入数据的正确部分。
		> 可视化嵌入： 嵌入的图形表示，是许多 NLP 和计算机视觉应用程序的基本构建块，在低维空间中揭示它们的关系和语义相似性。 
	* 模型架构可视化，PyTorch 和 Keras 的相关包
	* activation heatmap；{_ncab7z}
		> 可以仅为单个输入样本或整个集合生成激活热图。 在后一种情况下，我们通常会选择描述平均值、中值、最小或最大激活值。
		* CV 例子，输入图像后根据各激活值为神经元着色，
		> 或者，我们可以根据输入样本的像素在内层引起的激活对它们进行着色。这告诉我们输入的哪些部分到达特定层。{_ncab9d}
		* 参数多的模型有简化 activation heatmap 的方案
		* PyTorch 的相关方法，可将 CNN 深层 heatmap 与输入图片重叠显示
	* 针对 CNN 的 深度特征分解（DFF）{_ncab9u}
		> DFF 识别网络特征空间中属于同一语义概念的区域。 通过为这些区域分配不同的颜色，我们可以创建一个可视化效果，使我们能够看到模型识别的特征是否有意义。 
	* 梯度图 gradient plot，可用于检测梯度消失、爆炸等；{_ncac0h}
	* 注意力可视化，embedding 可视化
	* 不同阶段用不同可视化：{_ncn95g}
		* 1. 预训练，架构可视化
		* 2. 训练期间，training dynamics 与 gradient plot
		* 3. 训练后/推理：activation heatmap、feature 可视化；注意力、embedding 可视化
			* 推理可视化关注模型如何处理单样本，训练后可视化关注将模型作为一个整体来理解
* （备用）可解释性终极追问，什么才是第一性解释？20篇CCF-A+ICLR论文给你答案
	* [2024-08-04](https://mp.weixin.qq.com/s/MEzYIk2Ztll6fr1gyZUQXg)
	> 本文作者为张俊鹏、任启涵、张拳石，其中张俊鹏是张拳石老师的准入学博士生，任启涵是张拳石老师的博士生。
	> 本文首先简单回顾了『等效交互可解释性理论体系』（20 篇 CCF-A 及 ICLR 论文），
		> 并在此基础上，严格推导并预测出神经网络在训练过程中其概念表征及其泛化性的动力学变化，
		> 即在某种程度上，我们可以解释在训练过程中神经网络在任意时间点的泛化性及其内在根因。
	> 我们团队独立从头构建了『等效交互可解释性理论体系』，并基于此理论，从三个角度来解释神经网络的内在机理。
		> 1. 语义解释的理论基础：数学证明神经网络的决策逻辑是否可以被少量符号化逻辑所充分覆盖（充分解释）。『证明神经网络的决策逻辑是否可以被有限符号化逻辑解释清楚』这一命题是解释神经网络的根本命题。
		> 2. 寻找性能指标背后的可证明、可验证的根因：将神经网络泛化性和鲁棒性等终极性能指标的根因拆分具体少数细节逻辑。
		> 3. 统一工程性深度学习算法。
	> 三、两大研究背景（两种误会）
		> 误会 1：神经网络的第一性表征是『等效交互』，而不是神经网络的参数和结构。{_o84f7p}
			> 除去有明显缺陷的对性能有明显影响的神经网络，所有其他可以实现 SOTA 性能的具有不同结构的神经网络往往都建模了相似的等效交互表征，即不同结构的高性能神经网络在等效交互表征上往往都是殊途同归的 [3, 4]。
		> 误会 2：神经网络的泛化性问题是一个混合模型问题，而不是一个高维空间的向量。{_o84f8b}
			> 图 3：（a）传统的泛化性分析总是假设单个样本整体是高维空间的一个点。（b）实际上神经网络对单个样本的表征是 mixture model 的形式，神经网络在单个样本会建模简单交互（可泛化的交互）和复杂交互（不可泛化的交互）。
		* 注：前半句是作者的观点，后半句是作者认为的领域误区

## Generative Models
* 备用：
	* [从去噪自编码器到生成模型-ICLR2020两篇](https://zhuanlan.zhihu.com/p/94350902)
	* [隐式生成模型](https://zhuanlan.zhihu.com/p/270371363)
		* 不显式对概率密度函数或似然函数进行建模或近似，但依旧可以通过训练数据与概率密度间接交互
		* 典型代表有GSN（生成随机网络）和GAN。
	* [DiffDock-2210.01776](https://mp.weixin.qq.com/s/TxlhxwhuSN-u2OK-U8cR8A)，化学分子对接用扩散生成模型 DGM，该问题视为生成建模问题的性能好于简单视为回归问题，较传统方法提速提准确度
* [华盛顿大学2020《生成模型》课件、讲义](https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2650807916&idx=4&sn=3fe78f9e17028f8eea79ef5f3fec2e8c)
	* 自回归模型
		* NADE 框架
		* RNN/LSTM 和 Transformer
	* 变分自编码器（VAE）
		* 高斯 VAE
		* ConvNet 与 ResNet
		* 后验崩溃
		* 离散式 VAE
	* 生成对抗网络
		* f-GAN
		* Wasserstein GAN
		* Generative Sinkhorn Modeling
	* 生成流
		* 自回归流
		* 可逆网络
		* 神经常微分方程
	* 基于能量的模型
		* Stein 方法与评分匹配
		* 郎格文动力学与扩散 
* `RG-Flow-2010.00029` 基于 hierarchical flow 的生成模型，结合了重整化群与稀疏先验
	* "RG-Flow: A hierarchical and explainable flow model based on renormalization group and sparse prior"
		> created on 2022-04-09
	* （评）与传统 CNN 生成模型比较
		* 生成过程前传均有反向池化操作，从小尺寸图像生成大尺寸图像；
		* 传统 CNN 随机性全部都在隐向量，而 RG-Flow 是在中间的反向池化操作中逐步加入
			* 这点本文更像 `GenModSDE-2011.13456`，不过这类 score-based SDE 做法不涉及图像尺寸改变
		* 传统 CNN 中间层通道多且不表达 RGB，本文做法中表达 RGB、已有图像含义，并且可进一步超分辨率
		* 本文采用稀疏先验而非高斯先验
	* fig1 renormalize 阶段 RG（重整化群）$(x^{h+1},z^h)=R_h(x^h)$ 逐步缩小分辨率并分离出隐向量 $z^h$
		* 生成阶段不断添加隐向量并据此超分辨率 $x^h=G_h(x^{h+1},z^h)$，最粗的 $x^H$ 直接从隐向量生成
		* R 为可逆网络（> 正则化流常用），figA1 网络架构，双路交替做 scale/shift 调制，求逆 G 很容易（计算量相同）
			* （评）图中最右侧的 48 应该写错了，按后文是 24；输入 4×4 patch（带 3 通道），按棋盘掩码+flatten 分离为两个 24 维向量，分别通过双路
	* （评）RG 作用类似小波，都是层级重建
		* 相关工作 1802.02840 "Neural Network Renormalization Group" 确实提到小波
	* 好处：图像 inpainting 与修复，局部破坏在层次结构中影响范围有限
	* 采用各向异性稀疏先验，实现中采用 Laplace 分布
		* （旧）高斯分布球对称导致特征可能在旋转下被混合在一起（> ？）
		* 高斯分布球对称，网络“没有动力生成一个 z 而不是另一个仅差旋转的 z”sec3.6:1
			* （评）是指希望手动引入对称破缺，而非网络自己通过训练学出一个？
		* 高斯分布球对称，网络“没有动力生成一个 z 而不是另一个仅差旋转的 z”sec3.6:1
		* 稀疏分布作用：鼓励网络独立提取不同语义特征，使表示解耦；{_pc8f9u}
			> 稀疏性意味着它在每个基向量上都有一个沉重的尾部，激励网络将可观察空间中的每个语义上有意义的特征映射到潜在空间中的单个变量，这有助于解开表示。
			> 在这项工作中，我们选择了比高斯分布更稀疏的1exp（−|zl|/b）拉普拉斯分布p（zl）=2b分布，因为前者的峰度比后者大。
		* secC 简单实验，二维隐空间映到二维风车形分布，隐空间用 Laplace/Gauss 先验都能学，但用 Laplace 先验可解释性更强，隐空间象限对应风车四角
		* （评）我觉得说明可解释性应该反过来，看风车四角的原像才对
	* 可解释性（由隐向量分布稀疏性）
		* 定义隐向量各元素的感受野：p8 eqn(14) 生成结果对 z 该元素求偏导，再对输出图像的通道（颜色）取 1-norm，结果对所有可能的 z 求期望
		* fig5a 上采样生成过程（> 中间分辨率其实不是合理的图像），fig5b 各尺度分别选了一些隐变量展示感受野，粗尺度表征全局信息，细尺度刻画局部细节
		* fig6 各尺度选若干隐变量，连续变化并考察相应生成图像的变化
		* fig7 图像特征混合，粗细尺度隐向量分别来自两张图片
		* fig8 图像 inpainting，由于感受野受限只需处理待补全位置相关的隐向量，不像先前工作需要生成完整隐向量
* `PFGM-2209.11178` 启发于电动力学的生成模型，速度比基于扩散模型的快 10 倍
	* "Poisson Flow Generative Models", NeurIPS2022, 刘子鸣的工作
		* [量子位报道](https://zhuanlan.zhihu.com/p/599013984)
		> created on 2023-01-25
* PFGM++-2302.04265
	* [2023-10-05](https://mp.weixin.qq.com/s/W8Zt07e3oNkfg6xOvPQ4SQ)
		* "PFGM++: Unlocking the Potential of Physics-Inspired Generative Models"
	> 增强版的PFGM++引入了一个新参数D，让研究者们能够调整系统的维度。
		> 这可以带来显著的变化：在我们熟悉的三维空间中，电荷所产生的电场强度与电荷距离的平方成反比。
		> 然而在四维空间中，电场强度则遵循与距离的立方成反比。
		> 对于每个空间维度以及每个D值，这种关系都有所不同。
	* D 较低时模型鲁棒，D 较高时所需数据量小
		> 当D值较低时，模型更具鲁棒性，这意味着它对于估计电场时的误差更为宽容。
			> 麻省理工学院研究生、同时也是两篇论文合著者的刘子鸣表示，“模型无法完美预测电场”。“总会有一些偏差。但鲁棒性意味着即使估计误差较大，你仍能生成优质的图像。”也许，你无法得到想象中的狗，但仍能得到一些看起来像狗的东西。
		> 在另一种极端情况下，当D值较高时，神经网络的训练变得更为简单，习得图片艺术技巧所需的数据也相应减少。
			> 确切原因不容易解释，但主要益于当维度增多时，模型需要追踪的电场较少，因此需要吸收的数据也相应减少。
	> PFGM++本身已经超出了其创造者们最初的预期。他们起初并未意识到，当D被设定为无穷大时，增强版的泊松流模型就与扩散模型无二了。刘子鸣在今年早些时候进行的计算中发现了这一点。{_na5j5q}
	* 其他：GenPhys-2304.02637
		> 研究团队的另一目标是寻找更多能为新的生成模型提供基础的物理过程。通过名为GenPhys的项目，该团队已经找到了一个有希望的候选者：与弱核力有关的Yukawa势。
		> “它与泊松流和扩散模型不同，这些模型中粒子的数量总是保持恒定，”刘子鸣说。“而Yukawa势允许你去除粒子或将某个粒子一分为二。这样的模型有可能模拟细胞数量不必保持恒定的生物系统。”
		* "GenPhys: From Physical Processes to Generative Models"
* `zhP603615843` GAN 训练技巧，GitHub 11k star
	* [2023-02-07](https://zhuanlan.zhihu.com/p/603615843)
	* [GitHub repo](https://github.com/soumith/ganhacks)
	* 技巧包括：规范化输入，改损失函数，训练生成器时翻转标签，采样 z 用高斯而非均匀分布，batch 训练时不同时出现真、假样本，……
### Conditioned Generative Models
* `GeoDiff-2203.02923` 从分子图预测分子构型，使用 diffusion model，要求生成过程关于平移旋转等变 
	* "GeoDiff: a Geometric Diffusion Model for Molecular Conformation Generation", ICLR2022 oral
		* Minkai Xu, Lantao Yu, Yang Song, Chence Shi, Stefano Ermon, Jian Tang
		> `2023-02-22`(AISCmeet2)，此处未专门记录；另外 `2023-02-10`(lectures) 唐建报告的可能也是这个
	* 讨论内容摘录
		* 分子有平移旋转不变性，希望扩散模型中的去噪映射满足类似的性质：引入等变性
			* 学出某原子朝向邻近原子靠近的权重、“力”，这确实满足等变性；{_n2me7o}
		* 讲者认为的 future work：从分子构型 graph 到 3D geometry；甚至可能从想要的活性、属性出发来生成，或者从目标（靶点）蛋白出发；{_n32a7y}
			* 从目标属性出发的生成难以直接靠优化解决：优化需要目标函数，但是很难获得，并且不可导
				* 很难获得：需要专门商业软件来计算；{_n32a73}
				* 不可导：对结构的微调可能对性质有很大影响；{_n32a6u}
* `CoDi-2305.11846` 多模态（图文视音）any-to-any 生成、联合生成
	* "Any-to-Any Generation via Composable Diffusion"
		* Tang, Zineng; Yang, Ziyi; Zhu, Chenguang; Zeng, Michael; Bansal, Mohit; 
		> 2023-05-31 组会介绍
	* sec3.3:-1 文本生成使用扩散模型，在隐空间¹进行，去噪 U-Net 用 1D 卷积；{_n6198e}
		* ¹VAE 编码器有引文，解码器 GPT2；{_n61991}
* DALL-E 介绍
	* [2023-07-28](https://zhuanlan.zhihu.com/p/480947973)
	* 16 位低精度存储，梯度下溢问题的解决在 secD，其中最重要的是 每个残差块的梯度缩放；{_n7sa8t}
		> 每个残差块的梯度缩放（per-resblock gradient scaling）。
		> 传统的低精度训练通过将梯度值限制在一个模型能表示的范围内来避免梯度下溢。但是这种粗暴的限制每一个梯度的范围的方法并不适合DALL-E这种文本到图像更复杂的任务，它需要更过的精度表示。
		> DALL-E的策略是对每个残差块使用单独的梯度缩放比例，因此这里将它命名为混合精度训练。它的核心点有3个：
		> 对于每个残差块进行缩放替代传统的对损失函数进行缩放；只在有必要使用低精度浮点数来提速的地方才使用16位精度表示；除以梯度的时候避免下溢。
	* 分布式训练：单卡显存不足，靠参数分片解决，PowerSGD 压缩梯度降低带宽成本
		> DALL-E的模型即使使用16位的精度来存储，也要占用大约24G的显存，这超过了他们训练环境的单卡（NVIDIA V100 16G）的硬件显存，这里他们使用了参数分片（Parameter Sharding）[7]来解决显存不足的问题。{_n7sa9z}
		> 在进行模型的参数分片训练时，一个问题是不同机器的通信问题，它们之间的带宽是远小于同一台机器的不同显卡之间的带宽的，这成为了多机多卡训练的一个瓶颈。这里DALL-E使用了PowerSGD[8]压缩梯度来大幅降低带宽成本。{_n7sb07}
* GPT-4+物理引擎加持扩散模型，生成视频逼真、连贯、合理
	* [2023-12-09](https://mp.weixin.qq.com/s/bupEHVZetu0IUiJmmQjr6g)
	> （生成视频的例子）文本 prompt：「一件白 T 恤在微风中飘动」、「一件白 T 恤在风中飘动」、「一件白 T 恤在大风中飘动」
	* 方式：1. 文本 输入 GPT4、获得 Blender 的 Python 脚本；2. 用其生成物理引擎模拟结果后，用 ControlNet 指导扩散模型生成；{_nc9k6e}
		> GPT-4 的语义理解和代码生成能力可将用户 prompt 转化为 Blender 的 Python 脚本，该脚本可以驱动 Blender 的内置物理引擎来模拟相应的物理场景。
		> 并且，该研究还采用 ControlNet，将 Blender 模拟的动态结果作为输入，指导扩散模型逐帧生成视频。
	* 直接生成正确可用的 Blender 脚本有困难，相应的解决方案
		> 一方面，要求 GPT-4 直接在 Blender 中创建哪怕是一个简单的 3D 模型（如篮球）似乎都是一项艰巨的任务。
		> 另一方面，由于 Blender 的 Python API 资源较少且 API 版本更新较快，GPT-4 很容易误用某些功能或因版本差异而出错。
		> 为了解决这些问题，该研究提出了以下方案：
			> 使用外部 3D 模型
			> 封装 Blender 函数
			> 将用户 prompt 转化为物理特性

