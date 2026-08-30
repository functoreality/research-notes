* Open-CK 工业园区火灾模拟数据集
	* "Open-CK: A Large Multi-Physics Fields Coupling benchmarks in Combustion Kinetics", ICLR 2025
		* Zaige Fei, Fan Xu, Junyuan Mao, Yuxuan Liang, Qingsong Wen, Kun Wang, Hao Wu, Yang Wang
		* [2025-06-04](https://openreview.net/forum?id=A23C57icJt)
	* 摘要摘录
		> 我们使用火灾动力学模拟器（FDS）结合超级计算机支持，为机器学习和科学研究创建了一个燃烧动力学（CK）数据集。
			> 该数据集通过高精度计算流体动力学（CFD）模拟捕捉了工业园区火灾的发展。{_p64f11}
			> 它包括温度和压力等各种物理场，并涵盖了探索多物理场耦合现象的多种环境组合。
		> 此外，我们使用64个NVIDIA A100 GPU的大量计算设置，在Open CK基准测试中评估了几种先进的机器学习架构：❶ 视觉骨干； ❷ 时空预测模型； ❸ 操作员学习框架。
			> 这些架构在处理复杂的物理场数据方面表现出色。
		> 我们还介绍了三个基准，以证明它们在加强下游任务探索方面的潜力：（a）捕捉燃烧动力学的连续变化；（b）用于学习温度场和湍流的神经偏微分方程求解器；（c）稀疏物理观测的重建。
* FD-Bench-2505.20349 PDE 基准数据集，并用于比较 NO 性能，NO 为模块组合、各模块均多种选择
	* "FD-Bench: A Modular and Fair Benchmark for Data-driven Fluid Simulation"
		* Wang, Haixin; Li, Ruoyan; Xu, Fred; Sun, Fang; Han, Kaiqiao; Huang, Zijie; Wan, Guancheng; Chang, Ching; Luo, Xiao; Wang, Wei; Sun, Yizhou; 
		> 2025-05-29 导师群里推荐
	* tbl1 各基准数据集特点比较，PDEBench、CFDBench、TheWell、PDEgym 等
	* （评）fig3 本文似乎都是 2D 方形区域，但有用非规则散点离散的数据；{_p64e8o}
	* fig2 本文考察的模型性能，各关键模块均有多种类型
		* 空间表征：频率混合（FNO），降阶（低维 bottleneck），patch 自注意力，卷积，INR，graph
			* sec6 自注意效果最好，频率混合性价比高；{_p64a15}
				> （1）自我注意对空间编码特别有效，通过稀疏注意、感受野调制或变换正则化等技术，其性能可能会进一步提高。
				> 同时，基于频率的方法以最低的成本提供了强大的性能，突显了将数学先验嵌入神经求解器的前景。
			* sec6 graph Lagrange 粒子方法在流体预测表现不好；{_p64a3f}
				> （4）我们还观察到，基于拉格朗日的神经模拟器在捕捉基本流体动力学结构方面往往表现不佳。
				> 他们强调模拟高分辨率的局部相互作用，这随着时间推移导致了严重误差累积和粒子间传播。
				> 为了缓解这一问题，未来的方向可能涉及分层或多尺度架构，如基于U-Net的设计，可以动态平衡细粒度分辨率和全局结构一致性，从而提高稳定性和通用性。
		* 时间表征：自回归，单步预测结合 rollout，temporal bundling，NeuralODE
			* （评）自回归与单步预测区别：后者输入为单步，前者为所有历史时间步，其长度可变
			* （评）temporal bundling 指输入输出均 k 步
			* sec6 temporal bundling 性价比高；其他时间演化策略的加速值得研究；{_p64a44}
				> （2）简单而有效的时间绑定策略在受限的计算预算下实现了强大的性能。
				> 这表明了一个有价值的研究方向：通过轻量级设计加速神经ODE等时间进化模块，可能在现实世界应用中的预测保真度和效率之间产生更有利的权衡。
		* 损失函数：物理变量（有监督），PDE residual，扩散生成训练时预测噪声，流匹配拟合迁移速度
	* sec6 实验结果总结
		> （3）虽然与传统的数值方法相比，神经求解器表现出了有前景的能力，但我们的实验表明，在推理速度方面的性能提升不如文献中经常报道的那样显著。{_p64a0q}
		> 这突显了未来研究需要超越提高预测准确性，优先考虑算法和架构策略，在不损害稳定性的情况下有效减少推理延迟。
* SCENT-2504.12262 （备用）无网格 NO 架构，交叉注意力将 散点、固定个数的 latent vector 相互转化
	* "SCENT: Robust Spatiotemporal Learning for Continuous Scientific Data via Scalable Conditioned Neural Fields"
		* Park, David Keetae; Luo, Xihaier; Zhao, Guang; Lee, Seungjun; Oprescu, Miruna; Yoo, Shinjae; 
		> created on 2025-05-20
	* fig2 架构示意图
		* （评）编码解码部分感觉和 LSM C latent tokens/Transolver 物理注意力相似？不过本文预印本版本似乎没看到有引用，不排除是我没细看其中的区别
		* 无网格编码器，输入散点（应该是），输出 M 个隐向量
			* 输入散点编码：线性投影，concat t,x 的 Fourier 特征编码
			* 再过 context embedding network，涉及稀疏注意力层（> 细节未看）
			* 以上结果作为 K,V；M 个可学隐向量作为 Q，交叉注意力得 M 个隐向量
		* temporal warp（> 不一定是在做隐空间时空推进？）对 M 隐向量做自注意力
		* 无网格解码器，时空作为 Q，M 隐向量作为 K,V 解码得单点取值
* 2504.03503 （备用）算子学习的统计角度解读；{_p5ge5d}
	* "Operator Learning: A Statistical Perspective"
		* Subedi, Unique; Tewari, Ambuj; 
		> created on 2025-05-16
	* 摘要摘录
		> 在本文中，我们首先将算子学习形式化为函数对函数回归问题，并回顾了该领域的一些最新进展。
		> 我们还讨论了PDE特定的算子学习，概述了将物理和数学约束纳入架构设计和训练过程的策略。
		> 最后，我们强调了未来的关键方向，如主动数据收集和制定严格的不确定性量化框架。
	* 目录
		"INTRODUCTION" 1
		"A STATISTICAL FRAMEWORK FOR OPERATOR LEARNING" 3
			"Loss Functions" 4
			"Distribution Families" 5
		"OPERATOR CLASSES" 5
			"Linear Operators" 5
			"Neural Operators" 6
				"Fourier Neural Operators (FNO)" 7
				"DeepOnet" 8
			" RKHS and Random Features " 8
		"DATA GENERATION, ESTIMATION, AND EVALUATION" 10
			"Data Generation and Sampling" 10
			"Estimation" 11
			"Evaluation & Out-of-Distribution Generalization" 11
		"ERROR ANALYSIS AND CONVERGENCE RATES" 12
			"Approximation Error" 12
			"Truncation Error" 12
			"Discretization Error" 13
			"Statistical Error" 13
			"Towards a General Statistical Theory of Operator Learning" 14
		"PDE-SPECIFIC OPERATOR LEARNING" 15
		"FUTURE DIRECTIONS" 16
			"Active Data Collection" 16
			"Uncertainty Quantification" 17
			"Local Averaging and Ensemble Methods" 18
			"Frictionless Reproducibility" 19
			"Scaling Sample and Model Size" 19
		"CONCLUSION" 20
* TripNet-2503.17400 汽车气动预测 NO 使用三平面 INR
	* "TripNet: Learning Large-scale High-fidelity 3D Car Aerodynamics with Triplane Networks"
		* Chen, Qian; Elrefaie, Mohamed; Dai, Angela; Ahmed, Faez; 
		> created on 2025-05-03
	* fig1 架构，基于 三平面 INR
		* fig1a 汽车外形（occupancy field）为输入，编码器为三平面 INR 拟合的隐式编码；{_p53b5a}
		* fig1b 可用于不同预测任务，阻力系数（标量）、压强、切应力 wall shear stress（表面定义的场）、完整流速场（全空间定义的场）
		* fig1c 中间处理网络，三平面按通道拼接，输入输出均如此；{_p53b4v}
			* 用 U-Net 处理；{_p53b54}
* FlowBench-2409.18032 流体数据集，涉及多物理，区域随机挖洞形状包括球谐、NURBS、动物形状等
	* "FlowBench: A Large Scale Benchmark for Flow Simulation over Complex Geometries"
		* Tali, Ronak; Rabeh, Ali; Yang, Cheng-Hau; Shadkhah, Mehdi; Karki, Samundra; Upadhyaya, Abhisek; Dhakshinamoorthy, Suriya; Saadati, Marjan; Sarkar, Soumik; Krishnamurthy, Adarsh; Hegde, Chinmay; Balu, Aditya; Ganapathysubramanian, Baskar; 
		> created on 2025-04-29
	* fig1 区域随机挖洞形状包括球谐、NURBS、动物形状等；{_p4tb4h}
	* tbl1 类似的数据集汇总，本数据集包括 2D,3D 样本，10650 simulations，多物理、可变几何
		* 多物理，文中似乎提到传热；未确认是否还有其他机理类型；{_p4tb4x}
* Aero-Nef-2407.19916 物理场编码通过 modulated INR 解优化问题，作者来自空客
	* "Aero-Nef: Neural Fields for Rapid Aircraft Aerodynamics Simulations", 主要作者来自 Airbus
		* Catalani, Giovanni; Agarwal, Siddhant; Bertrand, Xavier; Tost, Frederic; Bauerheim, Michael; Morlier, Joseph; 
		> created on 2025-04-12
	* fig2 整体架构，输入机翼 SDF 输出 p，均用 modulated INR，前者对应的隐向量过 MLP 得后者隐向量
	* fig3 编码过程基于梯度下降；{_p4ce0v}
* 2503.13248 FVM 精确通量计算量大，改 NN 预测，包括双保真方案
	* "Neural network-based Godunov corrections for approximate Riemann solvers using bi-fidelity learning"
		* Thakur, Akshay; Zahr, Matthew J.; 
		> created on 2025-04-09
	* 摘要摘录
		> 摘要黎曼问题是双曲型偏微分方程计算建模中的基础问题，使稳定和精确的迎风格式得以发展。
		> 虽然精确求解器提供了强大的迎风通量，但它们的高计算成本需要近似求解器。
		> 尽管近似求解器在许多情况下都能达到精度，但在某些情况下会产生不准确的解。
		> 提出构建基于神经网络的代理模型，使用监督学习进行训练，旨在将内部和外部保守状态变量映射到相应的精确通量。{_p49f1g}
		> 两种不同的方法：一种利用vanilla神经网络，另一种采用双保真神经网络。
* GridMix INR 基底线性组合给出标量 modulation、系数依赖 z，相比 grid-based 做法可避免局部过拟合
	* "GridMix: Exploring Spatial Modulation for Neural Fields in PDE Modeling", ICLR 2025 oral
		* Honghui Wang, Shiji Song, Gao Huang
		* [OpenReview](https://openreview.net/forum?id=Fur0DtynPX)
		> 2025-03-20 Pf 大群 lhu 推荐
	* [公众号报道](https://mp.weixin.qq.com/s/daYZe24LzC5tRM2MgYLjDQ)
	* 前序工作为 CORAL（在隐空间表达映射，解码器为 INR，编码通过优化隐向量完成）
	* CORAL 调制架构为 modulated Siren；缺点：全局调控无法捕捉局部细节
		> 需要注意的是，这种全局调控参数图片在不同空间坐标之间是共享的。
		> 这一特性限制了神经调控场表示复杂函数空间的能力。
		> 正如先前的研究所展示的，全局调控无法捕捉局部细节，因为调控参数的任何变化都会导致重构函数的全局扰动。
	* （评）本文各层调制似乎为标量，即同层不同神经元的 shift modulation 相同
	* 空间调控：modulation 生成方式类似 grid-based INR，在网格点上给出，双线性插值到任意点
	* 空间调控缺点：空间信息不完整情形，局部过拟合
		> 空间调控引入的位置相关的调控参数虽擅长捕捉局部信息，却难以在稀疏 / 不规则的空间域中建模全局结构，导致未知区域重建质量骤降（如图 3 所示），从而严重制约跨空间域的泛化能力
		* （评）PDEformer 不会遇到此问题，因为假定了空间信息完整，学完整时空解
	* 空间调控约束版，表示为网格表征的线性组合，x 点前传的第 l 层调制向量 $h_l^\mathrm{T}(z)\Phi_l(x)$；{_p44e9a}
		* 超网络 $h_l$ 为单个线性层，$\Phi_l$ 我理解是 MLP；二者均可学，对所有样本共享
		* （评）空间调控可从该形式退化得到：$\Phi_l$ 取为双线性插值基底（输出维数等于格点数 $H\times W$），取 $h_l(z)=z_l\in\R^{H\times W}$，总的 $z$ 维数较高
* 2503.03178 DeepONet UQ 版本，额外网络输出逐点方差；用于主动学习；推理加速策略
	* "Active operator learning with predictive uncertainty quantification for partial differential equations"
		* Winovich, Nick; Daneker, Mitchell; Lu, Lu; Lin, Guang; 
		> created on 2025-03-31
	* 摘要摘录
		* DeepONet UQ 方法，针对模型预测误差
			> DeepONets 中进行不确定性量化的方法，该方法使用预测不确定性估计来校准训练过程中观察到的模型误差。
		* 单网络运行，以减小开销
			> 与现有的集成方法相比，不确定性框架使用单个网络运行，并在训练和推理过程中引入最小的开销。
			> 我们还介绍了DeepONet推理的优化实现（将评估时间减少五倍），以提供非常适合实时应用程序的模型。
		> （实验）模型预测是无偏的、非偏斜的（non-skewed），并且准确地再现了PDE的解。
		* 实验验证不确定性大小 与样本复杂度 相关
			> 我们发现，预测不确定性准确地反映了在一系列复杂度不同的问题上观察到的模型误差；较简单的分布外示例被分配了与观测误差一致的低不确定性估计，而较复杂的分布外实例被适当地分配了较高的不确定性。
			> 我们还对预测不确定性进行了统计分析，并验证了这些估计值与训练结束时观察到的误差分布非常一致。
		* 用于主动学习生成数据
			> 最后，我们演示了如何在主动学习框架内使用预测不确定性来提高外环优化过程的准确性和数据效率。
	* fig1a 网络预测 $\mu,\log\sigma$；branch net 深层分出 μ,σ 二分支，trunk net 同理；{_p3ve83}
		> （a）配备不确定性的 NO 架构将预测分为均值和方差估计。
		> 我们将网络输出解释为预测概率分布的参数，这些参数在训练过程中根据观察到的误差分布进行校准。
	* eqn(1) loss 用 log-likelihood；{_p3ve8p}
	* fig1b 主动学习，利用不确定性预测值做 data acquisition；{_p3ve91}
		> （b） 算子网络提供的不确定性估计用于帮助指导函数空间中的外环主动学习过程。
		> 兴趣量（QoI）和方差估计来自 NO 预测，这些信息用于通过平衡开采和勘探来指导数据采集。
	* fig3 DeepONet 推理加速，在固定网格上预先计算 trunk net 输出；另有 branch 批量计算操作等
* VINO-2411.06587 DRM loss 用于 PINO，数值微分用 FEM 而非 FD
	* "Variational Physics-informed Neural Operator (VINO) for Solving Partial Differential Equations"
		* Eshaghi, Mohammad Sadegh; Anitescu, Cosmin; Thombre, Manish; Wang, Yizheng; Zhuang, Xiaoying; Rabczuk, Timon; 
		> 2025-03-26 组会lzn介绍
	* FNO（PINO）用 DRM loss，只涉及一阶导数 $\nabla u$；{_p3sa2k}
	* 数值微分计算 FD 换为 FEM：FNO 输出散点值转为基底函数系数，进而可用刚度矩阵给出 $|\nabla u|^2$ eqn(13)；{_p3sa1u}
		* 空间 $[0,1]^2$ 分辨率 $64\times 64$
* S3GM 孙浩 NMI，据稀疏观测重建完整物理场，离线训扩散生成模型，在线用观测 loss 引导生成重建场
	* "Learning spatiotemporal dynamics with a pretrained generative model", NMI 2024
		* Zeyu Li, Wang Han, Yue Zhang, Qingfei Fu, Jingxuan Li, Lizi Qin, Ruoyu Dong, Hao Sun, Yue Deng & Lijun Yang
		* [Nature](https://www.nature.com/articles/s42256-024-00938-z)
		> 2025-04-19 补充记录
	* fig1b 使用场景，观测信息有限：位置在随机散点，某变量无观测，仅有时间平均观测值
	* fig1c 用完整时空数据训扩散生成模型
	* p10:l2 架构 Video U-Net 以刻画各时间步相互依赖关系
	* fig1d 在线重建，类似 classifier guidance，观测后验两项：符合观测、时序一致；{_p4jk01}
		* 符合观测：观测 y，观测算子 H，物理场 X，惩罚 $\|y-H(x)\|$（实际是用其梯度引导生成）
		* 时序一致未确认细节
	* Re 泛化实验：p6:l-2 NS 小 Re 训（100 – 1050）、重建大 Re（1500）
	* 仿真向实测泛化实验：fig5 圆柱扰流，仿真数据训，用实验室物理传感器实测数据重建
* （备用）知乎综述：Diffusion Models in Operator Learning: 用扩散模型生成时空物理场
	* [2025-03-21](https://zhuanlan.zhihu.com/p/30475667943)
	> 1. Solving Inverse Physics Problems with Score Matching (2023 NeurIPS)
	> 2. DYffusion: A Dynamics-informed Diffusion Model for Spatiotemporal Forecasting (2023 NeurIPS)
	> 3. PDE-Refiner: Achieving Accurate Long Rollouts with Neural PDE Solvers (2023 NeurIPS)
	> 4. DiffusionPDE: Generative PDE-Solving under Partial Observation (2024 NeurIPS)
	> 5. On conditional diffusion models for PDE simulations (2024 NeurIPS)
	> 6. Learning spatiotemporal dynamics with a pretrained generative model (2024 NML)
		* 即 S3GM
	> 7. Conditional neural field latent diffusion model for generating spatiotemporal turbulence (2024 NC)
	> 8. Wavelet Diffusion Neural Operator （2025 ICLR）
	> 9. Physics-Informed Diffusion Models (2025 ICLR)；{_q4hi1f}
	> 10. Text2PDE: Latent Diffusion Models for Accessible Physics Simulation (2025 ICLR)
	> 11. Generating Physical Dynamics under Priors (2025 ICLR)
	> 12. Improved Sampling Of Diffusion Models In Fluid Dynamics With Tweedie's Formula (2025 ICLR)
		* alg2 IR（iterative refinement）采样方式，每步不是小幅度去噪，而是 从 tₙ 完全去噪得干净图像、重新加噪到 tₙ₋₁，类似地到 tₙ₋₂，循环直到完全去噪；{_q4ib3e}
			* 原文 eqn(6) 各轮预测的干净图像 x₀⁽ⁿ⁾ 和最终采样所得的 x₀ 的差异（l2 距离期望）单调减小
			* 各步重加噪 的噪声选取：每步都独立重新采样 alg2
* 2503.02023 FNO 优先拟合低频，靠 boosting FNO 拟合高频残差 解决
	* "Reducing Frequency Bias of Fourier Neural Operators in 3D Seismic Wavefield Simulations Through Multi-Stage Training"
		* Kong, Qingkai; Zou, Caifeng; Choi, Youngsoo; Matzel, Eric M.; Azizzadenesheli, Kamyar; Ross, Zachary E.; Rodgers, Arthur J.; Clayton, Robert W.; 
		> created on 2025-03-19
	* 摘要摘录
		> 为了减少频率偏差，我们采用了多阶段FNO训练，即在训练了用于估计地震动的第一阶段FNO模型后，我们使用第二阶段FNO模式作为第二阶段从残差中学习，这大大减少了高频上的误差。{_p3ja6v}
* FNO-DSE-2305.19663 FNO 推广到可变散点，只需考虑散点上的 DFT 即可
	* "Beyond Regular Grids: Fourier-Based Neural Operators on Arbitrary Domains", ICML 2024
		* Lingsch, Levi; Michelis, Mike Y.; de Bezenac, Emmanuel; Perera, Sirani M.; Katzschmann, Robert K.; Mishra, Siddhartha; 
		> created on 2025-03-13，作为 RIGNO 实验 baseline；内容为 2025-08-17 记录
	* 非均匀网格上用 NUDFT，原 FT 积分在散点上离散，fig2 eqn(4)；{_p8hg3v}
		* 可预先计算 NUDFT 变换矩阵 eqn(5)
	* FFT vs DFT，前者仅在算完整 modes 时高效；modes 数在数十量级时 DFT 性能类似或更优 p4:r-1、p5:l1；{_p8hg3q}
		> 正如Barnett等人（2019）所观察到的那样，当模式数量在 $10^1$ 个或更少的数量级时，直接评估具有竞争力或更有效。
		> SM表4给出了二维等间距网格、二维点云和球形几何形状的计算时间随模态数量变化的结果。
		> 在FNO所需的12至32个模式的典型范围内，直接评估傅里叶变换显然更有效（Li等人，2020a），即使高达64个模式，它仍然更有效。
* 2502.19994 （备用）学出 PDE 系统的 Hamiltonian 泛函，用 DeepONet，其 BP 可得泛函导数；实验用波方程
	* "Learning Hamiltonian Density Using DeepONet"
		* Xu, Baige; Tanaka, Yusuke; Matsubara, Takashi; Yaguchi, Takaharu; 
		> created on 2025-03-12
	* 摘要摘录
		> 在学习哈密顿力学方面，基于深度神经网络（如哈密顿神经网络（HNN）及其变体）的方法取得了进展。
		> 然而，现有的方法通常依赖于数据的离散化，并且通常需要确定所需的微分算子。
		> 相反，在这项工作中，我们提出了一种用于建模波动方程的算子学习方法。{_p3ce9t}
		> 特别是，我们提出了一种使用自动微分算法计算公式化方程所需的变分导数的方法。
* Spectral-Refiner-2405.17211 FNO 二阶段训练，先有监督训几个 epoch，微调用 PDE residual H-1 norm 且只训谱卷积层
	* "Spectral-Refiner: Accurate Fine-Tuning of Spatiotemporal Fourier Neural Operator for Turbulent Flows"
		* Cao, Shuhao; Brarda, Francesco; Li, Ruipeng; Xi, Yuanzhe; 
		> created on 2025-03-03, Perplexity Deep Research 搜索结果引用
	* 摘要摘录
		> Navier-Stokes方程（NSE）建模的湍流学习问题，
		> 仅在几个时期内训练FNO。{_p34c08}
		> 然后，只对新提出的时空谱卷积层进行微调，而不进行频率截断。{_p34e4z}
		> 谱微调损失函数在算子学习中首次使用负Sobolev范数，
			> 该范数通过可靠的函数型后验误差估计器定义，
			* （评）即 PDE residual loss
		> 此外，与端到端训练中困难的非凸优化问题不同，这种微调损失是凸的。
	* fig1 ST-FNO，单次 eval 获得任意长度的时间预测（> dt 作为网络输入了？）
	* （评）fig1,2,3 未细看
	* sec3.2 微调 loss 用 $H^{-1}$，通过 FFT 在频域计算：降低高频分量权重；{_p33j3y}
		* （评）这一阶段似乎是用 PDE residual loss 来训练？sec3.1 还只是用残差的 H-1 norm 做后验误差估计
		* 认为强调低频误差的 loss 对 NS 方程更合适
		* FNO 训练的低频误差占主导
			> 与FNO变体具有频率截断导致误差在高频部分占主导地位的直觉相反，Lippe等人（2023）发现，NSE的算子学习误差在频谱的低端仍然占主导地位。
			> 我们的研究也证实了这一点，见图8和图6。
		> 关于为什么泛函范数在传统数值方法中不受广泛欢迎的更详细和数学上丰富的讨论，我们请读者参阅附录B
	* secD.1:-1 预训练仍用 L2：优化非凸、NO 非线性，所有范数表现一样差
		* 训练 AdamW lr 最高 1e-3，secD.3 微调 Adam lr=0.1 迭代 100 次（因只微调很少参数）
	* p20:1 关于 functional-type 后验误差估计（PDE residual loss）{_p34b4n}
		* 误差分 mesh 逼近误差 + NN 预测误差
			* 给定网格下 Galerkin 解 $u_s$，有 $\|u-u_n\|^2_a=\|u-u_s\|^2_a+\|u_s-u_n\|^2_a$
		* 优化 NN 预测误差未必有用：可能 mesh 逼近误差占主导
			* 直接优化 $\|u-u_n\|^2_a$ 更合适，但需解决 u 无法直接获得的问题
		* 自适应网格细化方式：传统离散化的后验误差估计
			* 需用局部 L2 残差近似 $H^{-s}$ 误差
			> 对于这种H-1到L2的表示，有各种折衷方案会使估计不准确，例如离散庞加莱常数（Veeser&Verfürth，2012）或逆不等式（Carstensen&Funken，1999；Veeser&Verorth，2009），另见Verfürt（2013，§1.6.2）。
	* p21:1 算子学习中的 Sobolev norm
		* PINN 用 L2 spectral loss（残差视为 L2 上泛函，并用 Parseval 等式）好于 空间加权，见 Du2024
			* loss $\sup_v\langle R,v\rangle/\|v\|_2$；{_p34a8b}
		* 本文认为这并非衡量 PDE 残差的 natural space：例如 $-\Delta u=f$ 满足 $\|u\|_1\le c\|f\|_{-1}$
			* $-\Delta:H^1\to H^{-1}$ 有界，而作为 $L^2\to L^2$ 无界；{_p34a8n}
		* 本文使用 loss $\sup_v\langle R,v\rangle/\|v\|_{H^1}$
			* 传统 FEM,FVM 给出的误差估计（基于残差）不准：H-1 norm 无法局部化
	* p19:-1 传统谱方法需要 3/2-dealiasing
		> 去混叠滤波器为保持稳定性牺牲了一致性。
		> 一致性-稳定性权衡的一个著名例子是伪谱方法（Orszag，1971a；1972）的非线性对流项的3/2规则（也称为2/3去模糊-去模糊滤波器）（Orszang，1971b；Patterson&Orszag；1971；Hou，2009；Gottlieb&Orszag1977）。
		> 最高的1/3模式被过滤掉，这有助于提高近似能力，以确保长期稳定性。
		> 为了使传统的数值方案稳定，必须做出CFL条件和3/2规则等妥协，保持稳定性和准确性之间的平衡。
		> 这些约束适用于传统的数值方法，因为任何求解器都必须进行连续的多个时间步长，这使得误差传播算子的范数是许多时间步长的乘积。{_p34e4g}
		> 数值结果表明，对于在时间上没有高阶傅里叶平滑的伪谱空间离散化，去混叠滤波器是必不可少的（Tadmor，1987），因为没有它，时间推进可能会经历数值不稳定（Kreiss&Oliger，1979；Goodman等人，1994）。
		> 这是由于对流项中的非线性相互作用造成的，当基础解缺乏足够的平滑度时，高频“混叠”误差会放大。
		> 在这项研究中，我们采用的混合方法结合了NO和传统数值求解器的优势。
		> 没有时间连续行进多个时间步长，这使得该方法不受CFL条件和3/2规则等稳定性约束。
* perplexity deep research，关于 PDE 预测解评价 metric，我的整理
	* 2025-02-27；原材料见 `src/pde-alternative-metric-by-perplexity-ai.md`
	* sobolev norm
		* 场景 eg. 应力梯度决定材料失效，弹性力学中 permeability tensor 本来就涉及导数；{_p2sb7t}
		* 方向感知的 $\|e\|=\sqrt{\int(\nabla e)^\mathrm{T}\kappa\nabla e}$，如用于 subsurface flow，场景涉及各向异性；{_p2sb7v}
	* energy score（没看懂），L2 误差小时它能发现 underconfident forecast；不过计算量高；{_p2se43}
	* Wasserstein OT 距离
		* 注：原文还施加了针对动力学的 Koopman 约束
		* 计算策略，本可用 Sinkhorn divergence 近似（$O(n^2)$ 复杂度）；引文用了针对 NO 的 surrogate，利用对抗的 1-Lipschitz 网络；{_p2se38}
	* NO 用作迭代求解器（椭圆方程等），算更新量 $\|\Delta u_+\|/\|\Delta u\|$ 判断是否收敛
	* 空间加权，针对关键区域，如涡轮叶片，L 型区域 reentrant；{_p2se4v}
	* 另：轨迹数据中学出 Lyapunov 函数（$\dot V\le -aV$）用于辅助黑盒 NO 训练；{_p2se54}
* MPFBench-2502.07080 多相流数据集，水滴、气泡动力学，包括 2D、3D
	* "MPFBench: A Large Scale Dataset for SciML of Multi-Phase-Flows: Droplet and Bubble Dynamics", ICLR 2025
		* Shadkhah, Mehdi; Tali, Ronak; Rabeh, Ali; Herron, Ethan; Yang, Cheng-Hau; Upadhyaya, Abhisek; Krishnamurthy, Adarsh; Hegde, Chinmay; Balu, Aditya; Ganapathysubramanian, Baskar; 
		> created on 2025-02-27
	* 摘要摘录
		> 多相流体动力学，如下落的液滴和上升的气泡，对许多工业应用至关重要。
		> 然而，由于不稳定性、波动模式和气泡破裂的复杂性，有效模拟这些现象具有挑战性。
		> 本文研究了科学机器学习（SciML）使用神经算子和基础模型对这些动态进行建模的潜力。
		> 我们在11000个模拟生成的综合数据集上应用了序列对序列技术，其中包括100万个时间快照，
		> 这些数据集是用经过充分验证的Lattice Boltzmann方法（LBM）框架生成的。
		> 结果表明，机器学习模型能够捕捉瞬态动力学和复杂的流体相互作用，为多相应用中更准确、计算效率更高的基于SciML的求解器铺平了道路。
	* [项目主页](https://baskargroup.github.io/mpf-bench)
		* [数据集](https://huggingface.co/datasets/BGLab/mpf-bench)
	* tbl1 related work，现有多相流数据集；{_p2re9v}
		* Flow experiment dataset, 2.9k 样本：horizontal pipes, effects of density, surface tension
		* BubbleML, 79 样本 7641 snapshots：pool boiling, flow boiling, sub-cooled boiling；Flash-X 数值生成，2D,3D
	* tbl3 数据集情况，水滴、气泡均有 2D,3D 数据集
		* 数据 tensor 格式，2D [n_samp=5k, n_t=101, n_v=5, n_y, n_x]
		* 分量顺序 cuvpρ；注意自变量顺序与常见相反
	* 实验比较的 NO：U-Net，DeepONet，FNO，CNO，scOT，Poseidon
		* 从结果来看 CNO 达到最高精度的 cases 最多
		* sec3.4 只做单步时间推进；预测单帧的输入帧数 1,3,5，预测 3 帧的输入帧数 3,5,8
* 2502.04562 （备用）PDE 不规则区域延拓至方形周期域，NO 架构引入区域分解、自适应处理延拓部分
	* "Mixture of neural operator experts for learning boundary conditions and model selection"
		* Deighan, Dwyer; Actor, Jonas A.; Patel, Ravi G.; 
		> created on 2025-02-26
	* 摘要摘录
		> 虽然基于傅里叶的神经算子最适合学习周期域上函数之间的映射，但几项工作引入了引入非平凡边界条件的技术。
		> 然而，之前介绍的所有方法都有限制，限制了它们的适用性。
		> 在这项工作中，我们介绍了一种受数值方法中的体积惩罚和机器学习中的专家混合（MoE）启发的施加边界条件的替代方法。
		> 通过引入竞争专家，该方法还允许进行模型选择。
		> 为了演示该方法，我们将空间条件下的MoE与基于傅里叶的物理模态算子回归（MOR-Physics）神经算子相结合，并在圆盘和四分之一圆盘上恢复非线性算子。
		> 接下来，我们从河道水流的直接数值模拟中提取了一个大涡模拟（LES）模型，并展示了我们的方法提供的区域分解。
		> 最后，我们用贝叶斯变分推理训练我们的LES模型，并获得远远超过DNS模拟时间范围的流量的后验预测样本。
	* sec2.1 不规则区域解延拓至周期域；{_p2qf1y}
	* 区域分解 MoE 架构，基于 POU（单位分解）；{_p2qf2m}
		* fig7 从学出的结果来看分解结果与原区域位置有关，原区域与延拓区域由不同专家处理（事实上延拓部分还依据几何特性有进一步分解）
	* 涉及的缩写：MOR=modal operator regression
* 2502.09346 综述：ML 处理不规则网格数据
	* "Machine learning for modelling unstructured grid data in computational physics: a review"
		* Cheng, Sibo; Bocquet, Marc; Ding, Weiping; Finn, Tobias Sebastian; Fu, Rui; Fu, Jinlong; Guo, Yike; Johnson, Eleda; Li, Siyi; Liu, Che; Moro, Eric Newton; Pan, Jie; Piggott, Matthew; Quilodran, Cesar; Sharma, Prakhar; Wang, Kun; Xiao, Dunhui; Xue, Xiao; Zeng, Yong; Zhang, Mingrui; Zhou, Hao; Zhu, Kewei; Arcucci, Rossella; 
		> created on 2025-02-24
	* 目录
		"Introduction" 3
		"Preliminary" 5
			"Unstructured meshes in computational physics " 5
			"Reduced order modelling for structured and unstructured data" 7
			"Shallow machine learning for dynamical systems " 11
			"Convolutional and recurrent neural networks" 13
			"Gridding irregular data via interpolation " 15
		"Machine learning models designed for unstructured grid data" 18
			"Machine learning with preprocessing" 18
				"Neural network with interpolation methods" 18；{_p2oe9l}
				"Machine learning with mesh reordering and transformation" 20
			"Graph neural networks" 22；{_p2oe9z}
			"Transformer and attention mechanism" 25；{_p2of01}
				"Transformers: attention-mechanism" 25
				"Applications in computational physics" 27
			"Summary and comparison " 28
		"Learning paradigms with unstructured data" 29
			"PINNs: a meshless solution" 29
			"Reinforcement learning for unstructured mesh generation" 33；{_p2of0c}
				"Introduction to reinforcement learning" 33
				"Reinforcement learning for mesh optimisation" 35
			"Generative AI models with unstructured grid data " 36
				"Introduction to generative models" 36
				"Generative models applied on unstructured data" 38
		"Public study cases and benchmarks " 40；{_p2of0x}
		"Discussion and conclusion" 42
		"Bibliography" 47
* DGNO-2502.06250 （备用）生成模型解 PDE 正反问题，似乎可同时做 UQ
	* "DGNO: A Novel Physics-aware Neural Operator for Solving Forward and Inverse PDE Problems based on Deep, Generative Probabilistic Modeling"
		* Zang, Yaohua; Koutsourelakis, Phaedon-Stelios; 
		> created on 2025-02-20
	* 摘要摘录
		> 现有的神经算子方法难以处理高维、不连续的输入，并需要大量标记的训练数据。
		> 深度生成神经算子（DGNO），这是一个物理感知框架，通过利用深度、生成性、概率模型以及一组同时编码PDE输入和PDE输出的低维潜在变量来解决这些挑战。
		> 这种公式可以利用未标记的数据，并显著改善逆问题求解，特别是对于不连续或离散值的输入函数。
		> DGNO通过将基于紧支撑径向基函数（CSRBF）的弱形式残差作为虚拟可观测值来强制执行物理约束，而无需标记数据。
		> 这些方法放宽了正则性约束，并消除了目标函数的高阶导数。
		> 我们还介绍了MultiONet，这是一种新的神经算子架构，它是流行的DeepONet的更具表现力的推广，显著提高了所提出模型的近似能力。
		> 这些创新使DGNO在挑战基于PDE的正向和反向问题时特别有效，例如涉及多相介质的问题。
		> 它的适应性，以及在提供概率估计的同时处理稀疏、嘈杂数据的能力，使DGNO成为科学和工程应用的强大工具。
		> 关键词：基于偏微分方程的正演和逆问题、深度神经算子、逆问题、加权残差、生成模型
	* fig2 构建的概率图，假定有隐向量 $\beta$，它调控生成 $a,u$（表示为 $\beta\to(a,u)$）{_p2ke6f}
		* BC $u\to g$，残差 $(a,u)\to R$
		* eqn(6) 假定 $p(a|\beta)=N(\mu(\beta;\theta_a),\lambda^{-1}I)$，其中 $\mu$ 为 NN
* RIGNO-2501.19205 （Poseidon 组）无网格 NO，基于多尺度 graph msg passing
	* "RIGNO: A Graph-based framework for robust and accurate operator learning for PDEs on arbitrary domains"
		* Mousavi, Sepehr; Wen, Shizheng; Lingsch, Levi; Herde, Maximilian; Raonić, Bogdan; Mishra, Siddhartha; 
		> created on 2025-02-16
	* fig1 架构示意图，涉及 multi-scale edges；{_p2gf0g}
		> 输入首先通过前馈块独立地投影到潜在空间。
		> 然后，将原始离散化（物理节点）的信息局部聚合为更粗的离散化（区域节点）。
		> 区域节点通过具有多个长度尺度的边相互连接。
		> 然后，在构成处理器的区域节点上应用几个消息传递步骤。
		> 然后，通过使用与编码器中类似的边缘，将处理后的特征传输回原始离散化，然后通过前馈块独立投影回所需的输出维度，而不需要归一化层。
* NINO-2405.14096
	* "Newton Informed Neural Operator for Computing Multiple Solutions of Nonlinear Partials Differential Equations", NeurIPS 2024
		* Hao, Wenrui; Liu, Xinliang; Yang, Yahong; 
		> created on 2025-02-14
	* 摘要摘录
		> 求解具有多个解的非线性偏微分方程（PDE）
		> 传统的数值方法，如有限元和有限差分方法，在处理非线性求解器时经常面临挑战，特别是在存在多个解时。
		> 这些方法可能会在计算上变得昂贵，特别是在依赖牛顿法等求解器时，牛顿法可能会在分叉点附近遇到病态问题。
		> 本文提出了一种新的方法，即牛顿知情神经算子，它学习非线性偏微分方程的牛顿求解器。
		> 我们的方法将传统的数值技术与牛顿非线性求解器相结合，在每次迭代中有效地学习非线性映射。{_p2ee8o}
		> 这种方法允许我们在一个学习过程中计算多个解，同时比现有的神经网络方法需要更少的监督数据点。
* NeurKItt （备用）NO 生成 Krylov 子空间，包括理论分析
	* "Neural Krylov Iteration for Accelerating Linear System Solving", NIPS 2024 spotlight
		* Jian Luo, Jie Wang, Hong Wang, huanshuo dong, Zijie Geng, Hanzhu Chen, Yufei Kuang
		> 2025-02-18 from NPO 作者李志豪
	* 摘要摘录
		> 神经Krylov迭代（NeurKItt），用于加速线性系统的求解。
		> NeurKItt采用神经算子来预测线性系统的不变子空间，然后利用预测的子空间来加速线性系统的求解。
		> 为了提高子空间预测的准确性，我们利用QR分解作为神经算子输出，并引入了一种新的投影损失函数进行训练。{_p2ie4r}
		> NeurKItt通过使用预测子空间来指导迭代过程，大大减少了迭代次数，从而有利于求解。
	* sec5 相关理论分析
* NPO-2502.01337 （备用）生成 Krylov 子空间预条件子 以加速传统方法，网络架构基于 Transformer
	* "Neural Preconditioning Operator for Efficient PDE Solves"
		* Li, Zhihao; Xiao, Di; Lai, Zhilu; Wang, Wei; 
		> created on 2025-02-14
	* 摘要摘录
		> 神经预处理算子（NPO），
		> 旨在加速Krylov求解器求解从偏微分方程（PDE）导出的大型稀疏线性系统。
		> NPO采用了通过条件和残差损失训练的神经算子。
		> 此外，通过将代数多重网格原理与基于变换器的架构相结合，NPO显著减少了求解均匀和不规则网格上的泊松、扩散和线性弹性问题的迭代次数和运行时间。
	* fig1a loss 包括 data loss (u), residual loss (r), condition loss (M)
	* fig2 neural algebraic multigrid operator 架构，似乎基于 Transformer；{_p2ee56}
	* 2025-02-17 晚上一作在 WeMeet 上介绍，根据回忆记录（不保证准确）
		* 延续了之前工作用 Graphormer 的思路，代数多重网格 降阶操作 类比成 图中提取 super-node 操作
		* 实验的架构 ablation，用 FNO、U-Net、Transolver、（自己之前的）M2NO 用相同 loss 来训练，最终本文架构解方程速度最快
		* 分辨率泛化实验，在 128 分辨率上训，高分辨率上测试，最多好像到 4096
* Wang2022ImprovedAT （备用）NTK 分析 PI-DeepONet，发现网络先学大幅度样本，建议样本重加权；新架构（非基于 NTK）
	* "Improved Architectures and Training Algorithms for Deep Operator Networks", Journal of Scientific Computing 2022
		* Sifan Wang1 · Hanwen Wang1 · Paris Perdikaris
		> 2025-02-11
	* 摘要摘录
		> 我们通过神经切线核理论的视角分析了深度算子网络（DeepONets）的训练动态，并揭示了一种倾向于近似较大幅度函数的偏差。
		> 为了纠正这种偏差，我们建议自适应地重新加权每个训练示例的重要性，并演示该过程如何通过梯度下降在训练过程中有效地平衡反向传播梯度的大小。
		> 我们还提出了一种新的网络架构，该架构对消失的梯度病理更具弹性。
	* fig5 改进的 DeepONet 架构，branch/trunk net 的输入额外分别过 encoder，结果作为 branch/trunk net 中间层的 scale modulation；{_p2bf9d}
	* 注：文中的 Stokes 方程数据集已下载，考虑用于 PDEformer 实验
* TL-DeepONet-2204.09810 DeepONet 迁移学习 by George，微调时结合半监督学习 loss 项、惩罚条件分布距离
	* "Deep transfer operator learning for partial differential equations under conditional shift", Nature Machine Intelligence 2022
		* Goswami, Somdatta; Kontolati, Katiana; Shields, Michael D.; Karniadakis, George Em; 
		> created on 2025-02-11
	* 摘要摘录
		> 我们提出了一种基于深度算子网络（DeepONet）的条件移位下任务特定学习（偏微分方程中的函数回归（PDE））的新TL框架。
		* 混合损失函数，只微调网络特定层
			> 特定任务的算子学习是通过使用混合损失函数微调目标DeepONet的特定任务层来实现的，
			> 该函数允许匹配单个目标样本，同时保留目标数据条件分布的全局属性。
		* 半监督学习，未标记数据预测结果的条件分布对齐已标记数据，分布距离用 RKHS 度量
			> 受条件嵌入算子理论的启发，我们通过将条件分布嵌入到再现核Hilbert空间上，最小化标记目标数据与未标记目标数据上的替代预测之间的统计距离。
	* fig1 网络架构，branch net 为 CNN（最后几层为 MLP）
		* 微调阶段只微调 trunk net 末层、CNN 尾部全连接部分
	* eqn(10) 先前论文提出的 Conditional Embedding Operator Discrepancy (CEOD) 度量二条件分布距离；{_p2be6s}
		* $\|C_{Y_p|X_p}-C_{Y_q|X_q}\|_{HS}^2$
		* （评）“条件”分布应该是因为这里希望限制的是解算子的距离，而非物理场的距离
	* eqn(12) fig1 微调用的 loss 为 有监督 loss + CEOD loss
		* CEOD loss 用于半监督学习，已标记样本 $\{(x,y)\}$ 与未标记样本 $\{(x,f(x))\}$，惩罚二条件分布的距离；{_p2be9n}
		* $x$ 不是原始输入，而是 CNN 第一个全连接层的输出
			* （评）应该是因为原始输入（物理场）不宜视为普通向量（至少太高维），改将 CNN 初步编码后的结果视为输入；{_p2bf0m}
		* CEOD 项权重 $\lambda$ 远大于有监督项（初始化为 10），并且使用对抗训练方式优化 loss，对 $\theta$ 求极小、对 $\lambda$ 求极大
* MultiPDENet-2501.15987 （备用，by 孙浩）
	* "MultiPDENet: PDE-embedded Learning with Multi-time-stepping for Accelerated Flow Simulation"
		* Wang, Qi; Mi, Yuan; Wang, Haoyun; Zhang, Yi; Chengze, Ruizhi; Liu, Hongsheng; Wen, Ji-Rong; Sun, Hao; 
		> created on 2025-02-03
	* 摘要摘录
		> 我们设计了一个基于有限差分模板结构的卷积滤波器，并使用少量参数进行优化，
			> 该滤波器在粗网格上估计空间导数的等效形式，以最小化方程的残差。
		> 建立了一个在精细时间尺度上具有四阶龙格-库塔积分器的物理块，
			> 该物理块嵌入了偏微分方程的结构来指导预测。
		> 为了缓解长期预测中时间误差累积的诅咒，我们引入了一种多尺度时间积分方法，其中使用神经网络在粗略的时间尺度上校正预测误差。{_p23f2p}
* 2501.09987 （备用）许志钦综述，PINN 类算法谱偏差的解决方法汇总
	* "On understanding and overcoming spectral biases of deep neural network learning methods for solving PDEs"
		* Xu, Zhi-Qin John; Zhang, Lulu; Cai, Wei; 
		> created on 2025-01-26
* 2501.16371 PINN/PIKAN 优化算法 SSBroyden 好于 BFGS（均用 Wolfe 线搜索）by George
	* "Which Optimizer Works Best for Physics-Informed Neural Networks and Kolmogorov-Arnold Networks?"
		* Kiyani, Elham; Shukla, Khemraj; Urbán, Jorge F.; Darbon, Jérôme; Karniadakis, George Em; 
		> 2025-02-06 导师大群内转发
	* fig1 PINN loss landscape（粘性 Burgers），有监督项（IC,BC）相对好，PDE residual 项有许多局部极小、鞍点；{_p26b46}
	* 实验结果，各实验中 SSBroyden + Wolfe 优化器效果都好于 BFGS + Wolfe，PINN 与 PIKAN 都是；{_p26b40}
* 2405.04230 PINN 换优化算法可提高精度至与 FD 可比，改损失函数提升较小但实现简便
	* "Unveiling the optimization process of Physics Informed Neural Networks: How accurate and competitive can PINNs be?" JCP 2025
		* Urbán, Jorge F.; Stefanou, Petros; Pons, José A.; 
		> 2025-01-19 lyp票圈转发并认为 PINN 低维问题解不准是优化问题，改架构没意义
	* [公众号全文翻译](https://mp.weixin.qq.com/s/pOsXsNCqK55RakMmC_MAaA)
		> （摘要）我们使用紧凑型网络（通常由2或3层，每层20-30个神经元组成）获得的精度与使用数千个网格点的有限差分方法相当。{_p1mf8d}
		* sec2:-1 对于 PINN，L-BFGS 收敛比 Adam 快很多，但更容易陷入鞍点；{_p1mf6r}
			> 最先进的训练方案涉及将这两种优化器结合使用，首先使用Adam进行初始迭代，以更好地处理可能存在的鞍点，然后使用BFGS/L-BFGS加速收敛。
		* sec3.2 方法，SSBFGS、SSBroyden，其中 SS 指 self-scaled 自缩放；{_p1mf81}
		* sec3.3 损失函数改用 $\sqrt L,\log L$ 可加速收敛；{_p1mf5p}
		* sec4 中子星磁层，sec4.1 无电流Grad-Shafranov方程（CFGS），sec4.2. 非线性Grad-Shafranov方程（NLGS）
		* sec5 其他方程
			* 2D Helmholtz（均匀介质周期源）
			* 非线性 Poisson $\Delta u-e^u=f$；{_p1mf95}
				* 源项为 0 时为微分几何 李奥维尔（Liouville？）方程
				> 它在多个领域有应用，例如流体力学中描述稳定流中的平均场涡度[84,85]，以及量子场论中的Chern-Simons理论[86,87]。
			* 非线性 Schrödinger $i\psi_t+\Delta\psi/2+|\psi|^2\psi=0$
			* KdV 孤波碰撞解
			* 图片：Burgers，Allen-Cahn，3D NS，顶盖驱动方腔流
* GINO-2309.00583 3D 空间中 NO 输入几何表面形状（SDF+点云）预测表面上物理场取值，架构包括 隐空间均匀网格的 FNO、对点云编解码的 GKN
	* "Geometry-Informed Neural Operator for Large-Scale 3D PDEs"
		* Li, Zongyi; Kovachki, Nikola Borislavov; Choy, Chris; Li, Boyi; Kossaifi, Jean; Otta, Shourya Prakash; Nabian, Mohammad Amin; Stadler, Maximilian; Hundt, Christian; Azizzadenesheli, Kamyar; Anandkumar, Anima; 
		> 2025-01-09 CSI whn 技术分享会
	* 摘要
		> 一种学习变几何大规模偏微分方程解算子的高效方法。
			> GINO使用带符号距离函数（SDF）和输入形状的点云表示以及基于图和傅里叶架构的神经算子来学习解算子。
			> 图神经算子处理不规则网格，并将其转换为规则潜在网格，傅里叶神经算子可以有效地应用于规则潜在网格。
			> GINO是离散收敛的，这意味着训练好的模型可以应用于连续域的任意离散化，并且随着离散化的细化，它收敛到连续体算子。
		> 为了实证验证我们的方法在大规模模拟中的性能，我们生成了雷诺数高达500万的3D车辆几何形状的行业标准空气动力学数据集。
			> 对于这种大规模的3D流体模拟，数值方法计算表面压力的成本很高。
			> 我们成功地训练GINO仅使用500个数据点来预测汽车表面的压力。
			> 成本精度实验表明，与基于GPU的优化计算流体动力学（CFD）模拟器相比，计算阻力系数的速度提高了26000倍。
			> 当在几何形状和边界条件（入口速度）的新组合上进行测试时，与深度神经网络方法相比，GINO的错误率降低了四分之一。
	* 场景 eg. 根据汽车外形预测表面压强分布
	* 编码器：GNO（即 GKN），输入为几何表面 点云，输出为（3D）规则网格上隐向量；{_p1aa0e}
	* 中间映射：FNO，输入输出均为规则网格隐向量
		* 输入额外 concat 原曲面的 SDF；{_p1aa2y}
	* 解码：GNO，输入规则网格隐向量，输出物理场在原曲面点云上的取值
	* 网格量可变，因 GNO、FNO 均有此性质
	* 训练、推理均 end-to-end
* LapNet-2307.08214 by 王立威，场景同 FermiNet，为加快计算，Laplacian 用前向微分，结合新 NN 架构
	* "Forward Laplacian: A New Computational Framework for Neural Network-based Variational Monte Carlo", NMI2024
		* Li, Ruichen; Ye, Haotian; Jiang, Du; Wen, Xuelan; Wang, Chuwei; Li, Zhe; Li, Xiang; He, Di; Chen, Ji; Ren, Weiluo; Wang, Liwei; 
		> created on 2025-01-06
	* 场景：从头算量子化学，NN-VMC（变分 Monte Carlo）
	* fig1 Laplacian 计算图比较，反向微分要算完整 Hessian 再取 trace，前向可直接将 $\Delta x$ 前传（未认真搞懂细节）{_p16f1h}
	* fig2 网络架构
	* 实验
		* 系统：LiH,Li2,NH3,CH4,CO,N2,C2H4,O3,CCL4,以及一些有名字的大一些的分子
		* baseline：FermiNet，Psiformer，带 forward Laplacian 的 Psiformer
			* （评）没有 PauliNet，可能因为谷歌没开源？
		* 提升程度：对聚乙烯长链，提速倍数与系统大小（单体数）近似线性，大系统提速 20+ 倍
		* 专门化学指标估计结果；未与 baseline 比较，而是和文献中（应该是传统算法or实验结果）结果比较
			* 相对能量，过渡金属电离势，基态4s和3d轨道占有率
			* 势垒高度（重原子转移、亲核取代、单分子缔合、氢转移反应）
			* 相互作用能（氢键相互作用体系、色散相互作用体系、混合静电-色散相互作用系统）
* TheWell-2412.00568 丰富的基准数据集
	* "The Well: a Large-Scale Collection of Diverse Physics Simulations for Machine Learning", NIPS2024 Track on Datasets and Benchmarks
		* Ohana, Ruben; McCabe, Michael; Meyer, Lucas; Morel, Rudy; Agocs, Fruzsina J.; Beneitez, Miguel; Berger, Marsha; Burkhart, Blakesley; Dalziel, Stuart B.; Fielding, Drummond B.; Fortunato, Daniel; Goldberg, Jared A.; Hirashima, Keiya; Jiang, Yan-Fei; Kerswell, Rich R.; Maddu, Suryanarayana; Miller, Jonah; Mukhopadhyay, Payel; Nixon, Stefan S.; Shen, Jeff; Watteaux, Romain; Blancard, Bruno Régaldo-Saint; Rozet, François; Parker, Liam H.; Cranmer, Miles; Ho, Shirley; 
		> 2024-12-29 Pf 大群里推荐
	* [公众号报道](https://mp.weixin.qq.com/s/F8sJP_KuD3Ta_boCPcjChg)
	* 摘要摘录
		> 标准数据集通常涵盖一小部分物理行为，因此很难评估新方法的有效性。
		> Well：一个包含各种时空物理系统数值模拟的大规模数据集集合。
		> The Well汇集了领域专家和数值软件开发人员，提供了16个数据集的15TB数据，
		> 涵盖了生物系统、流体动力学、声散射以及银河系外流体或超新星爆炸的磁流体动力学模拟等不同领域。
		> 我们通过引入示例基线来演示该库的功能，这些基线突出了 The Well 复杂动态带来的新挑战。
		> 代码和数据可在 https://github.com/PolymathicAI/the_well
	* tbl2 baseline 模型 FNO、TFNO、U-Net、CNextU-Net，比较指标 VRMSE
	* secC.1 声学方程
		* （评）若 $\rho$ 改为常数，则方程形式属于 mcdcr_3_0
		* （评）我自己推导的 Euler 平衡态附近摄动行为是 $p_t+\gamma p_0\nabla\cdot u=0$，$u_t+(1/\rho)\nabla p=0$；这里 p 按偏离平衡态幅度理解，应该写 $\delta p$
	* secC.2 基于 Boltzmann 方程？
	* secC.13 超新星爆发，似乎是 ODE
	* 部分数据汇总（2025-01-17，之前放在 PDEformer ideas.md）
		* [HuggingFace](https://hf-mirror.com/polymathic-ai)
			* 可复制 LFS 文件下载链接，在 notebook 里 wget
		* C.1 声学：方程 OoD（但 Dedalus 可生成），场在新分布下也有部分 OoD（尤其迷宫）
		* C.2 active_matter 没看出最终方程形式（是否是当成 Boltzmann 部分观测版本？）
		* C.3 辐射输运，复杂方程待确定（比 C.4 普通可压 Euler 引入辐射机制）
		* C.15 CE 带能量衰减项（辐射导致），随机场未确认
		* C.11 Rayleigh-Taylor（CE 中能量方程换为 $u,\rho$ 联合散度约束，或 $\nabla\cdot u+\kappa\Delta\log\rho=0$）
			* 密度方程可改写为 $(D_t-\kappa\Delta)\log\rho=0$
		* C.5 RD（Gray-Scott），方程 OoD 不过 Dedalus 可解，场似乎在新分布内（从当时的记录来看）
			* secD 提到末帧均演化至稳态，可当稳态方程来学
		* C.6 Helmholtz，方程 OoD 不过 Dedalus 可解，涉及点源，波速场未确认（可能 OoD）
		* C.7 磁流体，C.8 球面 SWE，C.9 涉及广相，C.13 超新星爆发方程 r 含义没看懂，C.14 湍流重力冷却方程没给，
		* C.10 Rayleigh-Benard 流体加热，方程形式需新版 INS（带浮力）+ 单向 Dirichlet BC
			* 定义域 $[0,4]\times[0,1]$（根据代码仓 README l84）
			* 不稳定方程，可先截断前几个时间步再作为 IC 输入网络？
		* C.12 shear_flow INS 带 tracer，方程形式需新版 INS
			* 定义域 $[0,1]\times[-1,1]$（根据代码仓 README l71）
		* C.15 粘弹性，INS 中应力张量包括溶液的普通粘性应力、（形式比较特别的）多聚物应力 $T(C)$，应变 C 也满足特定方程（其中也涉及 $T(C)$）
* AM-FNO FNO 中频域线性变换 R 不再各频率位置独立，而是 MLP/KAN（输入为频率）生成
	* "Amortized Fourier Neural Operators", NIPS2024
		* Zipeng Xiao, Siqi Kou, Zhongkai Hao, Bokai Lin, Zhijie Deng
		> 2024-12-24
	* fig2 频域线性变换 R 在各频率位置取值由 MLP/KAN 生成；{_ocof0c}
		* MLP 输入为频率 k 的位置编码（正交基函数）
		* 原 FNO 需截断到有限个频率（尤其高维），本文做法不需要
	* eqn(11) 每层仿照 F-FNO 形如 $v'=FFN(\mathcal{K}v)+v=W_2\sigma(W_1Kv+b_1)+b_2+v$，而非原始 FNO 的 $v'=\sigma(Kv+Wv+b)$；{_ocof0s}
* AMG-2411.15178 NO mesh 可变，使用“GraphFormer”，中间层涉及 multi-scale graph 变换
	* "Harnessing Scale and Physics: A Multi-Graph Neural Operator Framework for PDEs on Arbitrary Geometries"
		* Li, Zhihao; Song, Haoze; Xiao, Di; Lai, Zhilu; Wang, Wei; 
		> created on 2024-12-23
	* 摘要摘录
		> 本文介绍了AMG方法，这是一种多图神经算子方法，旨在有效求解任意几何上的偏微分方程。
		> AMG在新型GraphFormer架构中利用了先进的基于图的技术和动态注意力机制，实现了对不同空间域和复杂数据相互依赖关系的精确管理。
		> 通过构建多尺度图来处理可变特征频率，并构建物理图来封装固有的物理特性，AMG显著优于以前的方法，这些方法通常仅限于均匀网格。
	* fig2b 消息传递机制，有三种不同的 graph 会作为 GraphFormer 输入：physics/local/global graph
		* 从图中看：local graph 仅做局部消息传递（限制了参与的节点总数），每局部选一个代表节点组成 global graph；{_ocna10}
		* fig2c 消息可从 physics graph 传递到 multi-scale graph (local + global)
	* fig3 GraphFormer block；{_ocna2p}
	* sec3.2 graph construction
		* sec3.2.2 点集 partition 通过最远点采样生成
		* sec3.2.3 local 采样
			> 基于高频指示符（eqn(4)）选择每个节点⻖及其邻居N(𝑣)，识别位于高细节和信息密度区域内的节点。
			> 在实践中，使用高频指示符来确定每个局部图的组成，从而选择具有丰富细节的节点。
			> 对于每个节点𝑣，选择其邻居N（𝑣）以确保只包括具有大量细节和信息内容的区域内的节点。
			> 这种有针对性的选择策略保证了图中的连接是有意义的，并代表了重要的局部交互。
			> 通过关注具有高信息含量的节点，该模型可以更有效地适应数据密度和局部结构复杂性的变化。
			> 这种方法在需要高精度局部细节的场景中非常宝贵，使模型能够准确捕捉复杂的动态。
		* sec3.2.4 global 采样：类似 sec3.2.2 的最远点采样；eqn(6) 距离计算在 feature 空间而非物理空间
		* sec3.2.5 physical graph；{_ocne9w}
			> 每个节点对应一个基本的物理属性。
			> 标准 operational graph 中的节点链接到物理图中的所有节点，强调了这些属性对更高层次现象的基本贡献。
			> 物理图中的边象征着这些较低级别物理属性之间的相互作用。
			> 在关于属性之间连接的明确物理信息可用的情况下，物理图是基于这些经验数据构建的。
			> 然而，在缺乏此类细节的情况下，我们选择全连通图配置。
			> 这种方法是合理的，因为通常较低级别的节点数量较少，它们之间的交互频繁，确保了系统内潜在影响和交互的全面覆盖。
* APEBench-2411.00180 多个含时方程的 JAX 可微分拟谱求解程序，训练时动态生成样本而无需事先生成数据
	* "APEBench: A Benchmark for Autoregressive Neural Emulators of PDEs", NIPS2024
		* Koehler, Felix; Niedermayr, Simon; Westermann, Rüdiger; Thuerey, Nils; 
		> created on 2024-12-21
	* [github.io](https://tum-pbs.github.io/apebench-paper/)
		> used for procedural data generation (no need to download large datasets with APEBench){_ocll5f}
		* procedural data generation，从图中来看动态生成的样本需暂存（而非算完就扔），说明数值解生成速度应该还是慢于 NN 推理 + 反传更新参数速度
	* 摘要摘录
		> 自回归PDE仿真器基准（APEBench），
		> 这是一个全面的基准套件，用于评估求解偏微分方程的自回归神经仿真器。
		> APEBench基于JAX，提供了一个无缝集成的可微分仿真框架，采用高效的伪谱方法，在1D、2D和3D中实现了46个不同的PDE。
		> 为了促进对学习模拟器的系统分析和比较，我们提出了一种新的展开训练分类法，并为PDE动力学引入了一个与经典数值方法的稳定性标准直接相关的唯一标识符。
		> APEBench能够评估各种神经架构，与现有的基准不同，它与求解器的紧密集成支持可微分物理训练和神经混合仿真器。
		> 此外，APEBench强调推出指标来理解时间泛化，为模拟PDE动态的长期行为提供见解。
		> 在几个实验中，我们强调了神经模拟器和数值模拟器之间的相似之处。
* 2410.19843 AI4PDE 综述
	* "Artificial intelligence for partial differential equations in computational mechanics: A review"
		* Wang, Yizheng; Bai, Jinshuai; Lin, Zhongya; Wang, Qimin; Anitescu, Cosmin; Sun, Jia; Eshaghi, Mohammad Sadegh; Gu, Yuantong; Feng, Xi-Qiao; Zhuang, Xiaoying; Rabczuk, Timon; Liu, Yinghua; 
		> created on 2024-12-20
	* sec4 相关正问题，包括固体物理、流体、生物力学
		"Solid mechanics" 32
			"Linear elasticity mechanics" 33
			"Elastoplastic mechanics" 35
			"Hyperelastic mechanics" 36
			"Fracture mechanics" 38
			"Summary" 40
		"Fluid mechanics" 41
			"Hydrodynamics" 41
			"Aerodynamics and shock waves" 43
			"Multiphase and moving boundary problems" 44
			"Multiscale and multiphysics" 45
			"Summary" 47
		"Biomechanics" 48
			"Soft tissue deformation" 48
			"Blood flow of biomechanics" 48
			"Morphogenesis of tissue and cell deformation" 51
			"Summary" 51
	* sec5 相关反问题，同样包括固体物理、流体、生物力学；{_ockf1p}
		"Solid mechanics" 53
			"Identification of Elastic Modulus and Poisson's Ratio" 53
			"Identification of Constitutive Equations" 54
			"Topology Optimization" 57
			"Defect Identification " 58
			"Summary " 59
		"Fluid mechanics" 59
			"Field reconstruction" 59
			"Parameter estimation and identification in fluid" 62
			"Summary" 63
		"Biomechanics" 63
			"Modeling Blood Flow" 63
			"Material parameter identification in soft tissue" 64
			"Protein structure prediction" 65
			"Summary" 65
* VCNeF-2406.03919 NO，输入场打为多尺度 patch 后自注意力生成 modulation，多组不同尺度 patch-INR 求和得结果
	* "Vectorized Conditional Neural Fields: A Framework for Solving Time-dependent Parametric Partial Differential Equations", ICML2024
		* Hagnberger, Jan; Kalimuthu, Marimuthu; Musekamp, Daniel; Niepert, Mathias; 
		> created on 2024-12-20
	* 摘要摘录
		> 用于PDE求解的所有流行体系结构都缺乏理想代理模型的几个期望性质中的至少一个，例如
			> （i）对训练期间未看到的PDE参数的泛化，
			> （ii）空间和时间零样本超分辨率，
			> （iii）连续时间外推，
			> （iv）对1D、2D和3D PDE的支持，以及
			> （v）对更长时间展开的有效推断。
		> 提出了矢量化条件神经场（VCNeFs），它将含时PDE的解表示为神经场。
		* 多时空点查询不独立，而是并行查询、涉及相互注意力
			> 针对一组多个时空查询点并行计算它们的解，并通过注意力机制对它们的依赖关系进行建模。
		> 可以根据初始条件和PDE的参数来调节神经场。
	* fig2 整体架构示意图
		* multi-scale patching mechanism: IC 打为多组 patch，每组用不同 patch size；{_ocke7e}
		* 该部分输入自注意力模块，生成 INR 的 modulation
		* INR 输入 patch 中心的时空坐标（带位置编码 eqn(8)），输出整个 patch 内的场取值
		* INR 的多尺度机制，多个尺度 patch 求和得结果；{_ocke7q}
* Li2024ScaleCL NO 架构、数据增强策略，使 NO 能对 PDE 空间尺度泛化
	* "Scale-consistent learning with neural operators", NIPS2024 FM4Science Workshop
		* Zongyi Li, Samuel Lanthaler, Catherine Deng, Yixuan Wang, Kamyar Azizzadenesheli, Anima Anandkumar
		> 2024-12-20
	* 摘要摘录
		* 希望 NS 模型能处理不同的雷诺数、域大小
		* 提出数据增强方案，基于 PDE 尺度一致性
		> 设计了一种可以模拟各种尺度的尺度知情神经算子。
			> 我们的公式（i）利用了许多PDE在空间域重新缩放下具有尺度一致性的事实，
			> 并且（ii）基于神经算子的离散收敛特性，这使得它们可以应用于任意分辨率。
			* 效果：Re 推广到 250–10k
	* fig1 尺度 PDE 例子：Darcy flow，Helmholtz，NS
	* fig2 子域限制给出 self-consistency loss：设解算子形式 $G(a,g,k)$（非齐次边值 Darcy flow），要求 （尺度 k）求解后限制到子域 结果等于 限制到子域（尺度 $\lambda k$）再求解；{_ocka29}
	* fig3 Scale-informed NO 架构，频域变化引入类 U-Net 结构，只是下采样操作换成低频截断；{_ocka19}
		* sec4.1 提到 scale-informed MLP
* 2209.14977 基于 EIT 问题的数学理论结构，设计 Transformer 模型，端到端输入观测数据对、输出系数场预测
	* "Transformer Meets Boundary Value Inverse Problems", ICLR2023
		* Guo, Ruchi; Cao, Shuhao; Chen, Long; 
		> created on 2024-12-18
	* 摘要摘录
		> 提出了一种基于 Transformer 的深度直接采样方法，用于电阻抗断层成像，
		> 学习 从精心设计的数据 到重建图像 的逆算子，通过 eval 该算子实现了实时重建。
		* NN 架构设计基于问题的数学理论结构
			> 本文试图为一个基本问题提供一个具体的例子：人们是否以及如何从数学问题的理论结构中受益，以开发面向任务和符合结构的深度神经网络？
			> 具体来说，受反问题直接采样方法的启发，不同频率的1D边界数据通过基于偏微分方程的特征图进行预处理，以产生作为不同输入通道的2D谐波扩展。
			> 然后，通过引入可学习的非局部核，直接采样被重新定义为一种改进的注意力机制。
	* 未看细节；从部分公式的形式推测是 用注意力机制近似了积分算子；{_ock96n}
* RoPINN-2405.14369 PINN loss 空间点带邻域随机扰动，扰动在“信赖域”内，其半径根据相邻迭代步信息估计
	* "RoPINN: Region Optimized Physics-Informed Neural Networks", NIPS2024
		* Wu, Haixu; Luo, Huakun; Ma, Yuezhou; Wang, Jianmin; Long, Mingsheng; 
		> created on 2024-11-16
	* [公众号报道](https://mp.weixin.qq.com/s/9la94DUxHuJBBwxxOjAHpA)
		* 原文包括若干理论分析
		> RoPINN包含两个交替的步骤：蒙特卡洛近似（Monte Carlo Approximation）和置信域校准（Trust Region Calibration），
			> 前者使用采样高效地近似局域积分，后者自适应地调节局域大小来控制近似误差。
		> 为了保证训练稳定性，我们提出控制局域大小，从而得到更加可靠的梯度下降。{_obgk5h}
			> 根据上式，我们得到梯度估计误差的期望为局域内的梯度方差。
			> 为此，我们称局域内损失函数梯度方差小的区域为“置信域（Trust Region）”。
			> 我们提出使用“多个相邻优化步之间的梯度方差”近似“局域梯度方差”
				* 称 Adam 有类似思想；原文有相应理论分析
		* 优化泛化平衡（略）
* （备用）材料断裂基础模型
	* "Developing a Foundation Model for Predicting Material Failure", NIPS2024 FM4Science workshop
	* 非均匀网格编码器：按散点输入，其信息用 Transformer 交叉注意力机制提取，坐标按位置编码加入；{_obea6r}
		> 编码器利用交叉注意力机制将所有输入作为1D序列处理（具有多维位置编码——见附录A.1），使其与域大小无关，如图5的示例预测所示。此层随输入大小线性缩放。
		> 编码器的一个关键方面是它的位置嵌入，它将网格箱映射到它们各自的中心点。这是至关重要的，因为它允许模型处理结构化（笛卡尔）和非结构化网格（例如，在我们的例子中是三角形元素）。
* M²M-2410.11617 （备用）NO 认为不同区域时间尺度不同，靠 MoE 为不同区域分配不同子 NO
	* "M$^{2}$M: Learning controllable Multi of experts and multi-scale operators are the Partial Differential Equations need"
		* Liang, Aoming; Mu, Zhaoyang; Lin, Pengxiao; Wang, Cong; Ge, Mingming; Shao, Ling; Fan, Dixia; Tang, Hao; 
		> created on 2024-10-19
	* 摘要摘录
		> 解的多尺度性质，其中某些区域表现出快速振荡，而另一些区域则发展得更慢。
		> 本文介绍了一种多尺度多专家（M2 M）神经算子框架，旨在有效地模拟和学习偏微分方程。
			> 我们采用分而治之策略来训练一个多专家门控网络，以实现动态路由器策略。
			> 我们的方法结合了一种可控的先验门控机制，确定了专家的选择权，提高了模型的效率。
		> 为了优化学习过程，我们实施了PI（比例积分）控制策略来精确调整分配规则。
		> 我们在基准2D Navier-Stokes方程上测试了我们的方法，并提供了一个自定义的多尺度数据集。
	* fig1 推进将全区域分 4 块，policy 网络决定每块区域调用哪个专家网络做时间推进；{_oajg1r}
		* 每次时间推进重新调用 policy 网络分配专家
* DeepOSets-2410.09298 （备用）DeepONet 中 a(x) 按 DeepSets 输入；{_oajf62}
	* "DeepOSets: Non-Autoregressive In-Context Learning of Supervised Learning Operators"
		* Chiu, Shao-Ting; Hong, Junyuan; Braga-Neto, Ulisses; 
		> created on 2024-10-19
* （备用）最速降线问题用 PINN 求解
	* [2024-10-19](https://mp.weixin.qq.com/s/gLo-wNPZQOir14mwB68w6Q)
	* 约束条件下极小化泛函；约束用 NN 架构硬编码，泛函的积分离散用等间隔网格、梯形公式
* DPA-2 大原子模型
	* [2024-10-16](https://mp.weixin.qq.com/s?__biz=MjM5NjYwNzM1Ng==&mid=2651787016&idx=1&sn=28f58a233db849609184ab761265330d)
	* 通用原子模型，涵盖所有原子类型，但只针对特定密度泛函产生的模拟数据，无法利用其他密度泛函（精度各不相同）的数据
		> 虽然三个数据集(包括训练通用原子模型的MP数据集)都以密度泛函理论打标签，但是使用的交换关联泛函不同，他们本质上定义了三个不同的势能函数，因此无法放在一起进行训练。
		> 通用原子模型精度受限于其标签时选定的交换关联泛函的精度。
			> CHGNet，MACE，GNoME均只具有PBE/PBE+U的精度。
			> 该精度对于绝大多数材料计算问题是足够的，但是仍然存在大量应用问题需要更高的交换关联泛函精度。
			> 例如化学领域一般需要杂化泛函[49，50]，对于冰不同相的相对稳定性的正确描述需要SCAN泛函[51]。
	* 大原子模型，标度律难总结（数据类型不同，数据信息量与数据量非线性对应），主要关注 few-shot
		> 一般而言，大模型被认为提供了领域知识的公共表示，其训练精度满足特定标度定律(scaling law)[52]，且具有少数帧(few-shot)[53]泛化能力。
		> 对于势函数构造领域，由于第3.2节讨论的原因，训练数据量并不直接线性对应于数据中蕴含的信息量，因此尚难以总结标度定律，{_oagf63}
		> 但是其少数帧泛化能力仍然可以作为评价一个势函数模型是否具有大模型特征的重要参考。
		* 注：sec3.2 讨论如何生成数据以充分覆盖可能的场景，用了主动学习策略
	* DPA-2 三步骤：预训练—下游微调—知识蒸馏
	* 多任务预训练，不同密度泛函有独立拟合网络（弱表达力），主干（强表达力）共享；{_oagf8h}
		> DPA-2设计了具有强表示能力的描述子（公共结构），具体而言，为基于消息传递机制的多层表示进化网络。
		> DPA-2同时弱化拟合网络的表达能力，特别地，取每个拟合网络为标准的前馈全连接网络。
	* 知识蒸馏以降推理成本，可行性：下游任务场景局限，小模型足以处理；{_oagf98}
		> 由于需要提取大量数据集中的公共知识，DPA-2需要使用表达能力非常强的描述子提取数据中的公共知识表示，但这造成了下游任务模型计算开销比较昂贵。
		> 同时，对于特定下游任务，由于其原子构型和元素的丰富程度远不及预训练集，也无需使用表达能力过强的模型结构。
	* 知识蒸馏方式：teacher-student 训小模型；{_oagf9g}
		> 因此在完成下游微调后，DPA-2使用模型知识蒸馏技术，将下游模型蒸馏至一个具有高运行效率的专有模型。
		> 特别地，蒸馏过程使用下游微调模型作为教师模型生成训练标签，在同步学习循环中训练专有的学生模型。
		> 知识蒸馏可以在模型精度几乎不受损的前提下，提升模拟效率高达2个数量级，蒸馏后模型的运行精度和专有模型完全一致。
* 2101.08932 PINN loss 中引入导数（Sobolev norm）
	* "Sobolev Training for Physics Informed Neural Networks"
		* Son, Hwijae; Jang, Jin Woo; Han, Woo Jin; Hwang, Hyung Ju; 
		> created on 2024-10-02
	* eqn(3.4-6) loss 形式，空间 $W^{l,q}$、时间 $W^{k,p}$；保留原始次方（$q,p$）、不开根号；{_oa2j24}
		* BC 同理（只是空间定义域缩减）¹；IC 仅空间 loss
			* ¹该空间的求导应是局限在 $\partial\Omega$ 内的梯度，而非原始空间的梯度
	* sec4 理论收敛性证明，对某些 PDE，该 loss → 0 时空间 $L^2,H_0^1,H^2$ 范数（对时间取 esssup）→ 0
* DFVM-2305.06863
	* "Deep Finite Volume Method for Partial Differential Equations"
		* Cen, Jianhuan; Zou, Qingsong; 
		> created on 2024-09-29
	* 考虑控制体上方程，从而只需算空间一阶导数，减小计算成本
		* （评）靠空间前传求导是否也能降低计算成本？
		* sec2.4 基于 MLP 架构推导二阶导计算成本
	* eqn(1.1) $\Delta u+f=0$ 改写为 $\int_{\partial V}\partial_nu+\int_Vf=0$；{_o9te71}
		* eqn(1.3) 构造 MSE loss 时，$V$ 选为围绕给定点 $x_0$ 的 control volumn
			* 各 $x_0$ 的 loss 求和得总 loss
			* sec2.1 control volumn 取为 $l^\infty$-norm 下的 h-邻域（正方体），或半径 h 的球
		* p6 数值积分离散点选取，Gauss 点；细节未确认
	* sec2.2.1 $-\nabla\cdot(A(r)\nabla u)+b(r)\cdot\nabla u+cu$ 也可类似地离散化
	* sec2.2.3 高阶方程通过升维降阶变成二阶方程，例如 biharmonic PDE；{_o9te82}
	* sec2.3 空间采样点位置动态更新，希望更多集中在误差较大的位置；{_o9te90}
		* 似乎是按集合更新，去掉一些点又加新的；细节未确认
	* 实验包括含时方程
* 2409.13598
	* "Prithvi WxC: Foundation Model for Weather and Climate"
		* Schmude, Johannes; Roy, Sujit; Trojak, Will; Jakubik, Johannes; Civitarese, Daniel Salles; Singh, Shraddha; Kuehnert, Julian; Ankur, Kumar; Gupta, Aman; Phillips, Christopher E; Kienzler, Romeo; Szwarcman, Daniela; Gaur, Vishal; Shinde, Rajat; Lal, Rohit; Da Silva, Arlindo; Diaz, Jorge Luis Guevara; Jones, Anne; Pfreundschuh, Simon; Lin, Amy; Sheshadri, Aditi; Nair, Udaysankar; Anantharaj, Valentine; Hamann, Hendrik; Watson, Campbell; Maskey, Manil; Lee, Tsengdar J; Moreno, Juan Bernabe; Ramachandran, Rahul; 
		> created on 2024-09-25
	* [公众号报道](https://mp.weixin.qq.com/s/sxgOIbUnIcO5gJj9nFCEPQ)
* ANSYS SimAI，面向实际工业场景已落地的 AI 增强模拟
	* [2024-09-25](https://mp.weixin.qq.com/s/56qZhs6Ut_9pzwHo_Y3izQ)
		> SimAI最大的卖点，当然就是快。这个产品的宣传语，就是：SimAI，predict at the speed of AI。可见AI针对CFD的加速有多重要。
		> ANSYS说经典CFD计算的要6小时，但是AI加速的只需要2分钟。{_o9pa1b}
		* 另：官网的图对比运算时间
			* 汽车 CFD：Fluent 200 cores 5h，SimAI 30s
			* ship hull design：Ansys CFD 32 cores 4h, SimAI 50s
			* [src](https://www.ansys.com/blog/chips-ships-optimize-design-ansys-simai-platform)
		> SimAI有个QA环节，问：最小的训练数据量需要多少？ANSYS这么回答的：
			> 一般来说需要30-100个CFD计算的结果。训练可能需要1-5天。
			> 这里面有个就比较模糊，没有说用什么硬件去训练。是50万一个的H200，还是1万一个的3090？
			> 那要是H200训练1天的，估计3090要训练1个月。。。
	* [Ansys 官网产品介绍页](https://www.ansys.com/products/simai)
		* 3 子页面：overview, capabilities, resources
		* （评）generative AI 是宣传策略 or 真用了相关技术？
		* 算法通用性
			* 一套算法支持所有物理（包括稳态、转捩）
				> All Physics Supported
				> Single AI algorithm for all physics problems
				> Steady state and Transient Analysis
				> 应用示例包括汽车碰撞、线材成型制造、增材制造的晶体塑性、生成设计、设计优化、外部空气动力学、电池热管理概念设计、功率逆变器冷却、天线设计和集成、天线阵列系统、光学系统。
				> (capabilities) SimAI涵盖了从流体力学到电磁学的各个行业的所有物理领域。应用范围从汽车的外部空气动力学到航空航天和电信天线的电磁特征分析。
			* 允许拓扑改变，结果网格无关
				> Prediction Across Topology Variations
				> Mesh independent Results
				> (capabilities) 直接使用仿真结果和几何输入训练AI模型，预测连续3D物理场中新设计的性能。
		* 预测结果，精度高、带 UQ
			* 似乎是结合 LLM 自动生成评估报告？
				> The Model Evaluation Report now offers improved readability and metrics for faster evaluation.
				* 另一文章提到 AnsysGPT
					> Ansys之前宣布了AnsysGPT的测试版，这是一种虚拟助手，可以获得物理领域的工程专业知识，提供全天候的全面技术支持，并缩短响应时间。AnsysGPT将于2024年第一季度上市。
					* [src](https://investors.ansys.com/news-releases/news-release-details/ansys-continues-ai-innovations)
			* 精度（capabilities 页）
				> SimAI大大加快了模型性能预测的速度，其精度可与全保真模拟相媲美。
			* 预测结果可信度打分（capabilities 页）
				> 每个结果都报告了一个置信水平，表明它是否可信，或者设计是否与训练数据太远。如果几何图形太远，则可以选择用新几何图形重新训练模型。
		* 训练需求，数据类型、数据量、训练时间
			* 数据类型，不一定是 Ansys 生成的数据
				> Customers can train the AI using previously generated Ansys or non-Ansys data. 
			* 样本量：通常 30-100
				> 通常需要30到100个模拟结果来生成具有足够精度的模型。
			> 模型从头开始训练，不包含任何先验知识（capabilities 页）。
			* 训练时间：1-5 天，可根据需要调整
				> 该模型已经过调整，因此2天的培训将解决大多数用例。培训时间可根据需要在1至5天之间调整。
	* [官网介绍博客](https://www.ansys.com/blog/explaining-simai)
		* 输入几何形状，输出物理场预测
			> SimAI软件使用设计本身的形状作为输入，而不是依赖几何参数来定义设计。
		* 非常粗略的架构描述
			> SimAI平台的通用架构基于不同技术的融合，这些技术结合了多个深度学习神经网络。
			> 这种类型的架构使得捕捉物理学的所有重要尺度成为可能。
			> 该架构由大量非线性层组成，包括多个参数和变量之间的复杂相互作用。
		* 使用 INR
			> SimAI平台使用隐式神经表示来学习可以生成这些数据点的连续函数，而不是在图像中显式存储像素值等数据点。
			> 这意味着SimAI软件可以从之前的计算中获得一组点，并很好地推广到新的几何形状和自由流条件。
			> 以汽车空气动力学评估为例，这种能力能够连续表示表面和体积场，例如压力和速度。
			> 这使得可以请求以期望的分辨率进行预测。
			> 此外，作为后处理，可以从预测场中导出全局系数。
		* 用正则化技术避免过拟合训练数据，“直接嵌入模型结构中的局部方法”
			> 事实上，SimAI平台最强大的资产之一是它使用正则化技术来防止过拟合并提高新几何的泛化能力。
			> 正则化技术旨在减少过拟合。
			> SimAI使用正则化技术，包括直接嵌入模型结构中的局部方法，从而得到更稳定、更具表现力的模型。
				> local methods that are embedded directly in the structure of the model
			> 这就是SimAI软件可以如此快速轻松地处理新几何形状的原因。
		* 输入 3D 几何的表示，允许任意的不规则网格
			> 同样，SimAI平台使用3D形状的充分表示来描述具有复杂几何变化的任意或不规则网格，这些变化不遵循特定的分布，例如未参数化的几何形状。
		* UQ，似乎只是计算输入形状与数据中最远点的距离？
			> 为了帮助量化预测中的不确定性，SimAI软件使用一个独特的置信度分数来计算与非常高维空间中最近的已知几何体的距离。
			> 无论新几何体的网格分辨率如何，SimAI平台都将返回相同的置信度得分，因为它采用了形状的底层表示，因此产生了相同的输出。
