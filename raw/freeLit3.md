* （备用）Gated Attention 意义解读（NeurIPS 2025 best paper，Qwen 团队工作）
	* [2025-12-03](https://www.zhihu.com/question/1977370700328166444/answer/1978179919344338830)
	> 就这么一个element-wise的乘法，参数量增加不到2%，但带来了三个层面的改进：
	> 在连续线性变换中引入非线性
	> 让模型获得了"选择性沉默"的能力
	> 消除了困扰LLM多年的Attention Sink现象
	> Qwen的实验发现加了门控之后，loss spike几乎消失了。{_q16e9j}
		> 而且模型能承受更大的学习率。论文里做了一个极端实验：把学习率调得很高，baseline模型直接发散了，但带门控的模型居然还能正常收敛。
		> 我的理解是门控相当于给梯度回传加了一个"缓冲阀"。
		> 这对工业界的价值可能比性能提升还大。
	* [另一回答](https://www.zhihu.com/question/1977370700328166444/answer/1978422159417295815)
	> 显著减少了模型内部的异常大的激活值。
		> 之前的研究认为 Massive Activations 是导致 BF16 训练不稳定的元凶之一。
		> Gating 通过稀疏化输出，天然抑制了这些异常值，解释了为什么训练稳定性得到了巨大提升。
	* 增强上下文外推能力，由于消除 Attention Sink
		> 原因是传统的 RoPE 扩展方法（如 YaRN）会改变位置编码的分布，依赖 Attention Sink 的模型对此非常敏感（因为 Sink 也是一种特定分布的 Bias）。
* （备用）字节量子化学类科学计算研究工作，Nature 子刊
	* [2025-11-30](https://mp.weixin.qq.com/s/RaCFfqSyP7N7R6Ir1JPgXw)
* SVI-2510.09212 自回归视频生成应对推理阶段误差累积方案，训练时即学会处理自己的预测误差
	* "Stable Video Infinity: Infinite-Length Video Generation with Error Recycling"
		* Li, Wuyang; Pan, Wentao; Luan, Po-Chien; Gao, Yang; Alahi, Alexandre; 
		> created on 2025-11-20
	* [知乎介绍](https://zhuanlan.zhihu.com/p/1961086088530624728)
	> （名称）洛桑联邦理工学院（EPFL）的研究者们推出了一种名为 Stable Video Infinity (SVI) 的全新方法，
	> （目的）旨在解决一个困扰业界已久的难题：如何生成具有高时序连贯性的无限长视频。
	* 自回归生成的误差累积问题，有示意图
		> 目前的视频生成模型，大多采用自回归（autoregressive）的方式，即一帧接一帧地生成内容。
		> 在训练时，模型看到的全是“干净”的、来自真实世界的视频帧。
		> 然而，在实际生成（推理）时，模型下一步的输入却是它自己前一步生成的、可能带有微小瑕疵的“微瑕品”。
		* （评）示意图提到流匹配，是以之前帧为 condition 对当前帧去噪？
	> “错误回收微调”（Error-Recycling Fine-Tuning）的全新训练策略。
		> 其核心思想非常直观：与其在测试时才手忙脚乱地处理错误，不如在训练阶段就让模型提前“预习”这些错误，并教会它如何“亡羊补牢”。
	> 注入错误 (Inject Errors) ：在训练开始时，系统会有意地将模型之前犯过的“历史错误”注入到干净的输入数据中，模拟出真实生成时那种充满误差的环境。
	> 计算错误 (Calculate Errors) ：模型会尝试对这些“被污染”的输入进行预测。
		> SVI采用了一种高效的“一步式双向积分”方法来快速估算模型的预测结果，并将其与真实目标进行比较，从而精确计算出模型在当前步骤中产生的“新错误”。
	> 存储与重采样 (Bank & Resample Errors) ：这些新计算出的错误并不会被丢弃，而是被动态地存入一个“错误银行”（Replay Memory）中。{_pbk821}
		> 在下一次训练迭代时，系统会从这个银行中重新采样一些错误，再次注入到新的输入数据里。
	> 通过这样一套“注入-计算-存储-重采样”的闭环流程，模型（Diffusion Transformer, DiT）被迫不断地面对和修正自己产生的各种错误，从而逐渐培养出强大的“纠错”能力。
* （备用，基本全文有价值故未笔记摘录）机器学习中有哪些形式简单却很巧妙的idea？ - 知乎
	* [2025-11-12](https://www.zhihu.com/question/347847220/answer/28410032790)
* （备用）Kimi 苏剑林的技术博客，架构、训练等大量理论推导相关讨论
	* [2025-11-12](https://spaces.ac.cn/)
* SimpleFold-2509.18480 （备用）基于纯 Transformer、流匹配的蛋白质预测，架构不再涉及蛋白质专家知识
	* "SimpleFold: Folding Proteins is Simpler than You Think"
		* Wang, Yuyang; Lu, Jiarui; Jaitly, Navdeep; Susskind, Josh; Bautista, Miguel Angel; 
		> created on 2025-09-25
	* [公众号报道](https://mp.weixin.qq.com/s/J9BSvIHmpqWwA495Ws6L2Q)
	> 来自苹果的研究团队提出首个基于流匹配（flow-matching）的蛋白质折叠模型 ——SimpleFold，
		> 该模型仅使用通用 Transformer 层，无需依赖多重序列比对、配对相互作用图、三角更新（triangular updates）或任何等变几何模块，即可将蛋白质序列直接映射至其完整三维原子结构。
		> 正如研究论文题目所述：「蛋白质折叠比你想象的更简单」。
	> 研究团队将蛋白质折叠重新定义为条件生成任务。
	> SimpleFold 突破了当前依赖专用架构的设计范式，采用通用 Transformer 主干网络，并通过流匹配目标进行端到端训练。
		> SimpleFold 包含三大核心模块：轻量级原子编码器与解码器（采用对称设计，即模块数量和隐藏层维度相同）以及残差主干网络。
		> 所有模块均通过标准 Transformer 块实现，并配备根据时间步长自适应调节的层结构。
	* fig2 氨基酸序列输入预训练的 蛋白质语言模型（> 推测是在大量氨基酸训练上 NTP 预训练的）
	* loss 不再涉及蛋白质特殊知识
		> SimpleFold 采用简化的流匹配训练目标，辅以 LDDT 损失函数进行训练，而非组合多种蛋白质特异性损失项。
		> 这一简化使研究团队能够实现模型规模和训练数据量级的同步扩展，最终发布了从 1 亿参数到 30 亿参数的系列模型。
* AlphaFold2 解读博客翻译
	* [2025-07-21](https://zhuanlan.zhihu.com/p/570610949)
	* AlphaFold2 二含义
		> 在这里，我将在两种情况下使用 AlphaFold2（AF2） 这个术语：
		> 从广义上说，它是一个利用多个外部开源程序和数据库来通过蛋白质序列预测其3D结构的系统；
		> 从狭义上说，AlphaFold2 代指该系统中核心的神经网络模型部分。
	* 传统算法部分，数据库提取相似氨基酸序列
		* 生物学原理：蛋白质演化过程特点，多序列比对（MSA）算法
			> 蛋白质在进化过程中大部分时候是保守（conservative）的。
				> 例如，人类、马和鱼的血红蛋白都是由同一种蛋白质进化而来的。
				> 这种同一蛋白质在不同物种中的情况被称为同系物（homologues）。
			> 蛋白质的进化过程基本上是中性（neutral）的（即大多数突变都不会影响蛋白质功能）。
				> 蛋白质的结构相比其序列来说更加保守。
				> 典型的情况是，相距时间遥远的物种体内的氨基酸序列会发生70%的变化，但3D结构则基本保持不变。
			* 多序列比对 MSA
				> 来自不同物种的同系物的比较具有重要的信息，通常用二维表表示，称为多序列比对（multiple sequence alignment, MSA）。
				> 来自不同物种的蛋白质氨基酸序列被写成行，这样相应的残基（residues）就会在相同的列中。
			* MSA 示意图，氨基酸有 保守位点（类型一直不变）、可变位点（几乎随便怎么取）、协同演化位点（二位点需组合取值）{srs:p7lg1m}
		* 数据库查找同系物，用 HMMER 软件包（基于隐 Markov 模型）
			> AF2 使用 HMMER 软件在序列数据库 Uniprot 和 MGnify 中查找输入序列的同系物（homologues）。
			> 它使用了一个被称为 HMMER 的软件包，该软件包从21世纪初就出现了。
			> HMMER基于马尔可夫链/隐马尔可夫模型，这些方法在当时的语音识别/合成领域占主导地位。{srs:p7na20}
			> HMMER构造并返回我们给定的蛋白质序列和找到的其同系物的多重序列比对（MSA）。
		* 使用的对齐序列 30–100 个为宜，通过聚类得出
			> 如果对齐的数量太少，少于30个序列，AlphaFold2就不能很好地工作。
			> 然而，如果序列的数量超过大约100，这也是不好的，因为这会减慢训练。
			> 因此，在这种情况下，对齐中的序列是聚类得到的。
		* 数据库找是否有可用 3D 结构（不到 0.1%），用 HH-suite 包
			> AF2也使用HH-suite包来检查，我们的同系物是否在 PDB 中有可用的3D结构。
			> 如果是这样的话，3D结构重建的问题就变得很简单了——你只需要把它作为一个模板，并在此基础上建立你的预测模型。
			> 然而，只有不到0.1%的蛋白质有这样的模板可用。
			> 如果有蛋白质3D结构模板，AF2就依据该模板中残基间的距离构建 pair representation；
				* 注：知乎原文的机翻我感觉有误，这里是自己按英文原文理解
			> 如果不可用，则初始化带有一些合理默认值的 pair representation。
	* NN 部分结构
		> Evoformer module 模块负责更新 MSA embeding 和 pair representation。本质上，这是在检测蛋白质中氨基酸之间相互作用的模式。
			> Evoformer由3个主要步骤组成:
			> Evoformer 使用包含在 pair representation 中的信息，并通过通过轴向（交叉）attention 更新 MSA。
				> 它首先关注同一序列中的其他氨基酸残基（称为行方向门控自注意力），{_p7nf21}
					* 额外引入 attention bias，根据 pair representation 的线性变换生成
				> 然后关注同一列中的其他氨基酸残基（列方向门控自注意力）。
					> 执行对齐列内序列之间的信息交换。
					> 这一步骤有助于 AF2 识别保守或共同进化的位置，
					> 而且它对 3D 结构数据 从第一个（待预测结构）序列到其他序列 的传播也很重要
						* 注：机翻感觉不准，这是自己根据英文原文的翻译
					> 在附录中，DeepMind 分享了注意力图的可视化。
				* MSA transition block，即 Transformer FFN 部分
			> Evoformer 用更新的 MSA 来更新 pair representation，这里用到了 outer product mean block.。
			> Evoformer 将三角形不等式应用到更新的pair representation中，以加强一致性。 
		> Structure module 模块负责预测蛋白质的3D结构，基于Evoformer module 得到的 embeding。 
		> 在 Structure module 提出一些 3D 结构后，再用 OpenMM 软件对得到的 3D 结构进行基于物理的弛缓。
		> 这个过程会重复三次，这被叫做 recycling。
	> Noisy Student Training 是一种半监督的学习方法，{_p7lf9b}
		> 它通过使用相等或更大的 Student 模型和在学习过程中给 Student 添加噪声来扩展 self-training 和 distillation 的思想。
		> 它有三个主要步骤:
			> 根据标记的图像训练 teacher 模型
			> 使用 teacher 在未标记的图像上生成伪标签
			> 训练一个 student 模型的标签图像和伪标签图像的组合。 
		> 算法迭代了几次，将 student 视为 teacher，对未标记的数据重新标记，并训练一个新 student。
		> Noisy Student Training teacher旨在从两方面提高自我训练和蒸馏。
			> 首先，它使 student 比 teacher 大，或者至少等于，这样 就student 可以从更大的数据集中更好地学习。
			> 其次，它给 student 增加了噪音，因此噪音大的 student 被迫从伪标签中更努力地学习。
			> 为了干扰 student，它使用输入噪声如 RandAugment 数据增强，模型噪声如 dropout 和随机深度训练。
* 含诺奖委员会解释 AlphaFold2 工作原理的图片
	* [2025-07-20](https://mp.weixin.qq.com/s/SeLaoXOlFkt0dABRIwhxTw)
	* 1. 数据库搜索：根据输入的氨基酸序列，从数据库中提取相似的序列及其蛋白质结构（可能来自不同物种）
		* （评）看后文表述，似乎允许半监督，不要求数据库中所有氨基酸序列都已知蛋白质结构
	* 2. 序列分析：(a) align 相似的序列，分析哪些部分在演化中保留
	* 2(b) 分析哪些氨基酸（> 成对？）可能在 3D 蛋白质结构中相互作用
		* 判断依据：相互作用的氨基酸会协同演化，eg. 如果一个带电，另一个会带相反电荷；如果一个变成疏水，另一个也会变疏水；{srs:p7lg1k}
		* （评）似乎是说如果这两个氨基酸位点在突变后不再继续相互作用，则相应蛋白质结构破坏、无法发挥功能，这样的个体无法存活、不会被观察到
			* 以下按形式逻辑，事件：A二位点需相互作用，B占位氨基酸种类有相互作用，C个体or物种存活
			* A∧¬B⇒ ¬C
			* C⇒ ¬(A∧ ¬B) = ¬A ∨ B = (A ⇒ B)
			* 该位点对观察到较高种类组合多样性 ⇔ ∀B.¬A∨B ⇔ ¬A
	* 2(c) 据此推测序列中氨基酸的两两距离表（称为 distance map）
	* 3. AI 分析：Transformer 通过迭代更新序列分析（step2）和距离表
		* step1 若找到了相关蛋白结构，也会使用
	* 4. 猜测结构：
* 2107.11228 NN loss landscape 性质在不同训练设定（噪声，相对负载）下相变
	* "Taxonomizing local versus global structure in neural network loss landscapes", NeurIPS 2021
		* Yang, Yaoqing; Hodgkinson, Liam; Theisen, Ryan; Zou, Joe; Gonzalez, Joseph E.; Ramchandran, Kannan; Mahoney, Michael W.; 
		> created on 2025-07-02
	* fig1 landscape 性质区分，共 5 种 phase；{_p72f37}
		* 具体区分依据为（可计算的）landscape metrics
		* 全局连通性，由 mode connectivity eqn(4) 度量
			* 具体地：二训练结果用低 loss 曲线（Bezier）连接，在曲线上找 loss 值与已有训练结果（二者取均值）差异的最大值
		* 局部平坦性，由 tr(H), λ_max(H) 度量（H 为 Hessian）；{_p72f32}
		* （全局连通、局部平坦情形）多次训练结果（不同随机种子）相似性，由 CKA similarity eqn(3) 度量
			* p6:-2 仅 l2 距离（基于权重）不够，CKA 相似度（基于表征）更好；{_p72f3t}
	* p6 各 phase 性质
		* 局部尖锐情形：训练 loss 大
		* 表现最好的：全局连通，局部平坦，结果相似度高
	* 相图自变量：
		* 训练噪声大小，包括 batch size、权重衰减 等
		* 模型相对负载（相当于数据量、参数量比值）
	* fig3 及往后有很多具体的相图
* 1905.00414 Hinton 关于 NN 表征相似性度量的文章
	* "Similarity of Neural Network Representations Revisited"
		* Kornblith, Simon; Norouzi, Mohammad; Lee, Honglak; Hinton, Geoffrey; 
		> created on 2025-07-02
	* 考察两个不同的特征提取网络，判断其提取的特征是否相似
	* eqn(1) 基于内积的相似性：取数据集，算所有样本对的表征相似度（Gram 矩阵），对二网络的相似度矩阵求内积
		* 两处均使用内积：单表征网络下二样本表征（向量）的相似度，二表征网络的数据相似度（矩阵）的相似度
		* （评）不要求二网络给出表征的维度相同
		* 最终计算发现可简化为 二网络表征矩阵 乘积 的 F-norm
			* （评）相当于遍历表征的所有维度对（网络 1 输出表征的第 i 维、网络 2 的第 j 维），求内积（遍历数据，计算二表征幅值的内积），然后对所有 ij 的结果求平方和
			* “内积”可理解为 empirical 协方差：数据样本来自概率分布，表征网络的一个输出元（“feature”）视为实值函数，则复合后一个输出元成为实值随机变量，可求二变量协方差
		* 前一处内积后文似乎可推广为 kernel 版本（内积是最简单的 kernel）
		* 对二表征幅值归一化可得 centered kernel alignment (CKA) similarity；{_p72b0n}
	* （评）eqn(1) 我理解的连续数据分布版本：数据空间 S，表征映射 $f:S\to\R^m$，$g:S\to\R^n$
		* 数据相似度矩阵推广为映射 $ds_f:S\times S\to\R,(s,t)\mapsto\langle f(s),f(t)\rangle$
		* 表征相似度为 $\langle ds_f,ds_g\rangle$，其中 $S\times S$ 上测度即数据对的联合概率分布
			* 原文离散版本为对所有数据对求和，改成对所有数据对求平均 才更接近该连续版本
			* tbl1 linear CKA 会额外对 $ds_f,ds_g$ 分别归一化
		* eqn(1) LHS 成为 $\int(\sum_if_i(s)f_i(t))(\sum_jg_j(s)g_j(t))dsdt$
			* RHS 成为 $\sum_{ij}(\int f_i(s)g_j(s)ds)^2$
				* 括号内为 $f_i,g_j$ 二实值随机变量的协方差（零均值前提下）
				* eqn(4) 会对 $f,g$ 标准化，先平移到零均值（各分量 $i,j$ 分别平移），再整体除以标准差（对所有分量 $i,j$ 统一）
			* 二式相等同样不难验证
* AlphaGenome
	* [2025-06-27](https://mp.weixin.qq.com/s/xSZRb9AmqK1DGXbUZuUSVA)
	* 架构图
		* DNA 长序列（1Mb）先划有重叠 patch；{_p6rc1k}
		* 每块 CNN 编码器压缩为 token；{_p6rc1z}
		* 之后所有 token 算注意力
		* （评）尽管原文针对 1D DNA 长序列，不过架构设计思路不限于 1D
* Muon 优化器评价：想法简洁优美，不过实验涨点可能由于额外改动，同样能提高 Adam 性能
	* [2025-06-14](https://www.zhihu.com/question/1910001570080359694/answer/1916050159411893853)
	> Muon的背后观点的确看上去比较简洁，符合很多人的research taste。
	> 而且该算法的确最擅长于加快训练初期的进度（得益于控制条件数，可以暂时容忍较大的学习率），效果马上看得到，不至于像早年其他的新optimizer一样动不动就崩掉。
	> 但总体来说，这种加大等效更新率的方式有时是以训练后期的效能不足为代价，此时在后期才有失速迹象[3]。
	* 5 改动，只汇报了 1；未汇报的 4，5 可能影响不小
		* 评论区他人指正比较对象有误，原作者 Adam 设定分实验的细调版本、演示的简易版本
	> 对每一组transformer参数单独设定了局部学习率。
		> 例如，对embed_params设置了0.6的夸张学习率，lm_head达到了0.22，而scalar参数也达到了0.04。{_p6ek02}
		> 经常手搓LLM预训练的同学可能知道这意味着什么（快的夸张的早期收敛速度）。
	> 如果同样的trick应用在Adam上，让Adam针对模块类别设置不同学习率，其提升可以达到类似muon的2倍左右：
		* （评）鄂维南、吴磊等
		> 作者通过实验估算出transformer内部不同模块的sharpness不同。进而提出sharpness越小，对应使用的局部学习率应该越大：{_p6ej9w}
		> 凑巧的是，这篇论文估算出的sharpness排序，基本与Muon作者手调的祖传学习率相吻合（Norm < Lm_head < Embed）。
	* 评论区他人对 Muon 积极评价；{_p6ej9q}
		> 在Muon之前，我们自己的Adam肯定是已经overtune的了好吧。我们是工业界，如果Muon相比Adam没有竞争力，我们至于浪费人力物力水一篇论文来忽悠大家么？Muon又不是我们发明的，嘲讽Adam更是无从说起。
	* 同问题另一回答实验结果偏好 Muon，
		> 另一个高赞说Muon的效果好是因为超参多，对每个模块用不同学习率等。但是这些我全都没调，用的都是默认。我相信对于很多人来说，非常精细的调参是无法负担的，一个好的优化器应该对参数非常robust
* 大模型训练一般不用 dropout；{_p5kj1w}
	* [2025-05-20](https://mp.weixin.qq.com/s/F2JvYslG5Lx_sCcmY_Ix5g)
	> 大模型时代，噪声，过拟合，数据质量，数据量，这些小模型困扰大家的问题，都不存在了。
		* 评论区他人：LoRA 数据量较小时还是会用 dropout；{_p5kj23}
	> 要舍弃一些参数的学习，那我就要用训练epoch和数据量来弥补，
	* 训练推理不一致：AlphaDropout 为一种解决方案，但有局限性；{_p5kj28}
		> 关于dropout的问题，其实还真有人研究过，让他的不一致行为分布变得一致，也就是alpha dropout，
		> 但这玩意，也只是尽力而已，现在很多框架已经把把这个放进去了，但大家用的还是不多，
		> 在一致性和效率，稳定性上多多少少还有些问题，或者按下葫芦起了瓢。
* 回归任务慎用 dropout
	* [2025-05-18](https://mp.weixin.qq.com/s/jx91nqryA-xziMfkgMNIxw)
	* train、eval 差异，尽管均值一致，但方差不同；{_p5ik5k}
		* 经过后续非线性层后，方差的区别会转变为偏差的区别
		> 其实dropout最好是不要加在网络的中间，在最后输出层前面加应该还是没问题的，
			> 根据我自己的实验来看，dropout加在最后一层是没有观察到明显的性能损失的，但是也没有提高就是了，
			> 因此，回归任务干脆就别用dropout了。
		* 评论区他人：eval 需修正 dropout layer 输出，使和训练同方差（> 细节没说）
	* 分类问题输出为 logit，对此没那么敏感；但回归问题要输出绝对预测值；{_p5ik58}
	* 有相关论文说了这件事
	* 评论区他人：参数不大的网络都可以不加 dropout
	* 评论区他人：某些具体领域的回归任务还是有 dropout 性能更好
* TriNeRFLet-2401.06191
	* "TriNeRFLet: A Wavelet Based Triplane NeRF Representation"
		* Khatib, Rajaei; Giryes, Raja; 
		> created on 2025-04-27
	* 摘要摘录
	* fig3c 三平面 feature 及其小波系数的可视化，来自同一物体（> 的不同通道？）{_p4re3l}
* SRF 为用 NeRF 渲染远景，使用多组同心球面
	* Learning Spherical Radiance Field for Efficient 360◦ Unbounded Novel View Synthesis
		* Minglin Chen , Graduate Student Member, IEEE, Longguang Wang , Yinjie Lei , Senior Member, IEEE, Zilong Dong , and Yulan Guo , Senior Member, IEEE
		> 2025-04-23
	* fig2a 为渲染 NeRF 远景，使用多组同心球面
		* 球面似乎是经纬网格；{_p4nf8i}
	* eqn(1) 各球面半径选取，近处一半 r 线性增加，远处一半 1/r 线性减少；{_p4nf8m}
	* 各 scale 球面网格 hash 编码，查询结果 concat 输入后续 MLP
	> （备用，未确认含义）图3. 无界新颖视图合成中不同空间扭曲方法的比较。
		> 第一行：原始欧几里德空间（a）的二维可视化，以及线性扭曲（b）、径向扭曲（c）、空间收缩（d）和球面映射（e）的扭曲空间。
		> 第二行：Mip-NeRF-360数据集中双风格场景的自上而下视图[64]（f），以及线性扭曲（g）、径向失真（h）、空间收缩（i）和球面映射（j）的光线交点分布。
		> 径向扭曲和空间收缩都会沿径向轴扭曲空间，使扭曲空间中的远处区域更近。
		> 使用这些扭曲方法，光线相交的分布在扭曲空间中变得更密集（见（h）和（i））。
		> 我们的方法使用球面映射沿角度轴扭曲度量空间，使扭曲后的距离点与相同角度的距离点尽可能接近。
		> 光线交点在球形扭曲空间中密集分布（参见（j））。
		> （请注意，我们通过计算扭曲空间中的点数来可视化光线交点分布，其中场景的点云是通过[64]从渲染的深度图像中获得的）。
* 2411.02796 （备用）现存大多基础模型性能未明显超过专用模型
	* "Specialized Foundation Models Struggle to Beat Supervised Baselines", NeurIPS 2024 Workshop FM4Science
		* Xu, Zongzhe; Gupta, Ritvik; Cheng, Wenduo; Shen, Alexander; Shen, Junhong; Talwalkar, Ameet; Khodak, Mikhail; 
		> created on 2025-04-23
	* 摘要摘录
		> 摘要在视觉和文本方面取得成功之后，“基础模型”（FM）范式——在海量数据上预训练大型模型，然后对目标任务进行微调——已迅速扩展到科学、工程、医疗保健等领域。
		> 这是否实现了最初的FM所实现的目标，即在其领域取代了传统的监督学习？
		> 为了回答这个问题，我们研究了三种模式——基因组学、卫星成像和时间序列——以及多个最近的FM，
		> 并将其与标准的监督学习工作流程进行了比较：模型开发、超参数调整和训练，所有这些都只使用目标任务的数据。
		> 在这三个专业领域中，我们发现始终可以训练简单的监督模型——不比经过轻微修改的宽ResNet或UNet更复杂——这些模型与最新的基础模型相匹配，甚至优于最新的模型。
		> 我们的工作表明，大规模预培训的好处尚未在许多专业领域实现，这加强了将新的FM与强大、经过良好调整的基线进行比较的必要性，并为此引入了两个新的、易于使用的、开源的和自动化的工作流程。
	* fig1 微调后的基础模型相比专用基线改进有限，不如 NLP 中的 BERT
		> 图1：在三个领域——基因组学、卫星成像和时间序列——尽管使用了两到五个数量级的数据，但专门的FM在优化监督学习方面没有显著改善。
		> 相比之下，BERT等突破性的FMs在NLP中的表现明显优于监督基线（左上），导致该领域转向微调作为默认方法。
* 2303.14001 NeRF 架构同时输入 TensoRF、位置编码，对前者预训练
	* "Grid-guided Neural Radiance Fields for Large Urban Scenes", CVPR2023
		* Xu, Linning; Xiangli, Yuanbo; Peng, Sida; Pan, Xingang; Zhao, Nanxuan; Theobalt, Christian; Dai, Bo; Lin, Dahua; 
		> created on 2025-04-16
	* 摘要摘录
		> 我们建议使用紧凑的多分辨率地物平面表示来粗略地捕捉场景，并通过另一个NeRF分支用位置编码输入对其进行补充，以联合学习的方式进行渲染。
		> 我们表明，这种集成可以利用两种替代解决方案的优点：
		> 在特征网格表示的指导下，轻量级的NeRF足以渲染具有精细细节的逼真新视图；
		> 同时，联合优化的地面特征平面可以获得进一步的细化，形成更准确、更紧凑的特征空间，并输出更自然的渲染结果。
	* 最终 NeRF 架构，MLP 输入包括：grid 插值隐向量 z，坐标位置编码 PE(x)（及方向编码 PE(d)）{_p4l95n}
		* fig2 σ-grid、PE(x) 输入浅层 MLP 得 σ，再 concat c-grid、PE(d) 输入深层 MLP 得 c
	* grid 仅保留单组 TensoRF，即 xy 2D grid、z 1D grid 张量积
		* sec3.1 主要考虑 xy 平面，因为大型城市场景主要在这个平面上；{_p4la1f}
		* p4:l1 仿照 TensoRF 额外补充沿 z 的全局 1D 特征
	* grid 其他细节：多尺度 concat p4:l-1，NeRF σ,c 网格独立 eqn(2)
	* 额外坐标输入，好处 1：纯 grid 有存储占用（细网格）、小尺度表征（粗网格）矛盾，现可避免
		* sec3.3 纯 grid-based 缺陷：存储占用大，小尺度（voxel 内）缺失
		> 对于大型城市场景，学习具有匹配分辨率的网格可能会消耗大量内存。
		> 此外，网格特征缺乏捕捉体素内精确变化的动力，而仅仅是地面真实RGB的重建损失。{_p4le2p}
		> 因此，我们使用NeRF联合优化特征平面和矢量，以增强网格特征的监控信号，并从提供的NeRF输入中逐点引导。
		> sec3.2:2 特别是，虽然高网格分辨率可以保证空间中的每个体素都能捕获其局部内容，但无论场景中细节水平可能的异质性如何，质量都是以存储为代价的。
		* sec3.2:1 最后用的是“coarse grid features”
	* 额外坐标输入，好处 2：全局正则化（抑制局部过拟合）sec3.3
		> NeRF带来的另一个好处是对独立优化的网格特征进行全局正则化。
		> 图1和图3显示，由于缺乏对空间连续性和语义相似性的约束，基于网格的方法存在噪声伪影。{_p4le3u}
		> 相反，NeRF在整个场景空间中使用共享的MLP。
		> 我们稍后将展示，从网格分支解释的渲染新视图在与NeRF分支联合训练后可以得到很大改善。
		* fig3 效果逐渐变好：预训练的纯 grid 分支，联合微调后的纯 grid 分支，联合微调后的 grid+PE NeRF
			* （评）2 好于 1 说明纯 grid 分支过拟合可由 grid+PE NeRF 提供的额外正则化 loss 缓解；{_p4le5e}
	* grid 输入作用，辅助坐标输入，好于纯坐标输入 sec3.2:2
		> 如图2所示，NeRF现在可以专注于经近似的场景表面，以实现更高效、更密集的点采样，而不是映射跨越整个采样空间的坐标，
		> 并唤醒（evoke）位置编码中的高频傅里叶特征，以恢复更精细的细节。
		> p5:l0 多分辨率特征平面起着至关重要的作用，因为它提供了多个粒度的场景信息，减轻了NeRF PE的拟合负担，使其能够专注于细化场景的精细细节。{_p4lf6y}
	* grid 取值预训练：事先训小型 grid-based INR，σ,c 分别接不同 MLP 独立拟合；{_p4le63}
		* 预训练作用 1：确保 grid、PE 分工，否则随机初始化的 grid 包含的场景信息不足
			> sec3.2:-1 (1) 随机初始化的特征网格很难提供信息丰富的场景内容，可能会混淆两种网络输入的作用。
		* 预训练作用 2：小型 ansatz 快速拟合整体结构，指导 NeRF 光线采样；正式 NeRF 从头构建相对慢
			> sec3.2:-1 (2) 预训练阶段比包含NeRF分支的阶段快得多，这使得仅使用网格分支可靠地构建粗略几何结构更为高效。{_p4le89}
			* 引导 NeRF 光线积分采样点选取见 sec3.2:2
		* 架构细节，sec3.1:1 预测 c 的 MLP 输入仍需同时包括 PE(d)
		* 引文类似做法，其中 grid 取值在一阶段确定，不像本文二阶段参与微调
			> sec3.2:-1 (3) 与[53]在提供PE输入时冻结体素网格不同，我们稍后将展示特征网格可以通过与NeRF分支的同步学习获得进一步的细化。
	* 维持 grid、PE 分工：保留 grid 预训练 loss 作正则化，以约束 grid feature 更新、使保留语义
		* 预训练 grid 所用的 MLP 仍要用上，尽管它在最终网络中并不保留
		> sec3.2:-1 由于网格分支也受到重建损失的监督，它强制网格分支继续丰富其捕获的场景信息，而PE输入可以专注于缺失的高频细节。{_p4le93}
* StreetSurf-2306.04988
	* "StreetSurf: Extending Multi-view Implicit Surface Reconstruction to Street Views"
		* Guo, Jianfei; Deng, Nianchen; Li, Xinyang; Bai, Yeqi; Shi, Botian; Wang, Chiyu; Ding, Chenjing; Wang, Dongliang; Li, Yikang; 
		> created on 2025-04-16
	* 背景：自动驾驶街景 NeRF 渲染，需考虑远景
	* fig4 无界区域处理，分三范围：近景（close-range, cr），远景（distant-view, dv），天空（sky）{_p4ga1c}
		* 近景用 3D grid，包括多尺度结果拼接
			* x 在各 grid 插值、拼接，结果再与 view direction $v$ 拼接后输入 tiny MLP 得 density, color
		* 远景用 4D grid（xyzr），带 hash table
			* （评）暂未搞清楚 4D 坐标怎么来的，应该是来自 NeRF++
			* 插值结果直接输入 tiny MLP 得 density, color
			* fig5 cr 外框向外膨胀 r 得 dv 框（平行于坐标轴），取一系列这样的 r；{_p4ga3q}
				* 膨胀速度向外逐渐变大，使 1/r 线性减少；{_p4ga4u}
				* 渲染时计算视线与各 dv 框的交点
		* 天空，直接将 $v$ 输入 MLP 得 color
* MMPI-2310.00249 无界 3D 场景背景渲染，选若干朝向，每朝向放多个视线采样平面作背景
	* "MMPI: a Flexible Radiance Field Representation by Multiple Multi-plane Images Blending"
		* He, Yuze; Wang, Peng; Hu, Yubin; Zhao, Wang; Yi, Ran; Liu, Yong-Jin; Wang, Wenping; 
		> created on 2025-04-15
	* secIII.A 背景介绍，MPI 表示，用于无界 3D 场景渲染，针对特定相机朝向放多个（相互平行的）图像平面；{_p4fe6x}
		> 体素网格表示在准确表示无界3D场景的能力方面受到限制，因为位于网格范围之外的对象无法正确建模。
		> 为了解决这个问题，我们采用了DVGOv2[7]提出的方法，该方法将体素网格重新组织为多平面图像（MPI）格式，在固定深度收集L个RGB密度图像平面。
		> 通过在原始空间中从指定近平面的深度线性采样视差到∞，我们在每个采样深度放置一个可学习的图像平面。
		> 这些平面共同形成了MPI，这使我们能够应对表示无限远物体的挑战。
	* （评）似乎是与 NeRF 结合，视线积分在区域内时用 NeRF，在区域外时只考虑与多平面的交点
	* 本文针对不同朝向用不同组平面，方向界面位置插值连续过渡；{_p4ga45}
* GP-NeRF-2303.03003 NeRF 表示大规模无界场景，整合 低分辨率 3D 网格、高分辨率 2D 网格
	* "Efficient Large-scale Scene Representation with a Hybrid of High-resolution Grid and Plane Features"
		* Zhang, Yuqi; Chen, Guanying; Cui, Shuguang; 
		> created on 2025-04-15
	* 摘要摘录：NeRF 用于大规模无界场景（而非单对象）时，需低分辨率 3D 网格 + 高分辨率 2D 网格
		> 尽管已经提出了基于显式密集或哈希网格特征的快速优化NeRF变体，但它们的有效性主要体现在对象尺度场景表示中。
		> 本文指出，显式表示中的低特征分辨率是大规模无界场景表示的瓶颈。
		> 为了解决这个问题，我们为NeRF引入了一种新的高效混合特征表示方法，该方法融合了3D哈希网格和高分辨率2D密集平面特征。
		> 与密集网格表示相比，密集二维平面的分辨率可以更有效地放大。
		> 基于这种混合表示，我们提出了一种快速优化的NeRF变体，称为GP NeRF，它在保持紧凑模型尺寸的同时实现了更好的渲染结果。
	* fig2 3D hash grid、multi-resolution 2D grid feature 全部 concat 过 MLP
		* MLP 浅层输出密度 σ，其后整合输入射线方向 d 并重输入 2D grid feature，输出颜色 c
		* 三平面部分用 concat，sec4.2:-2 实验效果好于 EG3D 的求和；{_p5bh36}
			* 可能由于特征维度小，本文 8（4 分辨率各 2），EG3D 用 32
	* sec4.1:-2 3D grid 用高分辨率（2048），通过 hash 压缩减小信息量；{_p4f99q}
		* 性能好于低分辨率未压缩版本（> 相同参数量下？）、TensoRF
			* sec4.2:-1 TensoRF 矩阵 shape $N^2RF$，有额外张量分解求和维度 $R$，导致参数量增加
		* 性能受限：hash 碰撞混合了不同表面点信息
			* 增大 hash 表大小会增大参数量、训练时间
	* （评）我理解的方法必要性，根据示意图的山地场景；{_p4l99q}
		* 我理解该场景向地平面投影的特征最为复杂，从而需地面 2D 高分辨率网格（3D 网格难直接做这么高分辨率）
		* 竖直方向仍有变化（不同山高度不同），若只依赖竖直 2D 平面，需同时处理大量山的投影，无法判断每个位置的山有多高；从而需覆盖全空间的 3D 网格（信息量无需特别大）
		* 针对本场景，竖直的两个 2D grid 我觉得其实可不用
			* 不过一般场景不预先假定哪个平面方向的投影特征最复杂，从而三个 2D 平面均需使用
	* eqn(5) 无界区域先变换到有界区域，再作为网络输入：单位球¹内的点不动，外面的点按模长缩放到大球内；{_p4fa0p}
		* 似乎是 Mip-NeRF 常规做法
		* ¹用的其实是 p-norm 意义下的球
* Jayasundara2025PIN INR 激活函数换成所谓 PSWF，形状类似 Gabor 小波
	* "PIN: Prolate Spheroidal Wave Function-based Implicit Neural Representations", ICLR 2025
		* Dhananjaya Jayasundara, Heng Zhao, Demetrio Labate, Vishal M. Patel
		> 2025-04-14
	* fig1 空间域、频域分布比较，PSWF、Gabor、Gauss、sinusoid
	* sec3.3 PSWF 表达式，似乎涉及积分；{_p4ee7g}
* ARC-2503.15156 grid-based INR 格点位置可变，前传取 4 最近邻后 concat 而非加权平均
	* "ARC: Anchored Representation Clouds for High-Resolution INR Classification"
		* Luijmes, Joost; Gielisse, Alexander; Knyazhitskiy, Roman; van Gemert, Jan; 
		> created on 2025-04-13
	* fig1 格点位置可变；所获得的点云可作为后续分类网络的输入；{_p4dc1q}
	* fig2 后续 MLP 输入来自 concat：4 隐向量，当前 query pt 到 4 格点的距离；{_p4dc1a}
		* （评）与格点排序有关，不保证 permutation invariant
* （备用）截图生成现代前端代码的AI，涉及代码数据合成策略
	* [2025-04-11](https://mp.weixin.qq.com/s/UOsU3IWaSdPnV5UXxIYLNQ)
	> 基于进化的数据合成（Evolution-Based Synthesis）
		> 借鉴WizardLM的Evol-Instruct⽅法，通过随机进化⽣成多样化的代码。它采⽤两种策略：⼴度进化和深度进化。
		> ⼴度进化通过改变代码的功能和视觉⻛格，⽣成新变体；
		> 深度进化则通过增加代码的技术复杂度，优化组件处理、状态管理和性能，提升代码的可靠性和可维护性。
		> 通过不断进化，可以得到⼤量覆盖不同需求的前端代码。
	> 基于瀑布模型的数据合成（Waterfall-Model-Based Synthesis）
		> 模拟传统软件开发的瀑布流模型，确保⽣成的代码结构清晰、逻辑⼀致。
		> 从需求分析开始，推导出系统功能需求，设计UI布局和架构，保证代码符合现代前端开发的模块化和可扩展性要求。
		> 接着，通过多轮迭代，将需求转化为具体的、可复⽤的前端组件和⻚⾯。
		> 这种⽅法⽣成的代码逻辑清晰，适合复杂功能的开发任务。
	> 基于增量开发的数据合成（Additive Development Synthesis）
		> 在现有代码基础上，逐步增加功能和复杂性。
		> 通过逐步集成状态管理、交互逻辑或API等功能模块，⽣成的代码能更好地满⾜实际开发需求。
		> 这种⽅法强调逐步提升代码的功能和复杂度，确保每次扩展都最⼤可能符合最佳实践。
	> 上述的三种⽅法不仅丰富了数据集的规模和多样性，还确保了数据质量与实际应⽤价值。
* （备用）现代微分几何在CAE工业中的潜在应用（传统算法，网格剖分自动生成）
	* [2025-04-11](https://mp.weixin.qq.com/s/YwsMI-FRZrxLfFL1tRZKEA)
* KiloNeRF-2103.13744 INR 区域分解，硬分解为大量区域，每块用小 MLP 降低前传成本
	* "KiloNeRF: Speeding up Neural Radiance Fields with Thousands of Tiny MLPs"
		* Reiser, Christian; Peng, Songyou; Liao, Yiyi; Geiger, Andreas; 
		> created on 2025-04-12
	* fig1 一个大 MLP 换为大量小 MLP，渲染时间 56s → 20ms（2548x 加速）{_p4ck49}
		* fig2 架构（深度宽度）对比，FLOPs 1056k → 12k
	* sec4.1:3 划分为方形区域组合，沿每轴至多 16 个，最多共 16³ 区域
		* 每个区域网格密度 16（occupancy grid resolution）
	* （旧误解）NeRF 空区域拟合靠迁移学习，fig3 按 NeRF 从头训会在空区域学到伪影，而基于预训练的 NeRF 微调不会
	* teacher-student 训练：fig3 从头训会在空区域学到伪影，故先训普通 NeRF（全局网络信息共享机制抑制伪影），再让本文网络拟合该 NeRF 输出；{_p56h3v}
* CAM-2311.14993 grid-based INR 架构，MLP modulation 由坐标 x 在 grid 插值获得
	* "Coordinate-Aware Modulation for Neural Fields"
		* Lee, Joo Chan; Rho, Daniel; Nam, Seungtae; Ko, Jong Hwan; Park, Eunbyung; 
		> created on 2025-04-02；为 GridMix 引文
	* fig1 本文架构 CAM 与普通 MLP、grid-based MLP 的比较
	* 空间坐标 x 1. 作 MLP 输入，同时 2. 在可学 grid 双线性插值生成 MLP modulation；{_p42a2z}
		* 2 称为“coordinate-aware modulation”
		* 可学 grid 似乎是对每个样本独立可学，MLP 其余参数对所有样本共享；{_p44f2v}
	* 在 grid 上插值生成的 modulation 同时包括 scale, shift
	* modulation 为标量（对 MLP 同层所有神经元共享），包括图像、NeRF 任务，fig2a,b
		* 视频任务仍按向量，fig2c
* DynamicCity-2410.18084 城市场景 4D grid 用 VAE 转 HexPlane 隐向量，拼为大 2D grid 后 DiT 生成
	* "DynamicCity: Large-Scale 4D Occupancy Generation from Dynamic Scenes", ICLR 2025 Spotlight
		* Bian, Hengwei; Kong, Lingdong; Xie, Haozhe; Pan, Liang; Qiao, Yu; Liu, Ziwei; 
		> created on 2025-03-28
	* sec5.1:2 学习率 VAE 1e-3，DiT 1e-4；{_p5dg82}
	* [公众号报道](https://mp.weixin.qq.com/s/ywibzt5q8fabBHfw2aFWnA)
	* 4D 场景 HexPlane 表征，“4D 到 2D 的特征降维”
	* step1 VAE 降维 4D → 2D HexPlane，编码阶段将 4D voxel 输入特征提取+投影网络，解码用 CNN 而非逐点 MLP 以加速；{_p3vc07}
		* 4D 场景用时空体素表示，张量 shape $T,X,Y,Z,C$
		> 投影模块 (Projection Module)：通过共享 3D 卷积特征提取器提取初步的时空 4D 特征后，使用多个投影网络 $h(.)$，将 4D 特征投影到 2D 平面，每一个投影网络会压缩一个或两个维度。
		> Expansion & Squeeze Strategy (ESS) 解码
			> 在动态 NeRF 等领域中，HexPlane 常用一个多层感知机（MLP）进行逐点解码。
			> 然而在 4D 场景中，点的数量非常多，导致模型速度慢，显存占用大。
			> DynamicCity 提出 ESS 解码策略，用卷积神经网络代 MLP，减少显存占用，加速训练，同时显著提升重建效果。
			* 各 2D 特征平面 expand_dim、repeat 成 4D，再用 Hadamard 乘积做信息融合；{_p4rf0j}
			* 最后用卷积解码器生成完整 4D 场景
	* step2 PRO 拼接 HexPlane 便于 DiT 生成
		* 拼为统一 grid：各维长度不等（X=Y>Z>T），各平面无法直接作为单网格不同通道；改将 6 网格拼接为一整个网格（需补 0），“PRO”操作；{_p3sh9d}
			> HexPlane 的六个特征平面共享部分空间维度或时间维度。
			> 作者希望能够用一种简单有效的方式，在训练扩散模型时，六个平面并非互相独立，而是共享部分时空信息。
			> Padded Rollout Operation (PRO)将六个特征平面排列成单个统一的 2D 矩阵，并在未对齐的区域填充零值，以最大程度地保留 HexPlane 的结构化信息 。
			> 具体而言，PRO 将六个 2D 特征平面转换为一个方形特征矩阵，通过将空间维度和时间维度尽可能的对齐，PRO 能够最小化填充区域的大小，并确保空间与时间维度之间的信息一致性。
		> Patch Embedding将该 2D 特征矩阵划分为小块，并将其转换为 token 序列。{_p3va5f}
			> 在训练过程中，作者为所有 token 添加位置嵌入，
			> 并将填充区域对应的 token排除在扩散过程之外，从而保证生成过程中时空信息的完整性。
	* 可控生成，CFG（classifier-free guidance）机制，AdaLN-Zero 技术；对 img-based condition 用交叉注意
		* 用于 4D 未来预测：自回归扩展 HexPlane；{_p3va3w}
		* 用于 4D scene inpainting
* GMN-2312.04501 meta-NN 接受具体 NN 作为输入，具体 NN 用 DAG 表示，边表示权重；CNN、注意力均可处理
	* "Graph Metanetworks for Processing Diverse Neural Architectures" by NVIDIA
		* Lim, Derek; Maron, Haggai; Law, Marc T.; Lorraine, Jonathan; Lucas, James; 
		> created on 2025-02-24
	* 摘要摘录
		> 通过将神经网络本身视为输入数据，可以统一许多任务。
		> 我们通过构建新的元网络来克服这些挑战——这种神经网络将其他神经网络的权重作为输入。
		> 简单地说，我们仔细构建表示输入神经网络的图，并使用图神经网络处理这些图。
		> 我们的方法，图元网络（GMN），推广到竞争方法挣扎的神经架构，如多头注意力层、归一化层、卷积层、ResNet块和组等变线性层。{_p2oh5l}
		> 我们证明了GMN是表现性的，并且等价于参数置换对称性，使输入神经网络函数保持不变。
	* fig2 卷积层的表示，fig3 注意力、残差层，fig4 该表示关于神经元有置换不变性
* STDE-2412.00088 NN 对高维输入求高阶导数
	* "Stochastic Taylor Derivative Estimator: Efficient amortization for arbitrary differential operators", NIPS2024 best paper
		* Shi, Zekun; Hu, Zheyuan; Lin, Min; Kawaguchi, Kenji; 
		> created on 2024-12-13
	* 摘要：实验求解百万维空间中的 PINN
	* sec3.3 之前的工作 SDGD，每次只随机采样几个维数求导，而非一次计算所有维度导数；{_ocea9x}
		* （评）理论上对随机向量求导也可
	* 本文似乎是（未确认）随机选若干方向，构造局部子流形，push-forward 后的各（高阶）导数对应原始函数完整导数的估计
* AutoGLM-2411.00820 （备用）AotoGLM 技术报告，AI 使用安卓手机 GUI，智谱开发
	* "AutoGLM: Autonomous Foundation Agents for GUIs"
		* Liu, Xiao; Qin, Bo; Liang, Dongzhu; Dong, Guang; Lai, Hanyu; Zhang, Hanchen; Zhao, Hanlin; Iong, Iat Long; Sun, Jiadai; Wang, Jiaqi; Gao, Junjie; Shan, Junjun; Liu, Kangning; Zhang, Shudan; Yao, Shuntian; Cheng, Siyi; Yao, Wentao; Zhao, Wenyi; Liu, Xinghan; Liu, Xinyi; Chen, Xinying; Yang, Xinyue; Yang, Yang; Xu, Yifan; Yang, Yu; Wang, Yujia; Xu, Yulin; Qi, Zehan; Dong, Yuxiao; Tang, Jie; 
		> created on 2024-11-16
	* [公众号报道](https://mp.weixin.qq.com/s/fbchjLDy9QmcANOuWY_t2w)
* 2410.08304 符号任务，找给定 ODE 表达式的 Lyapunov 函数表达式，按 Transformer 序列生成任务处理
	* "Global Lyapunov functions: a long-standing open problem in mathematics, with symbolic transformers", NIPS 2024
		* Alfarano, Alberto; Charton, François; Hayat, Amaury; 
		> created on 2024-10-18
	* [公众号报道](https://mp.weixin.qq.com/s/jgb5b04DODrloOylQJO_iw)
		> 研究团队把寻找李雅普诺夫函数构建成一种序列到序列翻译任务，问题和解决方案都表示为符号tokens序列，就能用上原本为机器翻译而生的Transformer模型了。{_oaie7y}
		* 数据生成：正向（从 ODE 到 L(x)）、反向（从 L(x) 到 ODE）；{_oaie9j}
			> 正向数据生成，也就是根据多项式系统生成对应的李雅普诺夫函数。
				> 虽然没有通用方法，但如果一个李雅普诺夫函数能表示成多项式的平方和，就有现存工具可以计算。
			> （反向）大致可以理解成，先随机生成一个满足特定条件的李雅普诺夫函数，再反向构造出与之匹配的动力系统。
				> 这种方法也存在几个局限，比如AI倾向于偷懒，从任务中学习更简单的子问题，因此也需要做出一些限制。
			* 最终 4 个数据集，2 反 2 正
			> （只用后向数据集训练时）在后向数据训练集中添加少量前向生成数据示例，带来显著的分布外测试性能提升。
		* 推理时使用 Beam search，生成 50 次候选解？
* REPA-2410.06940 训 DiT 时使用已有编码器表征引导中间层，通过引入额外 loss
	* "Representation Alignment for Generation: Training Diffusion Transformers Is Easier Than You Think"
		* Yu, Sihyun; Kwak, Sangkyung; Jang, Huiwon; Jeong, Jongheon; Huang, Jonathan; Shin, Jinwoo; Xie, Saining; 
		> created on 2024-10-15
	* [公众号报道](https://mp.weixin.qq.com/s/a725rxzvyQXqNJoL1NsMaA)
		> REPresentation Alignment（REPA），即表征对齐技术，
		> 这是一个基于近期的扩散 Transformer（DiT）架构的简单正则化技术。
		> Yann LeCun 也对他们的研究表示了认可：
			> 「我们知道，当使用自监督学习训练视觉编码器时，使用具有重构损失的解码器的效果远不如使用具有特征预测损失和崩溃预防机制的联合嵌入架构。{_oaff1c}
			> 这篇来自纽约大学 @sainingxie 的论文表明，即使你只对生成像素感兴趣（例如使用扩散 Transformer 生成漂亮图片），也应该包含特征预测损失，以便解码器的内部表征可以根据预训练的视觉编码器（例如 DINOv2）预测特征。」
		> 训练扩散模型的主要挑战源于需要学习高质量的内部表征。
		> 他们的研究表明：「当生成式扩散模型得到来自另一个模型（例如自监督视觉编码器）的外部高质量表征的支持时，其性能可以得到大幅提升。」
		> 相比于原生模型，REPA 能将收敛速度提升 17.5 倍以上。
		* fig1 架构示意图，带噪声图像输入若干 DiT/SiT blocks，改进点：中途的 activation 分支出来过 MLP，与已预训练的视觉编码器输出做表征对齐，引入额外 loss 项；{_oafe7g}
		* 实验中先观察预训练 DiT 中间层，哪层学到了语义信息
			* 方式：“线性探测”，我理解是用可学线性变换做分类任务
			* 结论是中间层学到的语义表征最多，后面的层转向图像细节；{_oaff3k}
				> 预训练扩散 Transformer 的隐藏状态表征在第 20 层能得到相当高的线性探测峰值。
				> 但是，其性能仍远低于 DINOv2，表明这两种表征之间存在相当大的语义差距。
				> 此外，他们还发现，在此峰值之后，线性探测性能会迅速下降，这表明扩散 Transformer 必定从重点学习语义丰富的表征转向了生成具有高频细节的图像。
			* 特征对齐算法：CKNNA
				> 为了测量特征对齐，他们使用了 CKNNA；这是一种与 CKA 相关的核对齐（kernel alignment）指标，但却是基于相互最近邻。这样一来，便能以量化方式评估对齐效果了。
			> 当模型增大、训练变多时，对齐效果会更好。
* 2410.00907 （备用）提出硬件优化降低能耗，用整数加法近似浮点乘法，精度略低于 fp16 明显高于 fp8；测试了 LLaMA、LLaVA 所有乘法换为该操作后各任务性能
	* "Addition is All You Need for Energy-efficient Language Models"
		* Luo, Hongyin; Sun, Wei; 
		> created on 2024-10-08
	* [公众号报道](https://mp.weixin.qq.com/s/LdRacBGfjyF8xUJP6h6xbw)
* Qstar-2406.14283 （备用）非 OpenAI 研究者自己研究的 `Q*` 算法
	* "Q*: Improving Multi-step Reasoning for LLMs with Deliberative Planning"
		* Wang, Chaojie; Deng, Yanchen; Lv, Zhiyi; Liang, Zeng; He, Jujie; Yan, Shuicheng; Bo, An; 
		> created on 2024-06-28
	* [公众号报道](https://mp.weixin.qq.com/s/DZz_1I-QbrJQLNoOvx7rWQ)
* 2404.01367 谷歌新研究：扩散模型不是越大越好
	* （评）结论有可能仅针对基于 U-Net 的隐扩散模型（LDM），对 DiT 不适用
	* [2024-04-29](https://mp.weixin.qq.com/s/OsYxoK1lq6Z_sUptyaIANQ)
	> OpenAI认为[1]，每增加10倍的计算量，应该让数据集大小增加为约1.8倍，模型参数量增加为约5.5倍。换句话说，模型参数量更加的重要。
	> DeepMind认为[2]，每增加10倍的计算量，应该让数据集大小增加为约3.16倍，模型参数量也增加为约3.16倍。换句话说，数据集大小和模型参数量一样重要。{_o4tm80}
	> 在计算资源有限时，较小的模型（训练步骤多）可以胜过较大的模型（训练步骤少）；
* 机器学习中有哪些形式简单却很巧妙的idea？ - 知乎回答
	* [2024-03-01](https://www.zhihu.com/question/347847220/answer/3351403565)
		> 1. self-gating基本加上都涨点；{_o3198m}
			> 变体有context gating和SE模块等
			> 核心思想都是用自己gate自己
			> 基本形式是 y = sigmoid(wx)x
		> 2. 各种重建，先把输入corrupt一下，然后用autoencoder重建一下，基本都能让feature更robust，何凯明的MAE也是如此。{_o31f0z}
		> 3. 各种dropout，是个地方都可以试着加点dropout，embedding可以加dropout，attention可以加，ffn可以加，mlp可以加，输入上也可以直接加，相当于某种corrupt；{_o31f16}
		> 4. mixup，也是个神级idea，输入上a类+b类混合一下，然后label也变成a+b混合，基本也是无脑增强，必定涨点；{_o31f27}
		> 5. 对比学习大神器，核心就看如何构造正样本和负样本。有个惊艳的idea，同一个输入foward两次，因为dropout不同，就可以当正样本，也是无脑涨点；{_o31f3w}
	* 回答 2：dummy class；{_o31e9c}
		> 做多元分类的时候，加1-3个假类别。比如做3分类，output弄成4分类，那个虚拟出来的假类别（dummy class）不需要训练数据什么，input层面不用管他，只需要output里面写成4分类这么简单。结果会比单纯3分类同样条件下好几个点。
	* 回答 3：LP-FT，分类模型微调，先只微调分类头，后期再整体微调；{_o31f05}
		> LP-FT (linear-probing and then full fine-tuning, ICLR 2022 Oral)，预训练模型微调和OOD generalization领域一个非常简洁有效的idea：
		> 为了避免微调过度破坏预训练表征、影响模型泛化能力，先固定模型主干，训练分类头 (也就是linear-probing），
		> 让分类头有一个比较好的初始化之后，再打开所有参数一起训练（也就是full fine-tuning），可以显著提升微调后模型的OOD generalization（分布外数据上的泛化性能）。
		* 实验结果，与全程全量微调、全程只微调分类头对比，包括 ID 与 OoD
* `2004.08867` （备用）鲁剑锋 NN 逼近理论，考虑高维任意二概率分布，NN 均可近似构造二者间变换
	* "A Universal Approximation Theorem of Deep Neural Networks for Expressing Probability Distributions", NIPS2020
		* Lu, Yulong; Lu, Jianfeng; 
		> created on 2024-01-28
	* 摘要：给定 $\R^d$ 上二分布 $\pi,p_z$，可构造 ReLU 激活 DNN $g_\theta:\R^d\to\R$ 使 $(\nabla g)_\#p_z\approx\pi$；{_o1se6r}
		* 考虑了三种概率距离度量：1-Wasserstein，MMD（maximum mean distance），KSD（kernelized stein discrepancy）{_o1se5l}
		* 估计了随 $d,\epsilon$（二分布距离）的增长，NN 宽度深度需要如何增大：1-Wasserstein 关于 $d$ 指数增大，MMD、KSD 多项式增长
* `InfoBatch-2303.04947` 为加速训练，数据加载随机裁剪掉一定比例的简单（低 loss）样本、剩余样本增大权重
	* "InfoBatch: Lossless Training Speed Up by Unbiased Dynamic Data Pruning", ICLR2024 oral
		* Qin, Ziheng; Wang, Kai; Zheng, Zangwei; Gu, Jianyang; Peng, Xiangyu; Xu, Zhaopan; Zhou, Daquan; Shang, Lei; Sun, Baigui; Xie, Xuansong; You, Yang; 
		> created on 2024-01-28
	* [量子位报道](https://mp.weixin.qq.com/s/Ez69KR5HJuHxXna7_0Ikbg)
		> 在30%的剪枝率下没有任何精度损失。在剪枝率从30%增加到70%的过程中，InfoBatch的精度损失也显著低于其他方式。
		> InfoBatch的前向传播过程中，维护了每个样本的分值（loss），并以均值为阈值，随机对一定比例的低分样本进行修剪。{_o1sj8j}
		> 同时，为了维护梯度更新期望，剩余的低分样本的梯度被相应放大。
		> 对于首个epoch，InfoBatch初始化默认保留所有样本；
		> 此外，InfoBatch还采用了渐进式的修剪过程，在训练后期会使用完整的数据集。
			> 如果一个样本在中间的某个轮次被剪枝，后续依旧大概率被训练到；但在剩余更新轮次不足时，这个概率会大幅下降，导致残余的梯度期望偏差。
			> 因此，在最后的几个训练轮次中（通常是12.5%~17.5%左右），InfoBatch会采用完整的原始数据进行训练。

## Misc
> 以下 2024-01-28 从 freeLit1.md 独立
* RKHS 见课程笔记 (stoSim.md)
* [BNN综述文章介绍](https://zhuanlan.zhihu.com/p/237613269)
	* BNN 贝叶斯神经网络；注意 BNN 同时还指 binary NN
	* [OpenAI 一研究介绍](https://zhuanlan.zhihu.com/p/108093839) 认为应该避免发表“BNN 输出分布编码了模型不确定性”观点
	* eg. DIP 的 BNN 版本 `2021-08-28`(lecNotes) 内含其使用的 BNN 解读
* [吴恩达:转向小数据](https://zhuanlan.zhihu.com/p/466560715)
	* 总结：预言数据为中心的 AI 发展趋势；许多领域只能小数据，面向这类需求
		* 系统寻找改进数据方法（原先研究少且凭直觉）：工具向人提示数据中标记有问题（导致学错）/样本有噪声（导致学不好）的部分，让人针对性收集/合成数据
		* 开发工具让领域专家能自行设计数据、表达其领域知识、构建模型
	* 吴恩达在接受IEEE Spectrum的一段专访中，表达了“是时候从大数据转向小数据、优质数据”的观点。
	* NLP已有基础模型（GPT-3 等），CV也有构建基础模型的潜力……不过它只适用于某些问题，还有一系列场景需要小数据解决方案。
	* 2C 企业用户量大，有大数据用于 DL，但这不适用于其他行业
	* 过去十年里，主要的应用范例就是我们下载数据集，同时专注于改进代码。对于许多实际应用来说，现在更有效的方法是固定神经网络结构，找到改进数据的方法。
	* 现在是时候把这件少数人凭直觉做的事情变成一门系统的事。
	* 事实证明，如果你有50个非常好的数据，你也可以做出有价值的东西，比如缺陷检查系统。
	* 在许多根本不存在巨型数据集的行业，我认为重点必须从大数据转向优质数据。有50个经过深思熟虑的实例就足以向神经网络解释你想要它学会什么。
	* 解释 Landing AI 在做的事：预训练只是难题的一小部分，更大的难题是提供一个工具让制造商能够选择正确的图像集（用于微调），并用一致的方式对图集进行标记
		* 大数据集不怕噪声，小数据不行，需“开发出用来标记出数据不一致的地方的工具”
		* 比如你现在你有10000张图像，其中30张属于一个类别，但这30张的标签不一致。我们要做的一件事就是构建工具来吸引你注意到这个特殊的数据子集，使你能够快速重新对它们进行标记，从而提高模型性能。
	* 有助于消除数据偏见：
		* 以数据为中心的AI给我们带来的强大能力之一是构建（engineer）数据子集。若训出的模型多数时候表现好，只在一个子集有偏差，不必为此改网络架构
		* 数据清洗很重要，但目前都是靠很机械的方式。面对一个非常大的数据集时，这个工具可以快速地将你的注意力吸引到有噪音的数据子集上，针对该子集进行集中收集。
	* 合成数据也是Data-centric AI工具集中的一个重要工具；可用于对表现不佳的子任务针对性生成数据
	* 授权制造业客户自己更正数据、重新训练和更新模型非常重要。
		* 消费互联网可单模型服务上亿用户，制造业有多少制造商就要多少定制模型，不应为每公司雇佣一个ML专家
		* 这个问题在其他行业比如医疗健康领域也存在。
		* 摆脱这一困境的唯一办法是开发出能够让客户自己设计数据、表达专业领域知识的工具，让他们自己构建模型
	* 在过去十年中，人工智能的最大转变是向深度学习的转变。我认为在这十年中，最大的转变很可能是转向以数据为中心的人工智能
* `BAAI-Brain4AI` 智源2021年度《人工智能的认知神经基础白皮书》
	* 希望用脑科学成果辅助 AI 开发
	* 推荐语
		* 专门造了一个新词：“智元（Wiston）”，意思是具有独立智能功能的基本神经回路。
		* 事实上，脑科学已经发现了很多“智元”
			* 例如这份报告第2章提到的位置细胞和网格细胞、第3章提到的吸引子网络、赢者通吃网络，众所周知的视皮层简单细胞和复杂细胞，以及近期热门的记忆痕迹细胞等，已经遍及感知、定位、学习、决策、记忆等多种智能。
		* 把相对独立的智能和实现这种智能的一群神经元（及其网络连接）作为一个整体单元。以“智元”作为基本单元构造的人工智能系统，将是可解释、可预期和可信任的。
	* sec1.2 全局工作空间理论；{n2gg4q}
		* 大意：视觉等单元可并行处理信息，意识为全局工作空间，从低级单元中提取最重要东西处理
		* fig1.11 LIDA 认知循环；{n2gg4g}
			* Learning Intelligent Distribution Agent
			* 生物学启发的综合性、可以计算实现的概念模型
				> 可计算意味着可像 HNN 那样，利用模拟根据数据反推参数 `社会预测的计算与数据范式`(persp*/)
			* LIDA 把认知循环看作是一个认知原子,其中包含了更高层次的认知过程、思考、推理、问题解决、计划、想象等
			* 每个认知循环分为三个阶段:
				* 感知理解阶段（理解当前在环境中的位置）、注意阶段以及动作选择和学习阶段
				* 各个阶段分别由若干相互作用的模块构成
			* 各模块不直接对应大脑功能模块，更多为思维、心智意义上的功能模块
			* 除了意识和行为选择部分以外, 其他过程都可以异步、并行的处理。
		* fig1.12 意识图灵机 (Conscious Turing Machine, CTM)
	* sec1.2.2 Dehaene 等人提议将人类的意识相关计算分成三个水平
		* 无意识加工(C0)包括了大部分人类的智能
			* 例如知觉恒常性、语义提取、决策、学习等,大多在潜意识或无意识状态即可完成。
			* 心理学实验证据，包括 RL 在信号低于意识阈值时也完成
			* 当前 AI 已能完成大多 C0 计算，甚至超过人类
		* 第一种意义意识(C1)称为总体可用性,主要对应意识的传递意义,即有意识的信息需要进一步的处理时,不同的大脑功能模块都可以获取
			* C1 可以看作是一种解决信息共享问题的信息处理架构,无意识计算模块(C0)的信息被整合、筛选,进入意识的全局工作空间,从而可以在不同模块之间进行分享
		* 第二种意义的意识(C2)即所谓自我监控
			* C1访问外部信息的能力，C2表征自己的能力
			* 具体来说,这是一种能够监控自己的信息加工过程,并获得其状态和信息的能力。
			* 这种意识与通常所说的内省(introspection)相对应,即认知神经科学和心理学中的“元认知”(metacognition)
			* eg. 评估知识、记忆、决策可信度，信心不足时增加计算资源或求助
			* 认知神经科学的研究认为, C1、C2 的认知加工过程在物理上分离开,元认知主要与前额叶脑区关系密切,并且具有一定的通用性
			* Dehaene 等人认为,C1 和 C2 虽可能存在交集,但很大程度上正交、互补
	* sec1.2.3 深度学习与全局隐空间理论
		* 现有工作：
			* DeepMind PathNet 网络架构,展现出了强大的、灵活的性能和跨任务模块的泛化能力。
			* Jeff Dean 总结的下一代人工智能框架 Pathways,其基本思路也是需要将单独解决视觉、听觉、语言等不同功能的模块整合起来,
		* VanRullen 等人 实现 DL 全局隐空间(Global Latent Workspace, GLW)的路线图 fig1.14
			* 若干独立的专用 DL 模块，有各自高阶隐空间
			* 全局隐空间 GLW，本质上是一个非模态的、独立、共享的隐空间,负责在不同模块对应的隐空间之间进行变换
			* GLW 维度不低于各输入隐空间的内在维度、远低于其维度之和
				* 后者迫使系统 通过注意力机制 在相互竞争的输入中进行选择（> 强迫进行取舍）。
			* 空间之间的变换可能需满足一些近似拓扑变换的约束,以保持其流形的关键性质(见 sec2)。
			* GLW 也可借鉴 transformer 的注意机制
				* 虽然该“注意”与神经科学中的注意并不相同
			* 若某模块被注意选择，其隐向量复制入 GLW，随后 GLW 信息广播（变换）到其他隐空间
				* 尽管接收模块不一定用上
	* 展望，关于元宇宙：智能体与人类共建元宇宙，并在开放环境中学习、进化；{n2gg45}
		* 猜测科技巨头押注元宇宙原因：为通用人工智能的诞生和进化提供一个足够开放和巨大的环境和生态
* [知乎增量学习小总结](https://zhuanlan.zhihu.com/p/353273834)
	* 增量学习方法种类划分方式多，本文划分为三种范式：
		* 基于正则化和回放的增量学习范式受到的关注更多，也更接近增量学习的真实目标
		* 参数隔离范式需要引入较多的参数和计算量，因此通常只能用于较简单的任务增量学习
		* 关于其他划分方式和不同类别的增量学习的优缺点对比可见A Comprehensive Study of Class Incremental Learning Algorithms for Visual Tasks
	1. 正则化(regularization)
		* 给新任务 loss 加约束，以保护旧知识不被破坏；通常不需要用旧数据复习已学任务
		* 图像多分类任务，用多头网络，处理新任务的不同策略：
			* （整个模型）微调，易灾难性遗忘
			* 联合训练(Joint Training)，在所有已知数据上重训，常被视为「增量学习的性能上界」，成本高
			* 特征提取，只训练为新任务新加的头；不能有效捕获新任务独有的特征表示，新任务性能不好
		* LwF 算法介于联合训练和微调之间，无需旧任务数据
			* 知识蒸馏，即使新模型在新任务上的预测 和 旧模型在新任务上的预测 相近
			* loss 中引入新模型输出的蒸馏损失
			* 缺点：任务混淆(inter-task confusion)，训练时间随任务数量线性，正则项约束不够有效
			* 改进策略……
	2. 回放(replay)
		* 考虑的主问题：「保留旧任务的哪部分数据，以及如何利用旧数据与新数据一起训练模型」
		* iCaRL, 假设越靠近类别特征均值的样本越有代表性；改进，借鉴知识蒸馏技术等改进
			* 可能对旧数据过拟合；改进，梯度片段记忆算法(GEM)
		* 引入 VAE/GAN 思想：利用增量学习的 Bayes 性质，变分推理与 MC；GAN 生成旧数据（用参数间接存储）以避免数据隐私问题
	3. 参数隔离(parameter isolation)
	* 各领域应用：CV,NLP,etc
	* 挑战：
		* 定量评估指标
		* 跳出有监督分类、任务式增量和多头网络结构的框架的限制，如无监督增量学习
* DL学直观物理学
	* [2023-02-16 改格式](https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2650808533&idx=3&sn=b8c65b61034d172e2f984250ba533bb5)
	* “直观物理学”问题：根据图片预测物体运动轨迹，如果绳子断裂预测物体运动，根据碰撞视频推断两个物体质量，看积木图像判断是否稳定（并加上新的块），等等
	* 背后的物理量包括能看到的速度角度，和只能推断的密度粘度（事实上还要推测出有这样的隐含物理量）
	* 工作 Newtonian Neural Network：先预设 12 个物理模型（斜面，抛体，单摆等），“本文作者将物理理解问题描述为从图像到物理抽象的映射，而不是从图像直接估计物理量”，“称为牛顿假设（图 4）的中间物理抽象，由游戏引擎渲染。”
		* “将场景配置作为输入（例如，地平面上方的球），并根据物理学中的运动定律及时模拟它。对于每一个牛顿假设，作者从不同的角度给出了相应的游戏引擎假设。总共获得 66 个游戏引擎视频。”（抽象建模环节，文中展示了有真实场景和引擎简化模拟的图）
		* 自动标记物体受力分析
	* 搭积木网络；“在复杂场景中训练并对简单场景进行预测时，模型的性能显著提高。作者分析这可能是由于模型能够从复杂场景中学习到更丰富和更好的泛化特征。”
	* sec1.3.1 “如果没有锤子，人们可能会用一块石头或螺丝刀的背面来敲打钉子”，是因为有底层物理模型，它可以“可以用来把一个给定的任务转换成一个搜索问题”
		* 工作：如何用棍子戳动横放的瓶子、圆锥、锤子
		> 与 PDE-Net 类似的 model creation
		* 联合的模型：“正向模型根据当前状态和动作预测下一个状态，反向模型根据初始状态和目标状态预测动作。在联合训练中，反向模型目标提供监督，将图像像素转化为抽象的特征空间，然后由正向模型预测。反向模型减轻了正向模型在像素空间中进行预测的需要，而正向模型反过来又使反向模型的特征空间正则化。”（+模型定义公式）“大多数场景中，我们对预测具体的像素不感兴趣，而是希望能够预测更抽象事件的发生，例如对象运动、对象姿势的变化等。使用正向模型的第二个问题是，推断最优行为不可避免地会导致找到受局部最优约束的非凸问题的解。而反向模型就没有这个缺点”（网络架构不是常见的那种，有针对性设计）
	* sec1.4 结合触觉传感器信息
		* MVAE (multimodal VAE): “观测空间的尺寸随着模态的可用性而变化。例如，触觉信息只有在与传感器接触时才可用”，假设有相同隐空间和条件独立的模态，联合分布 $p_\theta(x_1,\dots,x_n,z)=p(z)p_\theta(x_1\mid z)\cdots p_\theta(x_n\mid z)$，后验分布可以根据部分信息计算
		* “将解码器的输出设置为预测未来的帧。”
* 1511.04048 Newton 式图像理解，人为设定 12 运动学场景，对输入图片先识别最接近的场景，用于多预测任务
	* "Newtonian Image Understanding: Unfolding the Dynamics of Objects in Static Images"
		* Mottaghi, Roozbeh; Bagherinezhad, Hessam; Rastegari, Mohammad; Farhadi, Ali; 
		> 2021 春季学期我讲的组会；2025-09-25 补充记录
	* 12 基本物理学模型：斜面下滑，摆，抛物运动，弹跳，平面有摩擦运动 等
	* 造视频库：各模型分别生成多角度渲染视频，利用游戏引擎
	* 找最接近场景：对真场景图像/视频先识别该视频库中最相近的视频；{_p9pl5g}
	* 预测任务：模型预测物体速度、受力、未来运动轨迹等
* `ADEPT-Smith2019MEV` 21春组会我报告的，人心理建模为 HMM 以刻画“意外”，并用 NN 学
	* "Modeling Expectation Violation in Intuitive Physics with Coarse Probabilistic Object Representations", NeurIPS2019
		* Kevin Smith*, Lingjie Mei*, Shunyu Yao*, Jiajun Wu, Elizabeth S. Spelke, Joshua B. Tenenbaum, Tomer D. Ullman
		* [project page (code)](http://physadept.csail.mit.edu/)
		* [NIPS reviews](https://papers.nips.cc/paper/2019/file/e88f243bf341ded9b4ced444795c3f17-Reviews.html)
		> 2021 spring 组会笔记 ideas.md 中 ADEPT 部分，2023-02-16 迁移进来
	* 概述：遮挡变化时物体出现/消失的建模，隐 Markov 模型描述物理状态 $s_t$、视觉观测 $o_t$ 序列；{_p9pm5e}
		* 注：该部分为 2025-09-25 根据当时的组会 slides 记录
		* 物体信息（$s_t,o_t$）：物体类型，位置、速度、角度、尺寸、颜色
		* 感知模块：mask R-CNN 输入图像，输出多个物体的信息
		* 推理模块：物体出现、消失事件的时间回溯推理，是否可由历史的遮挡解释
	* $o_{t,i}$ 角标应该不是完全根据网络输出顺序，而是比对上一步结果按照是否有交集重排
	* 可训练部分应该只有图像分割定位网络，后面的 HMM 是手动设计的
		* 先对当前输入帧 Mask R-CNN（此时不利用时间信息）分割图片，然后对每个对象 $\hat o_{t,i}\odot x_t$ 分割出来后连接 $x_t$（语义信息）、$x_{t-2,t-4}$（时间信息）再输入 ResNet 得到 22 维特征 $o_{t,i}$，其中位置和速度都是 3 分量（因此需要语义信息），
		* 似乎这些量是有监督的（应该是视频制作时保留了位置三维信息）；不过原文没说有这种监督，也许直接无监督训练，在正常视频下极小化 surprise，以间接保证三维信息恢复正确？
	* 不允许碰撞应该是在物理引擎里体现
	* baselines: 
		* CNN，两个网络分别根据 5 帧前、当前帧信息推断当前帧语义信息，使用正常视频训练，测试时二输出差值作为惊讶程度
		* CGAN……LSTM……
	* eqn(1): $\operatorname*{\mathbb{E}}_{s_t\sim p(s_t|o_{\le t})}\left[f(s_t)\right]\approx\sum_mw_t^mf(s_t^m)$, and final usage $p(o_t|o_{<t})\approx\sum_mw_{t-1}^mp(o_t|s_t^m)$（原文有 typo，应该是 $w_{t-1}$ 而不是 $w_t$）
		> 整入了 `freeNotes.md`
		* abbrieviate $s_{t-1}=s_-$, $w_{t-1}=w_-$, $o_{\le t-1}=o_-$; 
		* update of $w_t$: $p(s_t|o_t,o_-)=\int_{s_-}p(s_t,s_-,o_t|o_-)\,\mathrm{d}s_-/\int_{s_-}p(s_t,s_-,o_t|o_-)\,\mathrm{d}s_-\,\mathrm{d}s_t$, $p(s_t,s_-,o_t|o_-)=p(s_-|o_-)p(s_t|s_-)p(o_t|s_t)$，这一变换达到 HMM 回溯一步的效果
			* 分母乘 $f$ 积分 $\approx\sum_mw_-^m\int f(s_t)p(s_t|s_-^m)p(o_t|s_t)\,\mathrm{d}s_t\approx\sum_mw_-^mf(s_t^m)p(o_t|s_t^m)$，即先采样 $s_-$ 的积分，再采样 $s_t$ 的积分，后者为单样本采样
			* 注意分母中 $f$ 换为 1 即得分子，从而相当于对 $w_t$ 归一化
	* resampling 技巧相当于保持 $p(s_t|s_-)p(o_t|s_t)$ 不变，人为改变 $p(s_t|s_-)$ 采样方式从而多采样某些（本来低概率的）点，在这些点处相应降低其 $w_t^m$ 取值（见 SI 文件“we increase the surprise .. by a large factor r”）
* [推荐系统OoD泛化](https://mp.weixin.qq.com/s/0UAX4ZaZ7dJoxYTBWO4Ojg)
	* （评）2022-11-04
	* 推荐系统 OoD 两类：
		> 第一类是自然迁移（Natural Shift）。比如基于某个城市训练出来的一个模型，在推广到其他城市时，推荐算法并不一定还能像训练数据分布下那么优秀。
		> 第二类是人工迁移（Artificial Shift），推荐系统是一个典型的马太效应自增强的系统，基于观测数据训练模型，然后依据模型进行推荐，用户在推荐机制下产生一些交互后，又生成了新的观测数据。
		> 从推荐系统的研究角度来看，还存在着大量人们所不知道的偏差，为了解决这个问题就需要一般性偏差校正（General Debias）。
	* 解决 OoD 问题两核心思路：
		> 一种方式是OOD自适应（OOD Adaptation），主要针对测试分布已知（或部分已知）的情况。
		> 另一种方式是OOD泛化（OOD Generalization），主要针对个分支测试分布是未知的，并且绝大部分情况下和训练分布不同，这个也是我们接下来讨论的重点。
	* 外插的基础是不变性（Invariance）
		> 在I.I.D假设下，唯一要做的就是数据拟合（Data Fitting），只需要规避过拟合（Overfitting）和欠拟合（Underfitting）。
		> 而在OOD场景下，就是要找不变性（Finding Invariance），在找到不变性后，用不变性做预测。
	* 不变性技术路径 1：因果推理
		> 之前有研究可以证明，因果关系（Causality）和不变性（Invariance）之间存在着一定的等价关系。
		* 推荐系统中，重要的是用户的不变性偏好（Invariance Preference）
		> CausPref，从观察数据可用的正反馈中联合学习具有因果结构的不变性偏好，再用发现的不变性偏好继续做预测。
	* 路线 2：寻找异质性
		> 变和不变是共生的。所以如果我们知道数据中存在什么样的变化，就能从变化中发现什么机制没有变。
		* 训练中的少数情况可能测试时成为多数
		> 因为不能确定测试数据分布的情况，所以不变性要求任何一个样本都不被落下。
		> 从而，当存在异质性分布时，首先要识别其中的异质性成分，进一步从异质性成分中找到不变的机制。
		* 识别混杂因素（confounder），如冬天夏天喜欢吃的不同；观测不到，但希望从数据中发现其存在
		> 一个模块是如何进行环境划分，另一个是跨环境找到不变性，而整套方法就可以形容为两个模块迭代优化、循环往复的过程。
* [DL4Math-2212.10535](https://zhuanlan.zhihu.com/p/595669335) 综述性质
	* 常见任务，原文还有基础数据集介绍
		* 数学应用题 MWP，也是 NLP 研究方向
		* 定理证明 TP，包括交互式定理证明 ITP 使用语言模型；涉及形式化逻辑语言
			* （评）相关：((n27l0a))也讨论了相关内容
		* 几何问题解决 GPS：由自然语言和几何图组成
			> 多模态输入包括了几何元素的实体、属性和关系，而目标是找到未知变量的数学解。
			> 涉及解析多模态信息、符号抽象、使用定理知识和进行定量推理的能力。
		* 数学问答 MathQA
	* 三大 NN 模型
		* Seq2Seq 编解码，常用 LSTM、GRU 等
		* 基于 graph 的数学网络：如Sequence-to-tree模型、ASTactic等模型。
		* 基于注意力
		* 此外还有CNN、多模态网络等，
		> 在特定任务中，有使用擅长空间推理的GNN，用于几何问题解析；WaveNet被应用于定理证明，由于其能够解决纵向时间序列数据；还有Transformer生成数学方程等。
	* 大语言模型应用有挑战（略）
	* 在 GitHub 上整理了 [数学推理和人工智能研究课题阅读清单](https://github.com/lupantech/dl4math)
* [NeurIPS2022-ML4phyWorkshop](https://ml4physicalsciences.github.io/2022/) （仅用于引用）
* （备用）【Nature】万字综述：人工智能如何促进科学发现 by DeepMind；{_n85k1z}
	* [2023-08-05](https://mp.weixin.qq.com/s/_MjZXweMT0o3fdY4pDp1Ng)
* 符尧：别卷大模型训练了，来卷数据吧！
	* [2023-09-17](https://mp.weixin.qq.com/s/jUjYnXO-7cXSEyAYbV9AqA)
	* 评估指标：speed of grokking；{_n9hf7l}
		> 模型学习不同粒度技能的速度是不一样的，例如以下技能的难易程度不一样，模型能够学会解决这些问题所需要的时间也不一样，通过比较不同data engineering方法学习同一技能的速度（speed of grokking），可能是一个不错的评估方式。
		> 不同粒度的技能对比：
		> 单一技能：如两位数加法 => 难度低，学习速度块
		> 聚合技能：一位数加法+两位数加法+两位数减法+…… => 难度中，模型所需要的学习时间中等
		> 下游表现：GSM8k 数学作业题表现 => 难度大，模型所需要的学习时间最长
	* 三位数加法学习：“利用越详细的COT中间结果来训练模型，模型学习的速度越快。”{_n9hf8e}
		> Plain：没有任何COT中间结果
		> Reverse：倒过来
			* 即结果先呈现个位、再给十位、百位
		> Simplified Scratchpad：提供部分中间COT推理结果作为训练数据
		> Detailed Scratchpad：提供详细的COT推理结果作为训练数据
		* 只考虑学习速度，最终都是全学到了
	* data curriculum，多任务联合可能提高表现¹，有时可能要依次引入而非同时引入；给了实验结论；{_n9hf8w}
		* ¹按前文说法，似乎是要控制总数据量相同
		* 有时指收敛快，有时是收敛慢但最终效果好
		> （a）：想提高skill 3任务的效果，对比只在skill 3数据上训练和在skill 1，2，3数据上训练，发现在skill 1，2，3任务上训练收敛的速度更快。
		> （b）：想提高skill 1任务的效果，对比只在skill 1数据上训练和在skill 1，2数据上训练，发现在skill 1，2任务上训练收敛的速度更快。
		> （c）：想提上Spanish QG的效果，对比只在Spanish语料和同时在【spanish、English】语料训练，发现在【spanish、English】语料收敛速度慢点，但是最终效果更好。
		> （d）：stance detection任务，也是在stance detection和text matching数据上同时修炼，最终的效果更好。
		> 总结：叠加其他类型的数据，按照一定顺序来训练模型，可能比只在单一任务上训练效果更好，收敛速度更快。
	> Mix ratio（各部分数据比例对模型的影响）{_n9hg3c}
	* 可能只对小模型有用，大模型无用；{_n9hf9t}
		> model scaling（模型尺寸大小对数据工程的影响）：小于30B模型上data engineering有效果不代表大于70B的模型上该方法也会有效果
		> 代码数据对小模型像7B模型的推理能力可能有一定帮助，但对大模型70B就没有帮助了。一些其他的观察也有出现这样的情况。
		> 如果真是这样，那可能不需要来做数据工程了，像data format / curriculum / mix ratio都没必要再做了，只需要做一些数据清洗工作就够了。
	> 不同skll学习曲线和整体loss曲线的关系
		> 单技能的学习曲线通常表现出相变形状（在某个时间节点突然顿悟了）
		> 模型学习不同skill的speed是不同的
		> 集成多个skill到一块，我们可以获得一个平滑的log形状的loss曲线，说明loss函数可能只能反映一个整体的表现，而非每个具体task的效果。{_n9hg2i}
* 1912.01412（备用）用深度学习求积分、解常微分方程；{_n8v960}
	* [2023-08-31](https://mp.weixin.qq.com/s/fm0XwFGrMU182K6RhKYevg)
* `1912.05752` （备用）DL 用于符号不定积分
	* "The Use of Deep Learning for Symbolic Integration: A Review of (Lample and Charton, 2019)"
		* Davis, Ernest; 
		> created on 2023-08-31
* `2101.10382` 课程学习综述
	* "Curriculum Learning: A Survey"
		* Soviany, Petru; Ionescu, Radu Tudor; Rota, Paolo; Sebe, Nicu; 
		> created on 2023-11-21
	* sec3 课程学习方法分类
		* vanilla CL，Bengio 时即已提出，依据手动设计的先验规则（困难程度）安排课程
		* self-paced learning (SPL)，样本馈送到模型的顺序根据模型性能动态计算，不先验已知
		* balanced curriculum (BCL)，额外引入样本多样化要求
		* self-paced curriculum learning (SPCL)，样本训练顺序同时利用先验标准、基于学习的度量
		* progressive CL (PCL) 课程设置不是依据样本难度（传统随机采样），而是模型 capacity 或任务设定，使逐渐增加难度
			* 如训练过程中逐渐提高 dropout 强度；{_nblb1f}
		* teacher-student CL，teacher 模型负责确定 student 模型的最佳学习参数；{_nblb1y}
			* 最开始按深度强化学习的方式提出
		* implicit CL，
		* 有许多文献用的是组合方法
		* 与课程学习相关的方法：强调困难示例；anti-CL 从难到易；主动学习关注样本不确定程度而非难度；
		* 课程学习中的其他要素
			* batching 方法，训练集划为多子集，从最简单子集开始训，训练过程中逐步添加子集、增强训练集
			* 采样技巧（sampling technique），根据难度约束选训练样本
			* 加权（weighting）{_nblb0y}
			* 删除 hard example
			* 连续 vs 迭代 两种 schedule 方法
* 2010.13166 课程学习 另一篇综述，知乎介绍
	* [2023-11-21](https://zhuanlan.zhihu.com/p/362351969)
		* 清华的工作，文章发表于 TPAMI
	* 有效性分析
		* 优化角度，先优化较光滑的问题，再逐渐过渡到不够光滑的问题
		* 数据分布角度
	* 方法总结
		* 预定义的 CL
			* 预定义的难度测量器
			* 预定义的训练调度器：离散调度器、连续调度器，后者在每个 epoch 后调整训练数据子集
		* 自定义的 CL
			* self-paced learning
			* transfer teacher
			* RL teacher，根据 student 模型反馈动态选择数据
			* 其他，BO、元学习、超网络等

