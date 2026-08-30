> 2026-08-30 从多个源笔记中抽取整合
* 2602.11229 多历史步输入的 PDE 基础模型，下步预测在隐空间由扩散生成
	* "Latent Generative Solvers for Generalizable Long-Term Physics Simulation"
		* Chen, Zituo; Wu, Haixu; Deng, Sili; 
		> created on 2026-02-19
	* sec3.0:1 历史窗口长度固定；物理时间 s，扩散生成时间 t
	* sec3.1 隐空间预测
		> 我们引入了统一的潜在物理表示，协调异构偏微分方程系统，同时提升泛化性和计算效率。
		> 预训练物理变分自编码器（P2VAE）将高维物理态映射 𝐗 到共享的潜空间 𝐱 。
		> 所有动力学预测均在潜空间中进行，解码器仅用于重建和评估。
		> P2VAE 独立于下游求解器训练，并在任务和系统实例间重复使用。
		* 好处
			> 潜空间捕捉了系统不变的动力学结构，同时摒弃了表示特异的冗余，如分辨率和离散化伪影，使得具有相似动态的不同偏微分方程系统能够占据附近的潜在区域，从而提升跨数据集泛化。
			> 潜在状态的维度也明显低于原始场，减少了内存占用，同时加快了训练和推理速度。潜在轨迹可以预先计算和缓存，消除求解器训练中的重复编码，提高长视野自回归学习的效率。
			> 最后，紧凑且连续的潜空间为概率建模提供了自然的基础，使不确定性能够以受控且具有物理意义的方式注入和传播，而非直接施加在原始状态空间中的扰动。
	* 时间金字塔：远期历史信息衰减，通过 token avg-pool；{_q2jb25}
		> 由于自注意力在长历史中的二次复杂性，我们引入了时间金字塔以减少令牌数量，反映了许多偏微分方程系统的近似马尔可夫性质。
		> 对于早期 s ，我们使用下采样（平均池化）潜态来传播物理上下文 c ;得到一个金字塔 FFT（PFFT）。
* CompNO-2601.07384 PDE 基础模型，各项学独立网络块，根据待解方程组合
	* "CompNO: A Novel Foundation Model approach for solving Partial Differential Equations"
		* Hmida, Hamda; Joly, Hsiu-Wen Chang; Mesri, Youssef; 
		> created on 2026-01-26
	* 摘要摘录
		> 最近的科学基础模型（SFM）旨在通过从大量模拟系统中学习通用替代来减轻这种成本，但它们通常依赖于单体架构，解释性有限且预训练成本高昂。
		> 本研究介绍了合成神经算子（Compositional Neural Operators ，简称 CompNO）， 这是一个参数偏微分方程的合成神经算子框架。
			> CompNO 不是在异构数据上预训练单个大型模型，而是先学习一个基础模块库，每个模块是一个参数化的傅里叶神经算子，专门针对一个基本微分算子（例如对流、扩散、非线性对流）。{_q1qa6y}
			> 这些模块随后通过轻量级适应模块组装成任务专用求解器，近似目标偏微分方程的时间演化算子。
		> 专用的边界条件算子在推断时精确地进一步强制执行狄利克雷约束。
		> 我们验证了 PDEBench 套件中的一维对流、扩散、对流-扩散和 Burgers 方程的 CompNO 。
			> 该框架在线性参数系统上相比强基线（PFNO、PDEFormer 及基于上下文学习的模型）实现了更低的相对 L2 误差，同时在非线性 Burgers 流中保持竞争力。
			> 该模型在定义域边界处保持精确的边界满足，且在广泛的佩克莱数和雷诺数范围内展现出鲁棒的推广性。
	* 实验关注 PDEBench 1D，基线包括 PDEformer-1
* 2602.00884 （备用）PDE 基础模型，预训练学多系统网络权重，新系统先近似为已知系统的组合、再算子分裂预测
	* "Test-time Generalization for Physics through Neural Operator Splitting"
		* Serrano, Louis; Han, Jiequn; Oyallon, Edouard; Ho, Shirley; Morel, Rudy; 
		> created on 2026-02-19
	* 摘要摘录
		> 神经算子在学习偏微分方程（PDE）解图方面表现出潜力，但当测试输入超出训练分布时，如新初始条件、未见偏微分方程系数或未见物理，神经算符常难以推广。
		> 以往的研究通过大规模多重物理预训练和微调来解决这一限制，但仍需参考新动力学中的实例，未能实现真正的零射普推广。
		> 本研究提出一种在测试时增强泛化的方法，即无需修改预训练权重。
		> 基于 DISCO，该词典提供了跨不同动力学训练的神经算符词典，我们引入了一种神经算符拆分策略，在测试时会搜索训练算符的组合以近似未见的动态。
		> 在参数外推和物理现象新组合等具有挑战性的非分布任务中，我们的方法实现了最先进的零测向推广结果，同时能够恢复底层偏微分方程参数。
		> 这些结果强调了测试时间计算作为构建灵活、组合性和可推广神经算子的关键途径。
* DISCO-2504.19496 多步历史输入的 PDE 基础模型，通过超网络生成小网络参数；{_q1ng1t}
	* "DISCO: learning to DISCover an evolution Operator for multi-physics-agnostic prediction", ICML 2025, by 韩劼群
		* Morel, Rudy; Han, Jiequn; Oyallon, Edouard; 
		> created on 2026-01-23
* （备用）PDE 基础模型综述（目前仅 GitHub 版本）
	* [2026-01-23](https://mp.weixin.qq.com/s/3eM__xzyDGD-m-l9Q0Pwlg)
		* [GitHub](https://github.com/small-dumpling/Foundation-Neural-Operators-A-Survey)
	* 摘要
		> 本综述分析了预训练在建模范式、数据生态系统和适应方法三大核心领域的影响。
		> 引入一种与离散化无关的分类法，将预训练范式划分为四个主要目标类别，并评估符号条件和物理约束的作用。
		> 我们还整理了基础NO数据生态系统，包括大规模PDE语料库、标准化格式以及预测、逆问题、控制和实际应用任务套件。
		> 此外，还讨论了面向部署的优化策略，重点关注参数高效、稀疏和物理信息引导的适应方法。
		> 最后，指出数据标准化、物理一致性和工业规模化等持续面临的挑战。
	* 先前综述不足
		> 然而，现有的唯一综述[Zhou et al., 2024b] 仍主要是经验性的，基准测试特定策略，未建立理论分类，也未充分解决数据生态系统和下游部署的复杂性。
		> 因此，该领域缺乏对多样预训练目标的系统化分类，也未充分应对将大规模模型适应特定物理约束的工程挑战，亟需一个统一的框架以指导未来发展。
	* 分类方案
		> 这项调研通过建立一个对 PDE 基础模型的表示不变的分类体系，超越了特定离散化方案，为文献做出了独特贡献。
		> 如图1所示，我们将预训练范式分为四个目标类别：有监督条件算子回归 、自监督重建与潜在演化 、生成算子学习  和元推理与上下文学习 。
		> 此外，我们沿着规范条件  和物理注入  两个正交轴分析模型。
		> 我们还回顾了基础 NO 数据生态系统从标准准确率指标  到复杂多物理场和仿真到现实基准  的演变。
		> 最后，研究还涵盖了部署技术，重点介绍高效微调（PEFT）方法，如 F-Adapter 、可扩展的专家混合（MoE）架构  和物理约束适应 。
		> 此外，还分析了复杂场景中的泛化能力，包括分布外（OOD）泛化 、跨物理场迁移  和逆问题鲁棒性 ，以确保推理过程中的物理一致性和可靠性。
	> 是否可以根据学习原则而非实现细节对这些方法进行组织？
		> 为此，我们引入两个互补的轴，如图2所示。
		> 第一个轴，条件对象，指预测的目标变量。
			> 它将确定性算子学习（预测唯一解）与概率方法区分开来。
			> 概率方法预测给定输入条件下的可能解场的分布。
		> 第二个轴，目标类别，将方法按训练目标分组，包括似然回归、掩码重建、得分匹配和元推理。
		> 这两个轴共同为比较预训练范式提供了一个表示不变的基础，独立于架构选择或离散化方案。
	* （评）这个微信推送可能没经过认真复核：某个描述看起来像我们的 PDEFoundry-2 但引的是别人的文章，其中考察的是 LLM 写 NPDE 求解格式
		> 通过随机零系数在八种通用偏微分方程形式中生成大量数据集，尽管可能产生非物理方程。
* 2511.20455 （备用）CFD 的 scaling law，似有领域需求综述性质；Poseidon 组与 NVIDIA 合作
	* "Fluid Intelligence: A Forward Look on AI Foundation Models in Computational Fluid Dynamics"
		* Ashton, Neil; Brandstetter, Johannes; Mishra, Siddhartha; 
		> created on 2026-01-15
	* 摘要摘录
		> 本文通过将工业规模的 CFD 模拟拆解为其核心组成部分，弥合了机器学习与计算流体力学（CFD）领域之间的鸿沟。
		> 我们的主要贡献是提出首个将计算流体力学输入纳入数据生成和模型训练的尺度定律，以概述开发和部署这些下一代人工智能模型以应对复杂流体力学问题的独特挑战。
		> 利用我们的新缩放定律，我们建立了大规模极限的定量估计，区分了数据生成成本为总计算主导因素的区域与以模型训练成本为主的区域。
		> 我们得出结论，高保真度瞬态数据的纳入为基础模型提供了最佳路径。
		> 我们用具体数字来约束理论，首次公开估算构建计算流体力学基础模型的计算成本和时间。
	* sec2 CFD 计算过程概述
		* sec2.3.1 概述数据类型，稳态、瞬态、时间平均
	* sec3.2 eqn(9) CFD NO 输入，几何、几何预处理、IC/BC、网格（拓扑、分辨率）、物理模型（如湍流模型）、数值离散
		* 后两个变量离散，前面的连续
	* 训练瓶颈，compute/memory bound；PDE 求解时还涉及 data/train bound
	* sec5:1 网络输入包括仿真配置，包括湍流模型、数值方法
		> 这些数据不仅包括连续体输入，如初始/边界条件、域几何等，还包括类别变量，即底层物理（湍流）模型和网格离散化/数值方法等。
	* 数据比较了 用低保真 RANS、高保真 LES
* PDE-FM-2511.21861 PDE 基础模型，TheWell 预训练，PDE 泛化通过逐个训针对性输入层
	* "Towards a Foundation Model for Partial Differential Equations Across Physics Domains"
		* Soares, Eduardo; Brazil, Emilio Vital; Shirasuna, Victor; de Carvalho, Breno W. S. R.; Malossi, Cristiano; 
		> created on 2026-01-14
	* eqn(1)-1 dataset-specific 1x1 adapters, 输出 shared latent channel budget；{_q1ec4k}
* XNN-2510.13665 PDE 基础模型支持不同维数联训方案，卷积、池化、注意力均遍历所有轴置换
	* "Axial Neural Networks for Dimension-Free Foundation Models"
		* Kim, Hyunsu; Park, Jonggeon; Bruna, Joan; Yang, Hongseok; Lee, Juho; 
		> created on 2025-11-17
	* fig1,2 遍历坐标轴置换的操作，lifting 每次选一轴作汇总中心，注意力类似
	* sec3.1 set-based，eqn(12) 求和遍历所有轴，每轴轮换、对末轴操作、反轮换
		* 包括 Conv1D+Pool，注意力；{_pbha90}
		* eqn(13) Conv2D 也可用，每次选两轴
	* sec3.2 graph-based
		* eqn(15) 对坐标轴有类似 DeepSet 的操作
	* sec5.2 实验，基于 MPP 修改得 X-MPP，另有（仿 MPP 所用基线）X-CViT
		* 数据集：PDEBench，PDEArena
		* 1D 处理：p9:-1 zero-padding（> 为啥不是 repeat）
		* 跨维数迁移：p10:2 2D 预训练，1D、3D 微调；{_pbhb0l}
		* 各维数联合预训练 tbl2
* P3D-2509.10186 3D 细网格 NO，划多窗口独立编解码，隐空间全局混合各窗口信息
	* "P3D: Scalable Neural Surrogates for High-Resolution 3D Physics Simulations with Global Context", ICLR 2026
		* Holzschuh, Benjamin; Kohl, Georg; Redinger, Florian; Thuerey, Nils; 
		> created on 2025-10-20
	* 摘要摘录
		> 我们提出了一种可扩展的框架，用于学习高分辨率3D物理模拟的确定性和概率性神经替代物。
		> 我们介绍了一种针对3D物理模拟的混合CNNTransformer骨干架构，在速度和精度方面明显优于现有架构。
		> 我们提出的网络可以在模拟域的小块上进行预训练，可以将其融合以获得全局解决方案，
		> 可选地通过快速和可扩展的序列到序列模型进行引导，以包括长程依赖关系。
		> 这种设置允许训练大规模模型，减少高分辨率数据集的内存和计算要求。
		> 我们根据一系列基线方法评估了我们的骨干架构，目的是在3D中同时学习14种不同类型PDE的动态。
		> 我们演示了如何将我们的模型扩展到空间分辨率高达512^3的高分辨率各向同性湍流。
		> 最后，我们通过将其训练为扩散模型来展示我们的网络的多功能性，以生成不同雷诺数下高度湍流3D通道流的概率样本，准确捕捉潜在的流量统计数据。
	* （评）在((p8ag76))集合元素打包处理 框架下，目的为降注意力复杂度，打包结果暂时
	* fig2 编码器分二阶段，先 CNN tokenize，再 Transformer 逐窗口注意力
		* 解码器类似，窗口注意力后 CNN detokenize
		* sec3.1:2 3D tokenize 基于 CNN，因 3D patch 中格点数多、待编码信息密度大；{_pbf87s}
			> 完全基于变换器的架构在像素空间中适用于二维数据和图像，如ViTs，它依赖于将大小为p×p的补丁转换为令牌的patchification操作。
			> 3D中的相应方法将把大小为p3的补丁转换为单个令牌，显著增加了每个令牌中编码的信息量。
			> 为了平衡转换器的令牌数量和每个令牌的信息密度，我们通过卷积编码器学习局部特征，以获得优化的压缩表示。
			> 卷积编码器/解码器遵循现代UNet块的设计，使用自适应实例归一化和组归一化。
			* 注：暂不确定该观点可靠性
		* secA.2 CNN 架构，(全卷积、stride=2 卷积) 重复两次，最终分辨率降 4 倍；下采样有残差连接至解码器
			> 卷积编码器首先使用具有与配置的嵌入维度相对应的滤波器的Conv3D层（核大小3，填充1）嵌入输入。
			> 接下来是通过Conv3D层实现的下采样层（内核大小3，填充1，步长2）。
			> 每次下采样操作之前的中间状态都会被保存以用于剩余连接。
			> 编码器块和连续下采样被应用两次。
			> 对于每一层，相应的过滤器数量如表5所示。
			> 编码器块重复两次。
				* （评）推测这句是没注意到之前写过，重复写了一遍
			> 每个编码器块由GroupNormalization层组成，然后是GELU激活、Conv3D层（核大小3，填充1）、GroupNormalization、根据条件通过移位和缩放操作进行调制、GELU和一个额外的Conv3D层（核大小3，填充1）。
			> 每个编码器块的输入和输出通过跳过连接连接。
			> 通过线性层从卷积编码器/解码器的嵌入向量中学习移位和缩放向量。
		* sec3.1:-1 降注意力计算量：窗口注意力，窗口位置固定（消融中性能未降）
			> 为了计算标记之间的注意力得分，我们使用标记在同一窗口内的对数间隔相对位置。
			> 变换器编码器块的架构将Swin transformer[41]和扩散变换器[46，DiT]组合成3D变体。
			> 它与PDE-Transformer有相似之处[21]，但重要的变化是：（1）patchification被大型卷积编码器和解码器所取代，（2）我们删除了计算窗口注意力的窗口移位。
				* 注：本文作者同 PDE-Transformer 团队
			> 我们没有看到性能的明显下降，并决定优化以减少窗口的移动，从而提高计算效率。
	* fig3 整体架构，各窗口独立编解码、算注意力，中间隐空间层进行窗口间（长程）信息交互；{_pbf897}
		* sec3.2:1 二阶段训练，先学窗口内预测、再加窗口间交互：小 crop 预训练编解码器，扩展到大空间尺度后再引入隐层长程交互、全局上下文
			> P3D故意不使用任何绝对位置嵌入，也不进行全局聚合和分发信息的操作。
				> 因此，它必须依赖于学习感知场中的局部特征和动态。
				> 这促进了平移等价性，这是PDE替代建模的一个重要归纳偏差。
				* 注：“不使用绝对位置嵌入”仅指编解码阶段，后续长程信息交互仍有位置编码
			> 与此同时，全局信息和长期依赖关系往往对获得正确的解决方案起着至关重要的作用。
				> 我们学习大规模模拟的一般策略是在较小的模拟 crop 上预训练模型，然后将训练好的网络扩展到更大的输入。
				> 然而，这不允许对长程依赖关系进行建模。
			> 为了解决这一缺点，我们将U型架构的瓶颈层与序列模型联系起来。
		* sec3.2:2 长程信息交互联用两类 token：latent、region，算 6 层近线性的注意力
			* latent：对应空间尺寸 32³，初始化为 encoder 输出的压缩结果，带 ViT 频率式绝对位置编码
				> 令牌嵌入瓶颈层由令牌组成，令牌通过线性层嵌入到潜在令牌中。
				> P3D将大小为32^3的裁剪压缩成单个潜在令牌。
				> 然后，类似于[10]，将基于频率的位置嵌入向量添加到每个潜在令牌中。
				* （评）尺寸似乎小于编解码所用 window，这样看只对 window 内部做部分聚合，单个 window 内仍保留多个 latent token
			* region：对应预训练所用空间尺寸，初始化为可学嵌入，同样加绝对位置编码；{_pbff7h}
				* 注：sec3.4 举例所用的预训练尺寸 64³，sec4.2 实验 128³，故应比 latent 对应区域范围更大一些
				> 此外，我们将域划分为多个区域，并将区域的大小与P3D预训练的域裁剪的大小相匹配。
				> 对于每个区域，我们在潜在标记序列中包含一个相应的所谓区域标记，类似于ViTs中的分类标记。
					* （评）即相当于 ViT [CLS]
				> 每个区域标记都通过一个可学习的嵌入层进行初始化，我们添加了一个基于频率的位置嵌入向量。
				> 区域令牌的目的是作为解码器的更直接的反馈机制，我们将在下一段中对此进行描述。
				* fig4 caption 将 region token 称为 messenger token
			* 注意力用 HyperAttention（有引文，近似线性复杂度），共 6 层
				> 我们的实现使用n=6层超注意力[16]。
				> 图3提供了此设置的概述。
				> 原则上，可以使用任何有效的序列模型。
		* 解码器引入 latent、region token 信息方式不同：前者加进输入层、一次性，后者作调制、每层都引入；{_pbfc1j}
			> (sec3.2:2) 在处理完区域和潜在令牌序列后，通过跳过连接将潜在令牌添加到解码器的输入端。
			* sec3.2:3 各 region 的 decoder block 引入 scale+shift 调制，具体位置为 InstantNorm
			* 调制向量：MLP(region token 输出) + 其他全局调制（> 流匹配时间等）
		* fig4 第二阶段训练 编解码器参与微调，为降低 GPU 显存需求，每步训练可仅对部分窗口反传；{_pbff3o}
			* c 完整微调，所有窗口的编解码器都参与微调
			* d 随机选部分窗口的参与微调，编解码器的窗口选择独立
				* （评）不反传部分不仅不累积网络梯度，也不算激活值梯度
				* （评）编码器获取激活值梯度的路径：其他窗口解码器反传激活值梯度，再通过中间交互层传播到当前窗口
			* e 编码器不微调，仅解码器选随机窗口微调
				* （评）解码器引入了 region token 的额外输入，故必须微调；编码器架构无改变
	* sec3.3 预期使用方式，有监督、流匹配生成 均可，仅训练 loss 不同
	* sec4.1 实验，14 种不同 PDE 数据联训，数据集基于 APEBench；{_pbf88x}
		* （评）虽然文章没说是基础模型，但多样化数据集联合预训练应该符合基础模型的定义
		* sec4.1:1 从数据里随机截 crops；相应动力学非确定，因区域外影响未知
			* 因此 crop 扩大时预测精度提高
		* sec4.1:1 最大通道数 3，不够的数据集 zero-pad；PDE 类型与模拟超参对模型未知（不作为输入）
		* sec4.2 用于 John Hopkins 高分辨率湍流数据集（1024³ 网格 DNS 数据）
* FMT-2509.18611 多历史 PDE 基础模型，流匹配生成结合动力学步进，为支持多 PDE 据历史总结态做条件生成
	* "Flow marching for a generative PDE foundation model"
		* Chen, Zituo; Deng, Sili; 
		> created on 2025-10-19
	* 摘要摘录
		> 最近，在PDE控制的时空轨迹的大规模集合上进行的预训练显示出建立动力系统可推广模型的前景。
		> 然而，大多数现有的PDE基础模型依赖于确定性的Transformer架构，这在许多科学和工程应用中缺乏生成灵活性。
		> 我们提出了Flow Marching，这是一种将神经算子学习与由物理动态系统中误差累积分析驱动的流匹配联系起来的算法，并在此基础上构建了一个生成性PDE基础模型。
			> 通过联合采样相邻状态之间的噪声水平和物理时间步长，该模型学习了一个统一的速度场，将有噪声的当前状态传输到其干净的后续状态，减少了长期的部署漂移，同时实现了不确定性感知的集成生成。
			> 除了这个核心算法，我们还引入了一个物理预训练变分自编码器（P2VAE），将物理状态嵌入到一个紧凑的潜在空间中，
			> 以及一个高效的流行进变换器（FMT），它将扩散强迫方案与潜在的时间金字塔相结合，实现了比全长视频扩散模型高15倍的计算效率，从而能够以大幅降低的成本进行大规模预训练。
		> 我们在12个不同的PDE家族中整理了约250万条轨迹，并在多个尺度上训练了P2VAE和FMT套件。
		> 在下游评估中，我们对看不见的柯尔莫哥洛夫湍流进行了基准测试，进行少样本微调，证明了确定性对应物的长期部署稳定性，并呈现了不确定性分层集成结果，强调了生成PDE基础模型在实际应用中的重要性。
	* fig1 eqn(6) flow-marching，k=0 为普通流匹配，k=1 为相邻时间步线性插值
	* sec3.3 多动力学联合学习：历史步总结为隐向量 h；{_pajf4p}
		* eqn(11) 时间推进：条件生成，h 作为条件
		* eqn(12) h 更新：轻量级 RNN，新输入包括 新生成的时间步、当前时间
			* （评）公式中 h 更新有随机性（普通 RNN 不应有）；未 check 引文 diffusion forcing
			* sec3.4 训练时固定输入 4 个历史时间步
	* sec3.4 提高计算效率：
		* 1. 在隐空间计算，基于 P2VAE 编解码
		* 2. PFM temporal pyramids，由系统 Markov 性，弱化远期历史时间步，通过对隐状态下采样；{_pajf6p}
			* 训练时固定输入 4 个历史时间步，下采样程度依次 8,4,2,1
	* sec3.5 推理时 UQ：隔离 aleatoric 不确定性（> 预测本身？）、IC 不确定性，后者通过调整 k；{_pajf6c}
	* sec4.1:1 数据集：FNO，PDEBench，PDEArena，TheWell
* SPUS-2510.01370 相对轻量级 U-Net 输入单历史步，单方程多 IC 预训练后微调到下游方程，称为基础模型
	* "SPUS: A Lightweight and Parameter-Efficient Foundation Model for PDEs" by Los Alamos National Laboratory
		* Siddik, Abu Bucker; Oyen, Diane; Most, Alexander; Kucer, Michal; Biswas, Ayan; 
		> created on 2025-10-19
	* 摘要摘录
		> 小型偏微分方程U-Net求解器（SPUS），这是一种紧凑高效的基础模型（FM），被设计为求解各种偏微分方程（PDE）的统一神经算子。
		> 与现有的最先进的PDE FM（主要基于具有高计算和参数开销的大型复杂变压器架构）不同，SPUS利用了一种轻量级的基于剩余U-Net的架构，该架构在该领域作为基础模型架构的探索程度很低。
		> 为了在这个极简主义框架中实现有效的学习，我们利用了一种简单而强大的自回归预训练策略，该策略紧密复制了数值求解器的行为来学习底层物理。
		> SPUS在一组不同的流体动力学PDE上进行了预训练，并在跨越各种物理系统的6个具有挑战性的看不见的下游PDE中进行了评估。
		> 实验结果表明，使用基于残差U-Net架构的SPUS在这些下游任务上实现了最先进的泛化，同时需要更少的参数和最少的微调数据，突显了其作为解决各种PDE系统的高参数效率FM的潜力。
	* eqn(2) 直接假定是 Markov 系统，方程固定？（实验预训练确实都是可压 Euler 方程）
	* fig1 训练阶段，单步预测预训练，单步预测微调，rollout 微调
* GPhyT-2509.13805 多历史 PDE 基础模型，输入增广引入时空导数信息，完整时空注意力处理，NeuralODE 输出
	* "Towards a Physics Foundation Model"
		* Wiesner, Florian; Wessling, Matthias; Baek, Stephen; 
		> created on 2025-10-18
	* 摘要摘录
		> 我们展示了普通物理变换器（GPhy T），它基于1.8 TB的各种模拟数据进行训练，证明了物理学可以实现基础模型能力。
		> 我们的关键见解是，变压器可以学习从上下文中推断出控制动力学，使单个模型能够模拟流固相互作用、冲击波、热对流和多相动力学，而无需告知底层方程。
		> GPhy T实现了三个关键突破：（1）跨多个物理领域的卓越性能，比专门的体系结构高出29倍；（2）通过上下文学习对完全看不见的物理系统进行零样本泛化；（3）通过50时间步的推出进行稳定的长期预测。
	* sec3.1 用完整时空注意力；不用计算少的轴向注意力是为保证最大表达力，捕捉复杂、不可分解的物理机制
	* sec3.1:2 输出为时间导数，用数值 ODE 预测下一时间步（相当于 NeuralODE）
		* 用前向 Euler；消融实验中 RK4 等无明显精度增益；{_pak822}
	* sec3.1:3 输入用时空导数（中心差分）增广
	* （评）未仔细确认输入时间步数是否固定，fig1 写的是 4 步；{_paim5g}
	* sec3.2 数据来源：TheWell + 自造数据，后者引入了复杂区域形状和边界
	* sec6.1 本文只用 2D 数据，尽管架构支持 3D，因数据少、完整注意力计算开销大
		* 空间分辨率目前固定为 256×128
* MORPH-2509.21670 自回归 PDE 基础模型，支持多步历史输入但按单步预训练后微调方式，支持不同分辨率、1-3D，隐空间合并多变量信息以支持可变变量数
	* "MORPH: Shape-agnostic PDE Foundation Models" by Los Alamos National Laboratory
		* Rautela, Mahindra Singh; Most, Alexander; Mansingh, Siddharth; Love, Bradley C.; Biswas, Ayan; Oyen, Diane; Lawrence, Earl; 
		> created on 2025-10-18
	* 摘要摘录
		> 我们介绍MORPH，一个形状不可知的偏微分方程（PDE）自回归基础模型。
		> MORPH建立在卷积视觉变换器骨干上，可以无缝处理不同分辨率、具有混合标量和矢量分量的多个场的不同数据维度（1D-3D）的异构时空数据集。
		> 该架构结合了
			> （i）分量卷积，它联合处理标量和矢量通道以捕获局部交互，
			> （ii）场间交叉注意力，它在不同物理场之间建模和选择性地传播信息，
			> （iii）轴向注意力，它沿着单个空间和时间轴分解完整的时空自注意力，以减少计算负担，同时保持表现力。
		> 我们在各种异构PDE数据集上预训练多个模型变体，并评估向一系列下游预测任务的转移。
		> 使用全模型微调和参数有效的低秩适配器（LoRA），MORPH在零样本和全射泛化方面都优于从头开始训练的模型。
	* fig1 整体架构
		* fig1a 输入编码：各输入变量过 conv3d
			* 注：速度等多分量场视为一整个变量，参考 tbl1 各数据集 shape 描述
		* fig1b 变量信息合并，打 patch 后交叉注意力合并各变量，得隐空间的单变量 patches；{_pain6j}
		* fig1c 4D 时空轴向注意力（由 b 无需再引入通道注意力）
		* fig1d 解码到原变量，unpatchify
	* sec4.1 数据集：PDEBench，PDEgym，TheWell；1-3D 联合使用
		* p5:-1 数据加载：各数据集 DataLoader 独立；DistributedDataParallel 没法直接用，自己实现了多 worker,rank 的 sharding 操作
	* p7:2 计算资源，M（126M）、L（480M）模型用 2 节点，每节点 8 块 H100
	* p7:2 基线模型 MPP，DPOT，Poseidon；另有 FNO，U-Net
	* p7:3 自回归历史长度：架构支持固定历史时间步数、可变历史步数
		* 本文尊重初值问题设定，仅输入一步预测下一步；{_pain68}
		* sec4.3:-1 对 DPOT，MPP 按同样单步输入方式微调（根据 p7:3 是微调而非从头重训）
* MATEY-2412.20601 多历史步输入 PDE 基础模型，ViT patch-size 自适应加密，根据 patch 内方差；随物理场时间推进动态改加密位置
	* "MATEY: multiscale adaptive foundation models for spatiotemporal physical systems"
		* Zhang, Pei; Laiu, M. Paul; Norman, Matthew; Stefanski, Doug; Gounley, John; 
		> created on 2026-01-18
	* 摘要摘录
		> 使用视觉变换器（ViT）架构准确表示时空物理系统中的多尺度特征需要极长且计算量极大的令牌序列。
		> 为解决这一问题，我们提出了两种自适应分词方案，基于局部特征动态调整补丁大小：一种确保行为趋同于均匀的斑块细化，另一种提供更好的计算效率。
		> 此外，我们提出了一组时空注意力方案，其中时间或轴空间维度被解耦，并评估其计算和数据效率。
		> 我们通过一系列实验评估了提出的多尺度自适应模型 MATEY 的性能。
		> 结果表明，自适应分词方案在不显著增加令牌序列长度的情况下，实现了更高的准确性。
		> 与完全时空注意力方案或仅解耦时间维度的方案相比，我们发现完全解耦的轴向注意力效率和表现力较低，需要更多训练时间和模型权重才能达到相同准确性。
		> 最后，我们在两个具有不同物理特性的微调任务中证明，基于 PDEBench 数据预训练的模型优于从零训练的模型，尤其是在低数据且注意力冻结的环境中。
	* sec3:0 模型输入多历史步（最后到 $u_t$）、向前推进步长 $\delta t$，输出 $u_{t+\delta t}$
		* （评）历史步的时间间隔固定，但预测推进的时间步长可变；{_q1if95}
	* fig1 预训练-微调范式，预训练 PDEBench INS、CNS、ReacDiff2D、SWE（变量个数不同）
		* 微调 热对流碰撞 2D，冷热气泡碰撞，引文 Norman 2020；{_q1ia34}
		* 微调 液态金属 MHD，方腔流，引文 Fambri 2023；{_q1ia3c}
	* 注：SViT 即 ViViT；进一步分离 xy 轴即得到 AViT
	* 自适应加密
		* 小 patch 还会引入“area bias”嵌入？
		* eqn(3)-1 patchify 用 CNN 块；eqn(5)-1 各尺度有专门的 ConvTranspose decoder
		* 加密依据：patch 内方差；先求所有 patch 中方差最大值，其 $\gamma\in[0,1]$ 倍作为加细阈值 eqn(4)；{_q1ij4n}
			* 阈值临界值：$=0$ 完全加细，$=1$ 完全不加细
		* 多分辨率组合方式 1，multi-resolution，同一位置保留 原 patch、细分后子 patch，两种分辨率 patch 独立过注意力块
			* （评）似乎只有两种 patch 尺寸，原分辨率和 STS？
			* 解码方式：各分辨率分别解码，结果相加 eqn(5)-1
		* 多分辨率组合方式 2，mixed-resolution，同一位置只保留细分后子 patch，放入一个序列，统一算注意力
			* batch 中不同样本加细 patch 数不同，需在序列中补充 pad tokens
		* 方式比较 eqn(9)+1：mul 实现简单、代码修改小、支持 AViT、序列长度不增
			* Mix 序列变长，不支持 AViT，但更能捕捉跨尺度相关性
* Walrus-2511.15684 基于多历史步输入的 PDE 基础模型
	* "Walrus: A Cross-Domain Foundation Model for Continuum Dynamics"
		* McCabe, Michael; Mukhopadhyay, Payel; Marwah, Tanya; Blancard, Bruno Regaldo-Saint; Rozet, Francois; Diaconu, Cristiana; Meyer, Lucas; Wong, Kaze W. K.; Sotoudeh, Hadi; Bietti, Alberto; Espejo, Irina; Fear, Rio; Golkar, Siavash; Hehir, Tom; Hirashima, Keiya; Krawezik, Geraud; Lanusse, Francois; Morel, Rudy; Ohana, Ruben; Parker, Liam; Pettee, Mariel; Shen, Jeff; Cho, Kyunghyun; Cranmer, Miles; Ho, Shirley; 
		* 一作也是 MPP，TheWell 作者
		> created on 2026-01-15
	* 摘要摘录
		> 数据异质性和不稳定的长期动力学阻碍了从足够多样化的动态中学习，而不同分辨率和维度则挑战了现代硬件上的高效训练。
		> 通过实证和理论分析，我们引入了新的方法来缓解这些障碍，包括基于谐和分析的稳定方法、负载均衡的分布式二维和三维训练策略，以及计算自适应分词。
		> 利用这些工具，我们开发了 Walrus，这是一种基于变压器的基础模型，主要用于流体类连续介质动力学。
		> Walrus 接受了十九种涵盖天体物理、地球科学、流变学、等离子体物理、声学和经典流体的多样场景的预先培训。
		> 实验显示，Walrus 在下游任务的短期和长期预测视野以及广泛的预训练数据中都优于以往的基础模型，而消融研究则证实了我们在预测稳定性、训练吞吐量和传输性能方面的贡献相较于传统方法的价值。
		> 代码和权重会发布供社区使用。
	* fig1 整体架构，计算单步时间推进
		* 注意力块（重复 L 层），时空分解（同前序 MPP）
			* 时间因果注意力
			* 空间并行注意力
				* 用 RoPE；（评）可行前提或为 对非周期 BC 引入了 可学 padding；PDEformer 新架构无此 padding，因此纯 RoPE 无法充分体现边界位置信息，不如 APE
		* tokenize 用了 CSM 以支持 可变降采样级别（涉及可学边界 padding）sec3.1:2
			* 预训练数据集分辨率不同，相应用不同 stride 使同维数数据的总 token 数大致相同
			* 用 hMLP（> 多次线性小核卷积层复合，而非单次大核卷积）
				* （评）hMLP 可参考 [知乎](https://zhuanlan.zhihu.com/p/488574791)
		* 编解码器有 2D、3D 两版本 sec3.1:3
		* PreLN 用 RMSGroupNorm；QKNorm 用 LayerNorm sec3.1:4
		* sec3.1:5 输入场幅值归一化，除以整个历史轨迹的 RMS；输出逆归一化，乘的是历史轨迹中更新量的 RMS（与输入非对称）{_q1m87i}
	* sec3.2 基于谐波分析的稳定化方法（Patch Jittering）：显著降低自回归长期预测的不稳定
		> （知乎）可以采用随机化的方式来解决：对输入进行随机平移（translation jitter），并在输出中逆平移回来。{_q1mc95}
		> 总结，Patch Jitter 不需要额外网络、不增加算力，它通过数学性质让：
		> 高频混叠的误差 → 变成随机噪声 → 被平均稀释 → 预测更稳定
			> jitter 本质上是把图像往上／下／左／右平移几个像素；
			> 对于卷积而言，小范围的平移不会改变＂统计意义上的特征提取＂；
			> 所以 jitter 的最大平移范围不需要超过＂有效卷积核尺寸＂。
		> 通过不断随机 roll（周期边界）或 roll+padding（非周期边界），让模型：看到偏左一点的 patch；看到偏右一点的 patch；看到偏上偏下的 patch；
		> 最终模型学会：无论切 patch 的起点在哪里，我都能正确预测 → 提升平移鲁棒性
	* sec4:1 训练使用激进的数据增强
		> 避免对特定数据源的特殊性进行过拟合至关重要。
		> 我们通过激进的多样性增强策略设计Walrus的训练方案，以最大化训练过程中的异质性水平。
		> 该方案需要精密的分布策略来维持训练期间的高硬件利用率。
		> 在微调阶段，我们保留了放宽部分限制的能力以提升对下游任务的适应性，具体讨论详见附录B.2.1。
	* fig3 2D、3D 联训，2D 额外维度网格量设为 1，多余变量（如 z 速度）置 0，sec4.1:1；{_q1na6z}
		* （评）RoPE 也是直接用的 3D 的？
		* 2D 数据增强：旋转、反射，随机朝向嵌入 3D；注意速度场需使用相同群变换 sec4.1:2；{_q1nb7i}
		* 时间步长随机选（类似 VICON），1-5 间均匀采样 sec4.1:3；{_q1nb7y}
	* 并行训练用 PyTorch FSDP（> fully-sharded data parallel）sec4.2:2
		* 2D token 数 32²，3D 16³ p7:2
		* 2D bsz ×2，T ×2，以对齐 3D 总 token 数，因主要计算成本在线性投影层；{_q1nc16}
		* batch 内多样性、负载均衡性的折衷
			> 理想情况下，我们希望每个 GPU 能够独立采样数据集，以最大化批量多样性，然而，这些成本差异可能导致显著的无谓损失。
			> 作为折中，我们采用了为 HSDP 设计的抽样策略（Zhao 等，2023），即分片组内的所有排名都必须从同一数据集中每一步抽样。
			> 然而，每组独立采样，因此整个批次包含许多数据集。
			> 结合 McCabe 等人（2023a）中使用的梯度累积作为随机负载均衡技巧，我们得到一个系统，
			> 使 AllGather 作成为瓶颈的节点组被迫采样相同分辨率和维度的数据，而通过在参数更新前对 AllReduce 作间的多个微批次平均，
			> 从而降低了整体每步时间的方差，平衡了采样多样性与计算性能。
			> 我们可以在图 4 中看到这些变化的迭代影响。
			> 在给定的抽样方案下，这些综合变化使吞吐量比单纯使用 FSDP 提高了 262%。
	* 预训练数据 TheWell、FlowBench 混合，PDEBench 等用于微调
		> The Well 含有多种由现实科学问题产生的高分辨率数据，而 FlowBench 则在标准流体场景中引入了几何上复杂的障碍物。
		> 总体来说，这些数据一共包含 19 个数据集，涵盖 63 个状态变量，这些变量是基于多种不同的方程、边界条件和物理参数设置所模拟得到的。
		> 一个重要的点是：我们在预训练中同时使用了 2D 数据和 3D 数据。
		> 为了验证迁移性能，我们在若干 预留出来的（held out）数据集 上进行微调，这些数据集来自 The Well、FlowBench、PDEBench、PDEArena以及 PDEGym。
	* 预训练超参数
		* 历史长度 T=16
			> 为实现公平比较，我们规定：所有预测轨迹都从 T=17 开始，这样可以与那些使用与 MPP 预训练时相同“上下文长度”（context length）的模型进行公平对比——也就是使用 16 个时间步的上下文长度。
		> 预训练总步数约 400,000。
		> mini-batch 设定：2D：micro-batch size = 192，3D：micro-batch size = 96
	* HalfWalrus 预训练仅 2D，有向 3D 泛化能力但十分有限；{_q1nc1f}
		> （知乎）尽管 HalfWalrus 从未见过 3D 数据，但在极少的数据样本下，它仍然能比从头训练的模型表现更好。
		> 不过，这种提升幅度并不大，同时也可以看出：预训练覆盖不够广（这里指不包含 3D 数据）实际上会成为模型的一种阻碍。
	* 相关：[知乎介绍](https://zhuanlan.zhihu.com/p/1977782353939174124)
* （备用）太阳活动预测基础模型，长期、跨通道，下游任务有 耀斑分类、风速回归、活动区分割、光谱预测……
	* [2025-08-23](https://mp.weixin.qq.com/s/Kn5OIhCjESEcBHwD037Tkg)
	> （标题）NASA、IBM打造日地物理学首个开放式 AI 基础模型，用九年观测训练提升约16%耀斑预测准确率
	> 现在，NASA 把 AI 「基础模型（foundation model）」的范式搬到日地物理：用统一大模型吸收长期、多通道的太阳观测，做生成式预测，再按需微调到具体下游科学任务上，目标很明确——更快、更准、可复用、可开放。
	> 它采用太阳动力学观测台（SDO）的近 9 年高分辨率多仪器数据进行预训练，并对未来太阳活动进行生成式视觉预测，最长可滚动到小时级乃至更长时间窗，在多个下游任务上达到或超过当前最好水平。
	* 开源
		> 它不仅开放在 Hugging Face（权重+预处理+示例），代码也同步托管到 GitHub，方便学界与产业界快速复用与微调。
	> 和一次一做的「单任务模型」不同，Surya 把长期、跨通道的太阳观测转化为一个可泛化的表征底座，再把下游任务（耀斑分类、风速回归、活动区分割、光谱预测……）当成「轻量微调」的应用层。
		> 这种「先学通用物理表征、再做专科任务」的路线，是把地球科学里的基础模型经验移植到日地物理的标志性进展。
* PhysiX-2506.17774 PDE 自回归基础模型，从 NVIDIA 开源视频生成模型参数启动，用 TheWell 继续预训练
	* "PhysiX: A Foundation Model for Physics Simulations"
		* Nguyen, Tung; Koneru, Arsh; Li, Shufan; Grover, Aditya; 
		> created on 2025-08-15
	* 摘要摘录
		* 训物理基础模型的挑战：数据有限，数据集差异大
			> 一个主要的瓶颈是数据稀缺：虽然互联网上有数百万张图像、视频和文本资源，但最大的物理模拟数据集只包含数万个样本。
			> 这种数据限制阻碍了大型模型的使用，因为过拟合成为一个主要问题。
			> 因此，物理应用通常依赖于小型模型，由于对上下文的理解有限，这些模型难以进行长期预测。
			> 此外，与通常表现出固定粒度的图像、视频或文本不同，物理数据集的规模往往差异很大，这加大了扩大多任务训练的挑战。
		> 我们介绍了PhysiX，这是第一个用于物理模拟的大规模基础模型。
		> 4.5B参数，自回归生成模型。
			> 它使用离散标记器将不同尺度的物理过程编码为离散标记序列，并采用自回归下一个标记预测目标在标记空间中对这些过程进行建模。
		* 细化模块，减轻离散误差；{_p8ff8j}
			> 为了减轻离散化过程中的舍入误差，PhysiX集成了一个专门的细化模块。
		* TheWell 数据集上表现最好
			> 通过广泛的实验，我们表明PhysiX有效地解决了数据瓶颈问题，在可比的设置下优于特定任务的基线，以及之前在the well基准测试上的绝对最先进的方法。
		* 涉及从自然视频的知识迁移？（多任务联合训有协同效应是已知的）
			> 我们的结果表明，从自然视频中学到的知识可以成功地转移到物理模拟中，
			> 跨不同模拟任务的联合训练可以实现协同学习。
		> 代码可在以下网址获得https://github.com/ArshKA/PhysiX
	* fig5 基线模型：ConvNeXt-UNet，TFNO
	* tbl1 用 TheWell 预训练，各数据集精度
	* 基于 NVIDIA Cosmos 4.5B ckpt 开始训 sec3.2:-1；{_p8ff85}
		> 我们从4.5B参数的Cosmos检查点（NVIDI/C OSMOS-1.0-autoregressive-4B）初始化自回归模型，使其能够继承从大规模自然视频数据集中学习到的强时空先验。
		> 与标记器训练类似，我们对较小的数据集进行过采样，以匹配最大数据集的大小。
* PDE-Transformer-2505.24717 自回归基础模型，modulation 含方程类型，各分量独立 tokenize+调制
	* "PDE-Transformer: Efficient and Versatile Transformers for Physics Simulations", ICML2025
		* Holzschuh, Benjamin; Liu, Qiang; Kohl, Georg; Thuerey, Nils; 
		> created on 2025-07-03
	* fig2 网络架构，整体有类似 U-Net 的尺度升降、同尺度跨层连接
		* condition 通过 modulation 引入，方式类似 DiT AdaLN
		* 每层两次注意力，先 SWin 滑窗注意力（且局限于同一物理量），再算物理量间注意力（局限于相同空间位置）
			> （p4:r2）我们建议用通道的数量来缩放计算，并保持每个令牌的扩展率与通道的数量无关。
			> 我们通过独立嵌入每个通道，并在每个块中通过额外的通道轴向MHSA操作实现不同通道令牌之间的交互来实现这一点。
			> 窗口式自我关注不是在不同通道的令牌之间计算的。
			> 这种变体在下面被称为单独通道（SC），我们在第4节中详细评估了预训练数据集和微调时的两种变体。
		* sec3.1 结合类似 U-Net 的上下采样结构（有多变种，与先前方法有区别）
			> U形架构的层次结构类似于自然界中特征的多尺度性质，并增加了强烈的归纳偏见。
			> 一些作品（Bao等人，2023；Hoogeboom等人，2023，Tian等人，2024）将U形架构与变压器骨干架构相结合。
			> 我们通过PixelShuffle和PixelUnshuffle层在每个变压器阶段结束时引入向下和向上采样令牌。
			> 与Bao等人（2023）和Hoogeboom等人（2023年）相比，我们依靠自适应层归一化进行调节。
			> Tian等人（2024）也采用了U形设计，但它与自我关注操作的查询键值元组上的令牌下采样相结合。
			> 我们发现，这略微提高了性能，但由于加速器利用率欠佳，以增加训练和推理时间为代价。
			> 因此，我们没有在PDE数据的自我关注操作中对令牌进行降采样
	* sec3.0:2 自回归，输入多时间步输出下一步
		* 变种：生成模型（无输入时间步），时间插值（输入前后相邻时间步）
	* sec3.2 确定性输出（有监督）、随机分布（流匹配生成）均可
		> PDE变换器既可以以监督方式进行训练，也可以作为扩散模型进行训练。
		* 确定性输出：可快速推理，MSE loss 训
			> 对于具有确定性解决方案的任务，例如在训练确定性求解器的代理时，可以使用具有MSE的PDE Transformer的监督训练，这允许在一步中快速推理。
		* 非确定输出：从后验分布采样；流匹配，基于扩散
			> 扩散训练如果解不是确定性的，那么扩散训练更可取，因为它能够从完整的后验分布中采样，而不是学习平均解。
			> 我们采用扩散模型的流匹配进行训练。
	* p4:r-1 方程、分量类型作为条件输入：DiT AdaLN-Zero，条件包括 PDE 类型、变量类型、扩散时间
		> DiTs使用类标签和扩散时间作为条件。
		> 在将PDE Transformer训练为扩散模型时，我们还将扩散时间作为条件。
		> 类标签对应于我们设置中的PDE类型。{_p85f16}
		> 此外，对于SC版本中的每个物理通道，我们使用通道类型的标签嵌入（例如密度、涡度）。{_p85f0t}
		> 所有标签都使用概率为10%的dropout，因此我们的模型既可以用于条件设置，也可以用于无条件设置。
		> 将此条件扩展到其他模拟参数是简单的。
	* p5:l1 BC 仅区分是否周期，通过 SWin 的注意力掩码实现；{_p85f1z}
	* p5:l2 训练细节
		> 用RMSNorm对自注意操作的Q和K进行归一化
		> 学习率从1.0·10−4更改为4.0·10−5，
		> （权重衰减）按照Esser等人（2024）的建议，使用少量权重衰减（系数为10−15）的AdamW优化器；{_p85f39}
		> （混精）进行bf16混合精度训练。
		> （梯度裁剪）此外，我们发现基于梯度指数移动平均（EMA）的梯度裁剪可以防止损失曲线中的任何剩余尖峰，并确保稳定的训练。{_p85f2t}
		> 培训方法的更多细节见附录A。
* DD-FEM-2505.22904 给出 PDE 基础模型定义，并提出局部基底可学的 FEM 作为基础模型
	* "Defining Foundation Models for Computational Science: A Call for Clarity and Rigor"
		* Choi, Youngsoo; Cheung, Siu Wun; Kim, Youngkyu; Tsai, Ping-Hsuan; Diaz, Alejandro N.; Zanardi, Ivan; Chung, Seung Whan; Copeland, Dylan Matthew; Kendrick, Coleman; Anderson, William; Iliescu, Traian; Heinkenschloss, Matthias; 
		> created on 2025-07-03
	> sec2.2 定义：计算科学中的基础模型计算科学的基础模型是
		> 在广泛分布的科学应用类型或物理系统上训练的数据驱动模型，
		> 它在科学问题、计算领域、任务和物理条件上表现出广泛的泛化能力，
		> 而不需要从头开始重新训练或结构修改，
		> 并且可以作为可重用的基础。
	* p8 方法优势
		> 数据驱动的基提供了针对训练数据量身定制的紧凑而富有表现力的表示，比通用多项式基更有效地捕捉复杂的局部行为。{_p73f2i}
			> 因此，DD-FEM支持在不牺牲精度的情况下使用更大的元素，允许在给定的计算预算内解决更大的问题。
			> 此外，与传统有限元法相比，增加的单元尺寸有助于提高数值稳定性，允许更大的时间步长，并实现更长的模拟范围。
		> 然而，在基础模型开发的背景下，DD-FEM框架最重要的优势之一是它能够将数据生成与全局域的规模解耦。
			> 由于其基函数是在本地定义的，因此可以从小型、计算成本低廉的子域模拟中生成训练数据。
			> 这种模块化设计能够跨各种PDE类高效构建大型、多样化的数据集，而无需解决大规模问题。
			> 这些紧凑的数据集可以被提炼成表达性强、数据驱动的基函数，这些基函数可以在广泛的物理系统中推广。
		> 通过这样做，DD-FEM通过大幅减少数据点大小，直接解决了第3节中概述的海量数据点大小的挑战。
			> DD-FEM框架还满足第2.2节的关键标准，包括数据驱动的学习和广泛分布的科学应用类型的培训。
			> 一旦对小规模问题进行了预训练，就可以组装数据驱动的元素来解决具有不同几何形状、材料、边界条件或初始状态的任意大型系统，而不需要从头开始重新训练，前提是可以从预训练的元素构建全局域。
		> 这种能力进一步符合计算科学中基础模型的核心定义，如第2.2节所述。
		> 这意味着第2.3节中提到的在空间和时间上的稳健外推。
		> 此外，DD-FEM框架通过数值求解基础物理学的控制方程来促进科学一致性，就像FEM一样，满足第2.3节中讨论的关键标准，并提高信任度、可解释性和科学有效性（见第3节）。
	* sec5.3.1 DD-FEM 指代一种框架，而非特定的方法
	* fig6 基底函数的三种表达方式：
		* 参化流形（输入隐向量、输出网格上函数值）
		* 符号表达式，输入坐标输出基函数在该点的值
		* INR 或 NO，输入坐标输出基函数在该点的值
	* fig7 认为 NLP 中句子由 token 组成，类似于 DD-FEM 中区域由小区域组成
* UPS-2403.07187 预训练 LLM 微调得 NO 基础模型，输入物理场编码为 l token，先将其输出分布与 LLM 对齐
	* "UPS: Efficiently Building Foundation Models for PDE Solving via Cross-Modal Adaptation", TMLR2024
		* Shen, Junhong; Marwah, Tanya; Talwalkar, Ameet; 
		> created on 2025-01-04
	* sec3.1:-2 多分量处理：预设分量全集，本文为 $\rho,u,v,p$，分量数 $N=4$；{_p15a19}
	* sec3.2 时间推进网络架构，concat 场信息（物理场过编码器）与方程形式信息（文本），过 LLM 后解码
		* sec3.2:3 FNO 嵌入模块结构，输入 $n^d$ 空间网格，每点 N 分量；变换为 l 个嵌入 token，每个维数 e
			* FNO 输入 N 通道输出 l 通道
			* 空间网格点数 $n^d$ 线性变换（通过 1x1 卷积实现）压缩为 e 维
			* sec5.3 超参数 ablation
		* sec3.2:4 concat 场信息（FNO 物理场嵌入模块给出）、方程形式信息；{_p15a30}
			* 方程形式信息包括：PDE 名称、标量系数取值；{_p15a2c}
		* sec3.2:-2 基于预训练后的 LLM，效果好于从头训，尽管预训练过程没见过数值模态
			* sec3.2:-3 物理场空间无顺序，故注意力不加因果结构
		* sec3.2:-1 预测下一时间步：1. 过 LLM，2. 所有 token 取平均得单个 e 维嵌入，3. 过线性层得 $Nn^d$ 维输出，reshape 得物理场
	* sec4 二阶段训练，预测 loss 为 nRMSE
		* stage1 loss 分布匹配 + 预测，更新部分为 物理场编、解码器；不涉及 LLM
		* stage2 loss 仅预测，接入 LLM、更新所有网络参数
		* 解码器输入有差异：stage 1 场、方程形式信息的 concat 直接输入解码器，stage2 经 LLM 处理后才输入解码器
	* sec4 分布匹配：训物理场编码器使其输出分布与 LLM 输入匹配；必要性源于 LLM 没见过数值模态
		* 必要性：有引文说明“直接微调非文本输入上的预训练LLM可能会导致次优性能”
		* 方法：先前文献的 ORCA，“以实现跨模态自适应”；所用的参考文本数据集 CoNLL-2003 与之相同；{_p15a4e}
			> 给定一个随机初始化的嵌入网络，我们首先对其进行预训练，以最小化嵌入网络的输出（在我们的例子中为hmix）与外部参考NLP数据集的文本嵌入之间的分布距离，我们将其表示为hLM。
			> 这个过程使跨模态分布类似于LLM预训练的文本分布。
		* loss：MMD（maximum mean discrepancy），不同于原 ORCA 的最优传输距离，因物理场分布连续而非离散；{_p15a5h}
			* （评）看公式 eqn(2) 是概率密度函数的 L2 距离（我没理解是哪种意义下的 L2），似乎是经推导可改写为期望形式，只需通过采样估计，无需获取概率密度实际取值
	* 实验，sec5.1 零样本超过专用 NO，sec5.2 向新 PDE 类型/方程系数 零样本/少样本泛化
		* tbl1 baseline：专用模型 FNO，GNOT，OFormer，U-Net，ORCA，通用模型 unified FNO（？）、MPP、DPOT
		* tbl2 微调样本量 0, 10, 100, 9k；类型包括没见过的 PDE 形式、没见过的 PDE 系数；tbl3 没见过的网格分辨率
* 2409.12293 线性 PDE 使用上下文学习的理论、实验研究，包括预训练任务多样性定义、OoD 任务推理能力
	* "Provable In-Context Learning of Linear Systems and Linear Elliptic PDEs with Transformers"
		* Cole, Frank; Lu, Yulong; O&#39; Neill, Riley; Zhang, Tianhao; 
		> created on 2024-11-16
	* 摘要摘录：标度律（网格规模、训练任务量、上下文长度），OoD（系数、源项分布变化）可通过增加推理提示长度处理
		> 这项工作对应用于与线性椭圆PDE家族相关的解算子的基于变换器的ICL进行了严格的误差分析。
		> 我们首先证明了由线性自关注层定义的线性变换器可以在上下文中可证明地学习，以反转PDE空间离散化产生的线性系统。
			> 这是通过推导所提出的线性变换器在空间离散化大小、训练任务数量以及训练和推理过程中使用的提示长度方面的预测风险的理论标度律来实现的。
			> 这些缩放定律还使我们能够为学习PDE解建立定量误差界限。
		> 此外，我们量化了预训练变换器对下游PDE任务的适应性，这些任务在任务（由PDE系数表示）和输入协变量（由源项表示）中都经历了分布变化。
			> 为了分析任务分布的变化，我们引入了任务多样性的新概念，并假设预训练任务具有足够的多样性，根据任务变化的幅度来表征变换器的预测误差。
			> 我们的结果表明，通过增加下游任务中的提示长度可以减轻任务转移错误，这证明了预训练基础模型的价值和力量。{_obgf7g}
			> 我们还创造了足够的条件来确保任务的多样性。
		> 最后，我们通过广泛的数值实验验证了变压器的ICL能力。
	* contributions 摘录，各定理的结论概括
		> 我们形式化了一个框架，用于在上下文中学习线性椭圆偏微分方程的解算子。
		> 这是基于（1）将无限维PDE问题简化为求解PDE空间离散化产生的有限维线性系统的问题，以及（2）学习在上下文中反转有限维线性系我们采用由单个线性自关注层定义的变换器来处理线性系统的ICL，
		> 并根据离散化大小、预训练任务的数量以及预训练和下游任务中使用的提示长度，建立ICL的定量泛化误差界；见定理1。
		> 这个界进一步使我们能够证明学习偏微分方程解的H1误差界；参见定理2
		> 在定理3和定理7中，我们分别针对任务（由偏微分方程的系数表示）和数据协变量（由源项表示）的分布偏移，为预训练的变换器建立了一般预测误差界。
		> 在任务转移的背景下，我们引入了一个新的任务多样性概念，并表明，只要预训练任务分布足够多样化，即使下游任务经历了分布转移，预训练的变换器也可以证明是泛化的；参见定理4
		> 此外，我们提供了任务多样性条件成立的几个充分条件（见定理5），
		> 并构造了任务多样度不成立的简单例子（见定理6）
		> 我们通过大量的数值实验证明了线性变换器学习PDE解和相关线性系统的ICL能力。
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
* MODNO-2404.02892（备用）基于 MTL 实现 PDE 基础模型，不同 PDE 对应不同输出层基底函数
	* "MODNO: Multi Operator Learning With Distributed Neural Operators"
		* Zhang, Zecheng; 
		> created on 2024-09-11
	> （摘要）核心思想是使用每个运算符的专用数据独立学习其输出基函数，同时使用整个数据集集中学习所有运算符共享的输入函数编码。{_o9bg4t}
* `MPP-2310.02994` 试构建流体时间推进基础模型，输入若干时间步、预测下一时间步，在不同方程上训，架构基于 ViT
	* "Multiple Physics Pretraining for Physical Surrogate Models", NeurIPS2023-AI4Science Oral
		* McCabe, Michael; Blancard, Bruno Régaldo-Saint; Parker, Liam Holden; Ohana, Ruben; Cranmer, Miles; Bietti, Alberto; Eickenberg, Michael; Golkar, Siavash; Krawezik, Geraud; Lanusse, Francois; Pettee, Mariel; Tesileanu, Tiberiu; Cho, Kyunghyun; Ho, Shirley; 
		* [github.io](https://polymathic-ai.org/blog/mpp/) （不 fq 则要多等一会）
		> 2023-10-11 MAD 4 人群，lhu 推荐
		* "Multiple Physics Pretraining for Spatiotemporal Surrogate Models", NIPS2024
	* （github.io）预训练步骤 1：将多个物理系统的状态变量投影到共享的归一化嵌入空间中
		* 动机：不同 PDE 解的数值大小量级差异大
		> 首先使用时间序列预测文献中的一种最新方法，称为 可逆实例归一化 。 该方法统一不同数据集的尺度以摄取到网络中，然后将尺度信息重新注入到输出中。归一化状态变量被单独投影到具有特定于场的权重的共享空间中（图右侧）。 
			* 注：((_nale36))
		> p5:0 我们计算每个通道在时空维度上的平均值和标准偏差，并使用它们来归一化输入场。这些统计信息将被保存并用于对模型输出 denormalize。{_nafg6v}
		* p6:-1 loss 选取也要归一化，避免被量级大的 PDE 的解 dominate
	* （github.io）预训练步骤 2：训练单个可扩展的 Transformer 模型，以根据描述历史的少量快照来预测时空序列的下一步。
		* （评）输入为多时间步，从而这里隐式地纳入了方程的信息；{_naha1z}
	* 用 PDEBench 数据训
		> （针对 github.io 中的视频）我们可以在频域中看到数值扩散，但该模型是在解析不足的模拟上进行训练的，因此如果我们没有看到，那将是令人惊讶的。{_naha2h}
	* 实验 1，训练涉及的多任务精度均高于特定于任务的模型（同参数量），且随模型增大表现继续提高
		> 经过预训练后，我们的模型能够在基准测试中的所有 2D 时间相关任务上与现代基准竞争或击败现代基准，尽管多任务训练增加了难度。
		> 事实上，在大多数情况下，我们的多个物理模型的性能优于类似大小的单一物理模型、专用基线，
		> 并且我们的结果只会随着规模的扩大而提高，直到我们最大的模型在所有方面都表现最佳。 
	* 实验 2，在下游任务（假设数据生成困难）微调，考虑迁移到与训练任务差异大的下游任务
		> 我们想要回答的真正问题是这个预训练过程是否真的提高了模型学习新物理的能力。
		> 为了探索这个问题，我们在完全不包括可压缩流的情况下预训练新模型，然后选择两个不同的微调数据集。 我们称一个为“近”，另一个为“远”。 
		> 在这两种情况下，求解器、分辨率和边界条件仍然存在显着差异，使得迁移任务都具有挑战性。 
		* 实验结果曲线图，误差 vs 微调所用数据量，与从头训的基线方法比较
	* sec4.2 基于 ViT 的架构，之前提出的轴向注意力，[T,H,W] tokens 每次注意力只涉及一个轴，计算量相比全注意力降低为 $O(H^2+W^2+T^2)$；下文将该架构称为 AViT；{_nabh2j}
		* H,W 方向注意力共享投影矩阵 $W_Q,W_K,W_V$
		* 提到视频 Transformer（ViViT）稍有区别，只分离时空注意力，[H,W] 注意力是同时计算的；{_pamh7d}
		* 根据 fig2，这里空间二方向注意力同时计算、加到残差连接上，不是分成依次的两个注意力块
	* eqn(2) ViT 输入层 1x1 卷积，输入通道数为场分量数
		* 形如（我的记号）$h(t,x)=\sum_iu^i(t,x)h_i$，$h_i\in\R^{D_e}$
		* 这是网络中唯一的 权重特定于方程系统 的部分
		* 若下游任务中有场类型在训练中没见过，可直接补充对应新通道的参数（随机初始化）微调；{_o48b3o}
		* 输出层同理
	* 体现周期 BC：修改 ViT patch 位置编码方式，使体现邻居关系；{_nahe52}
		* 似乎说即使训练数据无周期 BC，修改位置编码后可直接泛化到周期 BC 场景
	* 输入时间步数似乎固定，secA PDEBench $T=100$，PDEArena $T=16$
	* 从不同方程、以不同时空分辨率采样，故多卡并行时不同卡加载的 batch 张量形状不同
		* 缓解方式：连续积累多个 batch 的梯度后，再多卡同步、更新参数
	* secB2 训练参数细节
		* 优化器 `Adan-2208.06677`
		* 初始学习率用 `D-Adaptation-2301.07733` 自适应选取（并专门强调了这帮助省去学习率调参工作）{_nbim9l}
		* 代码里有 config 切换 Adam, Adan, DAdaptAdam, DAdaptAdan；config 里说 Adan 表现好于 Adam；{_nb6f2e}
* RevIN（ICLR2022）；{_nale36}
	* "Reversible Instance Normalization for Accurate Time-Series Forecasting against Distribution Shift"
		* Taesung Kim, Jinhee Kim, Yunwon Tae, Cheonbok Park, Jang-Ho Choi, Jaegul Choo
		* [openreview](https://openreview.net/forum?id=cGDAkQo1C0p)
		* 被 `MPP-2310.02994` 引用
	* 摘要：时序数据，均值、方差常随时间变化，出现分布偏移
* DPOT-2403.03542
	* "DPOT: Auto-Regressive Denoising Operator Transformer for Large-Scale PDE Pre-Training", by THU-ML
		* Hao, Zhongkai; Su, Chang; Liu, Songming; Berner, Julius; Ying, Chengyang; Su, Hang; Anandkumar, Anima; Song, Jian; Zhu, Jun; 
		> 2024-03-30 导师发在 Pf 大群
	* fig2 架构示意图，网络输入 $1,\dots,t$ 时间步的解（加噪声），预测 $t+1$ 时间步；{_p15a1p}
	* 推理 rollout 稳定性：push-forward 技巧太复杂，故用简单的加噪声方式；{_p7ee6x}
		* （评）我理解的 push-forward 复杂原因：本文为 Transformer 式自回归，输入历史长度可变，一次前传同时惩罚多个时间步位置的预测误差；{_p7ee6f}
			* 而 push-forward 技巧针对 Markov 式自回归，一次只能惩罚单个时间步
		* 引文提到 rollout 稳定性在早期 NLP 中也遇到过（时间较早，2015、2019 年）{_p7ee7e}
	* sec3.3:1 分辨率处理：一律上/下采样到 128
		* 不同变量个数（通道数）处理：zero-padding
		* 不规则形状：引入额外掩码通道
	* sec3.4 称架构受 AFNO 启发，使用了 Fourier attention layer
		> 传统的变换器对于表示不同和高维PDE数据的核变换效率低下（Guibas等人，2021）。
		> 受AFNO在谱空间学习能力的启发（Guibas等人，2021），我们提出了一种基于傅里叶注意力的新架构，如图2所示。
		> 首先，我们通过拼接层和时间聚合层处理原始数据，以降低分辨率并提取PDE中固有的时间动态。
		> 然后，我们介绍了一种基于 Fourier mixer 的新型注意力层（Guibas等人，2021）。
		* 基本就是 AFNO
	* sec3.5:1 与 AFNO 区别：1. 有额外 time-aggregation layer，2. 频域注意力未引入稀疏性要求（AFNO 有 soft-thresholding）
	* 网络参数量可扩充到 0.5B
	* 数据集混合了 PDEBench，PDEArena，CFDBench 等
* `OmniArch-2402.16014` 类似 MPP，在隐空间输入若干时间步、预测下一时间步，在不同方程上训
	* "Building Flexible Machine Learning Models for Scientific Computing at Scale"
		* 发表版本 "OmniArch: Building Foundation Model For Scientific Computing", ICML2025
		* Chen, Tianyu; Zhou, Haoyi; Li, Ying; Wang, Hao; Gao, Chonghan; Zhang, Shanghang; Li, Jianxin; 
		> created on 2024-03-09
	* 引言
		* p2:l-2 axis numerical encoding、channel-wise tokenize，微调使用 PIRL（受 RLHF 启发）
		* p2:l-1 发布 1D、2D、3D 三个版本模型（> 不是统一训练的）；可零样本、初态逆推反问题
			* （评）后面发现“零样本”指 NS 对初始流场分布的 OoD
		* 贡献总结：1. 提到无网格，3. 零样本学习，“dynamic prompting”，逆向求解（恢复初值的反问题）
			* （评）没搞懂怎么无网格的
	* fig2 连续物理场离散为 tokens，每次 encode/decode 针对一个 axis（因此 2D 要两次编码），中间为自回归生成器
		* 多分量（文中的“多通道”）处理：eqn(2) 固定各分量顺序以后，直接按 token sequence 输入；{_o48c0p}
		* 最终中间 Transformer 解码器的 token 序列（每个 token 为某物理场的隐向量）：$h_t^1,h_t^2,\dots,h_t^C,h_{t+1}^1,\dots,$；{_p1vk5a}
	* （评）Transformer 解码器 mask 是按 token 还是按 timestep？
	* sec4.2 PIRL（physics-informed RL）
		* 使用 weakly annotated PDE captions，可包括方程、BC、其他自然语言描述
			* sec5.1 提到对文本形式的数据增强，方程改写、形式变换、换符号等；{_o39j09}
				* 每方程有 200 augmented instance，从中选 50 个最高质量的用于预训练
			* p6:l2 原始形式、增广形式各按 50% 概率选取，认为后者可增强文本编码器的泛化能力
		* 训练 CLIP-style model $S$，输入为物理场与 text caption，输出为二者匹配程度；{_o39j0h}
			* p6:l2 文本编码器用已有的 albert-math 模型，已在大量 LaTeX 数据上预训练；{_o39j29}
			* 物理编码器用 streamlined one-channel ViT，针对 1D、2D PDE
			* 使用类似 CLIP 的大 batch 对比学习方式训练
		* 模型 $S$ 生成预测解的 reward 用于 RL
		* 实验中引入该做法后 nRMSE 下降明显，基本至少减半
	* sec5.1 （隐空间）时间推进生成器直接用的 LLaMA 架构
		* 还提到 2D、3D 用了“parallel convolutional encoder”？
		* secB Transformer 架构：纯解码器，RMS norm，multi-scaled attention，RoPE 位置编码
		* （评）multi-scaled attention 是啥？
	* sec5 实验
		* fig4 zero-shot 结果（可压 NS 训练见过，但初值分布不同）
			* 具体地，用 PDEBench 数据，训练为可压 NS 默认数据，推理用 OTVortex、shock、KH 设定
			* FNO、U-Net 的设定好像没看到，我推测是训练只用 PDEBench 可压 NS 默认数据（MPP 与本文方法则见过多种方程）
		* sec5.3.3 prompt length ablation
			* 最短的输入 $t=0,50$，最长的输入 $t=0,1,\dots,99$，均预测 $t=100$
			* 模型无需显式输入时间步长，可自动推断出
			* fig6 分布内（浅水波）数据的结果，fig5 分布外 zero-shot 数据的结果
		* sec5.3.4 针对反问题 fine-tune，仿照 MPP 考察流场 forcing term/浮力恢复问题
	* 注：有听过他们报告的熟人说其中只考虑了单步 inference 的误差，因此报告的精度相对高
		* 不过有可能仅针对早期版本，本文后续更新可能有变化，未确认
	* （评）文中 baseline 的 U-Net 精度也不太行，和 ICLR PDEformer 结果差不多，因此应该不是我们自己实现的 U-Net 有问题
	* secB DL 框架，主要开发与实验用 PyTorch，部分推理用 MindSpore
	* v2 版本，昇思公众号报道，[2024-12-17](https://mp.weixin.qq.com/s/FUTJlONwaKYIyVy0zDDrQA)
		* 123D 物理场使用统一的编码解码器，基于 Fourier（> 之前版本好像是 CNN）截断前几个 modes，可对分辨率泛化；{_pbhb0x}
			* （评）“截断”在文中是 TopK 而非低通滤波？
			* 总结展望部分提到 3D 问题仍有一定挑战（尽管有 3D 数据集精度的实验）
		* 实验 PDEBench、PDEArena，1D 数据精度超过 PDEformer-1 fine-tune 版本
		* 反问题，参数估计（外力、浮力）；未确认具体是怎么做的
		* 推理速度：Base 版本在 NPU 上每秒 60 时间步
* `Unisolver-2405.17527` 语言模型编码 PDE 形式，结合系数、区域形状等信息用于调制 ViT 生成解
	* "Unisolver: PDE-Conditional Transformers Are Universal PDE Solvers" by THU-ML
		* Zhou, Hang; Ma, Yuezhou; Wu, Haixu; Wang, Haowen; Long, Mingsheng; 
		> created on 2024-06-12
	* PDE 区分 2 类 6 种信息：point-wise 信息（区域形状、外力场、边界值），domain-wise 信息（PDE 形式、系数、边界类型）；{_o6ch5x}
		* 区分方式的导出：从最简单的 1D 波方程（> D'Alembert 公式？）解表达式启发所得
		* 区域形状似按示性函数输入；{_o6ch8b}
		* PDE 形式按 LaTeX 输入，用 LLaMA3 得到 2048 维 embedding
			* secC.2 用 PDEformer-1 3M 预训练数据训时，LaTeX 表达式不包含零系数项
		* PDE 系数假定有全集，用 MLP 处理；边界类型类似
		* point-wise 信息其实还包括 IC，不过作为网络输入而非外部 condition
	* fig2 网络架构，ViT 输入 IC，AdaLN 式引入 condition；{_o6ch7i}
		* point-wise 信息的 condition 各 patch 不同；三类分别 PatchEmb
		* domain-wise 信息的 condition 各 patch 共享：三类分别 embed，之后 repeat 到各 patch
		* point/domain-wise 共 6 种信息 concat 作为整体 condition
	* 暂时没看懂怎么处理含时问题，自回归？
		* sec4.2 和 PDEformer 对比的时候也用了类似的 Poly-INR 变体来解码全时空解（其输入为本工作网络所提取出的 PDE 特征）
	* （评）没看懂怎么对分量个数泛化
	* sec3:-1 与 DiT 区别原因：
		* 1. 不用扩散（PDE 要求准确性而非多样性）
		* 2. condition 有物理含义，不同于扩散时间步、文本描述这些
		* 3. condition 不限于标量，还有 point-wise 信息
	* 实验，似乎是 3 个实验用了不同架构分别训，参数量都不太一样
		* tbl10 PDEformer fine-tune 时学习率 5e-6，我们当时是 1e-4
	* [ICLR2025 OpenReview](https://openreview.net/forum?id=f3xXPDCh8Q)，评分 8833
		* uAAv，评分 3
			* ML 方法需阐述清楚动机、仔细定义问题：适定的 PDE 可能不需要 ML 就能解
				* 作者回应考虑的是相比传统方法加速，而非 PDE 形式未知的前提下从数据中学解算子
			* 要求澄清：各基线模型的输入形式，测试数据形式
			* 提到训练时间相比基线很长（> 我们的文章要强调 develop 而非 propose？从而不与 ICON 等基线比较）
				* （评）我们陈述我们的训练时间时尽管说未明确统计，但大致是几个星期？如果所有数据都一开始就准备完成，预计不需要这么长的时间训练
			* 吐槽作者的表述问题（> 我们不涉及），“PDE 的数学结构”，thm1 波方程解结构的推广意义
				* 以及基线表述不合理：基线没用 PDE 文本形式，而是用了其他方法达到多 PDE 泛化，作者让人误以为是自己修改了这些基线
			* 表述“通用 PDE 求解器”不合适：某些 PDE 不存在解，或解不唯一
			* 原文写旧范式大致分为 PINN、NO，reviewer 认为该表述不合适
		* awFj，评分 3
			* 希望加入消融实验，探究不同 PDE 同时学习能否帮助相互泛化
				> 例如，您可以在Navier-Stocks方程上训练Unisolver，并在扩散反应方程上对其进行测试，或者在不同的域几何上训练和测试Navier Stocks方程，以展示Unisolver在不同类型PDE之间的迁移学习能力。
				* （评）fine-tune vs from-scratch 实验 也相当于可回答这点？
				* （评）小样本实验也要加入 PDEformer from-scratch？
			* 维持评分主要是因为 thm1 波方程解形式的证明没有引用（> 主要是怀疑其学术诚信问题？并且不考虑作者之后的修改可能不符合审稿规范）
* Zebra-2410.03437 基于 in-context 预测含时 PDE 演化，原文仅用于参化 PDE、未对 PDE 形式泛化
	* "Zebra: In-Context and Generative Pretraining for Solving Parametric PDEs"
		* Serrano, Louis; Koupaï, Armand Kassaï; Wang, Thomas X; Erbacher, Pierre; Gallinari, Patrick; 
		> created on 2024-10-20
	* 单时间步流场用 VQVAE 编码
	* 序列描述，除流场 token 外，还有特殊 token：bos（全序列开头）、bot（轨迹开头）、eot（轨迹结束）、eos（全序列结束）
		* （评）我觉得 bos,eos 没什么必要
	* fig8 预测生成的三种方式，参考轨迹+当前初值，当前轨迹多历史时间步，无条件直接生成；{_oakf6q}
		* （评）ICON 在第一种细分为单参考轨迹、多参考轨迹
* `Poseidon-2405.19101` 在可压 Euler + 不可压 NS 数据上预训练 NO（架构基于 SwinV2，时间推进按 modulation 输入），迁移学习到其他方程（包括不含时），自称是基础模型
	* "Poseidon: Efficient Foundation Models for PDEs"
		* Herde, Maximilian; Raonić, Bogdan; Rohner, Tobias; Käppeli, Roger; Molinaro, Roberto; de Bézenac, Emmanuel; Mishra, Siddhartha; 
		* ETH Zurich
		> created on 2024-06-10
	* [机器之心报道](https://mp.weixin.qq.com/s/sNq4hHB9r7M5d4ODeS9p7A)
	* 注：以下部分内容根据 arXiv v2 版本
	* 对 PDE 泛化方式：仅为基于 NO 的迁移学习，p8:0 提到 CNO-FM（基于 CNO 架构在同样的数据上预训练）{_o6mb52}
		* 注：看引用里的作者名单，CNO 应该是同组的工作
	* 本文所用架构：scOT，基于 SwinV2，有分层 patch 结构；{_o6cj79}
		* secA patch-size=4, window-size=16（> 对 128×128 网格，只划分出 4 个 window）
	* 方程形式通用性
		* 含时方程支持：fig2 时间推进步长 dt 作为网络输入，以 AdaLN（pre-LN 的调制）方式影响网络前传；{_o6ci14}
			* 不含时方程支持（作为新 PDE 用于微调）：视为 $t\to\infty$ 的极限；实验包括椭圆、Helmholtz；{_o6cj7g}
				* （评）推测实现时是将作为网络输入的 dt 固定为其可取的最大值
		* 输入输出分辨率问题
			* secB.1.0:-1 数据生成分辨率 512x512，下采样至 128x128 用于网络训练；secB.2.9:-1 对原始分辨率 256x256 下采样
			* secD.5.5 不同分辨率的数据需上/下采样后输入网络
			* （评）若架构做成分辨率无关，从而可超分辨率，则未必有传统无网格的限制
		* 多分量处理：固定最大分量个数，见 eqn(2.9)-1 $n^{\hat\Xi}$
			* pad 分量为常数 1（而不是 0？）
		* 不规则区域支持：secB.2.13:-3 机翼稳态流场，输出场非定义域内的点不参与 loss 计算
			* 输入场为机翼的示性函数
		* secB.2.13 机翼数据集（非均匀网格、区域有洞、考虑稳态故不含时），数据插值到 $[-0.75,1.75]^2$ 128x128 均匀网格，loss 只在有数据的区域内部计算
	* 微调策略：eqn(2.10) 微调阶段参数分 3 类（> 我姑且叫做 h,t,n），h 参数量最大，用不同学习率（h 最小），n 参数随机初始化；{_o6mb54}
		* （评）感觉有点像数据驱动版本的 MAD？但问题是预训练阶段 n 参数也是对各任务共享，而非独立可训练
	* 下游任务分布与预训练差异大，sec3:2
		* 方程形式：预训练仅 INS、C-Euler，下游有的引入其他物理（tracer，重力，外力），还有其他方程
			* p9:2 预训练多样性重要，数据类型减少一半会降低下游任务表现
		* 时间依赖：预训练仅含时，下游包括稳态方程（解按长时间极限处理）
		* BC、区域形状：预训练仅 2D 方形、周期 BC，下游包括非周期，以及机翼不规则区域
		* 输入形式：预训练仅初值（解映射为时间推进），下游包括方程系数/参数、外力项、区域形状
	* 实验评估 metric：sec3:4
		* relative L1 error
		* 只考虑最后一个时间步（从而对稳态方程统一）
		* 相对基线增益：精度增益 AG（相同样本量 S），效率增益（达到 FNO S 样本精度可少用多少样本）{_p1uf2a}
	* 实验基线：sec3.3
		* NO：FNO、CNO、ScOT（本文架构）
			* FNO、CNO 带 time-conditioned InstantNorm，从而时间也作为网络输入
			* （评）从而不完全忠实于原始架构，可算是自己提出的新架构
			* 注：本文 ScOT 架构为 time-conditioned LayerNorm
			* 注：后文提到 ScOT 和 CNO 效果差不多，都明显好于 FNO；也都不如带预训练的版本
		* 基础模型：MPP；CNO-FM（用相同数据集预训练的 CNO）
		> （提升幅度）平均而言（所有任务的中位数），CNO-FM需要大约100个特定任务的示例才能达到1024个样本的FNO误差水平，而P OSEIDON只需要大约20个。
		> （架构重要性）由于CNO-FM和P OSEIDON在完全相同的数据集上进行了预训练，这种性能差异在很大程度上可以归因于架构差异，因为CNO-FM基于多尺度CNN，而多尺度视觉变换器是P OSEIDEN的支柱。
		* MPP 需微调，从而允许仅输入单个时间步向后预测（其预训练过程默认要输入 16 个时间步）
			* 效果：部分任务略优于 FNO，其他任务上失败（样本量增加后不收敛，或训炸了）
			* 微调方式见 secC.6
	* 数据汇总表格 p25
	* 波方程形式 p30，解效果 p88
		* eqn(66) 化为 3 分量方程：时间一阶化多出 v 分量，$c_t=0$ 也算一个分量
		* （评）怎么图中波速还能取 -1？从公式来看倒都是正的
	* 代码阅读记录：
		* ScOTEncoder 多个输出，第二个 all_hidden_states: Tuple[Tensor]
		* config.skip_connections 含义：U-Net 结构每层残差连接过多少个 ConvNeXt blocks
* BCAT-2501.18972 多历史自回归 Transformer 用于流体，作者同 PROSE
	* "BCAT: A Block Causal Transformer for PDE Foundation Models for Fluid Dynamics"
		* Liu, Yuxuan; Sun, Jingmin; Schaeffer, Hayden; 
		> created on 2025-02-10
	* fig1“next frame prediction”，其中注意力的 block causal mask 允许同帧内不同 patch 相互算注意力；{_p2af5j}
	* 多分量处理：零填充到 4 个通道，sec3.3:2；{_p2af5p}
	* （评）推测和 OmniArch 的区别，本文同时刻不同 token 对应不同空间位置（汇总所有分量信息），OmniArch 不同 token 对应不同分量（汇总所有空间位置信息）
* `PITT-2305.08757` （备用）将 PDE 形式输入 Transformer，似乎用于 为 NO 的时间迭代误差的修正提供信息
	* "Physics Informed Token Transformer"
		* Lorsung, Cooper; Li, Zijie; Farimani, Amir Barati; 
		> created on 2023-12-01
