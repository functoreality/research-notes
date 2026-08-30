* 2602.19265 PINN、NO 谱偏差，可用（PINN）二阶优化器、（NO）谱感知 loss 缓解
	* "Spectral bias in physics-informed and operator learning: Analysis and mitigation guidelines"
		* Khodakarami, Siavash; Oommen, Vivek; Daryakenari, Nazanin Ahmadi; Beekenkamp, Maxim; Karniadakis, George Em; 
		> created on 2026-04-25
	* 摘要摘录
		> 通过神经网络以及柯尔莫哥洛夫-阿诺德网络（KAN），包括物理知情神经网络（PIN）、物理知情 KAN（PIKANs）和神经算符，求解偏微分方程（PDE）已知存在谱偏移，即解中的低频成分学习速度显著快于高频模式。
		> 虽然谱偏置常被视为神经结构的内在表征限制，但它与优化动力学和基于物理的损耗公式的相互作用仍不充分。
		> 本研究系统探讨了物理学和算子学习框架中的谱偏置，重点关注网络架构、激活函数、损耗设计和优化策略的耦合作用。
		> 我们通过频率解析误差指标、巴伦范数诊断和高阶统计矩量化频谱偏倚，实现椭圆、双曲和色散偏微分方程的统一分析。
		> 通过多种基准问题，包括科特韦格-德弗里斯方程、波动与稳态扩散-反应方程、湍流重建以及地震动力学，我们证明了光谱偏置不仅仅是表征性的，更是根本性的动力学问题。
		> 特别是，二阶优化方法显著改变了频谱学习阶，使所有偏微分方程类型的高频模态能够更早更准确地恢复。{_q4pg64}
		> 对于神经算子，我们进一步表明谱偏差依赖于神经算符的架构，并且可以通过谱感知损失的表述有效缓解，而不增加推理成本。{_q4pg69}
* 2602.12349 学 Green 函数，分解为 解析有奇点+可学无奇点 分量，并讨论 BC 施加方式
	* "Variational Green's Functions for Volumetric PDEs"
		* Teixeira, Joao; Grinspun, Eitan; Benchekroun, Otman; 
		> created on 2026-04-25
	* 摘要摘录
		> 格林函数表征偏微分方程的基本解;它们对于形状分析到物理仿真等任务至关重要，但在任意几何离散化上评估时仍然计算量过大。
		> 我们介绍变分格林函数（VGF），这是一种学习线性自伴偏微分方程算子（包括泊松、屏蔽泊松和双谐函数）格林函数光滑且可微的表示的方法。
		> 为解决格林函数特有的尖锐奇异点，我们将格林函数分解为解析自由空间分量和学习修正分量。{_q4pg34}
		> 我们的方法利用变分基础 自然施加诺依曼边界条件，并通过射影层对神经场输出施加狄利克雷边界条件。
		> 所得的格林函数计算快速，可根据源应用微分，并且可以基于参数化几何的其他信号进行条件。
* AMR-Transformer-2503.10257 NO patchify 自适应加密
	* "AMR-Transformer: Enabling Efficient Long-range Interaction for Complex Neural Fluid Simulation"
		* Xu, Zeyi; Liu, Jinfan; Chen, Kuangxu; Chen, Ye; Hu, Zhangli; Ni, Bingbing; 
		> created on 2026-04-25
	* 摘要摘录
	* sec2.1  AMR Tokenizer，自适应加密
		> 传统 ViT 将输入均匀切成大小相同的 patch，AMR Tokenizer 改用基于四叉树（2D）或八叉树（3D）的层次分解。
		> 给定输入场 I（形状 H×W×c），tokenizer 从粗到细逐层递归：
			> 若某区域的物理特征"活跃度"超过阈值，则继续四等分细化并存储；
			> 否则以当前分辨率直接作为一个 token，不再细分。
		> 每个存储的 patch 以该区域内速度场的均值和位置编码（当前深度、中心坐标）拼接成 token 特征向量，最终输出一批大小不均匀、覆盖全域的 patch 表示 I_p（形状 N×K×c）。
		> N 随场景复杂度自适应变化，无需手动指定分辨率。
		> 为了让 tokenizer 能"预见"下一时刻的活跃区域，模型还通过前向欧拉法对当前速度场做一步外推，得到虚拟的 t+dt 速度场，将两个时刻的活跃区域取并集作为最终细化区域，避免遗漏快速运动的边界。{_q4pf9m}
	* sec2.2 网格加密条件，4 准则联合判断；{_q4pg04}
		> 2.2  N-S 约束感知快速剪枝模块
		> "哪些区域需要细化"由四个基于 Navier-Stokes 方程物理量的准则联合判断：
			> 速度梯度（Velocity Gradient）：识别激波前沿、流动分离等速度突变区域；使用当前深度的梯度分位数做自适应阈值，确保每层粒度下都能选出相对"最复杂"的区域。
			> 涡量（Vorticity）：捕捉旋涡、湍流混合等旋转流动结构。
			> 动量（Momentum）：标记主流射流、闸门溃坝等强输运区域。
			> 开尔文-亥姆霍兹不稳定性（K-H Instability）：检测剪切界面上的剪切强度，用于解析层间混合和波形涡结构。
		> 对每个 patch，只要上述四个量中任意一个超过对应阈值，就触发细化。
		> 四个阈值因子在训练时从预定范围内随机采样，使模型对各种精度-效率权衡都具有泛化能力，且允许推理时手动调节阈值后处理以灵活平衡精度和速度。
* HPM-2410.11382 NO 架构，单层内同时用频域（谱卷积）、原空间域（Transolver）信息交互
	* "Holistic Physics Solver: Learning PDEs in a Unified Spectral-Physical Space"
		* Yue, Xihang; Yang, Yi; Zhu, Linchao; 
		> created on 2026-04-25
	* [公众号报道](https://mp.weixin.qq.com/s/O29DIWzJ990AAURxOWfDqQ)
	* 耦合函数 $H(x,\phi)$ 同时输入空间域、频域状态
		> HPM 的核心思路是引入一个耦合函数 H，将逐点物理状态 x 和域级谱基函数 Phi（Laplace-Beltrami 算子特征函数）融合为自适应谱特征函数，记作 H(x, Phi)。
		> 由此定义的整体物理变换（HPT）如下：
		> 前向变换将输入特征投影到整体谱空间：HPT(x) = H(x, Phi)^T * x，得到谱表示 x_hat（维度 h * d_v）。
		> 逆变换将谱表示还原到物理空间：HPT_inv(x_hat) = H(x, Phi) * x_hat。
		> H 同时包含了全局的频域结构（来自 Phi）和每个空间点的局部物理状态（来自 x），使得不同位置可以对不同频率成分施加不同的权重。
	* FNO、线性注意力均为退化情形
		> 从退化情形可以看出两种现有方法实际上是 HPM 的特例：
		> 当 H(x, Phi) = Phi 时退化为 FNO 类固定谱算子；
		> 当 H(x, Phi) = psi(MLP(x)) 时退化为线性注意力机制。
	* 消融后采用特定形式 sec2.2
		> 论文探索了五种耦合形式，最终选定逐点 Softmax 乘法耦合：
		> H(x, Phi) = Softmax(MLP(x)) ⊙ Phi；{_q4pb9r}
			> 其中 ⊙ 表示逐元素相乘。
			> Softmax 保证各频率成分的权重之和为 1，在不同频率之间形成竞争机制；
			> 逐点设计保留了精细的空间自适应性；
			> 与 Phi 相乘则保留了谱结构先验。
		> 在五种形式的消融实验中，逐点 Softmax 乘法（4.38e-3）优于 Sigmoid 乘法（4.86e-3）、全局平均池化版本（5.47e-3）、加法耦合（4.69e-3）和拼接耦合（5.24e-3），证实了逐点操作和频率竞争机制的必要性。
	> 2.3  整体物理求解器的构建
		> HPM 采用与 Transolver 一致的宏观架构：输入投影层 P，L 层 Holistic Physics Block（每层包含 HPM 做 token mixing 和 FeedForward 做 channel mixing，均带残差和 LayerNorm），以及输出投影层 V。
		> 谱基函数 Phi 统一采用 Laplace-Beltrami 算子（LBO）的特征函数，通过 robust-laplacian 库计算，可处理规则网格和不规则三角网格两种物理域。多头设计下，多个并行 HPM 分别处理不同频率子空间后拼接。
		> 理论上，HPM 可以等价为可学习的积分神经算子形式，具备对连续算子映射的万能逼近能力。
* Brep2Shape-2602.07429 CAD 编码方案，兼顾直观性与精确性，双流 Transformer 分别处理边、面
	* "Brep2Shape: Boundary and Shape Representation Alignment via Self-Supervised Transformers"
		* Sun, Yuanxu; Ma, Yuezhou; Wu, Haixu; Zeng, Guanyang; Chen, Muye; Wang, Jianmin; Long, Mingsheng; 
		> created on 2026-04-25
	* [公众号报道](https://mp.weixin.qq.com/s/OceGhf4NJVoZIh2kEgOEjw)
	> 边界表示（B-rep）是CAD的工业事实标准，由参数化曲面、曲线及它们之间的拓扑关系共同描述一个三维实体。
	> 把深度学习用到B-rep上有两条主流路线，但都不令人满意。
		> 一是连续方法，例如BRT，直接以参数化控制点作为输入，数学上精确，但控制点本身是多项式基的系数，与三维空间几何严重解耦，网络很难"看懂"。
		> 二是离散方法，例如UV-Net、BRepNet，把每个面在参数域上离散成2D网格再喂给CNN/GNN，直观但牺牲精度，对采样密度敏感。
		> 论文把这种割裂称作"表示鸿沟"：精确的不直观，直观的不精确。
		> 作者的核心问题是：能不能用一个自监督预训练任务，在保留参数精度的前提下，让网络学到与三维几何对齐的、可泛化的B-rep表示。
	> 2.2  双流Transformer与令牌化
		> 面与边的几何属性差异很大（2D流形 vs 1D曲线），强行混在一个序列里会互相干扰。
		> 作者用两个独立的Transformer分别对Bézier基元做实体内编码，加[CLS]聚合得到面令牌和边令牌，再分别送入面流和边流的Dual Transformer。{_q4pb7c}
		> 两个流并行更新，参数不共享。
* 2602.13873 条件流匹配 据部分观测恢复完整场，训练数据本身仅部分情形 人工额外 mask
	* "Ambient Physics: Training Neural PDE Solvers with Partial Observations"
		* Majid, Harris Abdul; Daras, Giannis; Tudisco, Francesco; McDonagh, Steven; 
		> created on 2026-04-25
	* 设定（我的记号）：$x=(a,u)$（a 系数 u 解），观测位置对应 mask 算子 $A_x$
	* 预期功能：条件生成，从 $p(x|A_xx)$ 中采样
		* 方式：条件 rectified flow $\hat{x}=x_\theta(x_t,t;A_x,A_xx)$
			* 注：流匹配为 OT 设定，故预测瞬时速度 等价于 预测完全去噪解
	* 数据资源：$\{A_xx\}$ 数据集，本身各样本也都只有部分观测
		* 场景设定：真实场景无法获得完整观测
		* （评）推测各样本对应的 $A_x$ 不同；否则意味着部分位置不存在任何观测数据，不太可能学得出来，除非网络架构本身的 inductive bias 够用
	* 朴素训练 loss：$\|A_x\hat{x}-A_xx\|$
		* 导致退化：网络输入本身有 $A_xx$，网络前传会直接利用，导致仅观测位置去噪结果准确，未观测位置不受任何约束
	* 方案—人工额外掩码，记 $B_x=B_xA_x$ 由观测数据进一步子集限制获得；{_q4pa48}
		* 训练 loss $\|A_xx_\theta(x_t,t;B_x,B_xx)-A_xx\|$；即：条件输入小子集 $B_x$ 上观测，惩罚大子集 $A_x$ 上观测结果的匹配度
	* 推理采样 时利用完整观测信息，即 尽管模型输入仅 $B_x$，但还是希望利用完整的 $A_x$ 信息
		* 方案—人工子采样方式取 ensemble：取 $p(x|A_xx)=\mathbb{E}p(x|B_xx)$，其中 $B_x$ 随机生成
		* （评）我觉得推理直接把 $A_x$ 输入网络即可；尽管模型训练时输入的都是 $B_x$，但从架构可输入性考察的话，$A_x,B_x$ 均可作为网络输入，没有区别
			* 原文解释：提升 robustness，提供 UQ
* DOIT-2602.16198 扩散模型改采样过程、使生成结果位于某子集中，每步更新 MC 采多轨迹、筛选可行方向
	* "Training-Free Adaptation of Diffusion Models via Doob's $h$-Transform"
		* Zhu, Qijie; Ye, Zeqi; Liu, Han; Wang, Zhaoran; Chen, Minshuo; 
		> created on 2026-04-24，两天前组会群 lyp 推荐
	* 摘要摘录
		> 适应方法一直是释放预训练扩散模型在多种应用中变革力量的主力。
			> 现有方法通常将适应目标抽象为奖励函数，并引导扩散模型生成高奖励样本。
			> 然而，这些方法可能因额外训练而产生较高的计算开销，或依赖于对奖励的严格假设，如可微性。
			> 此外，尽管这些理论在实证上取得了成功，但理论上的正当性和保证很少被确立。
		> 本文提出 DOIT（Doob-Oriented Inference-time Transformation），这是一种无训练且计算高效的适应方法，适用于通用且不可微分的奖励。
		> 我们方法的核心框架是一个测量传输表述，旨在将预训练的生成分布传输到高奖励目标分布。
			> 我们利用 Doob 的 h -变换实现这一传输，从而对扩散采样过程进行动态校正，并实现高效的基于仿真的计算，而无需修改预训练模型。
			> 理论上，我们通过对动态杜布修正中的近似误差的表征，建立了目标高回报分布的高概率收敛保证。
	* sec3.2 生成结果要求在特定集合（正概率测度）中
		* 如要求 R(x₀) ≥ r₀（设定目标函数下限取值）{_q8ba80}
	* fig1 采样过程调整，每步 t → t' 更新幅度的确定方式
		* （原型版）从 xₜ 出发 Monte Carlo 执行多次独立生成，记录每次生成的完整轨迹（或者至少 $x_{t'}$）{_q8ba79}
			* 实用版：每次只到 $x_{t'}$，之后单次调用网络预测完全去噪结果（相当于后验均值）作为最终 $\hat{x}_0$ alg2；{_q8bb2g}
		* 从生成结果中筛出成功样本
			* 真实使用的版本是 按终态 reward 加权，alg1,2；{_q8ba7n}
		* 取所有生成轨迹的 $x_{t'}$（或其单步去噪量），从中选出成功样本的取平均，作为最终的当前步去噪量；{_q4oh28}
* PIRF-2509.20570 （袁铭泽、金鹏飞等）扩散模型要求满足 PDE，PDE 残差 loss 视为 RL reward
	* "PIRF: Physics-Informed Reward Fine-Tuning for Diffusion Models"
		* Yuan, Mingze; Jin, Pengfei; Li, Na; Li, Quanzheng; 
		> created on 2026-04-24
	* 摘要摘录
		> 我们通过将物理启发生成框架为稀疏奖励优化问题，将对物理约束的遵守视为奖励信号，提出了一种新视角。
		> 该表述统一了以往方法，采用基于奖励的范式，并揭示了一个共同的瓶颈：依赖扩散后验抽样（DPS）式的价值函数近似，这种近似引入了不可忽略的误差，导致训练不稳定和推断效率低下。
		> 为克服这一问题，我们引入了物理知情奖励微调（PIRF）——一种通过计算轨迹级奖励并直接反向传播其梯度来绕过价值近似的方法。
		> 然而，简单的实现会带来低采样效率和数据忠实度受损的问题。
		> PIRF 通过两个关键策略缓解了这些问题：
			> （1）利用基于物理奖励的时空局部性，采用分层截断反向传播方法;
			> （2）基于权重的正则化方案，提升效率，优于传统基于蒸馏的方法。
	* 迭代生成视为 MDP，用 RL 方式微调；{_q4og30}
	* 终步 loss 视为稀疏 reward，用于 RL 微调模型；{_q4og1o}
	* 在微调阶段引入；预训练仍按标准扩散生成
	* 仅微调末层，因 PDE 残差只涉及局部：网络浅层偏重局部，深层偏重全局；{_q4og14}
* AmbientPhysics-2602.13873
	* "Ambient Physics: Training Neural PDE Solvers with Partial Observations"
		* Majid, Harris Abdul; Daras, Giannis; Tudisco, Francesco; McDonagh, Steven; 
		> created on 2026-04-04
	* 摘要摘录
	* 
* 2603.15431 （备用）Poseidon OoD 用 PDE 残差 loss 微调，针对 Poisson 方程
	* "Physics-informed fine-tuning of foundation models for partial differential equations"
		* Medvedev, Vlad; Armbruster, Leon; Straub, Christopher; Kruse, Georg; Rosskopf, Andreas; 
		> created on 2026-04-02
* LegONet-2603.07882 含时 PDE 算子分裂、各项学独立网络，不同 BC 的网络独立
	* "LegONet: Plug-and-Play Structure-Preserving Neural Operator Blocks for Compositional PDE Learning"
		* Zhang, Jiahao; Wang, Yueqi; Lin, Guang; 
		> created on 2026-03-31
	* 摘要摘录
		> 我们介绍了类似乐高的运算子网络（LegONet），这是一个组合框架，通过定义在共享边界适应谱表示上的即插即用、结构保持的算子块构建偏微分方程求解器。
		> LegONet 将边界处理与机制学习分离，通过构造满足边界条件。
		> 它还将机制学习与时间积分分离，使预训练块能够在无需重新训练的情况下组装成新的求解器。{_q42b25}
		> 我们还推导出有限视距误差分解，将块错配与分裂误差区分开来，并为长视野预测提供机制层面的诊断。
	* BC 仅学齐次的，非齐次情形通过变换化归为齐次情形 eqn(2)-1
		> 对于非齐次边界数据，我们应用一个提升 u=ulift+u0 ，使 u0 得满足齐次约束，
	* 训练、推理方式差异 sec1:-1
		> LegONet 还将培训与部署区分开来。
		> 分组通过系数空间中的瞬时算符匹配离线预训练：我们采 𝐚 样可接受态，评估可信离散化以获得参考目标，并学习每个分组，使得 Fi𝜽(𝐚) 匹配无轨迹拟合的参考机制更新。
		> 部署时，通过选择底板、选择相关块并通过对称斯特朗分割推进所得的简化动力学，创建一个新的偏微分方程实例。
		> 因此，重新配置算符或边界设置变成了选择与组装的问题，而非重新训练的问题。
		> 这种模块化视角也使得长视野行为更具解释性：我们的有限视野分析将滚动错误分为块错配和拆分误差，使失败可以归因于学习机制或组合方案。
* Flowers-2603.04430 NO 架构，基于坐标扭曲（Lagrange 视角），多头逐点预测位移场
	* "Flowers: A Warp Drive for Neural PDE Solvers"
		* Muser, Till; Spitzer, Alexandra; Lassas, Matti; de Hoop, Maarten V.; Dokmanić, Ivan; 
		> created on 2026-03-29
		* [公众号AI4Physics报道](https://mp.weixin.qq.com/s/cQrY4iCTirG5AVv7oekVzA)
	* fig1 多头 self-warp 层，每个头输入 u、输出 Vu(x + ρ(u(x)))（可微插值）{_q3tf4e}
		* 位移场 ρ 由逐点 MLP 生成，代码用 1x1 卷积实现
		* H 头结果 concat
		> 非局部性仅通过采样引入：每个头在每个空间位置只采样一个远程坐标，H个头共采样H个点。这使得计算复杂度与网格点数成线性关系，而非二次关系。
		* block 输出 GELU(GroupNorm(Warp[u] + Wu))
	> 2.2 三个物理视角的理论动机
		> 流图视角：对标量守恒律 dt(u) + div(G(u)) = 0，解在激波形成前是初始条件沿逆流图的pullback：u(t,x) = Phi^{-1}* u(s,·)。位移量仅依赖于局部状态u(t,x)——这恰好就是Selfwarp所做的。
		> 波动方程与几何光学视角：对变速波动方程，几何光学近似下解是沿射线的多条到达路径的叠加。每条射线对应一个头，从不同方向的源坐标采样——多头warp自然对应这种角度积分的离散近似。
		> 动力学理论视角：当头数趋于无穷、层数解释为时间步时，架构收敛到一个广义Boltzmann型方程，头索引对应提升相空间中的传输模态。
		> Flowers在时间无关的Helmholtz方程上也取得了强劲表现（VRMSE 0.0463，FNO为0.0987），作者坦言这"令人困惑"——warp的理论动机来自传输和波动，对非输运问题为何有效缺乏解释。
	> 2.3  架构：多尺度U-Net骨架
		> Flower块（残差pullback块）由GroupNorm、多头warp、1x1卷积跳跃连接和GELU激活组成。
		> 这些块嵌入标准的U-Net多尺度框架中：输入先拼接坐标场并逐点提升通道数，经编码器（stride-2卷积下采样）、瓶颈层、解码器（转置卷积上采样+跳跃连接），最后逐点投影到输出通道。
		> 基准模型Flower-Tiny：160通道、40个头、4个尺度层级，约1730万参数。
	> 作者明确承认的局限：
		> 第一，不理解学到的warp何时对应物理上有意义的传输，对非双曲型物理问题缺乏理论解释。
		> 第二，自回归rollout的稳定性仍不理想，尚不清楚如何系统性地改善。
		> 第三，在扩散主导的问题（如Gray-Scott反应扩散、active matter）上，Flowers虽然优于同规模基线，但未能达到Poseidon和Walrus等预训练大模型的水平。
		> 第四，三个理论视角是直觉构建而非因果解释。
* GeoPT-2602.20399 变区域流体 NO 无标签预训练、只用几何信息，要求预测常速粘附输运粒子轨迹，认为该人造任务好于预测 SDF
	* "GeoPT: Scaling Physics Simulation via Lifted Geometric Pre-Training"
		* Wu, Haixu; Guo, Minghao; Li, Zongyi; Dou, Zhiyang; Long, Mingsheng; He, Kaiming; Matusik, Wojciech; 
		> created on 2026-03-09
		* 另可参考 [公众号报道](https://mp.weixin.qq.com/s/ZeL8FRDm-IT1nGM2mKCCpg)
	* 方程类型：流体，给定区域形状、无穷远速度，预测稳态流场（不含时）
	* fig1 几何信息辅助的不同方式 实验效果比较
		* 几何预训练：预测 SDF 作为预训练任务；甚至明显不如最 naive 做法（直接从头训）
			* sec5:4 预测矢量距离 远好于 SDF（符号距离）{_q3af9x}
		* 网络架构额外输入几何特征：用混元 3D VAE 提取特征后，作为 NO 额外输入（condition）；比最 naive 做法（默认架构从头训）还差一点；{_q3ab4v}
		* 本文方法有明显优势（收敛加速、数据需求降低）
	* 预训练任务：构造合成动力学，要求预测各空间点 未来若干时间步的位置 eqn(5)；{_q3ag09}
		* 网络输入：速度（单个向量，全局统一）+ 各散点位置，分量数 3 + 3P
		* 网络输出：各散点未来位置，3TP
		* （评）输入与正式训练时的输入含义基本一致；输出含义和 shape 不一致，正式训练为各点速度 3P
		* 合成动力学：区域内为常速度场，碰到边界就停止 eqn(4)
			* 动机：近似真实场景，真实速度场中的 tracer 输运方程 eqn(3)
			* 解读：相当于 学输运方程，带 sticking boundary
	* 预训练数据分布：
		* 全局速度：球内均匀分布 eqn(4)
		* 区域形状：纯几何形状数据集（规模明显大于仿真数据集）
			* ShapeNet 子集，选出相关领域的（车、飞机、船），10k+ 样本；尽管与工业模型不同
		* （另外还有）散点的空间分布
	* 注：本文预训练方法架构无关；实验主要用 Transolver，也涉及 Galerkin Transformer、GNOT、UPT
* 2509.25788 变区域 NO 预训练只用几何信息，预测 occupancy field；{_q5cg5n}
	* "From Cheap Geometry to Expensive Physics: Elevating Neural Operators via Latent Shape Pretraining"
		* Zhang, Zhizhou; Wu, Youjia; Zhang, Kaixuan; Wang, Yanjia; 
		> created on 2026-05-12
	* "From Cheap Geometry to Expensive Physics: A Physics-agnostic Pretraining Framework for Neural Operators", ICLR 2026
	* fig2 输入计算域内点云，输出 INR 在计算域外 query point（如机翼内部）输出 0
		* INR 实现为 Transformer-based NO，branch net 输入几何（点云过编码器后的输出），trunk net 输入坐标点
	* fig3 数据的散点分布，输入点云可用 mesh（接近边界处加密）、计算域内均匀分布
		* 输出点云（label 位置），方形域内均匀分布 or 对计算域 mesh 散点加随机扰动（从而接近边界处加密）
* 2601.11428 FNO 失效模式大规模评估，5 数据集各训 200 个模型后验证
	* "Forcing and Diagnosing Failure Modes of Fourier Neural Operators Across Diverse PDE Families"
		* Shikhman, Lennon; 
		> created on 2026-02-25
	* （以下为 sec4 讨论）
	* 仅保留低频，导致细尺度表征不足；{_q2pf5n}
		> 也许最明显的问题是 FNO 的频谱限制 。
		> 尽管采用傅里叶表示，给定的 FNO 具有固定数量的模态，因此其分辨率也固定，超过该分辨率无法表示函数。
			> 当我们要求它以比训练更高的分辨率或更粗糙的输入工作时，它根本无法生成缺失的高频成分。
			> 这表现为分辨率偏移的中度退化因子和高傅里叶模式下明显的误差集中（如图 3 和图 6 所示）。
		> 值得注意的是，这并非 FNO 独有——许多神经网络对低频表现出频谱偏向（Tancik 等 ，2020）。
		>  缓解这一问题的方法包括使用多分辨率数据或专门设计为层级尺度设计的架构，以填充逐渐高频的细节。
			> 我们的结果强烈鼓励采用此类多尺度技术，尤其是当期望能够跨分辨率推广或输出具有比训练中更细微特征的输出时。
	* OoD 泛化不足
		> 另一个广泛的问题是分布转移下的泛化 。
		> 分布外边界条件（泊松、布莱克–斯科尔斯）和参数值（NLS、布莱克–斯科尔斯）的巨大误差表明，神经算符在训练分布支持下根本受限。
			> 它们并不固有地了解底层偏微分方程，无法在未遇到的系统中求解。
			> 这类似于标准神经网络在分配外输入时失效的情况。
		> 然而，在偏微分方程求解的语境下，可能会诱人地假设模型已经“学会了方程”;我们的实验提醒我们，学习算子可能是一个狭隘的解，利用训练集中的模式。
			> 例如，Black–Scholes FNO 很可能学会了利用训练收益的平滑性，甚至线性性，但却没有处理不连续性的概念。
		> 解决这一问题可能包括在更丰富的函数集上显式训练（这会增加数据需求），或将已知的线性或边界条件原则嵌入模型架构中。
			> 一些近期研究尝试为神经求解器配备边界条件处理 （Kovachki 等，2021）， 但这仍是一个具有挑战性的领域。
	* 自回归误差累积
		> 我们观察到的展开不稳定性，
			> 尤其是在 Navier–Stokes 和 K–S 中，凸显了使用学习替代者用于动力系统时的一个常见陷阱。
			> 这一点在气候/天气模拟中广为人知 （Pathak 等 ，2022）， 这里也得到了重申：一步精度并不保证多步稳定性。
		> 诸如添加物理约束或在网络中使用隐式时间积分器等技术可以改善这一点，
			> 但从根本上说，如果系统是混沌的，任何模型都需要频繁重新对齐地面真实情况，或者纳入概率预测来解释偏离轨迹。
			> 我们的确定性 FNO 只是沿着自己的轨迹前进。
		> 一个有前景的方向是将学习与控制或滤波的理念结合起来，持续修正漂移。
	> 一个令人惊讶的观察是 degradation 因子略低于 1。
		> 我们在 K–S 和 Black–Scholes 中的小扰动中看到了这一点，起初这让我们感到困惑。
		> 这意味着受扰输入的模型误差比原始输入略低。
		> 分析后，我们的理解是，这并不意味着模型在噪声数据上表现更好（这里没有白吃的），而是在这些情况下，轻微的扰动并未增加难度，甚至可能消除原始输入中某些最坏情况的特征。
			> 例如，如果原始输入存在模型难以处理的特定模式，添加噪声可能会稍微扰乱该模式，使模型的近似（通常更平滑或偏向简单模式）反而更接近扰动输入的真实解。
			> 换句话说，模型可能因不必精确拟合一个锐利特征而受益，如果该特征被噪声模糊。
		> 然而，从统计学上看，差异很小;这些降解因子的置信区间包括 1 或略低于 1，表明这些效应充其量只是次要效应。
		> 主要结论是，我们未发现对输入扰动表现出高度不稳定行为的证据——这是一个令人鼓舞的信号，表明这些神经算符不会引入不可预测的高灵敏度，实际上相当稳定（很可能是由于隐式正则化）。
* MAD-SNO-2601.11222 线性椭圆方程解可由全空间基本解表出，NO 学 D2N+N2D map 即可
	* "Operator learning on domain boundary through combining fundamental solution-based artificial data and boundary integral techniques"
		* Wu, Haochen; Wu, Heng; Lu, Benzhuo; 
		> created on 2026-02-24
	* eqn(4) 若 PDE 有两类边界 D,N，NO 只需学 $u|D,u_n|N\mapsto u_n|D,u|N$；{_q2oa5d}
	* eqn(6-13) 考虑的 Laplace（或带源的 Poisson）边值、Helmholtz 方程都有已知的（全空间）基本解
	* sec2.3 造数据，用基本解（而非传统求解器）构造解使满足内部方程，即可训 D2N+N2D map
		* 可证明这样构造的解在 $L^2(\partial\Omega)$ 稠密，从而训练有效
		* eqn(17) Laplace 方程，训练数据 u 为 $\Delta u=\sum c_i\delta_i$ 的全空间解，各 Dirac 函数权重和为 1；{_q2oa7j}
		* 注：前序工作 MAD（Mathematical artificial data）已经这么造解
* PhIS-FNO-2602.02264 PINO 训练课程学习，先保证满足 BC，再逐步引入内部 loss；跨阶段时 Adam 重置
	* "Unsupervised Physics-Informed Operator Learning through Multi-Stage Curriculum Training"
		* Marcandelli, Paolo; Mathur, Natansh; Markidis, Stefano; Siena, Martina; Mariani, Stefano; 
		> created on 2026-02-23
	* sec1 主要贡献 2：PINO 训练课程学习，跨阶段时 Adam 应重新初始化；{_q2nf0f}
		> 2. 基于课程的优化。
		> 我们引入了一种多阶段训练策略，先在边界约束下优化网络，然后逐步纳入域内的物理残差损耗。
		> 每次转变时，优化器会被重新初始化——作为一种自我迁移学习——稳定收敛并防止梯度偏置的积累。
		> 在所有测试的偏微分方程中，这一机制对于完全无监督环境中的收敛至关重要。
	* sec2.5 课程学习：先保证拟合 IC,BC，再逐步引入内部 loss；{_q2ne9v}
		> 在本研究中，我们提出了一种多阶段的课程训练策略，以反映偏微分方程的数学良定性：
		> 网络在给定初始条件时，首先学习满足边界条件，从而固定解规范，
		> 只有在后续阶段，PDE 残差才在内域被强制执行。
		> 每个转变对应课程中的一个新阶段，边界损失和残差损失的相对权重根据第 2.1 节引入的同伦启发表述演变。
	* fig8 有效学习率，不重新初始化则持续下降
		* “有效学习率”定义 $\eta m_t/\sqrt v_t$，sec2:-2；即实际参数更新量
* 2602.04082 Helmholtz 高频解需用扩散生成模型，而非确定性预测；代码数据已公开
	* "A Probabilistic Framework for Solving High-Frequency Helmholtz Equations via Diffusion Models"
		* Zou, Yicheng; Lanthaler, Samuel; Salahshoor, Hossein; 
		> created on 2026-02-22
	* sec4:1 训练数据；{_q2mg2h}
		> 对于固定频率，我们合成一个由 10000 对声速图和亥姆霍兹解组成的数据集，即 {cj(x),uj(x)}j=110000 。
		> 每个 cj 数据均使用一族高斯随机场（GRF;见 A.1）生成，GRF 参数从幅值和相关长度范围内随机选择。
		> 在 10000 个综合数据中，我们分别分配 8190、1020 和 500 个用于训练、验证和测试。
	> 用于重现所有图形和表格的代码和脚本可在以下网站获取：
		> https://github.com/YichengZou626/Diffusion-Model-for-High-Frequency-Helmholtz
		> 本研究、模型训练和后处理流程生成的数据集均记录在仓库中。
* Transolver-3-2602.04940 （备用）(de)slice 用矩阵乘结合律加速，tile 划分物理态计算
	* "Transolver-3: Scaling Up Transformer Solvers to Industrial-Scale Geometries"
		* Zhou, Hang; Wu, Haixu; Shangguan, Haonan; Ma, Yuezhou; Weng, Huikun; Wang, Jianmin; Long, Mingsheng; 
		> created on 2026-02-22
	* 摘要摘录
		> 我们介绍 Transolver-3，Transolver 家族的新成员，作为一个高度可扩展的框架，专为高精度物理仿真设计。
		> 为了弥合 GPU 有限容量与复杂工程任务分辨率要求之间的差距，我们引入了两项关键的架构优化：
			> 利用矩阵乘法结合性质实现更快的切片和解片，
			> 以及几何切片铺砌来划分物理态计算。
			> 结合通过在原始高分辨率网格的随机子集上学习的摊销训练策略和推断过程中的物理状态缓存技术，Transolver-3 实现了工业级网格的高保真场预测。
		> 大量实验表明，Transolver-3 能够处理超过 1.6 亿个网格，在包括飞机和汽车设计任务在内的三个具有挑战性的模拟基准中取得令人印象深刻的性能。
	> fig3 Transolver-3 的解耦推断。（a） 物理状态缓存：将高分辨率网格中全局信息汇聚为缓存状态。（b） 全网格解码：通过与物理状态缓存交互预测网格坐标上的物理场。
* Phaedra-2602.03915 VQ-VAE 离散 token 不适用于物理场，建议 形态、振幅 独立表示；Poseidon 组
	* "Phaedra: Learning High-Fidelity Discrete Tokenization for the Physical Science"
		* Lingsch, Levi; Kissas, Georgios; Jakubik, Johannes; Mishra, Siddhartha; 
		> created on 2026-02-21
	* VQ-VAE,FSQ 等离散 tokenizer 不适用于物理场
		> 我们认为像 VQ-VAE 和 FSQ 这样的图像分词器在此语境下的缺陷可归因于以下因素
		> i） 感知与物理真实度：
			> 图像分词器针对感知相似性（LPIPS）进行了优化，产生模仿自然纹理的高频信息。
			> 在物理学中，小尺度梯度中的此类误差可能违反守恒定律和对称性，或在时间步进过程中导致光谱行为发散。
		> ii） 无界动态范围：
			> 自然图像是严格有界的（例如像素值在[0,255]）。
			> 而物理场则表现出较大的重尾分布，动态范围较大，如图 2 所示。
			> 因此，标准的固定令牌码本难以捕捉稀有的高能量事件，同时又不牺牲大部分低能量流的分辨率。
		> iii） 振幅-形态冲突：
			> 离散码本迫使权衡。
			> 为了捕捉细微的大小变化，码本必须达到指数级的庞大。
			> 然而，要捕捉多样的几何形状，密码本必须语义丰富。
			> 试图用单一整数码同时实现两者，会造成瓶颈，模型生成特征的正确“形状”，但无法重建其精确强度，反之亦然。
		* 注：FSQ 指 finite scalar quantization
	* 提出的 tokenizer：形态、振幅 独立表示，分别 向量、标量；{_q2lf2b}
		> 为了解决现有科学数据图像分词器的这些不足，本文的主要贡献是提出 Phaedra，
		> 这是一种用于物理科学的新型分词器，旨在通过两种互补的离散表示来表示空间变化的场域：形态学，即存在的模式;以及振幅，一个正交元素，捕捉场的绝对大小。
			> 形态通过矢量量化离散化形成可重用的局部模式码本，而振幅流则通过标量量化离散化，以保持大小和动态范围，保持稳定且分布感知性。
			> 通过重组这两个因式分解词来重建物理场，使模式和物理尺度能够独立学习，从而纠正图像分词器的失效模式。
		> 离散令牌化使得使用可扩展的生成模型成为可能，同时不牺牲科学所需的数值精度。
			> 我们证明，Phaedra 在复杂物理数据集上的表现显著优于最先进的图像分词器（包括 Cosmos [25] 和 VAR [37]）。
			> 此外，我们证明该表示具有强有力的推广性，在未见偏微分方程族、地球观测数据和 ERA5 再分析天气数据上展现出强大的零射点重建能力。
* 2602.04923 （Poseidon 组）NO 架构强调 BC 信息，边界函数延拓到全区域、按交叉注意力输入；造 18 不规则区域数据集
	* "Imposing Boundary Conditions on Neural Operators via Learned Function Extensions"
		* Mousavi, Sepehr; Mishra, Siddhartha; De Lorenzis, Laura; 
		> created on 2026-02-21
	* 摘要摘录
		> 我们构建了 18 个具有挑战性的数据集，涵盖泊松、线性弹性和超弹性问题，包含高度变异、混合类型、分量和多段 BC 在不同几何形态上。
	* sec1 BC 影响最大的是椭圆方程，而非抛物、双曲，故数据集用 Poisson
		> 本研究重点探讨偏微分方程边界值问题（BVP）的 OL，其中解对 BC 极为敏感。
		> 对于抛物线和双曲偏微分方程，解通常在短时间内对 BC 的敏感度有限。
			> 在抛物型偏微分方程中，扩散样行为使 BCs 的影响随时间逐渐传播，而非瞬时引发全局效应。
			> 类似地，双曲偏微分方程传播速度有限，导致 BC 具有局部和时间延迟的影响。
		> 而椭圆偏微分方程则无关时间，其在定义域内任意点的解取决于沿整个边界施加的 BCs。
			> 因此，即使是 BCs 的微小变化也可能导致解的全局变化，因为没有固有的传播方向。
			> 因此，当前研究将椭圆偏微分方程视为 BC 敏感性的最坏情况。
		> 尽管如此，本研究提出的所有方法和技术均直接适用于初始边界值问题，且无预期局限。
	* sec4 数据集方程：Poisson、线性弹性、超弹性；{_q2la6a}
	* figC.1 数据集中各几何的点云分布，形状包括 圆、方形、回旋镖，均有相应的挖洞版本
		* 默认仅 BC 变化，几何、PDE 参数固定，以最大化解算子对 BC 敏感度；Mixed 数据则会同时变
		> 每个数据集包含 8,704 个实现（样本），其中 256 个保留用于测试。
		> 所有结果均通过 FEniCS 项目 [4] 的 Python 接口，结合由 Gmsh 库 [10] 生成的网格，使用有限元法获得。
			> 这些问题在 CPU 上以双精度运行。
			> 所有域均使用无结构三角形网格离散化，边界附近局部细化，网格大小约为 11,700 至 17,600 个节点。
		> 我们使用线性形状函数处理泊松问题，使用二次形状函数处理线性弹性和超弹性问题。
			> 对于超弹性问题，解通过更细的网格（节点数范围在 44,000 至 67,000 节点之间）获得，并在存储前进行下采样。
		> 值得注意的是，我们只存储节点坐标和数据集中每个字段对应的值。
	* [数据集开源地址](https://zenodo.org/records/18377370)
		* 原文链接： https://dx.doi.org/10.5281/ZENODO.18377370
		* 原文链接 2： https://doi.org/10.5281/zenodo.18377370
	* sec3 边界函数延拓到区域内：零延拓，调和延拓（Laplace 方程解），可学延拓；{_q2la97}
* 2602.10150 SWin3D 用于 JHU 湍流数据集；涉及 patch 边缘光滑性 loss
	* "PEST: Physics-Enhanced Swin Transformer for 3D Turbulence Simulation"
		* Dai, Yilong; Chen, Shengyu; Jia, Xiaowei; Givi, Peyman; Yu, Runlong; 
		> created on 2026-02-20
	* fig2 Transolver，DPOT 等 patch 边缘有明显棋盘伪影
	* fig6,7 梯度 loss 消除棋盘伪影；{_q2kf0k}
* 2602.15184 NO 数据增强，用简化 PDE 生成大量数据联训
	* "Learning Data-Efficient and Generalizable Neural Operators via Fundamental Physics Knowledge"
		* Ma, Siying; Zadeh, Mehrdad M.; Soroco, Mauricio; Chen, Wuyang; Cao, Jiguo; Ganesh, Vijay; 
		> created on 2026-02-19，lzn 推荐
	* 摘要摘录
		> 受数值求解器与不同偏微分方程模拟的兼容性启发，我们提出了一个多物理训练框架，结合原始偏微分方程及其简化基础形式进行学习 。
		> 我们的框架提升了数据效率，减少了预测误差，并改善了分布外（OOD）泛化能力，尤其是在涉及物理参数变化和合成到实际传输的场景中。
		> 我们的方法与架构无关，并在广泛的 1D/2D/3D 偏微分方程问题中，展示了归一化均方根误差（nRMSE） 的持续改进 。
		> 通过大量实验，我们表明，显式地融入基础物理知识显著增强了神经算符的泛化能力。
	* fig3 方法概览，原 PDE 直接 heavy simulation 之外，额外 decompose 形成 basic forms、允许 cheaper simulation；两部分数据联合训练
		> sec3.1.1 我们建立了系统流程来定义偏微分方程的基本物理知识 ，即基本偏微分方程项 ：
			> 1）保留支配本质和主导物理动力学的项；{_q2ka3d}
			> 2）去除诱导求解器刚度、增加计算成本或对目标模式形成贡献较小的项。
			> 该过程通常能得到简化的偏微分方程形式，可以更高效地模拟，同时仍能捕捉原始系统的关键物理动力学。
			> 从机器学习的角度来看，将偏微分方程分解为其基本形式，是一种数据增强策略，可以降低数据收集成本。
	* eqn(3) FN 方程去掉反应项、仅保留扩散（> 二分量不再耦合）
		> 为什么要放弃反应词？
			> 该形式保留了本质的分散动力学，但消除 u 了与 v 之间的反馈耦合。
			> 非线性反应项可以快速变化，从而在偏微分方程中引入刚性。
			> 这种刚度要求更短的时间步以实现稳定的数值积分，从而增加计算成本。
			> 通过省略这些非线性项，系统变得线性，更适合高效数值解。
		> 为什么优先考虑扩散项？
			> 纯扩散虽然更简单，但编码了诸如各向同性扩散和质量守恒等关键性质，为学习提供了归纳偏置。
			> 与局部更新激活剂和抑制剂浓度的反应项不同，扩散项支配空间耦合，是图案形成和空间动力学的主要来源，促进运输和稳定，
			> 这也解释了图 4 a1 和 a2 中视觉上的相似模式。
	* eqn(4) INS 变无粘 Burgers 对流形式
		> 为什么要降低压力和扩散项？
			> 压力项是流体不可压缩性的强制要求，需要求解大型线性系统，且难以并行化且计算量大。
			> 省略它能显著加快模拟进程。
			> 类似地，纳维-斯托克斯中的扩散项通常使用带有子步的显式欧拉积分，增加了复杂性。
			> 去除它会进一步简化模拟。
			> 此外，对于许多视觉效果如烟雾或火焰，粘度极低，扩散项视觉冲击力很小，通常可以省略而不影响真实感。
		> 为什么优先考虑对流项？
			> 从计算角度看，对流项成本较低，因为它描述了流体的局部传输，无需跨空间域迭代。
			> 与此同时，对流是大多数流体流动运动的主要驱动力，因为它运输涡度和质量。
			> 没有它，流体就会静止不动，或者被动地响应力。
			> 它捕捉了非线性自交互，这对于动态且复杂的行为至关重要。
	* eqn(6) KS 去除非线性对流项
		> 为什么要去掉非线性对流项？
			> 对于小振幅或短时间， ， −𝒖∂x𝒖 在 中 是更高阶 𝒖 ，因此线性动力学决定了不稳定性和模式形成。
			> 去除该项还消除了昂贵的傅里叶变换，从而显著加快了仿真速度。
		> 为什么优先考虑高阶稳定/不稳定项？
			> 破坏 −∂xxu 与稳定之间的平衡 −∂xxxxu 决定了混沌模型增长或衰减的速度。
			> 四阶耗散对于控制刚度和确保解的平滑性尤为重要，因此对于稳定的数值积分至关重要。最后，在实际作中，许多界面/湍流模型正好归结为“抗扩散+扩散”结构，因此分析这些术语提供了广泛可迁移的见解。
* DiSOL-2601.09143 应对几何区域大幅度形变的 NO，似乎用了局部特征组装、全局求解机制；生成了随机区域数据集
	* "Discrete Solution Operator Learning for Geometry-Dependent PDEs"
		* Bai, Jinshuai; Li, Haolin; Khodaei, Zahra Sharif; Aliabadi, M. H.; Gu, YuanTong; Feng, Xi-Qiao; 
		> created on 2026-02-06
	* 摘要摘录
		> 神经算符学习通过将算符近似为连续函数空间之间的映射，加速偏微分方程的求解。
		> 然而，在许多工程环境中，变化几何形状会引发离散的结构变化，包括拓扑变化、边界条件或边界类型的突然变化，以及计算域的变化，这些都打破了光滑变分的前提。
		> 这里我们介绍离散解算子学习（DiSOL），这是一种互补范式，学习离散解过程而非连续函数空间算子。
		> DiSOL 将求解器分解为可学习阶段，这些阶段类似于经典离散化：局部贡献编码、多尺度组装以及嵌入网格上的隐式解重建，从而保持过程层级一致性，同时适应几何依赖的离散结构。
		> 在几何依赖的泊松、平流扩散、线性弹性以及时空热传导问题中，DiSOL 在分布内和强烈分布外几何（包括不连续边界和拓扑变化）下都能实现稳定且准确的预测。
		> 这些结果凸显了在几何主导问题中程序算子表示的必要性，以及位置离散解算子学习作为科学机器学习中独立且互补方向的必要性。
	* secB.1 数据生成-区域几何生成
		* 单连通情形：1. 2D 区域内随机采样 20 个控制点，2. 边界提取算法找 closed envelope（非凸），3. 提取出的边界点作为闭合 B-spline 的控制点，4. 离散到均匀网格；{_q26a91}
			* figS1 示例；步骤 2 有参数 α∈(0,1) 控制 envelope 的 tightness，越大则区域越复杂（训练数据默认 α=0.8）
		* secB.2 边界提取使用标准的 boundary tracing 算法
* SCaSML-2504.16172 高维方程 PINN/DRM 得粗解，精解残差用 Monte Carlo 方法估计 by 陆一平
	* "Physics-Informed Inference Time Scaling for Solving High-Dimensional PDE via Defect Correction"
		* Fan, Zexi; Sun, Yan; Yang, Shihao; Lu, Yiping; 
		> created on 2026-01-27，来自作者票圈介绍的自己工作
	* fig1b,fig3a 求解流程，设方程形如 线性+非线性项 $Au+f(u)=0$；{_q1r87z}
		* step1 训练得近似解 $v$ 满足 $Av+f(v)=\epsilon$（原文称为 surrogate model）
		* step2 残差 $u-v$ 满足 semi-linear 方程，可用随机方法（Feynman-Kac）解
* REALM-2512.18595 多尺度多物理基准数据集，更近真实挑战，已预设训练评估协议+预处理+自回归策略
	* "Benchmarking neural surrogates on realistic spatiotemporal multiphysics flows"
		* Mao, Runze; Zhang, Rui; Bai, Xuan; Wu, Tianhao; Zhang, Teng; Chen, Zhenyi; Lin, Minqi; Zeng, Bocheng; Xu, Yangchen; Xiang, Yingxuan; Zhang, Haoze; Goswami, Shubham; Dawe, Pierre A.; Xu, Yifan; An, Zhenhua; Yan, Mengtao; Lu, Xiaoyi; Wang, Yi; Bai, Rongbo; Gao, Haobu; Fang, Xiaohang; Li, Han; Sun, Hao; Chen, Zhi X.; 
		> created on 2026-01-26
	* 摘要摘录
		> 由于多尺度、异构物理过程的严重耦合，预测多物理动力学计算成本高且具有挑战性。
		> 虽然神经替代者承诺带来范式转变，但该领域目前仍存在“掌控幻觉”，正如顶级评论反复强调的那样 [ 参考文献 1] 现有评估过度依赖简化的低维代理指标，未能揭示模型在现实环境中固有的脆弱性。
		> 为弥合这一关键差距，我们提出了 REALM（REalistic AI Learning for Multiphysics），这是一个严格的基准测试框架，旨在测试具有挑战性的应用驱动反应流中的神经替代。
		> REALM 拥有 11 个高保真数据集，涵盖从规范多物理问题到复杂的推进和消防安全场景，
		> 并配备标准化的端到端培训与评估协议，包含多物理感知预处理和稳健的推广策略。
		> 利用该框架，我们系统地对十多个代表性替代模型家族进行了基准测试，
			> 包括谱算子、卷积模型、变换器、点算子和图/网格网络，
		> 并识别出三个稳健趋势：
			> （i）由维度、刚度和网格不规则性共同支配的缩放障碍，导致展开误差迅速增加;
			> （ii） 性能主要由架构归纳偏见控制，而非参数数量;
			> 以及（iii）名义准确度指标与物理可信行为之间存在持续的差距，高相关性的模型仍然遗漏关键的瞬态结构和积分量。
		> 综合来看，REALM 揭示了当前神经替代者在现实多物理流中的局限性，并为推动下一代物理感知架构的发展提供了严谨的测试平台。
	* fi1b PDE-ODE 耦合：CNS + 化学反应，后者时间尺度远小于前者
	> fig1 REALM 基准测试及问题设置概述。{_q1sa7f}
		> a. 多物理反应流。喷射-火焰构型的示意图，其中大尺度相干运动与小尺度涡流相互作用;在火焰前缘，标量扩散使陡峭的坡度变得正则化。
		>  b，耦合 PDE-ODE 动力学。{_q1sa7d}
			> 反应流遵循 CNS 系统，采用扩散和化学反应（如面板所示）。
			> 这里， 𝐪 表示守恒的状态向量; ℱ(𝐪) 是对流通量; 𝒟(𝐪,∇𝐪) 收集扩散贡献;是 𝒮(𝐪) 从化学常微分方程系统获得的源。
			> 该面板强调了严重的尺度分离（化学 10−12−10−9 与流动 𝒪(10−1) s）、快慢通路共存、波数间湍流混合，以及浓度剖面中对流与扩散的对比特征。
		>  c、REALM 中使用的数据集示例，涵盖典型问题、高马赫反应流、推进发动机场景和火灾隐患情形。
		>  d、REALM 训练与评估协议：多尺度预处理与自回归训练。
			> 输入/输出显示多种工作条件下 {C1,C2,…} 的场，每个状态都有 Np 场。
		>  e，REALM 多尺度预处理：species 质量分数经过 box-cox-type 变换 ℱBCT ，将动态范围从 𝒪(10−k) 压缩到 𝒪(1) ，随后对所有变量进行 z-分数归一化。
		>  f，REALM 支持的代理模型族：该框架与模型无关，并在运算符族间应用相同协议，包括谱算子、卷积骨干、变换器式模型、点状模型以及网格/图或点云模型。
	> fig2a 套装中所有案例的分类法，按场景[canonical 问题（CP）、High-Mach 反应流（HF）、推进发动机（PE）和火灾危险（FH）]、网格类型（规则与不规则）及维数（2D/3D）分组。
	* fig3 2D regular case，基线包括 DPOT、GNOT、FactFormer、CROP、FFNO、CNext、DeepONet
	* fig4 3D regular case，基线多了 Transolver、UNO；fig6 还有 LSM、PointNet
	> fig6 跨基准模型比较。
		> a 逐类别散点图总结了 2D 正则（左）、3D 正则（中间）和不规则（右）情况下替代者的平均表现。
			> 横轴显示与参考解的相关系数（越高越好），纵轴显示推断效率（每秒推展次数越大越好）。
			> 标记区域编码平均相对 ℓ2 误差（标记越大表示误差越小）。
			> 标记颜色编码可训练参数数量（#Params;从浅到暗表示模型更大）。
			> 标记形状区分模型家族：点对向（PW，圆）、图形/网格（GM，五边形）、谱/卷积（SC，菱形）和变换器样式（TF，方形）。
		> b 雷达图表，展示了五个代表性模型在所有情况下的平均性能，
			> 比较准确率（相对 ℓ2 误差）、相关性、效率（推断速度）、参数数量和内存占用。
			> 更大的封闭区域表示整体权衡更为有利。
		> c 在容量对齐协议下所有选定模型的案例性能摘要。
			> 左：测试数据;右：训练数据。
			> 每个点对应一对模型-案例;标记区域编码相关系数（圆圈越大表示相关越高），标记颜色编码滚动平均的相对 ℓ2 误差。
			> 训练误差采用与测试相同的多步评估协议计算。
* 2512.16074 DeepONet 引入类 DeepSet 超网络学示例样本对，称为非注意力的上下文学习；{_q1qf13}
	* "In-Context Multi-Operator Learning with DeepOSets"
		* Chiu, Shao-Ting; Nambiar, Aditya; Syed, Ali; Siegel, Jonathan W.; Braga-Neto, Ulisses; 
		> created on 2026-01-26
* ECHO-2512.04974 百万散点网格 NO、拟合含时 PDE，编码先连续卷积到均匀细网格再离散卷积降分辨率
	* "Efficient Generative Transformer Operators For Million-Point PDEs"
		* Koupaï, Armand Kassaï; Boudec, Lise Le; Gallinari, Patrick; 
		> created on 2026-01-26
	* sec3.1.1 编码器，先 eqn(4) 邻域（连续）卷积 将散点输入转到均匀细网格，再（离散）卷积时空压缩
		* 连续卷积转均匀网格做法有引文；{_q1q888}
		> ECHO 的核心贡献之一是其分层时空编码器 ，该编码器逐步压缩输入。
		> 单次压缩（常用于编码器）会降低重建质量并限制可扩展性。
		> 相比之下，我们首先将不规则时空数据 $u^O$ 嵌入固定且密集的规则潜格中，然后通过结构化的方式连续的卷积阶段降低空间和时间分辨率。{_q1q89y}
		> 该设计在保持精细尺度动力学的同时实现高压缩比，即使在百万点轨迹上也能实现稳定高效的生成。
		> 关于编码器-解码器架构的更多细节见 C.2 节 。
		> （潜在网格映射）此外，这种点化表述支持通过独立处理局部区域实现分块网格计算，从而使计算在极密集网格上变得易于处理，避免超出内存限制。{_q1q89e}
		> 时空压缩。
			>  为了平衡效率和表现力，我们堆叠了两种类型的块： 压缩块， 用于缩减空间或时间维度;残差块，保持分辨率并丰富表示。
			> 所有时间卷积都是因果的，因此在时间 j 上的状态只能关注在时间 i≤j 上的状态。
	* 解码器与编码器互为镜像，允许散点求值
		> 解码器与编码器的结构相符。
		> 转置卷积反转时空压缩层。
		> 最后一层是连续卷积层，将潜在解码的标记插值到任意的物理网格。
		> 这种设计允许在任何位置查询 ECHO，并实现解决各种空间任务的可能性。
	* fig3 训练 3 步：AE 轨迹重建（低分辨率，含时），AE 状态重建（高分辨率，不含时），动力学流匹配生成
		>  百万点轨迹生成的三阶段训练策略。
		> ECHO 的自动编码器首先通过两个步骤训练：（1）低分辨率轨迹训练，（2）单帧高分辨率精细化。
		> 这两个步骤利用输入数据的重建目标。
		> 生成过程随后独立训练，对编码的 token 设置流匹配目标函数（3），而编码器-解码器在第三阶段则冻结。
* 2512.00564 NO 迁移学习策略，从容易生成的数据泛化到难生成的；涉及带障碍物 NS 数据生成
	* "Pre-Generating Multi-Difficulty PDE Data for Few-Shot Neural PDE Solvers"
		* Choudhary, Naman; Singh, Vedant; Talwalkar, Ameet; Boffi, Nicholas Matthew; Khodak, Mikhail; Marwah, Tanya; 
		> created on 2026-01-24
	* 摘要摘录
		> 学习型偏微分方程（PDE）求解器的一个关键方面是，主要成本往往来自使用经典求解器生成训练数据，而非学习模型本身。
		> 另一个是存在明确的难度轴 ——例如更复杂的几何和更高的雷诺数——在这些轴上，问题（1）对经典求解器来说会更难，因此（2）更可能受益于神经加速。
		> 为解决这一先有鸡还是先有蛋的难题，我们研究了二维不可压缩纳维-斯托克斯的难度转移 ，系统地变化任务复杂度，包括几何（障碍物的数量和位置）、物理（雷诺数）及其组合。
		> 类似于利用计算预训练基础模型并提升其在下游任务中的性能，我们发现通过经典求解（类似地预生成 ）许多低难度和中难度的实例并将其纳入训练集，可以从远少于更少的样本中学习高难度物理。{_q1og80}
		> 此外，我们证明通过结合低难度和高难度数据，预生成数据集的计算量可 × 减少 8.9 倍，从而实现与仅使用高难度样本相同的误差。
		> 我们的结果强调， 如何分配不同难度等级的经典求解器计算与整体分配同样重要，并表明对神经求解器预生成偏微分方程数据的原则性管理将带来显著收益。
	> 附录 B 数据集生成与模拟设置
		> 我们生成了两个主要数据集——流过对象（FPO）和盖子驱动腔（LDC），以探讨领域复杂度对神经偏微分方程求解器性能和泛化的影响。
		> 每个数据集包含三个难度等级： 简单 （无障碍）、 中等（单一障碍）和困难 （随机放置 2 至 10 个障碍物）。{_q1ob1d}
		> 所有仿真均使用 OpenFOAM 执行，OpenFOAM 是一款有限体积 CFD 求解器。
* RealPDEBench-2601.01829 更接近真实测量的数据集
	* "RealPDEBench: A Benchmark for Complex Physical Systems with Real-World Data"
		* Hu, Peiyan; Feng, Haodong; Liu, Hongyuan; Yan, Tongtong; Deng, Wenhao; Gao, Tianrun; Zheng, Rong; Zheng, Haoren; Yu, Chenglei; Wang, Chuanrui; Li, Kaiwen; Ma, Zhi-Ming; Zhou, Dezhi; Lu, Xingcai; Fan, Dixia; Wu, Tailin; 
		> created on 2026-01-23
	* 摘要摘录
		> 尽管科学机器学习（ML）模型进展迅速，但一个关键瓶颈是缺乏昂贵的真实世界数据，导致大多数当前模型都是在模拟数据上训练和验证的。
			> 除了限制科学机器学习的发展和评估外，这一差距还阻碍了模拟到现实转移等关键任务的研究。
		> 我们介绍了 RealPDEBench，这是首个将现实测量与配对数值模拟整合的科学机器学习基准测试。
			> RealPDEBench 包含五个数据集、三个任务、 九个指标和十个基线。
			> 我们首先展示了五个真实世界测量数据集，并结合了跨不同复杂物理系统的成对模拟数据集。
			> 我们还进一步定义了三个任务，这些任务允许现实世界数据与模拟数据的比较，并促进两者之间的方法开发。
		> 此外，我们设计了九个评估指标，涵盖数据导向和物理导向指标，并最终对十条具有代表性的基线进行了基准基准测试，包括最先进的模型、预训练的偏微分方程基础模型以及传统方法 。
		> 实验显示模拟数据与现实世界数据存在显著差异，同时表明用模拟数据预训练能持续提升准确性和收敛性。
		> 在这项工作中，我们希望从真实世界数据中提供洞见，推动科学机器学习弥合模拟与现实差距和实际部署。
		> 我们的基准测试、数据集和说明可在 https://realpdebench.github.io/ 获取。
	* fig2 真实世界数据采集装置照片；{_q1ng5m}
