> 2026-08-30 从多个源笔记中抽取整合
## MPP Walrus
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
* 2511.20798 （备用）Walrus 激活值特征提取，发现涡度、扩散、时间推进等，改网络激活可调整预测结果
	* "Physics Steering: Causal Control of Cross-Domain Concepts in a Physics Foundation Model", NeurIPS 2025
		* Fear, Rio Alexa; Mukhopadhyay, Payel; McCabe, Michael; Bietti, Alberto; Cranmer, Miles; 
		> created on 2026-01-24
	* [知乎翻译](https://zhuanlan.zhihu.com/p/1981077068402926776)
* 2603.05598 PDE 基础模型的 tokenizer 预训练，基于普通 AE
	* "On the Value of Tokeniser Pretraining in Physics Foundation Models"
		* Sotoudeh, Hadi; Mukhopadhyay, Payel; Ohana, Ruben; McCabe, Michael; Lawrence, Neil D.; Ho, Shirley; Cranmer, Miles; 
		> created on 2026-03-30
	* 摘要摘录
		> 我们研究分词器预训练对物理仿真准确性和效率的影响。
		> 我们证明，在训练动力学模型之前，用自编码目标预训练分词器可以提升物理仿真的计算效率。{_q3vf8v}
		> 值得注意的是，这种益处的大小取决于域对齐：在与仿真任务相同的物理系统上预训练带来最大的改进，而在其他系统上预训练则带来适度的提升。
		> 我们还引入了灵活的时空压缩操作，扩展因果卷积以支持运行时可调压缩比，从而实现对多样化下游任务的高效适应。
	* sec2.4 架构
		> 处理器。我们采用 Walrus（McCabe 等 ，2025） 的处理器架构，采用因式分解空间和时间关注，采用轴向位置编码和因果时间结构。
		> 分词器。我们使用简化版的 MAGVIT-2（Yu 等 ，2024）， 保留因果卷积编码-解码器骨干，但去除向量量化、对抗和感知损失以及自适应群归一化。
			> 分词器仅通过连续、非量化潜在变量的 MSE 重建进行训练。
			> 我们进一步扩展该架构，支持运行时可调时空压缩，方法是将 Mukhopadhyay 等人（2025）的方法调整到因果卷积。
			> 这使得压缩比与重建保真度之间实现了灵活权衡。
			> 完整的建筑细节见附录 B。
* Walrus-RTI-2606.01470 Walrus 微调解不稳定流，zero-shot 应用于实验 IC 与未见稳定分层 regime
	* "Emergent Transfer of a Physics Foundation Model from Simulation to Laboratory Turbulence"
		* Mukhopadhyay, Payel; Nixon, Stefan S.; Watteaux, Romain; McCabe, Michael; Bietti, Alberto; Cho, Kyunghyun; Diaconu, Cristiana; Espejo, Irina; Fouhey, David; Golkar, Siavash; Hehir, Tom; Ho, Shirley; Kovalic, Jake; Krawezik, Géraud; Lanusse, François; Marwah, Tanya; Morel, Rudy; Pettee, Mariel; Qu, Helen; Shen, Jeff; Sotoudeh, Hadi; Dalziel, Stuart B.; Cranmer, Miles
		* Polymathic AI, Cambridge, Flatiron, NYU, Princeton, Yale, Paris-Saclay, Wisconsin-Madison
		> created on 2026-07-21 by OpenCode + GLM-5.2
	* 定位：Walrus 下游应用 + sim2real 实证研究；非架构创新
		* 用 Walrus-2511.15684 1.3B checkpoint 作起点；预训练中显式排除 RTI（Appendix 8.1）
			* 术语 RTI = Rayleigh-Taylor instability
		* 与 Walrus 原论文关系：架构、patch-jittering、tokenize 等细节见原 Walrus 文献笔记（AISClit7），此处不重复
	* 模型变体链（全文统一记号）
		* $W_{pre}$：预训练 checkpoint（RTI 排除）
		* $W_{DNS}^{3D}$：$W_{pre}$ 在 3D DNS 上 finetune 的输出（用于 Sec 4 仿真评估）
		* $W_{DNS}^{2D}$：$W_{pre}$ 在 2D DNS slices 上独立 finetune 的输出
			* 用于 sim-to-real zero-shot
		* $W_{DNS+Exp}^{2D}$：$W_{DNS}^{2D}$ 在 2 个实验样本上继续 finetune 的输出（实验适配）
		* 以下 zero-shot 结果均基于 $W_{DNS}^{2D}$，未经任何实验数据训练；{_q7of4e}
	* 核心洞察：基础模型未记忆训练分布，学到 IC 结构→late-time regime 依赖；{_q7oa3m}
		* 前置：RTI sim-experiment α 差异有三候选解释（初始条件/Sc 数/数值界面扩散），见下文 RTI 背景段
			* 记号：α 为 RTI 晚期混合层增长系数，$h(t)\sim\alpha A_t g t^2$
		* 同一权重 $W_{DNS}^{2D}$：DNS IC 下 α≈0.02；实验 IC 下 α≈0.07（Fig 8）
			* 非记忆特定 α 值；是学到 IC→α 的物理映射
			* t≳50 进入平台；唯一差别是输入：干净 DNS 帧 vs 携带大尺度初始结构的实验帧
			* L（context length）=1/2/3 三独立训练均显示同样上移（Appendix 8.11）→ 非 context length 侥幸
				* L=1 极端情形仅见单帧实验 IC，仍正确进入实验 regime
		* 控制实验：未 finetune 的 $W_{pre}$ 在实验 IC 产出不稳定 rollout（Appendix 8.12）
			* 排除任何 smooth propagator 都会 drift 到实验 regime 的平凡解释
			* RTI specialization 须由 DNS finetune 显式获得
		* （AI 评）"sim-to-real" 包装的实质是 IC regime transfer
			* 同一物理方程（Boussinesq RTI），同一权重，不同 IC 分布→不同 α
			* 模型学到 IC→α 映射，OOD IC 上仍产生物理正确响应
		* （AI 评）论证脆弱点：IC→α 映射的物理真实性
			* 核心论证：仅用实验 IC 模型就进入实验 α band → IC 在 α 差异中起关键作用
			* 隐藏假设：模型学到 IC→α 映射是物理真实的，非 OOD 误响应
			* Appendix 8.12 控制：未 finetune 的 $W_{pre}$ 失败 → 排除 smooth propagator drift
			* 仍可能：DNS finetune 后模型对 OOD IC 产生系统性误响应，恰好落在实验 α band
			* 未做的关键控制：构造合成长波 IC 测模型是否也产生 α≈0.07
				* 若合成长波 IC 进入实验 regime → 强化"IC 物理结构决定 α"
				* 若不进入 → 现有结果是实验 IC 特异性响应，α band 吻合仍需解释
	* RTI 背景：长期 α 差异的三种候选解释
		* 初始条件：实验室装置的低 k 扰动结构 DNS 难建模（leading candidate）
		* Schmidt 数：实验室 Sc~O(10³) vs DNS Sc~O(1)
		* 数值界面扩散：标准码人工模糊密度跃变
	* 第二个 zero-shot：稳定分层 regime 完全未见；{_q7oc3a}
		* 训练仅含 unstratified RTI；推理时给稳定分层初始条件
		* 稳定分层中密度梯度反向，浮力从驱动不稳定变为抑制混合的恢复力
		* 模型定性正确：混合层被限制在中面附近，未恢复 unstratified 行为
		* 但定量 confinement 弱于 reference DNS（Fig 10c）
		* 200 步 rollout 持续减速，超出 finetune 时 rollout 最大 100 步
		* （AI 评）confinement 偏弱的物理含义
			* 论文声称"模型编码了浮力驱动流动的物理理解"
			* 但 confinement 系统性弱于 reference，方向是过度混合
			* 替代诊断：模型未真正理解浮力物理，而是向训练分布（unstratified 自由混合）偏移
			* OOD regime 下的偏差方向恰好指向训练分布，暗示平滑外推而非抽象表征
			* 若是真正理解浮力，偏差方向不应系统性地偏向 unstratified
	* 训练侧：两阶段 finetune 设计
		* 第一阶段：$W_{pre}$ 在 3D DNS 上 finetune 得 $W_{DNS}^{3D}$
			* 5 个 256³ Boussinesq → 128³ 块平均；3 训/1 验/1 测
			* context L=3；delta-prediction + MAE loss
			* 块平均下采样（非重叠 2³ cell）保局部守恒，类有限体积粗化
		* 2D 版本：从 3D DNS 切 2D slices，$W_{pre}$ 在其上独立 finetune 得 $W_{DNS}^{2D}$
			* context L=2；10 slices/realization
		* 第二阶段实验适配：$W_{DNS}^{2D}$ 在 2 个实验样本上继续 finetune 得 $W_{DNS+Exp}^{2D}$
			* lr 比第一阶段小 50×，故意设轻量以保留 DNS 先验
			* 5K steps，bs=1；6 个 2D slices 切分（2 训/1 验/3 测）
			* 效果：改善 transient 阶段对实验释放结构的捕捉，late-time α 已由 zero-shot 达到
		* 样本效率：1-3 个 DNS 实现已可恢复大尺度物理；增 DNS 实现仅优化高频
			* table 2 带平均谱误差：1 实现 0.107/0.293，3 实现 0.042/0.079
		* checkpoint 选择基于物理诊断，非 pointwise val loss；{_q7pa4d}
			> 3D finetuned 模型的 checkpoint 选择基于验证实现 $\mathcal{S}_4$ 上的表现（Appendix 8.3）
			> 在保存的 checkpoint 中保留 KE(t) 与 δPE(t) 全局能量演化与真值最一致的那个，而非仅按逐点 loss 选择
			* 反映 PDE 基础模型评估特殊性：val loss 不等于物理忠实度
	* 推理侧：自回归 rollout（即 delta-prediction 反馈）
		* 前 L 帧输入，每步预测下帧增量，反馈作输入
	* 数据与代码；{_q7pc1d}
		* 3D RTI DNS（5 个 256³→128³）：HF datasets/pmukhop/rti-dataset-boussinesq
		* 稳定分层 RTI 评估数据：HF datasets/pmukhop/rti-stratified-data
		* finetuned checkpoint：HF pmukhop/rti-walrus-model（safetensors + pth + yaml）
		* Walrus 训练代码：github.com/PolymathicAI/walrus（MIT）
		* 实验室实验数据（6 个 2D slices）未公开；DNS 生成码 TurMix3D 未公开
* 2606.11657 Walrus 机理解释：剪切流输出目测接近时，单层 SAE 的物理相关不能单独证明模型机制
	* 注：GLM5.2 版 TLDR：Walrus 中间层 SAE 探表征，单步预测目测无偏但表征未稳定对应物理
	* "Sparse probes and murky physics: a case study of interpretability challenges in a foundation model for continuum dynamics", FM4Science @ ICLR 2026
		* Katherine Rosenfeld；Maike Sonnewald；
		* Gates Foundation；UC Davis
		> created on 2026-07-26 by Codex + GPT-5.6-Terra-high
	* 定位：不改 Walrus 的表征审查，问内部表征能否稳定对应已知物理
	* SAE 只是诊断坐标系，不是自动发现机制；{_q7qj9l}
		* 第 20 个 Transformer 块的空间混合层激活，训 8 倍扩张 Top-K SAE，sec2.4
			* 得 22,528 个特征
			* 同一字典用于全部轨迹，才能比较同一特征的跨轨迹激活
		* 稀疏特征可逐个探测，仍不自带物理语义
		* 未报告独立评测集的重构保真度、随机种子稳定性或特征对预测的保留度
	* 相关性筛选只生成候选
		* Sim50 作参考轨迹，按特征空间总激活和 $\mathcal{E}(t)$ 的 Spearman $\rho$ 排序
			* $s_j(t)=\sum_x a_j(x,t)$，sec2.3、3.1
		* 100 次置换的 99% 阈值为 $\rho=0.30$，最高特征为 $0.85$
		> 约 10% SAE 特征超过此阈值，说明 $\mathcal{E}$ 的区分性不高，sec3.1；{_q7qk1c}
		* 换 $\dot{\mathcal{E}}$ 后最高 $\rho=0.50$，阈值 $0.48$
		* （AI 评）正文为约 10%，附录图 8 为 6%，比例不一致
		* （AI 评）阈值的统计含义不足以支持物理解释
			* 未说明怎样控制 22,528 次筛选的多重比较
			* 随机打乱会破坏时间相关性，宜只作候选排序
			* 仅 100 次置换估计 99% 尾部分位，阈值本身也不稳
		* （AI 评）Sim50 的选择规则也不一致
			* sec2.3 取最高中位 $\dot{\mathcal{E}}$
			* 附录图 7 取最大平均绝对 $\dot{\mathcal{E}}$
	* 跨条件比较未能给出稳定解释
		* Sim50、Sim56 的 $Re,Sc$ 均不同
			* $t=15$ 时，按全部模拟合并排序的前 10 个特征有相近空间激活，sec3.2、图3、4
		* 后续时刻缺乏持续一致性，不能把局部热图直接命名为涡旋或界面特征；{_q7qk1d}
		* 各时刻均以 6 个真值历史步作输入的单步预测，不是自回归 rollout
		> 即使输出层能合理复现剪切流，内部编码也未清楚对应所检验的物理分解，sec4
	* 输出谱偏差也不能替代表征证据
		* Sim50 的两次单步预测目测接近，但能谱在中等波数低估、高波数高估，sec2.2
		* 输出可表现为过弥散或过度局部化，特征也可稀疏而空间不连贯
		> 输出层误差与内部表征的关系仍不清楚，sec3.3
	* （AI 评）现有负结果只限制单层 SAE 加单指标筛选的解释力
		* 不能据此否定 Walrus 已学到物理，也分不清模型失配和探针失配
		* 机制证据应先挑候选，再验参数、时间、种子与输出失效模式的稳定性
		* 还应干预候选特征，比较物理量、预测误差和对照特征的响应
## Poseidon
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
* 2602.15004 Poseidon 微调用于火星大气预报，为适配 3D 引入 z-注意力模块
	* "PDE foundation models are skillful AI weather emulators for the Martian atmosphere"
		* Schmude, Johannes; Roy, Sujit; Wang, Liping; van Kessel, Theodore; Klein, Levente; Freitag, Marcus; Bentivegna, Eloisa; Manson-Sawko, Robert; Lutjens, Bjorn; Maskey, Manil; Watson, Campbell; Ramachandran, Rahul; Bernabe-Moreno, Juan; 
		> created on 2026-03-20
	* 挑战：数据受限，无 ERA5
	* 其他方法：架构设计嵌入物理知识，从地球气象模型迁移学习；本文关注基础模型迁移
	* 数据集：OpenMARS v5 再分析数据，经纬网格；{_q3kl07}
		> 我们所有实验均使用 OpenMARS 数据库第 5 版的再分析数据 （Holmes 等，2020）。
		>  数据的原始形式分辨率为五度，像素 36×72 分布在规则的纬度/经度网格上。
		> 有 35 个垂直的西格玛等级。
		> 垂直坐标定义为相对于表面压力 ps 的压力。
		>  σ=p/ps 数据集中的最高层， σ=5.0824954×10−5 位于约 105 公里的高度。
		> 数据集包含温度（ T ）以及东风（ u ）和北风（ v ）作为垂直变量。
		> 在地表层，我们有地表压力、地表温度和地表二氧化碳冰。
		> 最后，还有尘埃通过大气产生的光学深度。
		> 在我们的实验中，我们只在σ级杠杆，利用 u ， v T 。
		> 此外，我们从 sol 2674.416748 到 sol 训练， 5348.750000 并用 sol 5348.833496 到 6031.000000 。
		> 这对应于训练的火星年 28 至 31，验证的火星年 32。
		> 原则上，OpenMARS 数据集包含火星 28 年至 35 年的数据。
	* 数据处理：样条插值到 128×128；通道处理，数据 T 通道替换原 ρ 通道，原 p 置零
		> 为了匹配波塞冬数据集的固定分辨率和宽高比，我们通过样条插值将 OpenMars 数据插值到相同的分辨率—— 128×128 像素。
		> 鉴于预训练数据中通道的原始顺序为 ρ ， u ， v ， p ， ，我们将 OpenMars 通道排序为 T ，u , v；p 输入通常设为零。
		> 我们采用传统的标准缩放。
			> 缩放参数取决于通道和 level;但不是纬度或经度。
			> 统计数据是从训练数据中计算的。
	* 数据掩码，稀疏化训练，原 p 通道用作 mask；{_q3kl5u}
		> 稀疏性：在某些实验中，我们会对数据进行稀疏化。
		> 这意味着我们随机抽取一组纬度/经度位置，这些位置我们要么保留，要么丢弃整个垂直列。
		> 在此过程中，我们不再将第四通道（最初训练为压力 p ）设为零，而是填充一个二进制掩码，表示数据的存在或缺失。
	* 3D 适配：每个 SWin 层后引入新层，执行跨 z（海拔）注意力；有额外位置编码；{_q3kg33}
		* ConvNeXt 不调整
		* 为复用原代码 组织张量 shape，除跨 z 注意力外，其余情形把该维度并入 bsz
		> 沿垂直方向的轴向注意力需要合适的额外位置编码。
			> 我们学习的不是层级特定的学习嵌入或傅里叶类型的嵌入，而是学习一个将西格玛坐标映射到合适嵌入的函数。
			> 该功能是一个具有 GELU 激活的两层 MLP。
			> 这意味着我们可以在训练时未见到的层级上进行推断。
	* baseline 仅包括随机初始化的 Poseidon？
* 2603.15431 （备用）Poseidon OoD 用 PDE 残差 loss 微调，针对 Poisson 方程
	* "Physics-informed fine-tuning of foundation models for partial differential equations"
		* Medvedev, Vlad; Armbruster, Leon; Straub, Christopher; Kruse, Georg; Rosskopf, Andreas; 
		> created on 2026-04-02
* ARC-STAR-2605.22222 PDE 基模冻结、学后处理修正网络，全局+更新剧烈的局部块；实验仅 Poseidon
	* "ARC-STAR: Auditable Post-Hoc Correction for PDE Foundation Models"
		* Li, Chengze; Wei, Lingwei; Sun, Li; Lv, Hongbo; Yang, Jie; Zhang, Hanrong; Zheng, Kening; Huang, Wei-Chieh; Ma, Enze; Yu, Philip S.;
		* University of Illinois Chicago，北邮，华北电力
		> created on 2026-07-19 by OpenCode + DeepSeek-V4-Pro
	* 方法全称：Adaptive Risk-Calibrated Spatial Triage for Auditable Refinement (ARC-STAR)
	* 场景：PDE 基模（Poseidon、DPOT 等）部署时 rollout 误差累积
		* 不想微调主模型（不稳定且贵），希望主模型冻结、加轻量修正层；{_q7jj3t}
		* 现有三条路：微调主模型（不稳定），全场 dense 后处理（浪费计算），手写空间指标路由（如涡度，不保证与误差分布对齐）
	* 方法概述：学后处理校正网络，先学全局校正，再叠加块状局部校正器 sec3.1:-1
		> ARC-STAR 通过三个阶段来处理这个被冻结的数据结构，这一过程与图 2 中的三个处理步骤相对应。
		> 第一阶段（图 2.I）中，系统会训练一个全局校正器 Gϕ ，以消除整体上的偏差（详见 3.2 节）。
		> 第二阶段（图 2.II）中，系统会在全局校正后的残差数据上，使用块状局部校正器 Lθ 来进行进一步处理。
			> 该过程遵循“光环读取、中心写入”的原则。
			> 算法 1 将这一过程分为两个步骤：首先是密集的块级预训练步骤（步骤 2a），然后是使用 k=B 进行的自回归微调步骤（步骤 2b）。
			> 这样一来，局部校正模块就不必依赖具体的部署方案，且可以在不同部署方案之间重复使用，而无需重新训练（详见 3.3 节）。
		> 第三阶段（图 2.III）则是实际应用阶段：系统会无标签地对各个块进行排序，然后根据“光环读取、中心写入”的原则，将全部数据或其中的前 k 个块发送给 Lθ 进行处理（详见 3.4 节）。
			> 在整个过程中， {Ωb}b=1B 表示将空间域划分为若干个互不重叠的块； Ωb+h 则表示同一个块经过扩展后形成的、宽度为 h 的“光环区域”。
			> 本地精化器读取的是 Ωb+h ，但实际写入的却是 Ωb 。
			> 该合约是实现高效且精确推理的关键：当为 k=B 时，同一个经过训练的本地模块会处理所有数据块；而当为 k<B 时，该模块仅处理部分数据块，无需重新训练。
	* 推理方式：冻结主模型，两阶段修正 全局+块状局部，局部选块依据时间更新幅度
		* 消全场偏移：$G(x_t, x̂_{t+1})$ 输出速度通道残差，加入主模型预测得到 $x^g_{t+1}$（方法 §3.2）
		* 消局部残差：blockwise $L(x_t, x̂^g_{t+1})$
			* 每块输出：16×16 块；为消块边界伪影，Hann 窗保中间幅值、到边缘衰减到 0，secD.1.3；{_q7jh9r}
				* （评）patchify 边界位置无法有效被 L 修正，因此处 Hann 窗衰减明显；不过 G 修复能力保持
				* 衰减宽度小：（from AI）紧邻边界的第二圈像素权重虽然低（~0.04），但不为 0。离边界稍微往里两三个像素，权重就上来了
			* 每块输入：pad halo=8 得 32×32（读邻域写中心）sec3.3；{_q7jh9b}
		* 局部性动机：全场修正后的残余误差空间上高度集中，非均匀分布；{_q7jh7r}
			* 图1：top 20% 空间块承载 38%–64% 残余误差，平均 Gini 0.48
			* 集中模式与湍流结构相关、跨主模型一致（Poseidon 和 DPOT-Ti 上都出现，附录 H）
			* 因此全场 dense 修正浪费算力，需要 blockwise 选择性修正
		* L 只修部分块以降计算量，选块依据时间更新幅度
			* 选块方式：label-free routing score（innovation_keg, Eq5），选 top-k
			* 基于预测场在时间步间的变化量，无需真值（§3.4）{_q7jh9k}
				* 直觉：预测场连续两步间变化剧烈 → 该区域"不确定"→ 需 L 介入
			* 与 9 种替代路由策略对比，同算力下追到最低或接近最低的误差前沿
			* （AI 评）与卡尔曼滤波的 innovation（观测-预测差）概念呼应；这里用时间差分替代，绕开真值依赖
		* 可审计性：G 和 L 独立，误差改进可分解为全局份额 A 和局部份额 (1-A)·J_loc
			* Eq11: 1-L_hyb/L_raw = A + (1-A)·J_loc，
			* 其中 A = 1-L_glob/L_raw, J_loc = 1-L_hyb/L_glob（§3.4）
			* 部署时诊断：新 regime 上全局修正不够还是局部残余太大
			* NS-G Ext. 是唯一 J_loc 很低的 cell（9.6%），审计正确标记它不适合 L，因为后全局残余不是空间局部化的
	* 训练方式：分阶段串行，保证 L 看到的输入分布与部署时一致
		* 阶段 1，训 G：自回归 5 步 rollout，主模型冻结（方法 §3.2）
		* 阶段 2，训 L（G 冻结后）：先 patch 预训练（3000 步，密集采样），再自回归微调（200 epoch，budget k/B=1，即全块）（方法 §3.3，算法1）
		* 串行训练的设计要点：G 训完冻结后 L 才训，L 在训和部署时看到的是同一个 (H, G) 的输出，消除训推分布差异
	* 实验：5 类流体 benchmark（NS、KF、NS-SL、NS-PwC、NS-Sines）各两个粘度，10 regime cell
		* 主模型 Poseidon（frozen），自回归 rollout 10 步，速度通道 relative L2
		* G 单独降 raw error 91–99%；L 进一步降后全局残余至多 94.4%
		* ARC-STAR 是唯一在每个 cell 上将 rollout error 降至 raw 的 1/36 以下的方法
		* 对比 Poseidon 参数高效微调（full-param、partial、LoRA r=8），9/10 cell 胜出
		* 跨主模型：Poseidon 移植到 DPOT-Ti，效果保持（附录 H）
		* （AI 评）DPOT-Ti 仅一个额外主模型，不够证明"host-independent"。应测更多（MPP、PROSE-FD）
	* 与已有后处理修正手段的关系
		* vs PDE-Refiner：都修正 rollout 误差，但 Refiner 每步内迭代自精化（去噪目标），ARC-STAR 是外挂串行修正+计算预算路由
		* vs PhysicsCorrect：PDE 残差单步 Newton 修正（无需训），但需已知 PDE 形式和特殊离散格式；ARC-STAR 用 learned correction，不依赖方程形式
		* （AI 评）vs SPINO denoiser/corrector：CNN 修正与主网络同步训练；ARC-STAR 的 G 和 L 独立于主模型
	* （AI 评）局限
		* G 和 L 依赖有监督训练（需真值），不能像 PhysicsCorrect 零样本部署
		* blockwise 接口假设规则网格（16×16），散点/非结构网格需改 patchify 或等效机制
		* innovation score 依赖时间差分，稳态或大时间步场景可能失效
## PROSE
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
* 2512.16074 DeepONet 引入类 DeepSet 超网络学示例样本对，称为非注意力的上下文学习；{_q1qf13}
	* "In-Context Multi-Operator Learning with DeepOSets"
		* Chiu, Shao-Ting; Nambiar, Aditya; Syed, Ali; Siegel, Jonathan W.; Braga-Neto, Ulisses; 
		> created on 2026-01-26
* PI-MFM-2512.23056 PROSE 用 PINN loss 训，针对 1D 含时 PDE；{_q14j3e}
	* "PI-MFM: Physics-informed multimodal foundation model for solving partial differential equations"
		* Zhu, Min; Sun, Jingmin; Zhang, Zecheng; Schaeffer, Hayden; Lu, Lu; 
		> created on 2026-01-04
	* [作者公众号全文翻译](https://mp.weixin.qq.com/s/LT1ZBWpIYhbRlMAGeJ7cvg)
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
## ICON
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
* ICM-2604.23098 ICON 上下文式预测本构关系，条件为平衡方程系数（而非目标映射输入输出对），实验围绕超弹性力学；作者李卓远、杨柳等
	* "In-context modeling as a retrain-free paradigm for foundation models in computational science"
		* Li, Lingfeng; Li, Zhuoyuan; Li, Shun; Zhan, Kaixin; Gao, Huajian; Chen, Changqing; Yang, Liu; 
		> created on 2026-06-27
	* 摘要摘录
		> 该模型通过控制方程以无标签的方式被训练出来，因此能够适用于各种不同的材料、几何形状和加载条件。
		> 在超弹性研究中的应用表明，该技术可以与有限元仿真相结合，其有效性也得到了实验数据的验证。
		> 此外，随着数据多样性和计算资源的增加，该模型的性能也会提升，展现出与大型基础模型类似的良好扩展性。
	* 引言 建模任务，常规范式基于优化，有其局限
		> 我们认为，有三个根本性的瓶颈阻碍了这种泛化能力的提升：
		> 一是目前盛行的“通过优化来建立模型”的方法论；
		> 二是未能充分利用支配系统的物理规律；
		> 三是无法有效利用数据和计算资源来实现模型的扩展。
		> 现有的方法都是通过针对特定情况的优化来将物理关系纳入模型参数中，这使得模型难以适应新的系统。
		> 此外，由于未能将系统的本质物理结构与外部因素区分开来，往往会导致虚假的相关性，从而进一步限制了模型的泛化能力。
	* 本构问题设定：eqn(3) 离散化平衡方程 $\sum_eA^{ne}g(I^e)=0,\forall n$
		* $g$（物理意义 $g=\nabla_I\psi$）未知，需学出
		* 求和 $e\in N(n)$ 遍历节点 n 的所有邻居
		* eqn(20) 完整物理场景 BC 位置 RHS 非零，为给定载荷
		* 方程导出方式见 method 章节
		* 问题代表性：其他问题有类似数学形式，如 eqn(5) 质量守恒的扩散过程，浓度 到 扩散张量 的本构对应关系待学
	* 上下文条件：eqn(6) 每节点 n 提供一个 token，含多 sub-token（每个邻居 e 一个）$(A^{ne},I^e)$
		* 最终上下文 $C=\{\{(A^{ne},I^e)\}_e\}_n$；{_q6rk6g}
		* 网络表达映射 $(C,I)\mapsto g(I)$；{_q6rk3a}
		* 架构 fig1d
			* 各 e sub-token embed，自注意力，结果 pooling 得 token embed
			* 多层，每层内 各 n token 自注意力，query $I^e$ 对所有 n token 交叉注意力
		* 测量构建：对真实材料，构造该输入条件需 物理观测位移场（均匀网格）+ 插值到人造三角网格 secC.3
			> DIC 提供了在规则像素网格上各跟踪点的坐标和位移信息。
			> 我们对测量得到的位移场进行了去噪处理，
			> 并利用径向基函数插值器将其插值到三角网格上。{_q6rk01}
				> 该插值器采用了薄板样条核函数以及一次多项式函数作为插值方式。
				> 所生成的三角网格与 ICM 模型训练时所使用的网格类似。
				> 我们以每个点到其第 7 近邻点的距离的中值作为特征点间距 h ，该距离是在二维坐标系中计算的。
				> 插值器的平滑参数则定为 0.05h² 。
				> 这样的设置使得在采样良好的区域内能够得到准确的插值结果；同时，也能有效抑制测量噪声。
				> 对于那些未被 DIC 数据完全覆盖的区域（比如边界处），该插值方法也能提供稳定的插值结果。
			> 为了提高计算效率，每个网格节点上的插值运算都使用固定大小的局部邻域范围（此处为距离最近的 100 个 DIC 点）。
			> 为确保推理的可靠性，我们识别出了那些由于局部 DIC 数据不足而可能导致插值位移不准确的网格节点。
				> 具体而言，我们以 DIC 点中距离该节点最近的点的距离的中位数作为参考邻域半径 hn 。
				> 如果某个网格节点周围有至少 ne/2=4 个 DIC 点位于半径 hn 范围内，那么该节点就被视为可靠的；否则，该节点就被视为不可靠的。{_q6rk0i}
				> 在 ICM 推理过程中，只有可靠的节点才会被用来生成变形标记，这些标记则被用作推理的上下文信息。
	* （评）常规上下文学习提供 $(I^e,g^e)$，此处不显式提供各 $g^e$，而是仅给出 $(g^e)$ 满足的方程
		* 该代数方程未必是常规有唯一解的线性方程，方程数、变量数未必相同
		* 不过在归纳偏置存在情况下仍可找出这些数据表达的映射；{_q6rk37}
	* 无监督训练：eqn(7) 网络输出的 $g(I)$ 再次代入离散平衡方程，残差作为 loss；{_q6rk5h}
	* 数据设计，训练、测试所用依据不同
		* 训练集
			> 为了构建一个涵盖多种情况的训练数据集，我们基于多项式应变能函数，建立了 2,000 种超弹性材料模型（详见补充材料 1）。
			> 这些模型分别与七种不同的板状结构相结合，这些板状结构上具有不同数量和排列方式的圆形或椭圆形孔洞（见图 2a）。
			> 每种结构都经历了单轴拉伸、双轴拉伸以及平面剪切作用，从而产生了复杂的、不均匀的应变场。
			> 总体而言，该数据集包含了超过 5 亿个变形数据点，充分反映了超弹性材料的各种力学响应特性。
		* 测试集，多样性递增：同分布，改应变能形式（依据真实材料模型），再改几何，再增大载荷
			> 为了验证模型的泛化能力，我们构建了四个测试集，这些测试集的数据多样性逐渐增加：
			> (i) 在 Test-ID 中，我们用 400 种全新的多项式超弹性模型来替换训练数据中的模型，同时保持训练时的几何形状和加载方式不变，以此来评估模型在相同数据集上的预测能力。
			> (ii) 在 Test-M 中，我们加入了 500 种来自其他四种常见应变能量形式的材料，分别是 Ogden 模型、Pucci-Saccomandi 模型、Exp-ln 模型以及 van der Waals 模型（详见补充材料 1.1）。
				> 这些材料的加入同样是在保持训练时的几何形状和加载方式不变的条件下进行的。
			> (iii) Test-MGL 与 Test-M 使用相同的材料，但将其与五种全新的几何形状以及更多的加载方式相结合（见图 2b）。
			> (iv) Test-MGL+则进一步将 Test-MGL 中的最大加载幅度提高了 10%。
			> 这种逐步构建的方法有助于我们从多个角度来评估该模型在面对日益复杂的、未经验证的情境时的表现。
			> 这些情境包括各种新型材料，以及各种前所未有的几何结构和载荷条件。
		* 差异解释
			> 训练集与测试集之间的显著差异如图 2c 所示，其中清楚地体现了两者在应力水平上的巨大差异。
			> 图 2d 则展示了各数据集中变形状态的分布情况。
			> 值得注意的是，测试集所涵盖的范围超出了训练集的范畴，这反映了材料、几何形状和载荷等方面的变化所带来的综合影响。
			> 因此，这些测试集为评估模型在非训练数据上的泛化能力提供了理想的测试环境。
		* 数据集、生成代码 均随模型训练代码公开；{_q6rm52}
	* 学后机制解释：表示学习，对所得隐表征算 t-SNE，验证相邻点对应相似的应力应变本构关系 fig5
		> 该可视化结果表明，
			> 在 t-SNE 流形中，{_q6sm4r}
			> 相邻的点所对应的变形场的应变能密度函数几乎完全相同，
			> 而与所涉及的物质类型或应变能的绝对值无关。{_q6sm48}
			> 此外，即便这些变形场源自不同的几何结构或加载方式，只要它们的应变能密度函数具有相似的形态，那么它们所对应的潜在区域也有可能处于相邻的位置。{_q6sm65}
		> 这些观察结果表明，ICM 完全符合我们的设计预期：
			> 通过处理海量数据，ICM 能够识别出一种由应力-应变关系所决定的内在结构。{_q6sm8w}
			> 这一内在结构并不受材料类型、应变能量大小、几何形状或加载条件等外在因素的影响。
			> 通过将复杂的物理情境映射到这一内在结构上，ICM 实现了基于上下文的推理机制，从而实现了之前所展现出的强大泛化能力。
		* （评）大致手段链：评估训练后网络合理性可靠性
			* ← 内部运行机制拆解分析
			* ←（对象细化）中间层激活值隐表征分析
			* ←（标准与预期性质细化）激活值与任务关键特征（应变能函数而非物质类型/应变能绝对值）相关性高
			* ←（具体分析方式选取）激活值 t-SNE 下位置邻近性 反映 任务关键特征相似性
	* 训练 scaling law fig6
		> 在证明了 ICM 在测试阶段的出色扩展能力之后，我们现在来研究其在训练阶段的性能表现。
		> 具体来说，我们从两个相互独立的方面来考察预测误差的降低情况：(i) 训练所需的计算资源；(ii) 训练数据的多样性（见图 6）。
		> 为了更准确地分析这些因素的影响，我们进行了两项互补的研究：
		> 一项是固定数据集的情况下，研究模型规模和计算资源的调整对性能的影响；
		> 另一项则是固定模型规模和计算资源的情况下，研究训练数据多样性对性能的影响。
* Chop-2606.12318 ICON 用于预训未见算子时不微调，输入输出作用一系列简单变换，简化后算子求解可靠
	* "Harness In-Context Operator Learning with Chain of Operators"
		* Minghui Yang; Ling Guo; Liu Yang;
		* 上海师范，NUS
		> created on 2026-07-25 by OpenCode + GLM-5.2
	* 方法全称：Chain of Operators
	* 前置：ICON（In-Context Operator Network）通过上下文对隐式推断算子，不动权重即可适配新算子
		* 但 target 算子偏离训练分布时仍失效
	* 核心诊断：OOD 失败非模型容量不足，是目标算子落在模型可靠推断算子的 regime 外
		* 前作 ICON-2401.07364 已示：简单 affine rescaling 对齐 shifted PDE 即可恢复精度
			* 说明 OOD 失败是 prompt-regime 不匹配，非模型本身局限
		* 因此解法不是更新参数（让模型更强），是重构 prompt（让任务回到模型可靠 regime）
		* 类比 LLM harness engineering：不改参数改 prompt
		* 类比 Chain of Thought：把难问题拆成简单子任务序列
	* （评）仿依赖类型论记号，普通 ICON: $n\mapsto(x_1,y_1,\dots,x_n,y_n)\mapsto x\mapsto y$
		* 场景：目标算子（末映射）$\phi: x\mapsto y$ 偏离 ICON 预训练分布，导致倒数第二个映射 在当前输入形态下 网络输出与真输出偏离大
		* 方法：输入输出变换，$\phi$ 拆为 $x\xmapsto{F_x}x'\xmapsto{\phi'}y'\xmapsto{G}y$，使 $\phi'$ 在 ICON 预训练分布内
		* 原文所谓 prompt 变换 $F$ 对应 $F(x,y)=(x'=F_xx, y'=G^{-1}y)$
	* 方法：$F \to \text{Icon} \to G$ 链（sec3）
		* $F$（prompt 侧）把 prompt 变换到 Icon 训练时熟悉的表示空间（归纳空间）
		* Icon 在归纳空间预测，$G$（预测侧）把预测映射回原输出空间
		* 松弛条件 eqn(9)：设 $T$ 为目标算子，$T'$ 为变换后 Icon 需近似算子
			* $G(T'(F(x))) \approx T(x)$，且 Icon 对 $T'$ 的预测误差远小于对 $T$
			* 不要求 $G = F^{-1}$：$G$ 可含投影、约束施加、残差校正
	* $F$ 形式：预设变换，零可训参数；{_q7ph0y}
		* 所有变换常数从 prompt 数据即时估计（均值、方差、位移量）
		* 无需训练，无需超参调优，完全可解释
		* 变换类型
			* 对称变换（sec1:-2 提及，实验未见）
			* 值归一化（affine gauge）：$F$ 侧 $u = (v - \mu)/\sigma$，$G$ 侧逆变换 $v = \sigma u + \mu$
				* $\mu, \sigma$ 从 prompt 中所有上下文样本聚合估计
				* 密度场：$\mu = 0$，$\sigma = \text{RMS}$（保非负，因 $v \geq 0 \Rightarrow u \geq 0$）
				* cost 场：$\mu, \sigma$ 取样本均值和标准差
			* 坐标对齐（平移对称）：cyclic shift 空间网格索引
				* 位移量 $s$ 从最近上下文对估计（最小化中心化输入输出差的 L2）
			* 守恒律投影：L2 投影到空间均值等于查询输入均值的子空间
			* 残差迁移：留一估计上下文预测残差，按输入相似度加权迁移到查询
		* （AI 评）与 AOT-POT 均冻结现有网络、补充新模块以应对未见算子，但方法略有区别
			* 变换类型：AOT-POT 可学变换层，本文用闭式变换
			* 变换对象：AOT-POT 针对网络内部隐层，本文针对输入输出
	* 守恒律链（sec4.1）：$F$ = shift + scale，$G$ = unscale + unshift + mass
		* shift 利用周期边界下平移对称性，对齐上下文对到共同空间帧
		* mass 投影消除 rollout 中质量漂移，防止误差跨步累积
		* 三种 OOD flux（sin-cos, tanh, Buckley-Leverett）rel-L2 降 35-52%
		* 10步 rollout 维持 15-27% 降幅（单步降幅收窄，误差仍累积，mass 投影不能完全阻止）
	* MFC 链（sec4.2）：$F$ = value norm，$G$ = inverse value norm + residual transfer
		* residual transfer（Algorithm 3）核心：用上下文已知预测误差校正查询
			* $\mathcal{B}_0$ 为 Raw Icon 预测函数，$\mathcal{C}_{-h}$ 为排除第 $h$ 对的上下文
			* 留一残差 $R_h = y_h - \mathcal{B}_0(\mathcal{C}_{-h}, x_h)$，$x_h, y_h$ 为第 $h$ 对输入输出
			* $\Pi_{h\to*}$ 将残差从 $x_h$ 位置搬运到查询 $x_*$ 位置（插值/投影）
			* 加权校正量 $\Delta^* = \sum_h w_h^* \Pi_{h\to*}(R_h)$，$w_h^*$ 按 $x_h$ 与 $x_*$ 相似度
			* 留一交叉验证拟合标量 $\hat\alpha \in [0,1]$，最终校正 $\hat\alpha \Delta^*$
		* MFC 中 $g$ 为代价函数参数，$\rho$ 为密度分布参数
			* g-param 任务变化 $g$ 而 $\rho$ 固定，ρ-param 反之
		* 9 个 g-param 任务降 19-86%；6 个 ρ-param 任务无改善
			* 归因：value norm 对条件（cost $g$）和目标（density $\rho$）做同一变换
			* 但二者物理量纲不同，共享 rescaling 不一致
			* 消融：去掉 value norm 只留 $G_{\text{res}}$，ρ-param (1,2) 改善 37-42%
				* 说明 residual transfer 独立有效，value norm 对 ρ-param 有害无益
	* 推理时决定是否启用变换：in-context cross-validation（eqn 15）
		* 对每个上下文对留一，比较 chain 和 Raw Icon 预测误差
		* 选误差小者用于实际查询，无需真值标签
		* 让链在无效时自动回退到 Raw Icon（如 ρ-param 任务）
	* 跨 PDE 迁移（sec4.3）：MFC 链直接用到守恒律
		* rel-L2 降 19-24%，chain 优于 Raw Icon 的样本占比 89-91%
		* 不如守恒律专用链，但正迁移说明链捕捉到跨 PDE 共享结构
	* 链发现：EvE 进化搜索（sec3.2 末），LLM agent 提议改进候选链
		* 仅在单一任务上进化（守恒律: sin-cos；MFC: g-param (2,2) $\ell=0.5$）
		* 论文未展开 EvE 细节，见 [36] arXiv:2605.09018
	* （AI 评）残差迁移的非平凡性
		* 留一残差库 + 相似度加权迁移，本质是"用上下文预测误差做查询的偏差校正"
		* 类似 kNN 回归的偏差校正，但在算子学习的上下文框架下是新的组合
	* （AI 评）"迁移性"与"专用性"的 tradeoff
		* 守恒律链的 shift/mass 强依赖周期边界 + 质量守恒结构
		* 到无此结构的 PDE 上，shift 可能退化为无作用或引入伪影，论文未测此种负迁移
		* MFC 链的 value/residual 更通用，确实迁移到守恒律（sec4.3）
		* 但 sec4.3 也显示它不如守恒律专用链，仅两个 PDE 验证不足以判断泛化边界
	* （AI 评）进化搜索的可靠性存疑
		* 仅单一任务进化出链，迁移到其他任务靠运气还是链本身有通用结构？
		* 论文未报告进化过程的多样性和稳定性（多次 run 是否得到相似链？）
		* 缺乏多次进化运行的稳定性报告，泛化性主张的说服力受限
	* 数据无公开。守恒律数据 WENO 自生成，MFC 标准问题。论文未提代码/数据仓库
