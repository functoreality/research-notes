> 2026-08-16 从 NNarch.md 独立
* Transformer；{n37n4q}
* 相关框架：((n2b94u))NLP 大模型，((n3bg7z))NLP
* 编码器与解码器，单向/双向注意力；{n38n48}
	* 注意这里“解码器”含义不同于通常，这里实际上仅指单向注意力；{nbih2x}
		* 原始“解码”功能应依赖于((nbih2c))交叉注意力
		* 编码解码相关：((n38n4h))AE 与 AD
	* 最早的 Transformer 论文针对机器翻译任务，同时用编码器、解码器
		* 编码器输入整个输入句子，得（与输入句）同长度的词嵌入
		* 解码器（推断）：循环调用、逐个词生成，每生成一个词时输入之前已生成的所有词（作为网络输入）、编码器输出的所有词嵌入（仅在网络中间部分引入）
		* 解码器的训练：极大似然，输入为 开始符-词1-词2…-词N，输出 label 为 词1-词2…-词N-结束符，前传算注意力时要求每个词仅接受它之前的词的信息（否则当然会导致作弊）
	* BERT 只使用编码器；{n38m9d}
		* 训练用完形填空方式，遮住若干词要求模型预测
			* 其图像版本为 MAE，训练时遮住的是 patch，见((n38n02))
			* 相关：mask token 属于((n4t96h))特殊 token
		* 编码器结构擅长自然语言理解任务（相较只有解码器的 GPT1）{n3bg82}
	* GPT 只用解码器；解码器结构擅长自然语言生成任务；{o2rg8d}
		* 另见((n6te4o))生成模型-离散序列生成
		* 序列并行：((_n7bg5v))用户输入（prompt）可并行处理，模型生成结果只能串行；从而 API 输出 token 单价明显高于输入的；{n7bg85}
			* 可通过 batch 并行缓解
			* 生成加速的一种方式：((_n7bg6x))推测解码，用更小更快的草案模型提前生成多 token，整体输入给主模型判断是否同意¹，token 概率高则接受该结果，被拒则回到主模型逐 token 生成；{n7bg7n}
				* 还可参考((_n91g7i))Andrej Karpathy 的介绍
				* ¹严格表述似为重要性采样((_p4ba08))
				* 副本：((n7bg90))dynamic NN-针对数据的动态性，((n7bh21))AISC-时间多尺度动力学
			* 相关：((n7bg8b))并行
		* 一次同时生成多个 token，((o2rg71))视频 Transformer 时间单向、空间双向注意力，同时生成下一帧的所有 patch token
	* UniLM 同一套参数，按编码器、解码器用均可，也可同时混用（一部分编码器、另一部分解码器）
		* 不过据说有人自己实验的结果是 相较 GPT 没什么优势、某些任务更差
		* 混用做法在多模态任务中出现：((_n8mm73))BEiT3 根据图像生成标题，图像部分按编码器，文本部分按解码器；{n8mm7i}
			* 相关：((n32e71))多模态
	* 更复杂场景（如多模态输入）的注意力掩码机制 可能更复杂；{o2rg74}
		* 如((_nbih26))ICON-LM 同时输入文本、数值数据，文本部分为普通单向，其他部分整体单向、局部双向；{nbih3x}
			* 相关框架((nbig72))NO-符号与数值数据同时输入
		* 针对视频的 ST-Transformer((o2rg71))时间注意力单向、空间注意力双向
		* ((o4hn3w))packed sequence，多条短序列拼成长序列作为 batch 中一条数据，子序列间屏蔽注意力
	* ((_n4se6s))有观点认为 encoder 双向注意力存在低秩问题，可能削弱模型表达能力；而纯 decoder 上三角矩阵保证可逆
	* ((_n4se6w))encoder-decoder 架构好于纯 decoder 可能只是因为多一倍参数
	* 架构区别导致训练方式（待预测对象）区别：((n8mn8t))完形填空vsNTP
	* 线性表征能力，((_n8un7x))自回归（解码器）优于 BERT
* 位置编码：输入仅为集合，用位置编码表示丢失的序列信息；{n3vf6h}
	* 相关：((n3t97n))INR 位置编码是为了引入高频 feature，((n7de8p))图 Transformer 有位置、结构编码
	* 给出方式：预设，纯学，可训练预设，网络输出（如 SWinV2）
	* 作用位置
		* feature-embedding（绝对位置编码）
			* 预设：加性正弦位置编码（Transformer 最初提出时），concat 坐标（FNO）
			* 纯学：ViT 最初提出时
		* attn-bias，各头独立
			* 预设：Alibi((_n8un5s))，惩罚与距离成正比；各头的惩罚权重为独立超参
			* 纯学：SWin
			* 网络生成：SWinV2 LogCPB
		* query/key，如（预设）RoPE
	* 坐标变换预处理，((_q81007))NO 轴向注意力 RoPE 所用位置由原位置过可学网络给出；{q81b7f}
		* 解读方式：((q81c0f))1D 空间坐标变换 共轭作用于现成函数变换（1D 注意力）得新的函数变换
	* 分辨率扩展：朴素位置编码针对给定的序列全长生成，从而最大上下文长度固定；{o2sn4y}
		* 相关框架：((pbpg0g))变长序列-长度外推
		* 博客总结的扩展上下文长度的方法：((_o2sn4t))绝对位置编码，相对位置编码，RoPE 变种
		* 预设：正弦（如 RoPE）有内插、外推方法，低频偏内插、高频偏外推，一般见 SRS((p6eg30))
			* YaRN 还涉及对注意力 softmax 升温
		* 网络输出：SWinV2 LogCPB，相对位置取 log(1+Δd) 输入 MLP
		* 可学编码插值：((_q15k2p))SD3
		* 相关：((n4pl5i))降低长注意力计算量
	* 其他数据结构（非序列）的位置编码；{n98h2z}
		* ViT 中各 patch 的位置编码是可学习向量（而非手动选取）？信源((_n8dm00))；{n8dm0h}
			* SWin 代码似乎也是，直接用 nn.Parameter 给出，形状 [n_patch, embed_dim]，前传时加到 patch_embed 结果上
			* 固定编码 相对vs绝对，2D RoPE 对 x,y 分别旋转，((_paif9v))据说效果不如绝对编码
			* ViT 解 PDE，((_nahe52))周期、非周期 BC 用不同位置编码（表示的 patch 邻接关系不同），从而非周期问题训练结果可直接迁移到解周期问题；{nahe5w}
				* 相关：((nahe5m))PDE 边界条件
			* NaViT 用 2D 位置编码，可处理不同形状、尺寸图像，编码方案为 fractional + aspect-ratio；{o4hn6z}
				* 论文讨论的三种编码方案见 SRS((o4hn6c))
				* 据说 ViT 用 1D 位置编码效果尚可是因为当时只处理固定分辨率
				* 2D RoPE 也支持变长宽比((_pbpg5g))
				* 图片尺寸泛化另一方案：((_oape2y))引入换行符，视频还有换帧符；从而打 patch 无需位置编码，便于自回归生成；{oape3o}
					* 相关框架：((n6te49))图像自回归生成，((n4t96h))特殊 token-表示数据结构
				* 注意尺寸泛化涉及两方面：((pbpg0g))变分辨率，变长宽比；后者通常依赖前者
				* 相关：((o8fe66))NO-网格泛化-gridsize可变
			* 因子化可学习编码，((_oa5g8r))视频时长、宽、高独立编码 再相加，各维度均可处理不同长度；用于 Meta Movie Gen
			* 动态生成（而非预设or可学），((_paig05))美团 MPE 基于各 token 邻域信息动态生成
		* graph Transformer 见((n7de8p))
		* 点云，((n98h47))PointMAE 将全体点划分为 point patch 并进行位置编码
		* NO 可变散点输入，每点的信息作为一个 token，((n9gf5t))用 RoPE（包括 2D 版本）体现散点位置
	* 实现细节：((_n8un4u))混合精度下位置编码可能发生碰撞（相关：((n7sa8l))混合精度）；{n8un50}
* 注意力机制及变种；{n7pe3p}
	* 相关：((n3gm7a))一般意义上的注意力（非 Transformer）
	* 其他位置：((n38n48))注意力分双向、单向，((n4pl5i))降低注意力的计算量
	* attn-score
		* 内积变种：SWin V2 余弦注意力，((q15j8k))QK RMSNorm
		* 注意力可加 dropout((o31f1s))
		* attn-bias
		* 这里讨论计算方式；计算结果分析见((q5ra8m))attn-map
	* softmax；一般（对象不限于 token）见框架((o31a0d))加权平均
		* 变种：softmax1（分母 +1），允许总和小于 1（一般框架((q6nm78))次归一化）；{n7pe44}
			* 作用：模型训练((q6nn0s))不再产生异常大权重值，从而更适配数值量化
			* 作用：缓解((q5ra8m))attention sink
		* 计算过程，FlashAttention local softmax 避免一次性计算、存储 softmax 涉及的所有元素
		* Galerkin Transformer 去掉 softmax、所得模型可从数值方法角度解读，两种乘法结合方式下分别对应 Galerkin、Fourier
	* 前后处理
		* 注意力层的 LayerNorm 可((o3ll25))引入 modulation
		* Qwen gated attn((_q16e9j))，据说可缓解((n8lg0c))loss spike
	* KV cache
		* 总容量：层数、token数、头数、嵌入维数
		* 降层数，((_q46f08))shared KV cache，一层的 KV 用于连续多层的 Q
		* 降 token 数，如((na1k7z))滑窗注意力，窗口滑出后存的 KV 可删掉
		* 降头数
			* multi-query attention（MQA）((_nbrm55))，不同头仅 query 不同，K,V 共享；用于 PaLM，ChatGLM；{nbrm6p}
			* grouped-query attention（GQA）((_nbrm53))，对头分组，不同头 Q 独立，K,V 在组内共享、组间不同；用于 LLaMA2；{nbrm5y}
				* 相关：((nbrm0z))分组注意力
		* 降嵌入维数：MLA，各头 K,V 共享相同的 latent code
	* 多头注意力；{na1k7v}
		* 若注意力按序列维度分组（只计算组内的注意力），不同注意力头可使用不同分组方式，如((na1k82))LongLoRA
		* 输出层线性投影 $W^O$ 若为方阵，在单头情形是冗余的（可与 $W^V$ 合并），但在多头情形仍有其功能（对 不同来源的多种混合信息 做进一步混合）；见 SRS((nbdh3b))；{nbdh5m}
		* MQA((nbrm6p))、GQA((nbrm5y))、MLA
		* 放大二头注意力大小差别，((_ocve6y))Difference Transformer；针对的问题：原始 Transformer 长上下文中大量无关 token 的注意力总量大，导致结果对上下文顺序敏感；{ocve7c}
			* 相关：((ocve7k))Transformer 长序列挑战
	* 分组注意力：{nbrm0z}
		* 进行分组的维度
			* 序列，或参与自注意力的所有 token
				* SWin Transformer((na1k7z))，目的为((n4pl5i))避免完整注意力的大计算量，分组方式利用了图片 2D 空间结构（patch 邻近关系）
				* 针对图片、视频的((o2rg6j))轴向注意力，依据坐标轴分组
				* LongLoRA((na1k82))，目的为使 LLM 上下文全长大于位置编码的预设全长
			* 注意力头分组，((nbrm5y))grouped-query attention（GQA）组内共享 key, value
		* 同时引入多种分组方式，避免信息传递局限在组内；分组方式划分的维度
			* Transformer 层：（按 token 分组的）((p4b97v))在不同层用不同分组方式
			* 注意力头：（按 token 分组的）LongLoRA((na1k82))，不同注意力头的分组方式不同
			* 相关：((pbfa2u))集合元素分组处理-多标准
	* 交叉注意力（非自注意力），原始 Transformer decoder((nbih2x)) 涉及；{nbih2c}
		* 可用于构建特殊的 hypernet 架构((n9ha7t))
		* 可用于多模态，((n8jm4l))双路 Transformer 靠双向交叉注意力做信息交互
		* 相关框架，作为影响主网络前传行为的方式，算((p4pb1p))网络旁路输入
			* ((p5kg1c))可视为特殊的 modulation 机制
		* 相关，((p5kf7e))grid-based INR 中网格插值操作视为特殊的交叉注意力，可比较直接基于交叉注意力的 INR
	* 非注意力的信息交互机制
		* 利用 2D 网格结构，((n8hm0w))AFNO 将注意力换为 FFT（有全局性质）后对各点特征过 MLP
	* 工作模式解读：各注意力头仅在少数情况真激活((_q5rb27))，其余情况是在找 ((q5ra8m))attn sink；{q5rb2r}
* 输入长度问题，原始注意力计算量太大；{n4pl5i}
	* 相关：((o2sn4y))修改位置编码以扩大上下文窗口
	* ((_n39f7h))展望：到万量级只需加显卡，十万 linear attention，百万可能需要 recursive encoding 和增加 long-term memory
		* 线性注意力已在 Genie 视频 Transformer 中用到((_o2rg7c))
	* ((_n4pl47))RMT 机制已可扩展到百万 token（原文的背景介绍还有更多相关工作）
	* ((_n7db7g))针对长序列问题，NLP 社区处理方式有 稀疏化注意力、每层加递归/压缩、局部敏感哈希提取有效注意力
	* 针对有序数据（区分先后，语言等，自回归 Transformer）
		* 利用同样 1D 但不强调顺序的做法，见((p8ae4k))
		* 不靠增大注意力上下文窗口，而是((_o28m7o))将历史保存于模型参数（临时 LoRA 模块）{o28m7x}
			* 相关：((n4t94a))微调
		* RetNet，Mambda 等其他架构；{o4hn5c}
			* 似乎有 Transformer+Mamba 混合架构，Mamba 层 : Transformer 层 大概 6:1
			* ((_o9rk80))MCSD（multi-channel slope and decay），线性复杂度
			* 状态空间模型基于 ODE；推广到 1+nD 维 PDE 后用于替代 ViT 完整注意力：
				* PDE-SSM-2603.13663 反应对流扩散，用于 DiT
				* FluidWorld-2603.21315 对流扩散+局部全局记忆，用于视频预测世界模型
		* 长序列可能遇到的其他问题：{ocve7k}
			* ((ocve7c))大量无关 token 注意力总量大，结果对上下文顺序敏感
	* 注意力范围限制，利用数据的特定结构（主要针对 Transformer 编码器）；{o2cg1y}
		* 序列，1D 结构（无序或不依赖顺序）；包括数据 2D 但做法实质上 1D
			* 局部化，按距离：((_p4b96g))LLM Mistral 滑窗注意力
			* 局部化，按分块：CV SWin Transformer 每层仅做局部¹注意力；{na1k7z}
				* 似乎涉及 patch 的组块（打包），不同层组块方式不同
				* 分组方式理解：图像 patch 视为 graph 顶点，((n7a941))局部注意力可理解为 patch graph 全连接改为按空间位置局部连接，且每层连接方式不同
				* ¹又见((nbrm0z))分组注意力
				* 区域（窗口）限制属于((o8h98r))NO-空间非局部信息交互-非全局情形
			* dilation：grid attention，注意力计算带 stride；MaxViT 提出；{o9pa33}
				* 相关：((p8jh36))下采样后再算注意力，整体网络类似 U-Net
			* 结合距离限制、dilation，((_p4b94r))LLM dilated 滑窗、global + sliding window，Longformer 用到；{p8ae4k}
			* 计算实现，注意力矩阵形态（1D 序列情形）：按距离为 n-对角，按分块为分块对角，加 dilation 为 dilated n-对角
		* 针对图像 patch 的 2D 网格结构，也包括视频、PDE 场的 patch 网格
			* ((_nabh2j))轴向注意力，注意力计算仅限于一个轴，水平、竖直方向依次算注意力；{o2rg6j}
				* 一般框架见((o8h98r))NO-空间非局部信息交互-非全局-沿轴，此处仅记录针对注意力的内容
					* 各轴处理顺序（组合方式）、参数共享、计算结果共享 也在其中讨论
				* 注意力矩阵共享变种，剩余轴所有位置用相同注意力矩阵，以减少 softmax 计算量
					* FactFormer((_pamb8h))基于 Fourier 注意力的卷积核分解解读，各方向注意力矩阵依次作用（运算顺序可交换），处于同一个注意力块中（不涉及独立的 W_V,W_O）{pamg6c}
				* 视频时间、空间（二维）注意力分别计算((o2rg71))
				* AlphaFold2 用了类似操作((_p7nf21))，同序列跨残基、同残基跨序列 分别算注意力更新
		* 更多见((o8h98r))NO-空间非局部信息交互-非全局情形
		* 补偿方式，注意力加范围限制后不完整，需补全
			* 深网络信息扩散：固定距离滑窗，经过多层注意力自动扩展到全局((_p4b99k))
			* 多方案混用：每层用不同限制方案，注意力范围在不同层不同；{p4b97v}
				* 分块方式：图像 SWin((na1k7z)) 不同层分块方式不同；AViT X、Y 注意力层交替
				* 感受野大小：语言 ((_p4b97a))Longformer 浅层小滑窗，深层加 dilation 扩大感受野
				* 范围类型：MaxViT 不同层交替使用窗口注意力、grid 注意力、CNN
				* 相关框架，属于((nbrm0z))分组注意力-按层分组
			* 引入少量全注意力：有语言模型混用滑窗局部注意力层、全局注意力层，比例 7:1 交替（信源：2025-10-29 组会yp）
				* 5:1 比例，((_q46e8u))Gemma4、MiMo 采用
		* 相关框架：((p8ag76))集合元素分组处理
	* token 打包降总数（主要 Transformer 编码器）{palf57}
		* 一般框架为((p8ag76))集合元素打包处理，此处仅讨论只适用于注意力计算的内容
		* 无结构纯学习方案 eg. ((o2cg0f))Transolver 对 meta-token 算注意力
		* 利用结构-1D均匀网格-下采样：ViT 中间层对特征图下采样，整体网络结构类似 U-Net；{p8jh36}
			* SWin 即有下采样层，最初用于全局分类任务、与该类 CNN 同理
				* 后续工作重新引入上采样层而成为类 U-Net 架构，如((_p8jh2v))盘古气象、Poseidon
			* 与 U-Net 区别在下采样目的，U-Net 用于远程信息混合（因卷积局部性），ViT 用于降计算量（注意力本就全局）
				* SWin 也有远程信息混合目的
			* 相关：若不是下采样而是分组算，属于((o9pa33))grid attention
		* 利用结构-1D均匀网格-二次 patchify：P3D((pbfa5h))划多窗口，各窗口抽象出单 token 算注意力
		* 模态转换技巧，DeepSeek-OCR 文本渲染后按图片编码
			* 效果：据说 token 数量减 10 倍时性能基本保持，略牺牲性能可再提高压缩比
			* 可变压缩率：利用序列顺序结构，久远内容提压缩率，模拟人类记忆模糊机制；{pam004}
				* 自回归 PDE 基础模型中((_q2jb25))久远 token avg-pool，使系统近似 Markov
				* 相关：((p8ag76))集合元素打包处理-划分类数-可变压缩率，((n7mj1w))动力学-时间分解-输入-多步
			* 原文未测长文本任务，同期智谱 Glyph 则认真测了 LongBench，缩短上下文长度的同时性能还提升了，推测是太大的未压缩 token 量本身会干扰模型（来源：2025-10-29 组会yp）
	* 其他，利用数据特定结构（主要 Transformer 编码器）
		* 1D 结构 换掉注意力机制，((n9291a))用频域 MLP（需长度固定），FFT 复杂度 nlogn 低于平方；AFNO 用到
		* graph Transformer 有声称关于顶点、边数线性复杂度做法((n7de86))
	* Transformer 视为完全图 GNN，从而利用有结构数据的办法降低注意力成本
		* ((_o2cg0z))GNN 社区有划分二部图做法，使 NLP 句子图稀疏化
		* 可能性：改为多尺度图、小世界网络¹等，可考虑动态²连边
			* ¹小世界网络算分布式抽象层？向量数据库里已有“分层可导小世界”技术方案
			* ²可依赖于输入、前传层数等，见一般 dynamic NN
* FFN 部分；{o3ll7n}
	* 不同 FFN 处理不同模态 token：((n8jm4l))对多模态模型，VLMo 各模态有独立 FFN，而注意力共享
	* 引入外部 modulation：((o3ll25))FFN 层的 LayerNorm 引入外部 modulation
	* 激活函数：((o3198n))GLU
* 机理解读
	* 理解方式：集合/图/序列数据的翻译；序列通过引入位置编码成为集合，集合视为全连接图；{n4295u}
		* 相关：((n4296a))仿TRIZ原理-顺序结构平行化，包括映射 set2set 化后用 Transformer
		* 深度势能大模型 DPA-1 中的 Transformer 就只考虑邻域原子的注意力，不是全连接图？
		* 相关：((n3qn83))NO-输入形式-集合输入，包括 DeepSet 等方法
	* `Sinkformers-2110.11773` 机制解读与改进算法，考虑无穷深、无穷 patch 平均场
	* `[Transformer为完全图GNN]`，包括二社区处理长序列（大规模图）的方式，多头注意力理解；{n79n3o}
	* ((_n3ud8m))Transformer 作为图灵完备NN
	* 内部多子程序在运行，((_q6k811))文本复制、基础逻辑推理，乃至梯度下降（> 上下文学习？）
	* UAP 定理，((q8dl37))等变网络 可被 无位置编码 Transformer 编码器 一致逼近
* 变种—条件引入，DiT 讨论的 4 种方式：((_o3lk9b))in-context condition、cross attention、adaLN 及其零初始化版本 adaLN-Zero；{o3lk9o}
	* 相关：((n4te8y))生成模型-条件生成，((nbih2c))cross-attention
	* adaLN-Zero（DiT 原文效果最好）：基于 pre-layernorm，Attn、FFN 层分别进行该操作；{o3ll25}
		* 相当于((n2il89))scale+shift modulation，或 ((nbqg84))LayerNorm 的变种
		* 注意在残差连接前又引入了一次额外的 scale
		* 发现 modulation encoder 输出层权重适合用零初始化（相当于 Transformer 初始化时残差块为 identity 映射）；{o3ll1o}
		* 相关：((_o4ha53))StyleGAN 中已使用 adaLN，视觉自回归模型 VAR 也沿用
		* adaLN 还用于 PDE 通用模型 Unisolver((_o6ch7i))，调制信息按来源分两类，一类的调制信息对各 patch 独立，另一类对所有 patch 共享
		* RMSNorm 版本也保留 shift，(('patm9f))MovieGen 视频生成用到
	* in-context condition（外部条件并入已有序列）可视为((n4t96h))特殊 token；{o3ll9f}
		* 相关：((n4ff89))in-context learning
		* 变种((_q15j34))MM-DiT，条件、图像 token 一起算注意力，但 Transformer 参数独立
	* cross-attention 额外计算量较多（其他的都不多），对更复杂的 condition（如文生图）更适用
	* 多种同时用，((_q15j3b))上下文基础上，条件表征额外用于生成 AdaLN 调制
	* 条件预处理：多种编码器同时用，结果可((_q15j48))按通道or按 seq-len concat；{q15j6j}
		* 可部分缺省：推理要求不严时可去掉高成本编码器，有相应训练配方；各编码器独立 drop
		* 相关：((n3t95j))仿TRIZ原理-输入重复
	* 相关框架，影响主网络前传行为的方式，((p4pb1p))网络旁路输入
* 变长、变分辨率（序列、图像）训练策略；{pbpg0g}
	* pad 到最大长度：batch 内不同序列需要同长度，若原本长度不同，需补全；见((o4hn3h))pad token
		* 针对 graph 的 Graphormer 涉及补全虚拟节点、设 attn_bias((_n7tm0t))
	* 长度外推（微调等）
		* 位置编码-长度外推((o2sn4y))
		* 按原长分组：注意力原长 L，更长输入做分组注意力、各组长 L
			* 微调的 LongLoRA((_na1k7c))引入分组注意力，将全序列划为多组，只计算组内注意力（组长度为位置编码全长），二个分组方式恰好错开以保证信息的全文流通；{na1k82}
				* 相关：((na1k7v))多头注意力，((nbrm0z))分组注意力，((na1k7z))SWin 滑窗注意力
			* 注：相关手段链分析尝试见(('pbpf7i))
	* 各样本长度差异大情形 提高训练效率
		* 减样本量—pack 到最大长度，((o4hn3w))多个短序列拼接
		* 控序列长—短序列多训，先短序列充分训练，再逐步增大序列长度微调；{pbpg3s}
			* 据说 DeepSeek-V3 预训练始终 4k，之后两阶段 YaRN 依次扩展至 32k、128k（各 1k steps，后一阶段 bsz 减小），扩展成本比预训练小一个量级以上（信源为腾讯元宝 DeepSeek-V3 联网版）
			* VAR 类图像生成((_pbpg1z))多阶段，分辨率 256、512、1024
			* 相关：课程学习((n7d931))，其主要考量是直接训难任务学不到东西，而这里是考虑训练性价比
		* 控序列长—分桶训练：((_pbpg3u))不同长度（包括图像长宽比）数据按桶分类，每次取 batch 先选桶再采数据
		* 控序列长—分卡训练？部分卡处理短序列、用大 batch-size，部分卡小 bsz 长序列
	* 相关：((o4hn6z))NaViT 变分辨率外还变长宽比
* 实现时的细节考量
	* BERT 训练引入了 dropout((n37m4y))，但 GPT3 没有
	* 为提高泛化能力 ((o31f3k))自监督预训练-基于破坏重建
	* ((_n7hk73))据说 MoE 为提高模型效率、容量的常用技术；{p8c969}
		* 一般 MoE 见框架((p8ai85))元素分类处理-分流处理-样本内元素
	* 小型 LLM 深度比宽度重要((_o39l20))；{o39l2g}
		* 相关：((n77m1x))scaling law
	* 网络初始化，BEiT 的做法((n8kd9u))参考价值待考察
	* 训练早期 warmup((_n8kh0j))，先用较小学习率预热；如 ((_n8kh0p))BEiT 用 10 epoch（总 800 epoch）；{n8kh0w}
		* DeepNet 作者认为只治标，调模型架构才治本
		* 另见((n8kh0z))优化-NN训练技巧
	* 输出层 lm-head 在 SFT 阶段对少见词汇可能漂移，((_q5am6c))构造内容抄写类合成数据，以确保生成频率下限；{q5am6j}
* ViT；{n37m6i}
	* 相关框架：((n37n5d))CV大模型，((n3bg7w))CV，打 patch 做法涉及((p3va9b))tokenize
	* 与((n37m6h))CNN 的比较；{n37m6d}
		* CNN 更关注纹理，Transformer 更关注形状((_n37m5o))
		* `[图像分类可复现性-2203.08124]` ViT 可复现性不如常见 CNN
		* ((_n37m5v))卷积擅长提取细节，注意力善于把握整体；卷积要求多层堆叠，注意力要求大量数据
		* ViT 与 CNN 的结合尝试，可见((_n37m62))；另外 TransUNet（2021-10-29 CSI讨论）也是例子
		* CNN ResNet 的 loss landscape 与其比较，再考虑预训练、对抗稳定性训练后的影响((n37n18))
		* 有观点认为 CNN 引入的先验结构更多，((n3ag7v))数据较少情形优于 ViT，但数据足够情形反之
			* 等变性先验，((n3ha7e))训练后 ViT 等变性更好，CNN 等变性被 alias 破坏
		* 另：((n8hj6b))ViT patch 的 token embedding 可用特殊卷积实现
	* 预训练的 mask out 策略，MAE 等；{n37m7m}
		* 相关框架：属于((n8mn5a))自监督 范式之一，包括局限性讨论
		* 方法例子：MAE，BEiT
			* 据说二者区别，BEiT 只预测被 mask 的 patch，MAE 预测完整图片的所有像素（包括未 mask 的，似因为有 decoder 结构所以 nontrivial）
			* 据说还有 iBOT，CAE，SimMIM
		* 理解方式
			* `2202.03670` 从 kernel learning, low rank approximation 等角度解释 MAE
		* 仅作用于网络输入时见((q8a88n))输入预处理-maskout
		* 相关框架：((n37n1v))预训练，((n9999m))网络(输入,输出)≠ 数据(样本,标签)
		* 一般的 mask 自监督预训练，不限于 CV；{n8mn72}
			* 对象—物理场 NO：((_o6nf9d))，综述实验性质的((_o73k0p))
			* 对象—点云网络，((n98h1e))PointMAE
			* 对象—NLP ((n38m9d))BERT，只用编码器、完形填空方式训练；{n38n02}
			* 对象—图文双模态 联合 mask，((n8n89i))BEiT3 涉及
			* mask 方式区分完形填空、NTP；{n8mn8t}
				* 为训练方式（被预测对象）的区别；相应架构区别((n38n48))单向、双向注意力
				* 完形填空 mask ratio 问题：信息密度；{n8mn9f}
					* BERT 训练遮住了 15% 的词，MAE 则遮住了 75% 的 patch；原文解释说自然语言的信息密度更大，大部分词语都有具体意义，而图像的冗余信息要多很多
					* 多模态模型：((_n8n87u)) BEiT3 单模态文本 15%，图像 40%，图文联合任务 mask 50% 文本；{n8n89i}
				* ((_n8un7p))Ilya 认为 NTP 任务难于完形填空（均只考虑最困难的任务）
					* `2309.06979` NTP 理论分析框架，认为该预测器“可近似图灵机有效计算的任何函数”
				* 完形填空任务转化为 NTP，((_n9na97))CM3Leon 通过引入特殊 token 达到；{n9na9e}
					* 相关：((n4t96h))特殊 token
				* 表示未知、待预测部分的方式不同：完形填空用特殊 mask token，NTP 用序列位置（过去已知、未来未知）{nabe20}
				* NTP 有特殊 token 表示序列开始、结束((nc6l0q))
				* 自回归范式相关：这里视为预训练方法、与完形填空比较，还可((o42g70))视为生成方法、与扩散模型比较
			* mask data modeling 的能力：((n8n88x))BEiT3 预训练中放弃对比学习、图文匹配 loss，一律按 mask 范式自监督训练
	* 相关解释，包括理论、实验；{n7na8n}
		* （旧）`2021-07-02`(MRmeet) 导师推测 Transformer 在 CV 的应用或许有限
			* NLP 中可以定义无穷多的任务，这是它与 CV 的最大区别；当然可能也不绝对
			* `2021-09-29`(CSImeet) 不太清楚 Transformer 用于图像的合理性：相当于打成二维 patch 序列（对应 NLP 单词序列），但是句子里单词顺序不可变，图像 patch 顺序可变
			* 如果导师自己做，可能会用类似 DeepSets 的顺序无关的 Transformer 版本
		* 实验解释：`2022-03-11`(CSImeet2) 预训练、对抗稳定性的作用，loss landscape 与 ResNet、MLPmixer 比较，及如何被预训练、对抗稳定性训练影响；{n37n18}
			* 相关框架：((n37n1v))预训练，((n2bg0w))对抗训练，((n37m6d))CNN ResNet vs ViT，((n37n3t))loss landscape
		* multi-head 注意力机制相当于同时关注图中多个部分((_n37m5t))
		* `2022-06-10`(CSImeet2) 导师觉得 MLP Mixer((o8gg6g)) 动机、可解释性好于 ViT（虽然 ViT 也有解释）{o8gg6h}
		* `Sinkformers-2110.11773` 从理论上解释了 ViT 单样本无穷深前传动力学形如梯度流，进一步无穷 patch 平均场极限为 diffusion；{n7na8o}
			* 相关：((n32b5g))一般 NN 架构解读
		* 关于近似等变性（平移），((n3ha7e))非等变因素主要在开始的 patch embedding；提高等变性程度更适合((n3ha7h))靠训练而非架构
			* 相关：((n7a92o))图像 patch 作为图顶点
	* 相关综述：2012.12556 "A Survey on Vision Transformer"
	* 变种与（针对特定任务的）架构设计
		* 输入层 patch projection 导致训练不稳定；{p6ga15}
			* 换为 CNN 后（保整体计算量不变）性能更好((_p6ga0o))
			* 固定 patchify 部分参数（不参与训练）为早期应对方式((_p6ga0u))，MoCoV3 用到；{p6ub6i}
				* 相关：((p6ub6n))网络参数随机生成、不参与训练
			* 一般框架见((p3va9b))空间分辨率压缩-逐 patch 压缩
		* `FourCastNet-2202.11214` ViT 内部注意力换为 FNO（保留二维排列），用于天气预报；{n8hm10}
			* 架构源于 AFNO²，((n8hm0f))此时各 patch 信息混合不再靠原始注意力，而是 FFT¹后对逐点特征过（单隐层）MLP；{n8hm0w}
				* ¹不同 patch 在中间层对应 feature map 不同像素
				* 替代原始注意力机制的好处：((n9291a))长序列处理能力
				* ²AFNO 当时用于图像分类任务，FourCastNet 作为后续工作才考虑科学计算
				* 另见((n7pe3p))注意力机制变种
		* 引入旋转等群 equivariance 性质，SE(3)-Transformer `2022-09-02`(CSImeet2)；{n3ha70}
		* SWin Transformer((na1k7z)) 注意力计算局限于局部，每层限制方式不同
		* 前传改为 conditional 版本((o3lk9o))
	* 实现时的细节考量
		* `2022-12-14`(dbGrpMeet2) position 和 token 的 embedding 应该分别做 layer normalization，而不是 concat 之后一起做
		* 位置编码可学而非手动指定((n8dm0h))？
		* 代码实现：((_n37m94))各种视觉Transformer的PyTorch实现合集
		* 模型较大时，为缓解((n3891i))过拟合，可((n37m4y))引入 dropout，尤其是((_n38a01))late dropout
		* patch 尺寸，((_n8dm0o))的实现用 9x9 patch，边缘部分对图像用 0 填充
			* ((_o3lm1h))DiT 中减小 patch 尺寸、增大模型参数量 效果类似，均增大计算量、提升生成效果；{o3lm1o}
				* 相关：((o3lm25))scaling law
		* 网络初始化，((_n8kd9c))BEiT 缩放系数与所在层的深度有关（并认为这对大规模训练的稳定性重要）{n8kd9u}
