* FD-loss-2604.28190
	* "Representation Fréchet Loss for Visual Generation"
		* Yang, Jiawei; Geng, Zhengyang; Ju, Xuan; Tian, Yonglong; Wang, Yue; 
		> created on 2026-05-04
	* [公众号报道](https://mp.weixin.qq.com/s/kDQPprKA0ZTUsGh8efuPKA)
	> 解耦统计量与梯度计算
		> 简单来说，研究团队用数万张图组成的大窗口（队列或 EMA）稳定估算真实与生成分布的均值、协方差，保证FD计算准确；
		> 梯度只回传当前小批量数据，不增加训练算力负担。
		> 研究者设计了两种工程实现。
		> 第一种叫队列法（Queue）。
			> 这种方法维护一个超大特征队列（比如5万条），每次生成新batch就enqueue，同时把最老的batch踢出去。
			> 算FD时，用整个队列的均值和协方差；反向传播时，只给当前这1024条特征开梯度流，历史特征不参与梯度回传，保证统计稳健性的同时不增加训练开销。
			> 不用队列（N=0）时，FID反而从3.31劣化到3.84。
			> 队列加到5万时，FID骤降至0.89；但狂堆到50万后，因历史特征严重stale，FDr6直接崩回17.67。
		> 第二种叫EMA法。
			> 这种方法干脆不存储任何特征数据，仅通过指数移动平均实时更新生成样本特征的一阶矩与二阶矩，每一步使用当前批次的统计量平滑更新全局均值与协方差估计，梯度同样只作用于当前批次。
			> 这种方式无需占用大量显存，统计结果更平滑稳定，还能轻松适配多表征空间联合优化，在实验中表现更优，也成为论文默认的实现方案。
			> β=0.999时，FID刷到0.81，比队列版更优，且显著好于过短的0.9（0.98）和过长的0.9999（0.98）。
	> 后训练的分布对齐目标。{_q54a5i}
		> 真实图像只在离线阶段出现一次——预先把训练集的均值和协方差算好存盘，之后模型再也不见真图，只对着自己生成的样本做自我修正。
		> 发现一，FD-loss让单步生成模型首次实现画质与速度的新高度。
		> 发现二，FD-loss可以直接将成熟的多步扩散模型改造为高性能单步生成器。
			* 去噪生成模型 训练用常规去噪 loss、采样需 50 步，微调按单步去噪直接生成、FD-loss
			> 研究者把原本训练来跑50步的多步模型JiT-L，强行拉到单步模式，也就是直接输入纯噪声，模型只跑一次，输出就当最终图像。
			> 结果就是FID直接崩到291.59，画面糊成一锅粥。
			> 然后，他们什么都不改，就用FD-loss继续微调这个的单步模式。
			> 整个过程无需教师蒸馏，无需对抗训练，无需逐样本监督信号。
			> 50轮后，FID从291骤降到 0.77，生成质量与原多步模型相当甚至更优，而且推理速度提升数十倍。
	> 发现三，FID最低的，未必是最好的。{_q54a5t}
		> 实验清晰表明，FID最低的模型，在人眼主观评价中并非最优。
		> 基于Inception特征优化的模型能获得最低FID，却在物体结构、细节纹理、整体感知上弱于使用DINOv2、MAE、SigLIP等现代视觉表征训练的模型。
		> 后者FID数值更高，但人眼看更锐利、物体结构更完整，视觉质量显著更优。
	> 研究团队提出跨6种表征空间的归一化平均指标FDrk。{_q54a6z}
		> 该指标通过对Inception-v3、ConvNeXtv2、DINOv2、MAE、SigLIP2、CLIP共6种不同维度的表征空间计算归一化FD比值并取平均，得到综合评估结果FDr6。
		> 按照这一标准，真实验证集的基准值为1.0，而当前最强生成模型的FDr6仍高达1.89，直观揭示 ImageNet生成任务远未被解决。
* Chimera-2510.18083 （备用）文生图引入多图像条件，各图 SAM 取出所需组件后组合为整图去噪先验；造数据靠文生图后截取
	* "Chimera: Compositional Image Generation using Part-based Concepting" by DeepMind
		* Singh, Shivam; Chen, Yiming; Chatterjee, Agneet; Raj, Amit; Hays, James; Yang, Yezhou; Baral, Chitta; 
		> created on 2026-01-06
* UMM-Diffusion-2303.09319 （备用）文生图引入多图像条件，文本嵌入中相应 token 换为条件图像编码结果
	* "Unified Multi-Modal Latent Diffusion for Joint Subject and Text Conditional Image Generation"
		* Ma, Yiyang; Yang, Huan; Wang, Wenjing; Fu, Jianlong; Liu, Jiaying; 
		> created on 2026-01-06
* UniCombine-2503.09277 （备用）文生图引入多个图像条件，预设所有可能条件类型、独立学其 LoRA
	* "UniCombine: Unified Multi-Conditional Combination with Diffusion Transformer"
		* Wang, Haoxuan; Peng, Jinlong; He, Qingdong; Yang, Hao; Jin, Ying; Wu, Jiafu; Hu, Xiaobin; Pan, Yanjie; Gan, Zhenye; Chi, Mingmin; Peng, Bo; Wang, Yabiao; 
		> created on 2026-01-06
	* [知乎翻译](https://zhuanlan.zhihu.com/p/30599332006)（不完整，公式遗漏等）
	* fig2 MM-DiT，文本、待去噪图像、条件图像 1、条件图像 2… 均作为不同模态
		* 各图像分支的网络权重仅相差 LoRA
		* （评）各种图像类型的 LoRA 需要独立学习，而非网络依据文本描述自行判断如何处理该分支
	* CMM-DiT 注意力：文本与待去噪图像的 Q 有全局感受野（所有输入都提供 KV），条件图像分支的 Q 感受野互不包含
		* （评）按 fig2c 类似注意力掩码，条件图像分支之间无信息传递
		> 为应对这些挑战，我们引入一种新颖的条件MMDiT注意力机制（CMMDiT注意力），如图2 (c)所示，以取代原始的MMDiT注意力。
		> CMMDiT注意力并非一次性将整个统一序列输入到MMDiT注意力中，而是根据哪个分支作为查询遵循不同的计算机制。
		> 其核心思想是，作为查询的分支根据其类型聚合统一序列不同范围的信息。
		> 具体而言，当去噪分支和文本分支作为查询时，它们的键和值的范围对应于整个统一序列，使它们具有全局感受野，并能够从所有条件分支聚合信息。
		> 相比之下，当条件分支作为查询时，它们的感受野互不包含。
		> 它们的键和值的范围限制在子序列中，如公式(3)所示，这防止了特征交换，避免了不同条件之间的信息纠缠。
		* 注意力复杂度关于条件个数线性增长
* Stable Diffusion 3 解读
	* [2026-01-05](https://zhuanlan.zhihu.com/p/686273242)
	* rectified flow（类似流匹配）时间采样：认为 t 在 0、1 附近好学，中间值应增大采样概率
		* 三种方案，logit-normal，其 heavy tail 改版，CosMap
	* AE 空间压缩 8x（分辨率可变）、通道数 16（多于之前的 4）
		* 需用较大规模 DiT 才能体现优势
		> autoencoder下采样8x，而patch size为2x2，所以最终下采样16x。
	* 文本编码器
		> SD3的text encoder包含3个预训练好的模型：
			> CLIP ViT-L：参数量约124M
			> OpenCLIP ViT-bigG：参数量约695M
			> T5-XXL encoder：参数量约4.7B
		> 具体地，SD3总共提取两个层面的特征。
		* 全局语义：CLIP pooled embedding；用于 AdaLN（和流匹配 t 的正弦编码一起）{_q15j3b}
			> 首先提取两个CLIP text encoder的pooled embedding，它们是文本的全局语义特征，
			> 维度大小分别是768和1280，两个embedding拼接在一起得到2048的embedding，
			> 然后经过一个MLP网络之后和timestep embedding相加。
		* 细粒度特征：CLIP 倒数第 2 层特征，T5-XXL 最后一层特征
			* （评）CLIP 最后一层是用来做池化然后和图像 embedding 对齐的，因此似乎一般不能直接用
			> 这里也先分别提取两个CLIP模型的倒数第二层的特征，拼接在一起可以得到77x2048维度的CLIP text embeddings；
			> 同样地也从T5-XXL encoder提取最后一层的特征T5 text embeddings，维度大小是77x4096（这里也限制token长度为77）。
			> 然后对CLIP text embeddings使用zero-padding得到和T5 text embeddings同维度的特征。
		* 两类细粒度特征沿 seq-len（N）维度 concat，作为完整文本嵌入（> 相当于文本重复了两次）{_q15j48}
			> 最后，将padding后的CLIP text embeddings和T5 text embeddings在token维度上拼接在一起，得到154x4096大小的混合text embeddings。
			> text embeddings将通过一个linear层映射到与图像latent的patch embeddings同维度大小，并和patch embeddings拼接在一起送入MM-DiT中。
		* 无条件生成：三个 text-encoder 独立随机 drop，使全 drop 概率 10%
			* 好处—推理降本选项：去掉吃显存的 T5 text-encoder、保留其他两个 CLIP
				* 效果：不影响美感；文本遵循度略下降；文字生成准确性下降较多
	* MM-DiT，文本图像 tokens 沿 N concat 算注意力，但涉及的权重独立（QKVO 投影、FFN）{_q15j34}
	* 类 cos 注意力：算注意力前先 RMSNorm，以避免 logit 过大导致训出 NaN；{_q15j81}
		* （评）很像 SWin V2 scaled-cosine 注意力，不过有区别
			* 归一化方式：本文是所有分量幅值在 1 附近，cos-attn 在 1/√d 附近，使向量总模长 1；fp16 下可能前者更不容易出现浮点下溢问题
			* 可学 scale 位置：cos-attn 是算了 QK 内积后统一 scale（每个注意力头只有一个参数），RMSNorm 是 QK 分别 scale（其实有参数冗余，等价于只 scale 一个），而且各分量 scale 值独立
		> 为了提升混合精度训练的稳定性，MM-DiT的self-attention层还采用了QK-Normalization。
		> 当模型变大，而且在高分辨率图像上训练时，attention层的attention-logit（Q和K的矩阵乘）会变得不稳定，导致训练出现NAN。
		> 这里的解决方案是采用RMSNorm（简化版LayerNorm）对attention的Q和K进行归一化。
	* 位置编码：同 ViT，两套 1D 可学编码 concat；{_q15k2p}
		* 分辨率泛化：插值+扩展
	* rectified flow 分辨率泛化：高分辨率同噪声水平下信息损失更小，通过调整 timestep scheduler 解决；{srs:q15h4r}
	* DPO 后训练，不像 RL 需 reward model
* 2411.11343 （备用）扩散视频生成结果可能非物理，通过引入隐式知识引导生成符合物理结果
	* "Latent Knowledge-Guided Video Diffusion for Scientific Phenomena Generation from a Single Initial Frame", AAAI 2025
		* Cao, Qinglong; Li, Xirui; Wang, Ding; Ma, Chao; Chen, Yuntian; Yang, Xiaokang; 
		> created on 2025-11-26
	* [公众号报道](https://mp.weixin.qq.com/s/Q53eNZhxFtRLjbRQcjakbg)
* 2412.13897 面向流体渲染任务，真实数据难收集，利用 PDE 流体基础模型的先验 提高观测数据利用率
	* "Data-Efficient Inference of Neural Fluid Fields via SciML Foundation Model"
		* Liu, Yuqiu; Xu, Jingxuan; Soroco, Mauricio; Wei, Yunchao; Chen, Wuyang; 
		> created on 2025-01-03
	* 摘要摘录
		> 3D视觉的最新发展使推断神经流体场和流体动力学的逼真渲染取得了成功。
			> 然而，这些方法需要真实世界的流量捕获，这需要密集的视频序列和专门的实验室设置，使该过程成本高昂且具有挑战性。
		> 科学机器学习（SciML）基础模型基于偏微分方程（PDE）的广泛模拟进行预训练，
			> 编码了丰富的多物理场知识，从而为推断流体场提供了有前景的领域先验资源。
			> 然而，它们在推进现实世界视觉问题方面的潜力在很大程度上仍未得到充分探索，这引发了人们对这些基础模型的可转移性和实用性的质疑。
		> 在这项工作中，我们证明了SciML基础模型可以通过改进的泛化能力显著提高推断真实世界3D流体动力学的数据效率。
		> 我们方法的核心是利用SciML基础模型的强大预测能力和有意义的表示。
		> 为神经流体场配备了一种新的协作训练方法，该方法利用了我们的基础模型提取的增强视图和流体特征。
	* sec2.1 问题设定：给定烟雾上升的视频（nf 帧），推断其中的 3D 密度场、速度场
		* 密度场用于 3D 渲染，速度场用于时间内插、未来预测
	* 视频数据集：ScalarFlow，对应物理为流体中标量场输运过程，包括向湍流过渡
		> 使用校准摄像机的烟雾视频。
		> 最近关于神经流体场重建的工作侧重于研究ScalarFlow数据集[16]：真实世界烟羽的体积重建的综合集合（图1左）。
		> 它包括一系列复杂的、浮力驱动的向上上升的流动，这些流动过渡到湍流，捕捉到可观察到的标量输运过程。
		> 据我们所知，ScalarFlow是迄今为止关于真实世界流体（烟雾）动力学的最佳校准数据集。
	* sec3.1 架构：先训练流体基础模型，架构基于 3D SWin Transformer（6.5M 参数），处理含时 2D 流场
		* 数据：PDEBench INS、CNS、SWE、反应扩散，插值到相同空间分辨率
		* 预设最大分量集合，多余通道零填充
		* 课程学习：时间推进步数逐步增加，从 3 到 8，每 20 epochs 增加 1
	* sec3.1:-1 希望利用流体基础模型的性质，帮助流体渲染；{_p19e9f}
		* 1. 预测能力：可用于时间内插数据增强，通过预测速度场
		* 2. 表征学习：提取流体的有意义特征，以提高 3D 神经场泛化能力
	* sec4 实验设定，与 baseline 方法比较：新视图合成（利用密度场在未训练角度位置渲染），重新模拟，未来预测（利用速度场推测未来帧）
		* 小样本：使用更少视频帧 nf 训练时，本文模型优势明显
		* 避免伪影，预测稳定（密度场不发散）
		* 快速收敛
* 2508.08254 流体相关视频生成（瀑布等）结合物理机理
	* "Learning an Implicit Physics Model for Image-based Fluid Simulation", ICCV 2025
		* Jia, Emily Yue-Ting; Mao, Jiageng; Gao, Zhiyuan; Zhao, Yajie; Wang, Yue; 
		> created on 2025-09-24
	* [项目地址](https://physfluid.github.io/)，有演示视频
		* 似乎是循环视频（首末帧相同），需确认怎么实现的（好像本来也没有必要）
		* 似乎缺少空间位置（深度前后）感知，第二个视频的树枝周围直接按石头处理了，但水本应在树枝后面自由流动
	* fig2 总体流程，据图像分别 1. 预测 3D 速度场，2. 构建 3DGS 场景表征
		* 合并两路信息：3DGS 随速度场运动，得未来场景预测
	* fig3a physics-informed neural dynamics，输入自然图像，输出未来速度预测；{_p9pl1o}
		* 输入 1. 自然图像，2. 深度图，3. 流体区域 mask
		* 输出 1. 1+3D 速度场 u(x,t)，2. 3D 外力 f（无时空依赖）
		* loss：1. PDE 残差（NS，不可压条件，BC 要求无流体区域预测为 0），2. 与场景预测速度比较的误差
		* （评）工作原理有点像输入为自然图像（而非物理初值）的 PI-DeepONet，虽然网络架构不太一样
	* sec3.2 流体表示，用 3DGS，预测未来演化时使 Gaussian 中心随预测流场运动
		> 我们的目标是从一张图像中生成视频，捕捉流体运动和相机运动。
		> 为了实现这一点，我们需要一个非常适合动画的流体表示，并与我们的物理神经动力学相一致。
		> 这种表示必须是3D的，因为生成具有相机运动的视频需要3D几何知识。
		> 为此，我们采用像素对齐的3D高斯分布[22]作为我们的流体表示。
		> 通过使用深度信息将像素提升到3D空间中，可以很容易地从单个图像中导出3D高斯分布。
		> 此外，它通过简单地移动每个高斯函数的中心来 facilitate 动画。{_p9pk7l}
		> 与3D点云不同[23]，3D高斯分布在空白区域提供自然混合，有效地解决了点云光栅化过程中出现的孔洞问题。{_p9o886}
	* （评）所属框架：直观物理学-严格物理学辅助
