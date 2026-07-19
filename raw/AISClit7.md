* 2511.20798 （备用）Walrus 激活值特征提取，发现涡度、扩散、时间推进等，改网络激活可调整预测结果
	* "Physics Steering: Causal Control of Cross-Domain Concepts in a Physics Foundation Model", NeurIPS 2025
		* Fear, Rio Alexa; Mukhopadhyay, Payel; McCabe, Michael; Bietti, Alberto; Cranmer, Miles; 
		> created on 2026-01-24
	* [知乎翻译](https://zhuanlan.zhihu.com/p/1981077068402926776)
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
* 2507.09264 基于 ViT 的 NO 可调 patch 大小
	* "Controllable Patching for Compute-Adaptive Surrogate Modeling of Partial Differential Equations"
		* Mukhopadhyay, Payel; McCabe, Michael; Ohana, Ruben; Cranmer, Miles; 
		> created on 2026-01-20；Walrus-2511.15684 引用
	* CKM 版类似 FlexiViT 缩放卷积核，编解码卷积核共用；{_q1ka4i}
	* CSM 版固定卷积核，改变 stride，从而各 patch 可以有重叠；{_q1ka4l}
		* 边界使用可学 padding，依据具体 BC
	* 动态 patch-size：时间自回归不同步用不同 patch-size，抑制误差累积；{_q1ka3i}
		* 网络仅预测时间推进的更新量
		> 这种灵活性为静态补丁架构带来了全新的建模能力。
			> 例如，我们展示了在自回归展开期间——误差可能随时间累积——在时间步间交替使用贴片大小可以减轻补丁引起的伪影，如谐波频谱尖峰（见图 2）。
			> 这种伪影减少凸显了在推断时实现斑块/步幅多样性的显现优势，从而对长视野替代建模的稳定性和鲁棒性产生更广泛的影响。
		> sec3:-1 令人惊讶的是，我们发现这种交替展开抑制了频谱伪影 ——即在频谱残差中表现为谐波的周期性误差（见图 2）。
			> 这些伪影在基于固定补丁的 ViT 架构中无处不在，无论注意力类型（原版、轴向、Swin），且仅通过训练无法消除（附录 E）。
			> 交替推出能带来更清晰、更稳定的长期预测。
			> 重要的是，这一发现之所以成为可能，完全得益于我们框架提供的测试时间灵活性——这是之前偏微分方程替代工具完全不具备的能力。
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
* LinearNO-2511.06294
	* "Transolver is a Linear Transformer: Revisiting Physics-Attention through the Lens of Linear Attention"
		* Hu, Wenjie; Liu, Sidun; Qiao, Peng; Sun, Zhenglun; Dou, Yong; 
		> created on 2026-01-08
	* 摘要摘录
		> Transolver……引入了物理注意力以降低计算成本。
			> Physics-Attention 将网格点投影为切片注意力切片，然后通过切割法将其映射回去。
		> 我们观察到物理注意力可以被重新表述为线性注意力的特例，切片注意力甚至可能损害模型性能。
		> 基于这些观察，我们认为其有效性主要来自切片和去切片操作，而非切片之间的相互作用。
		> 基于这一见解，我们提出了一个两步转换，将物理-注意力重新设计为典型的线性注意力，我们称之为线性注意力神经算子 （LinearNO）。
	* fig1 实验雷达图，Transolver 去掉 slice 注意力后，部分数据集上精度提高
	* eqn(8) Transolver 存在多 slice 区分不足的情况
		* 建议 Q,K 所用的线性层独立可学
		* softmax 分别对 n_slice 和 n_pts 取，使最后 $\phi(Q)\psi(K)^\mathrm{T}$ 行归一化
		* 之前 slice, deslice 操作对称导致不会自动跨 slice 特征交换，需 slice 间算注意力；引入非对称性后不再需要注意力；{srs:q18m4j}
		* eqn(9) 最终形式 softmax(Q)(softmax(K)ᵀV)
	* thm1 满足 NO 定义，即可逼近积分算子
* 2511.01830 NO 多保真训练，不同保真度数据比例对结果影响；实验针对 RANS
	* "Towards Multi-Fidelity Scaling Laws of Neural Surrogates in CFD"
		* Setinek, Paul; Galletti, Gianluca; Brandstetter, Johannes; 
		> created on 2026-01-07
	* 摘要摘录
		> 我们通过低保真度和高保真度雷诺平均纳维-斯托克斯（RANS）模拟，研究神经代理模型中数据忠实度与成本之间的权衡。
		> 通过重新表述经典尺度定律，我们将数据集轴分解为计算预算和数据集组成。
		> 我们的实验揭示了计算性能缩放行为，并展示了给定数据集配置下与预算相关的最优保真度组合。
		> 这些发现首次为多保真度神经替代数据集提供了经验尺度定律的研究，并为科学机器学习中高效计算的数据集生成提供了实用考量。
	* fig2,3 改变高保真数据占比下 MSE 变化，固定（数据生成）计算预算条件下；{_q17g2g}
* RNO 基于 Radon 变换的 NO
	* "Solving Partial Differential Equations via Radon Neural Operator", NeurIPS 2025
		* Wenbin Lu, Yihan Chen, Junnan Xu, Wei Li, Junwei Zhu, Jianwei Zheng
		* 2026-01-07
	* fig1 不同 NO 架构的 holism；{_q17g0o}
		* 纯 global：FNO,LNO,Transolver
		* 纯 local：WNO,CNO
		* local+global：FNO+积分，FNO+微分，RNO
* DEC-HOGNN 基于离散外微分的 GNN NO
	* "Boundary-Value PDEs Meet Higher-Order Differential Topology-aware GNNs", NeurIPS 2025
		* Yunfeng Liao Yangxin Wu Xiucheng Li
		* 2026-01-07
	* 摘要摘录
		> 然而，现有方法大多忽视了网格中高阶单元与微分形式紧密关联的内在物理与拓扑意义。
		> 本文提出一种基于离散与有限元外微积分的高阶GNN框架，该框架整合了高阶交互作用机制。
		> 本文以电磁学中的时域无关边值问题（BVPs）为例阐释该框架，其可轻松推广至其他支持微分形式表述的偏微分方程。
		> 同时，我们相应推导出新型物理信息损失项、集成形式估计器及理论支撑。
		> 实验表明，本方法在电磁学边值问题上显著超越现有神经算子。
	* fig1 按离散外微分，k-simplex 特征（点线面体 上的标/向量场）
	* fig2 primal/dual manifold，磁场相关物理量 H,B 外微分形式及相关关系；{srs:q1787h}
		* eqn(7) 电场 E,D 有类似关系
	* sec4.1 GNN 所用图结构，节点为所有 k-simplex，邻居有 4 类，分别做消息传递；{_q17f8p}
		* （评）设 b,c ∈ ∂a, e ∈ ∂b ∩ ∂d，则 b 的 4 类邻居分别对应 a,e,c,d
* PI-MFM-2512.23056 PROSE 用 PINN loss 训，针对 1D 含时 PDE；{_q14j3e}
	* "PI-MFM: Physics-informed multimodal foundation model for solving partial differential equations"
		* Zhu, Min; Sun, Jingmin; Zhang, Zecheng; Schaeffer, Hayden; Lu, Lu; 
		> created on 2026-01-04
	* [作者公众号全文翻译](https://mp.weixin.qq.com/s/LT1ZBWpIYhbRlMAGeJ7cvg)
* SpiderSolver NO 不规则区域蛛网划分、打包算注意力，再加边界附近逐点注意力
	* "SpiderSolver: A Geometry-Aware Transformer for Solving PDEs on Complex Geometries", NeurIPS 2025
		* Kai Qi, Fan Wang, Zhewen Dong, Jian Sun
		* 2026-01-04
	* 摘要摘录
		> 本文提出SpiderSolver——一种具备几何感知能力的变压器模型，通过引入蜘蛛网式分块机制处理复杂域几何结构与不规则离散化点。
		> 本方法依据域边界几何特征，将不规则空间域划分为蛛网状片段。
		> SpiderSolver通过粗粒度注意力机制捕捉蛛网标记间的全局交互，并借助细粒度注意力机制优化域边界与其邻近内部点之间的特征交互。
		> 我们在七个数据集上对具有多样化域几何结构的偏微分方程进行评估，涵盖汽车、机翼、人体胸主动脉血流等实例，以及由纳维-斯托克斯方程、达西流方程、弹性方程和塑性方程描述的典型案例。
	* 蛛网划分；{_q14g1z}
		* sec3:2 动机：某点物理量影响来源，边界几何、到边界的距离
			> 对于具有一般不规则几何边界（如图1所示边界）的偏微分方程，域内不同位置的物理量会受到其与边界距离及边界几何形状的影响。
			> 在汽车空气动力学中，流场在车辆周围呈现分层分布。
			> 在车体表面附近，气流紧贴表面几何形状流动；而远离车体时，流速逐渐与自由气流趋于一致。
			> 空气动力学效应受车体表面曲率和攻角影响显著：水平表面（如车顶）对气流影响较小，而攻角较大的区域（如前挡风玻璃）则会显著改变气流方向与速度。
		* sec3.1:1 划分方式概述：1. 边界点谱聚类，2. 延拓到内部，依距离划为蛛网结构
			> 为求解具有复杂边界几何结构的偏微分方程，我们提出一种几何感知分块方法作为构建变换器的基础步骤。
			> 该方法旨在将计算域 Ω（包含内部点集 IG 和边界点集 BG）量化为非重叠子区域，这些子区域能自适应域边界几何结构（如图 1 所示的物体表面）。
			> 该过程首先通过谱聚类对域边界∂Ω进行量化，将其划分为子区域。
				* eqn(1) 基于 Laplace 算子特征值；似乎有近似算法，涉及 kNN（k=10）和 k-means
			> 随后基于边界聚类结果及内部点到边界的距离，对域Ω的内部空间进行划分。
			> 由于划分后的子区域呈现蜘蛛网状结构（如图3所示），我们将此方法命名为“蜘蛛网分块法”。
		* fig4 不同样本对齐边界点分类方案：1. 选模板形状，2. 对其他形状与之 point matching，基于最优传输，3. 模板形状的分类方案可迁移到其他形状
	* 网络架构
		* fig2 并行进行 粗粒度注意力、细粒度注意力，结果求和
		* sec3.2.1,2 粗粒度注意力 计算：蛛网 patch 间算注意力，加权聚合更新逐点特征
			* 边界点接收来自内部点的信息；反向无，内部点仅依据内部点信息更新
		* sec3.2.3 细粒度注意力 逐点计算，仅涉及边界及其附近的点；{_q14g2s}
			* 边界点重要性：受区域几何影响更大；感兴趣物理量（升力阻力等）基于边界附近物理场计算
	* 实验数据集
		* p7:-2 血流；{_q14g1k}
			> 血流数据集[36]包含500次基于纳维-斯托克斯方程的模拟，研究固定人类胸主动脉几何结构中的血流。每个样本的入口和出口条件各不相同，采用四面体网格进行离散化处理，包含1,656个空间节点和121个时间步长。该模型通过入口和出口处的压力值进行训练，以预测流场的速度分布。
			> [36] Gengxiang Chen, Xu Liu, Qinglu Meng, Lu Chen, Changqing Liu, and Yingguang Li. Learning neural operators on riemannian manifolds. arXiv preprint arXiv:2302.08166, 2023.
		* p7:-1 多边界 NS；{_q14g1l}
			> 带有多个分离边界的有界纳维-斯托克斯数据集[37]模拟了流体在含有多个固定柱状障碍物的管道中的二维流动，由此形成多个不相连的边界。尽管存在分离边界，每个点的空间差分函数（SDF）仍被唯一定义为到所有边界组件的最小距离。有关数据集的更多细节，请参见附录C。
			> [37] Qilong Ma, Haixu Wu, Lanxiang Xing, Shangchen Miao, and Mingsheng Long. Deeplag: Discovering deep lagrangian dynamics for intuitive fluid prediction. In Advances in Neural Information Processing Systems, 2024.
			* 附录 fig14 蛛网划分结果示意图，每个洞周围扩张出一圈圆环
* 2510.09693 PINN,DRM,WAN 比较
	* "Neural PDE Solvers with Physics Constraints: A Comparative Study of PINNs, DRM, and WANs"
		* Chen, Jiakang; 
		> created on 2026-01-03
	* 摘要摘录
		> 本论文对三种无网格神经PDE求解器——物理信息神经网络（PINNs）、 深度里茨法（DRM）和弱对抗网络（WAN），
		> 针对泊松问题（最高5维）及一维/二维时不变薛定谔方程（无限深势阱与谐振子模型）展开统一比较，并通过克拉默斯-亨内伯格（KH）变换将研究扩展至激光驱动的薛定谔方程案例。
		> 在统一协议下，所有方法在结合强制边界条件（FBC）、强制节点（FN）及正交性正则化（OG）时均能实现低L2误差（10⁻⁶-10⁻⁹量级）。
		> 在各项任务中，PINN在精度和激发光谱恢复方面最为可靠；DRM在静态问题上实现了精度与运行时间的最佳平衡；WAN在弱形式约束和FN/OG有效应用时更具灵敏度且竞争力强。{_q13h58}
		> 敏感性分析表明：FBC消除了边界损失调优需求；单网络求解器中网络宽度比深度更关键；多数性能提升出现在5000-10000个迭代周期内。
		> 同一工具包可解决KH案例，表明其能力超越经典基准测试。
		> 本文提供方法选择的实用指南，并提出以下扩展方向：DRM与WAN的时间依赖性建模、自适应残差驱动采样、并行多状态训练及神经域分解。
* 2510.21592 PDE 数据按随机采样 u 生成，通过已有解扰动
	* "Accelerating Data Generation for Nonlinear temporal PDEs via homologous perturbation in solution space"
		* Liu, Lei; Huang, Zhenxin; Wang, Hong; dong, huanshuo; Xin, Haiyang; Zhao, Hongwei; Li, Bin; 
		> created on 2026-01-03
	* 摘要摘录
		> 我们提出一种名为“解空间同调扰动法（HOPSS）”的新型数据生成算法。
		> 该算法突破传统生成大时间步长数据集的局限，直接生成所需较少时间步长的训练数据集，
		> 在加速数据集生成同时，仍能保持模型训练所需的近似精度。
		> 具体而言，我们首先从可靠求解器中获取一组基础解函数（通常包含数千个时间步长），随后通过下采样将其时间步长与训练数据集对齐。
		> 接着提出“同源扰动”方法：将两个解函数（一个作为主函数，另一个作为经小标量缩放的同源扰动项）与随机噪声结合，高效生成精度可比的偏微分方程数据点。
		> 最后，利用这些数据点计算原始方程右侧项的变化，从而形成新的解对。
		> 理论与实验结果表明，HOPSS方法显著降低了时间复杂度。
		> 以纳维-斯托克斯方程为例，该方法仅需传统方法约10%的时间即可生成10,000个样本，且模型训练性能相当。
	* fig1 新解 $u_{new}=u_i+\mu u_j+\xi$，再代入方程算 RHS；{_q13f5j}
* 2510.23111 NO 归纳偏置，在低保真数据上训练后精度高于其训练数据
	* "Neural Emulator Superiority: When Machine Learning for PDEs Surpasses its Training Data", NeurIPS 2025
		* Koehler, Felix; Thuerey, Nils; 
		> created on 2025-12-19
	* 摘要摘录
		> 用于PDE的神经算子或仿真器，基于数值求解器的数据进行训练，通常被认为受到训练数据保真度的限制。
		> 我们通过识别“仿真器优势”来挑战这一假设，在这种情况下，纯基于低保真度求解器数据训练的神经网络在与高保真度参考进行评估时，可以实现比这些求解器更高的精度。{_pcj86r}
		> 我们的理论分析揭示了仿真器归纳偏差、训练目标和数值误差特性之间的相互作用如何在多步部署中实现卓越的性能。
		> 我们使用标准神经架构在不同的PDE中实证验证了这一发现，证明仿真器可以隐式学习比训练数据更正则化或表现出更有利的误差累积特性的动态，从而可能超越训练数据的限制并减轻数值伪影。
		> 这项工作促使对模拟器基准进行重新评估，表明神经模拟器在特定的操作条件下可能比其训练源实现更高的物理保真度。
* INC-2511.12764 传统算法低精度自回归推进，NN 修正误差最好是改写方程而非预测残差，在传统算法内而非外
	* "INC: An Indirect Neural Corrector for Auto-Regressive Hybrid PDE Solvers", NeurIPS 2025
		* Wei, Hao; Franz, Aleksandra; List, Bjoern; Thuerey, Nils; 
		> created on 2025-12-16
	* 方程形式 $u_t=Lu$
	* 传统算法时间更新格式（显or隐）：$u^+=T(u^+,u,Lu)$
		* 直接修正：后处理 $u^+\leftarrow NN(u^+)$
			* （评）这更像是向解流形投影；担心有信息损失，尤其如果低精度格式会为不同 u 产生相近的 $u^+$
			* （评）我感觉输入前一步的 $u$ 更合适，即 $u^+\leftarrow u^++NN(u)$，至少 $NN(u,u^+)$
		* 间接修正（本文推荐）：作为方程新增（反应）项 $u^+=T(u^+,u,Lu+NN(u))$；{_pcil3e}
	* 训练方式：eqn(3) 连续 rollout m 步的平均误差，直接间接修正都是如此
		* 用间接修正时，要求数值格式 T 本身可导
	* （评）理论分析，我没理解它和文章推荐的数值格式为何有必然关系，不如直接实验有说服力
		* 误差引入方式 $L(u+e_u)+e_s$，后文定义大意为 $e_u$ 造成的影响大于 $e_s$
		* 但本文方法考虑的是用 修改后方程+低精度格式 近似 原方程+高精度格式，而非在同一个格式内抑制误差累积
		* 此外，本文方法形式上更像在抑制 $e_s$ 误差
	* 实验中表现确实更好
* 2310.05273 AI 辅助发现天文学新物理实例，通过方程中特殊项由 NN 表示
	* "Physics-tailored machine learning reveals unexpected physics in dusty plasmas", PNAS
		* Yu, Wentao; Abdelaleem, Eslam; Nemenman, Ilya; Burton, Justin C.; 
		> created on 2025-12-15
	* [公众号报道](https://mp.weixin.qq.com/s?__biz=MzI3MjM3ODk0NQ==&mid=2247508817&idx=1&sn=f1136ce11e9a641c73a6aeb080487c1e)
	> 研究团队构建的不是通用神经网络，而是一种「物理定制型AI」（physics-tailored machine learning, PTML），它融合了粒子间库仑力、电场作用和阻尼等理论知识，构建神经网络的输入层与嵌套结构。
		> 简单些来说，实验并非是让模型「黑箱」地预测下一帧位置，而是把牛顿第二定律拆成三项——粒子间相互作用、环境外力和气体阻尼——各用一个子网络独立逼近，输入只保留「必须知道」的量。{_pcfj4i}
		> 这样既保留了 xy 平面的平移对称性，又允许 z 方向的对称破缺（离子尾迹效应），从而把非互易力显式地编码进网络结构。
		> 模型基于 3D 粒子轨迹进行训练，考虑了固有的对称性、非同质粒子，并以极高的精度（R²>0.99）学习了粒子之间的有效非对称力。
	> 在实验中，等离子体粒子表现出在弱阻尼下仍持续存在的周期波动。按照经典耗散理论，这类系统应当迅速耗散能量、进入静态状态。
	> 但AI模型识别出了一种以前未被显式定义的行为：
		> 波动并非来源于外部扰动，而是由于电荷-速度之间的微弱耦合导致的系统内反馈机制。
		> 研究者随后用独立数值模拟与简化理论模型对AI发现进行验证，发现确实存在该机制——
		> 这标志着AI模型在不被告知正确答案的前提下，主动揭示了新的物理过程。
* 电磁流体力学的基准算例 - 知乎
	* [2025-12-15](https://www.zhihu.com/question/1950874136986489484/answer/1975245037249003695)
	* 8 稳态 + 1 非定常，均有引文；未摘录；{_pcfj2j}
	> 上述8条全部都是充分发展不随时间变动的稳态解。如果拓展到非定常的磁流固耦合振荡问题，半解析解已被位移预测-压力稳定格式Benchmark过：
	* 注：后一个回答也有许多有价值内容
* 2510.20141 单变量 PDE 训练后，迁移至多变量耦合 PDE，基于扩散生成模型
	* "Compositional Generation for Long-Horizon Coupled PDEs"
		* Dhulipala, Somayajulu L. N.; Ray, Deep; Forman, Nicholas; 
		> created on 2025-12-15
	* 摘要摘录
		> 在本文中，我们研究了组合扩散方法，其中扩散模型仅在解耦的PDE数据上训练，并在推理时组合以恢复耦合场。{_pcfb6g}
		> 具体而言，我们研究了在涉及大量时间步长的长时间范围内，组合策略是否可行。
		> 此外，我们将基线扩散模型与使用v参数化策略训练的模型进行了比较。
		> 我们还介绍了一种基于欧拉方案的耦合场对称组合方案。
		> 我们使用更长的时间网格对ReactionDiffusion和改进的Burgers进行评估，并与在耦合数据上训练的傅里叶神经算子进行基准测试。
		> 尽管只看到解耦的训练数据，但成分扩散模型以低误差恢复了耦合轨迹。
		> v参数化可以提高基线扩散模型的准确性，而神经算子替代物在耦合数据上训练后仍然最强。
		> 这些结果表明，成分扩散是实现耦合偏微分方程高效、长期建模的可行策略。
* HA30k-2510.09657 Helmholtz 数据集（2D），31k 样本
	* "Generative Models for Helmholtz Equation Solutions: A Dataset of Acoustic Materials"
		* Gramaccioni, Riccardo Fosco; Marinoni, Christian; Frezza, Fabrizio; Uncini, Aurelio; Comminiello, Danilo; 
		> created on 2025-12-15
	* 摘要摘录
		> 在这项工作中，我们介绍了一个由31000种声学材料组成的数据集，名为HA30K，用于设计和模拟求解亥姆霍兹方程。{_pcfb57}
		> 对于每种材料，我们提供几何结构和相应的压力场解，使数据驱动的方法能够学习亥姆霍兹方程解。
		> 作为基线，我们探索了一种基于ControlNet的稳定扩散的深度学习方法，这是一种最先进的图像生成模型。
	* tbl1 各种材料中的声速
	* fig3 架构基于 Stable Diffusion 输出预测物理场
		* 文本输入：材料类型，障碍物材料，源项位置、频率
		* ControlNet 输入波速场
* 2510.18989 NO active-learning，搜索 NO 与传统求解器差异最大样本，通过投影梯度最大化
	* "Towards Universal Solvers: Using PGD Attack in Active Learning to Increase Generalizability of Neural Operators as Knowledge Distillation from Numerical PDE Solvers"
		* Sun, Yifei; 
		> created on 2025-12-15
	* 摘要摘录
		> 为了解决这个问题，我们提出了一个教师-学生蒸馏框架，其中一个可微数值求解器（教师）监督一个紧凑的神经算子学生。
		> 由于求解器生成的标签很昂贵，我们在极小极大（PGD风格）公式中嵌入了一个主动/对抗样本选择循环：
		> 在学生固定的情况下，我们（通过投影梯度最大化）搜索最大化学生与教师差异的输入扰动（受物理动机的平滑度/能量约束），将这些最坏情况的例子添加到训练池中，并更新学生。{_pcfa5l}
		> 利用可微分谱求解器，如Exponax，可以将求解器梯度反向传播到对抗搜索中，在周期/谱设置下稳定和加强样本挖掘。
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
* MoE-POT-2510.25803 （备用）DPOT 架构引入 MoE；{_q7jb08}
	* "Mixture-of-Experts Operator Transformer for Large-Scale PDE Pre-Training", NeurIPS 2025
		* Wang, Hong; Xin, Haiyang; Wang, Jie; Yang, Xuanze; Zha, Fei; Dong, Huanshuo; Jiang, Yan; 
		> created on 2025-11-17
* 2511.09729 （备用）1D equation-aware NO，设计方程通式、网络只输入系数
	* "Generalizing PDE Emulation with Equation-Aware Neural Operators" by Google, NeurIPS 2025 AI-driven Machine Learning and the Physical Sciences Workshop
		* Zhu, Qian-Ze; Raccuglia, Paul; Brenner, Michael P.; 
		> created on 2025-11-17
	* sec2 1D 方程时间推进，设计完整方程形式、模型只输入系数，所有 7 项 $u,u^2,u_x,uu_x,u_{xx},u_{xxx},u_{xxxx}$
	* sec3.1 泛化到没见过的参数，sec3.2 没见过的 PDE
* HYCO-2509.14123 （备用）NO 数据 + PDE loss 双驱动，分别训二模型、要求其达成共识；未确认细节
	* "HYCO: Hybrid-Cooperative Learning for Data-Driven PDE Modeling"
		* Liverani, Lorenzo; Steynberg, Matthys; Zuazua, Enrique; 
		> created on 2025-11-16
	* 摘要摘录
		> 我们提出了混合合作学习（HYCO），这是一种混合建模框架，通过相互正则化机制迭代地集成了基于物理和数据驱动的模型。
		> 与直接对合成模型施加物理约束的传统方法不同，HYCO将物理和合成组件视为共同训练的代理：物理和合成模型被推向一致，而合成模型被增强以更好地适应可用数据。
		> 这种协作学习方案自然是可并行的，并提高了对噪声以及稀疏或异构数据的鲁棒性。
		> 对静态和时变问题的大量数值实验表明，HYCO优于经典的基于物理和数据驱动的方法，即使在不适定条件下也能恢复精确的解和模型参数。
		> 该方法还接受了自然的博弈论解释，实现了交替优化，为未来的理论发展铺平了道路。
	* 后续拓展 2602.23859
* CoPS-2509.17955 NO 时空非固定离散，空间逐点嵌入后转隐空间均匀网格，其上用多尺度 GNN 预测时间导数
	* "Breaking the Discretization Barrier of Continuous Physics Simulation Learning", NIPS2025
		* Xu, Fan; Wu, Hao; Wang, Nan; Peng, Lilan; Wang, Kun; Gong, Wei; Zhao, Xibin; 
		> created on 2025-11-14
	* 摘要摘录
		> 摘要从部分观测数据中建模复杂的时间演化物理动力学是一个长期存在的挑战。
			> 特别是，观测值可能以看似随机或非结构化的方式稀疏分布，这使得在各种科学和工程问题中很难捕捉到高度非线性的特征。
		> 然而，现有的数据驱动方法往往受到固定的空间和时间离散化的限制。
			> 虽然一些研究人员试图通过设计新的策略来实现时空连续性，但他们要么过度依赖传统的数值方法，要么未能真正克服离散化带来的局限性。
		> 为了解决这些问题，我们提出了CoPS，这是一种纯数据驱动的方法，可以有效地从部分观测中模拟连续的物理模拟。
			> 具体来说，我们采用乘法滤波网络将空间信息和相应的观测值融合并编码。
			> 然后，我们定制几何网格，并使用消息传递机制将特征从原始空间域映射到定制的网格。
			> 随后，CoPS通过设计多尺度图ODE来模拟连续时间动力学，同时引入基于马尔可夫的神经自校正模块来辅助和约束连续外推。
	* fig2 整体架构图
	* 输入散点 $(x,u)$ 逐点 embedding：eqn(3) MFN（Gabor）输入仅 x，u 作 shift modulation；{_pbeg5s}
	* 转隐空间均匀网格：eqn(4) GNN 消息传递，输入点传到所在方格 4 顶点；{_pbgf1m}
		* （评）数学表达式可能有笔误，角标未体现输入散点、输出均匀网格的区别
	* 隐空间架构：sec3.2 仿 GraphCast 的多尺度 GNN，多层次 graph，每个尺度做邻域消息传递
		* （评）方形均匀网格上用多尺度 GNN 有些奇怪，为何不直接 U-Net
	* 时间推进：eqn(7) NeuralODE，网络预测当前速度
	* 状态修正：eqn(9,10) 基于浅层 CNN，时间离散，仅预测下一时间步，避免 NeuralODE 的长期误差累积、或系统本身无法完全用 ODE 描述
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
		* sec3.2:2 长程信息交互涉及两类 token：latent、region，算 6 层近线性的注意力
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
* FC4NO-2510.05995 NO 基准测试：6 个 3D 不规则区域工业级工程设计数据集，比较 4 大 NO 范式
	* "A comprehensive comparison of neural operators for 3D industry-scale engineering designs"
		* Zhong, Weiheng; Liu, Qibang; Abueidda, Diab; Koric, Seid; Meidani, Hadi; 
		> created on 2025-10-24
	* 摘要摘录
		> 提出并标准化了六个具有代表性的3D工业级工程设计数据集，涵盖
			> 热分析、{_papa1f}
			> 线弹性、弹塑性、时变塑性问题；{_papa12}
			> 和计算流体动力学。
			* （评）“提出”不确定含义，正文数据集介绍部分数据有引文，不确定是把设定拿过来自己重新生成，还是直接用的现成的
		> 所有数据集都包括用于模型训练的完全预处理的输入和输出，使其可以直接在各种神经算子架构中使用。
		> 使用这些数据集，我们对四种类型的神经算子变体进行了系统比较，包括
			> 受DeepONet启发的基于分支干线的神经算子、
			> 受图神经网络启发的基于图的神经算子，
			> 受傅里叶神经算子启发的基于网格的神经算子
			> 和受PointNet启发的基于点的神经算子。
	* sec5 比较公平性，分支-主干类模型（> DeepONet 类）常适合参化几何，几何 NO（网格/图/散点）难直接利用参化信息
		* 自由几何输入 分支-主干类模型（> DeepONet 类），二策略（> 联用？）
			> 1.高级几何描述符：我们从几何的点云表示中计算统计特征，包括质心、边界框维度以及PCA导出的轴和特征值。{_papa24}
				> 这些描述符形成表示全局几何的紧凑特征向量。
			> 2.基于体素的编码：几何体被离散化为体素网格，由3D卷积神经网络（CNN）处理以提取潜在的嵌入。{_papa2b}
				> 此表示以分辨率感知的方式捕获几何体的空间结构。
		* 几何 NO 引入几何参化信息
			> 我们研究了两种将参数化设计表示纳入几何神经算子的方法：
			> 1. 直接连接：设计参数向量直接与空间查询点xq连接，并作为输入传递给模型。
			> 2. 分支增强集成：一个单独的MLP分支网络处理参数向量，而主干网络对空间坐标进行编码。
			> 使用级联对输出进行融合，并将得到的特征传递给几何算子。
	> sec6:-1 结合上述所有分析，我们将主要发现总结如下：
		> •对于参数表示的问题，分支-主干模型应该是首选，因为它们的训练成本低，在结构化几何上性能强。{_papa2i}
			> 例如，DCON在散热器（0.10%）和支架（1.75%）数据集（表3）上始终取得最佳结果，同时保持每个历元的快速训练时间（表8）。
		> •即使参数输入可用，在处理复杂的几何形状或具有突然空间变化的解决方案时，基于点的模型可能更可取。
			> 如表3所示，transolver在DrivAer（16.7%）和DrivAer++（17.3%）数据集上的表现优于所有其他模型，这两个数据集都具有自由形式的车辆几何形状。
		> •当数据集中的几何尺寸差异很大时，基于网格的神经算子提供了更稳健的性能。
			> 例如，FigConvUNet在散热器（0.89%）和JEB（29.8%）数据集上取得了最佳结果（表4），其中几何尺度变化明显。
		> •对于时间依赖问题，配备显式时间编码机制的模型可以实现强大的性能，即使整体架构像分支干线设计一样简单。
			> 由于其基于GRU的时间编码器，S-DeepONet的性能明显优于Bracket时间数据集上的所有其他模型（表5）（误差8.6%）。
			> SNOT的性能进一步验证了我们的结论。
* FactFormer-2305.17560 类似 AViT，区别 1. 行内注意力矩阵对所有列统一，列同理，2. 行列注意力同时算
	* "Scalable Transformer for PDE Surrogate Modeling"
		* Li, Zijie; Shu, Dule; Farimani, Amir Barati; 
		> created on 2025-10-22
	* eqn(7) 基于 Fourier attention 解读，卷积核分解为 $k(x,y;x',y')=k(x,x')k(y,y')$
		* 根据源码，卷积核计算是 Fourier attention LN 乘积，尽管也实现了普通 softmax 版本
			* （评）奇怪的是 scale 是 1 而非 1/n
			* 各轴共享部分：W_V，算 QK 前预先线性变换，输出部分 MLP（而非简单 W_O）
				* 源码无单独 FFN 模块，推测是想和注意力输出的 W_O 合并；但 ffn_embed_dim 刚好等于 embed_dim，未倍增
			* 各轴独立部分：剩余轴统一化（1.5 倍升维线性变换，均值后的 MLP），W_Q/K
	* （评）本文 XY 注意计算次序可交换，因为 einsum 作用于张量的不同轴（对应的连续积分沿不同空间维度）
		* 等价地：XY 注意力矩阵做张量积得完整注意力矩阵
	* sec3.2:-1 与 AViT 区别
		> 值得指出的是，这里提出的轴向因式分解核与Ho等人[45]提出的轴向变换器有一些相似之处，但尽管存在联系，但有两个显著差异。
		* 注意力矩阵共享：行内注意力矩阵对所有列统一，列同理；{_pamb8h}
			> 首先，轴向变换器通过沿每个轴约束注意力上下文来降低计算成本（例如，一个像素只能关注同一行上的其他像素），这相当于将除一个轴外的所有轴移动到批处理维度。
			> 这样，计算轴核2矩阵的复杂度为O（N Sm d）（查全率N=S1×…×Sn），而不是我们模型中的O（Sm d）。
			> 由于softmax的存在，其注意力的整体计算相对更昂贵。
		* 行列注意力同时算，中间无 FFN 块等
			> 其次，轴向变压器的分解不是 layer-wise 的。
			> 例如，在第一层中，注意力以行的方式进行，然后第二个块将以列的方式进行注意力，{_pamg5z}
			> 而我们的模型将注意力沿所有轴分解为每一层内的张量矩阵积。
			* （评）相当于 AViT 依次 X注意、FFN、Y注意、FFN，本文 XY注意、FFN
				* （旧）且本文 XY 注意深度融合：对应 attn_prob 直接复合，中间无额外的残差连接、W_O、W_V 操作，QK 计算所用输入相同
		> 我们在附录的图27中提供了一个说明性的例子。
		* （评）根据源码，注意力计算用的是 Fourier attention LN 乘积，应该也是一个区别
* FINO-2509.26186 导师+Angelica，基于 FD 的时间步进 NO，有步进 NO 相关的若干理论分析
	* "PDE Solvers Should Be Local: Fast, Stable Rollouts with Learned Local Stencils"
		* Cheng, Chun-Wun; Dong, Bin; Schönlieb, Carola-Bibiane; Aviles-Rivero, Angelica I; 
		> created on 2025-10-20
	* 摘要摘录
		> 用于求解偏微分方程（PDE）的神经算子模型通常依赖于全局混合机制，如谱卷积或注意力，这往往会过度平滑尖锐的局部动力学并引入高计算成本。
		> 我们提出了FINO，这是一种受有限差分启发的神经架构，它在保持多尺度表征能力的同时强制执行严格的局部性。
			> FINO用可学习的卷积核替换固定的有限差分模板系数，并通过显式的、可学习的时间步进方案进化状态。
			> 中央局部算子块利用差分模板层、门控掩模和线性融合步骤来构建自适应导数式局部特征，这些特征在时间上向前传播。
			> FINO嵌入具有瓶颈的编码器-解码器中，在保持可解释性的同时捕获细粒度的局部结构。
		> 我们建立了
			> （i）在Lipschitz条件下，将一步近似误差与稳定的longhorizon展开联系起来的合成误差界，
			> 以及（ii）离散时间步进PDE动力学的通用近似定理。
			> （iii）在六个基准测试和一个气候建模任务中，FINO的误差降低了44%，速度比最先进的算子学习基线提高了约2倍，这表明具有可学习时间步长的严格局部性为神经PDE求解器提供了准确和可扩展的基础。
	* prop1 单步误差 vs 多步误差，取决于真实演化算子的 Lipschitz 常数 C，k 步后误差 $~C^k$；{_pak856}
		* （评）直观上合理：混沌系统初值敏感，$C\gg 1$，误差迅速放大；耗散系统 $C<1$，初值差异逐渐被抹平
	* thm2 离散时间步进的通用近似定理，针对 FD-Net，K 时间步进算子可由单时间步进代理的 K 次复合逼近；{_pak85d}
		* （评）未考虑单时间步进是否是良好逼近，形式上不排除是代理算子拟合另一动力学，只是过 K 步后流映射恰好与原动力学一致
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
* HyPINO-2509.05117 二阶线性方程 NO 生成 INR 权重，边值延拓+掩码输入，loss 含 PINN、采 u 算 f 的数据，提精度用线性方程重解残差、微调
	* "HyPINO: Multi-Physics Neural Operators via HyperPINNs and the Method of Manufactured Solutions"
		* Bischof, Rafael; Piovarči, Michal; Kraus, Michael A.; Mishra, Siddhartha; Bickel, Bernd; 
		* 作者名单包括 Poseidon 组的导师
		> created on 2025-10-15
	* 摘要摘录
		> 一种多物理神经算子，设计用于在不需要特定任务微调的情况下在广泛的一类参数偏微分方程上进行零样本泛化。
			> 我们的方法将基于Swin Transformer的超级网络与混合监督相结合：（i）通过制造解决方案方法（MMS）生成的分析解决方案中的标记数据，以及（ii）使用物理知情目标优化的未标记样本。
			> 该模型将PDE参数化映射到目标物理知情神经网络（PINN），
			> 可以处理二维线性椭圆、双曲线和抛物线方程，具有不同的源项、几何形状和混合狄利克雷/诺伊曼边界条件，包括内部边界。
		> HyPINO在PINN文献中的七个基准问题上实现了强大的零样本精度，优于U-Nets、Poseidon和PhysicsInformed Neural Operators（PINO）。
		> 此外，我们引入了一种迭代细化过程，将生成的PINN的物理特性与请求的PDE进行比较，并使用差异生成“增量”PINN。
		> 将他们的贡献相加并重复这一过程形成一个集合，其组合解决方案逐步减少了六个基准的误差，在最好的情况下，平均L2损耗的增益超过100倍，同时保留了仅向前推断。
		> 此外，我们评估了由HyPINO初始化的PINN的微调行为，并表明它们在五个基准测试中比随机初始化和爬虫元学习PINN收敛更快，最终误差更低，与其余两个基准测试的性能相当。
	* sec3 本文只考虑二阶线性方程
	* fig1 整体架构
		* 输入 1，方程标量系数，嵌入为隐向量
			* eqn(3)-1 标量系数共 5 个，嵌入为固定维数隐向量表征（涉及 Fourier feature mapping）
			* （评）本来是做方程嵌入，但二阶线性方程只涉及 5 系数，故系数嵌入就是方程嵌入
		* 输入 2，系数场（含延拓后的边值、边界位置的 mask），逐分量编码
			* eqn(3)-1 系数场共 5 个，直接 concat
		* 处理网络：系数场编码过 SWin，据隐向量生成 scale,shift modulation（即 FiLM）
		* 输出：生成 INR 权重，每层所用的 MLP 超网络独立
			* eqn(3)+1 超网络输入：SWin 各中间层输出汇总，用交叉注意力机制得多隐向量，分别输入各 MLP
		* 训练 loss：1. PINN，2. 随机生成 u 算右端项 f
			* 法 2 称为 method of manufactured solutions（MMS），有 1995 年引文；{_paia5k}
				> [39] William Oberkampf, Frederick Blottner, and Daniel Aeschliman. Methodology for computational fluid dynamics code verification/validation. In Fluid dynamics conference, page 2226, 1995.
		* 下游适配：1. 迭代精化，2. 微调
			* 迭代精化 依赖于方程是线性的，每次 PDE 残差输入 NO 得解残差预测；{_paia6k}
* 2508.19419 解实际问题，油藏注水提取 地下压力控制，正问题 NO 解多相流含时方程，从单相流稳态迁移学习
	* "Differentiable multiphase flow model for physics-informed machine learning in reservoir pressure management"
		* Rashid, Harun Ur; Pachalieva, Aleksandra; O&#39; Malley, Daniel; 
		> created on 2025-10-15
	* 摘要摘录
		> 摘要由于地质非均质性和多相流体流动动力学，精确的地下储层压力控制极具挑战性。{_paf91y}
			> 在这种情况下预测行为依赖于计算成本高昂的高保真物理模拟。
			> 然而，控制这些流的不确定、异构特性使得有必要进行许多昂贵的模拟，这通常是令人望而却步的。
		> 为了应对这些挑战，我们引入了一种基于物理的机器学习工作流程，
			> 该工作流程将DPFEHM框架中实现的完全可微多相流模拟器与卷积神经网络（CNN）相结合。
			> CNN学习从非均质渗透率场预测流体提取率，以在关键储层位置实施压力限制。
			> 通过将瞬态多相流物理纳入训练过程，与之前的工作相比，我们的方法能够对现实的注入提取场景进行更实用和准确的预测。
		> 为了加快训练速度，我们在单相稳态模拟上对模型进行预训练，然后在全多相场景下对其进行微调，这大大降低了计算成本。{_paf927}
			> 我们证明，通过不到三千次全物理多相流模拟可以实现高精度训练，而之前的估计需要高达一千万次。
			> 通过利用成本低得多的单相模拟的迁移学习，实现了模拟数量的大幅减少。
* SNO-2509.00867 NO 数据生成采 u 算 a，其中 u 分布由贝叶斯 PINN 学出
	* "Self-supervised neural operator for solving partial differential equations"
		* You, Wen; Zhou, Shaoqian; Meng, Xuhui; 
		> created on 2025-10-07
	* 数据生成：训练时生成 a 学 u 分布，使用时采样 u 据此算 a，sec2.2.1:-1
		* 准确描述：随机选区域 $D$，采样 $u$，据此算 $f,b,u_0$（源项、边值、IC）{_pa8823}
		> 我们注意到，使用现有NO中广泛使用的数值求解器和PI采样器生成数据都可以在贝叶斯框架的背景下理解。
		> 在不失一般性的情况下，我们假设我们需要生成成对数据（f，u）来学习从f到u的映射。
		> 在前一种方法中，我们首先为f分配一个先验，u的先验是通过传统数值方法求解相应的方程得到的。
		> 而在后一种方法中，我们首先为u分配一个先验，然后使用AD获得f的先验，这在计算上成本要低得多。
	* 分布表示用 B-PINN：Bayesian NN 中网络权重 θ 为随机变量，可考虑与 (a,u) 的联合分布
* DIMON-2402.07250 （备用）区域形状可变 NO，先形变到参考域，在参考域上用类似 DeepONet 的结构
	* "DIMON: Learning Solution Operators of Partial Differential Equations on a Diffeomorphic Family of Domains", Nature Computational Science 2024
		* Yin, Minglang; Charon, Nicolas; Brody, Ryan; Lu, Lu; Trayanova, Natalia; Maggioni, Mauro; 
		> created on 2025-10-05
	* 摘要摘录
* 2502.00604 PINN 训练多项梯度冲突，一阶优化器失败，
	* "Gradient Alignment in Physics-informed Neural Networks: A Second-Order Optimization Perspective", NeurIPS 2025
		* Wang, Sifan; Bhartari, Ananyae Kumar; Li, Bowen; Perdikaris, Paris; 
		> created on 2025-09-30
	* [公众号全文翻译](https://mp.weixin.qq.com/s/dslWkoZVKCz97GKUhU4CiA)
	> 像梯度下降或Adam这样的一阶优化器必须遵循平均梯度方向，导致在相互竞争的目标之间进行低效的曲折。
		> 这些冲突的严重程度随着问题的复杂性而增加，对于湍流来说变得尤为尖锐，在湍流中跨多个尺度保持物理约束至关重要。
	> 为了更好地理解并解决这些方向梯度冲突，我们引入对齐分数，定义如下。
		* （评）各项梯度化单位向量后求和，考察结果向量的模长；作为二向量余弦相似度的推广
	> 相比之下，准二阶优化器（例如，Muon [62]，SOAP [1]，Kron [63]）在整个训练过程中步间和步内梯度对齐分数始终保持较高的正值。{_p9un2o}
		> 梯度方向冲突的这种有效解决直接对应于测试误差中显著更快的收敛。
		> 值得注意的是，SOAP在所有优化器中实现了最高的对齐分数，证明了其卓越的有效性。
	> 在接下来的部分中，我们将对为什么物理信息神经网络（PINNs）本质上遭受方向梯度冲突提供理论解释，
		> 并在SOAP和牛顿法之间建立正式联系，从而更深入地了解其经验上的成功。
	* 各二阶优化器局限性 tbl1+1
		> L-BFGS不适用于大规模或随机训练，因为梯度噪声会干扰其海森矩阵更新和线搜索过程。{_p9un3m}
		* 自然梯度下降（NGD）计算量大，需双精度，仅适用于解简单情形；{_p9un3q}
			> 自然梯度下降（NGD）需要在每次迭代时计算并求逆费舍尔信息矩阵，并且限于float64精度，这在GPU上效率低下，消耗  更多内存，同时比float32慢2到4倍。
			> 因此，NGD仅在具有平滑解的相对简单的基准测试中得到证明，在这些测试中，非常小的网络就足够了，收敛问题很少出现。
			> 在具有急剧转变或复杂动态的更具挑战性的PDE上，NGD无法扩展：它对超参数高度敏感，缺乏小批量支持，并且经常发散。
* 2509.14185 DeepMind 找出 Euler 等方程不稳定爆破解，对 PINN 精细化处理以达到机器精度
	* "Discovery of Unstable Singularities"
		* Wang, Yongji; Bennani, Mehdi; Martens, James; Racanière, Sébastien; Blackwell, Sam; Matthews, Alex; Nikolov, Stanislav; Cao-Labora, Gonzalo; Park, Daniel S.; Arjovsky, Martin; Worrall, Daniel; Qin, Chongli; Alet, Ferran; Kozlovskii, Borislav; Tomašev, Nenad; Davies, Alex; Kohli, Pushmeet; Buckmaster, Tristan; Georgiev, Bogdan; Gómez-Serrano, Javier; Jiang, Ray; Lai, Ching-Yao; 
		> created on 2025-09-27；导师让看 PINN 相关细节
	* AI 总结的 PINN 精度提升策略见 src/LLM2.md
	> (p5) PINN在问题中的应用有三个核心组成部分：神经网络架构、损失函数和优化算法。
		> 大量研究一直集中在通过改进这些组件来提高PINN的性能。
	* PINN 仅作为发现新解的工具，不考虑与传统求解器比速度 p6:1
		> 鉴于最近有人担心将PINN用作通用PDE求解器时过于乐观50，我们强调PINN在这项工作中并没有用于这一目的。
		> 相反，我们的目标是发现以前没有发现的微分方程的解。
		> 在这里，利用PINN来参数化我们希望发现的偏微分方程的特定解，并且设计和构建用于训练模型的管道，目的是使网络满足手头问题所施加的所有数学假设和约束。
		> 由于我们的目标是发现，我们不会声称在效率或速度方面比任何基准都有所提高。
		> 我们提出的验证指标只涉及已发现解决方案的质量。
	* ansatz 整合先验，原点和无穷远收敛阶等
		> （正文概述）将数学结构整合到神经网络中 (p6)
			> 我们将解表示为由神经网络参数化的平滑函数。
			> 这使我们能够将目标解决方案的已知数学特性直接嵌入到网络架构中。
			> 这种嵌入充当了一种强烈的归纳偏差，引导优化朝着数学上相关的解决方案发展，远离平凡或退化的解决方案。
			> 我们通过建筑设计来强制执行从控制方程中得出的约束。
			> 对称性和周期性是通过输入变换来实现的。
			> 自相似问题中固有的无限域使用压缩空间的坐标变换来处理27（参见方法-解决方案建模）。
			> 此外，我们利用定制的“解包络”（应用于网络输出的乘法因子）来强制执行无穷远处的渐近衰减和原点附近的局部级数展开等行为。
		* 各变量（输出场分量）独立处理，ansatz 用不同的自相似尺度、NN
		* 消 t：eqn(2) 找自相似解，(t,x) 时空坐标变换后化为稳态方程，新自变量 y；{_p9ua50}
			* 尺度参量 λ 待定（影响方程形式）
		* 无限区域变换到有界：eqn(5) 2D 为例（1D 类似），NN 直接输入为 $q,\beta$；{_p9ua13}
			* 表达式：$\xi=1/\sqrt{1+y^2}$，$q=\xi^\alpha$，$\beta=y_2\xi$
			* 关于 $y_1$ 为偶函数；若目标函数为奇函数，可乘预设奇函数 $y_1\xi$；{_p9ua4v}
			* eg. eqn(6) 涡度 ansatz $\Omega=NN(q,\beta)qy_1\xi$
				* 渐近 BC：额外乘 $q$ 以要求无穷远幂律衰减；{_p9ua9o}
		* NN 为 MLP，激活 tanh，参数量数千到数万，仿照之前王思凡解 Euler 的论文；{_p9ua2l}
			* 输出跨量级：末层为指数，或指数后加激活层；{_p9ua2d}
		* 设计、训练交替，训练发现某种新性质¹后，下一版将该性质融入架构设计中；{_p9ua3y}
			* ¹我理解可能包括 λ,α 的大小
			> (p7:0) 至关重要的是，原点处的平滑度要求也可用于推导自相似参数λ的分析关系（类似应用见51）。
				> 这为学习λ作为标准可训练参数提供了一种稳健的替代方案16。
			> 虽然形式分析提供了必要的指导，但它通常依赖于假设（例如从几个形式可能性中选择一个分支），而这些假设并不能先验地保证。
			> 我们通过数值实验和数学分析之间的反馈回路来克服这一点（见图1）。
			> 最初的实验揭示了隐藏的结构，然后这些结构被后验地合并回网络架构中。
				> 例如，IPM和Boussinesq方程的实验表明，解在原点附近的消失速度比最小对称假设所要求的要快。
				> 结合这一见解，我们可以明确地将这种消失的行为从解决方案表示中剔除。
				> 然后，我们能够重新制定剩余组件的控制方程，通过构建网络必须满足的项，显著提高了优化稳定性（见方法和补充信息）。
			> 通过系统地嵌入这些数学特征，包括先验已知的特征和迭代发现的特征，我们增强了优化环境。
				> 这种数学结构的整合加速了收敛，最终能够发现以前无法获得的高阶不稳定解。
	* PINN loss p14 eqn(12)，包括 PDE 残差的一二阶导数；{_p9u82q}
		* 目的：避免 PDE 残差只在采样点附近小 eqn(10)-1；{_p9ub76}
			> 只用d0损失训练的情况下可能得到尖峰解，只在d0训练点周围的小邻域内有较小的残差。
			> 为了使残差尽可能接近常数，我们还利用了更高的导数损失：
		* 注：k 为方程角标，因为是方程组
		* eqn(8) PDE 残差先除以某良定义的函数
			> 我们从控制方程中扣除Fk的影响，并表示方程的剩余因子Rk（Φ̂θ（y），λ），即“残差”。
			> 通过这样做，我们消除了由我们对解的假设或方程结构 mechanically 确定的控制方程的组成部分。
		* eqn(13) data loss 引入归一化条件
	* PINN 采样方式 p15
		> 我们面临两大挑战。
			> 第一种是对信息含量高的点进行采样。
			> 例如，当我们远离原点时，解的行为很 trivial，而在场值及其导数较大的区域，控制方程中项的取消是非常不平凡的。
			> 同时，我们希望避免过拟合，即模型最终只关注降低选定区域的残差，而选择忽略其他区域。
		> 为了应对这两个挑战，我们采用了两种不同的采样方法。
		> 第一种是基于位置的采样，其中使用经验测度从空间中的固定区域对点进行采样。{_p9u81g}
			> 如何选择区域、如何设置采样测度以及为样本分配什么损失权重是根据经验确定的，并在补充信息中详细解释。
		> 下一个是自适应采样，其中对点进行全局采样，但采样方式要使模型当前表现不佳的点（即控制方程的残差较大的点）更频繁地采样。
		* 自适应采样点选取：全局网格算残差和导数，大的地方多采样；{_p9u01e}
			> 在实践中，在紧致坐标z上定义了一个全局点网格。
			> 在网格点上评估残差Rk及其导数，并用于定义自适应采样权重。
			> 例如，对于Boussinesq方程，我们定义采样权重与残差平方和的四次幂成正比。
			> 在网格点被采样后，可以对网格点施加小的扰动，从而对相邻点进行采样。
		> 如果使用基于位置的采样，我们会指定要采样的空间区域、采样度量是什么以及损失权重分配应该是什么。
			> 通常，会使用全局区域以及接近解的原点或峰值的区域。
		> 如果使用自适应采样，我们将采样权重指定为残差及其导数的函数，以及点的损失权重。
			> 补充信息中详细介绍了CCF、IPM和Boussinesq方程所用的采样方案、区域、度量和损失权重。
		* 消极重采样：优化数千步后，重采样一次；{_p9u80t}
			> 减少一组搭配点上的残差是一项艰巨的任务。
			> 因此，频繁地对训练点进行重新采样并不能带来有意义的训练。
			> 因此，我们使用一组给定的搭配点进行训练，以获得更多的步骤，并且只有在经过数千个步骤后才对其进行重新采样。
	* 二阶优化器 p16，二阶部分用随机 rank-1 无偏估计，并取历史指数平均；{_p9u000}
		* 更新方式 $\theta'=\theta-(G+\gamma I)^{-1}\nabla h(\theta)$
		> 其中G是高斯-牛顿矩阵，γ是“阻尼”系数。
		> 与其他最近将二阶优化应用于PINN的工作46、47、52、61、62不同，其中PINN使用简化G结构的近似值，我们计算了整个G矩阵的基本无偏随机估计。
		> 特别地，我们使用G的无偏秩-1估计器的指数移动平均值（跨优化器迭代）来估计G，该估计器可以从具有fi雅可比矩阵的单个矩阵向量积中计算出来。
		> 由于我们的网络规模较小，这种全矩阵方法是可行的。
		* 每步学习率用复杂公式计算，迭代成本翻倍但值得
			> 由于估计方差和指数移动平均的轻微偏差，我们不能简单地使用恒定的学习率1（当精确计算G时，这是可行的），
			> 并采用Martens和Grosse55描述的方案，在每次迭代时以封闭形式计算“最优”学习率和动量值。
			> 这种方法将该方法的每次迭代成本提高了约2到3倍（不包括非主导的矩阵求逆成本），
			> 但使我们不必通过试错和昂贵的扫描来调整学习率计划，特别是为我们的训练问题提供了一个定制的计划。
		> 优化算法涉及阻尼系数γ，它控制着我们对二阶优化器目标的局部二次近似的信任程度。
			> 在整个优化过程中如何调整γ对二阶方法的鲁棒性能至关重要。
			> 根据问题的不同，我们要么使用经典的Levenberg-Marquardt方法63、64，要么使用自定义计划来调整γ的值。
			> 该优化器可以使用开源kfac-jax库56的特定配置来完全实现，该库是一个支持不同二阶优化器的通用框架，包括但不限于K-FAC。
		> 有关我们的优化方法及其实现的详细说明，请参阅补充信息。
	* 两阶段优化，第二阶段的控制方程专门推导（依赖于一阶段解、残差），已成为线性方程；{_p9u00d}
		* （评）不是像 boosting 那样仅仅把 ansatz 改成二网络求和，而是拟合目标也做了重新推导，用新的 PDE
		* eqn(19) 推导类似解摄动，忽略二阶小量
		* p17:-1 二阶段网络输入引入 Fourier 位置编码：解性态由方程源项决定，源项作为一阶段 PDE 残差常高频
			> 该网络在线性输入层之后加入了傅里叶映射层[cos(Bx),sin(Bx)]。{_p9ub4d}
			> 该层的权重B从高斯分布B∼N(0,σ)中采样，其中σ表示分布的标准偏差。
			> 我们使用第一阶段残差Rk的主频fd直接设置超参数σ，即σ=2πfd。{_p9ub3u}
			> 这提供了一种设计网络的原则性方法，该网络天生适合学习高频误差函数。
* 2508.15381 PINN 反问题的理论误差分析，同时比较 Galerkin FEM、PINN+FEM 方法
	* "Numerical Analysis of Unsupervised Learning Approaches for Parameter Identification in PDEs"
		* Cen, Siyu; Jin, Bangti; Quan, Qimeng; Zhou, Zhi; 
		> created on 2025-09-19
	* 摘要摘录
		> 在偏微分方程（PDE）中识别参数代表了一类非常广泛的应用逆问题。
		> 近年来，已经开发了几种使用（深度）神经网络的无监督学习方法来解决PDE参数识别问题。
		> 这些方法采用神经网络作为ansatz函数来近似参数和/或状态，并表现出令人印象深刻的经验性能。
		> 本文从经典数值分析的角度对扩散系数识别这一模型问题的无监督学习技术进行了全面的综述，并概述了一个通用的框架，用于推导使用伽略金有限元法、混合法和深度神经网络获得的离散近似值的严格误差界。{_p9j834}
		> 在整个过程中，我们强调了条件稳定性估计在误差分析中的关键作用。
* 2506.22655 物理场编码时拆出 光滑低分辨率成分、高频信息隐向量，认为演化满足联合 SDE
	* "Learning Stochastic Multiscale Models"
		* Ilersich, Andrew F.; Nair, Prasanth B.; 
		> created on 2025-09-17
	* 摘要摘录
		> 在这项工作中，我们提出了一种直接从观测数据中学习随机微分方程形式的随机多尺度模型的方法。
		> 我们的方法在粗网格上解析状态，同时引入辅助状态来捕捉未解析尺度的影响。
		> 我们使用现代无前向求解器的摊销变分推理方法来学习多尺度模型的参数。
		> 方法从基于物理的多尺度建模方法中汲取灵感，例如流体动力学中的大涡模拟，同时直接从数据中学习。
	* sec3:2 编码器（概率性尺度分离），涉及：{_p9hb7x}
		* 1. 光滑化算子
		* 2. 限制算子（光滑后结果投影到低维）得 $\zeta$
		* 3. 残差算子，对应 1 算子与 identity 的差（> 高频滤波）
		* 4. 微尺度编码器（残差压缩至 compact microscale state）得 $\eta$
	* eqn(2) 假定 $(\zeta,\eta)$ 演化满足耦合 SDE
	* fig2 有相应 decoder，汇总 $\zeta,\eta$，重建完整物理场
	* sec4 多尺度变分推断（略）
	* 相关工作
		> 降阶建模（ROM）代表了一种并行方法，
			> 通过降低状态空间的维度来降低模拟高维系统的计算成本[12]。
			> 传统的ROM方法采用线性投影[13,14,15,16]，但并非所有系统都适合这种方法，因此最近的工作探索了非线性映射[17,18,19,20,21]。{_pbtk1a}
			> 然而，众所周知，ROM方法在多尺度系统中存在困难[22]，这导致了ROM专用闭合模型的发展[23,24]。{_pbtk1g}
		> Mori-Zwanzig形式为闭包建模提供了一个强大的数学框架[25,26,27]，
			> 其中通过将记忆项建模为系统历史上的卷积积分来捕捉亚网格尺度对宏观尺度动力学的影响。
			> 这种方法已应用于粗粒度模型[28]，在库普曼算子理论[29,30]的背景下尤其流行，库普曼算子是一种寻求线性化潜在动力学表示的方法。
		> 我们的方法与[11,4]等神经闭合研究有着根本的不同。
			> 闭合模型仅根据解析的（宏观尺度）动力学形成，因此必须推断微观尺度效应。
			> 因此，闭包模型只进行粗略的状态预测。
			> 我们多尺度方法的一个核心组成部分是延长/解码步骤，以获得完整的状态预测，允许直接对微尺度效应进行建模，并允许与高分辨率数据进行直接比较。
