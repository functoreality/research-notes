* PINN-1711.10561 最早 PINN 论文补充记录
	* "Physics Informed Deep Learning (Part I): Data-driven Solutions of Nonlinear Partial Differential Equations"
		* (JCP 2019) "Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations"
		* Raissi, Maziar; Perdikaris, Paris; Karniadakis, George Em; 
		> created on 2024-09-24
	* NN 拟合传统 RK 时间迭代格式；传统高阶 RK 开销大，尤其隐式情形
		* （评）时间推进方式是拟合数值格式，而非（基于 BP）拟合 PDE 本身；空间导数还是 PDE BP
		* 传统 RK 格式，记号：当前态 $u^n$，中间态 $u^{n+c_j}$，末态 $u^{n+1}$
		* NN 表达映射 $x\mapsto(u^{n+c_1},\dots,u^{n+c_q},u^{n+1})$（$t$ 不作为输入）
		* 只提供 $u^n$ 的 label，中间状态靠 IRK 方程约束（实验只预测一整个大时间步，因此相当于只提供 IC）
			* sec3.2.1 数据生成用 RK4，训练用 $q=100$ 个 stages
			* （评）未体现系统的无记忆性？
			* （评）解读尝试，dt 离散化为代数方程组（算是先改写为积分方程？）
		* 相比传统方法，可使用很大的 $q$（RK stage 数），可使用大时间步（传统隐式方法考虑方程组求解复杂度，时间步长也不能太大）
			* 甚至可以单个 RK step 获得整个 $[0,T]$ 的解；sec3.2.1 Allen-Cahn eqn 就是根据已知的 $t=0.1$ 预测 $t=0.9$
		* 同样可用于解反问题（类似基于 PDE 的 PINN loss），
	* （评）试解读该基于 RK 的算法
		* 原问题：含 dx,dt 方程 $\partial_tu=Lu$，$u\in F(D,\R^n)$
		* 传统算法，时空离散无先后顺序，此处给出先空间后时间版本：
			* 空间离散 → 仅含 dt 方程 $\partial_tU=L_1U$，$U\in F(\{x_i\},\R^n)$
			* 时间 RK 离散 → 代数方程组 $L_2(U^j,L_1U^j)=0$
		* 传统算法，先时间再空间：
			* 时间 IRK 离散 → 多函数满足的微分（dx）方程组 $F(u^j,Lu^j)=0$
			* 空间 FD 离散 → 有限维代数方程组 $F(U^j,L_1U^j)=0$
			* 数值代数迭代求解算法 → 时间区间内所涉及的时间步的解
		* RK-PINN（时间离散同上）：{_oa4m3o}
			* 空间 NN 参化 → $F(u^j_w,Lu^j_w)=0$，参数 $w\in\Theta$
			* 作为目标函数解优化问题 → 时间区间内所涉及的时间步的解
		* 常见 PINN：时空均 NN 参化；作目标函数解优化问题
		* ESNN：空间 NN 参化，时间投影后得关于 w ODE；用传统格式解
* 2409.06085 （备用）可微分的传统求解器（FEM？），PDE 组件允许为 NN，支持 PyTorch、JAX；{_o9ie63}
	* "Differentiable programming across the PDE and Machine Learning barrier"
		* Bouziani, Nacime; Ham, David A.; Farsi, Ado; 
		> created on 2024-09-18
	* 摘要：已被 Firedrake 有限元库采用
	* 实验包括：INS，热方程反问题，学本构方程，带 ML 正则化的地震波反演；23 中 PDE 组件涉及 NN
		* 热方程反问题，热传导系数 $\kappa$ 由 NN 参数化
			* （评）方程形式同 Darcy flow，只是系数场连续
		* 本构方程为弹性力学 $\nabla\cdot\sigma_\theta(\epsilon(u))=0$，(N) BC 上 $\sigma_\theta(\epsilon(u))\cdot n=f$
		* 地震波反演 $\min\|u(c)-u^{obs}\|^2+\alpha\|N(c)\|^2$，$N$ 为基于 ML 的算子
* Deep-Fluids-1806.02071 （备用）粒子方法流体模拟文章
	* "Deep Fluids: A Generative Network for Parameterized Fluid Simulations"
		* Kim, Byungsoo; Azevedo, Vinicius C.; Thuerey, Nils; Kim, Theodore; Gross, Markus; Solenthaler, Barbara; 
		> created on 2024-09-12
	* tbl1 scene: smoke plume/obstacle/inflow, liquid drops, viscous dam, rotating/moving smoke；{_o9cg98}
* 2407.07218 元科学研究，NO 类论文普遍存在 baseline 传统方法比较不公平、报告偏差等问题
	* "Weak baselines and reporting biases lead to overoptimism in machine learning for fluid-related partial differential equations"
		* McGreivy, Nick; Hakim, Ammar; 
		> created on 2024-09-12
	* [AI4CFD 公众号报道](https://mp.weixin.qq.com/s/3gcvdOik1lclICvP784dEg)
		* 比较所用的传统方法 baseline 太弱；{_o9cf0w}
			> 在使用ML解决与流体相关的PDE并声称优于标准数值方法的文章中，我们确定79%（60/76）的文章是与一个较弱的基准进行比较。
			* 规则 1，降精度再比时间：传统数值方法可权衡精度与预测时间，比较求解速度应考察相近精度下的预测耗时
			* 规则 2，选高效的方法：传统数值方法中先进方法比低效方法快几个量级
				* 表 2 多篇文章中所用的 baseline、作者给出的更强的 baseline，相应的提速幅度的比较
				> 数值方法：(PS) 伪谱法 (FD) 二阶有限差分法 (DG2) 二阶不连续Galerkin多项式基函数 (FV) 有限体积法 (SP) 谱方法 (MG) 多重网格法 (LU) LU分解 (CG) 共轭梯度法
			* 表 1 给了大量文章的例子
				> 我们可以复制文章的主要结果，并使用不同的基准实现显著提高的性能（六篇文章）。
				> 文章在摘要中相对于较弱的基准报告了性能，但在结果部分或附录中有更强的基准（三篇文章）。
				> 文章使用二维代码作为一维问题的基准（一篇文章）。
				> 我们对最先进数值方法的计算实现比文章中的实现慢了几个数量级（一篇文章）。
				> 基准使用了隐式时间步进，而显式时间步进会更快（一篇文章）。
				> 对于椭圆型PDE，基准方法比最先进的数值方法效率低得多（八篇文章）。
				> 对于对流主导的PDE，基准方法比最先进的数值方法效率低得多（五篇文章）。
		* 负面结果报告程度不足
			> 其次，我们发现报告偏倚，特别是结果报告偏倚和出版偏倚普遍存在。
		* 强调代理模型求解成本比较需考虑生成数据、训练模型的成本
		* 对研究者的建议，及相应的示范文章例子
			> 虽然未能击败基准不应导致文章被拒，但在评估模型时未能遵循最佳实践可以且应该成为拒稿的理由。
			> 首先，我们建议所有使用ML解决PDE的文章与两种类型的基准进行比较：标准数值方法和其他基于ML的求解器。
				> 这使读者能够更好地评估模型性能并减少选择性报告。
				> 一个好的例子是Stachenfeld等人的工作。
				> 如果其他基于ML的求解器不能作为基准实施，文章应解释原因。
			> 其次，文章应在与标准数值方法进行比较时遵循规则1。
				> 为满足规则1，减少标准求解器的空间分辨率和/或迭代次数，直到两种方法具有相同的精度或相同的运行时间。
				> 理想情况下，文章还应绘制成本与精度的关系图。
				> 一个好的例子是Kochkov等人的图1a。
			> 第三，文章应在单独的段落或小节中讨论如何选择基准并解释为何比较是公正的。
				> 特别是，文章应解释为何作为基准使用的标准数值方法对于该PDE是高效的（或最先进的）。
				> 理想情况下，文章应为每个PDE比较多种数值方法并使用最有效的方法作为基准。
				> 如果作者不确定给定PDE的最先进基准，他们应与领域科学家或其他专家交流并/或合作，并清楚地承认他们的不确定性。
				> 一个好的例子是Lippe等人的附录D.1中的速度比较。
			> 第四，除了规则1和2，我们提出了另外三条公平比较的建议（见方法）。
* MODNO-2404.02892（备用）基于 MTL 实现 PDE 基础模型，不同 PDE 对应不同输出层基底函数
	* "MODNO: Multi Operator Learning With Distributed Neural Operators"
		* Zhang, Zecheng; 
		> created on 2024-09-11
	> （摘要）核心思想是使用每个运算符的专用数据独立学习其输出基函数，同时使用整个数据集集中学习所有运算符共享的输入函数编码。{_o9bg4t}
* 2209.04934 （备用）利用 Clifford 代数结构设计 NN 层，包括 CNN、Fourier 层
	* "Clifford Neural Layers for PDE Modeling", ICLR2023
		* Brandstetter, Johannes; Berg, Rianne van den; Welling, Max; Gupta, Jayesh K.; 
		> 被 STAResNet-2408.13619 引用
	* eqn(7) 常规卷积层中涉及的实数乘法换为 geometric product of multivector inputs/filters；{_o9bg1o}
	* eqn(11) Clifford Fourier transform，未看细节；{_o9bg0v}
* STAResNet-2408.13619（备用）Maxwell 方程用 Clifford 代数有两种表示方案，分别用于设计 NO 架构
	* "STAResNet: a Network in Spacetime Algebra to solve Maxwell's PDEs"
		* Pepe, Alberto; Buchholz, Sven; Lasenby, Joan; 
		> created on 2024-09-11
	* sec2 用 Clifford 代数表示 Maxwell 方程；{_o9bb9w}
		* $G(p,q,r)$ 应该指的是相应 Clifford 代数中二次型符号 p 个 +1, q 个 -1，r 个 0
		* Geometric Algebra $G(3,0,0)$
		* Spacetime Algebra $G(1,3,0)$
	* 注：引用 [1] 为 2209.04934
* 2408.12171 综述：机器学习应用于计算流体力学最新进展
	* "Recent Advances on Machine Learning for Computational Fluid Dynamics: A Survey"
		* Wang, Haixin; Cao, Yadi; Huang, Zijie; Liu, Yuxuan; Hu, Peiyan; Luo, Xiao; Song, Zezheng; Zhao, Wanjia; Liu, Jilin; Sun, Jinan; Zhang, Shikun; Wei, Long; Wang, Yue; Wu, Tailin; Ma, Zhi-Ming; Sun, Yizhou; 
		> created on 2024-08-30
	* [集智俱乐部推送摘要](https://mp.weixin.qq.com/s/qsYML6yknqTlJhRjRirwqA)
		* 挑战：多尺度
			> 不同尺度的现象可能以非线性且常常不可预测的方式相互影响。例如，微观分子动力学可以显著影响流体流动中的宏观属性，如粘度和湍流。{_o92b58}
	* fig2 分类图
		* 前向建模—数据驱动代理—依赖离散化—Lagrange 粒子方法；{_o96a3g}
		* 前向建模—ML 加速传统算法：
			> 我们将这些方法分为三个主要类别：
			> 1）在更粗糙的分辨率或较少的自由度下实现精确模拟，{_o96a65}
				> 包括学习离散化方案、通量、封闭建模和简化建模；
			> 2）使用学习到的预处理器加速线性系统的解决方案；{_pcij7r}
			> 3）范围广泛的杂项技术，从超分辨率；{_pcij8b}
				> 到纠正迭代步骤。{_pcij8i}
		* 逆向设计：基于 PDE 约束，数据驱动；{_o96a9q}
		* 控制问题：1. 有监督，2. RL，3. PDE 约束；{_o96b8l}
* DATS-ICLR2024 （备用）PINN meta-learning 中任务采样策略，考虑不同任务难度差异
	* "DATS: Difficulty-Aware Task Sampler for Meta-Learning Physics-Informed Neural Networks", ICLR2024
		* Maryam Toloubidokhti, Yubo Ye, Ryan Missel, Xiajun Jiang, Nilesh Kumar, Ruby Shrestha, Linwei Wang
		* [OpenReview](https://openreview.net/forum?id=EvyYFSxdgB)
		> 2024-06-23
	* 测试的 meta-PINN 算法 包括 HyperPINN（用超网络输入 PDE 参数直接推断）、MAD-PINN
	* sec4.0 优化训练时采样 task 的概率分布 $p(\lambda)$，使训练后 validation loss 最小；{_o6nf4e}
		* 提到涉及双层优化；现有工作用 RL 求解，本文推导其解析解
	* sec4.2 元训练 loss 的自适应加权，residual points 自适应 allocation
* LagrangeBench-2309.16342 Lagrange 流体力学数据集；{_o6lg9z}
	* "LagrangeBench: A Lagrangian Fluid Mechanics Benchmarking Suite"
		* Toshev, Artur P.; Galletti, Gianluca; Fritz, Fabian; Adami, Stefan; Adams, Nikolaus A.; 
		> created on 2024-06-21, refered by ConDiff-2406.04709
	* [readthedocs](https://lagrangebench.readthedocs.io/en/latest/)
* ConDiff-2406.04709 数据集
	* "ConDiff: A Challenging Dataset for Neural Solvers of Partial Differential Equations"
		* Trifonov, Vladislav; Rudikov, Alexander; Iliev, Oleg; Oseledets, Ivan; Muravleva, Ekaterina; 
		> created on 2024-06-21
	* related work
		> weather forecasting: SuperBench, ClimSim, DynaBench, OceanBench, ChaosBench. {_o6lg6o}
		> Lagrangian mechanics LagrangeBench, phase change phenomena BubbleML.
		> PDE Control Gym, DiffTaichi, ΦFlow；{_o6lg7o}
	* eqn(1) 变系数扩散方程 $-\nabla\cdot(k(x)\nabla u(x))=f(x)$，齐次 Dirichlet 边界，方形区域；{_o6ll0h}
		* 摘要：主要新在 系数不连续、高对比度
		* eqn(5) 系数生成方式 $k=\exp(\phi(x))$，$\phi$ 为 GRF，考虑了三种不同的协方差函数 Cov(d)
* 2302.13143 PINN 处理多尺度、边界层问题，用集成学习；{_o5pg9c}
	* "Ensemble learning for Physics Informed Neural Networks: a Gradient Boosting approach", ICLR 2024
		* Fang, Zhiwei; Wang, Sifan; Perdikaris, Paris; 
		> created on 2024-05-25
	* （评）ICLR 正会，但文章长度像 Workshop，原因未知
	* 实验：1D 奇异摄动，2D 带边界层奇异摄动，2D 内部边界层奇异摄动，2D（其实是 1D 含时）非线性反应扩散
* SI-MSNN-2407.17213 将 MSNN 适配到 2D 问题，主要只考虑回归问题
	* "Spectrum-Informed Multistage Neural Networks: Multiscale Function Approximators of Machine Precision", ICML2024
		* Ng, Jakin; Wang, Yongji; Lai, Ching-Yao; 
		> 2024-09-12 Pf 大群 lhu 推荐
	* [公众号报道](https://mp.weixin.qq.com/s/OU69sChIgQn8oP2Jn5Ur6w)
		> 在二维或更高维度中，多阶段神经网络无法达到机器精度，且无法捕捉到在后期阶段残差中出现的高频。
		> 我们提出了一种频谱引导初始化方法，用以替代 Wang & Lai (2024) 中使用的带尺度因子 $\kappa$ 的余弦映射。
		> 相反，我们在此针对数据集中存在的特定频率调整神经网络。
* `MSNN-2307.08934` boosting 提高 INR 拟合精度，讨论新加入网络求和权重、频率先验设置方式，PINN 有更多细节
	* "Multi-stage Neural Networks: Function Approximator of Machine Precision", JCP
		* Wang, Yongji; Lai, Ching-Yao; 
		> 2024-05-03 陆一平在知乎上推荐
	> （陆一平）idea是交替使用adam和lbfgs优化器，personal我自己做实验也觉得这个特别work，特别喜欢这种simple trick but works）{_o53h2k}
		* fig1d 画的是（训练各阶段）先 Adam 后 LBFGS；从曲线图上看纯 Adam 会到平台期，纯 LBFGS 会提前终止迭代（似乎是满足了内置的停机准则）
		* 如果考虑多阶段训练，确实是交替用两种优化器；不过各阶段被训练的网络不同
		* （评）Adam 阶段的总迭代步数怎么选的？判断是否到平台期？未确认文章细节
	* 通过 boosting 提高拟合精度，fig1a-c 不断拟合上一步残差，各步残差幅度逐渐减小、频率逐渐增大
		* fig1 两阶段网络（[1,20,20,20,1]）总参数量少于单阶段网络（[1,30,30,30,1]），收敛速度明显更快；{_o6ea5d}
		* fig3 拟合高频函数前对网络进行特殊设置，首个隐层换 sine 激活、初始化权重乘比例因子
			* 两要素均重要，去掉任何一个效果都会变差
		* alg1 （针对回归问题）后续新网络的求和权重、网络首层频率设置，依据上一步残差的幅值、频率；{_o6ea3j}
			* sec2.2.2 高频回归需要的数据点更多（> 由 aliasing 也容易理解）{_o6ea45}
	* sec3.1 PINN 新网络求和权重、频率选取，从 PDE 残差估计方式，alg2；{_o6ea5s}
		* 有效性验证，fig8 PINN 训练，拟合残差时重新缩放幅度、频率的重要性
	* sec3.2 PINN 多项 loss 加权 $\gamma$（如 BC + PDE 内部），新网络权重 $\gamma$ 选取方式 alg3；{_o6fl1e}
	* sec3.3.1 PINN 新网络训练的优化器、collocation points 重采样方式；{_o6fl23}
		* 低频解的方程 LBFGS 通常是 preferred 的优化器
		* 高频情况有所不同，Adam 结合每步重新随机采样点可利用随机性加速收敛
	* sec3.3.2 其他文献提出的训 PINN 有效方法：RAR（根据残差自动调整采样点密度），gPINN（用梯度信息增强 PINN）
* （备用）量子变分蒙特卡洛方法（NNVMC）的 ML 求解方法，Laplacian 前传计算
	* [2024-03-01](https://mp.weixin.qq.com/s/9gYXYQ3M3cm-fxikvEcAhQ)
		* "A computational framework for neural network-based variational Monte Carlo with Forward Laplacian", Nature Machine Intelligence
		> 相关代码已开源。
		> 该项工作由北京大学智能学院王立威课题组、物理学院陈基课题组联合字节跳动研究部门 ByteDance Research 一同开发完成
	> 作者提出了一套全新的计算框架 "Forward Laplacian"，利用 Laplace 算子的前向传播，显著提升了 NNVMC 方法的计算效率，{_o3197h}
		> 现有的自动微分框架在计算拉普拉斯算子时，需要先计算黑塞矩阵，再求得拉普拉斯项（即黑塞矩阵的迹）。
		> 而作者所提出的计算框架 "Forward Laplacian" 则通过一次前向传播直接求得拉普拉斯项，避免了黑塞矩阵的计算，从而削减了整体计算的规模，实现了显著加速。
		* 示意图
	> 除了有效削减计算图规模之外，Forward Laplacian 框架的另一大特点是能有效利用神经网络梯度计算中的稀疏性，提出神经网络结构 LapNet。
		> LapNet 通过增加神经网络中的稀疏性，在精度无损的同时，显著提升了网络计算的效率。
* `PirateNets-2402.00326` （备用）PINN 所用 MLP 在训练过程中逐渐加深
	* "PirateNets: Physics-informed Deep Learning with Residual Adaptive Networks"
		* Wang, Sifan; Li, Bowen; Chen, Yuhan; Perdikaris, Paris; 
		> created on 2024-02-16
* `2307.15034` FNO 混合精度训练
	* "Speeding up Fourier Neural Operators via Mixed Precision"
		* White, Colin; Tu, Renbo; Kossaifi, Jean; Pekhimenko, Gennady; Azizzadenesheli, Kamyar; Anandkumar, Anima; 
		> created on 2024-02-14，`2401.16645` 推荐
	* 摘要：现有混合精度方式针对实值、不直接适用于复值；FT 本身有离散误差故本来也无需全精度计算
		* （评）下面说本工作中复数直接当向量处理了，也没用特殊处理办法？
	* sec3.3:1 训练、测试用 $H^1$ Sobolev 范数（仿照之前的工作，包括一篇李宗宜的）{_o2ga6c}
		* 并且按同一批作者之前的工作，对 FNO 权重矩阵引入 Canonical-Polyadic 分解，声称可明显提升性能、省内存（未看引文）{_o2ga6x}
	* sec3.2 pre-activation，每次 FFT 之前先作用 tanh 将值放入 $[-1,1]$ 区间；{_o2ga7i}
		* ablation 还试了直接 clip 到该区间（精度、速度都差一点点）、clip 到 $2\sigma$ 区间（速度差）
		* p7:-1 在全精度下引入 tanh 不影响精度，运行时间稍变长
	* 策略 AMP+HALF+TANH：非 FFT 部分用自动混合精度（amp），FFT 部分用半精度，之前加 tanh 激活
	* sec3.3 额外测试 precision schedule，前 1/4 AMP+HALF+TANH，中间 1/2 FFT 换全精度，最后 1/4 全精度；{_o2ga9c}
		* 结果：AMP+HALF+TANH 比全精度差 6-11%，precision schedule 比全精度好 10%
		* 分辨率外推（测试所用分辨率高于训练）精度结果类似
	* p8:2 考虑 Fourier mode 高频部分在半精度下引入的相对（除掉幅度）误差更大，为人造数据实验结果；{_o2gb2v}
		* 下方评论认为真实数据主要为低频成分，故用半精度合理
* `2401.16645` （备用）PINN、DeepONet 用混合精度训练，最后一作陆路
	* "Speeding up and reducing memory usage for scientific machine learning via mixed precision"
		* Hayford, Joel; Goldman-Wetzler, Jacob; Wang, Eric; Lu, Lu; 
		> created on 2024-02-14
	* fig4 PyTorch、TensorFlow 等框架的自动混合精度策略回顾，梯度缩放等
	* sec4.1.2 针对 SciML 的额外策略：{_o2el07}
		* Adam $\epsilon$ 从 1e-7 增大到 1e-5；{_o2el3e}
		* DeepONet loss 从 MSE 换为 mean L2 relative err（> nRMSE？），因 MSE 上溢；{_o2el3m}
		* $a^2/b$ 容易溢出，改成 $(a/\sqrt b)^2$；{_o2el3q}
		* PINN 判断点为 IC/BC 用 np.isclose 函数，其中 tolerance 从 1e-6 改 1e-4
		* 发现 loss scaling 对本工作没什么用；{_o2el3x}
	* 引文提到 2307.15034 针对 FNO 用了混合精度
* Tu2024GuaranteedAB （备用）NO 混合精度训练的逼近误差理论估计，看摘要似同时考虑离散误差、拟合误差、浮点误差；{_o44e60}
	* "Guaranteed Approximation Bounds for Mixed-Precision Neural Operators", ICLR2024
		* Renbo Tu, Colin White, Jean Kossaifi, Boris Bonev, Gennady Pekhimenko, Kamyar Azizzadenesheli, Anima Anandkumar
		* [OpenReview](https://openreview.net/forum?id=QJGj07PD9C)
		> 2024-04-04
* `DM-PINN-2402.04390` PINN 所用 INR 架构，每隐层乘上之前所有隐层的输出
	* "Densely Multiplied Physics Informed Neural Network"
		* Jiang, Feilong; Hou, Xiaonan; Xia, Min; 
		> created on 2024-02-10
	* eqn(9) $h^{l+1}=\sigma(W^lh^l+b^l)\prod_{k=1}^lh^k$；{_o2ag7f}
	* 输入层后引入 batch norm
	* 变种 SDM-PINN 引入残差连接
		* （评）看文字描述可能是 $h^{l+1}=h^l+\sigma(W^lh^l+b^l)\prod_{k=1}^lh^k$，但不完全确定
* NeuralGCM-2311.07222 Google 天气预报模型，结合了数值格式
	* "Neural General Circulation Models for Weather and Climate"
		* Kochkov, Dmitrii; Yuval, Janni; Langmore, Ian; Norgaard, Peter; Smith, Jamie; Mooers, Griffin; Klöwer, Milan; Lottes, James; Rasp, Stephan; Düben, Peter; Hatfield, Sam; Battaglia, Peter; Sanchez-Gonzalez, Alvaro; Willson, Matthew; Brenner, Michael P.; Hoyer, Stephan; 
		> created on 2025-02-09
	* 以下根据公众号报道 [2023-12-20](https://mp.weixin.qq.com/s/L-DVECflnrSZ3-KjoqW3Kw)
	> 数值模式主要由两个部分组成：动力框架和物理过程参数化。
		> 前者用方程组描述大气变化的过程和不同物理量间的关系；后者用来计算一些前者无法描述的物理过程。
		> 例如，由于数值模式在求解动力方程组时需要将其离散化（在空间上表示为网格，ERA5和ECMWF预报就都是格点数据），必然遗漏了小于网格分辨率的物理过程，需要参数化方案来简单模拟。
		* 另有 对流参数化、边界层参数化；{_ncmj7l}
	* 插值需求，为避免误差用学习得的插值器
		* 需要插值的原因：数据网格与计算网格不一致
			> 由于ERA5的数据是在等压面上提供的，而模型为了做谱展开，采用的是σ垂直坐标系（与大部分数值模式类似。简而言之，模型内部计算时垂直分层与ERA5不一致）。
		> 因此需要将变量垂直线性插值到σ坐标系上（encoder），预报完成后再插值回来（decoder）。
		> 但这种插值有一定误差，会导致虚假重力波等问题，
		> 因此这里的encoder和decoder不仅是线性插值，还包含一个可学习的神经网络，用于订正插值结果。{_nckb3i}
		> 这里的神经网络是个“单柱”模型，即每个格点独立订正垂直方向的插值。
		> 在训练的最后阶段，作者还对decoder部分进行了微调，以解决谱空间与格点空间相互转换带来的高频噪声问题（附录G.5）。
	* 训练细节
		> 类似GraphCast，NeuralGCM训练开始时只预报6小时并计算loss；逐步增加到3~5天为止。{_nckb5b}
			> 当然，由于这里类似数值模式时间积分方案的设计，即使是6小时，也包含数十至上百个时间步的迭代。
		> 在等压面和等σ面上同时计算loss。{_nckb6b}
			> 在等σ面上计算loss可能是为了拆分任务，排除前文encoder和decoder的干扰，明确encoder和decoder的目标为垂直插值。
		> 对不同变量赋予不同权重，以使训练过程不至于被个别变量主导。
		> 由于预报时间越长，误差本身必然越大，因此对更长的预报时间赋予更小的权重，使得不同预报时间的loss接近。{_nckb6w}
	* NeuralGCM的损失函数分为三类：
		* Accuracy loss：为避免预测模糊，计算 MSE loss 前过滤高频分量
			> Accuracy loss：使用MSE使预测更准确。随着预报时效的延长，大气的可预报性降低，
			> 如果模型预报出了某个小尺度波动，但位置出现了偏差，则观测和预报的两个位置的MSE都会增大（称为“双重惩罚”问题，这也是很多现有AI模型模糊化的根源之一），{_nckf2n}
			> 然而实际这样的预报是有意义的（比如预报海淀下雨，结果朝阳下了，总比压根没报雨好些）。
			> 因此，作者在计算MSE loss前，滤去了认为在不同预报时效上已没有可预报性的小尺度变化（即过滤了高波数分量），以避免双重惩罚。{_nckf3n}
		> Sharpness loss：另一方面，为了解决模糊问题，作者直接在loss中计算各高度层各变量不同波长分量的能量与观测的差异，即强迫模型预报不同尺度的变化。{_nckf2s}
			> 这一项针对性地解决之前ECMWF一篇论文《On some limitations of data-driven weather forecasting models》中提及的问题。
		> Bias loss：该项在计算MSE前，先对整个batch和各预报时长做平均，因此不针对个例，而是调整不同高度层、不同变量、不同波长的振幅。{_nckf46}
		> 此外，集合预报模型采用了CRPS（连续分级概率评分）作为损失项。
	> 我们可以从不同角度理解NeuralGCM的设计：
		> 从AI角度，NeuralGCM将代表物理过程的基本方程组嵌入神经网络，训练出受物理约束的AI预报模型。
		> 从数值模式角度，则是用神经网络代替数值模式中的参数化方案。
		> 甚至，我们可以将NeuralGCM中的神经网络视作“订正模型”，只是将订正直接嵌入了数值模式的时间积分过程中，针对每一步的结果订正，而不是订正最终的输出。
	* 实现难度，代码行数明显比传统方法少
		> ML atmospheric models also require considerably less code, for example GraphCast has 5417 lines vs 376578 lines for NOAA’s FV3 atmospheric model.
		> 乍一看这种比较方式有点无厘头，甚至Fortran也躺枪了（数值模式基本是Fortran写的），但通读全论文后，发现代码行数某种程度上代表着迭代难度的降低。
* `MyCrunchGPT-2306.15551` （备用）用户界面 demo，机翼设计整体流程封装、ChatGPT 管理，用户只需在界面提要求
	* "MyCrunchGPT: A chatGPT assisted framework for scientific machine learning"
		* Kumar, Varun; Gleyzer, Leonard; Kahana, Adar; Shukla, Khemraj; Karniadakis, George Em; 
		> created on 2023-11-18
	* fig5 流程，用户依次：定义翼形生成的参数，查看翼形生成结果，分析流场并查看结果，要求优化翼形几何、查看优化过程的细节，要求用 CFD 工具验证流程
* `2112.15275` （备用）试通过算子学习在低分辨率网格上捕捉高分辨率动力学，据说包括针对湍流的数据集
	* "Learned Coarse Models for Efficient Turbulence Simulation"
		* Stachenfeld, Kimberly; Fielding, Drummond B.; Kochkov, Dmitrii; Cranmer, Miles; Pfaff, Tobias; Godwin, Jonathan; Cui, Can; Ho, Shirley; Battaglia, Peter; Sanchez-Gonzalez, Alvaro; 
		> created on 2023-12-26，PDEBench 引用
	* （评，2024-12-02）没找到在哪里写了有公开数据集？
* `2112.05309` （备用）数据集，针对不可压 NS 方程，包括 2D、3D
	* "A Large-Scale Benchmark for the Incompressible Navier-Stokes Equations"
		* Huang, Zizhou; Schneider, Teseo; Li, Minchen; Jiang, Chenfanfu; Zorin, Denis; Panozzo, Daniele;
		> created on 2023-12-26，PDEBench 引用
	* （评）看摘要其实是比较传统数值方法的各种不同设定（网格形状，时间积分器，算子分裂格式）？
* `2108.07799` （备用）数据集，spring ODE（及高维版本）、波方程、不可压 NS
	* "An Extensible Benchmark Suite for Learning to Simulate Physical Systems", NIPS 2021
		* Otness, Karl; Gjoka, Arvi; Bruna, Joan; Panozzo, Daniele; Peherstorfer, Benjamin; Schneider, Teseo; Zorin, Denis; 
		> created on 2023-12-26，PDEBench 引用
	* 数据集：1. spring（ODE），2. 波方程（波速固定），3. spring mesh（高维 ODE），4. 不可压 NS
	* INS 数据集有障碍物，1-4 个；用 PolyFEM 包求解，每单元内 p 一次多项式、u 二次
* `CFDBench-2310.05963` （备用）CFD 数据集
	* "CFDBench: A Comprehensive Benchmark for Machine Learning Methods in Fluid Dynamics"
		* Luo, Yining; Chen, Yingfa; Zhang, Zhen; 
		> 2023-11-16 lhu 推荐
	* 注：似乎数据量有限；有（无障碍物的）方腔流、管道流，（有障碍物的）堤坝流、圆柱扰流
		* 方腔流指矩形区域，上边界运动（速度由外部控制、为 PDE 参数），其他 3 边界固定（齐次 (D) BC）
	* [作者陈英发知乎介绍：数据集](https://zhuanlan.zhihu.com/p/656033757)
		* 针对 不可压 NS
		> 对于每个问题，我们生成具有不同工况参数（Operating Parameter）的流动，
			> 这是我们用来指代三种条件组合的术语：(1) 边界条件（BC），(2) 流体物性 (PROP) ，以及 (3)流场的几何形状 (GEO)。
			> 每种操作参数对应一个子集。
			> 在每个子集中，相应的操作条件发生变化，而其他参数保持不变。
			> 目标是评估数据驱动的深度学习方法泛化到未见过的操作条件的能力
		* 数据多样性
			> 有开放式和封闭式系统，
			> 并且形状各异。
			> 系统边界包括移动/静止边界和速度/压力入口和出口边界。{_o99b7w}
				* 论文 tbl3 管道流有 入口速度、出口压强，tbl4 堤坝流有 入口速度、入口压强、出口压强
				* tbl5 圆柱扰流 BC 类似管道流
			> 它们包括重力内的垂直流动和无重力的平面流动。
			> 它们的流动特性包括粘性边界层的形成、涡流的形成和脱落以及射流的形成。
			> 它们既有单相流，又有两相流，
				> 忽略两相界面处的传质和流动过程中的能量耗散
			> 既有层流，又有湍流。
		* 方腔流，涉及“二次涡”；{_o99b8u}
			> 由于粘性的作用，移动壁面带动附近的流体向同一方向移动，直至静止壁面形成射流冲击下壁面，进而形成二次涡流。
			> 一方面，盖驱动腔流在工业界有着广泛的应用，例如瞬态涂层（短驻留涂层）过程、受风影响的海洋流等等。
			> 另一方面，特殊情况是边界条件在动壁和静止侧壁的连接处是不连续的，这使得它可以用于判断数值方法的收敛性，并被广泛用于验证计算流体力学软件或数值方法的准确性。
		> 圆管流是指单相水进入充满空气的圆管内的水-空气两相流。{_o99e4d}
			> 圆管内的边界层是最常见的流动之一，它是指流体在近壁面上的粘性阻力大于主流区域的粘性阻力。
			> 当水流入充满空气的圆管时，我们可以清楚地看到，靠近壁的地方流速慢，中心处流速快。
			> 因此，在圆管内构建水-空气层流有利于研究神经网络结构捕获两相界面的能力以及学习层流边界层理论。
		* 堤坝流
			> 当雷诺数较低时，流体受粘性力支配，在流经坝时会沿壁垂直流动。
			> 随着速度的增加，流体受惯性力的影响更大，会形成射流。
			> 然后，流体因重力落到边界，与边界的碰撞产生更多的逆流，以比入口更大的速度撞击坝体。
		* 数据生成软件
			> 本文所有数据均由ANSYS Fluent 2021R1生成。{_o99b74}
			> 为了准确计算粘度项，层流采用层流模型，湍流采用 SSTk-ω 模型。
			> 使用的所有求解器均基于压力。
			> 我们选择单相流的耦合方案和两相流的简单方案作为压力-速度耦合算法。
			> 压力方程采用二阶插值法（VOF模型采用PRESTO!插值法），动量方程采用二阶迎风法。
			> 时间项采用一阶隐式格式，插值采用最小二乘法。
			> 为了捕捉近壁面的边界层分离现象，近壁面第一层网格的大小被加密为 $10^{-5}m$。
			> 为了确保计算模型和结果的准确性，所有计算模型都经过了网格无关的验证。
	* [作者知乎介绍：实验所用模型](https://zhuanlan.zhihu.com/p/657399364)
		> CFDBench 考虑在保持 IC 不变的同时改变工况参数
		* 每个实数参数作为一个单独通道；圆柱扰流用示性函数表示有流体区域位置
* `VC-INR-2301.09479` 数据压缩，主网络 Siren，超网络对其权重矩阵进行低秩修改
	* "Modality-Agnostic Variational Compression of Implicit Neural Representations"
		* Schwarz, Jonathan Richard; Tack, Jihoon; Teh, Yee Whye; Lee, Jaeho; Shin, Jinwoo; 
			* 一作 from DeepMind；三作在 COIN++ 作者列表中
		> 2023-11-01 组会，clh
	* Siren 第 l 层权重矩阵 $G_l\odot W_l$，$G_l=sigmoid(U_lV_l^\mathrm{T})$ 由超网络生成；{_nb2l1u}
	* 超网络架构：layernorm（重要）{_nb2l12}
		* 其他细节：leaky ReLU 激活，残差连接
	* 压缩性能：图像超过 JPEG2000，音频超过 MP3，视频超过 H.264
* `2306.00258` FNO 架构预训练-微调范式的潜力，重点关注 scaling 与向下游任务的迁移
	* "Towards Foundation Models for Scientific Machine Learning: Characterizing Scaling and Transfer Behavior", NIPS2023
		* Subramanian, Shashank; Harrington, Peter; Keutzer, Kurt; Bhimji, Wahid; Morozov, Dmitriy; Mahoney, Michael; Gholami, Amir; 
		> created on 2023-10-28
	* p1:r-1 重点指标：模型（架构、规模）、数据（多样性、规模）、训练配方（预训练与微调）、OoD 泛化
	* p2:l0 本文针对 FNO 这种特定架构
	* p2:r 下游任务数据量的 scaling，模型规模的 scaling（64K - 256M）并发现规模增大后微调性能增益更大
	* p3:l 学习多个方程，FNO 有多输入；对给定 PDE，不存在的输入项按 0 输入，从而限制网络、使其对正确的方程进行预测
	* p4:l 考虑的 3 个（2D 不含时）方程：Poisson，对流扩散，Helmholtz
* `PROSE-2309.16816` 输入 ODE 大致符号表达式、前几个时间步数据，输出预测的准确表达式、无网格时间外推数据，架构 Transformer
	* "PROSE: Predicting Operators and Symbolic Expressions using Multimodal Transformers"
		* Liu, Yuxuan; Zhang, Zecheng; Schaeffer, Hayden; 
		> created on 2023-10-27
	* fig1,2 架构，输入的数据、表达式先分别过独立 Transformer 编码器，之后过混合 Transformer 编码器
		* 数据、表达式解码器部分独立
		* 数据解码器（无网格），坐标点提供 Q、之前的混合编码结果提供 K,V；{_nase7w}
			* tbl1 提到处理不同维数的 ODE 需 pad 到最大方程维度；{_o49b2s}
		* 符号解码器，fig7 混合编码结果再过 Transformer 编码器，然后由 Transformer 解码器输出预测的方程形式
	* sec3 符号部分用 Polish notation（前缀表达式）以节省总长度
		* 数字表达为之前工作提出的方式，符号、三位小数、指数；总 token 数约为 1e4
	* sec3.1 实现细节：输入的符号方程猜测可能是空的或错误的
		* 符号部分输入为 sine 位置编码
		* 数据、符号的混合部分无位置编码，因已包含在之前的编码器中
		* 符号解码器 eval 期间只以最大概率选择符号
	* p7:-1 数据部分输入为 ODE $t\in[0,2]$ 的值，64 点均匀网格离散化；输出目标为 $t\in[2,6]$ 的 ODE 解
		* 输入加 2% 高斯噪声
		* tbl1 符号部分输入噪声：未知系数（系数位置放占位符），15% 概率删除项，15% 概率添加错误的新项
		* 计算表达式部分误差方式
			* 先转换为表达式树，判断是否合法
			* 若合法，不是直接比较表达式误差，而是在函数空间比较，relative L2 err；{_o4gg9g}
				* 具体地是计算 $L^2([-5,5]^d)$ 空间中的距离，用 Monte Carlo 采样 50 个点
* PROSE-PDE-2404.12355
	* "Towards a Foundation Model for Partial Differential Equations: Multi-Operator Learning and Extrapolation"
		* Sun, Jingmin; Liu, Yuxuan; Zhang, Zecheng; Schaeffer, Hayden; 
		> 来自导师写的 Pf 新成员招募材料，2024-10-06
	* 同时恢复准确方程、对 PDE 解时间外推
	* 实验中必须输入前几个时间步（尽管我感觉其架构可能支持纯初值，或不含时方程求解）
	* 似乎不支持多分量、含系数场的方程；看起来不容易支持 BC（待确认是否有相关实验）
	* data decoder 输入仅为 t；secB.1 encoder 似乎也是每个 t 一个 token
		* sec4:2 空间固定 128 点均匀网格，范围 $[0,2]$
	* tbl2 外插设定，时间位置、系数范围、IC 分布（训练正弦波、测试 GRF）、PDE 形式（见过无粘 Burgers 和有粘性的其他守恒律方程，推有粘性 Burgers）{_oa8e9c}
	* 泛化到新组合（之前只分别见过），即：训练见过 a1, b1, a2 推理泛化到 b2
		* tbl3 方程形式 + IC 解形态激波→稀疏波
		* tbl4 方程形式 + IC 解形态单激波→双激波
* LeMON-PROSE-2408.16168
	* "LeMON: Learning to Learn Multi-Operator Networks"
		* Sun, Jingmin; Zhang, Zecheng; Schaeffer, Hayden; 
		> created on 2024-09-10
	* sec3 问题形式，允许变有方程形式、（标量）系数、IC
		* （评）没有其他系数场；也没说波方程初始速度场可变，推测可能用的是全 0（或者如果输入不是只有 IC，直接根据历史轨迹数据推测？）
	* sec3 预训练后，少样本微调所用样本数可低至 20，有时允许零样本直接推理
	* fig2 用于 PDE 的 pipeline：预训练，新方程微调，之后直接推理；{_o9ba2q}
		* （评）直接推理的示意图画的是 输入前一段时间步的解，而非只输入初值？和 sec3.0 问题描述的数学表达式不太一样，以问题描述为准？
		* sec3.1 微调用 LoRA
	* secA 所用 PDE 全集，均为 1D PDE，BC 周期为主，无系数场
		* 方程不是（像我们一样）给一个通用形式，而是多种项数较少、类型较多的方程放在一起训
		* tbl7 PDE 形式列表
			* porous medium $u_t=(u^m)_{xx}$；{_o9ba1l}
			* KdV, sine-gordon, Cahn-Hilliard, Fokker-Planck；{_o9ba1u}
			* diffusion-reaction 中反应项形式（系数略）有 Logistic $u(1-u)$，square Logistic $u^2(1-u)^2$，bistable $u^2(1-u)$；{_o9ba18}
		* tbl9 求解器列表，不同方程不同，包括 特征线、PDEBench 的 FVM、解析解、KdV 谱方法，Fokker-Planck 用的 MNM（matrix numerical method）
		* secA.1.1 稀疏波、激波用 Riemann 求解器、齐次 (N) BC，其余问题应该都是周期 BC
* PROSE-FD-2409.09811 用于 2D 流体力学
	* "PROSE-FD: A Multimodal PDE Foundation Model for Learning Multiple Operators for Forecasting Fluid Dynamics"
		* Liu, Yuxuan; Sun, Jingmin; He, Xinjie; Pinney, Griffin; Zhang, Zecheng; Schaeffer, Hayden; 
		> created on 2024-10-21
	* fig1 整体架构示意图
		* encoder 输入为连续多 t 的所有 patch；{_oam97n}
		* decoder 输入 (t,k)，输出 t 时间的第 k 个 patch；{_oam95z}
		* （评）之前 1D 工作不打 patch，而是所有点状态进行统一的输入
		* sec2.4 encoder patch 个数：8×8 个 patch，每个大小 16×16
			* 时间、patch 位置编码可学
		* sec2.6 decoder patch 个数 16×16，比 encoder 多是因为这里复杂度线性而非平方
	* 多分量处理，sec2.4 暗示了固定 3 channels？（涉及的方程为 SWE，INS，CNS；CNS 似乎不包括 $\rho$ 分量）
	* tbl2 引入 PDE 形式信息能一定程度上提高精度，rel L2 4.0% 到 3.7%；无该部分符号信息时算纯粹的基于历史时间步预测；{_oam980}
	* （评）BC 未参与编码？还提到了“complex geometry”？
* 2502.06026 PROSE+ICON 组联合工作
	* "A Multimodal PDE Foundation Model for Prediction and Scientific Text Descriptions"
		* Negrini, Elisa; Liu, Yuxuan; Yang, Liu; Osher, Stanley J.; Schaeffer, Hayden; 
		> created on 2025-02-20
	* 摘要摘录
		> 当前的PDE基础模型侧重于学习通解算子和/或控制方程组，因此只处理数值或符号模态。
		> 然而，现实世界的应用程序可能需要更灵活的数据模式，例如文本分析或描述性输出。
		> 提出了一种新的多模态深度学习方法，该方法利用基于变换器的架构来近似各种ODE和PDE的解算子。
		> 将方程参数和初始条件等数值输入与物理过程或系统动力学的文本描述相结合。
		> 这使我们的模型能够处理符号表示可能不完整或不可用的设置。
		> 除了提供准确的数值预测外，我们的方法还生成了可解释的科学文本描述，为潜在的动力学和解决方案属性提供了更深入的见解。
	* fig1 架构，基于 GPT-2
		* 输入文本“The equation is u_t=.. The initial condition is u_0=[IC]”；{_p2ka1y}
		* [IC] 数值通过 MLP 编码为一个 token
		* 相应输出 token 整体输入 data decoder，再输入 query location 获得预测解；基于交叉注意力
		* 后续自回归预测输出为对解的描述，包括“无粘性守恒律”、“会产生稀疏波”等
	* 实验仅 ODE 与空间 1D PDE
* `bc-PINN` PINN 训含时问题逐步增大时间长度，仅新增时间段用 PINN loss，之前时间段用有监督 loss（已算出的解作为 label）
	* "A novel sequential method to train physics informed neural networks for Allen Cahn and Cahn Hilliard equations", CMAME2022
		* Revanth Matteya, Susanta Ghosha
		> 2023-09-22 导师在 MAD 群推荐
	* bc-PINN: backward compatible sequential PINN
	* 相关：PT-PINN-2212.00798 所采用的策略类似
* `2012.10047` PINN 中 INR 使用多尺度 Fourier feature embedding，用 NTK 论证该做法有效性
	* "On the eigenvector bias of Fourier feature networks: From regression to solving multi-scale PDEs with physics-informed neural networks"
		* Wang, Sifan; Wang, Hanwen; Perdikaris, Paris; 
		> created on 2023-09-10
	* eqn(3.10) 首层形如 $1/\sqrt{m}W[\cos(Bx);\sin(Bx)]$；{_o6rj50}
		* $B$ 的所有元素 $N(0,\sigma^2)$ 采样
* `2308.08468` PINN 训练建议汇总 by Sifan Wang
	* "An Expert's Guide to Training Physics-informed Neural Networks"
		* Wang, Sifan; Sankaran, Shyam; Wang, Hanwen; Perdikaris, Paris; 
		> created on 2023-08-26，lhu 推荐
	* fig1 整体流程
		* PDE 无量纲化，确保输入输出在合理范围内；{_n8qn1i}
		* 网络架构：Fourier 特征，随机权重分解，精确 BC
		* 训练算法：loss balancing, 训练体现时间因果性，课程学习
	* sec4.3 RWF（random weight factorization，随机权重分解），MLP 权重矩阵参化为 $W=diag(\exp(s))V$，$s,V$ 单独训练；{_n92e0r}
		* 注：MLP 层按数学惯例为 $Wh+b$（而非实现时的右乘 $hW+b$），计算时更新方式即为 $\exp(s)\odot Vh$
		* 初始化：先 Glorot 初始化 $W$，然后生成 $s\sim N(\mu,\sigma I)$，据此计算 $V$
			* （评）感觉有笔误，$N(\mu,\sigma^2I)$
		* 动机：权重归一化，允许其跨越较大范围
		* $\mu,\sigma$ 过小时性能类似传统 MLP，过大时可能训练不稳定
		* 建议 $\mu=0.5,1$，$\sigma=0.1$
	* sec5.3:-1 课程学习，如 NS 先训小雷诺数，作为大雷诺数下求解的初始化；{_n92e1o}
	* sec6.1 建议 Adam 无权重衰减，1e-3 指数衰减学习率
		> 已经为深度学习应用开发了许多优化器；然而，我们发现Adam优化器在没有大量调优的情况下始终能产生良好的性能。
		> 此外，我们不建议使用权重衰减，特别是对于正向问题，因为它往往会降低结果的预测精度。{_n92h9c}
		> 此外，学习率是PINN表现的关键因素。我们的经验表明，0.001的初始学习率，加上指数衰减，通常会产生良好的结果。{_n92h9l}
	* sec6.2 建议空间随机采样
		> 与全批采样相比，随机采样显著降低了每次迭代的内存需求和计算成本。
		> 更重要的是，随机采样引入了正则化效应，这最终有助于提高PINN的泛化能力。{_n92i08}
		> 根据我们的观察，使用全批梯度下降训练PINN可能会导致PDE残差过拟合。
		> 因此，我们强烈建议在所有PINN模拟中使用随机采样，以实现最佳性能。
	* sec6.4 又在推荐修改的 MLP 架构
* `2109.01050` PINN 在对流、反应扩散方程大系数上表现不好，提出的缓解方案为 1. 课程学习（先拟合小的系数），2. 一次只预测一个小时间步
	* "Characterizing possible failure modes in physics-informed neural networks", NeurIPS2021
		* Krishnapriyan, Aditi S.; Gholami, Amir; Zhe, Shandian; Kirby, Robert M.; Mahoney, Michael W.; 
		> created on 2023-08-26
	* 课程学习
		> 正则化”方法通过找到一个良好的权值初始化来暖启动NN训练。对于β/ρ较高的情况，我们不是训练PINN立即学习解决方案，而是从在较低的β/ρ上训练PINN（PINN更容易学习）开始，然后逐渐分别在较高的β/ω上训练PINN。{_n8qm1a}
		> 这在某种程度上类似于ML[1]中的课程学习，但通过逐渐使PDE/ODE更难解决来应用。
		> 随着课程的规范化，相对误差几乎降低了两个数量级。
		> 在图E.2中，我们还表明课程正则化不仅显著降低了误差，而且降低了误差的方差。
		> 在图E.3中，我们看到，与常规PINN训练相比，课程正规化会导致更平稳的损失。{_n8qk1v}
			* 即：loss landscape 变得光滑许多
		> 正如我们之前所讨论的，PINN很难学习高ρ值的尖锐特征。然而，课程规则化克服了这一点，即使ρ=10，如图E.4（c）5.2所示
	* 一次预测小时间步（即：先解 $[0,\delta t]$，然后将 $\delta t$ 求解结果作为初值解 $[\delta t,2\delta t]$）；原文称为 seq2seq；{_n8qm2m}
* `INSR-2210.00124` （本打算仅用于记录数据集，但最终什么也没记）
	* "Implicit Neural Spatial Representations for Time-dependent PDEs", ICML2023
		* Chen, Honglin; Wu, Rundi; Grinspun, Eitan; Zheng, Changxi; Chen, Peter Yichen; 
		> created on 2023-07-21
* `AirfRANS-2212.07564` 针对 RANS 的 CFD 数据集
	* "AirfRANS: High Fidelity Computational Fluid Dynamics Dataset for Approximating Reynolds-Averaged Navier-Stokes Solutions"
		* Bonnet, Florent; Mazari, Ahmed Jocelyn; Cinnella, Paola; Gallinari, Patrick; 
		> created on 2023-07-23
	* 摘要：
		> 我们开发了一个IRF RANS，这是一个用于研究亚音速和不同攻角下翼型上二维不可压缩稳态雷诺平均纳维-斯托克斯方程的数据集。
		> 我们还介绍了几何结构表面应力和边界层可视化的指标，以评估模型准确预测问题有意义信息的能力。
		> 最后，我们提出了四个机器学习任务的深度学习基线，以研究在不同约束条件下的IRF RANS，以进行泛化考虑：大数据和稀缺数据状态、雷诺数和攻角外推。
* `2307.08423` AI4science 综述，263 页
	* "Artificial Intelligence for Science in Quantum, Atomistic, and Continuum Systems"
		* Zhang, Xuan; Wang, Limei; Helwig, Jacob; Luo, Youzhi; Fu, Cong; Xie, Yaochen; Liu, Meng; Lin, Yuchao; Xu, Zhao; Yan, Keqiang; Adams, Keir; Weiler, Maurice; Li, Xiner; Fu, Tianfan; Wang, Yucheng; Yu, Haiyang; Xie, YuQing; Fu, Xiang; Strasser, Alex; Xu, Shenglong; Liu, Yi; Du, Yuanqi; Saxton, Alexandra; Ling, Hongyi; Lawrence, Hannah; Stärk, Hannes; Gui, Shurui; Edwards, Carl; Gao, Nicholas; Ladera, Adriana; Wu, Tailin; Hofgard, Elyssa F.; Tehrani, Aria Mansouri; Wang, Rui; Daigavane, Ameya; Bohde, Montgomery; Kurtin, Jerry; Huang, Qian; Phung, Tuong; Xu, Minkai; Joshi, Chaitanya K.; Mathis, Simon V.; Azizzadenesheli, Kamyar; Fang, Ada; Aspuru-Guzik, Alán; Bekkers, Erik; Bronstein, Michael; Zitnik, Marinka; Anandkumar, Anima; Ermon, Stefano; Liò, Pietro; Yu, Rose; Günnemann, Stephan; Leskovec, Jure; Ji, Heng; Sun, Jimeng; Barzilay, Regina; Jaakkola, Tommi; Coley, Connor W.; Qian, Xiaoning; Qian, Xiaofeng; Smidt, Tess; Ji, Shuiwang; 
		> created on 2023-07-22
	* 以下未看内容，只记录章节标题
	* sec2 对称性、等变性
		* sec2.6 群与表示论
		* sec2.7 $SO(3)$ 与球谐函数；{_n7mj3e}
		* sec2.8 使用 steerable kernel 给出等变网络的一般形式，标量场与向量场；{_n7mj31}
	* sec9 AI4PDE
		* sec9.2 forward modeling
			* sec9.2.5 长时间预测的稳定性
				* 传统方法，刚性方程宜用隐式格式；{_n7mj0h}
				* 自回归预测的 前向计算误差累积问题，已有解决方案：Sobolev 损失与（耗散性等）物理性质，Lyapunov 正则化子，对抗性噪声注入；{_n7mj1k}
				* 噪声注入方法，有正态假设做法，但可能无效；有工作直接从模型中获得噪声
				* 多步 loss，增量训练方法，先用单步 loss 再不断増长；{_n7mj0x}
				* 一次预测多步；{_n7mj2d}
			* sec9.2.6 保对称性（包括等变性）
			* sec9.2.7 体现物理约束，HNN，PINN 等
		* sec9.3 invP, invD；{_n7ng1u}
			* p172 invP 应用：
				* 流体力学 grounding（从 3D 流体 scene 的多视角视频推断流场）
				* system identification，从观测中推断物体性质（而无需专门实验）
				* 地球物理的全波形反演（测地表地震波，恢复地下密度、波速等）
				* 流体同化与 history matching
				* 医学成像的 tomography，用表面测量恢复内部结构，如 EIT
			* p173 invD 应用
				* 机翼形状设计
				* 离子推进器（如电推进器 EP 中的霍尔效应推进器 HET），基于等离子体动力学设计推进器形状、材料排列
				* 可控核聚变，托卡马克磁约束中优化外部磁场、壁设计，使等离子体达到的构型有较好的 稳定性、confinement 和能量消耗
				* 芯片制造，如其中的等离子体沉积，设计介电池形状、使等离子体沉积尽可能平滑
				* 水下机器人形状设计；应对气候变化；nanophotonics 纳米光学材料；电池设计
			* sec9.3.2 技术上的挑战，对 invD,invP 分别讨论
* `2307.05432` （备用）对 PDE 解用自监督学习，在下游任务上表现好于有监督，by LeCun
	* "Self-Supervised Learning with Lie Symmetries for Partial Differential Equations"
		* Mialon, Grégoire; Garrido, Quentin; Lawrence, Hannah; Rehman, Danyal; LeCun, Yann; Kiani, Bobak T.; 
		> 2023-07-15 MAD 讨论群推荐，当时认为处理的问题 trivial
	* p4:-1 似乎是使数据 3 通道：$(t,x,u)$（不完全确定）；{_n7fc08}
	* 数据增广方式：crop，Lie group 对解变换；{_n8ve3d}
		* 附录各表给出了 Burgers，KdV，KS，NS 方程的 Lie 对称群生成元
	* eqn(1) 自监督 loss，1. 同来源数据通过编码器所得隐向量类似；{_n7fb9r}
		* 2. 编码器非退化；{_p8n97o}
	* fig4 自监督学编码器后用编码结果训下游有监督学习器（PDE 系数回归、时间演化预测），效果好于直接学有监督学习器
	* 似乎是不同方程分开训练，每方程自监督所用数据集 10k（NS 26.6k），架构 ResNet18、100 epochs、AdamW，batch32、lr3e-4
* `2205.14249` 备用：PINN 求解 NS 方程圆柱扰流失败，解形如层流
	* "Experience report of physics-informed neural networks in fluid simulations: pitfalls and frustration"
		* Chuang, Pi-Yueh; Barba, Lorena A.; 
		> created on 2023-04-21
* `2203.07404` 含时方程 PINN 效果不好，改 loss 使尊重时间结构，历史 loss 较低后才考虑当前时间 loss
	* "Respecting causality is all you need for training physics-informed neural networks"
		* Wang, Sifan; Sankaran, Shyam; Perdikaris, Paris; 
		> created on 2023-04-20
	* 用 NTK 分析普通 PINN loss，发现有非期望行为（细节未 check）
	* eqn(3.1) 对各时间步 loss 加权 $L=\sum_iw_iL(t_i)$，$w_i=\exp(-\epsilon\sum_{j<i}L(t_j))$；{_n4km9y}
		* 即：若之前时间步的 loss 仍较大，则 $w_i$ 较小，暂时弱化当前时间步的 loss
		* （评）似乎未截断梯度，$w_i$ 参与 BP？
	* 使用((n4km8g))的架构，性能有额外提升
	* 实验包括带湍流的 NS 方程
* `INDEED-2304.07993` 对 NO 引入超网络，输入数据集（可变散点形式）得一 INR 形式 NO，Transformer 架构
	* "In-Context Operator Learning for Differential Equation Problems", PNAS 2023
		* Yang, Liu; Liu, Siting; Meng, Tingwei; Osher, Stanley J.;
		> created on 2023-04-19
		* 注：arXiv-v2 缩写改为 ICON；arXiv-v3 提示 arXiv 版本过时，见 [PNAS 发表版本](https://www.pnas.org/doi/10.1073/pnas.2310142120)
	* （评）回忆：上下文学习与（有监督的）hypernet 元学习类似，输入数据集后自动输出网络参数
		* 只是传统 hypernet 输入数据集用 DeepSet，这里用 Transformer encoder；主网络用 Transformer decoder
	* sec1：PINN 等 $x\mapsto u(x)$，NO $a\mapsto u$；本文 $(\{(a_j,u_j)\},a_0)\mapsto u_0$
		* 注意对不同算子，$a,u$ 的分量数、各分量定义域等都可不同
		* 术语：$(a_j,u_j)$ demo，$a$ condition，$u$ QOI
	* fig1 架构，Transformer encoder 输入 $(\{(a_j,u_j)\},a_0)$ 得 question embedding，Transformer decoder 输入 $\{x_i\}$、前传时用 question embedding 输出 $\{u_0(x_i)\}$；{_n4km4w}
		* （评）已经是 INR，只是用了批量前传的方式（不确定是否在架构上保证各点前传独立）
	* table1 $a_j$ 格式形如 $(x_i,v,a_j^v(x_i),e_j)$，$u_j$ 除了用 $-e_j$ 外与之一致
		* $v$ 表示不同分量，如初值、（含时）边值、（含时）源项，不同分量可有不同定义域
		* $e_j$ 用于标记各输入哪些属于同一个 demo，并用 $e_j,-e_j$ 区分 condition、QOI
			* 本文 $e_j$ 用 one-hot，实际也可用类似 word embedding 之类的办法，无需设定最大 demo 数
		* 作为 Transformer 输入，key 用 $(x_i,v)$，value $a_j^v(x_i)$，index $e_j$
		* （评）若有 $J$ 个 demo，每个 condition 给 $n$ 格点（对所有分量的格点数加总）、每个 QOI 给 $m$ 格点，则 Transformer encoder 输入应该是大小为 $J(m+n)+m$ 的 set
			* 当然其实不同 demo 的 $n,m$ 可不同
		* 注：后续工作 ICON-LM 不再输入 $e_j$，其功能（体现数据配对关系）由解码器单向注意力替代
	* 实验，用同一个网络，只算 1D ODE，不过考察的算子涵盖初值、二阶边值、内插、时序预测问题、反问题等
		* 实际上同一个参化 ODE 还将部分参数视为算子的参数、其他参数视为算子输入，从而考察的算子个数比问题个数多很多
		* （评）初值问题与时序预测问题不同，前者是已知初值、参数，后者是要根据观察到的时序推断参数
* `ICON-LM-2308.05061` 文本描述 ODE 形式、已知量为哪些、待求什么，与已知量数值内容同时输入 NO、输出待求量
	* "Fine-Tune Language Models as Multi-Modal Differential Equation Solvers"
		* Yang, Liu; Liu, Siting; Osher, Stanley J.; 
		* 作为 `INDEED-2304.07993` 的后续工作，已开源代码、数据
		> created on 2023-11-18
	* p3:-1 从头训练，单模态任务准确性击败前序工作 ICON，训练时间更少、参数量近似减半、内存需求相当
		* 数据基于之前 ICON 的数据，利用 GPT4 API 标注 caption
	* fig2 Transformer decoder 输入，caption（文本）、condition（方程中已知量，如初值、源项）、QoI（待求量）、query token
		* 相应注意力掩码设置方式，文本部分为传统单向注意力，其余部分稍复杂（整体单向、局部双向，如同一个 condition 内多个 token 之间为双向）{_nbih26}
	* （后续工作提到）query 和 condition 其实无需严格区分
		* 预测方式为给定之前所有的 condition-QoI pairs 和当前 condition 预测其 QoI
		* 前传按单向注意力、对序列中的所有 QoI 预测结果求 MSE 用于训练；{_o3nb6o}
			* 除第一个 QoI，因不假定算子可零样本预测，因此不对其求 loss
			* （评）应该需要移位预测，当前 condition 位置对应的 Transformer 输出应为相应 QoI，而非从后一个位置输出；QoI 位置对应的输出不作要求
		* 推理只需给定同样的序列，在序列最后位置放相应 condition 即可
	* 附录，文本 caption 的例子，自然语言中夹带 LaTeX 公式；包括精确、模糊两类，每类有多种变体
		> （精确版本）`Knowing that $a_1 = -0.0124, a_2 = 1.06, a_3 = 0.105$, the derivative $du(t)/dt = -0.0124 \cdot u(t) + 1.06 * c(t) + 0.105 $. Condition: $u(0)$ and $c(t), t\in[0,1]$, QoI: $u(t), t\in [0,1]$.`
		> （模糊版本）`Variable $u$’s time derivative is $du(t)/dt = a_1 \cdot u(t) + a_2 \cdot c(t) + a_3$. Condition: $u(0)$ and $c(t), t\in[0,1]$, QoI : $u(t), t\in[0,1]$.`
* `ICON-2401.07364` ICON 在 1D 守恒律方程上测试，并考虑 OoD 泛化
	* "PDE Generalization of In-Context Operator Networks: A Study on 1D Scalar Nonlinear Conservation Laws", JCP
		* Yang, Liu; Osher, Stanley J.; 
		> 2024-01-20 导师在 MAD 群里推荐
	* 方程形如 $u_t+f(u)_x=0$，训练集 $f(u)=au^3+bu^2+cu$，OoD 测试还用了 $f(u)=\sin(u)-\cos(u),\tanh(u)$ 等
		* 系数分布 $a,b,c\sim U([-1,1])$，sec2.6.1 系数超出此范围情形可通过令 $u=\alpha v$ 将对应系数放回 $[-1,1]$ 区间
			* （评）感觉里面说 $\alpha>1$ 写错了，我觉得需要 $\alpha<1$ 才能回到这个区间
		* sec4.3 实验有测试新方程用 3 次多项式逼近后对应解的精度
		* （评）未将方程形式作为网络输入，故 OoD 不需要处理新的 token
	* sec2.3 训练；针对反向推理训练，解不唯一问题
		* 试了用通常的 L2 loss（预计会被多解问题困扰）
		* 还用了 consistency loss，对当前预测结果用 WENO 算时间推进、结果和网络输入的终值求 loss；{_o1lj5b}
			* JCP 版本不是用 WENO，而是用之前训好的（参数 frozen）forward operator，其输入为 $I-1$ 个 condition-QoI pair 以及新 condition（backward operator 的输出）
				* 度量模型表现时才用 WENO 作为正算子
	* sec2.4 时序推理方法；{_o1lb53}
		* 似乎仅用于推理，不是用于训练
		* 1. self-reference，输入为 $u(0),u(t),u(2t),\dots,u(nt)$ 要求输出 $u(nt+t),u(nt+2t),\dots,$ 或者历史回溯 $u(-t),u(-2t),\dots,$
		* 2. single-reference record，输入某初值下的 $u(0),\dots,u(nt)$ 和新初值，要求预测新初值的未来演化
		* 3. multi-reference record，输入多个初值下的 $u(0),\dots,u(nt)$ 和新初值，要求预测新初值的未来演化
		* JCP 版本 sec2.5：长时间预测有多种可能格式，本文用的形式：
			* step 1. 用同一个初始时间步 $t_0$、变化时间步长 $s=t,2t,\dots,S$，从而一直预测到 $u(t_0+S)$
			* step 2. 固定时间步长 $S$、变化初始时间步 $t_0+t,t_0+2t,\dots,$，持续往后预测
		* sec2.6.2 时间步长 $t$ 可变
			* JCP 版本：训练用固定步长，推理可换用其他步长，因相当于对 PDE flux rescale
		* JCP 版本认为 MPP 忽略了动力学的 Markovian 性质
			* 本文做法也可用于 non-Markovian 动力学：condition 为 multiple frames 而不是仅一个
			* 第二个优势：长时间步预测，MPP 类做法输入 $u(0),u(nt)$ 可能数据量太少，ICON 可输入 $(u(0),u(nt)),(u(1),u(nt+1)),\dots,$ 可用数据更多
	* sec3 数据准备，1000 个 $(a,b,c)$ 对，每个 100 初值算 801 时间步，为存储高效只从 100×801 个数据对中随机选 10,000 个保存用于训练
		* 初值用 GRF 生成，且 covariance kernel 涉及 exp 里套 $1-\cos(x-x')$
		* 求解器 WENO + RK4
* VICON-2411.16063 ICON 用于 2D 含时方程，基于 patch；{_ocoa1m}
	* "VICON: Vision In-Context Operator Networks for Multi-Physics Fluid Dynamics Prediction"
		* Cao, Yadi; Liu, Yuxuan; Yang, Liu; Yu, Rose; Schaeffer, Hayden; Osher, Stanley; 
		> created on 2024-12-24
	* sec4.2:3 输入 $a$ 和输出 $u$ 的 patch 数目可以不同：如果 BC 使用 padding，输入 patch 数更多；{_ocoa1g}
		* 注：记号与原文对应 $a:c$（condition），$u:q$（QoI）
		* eqn(6) 注意力掩码矩阵为分块下三角
		* sec4.3 输入、输出分别做归一化
	* sec4.4 数据集：PDEArena INS，PDEBench CNS 粘性高&低
		* QoI：INS 为 速度+粒子密度，CNS 为 速度、压强、密度
		* 基线模型为 MPP
	* 多分量处理策略：secA.3 给定分量集合取并集，包括 $\rho,u,v,p,\omega,s,I$；{_ocoa0n}
		* I 为 node type indicater, 在内部为 0，边界为 1
		* 对具体数据集使用 channel mask，只在这些通道上算 loss；I 不参与 loss 计算
* GenICON-2509.05186 ICON 生成模型版本，提供 UQ；{_pakg2y}
	* "Probabilistic operator learning: generative modeling and uncertainty quantification for foundation models of differential equations"
		* Zhang, Benjamin J.; Liu, Siting; Osher, Stanley J.; Katsoulakis, Markos A.; 
		> created on 2025-10-20
	* 摘要摘录
		> 在这里，我们提出了一个概率框架，该框架揭示了ICON隐式执行贝叶斯推理，其中它计算了基于所提供上下文（即示例条件解决方案对）的解算子上的后验预测分布的均值。
		> 随机微分方程的形式化为描述ICON完成的任务提供了概率框架，同时也为理解其他多算子学习方法提供了基础。
		> 这种概率视角为将ICON扩展到生成环境提供了基础，在生成环境中，人们可以从解算子的后验预测分布中进行采样。
		> ICON的生成式（GenICON）捕获了解算子中的潜在不确定性，这使得在算子学习中的解预测中能够进行原则性的不确定性量化。
* pi-FNO-2308.07051 针对守恒型双曲方程，FNO 训练同时用数据和（积分形式）PDE loss，训练用初边值分布为简单阶跃，该选取好于 GRF 等
	* "Fourier neural operator for learning solutions to macroscopic traffic flow models: Application to the forward and inverse problems"
		* Thodi, Bilal Thonnam; Ambadipudi, Sai Venkata Ramana; Jabari, Saif Eddin; 
	* 以下笔记针对审稿版本
	* "Fourier neural operator for learning weak solutions of nonlinear scalar hyperbolic PDEs: Numerical experiments and generalization results"
		> created on 2023-04-15
	* 考虑 1D 交通流问题（> 像流体 Euler 方程），守恒律形式，有稀疏波、激波
		* BC 含时（红绿灯），从而激波（堵车开始处）位置可前后移动
	* FNO 架构：只输入 IC,BC,内部已知值（对反问题）；取值未知的部分放 -1，故完全按普通网格数据输入；{_n4fe42}
		* （评）-1 代替的可行性可能由于正常数据取值都非负
	* FNO 训练 loss：数据 loss 基础上加 PDE loss，由于有间断故使用积分形式，类似有限体积；{_n4fe7i}
		* 实验，sec5.5 无 PDE loss 的纯 FNO 解较差：
			* 长时间预测性能不佳，所得解在长时间后被平均了；{_n4fe63}
			* 并且更倾向于 diffused jump 而非 sharp shock，过渡区更宽，且由于 FT 产生更多噪声；{_n4fc0q}
	* 训练数据分布：IC,BC 简单阶跃，测试时可泛化至多阶跃；{_n4fe8m}
		* 另外训练数据若用 GRF、正弦等效果比这个差，不捕捉解的激波等 pattern
			* 认为解光滑时训练用 GRF 就很好，但对有激波问题应尽量用间断初边值；{_n4fe89}
			* （评）不排除是因为作者只在阶跃问题上测试？
* `2303.09280` PINN 处理拓扑优化/反问题，表示密度的待解场 ansatz 在 sigmoid 前加 Eikonal 方程约束用于正则化，且 sigmoid 内部系数不断增大，以使边界尽量清晰；
	* "Topology optimization with physics-informed neural networks: application to noninvasive detection of hidden geometries"
		* Mowlavi, Saviz; Kamrin, Ken; 
		> created on 2023-04-05
	* 弹性力学，拓扑反问题：材料内部有空腔/硬物，已知材料表面施加均匀受力时表面形变（位移）情况，需反演内部空腔、硬物的个数、位置、形状
* `PSO-PINN-2202.01943` PINN 用粒子群方法训练，更新方向结合梯度信息、并在后期增大梯度权重，以避免不规则解导致的训练病态，并提供集成学习、UQ
	* "PSO-PINN: Physics-Informed Neural Networks Trained with Particle Swarm Optimization"
		* Davi, Caio; Braga-Neto, Ulisses; 
		> created on 2023-04-05
	* 摘要：
		* 解不规则时，简单 GD 训练常表现出阻碍收敛的病态，故用粒子群优化（PSO）方法
		* 同时作为集成（ensemble）方法，提供 UQ
		* 提出的 PSO-BP-CD 为 PSO 与 GD 优化结合，训练后期对 GD 权重升高、群体集中在好的局部区域内；实验表现好于纯 PINN、纯 PSO
	* sec2.3 回忆 PSO：每粒子表示一候选解，粒子在迭代中交换信息，迭代更新时依据：当前速度，自身历史最优值，群体历史最优值
		* 使速度衰减，并（按随机权重 $r$、行为系数 $c$）趋向个体历史最优、群体历史最优
		* 变体 PSO-BP 可与梯度信息结合，速度减掉负梯度；sec3.2 实际中用 Adam
		* sec3.1 再变体 PSO-BP-CD，线性地逐渐降低行为系数，从而各粒子越发独立
	* sec3.3 结果视为集成学习：loss 最小的结果可能过拟合，可用所有结果的平均
* `NSGA-PINN-2303.02219` （备用）PINN 训练多项 loss 问题，用遗传算法，适应度依据各 loss 下大小决定
	* "NSGA-PINN: A Multi-Objective Optimization Method for Physics-Informed Neural Network Training"
		* Lu, Binghang; Moya, Christian B.; Lin, Guang; 
		> created on 2023-04-05
	* sec3.1 从亲本群体随机选二解 $u_1,u_2$，若 $u_1$ 在所有目标函数中损失值都 $\le u_2$ 且有一个不等号，则称 $u_1$ 主导 $u_2$
* `Meta-PDE-2211.01604` 用 MAML、LEAP 元学习算法加速 PINN（没什么新意）
	* "Meta-PDE: Learning to Solve PDEs Quickly Without a Mesh"
		* Qin, Tian; Beatson, Alex; Oktay, Deniz; McGreivy, Nick; Adams, Ryan P.; 
		> created on 2023-04-05
	* p4:0 采样算子，均匀采样时对 PINN loss 估计无偏，但若只关心求解，其实不要求无偏
* `2001.04536` todo: 提出 PINN 训练的学习率退火策略、网络架构中隐层反复引入网络输入
	* "understanding and mitigating gradient pathologies in physics-informed neural networks"
		* Sifan Wang, Yujun Teng, Paris Perdikaris
		> 2021-04-14 组会，li+1学长
	* （评）反复引入网络输入的有效性 或由于激活函数选得不好（tanh）
* `LPINN-2205.02902` 1D 对流主导方程、周期 BC，改求解 Lagrangian 而非 Eulerian 场；我不确定其方法正确性
	* "Lagrangian PINNs: A causality–conforming solution to failure modes of physics-informed neural networks", CMAME
		* Rambod Mojgania , Maciej Balajewiczb , Pedram Hassanzadeha
		* 注：以下记录依据文章的发表版本
		> created on 2023-04-04
	* 考虑 1D 周期 BC，对流主导的 PDE
	* todo: 从 Kolmogorov n-width 的角度考虑？待确认为何，本来 PINN 也不是线性 ansatz；table2？
	* eqn(11) 考虑的方程形如 $w_t+f(x,t,w)w_x=g(x,t,w)w_{xx}$，周期 BC（待确认 BC）
	* eqn(12) 改写：Lagrangian 描述 $X(x,t)$，$X_t=f$，原方程改写为随体导数 $D_tw=gw_{xx}$
		* （评）这种改写的正确性？似乎是令 $W(x,t)=w(X(x,t),t)$，但这样 $W_{xx}\ne w_{xx}$？
	* todo: sec6 各种可能的局限性等
* `ADMM-PINN-2302.08309` 反向设计问题视为 PDECO，目标函数中正则化项不便直接 PINN 优化，故改写优化问题形式后用 ADMM 求解
	* "THE ADMM-PINNS ALGORITHMIC FRAMEWORK FOR NONSMOOTH PDE-CONSTRAINED OPTIMIZATION: A DEEP LEARNING APPROACH"
		* YONGCUN SONG 1 , XIAOMING YUAN
		> created on 2023-04-03
	* 设控制参数 $u$ 下 PDE 解 $y(u)$，优化目标 $J(y(u),u)+R(u)$
	* 假定 $R(u)$ 非光滑、不便（像普通 PINN）梯度优化，但有高效的传统算法；p2 例子：
		* 示性函数（可在函数空间中），例如可要求 $u(x)\in[a,b]$ a.e. 成立（场约束），或者 $\int u\in[a,b]$ 标量约束
		* 稀疏正则化项 $\|u\|_1$，L1 范数
		* TV 正则化项 $\int|\nabla u|$；eqn(2.13) 可通过引入新变量、等式约束 $w=\nabla u$（或 ADMM 化后 $\nabla z$）来优化
			* （评）感觉此时再引入 $z$ 有点多余，其实没必要
	* eqn(2.1) 改写为约束优化问题 $J(y(u)+u)+R(z)$ 使 $u=z$，用增广 Lagrange 给出 $L(u,z,\lambda)$
	* 之后 ADMM 三变量交替更新，对 $u$ 更新用 PINN，对 $z$ 更新用传统数值求解器
	* sec2.2 对 $u$ 更新子问题，AtO 与 OtA 两种；{_n44g4j}
		* AtO 即 approximate-then-optimize，用普通 PINN 求解（PDE 约束按罚函数引入）
		* OtA optimize-then-approximate，引入对偶变量 $p$，优化问题解写为三个 PDE，只需求解该 PDE（仍用 PINN，即等式约束改写为罚函数、化为优化问题）
* `hPINN-2102.04626` 反向设计写为约束优化问题，罚方法、增广 Lagrange 方法，用 PINN 解
	* "physics-informed neural networks with hard constraints for inverse design"
		* LU LU† , RAPHAËL PESTOURIE† , WENJIE YAO† , ZHICHENG WANG‡ , FRANCESC VERDUGO§ , AND STEVEN G. JOHNSON
		> created on 2023-04-03
	* 约束优化问题形式，PDE 内部、边界约束，及有限维不等式约束 $h(u,\gamma)\le 0$
	* sec2.3 网络构造自动满足 BC
	* sec2.4 软约束（取定惩罚系数的罚函数方法），包括不等式约束
	* sec2.5 罚函数方法，不断增大惩罚系数的版本；{_n43i5y}
	* sec2.6 增广 Lagrange 方法（ALM），PDE 内部约束散点离散后成为有限维约束，从而可用有限维 Lagrange 乘子处理；{_n43i5v}
	* 实验 1，2D holography，有固定波源、可设计的中间物（类似透镜）、后方目标区域
		* 优化目标：目标区域波场接近指定形状（取为固定方形上示性函数）
			* 该目标不可能严格满足（它不满足 Helmholtz 方程），只能尽量接近
		* 3 个 PINN 分别表达 Helmholtz 波场实部、虚部、中间物电导率
			* 中间物电导率 ansatz 形如 $1+11\sigma(NN)$，用了 sigmoid 函数；{_n43j5o}
				* （评）这种 ansatz 也保证了系数场连续性，不会出现不连续系数场导致直接用 PINN loss 不对的问题（当然那种情况也可用升维解决）
* `MoE-PINNs` （对我参考价值可能有限）PINN 用 MOE 架构
	* "Mixture-of-Experts-Ensemble Meta-Learning for Physics-Informed Neural Networks"
		* Rafael Bischof, Michael Kraus
		> created on 2023-04-02
	* 摘要：发现相对于 uniform penalty，用 resolute regularization 效果更好，它可以为能力不足的网络赋予零重要性；{_n42n4f}
	* fig2 ansatz $u=\sum\lambda_i(x)u_i(x)$
* `2303.07127` 元学习加速 PINN，通过学优化器（逐分量，作为基于 Adam 的改进）
	* "Improving physics-informed neural networks with meta-learned optimization"
		* Alex Bihlo
		> created on 2023-04-02
	* 记 Adam 更新公式为 $\theta_+=\theta-w^a(z)$，$z$ 包括当前梯度、累积的动量、二阶矩 $v$ 信息
	* 提出的更新公式形如 $\theta_+=\theta-r_1(z;\omega)w^a(z)-r_2(z;\omega)$，将 Adam 更新量乘了系数，并加额外自由可学的项；由 $\omega$ 参数化；{_n4bm6f}
		* Adam 系数 ansatz $r_1=\exp(s_1(z;\omega))$ 保证非负（原公式还有取定的系数）
		* 额外项 ansatz $r_2=\exp(s_2(z;\omega))d(z;\omega)/(\sqrt v+\epsilon)$
			* p5:1 $s_2$ 控制 magnitude，$d$ 控制 direction
			* $/(\sqrt v+\epsilon)$ 与 Adam 更新中做法相同
		* 各可学网络均用 MLP
	* p5:2 使用的信息 $z=(k,\theta,\nabla_\theta L,v)$，$k$ 步数；{_n4bn10}
		* $k$ 输入方式：升至 11 维，$\tanh(k/10^{n/2})$，$n=0,\dots,10$；{_n4bn4m}
		* 二阶矩 $v$ 其实不是一个，而是多个、对应不同衰减率 $0.5,0.9,0.99,0.999$；{_n4bn4w}
		* 并且每个 $v$ 其实输入的是 $(v,1/\sqrt v)$
		* （评）似乎未输入累积的动量，只有二阶矩？
	* 这里用的是逐分量优化器，优点是可对不同网络架构泛化
		* （评）若用 Transformer 架构，或也可对不同网络架构泛化，同时又能建模不同参数之间的相互影响关系？
	* 该更新公式的合理性见引文 `STAR-2209.11208`
	* 实验，效果明显好于 Adam
* `METALIC-2210.12669` PINN 区域硬分解，涉及界面条件选取，用 RL 找出；包括两训练阶段用不同界面条件（待拆卡）
	* "Meta Learning of Interface Conditions for Multi-Domain Physics-Informed Neural Networks"
		* Shibo Li et al
		> created on 2023-04-01
	* 问题：PINN 硬区域分解，设置合适的区域边界连续性条件
		* 包括 $I_1$：$u$ 连续性，$I_2$：$Lu-f$ 的连续性；{_n41f6n}
	* sec3 可能的连续性约束（惩罚项）集合记为 $S=\{I_1,\dots,I_q\}$，目标：根据 PDE 参数 $\beta$，自动生成 $I(\beta)\subset S$，即找一组界面连续性的惩罚项；{_n41f6u}
	* sec3.1 视为多臂老虎机（MAB），每次采样一个 PDE 参数、生成一组 interface condition，用 PINN 求解、将误差作为负 reward
		* 用 UCB 算法或 Thompson 采样
	* sec3.2 训练分两阶段：第一阶段随机训练，用 Adam，以在 loss landscape 中找到较好的 valley；第二阶段确定性优化，常用 L-BFGS，以收敛到局部极小；{_n42800}
		* 两阶段的最佳界面条件可能不同，故引入顺序 MAB 模型
* `2208.02801` Transformer 作为 INR 的超网络
	* "Transformers as Meta-Learners for Implicit Neural Representations", ECCV2022
		* Yinbo Chen and Xiaolong Wang
		> created on 2023-04-01
	* 类似 ViT，data token 为图像 patch 编码得到
	* fig3 超网络架构 Transformer：输入 data token、init token，输出中 init token 对应位置的结果作为权重 token，用于生成 INR 参数（权重矩阵）{_n42e7f}
	* p7 Transformer 联合建模：1. data token 交互、构建观测特征，2. data、init token 交互，将观测的内容转移到权重，3. init token 交互，建模 INR 不同权重的关系
		* INR 不同层权重的列向量可能不同，每层单独训一个 FC NN 把权重 token 映射到该层的权重 $W_i$
		* Transformer 训练，可以加泛化能力要求，如输入图像、输出表达 NeRF 等的 INR 权重（视图重建）
			* （评）算 NO，输入均匀网格，输出无网格
	* sec3.4 INR 权重太多，采用分组策略，某个权重矩阵 $W$（$r$ 列）分组、每组大小 $k$；{_n42e8y}
		* 另有与数据无关的参数 $\bar w$，INR 参数使用 $w_{ik+j}=N(u_i\odot\bar w_{ik+j})$，$N$ 为 L2 归一化
			* （评）不考虑归一化，可认为将 $w$ 分解成了线性基底组合、系数 $u$，且各基底的 support 有限（这里还互不相交），$u_{r,i}$ 控制 $w_{r,ik+j}(0\le j<k)$ 的生成；{_n4c950}
		* 从而现在 Transformer 只需生成 $U$
		* p5 bias 并入权重矩阵里面（PDF 文件里搜“bias”可找到这句）
	* sec4.1 实验细节
		* p9:-2 本文 follow ViT 设定，各 patch 拉直为向量 $p_i$，位置编码 $e_i$ 可学，data token 为 $FC(p_i+e_i)$；{_n8dm00}
			* （评）不是 $FC(p_i)+e_i$？而且位置编码并非手动指定？
		* p9:-1 random crop 数据增强策略，
			* 目标图像 178x178，零填充得 180x180 后打成 9x9 patch；{_n8dm0o}
	* fig7 训练后可视化输入 patch 与 INR 权重的对应关系，似乎浅层对应的 patch 数相对少
* `R2N2-2211.12386` （备用）可学的迭代算法，作者含 Qianxiao Li
	* "A Recursively Recurrent Neural Network (R2N2) Architecture for Learning Iterative Algorithms"
		> created on 2023-03-31
	* eqn(10),sec3.2 涉及嵌套迭代：类似 Runge-Kutta，只是现在内层迭代用 NN；外层仍写为内层各步结果的线性组合；{_n3vh2f}
* `HyperTime-2208.05836` （备用）INR 表示时间序列数据，loss 基于 FFT，用于压缩、生成任务等
	* "HyperTime: Implicit Neural Representation for Time Series"
		* Elizabeth Fons J. P. Morgan AI Research
		* Alejandro Sztrajman University College London
		* Alexandros Iosifidis Aarhus University
		* Yousef El-laham J. P. Morgan AI Research
		* Svitlana Vyetrenko J. P. Morgan AI Research
		> created on 2023-03-31
	* 用基于 FFT 的 loss 训练，以在时序中保留所有频率
	* eqn(1) 用 sin 激活函数
* `Poly-INR-2303.11424` INR 坐标在每层反复输入（而非仅首层），并引入隐向量控制，作为生成模型超过 GAN
	* "Polynomial Implicit Neural Representations For Large Diverse Datasets", CVPR2023
		* Rajhans Singh, Ankita Shukla, Pavan Turaga
		> created on 2023-03-31
	* eqn(3) 网络架构：$h_+=\sigma(W(h\odot(AX)))$，$h_0=1$，$W_i,A_i$ 各层独立；{_n3vf74}
		* （评）$A$ 里有 bias，但 $W_i$ 的表达式似乎没写 bias
		* sec3 激活函数 $\sigma$ leaky ReLU，其参数 0.2
		* eqn(3)+1 隐层宽度，大数据集 ImageNet 用 1024，FFHQ 较小、用 512
	* sec3 INR 架构，坐标在网络中间层反复输入
		* 传统 MLP 只以坐标位置作为输入，若用 ReLU 激活则只能近似低阶多项式¹，从而仅近似低频信息
			* ¹（评）应该指分片多项式，类似 FEM；层数不足时片数不多，从而表达能力不足
		* 若引入位置编码，用高阶多项式：嵌入空间大小固定，只包含少量高阶多项式，且不知道哪些高阶项重要；{_n3vf5v}
		* （评）这一策略有点像 MFN，只是 sin 换成了仿射变换，且多了激活函数？
	* fig2 INR 由隐向量¹ $z$ 控制，方式：将它输入 mapping network²，生成各 $A_i$；{_n3vg20}
		* ¹其实是 $z$ 和图片 class embedding $c$ 的 concat
		* ²本文主网络 INR 称为 synthesis network
		* sec3 $z$ 64 维，mapping network 为两层 MLP，输出 512 维；再过线性层得各 $A_i$
			* （评）如果 MLP 末层已经线性，后面再过线性层则显得冗余，应可合并（除非二线性层中仅一个可学）
	* sec1:-1 作为生成模型，在 ImageNet 表现超过 GAN，参数减少 3-4 倍（取决于分辨率）{_n3vg4b}
	* 代码阅读：
		* GMganSynthesis 为 INR 定义（poly_inr/training/networks_gmgan.py:183）；forward 函数：
			* f,input 的各元素应为超网络输出
			* 输入 grid 用仿射变换 xy_1 更新
			* 再过仿射变换 xy_，过 LReLU、裁剪得 x（按我习惯用 h 更合适）为 INR 隐层激活值
			* 二仿射变换均由 f 第一个参数生成
			* 之后过多个 BasicBlockGM，每层更新 x,grid
				* 代码里还在更新 g1，但其实用不上
				* grid 路独立，不断通过仿射变换 xy_1 更新；示意图中相当于 $(x,y,1)$
				* 与示意图的小区别：$(x,y,1)$ 仿射变换结果过 LReLU 后才参与逐点乘积（图中无 LReLU）
		* BasicBlockGM 为 INR 各层（:32）
		* Generator（:250）为主要网络，前传时输入 z,c，超网络据此生成 w，再作为 INR 的旁路输入
		* MappingNetwork（:98）超网络架构
			* :155 循环整体相当于一个 MLP；每次操作为 仿射变换后过 LReLU，只是某些操作自己写了（甚至有 CUDA 程序）
* `GPT-PINN-2303.14878` （感觉对我的价值有限）
	* "GPT-PINN: Generative Pre-Trained Physics-Informed Neural Networks toward non-intrusive Meta-learning of parametric PDEs∗"
		* Yanlai Chen, Shawn Koohy
		> created on 2023-03-30
	* 考虑参化 PDE，参数 $\mu$
	* fig2 最终网络为单隐层 NN，隐层中第 $i$ 神经元的激活函数 $\Psi_i$ 也是 NN，恰好对应 $\mu_i$ 训得的 PINN
		* （评）注意不是整个隐层所有神经元用相同激活函数，而是每个神经元有自己的激活函数
	* sec3.1 取定空间采样点（包括初边值），可预先计算各 $\Psi_i$ 在这些点上的（高阶）时空导数，从而大网络 PINN loss 的计算很方便；{_n3vh0c}
		* （评）如果增加到多个隐层，就没有这个好处了
		* （评）是否依赖于最终大网络的首层参数固定，解只表达为 $\Psi_i$ 线性组合？若不然，特定采样点经过大网络首层线性变换后，已离开原来的位置
	* sec3.2 整体训练流程，大网络隐层神经元数目从 1 开始增加，新 $\mu_i$ 用贪心算法选取；{_n3vh0y}
		* 随机选 $\mu_1$、训 $\Psi_1$
		* 扫描参数空间，用只有单个隐层神经元的大网络逐个学（代价低）
		* 将误差最大的参数作为 $\mu_2$，训 $\Psi_2$，加入大网络中
		* 循环，直到满足停机准则（误差足够小，或者大网络隐层数目较大）
		* 新 $\Psi_i$ 权重初始化：从已有 $\mu_i$ 中找近邻，用线性插值

