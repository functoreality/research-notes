> 2023-04-11 从 metaL.md 独立
#### Review
* `2005.10953`: #few-shot
	* "A Concise Review of Recent Few-shot Meta-learning Methods"
	* table 1 summary 将方法分为 4 类：
	1. Learning an Initialization
	1. Generation of Parameters
	1. Learning an Optimizer（LEO 归为此类）
	1. Memory-based Methods
* `2004.05439`: #taxonomy
	* "Meta-Learning in Neural Networks: A Survey"
		> [中文翻译](https://blog.csdn.net/qq_38680752/article/details/106488508)
	* meta-learning 的形式化：
		* task distribution 观点：粗略定义 task=dataset+loss $T=\{D,L\}$，目标 $\min_\omega\mathbb{E}_TL(D;\omega)$
			* 训练、测试均为 argmax logp；训练：$p(\omega|D_\text{src})$，数据可区分 tr,val
			* 测试 $p(\theta|\omega,D_\text{targ})$
		* bilevel optimization 观点（针对 optimizer-based 方法）
			* 内循环（测试）$L(\theta,\omega,D)$ argmin 得 $\theta^*(\omega)$
			* 外循环（训练）$\mathbb{E}_TL^\text{meta}(\theta^*(\omega),\omega,D)$
			> 文中有关于 bilevel opt 的相关 ref，ref 内容有涉及经济等领域；
			> 实现涉及的求导阶数见 ((n8jk45))OB-diffOrd；
			> 关于内循环：有限步终止优化 等价于对修改版 loss 求严格极小（如 `HBM-MAML-1801.08930`“Q_k”），从而 MAML 等在这个框架内
		* feed-forward model 观点：根据训练数据直接得模型 $g_\omega(D^\text{tr})(x)$
	* 相关领域：transfer-learning, MTL, 超参优化, autoML, domain adaptation/generalization, continual learning（在线学习？）, hierarchical Bayesian models
		* meta-learning 特点在于有 meta-objective，（作为一种更一般的设定？）也可以用于这些相关领域
			> meta-learning 能处理不同 $Y$ 空间的情形吗？
		* HBM 为理解 meta-learning 提供了建模方式（而非算法框架），例如 MAML
		* AutoML：meta-learning 有时可以理解为一种特殊的 AutoML
	* 传统的 3 分类：
		1. 基于优化，包括选初值的 MAML 和学优化算法的 3 篇
		2. 基于模型，包括 hypernet 和引入外部记忆的做法；OoD 任务表现差于基于优化做法，在 few-shot 高效但数据量大时“asymptotic weaker”
		3. 度量学习，即非参数算法，基本局限于 few-shot 场景
	* 提出的分类尺度：
		* meta-representation (what)，即如何选取 meta-knowledge
			> 常见的就不整理了
			* “losses and auxiliary tasks” 似乎是学某种辅助 loss（例如多个已有的非监督辅助任务的加权组合，设计新的非监督辅助任务，设计某种正则化项）；作用包括减少局部极小、快速学习、更好泛化能力
			* 学网络架构，包括进化算法搜索架构的计算图，也有基于梯度的方法
			* 学数据增强策略，由于通常不可微需要 RL、离散梯度估计、进化等算法；例如 GAN 生成数据；另外“datasets, labels and environments”涉及大数据集简化，用于持续学习减少存储需求问题
		* meta-optimizer (how)，即（外层）学习算法，包括梯度下降、RL、进化算法
		* meta-objective (why)，包括学习目标、任务分布、“data flow between levels”（？）
			* 包括 few-shot, fast optimization, “robustness to domain-shift”, label noise, adversarial attack
				> 样本不均问题也许也算 domain-shift？
			> 对于一般 MTL 场景，目标之间有区别，如 few-shot 在目标任务上有少量有标签数据，domain adaptation 在目标任务有大量无标签数据（在目标域上未必能用“学习”描述，不算 meta-learning），还有利用辅助任务提高已有任务表现；
			> 我所知道的 meta-learning 领域考虑的任务变化主要为 $p_X$ 变化和 $f$（分类问题至多 $(Y,f)$）变化，对 $X$ 本身变化的似乎一般也不常考虑，回归问题的 $(Y,f)$ 变化（如图像景深预测和法向预测）也少见
	* p9 table 为文章汇总，按照提出的三个指标
	* sec6 挑战与开放问题，及现有解决方案：
		* 任务分布过于 diverse 时有难度，现有方法经常隐式假设任务分布单峰
		* 元泛化，包括分布内（记忆效应导致过拟合）以及 OoD
		* task families，终身学习之类（指无法显式地区分各个任务，只能全部当成一个处理？）
		* 计算存储复杂度（也是许多工作专注于小样本的原因）；解决方案不少，FFM（feed-forward model，如 hypernet）推断最省事
	> todo: ref[292,293,298] 提到任务视为子空间/流形
* `metaUnderstainding-2002.00573`: #intepretation
	* "A Meta Understanding of Meta-Learning"
		* new title "Revisiting Meta-Learning as Supervised Learning"
		> 以下方程编号均按 OpenReview 上的老版本文章
	* 按照有监督学习范式解读 meta-learning：待训练算法 $\hat g$，其输入数据 $D_\text{tr}$，输出最优模型 $\hat h:X\to y$
		* 具体任务的网络：$h:X\to Y$
		* 学习算法：$g,A_H:I=\mathcal{P}(X\times Y)\to O=(X\to Y)$
		* 元学习算法：$B_G=\mathcal{P}(I\times O)\to(I\to O)$；{_n3gd67}
		> 注意将此类映射看作一般算法，例如可以包含迭代，而不一定是普通 NN 那样的前向映射，前向网络只是一种特殊的算法！
		> hypernet 是用前向映射实现此类外层算法的例子；
		> 内层模型也可以看作一般算法，例如隐式不动点网络 FPN，以及生成序列的 RNN 算法（不是一次性生成整个序列）；有限维 AD 作为解码器也是这种情形；RL；
	* > (mine) $g,A_H$ 的区别：
		* $A_H$ {针对单任务}，假设空间 $H$ 的选择和算法内部都可以涉及超参，该超参根据 val 数据选取，针对单个任务；
			* eg. `SMASH-1708.05344` 搜索网络架构，相当于选择 $H$
		* $g$ 作为元学习模型针对一系列任务，选取使用了 query set，如果涉及超参，则此超参为兼顾不同任务的最优；
		* 相同点：都是 bilevel opt 的形式
	* $B_G$ 构造为某 loss 下的极小：eqn(5) $\sum_jl_\text{meta}(g(D_j),h_j^*)$ 对任务的 ERM
		* 形式上使用 $h_j^*$ 而不直接涉及 query set：
			> 这在单任务情形回到普通验证集选超参的设定；在这里的多任务下找到总体上对各任务都还行的一组超参
			* $h_j^*$ 可用含 validation 的方式先训练
				> 从而通过 $h_j^*$ 间接使用了 query set；
				> 本文 citation `2104.03736` 确实是这么做的；
				> 不同任务用验证集找到的最优超参不同，用这种形式表现有可能超过学超参取值（而非超参动态预测）、外层直接使用 query set 的元学习方法；
				> 如果 support/query set 区别在噪声大小等，原则上也可以直接在 query set 训练而不是先 support 训 query 验证
			> 有监督分类问题允许 teacher-student 设定，不过我不太熟悉该做法好处
			* 该形式还可以用于无监督任务（> 例如生成模型，WGAN 误差度量使用 Wasserstein 距离）
		* secC.1 $l_\text{meta}(h,h^*)$ 选取的可能性：
			* 有的工作学出最优 $h^*$ 的参数后，在参数空间求距离
				> 感觉原则上求 L2 距离之类的会更合适
			* 回归 query set 的形式 $l_\text{meta}=\sum_il(g(D_j)(x_{ij}),y_{ij})$，不真正训练 $h^*$
				* 原文解读：用 val loss 与 $h^*$ 之差 $|L_V[h]-L_V[h^*]|$，由于后者通常更小只剩 $L_V[h]$ 项
				> 感觉这样解释有点奇怪；我的解读：$h_j^*$ 取为任务的真实标签映射，$l_\text{meta}$ 函数距离用 query set 涉及的样本点离散
		* 如果还涉及超参，可再用额外任务做 {meta-validation}
		> `metaMetaL:` meta-meta-learning 据说效果一般，不知道 meta-validation 如何
	> eqn(5) $L_\text{meta}$ 似乎应该和 task $j$ 有关，因为数据分布 $\rho_X$ 也应该与任务有关
	* sec4.2 将有监督学习加速方式用于元学习：
		* joint training 应该只针对小样本有监督分类问题，引入一个给定的分类任务（有独立的最后一层参数）来帮助训练特征提取部分，与 pretrain 区别仅在于其 loss 权重随着训练逐渐减小；eg. TADAM；本文实验表现似乎不如 pretrain
		* ensemble learning
		> citation 中 `semiSupFSL` 将半监督学习用于元学习，利用无 query set 的任务
	> `unifyMethod1:` 我统一元学习框架的尝试用了这篇文章的观点，那里也有一些补充
* [孟德宇报告视频](https://www.bilibili.com/video/av711697507/)
	* 似乎是自己的某篇 review 文章的解读？
	* 元学习方法论，提到自己做过的“基于双边优化的元学习”，类比传统训练-验证集选取超参，通过支撑-查询集选元学习的超参，有表达式（注意一张 slide 里有 pause）；对超参的搜索变为对其优化
	* 另有“基于元信息动态嵌入的元学习”，主要是 dynamic network 和 hypernet
	* （提到用 meta-learning 处理数据集 bias 导致的问题）
* [domain adaptation 系列](https://zhuanlan.zhihu.com/p/107120177)
* `MTLreview-1707.08114`: #MTL, #review, #theory
	* "A Survey on Multi-Task Learning"
	> TODO: summary, comparison tree, link, (broader impact?)
	* fig1 本文所指 MTL 与迁移学习、multi-label learning（i.e. multi-output regression）、multi-view learning 的区别
	* table3 MTL 理论分析之间的比较，维度包括 MTL 模型、用的理论工具、得到的泛化误差界
* `2010.03522`: #supervised, #RL
	* "A Survey of Deep Meta-Learning"
	* sec2.1.2 有监督元学习形式化为 $\min_\omega\mathbb{E}_T[L_T(g_\omega(T,L_T))]$
	* sec2.1.4 meta RL 形式化，策略采用 $\pi(s_t;g_\omega(T,L_T))$
		* 其中不同 MDP 给出不同任务 $T$，$L_T$ 来自对随机轨迹求期望 $\mathbb{E}_\tau$
		* 最终问题与有监督元学习相同
		> (待确认)可能的一个区别（暂不考虑只有数据无法交互的那类 RL）：RL 更像 active-learning，
		> (待确认)有监督学习 $L_T$ 估计的随机性是给定的，来自数据采样的随机性（可能还有噪声）；RL $L_T$ 有主动探索的可控随机性
	* sec2.2.2 常用数据集 benchmark
	* table2：metric, model, optimization 三种方法的 key-idea, strength, $p_\theta(Y|x,D^\text{tr})$ 形式
	* table3：元学习算法的列表比较，是否可用于 RL、key idea、实验的 benchmark
* `2004.11149`: 
	* "A Comprehensive Overview and Survey of Recent Advances in Meta-Learning"
	* meta-learning 任务描述为 $T=\{p(x),p(y|x),L\}$
		> 没有说明 $L$ 为何需要；猜测无法精确拟合数据时，该项可声明应该优先拟合哪一部分，或者声明正则化项；
		> 例子：MNIST 子集，每个只出现少数几个 label，属于只变 $p(x)$；
		> 二分类改变标准，例如人脸区分性别、年龄、肤色的不同任务，属于只变 $p(y|x)$
	* 分类为 black-box/metric-based/layered/Baysian meta-learning
		* layered meta-learning 指 learner 分 base 和 meta 部分，如 MAML
		* black-box 例如 AdaResNet，AdaCNN，activation to parameter（> 没懂）
* related: `GNNmetaL-2103.00137`(GNN), `2021-09-29`(lectures)

> Theory 部分已转移至 (metaLthm)
#### Methods
* `LEO-1807.05960`: #meta-learning, #VAE, #BNN
	* "M ETA -L EARNING WITH L ATENT E MBEDDING O PTIMIZATION"
	> TODO: summary, comparison tree, link, (broader impact?)
	* 形式 $f(x;\theta_\phi(z))$，使用时 $z$ 初始化为 $z_\phi(\lambda)$（见 DeepSDF 笔记，注意 $\theta,\phi$ 含义刚好相反）
	* 在 AISC 笔记 DeepSDF 有比较，用那里的统一记号写清楚了形式
	* encoder DeepSets 采取 $(\{x_1^k\},\dots,\{x_N^k\})$-equivariant 的形式（仅针对分类问题），sec2.3.5 表示一般问题还是可以采取 $\{(x^k,y^k)\}$ 输入形式（每个集合内部都要求对称性）
		* 这里采取 equivariant 形式输出多个 $z_n$，是因为 hypernet 部分只输出最后一层参数，每个分类 $n$ 都需要一个 $w_n$，而这需要相应不同的 $z_n$；这样可以对不同 $N$ 的任务使用
		* 附录 table5，对于图像任务，$f_\theta$ 除了最后一层参数通过 hypernet 得到之外，其他参数为预训练，LEO 算法中不需要调整
	* eqn(6) loss 包括让 $z$ 的 inner-loop 更新尽量小，以让 hypernet 生成尽量接近最优的参数，减小 fine-tune 代价
		* 此外还有 VAE loss，$z_\phi(\lambda)$ 生成的分布尽量接近标准正态；eqn(7) 参数大小 loss，对 $\theta_\phi(z)$ 的独立性 loss（> 这个没看懂）
		> 随机化参数编码 $z_\phi(\lambda),\theta_\phi(z)$ 进入了 BNN 设定，可算学出 BNN 模型的元学习方法
	* sec4.6 fig5 解释为何 bottleneck $z$ 对参数降维有意义：$z\mapsto\theta$ 是一个放大的映射（展示了二者曲率、梯度的各分量统计上的大小关系），对 $z$ 微调即可明显改变网络参数
		* 实验，$z$ 维数在曲线拟合为 16，图像分类为 64（此时其控制的 $\theta$ 最后一层参数有 640 个）
		> 应该也是不直接优化 $\theta$ 最后一层参数的原因：需要在更低维数空间 fine-tune，并且放大梯度；ANIL 可以参考此做法
	* table2, ablation study
		* 我做以下分类：1. $z$ 的生成，LEO 为 $z_\phi(\lambda)+\sigma_\phi(\lambda)\xi$，有的方法去掉一项（此外 $z\mapsto\theta$ 也有部分随机性，会随 $z$ 的一同去掉）；2. fine-tune 部分，选项包括对 $z,\theta$ 和不进行“x”
		1. Meta-SGD 即 MAML 额外学习 inner-loop 学习率的版本；文中认为参数空间没有低维表达导致效果差于下面的其他方法
		1. conditional generator only ($z$, x) 相当于 hypernet，只是其 hypernet 架构中有低维瓶颈（$z$）；
			> 生成 $z$ 的时候应该没有随机性，否则和 LEO no fine-tune 没区别
		1. conditional generator + fine-tune ($z$, $\theta$)
		1. LEO random prior ($\xi$, $z$) 似乎和 DeepSDF 比较类似（只是不训练 $z_i$，而只训练 $\theta$ 使得 $z$ 从随机初始 fine-tune 之后效果好；此外 $z\mapsto\theta$ 的方式不同，这里是 hypernet）；我感觉和完整版 LEO 效果也没有差很多
		1. LEO deterministic ($z$, $z$)；文中猜测 $\xi$ 随机部分在大数据集上会降低表现，虽然小数据集上会提高
		1. LEO no fine-tune ($z+\xi$, x)
		1. LEO ($z+\xi$, $z$)
		> ANIL 相当于 ($z_\phi$（不依赖于 $\lambda$）, $\theta$（仅最后一层）) 
* `MAML++-1810.09502`: #meta-learning/#MAML
	* "HOW TO TRAIN YOUR MAML"
	> TODO: summary, comparison tree, link, (broader impact?)
	* 增强 MAML 梯度稳定性做法：eqn(4) 每步内层迭代的参数都计入最终 loss，不同步的计入权重不同，第 $i$ 步权重记为 $v_i$，包括不迭代的 $i=0$
		* $v_i$ 采用“annealed weighting”策略，开始全同，随训练进行权重逐渐偏向后面的迭代
	* 二阶导计算代价高的解决：“derivative-order annealing”，前面几步只用一阶导训练（相当于预训练），后面开始用二阶导
		* 相关：`BI-MAML-2006.10921` 理论推导结论：按内层梯度大小区分前期后期，前期不用内迭代
	* batch normalization 相关
	* 内层迭代每步、网络每层都有各自内层学习率
		* table4 Meta-SGD 为每个参数有各自内层学习率，从而需要的参数量约为 MAML 两倍
	* 外层迭代学习率使用 cosine annealing
	* 此外，`1903.03096` 实验涉及与 MAML 比较，附录 11 提到 MAML 最佳学习率 0.1 左右，有和（发表之前认为最优的）0.01 结果对比
* `Taskonomy(#2018)`: #MTL/#transfer_learning|#task_grouping
	* "Taskonomy: Disentangling Task Transfer Learning"
	> TODO: summary, comparison tree, link, (broader impact?)
	* [作者解读-知乎](https://zhuanlan.zhihu.com/p/38425434)
	* 研究任务之间的相似性，有许多类任务，从哪些任务迁移到某个给定任务最高效；迁移方式用有向图表示
		* 普通 meta-learning 考虑同类任务、迁移到不同的数据上，这里考虑同一类数据、从某几类任务迁移到另外几类任务
		* 对于图像输入，任务类的例子：边缘探测，分割，深度预测，法向预测（这个就是深度的梯度从而原则上可以迁移）
	* 任务集合即顶点集合 $V=T\cup S$，target tasks $T$ 允许成为有向图的终点（即其他任务训练完成后再迁移到这里），source tasks $S$ 允许成为起点（即可以 train-from-scratch 再迁移到其他任务）
		* $T\setminus S$ 例如数据少的任务；$S\setminus T$ 例如上色、拼图、inpainting 这些我们没兴趣、但是可以无监督学的任务
	* 4 步骤：
	1. 从零学习：对每个 $s\in S$ 从头训练一个模型，具有 encoder-decoder 结构
	2. 迁移学习：对每个 $(s,t)\in S\times T$ 任务对，训练 $t$ 的 decoder，其输入为 $s$ 的 encoder（参数固定）
		* 高阶关联，考虑 $(\{s_1,\dots,s_m\},t)$，decoder 输入为所有 $s_i$ encoder 结果的 concat
	3. 计算任务的 affinity matrix；由于不同类任务 loss 不好比较，考虑比较 $s,s'$ 的“胜率”，即迁移到 $t$ 之后，多大比例数据点 $x$（文中记号 $I$）上 $s\to t$ 结果好于 $s'\to t$；并进行后续规范化
	4. 优化迁移方式的有向图：给定模型训练预算（预算越高相当于允许更多任务 train-from-scratch 而不是迁移），根据 affinity matrix 求解一个整数优化问题，即可得到最优有向图
		> 优化问题形式上把等式约束写成了两个不等式约束，不知道为什么非要这么干
	* 该做法的用途：
		1. 低代价解决一组任务（> 应该是对新的一批图片数据，还是要干同样的这么多类任务，则试图先在几个任务上从头训练，其他任务靠从这些任务迁移学习）
			* 实验比较“迁移获利”，比全部从零学习的胜率，都是小样本训练
		2. 解决一个只有少量数据的新任务（> 应该还是针对新数据，并假设该目标任务迁移需要的源任务有充足的数据）
			* 实验比较“迁移质量”，和大规模数据从头训练胜率接近对半（40%），即小样本结果与大样本比较
		> 对理论研究而言，我认为刻画任务之间的相似关系也比较重要
* `DANN-1409.7495`: #domain_adaptation
	* 有源域和目标域的数据，仅源域有标签，希望预测目标域的标签；
		* 通过使用对抗网络强迫特征提取器给出域无关的特征
	* "Unsupervised Domain Adaptation by Backpropagation"
	> TODO: comparison tree
	* [DANN 解读-知乎](https://zhuanlan.zhihu.com/p/363541328)；让判别器无法从提取的特征判断它对应的数据为源域还是目标域
		* 使用 t-SNE 可视化不同域数据提取出的特征的分布，能看到加了对抗 loss 的结果的不同
	* 应用例子：合成图像和真实图像为两个域，用合成图像标签（易获得）推断真实图像的
	* 标签损失（仅源域）使用 logistic regression loss，对抗网络判别器使用 binomial cross-entropy
	* 实验
		* MNIST 迁移到加彩色图片的版本
		* SVHN 数据比 MNIST 更多样，正向迁移有效而反向迁移无效
	> related: [另一篇论文-知乎](https://zhuanlan.zhihu.com/p/84148315) 实验中，目标域的准确率先提升后下降？
* `ML^3-1906.05374`: #meta-learning/#learned_loss, #RL
	* regular-train 不优化任务真实 loss 而是学出的替代 loss $M_\phi(y,f_\theta(x))$；用于 RL，包括 model-based 和 model-free
	* "Meta Learning via Learned Loss"
	> 符合 `2004.05439`“bilevel optimization”的记号，求导阶数也一致；
	> 实验似乎不包括小样本；虽然我觉得用于小样本的可能性还是有的
* `ALFA-2011.00209`: #meta-learning/#optimizer
	* 学习优化器 $g_\phi$，根据当前 参数、梯度 信息确定各分量的学习、遗忘率
	* "Meta-Learning with Adaptive Hyperparameters"
	* alg1 内层更新 $\theta\leftarrow\beta\odot\theta-\alpha\odot\nabla_\theta L$
		* 其中 $(\alpha,\beta)=g_\phi([\theta,\nabla_\theta L])$
		* eqn(7) $\alpha,\beta$ 形式，逐层生成；参数个数表达式，涉及层数和内层迭代数
* `2104.01677`: (#comparison_with) #FPN, #bilevel_opt
	* bilevel 优化形式的元学习，利用内层迭代最优点处性质，外层迭代不需二阶导
	* "A contrastive rule for meta-learning"
	* 考察 bilevel optimization 形式的元学习，$\min_\phi L^i(\phi,\theta),\min_\theta L^o(\phi^*,\theta)$
	* 摘要：本文做法能避免二阶导，不需对学习过程 BP
		> 看起来 equilibrium propagation 做法类似 ((n32f5j))DEQ=FPN，无穷次迭代达到平衡点，利用其性质不需 BP；
		> meta-objective 可以小样本，应该不太能快速学习（由于训练时内层充分迭代了）
	* augmented loss $L(\phi,\theta,\beta)=L^i+\beta L^o$
	* eqn(4) meta-gradient $\nabla_\theta=\frac{\mathrm{d}}{\mathrm{d}\beta}\frac{\partial L}{\partial \theta}(\phi_\beta,\theta,\beta)$ at $\beta=0$，用有限差分估计
		> FD 估计下，若利用 $L=L^i+\beta L^o$ 的形式，可以提出 $\partial_\theta L^o$ 项，只有 $\partial_\theta L^i$ 项需要两处取值相减除以 $\beta$；实现时也许可以直接利用 PyTorch 梯度累加
		* 该等式为 thm1 的推论，$d_\theta\partial_\beta L=d_\beta\partial_\theta L$
		> 注意最优点 $\phi_\beta$ 与 $\theta,\beta$ 有关，影响全导数
		* thm2 该估计误差的上界
		> 若内外 loss 一致（$L^o=\mathbb{E}_TL^i$，如 AD），易得 $d_\theta L=\partial_\theta L$，因为最优点处 $\partial_\phi L=0$；
		> bilevel 优化求导阶数讨论见 ((n8jk45))OB-diffOrd
	* 实验，$L^i,L^o$ 形式相近，区分 tr,val 数据，$L^i$ 额外引入 $R(\phi,\theta)$ 正则化项
		> 在小样本上不如 MAML；MAML 通过 early-stop 隐式正则化，这里显式正则化项
	> 求导阶数相关讨论在 ((n8jk45))OB-diffOrd
* `A2M-2108.10557`: #bilevel_opt
	* "Adaptation-Agnostic Meta-Training"
	> TODO: summary, comparison tree, link, (broader impact?)
	* eqn(9,10) 内外层迭代改成不动点交替迭代，从而避免二阶导
		> 我在 ((n32e3d))双边优化 里认为这事实上已经修改了动力学平衡点；((n8jk45))OB-diffOrd 提到了避免二阶导且准确的办法
	* secA.1:2 认为该做法足够通用，fig2 可用于原型式学习（传统方法，针对分类问题，可结合 metric-based）、学初始参数的元学习、自己搞的一种（> 可能是学优化算法的），以及将它们结合用于 ensemble learning
* `MetaNet-1703.00837`: #hypernet, #attention
	* 使用注意力机制的 hypernet
	* "Meta Networks"
	* 术语：slow weights 为元模型参数，fast weights 为针对特定任务的常规模型参数
	* alg1 训练的单步，使用单个任务，支撑集 $(x',y')$，查询集 $(x,y)$
	> 按我的框架 `unifyMethod2:`，以下重点讨论 $h=g(D^s)$ 形式
	* 双层 hypernet 结构
		* 常规推断时的 hypernet 输入样本 $x$ 输出 regular net 参数 $W_i^*$（`2021-09-29`(AD)）
		> 似乎若用注意力机制来编码集合，则查询阶段的注意力计算必写为这种低层级 hypernet 的形式
		* 元推断层的 hypernet 输入支撑集 $(x',y')$ 输出常规网络参数 $Q^*,R,M$
		* 所有元训练涉及的 slow weights（即元模型参数）为 $Q,W,Z,G$
	* regular inference: hyper 部分 $x_i\xmapsto{Q^*}r_i\xmapsto{R}a_i\xmapsto{M}W_i^*$
		* 顺序：样本、样本表示、attention、网络参数
		* regular 部分 $b:x_i\xmapsto{W_i^*}y_i$
		> 元训练内层和元推断产生的模型相同，即在样本上的推断方式相同，这里加上角标 $i$ 仅用于体现 query set；一般可能性见 `3losses:`
	* meta inference（> 即 $g(D^s)$ 形式）：
	1. $x_i'\xmapsto{Q}\nabla_i\xRightarrow[\text{batch}]{G}Q^*$ task-level 快权值
		* 只采样部分样本用于这里的任务表征；下方的 memory 则都是全部存储
		* 梯度相应的 loss eqn(6) 多样本形式，上方文字提到单样本形式为交叉熵（> 就是算法里写的形式？）
		* 用 LSTM（$G$ 参数化）接收集合输入，强行假设与输入顺序无关
	2. $x_i'\xmapsto{Q^*}r_i'$, $R=(r_i')$ index memory
	3. $x_i'\xmapsto{W}\tilde\nabla_i\xmapsto{Z}W_i^*$ fast weight for $x$
		* 注意 $W_i^*$ 生成方式与 regular inference 不同
		* memory $M=(W_i^*)$
		* 梯度相应的 loss 可与 $Q^*$ 生成所使用的不同
			* 算法中这里的 loss 使用模型 $b$（这里输入 $W$，上方输入 $W^*$ 时用于生成最终标签 $y$）
			* 生成 $Q^*$ 的则使用模型 $u$（输入 $Q$；若输入 $Q^*$ 则用于普通推断生成样本表示 $r$）
	* > (mine) 与常见 hypernet 不同：
		* 这里输入在数据集上的 loss 梯度，而非直接输入数据集 $(x,y)$
		* 集合编码采用 LSTM、memory-attention 两种方式，没用到 DeepSets
		* 注意力机制的使用与 Transformer 相似，（用 Transformer 的术语）这里相当于 query、key 使用相同生成方式 $x\xmapsto{Q^*}r$
		* {解读内层} hypernet，框架见 ((n3hg7a))1TaskHypernet：
			* 对 $X$ 区域分解，support set $D^s$ 里每个数据代表一片区域，$\Lambda=D^s$
			* 每个数据训练一个特定的推断网络参数 $W_i^*$，在该数据点上表现好
			* 各网络 $h_\lambda=b(W_i^*,-)$ 独立，但由于参数来自相同初值 $W$ 的微调，能体现 MTL 任务间关系
			* $l:x\mapsto\lambda$ 这里由 attention $R:r\mapsto a$ 实现，为软分类
			* 获得分类后，用其在参数空间（而非函数空间）取各模型 $h_\lambda$ 的加权平均，得到用于推断的特定模型 $h(x;a)=b(W,W^*,x)$
		* 未想好：如果外层用流形学习理解（类似 AD），内层的 hypernet 是否可以在此框架下解读
* `2104.03736`: #meta-loss/#support-query
	* 元学习外层 loss 不再用 query set 而是用在单任务上训练的整个模型
	* "Towards Enabling Meta-Learning from Target Models"
	* 文中将原有做法称为 support-query protocol，提出的新做法为 support-target protocol；计算开销变大但有一定收益
* `semiSupFSL`: #semi-supervised
	* 半监督方法用于元学习，利用无监督（没有 query set）的额外任务帮助学习元模型
	* "Task Cooperation for Semi-Supervised Few-Shot Learning", AAAI 2021
	* 对相似任务的 support set $D_S,D_S'$，限制在其上学到的模型 $f(D_S),f(D_S')$ 的距离（给出了特定的距离定义）
* `CAVIA-1810.03642` MAML 只学权重子集，内外层分别更新不同部分参数；内参数线性变换后得出网络 bias，无需学其初值
	* "Fast Context Adaptation via Meta-Learning", ICML2019
		> created on 2022-07-29
	* context parameter $\phi$ 各任务独立、在内层迭代更新；shared parameter $\theta$ 只在外迭代更新
	* $\phi$ 引入方式：concat 入各层激活值，各层共享同一向量，eqn(9) $h_{l+1}=g(W^h_lh_l+W^\phi_l\phi+b)$
		* （评）用的是我的记号；concat 解读来自 $h_{l+1}=g([W^h_l,W^\phi_l][h_l;\phi]+b)$
	* 新任务的 $\phi$ 初值不必元学习（可直接取 0），因为其影响都可以放到 $b$ 中
		* 训练期间该参数的历史值也无需保存（> 代码实现相对更方便）
		* 这还使算法对内层学习率更稳定；如果 $\phi$ 更新幅度大，$W_l^\phi$ 可在外循环时减小作为补偿
		* （评）稳定还由于其乘积形式有额外参数 $W_l^\phi$，若直接提供 bias 则不见得稳定
	* （评）与 ANIL 都只更新部分参数，但由于这部分参数含义不同，ANIL 中需要学其初值
		* 不确定是否可像 Reptile 避免二阶导
	* 相关：应用于 `functa-2201.12204`
* `MSCN-2205.08957` MAML 类元学习内循环加稀疏要求，用于 INR 数据压缩得稀疏编码，也可处理一般稀疏性
	* "Meta-Learning Sparse Compression Networks", TMLR2022
		> `2022-08-26`(CSImeet2) 推荐
	* sec3.1 网络用稀疏参数 $\theta\odot z$，$z_j\in\{0,1\}$
		* 由 $\phi$ 参化的 $z$ 分布，架构：随机噪声 $\epsilon$，$(\epsilon,\phi)\mapsto s$（重参化分布技巧），之后截断 $z=prox_{[0,1]}s$
		* loss 取 $\mathbb{E}_\epsilon$，额外惩罚 $s_j>0$ 的概率，以表达稀疏约束
		* （评）采样 0,1 分布的过程可微，另有 `AIDD-2101.00179` 提到 Gumbel-softmax 技术的做法；待确认联系，这里可能允许各分量不独立
	* sec3.2 eqn(8) 学 $\theta_0,\phi_0$，算外层 loss 用参数 $(\theta_0+\delta\theta)\odot g(\epsilon,\phi_0+\delta\phi)$，其中 $\delta\theta,\delta\phi$ 为内层更新
		* （没看懂所说的 eqn(7) 仅学 $\theta_0$ 形式不好的理由）
		* 可用 MetaSGD 这种同时学步长的元学习算法
	* sec3.2:-2 该方法可实现常见的各种稀疏性，参数、隐向量表征、梯度的稀疏性均可：
		> 1. 通过直接应用于所有参数的非结构化稀疏性
		> 2. 通过限制稀疏模式的结构化稀疏性
		> 3. 通过对一系列参数（a set of parameters）共享一个相同的 gate 达到的 group sparsity
		> 4. 通过 gated activation 的表征稀疏性
		> 5. 通过 mask 掉内部循环中的更新的梯度稀疏性
	* sec3.3 $\delta\theta$ 的形式，考虑两种：非结构化的稀疏梯度 $\theta+z\odot\delta\theta$，结构化的稀疏 modulation
	* （评）稀疏性处理相关：`1807.04222` l1 惩罚在 batch training 下无法用于引入稀疏约束，替代方案
* `STAR-2209.11208` （备用）Google 的工作，元学习学优化器
	* "A Closer Look at Learned Optimization: Stability, Robustness, and Inductive Biases"
		* Harrison, James; Metz, Luke; Sohl-Dickstein, Jascha; 
		> created on 2023-04-11
	* （评）`2303.07127` 学 PINN 优化器，并说其 ansatz 来自本文

#### Applications
* `2010.08276`: #few-shot/#shape
	* few-shot 用于形状描述，regular task：已知一些（不多）点分别在形状内部或外部，通过这样的方式描述形状：任意给定 query 点，网络判断它在内部外部
	* "T RAINING DATA G ENERATING N ETWORKS : L INKING 3D S HAPES AND F EW-S HOT C LASSIFICATION"
* `2012.02189`: NN 作为函数用于表达图像、形状，元学习学初始权重加快收敛、提高泛化
	* #image/#superresolution|#CT, #few-shot
	* 表达连续图像，网络 $f$ 输入空间坐标 $x,y$ 输出该点的像素值 RGB 分量；regular task 为图像超分辨率（few-shot）、CT 图像重建、ShapeNet 给定一个角度观察的图像输出三维结构
	* "Learned Initializations for Optimizing Coordinate-Based Neural Representations", CVPR2021
	> CT 图像重建，loss 不一定是根据某个像素点的取值给出，还可以通过函数 $f$ Radon 变换的结果与真实值比较给出，无需手动进行 Radon 反变换
	* 另：COIN-2103.03123 图像压缩存储/传输，通过只存储网络参数实现
* 其他：`2212.01168` MAML 用于 HNN 学物理系统

#### Reserved
* `2102.00940` "Meta-learning with negative learning rates" (ICLR2021) 证明在线性回归问题上，MAML 训练内层和推断时最优学习率不同，其中训练内层最优为负；未在图像等其他数据集上实验

#### related non-metaL
> OneShotNO((q8g71l)) 针对 PDE 的 one-shot，利用 PDE 解特性，不需要其他一系列 PDE 的解
* `pretrain-1904.04232`: #pretrain, #few-shot, #transfer-learning, (#open_source)
	* 用 pretrain 的迁移学习范式（非元学习）处理小样本的 baseline；实验比较结论：用浅层网络时需要减小数据的类内 variation，但深网络区别不大
	* " A Closer Look at Few-shot Classification", ICLR 2019
	> TODO: read, confirm summary, comparison tree, link, (broader impact?)
	* fig1 本文提出的方法，分类器包含 feature extractor 和最后一层分类器
		* 大样本训练整个网络，小样本上 fine-tune 分类器
		> 即大样本任务迁移至小样本
		* 分类器 baseline 版本：线性层接 softmax
		* 分类器 baseline++ 版本：cosine distance 接 softmax，据说可减少 intra-class variation
	* fig2 描述比较的其他元学习做法
		> 看起来 MatchingNet，ProtoNet，RelationNet 都是 hypernet 的{特例}
	* 被 `taskID-OoD-2102.11503`(metaLthm) 引用，声称其作为非元学习方法在 OoD 测试任务上好过一系列元学习方法
* `SMASH-1708.05344`: #hypernet, #NAS
	* 单任务搜索合适网络架构：训架构到参数选取的 hypernet，从而可对架构用零阶优化
	* "SMASH: One-Shot Model Architecture Search through HyperNetworks"
	* 单任务（大数据集）要选择合适的 NN 架构，NAS（Neural Architecture Search)
		* 问题框架属于 `metaUnderstanding-2002.00573`“针对单任务”，验证集调超参
	* 每种架构从头训练太贵
	* 学习一个架构到参数的 hypernet，从而可快速获得架构在验证集上的误差
		* 网络结构表达为 memory-bank（有多块）形式，NN 每一层看作一个 operation，对 memory-bank 进行读写；例如 ResNet，DenseNet
	* 训好 hypernet 之后，对架构用零阶优化算法搜索（随机采样架构，按验证集误差排序）
	* 对最终获得的架构用完整数据从头训练（无需 hypernet）


