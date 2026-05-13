> 2023-07-25 从 freeLit2.md 分离出来
## ViT，CV Transformer
* `2202.03670` （备用）ViT 中预训练 MAE 技巧的理解方式，从 kernel learning, low rank approximation 等角度解释
	* "How to Understand Masked Autoencoders"
		* Shuhao Cao, Peng Xu, David A. Clifton
		> (CSImeet2) 群推荐，作者同 `GalerkinTf-2105.14995`
* ViT：CV 任务的 Transformer
	* [2023-03-07 修订](https://zhuanlan.zhihu.com/p/393204542)
	* CNN 更关注纹理，Transformer 更关注形状；{_n37m5o}
	* multi-head 注意力机制相当于同时关注图中多个部分；{_n37m5t}
	> 卷积擅长提取细节，要掌握全局信息往往需要堆叠很多个卷积层。注意力善于把握整体，但又需要大量的数据进行训练。{_n37m5v}
	* 有试图结合 CNN 和 Transformer 的工作；{_n37m62}
		* eg. 2021-10-29 CSI讨论的 TransUNet
* [图像分类可复现性-2203.08124](https://zhuanlan.zhihu.com/p/483680146)
	* 通过比较不同决策边界研究各 CV 模型的可复现性、双下降
	* 可复现性：同架构不同初始化，训练结果比较，通过可视化决策边界（不同分类结果对应的参数区域）
		> 实际应该还有 batch 选择等随机性，不过本文固定只使用 3 图片训练，网络输出层允许的分类多于 3
		* 设计了专门指标衡量这种“可复现性”
	* 不同 CNN（ResNet，VGG，DenseNet 等）训练结果相似，且初始化影响不大；似乎越宽可复现性越高
	* 全连接、ViT、MLP Mixer 表现各不同，也不同于 CNN；调学习率后仍如此
	* 优化器也有影响：SAM 可复现性好于 SGD,Adam，但对 ViT,MLP Mixer 不总能保证最小测试误差
	* 双下降：ResNet，训练集标签无噪声时看不出，20% 噪声时有明显 double descent；{_n42f6o}
		* “双下降现象是由噪声标签情况下决策区域的过度碎片引起的”，宽度 10 左右时碎片多故分类不稳定
		* 再测试所有训练数据来自同分类情形（上面为不同分类），结果一致
		* 提出“碎片分数”计算方法以验证该直观
	* 插值阈值（临界宽度）处，可复现性得分达到低谷；标签无噪声时也能观察到数值细微下降
	* [GitHub 地址](https://github.com/somepago/dbVi)
* CV 任务，何恺明的 MAE（masked AE），像 NLP 常用的预训练范式：预训练 AE 用少量 patch 恢复完整图像，之后只保留编码器、输入完整图像用于后续任务训练
	* [微信介绍文章](https://mp.weixin.qq.com/s/x-ruExbM9T8EIv2gZW0Nnw)；回顾 NLP 预训练为做完形填空
	* 2021-11-19 CSI讨论有提到之前的工作 BEiT，更复杂的试图将 CV 任务转化成与 NLP 类似的做法；以及 MLP mixer
* 各种视觉 Transformer 的 PyTorch 实现合集；{_n37m94}
	* [2023-03-07 修订](https://mp.weixin.qq.com/s/aZwmaY8AjdaomETmMfpy2g)
* MRE：MAE作为一种数据增强-2206.04846；{_n37m82}
	* "Masked Autoencoders are Robust Data Augmentors"
	* [2023-03-07 修订](https://zhuanlan.zhihu.com/p/547778163)
* `2210.02984`
	* "The Lie Derivative for Measuring Learned Equivariance", ICLR2023 oral
		* Nate Gruver, Marc Finzi , Micah Goldblum, Andrew Gordon Wilson
		* [OpenReview](https://openreview.net/forum?id=JL7Va5Vy15J)
		> `2023-03-08`(AISCmeet2)
	* sec2 认为图像应被视为连续信号 $h:\R^2\to\R^3$ 而非像素组合，尽管离散化对计算机表示必要；{_n3gm4s}
	* sec2 alias 是破坏等变性的重要因素
		* alias 现象：高频信号低频采样，将错误地重建出低频信号；例如肉眼观察转动的轮胎时就常有类似错觉；{_n3gm4j}
		* 对等变性的影响：以平移为例，本来在 Fourier 域对应系数幅角转动，转动幅度与频率 $n,m$ 有关；但发生 alias 后，转动幅度出错；{_n3h986}
			* sec5 thm1 偏离等变性总幅度的计算
		* 许多 CNN 通过微妙方式引入 alias（从而破坏等变性）
			* 下采样：引文，下采样导致平移后图像输出不一致；{_n3h98y}
				* 之前工作的解决办法：先低通滤波去除有问题的频率
			* fig2 逐点非线性激活，原信号只有低频，作用激活函数（尤其非光滑的 ReLU 等）后出现多个高频分量；{_n3h994}
				* 之前工作解决办法：使用光滑的非线性激活，并在作用激活函数前先上采样
	* sec4 使用 Lie 导数度量函数 $f$ 不满足等变性的程度
		* 具体地：对作用 $g$，可考虑 $g^{-1}fg$ ¹与 $f$ 的差，考察 $g\to 0$ 时相应变化率
			* ¹严格的写法要用 $\rho_{1,2}(g)$
		* 现考虑 $g$ 由沿向量场 $Y$ 的流给出，得 Lie 导数 $L_Y$；fig3 代码计算方式；{_n3ha5a}
		* eqn(5) 复合函数：二函数复合结果偏离等变性程度，可表达为二者各自偏离程度之和；可计算验证
		* eqn(6) 从而为度量一般 NN 不满足等变性程度，可逐层考虑，分析各层不满足的程度；{_n3ha5f}
	* fig4 比较，各架构的各层对等变性的偏离幅度
		* CNN 主要来自下采样、非线性
		* ViT、MLPmixer 主要来自最开始的 patch embedding；{_n3ha62}
	* 经过训练的 ViT（相较 CNN）能更好地保证等变性；
	* p7:-1 相比改架构，增加模型大小、数据集大小、改训练方法等 减少等变误差效果更显著；{_n3ha6a}
* `SegGPT-2304.03284` 图像分割任务的上下文学习，可在用户的小数据集上微调（表示任务的）隐向量、直接用于在线分割后续图像
	* "SegGPT: Segmenting Everything In Context"
		* Wang, Xinlong; Zhang, Xiaosong; Cao, Yue; Wang, Wen; Shen, Chunhua; Huang, Tiejun; 
		> created on 2023-04-27
		* [微信介绍](https://mp.weixin.qq.com/s/2fk4g2PclC4Qy_k_s3W4vA)
	* 分割任务的统一化格式：分割视为图片着色¹问题，根据示例图片（“上下文”）及其中给出的着色方式，对新图片着色；{_n51a4g}
		* ¹估计是 输入 3 通道，表示原始图片；输出 3 通道，分片常数图片，表示分割结果
		* 为避免颜色与 class 绑定，对训练集中出现的颜色随机 shuffle，从而强迫模型学其语义信息
		* 使用阶段，似乎不要求示例图片的分割给得很准确，手绘描出大致区域即可
	* 上下文学习，似乎同时允许两种形式：待分割图像同时输入、日后输入
		* 一种是同时输入示例图像及其分割方式、待分割图像，输出分割结果
		* 另一种 sec3.3 即插即用，根据示例图像提取一个隐向量（image tensor），用该隐向量直接分割未来的各种新图像，即插即用
			* 隐向量提取通过 prompt tuning 得到；{_n4rb6c}
	* fig3 通过“context ensemble”支持数量不定的 prompt，两种办法：空间拼接 or 平均
		* spatial ensemble，把输入示例拼接起来（降低分辨率）{_n4rb6r}
		* feature ensemble，过注意力层后会获得 query image，对所有示例求平均；{_n4rb6y}
* `ITSRN-2112.06174` （备用）Transformer INR 用于图像超分辨率，输入低分辨率图像、其已有坐标、新的待查询坐标，输出该查询坐标处像素值
	* "Implicit Transformer Network for Screen Content Image Continuous Super-Resolution", NIPS2021
		* Yang, Jingyu; Shen, Sheng; Yue, Huanjing; Li, Kun; 
		> created on 2023-05-04
	* Transformer 结构，$q$ 待查询坐标，$k$ 低分辨率图像中的坐标，$v$ 低分辨率图像对应位置的像素值/feature；{_n54f46}
	* 注：后续工作 ITSRN++-2210.08812 fig2 将本做法称为 modulation based implicit Transformer，传统做法称为 aggregation based explicit Transformer，示意图为二者对比
		* 区别 1：本做法 $q$ 为坐标，$kv$ 为 content；传统做法 $qkv$ 均为 content
		* 区别 2：本做法 $z=\sin(Q\odot K)\odot V$，传统 Transformer $z=softmax(QK^\mathrm{T})V$（实际情况还要稍复杂）
* `BEiT-2106.08254`
	* "BEiT: BERT Pre-Training of Image Transformers", ICLR2022
		* Bao, Hangbo; Dong, Li; Piao, Songhao; Wei, Furu; 
		> created on 2023-08-20
	* sec2.5:-2 预训练 800 epoch（500k 步），warmup 10 epoch，batch 2k，Adam 权重衰减 0.05；stochastic depth（？），未用 dropout；{_n8kh0p}
	> sec2.5:-1 我们发现，适当的初始化对于稳定Transformer非常重要，尤其是对于大规模的预训练。
		> 我们首先在一个小区间内随机初始化所有参数，如[-0.02，0.02]。
		> 然后，对于第l个Transformer层，我们将自注意模块和前馈网络的输出矩阵（即每个子层内的最后一个线性投影）重新缩放1/√{2l}。{_n8kd9c}
			> Then, for the l-th Transformer layer, we rescale the output matrices (i.e., the last linear projection within each sub-layer) of the self-attention module and the feed-forward network by 1/√2l. 
		* 作者在知乎上提到 BEiT3 也用的类似初始化；并推荐了同组的工作 DeepNet
			* [2023-08-22](https://www.zhihu.com/question/549621097/answer/2649609518)
			> 另外当模型规模大了以后，训练稳定性就会成为一个挑战。在BEiT-3中，我们使用了BEiT中的初始化算法（Sec 2.5最后一段），这个应该也是目前大家用MIM预训练大型vision Transformers的标配。这里也要推荐下我们组的另一个相关工作DeepNet，对Transformers的训练稳定性有更形式化的探讨和解决方案：
* BEiT3
	* 知乎介绍 1
		* [2023-08-22](https://mp.weixin.qq.com/s/CjKwSgxwRzmwhK5JTukq3w)
		* 仅用 mask data modeling 这一个目标函数
			> 当前的多模态模型的预训练方法还有使用图像-文本匹配 (Image-Text Matching Loss) 图像-文本对比学习 (Image-Text Contrastive Loss) 等等，{_n8n88m}
			> 但是相比之下还要平衡各个损失函数之间的权重，很麻烦。
			> 而 BEIT-3 就仅仅采用了 Mask Data Modeling 这一个目标函数。
			> 这个简单而有效的方法学习了强大的可转移表征，在视觉和语言任务上都实现了最先进的性能。
			* mask ratio：
				> 作者从单模态文本中随机 mask 掉 15% 的文本，从图片-文本对中随机 mask 掉 50% 的文本。在 mask 图像时采用 BEIT 的做法 mask 掉 40%。{_n8n87u}
		* 只用公开数据集；{_n8n90j}
			> 对于多模态数据，从五个公共数据集收集了大约 15M 图像和 21M 图像-文本对：Conceptual 12M (CC12M) 、Conceptual Captions (CC3M)、SBU Captions (SBU)、COCO 和 Visual Genome (VG)。
			> 对于单模态图像数据，BEIT-3 使用 ImageNet-21K，大约 14M 图片。
			> 对于单模态文本数据，BEIT-3 使用来自 English Wikipedia、BookCorpus、OpenWebText3、CC-News 和 Stories。
		* 训练细节
			> 作者将 BEIT-3 预训练 1M 步。
			> 每个 Batch 总共包含 6144 个样本，包括 2048 张图像、2048 个文本和 2048 个图像-文本对。{_n8mm55}
			> Batch Size 远小于对比模型。
			> BEIT-3 使用 14×14 的 Patch Size，并以 224×224 的分辨率进行预训练。
			> BEIT-3 使用与 BEIT 相同的图像增强，包括 Random Resized Cropping, Horizontal Flipping, 和 Color Jittering。{_n8mm5w}
			> BEIT-3 采用具有 64k 个词汇大小的 SentencePiece tokenizer 对文本数据进行 tokenize，余弦学习率衰减，10k 的 warm-up epochs，
			> AdamW 优化器 (beta1=0.9, beta2=0.98 )，使用了 0.1 的 Stochastic depth。{_n8mm66}
		* image captioning task
			> 图像字幕任务旨在为给定图像生成自然语言标题。
			> 遵循 UNILM[14]和 s2s-ft[15]的做法，BEIT-3 微调时以 image-to-text generation 的方式来呈现。
			> Image token 只能在图像的序列内部双向关注，Caption 的 token 可以关注到 Image token，它们左侧的 token 和它们自己。{_n8mm73}
			> BEIT-3 模型经过训练以根据图像及其 Caption 的上下文的线索来恢复这些 Caption。
			> 为了简单起见，BEIT-3 使用简单的交叉熵损失进行训练，而不使用 CIDEr 优化。
			> 在推理的过程中，BEIT-3 以自回归 (Autoregressive) 的方式逐一生成 Caption。
* SAM 图像分割大模型
	* 2023-04-12 组会，YrMkZe
		* prompt 指人对分割的提示：文本，点，框，（不精确的）mask；{_n95m2h}
			* 架构中信息引入方式不同，mask 过 CNN 后 与 img 编码结果求和（逐元素），点、框用位置编码后参与求和，文本用 CLIP
		* p9 基础模型，目标的 3 部分：任务、模型、数据
			* 任务已足够通用（可通过提示词工程完成下游任务）
			* 数据：large-scale, diverse，但没有现成的网络数据
		* 分割的歧义性：每次同时生成 3 个分割方案，选择 loss 最小的那个反传；{_n95j1p}
			* 模型额外为每个方案生成 confidence score，“estimated IoU”；{_n95m6a}
		* 预训练生成模拟 prompt（已有真实分割结果）：随机选取
			* 点 从真实分割 mask 中均匀取出
				* 如果分错，从分错的区域里额外（均匀）采样新点，再次输入模型；{_n95m3u}
			* 框 为真实框加随机噪声
		* image encoder 大、慢，因图像只用处理一次；prompt encoder, mask decoder 小、快，可迭代用多个 prompt
			* image encoder 架构为 MAE 预训练 ViT
			* 输入图像 1024x1024，图像 embedding 256x64x64
	* 知乎解读
		* [2023-09-05](https://zhuanlan.zhihu.com/p/643861000)
		* data engine 三阶段：
			> 协助人工阶段：首先，使用公开分割数据集训练SAM，使用SAM辅助标注人员进行数据集标注，注意标注人员并未被强制要求标注mask的语义。然后使用新标注的数据重新训练SAM。随着越来越多的mask被收集，Image encoder从ViT-B变化到ViT-H，每个mask标注时间随着模型提高从34s减少到14s。此阶段共训练了模型6次。{_n95n49}
			> 半自动阶段：在这个阶段，目标是增加mask的多样性，以提高模型分割任何东西的能力。首先利用SAM找出可信赖的标注，将这些标注提供给标注员。标注员此时应该关注未标注的（即未被SAM认为可信赖的标注）物体。在这个阶段，作者在18万幅图像中收集了额外的590万个mask（总共1020万个mask）。与第一阶段一样，作者定期用新收集的数据重新训练模型（5次）。
			> 全自动阶段：进一步提高SAM的模糊感知能力。利用SAM进行分割，对于重叠或者模糊的对象，选择IOU置信度高的，最后使用非极大值抑制NMS去除重复物体。
* 2312.00785 纯 CV 大模型
	* [2023-12-05](https://mp.weixin.qq.com/s/CzAM_2ozZwxOnh9BufgXQw)
	* “视觉序列”统一多种不同 CV 任务
		> 研究人员计划利用过去几十年中产生的各种带标注的视觉数据资源，如语义分割、深度重建、关键点、3D物体的多个视图等。
		> 为此，他们定义了一种名为「视觉序列」的通用格式，来表示这些不同的标注，而不需要任何超出像素本身的元知识。
		> 类似于语言模型，研究人员在每个视觉序列的开头添加一个[BOS]（序列开始）token，在末尾添加一个[EOS]（序列结束）token，并在训练时使用序列连接（sequence concatenation）来提高效率。{_nc6l08}
	* “视觉序列”中的图像序列情形：视频的不同帧，3D 物体不同视角，同一类别的不同图像；{_nc6k98}
		> 获取视频数据…… 16帧的视觉序列，是通过以三个不同步长(10、20和30) 对视频进行机采样而形成的。
		> 此外，研究人员利用了来自0bjaverse数据集的合成3D物体，生成了以物体为中心的多视角序列。对于每个物体，研究人员都在物体中心和摄像机之间，采样了一个半径1.5到2.2的长度，并从-45度到45度采样了一个恒定仰角，然后遍历物体的不同视角（以15度步长和渲染24个视角的方式，改变方位角）。
		> 将属于同一语义类别的图像表征为序列的（一部分）。使用ImageNet中的类别，将同一类别中的图像组（2、4、8或16个）连接成一个16幅图像的长序列。
	* 两阶段训练：先训 tokenizer（逐图像处理），再训自回归 Transformer 处理一般的视频等数据
		> 1. 训练一个大型视觉tokenizer（对单个图像操作）将每个图像转换成一系列视觉token；
		> 2. 在视觉序列上训练一个自回归Transformer模型，每个序列都表示为一系列token。
		> 研究人员的tokenizer独立地对单个图像进行操作，而不是一次性处理整个视觉序列。
			> 这种独立性允许研究人员将tokenizer训练与下游Transformer模型分离，这样tokenizer就可以在单图像数据集上进行训练，而无需考虑视觉序列的分布。
	* 图像的 tokenize 方法；{_nc6n38}
		> 先前的工作通常采用以下方法：要么按扫描线顺序将图像分割成补丁，并将其视为一个序列，
		> 要么使用预训练的图像tokenizer，例如VQVAE或VQGAN ，将图像特征聚类成一格一格的离散token，然后再按扫描线顺序将这些token转换成序列。
		> 研究人员采用后一种方法，因为模型的离散分类输出自然形成了一个可以轻松采样的概率分布，使得在视觉序列中灵活生成新图像成为可能。{_nc6n5g}
		> 对于给定的图像，研究人员的VQGAN的tokenizer产生256个离散token。
			> 采用了现成VQGAN架构。其中使用了f=16的下采样因子和8192大小的代码本。这意味着对于一个大小为256×256的图像，研究人员的VQGAN的tokenizer产生16×16=256个token，其中每个token可以取8192个不同的值。
	* 图像 tokenizer 训练，发现也需要大数据集；{_nc6n5o}
		> 发现使用ImageNet预训练的tokenizer在ImageNet图像之外并不具有很好的泛化性能。因此，研究人员在LAION 5B数据集的1.5B子集上训练他们自己的tokenizer。
	> 采用了LLaMA 的Transformer架构。
	> 要将模型用于下游任务，可以在测试时构建定义任务的部分视觉序列，并应用模型生成输出。这类似于语言模型中的上下文学习或计算机视觉中的视觉提示。
		* 顺序例子，视频下一帧预测（输入为连续 7 图像序列），物体 3D 旋转下一个角度预测，给定同一类物体多张示意图、要求生成该类别新图
		* 类比提示例子；{_nc7m7w}
			* 如姿态识别、图片转素描、黑白图片着色、风格迁移、inpainting，甚至有训练未出现的 OoD 任务
			* 顺序输入 7 对示例、接上一个待查询图像
		* 任务组合，如在预测下一个角度旋转的同时标注出图中关键点位置
* Genie-2402.15391 by Google，新智元报道
	* [2024-02-27](https://mp.weixin.qq.com/s/gaymazYyX7qfesk-MBGfZw)
	> 一个ST-transformer包含𝐿个时空块，其中交错有空间和时间注意力层，之后是一个标准注意力块的前馈层（FFW）。
		> 空间层中的自注意力关注每个时间步内的1 × 𝐻 × 𝑊个token，而时间层关注𝑇 × 1 × 1个token跨越𝑇个时间步。{_o2rg69}
		> 与序列Transformer类似，时间层假设一个因果结构，带有一个因果掩码。
		> 更关键的是，Genie架构中计算复杂度的主导因素（即空间注意力层）与帧数的增长，呈线性关系而非二次方关系。{_o2rg7c}
			> 这使得它对于视频生成变得更加高效，能够在延长的交互中保持一致的动态。
		> 此外，注意在ST块中，研究人员在空间和时间组件之后只包含一个FFW，省略了空间后的FFW，以便扩展模型的其他组件，并观察到显著提高了性能。
	> Genie模型包含了三个关键组件：
		> 1) 潜动作模型（LAM），用于分析每两帧之间可能发生的动作𝒂
		> 2) 视频分词器，将视频的每一帧转换为一系列的离散符号𝒛
			* 使用 VQ-VAE + ST-Transformer；table3 说 ST-ViViT 为最佳架构
		> 3) 动态预测模型，根据之前的动作和帧token来预测视频的下一帧内容
		> 研究人员采用了一个分阶段的训练方法，首先训练视频转换器，然后再同时训练潜在动作模型（直接基于视频像素）和动态预测模型（基于转换后的视频token）。
* DiT（Diffusion Transformer）知乎介绍
	* [2024-03-21](https://zhuanlan.zhihu.com/p/641013157)
	* Transformer 块的外部 condition：扩散时间步，待生成图像的 class label
	> DiT共设计了四种方案来实现两个额外embeddings的嵌入，具体如下：{_o3lk9b}
		> 1. In-context conditioning：将两个embeddings看成两个tokens合并在输入的tokens中，这种处理方式有点类似ViT中的cls token，实现起来比较简单，也不基本上不额外引入计算量。
		> 2. Cross-attention block：将两个embeddings拼接成一个数量为2的序列，然后在transformer block中插入一个cross attention，条件embeddings作为cross attention的key和value；这种方式也是目前文生图模型所采用的方式，它需要额外引入15%的Gflops。
		> 3. Adaptive layer norm (adaLN) block：采用adaLN，这里是将time embedding和class embedding相加，然后来回归scale和shift两个参数，这种方式也基本不增加计算量。
		> 4. adaLN-Zero block：采用zero初始化的adaLN，这里是将adaLN的linear层参数初始化为zero，这样网络初始化时transformer block的残差模块就是一个identity函数；另外一点是，这里除了在LN之后回归scale和shift，还在每个残差模块结束之前回归一个scale，如上图所示。
			* （评）看其源码，modulation encoder 只是 SiLU + Linear，可能因为本文考虑的输入（class embedding）比较简单
		> 论文对四种方案进行了对比试验，发现采用adaLN-Zero效果是最好的，所以DiT默认都采用这种方式来嵌入条件embeddings。 
		> 但是这种方式只适合这种只有类别信息的简单条件嵌入，因为只需要引入一个class embedding；但是对于文生图来说，其条件往往是序列的text embeddings，采用cross-attention方案可能是更合适的。
	* 增大计算量可提升性能
		> 注意对于DiT来说，除了模型参数会影响计算量，patch size也会影响计算量。可以看到无论是固定patch size增大模型参数，还是固定模型参数降低patch size，均能够提升生成质量，两个的共性都是增大了计算量。{_o3lm1h}
		> 所以论文进一步绘制了模型Gflops和生成质量（FID）之间的关系，如下图所示，可以看到两者的正相关关系，这说明模型Gflops对最终的生成效果是至关重要的。
* VAR-2404.02905 视觉生成的自回归范式，实验结果超过扩散模型、观察到 scaling law
	* "Visual Autoregressive Modeling: Scalable Image Generation via Next-Scale Prediction", NeurIPS 2024 best paper
		* Tian, Keyu; Jiang, Yi; Yuan, Zehuan; Peng, Bingyue; Wang, Liwei; 
	* [2024-04-17](https://mp.weixin.qq.com/s/KOEdTgJX4Gga5zRbl57Yow)
		* PKU（王立威老师课题组）+ 字节合作，代码、权重已开源
		* 采用 next-scale (or next-resolution) prediction 方式，尺度内并行生成，尺度间串行生成；{_o4ha7y}
			> VAR 则「以人为本」，模仿人感知或人创造图像的逻辑顺序，使用从整体到细节的多尺度顺序逐渐生成 token map：
			> 除了更自然、更符合人类直觉，VAR 带来的另一个显著优势是大幅提高了生成速度：
			> 在自回归的每一步（每一个尺度内部），所有图像 token 是一次性并行生成的；跨尺度则是自回归的。
		> VAR 在第一阶段训练一个多尺度量化自动编码器（Multi-scale VQVAE），
			> 离散编码：编码器将图片转化为离散 token map R=(r1, r2, ..., rk)，分辨率从小到大
			> 连续化：r1 至 rk 先通过嵌入层转换为连续 feature map，再统一插值到 rk 对应最大分辨率，并求和
			> 连续解码：求和后的 feature map 经过解码器得到重建图片，并通过重建 + 感知 + 对抗三个损失混合训练；{_o4ha8t}
		> 在第二阶段训练一个与 GPT-2 结构一致（结合使用 AdaLN）的自回归 Transformer。
			> 自回归第一步是通过起始 token [S] 预测最初的 1x1 token map
			> 随后每一步，VAR 都基于历史所有的 token map 去预测下一个更大尺度的 token map；{_o4ha8l}
			> 训练阶段，VAR 使用标准的交叉熵损失监督这些 token map 的概率预测
			> 测试阶段，采样得到的 token map 会借助 VQVAE 进行连续化、插值求和、解码，从而得到最终生成的图像
		* 作者对创新性的描述
			> 作者表示，VAR 的自回归框架是全新的
			> 而具体技术方面则吸收了 RQ-VAE 的残差 VAE、{_o4ha5h}
			> StyleGAN 与 DiT 的 AdaLN、{_o4ha53}
			> PGGAN 的 progressive training 等一系列经典技术的长处。{_o4ha5n}
			> VAR 实际是站在巨人的肩膀上，聚焦于自回归算法本身的创新。
		> VAR 仅需 10 步自回归步骤，生成速度大幅超过 AR、Diffusion，甚至逼近 GAN 的高效率
	* 2024-04-17 组会讲过后群里的讨论见(('q4qg1h))
	* 2025-12-06 自行读原文后补充记录
		* 分辨率增长：指数但未必 2 为底 eqn(17)+1（> 中间尺度分辨率涉及取整？）
			* 源码中默认分辨率序列 (1, 2, 3, 4, 5, 6, 8, 10, 13, 16)
		* 残差学习：多尺度 VQVAE 我感觉像小波分解，每个尺度仅取残差，而非简单的超分辨率
		* （评）与传统小波区别：
			* 基底集合（单尺度内），小波为手动预设的正交基，本文为可学的大 codebook（容量 4096）
			* 基底组合方式（单尺度内），小波允许多基底线性组合，本文只允许选用一个 code、也不允许乘系数
				* 即：小波用线性子空间，本文用可学离散集合
				* 对各尺度残差集合的假设：Kolmogorov n-width 小 vs entropy-number 小；{_pc6g5q}
				* code 选取：本文源码同时支持 余弦相似度、距离 两种标准，见 models/quant.py 151
			* 单基底尺度，小波基底空间局域性较高，本文为 patch-size 而相对较大
		* 卷积修复：p6:0 上采样后为补偿信息损失，训了额外的卷积恢复网络修复；下采样不涉及可学网络
			* 编码阶段残差均只记录最细尺度的，各级新获取的编码结果都 上采样恢复原尺度、用卷积网络修复、再算残差
			* 卷积输出：最细尺度的残差（不是完整图像）
			* 尺度共享：源码支持该卷积修复网络 在不同尺度共享/独立/部分共享，通过 quant.py 中调整 quant_resi 定义方式
			* （源码）自回归解码的下一尺度输入：当前尺度各 token 独立采样，查码表得当前尺度结果，上采样插值到最细尺度，卷积修复，作为残差累积到最细尺度图像，下采样插值到下一尺度
				* 后处理细节：线性层转隐空间（VAE to Transformer），加位置编码，repeat 一份 class-free 版本（用于后续 cfg_ratio）
				* 注意 VAE 嵌入空间的这个向量不在其 VQ 码表中，因为对查表结果又做了一系列操作（上采样、卷积修复、累加、下采样）
				* 各 token 独立采样概率生成方式：Transformer 嵌入过线性层，生成向量长为词表大小
					* 不涉及比较码表嵌入、取最接近元素 的操作；本来码表里的嵌入向量也是在 VAE 的隐空间，而非 Transformer 的隐空间，无法直接比较
		* class 条件生成，sec4:2 同时作为 [BOS] token、网络 AdaLN
			* 源码 docstring 解释，为 ImageNet class label，未提供时网络自行随机采样
				* 特殊取值（源码中最后一个，即 num_classes）表示同时考虑所有 class；它也用于前传后 cfg_ratio 强化当前 class 的生成
			* （评）条件本身应该是表示为嵌入向量、维数同网络宽度 w，从而可作 [BOS]，且 eqn(8) AdaLN 参数量确实是 6w²（每层 6 个超网络，每个均为线性层，输入输出均 w）
		* 余弦注意力，sec4:2 QK 化为单位向量（> 类似 SWinV2；带可学 scale，原文未提及但源码有）
			* 未采用其他常见技巧：专注算法本身有效性，网络结构尽量简单，RoPE、SwiGLU、RMSNorm 均未采用
		* 规模扩展比例：sec4:2 仿照最早 scaling law 文章，深 d 时宽 64d、注意力头数 d、dropout-rate d/240
			* 学习率正比于 bsz，1e-4 per 256；{_pc6h65}
		* （源码）位置编码：APE，逐 token（不同尺度不同位置）独立可学
		* （源码）VAE 结构：解码器为例，低分辨率阶段还涉及自注意力
			* 输入阶段，卷积升维、ResNet block、Attn block、ResNet block
				* 注意力后无 FFN，功能可由 ResNet block 完成
			* 第一层，ResNet block、Attn block、上采样
			* 后续层，ResNet block、上采样；无注意力应该是因为时空分辨率变高后注意力计算量大
			* 上采样 实现为最近邻插值 + Conv2d
* Infinity-2412.04431 VAR 隐空间按位二值量化，训练加噪抑制自回归误差累积，预设多长宽比分桶训练
	* "Infinity: Scaling Bitwise AutoRegressive Modeling for High-Resolution Image Synthesis"
		* Han, Jian; Liu, Jinlai; Jiang, Yi; Yan, Bin; Zhang, Yuqi; Yuan, Zehuan; Peng, Bingyue; Liu, Xiaobing; 
		> created on 2025-11-25
	* [2025-01-03](https://mp.weixin.qq.com/s/e_IF9PsTstSiWLoUHvxiaQ)
		* 字节基于 VAR 的图像生成模型 Infinity，支持文生图、可变分辨率，已开源；2B、20B 开放网站体验
	* [知乎介绍](https://www.zhihu.com/question/6140103300/answer/54046749970)
	> 最终的量化特征是所有scale的量化特征上采样后（双线性插值后加额外卷积）的和：
		* $F_k=\sum_i^kup_i(R_i)$，最终 $F_K$ 送入 decoder
	* tokenizer
		* 背景：LFQ tokenizer，$z\mapsto sgn(z)$；{_pbpb6q}
			> Infinity相比VAR的最大的变动还是在tokenzier，
			> Infinity的tokenzier是采用了LFQ（Lookup-Free Quantizer）来量化特征，之前经典的VQ量化是需要去计算特征和codebook中所有code embedding之间的距离，并选择距离最近的code来量化。
			> 而LFQ是直接将特征按值的符号进行二值化量化：
			> LFQ在之前的谷歌的MAGVIT-v2首先使用。
			> LFQ相比VQ的一个优势是增大codebook，图像生成能力也同步提升，而之前的VQ如果采用过大的codebook会导致图像生成效果劣化。
		* 变种：BSQ tokenizer，LFQ 基础上再 scale 为单位向量 $sgn(z)/\sqrt d$
			* （评）另一知乎介绍中说是另一文章提出的
		* 训练时熵惩罚，单样本分布尽量确定、遍历所有样本的分布尽量分散；{_pbpb6f}
			* （评）我的理解是 $\mathbb{E}_xH(q(z|x))-H(q(z))$，其中 x 为网络输入（原文符号为 F）
			* （评）当时 MAGVIT-v2 已采用
			* 高维特征下 LFQ 会 OOM，而 BSQ 内存复杂度小，故最终采用 BSQ
		* 生成所用分类头，不视为 $2^h$-分类（显存占用过大），而视为 h 个 2-分类，通过算 $Wz$；有性能提升
			* （评）我感觉每个 2-分类只输出一个数表示概率就够了，但原文似乎还是输出了 2 个
	* BSC，针对自回归误差累积问题，通过加噪声（随机 flip 符号）解决；实测有效果提升；{_pbpb7h}
		> 除了tokenizer的优化，Infinity还设计了一种训练过程中数据增强策略Bitwise Self-Correction（简称BSC）。
		> BSC主要是为了解决AR模型训练过程中teacher-forcing来导致的训练和测试不一致问题。
			> 具体来说，对于VAR训练，每个scale的输入是根据GT图像计算的前面scale的累积特征，
			> 但是实际推理的时候，我们并没有GT图像，而且前面的scale预测也会出错，
			* 注：下面的知乎介绍2 的解释更清楚；不过本来也不难理解
		> 为了提升模型的容错能力，这里设计了一种BSC的数据增强策略。
		> 具体来说，我们会以一定概率翻转量化特征的某个位置的值，比如从1变成-1， 
		> 这个包含错误的特征用来作为下一个scale预测的输入，但是监督的GT没有变，所以模型能够学会自动纠错的能力。
	> 为了支持变分辨率生成，也采用了分桶的多尺度训练策略，{_pbpg3u}
		> 以及2D rope位置编码。{_pbpg5g}
		> 训练过程也采用多阶段训练策略：256 -> 512 -> 1024。这些应该都是常规策略。{_pbpg1z}
	* [知乎介绍2](https://zhuanlan.zhihu.com/p/11145240604)
	* teacher-forcing 自回归误差累积弱点，重新解释
		> 在训练自回归语言大模型的时候，对每个 token 来说，是以之前的所有 token 标注为条件生成并计算损失的。
		> 这篇论文说，视觉中的下一步尺度预测与语言中的下一词预测有很大的不同。
		> 具体来说，我们无法解码完整的图像，直到所有尺度的残差 Rk 都被获取到。
		> 论文发现，teacher-forcing 为视觉生成带来了严重的训练-测试差异。
		> 特别是使得 Transformer 只能在每个尺度上精炼特征，而没有能力识别和纠正错误。
		> 在前几个尺度上犯的错误会在后续尺度上被传播和放大，最终破坏生成的图像。
	* 变分辨率、变长宽比支持方式（略）
	* 2025-12-07 自行读原文记录
		* 文本条件：p4:-1 Flan-T5 文本嵌入，1. 投影为单个 [BOS] token，2. 中间层交叉注意力
		* sec3.1:-1 网络块结构：RoPE2D，自注意力，交叉注意力，FFN
		* BSC 比特翻转概率本身随机，从 [0,p] 均匀采样
		* （评）BSC 作为后续尺度生成条件，仅影响 Transformer 输入，不影响自注意力上文
			* 还算合理，因为造成问题的主要是各尺度输出层的二值化采样操作（对小扰动敏感），它只影响网络下一尺度输入；上文 KV 取值不受采样影响
			* 同时影响下一尺度 label，因各尺度量化向量取决于先前尺度残差，而这受人工扰动影响
		* 可变长宽比支持：仅预设一系列可用的图像分辨率 tbl10，分别设计其生成过程的分辨率序列
* InfinityStar-2511.04675 （备用）字节 VAR 视频生成
	* "InfinityStar: Unified Spacetime AutoRegressive Modeling for Visual Generation", NeurIPS 2025 oral
		* Liu, Jinlai; Han, Jian; Yan, Bin; Wu, Hui; Zhu, Fengda; Wang, Xing; Jiang, Yi; Peng, Bingyue; Yuan, Zehuan; 
		> created on 2025-11-26
		* [公众号报道](https://mp.weixin.qq.com/s/IZb4h4JeVDsRTwautceYrQ)
	* 时间建模：时空统一、均多尺度导致闪烁，故仅对空间用多尺度生成 sec3.2:1
		* 首帧独立：根据文本先生成首帧静止图片，后续每次生成相同持续时间，按时间自回归推进 sec3.2:2
			* 目的：1. 充分利用文生图任务先验，2. 外观与运动解耦，避免同时生成引入的困难
			* 单帧编码：VAE 编解码似乎不考虑时间维度；时间块生成阶段是 T 个时间步的 token 同时生成，而非把这些时间打包进相同 token
				* 注：仍待确认；有可能是 VAE 也做了部分时间压缩，只是压得不完全
		* 时间上文：fig4 视频每个时间切片只依据上一时间切片结果，看不到更早的时间切片
	* tokenizer：基于预训练的连续版视频 VAE 微调，明显好于从头训离散视频 VAE p5:1
		* 量化操作未引入额外参数（因为用的是 BSQ 而非普通 VQ）
		* 连续 VAE 引入量化模块后，即使不微调也能较好地重建视频
		* 微调所用 loss 不同于原连续 VAE，之前是 KL，现在换成 commitment loss + 熵惩罚
	* tokenizer 多尺度：随机深度，最后若干尺度独立随机丢弃
		* 原问题：细尺度 token 多，网络大量表达力都集中到最后几个尺度，前几个尺度不起作用
	* sec5 长视频交互式生成，接受新文本指令生成视频的下一段内容
		* 时间块 Markov：长视频切成若干 5s 块，每次依据前一块预测后一块 sec5.1:1
			* 原文称为“sliding window method”
		* 首帧条件：每次生成的条件包括 全视频首帧图像 + 前一时间块生成结果
			* 引入全视频首帧（不是上一时间块首帧）可缓解多轮生成的 drift
		* 前块条件：为减上文 token 数，语义、细节分别引入，前者空间下采样，后者仅保留最后 K 帧
			*  sec5.3:1 前者步长 $\sqrt{32}$，后者 K=2；480P 视频情形上文 token 33.6K → 5.8K
		* 数据准备，视频块的文本标注：sec5.2:1 先字幕标注模型为各视频块独立生成描述，再 LLM 改写使后块描述仅涉及变化、去除与前块重复的描述
			* 另有 LLM 提高描述多样性
* TTS-VAR-2507.18537
	* "TTS-VAR: A Test-Time Scaling Framework for Visual Auto-Regressive Generation" by 阿里, NeurIPS 2025
		* Chen, Zhekai; Chu, Ruihang; Chen, Yukang; Zhang, Shiwei; Wei, Yujie; Zhang, Yingya; Liu, Xihui; 
		> created on 2025-12-09
	* 摘要摘录
		> 提出了TTS-VAR，这是视觉自回归（VAR）模型的第一个通用测试时间缩放框架，将生成过程建模为路径搜索问题。
		> 为了动态平衡计算效率和探索能力，我们首先在因果生成过程中引入了一种自适应的递减批量调度。{_q51c2o}
		> 此外，受VAR从粗到细的分层多尺度生成的启发，我们的框架集成了两个关键组件：
		> （i）在粗尺度上，我们观察到生成的令牌难以评估，可能会导致错误接受劣质样本或拒绝优质样本。
			> 注意到粗尺度包含足够的结构信息，我们提出了基于聚类的多样性搜索。{_q51c2c}
			> 它通过语义特征聚类保留了结构多样性，使以后能够选择具有更高潜力的样本。
		> （ii）在精细尺度下，基于重采样的潜在选择使用潜在分数对有前途的候选人进行优先级排序，潜在分数被定义为包含多尺度生成历史的奖励函数。
		> 关键见解表明，早期结构特征有效地影响了最终质量，重采样效率在不同代尺度上有所不同。
* 万字长文带你全面解读视觉大模型
	* [2024-04-27](https://www.hfuu.edu.cn/CVPR/ce/98/c10439a118424/page.htm)
	> 该术语首次由Bommasani等人在《Stanford Institute for Human-Centered AI》中引入。基础模型定义为“通过自监督或半监督方式在大规模数据上训练的模型，可以适应其它多个下游任务”。{_o4r031}
	* FLIP：在 CLIP 上加 mask；{_o4tl74}
		> FLIP 是一种简单和更有效的训练 CLIP 的方法，其思想很简单，如图所示，
		> 就是将 MAE 的 Mask 操作引入到 CLIP 上，随机地 mask 掉具有高 mask 率的图像碎片，只对可见的碎片进行编码。
		> 不同之处在于，这里不会对被 masked 的图像内容进行重建。
		> 此外，对于文本也做同样处理，有点类似于 BERT 但又不一样，BERT 是用学习过的 mask token 来代替它们，这种稀疏的计算可以显著减少文本编码的成本。
* 2106.14881 ViT patchify 操作换成卷积性能更好，优化更简单
	* "Early Convolutions Help Transformers See Better" by FAIR
		* Xiao, Tete; Singh, Mannat; Mintun, Eric; Darrell, Trevor; Dollár, Piotr; Girshick, Ross; 
		> created on 2025-06-16
	* [他人的知乎介绍](https://zhuanlan.zhihu.com/p/385140954)
	> 之前的一些研究发现，ViT的优化要求十分苛刻，不仅需要精确的learning rate和weight decay，还需要使用AdamW优化器，并且收敛非常的慢。
	> MoCov3通过绘制first layer和last layer的梯度范数，发现first layer的尖峰出现的比last layer更早，{_p6ga1p}
		> 从而推测出patch projection是产生衰退的关键，
		> 于是通过固定住patch projection(即本文的patchify stem)的参数，缓解了衰退现象。{_p6ga0u}
	> 用convoluational stem替换patchify stem后，大约使用5个convolution就可以在SGD优化器上优化，精度不会大幅度下降，并且对于learning rate和weight decay参数不敏感，训练的收敛速度更快。
	> 为了跟patchify stem的输出维度对齐，convolutional stem通过3x3卷积快速下采样到14x14。{_p6ga0o}
		> 具体的，设置4个3x3大小，步长为2的卷积和一个1x1，步长为1的卷积，至少需要5个卷积，convolutional stem的输出可以和patchify stem的输出维度保持一致。
		> 为了使 ViT_C 和 ViT_P 总体计算量保持一致，ViT_C 通过改变通道数保证convolutional stem的计算量约等于1个 transformer block，然后减去后面的一个transformer block。
* 知乎讨论：ViT image patch 设计为不重叠的动机
	* [2025-06-16](https://www.zhihu.com/question/464968595)
	* （评）以下内容主要在非科研笔记中引用
	* cloud erow 回答
		> 因为ViT有更大的野心，ViT的目的不是提出一个SOTA的模型，而是创建fundamental model。
		* 引入卷积方式很多
			> 引入卷积可以很简单，也可以很复杂。
			> 简单的在transformer之前放一个CNN，也可以像Swim/hiera一样借用CNN的思想。
			> 总之可以讨论的东西很多，也可以取得更好的结果，但更好的结果不意味着更大的贡献。
		* 已有 A，提出 B 是开启新范式，而提出 A+B 只是刷 SOTA；{_p6ga5c}
			> 假如有一个成功的工作A，你提出了一个新的工作B。
			> 那么A+B>A，能说明你提出了一个比A更好的模型，作出了更大的贡献么？怎么证明（A+B)中是B起到了决定性作用？又凭什么说你的工作不是排列组合罢了？
			> 所以说(B>A)的贡献是大于（A+B>A），哪怕B<A+B。
		* 人为加大任务难度，便于体现优越性
			> 不利于表示学习就对了，就是要挑战一下图像的软肋，才能证明ViT的优越性。
			> 好比前面有座山，如果你能沿着最陡的路直接往上爬都能到山顶，那随便换条路径爬不是轻而易举？所以ViT把模型设计中最难的部分解决了以后，各种改动都轻而易举。
		* 可拓展性，便于后续 masking 等工作；{_p6ga5y}
			> 不妨这么想，假如最开始出现的是Conv+ViT，那么masking的难度是不是就增加了，MIM的研究反而被拖慢了。
			* 生成任务类似
	* 陀飞轮 回答
		* 宣传为不用卷积的 Transformer 架构，故 patch 不重叠以避嫌
		* 直观、无计算浪费
		* 传统视觉启发
* CPE-2102.10882 ViT 动态位置编码，根据邻域信息生成（而非根据 patch 位置）
	* "Conditional Positional Encodings for Vision Transformers"
		* Chu, Xiangxiang; Tian, Zhi; Zhang, Bo; Wang, Xinlong; Shen, Chunhua; by 美团
		> created on 2025-10-18
	* [知乎介绍](https://zhuanlan.zhihu.com/p/692757575)
	> 论文提出了一种新的ViT位置编码CPE，基于每个token的局部邻域信息动态地生成对应位置编码。{_paig05}
	> CPE由卷积实现，使得模型融合CNN和Transfomer的优点，不仅可以处理较长的输入序列，也可以在视觉任务中保持理想的平移不变性。
	> 从实验结果来看，基于CPE的CPVT比以前的位置编码方法效果更好
	* 引入动机
		> 加入位置编码后，绝对位置编码使得Transformer缺乏图像处理所需的平移不变性。
		> 如果采用相对位置编码，不仅带来额外的计算成本，还要修改Transformer的标准实现。
		> 而且在图像处理中，相对位置编码的效果没有绝对位置编码好。{_paif9v}

## Transformer 架构
* `Sinkformers-2110.11773` Transformer 机理与改进：单样本无穷深前传动力学形如梯度流，进一步无穷 patch 平均场极限为 diffusion；改进算法将 softmax 换为 Sinkhorn，列也归一化
	* "Sinkformers: Transformers with Doubly Stochastic Attention"
		> recommended at `2022-04-01`(CSImeet2)
	* eqn(3) Sinkhorn 算法：给定 $C\in\R^{n\times n}$，对 $K^0=\exp(C)$ 交替做行、列的归一化，最终得到 $K=K^\infty$ 为双随机矩阵，$K1=K^\mathrm{T}1=1$
		> 按原版 Transformer softmax 定义，取的 exp 是逐元素（而非矩阵指数），然后只做行平均
	* eqn(4) Transformer 迭代格式改为 $x_i=x_i+\sum_jK_{ij}^\infty W_Vx_j$
		* 原版 Transformer 用 softmax $K^1$；实践中 Sinkformer 用 $K^l$，$l$ 取 3-5 即可，不是主要计算瓶颈
		* 合理性：随 epoch 增加，行随机将趋于双随机，有证明，故干脆直接引入该先验
	* prop1 Sinkhorn 中将 $C$ 换为 $C+1f^\mathrm{T}+g1^\mathrm{T}$ 结果不变，故可用 $\tilde C_{ij}=-\|W_Qx_i-W_vx_j\|^2/2$ 代替原来的 $C_{ij}=(W_Qx_i)^\mathrm{T}(W_Vx_j)$
	* sec4 attention and gradient flow，前传过程中单样本的动力学由 Wasserstein 度量下的梯度流给出
		* sec4:2 连续行为定义 $c(x,x')$ 使 $c(x_i,x_j)=C_{ij}$，进而定义 kernel $k^l(-,-)$
		* 无穷小步长后 eqn(5) 概率分布 $\mu(x)$ 演化满足的 PDE
	* sec5 attention and diffusion，平均场极限下 $\mu(x)$ 由密度函数 $\rho(x)$ 给出，推其 PDE
		* thm1 Sinkformer/prop4 Transformer 在此时的 PDE
	* 实验包括 NLP，ViT；在 3D 点云分类任务上提升明显
	> 讨论时提到还可考虑的极限是样本量趋于无穷，本文仅 1
	* （评）相关框架 ((n32b5g))NN架构解读
* [Transformer为完全图GNN](https://mp.weixin.qq.com/s/N1I4mGKzsHJiAluZL17sDQ)
	> created on 2022-04-01
	* 来自英文博客翻译，文末指路先前将 Transformer 与 GNN 统一的视频/论文
	* 随机初始化会破坏学习过程的稳定性：用多头注意力解决，从本质上“对冲赌注”
	* 除了 LayerNorm 外，控制特征大小尺度的技巧：position-wise 2 层 MLP，升维、投影回原维度再归一化
		> (?)
	* 图注意力网络 (GAT)；句子是完全联通的词图，Transformer 为多头注意力 GNN
	* 相互学习的可能性：
		* Transformer 的针对特定问题的技巧 —— 比如位置编码、因果/隐藏聚合、学习率策略和预训练
		* 长序列问题，NLP 社区：让注意力力机制变得稀疏或者可以自适应输入的大小，对每一层添加递归或压缩，使用局部敏感哈希来获得有效的注意力；{_n7db7g}
		* 长序列 GNN 社区：划分二部图的方式用于句子图稀疏化；{_o2cg0z}
	* 关于多头注意力：
		* 更赞同多头机制的优化视图 —— 拥有多个注意力头改进了学习并克服了错误的随机初始化
		* GNN 也用到：GAT使用相同的多头注意力和MoNet使用多个高斯核聚合特征
		* 有简单聚合函数(如sum或max)的GNN不需要多个聚合头进行稳定的训练；ConvNet 试图在 NLP 中干类似的事
	* （评）相关：`ViG-2206.00272` 图像处理网络，也是每个 patch 为一个顶点，但非完全图，只根据顶点特征 kNN 连有向边，前传每层重新算连接方式
* `2207.09238` （备用）以完备的、数学上精确的方式描述 Transformer；有之前工作应该而未提供的伪代码
	* "Formal Algorithms for Transformers" by DeepMind
		> recommended at 2022-07-21, CSImeet
	* 他人介绍：本文涵盖了什么是 Transformer、Transformer 如何训练、Transformer 被用来做什么、Transformer 关键架构组件以及比较出名的模型预览。
		* 主体部分是第 3-8 章，分别介绍了 Transformer 及其典型任务、tokenization、Transformer 的架构组成、Transformer 的训练和推理、实际应用。
		* 论文中基本完整的伪代码大约有 50 行，而实际的真实源代码则有数千行
		* 论文中表述算法的伪代码适用于需要紧凑、完整和精确公式的理论研究者、从头实现 Transformer 的实验研究人员，同时对使用形式 Transformer 算法扩充论文或教科书也大有裨益。
* （备用）Transformer 作为图灵完备NN；{_n3ud8m}
	* [2023-03-09](https://zhuanlan.zhihu.com/p/608332647)
* （备用）知乎问题：为什么现在的LLM都是Decoder only的架构？
	* [2023-04-28](https://www.zhihu.com/question/588325646/)
	* （某回答）encoder 双向注意力存在低秩问题，可能削弱模型表达能力；而纯 decoder 上三角矩阵保证可逆；{_n4se6s}
		> 就生成任务而言，引入双向注意力并无实质好处。
		> 而Encoder-Decoder架构之所以能够在某些场景下表现更好，大概只是因为它多了一倍参数。{_n4se6w}
		> 所以，在同等参数量、同等推理成本下，Decoder-only架构就是最优选择了。
* Transformer 输入长度扩展到百万 token（有损）2304.11062，用 RMT；{_n4pl47}
	* [2023-04-25](https://mp.weixin.qq.com/s/qbB278u5lthl1kkrtGwxag)
* Transformer 不再用 tokenizer，按固定长度字符组合训，结合字符内部预测解码器 MegaByte-2305.07185；{_n5im3j}
	* [2023-05-18](https://mp.weixin.qq.com/s/GLZ7JgxpFL0jjNmA11xp8w)
	* Meta AI 提出
	> MEGABYTE 模型由三部分组成：
	> patch 嵌入器，它通过无损地连接每个字节的嵌入来简单地编码 patch；
	> 全局模块 —— 带有输入和输出 patch 表征的大型自回归 transformer；
	> 局部模块 —— 一个小型自回归模型，可预测 patch 中的字节。
* （备用）世界的参数倒影：为何GPT通过Next Token Prediction可以产生智能
	* [2023-06-10](https://zhuanlan.zhihu.com/p/632795115)
	* OpenAI “压缩即智能”的观点，数据压缩假想实验，结合算术编码得到无损压缩；{_n6sf7d}
		> 如果GPT模型生成Ground Truth 的生成概率越高，则其在算术编码分割区间中占据的长度就越长，就越容易找到更短的算术编码，这意味着模型压缩率越高。也就是说，如果GPT模型智能程度越高，NTP预测得越准确，则其压缩效率就越高。
	* 分析 GPT1 知识提取过程，特定例子下的各层注意力强度
	* OpenAI 首席科学家回忆，LSTM 预测下一个单词时即学出“情绪”神经元，推动其之后在模型、数据上扩大规模
		> OpenAI首席科学家Ilya Sutskever在访谈中曾说： “我们训练LSTM来预测亚马逊评论的下一个字符(NTP)时发现，如果你预测下一个字符足够好，LSTM就会有一个与情绪对应的神经元。这就很好地展示了无监督学习的效果，也验证了下一个字符预测的想法。这个发现对我们的影响很大。”
		> 我理解这里说的在网络中出现了与情绪对应的神经元，大概是通过NTP训练任务，在模型内部形成了一个情感判断的知识回路。这个发现（可参考：Learning to Generate Reviews and Discovering Sentiment），确实是后来推动OpenAI把LSTM换成更大规模的Transformer，并在更多数据上采用NTP来进行预训练的重要启发因素。
	* 回路竞争猜想，子回路复用等
		> 所谓“回路竞争”猜想，我们用上图例子来说明。假设我们输入一个Prompt，这个Prompt本来是要完成红色任务的，当输入Prompt后，在信息从底层向上层逐层激发正确通路的时候，越是底层的知识点和子回路，复用性越强，所以容易产生“过剩激发现象”，就是除了激发出我们希望的红色任务外，也会激发很多导向其它任务回路的知识点和子回路。
		> 这种情况在底层较为明显，随着信息逐步往上传递，红色回路会逐渐得到进一步的强化，非正确回路被激发的上层知识点和子回路越来越少，最终勾勒出了正确的红色任务回路的路径。这就是典型的“回路竞争”猜想的思路。
		> 越是复杂的任务，因为其牵涉到的知识点和子回路越多，相互之间的关系越复杂，所以越容易和更多其它相似任务回路产生重叠，也就越容易在回路竞争中失败。
	* 大 LLM 与小 LLM 差异
		> 很多研究结论证明了随着模型规模增大，模型稀疏程度越来越高。Polysemantic神经元对特征编码是稠密的，用于编码大量相对具体的特征，而Monosemantic神经元属于单神经元表征是稀疏的，
		> 这说明随着模型规模越来越大，单语义神经元数量占比增加。单语义神经元编码重要的及抽象的知识，既然单语义神经元数量增加了，说明模型学到的知识点肯定是增加了，
		* 知识量增加的两种来源：学到新知识（其中事件知识可用单语义神经元编码，另有“质数”等抽象知识），抽象特征的特征分裂（单个粗粒度抽象知识点 变为 一系列表征的知识点）
	* 不认为“评价指标不合理”能完全解释涌现；猜测小模型未建立激发回路；{_n6an2m}
		> 两种可能：一种可能是对小模型来说，这个任务对应的激发回路没有建立起来，而大语言模型建立起来了；另一种可能是小模型这个任务对应的回路也建立起来了，但是在回路竞争中非常容易失败，导致看似做不了这个任务。
		> 我更倾向认为是第一种可能造成我们目前看到的模型“涌现能力”。
		> 小模型应该在建立某些任务的完整激发回路存在困难，这些困难可能体现在几个方面：比如对形成回路很关键的某个或者某些，比较抽象的概念知识点，小模型因为抽象能力比较弱，没有建立起这个知识点（类似本文开头举的“质数”概念的例子）；再比如，一般能体现涌现能力的任务都比较复杂，小模型在建立复杂通路方面能力不足。
	* 回路竞争 视角下的 CoT；上下文学习中的例子帮助激活正确任务回路，对之后的输入形成引导
		> 输入中给出的n个例子的作用，在于激活了LLM模型对应的在预训练阶段学到的任务回路，然后再输入x，就容易沿着这条被激活的通路走，形成正确输出y。
		> COT作用应该类似，也就是说，如果你不用COT，可能LLM激活的是某个简单结构的任务回路，而如果用了COT例子，则容易激活了有很多细节表征的复杂推理回路，导致之后的输入也沿着这个子通路走，于是形成详细推理步骤。
* OpenAI 新加入研究员希望 RL 整合入 LLM 推理，像 AlphaGo 一样提高推断成本、同时提高性能；{_n77l2i}
	* [2023-07-07](https://mp.weixin.qq.com/s/Bl9i8ae7meNcKf5GFxvkAw)
	* 研究背景，计算博弈论 + AI，针对不完美信息、多智能体环境推理；{_n77k3c}
		> 德扑 AI 作者 Noam Brown 在推特上宣布，自己已经加入 OpenAI，将专注于通用的强化学习研究，目标是打造比 GPT-4 好 1000 倍的大语言模型。
		> 此前，Noam Brown 致力于结合计算博弈论和机器学习来开发能够在不完美信息多智能体环境中进行策略推理的 AI 系统，
		>  ……公开了长达 230 页的超硬核博士论文《大型对抗性不完美信息博弈的均衡发现》。在该论文中，Noam Brown 详述了大型对抗性不完美信息博弈中均衡计算的一系列进展。
	* 训练时间、推断时间 tradeoff，已有经验包括围棋、扑克等场景；推理成本或增若干量级，但收益可能巨大
		* 围棋
			> AlphaGo 击败了李世石，是人工智能的一个里程碑，其中的关键是 AI 在每一步棋之前都要「思考」1 分钟的能力。
			> 这对它的提升有多大影响呢？对于 AlphaGoZero 来说，这相当于将预训练扩大了约 100,000 倍。{_n77l06}
		* 扑克
			> 同样在 2016 年，我在扑克中观察到了类似的现象。
			> 这一洞察最终使得 Libratus 扑克 AI 首次击败了顶级人类玩家。
		> 后来，Andy L. Jones 在 Hex 中详细调查了训练时间 / 测试时间的计算 tradeoff，也发现了类似的模式。{_n77l00}
		* 当前研究方向潜在价值，高推理成本的高收益
			> 此前所有这些的方法都是针对游戏的，而如果我们能发现一个通用的版本，意义可能是巨大的。
			> 是的，可能推理会慢 1000 倍，可能成本更高。但如果是发现一种新的癌症药物，或者证明黎曼假设，我们会在意支付多少推理成本吗？
			> 改进能力总是有风险的，如果这项研究成功了，它对安全研究也是有价值的。想象一下，能够在推理上花费 100 万美元，看看能力更强的未来模型可能是什么样子。
	* 另：DeepMind Gemini 也声称会从 AlphaGo 中汲取技术
		> Hassabis 表示，Gemini 将结合 AlphaGo 的技术与大语言模型的能力，赋予系统更强的规划或解决问题的能力，
	* 已有的提高推理时间、提高性能的相关工作
		> Voyager 是一种推理时间算法，它使智能体能够不断地编写代码，并在 Minecraft 中引导其技能。{_n77l1l}
		> 思维树（Tree of Thought）将搜索与 LLM 的上下文能力相结合，以提高推理能力。{_n77l0p}
* DoT-2409.10038 姚期智的 DAG of thought 推理机制，并基于范畴论给出算法形式化描述
	* "On the Diagram of Thought"
		* Zhang, Yifan; Yuan, Yang; Yao, Andrew Chi-Chih; 
		> created on 2024-09-24
	* [公众号报道](https://mp.weixin.qq.com/s/pzn802jOIHeL0L9L_yaytw)
		> 其框架内部管理三个关键角色：
			> 提议者：生成命题或推理步骤，添加新节点。
			> 批评者：评估命题，识别错误、不一致或逻辑谬误，并添加批评节点。
			> 总结者：将经过验证的命题综合成一个连贯的思维链，有效地执行DAG的拓扑排序（topological sort）以产出最终的推理输出。
		* 3 角色通过特殊 token `<proposer>,<critic>,<summarizer>` 分隔，用单一模型完成；{_o9of58}
		* 相比之下，一年前的前序工作 CR 由 3 个不同模型完成；{_o9of7d}
			> 一年前的差不多同一时间姚期智院士领衔提出了累积推理（Cumulative Reasoning，CR）的方法。
			> 当时CR协调了一个涉及不同专业化大语言模型的迭代过程，由不同模型承担了提议者、验证者和报告者角色。
			> 而DoT直接在单一模型内构建有向无环图，不依赖于外部控制机制或多个模型，训练和部署更简单。
			> 且在DoT中，模型生成的批评反馈是自然语言形式的，而不是像CR那样只给出二值信号。
			> 这使得模型可以接收到关于错误的详细解释，有助于更有效地改进命题。
		* 推理过程描述
			> 推理过程始于提议者引入一个命题，向DAG添加一个节点。
			> 然后，由评论者评估验证或提供批评。如果提供了批评，将添加一个新节点，并在该命题和批评之间建立一个边。
			> 基于批评，提议者生成一个精炼改进过的命题，表示为DAG中的一个新节点。
			> 这一过程重复进行，命题不断被精炼直到得到验证。
			> 一旦建立了足够有效的命题，总结者就会综合这些推理，对DAG进行拓扑排序以产生一个连贯的思维链。
		* 靠 SFT（而非纯粹 prompt）掌握 DoT 能力；{_o9of7o}
			> DoT的训练涉及使用格式化为DoT结构的训练样例，包括角色特定token和DAG表示。
			* 注：SFT 是我的推测，我觉得应该不是从头训练
		* 基于范畴论（原文 topos theory），对推理过程进行形式化描述；{_o9of5x}
			> 在这个框架中，命题被建模为拓扑中终对象的子对象，
			> 逻辑关系和推理步骤表示为态射，
			> 批评和改进过程分别对应到子对象分类器的态射和命题间的态射。
			> 通过引入PreNet范畴，他们还成功捕捉了推理过程的动态和并发特性。
* 谷歌 AlphaCode2 机制
	* [2023-12-07](https://mp.weixin.qq.com/s/kmM0_6qbhRdBfmA1nD79QQ)
	> AlphaCode 2的运作依托于强大的LLM，并结合了专为竞赛编程设计的先进搜索和重排机制。
	> 如下图所示，新的模型主要由以下几部分组成：{_nc7n84}
		> - 多个策略模型，用于为每个问题生成各自的代码样本；
		> - 采样机制，能够生成多样化的代码样本，以在可能的程序解决方案中进行搜索；
		> - 过滤机制，移除那些不符合问题描述的代码样本；
		> - 聚类算法，将语义上相似的代码样本进行分组，以减少重复；
		> - 评分模型，用于从10个代码样本集群中筛选出最优解。
	> 详情可参阅Alpha Code 2技术报告：[报告地址](https://storage.googleapis.com/deepmind-media/AlphaCode2/AlphaCode2_Tech_Report.pdf)
* GPT-4内幕大泄露！1.8万亿巨量参数，13万亿token训练，斥资6300万美元
	* [2023-07-11](https://mp.weixin.qq.com/s/iqvdcnwl4pR4jDXn57Yg8Q)
	* 并行策略，内存、通信带宽考量等（见原文）；{_n7be7v}
	* MoE
		> 具体而言，GPT-4拥有16个专家模型，每个MLP专家大约有1110亿个参数。其中，有两个专家模型被用于前向传播。{_n7bg3m}
			> 虽然文献中大量讨论了选择每个token指向哪些专家的高级算法，但是据说，OpenAI用于GPT-4的算法，其实非常简单。
			> 此外，模型中还有大约550亿个参数，被用做注意力机制的共享。
			> 在每次的前向传播推理（生成一个token）中，GPT-4只需要使用大约2800亿参数和560TFLOPs。
		> 研究人员已经证明，使用64-128个专家模型比使用16个专家模型能够获得更好的损失情况，但这仅仅是研究结果。{_n7bg4j}
			> 采用相对比较少的专家模型的原因很多，OpenAI选择16个专家的原因之一是因为在许多任务上更多的专家模型很难泛化。
			> 使用更多的专家模型也更难实现收敛。
	* 推测解码（Speculative Decoding），在复杂任务速度变慢；{_n7bg6x}
		> 爆料者通过DeepMind的一项研究「Accelerating LLM Inference with Staged Speculative Decoding」中的文本，进行了适当修改/添加一些细节，进行了解释。
		* prefill（用户输入的 prompt）可并行处理，但 decode（模型输出）必须串行，较慢；{_n7bg5v}
			> 这就是为什么OpenAI的API调用中，输入token比输出token便宜得多的原因。
		> 「推测解码」的基本思想是使用一个更小、更快的草案模型提前解码多个token，然后将它们作为一个批输入到预测模型中。
			> 如果草案模型的预测是正确的，即更大的模型也同意这些预测，那么可以使用单个批解码多个token，这样可以节省大量的内存带宽和时间。
			> 然而，如果更大的模型拒绝了草案模型预测的token，则剩余的批将被丢弃，算法自然会恢复到标准的逐个token解码。
		> 「推测解码」以计算换取带宽，而成为一个有吸引力的性能工程目标有两个关键原因：
			> 首先，它不会降低模型质量。
			> 其次，它提供的性能改进通常与其他方法正交，因为其性能来自于将「顺序执行」转换为「并行执行」。
		> 爆料者认为，如果OpenAI使用「推测解码」，他们可能只在大约4个token的序列中使用。
		> 有关OpenAI阉割，而导致GPT-4质量降低的整个阴谋，可能只是因为他们让预测模型接受了「推测解码」模型的低概率序列。
	> GPT-4多模态能力是在文本预训练之后，又用大约2万亿token进⾏了微调。
		* 主要因为当时多模态技术不成熟，GPT5 预计 from-scratch 多模态
* （备用）Andrej Karpathy 关于推测解码的介绍；{_n91g7i}
	* [2023-09-01](https://mp.weixin.qq.com/s/0W_DghcL22tEJK3NfzTyQg)
* 主张修改掉注意力中 softmax 为 softmax1，所得 QuietAttention 允许关闭所有通道的注意力
	* [2023-07-25](https://mp.weixin.qq.com/s/cSwWapqFhxu9zafzPUeVEw)
	* LLM 可压缩性中遇到的问题：出现不常见的异常大权重值
		> 举例来说，在 LLM 上下文中，扭曲产生的原因是对非语义 token（逗号等）进行大量加权导致的，这些较高的权重成为难以压缩的异常值，使得研究变得更加困难。
		> 来自高通的 AI 研究员也发现了这一现象，在 LLM 中，97% 以上的异常激活发生在空格和标点符号位置上。
	> 使用 softmax 的问题在于，它强制每个注意力头进行注释，即使没有信息可添加到输出向量中。
	* $softmax1(x)_i=\exp(x_i)/(1+\sum_j\exp(x_j))$，相比原始 softmax 多了分母的 +1；{_n7pe3s}
		* 等价于 $x$ 中多一个固定输出 0 的分量，故之前曾考虑过命名为 ghostmax
	> 如果想要的话，这可以让该向量作为一个趋于 0 的整体。
	> 否则只会将值缩小一点，并且缩小的值会在归一化过程中得到补偿，这在注意力之后发生。
* DeepNet，将 Transformer 加深到 1k 层、并避免训练不稳定问题；{_n8kh5m}
	* 作者解读
		* [2023-08-20](https://kexue.fm/archives/8978)
		* （评）本解读或比原论文更有参考价值
			> 原论文的完整分析比较长，而且有些假设或者描述细酌之下是不够合理的。所以在本文的分享中，笔者会尽量修正这些问题，试图以一个更合理的方式来得到类似结果。
			> 原论文的说法是“我们在SGD上进行推导，然后在Adam上验证发现也还可以”，但从理论上来讲，它们并不完全通用，这一节我们就来针对性地做一下分析。
		* DeepNorm 涉及超参数 $\alpha$，如何选取
			* 网络初始化方式导出¹标量值 $\lambda$
				* ¹在文章开头有说明，$W=\lambda U$，使 $U$ 尽量接近正交矩阵
			* eqn(13)+1 希望 $\lambda/\alpha=1/\sqrt{2N}$
				* 与原论文的结果同阶，但系数由 4 换为 2，因为这里的放缩更精细
			* 考虑 $\alpha$ 与网络初始化联合选取：
				* eqn(14)-1 原论文设 $\lambda\alpha=1$，可导出二者取值
				* 本文又给了两个另解，各有特点
			* 还要与优化器联合选取，以上分析仅针对 SGD；eqn(15)+1 列表给出 Adam、LAMB 优化器下的选取方式；{_nbqg2o}
	* 作者的讨论：为何需要残差
		* [2023-08-20](https://kexue.fm/archives/8994)
		* 深度模型不易训练原因：除了梯度消失、爆炸以外，还有 “增量爆炸”
			> 很多读者的答案应该是梯度消失或梯度爆炸。这确实是两个很重要的问题，然而配合特定的初始化方法和Normalization技术，我们已经可以将普通前馈神经网络的梯度做得很稳定了，但即便如此训练深层前馈神经网络依然不容易。这说明其中的原因不仅有梯度消失/爆炸，还有别的问题，它就是我们在《训练1000层的Transformer究竟有什么困难？》中已经讨论过的“增量爆炸”。
		* 注：以下记号与原文有区别，我用 $L$ 表示深度
		* 推导，损失函数更新量 $\Delta l\approx\langle\nabla_\theta l,\Delta\theta\rangle$，SGD（$\Delta\theta=-\eta\nabla_\theta l$）下 $\Delta l\approx-\eta\|\nabla_\theta l\|^2$
			* 若能解决梯度消失/爆炸问题，每参数梯度 O(1) 量级，从而 $\Delta l$ 正比于参数量、正比于深度
			* （评）同时也正比于宽度，加宽是不是也应该提高训练难度？
			* 注：依赖于 SGD，后文提到 Adam 等 $\Delta l$ 为一次而非二次
		* 治标的 warmup：{_n8kh0j}
			> 初始阶段先用极小的学习率，然后再慢慢增大，避免在初始阶段学习过快。待模型平稳渡过初始阶段的“危险期”后，就可以正常训练了。
			> 尽管Wamrup能起到一定的作用，但其实是“治标不治本”的，因为“参数的微小变化就会导致损失函数的大变化”意味着模型本身的抖动很大，用更专业的话说就是模型的landscape极度不平滑了，
			> 这不是一个好模型应该具备的性质。因此，我们应该通过修改模型来解决这个问题，而不是通过降低学习率这种“表面”方法。
		* 希望修改模型，每个参数的梯度要随着层数的增多而变小，$O(1/\sqrt L)$。
		* 深层 FFN 不好训：梯度消失/爆炸 与 增量爆炸 问题无法同时解决，推导；{_n8kh1i}
			>  只要它前向传播稳定了，那么反向传播也就固定了，无法使得梯度跟层数相关。
			>  因此，我们顶多可以解决深层前馈神经网络的梯度消失和梯度爆炸问题，但无法解决本文开头提到的“增量爆炸”问题，因此深层前馈神经网络必然不好训练。
		* 针对残差网络 $x_+=x+\epsilon f(x;\theta)$
			* 增量不爆炸条件，推导梯度表达式，得 $\epsilon=O(1/\sqrt L)$
			* 反传稳定条件，1D 情形 $(1+\epsilon)^L$ 应有 $\epsilon=O(1/L)$；{_n8kh1o}
				* 高维（宽网络）情形有所改观：只考虑乘向量结果，有近似正交性质，每层放大比例 $(1+\epsilon^2)$ 而非 $(1+\epsilon)$，此时 $\epsilon=O(1/\sqrt L)$ 仍够用
				* 推导见 SRS 的 ((n8kg3i))
* LayerNorm 的各种改进变种
	* [2023-11-26](https://zhuanlan.zhihu.com/p/657659526)
	* pre-LN 比 post-LN 好训练原因：后者易导致梯度消失；{_nbqf5i}
		* 梯度消失原因：恒等分支参与归一化，残差连接幅值被降低，嵌套多层后幅值严重衰减，无法发挥直接回传梯度功能
		* 注：SRS 中位置((nbqf74))
	* 解释 pre-LN 表达能力相对有限：层数大时，加新层相当于加宽（后面没放完）；{_nbqf6v}
* （备用）混合精度下位置编码竟有大坑，LLaMA等主流开源模型纷纷中招 - 知乎；{_n8un4u}
	* [2023-08-30](https://zhuanlan.zhihu.com/p/651588659)
	* 讨论到的位置编码方案：Sinusoidal，RoPE，Alibi；{_n8un5s}
		* 正弦 Sinusoidal（Transformer 原论文）
			* 编码相对位置信息：PE(pos+k) 可以被 PE(pos) 线性表示，
			> 远程衰减：不同位置的position embedding点乘结果会随着相对位置的增加而递减。
		> RoPE：是目前开源社区应用最广泛的一种位置编码方案，
			> 通过绝对位置编码的方式实现相对位置编码，在引入相对位置信息的同时保持了绝对位置编码的优势（不需要像相对位置编码一样去操作Attention matrix)。（公式）
			> Meta开源的llama模型采用了RoPE的位置编码方式，
		> Alibi是谷歌发表在ICLR2022的一篇工作
			> Alibi主要解决了位置编码外推效果差的痛点，算法思想非常的简单，而且非常直观。
			> 与直接加在Embedding 上的绝对位置编码不同，Alibi的思想是在 Attention matrix上施加一个与距离成正比的惩罚偏置，惩罚偏置随着相对距离的增加而增加。
			> 在具体实现时，对于每个head会有一个超参m 来控制惩罚偏置随着相对距离增加的幅度（斜率）。
	* 修复方案，RoPE、Alibi
* LongLoRA-2309.12307 贾佳亚韩松团队新作：两行代码让大模型上下文窗口倍增 | GitHub热榜
	* [2023-10-01](https://mp.weixin.qq.com/s/ydujINoD8KL0FyDHnulceA)
	> LongLoRA的意义不仅在于提高了窗口长度，关键在于用更少的消耗提高了窗口长度。
		> 以7B参数量的Llama-2为例，如果使用全量微调，从4k提升到32k，在一台8个A100的单机上需要五天。
		> 而改用LongLoRA方式，则只用11.3小时就能完成，连半天都不到，效率提升近十倍。
	* 方式：分组注意力，两个分组方式有位移，从而确保组间信息交互；{_na1k7c}
		> 短注意力就是将训练文本划分为多个组，使自注意力计算在每个组内分别进行，从而达到降低运算量的目的。
		> 而在这一过程中注意力头也被进行了分组，通过注意力头的位移，就实现了组间的信息交互。
		> 划分出的每个组之间有重叠部分，确保了数据可以在全文中流通。
		> 这样一来，每次计算都只需要对组内的token进行操作，运算量大大降低。
		* （有示意图）
* Temp-LoRA-2401.11504 增强大模型长文本能力，不靠增大上下文窗口，而用临时 LoRA 模块记忆先前生成结果
	* [2024-02-08](https://mp.weixin.qq.com/s/V9C0s4HR2cQinz1Bgrjsiw)
	> 和长度外推等方法使用KV缓存的本质不同，它用模型的参数来存储大量上下文信息。
	> 具体办法就是建一个临时Lora模块，让它仅在长文本生成过程中“流式更新”，也就是用先前生成的内容不断作为输入来充当训练数据，以此保证知识被存进模型参数中。{_o28m7o}
	> 然后一旦推理完成，就丢掉它，保证不对模型参数产生长久影响。
	> 在生成过程中，token是逐块生成的。每次生成块时，使用最新的Lxtoken作为输入X生成后续token。
	> 一旦生成的token数量达到预定义的区块大小∆，就使用最新的块启动Temp-Lora模块的训练，然后开始下一个块生成。
* Why and how to achieve longer context windows for LLMs | Medium 文章
	* [2024-02-28](https://medium.com/@ddxzzx/why-and-how-to-achieve-longer-context-windows-for-llms-5f76f8656ea9)
		* 大模型讨论群里其他同学推荐
	* 以下为目录
	> 1 Why and how to achieve longer context windows for LLMs
	> 1 Absolute positional encoding；{_o2sn4t}
	> 1 Relative positional encoding
	> 1 RoPE extensions
		> 2 Other methods 
	> 2 Recommended from Medium
		> 2 Extending Context Length in Large Language Models
			> 3 How to turn your Llama into a Giraffe 
		> 2 The Secret Sauce behind 100K context window in LLMs: all tricks in one place
			> 3 tldr; techniques to speed up training and inference of LLMs to use large context window up to 100K input tokens during training and… 
		> 2 Lists
		> 2 Predictive Modeling w/ Python
		> 2 Natural Language Processing
		> 2 AI Regulation
		> 2 Practical Guides to Machine Learning
		> 2 Context Window Size and Language Model Performance: Balancing Act
			> 3 In this article, we will explore the crucial concept of context window size in large language models (LLMs) and its impact on their… 
		> 2 A Guide to Controlling LLM Model Output: Exploring Top-k, Top-p, and Temperature Parameters
			> 3 You might have used ChatGPT or any other major LLM for building a system, doing classification task, answer questions, or using it as an… 
		> 2 Papers Explained: Mistral 7B
			> 3 Mistral 7B is an LLM engineered for superior performance and efficiency. It leverages grouped-query attention (GQA) for faster inference… 
		> 2 Context Windows: The Short-term Memory of Large Language Models
			> 3 Navigating the Basics and Understanding Context Windows for ChatGPT and LLMs 
* 大模型常用attention - 知乎
	* [2023-11-27](https://zhuanlan.zhihu.com/p/654997344)
	* multi-head attention（MHA）变种：
		* multi-query attention（MQA）不同头仅 query 不同，K,V 共享；{_nbrm55}
			> chatglm6b v2使用，Google的palm
		* grouped-query attention（GQA）对头分组，不同头 query 都不同，K,V 在组内共享、组间不同；{_nbrm53}
			> 2305.13245
			* （评）LLaMA2 用了
			* （评）SRS 中位置((nbrm6n))
		* GQA 部分放了其论文里的示意图，三者比较
	* 其后有硬件相关的计算加速方式等
* DiffTransformer-2410.05258 放大二头注意力大小差别，以避免长上下文中无关 token 注意力累积变大
	* "Differential Transformer"
		* Ye, Tianzhu; Dong, Li; Xia, Yuqing; Sun, Yutao; Zhu, Yi; Huang, Gao; Wei, Furu; 
		> created on 2024-12-31
	* [公众号报道](https://mp.weixin.qq.com/s/zzyKTZ6hBIjB1freidb05A)
		> 来自微软的Differencial Transformer。
		> 论文中介绍，整体思路类似差分放大电路或降噪耳机，用两个信号的差值来滤除共模噪声，解决Transformer模型信噪比低的问题。
		> 核心创新非常simple和nice，可以用一句话概括：
		> 将两个注意力头配对，然后执行(softmax(Q1K1) - λ*softmax(Q2K2)) V，其中λ是一个可学习的标量。{_ocve6y}
		> 他认为这项研究的动机非常充分：随着上下文变长，（微小的）对不相关token的注意力之和可能超过对少数相关token的注意力，从而淹没它们。
		> 上下文学习鲁棒性实验中，DIFF Transformer在不同的样本排列顺序下，性能方差远小于经典Transformer。
			> 这表明它更不容易被输入的细微变化扰乱，而经典Transformer容易受到样本顺序的影响，在最好和最坏情况下表现相差很大。
* （备用）RMSNorm 优势 from 小红书
	* [2025-11-09](http://xhslink.com/o/2yx9yzGS8Gy)
	> （1）从参数量来看RMSNorm的（可学习）参数量仅为LayerNorm的一半；
	> （2）从计算量上来看RMSNorm更高效；
	> （3）数值稳定性/梯度消失上看，RMSNorm梯度稳定并且缓解深层网络梯度消失问题；
	> （4）模型表现上，RMSNorm的表现和LayerNorm相当；
