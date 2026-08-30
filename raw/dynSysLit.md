> 2022-09-15 从 AISC2.md 中独立
* `FEN-dyn` 一阶动力系统仅右端项待学，用 GNN 表达其 FEM 时间推进格式并学右端项，可引入部分先验知识
	* #FEM, #GNN, #time_series, #dynamics
	* "Learning the Dynamics of Physical Systems from Sparse Observations with Finite Element Networks"
		* [OpenReview](https://openreview.net/forum?id=HFmAukZ-k-2) 审稿人评价较高
	> TODO: summary, comparison tree, link, (broader impact?)
	* sec2.1 FEM 只考虑一阶的基函数，自由度等于顶点个数
	* eqn(13) 对于时间演化情形，FEM 的刚度矩阵可以用对角阵近似（引用了一本教材）
		> 不理解，待确认
	* eqn(17) 在单元 $\Delta$ 上计算右端项 $F$，NN 输入时间步、单元中心坐标、单元顶点相对位置、$u$ 单元内的有限元系数
		* 作为 message passing 为顶点信息汇总至单元
	* eqn(18) message passing 机制，相邻单元上 $F(\Delta)$ 汇总到顶点用于更新
	* eqn(20) 若右端项部分已知，例如有对流项，则可针对这部分设计消息传递格式，T-FEN
* `MP-PDE-2202.03376` PDE 时间推进算子，用 GNN 以允许空间散点离散化，loss 只单步反传
	* #GNN, #NO
	* "Message Passing Neural PDE Solvers" ICLR2022
		> recommended at `2021-11-24`(AISCmeet)，更详细内容直接按那里的记录，这里只提供概要版本
	* {push-forward 技巧}，只反传单时间步
		* 训练所得算子预测不准，一段时间后引入误差，将之视为噪声，引起 distribution shift
		* 现希望算子能自行应对这部分噪声，进行 domain adaptation，因此只反传单时间步
		> 对比：反传多时间步是抑制前面预测所得噪声大小；
		> 这里反传单时间步不抑制大小，只要求后续预测能 handle 这部分噪声
		* 导师：相当于 noise cancellation
	* {时间打包}，用前 $K$ 个时间步预测后面 $K$ 个时间步，以减小算子调用次数、降低误差累积
		* eqn(10) 输入 $u^{k-K},\dots,u^k$，实际预测的是增量 $d^l$，下一步 $u^{k+l}=u^k+l\Delta td^l$
	* fig3 网络结构
		* 输入在每顶点有 $K$ 分量（设 $u$ 单分量，其余情形不难）
		* MLP 升维后输入 GNN（> 我一般把这里的 MLP 视为 GNN 的第一层，而非独立的结构）
		* 最后顶点 $i$ 的 feature 向量通过 1D CNN 解码获得 $d_i$，共 $K$ 分量；CNN 用于 "smooth the signal over time"
		> 编码器与解码器架构不同，解码用 CNN 只为提高输出的光滑性，而输入自动是光滑的；
		> 但是 CNN 输出未必光滑，如生成的图像是有棱角的？
* `2006.08956` 拟合动力系统，用 GNN 而允许任意空间离散，用 adjoint 方程反传而允许任意时间离散
	* #dynamic_system, #GNN, #adjoint_eqn
	* "Learning continuous-time PDEs from sparse data with graph neural networks"
		> recommended at `2022-01-21`(CSImeet2)
	* GNN message passing 表达动力学 $\dot u(x_i)=F_\theta(u_i,\{(x_j-x_i,u_j)\})$（$j\in N(i)$ 相邻顶点）
	* loss $L(\theta)=\bigoplus_i\|u(t_i)-y(t_i)\|^2$，对偶方程解 $\lambda(t)$，梯度可表为 $\partial L/\partial\theta=-\int\langle\lambda(t),\partial F/\partial\theta\rangle dt$
		> 我觉得 $L$ 的定义需要 $/2$
	* > (mine) 我关于梯度可用 adjoint eqn 的解表出的推导：
		* 考察对 $\theta_i$ 的偏导，有 $L_i=\int\langle u-y,u_i\rangle dt=\int\langle\dot\lambda+\lambda^\mathrm{T}\partial F/\partial u,u_i\rangle dt$
		* 分部积分（严格地说是考察 $\langle\lambda,u_i\rangle$ 的时间导数，并用到它在 $0,T$ 时刻均为 0）可得结果
		* 根据推导可知 $\lambda^\mathrm{T}\partial F/\partial u$ 的定义为：对测试函数 $\phi$ 有 $\langle\lambda^\mathrm{T}\partial F/\partial u,\phi\rangle=\frac{\mathrm{d}}{\mathrm{d}s}|_{s=0}\langle\lambda,F(u+s\phi)\rangle$
	* > (mine) 文中称适用于任意时空离散
		* 解出 adjoint eqn 后，梯度 $\partial L/\partial\theta$ 为时空同时积分，这允许离散点来自 $X\times[0,T]$ 上随意 MC 采样（与 PINN 相似）
		* 但鉴于解前向方程 $u$ 时需要 Runge-Kutta，反向解 $\lambda$ 同理，我认为主要适用于时空离散为张量积形式的情形（尽管每个分量可任意离散），除非人为放弃一些已经算出的点的取值
	* table1 已有各方法能力比较，维度：学未知 PDE、连续时间、free-form 空间域、free-form 初边值
		* PINN, AR, PDE-Net, DPM, DPGN, PA-DGN 无法做到所有，本文可以
* `[Dong]-RL-WENO-1905.11079` 用 RL 学出改进的 WENO 数值格式
	* #RL, #WENO
	* "Learning to Discretize: Solving 1D Scalar Conservation Laws via Deep Reinforcement Learning"
		* Yufei Wang, Ziju Shen, Zichao Long and Bin Dong
		> recommented on `2022-01-28`(CSImeet2)
	* 考察守恒律方程 $u_t+f(u)_x=0$ 的数值求解，可解读为顺序决策过程（当前时间的近似网格值会影响后来）
		* 用 $L^\infty$ 范数训练，有监督学习可能有梯度计算的问题，而 RL 没问题
	* state $s_{j+1/2}$ 依赖于 $u_{j-r},\dots,u_{j+s}$（空间局部网格），具体依赖方式由方程形式确定
		* Burgers 方程实验中 $s_{j+1/2}=(f_{j-r},\dots,f_{j+s},(f_{j+1}-f_j)/(u_{j+1}-u_j))$
	* action $a_{j+1/2}=\pi(s_{j+1/2})$ 给出 $f_{j+1/2}$ 如何从 $f_{j-r},\dots,f_{j+s}$ 得到
		* 实验中直接算组合系数 $w_{j-r},\dots,w_{j+s}$
	* reward 由预测值、真值之间的差给出
		* 实验 $r_j=\|[U_{j-r-1}-u_{j-r-1},\dots,U_{j+s}-u_{j+s}]\|_\infty$
		* p12/22:-2 真解生成：WENO 用高精度时空网格
	* transition dynamics $P$ 完全确定性；本文时间迭代用传统格式（Euler 或 Runge-Kutta），尽管也可学
	* 为 multi-agent RL，$s_{j+1/2}^{n+1}$ 依赖于多格点 $u$ 值，进而依赖于 $a_{j-r+1/2}^n,\dots,a_{j+s+1/2}^n$
		* 省参数直接使所有 agent 共享同一策略 $\pi$，从而退化为 single agent 情形
	* 用 TD3 policy gradient 训练
		> see `[TD3]`；不用完整 L2 loss BP 原因：实验中取 $T=1,\Delta t=0.004$ 从而总时间步很多，存储所有中间步 activation 代价高
	> 学 WENO 数值格式可视为特殊的 inverse design 问题，类似学本构方程，只是这里是离散版本
	* 实验：Burgers 方程（RL 不好训练故只测试 1D 问题），真解用加细网格的 WENO、RK4 格式生成
		* 时间离散，训练 RL 用 Euler，测试时用 RK4
		> 不会出问题？总觉得学出来的格式是在某时间离散下最优；或者这样是想说明学习的结果关于时间离散化方案是稳定的？
		* fig2 RL 与原版 WENO 生成的权重比较，激波处与光滑部分的似乎都不太一样
	* 相关：`2022-09-02`(CSImeet2) 提到原生 WENO 表现已经不错，当时被人怀疑此类改进的意义多大
	* 相关：`2010.15761` 学 Helmholtz 方程求解的迭代算子（迭代不对应物理时间），也视为 MDP，非完全可观测 MDP 通过引入 belief state 变为完全可观测 MDP
* `PhyCRNet-2106.14103` 含时方程，PINN loss 训练时间推进算子，架构基于 LSTM
	* #NO, #LSTM, #PINN
	* "PhyCRNet: Physics-informed Convolutional-Recurrent Network for Solving Spatiotemporal PDEs"
		> created on 2022-02-19
		* 作者孙浩
	> eqn(1) 考虑含参含时 PDE 但参数在后文未体现，只说变化的 BC 等可作为网络的额外输入
	* fig2 架构，当前物理场 $u_t$ 经过 CNN 后输入 LSTM
		* LSTM 输出经上采样、CNN 解码得到时间更新 $\delta u_t$
	* fig3 变种 PhyCRNet-s，所谓“skipping encoder”
		* 多数时间中 LSTM 输入直接为上一步 LSTM 输出，不经过 CNN 编解码
		* 经过一段时间后，再以物理场 $u_t$ 编码的结果作为 LSTM 输入，不直接用上一步 LSTM 输出
	* 初边值靠 padding 方式保证
	* （评）`2022-10-19`(AISCmeet2) 导师听组内汇报后的评价
* `Auto-SDE-2205.04151` 双时间尺度 SDE 约简至仅慢尺度，约简所用流形通过 NN 演化动力学至不变分布而得
	* "Auto-SDE: Learning effective reduced dynamics from data-driven stochastic dynamical systems"
		> AISC 2022-06-01 我的报告
	* 双时间尺度 SDE $x_t=f\,dt+F\,dW_t$，$y_t=g\,dt/\epsilon+G\,dW_t'/\sqrt\epsilon$
		* 假设有短时观测数据
		* 问题背景，例如化学反应，大部分区域用分子动力学（慢尺度）即可预测，小部分反应发生区域要薛方 （快尺度）算电子
		* （AISC 讨论）湍流建模问题也有点像；这些数据可能用第一性原理模拟生成
	* 目标：获得约简的只含 $x_t$ 的方程 $x_t=f(x_t,h(x_t))\,dt+F(x_t,h(x_t))\,dW_t$
		* 好处：无 $\epsilon$，模拟时间步长可较大，便于长时间模拟
		* 这种 model reduction 合理性：确定性方程在 $\epsilon\to 0$ 时成为微分-代数方程
			* 所有轨迹均在“slow manifold”上（除演化最开始阶段快动力学还未收敛），$y=h(x)$ 待识别
			* 加入随机性之后，仍有相应定理能保证存在 invariant/adiabatic manifold
	* 第一步：从短时观测数据中识别 SDE 形式
		* 采用参数化的 ansatz，本文简单的用 Hermite 多项式回归；不区分快慢变量
		* loss 根据 $f/g(z_t)=\lim_{\tau\to 0}\mathbb{E}(z_{t+\tau}-z_t)/\tau$，$F/G(z_t)=\lim_{\tau\to 0}\mathbb{E}(z_{t+\tau}-z_t)^2/\tau$ 给出
	* 第二步：利用 SDE 形式找不变流形 $y=h(x)$，利用 AE+LSTM 演化动力学到不变流形上，预测带 overlap
		* （评）原文似乎没解释清楚用网络预测的必要性，只说了“维数灾难”
			* 我的解释：识别出的 SDE 有快尺度需要 $\Delta t\ll 1$，模拟至收敛代价大
			* 如果用 AE+LSTM 架构的 NO 做时间推进，time-bundling 可一次推 $l\Delta t$，更快
			* 此外似乎 NO 对应的时间步可大于 $\Delta t$，例如实验 2 中 $dt=20\Delta t$
			* 训练 AE+LSTM 还是需要 SDE 模拟生成数据，但是可以只采样小部分轨迹，而大部分轨迹仍用 AE+LSTM 低代价预测；拟合流形或许需要很多的轨迹
			* 最后给出 $h(t)$ 得到的慢动力学的推理时间尺度 $\Delta t\sim 1$，此时相对低效的 AE+LSTM 不再使用，并且它不带随机项，本来也不够准确
		* 输入 $Z_1,\dots,Z_m$ 输出 $Z_l,\dots,Z_{l+m-1}$，$2\le l\le m$ 有 overlap
		* overlap 部分 $Z_l,\dots,Z_m$ 用 AE loss，其余 $Z_{m+1},\dots,Z_{m+l-1}$ 用 SDE 生成 label 给有监督 loss
		* （评）这种办法不需要两阶段训练，即先训 AE 再训时间演化 LSTM，可能还有后续联合微调
			* 相同训练数据量需求（用于达到给定精度）在这种 overlap 方式下减少，因为 overlap 部分的 label 是已有的
			* 2022-06-01 AISC 讨论：似乎是之前没见过的方法
			* SyQi 觉得或许是多尺度问题的性质导致必须用这种架构，时间步长不能太大，因此不一次推进 $m$ 步（？）
			* 或许 AE 使多尺度在隐空间表现为单尺度，类似 Koopman 将非线性变为线性
			* 导师觉得是可推广到一般问题的做法；overlap 部分像某种{sanity check}，预测阶段也可使用，如果 overlap 部分预测时没有对应上或许表明遇到了 OoD 样本
		* alg1 迭代，采 batch 用 SDE 生成 label 训练 AE+LSTM 若干步
			* 之后所有数据过一次（> 应该也可多次）AE+LSTM 向前推进 $l$ 时间步
			* 如上反复迭代，直到所有轨迹在全空间中的分布无明显变化为止
				* （评）如果是分布不变，可算 Wasserstein 距离；不过鉴于快慢动力学时间尺度不同，其实逐点意义的 L2 距离应该也行，本来这一步就只需要把所有数据点赶到流形上，而流形上演化较慢，在短时间尺度下看不出来
			* 最后针对收敛的分布进行一些拟合，得到 $h(x)$ 表达式
				* （评）实验似乎用多项式，不过 NN 应该也行，只要能代入 SDE 获得慢动力学
	* 第三步：$h(x)$ 代入第一步获得的 $x_t$ SDE，得到纯的慢动力学，可大步长模拟、用于后续任务
	* 实验（尽管正文说方法解决了维数灾难，但实验都是低维的 toy example）
		* SDE 形式恢复的准确性，$h(x)$ 准确性，慢动力学轨迹与完整动力学吻合程度（分别轨道、分布意义上比较）
* `2012.12738` 
	* "Learning emergent PDEs in a learned emergent space", Nature Communication
		> created on 2022-06-17
	> TODO: TLDR, MOC, link, (broader impact?)
	* 问题目标：识别系统的 ODE、PDE，由于在非物理空间还涉及坐标选取
		* 序参量由 leading order 给出，据此可给出封闭的 ODE/SDE 模型
		* ODE 不足时找 PDE：1. 找可 embed 并观察系统行为的新坐标，2. 在该坐标下学动力学模型
	* 若 agent ensemble 很大但可用少数 emergent parameters 参数化时，学出演化算子可显著减少预测成本
	* eg. Stuart-Landau oscillators
		* fig1 256 个 agent，各自初值（复数）按网格排布，固有振荡频率随机均匀生成
		* 演化一段时间后取值 $W_k$ 排列到柱形上，在柱形上的位置与初值关系不大
		* 流形学习，柱形给出了系统的好参数化（二维度分别是时间、256 个指标排列 $\phi_i$）
		* fig4 分岔，极限环随 $\gamma$ 增长消失
	* fig2 原 PDE 每个给定 $x$ 的时间序列视为一个数据点，diffusion map 流形学习得圆结构
		* 圆上点位置与 $x$ 位置对应无序；按找出的位置为 $\tilde x$ 可从数据学出新的 PDE
	* fig6e 从流形学习获得的新坐标下学 PDE 时，“由于没有可用的解析边界条件，在积分时提供边界附近的真实值”？
		* （评）是否降低实用性？
	* 本文被 `2205.10965` 引用：
		> Kemeth 等人 [24] 在初始瞬态消失后，在慢流形上学习集体动力学，这可以通过基于涌现坐标中的局部空间偏导数的学习模型来近似。
* `MS-HiTS-2008.09768` 动力学预测引入多个预测网络，分别预测不同时间步长的演化
	* "Hierarchical Deep Learning of Multiscale Differential Equation Time-Steppers"
		> created on 2022-09-03
	* 方法命名 multi-scale HiTSs (hierarchical time-steppers)
	* 区分 fast,medium,slow 三个时间推进预测网络
	* fig3 并行计算：快网络生成长时间间隔后的状态（粗时间分辨率的解），中网络基于所有这些中间步骤再做时间推进（提高时间分辨率），慢网络再根据中网络给出的中间步骤来时间推进
		* fig4 hybrid timestepper：fine-scale timestepping 可用 Runge-Kutta 直接求解方程，不再用 NN
	* 好处：避免梯度消失或爆炸（单网络惩罚长时预测误差时会有？），预测可并行，可结合经典数值求解器
		> 首先，训练每个单独的网络更简单，因为可以使用 p 较小的轨迹，这样每个模型都可以专注于自己感兴趣的范围，从而避免梯度爆炸/消失的问题。
		> 其次，该框架是灵活的，因此可以将计算向量化或利用并行计算技术进行预测，从而实现快速的时间步长方案。
		> 此外，它可以很容易地与经典的数值时间步进器结合，形成混合方案，提高仿真算法的性能。
		> sec3.a:-1 这表明启用矢量化计算的边际收益可能大于评估神经网络时间步进器的成本；不过精度通常略低于纯数值 time-stepper
	* sec2.c:-1 交叉验证，去掉部分最长、最短时间步的模型可能提高精度（> ？）
		* 更小时间步长使用线性插值获得
	* 单步长演化算子存在最优步长，而本文方法始终达到最佳精度，无需选
	* sec3.b 序列生成实验，包括 KS 方程模拟解、音乐节选（巴赫的），圆柱扰流，视频（花开）；结果好于 LSTM，ESN（echo state network）等
		> sec3.b:-1 我们提出的框架不应被视为这些最先进方法的替代品，因为它们采用不同的方法和理念进行序列生成……相反，我们的多尺度框架应该用来加强这些现有的方法，因为它可以使用不同尺度的数据驱动模型，避免局部错误累积，并有可能提高准确性和效率。 
* `PPINN-1909.10145` 动力学方程时间分块，近似方程时间串行推进、各块内原方程 PINN 并行推进，整体预测-校正迭代
	* "PPINN: Parareal Physics-Informed Neural Network for time-dependent PDEs", Xuhui Meng, Zhen Li, Dongkun Zhang and George Em Karniadakis
		> created on 2023-01-14, recommended by `[PINN适用范围-知乎]` 
	* 场景：含时 PDE 长时演化，PDE 有一近似版本（称为 sPDE）可快速求解
		* （评）不限于 PDE，多体动力系统等也可
	* （评）包括时间多尺度情形，忽略细尺度项得 sPDE
		* 不过不限于此，如实验的 Burgers 用增大粘性版本作为 sPDE
		* 对参化动力学，可处理参数小变化：原参数取值已训时间推进 NO（有解析解也行），向新参数取值泛化可用该方法（针对单次调用；多次调用则可考虑微调原 NO）
	* 大意：解 sPDE 提供离散时间步初值，中间各时段由 PINN 并行求解 PDE；之后预测-校正，各时段初值利用之前时段 PINN 解修正，如此迭代求解
	* 记号，各时间区间开始于时间步 $t_i$，迭代步骤（上标）$k$；步长 $\Delta t$ 下，sPDE 时间推进算子 $G$，PINN 提供的 PDE 时间推进算子 $F$
		* $G$ 可以是：解析解，传统迭代求解器（大步长）FDM，或者 PINN（由于方程良态可一次算长时间）
		* （评）$F$ 用 PINN 非本质，换传统小时间步迭代算法也类似
			* 或许叫 parareal 传统算法？未 check 引文 [18]
		* （评）这里各区间 PINN 应为独立网络，换为主要参数共享的 AD 也没问题，见((n1eh3r))
	* alg1 先用 $G$ 求出所有 $u_i^{k=0}$（关于时间区间串行），之后迭代如下：
		* 校正：对时间区间 $i\ge k$（之前区间均已有精确解），求出用当前初值 $u_i^k$ 计算末值时，sPDE 近似带来的误差 $F(u_i^k)-G(u_i^k)$；所有区间并行进行
		* refinement：$u_{i+1}^{k+1}=G(u_i^{k+1})+F(u_i^k)-G(u_i^k)$，关于区间串行
			* 解读：若只有第一项，则为纯 sPDE 推进
			* 理想情况是算 $F(u_i^{k+1})$，但由于这步串行，直接调用 $F$ 代价高
			* 近似：若迭代对初值修正不大，则 $u_i^{k+1}\approx u_i^k$，两边同时求 $F()-G()$ 也接近，从而当前方式计算结果 能近似理想结果
		* 对 $k$ 迭代终止准则：考察所有区间的初值，求单步迭代带来的 relative 更新量，小于 0.01 即停
		* 拼接为连续时间解：校正步实际上算出了 $\hat u^k|[t_i,t_{i+1}]$，refinement 步对其整体平移得 $u^{k+1}|[t_i,t_{i+1}]$；fig3 为直观示例
			* 未保证相邻时间区间的解连续过渡
				* 不过可改写为时间软区域分解：最后一次迭代时，校正步多预测一截，使时间区域有重合，从而可连续过渡
			* 整体平移，指加上一个不依赖于时间、只依赖于空间 的场
	* 实验，包括 sPDE 选取例子、ODE 迭代过程直观演示
		* sec3.1.1 ODE $u'=a+\omega\cos\omega t$，sODE 去掉后一项（有解析解，实验还比较用 FDM,PINN）
		* fig3a ODE 整体解随迭代变化情况，初始预测解为直线，迭代一步后有真解基本形状、仅误差随时间线性增大，再迭代一步则很好拟合真解
		* sec3.1.2 随机 ODE
		* sec3.2 Burgers，稍增大粘性得 sPDE，仍用 PINN 解
			* （评）原方程粘性 $0.03/\pi$，增大到 $0.05/\pi$，感觉幅度太小了？
		* sec3.3 反应扩散方程
* `MeshGraphNets-2010.03409` 含时 PDE（包括布、气、球相互作用）预测，用 GNN 建立 NO，同时预测 sizing field 以动态调整三角形 mesh，均数据集有监督训练
	* "Learning Mesh-Based Simulation with Graph Networks" by DeepMind
	* fig1 考虑的 PDE 包括二维 mesh embed 到三维（旗子被撞、被风吹），材料应力形变，流体等
		* 使用 GNN 有监督训练得到解算子，用于推断；GNN 边会动态变化，变化依据的一部分由 GNN 自身预测
	* 方法：构造 GNN，包括两种边：mesh edge 和 world edge（基于空间距离），eqn(1) 有各自 aggregator
		* 对于旗子问题，旗子与小球分别有各自 mesh
		* 预测加速度
		* GNN eqn(1) 只使用 MLP
	* sec3.2 更新 mesh，第一步需要 domain knowledge 因为不同问题需要加细的地方不一样; eg. sec3.2:1
		* 使用引文的 sizing field $S$（针对 cloth 模拟），局部某方向允许的最大边长
			* `2022-04-20`(AISCmeet2) jpf提出 $S$ 像 Riemann 度量，新度量下的邻域与原始度量不同
		> 回忆 MeshingNet 为局部允许的最大面积，PDE 求解中 NN 只负责网格生成，这里同时负责网格生成和预测解；原则上预测解的部分可以改用传统方法，包括 FEM 这样物理量不一定在顶点上记录取值的做法；
		> 这里使用最大面积不够，例如球撞击布料时 fig3b 某个方向延伸的条纹显然需要各向异性网格
		* sec3.2:-1 使用同样形式的 GNN 来预测 sizing field（因为原来的使用 domain knowledge 设计的版本计算复杂）
			> 看公式形式应该是先更新顶点位置，然后算 $S$，然后增删边
		* secA.3 局部调整 mesh 的三种方式与条件
			> flip 条件的表达式没搞懂什么意思
			* secA.3.0:-1 有 4 步：split, flip, collapse, flip
			* 某边新顶点的 GNN attribute 取该边原有二顶点的平均
			> 没有说新边的 attribute 怎么选，尽管 eqn(1) 更新涉及原有 attribute
		* 训练集没有显式提供 sizing field 时用训练集网格序列来估计（> 需要确认训练集包含网格的调整），假设训练集网格已经最优来解优化问题 eqn(2)
	* sec3.3 loss 用数据集有监督训练
		> 不能保证输出精度，不能给定方程自行无监督训练
	* p6:-2 速度快原因：时间步长大于传统方法，NN 适合并行
	* 视频展示链接，需要科学上网
	* `2022-11-02`(dbGrpMeet2) 导师：如果是机翼之类的流场（不需要调整网格），从和UhFw的合作经验来看转化为 image 再预测比 mesh+GNN 高效
* `2007.04439` 流体预测，用 GNN 实现 mesh 形状优化，包括细网格和粗网格
	* "Combining Differentiable PDE Solvers and Graph Neural Networks for Fluid Flow Prediction"
	* fig1 主要架构
		* coarse mesh 上使用开源软件包 SU2 求解方程数值算法解（输入攻角、马赫数），p4:r1 实现为一个 PyTorch layer，p4:l-1 参数为 mesh 顶点位置，可以 BP
		> 对顶点位置微分，这有点不常见；相当于寻找合适位置的 coarse mesh 使得其上的数值解（对预测细网格的解）最为 informative
		* fine mesh 上演化 GCN，中间的某一层加入 coarse mesh 解的上采样后的结果
		* p4:2 上采样使用加权 kNN 插值
		* 参数：p5:r1 GCN 参数以及 coarse mesh 顶点位置
		> 应该是希望 同一套参数与粗网格 能够对不同的参数（攻角，马赫数）都有好的表现
		* GCN 初始化：eqn(2) 每个顶点的初始 feature 包括当前点坐标，SDF (> ? 这里似乎没有 level set), AoA, Mach (> 应该确实是每个顶点都带一份 PDE 参数)
	* 细节：p5:r-1 更新 coarse mesh 顶点位置时要注意顶点穿过边的可能性
		> 应该是针对 2D mesh 的情形；3D mesh 是顶点穿过面
		* 检测是否有 element 发生这种情况：p6:l 追踪每一对邻边内积，符号改变则是这种情况
		* 处理：该 element 三顶点梯度置 0（即恢复原位置），然后检测是否导致新的 element 翻转，一直持续到没有翻转元素存在为止
		> 似乎减小学习率（可以对 mesh 每个局部设置不同的学习率）也可以做到；放弃梯度可能不那么合理，依赖于检测顺序，例如两个邻近元都翻转、但是恢复任意一个元的位置都能同时取消两个的翻转
	> `2021-12-19`(CSImeet2) zjx 推荐了这篇；`2022-04-22`(CSImeet2) 又有一点讨论
* `GNS-2002.09405` 基于粒子的物理系统模拟，用 GNN；训练带输入噪声以提高长时预测准确性
	* "Learning to Simulate Complex Physics with Graph Networks", ICML2020 by DeepMind
		> recommended at `2022-11-02`(dbGrpMeet2)
	* 推断速度受限，相较传统方法优势不大；因为动态根据粒子邻域构建 graph，kNN 计算耗时
	* 实验（多相流），向容器中倾倒液体，晃动的容器中有水和固态立方体
	* 数据集：粒子模拟数据，随开源仓库公开提供，用于 Lagrangian 动力学学习
		* 沙粒；{_q85h1i}
		* SPH 流体；{_q85h1a}
		* MPM 可变形体；{_q85h10}
* `1810.01566` 粒子方法物理系统模拟，用 GNN，控制问题（找初态达到给定终态）可用梯度优化解
	* "Learning Particle Dynamics for Manipulating Rigid Bodies, Deformable Objects, and Fluids", ICLR2019
		> created on 2022-11-03
* `Ummenhofer2020LagrangianFS` 粒子方法流体模拟，手动设计网络架构汇总邻域的容器粒子、流体粒子信息，以预测流体粒子位置改变量；有监督训练，对邻域规模小的粒子增大权重
	* "Lagrangian Fluid Simulation with Continuous Convolutions", ICLR2020
		> created on 2022-11-03
		* [他人博客讲解可参考](https://fluci.github.io/2020/10/19/Understanding-Continuous-Convolutions.html)
	* 空间卷积汇总 $R$-邻域粒子信息，卷积核包括手动设计的径向函数、可学的两部分，后者只存储格点值
		* 手动设计部分为径向衰减函数 $a(r)=(1-r^2/R^2)^3$
		* 可学部分 $g(\Lambda(r))$，$\Lambda:B_R\to[-R,R]^d$ 固定映射先映射到方形区域，$g$ 只存储格点处取值（待学），方形区域上其他位置取值靠样条插值获得
		* 可再根据 $a$ 加归一化因子，本文未加
		* 最后卷积 $f_j'=\sum_{i\in N(j)}a(x_i-x_j)f_ig(\Lambda(x_i-x_j))$
	* 多种粒子：流体粒子，保存位置、速度、粘度；边界（容器）粒子，保存位置、法向
		* 位置信息只在卷积核用到，生成 feature $f$ 时不会涉及位置信息；应该是把除位置以外的 feature 过全连接升维得到 $f$
	* 网络输入所有粒子，预测流体粒子 $i$ 的位置更新 $\Delta x_i$
		* 第一层第一部分，对邻域的容器粒子算卷积
		* 第一层第二部分，对邻域的流体粒子算卷积
		* 第一层第三部分，自身特征过全连接升维
		* 综合第一层三部分信息；后续层也有卷积，但此时不再考虑容器粒子
		* （评）感觉文章说的不清楚，不完全确定
	* 有监督训练；鉴于表面的粒子对视觉效果影响大，对邻域粒子数少的粒子增大 loss 权重；{_o9697x}
		* 每次反传 2 个时间步
* [NeuralDE综述-2202.02435](https://mp.weixin.qq.com/s/PvPicN3sZ-CvSbqzVXDegg)
	> recommended at `2022-02-09`(CSImeet2)，为 PhD thesis
	* 主要内容：neural ODE/CDE/SDE（C 指 controlled）及数值方法；另有动力学符号回归
		* neural ODE 用于学习物理系统，作为离散架构的连续时间限制，包括对可表达性的理论结果；
		* neural CDE 用于建模时间序列函数、处理不规则数据；
		* neural SDE 用于从复杂的高维随机动态中采样；
		> 未考虑 neural PDE，虽然似乎文末简单提了一下 FNO？
		* 数值法（numerical methods）：一类新的可逆微分方程求解器或布朗重建（Brownian reconstruction）问题。
		* 其他主题，比如用于{动力学系统的符号回归}（如通过正则化演化）、深度隐式模型（如深度均衡模型、可微优化）。
	* 神经微分方程的 4 个主要应用：
		* 物理建模；
		* 时间序列；
		* 生成式建模；
		* 一种开发深度学习模型的策略：取适当的微分方程并将其离散化。
	* 优势：
		* 类似于神经网络的结构提供了高容量的函数近似和易于训练的性能
		* 类似于微分方程的结构则通过易于理解和久经考验的理论文献为模型空间、内存效率和理论理解提供了强有力的先验知识。
	* 历史，神经微分方程诞生的思路演变过程
	* neuralODE 应用主要包括：图像分类；带归纳偏置的物理建模；连续归一化流；潜在 (latent) ODE; 残差网络。
		* 论文中详细讲解了几种参数化选择，包括神经架构、非自主性 (non-autonomy) 和增强 (augmentation)
			* 原文 non-autonomy 讨论包括 {hypernet}：控制变量 $\alpha(t)$ 的初值 $\alpha_\theta$、动力学 $g_\theta(\alpha,t)$ 可学，主动力学 $y(t)$ 受其影响
				* 原文 $(t,y)\mapsto\dot y$ 网络的所有参数均由 $\alpha$ 给出
				* 主动力学初值 $y_0$ 写为不依赖于 $\theta$ 形式（> 不过不排除仍可变）
				* 实现时两动力学常 concat 同时求解（> 指时间推进）
				* 可视为原来所说的单个 neural ODE（> 只是用了特殊升维方式？）
				> 若用于时间序列处理（虽然更像 CDE），属于 dynamic NN，对不同时段序列用不同网络架构；
				> 若用于设计网络架构，可表达 hypernet；
				> 其他应用看起来相对次要，例如增强普通 ResNet 表达力
			* 原文：augmentation 指输入先做仿射变换到更高维空间，仿射变换可学
		* unaugmented neural ODE 无 UAP 性质，augmented 则有，尽管其向量场无 UAP 性质
		> 潜在 ODE 指的是动力学在隐空间对应的 ODE？
	* neuralCDE
		* 解读为 RNN 连续时间极限
			* 对于研究 RNN 或时间序列的人有用；也适合路径理论、控制理论或 RL 研究者阅读。
		* 几种应用：不规则时间序列、RNN 和离散神经 CDE、长时间序列和粗糙微分方程（rough differential equations）、训练神经 SDE。
		* 理论属性：通用近似、与 ODE 模型的比较、不变性。
		* 参数化选择：神经架构与门控程序、状态 - 控制 - 矢量场相互作用
		* 插值方案：理论条件、插值点的选择、实际应用案例
	* neuralSDE：选择 SDE 模型后，须根据实际数据校准模型参数；优化方式见原文
	* BP：
		* neuralODE 的三种 BP 方法：
			1. 离散后优化 – 此类方法内存效率低，但准确且快速
			2. 先优化再离散 – 此类方法内存效率高，但速度有点慢
			3. 可逆 ODE 求解器 – 此类方法内存高效且准确，但速度稍慢
		* neural CDE/SDE 先离散后优化：与 ODE 完全相同
		* CDE 的先优化后离散：两种方法，可以为 CDE 构建连续伴随（continuous adjoint）
			* 一种是将 CDE 简化为第 3 章中的 ODE，然后对 ODE 应用连续伴随方法
			* 还有一种是构建一个时间倒退（backwards-in-time）的 CDE，然后通过简化为 ODE 或其他方式，以任何需要的方式进行数值求解。
		* CDE 可逆求解器：可简化为 ODE
		* SDE 有一个已知的可逆求解器，即可逆 Heun 方法。
		> 相关：`2021-03-03`(AISCmeet) 传统 adjoint 做法 BP 反推前向激活的做法不准，如不可逆系统
		> 相关汇总 ((n32e95))梯度计算
	* 神经微分方程的数值求解和训练的软件包（链接见原文）：
		* PyTorch 生态系统中的 torchdiffeq、torchcde 和 torchsde 系列库
		* JAX 生态系统的 Diffrax
		* Julia 生态系统中的 DifferentialEquations.jl
	* （评）相关：`neuralGDE-2106.11581`，((n3sf7z))
		* 用 PDE 设计 NN 架构的讨论见 ((n32f33))NN架构设计；解释 NN 架构的可见 ((n32b5g))NN架构解读
		* ODE 可用于序列预测，而 CDE 可用于序列分类、回归、翻译等，如 `HiPPO-LSSL-S4`
* `HiPPO-LSSL-S4` 输入为一维长序列的任务，用带控制 ODE 启发的 ansatz、系数矩阵待学，初值选取利用时域动态基底编码输入的观点，预测时用矩阵特殊结构加速计算；多维序列可结合 NN 混合各维信息
	* 在 `2022-08-31`(AISCmeet2) 介绍，属框架 `NO%`“时序输入”；ansatz 物理但实验任务非物理，故也属于 ((n32f33))NN架构设计 序列输入框架
	* 问题：长序列任务、有长程依赖，传统学习方法不擅长；以下设数据从连续物理过程生成
		* 传统 seq2seq 模型：连续时间 ODE，RNN，1D CNN，注意力（> Transformer）
	* {SSM}（state space model），设待表达的序列变换 $u(t)\mapsto y(t)$ 由隐状态 $x(t)$ ODE 生成，时间离散后表达为时域卷积形式 $y=K*u$
		* （评）若输出非时序（序列分类、回归，实验有例子），则只输出 $y(T)$ 即可
		* 设隐状态依据控制方程演化，输出的序列为真实状态经变换得到：$x'=A_1x+B_1u,y=C_1x+D_1u$
		* $u_k,y_k\in\R,x_k\in\R^N$
		* 时间离散后 $x_k=Ax_{k-1}+Bu_k,y_k=Cx_k$
			* （评）与连续方程系数的对应关系未记录，不过看起来可能像蛙跳格式？
		* 从而序列变换可写为 $y=K*u=CA^kBu_0+\cdots+CBu_k$，$K=(CB,CAB,\dots,CA^{L-1}B)\in\R^L$
			* （评）这里假设了序列记忆长度为 $L$，实践中可能 $L$ 较大（下面说的 $10^4$）
		* （评）输出为同长度序列（序列翻译）时用这种卷积形式；非时序输出写成 $K,u$ 内积即可
		* （评）相关：((n35e9h))Mori-Zwanzig 有记忆序列预测任务的自治系统 ansatz；这里考虑的任务更一般，可处理序列为输入的任务，采用控制系统 ansatz
		* （评）这里似乎假设了 $y$ 关于输入序列 $u$ 是线性依赖的？
			* 一般序列任务可能假设过强，但在实验的（非物理）例子上居然表现还不错，有点奇怪；不排除是 NN 混合各通道信息时干了一些活
	* HiPPO-2008.07669 考察时域的动态基底（多项式），及 $u(t)$ 在该动态基底上的投影
		* "HiPPO: Recurrent Memory with Optimal Polynomial Projections"
		* 考察时间维度上的多项式函数基底，且为动态基底，时间区间 $[0,t]$
		* 对每个 $t>0$，取 $[0,t]$ 上多项式基底 $v_i^t(s)$，考虑 $u(s)$ 到该基底上的最佳投影，系数 $x_i(t)$
		* 此处“最佳”涉及 $[0,t]$ 上测度 $\mu^t(s)$；可取为关于时间指数衰减，或 $[t-\theta,t]$ 上均匀，以表明记忆有限，较近的历史更重要
			* $v_i^t$ 也可取为该测度下的正交多项式
			* （评）若不衰减，随着需要描述的时间増长，相同基底数目下表达能力下降；当天讨论时提到鄂维南的 curse of memory
		* 可推导系数满足方程 $x'=A_2x+B_2u$（分别来自 $\partial_tv_i^t,\partial_t\mu^t$）
			* （评）前一项还包括了变上限积分求导所得项，$\partial_tv_i^t,\partial_t\mu^t$ 都不涉及？
		* （评）之后的逻辑似乎是，认为 $x(t)$ 充分刻画了 $u|[0,t]$ 的历史信息，故序列变换 $u\mapsto y$ 可表达为 $y(t)=Cx(t)$ 的形式
		* 可再引入 skip connection $y=Cx+Du$
		* （评）不同于 ROM 中讨论的动态基底，ROM 中是 $u(t)$ 本身高维（在函数空间），考虑的基底是空间域的基底；这里 $u(t)$ 低维，基底是时域的基底
		* （评）或许对 $f(t)$ 序列预测任务（有记忆）也有用，因为下一步取值可由历史信息完全决定
	* LSSL-2110.13985 开始处理序列任务，SSM 中学矩阵 $A_1,\dots,D_1$ 取值，$A_1$ 用 HiPPO 初始化
		* "Combining Recurrent, Convolutional, and Continuous-time Models with Linear State-Space Layers"
		* （评）用 HiPPO 初始化的逻辑似乎是：手里只有 $u,y$ 数据，SSM 只是 ansatz，其中涉及的 $x$ 需自行找出
			* 为在最开始选一个合适的 $x$ 作为训练初值，先试图让 $x(t)$ 体现 $u|[0,t]$ 的尽可能完整的信息，从而可据此给出 $y(t)$ 取值
			* 这里认为 HiPPO 里定义的 $x$ 能完成这一任务，故将其作为初始化
			* 由于预测时（时域卷积形式）不显式出现 $x$，只涉及 $A,B,C$ 各矩阵，故实现时是用 HiPPO 初始化 $A_1$ 的取值
		* 缺点：计算量太大，时间复杂度 $O(N^2L)$，空间 $O(NL)$；对 $N=256,L=10^4$ 无法算
	* S4-2111.00396 ：利用矩阵的特殊结构降低 LSSL 计算量
		* "Efficiently Modeling Long Sequences with Structured State Spaces", ICLR2022 oral
		* HiPPO 矩阵可写为 $A=V(\Lambda-PQ^*)V^*$，即酉相似于 对角+低秩 矩阵
			* 对于考虑的几种 $[0,t]$ 上测度选取，低秩部分秩为 1 或 2
			* 另：$A$ 也可直接对角化，但变换矩阵条件数太大，计算不稳定
		* 对 SSM 卷积核 $K$ 定义生成函数 $\hat K(z)=\sum z^iCA^iB$，若取 $z$ 为单位根可起到类似 Fourier 变换的效果
		* lemC.3 $\hat K(z)$ 也有对角+低秩 形式（> SMW 公式？），已有 $A,B,C$ 时计算方便
		* 对若干单位根 $z$ 计算 $\hat K(z)$，再 Fourier 逆变换 IFFT 可得 $K$
		* 时间、空间复杂度 $O(N+L)$（时间复杂度可能还有 log 因子）
	* DeepS4：现在设输入 $u$ 有多维（多通道）；每通道 S4、全连接混合不同通道信息，如此叠多层
	* 注：实验、相关讨论仍见 `2022-08-31`(AISCmeet2)，未整理
		* `2022-09-30`(CSImeet2) FEDformer 也试图处理长数据，不过很少机理，不排除动机不明
* `GraphCast-2212.12794` 全球天气预报，球面 multi-mesh GNN，编解码器转化方形经纬网格数据
	* "GraphCast: Learning skillful medium-range global weather forecasting" by DeepMind
		> `2022-12-30`(CSImeet3)
	* fig1a 设定，地球球面每网格点包括 5 个地面变量、37 个高度等级的 6 个大气变量，共 227 变量
	* fig1d-f （ERA5 数据集中）经纬 grid 与（预测用的）球面 mesh 转换，编码解码（> 非对称！）
		* 编码器将局部 grid 映射到球面 mesh 顶点
		* GNN 在 mesh 上时间演化
		* 解码器将多 mesh 特征映射回 grid 表示
		* （评）非对称，编码器输出在单 mesh 顶点，解码器输入为 mesh 一个三角形的三顶点
	* fig1g 球面 multi-mesh 上跑的 GNN，最粗的 $M^0$ 为正 20 面体，添加每边中点提升一次分辨率，一直到 $M^6$ 细网格
		* 消息传递，顶点连接到同分辨率、以及更高分辨率的所有邻居节点；所有边同时消息传递
		* （评）应该是说粗网格向细网格的消息传递是单向的，细网格对粗网格无影响
		* Discussion 将 multi-mesh 作为本文关键创新：能捕捉更大范围空间相互作用，从而可用更大时间步长
			* （评）框架 ((n5da0x))NO-多尺度架构 ；之前 GKN 的后续工作是否有类似处理思路？
	* 训练 loss eqn(2) 加权，包括逐变量权重、经纬 grid cell 面积
		* 以及对逐变量引入的、单时间步更新量的方差倒数 $s_j$（> ？当日讨论认为可借鉴）
		* 多时间步 loss，12 步、对应 3 天
	* sec6 discussion 提醒专注于确定性预测，但实际中期天气预报需建模不确定度、UQ
		* 由于用加权 MSE loss，长期预测已模糊，而传统算法（确定性那类）会给高分辨率但可能不准确的预测
		* 其他：受限于数据网格，只能预测 0.25° 经纬度分辨率，而传统算法可 0.1°；可能的未来方向
			* （评）机理数据融合？
	* 注：当天讨论，导师觉得架构上比 AFNO（FourCastNet）还黑箱，居然还能 work，看起来是大力出奇迹；不过设计倒是更加简洁
* `DINo-2209.14855` 含时 PDE 用 AD 约简为隐空间动力学，架构 FourierNet、modulation
	* "Continuous PDE Dynamics Forecasting with Implicit Neural Representations", ICLR2023
		* Yuan Yin, Matthieu Kirchmeyer, Jean-Yves Franceschi, Alain Rakotomamonjy, Patrick Gallinari
		> created on 2023-02-11
	* （评）记号与原文对应：$u_\theta(x,z):g_\phi(x,\alpha)$，NN 隐层激活 $h^l:z_{(l)}$
	* fig1 训练、测试流程，训练做时间外推，测试为根据初值演化；训练测试所用空间采样点不同
	* sec4.2 编码器非 NN 前传，编码结果靠 AD 优化隐向量获得，共迭代 $K$ 步；{n2h87m}
		* 引文，对比 AE，AD 不那么容易欠拟合，且更灵活；{n2h91n}
	* 隐空间时间演化：学出 $\dot z=f_\psi(z)$，解数值 ODE 来进行时间推进；{n2h92e}
	* sec4.3:-1 训练方式，动力学与解码器联合训练；{n2h93c}
		* 原文实际上写为二阶段优化（双边优化）问题，AD 在内层
			* （评）这里内层优化来自等式约束形式，应可直接转化为同步单优化问题；下方我直接这么记录
		* 数据集为不同初值下的多条轨迹；动力学初值、时间步均作为 PDE 参数，从而 $z$ 有两个角标
		* loss 后一项为通常的 AD loss；前一项是 ODE 对应积分方程的 loss（涉及内外层时间积分）{n2h98n}
	* INR 架构 FourierNet，作为一种 INR SOTA，为 MFN 例子
		* MFN：multiplicative filter network，有引文 `Fathony2021MFN`
		* 输入 $x$，第 $l$ 层 Fourier basis $s_l(x)=[\cos\omega^lx,\sin\omega^lx]$
			* 各层 $\omega^l$ 随机取定（均匀分布），因发现这样的效果和学出的差不多；{n2ha0x}
			* （评）$\omega^l$ 应为矩阵，尺寸可随 $l$ 而不同
		* 首层 $h^1=s_1(x)$ 纯 Fourier embedding，末层纯线性
		* 中间层为前隐层线性变换、与 $s_l(x)$ 逐元素乘积：$h^+=(Wh+b)\odot s_+(x)$；{_n2h99t}
			* （评）每层都引入 $x$、且是以高频的方式，而不是仅在首层引入
	* AD modulation 只作用于 bias（不作用于 $\omega$，提到可作用于线性矩阵但没引入）
	* eqn(8) INR 表达式可改写为基底求和形式，使基底只依赖于空间，系数只依赖于时间；{n2il96}
		* 注：按 MFN 原文，尽管可写为基底形式，但基底数量随层数指数增长，故无需担心 Kolmogorov n-width
		* table5 这显著提高时间外推能力；{n2im2a}
	* 提到无网格表征的一个好处：流形上 PDE 的处理，免去打网格麻烦；实验浅水波为球面上方程；{n2ha7x}
* `DOSnet-2212.05571` （备用）基于算子分裂构造含时 PDE 求解器
	* "DOSnet as a Non-Black-Box PDE Solver: When Deep Learning Meets Operator Splitting", JCP2023
		* Lan, Yuan; Li, Zhen; Sun, Jie; Xiang, Yang; 
		> created on 2023-08-19
* `PDE-Refiner-2308.05732` NO 动力学时间推进，每步反复将自身预测解输入以 refine 预测结果，按去噪模型训练
	* "PDE-Refiner: Achieving Accurate Long Rollouts with Neural PDE Solvers"
		* Lippe, Phillip; Veeling, Bastiaan S.; Perdikaris, Paris; Turner, Richard E.; Brandstetter, Johannes; 
		> created on 2023-09-09
	* 设定：NO 做动力学时间推进预测
	* sec2:-1 动力学长期预测不稳定，因为用的 MSE 误差，不考虑不同频率分开处理；{_n99f53}
		* KS 方程例子，非线性项导致所有频率相互作用，高频误差传播到低频；{_q64m2h}
		* 认为应给高频部分更高的优先级，而低频也不应忽略
	* sec3.0:1 模型预测结果又作为自身输入，允许其迭代改进自身预测
		* 输入 3 部分：前一个时间步 $u(t-\Delta t)$，refine 步骤角标 $k\in\{0,\dots,K\}$，模型的当前预测 $\hat u^k(t)$（其中初始预测 $\hat u^0(t)=0$）
	* sec3.0:2 建议将 refine 过程按去噪目标来实现
		* 噪声随迭代步数指数衰减 $\sigma_k=\sigma_0^k$：希望早期迭代即将大幅度噪声消除，其后步骤只关注小幅度噪声
		* eqn(4) 去噪模型所用 loss，均使用 ground-truth 解 $u(t)$（而不是模型预测的解）；对 $k$ 均匀采样
		* 推断时依次执行 $K$ 个 refine 步骤，以平等地去除所有频率的信息（因 iid Gauss 噪声在频率上均匀分布）
	* sec3.1 与标准 DDPM 的不同：
		* 1. 考虑确定性问题（而非生成），要求准确预测
		* 2. 目标不仅是外观逼真，还要求整个频谱高精度（> 包括肉眼不敏感的高频特征）
		* 3. 为快速生成预测，$K$ 比传统生成模型小很多
		* 4. 每步都直接要求恢复原始信号（一次前传去除所有噪声），而非逐步去噪
	* 实验，方程包括 1D KS、2D turbulent Kolmogorov flow（不可压 NS）
	* sec4.1 1D 实验架构用 U-Net，并认为 FNO 截断高频而精度不佳（在附录有实验）{_n99f60}
* DiffConPDE 生成模型用于 PDE 控制
	* "Generative PDE Control", ICLR 2024 AI4DE-Workshop oral
		* [OpenReview](https://openreview.net/forum?id=vaKnCahjdj)
		> 2024-03-12
	* 记号：解 $u$，控制项 $w$，PDE 约束 $C(u,w)=0$、其中初边值 $c$，控制目标 $\min J(u,w)$
	* 扩散模型表达联合分布 $p(u,w|c)=\exp(-E_\theta(u,w|c))$，待求解问题为 $\min(E_\theta+\lambda J)$；{_o3cn4e}
		* 记号 $z=[u,w]$
	* 另一扩散模型表示控制项先验分布 $p_\phi(w)$；{_o3de1v}
		* 引入目的：训练数据中的 $w$ 很可能非最优，希望获得更优的，故用该项削弱数据中 $w$ 先验分布的影响
		* 新能量函数形式 $E(u,w,c)=(\gamma-1)E_\phi(w,c)+E_\theta(u,w,c)$
		* secH $\gamma_1$ 较小时效果好（不过最小只测到 0.6），实验默认值为 0.7
			* 小于 0.6 会产生 invalid control
		* $\gamma$ 随扩散进行会变，形如 $\gamma_k=1-\xi\beta_{K-k}$，$\beta_k$ 为 DDPM noise variance schedule（实验中为 sigmoid schedule）
			* 扩散总步数 $K=1000$
	* alg1 推理过程形式，每步去噪过程：
		* 1. 用联合分布扩散模型对 $u,w$ 去噪，并加上反向 SDE 噪声
		* 2. 引入目标函数 guidance，加上 $\lambda\nabla_zJ$
			* 属于 Langevin 采样
			* 该梯度不在当前点 $z_k$ 求，而是预测当前点完全去噪后结果 $\hat z_k$，在该点求梯度；{_o3de0u}
			* 最终与 1 合并的形式 $z_{k-1}=z_k-\eta(\epsilon_\theta(z_k,c,k)+\lambda\nabla_zJ(\hat z))+\xi_1$
		* 3. 用控制项扩散模型对 $w$ 去噪，并加上反向 SDE 噪声
	* 实验结果，相比 baseline 有本质提升
		* baseline: model predictive control (MPC), soft actor-critic (SAC), supervised learning (SL)
		* 场景：水母游动，控制方程为 2D 不可压 NS，控制项为两翼张开角度
		* 目标函数：极大化移动速度，能耗小，运动周期性（惩罚 $w_0,w_T$ 距离）
		* 考虑两种情形：流场完整观测，只观测到 $p$
		* 生成的控制：迅速闭合、缓慢打开；该类型运动方式在数据中稀少
		* secC Burgers 方程控制算例，控制项为源项场，目标为使终态解与目标场接近，且限制源项场总能量
	* secC.3.1 模型架构：3D U-Net（包含时间维度），时间维度分辨率不变、不上下采样；{_o3df15}
		* 水母运动算例中张角标量 $w$ 沿空间 pad 作为独立通道
		* 额外通道：边界 mask、“offsets representation”，其取值由张角决定；扩散时该通道不加噪声，模型也不预测其噪声
* MemNO-2409.02313（备用）由于离散化导致失真，Markov 系统也适合用有记忆的 NO 建模
	* "On the Benefits of Memory for Modeling Time-Dependent PDEs"
		* Ruiz, Ricardo Buitrago; Marwah, Tanya; Gu, Albert; Risteski, Andrej; 
		> created on 2024-09-10
	* 摘要
		> 输入信号的失真——例如，由于离散化或低通滤波——会使失真信号的演变非马尔可夫。{_o9ac00}
		> 在这项工作中，受Mori-Zwanzig模型约简理论的启发，我们研究了具有内存的架构对PDE建模的影响：即当过去的状态被明确用于预测未来时。
* 2003.10208
	* "The Neural Particle Method -- An Updated Lagrangian Physics Informed Neural Network for Computational Fluid Dynamics"
		* Wessels, Henning; Weißenfels, Christian; Wriggers, Peter; 
		> created on 2024-09-23
	* 先讨论时间二阶 ODE $a=a(v,x,t)$
		* 传统方法：升维降阶为一阶 ODE，之后高阶 IRK（隐式）；阶数高时计算成本高
			* eqn(2-4) 起始 $x_n,v_n$，终态 $x_{n+1},v_{n+1}$，过程 $x^i,v^i$
		* 训 NN 拟合该传统时间迭代格式（不是基于 BP 的 PINN loss）
			* 映射形式 $x_n\mapsto v^i$（原文其实还同时包括 $v_{n+1}$）
				* $x^i$ 根据 $x_n,v^i$ 容易算出，故不直接用 NN 预测
			* （评）属于拟合传统数值格式；相关：PINN loss 用 FD 也算是拟合传统格式的特殊情形
			* 原文说是用于给出 IRK 的 NN prior，因此算是为传统方法提供初值？
		* （评）感觉不是 PINN 而更类似 PI-DeepONet，因不是一次性求解，而是推理时反复调用训好的网络
			* 与普通 PI-DeepONet 区别之一在于网络只预测传统（代数方程组求解）迭代算法初值，而非解本身
			* 处理有限维粒子（其实是多体问题）而非场，故 NO 输入为有限维，这种意义上类似 INR
			* 作为 ODE 问题，PINN 的映射形式应该是 $t\mapsto x(t)$，而这里是 $x\mapsto v(x)$
		* （评）加速方式解读，原问题为 ODE，此处只考虑单步时间推进
			* 传统算法：IRK → 代数方程组，传统迭代求解器 → 解
			* 这里：IRK → 代数方程组，NO → 近似解，传统迭代求解器 → 解
			* NO 使用代数方程组本身的残差作为 loss 训练
	* eqn(10) 用于不可压 Euler 方程（粒子视角形式），NN 拟合形变梯度 $\Delta F=\partial x_n/\partial x_{n+1}$
		* 用该项可表示 $\nabla p,\nabla\cdot u$ 等项
	* 实验：杯中液体晃动，堤坝破溃
	* p12:-1 增加 IRK 阶数、NN 复杂度不再提高性能，与原 PINN 论文不同；可能因为网络拟合的是形变梯度 $\Delta F$，这依赖于小形变假设
* 2412.13074 含时方程 NO 预测时间导数而非下一步状态
	* "Predicting Change, Not States: An Alternate Framework for Neural PDE Surrogates"
		* Zhou, Anthony; Farimani, Amir Barati; 
		> created on 2024-12-25
	* 摘要摘录
		> 在这项工作中，我们提出了一种替代框架，其中神经求解器预测时间导数，ODE积分器及时转发解，
		> 该框架开销很小，广泛适用于模型架构和PDE。
		> 我们发现，通过简单地改变训练目标并在推理过程中引入数值积分，神经替代物可以获得准确性和稳定性。
		> 预测时间导数还可以使模型不受特定时间离散化的约束，从而在推理或训练更高分辨率的PDE数据时实现灵活的时间步进。
	* sec3.1 训练 label 通过解对 t 做数值微分获得；{_ocpe7h}
	* sec5.1 loss landscape 好于直接预测下一个状态（U-Net，1D Advection 方程）{_ocpe87}
		* 可视化方法为 filter normalization，有引文；{_ocpe8m}
			> 损失景观是通过在一组归一化的随机方向上扰动训练好的权重，并在验证样本上评估扰动后的推出损失来构建的。
		* 原因解释：短时间场的变化太小，要求模型捕捉细微的变化；导数预测可以区分重要的动力学成分
			> 一个潜在的原因是，当以适当的分辨率解决PDE时，未来的时间步通常与当前的时间步相似，但随着时间的推移会有轻微的变化。
			> 这导致预测标签包含有关当前状态的冗余信息，其中学习信号来自状态变化，而状态变化可能很小。
			> 这可能会导致许多局部最小值，其中模型可以学习恒同映射的变化，预测类似于地面真相的潜在状态，因为正向进化只会略微改变解决方案[27]。
			> 然而，尽管局部最小值之间的节点值相似，但这些潜在状态的时间导数可能非常不同。
			> 因此，导数预测可以隔离重要的动态，以便更好地区分潜在的模型预测。
		* 加噪声的观察；加噪声后，场状态变化小，时间导数受影响很大
			> 可视化这种现象的一种方法是比较地面实况和噪声PDE数据及其导数。
			> 我们进行了类似的观察：许多局部最小值可能与真实状态相似，实际上添加少量高斯噪声几乎与真实标签相似；
			> 然而，当进行时间导数时，局部最小值和真实标签之间的差异会被突出显示，以帮助模型学习真实解。
* 2201.09113 AE（GNN 架构）将物理场编码为隐向量，Transformer 隐空间有记忆时间推进
	* "Predicting Physics in Mesh-reduced Space with Temporal Attention" by DeepMind, ICLR2022
		* Han, Xu; Gao, Han; Pfaff, Tobias; Wang, Jian-Xun; Liu, Li-Ping; 
		> 2025-01-09 CSI whn 技术分享会
	* 可长时间准确预测，无需噪声注入即优于单步预测模型；{_p19h8s}
	* 在压缩后的隐空间预测，显存要求低；{_p19h9v}
	* （评）压缩可能造成信息损失，从而需要有记忆预测；{_p19h92}
* COAST-2502.08574 NO 时间推进自适应选取步长，跳过的帧靠插值获得
	* "COAST: Intelligent Time-Adaptive Neural Operators"
		* Wu, Zhikai; Zhang, Shiyang; He, Sizhuang; Wang, Sifan; Zhu, Min; Jiao, Anran; Lu, Lu; van Dijk, David; 
		> created on 2025-02-25
	* 步长由网络预测，架构 GPT2，末 token 位置输出过 MLP，再截断到预设的范围内
		* secA.1.1 惩罚过小的 dt，额外 loss $ReLU(1.5-dt)^2$
	* alg1 同时预测 dt 和 $u_{+dt}$；{_p2qe5y}
		* 输入前 T=4 时间步
		* 插值获得的输出时间步个数 $T'=[dt]$，训练时只比较这些位置处的 loss（不同样本时间推进幅度不同，使用的 label 时间步个数也不同）
		* 实验 baseline 设定，训练时输入也 T=4，输出 T'=1,..,8；测试时取 T'=8
* PITA-2505.10930 自回归式 PDE 基础模型 为降低误差累积，引入类似系统识别的额外 loss；by 陈景润
	* "Physics-informed Temporal Alignment for Auto-regressive PDE Foundation Models"
		* Zhu, Congcong; Xu, Xiaoyan; Han, Jiayue; Chen, Jingrun; 
		> created on 2025-06-11
	* 摘要摘录
		> 自回归偏微分方程（PDE）基础模型在处理时变数据方面显示出巨大的潜力。
		> 然而，这些模型受到自回归预测中根深蒂固的捷径问题造成的误差累积的影响。
		> 对于分布外数据，这一挑战变得尤为明显，因为预训练性能可能接近具有长期动态的下游任务的随机模型初始化。
		> 为了解决这个问题，我们提出了物理信息时间对齐（PITA），这是一种受逆问题求解启发的自监督学习框架。
		> 具体来说，PITA通过将物理信息约束整合到自我监督信号中，将每个给定PDE轨迹上不同时间步发现的物理动力学对齐。
		> 该对齐是从观测数据中得出的，不依赖于已知的物理先验，表明对分布外数据具有很强的泛化能力。
	* fig2 工作流
		> 所提出的框架将自回归预测和PDE发现与自监督学习相结合：
		> （1）预训练PDE模型以初始时间状态{ut}t=1,..,T_in 为输入，以自回归方式预测未来状态{u_t}t=t_in+1,..,+t_ar 为输出；
		> （2）然后对压缩输入序列执行数据驱动的PDE发现，以推断控制方程。{_p6bf2k}
		> 时间对齐是通过将预测中发现的物理定律与地面真值序列中获得的物理定律进行匹配来实现的；
		> （3）损失函数由三部分组成，即数据损失L_data、物理损失L_phy和一致性损失L_con，采用基于不确定性的策略动态调整权重。
* 2507.03863 NO 自回归抑制误差累积，每步时间推进网络用 bagging 降误差；{_p9586d}
	* "Enhanced accuracy through ensembling of randomly initialized auto-regressive models for time-dependent PDEs"
		* Khurjekar, Ishan; Saha, Indrashish; Graham-Brady, Lori; Goswami, Somdatta; 
		> created on 2025-09-05
* 2509.02846 PDE 时间推进“测试时计算”，每步 ensemble 预测、结果中取最符合物理的
	* "Towards Reasoning for PDE Foundation Models: A Reward-Model-Driven Inference-Time-Scaling Algorithm"
		* Mansingh, Siddharth; Amarel, James; Arnab, Ragib; Mohan, Arvind; Singh, Kamaljeet; Kunde, Gerd J.; Hengartner, Nicolas; Migliori, Benjamin; Casleton, Emily; Debardeleben, Nathan A.; Biswas, Ayan; Oyen, Diane; Lawrence, Earl; 
		* 单位：美国 Los Alamos 国家实验室
		> created on 2025-09-05 导师推荐
	* （评）目的手段链条：降 rollout 误差 → 提单步预测质量 → (质量定义,提升方式)
		* 提升方式 → 束搜索，生成后筛选 → (生成机制,筛选机制)
			* 生成机制 → ensemble → 随机输出的网络 → 随机网络 → 推理引入随机性 → 激活值引入 → dropout
			* 筛选机制 取决于前层目的，在这里是 如何定义“预测质量”
		* 质量定义
			* 物理机理：守恒律 or（我认为可能）PDE 残差 loss
			* 网络预测 → 引入对比学习，类似 RLHF 打分网络
	* p4:1 每步推理引入“全局奖励信号”提取最合物理样本，体现守恒律 or PDE loss；其选取重要
		> 虽然当代LLM中的推理提供了一种迭代方式，通过提供一些可解释性的局部变化来提高性能，但在PDE模拟中更难构建类似的局部奖励信号。
		> 在之前关于PDE改进的工作中，仍然缺少局部奖励的概念[7]。
		> 本文提出的TTC方法的核心是从物理守恒定律或可学习的替代损失函数中提取全局信号。
		> 使用全局奖励信号，在给定一批合理的预测的情况下，人们应该能够区分“更好”遵守质量/动量守恒等物理守恒定律的样本。
		> 在具有贪婪策略的自回归推出的每个时间步上选择“最佳”样本，有助于整个轨迹预测在全球范围内遵守守恒定律。{_p9779l}
		> 然而，正如结果所表明的那样，这取决于奖励函数的质量。
	* p5:0 用 PDEgym 的可压 Euler 数据，预训练 4 类、下游两类
		> In this study, we specifically utilize four datasets from PDEGym for pretraining: CE-RP, CE-CRP, CE-KH, and CE-Gauss.
		> For downstream, we use the CE-RPUI and CE-RM dataset,
		* （评）称为“PDE 基础模型”，但其实是同一种方程，只是用不同的 IC 分布
	* p5:-1 输出引入随机性。动机：beam search，方法：推理保留 dropout
		> 随机性：与需要在PDE FMs中重新思考的LLM推理的一个关键区别是，使用模型随机性为同一输入生成多个预测。
			> 在LLM中，由于内部标记化和一种热编码，默认情况下模型是概率性的。
			> 在大多数PDE的ML模型中，情况并非如此，因为它们在本质上通常是确定性的。
		> 因此，为了利用波束搜索等技术，我们必须在基础PDE FM中明确引入固有的随机性，同时不影响模型的整体精度。
		> 将随机性引入任何模型的一种直接方法是通过dropout机制。
			> 我们没有像机器学习的标准那样在训练后禁用dropout，而是在推理时间内保持dropout处于活动状态，这样FM就可以通过采样不同的dropout掩码对同一输入产生不同的预测。
	* p6 判别函数（原文“奖励函数”）选取
		* 用守恒律：eqn(6-8) 质量、动量、能量 守恒，只考虑全局总物理量变化，用相对变化率（除以当前物理量绝对值）{_p98c1w}
		* 可训判别器：eqn(9)-1 训额外模型，称为“过程奖励模型”；{_p98k9u}
			* 输入：当前状态 + NO 预测的下一步，其中 NO 仅预训练 or 已微调
			* 输出：预测误差大小等级，只追求“分级”（类似 RLHF 打分模型）而非定量预测
				> 除了分析奖励函数外，我们还在基础模型的输出上训练了一个可学习的过程奖励模型（PRM）[14]。
				> PRM提供标量值分数，对给定当前快照的下一个快照预测的质量进行分级。
			* 训练数据：NO 在训练集上推理，采样 100 个后选误差最大、最小、中位数的结果
				> 为了训练PRM，我们对预训练/微调模型的每个初始条件采样100个下一步预测（更多细节包含在结果部分）。
				> 根据所选指标（在我们的例子中为MSE）对样本进行排名，并与地面真相进行比较。
				> 我们选择并保存与具有最大、中值和最小分数的预测相对应的三元组样本。
			* 训练 loss：对比学习 loss，要求结果预测 score 对三类的两两差别最好都大于 α
				> 然后，我们引入了一个对比的三重边际损失来训练PRM：LPRM=max(0，rmin−rmedian+α)+max(0、rmedian−rmax+α)
				* p7:0 取 α=0.1
				* p7:0 该 loss 表现好于 RLHF 常用的 Bradley-Terry 模型导出的 loss
	* （评）fig4 看起来增大 B 的收益很有限？或者是我把图片理解错了？
		* fig1d MSE 最多降到原来的 90%，有些时候还会提高？
		* fig3 用可训判别函数时能降到 75%，基于守恒律的则只能 93%
