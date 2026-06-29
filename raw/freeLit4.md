* AlphaFold 架构创新关键，不全靠堆算力
	* [2026-06-29](https://mp.weixin.qq.com/s/ENQn_JXpYlPZuHz07b3aFg)
	* 针对性架构设计有效：AF1 基于现成 CNN 效果有限（蛋白质特殊处理在架构之外），AF2 针对性设计后准确率明显提升
		> AlphaFold 1 用的是在计算机视觉里开发好的现成 CNN，所有针对蛋白质的特殊处理，不过是包在外面的一层补丁。
		> 到了 AlphaFold 2，核心理念变了：它要针对蛋白质折叠这个任务，从头搭一个科学架构。
		> 于是就有了那个庞大的主干 EvoFormer。{_q6tf91}
			> 它利用了一个事实：蛋白质演化极其缓慢（人体内的蛋白质结构，往往和酵母菌、甚至大肠杆菌里的极其相似），所以能抓来成百上千条进化相关的序列，
			> 这便可以在“几何认知”和“演化认知”之间搭起桥梁。
			> 这一主干占用了 90% 以上的计算量，但也贡献了 90% 以上的准确率。
		> 再往后，是被 Jumper 称作“几何化引擎”的结构模块，
			> 里头有巧妙的“不变点注意力机制”（IPA），
			> 和一个起了决定性作用的损失函数，“框架对齐点误差”（FAPE）。
	* 等变性、SE(3) 不变性贡献有限，直观解释为该对称性不够强
		> 外界一口咬定，等变性（equivariance）和 SE(3) 不变性就是 AlphaFold 2 能成功的唯一原因。
		> Jumper 并不认可，于是索性做了一大堆消融实验，把各个组件一个个关掉，看结果会如何发展。
			> 他发现 AlphaFold 2 在 GDT 指标上比 AlphaFold 1 高出大约 30 分；而把不变性和等变性拿掉，顶多也就损失 2 到 2.5 分。{_q6tf9e}
			> Jumper 无奈地说，“它确实有贡献，可这只是 30 分里的 2.5 分而已。
		> 他认为是全局 SE(3) 对称性其实算不上一种很强的对称性，{_q6tf9i}
			> 跟“所有残基都是置换不变的”那种量级根本没法比；
			> 它只是一个乱糟糟的现实问题里冒出来的对称性，起不到物理学里那种从对称群一路推出整套定律的决定性作用。
	* 简化架构、去除非必要模块后性能增长有限
		* 卷积非必要
			> 有一回团队在处理成对信息时，把轴向注意力和卷积混着用；
			> 后来有人干脆把所有卷积层都删了，一个参数没加，总参数量实打实地降了下来。
			> 结果模型反而更准，验证损失也改善了。
		> 还有消融实验显示，把原始遗传信息去掉、改用成对相关性，性能也就掉一两分。
		> 而可解释性分析又发现，AlphaFold 大部分的模型容量，都花在了从几何层面去优化结构上；
			> 过了最初几层之后，它更像一个“几何引擎”，而不是“进化引擎”。{_q6tg08}
		> 这些洞见后来全被带进了 AlphaFold 3。
		> 团队选择大刀阔斧砍掉 EvoFormer 的层数，换成简化版的 Pairformer，性能反倒上去了。
	> 也正是由此，Jumper 表明了他对“苦涩的教训”的反对：
		> AlphaFold 2 在架构和训练上注入的那些定制化创新，换来的是 100 倍的数据效率飞跃；{_q6tg0m}
		> AlQuraishi 实验室曾经只用 1% 的 PDB 数据（大约 1,500 个结构）重训 AlphaFold 2，准确率竟然就超过了 AlphaFold 1。
		> 所以他认为，AlphaFold 带来的启迪绝不是学者不该继续做架构研究。
	* AF3 突破来源，Transformer/扩散 的解释过度简化，扩散仅用于最终重建
		> AlphaFold 3 的真正突破，是从只盯着单个蛋白质，扩展到整个蛋白质电影宇宙：
		> 蛋白质会和胆固醇这样的脂质分子结合，也会和药物（通常是二三十到五十个原子的小分子）结合。
		> AlphaFold 2 不能回答“这种药物如何结合”的问题，它只会说“你最好给我一个蛋白质”；
		> 而 AlphaFold 3 把模型扩展到了 PDB 里出现的所有物质，所以能指出药物结合的精确位置。
	> 至于其中的扩散过程，Jumper 强调它和图像领域的扩散截然不同。
		> AlphaFold 3 有一个巨大的、只运行一次的主干网络，这部分根本不是扩散；分子结构很可能就是在这里被决定的。
		> 扩散过程扮演的角色，更像当年的结构模块：一台“几何化引擎”，接收一组相当精准的约束，对整体结构已有清晰的宏观概念，再据此求解微观细节。
			> 他举了一个很妙的对比。
			> 图像扩散是先生成一堆彩色色块，到后期才决定这些色块代表什么意思；你甚至能中途叫停、重新运行，对同样的色块得出截然不同的解读。
			> 但蛋白质不行。对蛋白质而言，宏观的大尺度结构才是最难的部分。
		> 尽管技术上它确实是扩散模型，但其内在逻辑远比想象中更接近 AlphaFold 2。
			> AlphaFold 2 是凝聚式地工作：先搞定最容易预测的局部碎片，再慢慢拼装成整体。
			> 而 AlphaFold 3 的扩散网络必须反过来，{_q6tg14}
				> 率先跨过“两个蛋白质如何相互结合、它们主干的相对位置在哪”这道门槛。
					> 它靠的是前面庞大的主干加上扩散网络的第一遍前向传播，先求解出整体宏观结构，
				> 之后的扩散过程只是在敲定那些尚未解决的细枝末节、在各种可能的细节里采样。
		> Jumper 真正想表达的是，纠结“它是扩散模型还是 Transformer”远不如理解那些关键的技术细节来得重要。
* 2308.02287 分类模型输出引入冗余类可提效果
	* "Frustratingly Easy Model Generalization by Dummy Risk Minimization"
		* Wang, Juncheng; Wang, Jindong; Hu, Xixu; Wang, Shujun; Xie, Xing; 
		> created on 2026-06-23
	* [知乎介绍](https://www.zhihu.com/question/715950129/answer/2049801878226067753)
	> 多出来的 dummy class 虽然永远不是正确答案，却仍然进入 softmax 的归一化项。{_q6nl1m}
	> 模型不仅要把猫和狗、车和飞机分开，还要把每个真实样本从几个没有语义的“虚空类别”旁边拉开。
		> 从梯度角度看，这件是就不是简单的加几个空白选项了。
		> 换句话说，每一个训练样本会与这些 dummy class 产生排斥关系。dummy class 改变了整个表示空间的受力方式。
		> 原来模型只需要在 10 个真实类别之间找到分割方式；现在它要在一个更大的输出空间里找到分割方式。
		> 这个额外空间没有提供新知识，却改变了 loss landscape，也改变了梯度下降走到哪里的概率。
* 2605.06152 loss spike 源于 fp32 下溢，正确类梯度长期消失后突然恢复，被 Adam 放大
	* "Grokking or Glitching? How Low-Precision Drives Slingshot Loss Spikes"
		* Hanqing, Liu; Cao, Jianjun; Li, Yuanze; Zhou, Zijian; 
		> created on 2026-06-20
	* [公众号报道](https://mp.weixin.qq.com/s/LS2zK_mD68e653_ao2QeZg)
	> loss下降到极低，然后突然飙升，再缓慢恢复，周而复始，像有节律的心跳。
		> 这就是所谓的Slingshot机制，多年来被当作优化动力学里的神秘现象来研究。
	> 模型训练久了，进入一个高置信阶段，正确类别的logit比其他类别大出很多。
		> 当这个差距超过float32的精度阈值（由23位mantissa决定），PyTorch计算log-sum-exp时就会发生"吸收误差"：{_q6kg3a}
		> 正确类的softmax梯度被精确地舍入为零，而其他类的梯度仍然非零。
		> 这个现象叫Softmax Collapse（SC）。
		* （评）自行推导可看出吸收误差
			* 输出 $p_j=softmax(s)_j$，末层投影 $s_j=w_j\cdot v$
			* 设正确类 i，交叉熵 loss $l=-\log p_i=-s_i+\log(\sum\exp(s_j))$
			* 梯度 $\nabla_wl=-\nabla_ws_i+\sum softmax(s)_j\nabla_ws_j$
			* $w_i$ 梯度 $=(-1+softmax(s)_i)v$，softmax 结果接近 1，尾数不足导致（尾数下溢）得 0
			* $w_j$ 梯度 $=softmax(s)_jv$ 尚未触发指数下溢
			* 前层权重梯度类似，$\nabla_ws_i$ 贡献被清零
	> SC本身早有人发现，但这篇文章揭示了它更深的连锁反应。
		> 在精确算术里，cross-entropy对所有类的梯度之和恒为零（零和约束），所以权重的均值（或者说重心）也是恒定的。
			* （评）梯度和为 0 不代表更新量和为 0 吧？除非用的是 SGD 而非 Adam
		> SC发生后，正确类梯度消失，这个约束被打破。
			> classifier的权重均值WG开始偏移，并且是沿着feature均值µG的反方向漂移（这个能算出来）。
			> 然后这个漂移又会反过来影响feature本身，两者互相放大，形成正反馈。
			> WG和µG越来越反平行（因为µG越来越指向-WG），模长指数增长。
		> 论文把这套机制叫做Numerical Feature Inflation（NFI）。
	> NFI的指数增长最终会让某些训练样本的logit跌回到SC阈值以下，
	* （评）logit 回落机制我没搞清楚；末层线性投影权重尽管 $w_i$ 未更新，但其他 $w_j$ 的更新方向也是向着使分类结果 logit 更正确的方向走的，因为是在降低错误类的预测概率？
		* 以下为 DeepSeek V4 Pro 读原文后解释的 logit 回落机制（未用更可靠的 GPT 核验）
		* 大意：分类头权重巨大→ 反传到前层的该项梯度分量巨大→ 前层特征结构退化→ 区分类别能力降低
		> 经过严格推导，我得出结论：**在论文的数学框架内（`W_G` 与分类子空间正交），NFI 本身确实不会直接降低 margin。**
		> 论文 3.3 节真正的论据不是「NFI 降低 margin」，而是另一个机制：
		> ### 被淹没的分类信号
			> NFI 发生后，特征梯度中 `εW_G` 分量随 `W_G` 指数增长。
			> 反向传播到更早的网络层时，这个分量**淹没了**分类子空间的梯度信号。后果是：
			> - 网络的前层不再有效地学习类别区分性特征
			> - 分类子空间中的特征结构逐渐退化（`h*` 变得嘈杂、萎缩）
			> - 类内方差增大，部分 outlier 样本的分类 margin 跌破阈值
			> 论文 3.3 节的原话其实暗示了这一点：
			> > After this exponential growth continues for some time, **the intra-class variance can become comparable to the inter-class variance**.
			> 关键不是单个样本跨过决策边界，而是**整体分类结构在 NFI 主导的训练中被「挤掉」了**。
		> （论文）给人的印象是「`W_G` 漂移 → margin 下降」，
			> 但实际机制是「`W_G` 漂移 → 梯度被 NFI 方向主导 → 分类子空间退化 → margin 下降」。
			> 这是一个间接的、通过梯度竞争实现的退化过程，而非直接的几何效应。
			> 论文的数学推导（Theorem 3.4、Proposition 3.6）只证明了 NFI 的存在和增长，
			> 但 margin 退化的因果链路更多依赖实验观察（Fig 2b 等）而非严格推导。
		> 这篇论文的核心贡献在于**识别出 NFI 这个数值精度导致的反馈循环**，
			> 以及**NFI 为 Slingshot spike 准备了巨大的有效学习率**。
			> 至于 NFI 如何精确导致 margin 退化，这一环的论证相对薄弱。
	> 这时候正确类梯度突然回来了。
		> 但在此期间，由于梯度一直接近零，Adam积累的有效学习率已被放大到极限，相当于η/ε_Adam这个量级。
		> 梯度一旦复活，Adam用这个超大的有效步长一刀切下去，参数更新幅度比正常大约50倍。
		> loss直接被打飞到接近随机猜测的水平。
	* 验证实验，多方案均可抑制；{_q6kg94}
		> 最直接的验证实验是，只要在计算logit/loss时把精度切换到float64（参数仍用float32存储），Slingshot就完全消失。
		> 或者把Adam的ε从默认的1e-8调到1e-5，尖峰同样消失。
		> 在classifier之前加BatchNorm也有效，因为BN隐式地强制了特征均值为零，阻断了NFI的反馈回路。
	> 其实这篇文章并不否认Slingshot和grokking的联系。
		> 论文认为这些尖峰充当了隐式扰动。
		> 让训练在不同区域重新探索，最终落入更平坦、更泛化的解。
	* （评）试完整因果链分析
		* 正向线性因果机制：预测结果准→ $w_i$ 梯度 0（SC）→ 权重更新方向有偏→ 预测结果略不够准→ $w_i$ 梯度非零→ Adam 对 $w_i$ 更新量巨大→ 预测结果极不准→ loss spike；{_q6kg2m}
		* 初始缺点：loss 上升
		* ← 模型预测结果很差
		* ← 模型权重变化大（“权重”范围以下默认“针对正确类输出”，即 $w_i$）
		* ← Adam 更新量大（前步；以下默认继承该条件）
			* 学习率大（本问题不考虑）
			* 累积动量大
				* 历史动量大（不合实际）
				* 当前梯度大
					* 反传梯度系数非零
					* ← softmax 与 1 距离大于浮点数舍入误差
					* ← 正确类预测概率（softmax）偏小
					* ← 网络权重不准
					* ← Adam 更新方向有偏（再前步；以下默认继承该条件）
					* ← 反传计算所得梯度有偏
					* ← $w_i$ 梯度计算结果为 0
					* ← $w_i$ 梯度算式中 1 - softmax(s)ᵢ 浮点计算结果为 0
						* softmax(s)ᵢ 与 1 过于接近
							* 正确类预测概率足够准
								* 网络训练总时间长
								* 网络拟合能力足够强
						* fp32 尾数精度不足
				* 动量记忆 $\beta_1$ 小
			* 累积二阶矩小
				* 历史二阶矩小
					* 历史梯度长期为 0（见上方已分析：$w_i$ 梯度计算结果为 0）
				* 当前梯度小（不合实际）
				* 二阶矩记忆 $\beta_2$ 大
			* 数值稳定常数 $\epsilon$ 小
				* 方案—1e-8 增大至 1e-5 可解决
* TWEO-2511.23225 fp8 训练异常大幅激活值抑制，靠训练惩罚项抑制
	* "TWEO: Transformers Without Extreme Outliers Enables FP8 Training And Quantization For Dummies", CVPR 2026
		* Liang, Guang; Shao, Jie; Tang, Ningyuan; Liu, Xinyao; Wu, Jianxin; 
		> created on 2026-06-19
	* [公众号报道](https://mp.weixin.qq.com/s/OVwFCaR1vvPTZx7d8LqlVQ)
	* 大幅激活值归因：权重（而非输入）取值，源于训练，时机为 MLP 二投影主奇异方向+输入共线；{_q6j881}
		> Qwen2.5-0.5B上做三组对比：真实输入+预训练权重、真实输入+随机权重、随机输入+预训练权重。
		> 这组三联图的关键，是把“输入”和“权重”拆开看：只换输入，异常值还在；只换成随机权重，异常值就弱下去。
		> 也就是说，输入内容可能影响异常值出现的位置和强弱，但它不是根因；真正持续制造极端异常值的，是预训练后 Transformer block内部形成的权重结构。
		> 直观地说，训练会让MLP里某些方向逐渐变成“放大器”。
		> 当down-projection 的某一行与up-projection的主奇异方向共线，且输入也投到这个方向上时，原本普通的激活会被连续放大，最后在某个维度上突然冲成极端值。
	> 因此，论文把问题从“清洗输入数据”转向“约束训练中形成的激活结构”：如果异常值是在训练过程中被模型自己放大的，就需要在训练阶段从源头压住它。
	* TWEO 正则化项，惩罚激活值 lp 范数的期望；{_q6j887}
		> TWEO不改Transformer结构，只是在原有任务损失外加入异常值抑制项。
		> 正常激活基本不受影响，极端激活试图冲高时会被压回可控范围。
	* 实验 4，推理阶段对量化也有益
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
