> 2022-01-11 从原版 ~/nutstoreFiles/research/papers/GNNnotes.md 修改而来
* [THU-GNN must-read](https://github.com/thunlp/GNNPapers)
* 如果是若干年之后涉及某篇，可查其新的引用
* [ICLR 2022图学习领域都在研究什么？Open Review投稿文章一览](https://zhuanlan.zhihu.com/p/419669070)
* (todo) [人大魏哲巍：图神经网络的理论基础](https://mp.weixin.qq.com/s/cGkd_7I9KPsXTL8uO8Lfuw)
* [书籍：GNN 基础、前沿、应用](https://mp.weixin.qq.com/s/DcI7R3zTHCtHwVbcLVWWcg)，目录：
	* 第一部分：引言
		* 第 1 章 表示学习
		* 第 2 章 图表示学习
		* 第 3 章 图神经网络
	* 第二部分：基础
		* 第 4 章 用于节点分类的图神经网络
		* 第 5 章 图神经网络的表达能力
		* 第 6 章 图神经网络：可扩展性
		* 第 7 章 图神经网络中的可解释性
		* 第 8 章 图神经网络：对抗鲁棒性
	* 第三部分：前沿
		* 第 9 章 图神经网络：图分类
		* 第 10 章 图神经网络：链接预测
		* 第 11 章 图神经网络：图生成
		* 第 12 章 图神经网络：图变换
		* 第 13 章 图神经网络：图匹配
		* 第 14 章 图神经网络：图结构学习
		* 第 15 章 动态图神经网络
		* 第 16 章 异构图神经网络
		* 第 17 章 图神经网络：AutoML
		* 第 18 章 图神经网络：自监督学习
	* 第四部分：应用
		* 第 19 章 现代推荐系统中的图神经网络
		* 第 20 章 计算机视觉中的图神经网络
		* 第 21 章 自然语言处理中的图神经网络
		* 第 22 章 程序分析中的图神经网络
		* 第 23 章 软件挖掘中的图神经网络
		* 第 24 章 药物开发中基于 GNN 的生物医学知识图谱挖掘
		* 第 25 章 预测蛋白质功能和相互作用的图神经网络
		* 第 26 章 异常检测中的图神经网络
		* 第 27 章 城市智能中的图神经网络

### collection
* `HyGnn-2002.00092`: #multitask, #computational_graph
	* 问题：人群计数，密度图+定位（我感觉定位的 loss 应该用最优传输距离）
	* 手动设计的图结构：a computational graph; *multitask*，网络分为并列两部分, communication between scale $i$ and domain $m$
	* Update rule, dependency of variables: 
	$$\begin{matrix}
	\bm{h}_j^m&\rightarrow &e_{ji}^m &\rightarrow &m_{ji}^m
	\\&&\uparrow&\nearrow&&\searrow
	\\&&\bm{h}_i^m &\rightarrow&\tilde{h}_i^m&\rightarrow &\bm{h}_i^m
	\\&\swarrow&&\searrow&\uparrow
	\\h_i^{'n}&\leftarrow&\bm{h}_i^n&\rightarrow&\breve{m}_i^{nm}
	\\&\searrow&\downarrow&\nearrow
	\\&&\breve{e}_i^{nm}
	\end{matrix}$$
	* $h_i^{'n}=E_\phi(h_i^n)*h_i^m$, 主要应该是 encode $h_i^m$，为减少参数，线性变换 $W(h_i^n)$ 用卷积（见 ref [Bertinetto] 1606.05233，虽然没完全搞清楚它要干什么）
		* ref: one-shot learning; 不完全确定，猜测处理的问题是：给定 $z_i$，对新的 $x$，分别预测它和各个 $z_i$ 是否同类，预测同类可能性的网络为 $\phi\bigl(x;\omega(z_i;W')\bigr)$ (target $\ell_i$)
	* idea: 多任务，训练求 NN 表达的（薛定谔）方程解时，不一定解完了再做下一步，可以训练的同时解决目标任务
		* 用卷积的 aggregator 也许可以达到（接近）维数无关，便于 meta？大规模问题很可能需要 meta 加速
* `HGNN-2002.04813`: #hierachichal_GNN, #multitask, #task_embedding
	* （名称冲突：HGNN, hypergraph NN, below）
	* 分类、回归问题；分类版本：第 $i\in[m]$ 个 $k$-分类任务，希望得到任务的 embedding $\hat{e}_\text{t}^i$，以 $(\hat{h}(x^i),\hat{e}_\text{t}^i)$ 作为分类网络输入来帮助该任务的分类
		* concat 能帮助分类的理由在 定理 1，虽然 $\lambda=0$ 时是 trivial 的（取 $W_2=[W_1^\mathrm{T},0]^\mathrm{T}$）
	1. intra-task GNN, update *training* data embedding $h_j^i$ (initial $\hat{h}^i_j$); maxpool: initial task (graph) embedding $e_\text{t}^i$
		* label $y^i_j$ 用到两次，除了 BP ($f(\hat{h}(x^i_j),\hat{e}_\text{t}^i)\sim y^i_j$) 以外，这部分更新法则也用到
		* 全连接的 graph，边属性 (adj mat) $G_i$ 根据距离、是否同类确定
		* (thought: 回归问题可以用 $g^i_{jl}=(y^i_j-y^i_l)^2\exp(-\|h^i_j-h^i_l\|_2^2)$，而不是只扔掉符号)
		* 更新类似学习向量量化方法，靠近同类远离异类，靠近的影响更大；只是这里更新的是 embedding，并且全体点同步更新
		* initial task embedding 根据不同任务（分类标准）下“聚类”的不同形态给出
	1. inter-task GNN, update task embedding $e_\text{t}^i$
		* 上一步的 graph 是这一步的 node
		* 同样类似学习向量量化，与上一步稍有区别：无 label，距离用 $a(-,-)$ (cos func)，求和 $H_iG_i$ 换 softmax
	1. inter-class GNN (parallel with inter-task), $e_\text{c}^{iy}$, $y\in[k]$
	1. predict: eqn (3), try all $y$ ($e_\text{c}^{iy}$)
	* 与 HyGnn 的多任务不同，那里是同一输入有适合不同任务 $m,i$ 的 embeddings，这里是直接 embed 任务 $i$ 本身
		* HyGnn, update data pt emb: 不同 task 之间 interact
		* HGNN intra-task, update data pt emb: 与其他 data pt interact；标签影响作用方式: 不仅通过训练得到的网络参数，还直接控制吸引/排斥
		* HGNN inter-task, update task emb: 与其他 task interact
* `GraphRNN-1802.08773`: (#data) #graph_generation
	* 问题：生成图（数据生成），根据已有的图数据， generation 生成任务（类似人脸生成）；评估：手动选取几个 graph statistics
	* graph-level RNN + edge-level RNN (GRU)
	* fig 1 + alg 1
	> 另有 `2006.02879` GrAD (graph auto-decoder) 从 latent code $z$ 生成图结构，细节没看
* `GPNN-eccv2018`: (#logical) #graph_generation
	* 问题：生成关系图（与顶点标签）；给定图像、视频，物体作为图的顶点，（物体识别之后）回归（图边权值）+分类（边类型）；评估：数据集的标签为关系图
	* 用 CNN 生成输入 feature（$\Gamma_v$, $\Gamma_{vw}$；p9 末），GNN 得到邻接矩阵 $A_{vw}$ 和对象特征 $h_v$
		$$\begin{matrix}
		?&&h_w&&\Gamma_{vw}
		\\\downarrow&&\downarrow&\searrow&\downarrow
		\\m_{vw}&\rightarrow&A_{vw}&\rightarrow&m_v
		\\&&\uparrow&\nearrow&\downarrow
		\\\Gamma_v&\rightarrow&h_v&\rightarrow&h_v&\rightarrow&y_v
		\end{matrix}$$
* `NRI`, Kipf's thesis: (physical) graph generation
	* 问题：生成（关系）图 $z$，根据观测数据 $x$（不同对象的时间演化）inference 推断任务；评估：预测对象的下一步演化，
	* VAE: encoder $q_\phi(z\mid x)$ eqn (6.3-6); decoder $p_\theta(x\mid z)$ eqn (6.8-10) + RNN eqn (6.11-15); VAE loss $\mathcal{L}$ eqn (6.1)
	* avoid degenerate en/decoder: 多预测几步
	* idea: Schrodinger eqn 解是一个概率分布，通过它推断原子关系（分子结构）；稍有不同，在于概率分布 iid 而不是 Markov chain
	* 相关：`[复杂系统自动建模综述：描述/预测/理论发现]` 提到 CGN 降低了 NRI 模型复杂度，可用于百、千节点规模的图
* `dNRI` NRI 中允许图结构动态变化
	* "Dynamic Neural Relational Inference for Forecasting Trajectories", CVPR2020
		> created on 2022-04-02
	* fig3 编码阶段，从 $x^t=(x_i^t)$ 给出边连接估计 $z^t=(z_{ij}^t)$：$x^t$ 输入全连接 GNN
		* prior LSTM 编码（GNN 输出的）历史得 $p_\phi(z^t|x^{1:t},z^{1:t-1})$
		* enc 反向 LSTM 编码未来（GNN 输出），再结合前向 LSTM 结果得 $q_\phi(z^t|x^{1:T})$
	* fig3 解码阶段，据 $z^t$ 采样生成 GNN 结构，输入上一步 $x^t$ 预测得 $p_\theta(x^{t+1}|z^{1:t},x^{1:t})$
	* sec3:-1 预测时 $z^t$ 用先验分布更新 $p_\phi(z^{1:t}|x^{1:t},z^{1:t-1})$
	* 实验，人行走时肢体变化，篮球赛运动员移动（给前 40 帧预测后面的帧）；结果好于静态的 NRI
* `AIDD-2101.00179` 多体动力学，同时推断主体背后的网络结构、重建（带随机性）动力学用于预测
	* "A Universal Framework for Reconstructing Complex Networks and Node Dynamics from Discrete or Continuous Dynamics Data" by 张江
		> `2022-08-24`(lectures) 推荐
	* 摘要：
		> 我们使用可微分伯努利采样过程生成候选网络结构，
		> 可处理二进制、离散和连续的时间序列数据，
		> 重建结果对噪声和缺失信息具有鲁棒性。 
	* secII.A 用马氏链建模 $p(x^{t+1}|x^t,A)$，$x^t\in V^n$ 多体状态，$A$ 邻接矩阵
		* 比 $x^{t+1}=f(x^t,A)+\zeta^t$（$\zeta$ 为噪声）形式更有一般性，后者无法描述元胞自动机等
		* 只依赖于邻居 $p_i(x_i^{t+1}|x^t\odot A_{:i})$；多数动力学中各节点动力学相同，$p_i=p$ 与 $i$ 无关
			* （评）用我的记号写是 $p_i(x_i^{t+1}|\{x_j^t,j\in N(i)\})$
	* secII.B.1 网络生成器部分，根据 $\Theta\in[0,1]^{N\times N}$ 采样邻接矩阵（网络结构）
		* 网络生成器伯努利采样，未用 NN
		> 为了使采样过程可微，我们使用 Gumbel-softmax 技术生成邻接矩阵
		* （评）0,1 分布采样过程可微，另有 `MSCN-2205.08957` 做法，或许还允许各分量不独立
		* 相比 `NRI` 式的 AE 架构，“在灵活性和计算效率上有很大的提高，并且可以应用于非常大的网络。”
		> 此外，噪声 ξij 的引入可以推动网络生成器在优化期间跳出局部最小值。 
	* secII.B.2 动力学预测部分，类似 GNN 汇总邻居信息
		* 最后预测新时间步状态，连续状态空间输出正态分布均值方差，离散分布输入 softmax
	* 训练：最大化数据上定义的似然函数，惩罚网络边数（稀疏连接），优化网络参数
	* 实验：连续状态空间的弹簧、SIR，离散的 boupled map network，binary 的 Voter 模型
* `2207.00931` （备用）用 GVAE 设计图结构使有弹性（如电力网络）：可靠性，故障恢复能力
	* "Graph Learning based Generative Design for Resilience of Interdependent Network Systems"
		> created on 2022-07-19
	* 电网图结构表现度量指标 EDNS（expected demand not satisfied）
* my comparisons: graph generation
	| approach | task | type | input | assess |
	|:--:|:--:|:--:|:--:|:--:|
	| GraphRNN | 数据生成 | 数据生成 | graph examples | 手工设定特征 |
	| GPNN | 物体（逻辑）关系 | 回归+分类 | image/video | dataset labels |
	| NRI | 对象（物理）关系 | 推断 | 时间演化观测数据 | 后续演化预测 |
	| SH | 颜色相近关系 | ？ | 大规模 graph | 图像分割准确度 |
	* generation task, compare: graph evolution predict
* `SH-1605.06325`: (#visual_color) #graph_degeneration, #img_segmentation
	* 图像分割问题，用 graph degeneration 方式实现：先生成细粒度 graph，顶点值为色块平均颜色，边为颜色差值（边界强度）
	* fig 2、3，合并顶点逐步得到粗粒度 graph（色块）
* C-SWM, Kipf's thesis
	* 问题：学习主体与其他主体、环境的交互方式，某个 action 会带来什么结果
	* fig 8.1; graph update eqn (8.3-4) with action $a$;
* `moleculeGCN-1603.00856`: #edge_embedding_flow
	* 问题：给定分子结构，预测性质；根据衡量标准的 AUC ROC 猜测是二分类；
		> p8 targets from many different biological classes
	* GNN design: "weave module" fig 4, 顶点和边均为 RNN（比较 GraphRNN）；普通 GNN 仅把边作为隐式的中间层，这里边是单独一个 stream
		$$\begin{matrix} h_i^{\ell+1}\\\uparrow&\nwarrow\\h_i^\ell&\rightarrow&e_{ij}^\ell \end{matrix}$$  
		$$\begin{matrix}
		h_{i}^{\ell+1}&&e_{ij}^{\ell+1}
		\\\uparrow&\times&\uparrow
		\\h_i^\ell&&e_{ij}^\ell
		\end{matrix}$$
* `invEquivGNN-1905.04943`: #theory, #graph_classification
	* 问题：带权（超）图 $G\in\R^{n^k}$ 的分类（要求顶点顺序 invariant），以及 equivariant 任务；没有顶点信息 $h_i$；
	* eg. ordinary graph, weight matrix $W\in\R^{n^2}$; face-weighted mesh $\in\R^{n^3}$
	* equiv different def: consider tensor in $\R^{n^k}$ (not $(\R^k)^n$), in numpy `a[i[0],...,i[k-1]]`, all axes permuted together
		* tensor algebra: $\bigotimes^k\R^n$, denote $P_\sigma=\mathsf{Set}(-,\R)[\sigma^{-1}]$, operates as $\bigotimes^kP_\sigma$
		* categorial: $\mathsf{Set}([n]^k,\R)=\mathsf{Set}\bigl(\mathsf{Set}([k],[n]),\R\bigr)$, $\sigma$ operates as $\mathsf{Set}(-,\R)\mathsf{Set}([k],-)[\sigma^{-1}]$
	* 构造：fig 1, eqn (1)
	* 一个更简洁的构造/证明见 `proofInvEquivGNN-1910.03802`：遍历 $\mathsf{Grph}(F,G)$，定义了 homomorphism number eqn (3-4)，用不同 (unweighted) $F$ 给出函数的线性组合为稠密子空间；见 fig 1(b), eqn (5-6)
* `GraphKernelNet4PDE-2003.03485`: #computational_graph, #PDE
	* 问题：求解（椭圆）PDE $\mathcal{L}_a(u)=f$, $u|\partial D=0$ eqn (4)；解由基底线性组合给出，用 GNN 训练出一个与 grid 选取无关的求解迭代算法
	* 基于迭代算法 eqn (7-9)；构造图，grid 为顶点，$r$-邻域连边，得到类似 RNN 的迭代格式 eqn (10)
	* 应该不能处理 NN 解，导致难以处理高维 PDE
	> more details see `AI+SC-notes.md`
* `HGNN-1809.09401`: #hypergraph, #spectral
	* adj mat $H\in\R^{V\times E}$
	* hypergraph Laplacian $\Delta=I-\Theta$ before eqn (4)
* [DHGNN](https://www.ijcai.org/proceedings/2019/0366.pdf): hypergraph, (graph generation), ((manual) dynamic graph)
	* 问题：输入的图结构不一定可信，希望找出隐藏的重要信息
	* 每步迭代改变 hyperedge 连接方式，去掉原有的所有连接，根据 node embedding 重新生成 hyperedge $e_u$（带“中心 node $u$”）：
	* hyperedge generation (alg 1)：for $u\in V$, $k$-NN + $(S-1)$ nearest $k$-Means centers
	* node embedding update: feature conv, node $\to$ hyperedge $\to$ node, fig 3-4, eqn (3-4)
* [chem:ElectronPathGeneration](https://openreview.net/pdf?id=r1x4BnCqKX): chemistry, graph evolution predict
	* 问题：给定反应物和溶剂，生成模型给出反应过程（满足某种概率分布）；
	* 反应序列表示为原子序列 $\mathcal{P}_{[0:T]}=[a_0,\dots,a_T]$，其中 $(a_{2t},a_{2t+1})$ 去除化学键而 $(a_{2t-1},a_{2t})$ 新建化学键；
	* alg 1，选取起始原子与下一个原子均用 GNN $h_\mathcal{A}(G_t)$ 给出（$G(:\mathcal{M})$; 另外还依赖于溶剂），并且每步决定是否终止反应
	* loss: log-likelihood $-\log p_\theta(\mathcal{P}_{[0:T]};G_0,G_e)$，其中数据给出了反应过程 $\mathcal{P}_{[0:T]}$（的分布）；目标是让模型 generate 的分布和数据的分布接近
	* 与下方 GTPN 比较：
		* 这里化学键改变的原子由序列给出，GTPN 每一次都重新生成两个原子，且化学键改变方式也当场计算得出
		* 这里相对简单，没有 MDP、全局 embedding 等
		* GNN 部分，这里每次重新计算，仅作为下一个原子选择的依据；GTPN 则类似 RNN，每步反应只对 GNN 更新一步
* `GTPN-1812.09441`: #chemistry, #graph_evolution_predict, 
	* 问题：给定反应物、溶剂，预测反应过程
	* 使用 RL（MDP），label 给出 reward；action 为改变一步化学键
	* 基本设定：以下格式为：我熟悉的记号（:原文记号），（首次出现）没有括号表示同原文
		* GNN graph 结构：几乎完全图（边类型包括 NULL），只有溶剂（reagent）分子的原子之间不连边 (before "Top-K atom pairs")
		* 全局状态 embedding：$H(:h)$, using RNN (GRU)
	* 流程见 fig 2；
		* $a_i(:c_i)$ using *attention*, coef$=\operatorname{softmax}_j\Theta(h_i+h_j,e_{ij})$ (before eqn (4))
		* edge emb $z_{ij}$
		* 根据 $z,H$ 决定 action：反应停止（$\xi$）概率，原子对 $(i,j)\ (:u,v)$，新化学键类型 $b$ (eqn (6-8))
		* update $H$, $h_i$ eqn (25-29)
	* 暂时没看懂 loss 形式
	* 同类方法（GNN+RL）见 `DLonGraphs-1812.04202`
* [chem-multimodalOpt](https://openreview.net/pdf?id=B1xJAsA5F7): chemistry
	* full title: "Learning Multimodal Graph-to-Graph Translation For Molecular Optimization"
	* 没有细读；问题看起来是：encode-decode，分子结构先抽象为某种树、再 embedding，然后据此恢复树、进而分子结构，可能得到的比原来分子效果更好, "molecule optimization"？图 1
* [GPN.pdf](http://papers.nips.cc/paper/by-source-2019-610): meta learning
	* problem: meta classification, 类别全体 $\mathcal{Y}$ 给定, hierachichal; task $T$ inside $\mathcal{Y}^T$
		* 应该是同一类数据，如 ImageNet，不同任务包括：识别是车、动物、植物，或者只识别是哪一种动物
	* method: class $y$ 赋予 prototype $\bm{P}_y$, eqn (2) 用于判断是哪一类；
	* hierachichal classes 组成 graph，跑 GNN eqn (4), 如果有多种不同边结构（多种 classes 的分类方式，从而有多棵 hierarchy 树？）eqn (6)
* EGNN (CVPR): meta-learning (few-shot, episodic)
	* 问题：分类，$N$-way $K$-shot，包括 semi-supervised
	> semi-supervised 可能类似把一部分（regular）训练数据改成测试数据，只是不计入 loss，且这部分能保证测试样本均衡（各类别有相同个数样本）
	* 方法：每个 task 构造完全图 GNN，样本 (regular train+test) 为 node，feature $v_i^\ell$，edge feature $e_{ij}^\ell\in[0,1]^2$，update eqn (3-6) 多次后输出预测 eqn (7)
	> 似乎对 regular task（meta testing）是 lazy learning，直接把训练数据和测试数据一起输入；有可能学出类似 K-means 的算法
	* loss eqn (8)
* `Meta-Graph` (ICLR2020 under review): meta learning, VAE (VGAE), link prediction
	* 问题：link prediction，给定 graph（task）分布 $p(\mathcal{G})$，每个 graph 给出 *少量* 的边，任务是预测所有边
	* 方法：VGAE eqn (1-3)，其中 $p(A\mid Z)$ 取定，只需优化 $q_\phi(Z\mid A,X,s_\mathcal{G})$, $(s_\mathcal{G}=)\psi(..)$
	* 与 MAML 区别：有 graph signature $s_\mathcal{G}$，
	> alg 1 typo?: "initialize $\theta\leftarrow\phi_K$", $\tilde\theta\leftarrow\phi_K$? 
* `equivGNN-2103.14066`: #equivariance|#Euclidean_group
	* "Beyond permutation equivariance in graph networks"
	* 普通 GNN 只有 permutation equivariance，这里额外要求 $E(n)$（平移+旋转）-equivariance
	* 更新方式：依次更新 $e_{ij}$（invariant），$v_i$（invariant），顶点位置 $x_i$（equivariance），全图总特征 $u$
		> 也许对有 hierarchical 结构的图，可以分层定义总特征 $u_l$
* [CogDL 介绍](https://mp.weixin.qq.com/s/2I139ilaOs1UOh_D9_9Z2w): GNN/deep, reversible network, (open source)
	* 避免深层 GNN 的 over-smoothing/squashing 问题：残差、跳跃连接、归一化、（针对内存不足）可逆网络
	* "CogDL: An Extensive Toolkit for Deep Learning on Graphs"
* `GNNmetaL-2103.00137`: #GNN, #meta-learning, #review
	* "Meta-Learning with Graph Neural Networks: Methods and Applications"
	> reserved block
	* 给定 graph 上的元学习：node embedding, node classification, link prediction
	* GNN 上的元学习：shared representation, 分别考察 node/edge level 和 graph level 的
	* 另有简介其他问题、应用、理论
* `GnnExplainer-1903.03894`: #intepretation
	* (reserved) 解释某训好的 GNN 的预测机理，方法与具体 GNN 架构无关
	* "GNN Explainer: A Tool for Post-hoc Explanation of Graph Neural Networks"
		> created on 2022-01-25，被 `2006.11287` 引用：非符号回归的 GNN 解释方法
	* GnnExplainer 形式化为优化任务，使完整模型、可解释的简化模型的预测结果互信息最大
		* 用 mean field variational approximation 来实现
	* 认为的解释 GNN 及其预测的理想属性：
		* 阐明消息传递中，哪个重要的子图结构对预测结果有重要影响；子图尽可能简洁
			* 后面实验的分子分类任务，能识别出重要的官能团和环结构
		* 识别重要的目标节点的特征是被哪些邻居节点影响的
		* 解释单节点预测结果（单实例解释）、对给定节点集预测结果给一个统一解释（多实例解释）
			> 考虑的预测问题似乎应该是获得每节点的预测，而不能是图分类这样整个 GNN 输出单个实数的场景
		* 对节点分类、链接预测、图分类等关于图的 ML 任务都能解释
		* 能解释 GNN 系列模型的任何变体（模型无关）
* `HiSTGNN-2201.09101` 用零散气象站观测数据做天气预报，见 `2022-02-23`(AISCmeet2)
* [GNN问题用微分几何、代数拓扑解决](https://mp.weixin.qq.com/s/GBOeI5O-mRNqyiVYvZc_aA)
	> 2022-04-01
	* Beltrami 神经扩散（BLEND），节点由位置+特征坐标表征，可同时演化并决定扩散性，使图成为辅助角色
	* cell complex，可构建「提升变换」，用高阶单元增强图，以执行更复杂的分层消息传递形式
		* 在计算化学领域给出有希望的结果
	* GNN over-squashing 现象；将输入图与计算图解耦、在不同的图上传递消息有助于缓解，图重新布线（graph rewiring）
	* 导致 over-squashing 的瓶颈可归因于图的局部几何特性
		* 通过定义 Ricci 曲率的图类比，可证明罪魁祸首是 negatively-curved 边
		* 引入类似于「反向 Ricci 流」的图重新布线过程，该过程去除有问题的边并生成一个更易于消息传递的图，同时在结构上与输入图相似。
		* 对比图：基于扩散的重布线（DIGL）边数增加 3 倍，基于曲率的方法调整 36% 边而总数不变
	* 后续文章将更详细解释
* `neuralGDE-2106.11581` GNN 上连续时间动力学，考察动态图，演化所在隐空间含顶点隐向量、额外顶点与边
	* " Continuous–Depth Neural Models for Dynamic Graph Prediction"
		> created on 2022-04-01
	* （评）允许中途改变的动态图，未确认是否包括动态顶点
	* fig2 历史 $M$ 步的图观测 $o$ 输入编码器 $E_G$（类似 VAE，给出均值方差）
		* 得顶点隐向量，并生成额外顶点、边及隐向量“augmented graph”，整体记为 $Z_0$
		* 隐空间时间演化 $Z_t=\Phi_t(Z_0)$
		* 解码器 $D_G$；考虑确定性与随机的解码器，后者形如 Neural GSDE；sec3:-1 Stratonovich SDE 形式
	* eqn(5) 图结构变化“discrete transition”时，对隐向量作用类 GNN 算子得到 $Z_t\mapsto Z_t^+$
		* 该算子为 GRU-cell，得到 GCDE-GRU
	* hybrid GDE 的 adjoint 方程，在训练时用到
		* 图结构改变时 $\lambda_t,\lambda_t^+$（逐顶点有定义）；涉及 set-valued mapping $F,G$
	* 相关：`neuralGDE-2106.11581` 似乎有类似 GDE 的观点，每顶点为一粒子、进行交互，只是未考虑图结构中途变化
* [2203.15544范畴论解读GNN与DP联系](https://mp.weixin.qq.com/s/0aB2FW-Vsp8X9dnMiu0cEA)
	* 求 source 映射 $s:E\to V$，求 target 映射 $t:E\to W$；对 GNN 有 $W=V$
	* 记号与我所用记号的关系：$[E,R]=\mathsf{Set}(E,R)$，$\mathbb{N}[R]=[R,\mathbb{N}]$
	* 多步映射：$s^*:[V,R]\to[E,R]$，kernel 变换 $k:[E,R]\to[E,R]$ 可添加权重信息等
		* 自然映射 $[E,R]\to[2^E,\mathbb{N}[R]]$（注意 $E$ 有限集）
		* $t^{-1}:W\to 2^E$，$(t^{-1})^*:[2^E,\mathbb{N}[R]]\to[W,\mathbb{N}[R]]$
		* 消息聚合器 $\oplus :\mathbb{N}[R]\to R$
* `GNNS-2207.06684` （备用）大规模图中估计所有可能的 k-顶点子图的出现频率分布
	* "Subgraph Frequency Distribution Estimation using Graph Neural Networks"
		> created on 2022-07-26
	> TODO: TLDR, MOC, link, (broader impact?)
	* （评）该任务与 `[复杂网络的模体motif]` 相关
	* 传统精确算法复杂度高，MCMC 等估计算法也有不足…
	* fig1 总框架，$N$ 顶点图，GCN 获得每顶点 embedding $Z_n$（$N\times K$）
		* 随机采样 $M$ 组子图得 $Z_s$（$M\times K$）
		* 用采样所得子图结合各子图 $t$ 的“interaction matrix”$I_t$ 重建原图
		* 惩罚重建误差来训 GCN
	* （评）没完全搞懂；估计是无监督训练，编解码网络架构中强制引入拆子图、重组的过程，从而极小化重建误差的同时可自动保证子图提取准确？
* `2202.10996` （备用）考虑动力学机制相同、图结构可能不同的一类多体系统，GNN 分别提取动力学与图结构
	* "Learning Dynamics and Structure of Complex Systems Using Graph Neural Networks"
		> created on 2022-11-11
	* GNN 记号：
		* 消息函数 $M(-)$ 汇总边与其两顶点状态给出边消息
		* 汇总函数 $A(-)$ 汇总边消息给出顶点消息
		* 更新函数 $U(-)$ 根据顶点状态、消息给出新状态
		* readout 函数 $R(-)$ 根据顶点状态给出 GNN 输出（可各顶点分别作用，也可 mixed 接收所有顶点状态给出统一输出）
	* 在很简单的动力学上测试：概率图的 belief propagation 算法迭代给出了一个动力学
		* 概率图模型定义包括顶点概率、边的联合概率，算法用于得到特定顶点的边际分布
		* sec2.2 为使其动力学更复杂，使用随时间变化的顶点概率，而边概率不动；此时算法输出为边际分布的连续估计
	* sec4.2 GNN 的重要优势：系统的 dynamical 和 structural 部分分开表征
		* sec4.1 GNN $M,U,R$ 映射称为 canonical 函数，因为它们对图中所有部分共享、并且还对一类图都共享
		* （评）应指这些有不同底层图结构的一类系统都用相同 canonical 函数；现仅 $A$ 映射可变
		* sec4.2 canonical 函数表达了一类系统的动力学规律，例如 belief propagation 算法
		* 图参数描述特定系统的结构，例如概率图模型里的成对耦合强度（> 边联合概率形式）
	* 实验在多个概率图上准备了 belief propagation 算法的轨迹、分别训 GNN，要求 GNN 对不同概率图使用相同 canonical 函数、不同的图参数
		* sec5.4 可解释的 canonical 函数（未看细节）
		* fig8 恢复出的边联合概率，与真实的联合概率很像
		* sec6，泛化能力除了能恢复边联合概率，还能在不知道 belief propagation 算法具体实现的前提下复现这一算法
* DiG，Distributional Graphormer：从分子结构预测到平衡分布预测；{_n79l98}
	* [2023-07-09](https://mp.weixin.qq.com/s/R-tJRrO5aeA2-qk62MBrmQ)
	> 可用于预测分子结构平衡分布的深度学习框架 Distributional Graphormer (DiG)。DiG 可以快速生成真实多样的构象，进而为实现从单一结构预测到平衡分布预测的突破奠定基础。
	* 类比：模拟退火、扩散生成模型，均为将简单分布逐步完善、产生复杂分布；{_n79l0x}
		> DiG 受到热力学和优化的经典方法——模拟退火算法（simulated annealing）启发，通过模拟一个随机过程，将一个简单分布逐渐完善，从而产生一个复杂分布。此随机过程的预测在深度学习框架中完成。
		> 这也是最近将生成式人工智能推向火热的扩散模型（diffusion models）的模式。
		> DiG 将这一思想又带回了热力学研究，形成了一个灵感和创新的闭环。
	* 训练可用模拟数据，或直接拟合能量函数；倾向于后者，前者数据生成成本高
		> DiG 可以使用不同类型的数据或信息来进行训练。
		> DiG 首先可以使用模拟数据，例如分子动力学轨迹，来学习分布。
		> DiG 也可以直接使用分子系统的能量函数来训练，因为平衡分布可通过统计力学理论直接由能量函数给出。
		> 由于分子体系平衡分布预测不同于传统 AI 任务，其数据生成需要耗费长时间的模拟计算因而难以大规模得到，直接从能量函数学习便是一个缓解对数据严格依赖的手段。
	* 包括蛋白质多种折叠态
* Graphormer-2106.05234，用 Transformer 处理图数据
	* [2023-07-09](https://mp.weixin.qq.com/s?__biz=MzAwMTA3MzM4Nw==&mid=2649467207&idx=1&sn=8cd9bb7a422036189de5baaf072a62cd)
	* 三种编码：中心性、空间、边；{_n79n2w}
	* 中心性编码，描述节点重要性；本做法用 degree；{_n7om1j}
		* 理论上还可 page rank 等；{_n7om1v}
	* 空间编码，两两相关性大小，实验用无权最短路径，理论上还可加权最短路径、节点间最大流量、化学分子中原子 3D 距离等
	* 边信息编码，在节点两两相关性定义中引入，涉及其最短路径上边特征加权和
		> 将连边上的信息作为权重偏置（Bias）引入注意力机制中。
		> 具体来说，在计算两个节点之间的相关性时，研究员们对这两个节点最短路径上的连边特征进行加权求和作为注意力偏置，其中权重是可学习的。
	* 理论证明，流行 GNN 网络均作为 Graphormer 特例，如 GCN，GIN，GraphSAGE；{_n79n2q}
		> 例如，当两个节点为邻居节点时，将空间编码设为0，或将空间编码设为-∞，并且令 W_Q=W_K=0, W_V=I，则自注意力层即成为 GCN、GraphSage 等网络中的 MEAN Aggregation 操作。
* `Graphormer-2106.05234`
	* "Do Transformers Really Perform Bad for Graph Representation?"
		* Ying, Chengxuan; Cai, Tianle; Luo, Shengjie; Zheng, Shuxin; Ke, Guolin; He, Di; Shen, Yanming; Liu, Tie-Yan; 
		> created on 2023-07-10
	* sec3.2 引入特殊的全局节点 [VNode]，与所有节点连接（但不视为物理连接，不影响已有顶点对空间、边编码）
* Graphormer 代码记录
	* graph 数据输入格式，仅支持 DGL/OGB/PYG 三个包给出的图数据格式；以下只关注 DGL 数据处理方式
	* edge_feature 生成方式见 Graphormer/graphormer/data/dgl_datasets/dgl_dataset.py:131 （针对单张图）
		* `edge_input = algos.gen_edge_input(max_dist, path, attn_edge_type.numpy())`
		* shape [n, n, max_dist, dim_feat]
			* dim_feat 似乎是：所有 edge 的 feature 由 dict 给出，遍历其 value 中 int 型数据并 concat 所得维数（仍需确认）
		* 取值：i 到 j 距离 $d_{ij}$，考察其最短路径上的第 k 条边（$k=1,2,\dots,d_{ij}$），其 feature 即存储于 edge_input[i, j, k, :]；若 $k>d_{ij}$ 则 edge_input[i, j, k, :] = -1
			* 信源：Graphormer/graphormer/data/algos.pyx:l89
			* `edge_fea_all[i, j, k, :] = edge_feat_copy[path[k], path[k+1], :]`
		* 使用方式：graphormer_layer.py:145 过编码器后，对 dim_feat 维度求平均
			* :150 对不同 dist（小于 max_dist）取值的边 feature，对 n_head 维度作不同线性变换
			* 这里还涉及 spatial_pos((_n82e33))，其操作为 全部 -=1，clamp 最小值 1、最大值 max_dist
			* :160 对 max_dist 维度求和，之后除以 spatial_pos（即：显式要求距离远的节点相互影响小）
	* node_feature 只包括了 int 型，直接无视了 float 型！
		* Graphormer/graphormer/data/dgl_datasets/dgl_dataset.py:117 提取了 node_float_feature 这个变量，但之后根本没有用到
		* 估计是因为这份代码只针对化学分子图的数据，顶点信息只用到原子序数（int 型）。
	* attn_bias 生成方式：
		* 单图生成方式：dgl_dataset.py:133 初始化为 [N+1, N+1] 零矩阵（+1 因为引入了全局节点，在指标 0 位置）
		* 距离太远（默认 20）的顶点对，相应位置取值改 -Inf，即不计算注意力：
			* Graphormer/graphormer/data/collator.py:95
			* `attn_biases[idx][1:, 1:][spatial_poses[idx] >= spatial_pos_max] = float("-inf")`
				* 注意这里 attn_biases 好像为 tuple，各元素均为方阵，但大小不同
			* spatial_poses（tuple）的各元素为方阵，记录图任意二顶点的距离（floyd 算法生成）{_n82e33}
				* :110 取值全部 +=1，之后补充虚拟节点（相应的取值全 0）
		* 补全虚拟节点（使 batch 中所有 graph 顶点数一致）后，各图 attn_bias 大小相同，concat 得一整个 Tensor（包含 batch 中所有图的信息）{_n7tm0t}
			* Graphormer/graphormer/data/collator.py:104
			* 调用的函数 pad_attn_bias_unsqueeze 进行补全：
				* 真节点不接收来自虚拟节点的信息（attn_bias 相应位置设 -Inf）
				* 虚拟节点只接收来自真节点的信息（attn_bias 置 0），不接收其他虚拟节点信息（-Inf）
					* 注意虚拟节点必须接收一些注意力，attn_bias 不能全 -Inf，否则 softmax 无法计算
			* 另：Graphormer/graphormer/data/collator.py:67 丢弃了所有顶点个数超过 512（默认值）的图，然后从剩下的图数据里找顶点最多的，以决定其他图要补充的顶点个数
	* in_degree 补全虚拟节点：
		* Graphormer/graphormer/data/collator.py:112 先把原来的 in_degree 都 +1，然后新加的虚节点的 in_degree 置零
		* 120 行直接写的 out_degree=in_degree：当前代码只针对无向图
	* attn_edge_type ：shape [N, N, dim_feat] ；若 $(i,j)\in E$ 则 attn_edge_type[i,j] 为该边的特征¹，否则 0
		* ¹实际上还有加 offset 的操作，但在 dim_feat==1 时没什么影响
* `GraphGPS-2205.12454`
	* "Recipe for a General, Powerful, Scalable Graph Transformer", NeurIPS 2022
		* Rampášek, Ladislav; Galkin, Mikhail; Dwivedi, Vijay Prakash; Luu, Anh Tuan; Wolf, Guy; Beaini, Dominique; 
		> created on 2023-07-13
	* GPS：通用，强大，可扩展
	* 摘要：本文方法复杂度 $O(N+E)$，可扩展性强；{_n7de83}
	* tbl1 综述性质，位置编码（PE）分类：局部 PE、全局 PE、相对 PE；{_n7de8h}
		* 结构编码（SE）分类：局部、全局、相对
* `DAG-Transformer` 云计算任务（表示为 DAG）性能预测，引入特定 Transformer 架构
	* "Workflow performance prediction based on graph structure aware deep attention neural network"
		* Jixiang Yu a, b, 1, Ming Gao c, d, *, Yuchan Li c, Zehui Zhang e, Wai Hung Ip f, g, Kai Leung Yung f a
		> created on 2023-07-24
	* 用于 DAG 的 graph Transformer
	* 原文针对的问题：云计算性能预测（对给定 workflow graph），这对后续资源调度重要；{_n7om32}
		* 任务序列有依赖关系，从而 workflow graph 组成 DAG；{_n7om3b}
		* 数据集来自阿里云
	* 位置编码：fig11 记 $p_i$ 为²顶点 $i$ 执行前至少需要等待几个任务¹，之后据此生成 $i$ 的位置编码（涉及 sin,cos 和 scaling）{_n7om12}
		* ¹源任务为 0，一般任务的顶点取最长依赖路径
		* ²术语似乎为 DAG 中的 depth of node
	* 注意力 mask $M$，注意力矩阵 $QK^\mathrm{T}/\sqrt d+M$
	* fig13 $M$ 设定，自己、邻居¹的注意力值相同，其余非邻居均 0
		* ¹邻居按无向图定义；边的方向信息已在位置编码中完全体现
* `2210.13148` 针对 DAG 的 Transformer
	* "Transformers over Directed Acyclic Graphs"
		* Luo, Yuankai; Thost, Veronika; Shi, Lei; 
		> created on 2023-07-24
	* 摘要，实验考察的 DAG 包括 source code graph（分类任务），citation network 的 node；{_n7om48}
	* 位置编码，利用 DAG 中顶点 depth、scale 后过 sin,cos；{_n7om4t}
		* 该做法类似 `DAG-Transformer`
	* sec3.4 只计算 $k$-邻域¹内的注意力，从而计算复杂度关于边数近似线性；{_n7om6a}
		* ¹fig1 $k=2$ 例子，只考虑在有向图上可达的，如 $1\to 2\to 3$ 则 $1,3$ 互为二阶邻居，而 $2\to 1,2\to 3$ 则 $1,3$ 非二阶邻居；此注意力矩阵对称
* `2202.08455` （备用）graph Transformer 综述文章
	* "Transformer for Graphs: An Overview from Architecture Perspective"
		* Min, Erxue; Chen, Runfa; Bian, Yatao; Xu, Tingyang; Zhao, Kangfei; Huang, Wenbing; Zhao, Peilin; Huang, Junzhou; Ananiadou, Sophia; Rong, Yu; 
		> created on 2023-07-26
* （备用）一文带你浏览Graph Transformers
	* [2023-07-26](https://mp.weixin.qq.com/s?__biz=MzI4MDYzNzg4Mw==&mid=2247550969&idx=2&sn=0e2822556a86471682e183f9fa4b6164)
* `OpenGraph-2403.01121` （备用）图基础模型，可零样本学习
	* "OpenGraph: Towards Open Graph Foundation Models"
		* Xia, Lianghao; Kao, Ben; Huang, Chao; 
		> created on 2024-05-25
	* 公众号报道：首次攻克「图基础模型」三大难题！港大开源OpenGraph：零样本学习适配多种下游任务；{_o5pg72}
		* [2024-05-25](https://mp.weixin.qq.com/s/wWKKUZr6-sBWgpHGOFr8wQ)
* Sp2GNO-2409.00604 基于 GNN 的 NO，消息传递同时包含 spatial（局部）、spectral（全局）成分
	* "Spatio-spectral graph neural operator for solving computational mechanics problems on irregular domain and unstructured grid"
		* Sarkar, Subhankar; Chakraborty, Souvik; 
		> created on 2024-09-10
	* 输入数据为散点，通过 kNN 形成图结构
	* eqn(10) GFT（graph Fourier transform）来自 normalized graph Laplacian 的对角化；{_o9a99j}
	* fig2 每层分为 spatial GNN + spectral GNN，前者局部、后者全局消息传递；{_o9aa0h}
		* spectral 层类似 FNO block
* （备用）KG 结合 LM，图语言模型GLM | ACL 2024
	* [2024-10-10](https://mp.weixin.qq.com/s/mx_aw1yHbkL7JsptBoYE8w)
* G2PT-2501.01073 图生成用 Transformer，图表示为序列结构，以允许自回归生成
	* "Graph Generative Pre-trained Transformer"
		* Chen, Xiaohui; Wang, Yinkai; He, Jiaxing; Du, Yuanqi; Hassoun, Soha; Xu, Xiaolin; Liu, Li-Ping; 
		> created on 2025-01-06
	* [公众号报道](https://mp.weixin.qq.com/s/-4VJA1ETIC7fVvkXFQ5vHA)
		* 不是生成邻接矩阵，而是生成表示图的序列，划分节点集、边集
			> 传统的图生成模型大多依赖邻接矩阵（adjacency matrix）进行表示，
				> 这种稠密的表示方式计算成本高、内存占用大。
			> G2PT 提出了基于序列的 tokenization 方法，
			> 将图分解为节点集（node set）和边集（edge set），充分利用图的稀疏性，从而大幅提升计算效率。
			> 这一创新性的分词方式使得大型预训练 Tranformer 可以像处理自然语言一样逐步生成图，并通过预测下一个 token 的方式完成整个图的生成。
		* fig1 表示图的序列格式：SOG，节点类型、节点编号，节点类型、节点编号，……，始节点编号、终节点编号、边类型，始节点编号、终节点编号、边类型，……，EOG；{_p16e70}
		* （评）各 token 有顺序，而非像普通 graph Transformer 无固定顺序，少了这个 inductive bias，要自行数据增强
		* （评）表示节点编号要占用 token，导致可表示的总节点数受限？并且也需要数据增强

## free notes
* graph generation 的比较在上方有
* GNN message passing 机制据说有加速算法 `funcGAN-2102.04776` 脚注 1，利用求和重排
	* 该文章还提到了 GNN 中的 average pooling 层，用于不断下采样汇总全局信息（graph 分类任务）
	* 不确认适用于一般 GNN（文中 PointConv 是点云连接邻域顶点形成 graph）
	* 相关：`GraphCast-2212.12794` multi-mesh 上跑 GNN，粗细 mesh 各自向邻居消息传递之外，还有粗 mesh 向细 mesh 的单向传递；这样浅层 GNN 即可表达非局域变换
* 动态图相关，处理动态边的多（如距离小于一定程度时才有边）
	* `AgentNet-2001.02539` sec4.D 实验处理动态节点：鸟进入、离开视野
* 可解释性：
	* 同质顶点完全图，用于处理 equivariant 多体问题（顶点数可变），可有物理背景：
		* `AgentNet-2001.02539` 带注意力 GNN 拟合后，注意力刻画了顶点相互作用范围、强度
		* `2006.11287`, `[2202.02306]` GNN 拟合后对 GNN 组件符号回归，以发现物理机制
		* `GDyNet-1902.06836` 待确认，似乎是对单原子邻域环境识别出多种可能的态
	* 非同质顶点、边连接情况更复杂的图：
		* `GnnExplainer-1903.03894` 提取关键子图、特定节点所受主要影响、解释预测结果
		* 相关：从动力学提取因果关系图 `2106.12430`（允许循环因果）, `DYNOTEARS-2002.00498`
	* 同质顶点、复杂连接情况、大规模图，统计各子图频率以识别模式 `GNNS-2207.06684`
* 其他 GNN 相关：
	* 维数不定的动力学找机理，先 GNN 拟合动力学再对 GNN 每组件符号回归 `2006.11287`, `[2202.02306]`
		* 待学除了全局动力学，还有每个顶点的特定属性，如天体质量
	* `[Transformer为完全图GNN]`
	* `ViG-2206.00272` 设计图像任务网络架构，各 patch 视为图顶点、根据特征找 kNN 连有向边，同一张图前传不同层连接情况可不同
	* `2022-04-27`(AISCmeet2) 组合问题-线性规划分量重排，用完全二部图 GNN 提取特征用于后续生成置换
	* 2202.02296 GNN oversmooth 解决：heat eqn 换 wave eqn，lyp表示这是他大三就有的想法
	* `2022-06-08`(dbGrpMeet2) 工作 1：先转化为单纯复形再定义其上的网络，复杂度近似线性
		* 2：某些图结构可能导致信息传递不高效，在图上定义某些曲率…
		* 3：$x,z$ 分别演化，分别对应普通 GNN 的特征演化、graph rewiring 重新连边便于消息传播
	* `Diff-ResNet-2105.03155` 网络前传时加入各数据点交互，对于图数据可用图上扩散体现数据点（图顶点）交互过程，图半监督学习（顶点分类等）任务表现好于 GAT
	* 在 GNN 卷积定义中引入更多手动设计成分，`Ummenhofer2020LagrangianFS` 空间卷积核一部分为手动设计的径向函数、另一部分为在网格点存储（并插值到连续域）的卷积核
	* `2107.05729` 概率图模型求（顶点子集）边缘分布，用 GNN 快速获得近似解，好于传统 belief propagation 等算法
	* `2022-11-19`(lectures) MultiRec 用于推荐系统：开源社区内对 issue 推荐开发者来处理
	* 后续部分内容记录于((n79n3g))

