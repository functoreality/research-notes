> 2022-08-05 从 freeNotes.md 分裂出来

* （部分早期内容在 tutorialNotes.md）
## General
* PointConv 可用于点云分类（邻域连边后转化为 GNN）
	* `funcGAN-2102.04776` 指出在数据排列于规则网格上的情形，其表现接近传统 CNN
	* 从而适用于处理无网格的图像（用关于空间的函数表达）相关问题
	* 脚注提到了 GNN 卷积计算的加速方式

## Geometric DL
> 仅考虑传统理论；GNN 见单独文件
* graph DHC 定理
	> from 2021第六届全国统计物理与复杂系统学术会议
	* 统计量 $\operatorname{H-ind}:\bigcup\mathbb{N}^n\to\mathbb{N}$，表示有 $h$ 个数不小于 $h$
	* 对一个图，顶点初始化为度 $h_i^0=\#N(i)$，迭代对相邻顶点的值求 h 指数 $h_i^{k+1}=\operatorname{H-ind}(\{h_j^k\mid j\in N(i)\})$，可以证明会收敛，称为“核数”；
	* 这种迭代可以定义有向图、带权图的版本
* Map Synchronization: from Object Correspondences to Neural Networks
	> 知乎似乎没有相应主题？关键词应该是什么
	* [cvpr2019 tutorial](https://www.cs.utexas.edu/~huangqx/cvpr19_tutorial_map_sync.html)
	* 图像、点云之间的特征、片段进行匹配；两两匹配不容易，利用第三（或更多）对象的信息，"map propagation" 帮助匹配
	* slide 2, part 1 pose estimation，多角度照片恢复 3D 模型，需要恢复两两 relative poses
		* Cycle consistency on *pose graph*
		* Three types of approaches
		1. Inlier/outlier inference，寻找“好”的边用于连接整个图得到相互位置，放弃不好的边
		1. Local, iterative optimization
		1. Global, factorization-based optimization，匹配矩阵要求接近 noisy measurements
			> 这个和文老师大数算最开始教的东西差不多
	* slide 2, part 2 Correspondence Estimation
		* 角度问题某些特征在某图片里不出现，为达到 cycle consistency 引入 latent feature space 作为中介，每个图片与其匹配即可
	* slide 3, consistent segmentation, 
		* 逐个物体分割可能效果不好，几个相似物体分割结果相互参照，改进结果
		* 法1，单个物体分割为 normalized laplacian data matrix 的特征值问题 (> ?)，多个物体构造分块矩阵，对角为各自 laplacian，非对角为相互映射关系
		* 法2，优化问题，二者的分割方式的 score 和 + consistency score
		* 考虑到有缺失部分，由 $\ker X$ 描述；需要大数据集
		* 考虑对称性，群
	* slide 4, domain mapping
		* cycleGAN, GAN loss（迁移的结果看起来真）+reconstruction loss；{_ocgf11}
		* 失败例子：马变斑马的例子在有人骑马的时候给人也加上条纹，训练集的马没有人骑
		* 代码开源
	* slide 5, theory
		* cycle consistency $\ne$ path invariance (: ?)
### point cloud
* TDA
* [基于扩散过程及其逆过程的点云生成](https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2650820767&idx=5&sn=ff5690c538132eb47758d922ddb5dbe8)
	* 扩散过程将原点云扩散为正态分布，逆过程依赖于隐向量；用类似 VAE 的 ELBO loss 训练；
	* 相比传统方法，好处包括点的个数可以不固定，点之间的置换对称性自动成立

## CV
* [BYOL](https://zhuanlan.zhihu.com/p/352364087) 不用负样本对的对比学习
	* [机理解读文章的介绍](https://www.zhihu.com/question/402452508/answer/1536241957)
* [自监督学习 intro](https://zhuanlan.zhihu.com/p/96748604) 
	* 数据增强：对图片数据做 旋转、变色、裁切等，扩充数据集，loss 不变；
	* MTL 额外引入 判断旋转角度 这样的 loss
	* self-supervised learning 进一步将两个分类问题合并（同时输出分类与角度；只判断错一个的 loss 值和两个都判断错的是一样的）
	* 最后一层权重 $w_{ij}$：$=u_i$ 时退化为数据增强，$=u_i+v_j$ 时退化为 MTL
	* 额外引入“自蒸馏”loss，避免单纯预测分类时需要测试多个角度
	* 文章 S^4L 中，有标签数据使用正常分类 loss，无标签数据使用自监督 loss
* 图像自监督补全：DIP，及 BNN 版本 `2021-08-28`(lectures)
	* 我对 DIP 的原理猜测：NN 参数化的函数/图像空间
		* 初始化为小区域
		* 周围短暂训练达到的较小邻域具有（函数）低频、（图像）低秩（规律重复 pattern）特点
		* 训练更长达到的较大邻域包含了大部分真实图像
		* 再训练才能遇到含噪声、模糊的图像
	* 2021-11-10 组会讲的（未记录，未深入看）"Rethinking Deep Image Prior for Denoising" 试图从统计角度说明 DIP 原理，并提出加某个 loss 训练可恢复更多图像细节又不过拟合噪声
	* `2022-12-14`(dbGrpMeet2) 讨论 PIP（positional-encoding image prior），CNN 换 MLP 并引入位置编码，效果有提升、参数量更少
* [VOS-CV模型识别OoD对象](https://zhuanlan.zhihu.com/p/467790256)
	* ICLR2022 工作；传统方法会对 OoD 物体产生高置信度预测，本文预测输出中添加 OoD 分类，并生成模拟 OoD 物体的数据；可用于分类、目标检测任务
	* OoD 物体生成利用了模型的一部分，从目标区域周围的低似然区域选取（> ？）
	* 网络架构基于 Faster-RCNN
* [CNN发展历史](https://zhuanlan.zhihu.com/p/37234275)，从 AlexNet 到 CliqueNet，各方法动机与特点
	* （评）2022-08-20 记录；为 2018 年的老文章，故无注意力和 ViT 等
	* LeNet-5（Yann LeCun, 1998）奠定了整个 CNN 的基础
	* AlexNet 
		* 第一次用 GPU；老式 GPU 显存不足，故网络分为两部分，用两块 GPU 分别处理
		> 第一次使用 ReLU 非线性激活函数、第一次使用 Dropout 以及大量数据增强而实现网络的正则化。
		> 使用带动量 SGD、L2 权重衰减以及 CNN 的集成方法
	* VGG-Net，相比 AlexNet 有更小的卷积核和更深的层级，减参数量、深层非线性更强
	* GoogLeNet（或 Inception-v1）；为梯度消失问题，引入中间多出来的分类网络提供额外梯度
	* ResNet；可像 Inception 模块引入瓶颈结构：1×1 卷积对特征降维，卷积后结果再升维至原维度；用低维特征计算能省计算量
	* DenseNet，concat 代替 sum
		> 一些研究表明 ResNet 中的很多层级实际上对整体的贡献非常小，即使我们在训练中随机丢弃一些层级也不会有很大的影响。
		> 这种卷积层和特征图的冗余将降低模型的参数效率，并加大计算力的需求。
		* 分为不同 dense block，仅在内部 concat 特征图，block 之间有卷积、池化调特征图大小（导致无法 concat）
		* 后层卷积所用特征图深（channel 多），仍像 Inception 在 3×3 卷积前引入 1×1 卷积瓶颈
		* 复制后 concat 操作占显存（尽管参数量少），有改进实现；计算量大，难用于实时任务
	* CliqueNet，受循环结构、注意力机制启发：
		* 每 block 内两个 stage，前一个同 DenseNet，后一个中重算每层特征图，用深层高阶视觉信息精炼浅层 feature（空间注意力的效果）
		* 后一个 stage 中每层输入不包括 block 的初始输入，不同于前一个
		* 后层接收前层输入的参数在两个 stage 中相同
		* 另有多尺度特征策略，单 block 输入输出特征图 concat、池化得向量，所有 block 向量 concat 用于最后预测
			* 省参数，梯度传播更高效，计算量较低（> 计算量？内存需求低倒能理解）
		* 相关：[这篇CliqueNet解读](https://zhuanlan.zhihu.com/p/37891108) 提到 Boltzmann machine 和 Hopfield Network 都是神经元无深层浅层之分，CliqueNet 可从类似的能量模型角度解读
		* 相关：`RKNet-1802.08831` 将 CliqueNet 解读为 Runge-Kutta 时间推进隐式格式（DenseNet 对应显式格式）
* `ViG-2206.00272` 图像任务 GNN 式架构，patch 视为 graph 顶点、加位置编码，前传每层据特征取 kNN 连有向边，全局信息提取分 isotropic、pyramid 两类架构
	* "Vision GNN: An Image is Worth Graph of Nodes"
		> `2022-08-26`(CSImeet2) 推荐，华为的工作
	* fig1 CNN 用 grid 结构，Transformer 用 sequence，本文用 graph
		* （评）Transformer 可按完全图理解，用注意力进行消息传递 `[Transformer为完全图GNN]`
	* （评）当天讨论，导师觉得就是图像处理很老的 nonlocal mean 想法，如 BM3D
		* 不同在于原来用 patch 间 L2 距离，这里是学出的 feature vector 的距离
		* BM3D 相当于 patch 流形上的 diffusion，ViT 也用这个办法解释了 `Sinkformers-2110.11773`
	* sec3.1 图像划分为 $N$ patch 视为图顶点，每个转化为 feature vector；{_n7a92c}
		* 据此 feature vector 算 kNN 连有向边
		* fig4 graph 在不同层的边连接情况不同，kNN 为逐层重算
	* 顶点 feature 更新：多头架构，图消息传递后每节点 feature vector 独立再过网络
		* 用 DeepGCN：$x_i'=W\max_{j\in N(i)}(x_i-x_j)$，无 bias
		* （评）应该是逐分量 max
		* multi-head 结构（> 我觉得就是说 $W$ 分块对角）
			> 多头更新操作允许模型在多个表示子空间中更新信息，有利于特征多样性。
		* 为避免过度平滑等 GNN 现象，用的最终版本：
		* 输入块再升维、图卷积后降维回来 $y_i=x_i+W^o\sigma(W\max_{j\in N(i)}(W^ix_i-W^ix_j))$
		* 再加上逐点 feature 处理 $x_i'=y_i+W^2\sigma(W^1y_i)$
			* （评）形式上这个逐点 feature 处理可并入 GNN 的 update func
	* 网络架构用两种：Transformer 类各向同性（isotropic）架构、ResNet 类金字塔（pyramid）架构
		> 各向同性架构意味着主体在整个网络中具有相同大小和形状的特征，例如 ViT 和 ResMLP 
		> 金字塔架构考虑了图像的多尺度特性，通过随着层的深入提取空间尺寸逐渐变小的特征，例如 ResNet 和 PVT
	* 位置编码，表示节点对应 patch 的位置信息，各向同性、金字塔架构都用
		* 绝对位置编码，$x_i$ 换为 $x_i+e_i$（> 只在输入层初始化时用到？）
		* 金字塔结构进一步引入相对位置编码（仿照 SWin Transformer），$i\to j$ 边相对位置距离 $e_i^\mathrm{T}e_j$，构建 graph 时会加入到 feature distance 中
	* （评）讨论当天提到的可能性：用于处理 ((n32f0k))场的数值表征-多块规则网格拼成复杂区域 类数据
		* 不同块的网格直接作为 graph 不同顶点，无需考虑拼接等复杂处理
			* 或者把每块网格切分成相同大小的 patch，不同网格大小不同故 patch 数也不同
			* 若各网格尺寸没什么最大公约数，可能考虑 padding 等办法预处理
			* 或者直接允许不同大小 patch，反正都是编码为 feature vector 在隐空间操作
		* 位置编码需要设计，如何体现原来的物理空间位置、邻近关系？
		* 表达能力预估：相当于 patch-wise GNN，比 gridpoint-wise GNN 有潜力
			* 非规则网格 GNN 利用的先验信息不够，精度不如 CNN
			* 该做法相当于半规则网格，GNN 一个顶点表示的不是函数在空间单点处的取值，而是一小片规则的 grid
			* 至少在图像任务上能达到 SOTA，说明潜力很大
		* 和序列型 Transformer 可能差别不大？（本文做法和 ViT 也可能差别没那么大）
			* 或许有区别在于本文 GNN 不全连接，算信息传递不是 QKV 结构，或许计算代价、参数量相对小
* VQ-VAE解读 - 知乎；{n4sn1z}
	* [2023-04-28](https://zhuanlan.zhihu.com/p/91434658)
	* 注：作为 VQ-GAN 的前置工作
	* 隐向量是 feature-map，size $(H',W',D)$（不是简单的普通向量）
	* VQ 指 vector-quantization，要求 VAE 隐向量各像素（有 $D$ 通道）取值可能性有限，由 codebook 给出
		* （评）类似聚类，codebook 给出聚类中心
	* 推断时，过编码器得隐向量，每个像素换为 codebook 中最近的元素
	* 训练 loss 第一项：普通 AE 重建 loss；VQ 操作在反传时按 id 进行；{_n4sn0e}
	* 训练 loss 希望编码结果与 codebook 接近，同时训练二者，但使用不同大小的梯度
		* 注：见我在((n4sn0r))的记录
		* 其中训 encoder 项的目的：防止其输出在不同 codebook embedding 间反复跳跃；{n4sn1b}
	* 训练完成后，按生成模型用，需刻画隐空间分布：用 PixelCNN 建模联合分布；{_n4sn2d}
		* PixelCNN 形如 $p(z_1,z_2,\dots,)=p(z_1)p(z_2|z_1)p(z_3|z_1,z_2)\cdots$
		* （评）这里 $z$ 应该排成 2D 的，或许是拉成了直线
		* （评）据说 VQ-GAN 的联合分布改用 Transformer 建模
* 详解VQGAN（一）| 结合离散化编码与Transformer的百万像素图像生成 - 知乎
	* [2023-04-28](https://zhuanlan.zhihu.com/p/515214329)
	> 文章里没有具体写对抗loss的类型。通过阅读源码我发现使用的是hinge loss。{_n4sn61}
	* 用 Transformer 建模隐空间分布：先拉成向量；{_n4sn6u}
		> 随机将其中的一部分code替换为随机生成的相同维度的向量，这个过程可以理解为在特征中加入强噪声，以提高Transformer的泛化能力。{_n4sn70}
			* 要求其重构出未被污染的隐向量
		* 用 Transformer 替换 PixelCNN 的结果：输出分辨率大大提高
* Stable Diffusion UNET 结构 - 知乎
	* [2023-03-30](https://zhuanlan.zhihu.com/p/582266032)
	* U-Net 架构示意图，包括语义信息引入的 Transformer、各张量尺寸等，PNG 格式、大小 4.1MB（已下载）
	> latent 向量对应的是是图片 token，和 context embedding 做 cross attention 之后，得到变换后的 latent 向量（通过注意力机制，将 token 对应的语义信息注入到模型认为应该影响的图片 patch 中）。
	> Spatial Transformer 输出的 shape 和输出的 shape 保持一致，但在对应的位置上融合了语义信息。
* `LDM-2112.10752` stable diffusion
	* "High-Resolution Image Synthesis with Latent Diffusion Models"
		* Rombach, Robin; Blattmann, Andreas; Lorenz, Dominik; Esser, Patrick; Ommer, Björn; 
		> `2023-04-27`(largeModMeet)
* 2023-04-27 报告，wby：扩散模型与微调方法；{n4sd5z}
	* 注：以下内容根据 slides 整理；原位置 `2023-04-27`(largeModMeet)
	* stable diffusion
		* 扩散模型在隐空间运行；定义隐空间用的 AE 为自行训练
			* 这里的隐空间形如小尺寸、多通道图片，不是传统有限维向量；{_n4rk17}
		* 训扩散模型前先训 AE（以定义隐空间），loss 三项：普通 AE 重建 loss，GAN loss，正则化
			* AE 重建 loss 用 perceptual loss：图像中常用，若简单用 L1,L2 loss 会导致图片模糊
				* perceptual loss 见 1801.03924：用 ImageNet 上训练的 VGG net 提取 feature，比较 feature 的差异；{_n4sj5c}
			* GAN loss 使用 patch based 判别器 $D_\psi$；{_n4sj7r}
				* 注：VQ-GAN 已经使用了 PatchGAN
				* 隐向量并未随机生成，实际上用的 loss $\log(1-D_\psi(D(E(x))))$；{_n4sj88}
			* 正则化项可能性 1：KL 正则化（同 VAE）
				* （评）似乎只在该项比例系数取 1 时同传统 VAE？这里要求轻微的正则化，比例系数 1e-6
			* 正则化项可能性 2：VQ 正则化，同 VQ-GAN-2012.09841
				* 注：似乎这部分主要只涉及 ((n4sn1z))VQ-VAE 的内容
				* 大意似乎是：注意隐向量也是图片，希望 patch 集合不要太多样¹，可聚类、被一个 codebook 表示；{_n4sn1l}
					* ¹这里类似于惩罚 patch set 的 entropy number，只是所用小球数为一般整数、未必 $2^N$
						* 此外熵数定义是对所有点取 sup（或 L-inf 范数），这里相当于取 L2 范数
					* 注意 codebook（聚类中心）对所有 $x$（待编码图片）共享
				* 原始 VQ-GAN 的 AE 重建 loss $D(Q(E(x)))$，$Q$ 量子化，隐向量每 patch 换为 codebook 中最接近元素
				* 训练，同时优化 encoder（其 patch 为被聚类的集合）、codebook（聚类中心），loss 为二者 l2 距离；{n4sn0r}
					* 希望 codebook 更新速度大于 encoder：利用 stop-gradient 算子 $sg(-)$，把 l2 loss 改写成两项加权 loss；{_n4rm14}
						* （评）PyTorch 中 sg 算子可用 `a.detach()` 实现
						* （评）感觉在这个场景下没有必要？codebook, encoder 在这里分别参化，直接用不同学习率就好了¹；如果两项有共享部分参数则还可以考虑
							* ¹后来意识到 不同学习率、loss 不同权重 二者含义有区别，只在 GD 下相同，对 Adam 等无影响
					* 注：VQ-VAE 原文提到((n4sn1b))训 encoder 只是为防止其量子化结果反复改变；{_n4sn24}
		* 生成过程中 conditioning 引入两种方式：直接 concat，用注意力，也可以两个都用
			* concat 主要用于图像给出的 condition；出自 2111.05826；{_n4sn37}
		* 注意图像涉及两种编码器：得隐向量，得 condition
			* 得 condition 的部分用于条件扩散模型，生成用 CLIP，和文本 condition 可对齐；{_n4sn3g}
		* 2207.12598 考虑 condition 引入，扩散模型中去噪网络同时训无条件、有条件版本
			* 推断阶段，采样去噪网络用外插（> 类似数值代数 SOR），远离无条件版本、强化有条件版本的特性：$(1+\omega)\epsilon_\theta(z_t,c)-\omega\epsilon_\theta(z_t)$；{_n4sn4g}
				* CFG-scale $\omega$ 权衡多样性（较大时）、fidelity（较小时），实现时 $\omega>1$
		* 2201.09865 图像 inpainting 中的 masked diffusion，只在 mask 以外加噪声；{_n4sn4o}
		* 数据集：LAION-Aesthetics，600M 图文对，图片均高质量
		* Imagen-2205.11487 不同于普通扩散模型基于去噪，这里基于超分辨率；{_n4sn4y}
			* 具体地：扩散模型生成 64x64 图像，再过两个超分辨率扩散模型得 256x256, 1024x1024 图像；每步均输入 text 编码后的结果
	* fine-tune 方法
		* DreamBooth-2208.12242 个性化，如生成同一只狗不同姿势、场景的照片，需提供 3-5 张已有照片；{_n4t94m}
			* 输入：3-5 照片 + class name（如“dog”）、预训练的文生图模型；输出：个性化微调后的文生图模型，特定狗的唯一标识符 `[V]`（这个基本每次都一样）
			* 使用示例：A [V] dog on the beach
			* 用 [V] 比用已有英文单词（如“unique”）、随机字符串（如“xxy5sty000”）都好：避开模型已有的强先验；{_n4t950}
				* 若用已有英文单词，模型要将它从原有含义 disentangle 出来，并 re-entangle 到特定对象
				* 若用随机字符串，tokenizer 可能逐个字母编码，模型还是有强先验
				* 把 [V] 当形容词，后跟 class name，好处：可利用模型对 class name 的先验
					* ablation：好于给错误的 class name，又好于不给 class name
			* 训练 loss：对输入的特定狗的 loss、（$\lambda$ 倍）预训练（一般的狗）的 loss；{_n4t97u}
				* 都是去噪模型中噪声预测 loss，只是所用的图片数据集不同（前者为用户给的几张图）
				* 预训练 loss 可用于促进生成结果的多样性
					* ablation：给的特定狗照片都趴着，若无该 loss 则生成的 [V] dog 都趴着，有该 loss 则姿势更多（因数据集里见过的狗有更多的姿势）
				* 预训练 loss 还可避免 language drift，“dog”仍是原来的含义，仍能生成普通狗
					* ablation：无该 loss 时，"a dog" 生成的都是特定狗，有该 loss 时能生成一般意义上的狗
		* ControlNet-2302.05543
			* 一般情形：设已有训好的 $x\mapsto y$ 网络，希望调整为带额外 condition 输入的网络 $(x,c)\mapsto y$：架构示意图 `<n4sb2g>`；{_n4tj05}
			* 在 Stable Diffusion 中的架构，资源有限版本：对 U-Net 前半部分¹使用
				* ¹指所有下采样模块组成的整体
			* 在 Stable Diffusion 中的架构，训练资源（算力、数据）足够：仍是对前半部分搞 trainable copy，但结果加回的地方变多
				* 回忆 U-Net 每个下采样模块输出在两处使用：(1) 后续下采样模块的输入、(2) 后半部分的同尺度模块
				* 每个 trainable copy 输出结果做 1x1 卷积后，结果加到 (2) 对应的输入中
				* 比较：资源有限版本是只对最小尺寸的 trainable copy 模块进行此操作
				* 在充分训练后，最后还可 unlock stable diffusion 原有参数，整个网络联合微调；{_n4tj1l}
			* 如果 condition 为文本，训练时无标注图片¹所用的 text prompt：{_n4tj3t}
				* ¹似乎指之前预训练阶段用的那些图片
				* (1) 空字符串，不过实现上可能有技术问题，文本编码器未必能接受空内容；{_n4tj3b}
				* (2) 废话（“high-quality img”之类），{_n4tj3f}
				* (3) AI 自动生成图片标签（最常用），如用 BLIP；{_n4tj22}
			* 推断阶段，（之前提到的）CFG-scale 取 $\omega=9$
			* 示例，condition 为人的姿势（图片形式，白底上画线条表示肢体动作）{_n4tk3t}
				* 训练集为少量图片、姿势的 pair，推断时可根据给定姿势、额外的文本描述生成新图片
			* 示例 2，condition 为各物体种类、所在区域，按分片常数图像输入（额外指定 class label）
			* 示例 3，condition 为图片边缘检测¹结果
				* ¹计算图像的梯度即可生成
* `2303.02984` （备用）基于小波的 score 生成模型，根据当前低分辨率图片预测相应高阶小波系数，局部依赖
	* "Learning multi-scale local conditional probability models of images", ICLR2023
		* Kadkhodaie, Zahra; Guth, Florentin; Mallat, Stéphane; Simoncelli, Eero P; 
		> 2023-05-02 组会群推荐
	* eqn(1-2) 小波分解 $Wx_{j-1}=(\bar x_j,x_j)$ 高频、低频分量，逆小波分解即 $W^\mathrm{T}$
		* eqn(1-1) 待表达的条件概率 $p(\bar x_j|x_j)$ 根据低频图像生成高阶小波系数
* `Point-E-2212.08751` 点云的条件生成，用扩散模型、去噪器用 Transformer
	* "Point-E: A System for Generating 3D Point Clouds from Complex Prompts" by OpenAI
		* Nichol, Alex; Jun, Heewoo; Dhariwal, Prafulla; Mishkin, Pamela; Chen, Mark; 
		> created on 2023-05-11
	* fig1 两步走，先文生图¹，再由图生成点云；前一步用 GLIDE，后一步为提出的 点云扩散模型
		* ¹其实是 synthetic view，未确认是否和传统意义上的图片完全一致
	* sec4.1 数据处理¹得到大量非均匀分布的点云，此时使用 最远点采样 得小规模均匀点云；{_n7bh2g}
		* ¹具体是先渲染为图像（多视角？），然后图像每像素对应的点加入到点云中
	* sec4.3 点云每点 $(x,y,z,r,g,b)$，对 $K\times 6$ 张量随机初始化、过扩散模型得最终生成结果
	* fig3 扩散模型架构，输入：当前点云（$K$ tokens），时间步（1 token），CLIP 编码所得 condition（256 tokens）{_n5be04}
		* 原始维数分别 $6,1,D'$，分别先 线性,MLP,线性 变换为 $D$ 维向量、作为相同大小的单个 token
		* 输出的 $K$ token 部分投影，得各点的 $\epsilon,\Sigma$（扩散模型用到的东西）
	* sec4.4 最后再上采样到 4K 个点的点云
* `Shap-E-2305.02463` NeRF 网络权重的条件生成，用扩散模型、去噪器用 Transformer
	* "Shap-E: Generating Conditional 3D Implicit Functions" by OpenAI
		* Jun, Heewoo; Nichol, Alex; 
		> created on 2023-05-11
	* [新智元报道](https://mp.weixin.qq.com/s/RmCjhl4vb5H0Et4SlcwWDA)
		> 研究人员首先训练一个编码器来生成隐式表征（implicit representation），
		> 然后在编码器产生的潜表征（latent representation）上训练扩散模型。
	* fig2 编码器，输入点云¹、输出 INR 参数²，架构 Transformer；{_n5bg3f}
		* ¹本来 16k 个点，先 PointConv 降到 1k 再进入 Transformer；{_n5bg3u}
		* ²secA.3 INR 形如 6 层 MLP，前 4 层的权重矩阵由编码器生成，后 2 层对所有样本点共享；INR 无 bias
			* secA.1 共 4 个 256x256 权重矩阵
			* 权重矩阵逐行生成
	* 生成器，sec4.3 隐空间扩散模型，架构类似 `Point-E-2212.08751`；{_n5bg9p}
		* INR 权重矩阵（的行）对应 1024 个 token（每个尺寸 1024）
		* 图像条件生成的 condition 用 256 tokens，文本条件生成用 1 token，均为 CLIP 给出
		* 文本情形支持无分类（> unconditional？）生成：对应 condition 置零
		* 不同于 Point-E：扩散模型生成的是去噪结果 $x_0$ 而非噪声 $\epsilon$
			* 认为在代数上两种方式等价，但产生的样本更 coherent；有之前的工作也报告了该发现；{_n5bg24}
			* sec2.3 p5:2 用 Heun sampler，更接近 ODE 而非随机过程版本；{_n5bg1u}
			* （评）不清楚是否逐步去噪，p5:2 说是逐步的，但公式式里是直接预测完全干净的数据图片？或需看代码
* SPAR3D （备用）基于单图生成 3D 对象，步骤 图像→稀疏点云→精细网格，Stability AI 推出
	* "SPAR3D: Stable Point-Aware Reconstruction of 3D Objects from Single Images"
	* [2025-01-09](https://mp.weixin.qq.com/s/hs5otWcFn86oLhJHulhkAw)
	> 新颖的两阶段方法：
		> 第一阶段使用轻量级点扩散模型生成稀疏 3D 点云，采样速度快；
		> 第二阶段使用采样点云和输入图像来创建高度详细的网格。
		> 这种两阶段设计能够对不适定的单图像 3D 任务进行概率建模，同时保持高计算效率和出色的输出保真度。
	> 使用点云作为中间表征还进一步允许交互式用户编辑。{_p19f47}
	> 优势：
			> 前所未有的控制：允许用户通过删除、复制、拉伸、添加特征或重新着色点来直接编辑点云。
			> 完整的结构预测：通过提供精确的几何形状和完整的 360 度视图的详细预测来增强 3D 构建。
			> 闪电般快速生成：仅需 0.3 秒即可将编辑后的点云转换为最终网格，实现无缝实时编辑。从单个输入图像，SPAR3D 仅需 0.7 秒即可为每个对象生成高度详细的 3D 网格。
	* 单图预测的挑战：被遮挡部分；需丰富的 3D 先验知识支撑
	* 网络性质：根据图像重建可见表面，依靠点云生成背面；{_p19f3y}
		> 理想情况下，网格化阶段应主要依靠输入图像重建可见表面，同时依靠点云生成背面。
		> 为验证这一点，研究团队进行了一个特殊的实验：故意将不匹配的数据输入系统（一张松鼠的图片配上一匹马的点云数据），以测试系统如何处理这种冲突的输入。
		> 重建模型的正面与松鼠对齐，而背面则遵循了点云马的形状。
		> 这个结果证实了系统确实能够分别处理可见和不可见部分的重建工作。
* 其他：
	* 生成模型((n32b3o))
	* `MuZero-RC-2202.06626` RL 做视频压缩
	* `PDE-G-CNN-2001.09046` PDE 启发的 CNN 架构设计：CNN 层替换为含时 PDE 演化，卷积、池化、ReLU 等非线性均改用 PDE 项代替功能，算子分裂后前传有显式表达式，架构保群作用等变性
	* 图片分割的一种可能技术方案：INR 拟合时用区域分解网络 `POUnet-2101.11256`
### INR
* 其他 INR 相关：
	* `2012.02189` 元学习学初始权重加快收敛、提高泛化
	* `MSCN-2205.08957` 压缩任务需 INR 稀疏编码，MAML 学初始参数时处理内循环 L0 惩罚引入问题
* [NeRF](https://zhuanlan.zhihu.com/p/390848839)
	* CG 图形渲染光线追踪场景，SDF 表达 $x\mapsto s$
	* RF（Radiance fields）是 $(x,d)\mapsto(c,\sigma)$，$d$ 观察角度，$c$ 颜色，$\sigma$ 相当于透明度
		* 从而相比 SDF 能刻画颜色，且允许不同角度观察颜色不同
		* NeRF（Neural RF）用 MLP 表达该映射（> 似乎没输入 $d$？），$x$ 升维为 Fourier 特征 $\sin kx$ 后输入网络
	* GIRAFFE 一个网络只表示一个物体的 RF（背景算一个物体），可随意组合物体而不需重训
	* 有相关工作试图提升泛化性（> 类似元学习）、处理动态场景的迁移学习
	* 更广的 Neural Rendering 领域 review，主要研究方向：
		* semantic photo synthesis；利用 GAN/CGAN 直接生成图片的那种？
		* novel view synthesis；NeRF 属于此类
		* free viewpoint video
		* relighting
		* facial/body reenactment（> 词义为重现？）
	* （评）相关内容
		* 特殊网络架构加速训练 `NeRF_5s`，大规模区域分解渲染城市 `[block-NeRF-2202.05263]`
		* NeRV-2110.13903 用于表达视频（含时），网络输入仅 $t$，MLP+ConvNet 输出整张图像
			* 2022-06-21 CSImeet 群推荐
* `NeRF_5s` CG 渲染需表达 RF 函数，特殊网络架构加速训练：多分辨率网格用 hash 压缩，训练得各格点参数
	* InstantNGP-2201.05989
	* "Instant Neural Graphics Primitives with a Multiresolution Hash Encoding"
		* Müller, Thomas; Evans, Alex; Schied, Christoph; Keller, Alexander; 
		> 2022-01-15 导师于CSI讨论群推荐
	* 设计 $(c,\sigma)=g_\theta(x)$ 的网络架构；信息全部放在 NN 参数里的做法不高效
	* （已有做法）打网格，每个网格格点存一组参数，对特定 $x$ 将所在方格顶点的参数求加权平均后再输入 MLP
		* （2023-11-01 组会，clh）加权平均方式：双线性插值；{_nb1m8t}
			* 即：设相对坐标 $x_r,y_r\in[0,1]$，4 个加权系数分别 $(1-x_r)(1-y_r),(1-x_r)y_r,\dots,$
			* 为 $C^0$ 连续的插值方式；原文还试了更高阶的插值，发现重建精度会降低
		* 可训练参数：每格点参数和 MLP 参数；{_n2pe9t}
			* 格点参数存储了多数信息，MLP 规模可很小，原文 2 隐层、宽 64、输入层宽 32（16 种分辨率，每分辨率 feature 2 维）、输出层线性（2023-11-01 组会，clh）{_nb1m9m}
		* 可使用多分辨率网格，第 $l$ 层格点形如 $\lfloor N_lx\rfloor$（逐分量取整）{_n2pe8m}
			* 有后续工作对各层网格上的 feature 进行了可视化，多尺度结构与小波系数有相似性（2023-11-01 组会，clh）{_nb1n3v}
		* 该做法问题在于，对于渲染遇到的 $g_\theta(x)$，大多数方格内没东西，从而很多参数不必要
	* 本文使用 hash 函数压缩，在第 $l$ 层对 hash 值一样的格点使用相同参数，从而共 $T$ 组待训练参数
		> 从而存储需求可比同分辨率网格的有限差分还小（如果不考虑 MLP 部分参数）；
		* 未处理 hash 碰撞问题，可能是认为其他分辨率的网格和 MLP 能够对此补偿；{_n2pf99}
		* 最后输入 MLP 的 $y$ 除了有各层对 $x$ 相邻顶点加权平均的参数（共 $LF$ 个实数）外，还有与 $x$ 无关的额外可训练向量 $\xi$
		> $\xi$ 的作用可能有点像 DeepSDF 的 $z$，不过本文做法似乎没有在多个任务上做元训练！
	* table1 超参选取，$L=16$ 层网格，每层 $T=2^{14}\sim 2^{24}$ 种 hash 取值可能，每格点的参数有 $F=2$ 个分量
	* 代码实现没用 PyTorch 或 TensorFlow，而是用的 CUDA 底层的库直接编写
		* 文中脚注称是 dynamic indexing（即判断给定的 $x$ 位于哪一个方格内部）用传统框架难实现，包括求导
	* [如何评价 NVIDIA 最新技术 5 秒训练 NERF？ - 知乎](https://www.zhihu.com/question/511604995/answer/2313338215)
		* 作者的思路是（本人理解可能有误）：
		1. 对于图像/3D信息表达，传统方法存储的是结构化数据，计算是干净的公式，与计算分离的
		1. 神经网络计算与数据混到了一起，典型如Nerf，radience field数据信息存储到了网络权重里
		1. 但信息完全在网络权重里导致训练非常慢，效率低，网络表达能力也受训练的限制
		1. 于是有了parametric encoding方式，把latent feature用结构化方式存储，例如存到3D grid上，这样表达能力不受网络权重数量的限制，每次back propogate的参数只跟3D grid对应的cell以及小网络相关，训练的时间也大量缩短
		1. 但3D grid这种结构化数据，其实也非常浪费，因为三维模型只有表面信息有意义，绝大多数的cell都是空的
		1. 用分层的树形数据结构能减少内存和需要训练的数据量，但在训练过程中动态调整树的结构开销也不小；同样稀疏数据结构同样因为需要动态更新开销也大
		1. 所以不管那些空间结构，用个LOD哈希表存grid的feature，把位置hash一下存最dense，效率最高
		1. 为了简单，哈希函数选了个最快的，哈希碰撞就不管了，因为有LOD，并不在乎某一层的error，因为Loss是把所有层都叠一起训练的，在当前层碰撞了也没关系，反正前后层会弥补；
	* （CSImeet 群）算法逻辑上挺自然的，但是实现起来涉及到多个哈希表，需要存到L2 cache里面
		* 英伟达给的代码是基于tiny-cuda-nn的库，这样加速效果才明显，代码比较底层，D上实现起来有一定工作量
		> 这可算是压缩参数规模（解决网格格点太多的问题）的好处，格点参数可放入 cache 加速计算
	* > (mine) 与 ((o6fn12))domDecmp 比较
		* 针对的问题：这里是 CG 的 RF 场，通常必有间断，常见分片常数；PDE 取决于问题种类，一般都有非常数光滑成分，部分问题有间断
			* 从而能处理高频、阶跃形式的 NN 架构都有意义
			* 若待表达的 RF 函数近似分片常数，则间断部分相当于有稀疏性，此时本文 hash 压缩技巧适用；图形学的 RF 函数和流体的激波应该都算这样的例子
			* 不过 SDF（为 Lipschitz 函数）相关工作好像也有用多尺度网格的，也许有局部细节信息（多尺度）的就适用
		* 以下讨论架构
		* RF 打网格版本为 $f_\theta(\sum\rho_i(x)z_i)$（认为 $\xi$ 可当作 $\theta$ 的一部分）
			* 多尺度网格版本 $f_\theta(\{\sum_i\rho_{li}(x)z_{li}\}_l)$，使用 concat 形式
			* 本文 hash 约简版本 $f_\theta(\{\sum_i\rho_{li}(x)z_{lh(i)}\}_l)$
			* concat 也可改写为求和形式，改定义 $z_{li}\in\R^{LF}$ 且只有 $l$ 对应的 $F$ 个分量上非零
		* AD 区域分解可能性 $\sum\rho_i(x)f_\theta(x,z_i)$
			* 多尺度版本 $\sum_{li}\rho_{li}(x)f_\theta(x,z_{li})$
		* 两类做法实际上都不依赖于网格选取（用散点原则上也行），$\rho_i(x)$ 在网格取定后自动确定，无需手动选
		* AD 显式输入 $x$，空间变化由 $f$ 直接刻画，$\rho_i(x)$ 选取更灵活，允许在小范围内为常数；
			* 现有 RF 方法不直接输入 $x$，依赖 $\rho_i(x)$ 为中介表达空间变化，$\rho_i(x)$ 非零部分不应有常数区域
	* （2023-11-01 组会，clh）后续工作
		* 用于压缩：SHACIRA-2309.15848，ICCV 2023；{_nb1n5n}
		* 用于 PINN：2302.13397，声称比传统 MLP 有 10 倍加速，不过clh自己觉得引入位置编码等技巧也能有明显加速，说不出有多少加速是这个新架构的优势；{_nb1n5y}
		* clh说后续工作基本都基于原来的 CUDA 代码，作为 NVIDIA 自己写的代码已经很高效，其他实现很难超过这个效率
* MulFAGrid-2403.20002
	* "Grounding and Enhancing Grid-based Models for Neural Fields", CVPR 2024
		* Zhao, Zelin; Fan, Fenglei; Liao, Wenlong; Yan, Junchi; 
		> created on 2024-06-15
	* [公众号报道](https://mp.weixin.qq.com/s/uguO12ZGzVMJpH08iBruCw)
	* 摘要摘录
		> 介绍了一个基于网格模型的理论框架。
			> 这些模型的近似和泛化行为是由网格切线核（GTK）决定的，这是基于网格的模型的内在属性。
			> 所提出的框架有助于对各种基于网格的模型进行一致和系统的分析。
		* 提出新架构：乘法傅里叶自适应网格（MulFAGrid）
			* 实验中泛化误差更低
	* sec3.1 GTK（grid tangent kernel）理论，仿照 NTK 并评论二者关系；{_o6g04s}
	* 可训插值函数：eqn(7) 网格插值所用权重核函数，传统固定为双线性，本文为 MFN（可训）{_oc9a4d}
		* 首层位置编码：MFN 首层输入为 x 的 Fourier features，eqn(6)
		* 中间层用格点：MFN 中间层反复引入的乘积只在格点处求值
		* （评）未保证分母非负？
		* eqn(8) 各（已激活）格点处取值归一化，得最终插值权重核函数
	* 双参数交错or同步训练：参数包括 grid latent 和插值所用 MFN 的参数，理论可交替优化，实验中同步优化
* NFFB-2212.01735
	* "Neural Fourier Filter Bank", ICCV 2023
		* Wu, Zhijie; Jin, Yuhe; Yi, Kwang Moo; 
		> created on 2024-06-15, cited by MulFAGrid
	* 摘要摘录
		> 受小波的启发，我们学习了一个在空间和频率上分解信号的神经场。
		> 我们遵循最近基于网格的空间分解范式，但与现有工作不同，我们鼓励通过傅里叶特征编码将特定频率存储在每个网格中。
		> 然后，我们应用一个具有正弦激活的多层感知器，在适当的层中获取这些傅里叶编码的特征，以便将高频分量顺序累积在低频分量之上，我们将其相加形成最终输出。
	* fig1 受小波启发，同时做空间域、频域的区域分解；{_o6fn0s}
		> 受小波的启发，我们提出了神经傅里叶滤波器组来联合执行空间和频率分解。
		> 在相同的计算和存储预算下，我们的方法显著提高了重建质量，如PSNR曲线和误差图像叠加所示。
		> 仅依赖没有频率分辨率的空间划分（InstantNGP）[37]或没有空间分辨率的频率编码（SIREN）[47]提供了次优的性能和收敛性。
		> 简单地考虑两者（ModSine）[34]可以在应用于更大的场景时增强可扩展性，但在质量和收敛性方面则不然。
	* fig3 架构示意图，（类似 InstantNGP）各网格点有其可训练参数，有不同分辨率的多组网格
		* 每层输入为网格点上可训练参数的插值结果（依据坐标在网格中位置），浅层用粗网格、深层用细网格；{_o6fn53}
		* eqn(4) 网格插值的结果似乎会先做 Fourier 编码后才成为 modulation（如果它能叫做 modulation）{p5ja2j}
		* 每层均过线性变换，结果加到最终网络输出上；{_o6fn3t}
* NeuRBF-2309.15426
	* "NeuRBF: A Neural Fields Representation with Adaptive Radial Basis Functions", ICCV 2023
		* Chen, Zhang; Li, Zhong; Song, Liangchen; Chen, Lele; Yu, Jingyi; Yuan, Junsong; Xu, Yi; 
		> created on 2024-06-15
	* 摘要摘录
		* 使用广义径向基的 neural fields
		* grid-based INR 格点位置固定、插值方式固定
			> 它们的神经特征的空间位置固定在网格节点上，不能很好地适应目标信号。
		* 本文方法：核位置、形状自适应，RBF；{_oc9a3n}
			> 我们的方法基于具有灵活核位置和形状的通用径向基，具有更高的空间自适应性，可以更紧密地拟合目标信号。
		* RBF 结合多频率正弦函数，以便表示细节
			> 为了进一步提高径向基函数的信道容量，我们建议将其与多频正弦函数组合在一起。
			> 该技术将径向基扩展到不同频带的多个傅里叶径向基，而不需要额外的参数，从而便于表示细节。
		* 混合 自适应/固定网格 版本 RBF，加权组合；{_oc9a3c}
			> 此外，通过将自适应径向基与基于网格的径向基相结合，我们的混合组合继承了自适应性和插值平滑性。
			> 我们精心设计了加权方案，使径向基有效地适应不同类型的信号。
	* related work 关于 local neural fields
		* 有大量早期尝试，使用密集网格
		* 也有工作在网络权重、偏置上实现局部性
		* 减少网格参数，已有大量方案
			> 多分辨率树（和/或残差）结构[41，84，16，42，58，82，76，26]，哈希网格[48]，字典优化[68]，置换自形格[56]，张量分解[9]，正交平面[51，8，61，6，25]，小波[55]和乘法场合成[10]。
			> 其中，Instant NGP[48]在不同信号类型中实现了高精度、紧凑性和效率。
		* 可变格点位置，插值函数仍固定
			> 另一项工作[27,38,78]放松了网格结构，允许神经特征在输入域中自由定位。
			> 然而，它们使用简单的插值核函数，这仍然具有有限的空间自适应性。
			> 它们的性能也不如最先进的基于网格的设备。
* [block-NeRF-2202.05263](https://mp.weixin.qq.com/s?__biz=MzU1MjY4MTA1MQ==&mid=2247599497&idx=3&sn=2d754a83c138c54a639179ed34a7c455)
	* 渲染整个旧金山
	* 基于 "Mip-NeRF: A multiscale representation for anti-aliasing neural radiance fields"
		> 也是多尺度相关！
	* 通常在每个交叉口设置一个 block，大小可变
		* 任两个连接街区的 block 间有 50% 重叠，使外观对齐更容易
	* $f_\sigma(x)$ 预测空间密度，$f_c(x,d)$ 颜色，$f_v(x,d)$ 可见性（渲染时可剔除看不到的 block）
		* 额外输入，可体现天气、光照条件变化
		* 额外过滤机制，不考虑离视点太远的 block
	* 用照片训，除角度不同外，还需处理移动的车、人等：语义分割模型生成常见移动目标的掩码，训练时忽略
		* 目前可能移除目标但未正确移除阴影；植被季节变化与风吹也会造成模糊，施工等时间不一致也需手动重训；未来可能直接建模动态目标
	* [知乎介绍](https://zhuanlan.zhihu.com/p/466426579) 转载了视频演示
* `Switch-NeRF` 自适应区域分解
	* "Switch-NeRF: Learning Scene Decomposition with Mixture of Experts for Large-scale Neural Radiance Fields", ICLR2023
		* Zhenxing MI, Dan Xu
		> `2023-02-16`(CSImeet3)
	* `2023-02-23`(CSImeet3) 讨论内容摘录
		* NeRF 模型增大将导致渲染代价增大；{_n2pe6m}
		* 一部分工作考虑分治，各块分开表征；另一部分是多尺度，一个大网络表达大尺度情况，再加多个小网络表达更细尺度的东西
			* 第二种相当于在频域的区域分解；训练是 progressive 训练，先训最粗的网络，再让第二个网络预测残差；{_n2pk1w}
				* 注：slides p12，包括 Bungeenerf（ECCV2022），MINER（ECCV2022），Pins（ICML2022）{_n2pk35}
		* 最早的 MOE 是保留前 $k$ 个网络；{_n2pk5f}
			* 这里用了 Google 之前 switch-Transformer 的做法，认为只保留一个就够了；{_n2pk6c}
		* MOE 的 router 后、输出之前为各个 NeRF 共享的网络结构，ablation 表明能提高效果；{_n2pk6n}
		* loss 加额外项，要求 MOE 不要 collapse 到一个网络；{_n31g5u}
			* 应该是在 batch 内 promote diversity，在 router 求 argmax 之前引入
		* 一般 NeRF 的一个细节：appearance embedding，拍照时的天气、光照情况等，里面也据此学了一个隐向量，和 MAD 的思路类似；{_n31g8b}
		* 比较基线：Mega-NeRF 学出的一个区域都是局部的，这个工作看最终分解情况是按草地、工地等区分，范围更大；{_n31g8j}
		* 相关 idea 包括利用语义分割预处理观察到的场景数据，去掉人、车等可移动物体；{_n31m57}
		* 相关工作，INR MOE 的最早工作用了上千个 experts
			* MINER 均匀方块区域分解，误差大的块边长平分、再平分，这样依次进行；{_n3292d}
	* 导师在想用于 PDE 求解的区域分解，如多物理情景（机翼结冰问题）{_n3293i}
		* Helmholtz 可能多数时候就分介质内外两块？
		* 可以搞时空区域分解，即空间区域分解随时间变化
* `functa-2201.12204` 新概念：NN 参化的函数表达的数据点 functa，代替 data 用于 ML 任务
	* "From data to functa: Your data point is a function and you should treat it like one"
		> created on 2022-07-28
	* functa 可用于表达图像（坐标到 RGB 值映射）、3D 形状（SDF、NeRF），术语 INR（implicit neural representation）
	* sec3.1 函数形式数据点的向量表示（为下游任务），NN 完整参数维数太高，考虑基础网络+可调参数的 modulation 形式
		* （评）为 `假设空间参化方式汇总` 方式之一，包括 secB.2 ablation
		* 可调参数通常逐层 scale+shift；文中说实验表明只用 shift 效果差不多，参数量少一半
		* secA.2 Siren 作基础网络、用每层不同 shift 表达不同的特定函数
		* ModulatedSIREN 每层形如 $x_{l+1}=\sin(\omega_0(W_lx_l+b_l+s_l)$，$b_l,s_l$ 均向量，最终 $s\in\R^L$ 为 functa 较低维向量表示
			* （评）这里是我的记号；似乎非 ResNet 形式；此外若 $s_l$ 为 scala 维数就更低，
		* 文中使用的 LatentModulatedSIREN 进一步线性压缩 $s=W'\phi+b'$，低维向量表示 $\phi$
			* 最终常用的是 256，512 这样的 modulation 维度
			* （评）$b'$ 并入各 $b_l$ 后其最终形式等价于 `CAVIA-1810.03642`，相当于 $\phi$ concat 入每个隐层激活值
		* secB.1 前几层的 modulation 对数据集建模影响更大；通过扰动各层 modulation 比较重建 L1 error 发现
			* 另外发现同扰动在所有图像中引入的误差模式很像
		* secB.2 ablation：
			* shift 用处不大
			* 子集 modulation 即只留浅层的 $s_l$，效果比线性压缩稍差（> 同参数量？）{n2ha6p}
				* 但或许可二者结合
			* ModSine `tileAD+sinArch-2104.03960` 重建精度低；{n2ha3d}
	* sec3.2 元学习给出基础网络参数：MAML 学权重子集（或称 CAVIA），内层只更 modulation，外层只更新基础网络权重（见 `CAVIA-1810.03642`）
		* 内层选用 3 步迭代（试错结果）
		* sec7 元学习局限性与替代方案（暂未记录）
	* sec4 直接用 modulation 训练下游任务 DL 模型
		* 生成模型用归一化流（normalizing flow）和 diffusion；Transformer 表现不佳，可能因为 modulation 各维度排序无意义
		* inpainting，在有生成模型表达的概率分布后，用最大后验推断；归一化流比 diffusion 生成模型更适合提供先验，因其概率密度可准确计算
			* （评）用 L2 error 重建，对数概率分布为惩罚项
		* 分类直接将 modulation 输入 MLP
		* （评）为 `NO%`“高维或高分辨率场”提供了一种解决方案
		* （评）`2022-11-25`(CSImeet3) 提到组里学弟测试了在简单的函数族上拟合能量泛函，目前这种做法效果不太好，不排除是调参问题
		* （评）`INSP-Net-2210.08772` 同样 INR 不离散直接用于下游任务，但非用 modulation，而是将学出的微分算子作用于输入 INR，重推计算图生成新 INR
	* sec7 局限性
		* 无法用 inductive bias，如空间结构的局部性、平移旋转不变性
		* MAML 训练方式的局限性：大内存开销，双循环训练不稳定，微调只考虑的几个梯度步可能限制重建精度
			* 提到 AD 可能可用于替代
		* 基础网络按 PSNR 训练（几步微调达到的尽可能高），这对下游任务未必最优；若与端到端下游模型联合学习，则可能损害重建质量
	* 提到了若干有利用潜力的 INR 进展，如 `2111.15135` 比 sine 更好的激活函数，`(Implicit)2` 用隐式层加速训练、减内存占用
	* （评）INR 相关话题记录放在 `coordMLP%`
* `INSP-Net-2210.08772` INR 不离散化直接用于下游任务（包括图像分类），ansatz 为可学微分算子作用后得新 INR，证明可逼近任意卷积，算高阶导靠生成前传网络计算图而非现场反传
	* "Signal Processing for Implicit Neural Representations", NeurIPS2022
		> created on 2022-12-23
	* INR 问题表述：找连续函数 $\Phi$ 满足多个约束，约束涉及的可观测量由泛函给出
		* 可写为优化问题，使各泛函取值的 2-范数和最小
		* 例如，泛函为各点取值，则是在 memorize 一个信号（> 包括信号压缩）
		* 泛函为微分算子，则是解 PDE（或一般的微分方程）
		* （评）NeRF 根据图像重建三维场景，此时泛函为 用当前 INR 从某视角的渲染结果 与 目标图片 的差值？视角也是需求解的量
		* （评）相关：CV 中涉及的 INR 任务列举还可在 `[GitHub-INRsurvey]` 看到
	* 进行数字信号处理（DSP）时，用网格离散为像素、体素 grid 做法缺点：有限分辨率、离散化信号，内存效率低，对建模精细细节不友好
	* （评）`functa-2201.12204` 也试图 INR 不离散直接用于下游任务，比较：
		* 那里的做法是将一个空间场按参化隐式编码为 modulation 向量、再用于下游任务，需 INR 有特定结构（输入带 task-dependent 低维向量）、非 modulation 部分为特定参数
			* 这不像这里有对 INR architecture-agnostic 的性质（只要不使结果 INR 计算图生成过于复杂）
		* 隐式编码做法似乎形式上更灵活，可包括 INR 到数（如图像识别）、数到 INR（生成模型）
			* 这里主要输入输出均为 INR，图像分类没搞懂怎么做的
	* INSP-Net，对 INR $\Phi(x)$ 定义算子 $A$：$A\Phi(x)=\Pi(\Phi(x),\nabla\Phi(x),\nabla^2\Phi(x),\dots,)$
		* 可学习参数只在 $\Pi$ 中
		* 可考虑平移、旋转等的不变性
		* （评）作为微分算子自动有平移不变性；旋转不变性需对 $\Pi$ 网络架构做一定设计
		* 缩写 INSP：Implicit Neural Signal Processing
	* eqn(2) 假设原 INR 为简单 MLP 复合形式，则梯度计算方式可写出（以一阶为例），涉及每层输出逐点乘积 $\odot$
		* $A\Phi(x)$ 整体视为一整个新的 INR 网络
		* fig2 计算图中的参数共享机制
		* 为方便计算激活函数高阶导数，INR 内用 sin 激活
		* （评）提到可 PyTorch 自动微分构建计算图，不过可能不是现场前传再反传的做法，可以有某种类似计算图编译的机制？
			* 不排除理解有误，clh觉得它只是现场 BP 的做法
		* （评）框架 ((n32e95))梯度计算
	* （评）可用来做 NO，输入输出为同定义域的空间场，二场均参化表达（`NO%` 网格泛化-参数化表达）
	* thm2 一致逼近定理，卷积可被微分算子一致逼近，即 $\forall g,\exists p$ 使 $p(\nabla)f\approx g*f$
		* （评）未看推导，可能主要适合逼近局部卷积，全局卷积可逼近但效率很低
		* （评）`PDE-Net` 考虑的是反过来，离散卷积逼近微分算子
		* （评）或许意味着 CNN 均可替代为 基于空间 PDE 设计的网络架构；另有((n3sf7z))除了线性卷积外，CNN 中池化、非线性激活等也在 PDE 有对应物
	* INSP-ConvNet，$\Pi$ 使用线性映射，并多层复合为 $A^L\sigma\cdots A^2\sigma A^1\Phi(x)$
		* （评）逐点定义，未利用全局信息，故输入输出均为空间场
			* 可对应的是 U-Net 等不变尺寸任务；不过实验里还有图像分类等高级任务，没搞懂怎么做的
		* （评）每次 $A$ 都涉及多次 BP，简单嵌套作用不见得内存友好，计算也可能复杂；因此前文说的构建计算图、前传直接算高阶梯度是必要的
			* 不过高阶梯度下计算图可能较复杂？且作用第一个微分算子后，所得网络已经不是简单全连接，后续微分算子作用所得计算图的生成复杂，应需框架自动计算
	* 实验，图像低级任务（边缘检测、去噪、模糊、去模糊、inpainting）、3D 形状 SDF 模糊化，图像识别高级任务
		* 图像识别数据集只用了 MNIST、CIFAR-10；baseline，同深度的 CNN，接收 INR 参数的 MLP，接收 INR 参数的 PCA+SVM
	* secD 讨论与基于 PDE 的图像处理的关系，认为含时 PDE 时间离散后格式可作为该框架特例
		* （评）相关框架 ((n32f33))NN架构设计 基于 DE 离散格式设计网络架构
		* 另：引了 PDE-Net，PDE-Net2.0
* `COIN++-2201.12904` （备用）图像等压缩存储，INR modulation 向量再浮点数 quantize、传统二进制流编码
	* "COIN++: Data Agnostic Neural Compression"
		> created on 2022-08-19
	* INR modulation 参化方式、元学习训练主网络参数方式均类似 `functa-2201.12204`
		* 注：两篇文章一作是同一个人，不过其他作者好像都不一样
	* sec2.3 大规模图像打成 patch，训练用随机¹ patch，测试时所有图像分割为 patch 组合、每块分别算 modulation，最终用这一组 modulation 表达图像；{_p59b7r}
		* ¹patch 位置为连续随机变量，不是分割为 patch 组合后随机选几块
	* sec2.4 浮点数进一步 quantize 压缩：
		* COIN 将 NN 权重压缩到 16 位（> 半精度？），再低会严重影响性能
		* 发现 modulation 允许更激进的 quantization 至 5 位：各位大小裁剪至 $3\sigma$ 区间后，均匀划分该区间
	* sec2.5 离散数据进一步熵编码压缩；本文仅用各 modulation 值频率分布（> Huffman 编码？）
* `(Implicit)2` 同时用两种隐式：用函数隐式表征图像、形状等，网络架构用隐式层；训练快内存少
	* "(Implicit)^2: Implicit Layers for Implicit Representations", NIPS2021
		> created on 2022-07-30
	* 隐式表征 `coordMLP%`，隐式层 ((n32f5j))DEQ=FPN
	* 将 Siren，MFN 修改成为隐式层网络，称为 iSiren，iMFN
	* 隐式层迭代可能耗时，但可利用之前已有的不动点计算结果，若 $f_\theta(z,x)$ 变化不大，相应不动点 $z^*$ 也变化不大，迭代算法下迅速收敛
		* 隐式表征中网络训练幅度有限，$\theta$ 更新小；若采样点 $x$ 不变，则对每个 $z$ 只需小更新；实验中（除训练的最初一百步）不动点迭代都是一步迭代收敛
		* 能存之前所有 $x$ 的对应 $z$，这是函数隐式表征的性质：full-batch 规模小（所有像素点），每次训练都用 full-batch（> 以全图为数据点的任务则无此性质）
		* （评）利用之前相近问题计算结果，可包括 $x$ 相近或 $\theta$ 相近
	* BP 时避免求逆矩阵，之前工作使用的近似 $(I-J)^{-1}\approx I$ 效果不佳，改用级数的一阶近似 $(I-J)^{-1}\approx I+J$
	* spectral normalization 使 $\theta$ 合适，从而找 $z$ 的不动点迭代为收敛映射，不动点唯一且稳定
* `Fathony2021MFN` （备用）据说是 INR SOTA，各层不过非线性激活，而是逐元素乘输入的 Fourier feature
	* "Multiplicative Filter Networks", ICLR2021
		* Rizal Fathony, Anit Kumar Sahu, Devin Willmott, J Zico Kolter
		* [OpenReview](https://openreview.net/forum?id=OmtmcPkkhT)
		> cited by `DINo-2209.14855`
	* 记号对应：$h^l:z^{(i)}$
	* 设第 $l$ 层所用 filter $g(x;\theta_l)$
		* FourierNet 用 $g=\sin(\omega_lx+\phi_l)$，一个缺点是它是全局基底
			* $\omega$ 矩阵，同时有输入、输出维数
		* GaborNet 在其基础上乘上一个 Gauss 函数（> 类似 RBF），均值、方差也均为待定参数
	* 网络架构：首层 $h^1=g(x;\theta_1)$ 纯 feature，末层线性，中间层 $h^+=(Wz+b)\odot g(x;\theta^+)$，不涉及激活函数
	* sec3.1 FourierNet：thm1 可证明最终函数可表达为 Fourier 基底线性组合
		* sec3.1:-1 但基底个数关于层数是指数增长的，因此不会遇到低效的问题
			* 不过实际可用基底数事实上取决于参数个数
				* （评）一般 NN 表达力也取决于参数个数，这实际上已经不少
		* 证明思路简单，就是三角函数积化和差
		* sec3.1:-1 参数初始化方式，除以 $\sqrt k$ 以保证最终频率与层数无关；{_n2ie5h}
	* sec3.2 GaborNet：thm2 可表达为 Gabor filter 基底线性组合
		* sec3.2:-1 系数选择，$1/k$ scale，高斯均值均匀分布；{_n2ie5i}
	* 实验
		* fig2下 图像为白底写若干文字，用 INR 拟合
		* fig4 Helmholtz 点（Gauss）源、PINN 求解，设定仿照 `Siren-2006.09661`；GaborNet 表现好于 Siren，FourierNet 不太行；{n2ib7f}
		* FF 指 Fourier feature net
* `BungeeNeRF-2112.05504` （备用）
	* "BungeeNeRF: Progressive Neural Radiance Field for Extreme Multi-scale Scene Rendering"
		* Yuanbo Xiangli, Linning Xu, Xingang Pan, Nanxuan Zhao, Anyi Rao, Christian Theobal, Bo Dai, and Dahua Lin
		> `2023-03-23`(CSImeet3)
	* sec3.1 介绍 NeRF，Mip-NeRF
		* INR 架构整合位置编码（integrated positional encoding，IPE）：$\gamma(\mu,\Sigma)=[\sin(2^m\mu)\exp(-2^{2m-1}diag(\Sigma)),\cos(2^m\mu)\exp(-2^{2m-1}diag(\Sigma))]$，$m=0,\dots,M-1$；{_n3ng0n}
		* （日后补注，虽然也没看懂）之前可能理解错了？这有可能只是 NeRF 渲染时对视线锥区域用高斯分布近似之类的做法
* `WIRE-2301.05187` INR 激活函数用 Gabor 小波，效果好于 sin、高斯
	* "WIRE: Wavelet Implicit Neural Representations", CVPR2023
		* Vishwanath Saragadam, Daniel LeJeune, Jasper Tan, Guha Balakrishnan, Ashok Veeraraghavan, Richard G. Baraniuk
		> created on 2023-03-23
	* fig1 SIREN $\sin(\omega x)$，Gauss $\exp(-|sx|^2)$，WIRE $\exp(i\omega x-|sx|^2)$
		* sin 频域局部、高斯空间局部
		> SIREN导致全局振铃伪影，而高斯非线性导致边缘处的紧凑但大的误差。WIRE产生的结果具有最小和最紧凑的空间误差。
	* sec3.3 用 NTK 梯度流、普通 SGD 训练，观察发现本文激活函数都收敛更快
		> 将WIRE与其他INR进行比较，我们发现，根据需要，WIRE更喜欢在训练早期学习图像中的信号，而不是噪声，其收敛速度比基本上任何给定的峰值信噪比（PSNR）都快几个数量级。
		* （评）似乎只是实验，不是 NTK 理论分析其有效性？
	* sec3.4 $\omega,s$ 参数的选择
	* 实验，比较 SIREN、Gauss、MFN、ReLU+位置编码，本文做法对细节、间断的表达更好
* [GitHub-INRsurvey](https://github.com/ChajinShin/Survey-on-Implicit-Neural-Representation)（备用）
	* 列表比较各工作（NeRF，NeRF++，SINSR，NSVF，COIN 等）的 field（2/2.5/3/4D vision，压缩）、task（rendering，view synthesis, surface…）
* `HyperDiffusion-2303.17015` 扩散模型生成 INR MLP 权重
	* "HyperDiffusion: Generating Implicit Neural Fields with Weight-Space Diffusion"
		* Erkoç, Ziya; Ma, Fangchang; Shan, Qi; Nießner, Matthias; Dai, Angela; 
		> created on 2023-05-11
	* fig3 流程，先拟合¹一堆形状的 INR MLP，这些 MLP 参数组成数据集、由扩散模型拟合；{_n5bk15}
		* ¹用了迁移学习策略，拟合了一个以后，作为其他形状拟合的初值
		* 扩散模型为 Transformer 架构，将 INR 权重 flatten 后进行；{_n5bk05}
	* 可同时生成 3D、4D（动画）的 INR；{_n5bk6e}
	* fig4 扩散过程中 INR 结果变化，从无意义形状到有意义形状；{_n5bk1z}
* `DreamFields-2112.01455` 文本转 NeRF，通过在线优化得 INR 权重，loss 由 CLIP 给出，另有辅助 loss 项
	* "Zero-Shot Text-Guided Object Generation with Dream Fields"
		* Jain, Ajay; Mildenhall, Ben; Barron, Jonathan T.; Abbeel, Pieter; Poole, Ben; 
		> created on 2023-05-11
	* fig1 NeRF 优化 loss 1：渲染为图片后过 CLIP，与 prompt 文本过 CLIP 结果求 loss；{_n5bm0d}
		* eqn(7) 渲染中涉及相机位置 $p$
	* fig1 loss 2：transmittance loss，鼓励稀疏性；{_n5bm3o}
* `DreamFusion-2209.14988` 文本转 NeRF，利用文生图扩散模型，NeRF 渲染、据文本改图、反传调 NeRF 参数
	* "DreamFusion: Text-to-3D using 2D Diffusion"
		* Poole, Ben; Jain, Ajay; Barron, Jonathan T.; Mildenhall, Ben; 
		> created on 2023-05-12
	* fig3 优化 NeRF 参数：渲染成图，图片加噪声、据文本信息去噪，结果图片对 NeRF 渲染结果 BP；{_n5cb3x}
		* 渲染，选取随机视角、光照条件得图片；{_n5cd4s}
		* 发现文本信息中加入视角信息有益，如“overhead/front/side/back view”
		* 引入文本信息的图像扩散模型用 Imagen
		* 细节未完全确认
	* fig4 用于 refine，逐步添加 prompt、NeRF 不断变化：从松鼠 NeRF 开始，依次：要求为 DSLR（单反？）照片，穿皮衣，骑摩托，行驶在冰面上；{_n5cd7m}
* `NIRVANA-2212.14593` 视频压缩，切为帧组、每组对应一网络权重，对相邻组权重差离散化、按算术编码存储；帧组表达为宏观参化、微观离散
	* "NIRVANA: Neural Implicit Representations of Videos with Adaptive Networks and Autoregressive Patch-wise Modeling", CVPR2023
		* Maiya, Shishira R; Girish, Sharath; Ehrlich, Max; Wang, Hanyu; Lee, Kwot Sin; Poirson, Patrick; Wu, Pengxiang; Wang, Chen; Shrivastava, Abhinav; 
		> created on 2023-07-06
	* 应可理解为时空区域分解，输入为时空 patch 空间位置中心坐标（时间在网络参数中体现）{_n76e1u}
		* 使用卷积网络输出时空 patch 取值；按 fig2，时间不参与卷积，若 patch 有 $G$ 帧则有 $G$ 个卷积网络
		* fig2 架构，patch 中心坐标输入 SIREN 网络，之后加位置编码，过上采样层，然后分别输入 $G$ 个卷积网络
	* fig2 对下一个帧组训专门网络编码，权重用上一个帧组权重初始化
	* sec3.3 模型压缩：编码针对二网络残差，并且考虑离散化的残差、用算术编码处理，以提高压缩率；{_n76e4w}
		* 具体细节：每个权重矩阵 $W$ 对应一个隐参数，该隐参数为离散化取值，通过线性变换（可学）解码生成 $W$
		* 训练时 loss 加额外熵正则项，鼓励网络低熵、从而低比特率
		* 观察到变化较少的帧组，网络权重变化稀疏，压缩率高
* `TINC-2211.06689` INR 用层次区域分解（八岔树），整体映射表达为各层映射的复合，以实现参数共享；用于数据压缩
	* "TINC: Tree-structured Implicit Neural Compression"
		* Yang, Runzhao; Xiao, Tingxiong; Cheng, Yuxiao; Suo, Jinli; Dai, Qionghai; 
		> created on 2023-07-06
	* sec3.2 单点前传涉及的网络架构 $f=f^o\circ f^l\circ\cdots\circ f^1\circ f^i$；{_n76f4o}
		* 其中 $f^1$ 为第一层区域分解（8 块），从而共有 8 种不同参数；第二层 $f^2$ 有 64 种；往下类推
		* 文中解释为参数共享，小块（区域分解最小单元）越接近¹，共享的参数越多
			* ¹主要看在八岔树层次结构分解中的距离，空间位置接近未必代表在树结构中接近
	* sec4 为提高压缩保真度，参数分配策略：{_n76f80}
		* 层间差异：若全局冗余性高，向浅层（共享部分）分配更多参数；否则为深层节点分配更多
		* 层内差异：重要区域分配更多参数
* NeRF 的 PyTorch 实现，面向新手的教程
	* [2023-07-20](https://zhuanlan.zhihu.com/p/639434673)
	* [英文原文](https://towardsdatascience.com/its-nerf-from-nothing-build-a-vanilla-nerf-with-pytorch-7846e4c45666)
* `nf2vec-2312.13277` INR MLP 参数输入另一 NN、获得 INR 的隐向量表征，用于 3D 分割等下游任务
	* "Deep Learning on 3D Neural Fields"
		* Ramirez, Pierluigi Zama; De Luigi, Luca; Sirocchi, Daniele; Cardace, Adriano; Spezialetti, Riccardo; Ballerini, Francesco; Salti, Samuele; Di Stefano, Luigi; 
		> created on 2023-12-23
	* 认为 MLP 权重拉直成向量后太高维，难直接作为另一 NN 输入
	* fig2 假定 INR 为 MLP，各层权重矩阵 concat 得大矩阵（输出层权重补 0）{_ncnb59}
		* 大矩阵逐行输入另一 MLP，对结果进行 max pooling 得最终隐向量
		* 为避免参数语义对不同样本有所区别，所有 INR 拟合数据时用相同的（随机）初始化
	* 解码器类似 DeepSDF AD，获得的隐向量与坐标 $x$ concat 输入 NN
	* fig1 涉及的下游任务（针对 3D neural field）：分类，非条件生成，retrieval，分割，曲面重建，补全；{_ncnb9z}
* `MoEC-2312.01361` INR 自适应软区域分解（MoE），各专家输出特征加权平均后过共享解码器，用于压缩
	* "MoEC: Mixture of Experts Implicit Neural Compression"
		* Zhao, Jianchen; Tseng, Cheng-Ching; Lu, Ming; An, Ruichuan; Wei, Xiaobao; Sun, He; Zhang, Shanghang; 
		> created on 2023-12-23
	* eqn(1) 网络架构 $Dec(f(\sum G(e)_iE_i(e)))$，$e=Enc(x)$；{_ncnf5h}
		* $G$ 为 router，$E_i$ 为专家
	* sec3.5 负载不平衡问题（部分专家被选择次数过多），多种解决办法；{_ncnf73}
		* 平衡损失：据已有文献引入正则化损失
		* 设置专家 capacity（说是常与正则化方法一起用）：已有方法 GShard，各专家预设能力上限 $C_f$，输入样本的 token（？）最多分配给二专家，若目标专家收到的总 tokens 超过 $C_f$ 则将该 token 丢弃
		* 平衡调度 balancing dispatch：已有方法 Tutel，坐标点按 batch 输入，每个专家每次最多获得其中一定比例的点（超过的丢弃，不足的零填充（？））
* 2006.10739 INR 输入层位置编码，从 NTK 角度分析
	* "Fourier Features Let Networks Learn High Frequency Functions in Low Dimensional Domains"
		* Tancik, Matthew; Srinivasan, Pratul P.; Mildenhall, Ben; Fridovich-Keil, Sara; Raghavan, Nithin; Singhal, Utkarsh; Ramamoorthi, Ravi; Barron, Jonathan T.; Ng, Ren; 
		> created on 2024-08-02
	* （评）为 `2022-12-14`(dbGrpMeet2) 的其中一篇引用，部分内容在那里记录
	* sec1:-1 位置编码形式取为 $\gamma(x)=[a_kh(b_k^\mathrm{T}x)]$，$h=[\sin,\cos]$
		> 我们证明，这种映射将NTK转换为平稳（移位不变）核，{_o87e8q}
		> 并通过修改频率向量bj来调整NTK的频谱，从而控制相应MLP可以学习的频率范围
	* sec1:-1 $a_k=1$，$b_k$ 从 isotropic 分布中采样的策略性能好
	* fig2 $a_k=1/k^p,b_k=k$；$p=\infty$ 情形退化为只有最低频的分量；{_o87e9p}
	* p6:-2 还提到高维无法密集地采样 Fourier feature，故从参数化分布中采样随机的 Fourier features；我的理解感觉像是在说 $b_k$？
		* 可能指的是 Gauss 取值的情形
	* sec6.1 positional encoding 情形 $a_k=1$，$b_k=\sigma^{k/K}$，$\sigma$ 针对特定 task、通过 hyperparameter sweep 确定；{_o87f1f}
		* 提到该方法假定频率仅沿各轴，若数据 has more frequency content along the axes（我理解就是有斜方向的频率 pattern）会有 bias；{_o87f19}
	* fig8 $a_k,b_k$ 可训练、固定 表现无明显差别；{_o87f06}
	* NTK 相关理论、实验未看细节
* LRM-2311.04400 图像转 NeRF，对图像编解码得三平面 feature
	* "LRM: Large Reconstruction Model for Single Image to 3D"
		* Hong, Yicong; Zhang, Kai; Gu, Jiuxiang; Bi, Sai; Zhou, Yang; Liu, Difan; Liu, Feng; Sunkavalli, Kalyan; Bui, Trung; Tan, Hao; 
		> created on 2025-04-25; as ref [11] of TripoSR
	* fig1 整体架构示意图，图像转 3D 任务
		* 编码器，图像到 image feature：已预训练的 DINO，架构为 ViT
			* （评）按 TripoSR 的描述似乎有 [CLS] token，不过图中没看到
			* 分辨率：输入图像 512x512x3，输出 feature 32x32x768
		* 解码器，image feature 到 triplane tokens，个数 3x32x32，通道 1024
			* （评）三平面分别打 patch，不是合并为大图后统一打 patch；{_p4pa3q}
				* 因此需交叉注意力获取图像 2D 信息，因 tokens 总数不同
				* 若合并为大 image（指三平面作为不同通道）则可用一个统一 ViT 输入图像输出 triplane tokens
			* 架构：ViT，带交叉注意力 以汇总 image feature 信息；{_p4pb72}
				* 为引入相机特征，交叉注意、自注意、FFN 层均引入相关 modulation
			* 输入为可学位置编码
				* （评）若用预设位置编码，需同时体现 xyz 信息，尽管每个平面仅涉及其中的两个坐标
		* DeConv，triplane tokens 转 triplane feature，提分辨率（32→64）、减通道（1024→80）{_p4pa5s}
		* triplane-NeRF 渲染，MLP 宽 64、深 10
* TripoSR-2403.02151 从单个图像重建 NeRF 3D 表征（生成模型？）
	* "TripoSR: Fast 3D Object Reconstruction from a Single Image"
		* Tochilkin, Dmitry; Pankratz, David; Liu, Zexiang; Huang, Zixuan; Letts, Adam; Li, Yangguang; Liang, Ding; Laforte, Christian; Jampani, Varun; Cao, Yan-Pei; 
		> created on 2024-09-30
	* sec2.1 关于模型架构
		> 数据和模型改进TripoSR的设计基于LRM[11]，在数据管理、模型和训练策略方面取得了一系列技术进步。
		> 2.1. 模型概述与LRM[11]类似，TripoSR利用了 Transformer 架构，专为单图像3D重建而设计。
		> 它以单个RGB图像作为输入，并输出图像中对象的3D表示。
		> TripoSR的核心包括组件：图像编码器、图像到三平面解码器和基于三平面的神经辐射场（NeRF）。
		> 图像编码器使用预训练的视觉变换器模型DINOv1[1]进行初始化，该模型将RGB图像投影到一组潜在向量中。
			> 这些向量对图像的全局和局部特征进行编码，并包含重建3D对象所需的信息。
			* 注：同时包括全局与局部信息的“一组”隐向量，看 LRM 原文似乎是同时包括 ViT [CLS] token 和所有 patch embedding
		> 后续的图像到三平面解码器将潜在矢量转换为三平面NeRF表示[2]。
			> 三平面NeRF表示是一种紧凑而富有表现力的3D表示，非常适合表示具有复杂形状和纹理的对象。{_oa3f1f}
			> 我们的解码器由一堆变压器层组成，每个变压器层都有一个自我关注层和一个交叉关注层。
			> 自我关注层允许解码器关注三平面表示的不同部分，并学习它们之间的关系。
			> 交叉关注层允许解码器关注来自图像编码器的潜在矢量，并将全局和局部图像特征合并到三平面表示中。
		> 最后，NeRF模型由一堆多层感知器（MLP）组成，负责预测空间中3D点的颜色和密度。
	* [后续工作 Tripo 2.0 公众号报道](https://mp.weixin.qq.com/s/T4kAXSXxGXNnRIuDpTl-xQ)
		* （评）里面说的 3D scaling law 基于 DiT 和 U-Net，与本文的 NeRF 不一样？
		* （评）这个工作是 先生成形状、再贴皮肤，不是用的 NeRF？
* EG3D-2112.07945 （triplane-NeRF）使用三平面网格离散作为中介 来表示 3D NeRF
	* "Efficient Geometry-aware 3D Generative Adversarial Networks"
		* Chan, Eric R.; Lin, Connor Z.; Chan, Matthew A.; Nagano, Koki; Pan, Boxiao; De Mello, Shalini; Gallo, Orazio; Guibas, Leonidas; Tremblay, Jonathan; Khamis, Sameh; Karras, Tero; Wetzstein, Gordon; 
		> created on 2024-10-02
	* 背景：3D 生成，直接生成的架构不如 2D 成熟
	* fig4 试图利用 2D 成熟架构：引入 3 平面作为表示中介
		* 3 平面 Oxy,Ozx,Oyz，每个 256×256 分辨率、32 通道；concat 后共 96 通道；{_p4rf1d}
		* StyleGAN2D 输入隐向量，生成该 3 平面 feature；{_oa2b0i}
		* INR 解码：对给定点 xyz，分别投影到 3 平面得 3×32 维 feature，该 feature¹作为 MLP 输入；{_oa2a9p}
			* p3:r1 一般位置的点双线性插值到网格
			* ¹本文实际上是 3 feature 的求和，单个 32 维 feature 作为 MLP 输入；但后续工作未必如此；{_p4re8t}
		* （评）是否利用了 3D 形状用三视图足够表示的特性？如果是物理场，3 平面的信息不保证足够
		* （评）含时 3D 场可同理用 $C_4^2$ 平面表示
	* loss：NeRF 得 3D 场后，渲染得低分辨率 2D、过超分辨率网络、传入 StyleGAN2 判别器得 loss；{_p4re6r}
* 2411.03688 （备用）关于 INR 的综述，by Angelica Aviles-Rivero；似乎未包括 Poly-INR
	* "Where Do We Stand with Implicit Neural Representations? A Technical and Performance Survey"
		* Essakine, Amer; Cheng, Yanqi; Cheng, Chun-Wun; Zhang, Lipei; Deng, Zhongying; Zhu, Lei; Schönlieb, Carola-Bibiane; Aviles-Rivero, Angelica I; 
		> created on 2024-11-13
* PM-INR （备用）
	* "PM-INR: Prior-Rich Multi-Modal Implicit Large-Scale Scene Neural Representation", AAAI2024
		* Yiying Yang1 , Fukun Yin2 , Wen Liu3 , Jiayuan Fan1 * , Xin Chen3 , Gang Yu3 , Tao Chen
		> 2024-11-23
	* （评）表示大规模场景，似乎用额外语义信息增强 INR 输入，该信息从多模态全局编码获得
		* 摘要提到场景“无界”
	* 摘要摘录
		> 使用多模态先验 来帮助单个点获得更多的全局语义信息，
		> 用于 室外、无界、大规模场景 的 先验、多模态 INR。
		* 方法核心：多模态先验提取，交叉模态先验融合模块。
			> 前者对来自不同模态输入的码本进行编码，并提取有价值的先验，
			> 后者融合先验以保持视图一致性，并保留多模态先验之间的独特特征。
		> 最后，将特征丰富的跨模态先验注入采样区域，使每个区域在不填充采样空间的情况下感知全局信息。
	* fig2 架构，img/text/3D prior 合成 128×64 隐向量，通过交叉注意力调制主 NeRF 网络
		* （评）INR 主干是每个单独训还是不同场景共享？
* S-INR-2411.11356 （备用）
	* "Superpixel-informed Implicit Neural Representation for Multi-Dimensional Data"
		* Li, Jiayi; Zhao, Xile; Wang, Jianli; Wang, Chao; Wang, Min; 
		> created on 2024-11-23
	* 注：作者非来自国内好高校，且目前没看到文章中有意思部分
	* 摘要摘录
		* 目的：利用数据中的语义先验
		* 超像素信息INR（S-INR）
		> 使用广义超像素而不是像素作为多维数据（如图像和天气数据）的INR的替代基本单位。
		> （架构）广义超像素的坐标首先被输入到基于排他性注意的MLP中，然后中间结果与共享字典矩阵相互作用。
		> （目的）利用广义超像素内部和之间的语义信息。
	* sec2.3 本文用于 数据重构、补全、去噪 等工作？
* NeRD-Rain-2404.01547
	* "Bidirectional Multi-Scale Implicit Neural Representations for Image Deraining", CVPR2024
		* Chen, Xiang; Pan, Jinshan; Dong, Jiangxin; 
		> created on 2024-11-23
	* 摘要摘录
		* 现有 Transformer 方法：主要依赖单尺度降雨外观
		* 本文方法：端到端的多尺度 Transformer，利用 各种尺度中潜在的有用特征 来促进 高质量的图像重建。
		> （目的）为了更好地探索空间变化雨带的常见退化表示，
		> 将基于像素坐标的尺度内 INR 与退化输入结合到闭环设计中，
		> 使学习到的特征能够促进除雨，并提高模型在复杂场景中的鲁棒性。
		> 为了确保来自不同尺度的更丰富的协作表示，我们通过执行从粗到细和从细到粗的信息通信，将一个简单而有效的跨尺度双向反馈操作嵌入到我们的多尺度Transformer中。
* LoE-Hao2022 INR 区域分解，MLP 不同深度的区域分解块数不同，浅少深多 效果较好
	* "Implicit Neural Representations with Levels-of-Experts", NIPS2022
		> 2024-11-23
	* 摘要摘录
		* 之前的工作：混合表示，结合坐标、网格（如稀疏体素）的表示。
			* 缺点：网格缺紧凑的全局隐表示，难建模信号分布，而这对泛化重要。
		> 本文：专家级别（LoE），基于坐标的表示，由具有周期性、位置相关权重的MLP组成。
		> 对于MLP的每个线性层，其权重矩阵的多个候选值被平铺并在输入空间中复制，不同的层以不同的频率复制。
		> 根据输入，每层只选择一个权重矩阵。
	* fig1 各层均两套参数，交替使用；{_p5ja1h}
		* 不同层的区域分解方式不同，浅层粗尺度、块数少，深层细尺度、块数多
		* 以下变种效果不如默认做法
		* 变种：各层分块数量顺序随机排列（不一定浅层粗尺度、深层细尺度）
		* 变种：各层分 4 块而非 2 块
		* 变种：各层参数双线性插值，相当于软分解；{_ocge52}
* CycleINR-2404.04878 INR 用于超分辨率，针对医学影像数据特点
	* "CycleINR: Cycle Implicit Neural Representation for Arbitrary-Scale Volumetric Super-Resolution of Medical Data"
		* Fang, Wei; Tang, Yuxing; Guo, Heng; Yuan, Mingze; Mok, Tony C. W.; Yan, Ke; Yao, Jiawen; Chen, Xin; Liu, Zaiyi; Lu, Le; Zhang, Ling; Xu, Minfeng; 
		> created on 2024-11-23
	* 摘要摘录
		* 背景：医学 3D 数据（CT,MRI）各向异性分辨率：层内分辨率高，层间分辨率低
			> 相邻切片之间的分辨率降低带来了挑战，阻碍了最佳的观看体验，并阻碍了稳健的下游分析算法的发展。
			> 各种体积超分辨率算法旨在克服这些挑战，提高切片间分辨率和整体3D医学成像质量。
		* 现有方法挑战：场景局限（针对特定上采样因素），结果质量（过平滑、缺细节、切片一致性）
			> 1）通常针对特定的上采样因素量身定制，缺乏对不同临床场景的灵活性；
			> 2） 新生成的切片经常出现过度平滑、精细细节退化以及切片间不一致的问题。
		* INR 优势：可任意上采样
		* 增强网格采样：局部注意机制
		* 减轻过度平滑：整合循环一致性损失
		* 层间噪声水平不一致性 引入新定量度量：逐层噪声水平不一致性（SNLI）
	* fig1 定义 cycle-consistent loss，散点集 S 上样本 INR 拟合，在 S' 求值结果再用另一 INR 拟合，其 S 求值结果与原数据比较；{_ocgf14}
* SHACIRA-2309.15848 基于网格的 INR，格点取值量化压缩
	* "SHACIRA: Scalable HAsh-grid Compression for Implicit Neural Representations", ICCV2023
		* Girish, Sharath; Shrivastava, Abhinav; Gupta, Kamal; 
		> created on 2024-11-23；2023-11-01 clh组会讲过
	* 摘要摘录
		* 背景：InstantNGP 可学习特征网格
			> （技术路线）1. 特征向量的多分辨率查找表和 2. 更小的神经网络替换大型神经网络，
			> （效果）显著加快了INR的训练和采样速度。
		> 然而，这些特征网格以牺牲大量内存消耗为代价，这可能是存储和流式应用程序的瓶颈。
		> （本文）任务无关框架，用于压缩此类特征网格，而无需额外的事后修剪/量化阶段。
		* 特征网格重参数化—用量化的隐权重，隐空间熵正则化，以实现跨各个领域的高水平压缩。
	* sec3.1:-1 MLP 规模明显小于普通 INR，主要参数在 grid latent
		* 好处：训练快，因 MLP 小，grid latent 参数多但不意味着计算成本增加；{_obnk05}
	* sec3.2 对 grid latent 量化压缩，每个隐向量有 D 整数值，解码得 F 个实数值；{_ocge97}
		* 参数化解码器，所有尺度共用一个，实验发现不共用区别不大
		* 训整数值隐向量：额外存连续值版本（continuous proxy），推理时四舍五入得整值
			* 训练用 STE（straight-through estimator）技巧，引文已使用
			* 训练应对舍入误差：退火，上下取整随机，概率依据小数部分，训练前期均匀，后期近四舍五入；有引文
	* sec3.3 进一步压缩：基于概率模型，进一步熵编码压缩序列长度
* 2403.19473 INR 性能评估基准框架
	* "Benchmarking Implicit Neural Representation and Geometric Rendering in Real-Time RGB-D SLAM", CVPR2024
		* Hua, Tongyan; Wang, Lin; 
		> created on 2024-11-24
	* 摘要摘录
		* 本文要点：INR 性能评估基准框架
			> （摘要）隐式神经表示（INR）与几何渲染相结合，最近被用于实时密集RGB-D SLAM。
			> 在这项工作中，据我们所知，我们建立了第一个开源基准框架，用于评估各种常用INR和映射和定位渲染函数的性能。
			> 我们基准测试的目标是1）直观地了解不同的INR和渲染功能如何影响映射和定位，2）针对可能影响映射和本地化的设计选择建立统一的评估协议。
		* 网格压缩总有性能损失，包括 hash、三平面
			> （摘要）密集特征网格优于其他INR（例如三平面和哈希网格）。
				> 即使在几何和颜色特征被联合编码以提高内存效率的情况下，
		* 提出混合编码策略，鲁棒性、计算效率
			> 为了将研究结果扩展到实际场景中，提出了一种混合编码策略，以从基于网格和基于分解的INR中获得最佳的准确性和完整性。
			> 我们进一步提出了高保真密集网格映射的显式混合编码，以符合RGB-D SLAM系统，该系统以鲁棒性和计算效率为前提。
	* fig2 涉及 triplane 扩展版本 factorization，三投影均形如 平面×剩余轴（而非纯平面）
* DeepLS-2003.10983 （fig2）INR 区域分解，AD 每区域有独立隐向量；{_oc297w}
	* "Deep Local Shapes: Learning Local SDF Priors for Detailed 3D Reconstruction"
		* Chabra, Rohan; Lenssen, Jan Eric; Ilg, Eddy; Schmidt, Tanner; Straub, Julian; Lovegrove, Steven; Newcombe, Richard; 
		> created on 2024-12-02
* Title-2211.16677 3D 生成，用三平面 NeRF，其三平面表示由扩散模型生成；{_oc2a3a}
	* "3D Neural Field Generation using Triplane Diffusion"
		* Shue, J. Ryan; Chan, Eric Ryan; Po, Ryan; Ankner, Zachary; Wu, Jiajun; Wetzstein, Gordon; 
		> created on 2024-12-02
	* fig3 扩散模型生成 128×128×96，通道拆 3 份放不同位置，用三平面 NeRF 解码得 3D 对象；{_p4pa3g}
	* sec3.2 二阶段训练，先三平面 NeRF 拟合大量 3D 对象，获得三平面表示数据集，再在其上训扩散模型
		* 三平面 NeRF 对不同对象共享 MLP，三平面 feature 独立
	* 每个 3D 对象采样 10M 点，其中一半在内部、一半在表面
	* sec3.3 拟合数据集时对三平面正则化
		* 1. TV 惩罚，以消除虚假高频信息，否则扩散模型拟合的生成结果有 artifact；{_oc2a3g}
		* 2. L2 惩罚，以避免取值特别大的离群值，便于将三平面结果归一化到 [-1,1]，从而能 DDPM 拟合
		* 3. EDR，因为空间采样点集中在表面，而内外信息不足；具体为惩罚 $\|f(x)-f(x+w)\|$，$w$ 随机向量；{_oc2a45}
	* sec3.5 扩散模型为当时较先进的 ADM
* 2212.09069 数据压缩用 grid-based INR，TensoRF 2D 部分小波再压缩，小波稀疏系数位置再二进制编码压缩
	* "Masked Wavelet Representation for Compact Neural Radiance Fields"
		* Rho, Daniel; Lee, Byeonghyeon; Nam, Seungtae; Lee, Joo Chan; Ko, Jong Hwan; Park, Eunbyung; 
		> created on 2024-12-02
	* TensoRF 引入动机：维度高时小波计算复杂度高，故对 TensoRF（2+1 低秩分解）2D 部分用小波好于直接 3D；{_oc2e3u}
	* 小波系数加权：eqn(7) 多级小波（多尺度），高频部分梯度大但系数小，引入缩放因子 s 帮助优化
	* 掩码引入稀疏性；eqn(8) 掩码训练时连续取值，直通估计（stop-grad）方式训练
		* 稀疏存储，只存非零系数和位置掩码，后者每个位置占 1 bit（不是 byte），再用 3 种传统编码算法（包括对 byte Huffman）压缩
	* fig1 数据压缩率 vs PSNR
* VQ-AD-2206.07707 grid-based INR，格点 feature 限制可能性总数（隐向量码本）以降存储量；{_oc2e4v}
	* "Variable Bitrate Neural Fields"
		* Takikawa, Towaki; Evans, Alex; Tremblay, Jonathan; Müller, Thomas; McGuire, Morgan; Jacobson, Alec; Fidler, Sanja; 
		> created on 2024-12-02
	* fig3 格点与 codebook 元素对应关系，训练用 softmax 以可求导，推理用严格 argmax
		* eqn(9)+1 训练其实是前传用严格 argmax，反传用 softmax：straight-through estimator
* HexPlane-2301.09632 含时 3D 用类似 EG3D 做法压缩，4D 投影到 6 个不同 2D 网格；{_oc2e6e}
	* "HexPlane: A Fast Representation for Dynamic Scenes"
		* Cao, Ang; Johnson, Justin; 
		> created on 2024-12-02
* K-Planes-2301.10241 也是含时 3D 用类似 EG3D 做法压缩，4D 投影到 6 个不同 2D 网格；{_oc2e6d}
	* "K-Planes: Explicit Radiance Fields in Space, Time, and Appearance"
		* Fridovich-Keil, Sara; Meanti, Giacomo; Warburg, Frederik; Recht, Benjamin; Kanazawa, Angjoo; 
		> created on 2024-12-02
* TensoRF-2203.09517 EG3D 中平面投影改成低秩分解，每组为 2D、1D 网格张量积，共 3 组
	* "TensoRF: Tensorial Radiance Fields"
		* Chen, Anpei; Xu, Zexiang; Geiger, Andreas; Yu, Jingyi; Su, Hao; 
		> created on 2024-12-02
	* fig3 三平面投影改成低秩分解，每组为 2D、1D 网格张量积，共 3 组；{_oc2e6y}
		* 对 3 组结果求和 eqn(7)
	* 2D、1D 张量积多组求和 eqn(7)，从而 XY 网格共有 R 组（其他 2D、1D 网格同理）
		* fig2 动机为张量分解，精确分解为多个低秩张量求和，每个为 vector-matrix outer product
	* 先重建 3D 网格再三线性插值，而非 2D、1D 独立插值后再求和 eqn(6)+1
* PermutoSDF-2211.12562 fig2 使用单纯形（三角形）而非方形网格；多尺度：多套不同分辨率网格同时用
	* "PermutoSDF: Fast Multi-View Reconstruction with Implicit Surfaces using Permutohedral Lattices"
		* Rosu, Radu Alexandru; Behnke, Sven; 
		> created on 2024-12-09
	* 单纯形优势：正文认为维数高时单纯形顶点数少，每点前传需要的访存量少；{_oc9a1z}
		* 希望减小 根据索引找相应隐向量 的操作（认为它耗时？），尤其高维
		* 插值权重使用重心坐标
* DCC-DIF-2203.14048 grid-based INR 格点位置参与优化；{_oc9a2s}
	* "Learning Deep Implicit Functions for 3D Shapes with Dynamic Code Clouds"
		* Li, Tianyang; Wen, Xin; Liu, Yu-Shen; Su, Hua; Han, Zhizhong; 
		> created on 2024-12-09
	* fig2 随优化进行，格点位置变化过程，与形状表面贴合
	* 插值方式：eqn(2-4) 权重正比于距离的 -3 次方；未确认是否做了稀疏化处理
* ACORN-2105.02788 区域分解后每块 grid-based INR，格点特征由超网络输出，超网络输入为区域坐标
	* "ACORN: Adaptive Coordinate Networks for Neural Scene Representation"
		* Martel, Julien N. P.; Lindell, David B.; Lin, Connor Z.; Chan, Eric R.; Monteiro, Marco; Wetzstein, Gordon; 
		> created on 2024-12-09
	* fig3 整体架构
		* 整体区域按八岔树划分，局部加密
		* 1. 坐标分解，每空间位置分配 所属区域坐标 $x_g$、区域内坐标 $x_l$，后者归一化到 $[-1,1]$
		* 2. $x_g$ 输入 coord encoder 输出区域内所有格点的 feature（$C\times N_1\times\cdots\times N_d$）{_ocae80}
			* 输入其实还有 相应区域尺度大小 $s$，共 $d+1$ 维
			* 架构为 MLP（> 而非 3D CNN）
		* 34. 据 $x_l$ 从该 feature 网格线性插值，得目标坐标点 feature $\gamma\in\R^C$
		* 456. $\gamma$ 输入小型 MLP（decoder）得最终 INR 输出值
	* p5:l-1 推理阶段，每区域只调用一次昂贵的 coord encoder，然后多次调用便宜的 decoder
	* sec3.3 在线多尺度分解，动态调整各区域分块大小
		* 大意概括：每步决策如何调整分块方式，通过解优化问题
		* 自变量：当前所有块的下一步动作，merge、stay、split
		* 因变量：eqn(8) 执行该动作后，预期的下一阶段误差
		* 约束：
			* eqn(4) 每个 active block 有 merge、stay、split 三个指标，eqn(6) 求和为 1
			* eqn(5) 合并要求 1. 所有参与的小块未被进一步分解，2. merge 指标均为 1
				* （评）与 eqn(6) 一起看，相当于约束：所有小块的动作要么都 merge，要么都不 merge
			* eqn(7) 全局设定总块数约束
		* 因变量涉及的误差预期设定
			* stay：即当前误差（乘体积积分）
			* merge：若 merge 得到的大块在历史上出现过，直接复用；否则认为会相较当前误差增大
			* split 类似，有历史则复用，否则按预设值减小
		* eqn(8) 最终成为优化问题，ILP（integer linear problem）；{_ocaf6h}
			* p6:l-2 Gurobi 求解，每几百步训练后调用一次，求解时间相比训练可忽略不计
	* sec3.4 剪枝：常值区域直接按常值表示，不用 NN 推理
		* 从总块数计数中去除；从而允许其他地方的块划分更细
		* 剪枝规则，同时满足两点：(1) 网络预测值方差小，(2) 误差小
* 2302.01226
	* "Factor Fields: A Unified Framework for Neural Fields and Beyond"
		* Chen, Anpei; Xu, Zexiang; Wei, Xinyue; Tang, Siyu; Su, Hao; Geiger, Andreas; 
		> created on 2024-12-14
	* 摘要摘录
		* factor fields 作为 neural fields 框架，统一 NeRF、Plenox、EG3D、InstantNGP、TensoRF
			> 我们提出了因子场，这是一种用于建模和表示信号的新框架。
			> 因子场将信号分解为因子的乘积，每个因子都由经典或神经场表示来表示，该表示对变换后的输入坐标进行操作。
			> 这种分解产生了一个统一的框架，可以容纳几种最新的信号表示，包括NeRF、Plenox、EG3D、Instant NGP和TensoRF。
		> 此外，我们的框架允许创建强大的新信号表示，例如“字典字段”（DiF），这是本文的第二个贡献。
			> 我们的实验表明，与之前的快速重建方法相比，DiF可以提高近似质量、紧凑性和训练时间。
			> 此外，DiF通过在训练期间跨信号共享基础，实现了对看不见的图像/3D场景的泛化，这极大地有利于稀疏观测的图像回归和少镜头辐射场重建等用例。
	* 
* MINER-2202.03532
	* "MINER: Multiscale Implicit Neural Representations"
		* Saragadam, Vishwanath; Tan, Jasper; Balakrishnan, Guha; Baraniuk, Richard G.; Veeraraghavan, Ashok; 
		> created on 2024-12-16
	* 注：之前的笔记里有零散地提到 MINER
	* fig2 Laplacian pyramid 结构，先一个 MLP 整体拟合，边长平分后各子区域残差再分别 MLP 拟合，再平分边长、MLP 拟合残差，依次进行；{_ocge3q}
	* fig5 自适应区域分解，精细部分所用区域最小
		* 注：按之前其他地方的笔记，这里是当前拟合结果中误差大的区域进行边长平分、再拟合
	* 推理方式，粗层级似乎是相应 MLP 在粗网格求值再上采样，比直接在细网格求值快；{_p5j97v}
* 2502.09623 训好的 NeRF 作为 meta-NN 输入，NeRF 架构已支持 MLP、三平面 且可泛化到新架构
	* "Embed Any NeRF: Graph Meta-Networks for Neural Tasks on Arbitrary NeRF Architectures"
		* Ballerini, Francesco; Ramirez, Pierluigi Zama; Salti, Samuele; Di Stefano, Luigi; 
		> created on 2025-02-24
	* 摘要摘录
		> 最近的研究表明，这些权重可以用作处理它们的框架的输入，以解决深度学习任务。
		> 然而，这些框架只能使用特定的预定义架构来处理NeRF。
		> 在本文中，我们提出了第一个框架，可以摄取具有多种架构的NeRF，并对训练时看不到的架构进行推理。{_p2oh70}
		> 此外，我们展示了对比目标如何有助于获得与架构无关的潜在空间。
* MedFuncta-2502.14401 （备用）医疗图像 INR 表征用于下游任务
	* "MedFuncta: Modality-Agnostic Representations Based on Efficient Neural Fields"
		* Friedrich, Paul; Bieder, Florentin; Cattin, Philippe C.; 
		> created on 2025-03-12
	* 摘要摘录
		> 一种基于神经场的模态无关连续数据表示。
		> 通过利用医学信号中的冗余以及应用具有上下文缩减方案的高效元学习方法，将神经场从单个实例扩展到大型数据集。
		> 我们通过引入ω0调度，提高重建质量和收敛速度，进一步解决了常用SIREN激活中的光谱偏差问题。
	* fig1 架构同 COIN++；fig2 还涉及 context set？{_p3ce7d}
