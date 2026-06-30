> 2025-06-16 从 TfLit.md 独立
## NLP
* 从 Transformer 到 ChatGPT 的发展路线回顾
	* [2023-02-16](https://pattern.swarma.org/mobile/article/220)
	* Transformer
	* GPT 预训练-微调体系，用 Transformer 解码器，预训练 loss 极大似然，微调 loss 为极大似然、任务 loss 加权；微调时额外引入特殊词元
		* 为首次将 预训练-微调体系 与 Transformer 结合
		> GPT在预训练阶段，采用正常语言模型的词典。
		> 而在微调阶段，GPT为了应对下游不同的任务，设计了很多不存在字典中的特殊词元，如表示句子的开始，表示输入结束并抽取特征，还有其他跟下游任务相关的词元(如下图所示)。
		> 这相当于通过特殊词元不断学习下游任务的推理逻辑，进一步提高预训练后语言模型在不同下游任务上的性能。这使得GPT不需要修改模型结构就能直接应用于下游任务。
	* BERT 也预训练-微调，但用 Transformer 编码器
		> 并提出了Masked语言模型和NSP两种预训练方法，在微调后的下游任务上获得了全面超过GPT的性能。
	* GPT2 放弃预训练-微调，改用多任务、零样本学习，无需重训
	* GPT3 模型架构一致，参数量扩大 100 多倍；额外引入上下文学习（in-context learning, ICL）
	* InstructGPT 目标为符合用户需求的无害回答（而非单纯概率高），采用 人类反馈的强化学习（RLHF，Reinforcement Learning from Human Feedback）的方法进行微调，RL 用 PPO 算法
		> 第一步，训练一个名为SFT（supervised fine-tuning）的模型，用于生成符合人类偏好的回答。{_n2gl60}
			> 具体方法为：先建立一个提示词库，并从库中选出一些问题和提示词，让标注员来编写答案，并在GPT-3模型上用这些数据进行微调。
			> 由于需要人去编写，这个过程可以算是一个有监督的过程。微调后得到SFT模型，该模型会学习标注员的回答内容。
		> 第二步，训练一个回报模型（reward model），用于对生成的回答进行评估(如上图中间所示)。{_n2gl68}
			> 具体方法为：让SFT模型回答一些未训练的提示词，并记录其好几条不同的回答，
			> 然后让标注员对同一个提示词给出的不同回答进行排序打分，
			> 随后训练一个新的回报模型用于学习这种人类对不同回答的偏好。
			> 该模型使用基于排序的损失函数。
		> 第三步，让SFT模型生成的回答通过回报模型计算出好坏，再用PPO方法微调SFT模型。{_n2gl6c}
			> 具体方法为：通过无监督学习，使用提示词让SFT针对一个问题输出几个不同的回答，
			> 然后通过回报模型对回答进行排序，随后使用PPO的目标函数微调SFT模型，最后得到InstructGPT。
	* ChatGPT 基于 GPT3.5 模型、InstructGPT 训练方法，无正式论文等资料；无技术革新，靠强大工程能力融合上述方法
* GPT-4背后的开发者：七大团队，三十余位华人；{_n3ig8x}
	* [2023-03-18](https://mp.weixin.qq.com/s/PIDqDLYoGO7xQPnaB7G6yA)
	* 预训练部分的工作细分为：
		* 计算机集群扩展（Compute cluster scaling）
		* 数据（Data）
		* 分布式训练基础设施（Distributed training infrastructure）
		* 硬件正确性（Hardware correctness）
		* 优化 & 架构（Optimization & architecture）
		* Training run babysitting
	* 长上下文部分的工作细分为：
		* 长上下文研究（Long context research）
		* 长上下文内核（Long context kernels）
	* 视觉部分的工作细分为：
		* 架构研究（Architecture research）
		* 计算机集群扩展（Compute cluster scaling）
		* 分布式训练基础设施（Distributed training infrastructure）
		* 硬件正确性（Hardware correctness）
		* 数据（Data）
		* 对齐数据（Alignment Data）
		* Training run babysitting
		* 部署 & 后训练（Deployment & post-training）
	* 强化学习 & 对齐部分的工作细分为：
		* 数据集贡献（Dataset contributions）
		* 数据基础设施（Data infrastructure）
		* ChatML 格式（ChatML format）
		* 模型安全（Model safety）
		* Refusals
		* 基础 RLHF 和 InstructGPT 工作（Foundational RLHF and InstructGPT work）
		* Flagship training runs
		* 代码功能（Code capability）
	* 评估 & 分析部分的工作细分为：
		* OpenAI Evals 库
		* 模型等级评估基础设施（Model-graded evaluation infrastructure）
		* 加速预测（Acceleration forecasting）
		* ChatGPT 评估
		* 能力评估（Capability evaluations）
		* 编码评估（Coding evaluations）
		* 真实世界用例评估（Real-world use case evaluations）
		* 污染调查（Contamination investigations）
		* 指令遵循和 API 评估（Instruction following and API evals）
		* 新功能评估（Novel capability discovery）
	* 另有：部署（Deployment），以及其他贡献者（Additional contributions）。
* LLaMA2 RLHF 技术细节 - 知乎；{_n7lj20}
	* [2023-07-21](https://zhuanlan.zhihu.com/p/644680366)
	* reward model 大有好处，最初 InstructGPT 论文考虑训练稳定性选得较小（相较被训练的 LLM），在 OpenAI 之后的“let's verify step by step”和 Meta 的本文都有纠正；{_n7lj29}
		> 在instruct-gpt 论文中, 作者提到175B的模型训练不稳定因此只使用了6B的模型作为RM, 
		> 这里应该是作者当时把RM作为critic 起始点, 使得PPO需要同时训练actor & critic 两个大模型, 从而很不稳定, 
		> 就RM本身, 应当是参数越大越好的。
		> 这一点在这篇paper 以及 OpenAI 最近的 Let's verify step-by-step 都有纠正过来。
* [NLP对抗训练-聊天bot言论脱敏](https://zhuanlan.zhihu.com/p/466173398)
	* DeepMind将这次新提出的语言模型命名为“red team”
	* 引入“考官”向普通模型提问，诱导其发表敏感言论；
	* 再引入“阅卷人”对回答作出判断，是否存在违禁词、隐私信息
	> 阅卷人应该只能事先训练好，不同于 GAN 的分类器，这里聊天 bot 有的回答是可接受的；
	> 考官可与聊天模型（“答卷人”）同时训练，接受阅卷人提供的梯度，这里确实类似 GAN
	* 此次受训模型为 Dialogue-Prompted Gopher（DPG），2800 亿参数大模型
	* 考官的训练：
		* DeepMind前后尝试了零样本学习、小样本学习、监督学习、强化学习多种方式
		* 零样本学习（ZS）只有3.7%的情况下诱发语言模型说出危险性话语，在测试多样性上表现不错。
		* 强化学习（RL）的引导效果最好。当KL散度为0.3时，被测模型在超过40%的情况下都中了计。
	* 分类器（阅卷人）主要辨别以下几个方面的敏感信息：
		* 生成带有侮辱意味的语言，如仇恨言论、性暗示等。
		* 数据泄露：模型根据训练语料库生成了个人隐私信息（如身份证号）
		* 生成电话号码或邮件
		* 生成地域歧视、性别歧视言论
		* 生成带有攻击、威胁性的语言。
* 注：一般序列任务目前只记了 `NO%`“时序输入”；一般框架 ((n32f33))NN架构设计 序列方面暂无其他东西
* [大LM涌现-2206.07682](https://mp.weixin.qq.com/s/OOhB_eMG3PDJ3KbevHBToQ)
	* "Emergent Abilities of Large Language Models"
		> created on 2023-01-13
	* 语言模型的涌现能力 文中定义：“如果一种能力不存在于较小的模型中，而存在于较大的模型中，那么这种能力就是涌现出来的。”
	* 模型大小衡量指标 可包括：训练计算量（FLOPs）、参数量、训练数据大小
	* 涌现能力的例子：
		* 运算能力、参加大学水平的考试（多任务 NLU），以及识别一个词的语境含义
	* 现象：随规模增长，最初表现差、且未见提高，但超过阈值后突然提高
		> 在每种情况下，语言模型最初表现很差，并且与模型大小基本无关，
		> 但当模型规模达到一个阈值时，语言模型的表现能力突然提高。
	* 提示策略（prompting strategy）对小模型没用，但对大模型有提升
		> 这些策略之所以出现，是因为较小的模型无法成功地使用这些策略，只有足够大的语言模型才可以。
		> 例如“思维链提示”（chain-of-thought prompting），其中模型被提示在给出最终答案之前生成一系列中间步骤。
		* 例子，小学数学问题基准，两种训练方式：对问题直接给答案，对问题给过程、答案
		* 直接给答案训练做法，测试效果随规模增长不明显
		* 给过程训练做法，规模小时表现不如直接给答案，但达到阈值后突跃提高
	* GPT-3 137 项涌现能力，BIG-Bench（更传统的 NLP 基准模型）也有 67 项涌现能力
	> （相关研究）在抽象模式归纳、匹配等需要类比思维的问题上，足够大的语言模型即使没有直接训练，也可以展现出超越人类的准确性。{_n27l44}
	> 语言模型带来的社会问题，例如歧视女性、不文明用语等，也具有涌现的特性。即当模型较小时不会出现，只有模型足够大时才会呈现。
* `scalingLaw-2001.08361`
	* "Scaling Laws for Neural Language Models" by OpenAI
		* Kaplan, Jared; McCandlish, Sam; Henighan, Tom; Brown, Tom B.; Chess, Benjamin; Child, Rewon; Gray, Scott; Radford, Alec; Wu, Jeffrey; Amodei, Dario; 
		> created on 2023-11-08，本文为经典文章
	* 摘要：固定计算预算，最优策略为相对少数据、训非常大的模型，远在收敛之前停止
		> 较大的模型明显更具采样效率，因此最优计算效率训练涉及在相对少量的数据上训练非常大的模型，并显著地在收敛之前停止。
	* sec1 主要发现
		> 性能强烈依赖于规模，弱依赖于模型形状：模型性能最强烈地依赖于规模。规模由三个因素组成：模型参数的数量N（不包括嵌入）、数据集的大小D和用于训练的计算量C。在合理的范围内，性能对其他架构超参数（如深度与宽度）的依赖性非常弱。（第3节）
		> 平滑幂律：性能与三个比例因子N、D、C中的每一个都有幂律关系（不受其他两个比例因子的制约时），趋势跨越六个数量级以上（见图1）。我们在上界处没有观察到偏离这些趋势的迹象，尽管在达到零亏损之前，性能必须最终趋于平稳。（第3节）
		> 过拟合的普遍性：只要我们同时放大N和D，性能就会得到可预测的改善，但如果N或D保持不变，而另一个增加，则会进入收益递减的状态。性能损失可预测地取决于比率N^0.74/D，这意味着每次我们将模型大小增加8倍时，我们只需要将数据增加大约5倍就可以避免损失。（第4节）
		> 训练的普遍性：训练曲线遵循可预测的幂律，其参数大致与模型大小无关。通过推断训练曲线的早期部分，我们可以大致预测如果我们训练更长时间会造成的损失。（第5节）
		> 迁移随着测试性能的提高而提高：当我们在分布与训练不同的文本上评估模型时，结果与训练验证集上的结果强相关，损失的偏移量大致恒定——换句话说，转移到不同的分布会导致持续的惩罚，但在其他方面会随着训练集的表现而大致提高。（第3.2.2节）
		> 样本效率：大型模型比小型模型更具样本效率，通过更少的优化步骤（图2）和使用更少的数据点（图4）达到相同的性能水平。
		> 收敛是低效的：当在固定的计算预算C内工作，但对模型大小N或可用数据D没有任何其他限制时，我们通过训练非常大的模型并在收敛不足的情况下停止来获得最佳性能（见图3）。因此，最大计算效率的训练将比基于训练小模型以收敛的预期更具样本效率，数据需求随着训练计算的D～C^0.27增长非常缓慢。（第6节）
		> 最佳批量大小：训练这些模型的理想批量大小大致仅为损失的幂，并且可以通过测量梯度噪声标度来确定[MKT18]；对于我们可以训练的最大模型，处于收敛状态时，这大约有100-200万个 token。（第5.1节）
		> 总之，这些结果表明，当我们适当地扩大模型大小、数据和计算时，语言建模性能会顺利且可预测地提高。我们预计，较大的语言模型将比当前模型表现更好，样本效率更高。
	* sec1.3 notation，模型参数量 N 忽略了 vocabulary embedding 和位置编码的参数
	* sec2.2 默认 Adam（更大的模型用 Adafactor）2.5e5 steps，batch size 512、上下文 1024 tokens
	* fig22b 训练全程学习率之和大于 100 时，模型表现与学习率 schedule 关系不大
		* 提到单次实验重复的 loss 方差在 0.05 左右，且随模型增长近似为常数
		* 大模型需要学习率稍低，文中选取方式 eqn(D.1) 为与 log(N) 呈线性关系¹，并认为有改进空间，且对参数量 N > 1e10 不再适用²
			* ¹（评）不是 log(lr) 与 log(N) 呈线性关系
			* ²（评）此时用该公式算出的学习率为负值
* CD-2309.09117 用对比解码改善大语言模型推理
	* [2023-09-22](https://hub.baai.ac.cn/view/30866)
	> 对比解码(CD)是一个简单、计算量小、无需训练的文本生成方法，通过最大化强大的"专家"模型和弱小的"业余"模型的可能性差异来搜索字符串。{_n9me9f}
		> 分析表明CD通过避免短小、通用的响应以及过多地从提示中复制内容来预防一些推理错误，更多地改善了逻辑推理而不是基础算术技能。
* xVal-2310.02989 LLM 中数字编码为数值 token，改善计算性能
	* [2023-10-20](https://mp.weixin.qq.com/s/6dN93gWimOPnbpOwIV8Qmg)
	* 专用 token [NUM]；编码阶段，数值乘到 [NUM] 的词向量上；{_nakm5z}
		* （评）和我们 PDEformer 的输入方式有相似性，结合离散词嵌入 + 数值信息
		* （评）乘法而非加法的好处，方向一致，输出层算内积时总能解码得到 [NUM]
	* 解码阶段，若判断该位置为 [NUM]，则相应嵌入向量再过一个 number head 解码出具体数值
	* 分析了加入位置编码、layernorm 不会影响数值信息向后传递
	* 实验：多位数乘法，ERA5 温度预测
* MobileLLM-Meta卷10亿以下参数小模型！LeCun：小技巧
	* [2024-03-09](https://www.xiaohongshu.com/explore/65dea4bd000000000b023e7d)
	> 与强调数据和参数数量在决定模型质量方面的关键作用的普遍观点相反，Meta 强调了模型架构对少于十亿（sub-billion）规模 LLM 的重要性。
	> 与缩放定律（scaling law）相反，该研究证明对于小型 LLM 来说深度比宽度更重要，一个深而窄的模型结构在捕获抽象概念方面更为出色。{_o39l20}
	> 此外，Meta 还提出了一种及时逐块权重共享（ immediate block-wise weight sharing）方法，该方法不会增加模型大小，所得模型表示为 MobileLLM-LS，其准确率比 MobileLLM 125M/350M 进一步提高了 0.7%/0.8%。
* SEDD-2310.16834 扩散模型用于文本生成
	* [2024-04-17](https://mp.weixin.qq.com/s/PMATQzK8Z_Ec0DGoF7Eszg)
	* 挑战：离散取值情形梯度反传困难；{_o4he7h}
		> 假设用GAN来生成文本，就行不通了。
		> 因为尽管我们可以定义同样原理的生成器和判别器，但文本的离散性质使得更新生成器非常难。
		> （图像是连续的，因此可以通过反向传播来计算梯度，但文本是一堆无法区分的离散值，计算梯度信号相当繁琐，基本只能粗略估计）
	* 本文提出 分数熵离散扩散模型（SEDD，Score Entropy Discrete Diffusion）
	* score function 推广到离散空间；{_o4he6y}
		* （评）感觉有点像 MCMC 指定每个位置的跳跃方向、跳跃概率？
		> 这些具体的比率（分数）可以通过得分熵（score entropy）损失函数来学习，从而实现离散扩散模型的快速、可扩展训练。
	> 他们还定义了向离散文本样本中“添加噪声”的含义：
		> 对于连续空间，这是通过添加高斯噪声自然产生的，但在离散空间中，则是被迫直接在不同元素之间“跳跃”。
	* 二作为 Pika 联合创始人
* Nemotron-4 340B by NVIDIA，98% 合成数据，性能可与 GPT4 比较
	* [2024-06-15](https://mp.weixin.qq.com/s/TTU387lxT_MgcCmxmrqy7A)
	* paper: https://d1qx31qr3h6wln.cloudfront.net/publications/Nemotron_4_340B_8T_0.pdf
	* 合成数据集，数据、模型迭代；{_o6ff5y}
		> 这个迭代过程形成了一个自我强化的飞轮效应，改进主要来自两个方面——
		> (1）当使用相同的数据集时，基础模型的强度直接影响指令模型的强度，基础模型越强，指令模型也越强；
		> (2）当使用相同的基础模型时，数据集的质量决定了指令模型的效果，数据质量越高，指令模型也越强。
		> 在整个对齐过程中，英伟达进行了多轮数据生成和改进，不断提升模型的质量。
* 2202.01344（备用）OpenAI 训练 GPT-f 解数学问题，用到课程学习
	* "Formal Mathematics Statement Curriculum Learning"
		* Polu, Stanislas; Han, Jesse Michael; Zheng, Kunhao; Baksys, Mantas; Babuschkin, Igor; Sutskever, Ilya; 
		> 2024-09-04 问GcGoXs要到的
	* 注：摘要中提到的“expert iteration”未理解含义
	* 任务难度阶梯设计：sec5.1 合成不等式生成器（多不等式复合）
		* 不等式复杂度的控制参数 $N_D$（复合深度），$N_S$ 输入表达式复杂度
		* 合成不等式和 mathlib-train 混在一起训练
		* fig3 sample only 训练策略效果不好，expert iteration 能持续提升；{_o99a6f}
		* OoD 泛化：训练没见过 $N_D=6$，但能推理
* LLaMA3.1 技术报告精华版（知乎）
	* [2024-09-09]()
	* SFT 引入长上下文数据，使用短上下文版本生成合成数据
		* 问答：长文档分块，短上下文版本生成问答对，SFT 时上下文换成全文
			> 问答：团队从预训练混合数据中仔细挑选了一组长文档。将这些文档分成8K token的块，并提示Llama 3的早期版本根据随机选择的块生成问答对。在训练过程中，整个文档用作上下文。
		* 摘要：长文档分块，短上下文版本分层摘要，SFT 时上下文换为全文、要求直接回答最终摘要
			> 摘要：团队首先使用最强的Llama 3 8K上下文模型对8K输入长度的块进行总结，然后对这些总结进行层次摘要。他们在训练过程中提供完整的文档，并提示模型在保留所有重要细节的情况下对文档进行总结，还根据文档的摘要生成问答对，并提示模型提出需要对整个长文档有全局理解的问题。
		* 代码推理：Python 代码仓库中移除（依赖关系上游的）某文件，SFT 要求模型根据其他代码生成该文件
			> 长上下文代码推理：团队解析Python文件以识别导入语句并确定它们的依赖关系，并从中选择最常被依赖的文件，特别是那些被至少五个其他文件引用的文件。他们从代码库中移除一个关键文件，并提示模型识别依赖缺失文件的文件，并生成必要的缺失代码。
		* 训练比例：合成长上下文数据占比 0.1% 最优，其余为短上下文数据
			> 模型根据序列长度（16K、32K、64K和128K）将这些合成生成的样本进行划分，以实现对输入长度的更细致的调整。通过仔细的消融实验，团队发现，将0.1%的合成长上下文数据与原始短上下文数据混合可以优化短上下文和长上下文基准的性能。
* MCSD-2406.12230 （备用）国内提出的非注意力语言模型架构（O(n)），神经元自适应激活
	* "MCSD: An Efficient Language Model with Diverse Fusion"
		* Yang, Hua; Li, Duohai; Li, Shiman; 
		> created on 2024-09-27
	* [新智元报道](https://mp.weixin.qq.com/s/79yBB8HSuuQPN9aV-RqP5A)
		> 将空间和时间复杂度分别降低到了O(1)和O(N)
		> MCSD块的内部结构如图1（右）所示，集成了slope部分和decay部分，分别通过不同的预定义矩阵捕捉局部和全局特征。{_o9rk80}
		> 两个部分均采用了双分支设计，
			> 一个分支负责进行线性投影，
			> 另一个通过聚合前面token的上下文信息来提取多通道历史特征，
			> 之后两个分支进行扰动（perturbation）操作。
		> slope和decay部分主要存在两方面的区别，
			> 一是预定义权重不同，因此在提取历史信息时对上下文的感知能力不同，前者更注重短程上下文，后者则更关注全局上下文。
			> 将slope和decay两部分的输出进行拼接后就得到了MCSD块的输出，这两者的组合使得模型既能关注到距离更近的历史信息，也不会丢失更远的长距离上下文，从而同时增强了局部和全局的特征提取。
	* [机器之心报道](https://mp.weixin.qq.com/s/RlW1xoo7o8SHzcIpw1R1Dw)
		* 希望用于实现群体智能，超过简单个体累加
			> 它们会组成一个去中心化的动态系统。
			> 在系统中，每台设备都拥有自主学习和决策的能力，而不需要依赖一个中央智能来控制全局。
			> 同时，它们之间又可以共享局部数据或经验，并通过快速的通信网络互相传递信息，从而在需要时发起合作，并利用其他智能体的知识和资源来提升任务完成的效率。
		* 多模态
			> 能够处理文本、语音、视觉等多种输入，并输出文本和语音，
		* 参数量少于 LLaMA3 8B、性能更优
			> 尽管参数量较小，但其效果已超越 Llama 3 8B 的模型。
			> 而且，它所用的训练语料比 Llama 3 要少，训练、推理算力也比 Llama 3 低很多。
		* MCSD 模块替换注意力
			> RockAI 用一个名叫 MCSD（multi-channel slope and decay）的模块替换了 Transformer 中的 Attention 机制，同时保留 Attention 机制中 token 之间的关联性。
			> 在信息传递过程中，MCSD 强调了有效信息的传递，确保只有最重要的信息被传递给后续步骤，而且是以 O (n) 的复杂度往下传，这样可以提高整体效率。
		* 类脑激活，每次推理（包括训练）自适应激活部分神经元；{_o9rk8b}
			> 在算法层面，RockAI 提出了一种类脑激活机制。
				> 这是一种分区激活的机制，就像人开车和写字会分别激活脑部的视觉区域和阅读区域一样，Yan 1.3 会根据学习的类型和知识范围来自适应调整部分神经元，而不是让全量的参数参与训练。
				> 推理时也是如此。
				> 具体有哪些神经元来参与运算是由仿生神经元驱动的算法来决定的。
			> 类脑激活机制和 MoE 有着本质的区别。
				> MoE 是通过「专家」投票来决定任务分配，每个「专家」的网络结构都是固定的，其结果是可预测的。
				> 而类脑激活机制没有「专家」，也没有「专家」投票的过程，取而代之的是神经元的选择过程。
				> 其中的每个神经元都是有价值的，选择的过程也是一个自学习的过程。
				> 目前，他们的类脑激活机制已经得到了脑科学团队的理论支持和实际论证，也申请到了相关专利。
		* 自主学习能力，日常推理时可同步根据反馈训练
			> （传统端侧部署方式）量化、裁剪等操作最致命的问题，就是破坏了模型的这种自主学习能力。
			> 为了实现这种自主学习能力，RockAI 的团队提出了一种「训推同步」机制，
			> 即让模型可以在推理的同时，实时有效且持续性地进行知识更新和学习，最终建立自己独有的知识体系。
			> 为此，RockAI 的团队正在寻找反向传播的更优解，方法也已经有了一些原型，并且在世界人工智能大会上进行过展示。
			> 不过，他们的方法原型目前仍面临一些挑战，比如延迟。
* 2407.13623 （备用）大模型的词表大小，同样适用于Scaling Law
	* "Scaling Laws with Vocabulary: Larger Models Deserve Larger Vocabularies", NeurIPS 2024
		* Tao, Chaofan; Liu, Qian; Dou, Longxu; Muennighoff, Niklas; Wan, Zhongwei; Luo, Ping; Lin, Min; Wong, Ngai; 
		> created on 2024-10-13
	* [公众号报道](https://mp.weixin.qq.com/s/_DTvTMCtrW9WV3vELjU9jw)
* （备用）LLM 推理引擎中，那些已经成为事实标准的优化方法
	* [2025-04-11](https://mp.weixin.qq.com/s/7su1i24c5720IBfcXrUsng)
	* 一、模型架构优化
	* MQA,GQA,MLA
	* Mistral sliding window attention
		> 针对long context非常有效，是一种local化的attention，在每层attention layer中只对固定的window size计算attentionScore，如下图所示。{_p4b96g}
		> 这样经过多层的迭代其实可以覆盖完整的seq_len，这个想法在CV领域的很多算法上也有类似实现。{_p4b99k}
	* Longformer sliding window attention（有示意图）
		> window attention的较多玩法，固定长度的window、扩散长度的window、不同层变化长度的window和全局+window，也是按需使用吧。{_p4b94r}
		> 其中不同层变化长度的window， 在底层使用较小的滑窗，以构建局部信息；越上层滑窗越大，以扩大感受野。{_p4b97a}
	* speculative Decoding，我理解类似重要性采样
		> 3.使用大、小模型对r个token的logits结果做比对，如果大模型的概率更大则接受，否则则以一定概率拒绝这个token的生成，从一个新的概率分布生成下个token。{_p4ba08}
		> 4.如果小模型生成结果都满意，则用大模型采样下一个token。
	* 二、系统工程优化：KVCache、FlashAttention、PagedAttention、Continuous Batching、Prefix Cache、Chunked Prefill、Sequence Parallel、、
	* Prefill、Decode分离
		> Prefill和Decode的Compute Intensity存在巨大差异(前者compute-bound后者memory-bound)
* TPV-2506.07240 DeepSeek-R1 思考进度条，作用于最后隐层的线性探头，修改该隐层激活可干预模型思考速度
	* "Overclocking LLM Reasoning: Monitoring and Controlling Thinking Path Lengths in LLMs"
		* Eisenstadt, Roy; Zimerman, Itamar; Wolf, Lior; 
		> created on 2025-07-09
	* [公众号报道](https://mp.weixin.qq.com/s/2uefJV_JiIhHg6wRFyKLRw)
	> 论文提出了一种“思维进度向量”（Thinking Progress Vector, TPV），可用于实时预测模型在推理阶段的相对位置，并通过可视化进度条展示模型的推理动态。{_p79k9v}
		> 论文的研究团队选择从最终隐藏层提取信息。
		* 用已训好的模型构建数据集，有监督训练新的进度提取网络，为线性探头
	> 通过干预TPV，可以加速或减速模型的推理过程，实现“超频”（overclocking）和“降频”（downclocking）。
	> 超频能够减少不必要的推理步骤，使模型更快地得出结论，同时避免因过度推理导致的性能下降。
* 2509.06322 （备用）纯文本 LLM 靠上下文学习用于 PDE 演化预测，浮点数序列均用文本表示
	* "Text-Trained LLMs Can Zero-Shot Extrapolate PDE Dynamics"
		* Bao, Jiajun; Boullé, Nicolas; Liu, Toni J. B.; Sarfati, Raphaël; Earls, Christopher J.; 
		> created on 2025-09-18
	* 摘要摘录
		> 我们证明，文本训练的基础模型可以从离散偏微分方程（PDE）解中准确推断时空动力学，而无需微调或自然语言提示。
		> 预测精度随着时间上下文的延长而提高，但在更精细的空间离散化时会降低。
		> 在多步展开中，模型在多个时间步长内递归预测未来的空间状态，误差随时间范围代数增长，让人想起经典有限差分求解器中的全局误差累积。
		> 我们将这些趋势解释为上下文神经缩放定律，其中预测质量随上下文长度和输出长度而可预测地变化。
		> 为了更好地理解LLM如何在内部处理PDE解决方案，以便准确地推出它们，我们分析了令牌级输出分布，并发现了一致的ICL进程：从句法模式模仿开始，过渡到探索性的高熵阶段，最终实现了自信的、基于数值的预测。
	* fig1 数据格式，逗号（空间分隔符）、分号（时间分隔符）分隔的三位整数
	* fig1,3 预测结果可视化，为较简单的含时 1D 方程（扩散为主）；fig1 为 Allen-Cahn
	* fig5a,c 随上下文长度增加，token-level 预测置信度逐渐变强
		* 开始（可见 2 时间步）仅模仿数据格式，多可能输出概率相近
		* 中间段（可见 5 时间步）探索性，可能性集中在少量输出
		* 后期（可见 20 时间步）输出确定性较高
		* fig5d 逗号位置的概率持续稳定
		* fig5b 空间分辨率增加后性能下降，表现为输出分布的熵增大
* 谷歌 Gemma4 结构
	* [2026-04-06](https://zhuanlan.zhihu.com/p/2023404810767012511)
	> slide window这个不解释了，就是在attention score加了casual 和 window mask，实际工程中flash attention都已经支持划窗。
		> gemma采用5:1的hyper架构，5个slide + 1个full，mimo也是这个结构，比例都是一样的。{_q46e8u}
	> rotary_emb 的hyper：slide window attention采用的full rope， full atteniton用0.25的partial rope。
	> 给两个端侧的小模型加了shared kv cache， 具体做法是；{_q46f08}
		> 如果当前层是 shared 层，找到 前面最后一个同类型的非共享层，当前层以后直接复用那个层的 KV，当前层自己不存 KV
		> 如果当前层不是 shared 层，如果该 attention 在非共享区里的最后一层，就需要单独存下来给后面使用。
* MiniMax M2.5 无法输出马嘉祺问题排查，因输出投影层权重在 SFT 阶段漂移
	* [2026-05-10](https://mp.weixin.qq.com/s/L-kAMgXcufHa_yynGWKqWQ)
	> 使用早期的 Base 模型进行 few-shot 引导，模型能顺利输出「马嘉祺」。但换成经过 SFT 的后训练模型，却依然回避这个词。
	> 结论有了：Tokenizer 没问题，问题出在后训练（SFT）阶段。工程师进一步调查了后训练的数据分布，统计发现，SFT 语料中包含「嘉祺」的样本总共不足 5 条。
	> 检查发现，输入端（vocab embedding）几乎没变，但是直接控制模型最终生成的输出端（Im_head）却发生了显著偏移。
	> 更直观的证据来自 lm_head 最近邻结构。
		> 预训练阶段，「嘉祺」附近主要是中文人名，如「亚轩」「祺」「肖战」「子怡」「霆锋」「杰伦」等。
		> SFT 之后，它的邻域被大量特殊 token、tool call 标记、文件编辑标记和编码噪声污染，例如 </minimax:tool_call>、<edit_file>、<file_content>、<delete_file> 等。
	> MiniMax 的方法是：构造一份「全词表覆盖合成数据」。
		> 把词表里的 200064 个 token 随机分批，每批约 8000 个，构造一条对话样本 ——query 是打乱后的词列表加上「请重复以上内容」的指令，answer 是原样复制。{_q5am6c}
		> 如此循环，总共只生成了约 500 条合成数据，占总 SFT 数据量约 1%，确保每个 token 至少作为生成目标出现 20 次。
		> 这个设计就是在给每个 token 一个生成频率的下限，像是在 SFT 阶段给整个词表做一次「保底校准」：即便某些 token 在真实对话数据中极少出现，也不会完全失去作为输出目标的训练信号。
* 2604.10098 attention sink 综述
	* "Attention Sink in Transformers: A Survey on Utilization, Interpretation, and Mitigation"
		* Su, Zunhai; Zhang, Hengyuan; Wu, Wei; Zhang, Yifan; Liu, Yaxiu; Xiao, He; Yang, Qingyao; Sun, Yuxuan; Yang, Rui; Zhang, Chao; Fan, Keyu; Ye, Weihao; Xiong, Jing; Shen, Hui; Tao, Chaofan; Wu, Taiqiang; Wan, Zhongwei; Qian, Yulei; Xie, Yuchen; Wong, Ngai; 
		> created on 2026-05-27
	* [公众号报道](https://mp.weixin.qq.com/s/lu8qvvJujGShtM7eHLeyBA)
		> 初期（2023 年起）—— 基本利用：早期研究的重点是对 Attention Sink 的实证利用，关注如何利用其固有特性或应对其直接影响。这一阶段将 Attention Sink 视为可被利用的实际现象。{_q5rb8p}
			> Sink Token 保留（Sink Token Preservation）：将 Sink 作为永久性的注意力锚点加以保留，在压缩中稳定注意力分布。
			> 注意力重分配（Attention Redistribution）则更进一步，主动识别 Sink 并将其占用的权重转移到真正承载语义的 Token 上。
			> 可学习前缀 token（Learnable Prefix Tokens）不再依赖自然形成的 Sink，而是在输入序列前端插入可训练的前缀，成为显式、可控的替代性 Sink。
			> Sink Token 重利用（Sink Token Repurposing），则另辟蹊径，利用 Sink 稳定、高注意力的固有属性，完成原始注意力管理之外的专门任务，如攻击植入、防御检测等。
			> 从策略逻辑看：Sink Token 保留采取被动方式；注意力重分配实施主动干预；可学习前缀 Token 采用更主动的构造策略；Sink Token 重利用则借助 Sink 的固有属性完成基础注意力管理之外的专门任务。
		> 中期（2024 年起）—— 机制理解：随着实证应用成熟，研究重点开始深入探究 Attention Sink 背后的成因。这一阶段聚焦于可解释性，旨在精细理解驱动这一现象的内部机制。
			> Softmax 限制与空操作理论（Softmax Limitations & No-Op Theory）：Softmax 求和为 1 的刚性约束，使得当查询与所有键都不相关时，模型没有「什么都不选」的选项。
				> 于是被迫将注意力集中到语义无关的 Token 上，同时将这些 Token 的值向量学得极小，从而使注意力输出趋近于零，实现空操作。
			> 异常值电路（Outlier Circuits）则揭示了模型内部存在系统性的离群值，它们相互关联，共同导致了 Sink 的产生。
			> 隐式注意力偏置（Implicit Attention Bias）发现，Sink Token 对每个查询的贡献几乎恒定，本质上充当了固定偏置项。
			> 几何锚点（Geometric Anchoring）进一步表明，Sink 在高维表示空间中充当稳定参考点，起到锚定和稳定表示空间的作用。
			> Anti-Overmixing
			> Active-Dormant Attention
			> Mix-Compress-Refine 等
		> 近期（2025 年起）—— 策略性消除：基于机理洞察，最新的研究重点转向直接的结构性消除。开发系统的消除框架已成为当前研究的前沿。{_q5rb8a}
			> 门控注意力（Gated Attention）在注意力输出后添加可学习的门控单元，模型需要空操作时直接关门，无需制造极端 Logits 和 Sink Token。
			> 改良 Softmax（Modified Softmax Functions）则直接修改 Softmax 函数，从根本上消除求和为 1 的约束。
			> 可学习注意力偏置（Learnable Attention Bias）显式引入偏置参数，让模型用干净的显式偏置替代隐式 Sink。
			> 预训练干预（Pre-training Interventions）不修改架构，而是在训练过程中施加干预，从训练抑制 Sink 的形成。
			> 离群值驱动重缩放（Outlier-Driven Rescaling）
			> 架构隔离（Architectural Isolation）
			> 从策略类型看，这些消除方法可以归为两类。
				> 第一类是提供显式替代品，使 Attention Sink 不再必要，包括门控注意力和可学习注意力偏置。
				> 第二类是切断因果链，从根源消除 Attention Sink，包括改良 Softmax 和预训练干预。
				* （评）第一类靠疏，第二类靠堵？
	* [知乎解读](https://www.zhihu.com/question/2030991754187502541/answer/2039728164306474508)
		* attention map 含义解读需谨慎，高注意力权重的未必是真信息流动
			> 过去五年，”attention map 可视化”是 NLP 可解释性研究最广泛使用的工具之一。
				> 无数 paper 在论证”模型在关注 X”或者”模型在做 Y 推理”的时候，都是把 attention 权重画出来，找哪个 token 权重高，然后说”看，模型 attend 到了这里”。
			> 但 attention sink 的结论却是 模型权重最高的那个 token，可能恰恰是它’啥都不想 attend’的标志。
				> 这件事 意味着大量基于 attention map 的可解释性工作的前提假设可能根本不成立。
				> 当你看到一个 head 把 80% 注意力给了 <bos>，传统解读是”模型在关注开头”，但真实含义可能是”这个 head 在这一层就是个咸鱼，它根本没在工作”。
			* 注意力头仅在少数情况被（特定输入）真正激活；{_q5rb27}
				> 综述里 Active-Dormant Attention Heads（2024）把这件事讲得最清楚——
				> 大量 head 在大部分时间里其实是 dormant 状态，只有少数时候会被某个特定输入”激活”。
				> Dormant 状态下它们看起来在 attend sink token，实际是在打瞌睡。
			> 所以NLP 可解释性领域至少有两件事需要重做：
				> 第一，所有”attention rollout”、”attention flow”类的可视化方法，都需要先把 sink mass 剔除掉再看；
				> 第二，”哪个 head 重要、哪个 head 可以剪”这件事，必须按 head 是否真正活跃来分类，不能按 attention 强度。
		* 修正动机：低精度训推适配，梯度 sink，被攻击隐患，（注意力错配导致）幻觉；{_q5rb3y}
			* 低精度训推 原因：模型为创造 attn sink 生成了过大激活值，导致不适配低数值精度
			> 综述列的 Attention Sinks Induce Gradient Sinks 这篇是 2026 年的工作，
				> 它告诉你 sink token 不仅吸 attention，还吸梯度——
				> 也就是说反向传播过程中，大量梯度也会被压扁在 sink token 上，造成训练动力学的扭曲。
				> 这个发现把 attention sink 从”推理时的小麻烦”上升到”训练时的根本性隐患”。
				> 它解释了为什么有些超长上下文训练总是不稳定。{_q5rb4c}
			> sink token 可以变成攻击入口。
				> 前者利用 attention sink 诱发多模态幻觉攻击，
				> 后者发现 prefix trigger 更容易和浅层 sink 位置对齐，从而恢复本应被 unlearning 抹掉的知识。
				> 注意，这不是说攻击者随便戳一下 sink 激活就能开天眼；更准确地讲是 sink 提供了一条位置稳定、注意力集中的信息通道，攻击者可以顺着这条通道设计触发器。
				> 这件事对正在跑 alignment 评测、做 RLHF 后训练、做 unlearning 合规的公司来说，是件不小的事了。
			* 增强幻觉：注意力过多分配给 sink 而非关键信息，长上下文、多模态情形造成幻觉
				> 长上下文+多模态的幻觉问题。
				>  这个更加隐形，综述里多模态 LLM 那一节有不少工作都跟”通过重新分配 attention 来缓解幻觉”有关——VASparse、Vocabulary Fixation、See What You Are Told、Shallow Focus, Deep Fixes、Don’t Deceive Me。
				> 这里不能粗暴地说”视觉幻觉 = 注意力被 sink 抢走”，幻觉的成因远比这复杂。
				> 但至少有一类现象可以从 attention misallocation 解释：模型该看图的时候，没有把足够预算给图像相关 token，反而被低信息 token 或误导性文本 token 吸走。多模态厂商不可能容忍这件事一直拖下去。
		* CV 里已有的应对方案：
			> 在输入里直接加几个专门的 register token，告诉模型倒在固定的垃圾桶里。{_q5rb63}
				> 然后 sink 行为就乖乖跑到 register 上了，patch token 不再被”借用”，整个attention map干净得像换了个模型。{_q5rb5i}
				* 注：原文附图确实能看出 attn map 从随机变成了确实在关注图像中关键区域
				> 这个思路后来被 DINOv3、Mamba-Reg、VGGT 等视觉或视觉相关架构继续吸收。
				> 这倒也不是说”CV 圈已经全员默认带 register”，而是越来越多视觉/混合架构开始把 register 当成一种显式 sink 管理手段。
			* NLP LLM 不易沿用：（不想重训外）[BOS] 本身已有特殊性，来自其注意力计算方式的额外元素
				* （评）大致因果链：模型 sink 到 [BOS] 而非人为冗余 token← [BOS] 特殊性← 注意力计算方式涉及 causal mask、RoPE 等
				> LLM 的 sink 机制和 causal mask、位置编码（特别是 RoPE）纠缠在一起。
				> causal mask 先给了早期 token 全序列可见性的优势，RoPE 又引入距离相关的位置结构，两者共同让序列开头成为最稳定的 attention offloading 候选。
				> 这就是为什么 LLM 里最稳定、最常见的 sink 往往落在第一个 token 或最早几个 token 上。
				> 当然它不是唯一位置：强分隔符、换行、弱语义 token 也可能成为 sink；{_q5rb6w}
					> 到了 ViT 是背景 patch，
					> 到了 diffusion language model 甚至还会出现 moving sinks。
				> 所以别把”首 token sink”误读成宇宙常数，它只是 decoder-only LLM 里最显眼的版本。
				> CV 里的 ViT 没有 causal mask 这种”越靠前越全局可见”的硬优势，sink 可以落到背景 patch 或显式 register 上；
		* 消除的必要性讨论
			> 第二，对”attention sink 是不是真的需要被消除”这个根本问题，其实最后的结论有点模糊。
			> 综述整体把 AS 当成”需要被理解和缓解的现象”来叙述，
			> 但社区里其实有非常 nontrivial 的一派认为 AS 是有益的归纳偏置——它给模型提供了一个”注意力安全阀”，让某些 head 可以光荣下岗而不破坏归一化结构。{_q5rb7t}
			> 如果把 sink 强行干掉，模型可能反而失去了”灵活注意力分配”的能力。
* 提及机制解释，Transformer 架构内同步运行大量小程序 复制/基础推理/梯度下降，验证低数值精度量化下能否继续执行梯度下降
	* [2026-06-20](https://zhuanlan.zhihu.com/p/2040903432756844040)
	> 在传统机器学习里，逻辑很简单：一个模型对应一套专属权重，模型只能适配自己训练出来的参数，各司其职。
		> 但Transformer架构彻底打破了这个规则，单个Transformer模型，可以成为适配所有权重的“通用解”，它不再局限于固定参数，能够学习适配任意权重参数。
		> 这个神奇的现象最早在2022年被斯坦福的研究团队发现。
	> 直到2023年，冯奥斯瓦德发表了一篇我心中的神级论文，直接用完整的数学推导闭环证明了背后的原理，彻底补上了这个缺口。
		> 这篇论文的核心结论特别颠覆认知：Transformer神经网络的本质，不是在拟合某个固定函数，而是在模拟一套梯度下降优化算法。
		> 我们都知道Transformer架构是图灵完备的，这也就意味着，训练完成后的大模型，内部并不是单一的运算逻辑，而是同时运行着成千上万个独立的“小程序”。
		> 有的小程序负责文本复制粘贴，有的负责基础逻辑推理，而这篇论文证实的，就是其中一部分小程序，专门用来执行梯度下降优化运算。{_q6k811}
	* 作者毕业设计，梯度下降机制在 int8/int4 整数量化（针对端侧部署）下是否仍有效
		> 另外重点说明一下，本次实验只研究整数量化，完全不涉及FP8、FP4浮点量化。
		> 核心原因是本次实验对标机器人、边缘设备部署场景，这类设备的计算卡普遍不支持低精度浮点格式，但全部支持整数张量运算加速，研究整数量化更贴合实际落地需求。{_q6k81v}
	> 本次实验一共设置了四组对照变量，基线为W16A16全高精度模式，另外三组分别是：仅权重量化W8A16、仅权重量化W4A16、权重激活同步量化W8A8。
		> 第一，W8A16量化方案几乎零负面影响，仅仅让Loss出现了极其微小的上涨，完全可以忽略不计，属于非常安全、适配边缘部署的量化选择。
		> 第二，W4A16量化方案存在明显缺陷，模型训练到第三层就停止了梯度优化，Loss小幅上升，迭代到第五层直接彻底崩溃。
		> 第三，W8A8量化方案呈现出诡异的阶段性问题，模型前五层的梯度下降、迭代优化全部正常，直到第六层突然直接崩溃失效。
	> 这里补充一个工程常识：仅对权重做低精度量化，就能大幅减少显存占用、提升显存搬运速度，让更大的模型能够部署在算力受限的边缘显卡上，实用性极强。{_q6k82u}
	> 很多人可能好奇，为什么偏偏选择六层模型做实验？其实这个层数是实打实的神来一笔。
		> 梯度下降的迭代规律是先快后慢，层数太少，只能覆盖快速收敛阶段；层数太多，大部分网络层都会卡在收敛后的平稳平台期，无法观测完整变化。
		> 六层的数量刚好不多不少，能同时覆盖梯度下降的快速下降期和平台期，完美适配本次实验需求。
* TRM-2602.08498 CoT 质量评估，指标分宏微观、有效高效性，推理过程切 DAG，据此训奖励模型
	* "Characterizing, Evaluating, and Optimizing Complex Reasoning", ICML 2026 oral
		* Zhang, Haoran; Li, Yafu; Wang, Zhi; Wang, Zhilin; Zhang, Shunkai; Qu, Xiaoye; Cheng, Yu; 
		> created on 2026-06-29
	* [公众号报道](https://mp.weixin.qq.com/s/Del4I0ZB_hTKAmJTPoznuw)
	> 答案之外，还需要进一步区分：哪条推理链更清楚、更紧凑、更值得模型学习。这正是TRM关注的问题。
	> 用ME² principle刻画推理质量，
		> 论文沿两条正交轴拆解推理质量：粒度上分macro（整体结构）和micro（单步内容）；目标上分efficiency（高效）和effectiveness（有效）。两两组合得到四个维度：{_q6tk3g}
			> Macro-Efficiency：整体结构是否高效。好的推理链会沿着必要分支推进，避免在同一条思路上反复重启，也不会做过多无效检查。
			> Macro-Effectiveness：整体结构是否有效。推理主线应始终围绕问题目标展开，分支之间关系清楚，关键论证能够前后接上。
			> Micro-Efficiency：单步表达是否简洁。每一步最好都有明确作用，比如计算、验证、排除或归纳，少写不影响结论的重复内容。
			> Micro-Effectiveness：单步内容是否正确。局部计算、符号使用和前后结论需要自洽，不能用错误步骤支撑正确答案。
		> 这四个维度把“哪条推理更好”分解成可标注、可比较、可训练的信号，构成后续整套评估和优化流程的基石。
	> 用DAG-based pairwise evaluation还原推理结构，{_q6tk2l}
		> 先把原始文本切成一系列原子步骤，把每个步骤作为一个节点，再按照语义依赖关系连边。
		> 这样一来，推理链中的progression（线性推进）、branching（分支探索）和merging（分支合并）就能清楚呈现出来。
		> 为此，论文把任意推理链抽象为有向无环图（DAG），并将这一过程拆成三步：
			> 1.Step Partitioning：先按段落做粗切分，再统计大量轨迹中高频起始词作为更稳定的分隔符，得到一致、有语义意义的步骤边界。
			> 2.Reasoning Structuring：按时间顺序遍历每个推理步骤，用大模型分配其语义父节点，逐步构建边；
				> 再把完全线性的相邻节点合并为超节点，得到紧凑的DAG，清晰呈现progression（线性推进）、branching（分支探索）和merging（分支合并）这样的复杂结构。
			> 3.Pairwise Evaluation：根据ME² principle构造语义抽象，再让评估模型基于这些抽象给出两条推理链的相对偏好。Macro和Micro两种粒度分别对应不同的抽象方式，覆盖ME² principle四个维度。
		> 这样，评估模型就不必只盯着一整段长文本，而是可以沿着推理结构看：主线是否清楚，分支是否必要，局部步骤是否简洁、正确。
		> 这样得到的判断，也比直接看原文更稳定。
	> 训练Thinking Reward Model，把“推理质量”从主观感受变成可复用的奖励信号。{_q6tk4w}
		> 并将其用于Test-Time Scaling和RL。
		> 构建了TRM-Preference数据集。
		* 样本推理链生成
			> 对于每个问题，研究者先用多个开源推理模型生成候选推理链，
			> 再通过规则验证器筛掉答案错误的轨迹，只保留最终答案正确的样本。
		* 标签生成：DeepSeek-V3.2 打分
			> 论文用DeepSeek-V3.2在ME²四个维度上对DAG进行成对评估。
			> 为减少位置偏差，评估会在正反两种呈现顺序下重复进行，只保留判断稳定且非平局的偏好标签。
			> 最终得到103K训练偏好对+1.5K验证偏好对，构成TRM-Preference数据集。
		* 标量输出的 value model 训练
			> TRM以Llama-3.1-8B-Instruct为初始化，把语言建模头换成标量value head。
			> 在TRM-Preference上训练完成后，TRM会为每条推理链输出一个标量分数：分数越高，越符合ME²对高质量推理的定义。
	* 作用
		> TRM评估的是推理链质量，但这种信号也能反过来提高最终答案的准确率。
			> 测试时，可以把TRM用在Best-of-N selection中：让模型针对同一个问题生成多条候选推理链，再由TRM选出质量最高的一条。
			> 实验显示，随着N增大，TRM选出的结果能够带来更高的最终准确率。
		> 在训练阶段，TRM也能为强化学习提供更细粒度的奖励信号。
			> 只有答案正确时，TRM才参与reward shaping，错误轨迹的reward始终为0，避免模型从错误轨迹里学到坏习惯。

## 多模态
* NExT-GPT-2309.05519，多模态的任意模态输入、任意模态输出，LLM 为核心
	* [2023-09-21](https://mp.weixin.qq.com/s/rE24QWdOFlYhMk7v3tv-fg)
	> 项目地址：https://next-gpt.github.io ；本工作开源
	* 利用已有的各模态的开源模型（包括作为输入的类 CLIP 模型、扩散生成模型），以降低成本
		> 利用已开源的编码器对各种输入模态进行编码，然后通过一个投影层将这些特征投影为LLM所能够理解的「类似语言的」表征。中文作者采用了MetaAI的ImageBind统一多模态编码器。
	> 如果LLM确定要生成某种模态内容（除语言外），则会输出对应的模态信号token，表示该模态被激活。{_n9lg6d}
* `CM3Leon-2309.02591` 纯解码器的图文双模态模型，可完成图像编辑（依据文本指令）、根据草图与指令生成图像等任务
	* "Scaling Autoregressive Multi-Modal Models: Pretraining and Instruction Tuning"
		* Yu, Lili; Shi, Bowen; Pasunuru, Ramakanth; Muller, Benjamin; Golovneva, Olga; Wang, Tianlu; Babu, Arun; Tang, Binh; Karrer, Brian; Sheynin, Shelly; Ross, Candace; Polyak, Adam; Howes, Russell; Sharma, Vasu; Xu, Puxin; Tamoyan, Hovhannes; Ashual, Oron; Singer, Uriel; Li, Shang-Wen; Zhang, Susan; James, Richard; Ghosh, Gargi; Taigman, Yaniv; Fazel-Zarandi, Maryam; Celikyilmaz, Asli; Zettlemoyer, Luke; Aghajanyan, Armen; 
		> created on 2023-09-23；文章（非 arXiv 版本）其实已在 07-15 下载
	* sec2.1 引入特殊 token `<break>` 指示模态转换；{_n9na5c}
		* 该 token 不参与 mask
	* sec2.2:1 完形填空任务转化为 NTP：完整序列形如“Image of `<mask>`: `[image] <infill>` a chameleon”，使用了特殊 token `<infill>`；{_n9na97}
		* （评）多处填空或许可在 mask 上引入编号信息？或者解码时直接顺序输出填空内容即可？
	* sec2.3 模型细节：无 dropout 等
	* eqn(3) 提出对比解码的变体 CD-K，不是取最大的那个概率，而是取最大 k 个；{_n9nb2d}
		* fig4 结果相比 CFG 有竞争力
* BLIP-2201.12086 图文二模态，以下关注其中的 CapFilt：数据的数据清洗、造新数据，数据、模型交替迭代
	* "BLIP: Bootstrapping Language-Image Pre-training for Uniﬁed Vision-Language Understanding and Generation"
	* [2023-10-21](https://zhuanlan.zhihu.com/p/467187562)
		* 2023-10-18 组会介绍
	* 设定：图片文本对数据，少量高质量的人工标注 $(I_h,T_h)$，大量低质量的互联网数据 $(I_w,T_w)$
	* CapFilt（Captioning and Filtering）
		* 先用较低质量数据预训练
		* 之后获得的模型 1：captioner，它负责生成 synthetic text，得新样本对 $(I_w,T_s)$；{_nala9z}
		* 获得的模型 2：filter，负责过滤 $T_w,T_s$ 中的噪声文本；{_nala9l}
		* （提供了生成、被过滤的数据的具体例子）
		* 过滤后的新数据集重新用于训练模型
		* 理论上这样可以迭代多步，不过原文只重训一次效果即不错
* Direct3D-2405.14832 （备用）3D mesh 生成模型，输入为 2D 图像，架构基于 DiT
	* "Direct3D: Scalable Image-to-3D Generation via 3D Latent Diffusion Transformer"
		* Wu, Shuang; Lin, Youtian; Zhang, Feihu; Zeng, Yifei; Xu, Jingxi; Torr, Philip; Cao, Xun; Yao, Yao; 
		> created on 2024-06-17
	* [机器之心报道](https://mp.weixin.qq.com/s/y2uVCgy0ywSlsF860Byt3g)
* 2301.03728 Meta 的多模态模型 scaling law 实验研究
	* "Scaling Laws for Generative Mixed-Modal Language Models"
		* Aghajanyan, Armen; Yu, Lili; Conneau, Alexis; Hsu, Wei-Ning; Hambardzumyan, Karen; Zhang, Susan; Roller, Stephen; Goyal, Naman; Levy, Omer; Zettlemoyer, Luke; 
		> created on 2024-09-14
	* 摘要
		> 生成语言模型定义了令牌序列上的分布，这些令牌序列基本上可以表示数据模态的任何组合（例如，VQ-VAE的图像令牌的任何排列、HuBERT的语音令牌、语言或代码的BPE令牌等）。
		* 目的：理解混合模态模型的 scaling 特性
			> 为了更好地理解这种混合模态模型的缩放特性，我们使用7种不同的模态和模型大小（从800万到300亿不等）进行了250多次实验，在500亿到1000亿个令牌上进行了训练。
		* 从 scaling law 角度考察各模态贡献、模态间相互作用
			> 我们报告了新的混合模态标度定律，该定律统一了单个模态的贡献及其之间的相互作用。
		* 关注最佳协同、竞争；数据、模型大小视为加性项
			> 具体来说，我们明确地将数据和模型大小作为先前单峰标度律的加性项，对最佳协同和竞争进行建模。
		> 我们还发现了在训练过程中观察到的四个经验现象，例如在模式之间自然交替的紧急协调上升式训练、选择关键超参数的指导方针，以及混合模式竞争与训练稳定性之间的联系。
	* sec3.2 单模态的 scaling law：对模态 j，最小 perplexity $L_j=E_j+A_j/N^{\alpha_j}+B_j/|D_j|^{\beta_j}$
		* 三项含义：理论最小 loss，逼近误差，优化收敛误差
		* $N$ 模型参数量，$|D_j|$ 为模态 j 的 token 数
		* （评）存在理论最小 loss 因为是 next token prediction，这不同于有监督映射拟合
		* （评）无泛化误差，可能是因为没有考虑测试集？
		* 提到 $\alpha,\beta$ 上界均为 1/2
* （备用）Meta 的 Movie Gen 视频生成大模型
	* [新智元](https://mp.weixin.qq.com/s/8Y9Ab4EdIjjyP1JRMkYcqA)
		> 研究人员引入的「流匹配」（Flow Matching），让视频在精度和细节表现上，都优于扩散模型。{_oa5g93}
			> 「流匹配」是一种新兴的生成模型训练方法，其核心思想是——直接学习样本从初始噪声状态向目标数据分布转化的过程。
			> 而且，模型只需通过估计如何在每个时间步中演化样本，即可生成高质量的结果。
			> 与扩散模型相比，「流匹配」训练效率更高、计算成本更低、并且在时间维度保持连续性和一致性。
			> 有网友对此总结道，在质量和文本对齐上，人类评估都强烈倾向于流匹配，而不是扩散。
		> 他们训练了一个单一的时间自编码器（TAE），用于将RGB图像和视频映射到潜在空间。
		* 时间平铺：隐空间时间上切片（有重叠），分别生成，生成结果的时间重合部分线性插值
		> 他们引入了创新的位置编码方法——「因子化可学习编码」，能够独立对高度、宽度、时间三个维度进行编码，然后将其相加。{_oa5g8r}
			> 基于这种灵活设计，让模型不仅能够适应不同宽高比，还能处理任意长度的视频。
		> 另外，为了解决模型推理效率问题，研究人员采用了一种「线性-二次时间步长」的策略。
			> 如下图所示，仅需50步，就能实现接近1000步采样效果，大幅提升了推理速度。
	* [机器之心](https://mp.weixin.qq.com/s/c8_sXLRkwEVvg_LKCPQHKw)
	* [量子位](https://mp.weixin.qq.com/s/rs7JQigqHO9yT_0wbF6cTg)
	* [Meta 官网论文](https://ai.meta.com/static-resource/movie-gen-research-paper/) （需梯子）
* Emu3 纯自回归的多模态，包括视频，BAAI 开源
	* [2024-10-25](https://mp.weixin.qq.com/s/csqFAkjziwx34aAxKj9-gQ)
	* 视频 tokenizer 基于 SBER-MoVQGAN
		> 在 SBER-MoVQGAN 的基础上训练视觉 tokenizer ，
		> 它可以将 4 × 512 × 512 的视频片段或 512 × 512 的图像编码成 4096 个离散 token。
		> 它的词表大小为 32,768。{_oap992}
		> Emu3 的 tokenizer 在时间维度上实现了 4× 压缩，在空间维度上实现了 8×8 压缩，适用于任何时间和空间分辨率。{_oap98p}
		> 基于 MoVQGAN 架构，在编码器和解码器模块中加入了两个具有三维卷积核的时间残差层，以增强视频 token 化能力。{_oap995}
	* 特殊 token
		> [BOS] 和 [EOS] 是 QwenTokenizer 中的原始特殊 token 。
		> 额外新增的特殊 token 包括：[SOV] 表示视觉输入（包含图像和视频的 meta 信息部分）的开始，[SOT] 表示视觉 token 的开始，[EOV] 表示视觉输入的结束。{_oaqf3y}
		> 此外，特殊 token [EOL] 和 [EOF] 作为换行符和换帧符插入到了视觉 token 中。{_oape2y}
		> 元文本包含图像的分辨率信息，视频则包括分辨率、帧率和持续时间，均以纯文本格式呈现。{_oaqf3p}
		> 在构建理解数据时，Emu3 将部分数据中的 "caption text" 字段移至 [EOV] token 之后。
	> 为了防止视觉 token 在学习过程中占据主导地位，对与视觉 token 相关的损失加权 0.5。{_oaqf4e}
	* 预训练二阶段：1. 文本+图像，较短上下文；2. 再+视频，加长上下文；{_oaqf4q}
		> 预训练过程分为两个阶段，第一阶段不使用视频数据，训练从零开始，文本和图像数据的上下文长度为 5,120；在第二阶段，引入视频数据，并使用 131,072 的上下文长度。
	* 视觉生成用自回归的灵活性：可 DPO 对齐人类偏好；{_oaqf5y}
		> 受益于 Emu3 下一个 token 预测框架的灵活性，直接偏好优化（DPO）可无缝应用于自回归视觉生成，使模型与人类偏好保持一致。
		* 训练阶段：预训练、SFT、DPO

## 其他任务
* iTransformer-2310.06625 时序预测任务，含异质物理量，每物理量的短时序组成一个 token（而非单时间步不同物理量组成一个 token）{_nakl2b}
	* [2023-10-20](https://mp.weixin.qq.com/s/74YalpPpxbPLLh83sf-lIA)
		* THUML 组的工作，代码开源
	* 时序数据特点，可看出传统方式的问题
		* 注：传统方式指 单时间步不同物理量组成一个 token
		* 测量延迟，不同观测变量的实际产生时刻未必严格对齐
		* 不同变量物理含义、单位相差大，语义、取值范围不可比
		* 预测需要的时序长度较长，传统方法需处理 token 数多
* AlphaFold3
	* [2024-05-10](https://mp.weixin.qq.com/s/ivpU-dxly36uGNTpgAzmnA)
	> 团队采用了一种标准的扩散方法，训练扩散模型处理「加噪」的原子坐标，并预测其真实坐标。这就要求网络在不同的长度尺度上学习蛋白质结构，小噪声去噪重点在于理解局部立体化学，而大噪声去噪则关注系统的大尺度结构。{_o5af7x}
	> 在推理阶段，会随机采样噪声，并通过反复去噪得到最终结构。
	> 值得注意的是，这种生成式训练方法会产生多种可能的结果。这意味着，即使网络对某些位置的确定性不高，每个结果的局部结构（如侧链键的几何结构）也都会非常清晰。{_o5af87}
	> 与一些近期的研究一致，团队发现架构中不需要对分子的全局旋转和平移进行不变性或等变性处理，因此省略了这些设计，并简化了机器学习架构。{_o5af8b}
* HPT-2409.20537 （备用）不同机器人传感器、动作异构，提出异构预训练 Transformer 作为其通用主干
	* "Scaling Proprioceptive-Visual Learning with Heterogeneous Pre-trained Transformers"
		* Wang, Lirui; Chen, Xinlei; Zhao, Jialiang; He, Kaiming; 
		> created on 2024-10-10
	* [公众号报道](https://mp.weixin.qq.com/s/TcikCgqg_QcFlchWSuzl6g)
* 
