> 2022-01-05 从原版 `~/nutstoreFiles/research/papers/metaLearning/metaLthm.md` 修改而来
## generalization
* `PACOH-2002.05551`: #HBM, #PAC, #generalization_bound, #real_dataset, #BNN, #GP
	* 考察至假设空间分布的分布，给出 PAC 框架泛化误差上界，导出极小化该上界的相应算法
		> 所在文件原为 (metaL)
	* "PACOH: Bayes-Optimal Meta-Learning with PAC-Guarantees"
	> TODO: comparison tree (unify?), link, (broader impact?), 
	>  读完（vaccine 实验，重看细节及画线部分），学 SVGD，
	>  GP 用于图像分类问题，网络架构？CNN 提供的 feature map 内积作为 kernel？
	>  思考该框架除 few-shot 外，是否有可能用于抗噪、domain shift；
	>  与 `allocNTaskData` 比较，任务间数据分配问题
	* 考察假设空间集合 $H$，$P,Q\in\mathbb{P}(H)$（文中用 $\mathcal{M}$ 而非 $\mathbb{P}$），$\mathcal{P,Q}\in\mathbb{P}(\mathbb{P}(H))$
		* 其他记号：角标 $i\le n$ 为任务，$j\le m_i$ 为样本，$k\le K$ 为 $\mathcal{Q}$ 采样点；$k(-,-)$ kernel 函数（与角标记号撞车）
		* 单任务数据采样 $S_i\sim D_i^{m_i}$，任务采样 $D_i\sim T$
	* > (mine) 按 `metaUnderstainding-2002.00573` 的三映射形式：
		* 推断 $(x,h)\mapsto y$；训练 $(S,P)\mapsto Q$，$h\sim Q$
		* 元训练 $(\{S_i\},\mathcal{P})\mapsto\mathcal{Q}$，$P\sim\mathcal{Q}$
	* regular train: 根据数据集 $S$ 由先验 $P$ 获得后验 $Q$（确定性），并采样 $h\sim Q$
		> 按 `unifyMethod1:` 的框架，合起来的元推断 $g_P:S\mapsto h$ 为随机输出的映射
		* thm1 之前工作给出的 PAC 泛化误差估计（由经验误差给出）
			> 下方关于 thm2 证明的笔记里我有简述如何证它
		* lem1 上述泛化误差上界对 $Q$ 取极小得其形式 $Q^*(h)=P(h)\exp(-\beta\hat L(h;S))/Z_\beta(S,P)$ (optimal Gibbs posterior)
			> 用变分推导不难；代入发现 eqn(3) 最小值恰为 $-\ln Z_\beta$，在 cor1 中用到
			* $\beta=m$ 时 $Q^*$ 为标准 Bayesian 后验
	* meta train: 根据多任务数据集 $S_1,\dots,S_n$ 由先验 $\mathcal{P}$ 获得后验 $\mathcal{Q}$（确定性），并采样 $P\sim\mathcal{Q}$
		> 合起来的元训练 $(S_j)\mapsto P$ 为随机输出的映射
		* thm2 本文给出的 PAC 泛化误差估计（由经验误差给出），cor1 代入 lem1 结果后的形式
		* thm2 证明笔记见下方
		* prop1 泛化误差上界对 $\mathcal{Q}$ 取极小，同理得最优 Gibbs 后验 $\mathcal{Q}^*(P)$ 形式
		* p4:l2 常见参数选取 
			1. $\lambda=\sqrt n,\beta=\sqrt m$，这在 $n,m\to\infty$ 时经验误差和泛化误差差别趋于 0
			2. $\lambda=n,\beta=m$，gap 不趋于 0 但 KL 项减小快，较小样本量时适用
	* 上述理论分析导出的 PACOH 算法：极小化泛化误差界 $\mathcal{Q}^*(P)$ 的实现
		* cor1 下方：理论泛化误差界中的 KL 散度项在作为算法 loss 时成为正则化项；任务数量增多时该项系数减小，符合“数据少时才需要强正则化”的理念
		> 只考虑泛化误差，没有考虑逼近误差；
		> 确定性情形的逼近误差用 $H$ 的 Rademacher 复杂度描述，这里随机情形可能考虑的是 $P$ 或 $\mathcal{P}$ 的某种复杂度；可能还要考虑被拟合的 $T$（数据分布的分布）的复杂度；下方“(I) 要求”可理解为同时限制两者复杂度
	* 预备知识：若用采样点刻画分布，用先验推断后验可通过 SVGD 计算采样点的更新
		> TODO；((n8qk7i))SVGD
	* 表达 $P$：参数化 $\Phi\to\mathbb{P}(H)$（不是直接参数化 $h$）；$Q$ 一般不在这个参数化下表达
	* 表达 $\mathcal{P,Q}$：采样 $\Phi^K\to\mathbb{P(P}(H))$
		* 学习 $\mathcal{Q}$：alg1 SVGD 更新采样点；需要 $Z_{i,k}$ 表达式
	1. GP（Gaussian process）给出的 $\Phi\to\mathbb{P}(H)$，刻画 $m_\phi(x),k_\phi(x,x')$
		* 后验 $Q$ 由 GP 在数据集 $S$ 上的边际分布给出
			> 仅针对 $\beta=m$ 情形；若不然，可能需要对 $\phi$ 求解 argmin 问题，或者像 BNN 那样用 SVGD/MCMC 算法采样
		* $\beta=m$ 时 $Z_m(S,P_\phi)=p(Y|X,\phi)$，eqn(48) 用 $Y=h(X)+\sigma n\sim\mathcal{N}(m(X),K(X,X')+\sigma^2I)$ 可直接算出（正态之和为正态，协方差可逐项计算）
	2. BNN 给出的 $\Phi\to\mathbb{P}(H)$，刻画网络 $h_\theta$ 参数 $\theta$ 的分布（独立正态的均值方差）
		* alg5 计算后验 $Q$：用采样表达 $\theta$ 分布，SVGD 更新获得后验分布 $Q$ 的采样
		* $\ln Z_\beta(S,P_\phi)$ 用采样点离散估计 eqn(9)（不是无偏估计），LogSumExp 计算技巧
		* secD.3 prop2 采样估计的 $\ln Z$ 期望大于真值（琴生不等式），故仍可作为泛化误差上界
	* 两种方法都避免了 bilevel opt 问题
		> 因为内外层的优化问题都有解析表达式？
	* 实验：包含了实际科学问题的数据集！
		* 回归问题：曲线拟合，瑞士的自由电子光源，ICU 医疗数据集，Berkeley 传感器
		* secE.1.3 SwissFEL 数据集：
			* 需要调整 12 个参数（包括若干磁场）以最大化 X-ray 脉冲能量
			* 参数到输出的对应会随时间（缓慢）变化（包括操作模式等影响因素）
			* 由于数据集使用 online 优化算法生成，故不是 iid 的；只选用了一部分数据来跑本文算法
			* 9 任务，每任务选出的训练、测试集各 200 数据
		* PhysioNet 数据集没看懂，为何预测病人是否有生命危险的任务，可以把每个病人当作一个 task？
			* 还做了 meta-validation, meta-testing
		* secE.1.5 Berkeley-Sensor 时间序列预测任务？用最近 10 个值预测后续值，考虑不同位置的温度传感器在不同时段的短时记录
		* 分类用的 Omniglot 数据集
		* 结果：能提高预测精度、预测不确定性量化的准确度、scalable 到大量任务、防止元过拟合
		* sec6.3 用于“sequential decision making”，实际的疫苗设计数据
			> 看起来不像是 meta-RL 的方法？辅助人工决策？
	* secA.1 主要定理的证明
		* lem2 (change of measure inequality)
			* [参考文档](http://proceedings.mlr.press/v51/roy16-supp.pdf) 给出较一般的形式：$\ln\mathbb{E}{f\sim\pi}\exp\phi(f)\ge\mathbb{E}_{f\sim\rho}\phi(f)-\text{KL}(\rho\|\pi)$；以下我按这一形式
			* 证明不难，对 $\ln$ 用琴生不等式
			* 本文的形式其实不太对，比如 $f,X_k\in A$ 其实不应该要求属于同一个域
		* > (mine) thm1 我的证明：
			* lem2 我的形式中 $f=h,\pi=P,\rho=Q,\phi(f)=\phi_S(h)=\beta(L(h,D)-L(h,S))$
			* 得到确定性的上界 $\Phi(S)\coloneqq\ln\mathbb{E}_{h\sim P}\exp(\phi_S(h))$，依赖于 $S$
			* 下给出（关于 $S$ 选取）$1-\delta$ 概率成立的、不再依赖于 $S$ 的上界：$\Pr(e^{\Phi(S)}\ge e^t)\le e^{-t}\mathbb{E}_Se^{\Phi(S)}=\delta$ 解出 $t$ 即得待证形式
			* 注意结果里的 $\Psi(\beta,m)$ 保留了 $P,D$，没有像 thm2 一样进一步使用对 loss 的假设拆解，因此这里的 $-\ln\delta$ 项系数为 $1/\beta$，如果拆解了则大概是 $1/\sqrt m$
		* step1：估计单任务泛化误差 $L(\mathcal{Q},D_1,\dots,D_n)-L(\mathcal{Q},S_1,\dots,S_n)$
			* lem2 取 $f=(P,h_1,\dots,h_n)$, $\pi,\rho$ joint two-level distributions
			* $\pi(f)=\pi(P)\prod\pi(h_i|P)=\mathcal{P}(P)\prod P(h_i)$
			* $\rho(f)=\rho(P)\prod\rho(h_i|P)=\mathcal{Q}(P)\prod Q_i(h_i)$，其中 $Q_i=Q(P,S_i)$
			* 注意这里假设 $S_i$ 取定，从而 $P\mapsto Q_i$ 为确定性映射；求 $Q_i$ 一律只能用 $S_i$，不能直接用 $D_i$
			* $\phi(f)=\lambda\sum_iL(h_i,D_i)-L(h_i,S_i)$（无视 $P$ 分量）
			* eqn(13-15) $\text{KL}(\rho\|\pi)$ 的计算
			* eqn(16) 用 lem2 后所得界，需要后续估计的项记为 $\Upsilon^1(\gamma;\{S_i\})$
		* step2：估计任务间泛化误差 $L(\mathcal{Q},T)-L(\mathcal{Q},D_1,\dots,D_n)$
			* lem2 各项选取见原文（其中 $\phi(f)$ 从 $\Upsilon^2(\lambda,\{S_i\})$ 形式可见）
		* step3：给出与 $S_1,\dots,S_n$ 无关的界，此时需要在概率 $1-\delta$ 下成立
			* 注意原来的界依赖于 $S_i$ 隐含了对 $D_i$ 选取的依赖
			* 感觉文中的证明有问题（或者没写清楚），以下我给自己的版本（虽然还是有过不去的地方）
			* 要估计的对象其实是 eqn(19) 的 $\sqrt n$ 次方，为 $e^{\sqrt n\Upsilon}=(\mathbb{E}[-])^{\sqrt n/\lambda}(\mathbb{E}[-])^{\sqrt n/\gamma}$
			* 之后要取 $\mathbb{E}_{D_i\sim T}\mathbb{E}_{S_i\sim D_i^{m_i}}$ 估计，(!) 不知为何似乎认为 eqn(19) 的两项乘积可以分别取期望，尽管并不独立
			> 应该可以改成两项分别 PAC 给出估计，最终结果是一个 $1-2\delta$ 概率成立的东西，并且上界会变大一点
			* 需要假设 $\lambda,\gamma\ge\sqrt n$，对 $x^{\sqrt n/\lambda,\gamma}$ 用琴生不等式，把 $\mathbb{E}_{D_i,S_i}$ 放到 eqn(19) 的 $\prod$ 符号后得 eqn(21,27)（分母要改为 $\sqrt n$）
			> eqn(19) 若不将独立变量拆成 $\prod$，用 Hoeffding 不等式/sub-gamma 假设给出的界要大一些
			* 对 $e^{\sqrt n\Upsilon}$ 用 Markov 不等式得 eqn(24,29)
			* 上述 $\sqrt n$ 其实都可以改成 $r$，只要 $r\le\lambda,\gamma$ 仍成立
				> 由于主要矛盾还是在 $\lambda=\sqrt n<\gamma=n\sqrt m$，$\ln\delta$ 前的系数还是原文的 $1/\sqrt n$，从而 $\delta$ 较小时{大任务小数据}成立
			* eqn(22,28) 无视，也不知道它在说什么
		* step3-a loss 有界情形：
			* Hoeffding's lemma 叙述、证明见 Wikipedia
		* step3-b loss 为 sub-gamma 随机变量情形
			* sub-gamma 定义可自行查额外资料，控制特征函数增长速度
			* {(I) 要求}对任意 $h,D$，$l(h,z)$ 在 $z\sim D$ 下为 sub-gamma 随机变量
			> 确定性框架的 PAC 是限制 $h$ 的 Rademacher 复杂度；这里的假设在限制 $D$ 奇异性的同时其实也限制了 $h$ 的某种复杂度
			* 注意对 $h$ 一致成立不能改成期望意义（等价于考察在 $(P,h,z)$ 可变意义下的随机变量）下成立，因为 $\mathbb{E}_{P,h}$ 在 eqn(19) 中不能放到 $\prod$ 之后
			* 同理不能改成对 $D\sim T$ 期望意义下成立
			* (II) 要求对任意 $P,m$，$L(Q(P,S),D)$ 在 $D\sim T,S\sim D^m$ 下为 sub-gamma 随机变量
			* eqn(27) 我认为用调和平均 $\tilde m$ 不对（利用 $r(t)=t/(1-ct)$ 在 $t<1/c$ 的凸性，代入 $t=1/m_i$ 发现调和平均给出的是下界而非上界）
	* > (mine) 在 `unifyMethod2:` 框架下描述该方法
		* 框架下各方法区别在于三个元素的选取
			* 本文理论部分证明，（随机框架下）无论三个元素取什么形式，泛化性能都不超过多少
			* 本文方法部分构造特定的三元素选取方式（下面描述的），说明这个上界可以达到（构造性证明）
		* $g(D^s)$ 形式：推导时为 argmin，学 loss 的正则化项
			* 采用随机化输出时，loss 自然成为 $\mathbb{E}_{h\sim Q}L(h,D^s)$ 形式
			* 待学正则化项由 $P$ 参数化（这在随机化输出的设定下才可行）
			* loss 基本形式来自理论推导的 PAC 泛化误差界，不像其他方法 empirical 选取
		* $g(D^s)$ 在该 loss 下有显式表达式 lem1，计算时直接使用，此时形式类似 hypernet
			* GP lazy learning（针对 $\beta=m$；否则还是要求解优化 $\phi$/采样 $h$ 问题）
			* BNN 对有显式表达式的概率分布进行 SVGD 采样，采样算法本身有点像在 GD 解优化问题
			* 元训练时它提供的 loss 也可直接写出，不需要显式求出 $g(D^s)$
				> 不过如果修改为使用 query set 的版本则可能需要？
		* 外层学 $g^*$：形式写为 argmin（我的元学习框架里是默认的），……
			* 还是随机框架 $\mathbb{E}_{g_P\sim\mathcal{Q}}$
			* 除掉随机框架，ERM 部分对应 loss $\sum L(g(D^s_j),D^s_j)$；注意这里没有使用 $D^q$！
			* ERM 之外还有正则化项（防止元过拟合；多数元学习方法里没有，最多 empirical 随便选一个）
			* 外层的正则化项 $\mathcal{P}$ 没法学（除非元元学习 `metaMetaL:`），倒是可以元验证选取
		* 学 $g^*$ 在该 loss 下还是有显式表达 lem2，计算时还是直接用，与框架里不同
	* > (mine) 不使用 query set 的解读：……
		* 可能用 val 后也能给出相应 thm2 版本？待推导；此时算法需要修改，不再用 $\ln Z$ 代替 loss？
		* 平时用 query set 也只防数据过拟合不防元过拟合；这里 PAC 框架用先验保证双层的泛化性能？thm2 假设数据、任务分布性质良好，在 $n,m$ 较大情形才给出泛化上界
		* 算法如果会有能力不足（待考察），可能是缺少 query set 带来的，也可能是 $g(D^s)$ 本身表达能力不足 `metaModelUniv:`（这样有 query set 也没用）
	* > (mine) {用于小样本之外的可能性}：
		> 日后可能开独立模块
		* 小样本数据集 $S$ 换成被污染分布 $D'\sim c(D)$；$c$ 为“随机退化至 $m$ 点分布”则回到小样本
			* 有限数据集情形 $S\sim D'$ 按文章已有框架即可给出界，故这里不讨论
		* 以下假设污染后仍可通过极小化 $D'$ 上 loss 学习 `notERMsupportSet:`
			* 并且考虑 $c(D)$ 分布不退化为单点（确定的 $D'$）；尽管退化时仍有可能可通过利用合适的先验 $P$、极小化 loss 来学，例如 $D'$ 由人为将 $y$ 放大若干倍得到
		* thm1 可导出同理表达式，以及 thm2 的 $\Upsilon(\{D'_i\})$
		* 若要像 thm2 那样给出不显式涉及 $P$ 等要素的界，需要假设 $\mathbb{E}_{D'\sim c(D)}L(h,D')=L(h,D)+C$
			* 小样本、样本比例不均等设定下 $C=0$
			* label noise 有 $C>0$；相当于若 HBM $z\sim D'\sim c(D)$ 等价分布 $z\sim\bar D$，则 $L(h,\bar D)=L(h,D)+C$
			* 原文推导中将 $L(h,S)$ 换成 $L(h,D')-C$ 即可
	* > (mine) 任务量、数据量分配，以及不同难度任务区别对待的问题
		* TODO：和 `allocNTaskData-2103.08463` 进行更细致的比较
		* 上方“大任务小数据”，已给出的误差界能体现
		* 上方“(I) 要求”忽略了任务之间难度的差异
			* 设 $D$ 无噪声 i.e. $z=(x,\bar h(x))\sim D$，$x\sim D_x$
			* 则 $D_x$ 方差大、$\bar h$ 振幅大时任务难度大，体现在 $l(h,z)$ 关于 $z\sim D$ 下作为 sub-gamma 随机变量有较大的 $c_I,s_I^2$
			* 而命题的假设和推导直接按所有任务有一致的 sub-gamma 参数来处理
		* 另外 $L(\mathcal{Q},S)$ 的大小可能也涉及任务难度（待确认），而本文只考虑泛化不考虑逼近误差
	* 其他考察假设空间分布的分布的相关工作
		* ref 里 "Meta-Learning by Adjusting Priors Based on Extended PAC-Bayes Theory"
		* citation 里有工作把任意的先验分布换成了依赖于数据先验分布的版本，并分析了采样和计算的复杂度
			* "Statistical generalization performance guarantee for meta-learning with data dependent prior" 
	* ……
	* > (?) eqn(7) $K$ 用于表达先验 $\mathcal{P}$，防止所有 $\phi_k$ 塌缩到同一点？不过 GP 和 BNN 做法的先验都取的 $\mathcal{P}=N(0,\sigma_P^2I)$；
		* p7:l1 squared exp kernel? 
		* secC.1 $k(-,-)$ 给出的 RKHS 中的 GD？
		* 注意记号撞车，kernel $k(-,-)$ 和角标 $k$
* `SQmetaLbound`: #PAC, #generalization_bound, #tr-val, #beta_uniform_stability, (#open_source)
	* 考察确定性算法，证明在支撑/查询集训练下泛化误差与任务内数据量无关，并用留一法近似查询集
		* 只考察了有界 loss；与数据量无关做法适用于小样本
	* "A Closer Look at the Training Strategy for Modern Meta-Learning", NIPS 2020
	* table2 记号：三映射 $h:x\mapsto y$，$A:S\mapsto h$，$\mathbf{A:S}\mapsto A$
		* 单样本 loss $l(h,z)$
		* 元测试单任务经验误差 $L(A(S),S)$
		* 元训练经验误差 $R(\mathbf{A(S),S})=\oplus_{S\in\mathbf{S}}L(\mathbf{A(S)}(S),S)$，
		* 元训练S/Q经验误差 $R_{s/q}(\mathbf{A(S),S})=\oplus_{S\in\mathbf{S}}L(\mathbf{A(S)}(S^s),S^q)$，其中 $S=(S^s,S^q)$
		* 元训练泛化误差 $R(\mathbf{A(S)},\tau)$，
		* 留一法下单任务经验误差 $L_{loo}(A(S),S)=\oplus_{z\in S}l(A(S\setminus z),z)$
		* 留一法元训练经验误差 $R_{loo}(\mathbf{A(S),S})$ 同理定义
	* def1 之前文献提出的：学习算法 $\tilde\beta$-一致稳定性，训练集 $S$ 去掉一个元素 $S^{/j}$，输出模型 $A(S)$ 会变，但在任意 $z\sim D$ 上 $l(h,z)$ 改变不超过 $\tilde\beta$
		* 似乎有时认为 $\tilde\beta=O(1/\sqrt m)$，其中 $m$ 为数据量；sec5:-1 依赖于学习算法选取
		* def2 元学习算法的版本（无查询集），元训练集去掉一元素 $\mathbf{S}^{/i}$，$\forall D\sim\tau$，$S\sim D^m$ 有 $L(\mathbf{A(S)}(S),S)$ 改变不超过 $\beta$
			> 无查询集相当于只考虑对任务的 uniform stability，不考虑对任务内数据的 uniform stability
		* 可认为是 $\beta=O(1/\sqrt n)$，$n$ 任务量
		* def3 S/Q 策略的版本，$\forall S^s,S^q$
		* def3' S/Q 训练、$\mathbf{A}$ 随机化的版本，只需 $\mathbb{E}_{\mathbf{A}}$ 下不超过 $\beta$
			* sec4.2 常见算法常使用 episodic training，元训练任务排序随机，从而 $\mathbf{A}$ 随机化
			* thm3 对 episodic 元学习算法，一些条件下有 $\beta=O(1/\sqrt n)$
		* def4 LOO 训练的版本
	* thm1 元训练泛化误差 由 元训练经验误差 给出 PAC 上界
		* def3 后的解读：outer-task gap + inner-task gap
		* thm2 元训练泛化误差 由 元训练S/Q经验误差 给出 PAC 上界
		* 仅 outer-task gap；不再涉及普通训练的一致稳定性 $\tilde\beta$
		> 结论能体现{大任务小数据}；
		> 不过小数据带来的问题其实还在，只是都已经在 S/Q经验误差里体现了，如果任务分布本身不适合小数据，则这个误差还是较大；
		> 可能最终还是要刻画什么样的任务分布适合大任务小数据，这篇文章告诉我们直接用 S/Q经验误差 分析就可以了
		* thm4 (main result) $\mathbb{E}_{\mathbf{A}}$ 下，元训练泛化误差 由 元训练S/Q经验误差 给出 PAC 上界
		* eqn(6) 元训练泛化误差 由 元训练LOO经验误差 给出 PAC 上界，此时涉及 $\tilde\beta$
			* sec5.1:2 也是 outer-task gap + inner-task gap
	* 作者提出 LOO（leave-one-out，留一法）训练策略替代 S/Q
		* sec5.0:1 认为传统的 empirical multi-task error 不能用来训练现在的元学习算法（> 不理解？）
		* sec5.1:2 LOO 训练策略与 S/Q 不同，此时支持集是见过的（> 不理解？）
	* table1 纯支撑集、LOO、S/Q 训练策略的比较
		* 经验误差对于泛化误差的估计：纯支撑集为有偏估计，S/Q 无偏，LOO 几乎无偏
	* > (mine) 与 PACOH 这一随机化模型的误差控制形式比较
		* 无论对任务的泛化误差还是对数据的泛化误差
			* PACOH 用先验分布控制（为结论）
			* 这里则用 uniform stability 的假设控制（为假设，由于考虑的是一般的确定性学习算法，只能靠假设来限制）
			* 误差界形式上都与任务/数据的个数有关
		* 这里对数据层面引入支撑、查询集后，可以得到与数据量无关的泛化误差界
			* 任务层面仍无法引入（除非做 meta-validation 或 meta-meta-learning
			* PACOH 没有引入这种划分，故没能导出这种数据量无关的界
* `taskID-OoD-2102.11503`: #OoD, (#open_source)
	* 常见小样本 baseline 其实许多是 OoD 元测试，分布内（ID）与 OoD 目标有冲突
	* "Two Sides of Meta-Learning Evaluation: In vs. Out of Distribution"
	> TODO: read, summary, comparison tree, link, (broader impact?)
	* OoD 理由：分类任务，所有可能类的集合划分为两部分，从第一部分随机采样 $n$ 个生成一个元训练的任务，从第二部分随机采样生成元测试的任务；{_n7db5l}
		* 两个部分不同，从而元训练任务、元测试任务来自的分布不同，为 OoD
	* fig1 常见元学习方法实验结果，ID 表现和 OoD 表现之间有冲突
		* SB 方法为 `pretrain-1904.04232`(metaL)，和 MB 都不是元学习方法（剩下的都是）
		> 看 MB 原文似乎是大样本预训练，小样本 fine-tune，但区分了 S/Q 数据进一步训练（SB 没有区分），可能还算是有元学习的成分；
		> MB 原文说法是所有模块之前工作都有，只是这篇文章组合起来看待了
		* p6:0 两个非元学习方法在 OoD 表现最好，尽管 ID 不如元学习
		> (?) 为什么它们的 OoD 表现还好于 ID？不应该一样吗？
	* sec4:-1 降低学习率，或者元训练用的类别不重新采样支撑集（任务通过采样类别得到，故任务也不重采样支撑集），可牺牲 ID 表现提升 OoD；{_n7db54}
		> 防止过拟合到 ID 分布的做法？
		> 不重新采样可能导致类别内的过拟合，通过促进类内过拟合（或任务内对数据的过拟合）来减少任务间的过拟合？
	* 为领域后续研究提供实验比较各方法的建议，区分 ID 和 OoD 等
* OoD 相关：有文章认为 以ProtoNets为代表的非参数元学习器比基于优化的元学习器（如MAML和ANIL）的泛化能力更好。
	* [link](https://www.semanticscholar.org/paper/Studying-and-Improving-Extrapolation-and-of-and/1095343b5869c3968bff4c1a10a920d4e94c3a19)

## approximation
* `MAMLapprox-1710.11622`: #MAML, #universality, #RKHS, #UAP
	* 对深层 ReLU 网络证明 MAML 算法的 universal approximation 性质
	* "Meta-Learning and Universality: Deep Representations and Gradient Descent can Approximate any Learning Algorithm"
	> TODO: summary, comparison tree, link, (broader impact?)
	* 常见做法两种：RNN 输入数据集（可以以梯度的方式输入），或者 MAML 类做法
	* p3:-3 定义 universal learning procedure approximator，输入为训练集 $D_T$ 和测试样本 $x^*$
	* 证明 MAML 类（单步梯度下降）表达能力不逊于 RNN：
	1. sec4 先证对单样本情形是 universal function approximator
		* sec4:2 这里 loss 一般情形不对，但是交叉熵和 L2 error 都可以
		* 多个线性层的复合：单个线性层在单样本单步梯度下降时，系数矩阵更新为 rank-1，若写为 $N$ 线性层复合则更新可以是 rank-$N$
			> 真正线性情形（不用 ReLU），多线性层复合和单线性层的 approximation 性质一样，但是 optimization 性质不同；这里单步更新无法避开 optimization 性质，故仍采用多线性层复合形式
			* 实际上使用 ReLU 激活函数，此时许多中间层的表现和线性层一致
		> 注意 $\prod W_i=W_1W_2\cdots$，不是 $W_NW_{N-1}\cdots$；深层指标小
		* outline: 选取特定的 $W_i$ 等参数的形式，算法表达的函数写为 eqn(6) 形式
			* lem4.1 要拟合的 $f(x,y,x^*)$ 可表达为这样的形式
				* $k_i$ 可以从 RKHS 的角度解读，不过本文不讨论
			* lemA.1 上一引理中的 $k_i$ 可通过适当参数选取逼近
				> 看起来是网格点处逼近待拟合函数？
	2. sec5 其次证明对排序不变的多样本情形也对
		* secC:-2 要求不能有重合的 $x_k$
	* > (mine) 我重新整理的单样本情形构造：
		* 希望逼近通用的 $f(x,y,x^*)$，设有区域分解映射 $d:X\to\{0,1\}^n$；为简便假设 $y$ 单分量
			* 一般情形我觉得可并联 $m$ 个网络；文中做法好像是把第二分量大小换成 $n^2m$
		* 总体网络构架：特征提取器，线性层，拟合层；内部三分量，大小 $2n+n^2+1$
			* 部分分量（$\theta_b,\bar z$）承担“更新指示器”功能，说明 fine-tune 是否已进行；这将使数据走不同通路
			* 特征提取器，主要是 $d$ 在起作用（分量 1），分量 2 无用，分量 3 仅用于 BP 更新特征提取器 $\theta_b$
			* 线性层，更新后的参数能充分体现 $(x,y)$ 的信息
			* 拟合层，依据更新指示器 $\bar z$（我觉得依据最后的一维分量 $\check z$ 也行）eqn(4)
				* $f\approx\mathbf{1}(\bar z=0)g(\bar z,\check z)+\mathbf{1}(\bar z\ne 0)h(\bar z)$
				* 若未更新，数据走 $g$
				* 若已更新，数据走 $h$，$h$ 构造利用 UAP 性质，（更新后）该层的输入将能体现 $(x,y,x^*)$ 的充足信息
		* 训练的 FP 与 BP：输入 $x$
			> 注意这里的计算顺序是完全前传后再从后往前算梯度，而这里梯度是从前往后写的
			* 特征提取参数 $(\theta_f,\theta_b=0)$，梯度 $(0,e_y)$
			* 特征提取器输出 $[\tilde\phi;0;\theta_b=0]$，梯度 $[0;0;e_y]$
			* 线性层参数为系数 $\mathrm{diag}(\tilde W_i,\bar W_i,\check w_i=1)$，梯度 $\begin{bmatrix} 0&0&0\\*&0&0\\*&0&0 \end{bmatrix}$，其中 $*$ 项存储了关于 $x,y$ 的充足信息
			* 线性层输出 $[\tilde z,\bar z=0,\check z=0]$，梯度 $[0;e_y\mathbf{1};e_y]$
				* $\tilde z$ 实际上从来没有用过
			* 拟合层走 $g$ 通路，线性层参数 $[0;\mathbf{1};1]$，梯度不重要（反正更新后不会走 $g$）
				* 选择数据通路的模块也可以适当设计使梯度为 0 而不更新（用 ReLU 容易构造）
			* 拟合层输出 $f=0$，梯度 $e_y\coloneqq\partial l(y,f=0)/\partial f$
				* 这即 $e_y$ 定义，它需要反应完整的 $y$ 信息
				* 例如对 L2 loss，$e_y=y$；交叉熵也能反应完整的信息，但 L1 不行
		* 按学习率 $\alpha$ 更新参数，测试时输入 $x^*$：
			* 特征提取器参数 $(\theta_f,\theta_b=-\alpha)$，输出 $[\tilde\phi^*;0;\theta_b]$
			* 线性层参数，对角元不变，多了两个非对角元，只用到第一个；输出 $[\tilde z^*,\bar z^*,\check z^*]$
			* 拟合层走 $h$，输出 $h(\bar z^*)$
		* 利用 NN 的一般 UAP 性质构造 $h$，使 $h(\bar z^*)=f(x,y,x^*)$
			* 只需 $\bar z^*\in\R^{n^2}$ 能反应完整的 $(x,y,x^*)$ 信息
			* 事实上 $\bar z^*$ 只有一个分量非零（严格地说，其他分量几乎为 1），该分量位置体现 $d(x),d(x^*)$ 取值（从而提供 $(x,x^*)$ 的信息），分量大小 $e_y$ 体现 $y$ 信息
		* 构造系数以获得上面描述的 $\bar z^*$：
			* 考察线性层梯度形式，该层输出形如 eqn(1)
			* 分解为三分量，有 $\bar z^*=-\alpha\sum_iA_iA_i^\mathrm{T}\mathbf{1}e_y \phi(x)^\mathrm{T}B_i^\mathrm{T}B_i\phi^*(x^*)$
				> 这里记号 $\phi$ 对应 eqn(3) $\tilde\phi$，$A_iA_i^\mathrm{T}$ 对应 $A_i$
				* 矩阵大小根据前文分量大小确定，$A_i:n^2\times n^2$，$B_i:2n\times 2n$
			* 层数 $n^2+2$，角标除了第一个、最后一个之外分解为 $i=(j,l)$
				* 第一个、最后一个分别对 $A_1,B_I$ 有限制，选取 $B_1,A_I=\epsilon I$ 可无视这两项
				* 最终只有满足 $d(x)=j,d(x^*)=l$ 的那一项非零
			* 构造 $A_i=\mathrm{diag(vec}(E_{jl}))+\epsilon I$，其非零元素位置标记了 $(j,l)$ 位置
			* $\phi$ 利用更新指示器选择通路，更新前输出 $\phi=[d(x);0]$，更新后 $\phi^*=[0;d(x^*)]$
			* $B_i=[E_{jj},E_{jl};E_{lj},0]+\epsilon I$
			* 可根据 $A_i,B_i$ 解出相应的 $\tilde W_i,\bar W_i$（eqn(11) 前后）
				* 这里要求了 $A_i,B_i$ 可逆才能解出，故前面出现了 $\epsilon I$ 项
		* 多样本情形基本一致，只是线性层、$\bar z^*$ 成为对样本 $k$ 的平均
			* 此时无法区分重合的两个 $x_k$，故可能要求 $d(x_k)$ 两两不同
			* $\bar z^*$ 有 $K$ 个非零分量，每个的分量域位置表示 $(x_k,x^*)$ 位置，数值大小体现 $y_k$
		* （以下为讨论）单步更新影响的参数有：$\theta_b$、$W_i$ 的 off-diag 块，初值均为 0
			* 事实上还影响了 $g$ 参数，但反正测试阶段用不到
			* 拟合的固定性质的映射 $\phi,h$ 都未进行更新
		* 关于为何单步更新的 UAP 性质{强于双边优化}：
			* 单步 GD 操作空间大，可过度更新，更新后模型在训练集上的 loss 可以大于更新前的，而 argmin 形式显然不能这样
			* 尽管这里有 $\alpha$ 小的假定，eqn(1) 忽略了 $O(\alpha^2)$ 项
			* 但是这里利用了“更新指示器”，其中体现了 $\alpha$ 相对过大，给出过度更新
			* 例如特征提取器涉及用 $\theta_b=0,-\alpha$ 的取值决定通路；通路开关构造可以利用 ReLU，在 $\theta_b>-\alpha/3$ 时取 1，$\theta_b<-2\alpha/3$ 时取 0，中间线性过渡
			* 这样的构造下，第一次 BP 时特征提取器和通路开关的梯度都是 0
			* 但是更新后通路开关输出明显改变；如果使用连续时间动力学，中间肯定会出现一段梯度非零，这里的过度更新直接大步跳过了这一段
			* eqn(12) 拟合层同理
		* 一个小细节：$y=0$ 时它等于 $f(x)$，没有梯度不更新！
			* 由于只要求在有界集合内 UAP，我觉得不妨要求 $y>1$ 从而规避这种情形，一般情形平移函数输出即可达到
	* 关于 ReLU 网络替代线性层：只需 activation 全正即可
		* secD 认为只需系数矩阵正定就能保证，但我觉得不对，应该要求所有元素为正才行
		* 不过我觉得可以修正，由于只需要在有界区域拟合 $f(x,y,x^*)$，$y$ 取值有界，可以通过引入 bias 使 activation 全正，且网络与原来等价
	* > (mine) 对 $f_\theta(x;z)$ 形式 ansatz（未必 NN），只更新 $z$，可以写得更简单
		* 要点：更新指示器 $\theta_b$，将 $(x,y)$ 信息存储在更新后的参数 $w$ 中；二者组成 $z$
		* $f=\mathbf{1}(\theta_b=0)(w^\mathrm{T}d(x)+\theta_b)+\mathbf{1}(\theta_b\ne 0)h(w,d(x))$
		* 更新后 $w$ 有唯一非零分量，分量角标表示 $x$ 位置，分量大小刻画 $y$ 大小；从而 $h$ 的输入包含了 $(x,y,x^*)$ 的完整信息
		* 应该也可以设计成允许所有参数更新的形式，例如对于 NN 可以拆分出两个 $d$ 网络，其中一个的参数会被更新但在 $x^*$ 上预测时用不上
		* 同样会遇到 $y=f(x)$ 时梯度零无更新的问题，仍通过限制 $y>1$ 解决
	* `2004.05439`(metaL) 里引用本文并称基于模型的元学习在 OoD 任务上表现不如基于优化的元学习，且在大样本设定下渐近行为也不如
	> 其他元学习算法的 universal approximation 性质：hypernet 的由 DeepSets 保证，学 loss 的和双边优化之类的目前还没有看到
	* > (mine) TODO:
		* `metaModelUniv:`(metaL) 是否说明双边优化无法达到一致逼近？与这里设定是否有区别？
		* $f(x,y,x^*)=y+1$ 这个特殊的例子，是如何用本文的网络逼近的？
		* 若考虑抽象的 $\theta\mapsto f$（未必 NN 参数化），能否给出解读为何可一致逼近？
			* 也许本文思路是先构造出一个这样的映射（可能是精确等于而非相等），再设计 NN 逼近这样的映射（且所有参数都要更新，而非 AD 那样只对一部分作为自变量的参数更新）
		* 理解本文 NN 架构下的构造格式
* `2002.10006` （备用）超网络架构逼近能力理论分析，生成隐层参数（hypernet）效率高于生成另一网络输入
	* "On the Modularity of Hypernetworks", NIPS2020
		* Galanti, Tomer; Wolf, Lior; 
		> created on 2023-04-13；被 `HyperDeepONet` 引用
	* 考虑学一个映射 $I\mapsto(h_I:X\to\R)$，$h_I$ 可用两种 NN 架构：基于嵌入的 $q(x,e(I))$，hypernet $g(x;\theta=f(I))$
	* 摘要结论：若 $e,f$ 可充分大，则 $g$ 可比 $q$ 小若干数量级
		* 文中称为 modularity of hypernet
	* 摘要：若 $h_I$ 有结构，则 $f$ 参数个数比标准 NN、$e$ 的要小几个数量级（> ？）

## Optimization
* `2106.09017` ANIL 与 MTL 等价性，从而可按 MTL 规避高阶导、降低训练代价
	* "Bridging Multi-Task Learning and Meta-Learning:Towards Efficient Training and Effective Adaptation", ICML2021
		> created on 2022-03-08
	* NN 架构，除最后一层外参数与任务无关，MTL 每任务独自有一个最后一层参数，ANIL 最后一层参数学用于微调的初值
		* sec3.4 元推断阶段，为公平比较，MTL 与 ANIL 的最后一层都随机选取初始参数，用梯度下降微调
		> 这不是原版 ANIL 吧；实验里与 ANIL 的比较不知道是搬运原文结果还是用这个修改版本重测试的；
		> 另：这里 MTL 的设定很像 AD（指不区分支撑/查询集的版本），只是 AD 隐向量含义不局限于最后一层参数，灵活性更大
	* table1 gradient-based meta-learning 简要分类，内循环处理所有层或末层，提前终止还是 l2 正则化
		* l2 正则化的工作：只调末层的 MetaOptNet，R2D2；调所有层的 iMAML，Meta-MinibatchProx
		> R2D2 论文名有 closed-form；由于元推断只求最后一层参数且有 l2 正则项，最优参数有解析表达式！
	* lem1 元推断表现，二者在 $X',Y'$（支撑集）上微调后在 $X$（查询集）上的预测值，用 NTK 给出表达式，关于随机初始参数的 PAC 框架
		* thm1 二者相差 $O(\lambda\tau+1/L)+\epsilon$，内层微调学习率 $\lambda$、步数 $\tau$，网络深度 $L$，宽度 $h\ge h^*=O(\epsilon^{-2})$
		* 记号相关：$\tau$ 元训练阶段内迭代步数，$\hat\tau$ 元推断阶段内迭代步数

## hist
> 该部分从 (metaL) 转移而来
* `[yunzhenFeng]-2007.12446`: #MTL, #representation_comparison
	* "Transferred Discrepancy: Quantifying the Difference Between Representations"
	> TODO: summary, comparison tree, link, (broader impact?)
	* 关于表示学习得到的 feature extractors，提出了两种 extractors（可以不在同一空间）距离的定义，该定义基于对下游任务的影响
	* （我的语言，原文讨论采样之后的情形）定义表示的 TD（Transfered Discrepancy）距离：设有数据分布 $x\sim p$，真实映射 $f:x\mapsto y$，已有 extractors $\Phi:X\to D_z$，$\Phi':X\to D_z'$
		* 以下讨论针对某种特定的“output head” $H=\{h_W(z)\}$ 架构，例如本文理论主要讨论线性情形、分类回归问题
		> 原则上可以做图像补全、分割之类的任务，输出形式不同；
		> 此外一般的多层 NN 也可以考虑，例如 $z$ 仅为某种 bottleneck 用于后续图像分割等任务的情形（回忆 Taskonomy），不过理论分析会复杂一些，如果拟合能力太强则距离始终为 0
		* 距离定义为 $\mathrm{TD}(\Phi,\Phi';f)=d(\hat h\circ\Phi,\hat h'\circ\Phi')$，其中 $\hat h=\operatorname*{\arg\min}_{h\in H}\ell(h\circ\Phi,f)$，$\hat h$ 同理，两种距离均在 $x\sim p$ 意义下定义
	* 该定义下的性质：
		* 相差正交变换下 TD 距离为 0（> 为什么需要正交，原文“unitary”，是不是写错了）
		* thm1 推论，如果 $\Phi_\#p$ 之间独立，则 TD 为 2
		* thm2 由 $\Phi_\#p$ 之间协方差矩阵导出 $D$ 矩阵，其奇异值给出的 TD 表达式
* `MTLtheory-linClassifier-1910.13593`: #MTL/#theory|#classifier|#linear_model
	* "Generalization in multitask deep neural classifiers: a statistical physics approach"
	> TODO: summary, comparison tree, link, (broader impact?)
	* p5/22:-1 定义了“多任务收益”；似乎 teacher 总是单任务，student 学习时才会使用 MTL 设定从多个 teacher 学
		* 记号：$\bar ?$ ground-truth 模型，$\hat ?$ noisy teacher，$\tilde ?$ 单任务版本的 student，$?$ 多任务的 student
		* $\hat y,\bar y$ 使用 argmax 定义，$y$ 使用 softmax
* [domain adaptation 相关理论分析介绍](https://zhuanlan.zhihu.com/p/95772588)，及其提到的 [前置工作介绍](https://zhuanlan.zhihu.com/p/50710267)
	* 后一篇文章的记号：$I(h)=h^{-1}(1)$，$H\Delta H$ 指集合运算 $\{h_1\Delta h_2\}$，$\Delta$ 异或
	* 后一篇介绍的工作，通过定义两个概率测度的距离（要求可以通过离散样本估计；定义对 Borel 集取 sup），给出了在目标域上的分类误差上界
	* 前一篇文章探讨了概率测度距离的不同定义与区别
* `BI-MAML-2006.10921`: #theory/#optimization/#continuous_time
	* 连续时间动力学描述的 MAML 外层优化过程；改进算法，在内层梯度较大时不做内层迭代
	* "Meta Learning in the Continuous Time Limit"
	> TODO: summary, comparison tree, link, (broader impact?)
	* p2:l0 为简便起见不讨论数据采样，假设任务 loss 有 oracle（> 从而不需考虑 tr-val 数据问题）
	* 内层只考虑单步更新（离散时间），外层连续时间
	* 改进的算法 BI-MAML，内层梯度较大时，将内层迭代步数设为 0
		> `MAML++-1810.09502` 好像通过内层不同迭代步数加权来加快训练；区别？至少这里省去了算内层迭代
* `r-2010.07994`: #theoretical_framework
	* "ALPaCA vs. GP-based Prior Learning: A Comparison between two Bayesian Meta-Learning"
	> TODO: summary, comparison tree, link, (broader impact?)
	* 试图说明两篇文章描述的 meta-learning 问题的等价性：ALPaCA 和 GPR（Gaussian Process Regression）
	> 2021-09-22 稿纸有简单记录，暂不打算细看
* `Reptile-1803.02999`: #MAML/#gradient
	* 改版 MAML 不再使用二阶导，不用到 query set；理论分析：外层更新方向的含义，参数空间距离与函数空间距离的不同
	* "On First-Order Meta-Learning Algorithms"
	* MAML 类方法，task $j$ 内层迭代 $k$ 步得到 $\phi_k^j$，对外层参数 $\phi$ 提供的更新方向为 $\phi_k^j-\phi$，而不使用梯度信息（比 FOMAML 更简单），也不涉及外层 query set
		* 训练阶段，每任务内层每次更新必须使用不同数据 batch（推断阶段应该也这么做但不必要）
		> 从而此时内层 early-stopping 可能不能等价于正则化！
	* 分析外层更新方向的含义（MAML，FOMAML，Reptile 有一致性）：
		* 记第 $i$ 次更新用的 loss 为 $L_i$（省略任务角标 $\tau$）其在迭代初始点 $\phi$ 处梯度为 $\bar g_i$，Hessian $\bar H_i$，$i\le k$；设 $k\alpha\ll 1$
		* eqn(25-27) 各方法的外层更新方向（简便起见先考虑 $k=2$，忽略 $O(\alpha^2)$ 项）
			> $k=2$ 涉及内层单步更新处的梯度，MAML 通过链式法则使用此梯度，FOMAML 直接使用此梯度作为外层更新方向，Reptile 用此梯度再更新一次内层参数，据此提供外层更新方向
			* MAML $\bar g_2-\alpha\bar H_2\bar g_1-\alpha\bar H_1\bar g_2$
			* FOMAML $\bar g_2-\alpha\bar H_2\bar g_1$
			* Reptile $\bar g_1+\bar g_2-\alpha\bar H_2\bar g_1$
		* 考察对不同任务和任务内 batch 选取方式平均：AvgGrad $\mathbb{E}_{\tau,1}\bar g_1$ 对应 joint training 的梯度，
		* AvgGradInner $\mathbb{E}_{\tau,1,2}\bar H_2\bar g_1=\frac12\mathbb{E}_{\tau,1,2}[\partial(\bar g_1\cdot\bar g_2)/\partial\phi]$ 用于提升泛化能力：同一任务下，不同 batch 选择给出的梯度方向差别不大（内积大），从而用一个 batch 训练后在另一个 batch 上表现也好
		* > (? mine) 利用 batch 1，2 独立，它应该可以继续推导为 $\frac12\frac{\partial}{\partial\phi}\mathbb{E}_\tau[(\mathbb{E}_1\bar g_1)^2]$，
			* 相当于说，只要求 full batch 下梯度尽可能大即可；和文中声称的不同
			* 如果 batch 不重新采样，则可推导为 $\frac12\frac{\partial}{\partial\phi}\mathbb{E}_{\tau,1}[(\bar g_1)^2]$，关于 batch 有均值平方和方差两部分，训练结果有可能是方差变大
			* 必须重采样的结果说明，不是所有情形都可将内层 SGD 等价于 early-stopping！否则{梯度方向不对}
			* 事实上对 $k=2$，Reptile 内层每步重采 batch 等价于 MAML support，query set 独立选取；
			* 对多步情形，若 MAML 仍只使用这两类数据（$L_1=\cdots=L_{k-1}$），代入 eqn(24) 在期望下的梯度方向仍是对的，如果不区分则不对
		* eqn(35)后：先由 AvgGrad 保证 joint training loss 小，再由高阶的 -AvgGradInner 保证任务内梯度方向一致
			> -AvgGradInner 目的应该说是：希望任务内梯度（关于数据随机采样的）均值大（所声称的应该还有方差小，但该表达式没有体现）；注意在 joint training loss 极小处，梯度关于任务的期望为 0，特定任务梯度大相当于梯度关于不同任务的方差大
			* 按下方 informal argument 的解释：joint training loss 为零的点很多，该外层更新方向让参数在这些零点中找泛化好的点
			* 在 sec4 给出的 sin 曲线小样本拟合任务中，训练前后 $f_\phi$ 都接近零函数，但给定任务上更新行为不同
	* > (mine) 最终相当于 loss 形如 $L^o=\mathbb{E}_\tau[L^\tau-\alpha(\nabla_\phi L^\tau)^2]$
		> 在相差 $O(\alpha^2)$ 意义下，Reptile 给出的更新方向是该 loss 下的梯度方向，成为 SGD 算法；
		> `NTKmetaL-2102.03909` 法 1 显式使用该 loss，像 PINN 一样还是涉及二阶导
		* 其中 $L^\tau=\mathbb{E}_bL^\tau_b$，对 batch $b$ 取期望；$L=\mathbb{E}_\tau L^\tau$
		* $\alpha\to 0$ 极限相当于约束优化问题：求 $\max_\phi\mathbb{E}_\tau[(\nabla_\phi L^\tau)^2]$，约束 $\phi\in\arg\min L(\phi)$ 
		* 可假设 $L[f]$ 有唯一极小 $f_*$，而参数化映射非单射性质使 $f_\phi=f_*$ 的 $\phi$ 有多个，算法目的是在这其中找最优参数
		* 该 loss 在预测函数 $f$ 的层级解读：若用 $L_2^\tau[f_\phi]$ 提供的梯度更新参数，有 $-\frac{\mathrm{d}}{\mathrm{d}t}L_1^\tau[f_\phi]=(\nabla_\phi L_1^\tau)\cdot(\nabla_\phi L_2^\tau)$ 从而训练目标为：用一个 batch loss 更新后的模型在另一个 batch 下的 {loss 下降最快}
		* 从而学习目的仍是利用新数据集的方式
		> 更多关于 Reptile 分析方式的想法见 `ReptileIdeas:`
	* sec5.2 另一种相对 informal 的 argument：$\phi\mapsto f_\phi$ 不是单射，从而定义的距离不同
		* 若考察函数空间距离，$\mathbb{E}_\tau L^\tau[f_\phi]$ 最小点很多
		* 但若考察参数空间距离，$\mathbb{E}_\tau[D(\phi,W_\tau)^2]$ 最小点可能唯一，其中“参数流形”$W_\tau$ 由 $L^\tau[f_\phi]$ 的零点组成
		* 实际计算外层梯度时，没有精确算出 $\phi$ 在 $W_\tau$ 上的投影（它将给出准确梯度方向），而是用有限步内迭代代替
	* 实验里不使用 query set 还能在小样本上表现好；
		> 可能因为内层不同步使用不同 batch，事实上相当于允许使用大样本信息；
		> meta-objective 也许不能是处理数据噪声（support set 噪声大但 query set 干净）
	* sec6.1:4 小样本分类问题实验，内层 Adam（动量取 0）外层 vanilla SGD
		* 脚注：动量取 0 是因为算法依赖于内层迭代每步使用不同 batch，动量会混淆梯度信息；实验确实有动量效果下降
		* 训练阶段不重置 Adam 的累积动量，让其自动更新，但测试阶段重置以防信息泄漏
		* 细节 sec6.1:3 batch normalization，普通设定使用全部训练数据和一个测试数据，transductive 设定使用全部测试数据，实验能提高效果
		* sec6.2:-1 使用的 batch 越多（即内层迭代增多）效果越好，Reptile 提升比 FOMAML 显著，原因为整合了多个 batch 提供的梯度
		* fig4 关于 batch size 选取的实验（full batch 有 100 数据，应该是 5-shot 5-way 4 tasks）
	> `PACOH-2002.05551`“用于小样本之外的可能性”同样适用
* `HBM-MAML-1801.08930`: #MAML, #meta-learning/#formal_def, #unsupervised, #HBM, #UQ, #theory
	* MAML 解读为分层贝叶斯模型（HBM）的某种近似估计，据此提出改进算法 LLAMA
	* "Recasting Gradient-Based Meta-Learning as Hierarchical Bayes"
	* eqn(2) 使用 hierarchical Bayesian inference 描述元学习问题
		> 这里问题用无监督（极大似然）形式，有监督作为特殊情形（见((n32e03))有监督学习可写为极大似然、无监督）处理的是 `formalDef:`“前二分量都变的情形”
		> HBM 层级：任务分布 $p(T)$（$\theta$ 刻画），采样出任务 $T$（$\phi$），其中再采样得到数据 $x=(X,y)$；
		* 记号：任务角标 $j$（> 数据角标我用 $x_{ij}$，而非原文 $x_{j_n}$；$x_j=\{x_{ij}|i\}$）
		> 关于问题用无监督描述，原版 MAML 只刻画 $p(y|X,\phi)$，这里讨论的 MAML 进一步刻画的是 $p(y,X|\phi)$，loss 事实上添加了 $-\log p(X_i|\phi)$ 项
	* 只使用训练数据，学习目标：最大似然 $\max_\theta p(x_{ij}|\theta)$
		* $p(x_j|\theta)=\int p(x_j|\phi)p(\phi|\theta)\,\mathrm{d}\phi$（对 $j$ 取乘积为优化目标）
		* 若使用单点估计，$\int f(\phi)\,\mathrm{d}\phi\approx f(\phi^*)$，$\phi^*=\arg\max f$
			> 我认为应是近似 $\propto$ 而非 $\approx$；相差常数因子不影响 $\max_\theta$
			* 之后说明 MAML 为特殊情形
	* 外层优化使用 val 数据 $x^v$，区分于 tr $x^t$
		* eqn(3) 此时单点估计为 $p(x_j|\theta)\approx p(x^v_j|\phi^*)$（不涉及 $p(\phi|\theta)$ 项）
		* 单点估计 $\phi^*=\arg\max p(\phi|x^t,\theta)=\arg\max p(x^t|\phi)p(\phi|\theta)$
		> MAP（最大后验）$\max_\phi p(\phi|x,\theta)$，为贝叶斯学派，有 $\phi$ 的先验；对比 MLL（极大似然）$\max_\theta p(x|\theta)$为频率学派
		* > (mine) 我的反推：若成立，估计的对象应为 $\mathbb{E}_{\phi\sim p(\phi|x^t,\theta)}p(x^v|\phi)=p(x^t,x^v|\theta)/p(x^t|\theta)$，{该外层目标}事实上不能写为 $p(x|\theta)$！
			* 注意 HBM 下 $p(x^t,x^v|\theta)\ne p(x^t|\theta)p(x^v|\theta)$，见 `probGrphDataDepend:`(freeNotes)
			* 与上方“只使用训练数据”的单点估计含义不同：上方在估计积分，是假定函数最大值和积分值相差（不依赖于 $\theta$ 的）常数，这里估计期望，当 $\phi$ 分布接近单点分布时准确度高
			* 关于此优化目标，构造的一个例子：$\phi\sim N(\theta,1),x\sim N(\phi,1)$，$x^t,x^v$ 都仅有一个数据，则 $\max p(x^t,x^v|\theta)$ 得 $\theta=(x^t+x^v)/2$，而此优化目标下为 $\theta=2x^v-x^t$，奇怪！（如果多次重新划分 tr,val 数据共同训练，可能结果相对好些）
			* TODO: 思考这种优化目标如何帮助小样本，防止过拟合
	* MAML 可放在该框架下解读，作为特例：
		* 内层 $\phi^*$ 的得到：early-stopping 相当于隐式正则化，对应显式正则化下严格极小
		* 正则化可写为 $-\log p(\phi|\theta)$ 形式，加上数据 loss 后，等价于上方外层优化“单点估计”
		* sec3.1 线性回归设定下，eqn(5) $\phi^{(k)}$ 对应的显式正则化 $\|\theta-\phi\|_{Q_k}^2$
			* $Q_k$ 定义见 sec3.2（最初证明在引用文献）
		* p5:1 非线性问题，单点估计不再是由 MAP 给出
		> 实际中无法获得 $p(\phi|\theta)$，从而“只用训练数据”做法用不了，而用 val 数据做法不显式涉及它（仅出现在 $\phi^*$ 定义，而计算上可用原来的 $k$ 步迭代获得）
		* 该框架下的 MAML 及改进版本见 alg2 及 subroutine
	* 改进单点估计，从而改进 MAML：
		* （针对只用训练数据）原先积分估计 $\int f$ 视为与 $\max f$ 成正比
		* sec4.1 Laplace 积分局部二次估计，额外引入 Hessian 项，$\int f\approx f^*(\det H)^{-1/2}$
			* $\log p(\phi|x^\text{tr},\theta)$ 在 $\phi^*$ 处展开至二阶；积分可忽略常数因子
			* 2021-09-10 导师：相当于用单个 RBF 逼近被积函数；低维的各种数值积分算法精度更高，但高维这可能是唯一的估计法
			> $f$ 近似为 RBF，$-\log f\approx--\log f(\phi^*)+(\phi-\phi^*)^\mathrm{T}H(\phi-\phi^*)$ 即得 sec4.2 $H$ 定义，利用多维高斯分布表达式可得积分结果，$\det H$ 之外涉及的常数可省略
		* sec4.2 需要的 Hessian 不好计算，用精度 $\tau$ 的对角 Hessian 估计
		* sec4.2:-2 用 K-FAC 估计的 FIM 代替 Hessian
		* subroutine4 外层使用 val 数据下的算法
			> 感觉和上面的推导不是一路！
			> 与 eqn(11) 比较，使用 val 数据的形式意料之中地少了 $p(\phi|\theta)$ 项，
			> 但是 $\log\det H$ 项系数也不再是推导的 $1/2$，而是超参数 $\eta$（sec5.2:2 取 $10^{-6}$），看起来只是手工设计的正则化项，而非推导结果！
	* fig5 HBM 解读下，推断时 $\phi$ 为分布（从而为函数的分布），可以从中采样
		> 是否大致表达了某种 UQ？
		> 继续用 argmax 设定则还是确定性函数；
		* sec5.1:1 声称直接用 eqn(11) 采样（> 回忆 $p(\phi|\theta)$ 通常无显式表达式）；看文字描述，似乎是鉴于 $p(\phi|x,\theta)$ 已用高斯分布近似，均值（即 MAP）用 early-stopping 可求出，方差已使用一些办法估计，从而能从分布中采样
	* > (mine) HBM 框架能表示的 meta-representation
		> 后期可能要区分：用纯训练数据能表达的，以及外层用 val 数据能表达的
		* MAML（$\phi$ 在某点附近），AD（在某流形上）
			* 学优化算法也许算（通过动力学隐式表达某区域，为动力学收敛的终点；但动力学依赖于 $\nabla_\phi L$ 和历史状态）
		* 看起来不能表达 hypernet；学 loss 形式的可能也不行？
		* 能应用的问题，PINN 可能算，数据 $x$ 换为 PDE 参数 $\lambda$，$p(\lambda|\phi)$ 由 PINN loss 给出
	> 重构了笔记，以下为原始部分
	* > (? mine) HBM 框架下，文中内外层迭代使用不同数据如何理解？
		* 一个积分用单点估计，但是不是用被积函数（val 数据）的最大点，而是 tr 数据给出的另一个函数（或者后验分布）的最大？
		* 如果两个最大点不一致，改进做法使用高斯分布逼近的合理性？
		* HBM 设定看起来可以按 many-shot 方式训练，推断时才 few-shot；和这种仅在外层迭代引入 many-shot 数据的做法的区别？
		* 构造了简单例子，$T$ 均为二维高斯分布，$\theta,\phi$ 刻画均值方差
			* 遇到新数据时通过平移 $\theta$ 均值来得到 $\phi$，$\theta$ 捕捉的 meta-representation 是方差信息（哪个维度重要哪个维度不重要）
			* one-shot 给出单点 $\phi$ 再 many-shot 训 $\theta$，和内外层都用所有数据看起来差别不大；two-shot 似乎也同理
		* 文中的细节，$p(\{x\}|\theta)$ 的估计，在用 tr 数据的地方涉及 $p(\phi^*|\theta)$（如 eqn(11)），而用 val 数据的地方则不涉及它（如 eqn(3), subroutine3,4）；合理性？
		* 在维数远大于数据量的条件下是否会有区别？
		* “$\theta$ 提供正则化防止过拟合”能否体现？
* 下方 `2021-09-29`(lectures)“关于元学习理论的工作”
* `NTKmetaL-2102.03909` 用 NTK 给出 RKHS 上描述的 MAML 类元学习框架，相应给出两种算法，避免显式内层迭代
	* "Meta-Learning with Neural Tangent Kernels"
	* 法 1 用 $\mathbb{E}_T[L^T[f]-\alpha\|\nabla L^T[f]\|^2]$ 作为替代 loss 训练，不再进行内层更新
		> 和 `Reptile-1803.02999` 推导得出的 loss 一致，不过那里是在用特定算法估计其梯度（内层变换 batch 梯度更新结果作为外层更新方向，误差为学习率小量），
		> 这里显式用此 loss 训练，像 PINN 一样还是涉及模型二阶导；
		> 注意这里只采样了 support set，而按 Reptile 文章的推导，这对 NTK 项不是无偏估计，要写成不同数据 batch 上乘积 $(\nabla L_1)(\nabla L_2)^\mathrm{T}$ 才是
		* $\|\cdot\|^2$ 为 NTK；eqn(3) $\nabla=\nabla_\theta$ 为传统参数空间上的 NTK 版本
		* eqn(4) $\nabla=\nabla_f$ 给出 RKHS 上的 NTK
		* thm3 二者差异随网络深度增加减小
	* 法 2 eqn(5,6) 用 NTK 写出内层 $T$ 步或无穷步优化后的结果（网络无穷宽极限），直接用于外层优化
		* 区分了 support/query set
		* 和 iMAML 的比较（待确认）
	* alg1（在 secA）最终算法，两种区别仅在 loss 选取
	* 实验结果，较常见方法在对抗攻击下更稳定、OoD 泛化更好
* `allocNTaskData-2103.08463`: #ERM, #big-tasks
	* （总结；折叠时可见）
	* "How to distribute data across tasks for meta-learning?"
	> TODO: read details, summary, comparison tree, link, (broader impact?)
	* 


