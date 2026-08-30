> 2026-08-30 从多个源笔记中抽取整合
* 2511.09729 （备用）1D equation-aware NO，设计方程通式、网络只输入系数
	* "Generalizing PDE Emulation with Equation-Aware Neural Operators" by Google, NeurIPS 2025 AI-driven Machine Learning and the Physical Sciences Workshop
		* Zhu, Qian-Ze; Raccuglia, Paul; Brenner, Michael P.; 
		> created on 2025-11-17
	* sec2 1D 方程时间推进，设计完整方程形式、模型只输入系数，所有 7 项 $u,u^2,u_x,uu_x,u_{xx},u_{xxx},u_{xxxx}$
	* sec3.1 泛化到没见过的参数，sec3.2 没见过的 PDE
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
* （备用）太阳活动预测基础模型，长期、跨通道，下游任务有 耀斑分类、风速回归、活动区分割、光谱预测……
	* [2025-08-23](https://mp.weixin.qq.com/s/Kn5OIhCjESEcBHwD037Tkg)
	> （标题）NASA、IBM打造日地物理学首个开放式 AI 基础模型，用九年观测训练提升约16%耀斑预测准确率
	> 现在，NASA 把 AI 「基础模型（foundation model）」的范式搬到日地物理：用统一大模型吸收长期、多通道的太阳观测，做生成式预测，再按需微调到具体下游科学任务上，目标很明确——更快、更准、可复用、可开放。
	> 它采用太阳动力学观测台（SDO）的近 9 年高分辨率多仪器数据进行预训练，并对未来太阳活动进行生成式视觉预测，最长可滚动到小时级乃至更长时间窗，在多个下游任务上达到或超过当前最好水平。
	* 开源
		> 它不仅开放在 Hugging Face（权重+预处理+示例），代码也同步托管到 GitHub，方便学界与产业界快速复用与微调。
	> 和一次一做的「单任务模型」不同，Surya 把长期、跨通道的太阳观测转化为一个可泛化的表征底座，再把下游任务（耀斑分类、风速回归、活动区分割、光谱预测……）当成「轻量微调」的应用层。
		> 这种「先学通用物理表征、再做专科任务」的路线，是把地球科学里的基础模型经验移植到日地物理的标志性进展。
* MOFS-2508.01211 NO 基于少样本学习泛化到新 PDE，包含文本条件输入
	* "Multi-Operator Few-Shot Learning for Generalization Across PDE Families"
		* Li, Yile; Zhe, Shandian; 
		> created on 2025-08-17
	* 摘要摘录
		* 关注点：跨 PDE 泛化，多模态，少样本适配新算子
			> 现有的神经算子方法需要每个特定PDE的大量训练数据，并且缺乏跨PDE家族进行泛化的能力。
			> 在这项工作中，我们提出了MOFS：一个用于多算子少镜头学习的统一多模态框架，旨在通过几个演示示例推广到看不见的PDE算子。
		> 我们的方法集成了三个关键组成部分：
			> （i）共享傅里叶神经算子（FNO）编码器的多任务自监督预训练，以重建掩蔽的空间场并预测频谱，
			> （ii）从输入-输出场的统计摘要中导出的文本条件算子嵌入，以及
			> （iii）具有门控融合和跨模态梯度注意力的记忆增强多模态提示。
		> 我们采用了一种两阶段训练范式，
			> 首先在可见算子上学习即时条件推理，
			> 然后应用端到端的对比微调来对齐视觉、频率和文本模式中的潜在表征。
	* （评）原文没给示意图
	* p3:l 文本输入，自然语言描述 PDE 名称，及输入、输出场的统计分布；{_p8hb06}
		> This is a <dataset name> PDE sample. The input coefficient field has mean µ_a , std σ_a , min a_min , and max a_max . The output solution field has mean µ_u , std σ_u , range [u_min , u_max ], and gradient magnitude mean µ_∇u with std σ_∇u .
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
* LNOP-2410.20100 （备用）LNO 针对含时 PDE 预训练，编解码器通用，隐空间时间推进简单联训、下游微调
	* "Latent Neural Operator Pretraining for Solving Time-Dependent PDEs"
		* Wang, Tian; Wang, Chuang; 
		> created on 2024-11-17
	> 我们考虑的是一种混合数据集，其中包含了多个物理系统。
		> 这些系统都遵循二维空间中的时变偏微分方程，包括纳维-斯托克斯方程、浅水方程、伯格斯方程以及反应扩散方程。
		> 所有这些微分方程所描述的系统都是时变系统，其响应取决于不同空间位置之间的相互作用。
		> 因此，我们可以利用神经网络来解决问题——神经网络能够提取出这些微分方程空间状态的表示形式，并近似计算这些表示形式随时间的变化情况。
* Text2PDE-2410.01153 隐扩散模型生成 PDE 完整时空解
	* "Text2PDE: Latent Diffusion Models for Accessible Physics Simulation"
		* Zhou, Anthony; Li, Zijie; Schneier, Michael; Buchanan Jr, John R; Farimani, Amir Barati; 
		> created on 2024-11-16
	* fig1 隐扩散模型用来生成物理模拟，输入现象的文本描述，生成完整时空流场；{_obgf3o}
	* fig2 mesh encoder/decoder，任意形状 mesh 先插值到均匀网格再处理，最后插值回来；插值器可学习；{_obgf49}
		* sec3.1 数学形式，编码器形如积分算子，解码器离散为 Riemann 和
* 2410.01137 NO 额外引入自然语言描述的方程性质信息，通过 LLM 编码后交叉注意力；NO 基于 FactFormer
	* "Explain Like I'm Five: Using LLMs to Improve PDE Surrogate Models with Text"
		* Lorsung, Cooper; Farimani, Amir Barati; 
		> created on 2024-10-23
	* 文本模态使用描述性文本（而非公式）{_oane8t}
		> Burgers方程模拟了一个可以产生冲击波不连续性的保守系统。Burgers方程是一个一阶拟线性双曲型偏微分方程。
		> 该系统具有Neumann边界条件。Neumann边界条件具有恒定的梯度。在这种情况下，边界上的梯度为∂uneumann。
		> ……
	* fig1 文本信息用已有 LLM 编码；主网络用交叉注意力整合该部分文本信息；{_oanf11}
		* LLM 实验中为 LLaMA 3.1 8B
	* fig2 交叉注意力结构，物理场 feature 先 convolutional patch embed，再用于交叉注意力，再 convolutional upsample 恢复原始 shape
		* （评）PDEformer 新架构或可参考？
	* 按自回归方式预测，仅单步输入
	* 似乎仍是每方程单独训练
	* 训练数据集：热方程，Burgers，CNS；后者训完后似乎又用于浅水波微调
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
* MODNO-2404.02892（备用）基于 MTL 实现 PDE 基础模型，不同 PDE 对应不同输出层基底函数
	* "MODNO: Multi Operator Learning With Distributed Neural Operators"
		* Zhang, Zecheng; 
		> created on 2024-09-11
	> （摘要）核心思想是使用每个运算符的专用数据独立学习其输出基函数，同时使用整个数据集集中学习所有运算符共享的输入函数编码。{_o9bg4t}
* `CoDA-NO-2403.12553`
	* "Pretraining Codomain Attention Neural Operators for Solving Multiphysics PDEs"
		* Rahman, Md Ashiqur; George, Robert Joseph; Elleithy, Mogab; Leibovici, Daniel; Li, Zongyi; Bonev, Boris; White, Colin; Berner, Julius; Yeh, Raymond A.; Kossaifi, Jean; Azizzadenesheli, Kamyar; Anandkumar, Anima; 
		> 2024-03-27 Pf 群 lhu 推荐
	* fig2 为每个场分量添加相应位置编码（variable-specific positional encoding，VSPE）{_o44b4y}
		* fig3 若新方程有新的分量，只需引入新的 VSPE 微调，网络架构无需修改
	* fig 网络架构，各变量由原来的 mesh 变换到均匀的 latent grid，之后在该均匀域上算注意力等，最后从均匀 latent grid 解码到原 mesh；{_p26f2d}
	* fig3 预训练任务与迁移的下游任务 区别较大
		* PDE 设定：前者为纯流体，后者为流固耦合（有两个额外分量）
		* 任务设定：前者为流场补全，后者为时间推进预测
		* 输入输出：前者输入 masked $u,v,p$ 分量、输出 mask 部分预测结果，后者输入 5 分量的当前时间步、预测下一时间步
		* 网络架构：前者 encoder + reconstructor，后者 encoder + predictor
	* p6:r-2 数据集包括流体、流固相互作用，均用 TurtleFSI 包生成；{_o44b34}
		* 流固相互作用为不可压 NS + 弹性体方程
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
* BCAT-2501.18972 多历史自回归 Transformer 用于流体，作者同 PROSE
	* "BCAT: A Block Causal Transformer for PDE Foundation Models for Fluid Dynamics"
		* Liu, Yuxuan; Sun, Jingmin; Schaeffer, Hayden; 
		> created on 2025-02-10
	* fig1“next frame prediction”，其中注意力的 block causal mask 允许同帧内不同 patch 相互算注意力；{_p2af5j}
	* 多分量处理：零填充到 4 个通道，sec3.3:2；{_p2af5p}
	* （评）推测和 OmniArch 的区别，本文同时刻不同 token 对应不同空间位置（汇总所有分量信息），OmniArch 不同 token 对应不同分量（汇总所有空间位置信息）
* `2306.00258` FNO 架构预训练-微调范式的潜力，重点关注 scaling 与向下游任务的迁移
	* "Towards Foundation Models for Scientific Machine Learning: Characterizing Scaling and Transfer Behavior", NIPS2023
		* Subramanian, Shashank; Harrington, Peter; Keutzer, Kurt; Bhimji, Wahid; Morozov, Dmitriy; Mahoney, Michael; Gholami, Amir; 
		> created on 2023-10-28
	* p1:r-1 重点指标：模型（架构、规模）、数据（多样性、规模）、训练配方（预训练与微调）、OoD 泛化
	* p2:l0 本文针对 FNO 这种特定架构
	* p2:r 下游任务数据量的 scaling，模型规模的 scaling（64K - 256M）并发现规模增大后微调性能增益更大
	* p3:l 学习多个方程，FNO 有多输入；对给定 PDE，不存在的输入项按 0 输入，从而限制网络、使其对正确的方程进行预测
	* p4:l 考虑的 3 个（2D 不含时）方程：Poisson，对流扩散，Helmholtz
* `PITT-2305.08757` （备用）将 PDE 形式输入 Transformer，似乎用于 为 NO 的时间迭代误差的修正提供信息
	* "Physics Informed Token Transformer"
		* Lorsung, Cooper; Li, Zijie; Farimani, Amir Barati; 
		> created on 2023-12-01
## P3D
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
* Tadpole-2605.15284 3D PDE 基模基于 P3D AE 预训练 + 微调，在隐空间演化、流匹配生成；动态生成数据集达百 TB
	* "Tadpole: Autoencoders as Foundation Models for 3D PDEs with Online Learning", ICML
		* Liu, Qiang; Koehler, Felix; Holzschuh, Benjamin; Thuerey, Nils;
		* Technical University of Munich
		> created on 2026-07-18 by OpenCode + deepseek-v4-pro
	* 摘要摘录
		> 我们推出了 Tadpole 这一新型基础模型，专门用于处理三维偏微分方程问题。
		> 该模型有效解决了模型可迁移性、高维数据处理能力以及多功能性方面的关键挑战。
		> Tadpole 是通过在由高效在线数据生成工具生成的合成 3D 偏微分方程数据上作为自动编码器进行预训练的。
			> 这样一来，就可以在不增加存储或 I/O 开销的情况下进行大规模、多样化的训练。
			> 实际上，该模型已成功处理了相当于数百 TB 的训练数据。
		> 通过自动编码单通道空间数据，Tadpole 能够学习到适用于各种物理系统的通用表示形式，这些系统的状态变量数量和空间分辨率各不相同。
			> 尽管 Tadpole 最初只是作为自动编码器进行预训练的，但它可以高效地应用于重建之外的多种任务，比如动态模拟和生成式建模。
		> 在动态模拟方面，我们提出了一种新的、更高效的参数处理方式。
			> 这是一种经过精心设计的微调策略，它结合了低阶适配、潜在空间变换以及重新引入的跳过连接机制。
			> 通过这种方式，该模型能够在使用最少的可训练参数的情况下，实现精确的时间建模。
	* 核心主张：PDE 基础模型不应预训练学动力学（$ u_t \mapsto  u_{t+\Delta t}$），应预训练学重建（$ u_t \mapsto  u_t$）{_q7if15}
		* 论证：重建只需学 PDE 解的流形（低维、光滑、由微分算子约束），动力学需学流形上的流（更难、且依赖 PDE 类型和参数）
		* 流形学好了，表征可迁移到多种下游任务；动力学预训练的表征只能用于动力学
		* （AI 评）这个区分简洁有力，但并非完全原创——CV 领域的 masked AE 预训练早已基于类似逻辑（学图像流形而非学变换）。论文的价值在于将这个区分清晰地论证到 PDE 基础模型场景，并提供了 3D 验证
	* 预训练：VAE + 对抗 loss（类似 VQGAN），骨干为 P3D（CNN + Transformer 混合，卷积提供平移等变性）
		* 单通道空间 crop（64³）训练：坍缩通道维到 batch 维，统一处理不同通道数的 PDE 系统。中间 pre-crop（96³）增加单次传输可抽的 crop 多样性
		* 重建目标回避了 crop 边界处变量耦合、误差累积等问题——动力学预训练下 crop 训练几乎不可行，这是选择重建目标的另一个好处
	* 下游微调：
		* 自编码：直接前传或 LoRA 微调解码器
		* 动力学（Tadpole-DFT）：三个组件——(1) LoRA 微调编码器，(2) 编解码间插轻量子网络做隐空间变换，(3) 重连预训练时去掉的 skip connections，各用零初始化可训缩放因子控制
			* 隐变换子网络聚合所有状态变量的隐向量，学跨变量耦合
			* （AI 评）三者分开看都不是新东西（SPNN 在 MR2.md 做过编解码间插网络、PhyCRNet-s 做过 skip 重连），组合在一起的设计是新的，零初始化缩放因子让 skip 逐步引入高频信息
		* 生成：在隐空间做 flow matching 生成
	* 对标 FMT-2509.18611，同样 AE + 隐空间生成做动力学，但 Tadpole 明确将三类下游拆为独立微调协议，框架更清晰
	* 预训练数据全在线生成，无离线数据集。代码开源，权重在 Hugging Face
		* 训练数据全由 GPU 伪谱求解器在线实时生成，算完就扔，无存储/IO 瓶颈
		* 三级缓冲：仿真 FIFO（先进先出）→ 训练 FIFO → MFU 缓存；{_q7if8g}
## MORPH
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
* 2603.04606 PDE 基础模型（自回归 MORPH）解反问题，加任务专用头后前传直接输出解，需正反问题联合微调
	* "PDE foundation model-accelerated inverse estimation of system parameters in inertial confinement fusion"
		* Rautela, Mahindra; Scheinker, Alexander; Love, Bradley; Oyen, Diane; DeBardeleben, Nathan; Lawrence, Earl; Biswas, Ayan; 
		> 2026-03-07 Pf 大群导师推荐
	* 摘要摘录
		> 本研究中，我们研究惯性约束聚变（ICF）中的一个反问题：从多模态快照式观测（输出）估算系统参数（输入）。
		> 利用开放的 JAG 基准测试，该基准提供高光谱 X 射线图像和标量可观测量，我们对偏微分方程基础模型进行微调，并训练一个轻量级任务专用头，共同重建高光谱图像和回归系统参数。
		>  R2=0.995 数据尺度实验（占训练集的 5%–100%）显示，随着训练数据量的增加，重建和回归损失均有持续改善，低数据区边际增益最大。
		> 最后，预训练 MORPH 权重的微调优于从零训练同一架构，表明基础模型初始化能提升 ICF 中数据有限逆问题的样本效率。
	* 反问题任务类型，惯性约束聚变 设计参数 secI；{_q39b0i}
		> 本研究通过多模态诊断观测估算潜在惯性约束聚变（ICF）设计参数的逆问题，并评估偏微分方程基础模型预训练相较于从零开始训练是否能提升反演准确性和数据效率。
		* 输入：由高光谱图像和标量可观测量组成的多模态诊断特征；输出：模拟器输入参数
	* fig1 引入任务专用头（TSH）；观测轨迹输入²基础模型，末层激活¹输入 TSH 输出反问题解
		* ¹取注意力模块的输出，不经过 unpatching 和输出投影
		* ²自回归基础模型本来就支持多时间步输入
		* TSH 额外输入：15 个标量，可观测量 or diagnostics；{_q39b23}
		* TSH 输出为 5 标量
		* 训练：正反问题联训，优化器独立；{_q39b26}
			> 基础模型和 TSH 通过独立的损耗函数和独立的优化器和学习率调度器，端到端联合训练。
			* （评）正问题 loss 仅作用于基础模型，反问题 loss 同时作用于基模和 TSH
			* （评）额外引入正问题 loss 动机，推测是为防止模型退化、泛化能力受损
	* 方程为 OoD secII-B:-2；{_q3kh0i}
		> （MORPH）预训练套件包含六个跨越 1D–3D 领域、场域和组分结构多样的时空数据集：1D-CFD（计算流体力学）、2D-DR（扩散-反应）、2D-SW（浅水）、2D-CFD-IC（不可压缩 CFD/Navier–Stokes）、3D-MHD（磁流体力学）和 3D-CFD（计算流体力学）。
		> 相比之下，控制 ICF 聚变及其高光谱 X 射线特征的物理学未在本预训练套件中体现[12]。
		>  因此，我们将 ICF 的超光谱重建和参数推断视为分布外转移环境。
	* （评）与我们做法的区别
		* 求解方式：✓前传即可给出结果，我们要解优化问题
		* 输入形式：
			* 样本量：✗似乎只能是 单个解样本（含多时间步），我们可以有几十个联合使用
				* 如果改用 ICON 类基模，或许也能同时用多个解轨迹
			* 完整度：✗似乎需完整时空观测；我们可以散点稀疏观测
			* 抗噪声：✗实验应该是用的干净的物理场输入（原文 noise/noisy 仅出现于引言）
			* 额外信息：✓可引入额外已知的信息（本文为 15 标量）；我们目前不行
				* 如果我们未来要支持：设计新计算图表示方案，除了 支持反问题观测解场作为模型输入，还支持这类额外输入
		* 网络结构：✗需引入额外参数，我们不需要
		* 模型微调（作为求解前的预备工作）
			* OoD 新方程：正反问题联合微调；我们是仅针对正问题微调，反问题要额外解优化问题
			* ID 已见过¹：✗训反问题预测头，同时保留正问题 loss 防模型退化；我们无需微调，直接解反问题
				* ¹本文实验不涉及，仅仅是我根据方法推测的这种场景下的做法
## DPOT
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
* MoE-POT-2510.25803 （备用）DPOT 架构引入 MoE；{_q7jb08}
	* "Mixture-of-Experts Operator Transformer for Large-Scale PDE Pre-Training", NeurIPS 2025
		* Wang, Hong; Xin, Haiyang; Wang, Jie; Yang, Xuanze; Zha, Fei; Dong, Huanshuo; Jiang, Yan; 
		> created on 2025-11-17
* CCM-2605.14546 （备用）PDE 基模微调至单参方程，权重更新量分解为 特定方程符号适配 + 特定参数适配，线性内插用于新参数求解
	* "Discovering Physical Directions in Weight Space: Composing Neural PDE Experts"
		* Wang, Pengkai; Liu, Pengwei; Wang, Yuanyi; Chen, Guanyu; Ren, Xingyu; Li, Xiaolong; Hao, Zhongkai; Kong, Yuting; Zhang, Qixin; Ni, Dong; 
		* 香港 PolyU、浙大、清华、南洋理工
		> created on 2026-07-18
	* 所用基模：FNO，DPOT
		> （摘要）在不同的 FNO 尺度上进行的进一步实验、基于 DPOT 架构的模型测试以及各种消融实验都表明
	* fig2
		* 场景：方程有单个实值参数（如 NS 粘度，反应扩散 r）
		* 最低最高值分别训网络，分别提取权重更新量，求二者平均、差值
		* 新参数下权重更新量据此线性组合得到 $\theta(\lambda)=\theta_0+\Delta^++\lambda\Delta^-$
	* （未确认细节）三种坐标选择方式 + 适用场景 eqn(9–11)
		* CCM-Coord：物理元数据直接映射（DiffReact，r=1.00）
		* CCM-Scale：物理坐标有序但权重空间尺度不匹配（NS2D，r=0.99）
		* CCM-Prefix：短 rollout 前缀（K=4）在坐标库中选 α（RDB，r=0.79 标量元数据不可靠）
* AOT-POT-2605.15793 DPOT 引入输入依赖算子变换，简化异构解算子
	* "AOT-POT: Adaptive Operator Transformation for Large-Scale PDE Pre-training"
		* Lv, Qitan; Wang, Hong; Hao, Zhongkai; Wu, Wen; Xu, Xuenan; Zhou, Bowen; Wu, Feng; Zhang, Chao;
		* 中科大，上海 AI Lab，清华
		> created on 2026-07-19 by OpenCode + DeepSeek-V4-Pro
	* 核心诊断：多 PDE 联训难不因模型容量不够，而是因为各 PDE 的解算子本身太异构，强行让一个网络同时近似它们相当于让一个函数逼近多个差异巨大的目标
		* 已有路线：扩大容量（DPOT 加宽加深、MoE-POT 加稀疏专家路由）
		* 本文路线：不动模型容量，改对目标的表述——学一个输入依赖的算子变换，把各异构解算子变换为对齐的等价形式，让骨干网络只需近似这些变简单后的目标
		* 类比古典数值分析：Fourier 变换把 Laplace 算子变逐点乘法、预条件子把病态矩阵变良态——都是变换算子本身以减少求解难度
		* （AI 评）这个视角区分了两类策略：让模型更强 vs 让任务更简单。目前领域主流在前者（scaling law 信仰），本文在后者开辟了一条新路线
	* 动机实验（DPOT-Tiny 骨干 + 点式线性变换验证 H1/H2）
		* H1（变换有用）：在 DPOT 前后加 4×4 可学线性层（仅 ~40 额外参数），四个 PDE 族上的 L2RE 全部下降
			* Matched Frozen（先在 PDE 1 上训变换再冻结、在 PDE 1 上从头训骨干）效果比 Joint Learned 还好——说明增益不是来自容量增加，而是变换本身简化了学习目标
			* Joint Learned 与 Matched Frozen 之间的差距说明单层 C×C 变换不够用，需要每层、输入依赖的变换（即 AOT 要做的）
		* H2（变换 PDE 特异）：将 PDE k 上训的冻结变换复用于 PDE j，对角元（源=目标）改善、非对角退化可达 46 倍
			* 即确实需要输入依赖的自适应变换，不能用一个全局固定变换服务所有 PDE
	* AOT block 三组件
		* 多流并行表示：隐表示扩展为 n 条并行流，提供多个潜在基底分量（类比潜在函数空间的多个基函数）
		* 输入依赖聚合/重分配：子层前用输入依赖权重将 n 条流聚合为一条 → 骨干子层处理 → 输出用另一组可学权重重新分配回 n 条流
			* 效果等同于对潜在解算子做逐样本的基底变换
		* Sinkhorn 双随机混合：每层用 Sinkhorn-Knopp 投影得到双随机矩阵 $T_l$（$T_l1 = 1, T_l^T1 = 1$），对各流做信息混合
			* 数学性质：体积保持（行列式=1）、谱范数有界 → 保证训练稳定，不改变前传中的信息量
		* 三组件合在一起相当于：每层对隐空间做一次输入依赖的基底变换 + 保范混合
	* 对骨干的改变：仅替换 DPOT 的普通残差连接为上述 AOT 连接，额外参数 ~3%；{_q7jb04}
		* 其余全部照搬 DPOT：AFNO 骨干（Fourier mixer 注意力层）、time-aggregation layer、去噪自回归预训练目标、加噪声稳定 rollout、分辨率/通道数/不规则形状处理
	* 实验结果要点
		* 12 个 PDE benchmark（FNO 数据集 + PDEBench + PDEArena + CFDBench），预训练后 L2RE 平均降 40.9%，最高 77.6%
		* AOT-POT-S（31M）在 11/12 数据集上超过 DPOT-M（122M）
		* 微调后 in-domain 误差再降至多 92%，out-of-domain（预训练未见 PDE 类型）至多 89%
		* 长轨迹 rollout 稳定性优于 DPOT；MoE + AOT 混合的初步实验不如纯 AOT
	* 可解释性：训练过程中各流逐渐分化，不同流对不同的 PDE 类型形成专业化响应
		* 学习到的变换 T_l 具分类能力——即使不做显式分类训，T_l 也能在训练中自发学会按 PDE 类型分离样本，且该能力随训练进程逐步涌现、跨模型尺度保持一致
	* （AI 评）interpretability 声称"自发学会分类 PDE 类型"，但可能只是学到了对不同 PDE 的幅值/频率分布做自适应归一化（类似 instance norm），不一定真正识别了 PDE 类型
		* 如果加噪声扰乱幅值分布后分类能力仍保持，说服力更强
