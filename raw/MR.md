> 2022-01-05 从原版 `~/nutstoreFiles/research/papers/ModelReduction/+ModRedNotes.md` 修改而来
## Papers
* (formats)
	* format (supervised case): $f:X\to Y$, (a) 问题/希望找到有什么特点的解决方法；(b) $X,Y$ 是什么；(c) $f$ 如何运用于原问题 (d) $f$ 结构（网络设计），学习算法, NN loss；(e) $\{(x_i,y_i)\}$ 数据生成及策略；(f) 如何比较结果好坏；(g) 动机，做到了什么原有方法做不到的事情，与其他方法比较（包括顺序比较即改进的原型，平行比较即不同的方法之间）
	* "p1:l-2" means "page 1, left column, 2nd paragraph from bottom"; "sec3:-1" similar; "(> ..)" my *inline* short comment
	* 可以记下设计的讲法（先看 conventions）便于日后参考
	* “要关注为什么引入这一方法，讲清楚之前方法做不到什么”
		* 出现的位置可能包括：摘要，introduction，实验与传统方法对比结果，conclusion，同系列之前工作的 future directions
		* 细读之前尽量确认写了创新点，不要费力读完发现没意思
#### Supervised ML
* `Nonadiabatic Excited-State Dynamics with Machine Learning.pdf`, with supporting information ("SI")
	* 似乎正文主要讲准备数据的策略
	* (a) nuclei motion $R(t)$, coef's $c_J(t)\in\mathbb{C}$ ($\psi(t,r;R(t))=\sum_J c_J(t)\psi_J(r;R(t))$, $\sum_J|c_J(t)|^2=1$); surface hopping 做系数采样
		* 实验中只用了基态和第一激发态
	* (b) $f:R\mapsto(V_J,\nabla V_J,\langle\psi_1,\nabla\psi_2\rangle)$: 补充材料指出学习目标 $V_J$ (adiabatic state potential), $\partial V_J/\partial R_k$, $F_{12}^k=\langle\psi_1|\partial\psi_2/\partial R_k\rangle$ (nonadiabatic coupling vector)
		* SIp8 par.1 对势能梯度显式拟合，效果好于对 ML 模型求导
	* (c) （所有能级都考虑、未采样的情形）SI eqn (2-4)（自己推导不难）；对采样能级的 surface hopping 情形，设当前能级 $L$，转移概率 SI eqn (5-8)（(7) 为各转移概率，(8) 为转移后能级 $J$）
		> wiki "surface hopping" may be helpful
	* (d) SIp7 KRR (kernel ridge regression) $R_p\mapsto\sum_m\alpha_m K(R_p,R_m)$ eqn (S18), $\alpha$ eqn (S20)
	* (e) (guess:) SIp5 用 A-SBH 计算？正文 p2，样本点不能太多以免效率低于直接计算（方法主要耗时在数据生成 p3 par.l-2）; p2 par.r-2 etc; SIp9 par.2
* `Deep Learning for Nonadiabatic Excited-State Dynamics.pdf` with SI
	* 上一篇文章是 ref41，后一篇 ref40
	* (a) nuclei motion $R(t)$, hopping between $S_0$/$S_1$; 希望在 conical intersections 附近也能准确逼近，而不需要在这里回到传统方法
	* (b) $f:R\mapsto(E,F)$；（每个能级分别学一个 $f$）
	* (c) SI p8 (sec 5) eqn (14-16) transition $p$
		> (?) wiki "surface hopping": (before "nonadiabatic coupling") $V_{12}\coloneqq\langle\psi_0|\hat{H}|\psi_1\rangle$; same notation? 
		* (p4:l-1 "energy gap .. important .. for determining whether system hops")
	* (d) DNN as DeePMD, loss eqn (2); SI p8 par.0 "DeepMD-kit"
	* (e) SI p5 (sec 3)
	* (f) p5:l0 "similar time-dependent $S_1$ and $S_0$ state populations, hopping-point and product distributions, and almost the same energy gaps at either Franck−Condon or hopping regions"
	* (g) p1:l-1, ref41 使用 ML 预测“nonadiabatic coupling vectors”，ref40+本文 Zhu−Nakamura method 方法避免使用 nonadiabatic coupling vectors，只需要 diabatic coupling $V_{12}$; 见 intro 的比较，NN 能在性质不好的点附近逼近
		> (?) "(nonadiabatic|diabatic) coupling" 区别？问周老师
* `Inclusion of Machine Learning Kernel Ridge Regression Potential Energy Surfaces in On-the-Fly Nonadiabatic Molecular Dynamics Simulation.pdf` with SI
	* (c) Zhu−Nakamura method
	* (d) KRR; 在 conical intersections 附近用传统方法
		* SI scheme 1: $R\mapsto$ columb matrix (SI eqn (1)) $\mapsto$ (SI p8:-2) $m=WM\mapsto$ (KRR SI eqn (2)) $f(m)$ ($V$+force?)
* `Isotope effects in liquid water via deep potential molecular dynamics.pdf`
	* (a) 问题：计算同位素效应，比较 $\mathrm{H_2O,D_2O}$ 的若干物理量的（分布的）区别，
		* 物理量包括 "interference differential cross section" eqn (3-4) $F(Q)$，"radial distribution functions (RDF)" $g_{\alpha\beta}(r)$，"angular distribution function (ADF)" $P_\text{OOO}(\theta)$
		* 只考虑基态，不像前几篇（考虑光化学、光物理等）需要考虑激发态 (Born-Oppenheimer)
	* DPMD, "PI-DPMD"
		* PI（参考“Ab Initio Molecular Dynamics”p233）路径积分版本，不再把核子当做经典粒子；势能面由 Born-Oppenheimer 给出后不再考虑电子波函数; PI-AIMD/PI-DPMD 只有势能面计算方法的区别
	* (e) sec 2.1 "AIMD" ($\mathrm{H_2O}$ only，因为 PES 相同), "PI-AIMD", (c) sec 2.3
	> (?) eqn (1), what is $G^2$
* recall DPMD `1707.09571`: 
	* p17/22 $F=\nabla_x E$, NN 应该没有专门输出受力的 channel
	* loss p5, $E,F,\xi$; $\Xi=-\frac12\sum_i R_i\otimes F_i$, 
		> $\Xi$ 能表达所有 $R\times F$ 的双线性型，如内积 $\mathrm{tr}$，叉乘（力矩）
* `1710.01718`, "Bloch oscillations in graphene from an artificial neural network study"
	* (a) 石墨烯晶体（2D）内电子运动，正问题为给定外加（均匀）电场算出晶格中电子运动速度（群速），这里是反问题：通过（观测到的）电子速度变化求电场强度 $E$，进而按其（各分量）大小分类（各类别对应的 $E$ 范围事先给定），恢复出外部输入的（离散）信号（> 类似数字电路高低电平）
		* 正问题 Bloch oscillations 求解（物理背景）：eqn (3-8); "electron crystal momentum"
		* p11:0 各类别对应 $E$ 范围（区分度）越大，PPCC（衡量信号恢复准确度）越大，但是再求解正问题得到的电子速度误差变大
	* (b) $f:(\bm{v}(t_0),\dots,\bm{v}(t_{99}))\mapsto \bm{E}$, fig 4-6
		> 输入是群速在若干时间点的值；不指定特定电子故“位置”无意义，“轨迹”也无意义
	* (d) sec3.1
	* (e) sec3.1:-1
	* (f) 3 settings p3:-1 p4:0, sec3.1.1-3；（数值实验）生成 $E$ 看信号恢复是否准确，以及用恢复的信号计算正问题的解与观测解是否符合 fig 7-9
	* (g) (from `[26]-1611.03143` intro) "Although a plethora of methods to analyze periodic curves are known and well established, in this article we construct an eﬃcient machine learning algorithm" 仅仅是希望提供一种新思路
		> guess: 解 online 反问题只需要单次前传，如果传统方法需要迭代算法可能是速度上有改进
* `MLEBFM+EANN`: "Efficient_Construction_of_Excited-State_Hessian_Matrices_with_Machine_Learning_Accelerated_Multilayer_Energy-Based_Fragment_Method", (#SI_results_only)
	* (a) 光化学反应（激发态），大体系（如溶液）的模拟计算，需要求势能面
	* (c) MLEBFM: eqn (1-6) $E_i$, $E_{ij}$, $E_{ijk}\cdots$; eqn (7-16) $E(\text{in})$ (更精确), inter-layer $E(\text{in/out})$ (2-body interaction), $E(\text{out})$ (3-body)
		> in 和 in/out 用的 $E_i'$, $E_{ij}'$ 应该是高精度方法？见原文下方; 3-body 反而用在更低精度需求的能量计算上，原因？
		* fig 2, p3:l1 体系分成两个部分处理，inner 对应光照活跃区域（如溶质）需要高精度方法算，outer（如水分子，更多）需要高效处理办法，二者相互作用部分（“复杂”，具体见文本）
		* p4:l-1, $E_i$ $E_{ij}$ "independent ML models", $E_{ijk}$ optional
	* EANN: (b) $R_i\mapsto E_i$, (d) fig3 eqn(17-19) $R\mapsto\psi\mapsto\rho\mapsto E$, loss eqn(20), (e) from ab initio, p5/12:l-1 "AMBER17"
		> 这里只是在介绍原有方法，因此能量只有 1-body 的项，本文用到的应该还有 2-body $(R_i,R_j)\mapsto E_{ij}$；或者是隔离出一个双原子体系再对所有可能的双原子求和？
	* (f) compute $\mathrm{Hess}(E)$ 精度: $S_0,S_1,T_1$; 2- 3-body; methods (1) pure MLEBFM, (2) pure ML, (3) MLEBFM+ML
		> RMSD: 均方根误差; 精度比较的区别？纯 ML 应该没那么好，怎么体现（训练集确实很大）, fig5, SI-fig13 右图确实看起来偏离对角线多一些
		* 时间+并行效率：p8/12, fig8, SI-fig11（差别仅在算到 3-body）
	* (g) 精度和效率；
		* p4:l2 MLEBFM "low-scaling" 且适合并行，用 ML 进一步提速；
		* p4:l3 纯 ML 方法不适合，因为（1）关心的能级多导致需要大量数据（2）能量面部分区域高度非线性
			> active learning solvable? 
* `identifyNormalModesInSimulation`, [doi](https://doi.org/10.1063/1.5129335): unsupervised
	* "Identification of important normal modes in nonadiabatic dynamics simulations by coherence, correlation, and frequency analyses"
	* 问题：分析分子模拟数据（非绝热），认为大幅度运动未必是重要信息；希望分析 SH 中振荡模式如何（1）被激发过程影响（2）影响电子态之间的相互作用
	> 没有用到 ML！
	* 分子运动数据生成 sec II.A，其中有纯基态的，有带跃迁的，将跃迁时间点（或纯基态的演化结束时间）作为时间原点 $t=0$
	* $(i,\text{traj},t)$ 变量（分别代表："normal mode"，随机生成的轨迹，时间）；
		* p3/15:r-2 normal mode 手动选取；是不是 LVC 等算法生成一堆 modes，再手动挑出来几个？
		> 一个 mode 下每个原子指定一个一维振动正方向，见各图示
	* eqn(1) $Q_i$ 每个 normal mode 的偏移量，无量纲，考虑了质量不同
		> 质量的根号回忆简谐振动 $V(r)=kr^2/2$，有 $\bar Q_i\sim\sqrt E_i$ (time avg)；  
		> (?) 矩阵 $K$ 选取还没弄清楚
	* 用到的分析方法 3 种：
	1. coherence $\coloneqq\rho_i/\sigma_i=t\text{-variance}/(\text{traj},t)\text{-variance}$
		* 计算比较：即将跃迁 vs. 将保持基态的时段的差异 eqn(6)，跃迁前后变化 eqn(7-8)
		* 服务于目的（1）
		* fig6
	2. (1D) 线性回归
		* 自变量：（eqn(9) 之前）concat of traj; 
		> (?) $(i,t)$ concated or not? 
		* 衡量的被影响变量：（1）energy gap $\Delta E(S_0,S_1)$, $\Delta E(S_0,T_1)$;（2）"diabatic energy differences" eqn(14) (details?);（3）elements of "overlap matrices" $S(t,t+\Delta t)$ eqn(12)
		* 服务于目的（2）
		* fig3,7; （> 从最大的 $R^2$ 也比较小来看，一个具体的 normal mode 的解释能力是有限的）
	3. 时间序列分析考察频率变化：
		* 小波变换 eqn(15)，系数对轨迹求和 eqn(17)（结果涉及的指标包括 $(i,\omega,t)$），以及对频率分布随时间变化的分析 fig4
		* 服务于目的（1）
		* fig4,8
	* eqn(18) $\text{Imp}$ 衡量 normal mode 的重要性，综合了各个标准
	> idea: normal mode 连续可变（参数），用梯度下降找到最重要（$\text{Imp}$ 最大）的那个，正交投影再找几个次重要的

#### Unsupervised ML
* 暂定参考大纲：分析对象，对数据（分布etc）的假设，分析方法，loss、NN 架构、优化算法，对结果的解读方式；实验数据获得，结果分析解读，发掘到的其他信息；动机与前序后续工作比较，横向比较
* Geometry Evolution in On-the-Fly Surface-Hopping Nonadiabatic Dynamics with Machine Learning Dimensionality Reduction.pdf (SI result figures only)
	* "Analysis of the Geometrical Evolution in On-the-Fly Surface-Hopping Nonadiabatic Dynamics with Machine Learning Dimensionality Reduction Approaches: Classical Multidimensional Scaling and Isometric Feature Mapping"
	* 问题: 已经用 surface hopping 生成了许多轨迹（激发态到基态），需要分析这些轨迹，找到主要的反应坐标 (unsupervised learning)，降维
		* p2/13:l-1 降维，之前工作中只运用于基态的动力学，这里用于非绝热激发态
		> 原文用词 geometrical evolution，geometrical 应该指分子几何形状，因此是考虑 $\R^{3N}$ 中的动力学；根据示意图，应该是把所有初值、时间步、概率演化分支对应的 $\R^{3N}$ 点都放入训练集，不区分不同时间步的分子形状
	* method: classical MDS, ISOMAP
		> classical MDS [zhihu](https://zhuanlan.zhihu.com/p/50715681): $D=(d_{ij})$, assume $\sum_i x_i=0$, $B\coloneqq(x_i^\mathrm{T}x_j)=JD^{\odot 2}J/2$, $\min_Y\|B-YY^\mathrm{T}\|_F^2$ ($x_i\in\R^{3N}$ reduced to embedding $y_i\in\R^d$)
		* p3:l4 ISOMAP 只是把欧氏距离换成了流形距离（构造图，只连接距离不超过 $\epsilon$ 或 $k$-近邻（要仔细调）的样本点，考虑 graph 距离）
		> ISOMAP 下“用两两距离 $D$ 恢复内积 $B$ ”是形式的做法，没有真的内积；计算 $B=LL^\mathrm{T}$ 分解似乎是在 $\R^n$（$n$ 数据量）找 embedding 使得新（更高维）空间的欧氏距离与原空间流形距离相同，再在这个高维欧氏空间降维得到 2D 嵌入可视化
		* ISOMAP 非线性作用的体现：fig9,10，本来需要 2 个维度表示反应坐标，现在只需要 1 维
		* choose $\epsilon,k$: eg sec3.1.3:1,2 $\epsilon$ 太小会不连通；似乎是希望当前超参数下降维有效（流形距离与低维嵌入距离的误差小），据此寻找合适的超参数
		* p3 sec2.2.2 欧氏距离计算无视平移旋转; perm $S_n$ optional
		> 平移应该对齐重心即可；旋转：对 $X,Y\in\R^{3\times N}$，求解 $\min_{U\in O(3)}\|UX-Y\|_F^2$，加乘子项 $-\langle\Lambda,U^\mathrm{T}U-I\rangle$，求导得 $(X-U^\mathrm{T}Y)X^\mathrm{T}=(\Lambda+\Lambda^\mathrm{T})/2$，即 $U^\mathrm{T}YX^\mathrm{T}\in\mathbb{S}^3$；回忆方阵极分解 $YX^\mathrm{T}=UP$, $P\in\mathbb{S}^3_+$，来自 SVD $YX^\mathrm{T}=U_1DV^*=(U_1V^*)(VDV^*)$；最后不要求 $P$ 正定，得到的 $U$ 有多种可能，要从里面找出极大极小
	* p5 fig3 展示了降维用途，两个主要坐标刻画的分子形状区间
	* experiments
		* init sample: sec2.1.3 "Wigner distribution of normal modes" ($X,\dot X$); $\mathrm{CH_2NH_2^+}$ init state $\mathrm{S_2}$
		* evolve: $\mathrm{CH_2NH_2^+}$ sec3.1:1, $\mathrm{P\Phi B}$ sec3.2:1; "JADE code"
		* sec2.2.1:2 （激发态开始演化）回到基态后可能动能较大会撕碎分子，要停止；有时在基态不会分离而得到产物，此时不需要停
		* 结论见原文，包括 hop 位置分布、降维后两坐标轴与键长、二面角的关系，ISOMAP 中参数选取
		> dihedral angle 二面角，A-B-C-D 指 ABC 与 BCD 两个平面的夹角
	* p10:r-1 issues
	* 讨论 2020-08-28
* `acs.jctc.8b00176`, [doi](http://dx.doi.org/10.1021/acs.jctc.8b00176), 
	* "Visualization of the Intrinsic Reaction Coordinate and Global Reaction Route Map by Classical Multidimensional Scaling"
	* 考虑化学反应（不止是动力学演化），应该是以 IRC（主反应坐标）上的样本点作为降维依据来分析反应路径
	* $\mathrm{Au_5}$ 的数据集由 MIN, TS 组成，小规模，为计算方法生成，没有时间顺序关系（或者说是“IRC network”，由多个反应路径拼成）
* `GDyNet-1902.06836`: #Markov_chain, #GNN, #Koopman, (#open_source)
	* "Graph Dynamical Networks for Unsupervised Learning of Atomic Scale Dynamics in Materials"
	> Google scholar 下载时没有检查版本，因此批注在 `v1` 里
	* 问题：分析 MD trajectory, 关注 *某一个* 原子的邻域情况，识别出其中的若干种模式（“state”）及其转化方式，并能够预测后续变化
	* 前序工作：`VAMPnets-1710.06012` (ref [13]) 开始用 Markov 过程来建模
		* 认为邻域原子团演化方式 $x_{t+\tau}=F(x_t)$ eqn(1)
		> 经典物理模型需要考虑速度，这里可能是因为 $\tau$ 较大而导致速度的信息量不大；前序工作里是对 $\mathbb{E}(x_t)$ 的方程
		* 在 latent space（$\tau$ 较大时可以低维，因为“存在缓慢的特征过程”）为线性变换 $\chi(x_{t+\tau})=K^\mathrm{T}\chi(x_t)$
		* 进一步限制 $\chi$ 由 softmax 得到，则可视为概率分布，每个维度视为“state”，$K$ 自动成为 Markov 转移矩阵（自动行和为 1）
		> fig4 中的 state 例子应该是取最大分量（原本各 state 分量应该都非 0）变成分类问题，从各类数据点里（人工？）挑代表性的
		> * 相当于 latent space 人为做分划，区域个数与维数相同；另有方法是在 latent space 获得数据点后用谱聚类等方法进一步分类得到 meta-stable states，见 AISC:LED 笔记，加二者比较
		* 数值实验里 $\tau$ 较大时 eqn(11) 为常数，说明用 Markov 过程是较好近似
		* $\chi$ 对应的 decoder 作为 future directions，本文不涉及
	* 本文改进：用 GNN 表达 $\tilde v_{[l]}=\chi(x^{[l]})$，有旋转等不变性（似乎只输入距离信息）
		> 原文 "GCN"，根据更新表达式确实是 GNN
		* GNN 的顶点是邻近原子，不是高维空间的数据点
		* 边似乎不按照化学键，而是取几个最近邻: eqn(7) $M$-NN edge feature
		* init: before eqn(7) 根据原子类型随机初始化
		* update eqn(8,9)，attention
		* output $\tilde v_{[l]}=\text{softmax}(Wv_{[l]})$
		* 最后 $K$ 作用的对象只是中心原子的 feature；或者中心分子?的 feature 用其原子 feature 做 pooling eqn(4)，不涉及其他分子的信息（其实应该是：每个分子提供一个独立的数据点）
	* 先训练 GNN，loss "VAMP-2 score" eqn(5) （具体表达式见前序工作）；之后自动有 $K$ 表达式（前序工作 eqn(5)）
		> 关于 VAMP-2 score: 若 $Y=K^\mathrm{T}X\in\R^{m\times T}$, $\text{score}=m$ 与 $X,K$ 无关；  
		> 这么设计的原因还没有细究，前序工作“This variational theorem shows that the VAMP-2 score measures the consistency between sub-spaces of basis functions and those of dominant singular functions”
		* loss not $\min_K\|Y-KX\|_F^2$: after 前序工作 eqn(5)，避免 $\chi$ 成为常数映射从而不体现任何信息
		* 确定 state 数目等超参数：验证集的 VAMP-2 score；state 数 $m$ 和 $\tau$ 在统计不确定度范围内尽量小
		* 我对这一 loss 的理解见最后
	* 预测任务测试效果：CK test 试图用短时训练得到的 $K$ 迭代来捕捉长时信息，eqn(6) $K(n\tau)=K(\tau)^n$
		> "relaxation timescales" eqn(11): recall when $\dot x=\lambda x$, $-t(\tau)\Re\lambda=1$
	* 实验
		* data 来自数据库
		* p8/32 大量独立轨迹下算法可以识别出稀有事件
	* 讨论 date: 2020-09-11
	* 对 VAMP-2 score 的理解：来自 ref[13]，及其 ref[47]，见下方 Collected

#### TDA
> 已经迁移至 `../tda/TDA-notes.md`  
> 没有作为 unsupervised 子类，因为未必是“学习”任务？有时可以用于有监督学习，如 TDA 度量用于给出 KRR 基底，虽然好像能提供度量的算法都能干这个任务

#### ROM of DEs
* （评）2022-11-05 转移至 dynSys.md

#### EIT
* 相关信息
	* Boundary element method (BEM) wiki 上说在电磁学里称为 method of moment，似乎是 Galerkin 方法的积分方程版本
	* wiki 词条摘录
		* The majority of EIT systems apply **small alternating currents** at a **single frequency**, however, some EIT systems use multiple frequencies to better differentiate between normal and suspected abnormal tissue within the same organ (multifrequency-EIT or electrical impedance spectroscopy). 
		* 难点之一：不同于 CT，电流会 3 维运动，导致“impedance transfer”
		* non-linear inverse problem and is severely ill-posed.
		* in the mathematical literature of inverse problems it is often referred to as "Calderón's inverse problem" or the "Calderón problem". 
		* time difference EIT (td-EIT)，例如肺随着呼吸形状改变，相较 a-EIT 好处包括“most artifacts will eliminate themselves due to simple image subtraction in f-EIT”
			> 没说什么是 f-EIT
	* `[PINN反问题解材料缺陷]` 如果是在边界测量多组应力-应变数据对，用于推断内部缺陷，则设定与 EIT 很像，正问题是内部几何参数到边界上响应算子的映射
	* 相关问题：不是用电流而是用电磁波做探测 `2022-04-22`(CSImeet2)
		* 相应正问题从椭圆方程变成双曲方程，且探测信号、接收信号均可含时
* `[Ying]-EIT-DL`: #EIT (#DtN_map), #NN, #PDE (#Cartesian_grid), #theory-guided_NN, #PDE/#inverse_problem
	* 概述——EIT 问题：PDE 系数 $\eta(x)$ 下有 DtN map $\Lambda$，双向推断（从一个推断另一个，正反问题都处理）；方法：有监督训练网络，正反问题网络的设计均使用理论推导得到的大致形式，
	> 2020-12-26 讨论的方法 1 类似，只是
	> 1. 这里需要先多组边界取值来估计出 DtN map 的 kernel $\lambda$ 再输入网络，原设定是只有一组边界取值，从而很难估计 DtN map
	> 1. 似乎不能处理 $k^2$ 而只涉及椭圆算子，因为 $\gamma>0$ 只能对应正的 $\eta=\Delta\sqrt\gamma/\sqrt\gamma$
	> 1. 讨论的问题设定中，输入信号仅加在部分边界，而检测在整个边界，这里都在整个边界；且这里是施加 D 边界检测 N 边界，刚好反过来  
	> 不过这里的正问题也是可微的，与讨论的方法 2 类似
	* "Solving electrical impedance tomography with deep learning"
	* eqn(1.2) PDE 参数 $\eta\in F(\Omega)$ 下有 DtN map $H^{1/2}(\partial\Omega)\to H^{-1/2}(\partial\Omega)$, $u|(\partial\Omega)\mapsto\frac{\partial u}{\partial n}(\partial\Omega)$
		> $u$ 电势，其梯度乘电导率表示电流密度，这里因为是转化后的 PDE 所以没有电导率
		* 设该 DtN map 由 kernel $\lambda_\eta\in F(\partial\Omega\times\partial\Omega)$ 给出（Green 函数推导）；取定基准 $\eta_0$ 只考察 kernel 改变 $\mu=\lambda_\eta-\lambda_0$，使用摄动分析；
			> 由表达式，DtN map 为 self-adjoint map,从而 $\eta(r,s)=\eta(s,r)$，使用 $m\pm h$ 重新参数化时只需 $h\ge 0$
		> $\eta$ 未知，而 DtN map 应该可以实验测量逐点取值，从而可以认为 $\lambda_\eta$ 可观测；
		* eqn(3.2) 改用中点相对位置参数化写为 $\mu(m,h)$
		> 中点相对位置参数化也许不一定适合处理这里的周期 BC on $x$；文中似乎也没有说这种参数化的好处；
		> 似乎中点参数化的自变量范围应该为 $h>m,h<1-m$，其他部分由周期延拓得到而不是独立任取；实验使用矩形区域，应该是认为重复的区域和缺失的区域都不重要（取值接近 0）
		* eqn(1.1) 的 PDE 可以转化为这一形式
		* 问题种类，one-sided 指 $\partial\Omega$ 的两个连通分支中的一个固定为 Dirichlet BC，只有另一侧有电极
	* 使用理论推导得出合理的近似（平移对称性化简形式，Chebyshev 插值），其后再使用 NN 表达
	* sec3.1 $K:\eta\mapsto\mu$ 正问题，kernel $k$
		* eqn(3.6) $k*\eta$ 其实是 correlation，含义为 $\int k(x-m)\eta(x)\,\mathrm{d}x$
			> 这里 support 条件是认为边界附近不会出现变化
		* eqn(3.7) 使用插值格式离散化，给定 $m$ 视为关于 $(z,h)$ 二元待插值函数，两个维度分别有插值点和插值基底函数
		> 发现二维插值和无穷维 truncated SVD 有些类似，只是没有正交性约束（很难保证不同插值点对应的基底是正交的），且似乎仅针对这里有卷积核形式的情形
		* fig2 问题求解框架示意图，来自 eqn(3.8) 的离散化；sec3.3.0:-1 two-sided 版本作为 4 个独立的 forward problem
			> 同 inverse problem，two-sided 事实上只有两组独立的参数，即两个 BCR-Net
		> 这里正问题的求解似乎是可微的，可以考虑用优化算法求解反问题，当然应该比下方给出的直接预测要慢
	* sec3.2 反问题，其中 $K^\mathrm{T}$ 结构与之前的 sec3.1 $K$ 类似（实现时 channel 数可以不一样 fig6）
		> 这里应该就是 EIT 问题所需要的 $\mu\mapsto\eta$ 推断材料内部情况的方式
		* sec3.2:1 视为无穷维向量；注意 $\eta$ 输入为单个 2 维量（点），$\mu$ 输入为两个一维量（分别 点+向量）
		* fig3 问题求解框架示意图，考虑两个边界 (two-sided) 的问题版本见 fig4
			* sec3.3.1:-1 fig4 BCR-Net 应该有两种，即部分 share weights，因为 sec3.3.1:1 对应两种 $K$）
			> encoding 部分应该也一致，当然这里没有可训练参数
			* sec3.3.1:-2 fig4 中为提升效果加入了 conv1d 部分；使用 concat 也是自然的做法
			> conv1d 的加入可能只是实验得到的经验选择
	> BCR-Net 第一次引用位置引用错误，应该是 [21] 而非 [10]
	* `BCR-Net-[21]+-[Ying]-EIT-DL`: (wavelet) multiscale NN, pseudo-differential operator, integral operator
		* 线性情形目标：eqn(2.24) 计算积分算子 $u(x)=\int a(x,y)v(y)\,\mathrm{d}y$；
		> 包括卷积运算
		* 线性情形传统做法见 fig2，利用 $v$ 小波分解，在最低频 $A$ 尺寸小可以直接计算，随后逐步加入 $v$ 小波的高频分量得到完整 $u$
			> 作为函数离散化的理解，将函数用小波基底展开，同频率的小波成分组成的子空间上有相应的算子 $A$ 的限制，认为它是“局部”的（离散模型中表现为稀疏性）；
			> 架构与 U-Net 有些相似
		* 线性情形 NN 做法，小波分解与重建改为使用卷积，alg3 最低频分量使用全连接，高频分量使用 locally-connected（作为 CNN 推广），均为线性激活函数
		* 非线性情形目标：eqn(4.1) 非线性算子，要求 $u$ 的 singularity 全部来自 $v$，作为拟微分算子的非线性推广
		* BCR-Net 针对非线性情形，fig4 加入高频分量的过程改使用非线性 NN；
			* alg4 除了卷积均改用非线性激活函数
	* 实验：数据生成 p9:2 随机生成 $\eta$ 并用数值算法求解 $\mu$，forward 与 inverse map 分别输入一个预测另一个，relative L2 loss 直接相加作为整体 loss
		> 注意不同于实际情形，实际可拿到的是几个 $(u|\partial\Omega,\frac{\partial u}{\partial n}|\partial\Omega)$ 数据对，用它估计 $\mu$，这里直接假设能够直接拿到精确的 $\mu$ 来预测 $\eta$；
		> 小量近似下 eqn(2.6) $\eta,\mu$ 为线性关系，使用时可以类似 Meta-MgNet 测试一样，把单次预测的残差（通过反向的那个网络得到）再次输入网络来修正解，在两个网络偏离真实不太远的时候应该可以迭代减小误差
		* $\eta$（相当于未转化版本的 $\sigma$）的光滑（sec3.4.1）和间断 shape detection（sec3.4.2）情形
		* p10:1 对于 one-sided detection，较深处对 $\eta$ 的恢复是病态的反问题，two-sided detection 则正常工作
		* p12:1 noise 添加到 $\mu$ 上
	* > date: 2021-01-23
		* 导师认为 $(K^\mathrm{T}K+\epsilon I)^{-1}$ 使用 CNN 是本文最值得三思的地方之一，如果是他就使用 $K^\mathrm{T}+K^\mathrm{T}KK^\mathrm{T}+K^\mathrm{T}KK^\mathrm{T}KK^\mathrm{T}+\cdots$ 类似的展开，即继续使用机理指导网络设计
		* 要表达 $K^\mathrm{T}$，重新训练了一个架构相同的网络，“$K,K^\mathrm{T}$ 具有类似网络形式”对于 $K$ 非线性的（即不进行摄动近似）情形不再成立，BCR-Net 的非线性表达能力没有用在有合适理论的地方，如果是导师自己则会使用定义 $\min\|\langle K\eta,\mu\rangle-\langle\eta,K^\mathrm{T}\mu\rangle\|^2$ 来训练 $K^\mathrm{T}$
		* 估计他们的思路其实是倒过来的，先考察优化问题 $\min_\eta\|K\eta-\lambda\|+\epsilon\|\eta\|$，改写为 $(K^\mathrm{T}K+\epsilon I)^{-1}K^\mathrm{T}\lambda$ 形式，难点在于 $K^\mathrm{T}$ 的网络结构设计，因此理论推导 $K$ 网络应该具有的形式，进而线性算子转置的网络形式应该类似
		* Lexing 他们的风格喜欢这种 theory-guided 的架构，试图把原来的多尺度等的理论给出 NN 的版本
	* 相关：`2022-12-07`(dbGrpMeet2) 用 VAE 来解此反问题，并提出数据集构建方法（用 CT 数据处理获得）
		* 不确定 2204.02441 考虑的 CDII 问题和 EIT 是什么关系；形式有点像，相关工作也提到 EIT
* `Beltrami-net`: #nonlinear_Fourier_Transform
	* "Beltrami-net: domain-independent deep D-bar learning for absolute imaging with electrical impedance tomography (a-EIT)"
	* sec2.1.1 正问题
	* sec2.1.2 反问题，先传统方法（D-bar, 涉及非线性 FT）重建 $\sigma^\text{DB}$：
		1. 使用 DN map $u|\partial\Omega\mapsto\sigma\frac{\partial u}{\partial n}|\partial\omega$ 的积分 eqn(8) 得到 "nonlinear Fourier data" $t^\text{exp}$ (see `DeepD-bar+-BeltramiNet-1711.03180` eqn(4))
		2. 使用它作为系数，用 eqn(6) 求解 $z$-参数化 ODE："Schrodinger $\bar\partial_k$ eqn" 得到 $m_n(z,k)$
		3. $\sigma^\text{DB}=m_n(z,0)^2$
		> 使用积分，故实验数据可以看做积分的 MC 采样；由于实验的电极能够控制，事实上可以任意选用合适的积分离散化；
		> 理论没有看懂（应该是之前已有理论），找到的其 2 篇 ref 也没有看懂
	* （反问题）然后使用 U-Net 恢复细节 eqn(9)，认为 $G_\theta(\sigma^\text{DB})\approx\sigma$ 可以给出真解
		> 需要 uniform grid；前一部分传统方法没有参数不参与 BP
		* p6/19:-1 正问题用已有工作的架构，反问题加上 residual connection
	* abstract "boundary shape independent"
		> (?) 
	> 关于非线性 Fourier 变换 NFT：`2021-12-22`(GrpMeet) 针对 KdV、光纤等方程建立的 NFT 理论，与这里的纯直觉构造出来的方法不太一样
* `EIT_TMI`: #EIT, #CEE-CNN, #multiple-label
	* "Induced-Current Learning Method for Nonlinear Reconstructions in Electrical Impedance Tomography"
	* 问题：eqn(1-3) 给定电极电流条件（(N) BC，测试 $N_i$ 种不同的电流），用电压观测 $\mu|\partial\Omega$（(D) BC）求解内部电导率 $\sigma$
	* 方法导出：
		1. eqn(4) 用 $\sigma_0$ 对应的 Green's func 改写为积分方程，进而有梯度需要满足的方程 eqn(8)，
			> 可以认为 $G$ 已知，只要在 eqn(5) 中选取易于求解的 $\sigma_0$ 即可；
			> 似乎 (N) BC 下的 Green's func 为 $\nabla\Gamma$，其中 $G$ 为 (D) BC 下的 Green's func；不知道这里为什么不是只在边界积分而直接得到解
		1. 离散化 eqn(9,10)，向量形式 eqn(12)
	* 计算步骤：
		1. eqn(21-22) 根据边界电压（离散后为 $\bar V_p$）用 SVD 估计内部电流（离散后 $\bar J_p^+$）；理论依据 eqn(16)，由于变换矩阵不可逆，使用 SVD + 截断最大几个奇异值，只给出估计
		> 由于 $G$ 已知，$G_\partial$ 和 SVD 可以预先计算；使用 eqn(16) 这一必要不充分条件给出初始预测
		1. eqn(23) 计算 $\bar E_p^{t,+}$ 后，使用 fig2 "cascade end-to-end CNN" 输入 $\bar E_p^{t,+},\bar J_p^+$ 预测精确电流分布 $\bar J_p$
			> 可能是将 eqn(10,12) 视为迭代格式，认为迭代结果能够得到方程解，从而理论上认为 $\bar E_p^0,\bar J_p^+$ 的信息足以恢复出精确的 $\bar J_p$，计算时不再显式迭代而是用 NN 直接输出；似乎 $\bar J_p^+$ 用随机初始化原则上也可以收敛，用 SVD 计算只是为了加速；
			> (?) 但是 eqn(10) 里面 $\xi$ 也是未知的，迭代格式的理解未必正确！不知道为何 NN 输入提供的信息足以完全恢复 $\sigma$；也许只是构造了算子映射？
			> TODO: 原问题转化之后得到的等价（离散化）命题到底是什么？i.e. 如何判断什么样的 $J_p$ 是问题的解（eqn(16) 作为不同维数问题应该只能提供充分条件）
			* 为了 secIII.B.2):1 "guide the learning gradually", "reduces the nonlinearity"，CNN 使用多标签架构，即网络中间层也有对应标签和 loss；secIII.B.2):2 eqn(24) 标签选取逐步添加高频成分
			> 感觉有点像模拟迭代法的设计，一块 CNN 承担若干步迭代的作用，多块 CNN 模拟多步迭代；不过传统迭代法似乎会先获得高频成分，这里 label 先引入低频；
			> 是否预训练也能做到类似的事情
		1. 根据 $\bar J_p$ 利用 eqn(9,29) 得到 $\sigma$
		> (?) 哪里用到施加的电流 $J_q$ 了？
	* 两种传统思路在 secIII.A 有提及（注意与我们讨论的两种比较，顺序刚好相反）
		> TODO: 看有没有涉及 NN 的做法，讨论时可以展示；
		> 这里类似讨论的思路 1，即直接输出结果，不进行优化
* `TBE_EIT_CNN`
	* "Dominant-Current Deep Learning Scheme for Electrical Impedance Tomography"
	> 前一篇文章的前序工作，被分类为 optimization-based 方法；我认为是混合方法，优化得到粗结果后端到端修正
	* $N_\text{i}$ 种不同的电流条件给出各自的 $\sigma$（似乎由优化做法给出），将它们作为 U-Net 的各个输入通道，输出得到最终的 $N_\text{i}$ 个通道的 $\sigma$，取平均得到最终结果
	> TODO: 1. eqn(22-23) 的意思是，eqn(14,18) 足以决定 $J_p$？2. 哪里涉及 $J_q$ 条件的使用？
* `NIPS22ML4PS-92` EIT 简化问题（内部电场均已知），PINN 解电导率，所用正则化项预训练使用类似去噪 score 匹配的 loss
	* "Improved Training of Physics-informed Neural Networks using Energy-Based priors: A Study on Electrical Impedance Tomography"
		* 来源：`[NeurIPS2022-ML4phyWorkshop]`，No.92
		> created on 2023-01-02
	* 摘要：由于病态，PINN 求解对超参（如学习率）、不同损失项的相互作用敏感
	* 方程 $-\nabla\cdot(\sigma\nabla u)=0$，边界 $\sigma u_n=g$，$u=f$
	* 面向 EIT 简化版本，所谓 semi-inverse problem，给定 $u$ 在内部的测量值
		* 一般设定是给定 NtD map
		* 实际使用可先训 $u$ PINN 解正问题，之后才按这里框架训 $\sigma$ PINN
	* PDE loss 三项：内部 loss，有电极、无电极位置的 (N) BC loss（后者位置对应 $g=0$）
	* 需再引入对 $\sigma$ 的先验，这里用基于能量的模型 EBM $E_\phi(\sigma,\mu)$，$\mu$ 表示噪声大小
		* 用能量表达先验概率 $p(\sigma)=C\exp(-E)$
		* 其预训练 loss：$\|\partial_1E_\phi(\sigma+\mu z,\mu)-z/\mu\|^2$，对 $z\sim N(0,1)$、训练集中 $\sigma$、预选的几个噪声尺度 $\mu$ 求和或期望；{_n4sk8x}
		* （评）该网络可用于表达去噪映射，相关内容可参考 `2022-11-30`(dbGrpMeet2)
		* loss 中另有加权 $\mu^2$（> 对大噪声时准确度提高要求？）
		* 注意与标准 DSM（denoising score matching）略不同，那里直接用网络表示 score $S=-\partial_1E$，这里则表达的是能量 $E$
	* 最后解反问题用的 loss $\oplus L_k+\kappa E_\phi(\sigma,\mu)$，前者应为对观测数据对 $(g,u)$ 求和，$\kappa$ 为权重；{_n4sl0u}
* [EIT/DOT用数学结构设计NO](https://mp.weixin.qq.com/s/injaFV5avcmU9xAs3Y657g)
	* 反问题传统方法两类：优化方法，直接法（基于严格的数学理论对反问题中的逆算子构造显式逼近）
		* DL 方法分别对应 PINN 与 NO
	* 基于传统直接法 DSM（仅用一个 data pair 就能快速重构），提出 DDSM
		> data pair 指 DtN map 的一个采样点之类的东西？
		* 传统算法中对逆算子的逼近可视为特殊形式 CNN
		* 不将边界数据直接输入网络，而是基于 DSM 提供的数学结构，把边界数据做了某种调和延拓，得到定义在整个模型区域的数据函数 $\phi$，再由此搭建 CNN 去逼近算子
		* 好处：$N$ 个 data pair 可自然对应 $N$ 通道；调和延拓能抗边界数据噪音
		* 代价是内存占用变大（延拓后一维变二维）
	* 应用：2D EIT-2009.08024 ，3D DOT-2104.07703
		* 扩散光学层析成像 Diffuse Optical Tomography（DOT）
	* 报告的详细 slides 可下载
* `DeepEIT` EIT 中电导率场：DIP 先验 + TV 正则化
	* "DeepEIT: Deep Image Prior Enabled Electrical Impedance Tomography", TPAMI 2023
		> 2023-04-26 组会，lzn

#### Inverse Design
* `1912.01085`: #inverse_problem/#inverse_design/#PINN, #cloak
	* "Physics-informed neural networks for inverse problems in nano-optics and metamaterials"
	* 概述：使用 PINN 求解反问题（DeepXDE 方式），给定的观测为外部电场，求解的参数为内部介电系数的分布（在外部电场为自由波动时，这就是隐身 cloak 问题）
	* eqn(4) PINN loss 包括了有监督部分，应该是因为要用于反问题；secIII:2 没有包含边界 loss（> 可能是因为 Helmholtz 方程不需要 BC？）
		> 参数 $\epsilon(x,y)$ 为函数情形，是用 image 还是 NN 表达似乎没在文中看到；猜测是后者
	* secIII 应该是 DeepXDE 的反问题方式，根据观察到的散射场推断 eqn(3) Helmholtz eqn 的参数 $\epsilon$; FEM 验证（训练时有监督 loss 也涉及 FEM 模拟结果）
		* eg. fig2 似乎是 (a) $\epsilon$ ground-truth 下 (b) FEM 生成精确解（包括了材料圆盘内部；实际问题似乎不应该包括）(c) 用于 PINN 预测 $\epsilon$ 后，再 (d) FEM 给出这一预测下的精确解
		* p9/25:0 "effective homogenization"（等效的同质化介质？）, 原本的 $\epsilon$ 分片常数（小圆柱组成的材料），PINN 恢复的则是中间一块接近连续的情形
			> 看文中意思，给出同质化介质也许是理论预言的正常现象？
		* eqn(7) 使用传统理论估计 PINN 给出的解的匹配程度，以及之后直接根据 FEM 结果的判断
		* fig3 加强小圆柱的介电系数以后（超出传统理论预测能力），PINN 预测的结果不再同质化，但是出现负值区域；
			> 看 fig7 似乎负值也是确实允许的？根据知乎上看到的东西，物理上 metamaterial 可以达到负的宏观折射率，其微观组分为人工设计的线圈等
		* fig4 对于非均匀排列的圆柱材料同样适用；同样有负介电系数区域
		* eqn(9) 复值情形（？）
	* eqn(10) 界面电场切向导数连续；与 eqn(6) 的不同：这里的 $\epsilon,\mu$ 分片常数（如 fig5 里只有一个实数参数待求解），已知为不包括圆柱内部的散射场；
		> fig5(b) 图与说明不符，应该是放错了
		* fig6 带 coat 版本
		* fig7 为 eqn(6) 问题，ground-truth 分片常数但 PINN 按一般形式恢复；在场较强的左半区域恢复的 $\epsilon$ 相对准确不过较弱区域差别大一些，但得到的场是非常准确的
		* p17/25:0 没有添加边界条件！相当于找到了等价的介电系数场分布；相应的一些应用（？）
		> 应该是因为没有分开两个区域处理
	* cloak 问题，希望外场尽量接近不受干扰的普通正弦波，内部介电系数固定，可以改变 coat 的；eqn(12) 的理论用于长波长行为，此时 coat 常数即可，
		* fig8 PINN 预测对象应该也只是常介电系数，恢复已知的外场；
		* fig9 则允许介电系数场而固定磁导系数，现在波长与内部材料尺寸接近；p19/25:-1 物理上不可能完全不影响周围的场，但 PINN 学出的结果能够减小影响
	* 下面这一工作的笔记里有与本文的比较
* `2005.08832`: #inverse_problem/#inverse_design, #GAN, #surrogate
	* "S UCCESSIVE TRAINING OF A GENERATIVE ADVERSARIAL NETWORK FOR THE DESIGN OF AN OPTICAL CLOAK"
	* 概述——设计光学 cloak，只调整材料形状，即使用分片常数的介电系数，目标为极小化散射总能流密度；
		* 方法：GAN 表达参数空间的一个分布（而不是具体给出一组参数）；具体地，正问题（预测散射能流密度）使用 surrogate，维护一个“数据集”不断添加比较好的构型，使用一个 GAN 生成接近数据集、并且正问题 surrogate 较小的形状（即待设计参数），surrogate 选出确实好的加入“数据集”
	* 比较——与上面的 `1912.01085`：
		* 优化目标，上面为当前参数产生的场与观测的误差，从而可以处理一般反问题（隐身问题属于特殊形式），这里为物理推导的散射能流密度，是针对这一问题设计的
		* 物理设定，被隐藏对象在上面为给定介电系数的物体，这里为理想导体（fig1）；上面为求解 Helmholtz 方程，这里未知（可能为含时方程）
		* 参数空间（同样为物理设定），上面为一般的介电系数场，这里只允许分片常数、只能够优化形状
		* 监督：上面的 PINN 为无监督，这里正问题 surrogate 有监督，GAN 无监督但目标是接近已有数据集而不是 PDE loss
		* 局部极小问题：这里由于使用 GAN 生成，相当于训练一个参数空间的分布，有一定的 exploration 特性；上面的做法相当于针对特定初值连续优化（从实验结果展示中看似乎没有尝试多初值）
	* 比较——与 ISMO（见 AISC）：
		* 正问题 surrogate 使用相同的 adaptive 策略训练，ground-truth 使用精确数值求解器得到
		* surrogate 训练数据生成方式：ISMO 为对 surrogate 使用传统优化算法，这里为 GAN 生成结果；
			* 随机性来源，ISMO 为参数空间随机选取优化初值，这里为 GAN 隐空间的随机向量；
			* 与当前局部最优的差距：ISMO 很接近局部最优（仅优化算法的误差），这里为 GAN 生成故差距来源于 1. GAN 训练误差，2. GAN 生成器 loss 还包括拟合现有数据集的项，不完全按照 surrogate 来做；这里的做法也许会有更多的 exploration，尤其是如果 1000 个最优样本选取自 GAN 的训练过程的话
			* 保证接近局部最优的方式：ISMO 直接调整问题参数所在的参数空间直接保证，这里需要调整 GAN 内部参数所在的参数空间，为间接保证，相当于调整参数空间的分布的形式；这里保证的另一个方式为随机生成大量数据再从中挑选最好的几个
	* eqn(3) GAN 生成器 loss，为 discriminator loss 和 surrogate model loss 的线性组合
	* sec2.3 GAN 生成的问题参数中，surrogate 模型预测指标最好的 1000 个样本加入“数据集”（不是精确计算的指标），并用这些样本微调 surrogate
		> (?) 最好的 1000 个来自 GAN 训练过程（60 epochs 内）还是训练完成后？如果是前者则 exploration 性质不错
	* 11 次“feedback loop”（即调用精确求解器、增加数据集的过程），每次 GAN 训练 60 epochs
		* fig4 数据集增加以后 GAN 是“retrain”（> 而不是 fine-tune），forward model 也是（> 我觉得这里 fine-tune 没问题？）
	* fig5a 训练曲线能够说明 GAN 不完全是在拟合数据集（> ？）
	* > date: 2021-03-06
		* GAN 处理多对一的反问题，在 review 里有提及
		* 现在的设计针对特定波动的方向频率；可以试着写代码，看一看波动的方向频率、内部材料形状有微小改变时影响有多大
		* 如果是处理建筑地震保护的问题（内部振幅降到原来的 1/10 之类），可能有的地点波动方向频率是可以针对性设计的（根据周围地震带的情况），但是对于一般应用还差很远
* `s41566-020-0604-2`: #cloak, #real_experiment
	* "Deep-learning-enabled self-adaptive microwave cloak without human intervention"
	> TODO: summary, comparison tree, link
	* 实际制造出来的一个实验，传感器检测入射波、背景电磁场，调整超材料的控制电压参数以改变电磁参数，使得反射后的电磁场和背景接近；电压使用 NN 给出
	* 训练数据：使用 FDTD 生成 (入射波，材料电压$V(s)$) $\mapsto$ 反射的 $H(x)$，
		* NN 拟合的映射：(入射波，反射的 $H(x))\mapsto V(s)$ 
		* 实验使用 NN 的方式：(入射波，检测到的背景 $H(x))\mapsto V(s)$，从而可以让材料反射的 $H(x)$ 与背景接近
	* > date: 2021-03-12
		> 讲解的问题：应该先讲目的（反射波匹配背景波形）再讲做法（超材料和控制电压）
		* 这个东西实验上能够造出来还是挺让人意外的
		* NN 的训练方式有点特殊；有时可能是一对多的映射，一般情形要用 generator 来学
* cloak 备用：[流场（而非传统电磁场）中隐身，无需超材料](http://mp.weixin.qq.com/s?__biz=MzIwMjk1OTc2MA==&mid=2247522086&idx=3&sn=7e18337fd6a38b4fe1f494d2ca0d3c64)
* `1908.04851`: #inverse_design, #GAN/#WGAN, #generative/#conditioned/#CGAN
	* 概述：使用 CGAN，给定光学性质作为 condition，随机生成具有相应性质的 meta atom；训练数据随机对 meta atom 的设计进行采样并 FEM 计算其光学性质；
	* "Multifunctional Metasurface Design with a Generative Adversarial Network"
	* CGAN 的 condition 可以为 secS1:1 不同频率、偏振光照下的超原子目标振幅相位 这些物理性质；判别器判断这个超原子设计和给定物理性质是否符合
		> (?) generator 文中说使用 tanh 输出，但是这如何保证二值输出？此外 fig1a 为二值输出，而 figS1a 为连续输出，为啥？另外，figS1b discriminator 的 condition 是哪里输入的？
		* 训练数据 secS2 超原子设计（使用 3 矩形随机组合）$y\mapsto$ 物理性质 $x$
		> 相当于上一篇的一对多版本
		* p7/30 使用阶段 figS2 额外训练一个 surrogate “PNN”预测其物理性质（包括多个入射波长下的性质，精确模拟需要对不同波长分别模拟），以去掉生成结果中不合格的设计
		> 是否可以直接使用 surrogate 替代 discriminator？在 `acsphotonics.0c01481` 中确实是这样做的，不过是 VAE 版本
	* fig2 物理性质为振幅+相位，训练完成后的样例（仅一例不合格，此时用精确模拟而不是 PNN 计算），fig3 为构建“双焦点透镜”需要仪器平面上光的振幅相位满足分布，逐点的振幅相位输入 CGAN 得到该点超原子设计（不需要训练整个根据振幅相位分布生成所有超原子的网络）
	* fig4 对不同偏振有不同响应的设计要求；(e-h) 对某个偏振按相位渐变排列可以达到偏折光线效果；fig5 不同偏振有不同焦距的版本
	* secS3 WGAN 的 gradient-penalty 做法，discriminator 在数据某个分布内梯度 1，该分布介于当前生成器分布和数据分布之间，由于无法逐像素平均（材料制造中，某点只能有或者没有介质）改使用“几何插值”（> 即类似遗传算法基因重组的做法）
		* 回忆 WGAN：eqn(1) 中添加了对 $D$ 的梯度限制条件，此时优化目标正是 Wasserstein 距离，如果没有则退化到一般的 GAN，可能出现 discriminator 训练太好而 generator 梯度消失的问题
* `acsphotonics.0c01481`: #inverse_design, #generative/#conditioned/#CVAE
	* "Deep Learning Enabled Design of Complex Transmission Matrices for Universal Optical Components"
	* 概述：设计器件结构（2D 图像），3 输入 3 输出，使得电磁波重新分布
		* CVAE 结合 surrogate 生成
	* 器件目标功能例子：比如 123 通道输入的电磁波分别在 213 通道输出、单输入下两输出通道按比例输出、额外的输出相位要求
	* fig1a 先训练 surrogate 预测给定设计 $x$ 下的物理响应 $y$（这里是输出端电场强度）；adaptive 训练，生成器生成结果动态加入训练集
	* fig1b 生成器 CVAE 形态 $y\to z\to x$；原本可以使用 $x$ 之间的距离用于训练，p3/13:r-1 为了处理一对多情形利用 surrogate 使用 $y$ 距离训练
		> 这样也不涉及两个 $x$ 的距离，而后者不好给出一个合理的定义；A-CVAE 文章（见 `freeNotes.md`）基于另一版本 VAE，decode 生成结果视为逐元素概率分布，使用交叉熵定义距离
		* 评注见 `freeNotes.md` CVAE 部分
* `acvae`: #inverse_design, #generative/#conditioned/#CVAE
	* "Generative Deep Learning Model for Inverse Design of Integrated Nanophotonic Devices"
	> TODO: summary, comparison tree, link
	* （我的一般记号下）CVAE $p(x\mid y,z)$ 版本；为了确保 $y,z$ 独立，额外引入 adversarial 模块试图从 $z$ 中恢复 $y$，网络需要尽量阻止它恢复；效果见 fig4
	* active learning：
		* 开始使用随机生成的 01 离散数据输入，$p(x\mid y,z)$ 概率模型为分类（网络输出解读为像素取 01 的各自概率；类似 cross-entropy loss），eqn(4)
		* 随后使用生成器给出的、各像素连续取值的数据输入，$p(x\mid y,z)$ 概率模型为 Gaussian（网络输出解读为像素的期望值，L2 loss），eqn(5)
	* eqn(3) FOM 其实就是设计目标（condition $y$）的误差定义，对波长积分
	* fig6 展示泛化能力，训练集最优的样本并不理想，但是模型设计结果不错

## Scanned
* `snakePhase-1706.08111`, "Discriminative Cooperative Networks for Detecting Phase Transitions"
	* CV 中图像分割传统方法 snake：画参数化曲线，不断变形至边界上，变形依据是能量梯度，外部能量在图像梯度大（边界）的地方小，内部能量分为一阶项（长度，拉长的弹性能量）二阶项（曲率，弯折的刚性能量）{_n95j2f}
	* 这里试图用这一方法找出相变发生区域；细节未 check
	* 底层物理状态 $\lambda$ 不能直接观测，观测直接得到的是 $d(\lambda)$，希望学出的网络 $\mathcal{N}(d)$ 能与 $\mathcal{G}(\lambda)$ 相符
* `1806.07655` (fig6-9 to check)
* "Visualization of the Dynamics Effect: Projection of on-the-Fly Trajectories to the Subspace Spanned by the Static Reaction Path Network": unsupervised
	* oCMDS (out-of-sample classical MDS), 两类样本（固定的参考点和动态生成的点？）分别 $n,m$ 个，平移预处理仅使前一种样本平均 0；$B$ 能恢复出两类样本的内积
	* 前序工作 `acs.jctc.8b00176`, [doi](http://dx.doi.org/10.1021/acs.jctc.8b00176)
* `CGSchNet-2007.11412`: #CG (#coarse_graining), #MD (#molecular_dynamics), #GNN:SchNet
	* "Coarse Graining Molecular Dynamics with Graph Neural Networks"
	* 前序工作 CGnet，问题：CG 粗粒化求解 MD 问题降低成本，用 CG 能量面得出；这里用 SchNet（作为 GNN 方法）求能量面
	* 理论上 CG 势能（坐标归约为 $r\leadsto x=\Xi r$）：$V(r)\leadsto p^\text{atom}(r)\leadsto p^\text{CG}(x)\leadsto U(x)$，概率均按 Boltzmann 分布，中间是求概率边际分布
		* 有时 CG 做法为只保留若干中间位置的“重原子”，此时 $\Xi$ 只含 0，1 项
	* ML 方法拟合 CG 势能则单纯训练，用受力的 CG 结果 $\Xi\nabla V=\Xi F^\text{data}$（只涉及梯度 $\nabla U$ 项，而真实值没有 ground truth，理想训练结果也是差常数）
	* 为体现平移旋转对称性，$x$ 换为 feature $f_i$；CGnet 为手动，这里用了 SchNet 的学习 feature 方法
	* sec.III.3 需要引入先验（否则有大误差），手动设计先验
	* 根据 $U(x)$ 生成轨迹，Langevin dynamics sec.III.7
	> (?) Appendix.D "MSM" 使用了 Markov 过程，含义暂时没搞清楚，应该不是 surface hopping
* `review-ML-MD-analyze+simul`: #review, #MD_analyze+simulation, #unsupervised
	* "Machine learning approaches for analyzing and enhancing molecular dynamics simulations"
	* 话题：First, how to make the deluge of data generated in running even a microsecond long MD simulation human *comprehensible*（结果分析）. Second, how to efficiently *sample* the underlying free energy surface and kinetics. 
	* 分析部分 eqn(2) TAE (Time-lagged AE) 使得 decode 之后为 $\tau$ 之后的位形；其 VAE 版本为 VDE (Variational dynamic encoder)
* `2003.00868`: #MD_simulation, #CG (#coarse_graining), #GNN (#SchNet), #control
	* "Differentiable Molecular Simulations for Control and Learning"
	* MD 可以对 input 求导，从而便于求解控制问题
* `OnsagerNet-2009.02327`: #learn_dynamics
	* "OnsagerNet: Learning Stable and Interpretable Dynamics using a Generalized Onsager Principle"
	* Onsager Principle: $M\frac{\mathrm{d}h}{\mathrm{d}t}=-\nabla V(h)$; generalized version here: $(M(h)+W(h))\frac{\mathrm{d}h}{\mathrm{d}t}=-\nabla V(h)+g(h)$, $M$ sym, $W$ antisym
	* learnt from data
	* sec.A classical dynamics eg: Hamiltonian system, deterministic damped Langevin dynamics, dynamics described by generalized Poisson brackets $F_t=\{F,H\}-\frac{\partial H}{\partial (q,p)}M\left(\frac{\partial H}{\partial (q,p)}\right)^\mathrm{T}$
	* sec.B model reduction, const $M,W$ for $u\in\R^N$, reduced to $\tilde M(h),\tilde W(h)$ for $h\in\R^d$, using $u(h)$
* `POD-PC_dyn`: #random_dynamic_system, #POD, #PCE (#polynomial_chaos_expansion)
	* Random dynamical system in time domain: A POD-PC model
	* (?) 用 $\xi$ 表示 uncertainty 背后的控制变量？result1 里似乎是给定此变量后求解（table 1），不是 notation 里说的 random vector
	* notation: 注意 $\Xi,\bm{\Xi}$ 区别，后者的一行为前者；$x(t,\Xi)\in\R$
	* eqn(5,6): 基底（优先 concat 相应角标，视为一族向量，已知）、系数（一族标量，待确定），其中一个依赖 $t$（标量）另一个依赖 $\xi$（向量），这里是两种对应的方式
		* PCE 基底用正交多项式（各分量正交多项式乘积），POD 基底用 SVD 找
		* POD-PC model 试图给出两种模型关于 $\xi$ 依赖方式的关系 eqn(12)
	* result1, 之前工作用显式求解器给出数据（这里没有给出方程），关心加速度
* `t+Persistent_Model_Order_Reduction_for_Complex_Dynamical_Systems_Us.pdf`: #POD, #SOD (#smooth_orthogonal_decomposition)
	* "Persistent Model Order Reduction for Complex Dynamical Systems Using Smooth Orthogonal Decomposition" (2017)
	* sec2.1 $Y$ 为位形空间的 snapshots, POD 基底 $\phi_k$ 为其右奇异向量（SVD）, SOD eqn(5) 广义特征值问题
		> motivation of SOD? eqn(5) 前的说法什么意思
* `2003.13735`: #POD, #PDE
	* "Model Reduction for Advection Dominated Hyperbolic Problems in an ALE Framework: Offline and Online Phases"
	* preliminaries, POD 基底选取，sec2.1.1 贪心算法，动态添加基底元素
		> 有点像是试图最小化降维的 $L^\infty$ error, recall PCA $L^2$
* `1812.01522`: #phase_transition, 
	* Ising 模型学状态到温度的预测映射，训好后从网络权重可发现相变位置
	* "Phase transition encoded in neural network"
	* 训练一个 NN，输入 $L\times L$ 网格上的构象，输出温度预测（分类问题，设定若干温度刻度）
		> 我猜是 CNN 但文中没说，并且也没强调为何用分类而不用回归网络
		* 由于不同温度对应的概率分布有重叠，训练误差有下界
		> 也许可以改用随机输出的网络，输出各分类概率或者回归问题结果分布，相当于 UQ
	* 训练完成之后，统计最后一层各温度刻度对应的参数权重的平均值，发现相变现象，关键温度下均值变化大
		> 如果改用回归网络，也许可以统计输入数据之后的 activation？

#### reviews
* `review-ML+chem`: #review
	* "Big-Data Science in Porous Materials: Materials Genomics and Machine Learning"
	* TODO: 
		1. 先决定讲什么，review 内容一次肯定讲不完（更别说相关 ref），不急着把它看完
		1. 看 TDA x3
		1. 材料机理+数据的一篇查 ref
		1. 各引文删除之前重要批注搬运进来
		1. 看非监督一篇，目前认为无机理但有识别“模式”的机制；(可能本次暂时不看，先看能推进探索方向的，扩大探索范围而非深度)
		1. 搜索 p5: t-SNE 等，然后看其 ref
		1. 待检查章节（并查找相关 ref）：8, 9.5, 10.3
		1. 最后浏览所有小标题
	* ref[85]: theory-guided
		* "Theory-Guided Machine Learning in Materials Science"
		* 似乎只讲了没有 theory 会导致不理想结果，没说怎么使用 theory? 
* `review-embDomKnowML-Material`: #review, #HML (#hierarchical_ML), #theory-guided, #material
	* "Embedding domain knowledge for machine learning of complex material systems"
	* 数据量小的时候，为了准确度需要领域知识；并且也可以提高可解释性
	* 这里 review 引入 domain knowledge 的四种形式：
	1. physicochemical properties；相当于不是输入观测数据，而是根据知识先计算一些量，再作为 ML 模型的输入
	1. similarity
	1. system properties 如守恒量
	1. physical equations
* `2003.04919`: #theory-guided_ML, #physics, #review
	* "Integrating Physics-Based Modeling With Machine Learning: A Survey"
	* physics-ML methods: 
		* table2 各种方法的 requirements, possible benefits 汇总
	1. physics-guided loss
		* 需要物理关系已知（物理定律、PDE）
		* 好处：物理符合程度、精度、泛化、减少观测数据需求
	1. {physics-guided initialization}（相当于使用相似的、有解析表达式的物理模型预训练）
		> 指先在模拟数据上训练，再迁移到真实数据上 #simulation-assisted ？
		* 训练阶段需要机理模型提供的合成数据
		* 好处：精度、减少观测数据需求
	1. physics-guided architecture
		* 引入中间物理变量
		* 编码不变量、对称性
			> HNN (Hamiltonian NN) 应该属于这一类
		* 引入其他领域知识（> 后面的高斯过程引入应该也属于这一类？）
		* 多任务学习，引入辅助任务
		* 需要 intermediate 的物理变量/过程、hard constraint（如对称性）、informed prior distributions
		* 好处：可解释性、物理符合程度、精度、泛化、减少观测数据需求
	1. residual modeling
	1. hybrid physics-ML model
		* 在推断阶段需要可用的机理模型
		* 好处：精度
	* table3 相关工作列表，用上述方法处理 降阶建模、解 PDE、反向建模、数据生成、UQ 等问题
* `G.E.Karniadakis2021`: #review, #theory-guided_ML
	* "Physics-informed machine learning"
	* sec:"current limitations" 一节讲了 PINN 的一些挑战
* `2109.05237` "Physics-based Deep Learning"（备用）
	> created on 2022-01-20
	* secVI 看起来在处理 UQ 问题，包括 BNN 和 dropout
* [PIML-2203.16797](https://mp.weixin.qq.com/s/UWwQnOv0GuYWkNsudKc9SA) （备用）
	* "When Physics Meets Machine Learning: A Survey of Physics-Informed Machine Learning"

## Comparisons
> 所有 Comparisons 出现的文件位置汇总于 `compTree.md`
* `ML2phy%` 学习出物理模型：{n3bh3b}
	* 相关关键词：system identification
	* 相关：((n3bh3h))AI for science，((nca97g))DL 中可解释性
		* 同样机理未知，但目标不是学机理、仅考虑预测的见((p3rb0r))NO优势-机理不清
	* 分类比较标准
		* 找的目标对象（下方主要在展开此分类；可混合，例如找其他目标对象时可用上符号回归）
			* 若目标为表达映射或动力学，则必须为符号回归（否则为普通 NN/NO 问题）
			* 其他目标允许用 NN 表达，而符号表达可选
		* 输入的形式，除有限维外，还可为无穷维函数
			* 此时可涉及间接观测的导数项，获得方式((n23j97))
		* 输入另有多体问题（不定个数）、graph 之类的复杂形式，如 `2006.11287` 
			* 多体问题可同时涉及共性（如引力表达式）与个性（如各天体质量）的学习，如 `[2202.02306]`
			* 注：许多工作汇总于 `ML2phy%`“动力学的符号回归”
		* 输入的变量类型：直接可观测量；间接可观测量（如微分方程的导数项）；隐变量（有例子吗？）
		* 找符号表达的方法：
			* 直接处理数据，可利用数据中的某些性质，如 AI-Feynman 用对称性
			* 先用 NN 给出目标映射的黑箱表达，再对该映射符号回归获得
				* eg. `SNN4sym-2003.04299`, `2006.11287`, `2201.12354`
			* 用可解释（physics-informed）架构的 NN 拟合数据，且拟合结果易转化为符号表达；{ncaa6u}
				* 预测、找符号表达合并为同一学习问题
				* eg. `PDE-Net`（2.0），`PeRCNN-2106.04781`
				* 相关：((n2cf54))ML 中引入符号机理
		* 所提取物理模型（符号表达为主，但也不局限于此）的后续用途包括：
			* 可解释性，用于风险敏感等场合
			* 提升 OoD 泛化能力，如 `2006.11287`
		* 挑战见 `2021-11-03`(lectures)“挑战”，UQ、多尺度、实际应用、观测不完整、刻画随机方程等
	* 映射的符号回归（有限维输入则为函数，场输入则为算子）
		* 直接找符号拟合：遗传算法、RL 等
			* 基于遗传算法((_o58a20)) Eureka、GPLearn、PySR
				* 已有软件包，例如 `2006.11287` 所用的包依据遗传算法给出符号回归
			* 基于 RL
				* `2021-11-03`(lectures) “RL” 使用 RL 自动选择 parsing tree 生长方式
				* 备用：[Φ-SO-2303.03192](https://zhuanlan.zhihu.com/p/614077707) 也用到 RL
			* 用 MCTS 搜表达式树的做法((n23k14))似可用于一般符号回归
		* 基于（可解释的）NN，或算间接拟合
			* ((_o58a21)) EQL、OccamNet
			* `2006.11287` 多体问题（输入维数有限但可变；有置换不变性）GNN 拟合再对其内部结构符号回归
				* 给出了真正的新发现（暗物质新公式）
				* GNN（较普通 NN）结构有多组分，拟合时某种意义上将原映射拆为 $f\circ g$
					* 这种拆分可视为粗略的机理提取，使后续进一步提取（符号回归）难度降低
					* 对 $f,g$ 分别符号回归比直接对 $f\circ g$ 符号回归容易
			* KAN((_o58a2i))，利用其特殊网络架构实现可解释：带稀疏要求训练、剪枝，从而将目标函数表达为一元样条函数的复杂复合运算
				* 各一元样条函数可进一步找相应符号表达式
		* 物理启发((_o58a12)) AI Feynman
			* AI-Feynman(AISCmeet) 利用量纲分析、NN 数据增广、平移不变性、变量可分离等辅助
				* 2.0 版还考虑了概率分布变换的符号表达，将正态分布变换为数据分布的方式，类似正则化流
		* 间接（可解释 NN）方法相比直接（纯符号）方法的特点比较
			* 间接方法用连续优化而非离散优化，结果更连续、有可解释的中间结果；直接方法返回仅成功、失败二态((_o58a4h))
			* 间接方法可对网络做 surgery 等((_o58a4i))，有人工控制权
			* 直接方法需要预设特殊函数全集，可能遗漏 Bessel 函数等实际上需要用到的函数，而间接方法此阶段可数值拟合该特殊函数((_o58a4q))
		* LLM 接收文本形式数据猜表达式，优化得系数后残差反馈给 LLM((_obha4a))，很简单粗暴
		* 备用：2204.02704 数据噪声增加到什么程度后不可能学出符号表达式
			* Ensemble-SINDy-2111.10992，low-data high-noise limit 下的 robust 稀疏模型发现，涉及 active-learning 和控制问题
	* {动力学的符号回归}
		* 有限维输入，ODE
			* 注：多体 ODE 相关讨论见((n23j97))
			* `2021-11-03`(lectures)“2105.02368”从带噪声数据恢复混沌 ODE 形式
				* “从视频测量数据直接输出动力学表达式”
			* `2205.10965` ODE 分常态、边界层两时间尺度，区分后分别 SINDy 找表达式
			* （高维 ODE，给定离散的 PDE）可先降维至低维 ODE 再符号拟合；{n23k0b}
				* 如 `2205.10965`（高维 ODE；提到更高维可随机算法/压缩分解），`Heide2022LowON`（PDE）
			* `2006.11287`, `[2202.02306]` 多体问题动力学表达（算 ODE，原则上维数可变）视作时间推进的 NO，同上方（映射）
			* `[NeuralDE综述-2202.02435]`“动力学系统的符号回归”
			* `SPL-MCTS` 使用 MC 树搜索找表达式树，搜索树的一顶点为一表达式树，MCTS 模拟步为演化 ODE 并与数据比较；{n23k14}
				* 相关：((nas97p))非科研-序列、树、图-嵌套结构
			* `PROSE-2309.16816` Transformer 输入 ODE 前几个时间步 + 大致符号表达式（均可能有噪音），直接输出预测的后续时间步 + 更准确的符号表达式；{nbih0h}
				* 相关框架((nbig72))方程形式作为网络输入
		* 场输入，PDE；{nbig7l}
			* 注：PDE 场导数项计算的讨论见((n23j97))，包括 FD、NN 先拟合再算导数等
			* `PDE-Net`2.0, `PeRCNN-2106.04781` 用可解释架构的 NO 直接给出含时 PDE 形式
			* `[SGA-PDE-2106.11927]` 遗传算法生成二叉树森林表达方程形式（无需先验方程形式假设/线性字典）{n9hm6a}
				* 相关：((n9hm6g))生成随机表达式
			* 不规则观测点的数据恢复含时 PDE 形式
				* 涉及((n23j97))PDE identification-用散点观测算导数
				* `2021-11-03`(lectures)“2005.03448” 考察基本“表达式库”的线性组合，希望获得稀疏解；用 NN 先拟合数据以提供空间导数项，再对 NN 结果做符号回归（实现时为 3 loss 同步优化）
				* `2201.12354` 类似，从低分辨率带噪声数据中恢复含时 PDE，先 NO 拟合再符号稀疏回归
			* 各 PDE 项系数也为场（而非简单常数）：`GP-IDENT-2304.05543`，只考虑均匀网格观测
				* 可理解为 右端项关于 $u,u_x,\dots,$ 为符号表达式，关于 $(t,x)$ 为一般函数表征（这里用基底）
				* PDE-Net 1 其实也处理空间依赖情形，只是时间推进全部由黑箱 $f(t,x,u,u_x,\dots,)$ 给出
			* 相关：部分工作将给定离散的 PDE 降维成 ODE 再符号拟合((n23k0b))，不确定用处大小
			* 相关：((nbig7t))NO 网络的输入也是场，只是输出不同（场而非 PDE 符号表达式）
			* 备用：2505.16549 希望使方法与坐标、维数无关，利用外微分形式，若场变量为 f,g，NN 输入 $f;g;\langle df,dg\rangle;*d*df$ 等标量，输出 $f_t;g_t$；未确认细节
			* 符号回归用于其他目的：((p6bf2u))含时 PDE 降低自回归 NO 误差累积
	* 相关：((o4gg9v))符号表达式的误差计算
	* 相关：ML 与符号表达式；{nbig90}
		* ((nbig72))方程形式作为网络输入，((n2cf54))数据不足解决-引入先验-符号机理
		* ML 用于符号计算：{n8v95j}
			* ((_n8v960))不定积分、ODE 解析解，基于 seq2seq（见((n8v96k))序列数据的可能含义）；{n8ve1f}
			* `1912.05752` 针对不定积分
			* 找给定表达式 ODE 的 Lyapunov 函数表达式((_oaie7y))
			* 相关：数据生成可考虑((oaie9v))正反向同时生成、使用
		* 相关：((n9hm6g))生成随机表达式
		* 相关：((nasa1c))非科研-逻辑对象等价表达形式-序列、树、图-数学符号表达式
	* 从动力系统观测数据中{找守恒律}（2021-12-01 组会我讲的），包括 NN/符号表达的版本；{o5pg31}
		* `SNN4sym-2003.04299` 数据含多轨道，学分类网络来间接（逐个）拟合守恒量，再对 NN 符号回归
		* `ConserveNet-2102.04008` 单轨道数据，NN （逐个）表达守恒量（控制类内方差小、加噪声方差大）再符号回归
		* `AI-Poincare-2011.04698` 先估计守恒量总数，流形学习分析轨迹流形的维数
			* [PRL后续工作介绍](https://mp.weixin.qq.com/s/29z_y5jQbbi_C5SkI68B7w)
		* `PhysRevE.103.033303` 先找对称性变换再找相应守恒量表达式
		* `2208.14995` 计算轨道间 Wasserstein 距离后流形学习等，可用于含时 PDE 系统数据
		* 相关，搜索含守恒量的新的 PDE 形式，((_o5pg2x))OptPDE
		* 相关话题：含参动力系统，升维后成为不含参系统，恢复参数的反问题变成守恒量发掘问题 ((n35e96))paramDynConserv；守恒量可用于分解任务而帮助时间演化预测
		* 相关：((nca99w))NO 架构设计保守恒律
		* 可能用途：判断新解好坏，见((p98a8j))评估算法输出好坏-用辅助网络-纯数据训-输出应满足的机理性质
	* 方程中未知项给出 NN 表示；{pcfj4q}
		* 找 Hamilton 量、耗散项的可见 `phyGuidedDyn:`
			* 目前多用于提高预测精度的下游任务；原则上也可对拟合结果做符号回归以进一步提取物理规律
		* ((_pcfj4i))用于天文学中 AI 发现新物理，通过学出该 NN 后分析其性质
		* 相关框架：资源（此处为观测数据）一般化后见((pcfj5p))方程项由 NN 表示
	* 提取对系统性质的描述（定性为主）
		* 多状态划分
			* 手段—识别新物理量：((_q6j836))液态水二组分假说，无监督算法划分方案明显优于人类
			* 手段—同ansatz拟合好坏：`2205.10965` 根据动力学（可多体）数据，从极限环中划分不同时间尺度部分（通过符号回归后找拟合差的区段），可分析该划分如何被系统改变（如引入另一种动力学的分量）影响
		* 多主体相互作用模式：`AgentNet-2001.02539` 复杂系统底层机理提取，用 GNN 注意力表达；{ncaa6c}
			* 相关：((n3gm7a))注意力机制
		* 现象学规律发现：SciNet 据说从数据中学出了 Kepler 三定律（是否算模式识别？）
		* 找守恒量，通过找对称性：`PhysRevE.103.033303` 为找守恒量表达式，先找了保对称性的变换，相当于找对称性
		* 熵产量检测：`NEEP-2003.04166` 学映射以给出马氏链两状态转移的熵产生量，只需用时序数据无监督训练，`CNEEP-2106.15108` 在用视频数据时进一步识别熵产生位置
		* 非守恒性识别：`NNPhD-2106.00026` 近似守恒系统中提取非守恒部分
		* 非理想观测推理想系统：`Huang2022ExtractingCE`（非 ML）观测的系统带源项，希望提取无源项时的系统 Lagrangian 形式（包括符号表达）
	* 提取可描述多系统的统一理论（Hamilton/Lagrange），((_p4kg5e))MASS
	* 相关：提取因果关系 `2106.12430`, `DYNOTEARS-2002.00498`
		* `Auto-SDE-2205.04151` ML 辅助找双时间尺度 SDE 不变流形，从而可约简得慢尺度 SDE
* theory-guided ML；{nca995}
	* 注：本条目基本废弃，新内容汇总至((n3ag7c))ML 引入物理先验（phy in NN），或反过来的((nckl0b))NN in phy
	* 其实现在觉得应该叫 phy+ML4predict，见 ((nckl08))phy+MLpersp:
	* 相关：((n3ag7c))数据不足的解决-引入先验知识，((nca99w))NN 架构设计-引入先验知识
	* `2003.04919` 相关工作的 review，`review-embDomKnowML-Material` 相对针对材料问题，`G.E.Karniadakis2021`
	* `phyGuidedDyn:` 针对动力学预测问题的部分汇总；降阶建模汇总 ((ncmj8o))constiRel
		* 二者关系在 ((nckl0m))phy+MLpersp-数据、模型中机理占比 的大框架下可看出，例子也放那里并分类
	* 一些观点：
		* `2021-01-23`(MRmeet) 理论能够推导结果可指导网络设计，但有的理论需要的假设太多，此时不如用 blackbox
			* 更广泛的 NN 模型的 population risk "AGO" 问题（见当日的图）, approximation-generalization-optimization，认为重要性是递增的；theory-guided 应该可以有效帮助 GO，不过这也还没有明确的实验依据
* `phyGuidedDyn:` #HNN, #theory-guided
	* 原始 HNN 工作涉及从视频学习物理原理：AE 编码帧（使用相邻两帧以允许提取动量信息），隐空间形式为 $(z_q,z_p)$，AE 额外 loss $\|z_p^t-(z_q^{t+1}-z_q^t)\|^2$ 以保证具有动量的含义；之后在隐空间学出 Hamiltonian $H(z_q,z_p)$
		* `HGN-1909.12790`(x) 用 GNN 表达多粒子系统的 Hamiltonian；secD 解 ODE 的 Runge-Kutta 格式无法保辛结构，不过较非 HNN 版本仍有足够提升，保辛结构的时间积分器见引文
		* 备用：`[NeurIPS2022-ML4phyWorkshop]` No.88，将 HNN 用于木星、土星、小行星这样质量差异大的三体系统，忽略小行星对另二者引力；未确认怎么做的
		* 备用：`2212.01168` MAML 用于 HNN
	* 无穷维系统，((_p3ce9t))波方程 Hamiltonian 泛函，泛函导数可能是通过 NO 反传实现
		* 2505.13275 似也类似，基于分辨率无关的 NO 刻画泛函（场到标量的映射）
	* `NeurSympForm` 考虑数据无法提供广义动量的问题，额外学出辛形式 $\omega$
	* 2021-05-05 AISC 我讲的 slides 里提到，包括 Lagrangian 动力学版本（DeLaN），引入约束从而可以在欧氏坐标处理问题
		* `LNN-2003.04630` 使用更一般的 Lagrangian 形式，从而可处理磁场中带电粒子、狭相、波方程（连续空间 graph 离散后）
	* 2021-05-12 AISC li+1学长讲的：HNN 原版像 PINN，SRNN 像 NeuralODE，GFNN 像 FNO（这一篇试图学习辛映射 $(q(t),p(t))\mapsto(q(t+1),p(t+1))$ 的生成函数 $F(q,P)$, 不需要 Hamiltonian 可分）
	* 依照先验强度的四种可能项，每种都可考虑引入与否：已知表达式形式，HNN，经典耗散形式，黑箱 NN
		* 表达式形式已知，只拟合系数：`APHYNITY-2010.04456`，`NNPhD-2106.00026` 符号拟合部分
		* HNN、LNN 等守恒经典力学
		* 经典耗散动力学形式
			* GENERIC（`SPNN-2106.13301` 提到，涉及切触结构）形如 $M\nabla S$，$M$ 半正定；另与 HNN $L\nabla H$ 项耦合后希望能量守恒、熵増，故引入额外约束 $L\nabla S=M\nabla E=0$
			* `DSymODEN-2002.08860` 形如 $-D(q)\nabla H$，$D(q)$ 半正定
		* 额外自由项（黑箱 NN），通常还需惩罚其大小：`APHYNITY-2010.04456`（不含时），`NNPhD-2106.00026`（含时）
		* 其他：`DSymODEN-2002.08860` 涉及控制项 $g(q)u$，可用于后续控制问题
	* 对 HNN、LNN 等经典力学形式，内部先验强度也有区别
		* $H(q,p),L(q,v)$ 形式：完全经典力学 $H=p^\mathrm{T}M(q)^{-1}p/2+V(q)$，或一般 NN（`LNN-2003.04630` 还可适用于磁场中带电粒子、狭义相对论）
		* 给出动力学形式：HNN 传统的 $[\dot q;\dot p]=J\nabla H$，或将 $J$ 换成可学的反对称矩阵 `SPNN-2106.13301`；LNN 目前只有经典形式
	* 反思性工作：`2202.04836` HNN 其实不保证能量守恒，优势主要来自动力学二阶结构，性能不如带二阶结构的 NeuralODE
	* `2021-12-02`(lectures) 刘子鸣的第二个工作，目标性质的可生成性、可判别性，分别有相应处理法
	* 含时 PDE 描述的无穷维动力学，PDE-Net 在映射结构中引入 PDE 离散格式形式这样的 inductive bias 可减少所需数据量（相较通用 NO 做法）
		* 我认为与上面 HNN 系列有区别：这里是 NN 中嵌入物理、直接推断，上面是物理中嵌入 NN、推断要结合 Runge-Kutta 等传统数值格式
		* `PPNN-2205.03990` 含时 PDE 已知项用时空粗网格 FD 计算的过程嵌入时间演化 NO
	* 引入机理时可能的 ansatz 除了 HNN,LNN（无记忆动力系统），还可有 ((n35e9h))Mori-Zwanzig（有记忆动力系统），`HiPPO-LSSL-S4`“SSM”（输入为序列的任务）
	* ((ncmj8o))constiRel 的做法事实上也可用
		* 那里模型中物理部分来自特定问题精确机理的约简，不像这里用一般性物理描述，故还是分开记录
	* ((nckl08))phy+MLpersp: HNN 等既可用于提高预测精度（phy2ML）也可用于发现新物理（ML2phy）
		* HNN 训练可视为特殊反问题/设计问题 `contTimeDynML:`
* phy+MLpersp: 机理+数据模式的看待方式：{nckl08}
	* 主要两种任务：帮助发现物理规律，以及更好地计算（预测、优化）
		* ML 都只以手段形式存在，似乎 phy2ML 的说法不合适，只有 ML2phy 和 phy+ML4predict
		* 更好计算包括：降低样本需求，提高精度；多解时找物理解之一而非多解统计平均 `[PINN适用范围-知乎]`
	* 同一方法根据不同的理解方式/下游任务设置，两种任务都可完成：
		* 例如学系统与守恒律模型的偏离 `NNPhD-2106.00026`，既可用于提高预测精度，也可将学出的偏离函数拿去做符号回归发现新物理
		* HNN 系列同理（预测精度，或者对哈密顿量符号回归）；PDE-Net
	* > (deprecated) phy+ML4predict 中机理和 ML 谁占主导不见得需要区分太详细
		* 这种思维倾向可能来自与什么传统方法比较
		* 如深度势能系列，之前的工作纯机理用于预测（要么算波函数细节，要么用手工设计的势能函数），从而它被认为是 ML 增强了机理用于预测的能力
		* `[Ying]-EIT-DL` 用机理指导网络架构设计，对比的基线是纯 ML 预测，从而它被认为是机理增强了 ML 用于预测的能力
		* 要根据实际问题需求决定二者引入的占比，不应被比较的基线束缚思路
	* phy+ML4predict 中机理和 ML 关系：也许可区分为 NN in phy 和 phy in NN；{nckf92}
		* 二者具体例子放在((nckf9u))
		> 事实上未必 NN，映射可用其他的方式表达（一般 ML 模型，以及 ((n32e9r))场的数值表征）
		* phy in NN 里最终模型以 NN 形式存在，可直接用于预测，嵌入物理仅提高精度；
		* NN in phy 最终获得的是物理模型，用于预测还需结合传统数值求解器（如 HNN 给出的 ODE 形式需 Runge-Kutta 进行时间演化）
			* 其实如果 ML 只学出待定系数（而非 NN 表达的待定函数），也具有这样的特点，可视为特殊反问题/设计问题；
				* 但这种做法较少用于预测，一般还是按 `ML2phy%` 理解
		* NN in phy 可解读为 特殊的反问题/设计问题（phy in NN 则不能这么理解）{nckl0w}
			* 见 `contTimeDynML:`（暂时没找到不含时的例子，除了考察含时模型的稳态行为这种平凡例子）
		* 可能性：NN in phy 里可套 phy in NN（启发设计网络结构）；反过来套也有可能
		* 对于系统底层规律未知（或只知道能量守恒等简单性质）、只从数据学的场景，基本就以上两种
			* 以下讨论至少部分已知（如知道近似模型、不稳定模型）、用数据改进的场景
		* 暂未讨论离散了一半的例子，视为中间情形，类似 `RL_MR4PDE`
			* 此时空间/时间中有一个离散了，从而不算 phy
			* 但另一个未离散，预测时还需要再结合数值求解器，从而也不算 NN
			* 可按 ML 强化已有数值算法来理解 ((n3bh2y))fastPhyDyn
		* residual modeling 可能介于二者之间，倾向于分类为 NN in phy，尽管残差项未必有明确物理含义
			* 上面的二者基本都在讨论只有数据、没有任何可用近似模型时的建模，这里有近似模型可用，似乎不完全算同一个问题？
	* 预测任务的各种细分问题，按 数据、模型中机理占比：{nckl0m}
		* 数据来源（数据中物理机理占比）：观测数据，从精确物理模型生成的模拟数据
			* 二者在使用上区别可能没那么大（除了模拟数据通常噪声小、不受仪器限制有完整观测，如流场所有物理量），只是讨论“我们要干啥”有时需要说明数据来源
			* 二者结合使用的情况这里暂不讨论
			* physics-informed loss 无监督训练可视为与 使用模拟数据给出的有监督 loss 同理
		* 按所得模型的形式进行分类（模型中物理机理占比）：{nckf9u}
			* 纯物理机理：
				* 用观测数据，则为 `ML2phy%`（其中学守恒量之类的不算），做符号拟合等
				* 用模拟数据的场景较少，虽然可用于学约简的符号表达的物理规律
				* 观测+模拟数据（同样少见），认为原有物理建模不够精确，试图给出修正版本？
			* 纯 NN 模型：
				* 用观测数据则为传统 ML
				* 用模拟数据则属于提供 surrogate 模型（例如动力学预测，隐空间迭代的模型比物理模拟代价低 ((o5sm3k))singleDyn）
				* 观测+模拟数据：在模拟数据上预训练后（所用物理模型可能和真实有差别），用观测数据迁移学习
					* `2003.04919`“physics-guided initialization”？
			* NN in phy 模型：{nckl0b}
				* phy 提供基本形式，其中待定的函数由 ML 学出，如 HNN（哈密顿量待学）、深度势能（势能函数待学）
				* NN 部分训练数据来源，观测vs模拟 数据
					* 用观测数据的属于 `phyGuidedDyn:`（HNN 等）
					* 用模拟数据的属于学本构关系 ((ncmj8o))constiRel，描述粗层级的物理规律
					* 观测+模拟数据？
				* 与 phy-in-NN 关系讨论见((nckf92))
				* 数值格式作为 phy 的特殊类型，NN 增强传统数值求解器，NN in numeric；{nclm36}
					* 相关：((n2rm3m))黑箱 NN 充当迭代算子，((nclm4c))传统数值方法，((ncbn67))numeric in NN
					* 这里主要考虑非含时 PDE 及其数值格式，含时版本记录于((n3bh2y))fastPhyDyn
					* Meta-MgNet 在((n2pf9o))多重网格 中用可学的磨光等算子
					* `OneShotNO-2104.05512` 理论假设解算子可写为邻域预测迭代（可单样本学出）的形式
					* 优化 PDE 离散所得线性系统的迭代算子？
				* 可解读为特殊的反问题/设计问题 `contTimeDynML:`；
			* phy in NN 模型((nca99w))、半离散模型（区分在上方）
				* PDE-Net 似乎不太区分观测和模拟数据？
				* 与 NN-in-phy 关系讨论见((nckf92))
			* 还是要说明：依据数据中机理占比的子分类是对使用场景分类，不是对方法分类，方法可以一致
		* 使用策略，知识为主还是黑箱为主：
			* 2022-05-20 导师：看知识的强弱
				* 蛋白折叠这个知识很弱，主要靠数据和NN
				* EIT或者反散射这类反问题，现有机理也比较弱，所以我建议靠数据和NN
				* 对于医疗影像重建这类反问题，机理很强大，数据和NN可以帮忙做临门一脚。
* `contTimeDynML:` 连续时间动力学的学习 $\dot u=f(u)$ 视为特殊的反问题/设计问题
	* 模型 $f$ 是否采取了表达能力受限的特殊形式（根据物理知识设计的 inductive bias）
		* 若有，则可视为 ((nckl0b))phy+MLpersp-NN in phy 做法，如学 HNN、本构方程
		* 否则若形式较自由，按动力系统学习的 ((n2h92j))singleDyn-连续时间 情境解读
	* 待恢复/设计的对象 $\lambda$ 通常为一个函数（输入为空间坐标）
		* 如果 $f$ 形式自由，则 $\lambda=f$ 就是待恢复对象；若为物理知识设计，则 $\lambda$ 为其中的待定函数（如本构方程中的封闭模型）
		* 若 $\lambda$ 用 NN $\theta$-参数化表达，则转化为对 $\theta$ 的优化问题，这与常规反问题/设计问题是一致的；原则上 $\lambda$ 也能用离散化/基底表达
	* 用于预测任务时需要结合 Runge-Kutta 等传统数值算法
		* 除了预测外，还可用于 ML2phy 任务，符号拟合学出来的 $\lambda$ 之类
	* 可根据数据（或者一般的 loss）来源细分反问题和 inverse design 问题
		* 若使用模拟数据学（包括学本构方程），可视为有一个简化物理模型，模型中某函数为可设计部分，设计目标为使模型预测结果最接近真实（用微观机理预测的结果）
		* 若用观测数据学，可视为反问题，系统描述中的某个组成函数未知，需从数据中恢复
		* inverse design/problem 区别不必那么明显；只是组成函数在后一个问题中被假设是客观存在的，在前一个问题中理解为人为设定结果（生成数据所用的微观机理才是客观的），因此这么区分看起来更自然
		* `2202.05122` 训练流体 RANS 模型时使用了反问题求解的 ensemble Kalman inversion 方法
	* 相关：((n35f03))invCtrlRL 中 ResNet 可视为构造了一个连续时间动力学来达到特定目的，也算设计问题
		* 由于动力学为人为构造而不对应真实物理过程，无需 Runge-Kutta 精确求解，前向 Euler 即可
		* $f$ 为浅层网络表达的 ResBlock，未引入 inductive bias
	* 其实感觉离散时间动力学 $u_{t+1}=u_t+f(u_t)$ 也算
		* 希望 $f$ 参数化的离散时间动力学能近似表达给定的连续时间动力学

