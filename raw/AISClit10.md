* CPGNet-2604.15617 （备用）激波 Euler 长时 rollout，GNN 只学界面重构，状态仍按 Godunov 通量更新
	* "A Structure-Preserving Graph Neural Solver for Parametric Hyperbolic Conservation Laws"
		* Jiamin Jiang; Shanglin Lv; Jingrun Chen;
		* USTC; Suzhou Institute for Advanced Research
		> created on 2026-07-26 by OpenCode + GPT-5.6-Terra
	* 方法全称：Conservation-preserving Godunov-type network
	* 场景：参数化二维 Euler 非结构网格长时 surrogate，四类自建超音速基准
		* 直接预测 cell 状态增量时，守恒误差和错误波向可在 rollout 中放大
		* 改作 Godunov 格式的可学习重构模块，数值通量和保守更新不交给 NN
		> 网络被定位为可学习的重构和通量算子，而非黑箱状态更新器，sec1、6
	* 推理：当前 cell 状态和网格特征入，边重构后经 Rusanov 与散射聚合更新 cell
		* 输入：节点取当前 primitive state、坐标、边界类型、全局 Mach 数；
			* 边取相对位置、距离、单位法向，sec5、8.1
		* 重构：多层有向消息传递扩大感受野；每条边解码界面左右 primitive state，
			* 并解码几何权重 $g_{ij}$，sec6.2、8.3
			* 密度、压强经指数映射保正；更新后的 cell 态未见正性保证
		* 更新：左右态转守恒变量，Rusanov 算 $F_{ij}$
			* 反向边取 $F_{ji}=-F_{ij}$，再以 $g_{ij}F_{ij}$ scatter-add 更新相邻 cell，sec8.4
			* $g_{ij}$ 由有向边嵌入经 Softplus 学得，拟合 $|s_{ij}|/|\Omega_i|$
		* （AI 评）可学习自由度只留给激波分辨最缺解析表达的 reconstruction
			* 黎曼求解器和更新拓扑固定，通量值仍随学习到的界面态改变
		* （AI 评）反对称通量硬约束共享界面的局部相消，不等于体积加权全局守恒
			* 若 $g_{ij}|\Omega_i|$ 与 $g_{ji}|\Omega_j|$ 不配对，反对称不推出全局守恒
			* 论文未给这个更强配对约束
	* 大时间步：边重构粗区间的时空有效态，Rusanov 通量取该区间平均，不是真隐式求解
		* 粗步推理：每次前向仍走上述更新链，只是边解码粗区间有效左右态，
			* 通量近似区间时间平均，eqn(35)-(36)、sec7.2
		* 训练：DGSEM 轨迹按粗间隔重采样；one-step MSE 预训练后，
			* 以 $n_w=3$ rollout 微调压低累积误差，sec7.2、9
		> 单步目标给稳定初始化，多步目标直接压低 rollout 累积误差，sec9
		* （AI 评）implicit-like 不求解下一态非线性方程，也无无条件稳定性证明
			* 粗步稳定性来自数值结构、粗步监督与数据分布的合效，未被消融拆开
	* 证据与复现：二维超音速 Euler 内有效，尚不能外推或直接复现
		* 证据：CPGNet 的 EConv processor 通常优于 GAT、GT，sec11.1
			* EConv 版相对 GINO、GNOT、MGN 的 rollout RMSE 降约四至八成，sec11.1
		* （AI 评）实验未分离守恒、迎风、时空态与多步训练的各自贡献
			* 也不支持跨 PDE 族泛化
		* 复现：官方 GitLab 仅见模型与训练代码，README 空
			* 训练和 rollout 期待 dataset/data_downsampled 下的 train.h5、test.h5
			* 无数据、checkpoint、依赖环境、训练配置或 Trixi/Gmsh 数据生成脚本
			* （AI 评）论文声称数据公开，但当前仓库不足以作为可直接复现的数据集
* 2606.11657 Walrus 机理解释：剪切流输出目测接近时，单层 SAE 的物理相关不能单独证明模型机制
	* 注：GLM5.2 版 TLDR：Walrus 中间层 SAE 探表征，单步预测目测无偏但表征未稳定对应物理
	* "Sparse probes and murky physics: a case study of interpretability challenges in a foundation model for continuum dynamics", FM4Science @ ICLR 2026
		* Katherine Rosenfeld；Maike Sonnewald；
		* Gates Foundation；UC Davis
		> created on 2026-07-26 by Codex + GPT-5.6-Terra-high
	* 定位：不改 Walrus 的表征审查，问内部表征能否稳定对应已知物理
	* SAE 只是诊断坐标系，不是自动发现机制；{_q7qj9l}
		* 第 20 个 Transformer 块的空间混合层激活，训 8 倍扩张 Top-K SAE，sec2.4
			* 得 22,528 个特征
			* 同一字典用于全部轨迹，才能比较同一特征的跨轨迹激活
		* 稀疏特征可逐个探测，仍不自带物理语义
		* 未报告独立评测集的重构保真度、随机种子稳定性或特征对预测的保留度
	* 相关性筛选只生成候选
		* Sim50 作参考轨迹，按特征空间总激活和 $\mathcal{E}(t)$ 的 Spearman $\rho$ 排序
			* $s_j(t)=\sum_x a_j(x,t)$，sec2.3、3.1
		* 100 次置换的 99% 阈值为 $\rho=0.30$，最高特征为 $0.85$
		> 约 10% SAE 特征超过此阈值，说明 $\mathcal{E}$ 的区分性不高，sec3.1；{_q7qk1c}
		* 换 $\dot{\mathcal{E}}$ 后最高 $\rho=0.50$，阈值 $0.48$
		* （AI 评）正文为约 10%，附录图 8 为 6%，比例不一致
		* （AI 评）阈值的统计含义不足以支持物理解释
			* 未说明怎样控制 22,528 次筛选的多重比较
			* 随机打乱会破坏时间相关性，宜只作候选排序
			* 仅 100 次置换估计 99% 尾部分位，阈值本身也不稳
		* （AI 评）Sim50 的选择规则也不一致
			* sec2.3 取最高中位 $\dot{\mathcal{E}}$
			* 附录图 7 取最大平均绝对 $\dot{\mathcal{E}}$
	* 跨条件比较未能给出稳定解释
		* Sim50、Sim56 的 $Re,Sc$ 均不同
			* $t=15$ 时，按全部模拟合并排序的前 10 个特征有相近空间激活，sec3.2、图3、4
		* 后续时刻缺乏持续一致性，不能把局部热图直接命名为涡旋或界面特征；{_q7qk1d}
		* 各时刻均以 6 个真值历史步作输入的单步预测，不是自回归 rollout
		> 即使输出层能合理复现剪切流，内部编码也未清楚对应所检验的物理分解，sec4
	* 输出谱偏差也不能替代表征证据
		* Sim50 的两次单步预测目测接近，但能谱在中等波数低估、高波数高估，sec2.2
		* 输出可表现为过弥散或过度局部化，特征也可稀疏而空间不连贯
		> 输出层误差与内部表征的关系仍不清楚，sec3.3
	* （AI 评）现有负结果只限制单层 SAE 加单指标筛选的解释力
		* 不能据此否定 Walrus 已学到物理，也分不清模型失配和探针失配
		* 机制证据应先挑候选，再验参数、时间、种子与输出失效模式的稳定性
		* 还应干预候选特征，比较物理量、预测误差和对照特征的响应
* Chop-2606.12318 ICON 用于预训未见算子时不微调，输入输出作用一系列简单变换，简化后算子求解可靠
	* "Harness In-Context Operator Learning with Chain of Operators"
		* Minghui Yang; Ling Guo; Liu Yang;
		* 上海师范，NUS
		> created on 2026-07-25 by OpenCode + GLM-5.2
	* 方法全称：Chain of Operators
	* 前置：ICON（In-Context Operator Network）通过上下文对隐式推断算子，不动权重即可适配新算子
		* 但 target 算子偏离训练分布时仍失效
	* 核心诊断：OOD 失败非模型容量不足，是目标算子落在模型可靠推断算子的 regime 外
		* 前作 ICON-2401.07364 已示：简单 affine rescaling 对齐 shifted PDE 即可恢复精度
			* 说明 OOD 失败是 prompt-regime 不匹配，非模型本身局限
		* 因此解法不是更新参数（让模型更强），是重构 prompt（让任务回到模型可靠 regime）
		* 类比 LLM harness engineering：不改参数改 prompt
		* 类比 Chain of Thought：把难问题拆成简单子任务序列
	* （评）仿依赖类型论记号，普通 ICON: $n\mapsto(x_1,y_1,\dots,x_n,y_n)\mapsto x\mapsto y$
		* 场景：目标算子（末映射）$\phi: x\mapsto y$ 偏离 ICON 预训练分布，导致倒数第二个映射 在当前输入形态下 网络输出与真输出偏离大
		* 方法：输入输出变换，$\phi$ 拆为 $x\xmapsto{F_x}x'\xmapsto{\phi'}y'\xmapsto{G}y$，使 $\phi'$ 在 ICON 预训练分布内
		* 原文所谓 prompt 变换 $F$ 对应 $F(x,y)=(x'=F_xx, y'=G^{-1}y)$
	* 方法：$F \to \text{Icon} \to G$ 链（sec3）
		* $F$（prompt 侧）把 prompt 变换到 Icon 训练时熟悉的表示空间（归纳空间）
		* Icon 在归纳空间预测，$G$（预测侧）把预测映射回原输出空间
		* 松弛条件 eqn(9)：设 $T$ 为目标算子，$T'$ 为变换后 Icon 需近似算子
			* $G(T'(F(x))) \approx T(x)$，且 Icon 对 $T'$ 的预测误差远小于对 $T$
			* 不要求 $G = F^{-1}$：$G$ 可含投影、约束施加、残差校正
	* $F$ 形式：预设变换，零可训参数；{_q7ph0y}
		* 所有变换常数从 prompt 数据即时估计（均值、方差、位移量）
		* 无需训练，无需超参调优，完全可解释
		* 变换类型
			* 对称变换（sec1:-2 提及，实验未见）
			* 值归一化（affine gauge）：$F$ 侧 $u = (v - \mu)/\sigma$，$G$ 侧逆变换 $v = \sigma u + \mu$
				* $\mu, \sigma$ 从 prompt 中所有上下文样本聚合估计
				* 密度场：$\mu = 0$，$\sigma = \text{RMS}$（保非负，因 $v \geq 0 \Rightarrow u \geq 0$）
				* cost 场：$\mu, \sigma$ 取样本均值和标准差
			* 坐标对齐（平移对称）：cyclic shift 空间网格索引
				* 位移量 $s$ 从最近上下文对估计（最小化中心化输入输出差的 L2）
			* 守恒律投影：L2 投影到空间均值等于查询输入均值的子空间
			* 残差迁移：留一估计上下文预测残差，按输入相似度加权迁移到查询
		* （AI 评）与 AOT-POT 均冻结现有网络、补充新模块以应对未见算子，但方法略有区别
			* 变换类型：AOT-POT 可学变换层，本文用闭式变换
			* 变换对象：AOT-POT 针对网络内部隐层，本文针对输入输出
	* 守恒律链（sec4.1）：$F$ = shift + scale，$G$ = unscale + unshift + mass
		* shift 利用周期边界下平移对称性，对齐上下文对到共同空间帧
		* mass 投影消除 rollout 中质量漂移，防止误差跨步累积
		* 三种 OOD flux（sin-cos, tanh, Buckley-Leverett）rel-L2 降 35-52%
		* 10步 rollout 维持 15-27% 降幅（单步降幅收窄，误差仍累积，mass 投影不能完全阻止）
	* MFC 链（sec4.2）：$F$ = value norm，$G$ = inverse value norm + residual transfer
		* residual transfer（Algorithm 3）核心：用上下文已知预测误差校正查询
			* $\mathcal{B}_0$ 为 Raw Icon 预测函数，$\mathcal{C}_{-h}$ 为排除第 $h$ 对的上下文
			* 留一残差 $R_h = y_h - \mathcal{B}_0(\mathcal{C}_{-h}, x_h)$，$x_h, y_h$ 为第 $h$ 对输入输出
			* $\Pi_{h\to*}$ 将残差从 $x_h$ 位置搬运到查询 $x_*$ 位置（插值/投影）
			* 加权校正量 $\Delta^* = \sum_h w_h^* \Pi_{h\to*}(R_h)$，$w_h^*$ 按 $x_h$ 与 $x_*$ 相似度
			* 留一交叉验证拟合标量 $\hat\alpha \in [0,1]$，最终校正 $\hat\alpha \Delta^*$
		* MFC 中 $g$ 为代价函数参数，$\rho$ 为密度分布参数
			* g-param 任务变化 $g$ 而 $\rho$ 固定，ρ-param 反之
		* 9 个 g-param 任务降 19-86%；6 个 ρ-param 任务无改善
			* 归因：value norm 对条件（cost $g$）和目标（density $\rho$）做同一变换
			* 但二者物理量纲不同，共享 rescaling 不一致
			* 消融：去掉 value norm 只留 $G_{\text{res}}$，ρ-param (1,2) 改善 37-42%
				* 说明 residual transfer 独立有效，value norm 对 ρ-param 有害无益
	* 推理时决定是否启用变换：in-context cross-validation（eqn 15）
		* 对每个上下文对留一，比较 chain 和 Raw Icon 预测误差
		* 选误差小者用于实际查询，无需真值标签
		* 让链在无效时自动回退到 Raw Icon（如 ρ-param 任务）
	* 跨 PDE 迁移（sec4.3）：MFC 链直接用到守恒律
		* rel-L2 降 19-24%，chain 优于 Raw Icon 的样本占比 89-91%
		* 不如守恒律专用链，但正迁移说明链捕捉到跨 PDE 共享结构
	* 链发现：EvE 进化搜索（sec3.2 末），LLM agent 提议改进候选链
		* 仅在单一任务上进化（守恒律: sin-cos；MFC: g-param (2,2) $\ell=0.5$）
		* 论文未展开 EvE 细节，见 [36] arXiv:2605.09018
	* （AI 评）残差迁移的非平凡性
		* 留一残差库 + 相似度加权迁移，本质是"用上下文预测误差做查询的偏差校正"
		* 类似 kNN 回归的偏差校正，但在算子学习的上下文框架下是新的组合
	* （AI 评）"迁移性"与"专用性"的 tradeoff
		* 守恒律链的 shift/mass 强依赖周期边界 + 质量守恒结构
		* 到无此结构的 PDE 上，shift 可能退化为无作用或引入伪影，论文未测此种负迁移
		* MFC 链的 value/residual 更通用，确实迁移到守恒律（sec4.3）
		* 但 sec4.3 也显示它不如守恒律专用链，仅两个 PDE 验证不足以判断泛化边界
	* （AI 评）进化搜索的可靠性存疑
		* 仅单一任务进化出链，迁移到其他任务靠运气还是链本身有通用结构？
		* 论文未报告进化过程的多样性和稳定性（多次 run 是否得到相似链？）
		* 缺乏多次进化运行的稳定性报告，泛化性主张的说服力受限
	* 数据无公开。守恒律数据 WENO 自生成，MFC 标准问题。论文未提代码/数据仓库
* Walrus-RTI-2606.01470 Walrus 微调解不稳定流，zero-shot 应用于实验 IC 与未见稳定分层 regime
	* "Emergent Transfer of a Physics Foundation Model from Simulation to Laboratory Turbulence"
		* Mukhopadhyay, Payel; Nixon, Stefan S.; Watteaux, Romain; McCabe, Michael; Bietti, Alberto; Cho, Kyunghyun; Diaconu, Cristiana; Espejo, Irina; Fouhey, David; Golkar, Siavash; Hehir, Tom; Ho, Shirley; Kovalic, Jake; Krawezik, Géraud; Lanusse, François; Marwah, Tanya; Morel, Rudy; Pettee, Mariel; Qu, Helen; Shen, Jeff; Sotoudeh, Hadi; Dalziel, Stuart B.; Cranmer, Miles
		* Polymathic AI, Cambridge, Flatiron, NYU, Princeton, Yale, Paris-Saclay, Wisconsin-Madison
		> created on 2026-07-21 by OpenCode + GLM-5.2
	* 定位：Walrus 下游应用 + sim2real 实证研究；非架构创新
		* 用 Walrus-2511.15684 1.3B checkpoint 作起点；预训练中显式排除 RTI（Appendix 8.1）
			* 术语 RTI = Rayleigh-Taylor instability
		* 与 Walrus 原论文关系：架构、patch-jittering、tokenize 等细节见原 Walrus 文献笔记（AISClit7），此处不重复
	* 模型变体链（全文统一记号）
		* $W_{pre}$：预训练 checkpoint（RTI 排除）
		* $W_{DNS}^{3D}$：$W_{pre}$ 在 3D DNS 上 finetune 的输出（用于 Sec 4 仿真评估）
		* $W_{DNS}^{2D}$：$W_{pre}$ 在 2D DNS slices 上独立 finetune 的输出
			* 用于 sim-to-real zero-shot
		* $W_{DNS+Exp}^{2D}$：$W_{DNS}^{2D}$ 在 2 个实验样本上继续 finetune 的输出（实验适配）
		* 以下 zero-shot 结果均基于 $W_{DNS}^{2D}$，未经任何实验数据训练；{_q7of4e}
	* 核心洞察：基础模型未记忆训练分布，学到 IC 结构→late-time regime 依赖；{_q7oa3m}
		* 前置：RTI sim-experiment α 差异有三候选解释（初始条件/Sc 数/数值界面扩散），见下文 RTI 背景段
			* 记号：α 为 RTI 晚期混合层增长系数，$h(t)\sim\alpha A_t g t^2$
		* 同一权重 $W_{DNS}^{2D}$：DNS IC 下 α≈0.02；实验 IC 下 α≈0.07（Fig 8）
			* 非记忆特定 α 值；是学到 IC→α 的物理映射
			* t≳50 进入平台；唯一差别是输入：干净 DNS 帧 vs 携带大尺度初始结构的实验帧
			* L（context length）=1/2/3 三独立训练均显示同样上移（Appendix 8.11）→ 非 context length 侥幸
				* L=1 极端情形仅见单帧实验 IC，仍正确进入实验 regime
		* 控制实验：未 finetune 的 $W_{pre}$ 在实验 IC 产出不稳定 rollout（Appendix 8.12）
			* 排除任何 smooth propagator 都会 drift 到实验 regime 的平凡解释
			* RTI specialization 须由 DNS finetune 显式获得
		* （AI 评）"sim-to-real" 包装的实质是 IC regime transfer
			* 同一物理方程（Boussinesq RTI），同一权重，不同 IC 分布→不同 α
			* 模型学到 IC→α 映射，OOD IC 上仍产生物理正确响应
		* （AI 评）论证脆弱点：IC→α 映射的物理真实性
			* 核心论证：仅用实验 IC 模型就进入实验 α band → IC 在 α 差异中起关键作用
			* 隐藏假设：模型学到 IC→α 映射是物理真实的，非 OOD 误响应
			* Appendix 8.12 控制：未 finetune 的 $W_{pre}$ 失败 → 排除 smooth propagator drift
			* 仍可能：DNS finetune 后模型对 OOD IC 产生系统性误响应，恰好落在实验 α band
			* 未做的关键控制：构造合成长波 IC 测模型是否也产生 α≈0.07
				* 若合成长波 IC 进入实验 regime → 强化"IC 物理结构决定 α"
				* 若不进入 → 现有结果是实验 IC 特异性响应，α band 吻合仍需解释
	* RTI 背景：长期 α 差异的三种候选解释
		* 初始条件：实验室装置的低 k 扰动结构 DNS 难建模（leading candidate）
		* Schmidt 数：实验室 Sc~O(10³) vs DNS Sc~O(1)
		* 数值界面扩散：标准码人工模糊密度跃变
	* 第二个 zero-shot：稳定分层 regime 完全未见；{_q7oc3a}
		* 训练仅含 unstratified RTI；推理时给稳定分层初始条件
		* 稳定分层中密度梯度反向，浮力从驱动不稳定变为抑制混合的恢复力
		* 模型定性正确：混合层被限制在中面附近，未恢复 unstratified 行为
		* 但定量 confinement 弱于 reference DNS（Fig 10c）
		* 200 步 rollout 持续减速，超出 finetune 时 rollout 最大 100 步
		* （AI 评）confinement 偏弱的物理含义
			* 论文声称"模型编码了浮力驱动流动的物理理解"
			* 但 confinement 系统性弱于 reference，方向是过度混合
			* 替代诊断：模型未真正理解浮力物理，而是向训练分布（unstratified 自由混合）偏移
			* OOD regime 下的偏差方向恰好指向训练分布，暗示平滑外推而非抽象表征
			* 若是真正理解浮力，偏差方向不应系统性地偏向 unstratified
	* 训练侧：两阶段 finetune 设计
		* 第一阶段：$W_{pre}$ 在 3D DNS 上 finetune 得 $W_{DNS}^{3D}$
			* 5 个 256³ Boussinesq → 128³ 块平均；3 训/1 验/1 测
			* context L=3；delta-prediction + MAE loss
			* 块平均下采样（非重叠 2³ cell）保局部守恒，类有限体积粗化
		* 2D 版本：从 3D DNS 切 2D slices，$W_{pre}$ 在其上独立 finetune 得 $W_{DNS}^{2D}$
			* context L=2；10 slices/realization
		* 第二阶段实验适配：$W_{DNS}^{2D}$ 在 2 个实验样本上继续 finetune 得 $W_{DNS+Exp}^{2D}$
			* lr 比第一阶段小 50×，故意设轻量以保留 DNS 先验
			* 5K steps，bs=1；6 个 2D slices 切分（2 训/1 验/3 测）
			* 效果：改善 transient 阶段对实验释放结构的捕捉，late-time α 已由 zero-shot 达到
		* 样本效率：1-3 个 DNS 实现已可恢复大尺度物理；增 DNS 实现仅优化高频
			* table 2 带平均谱误差：1 实现 0.107/0.293，3 实现 0.042/0.079
		* checkpoint 选择基于物理诊断，非 pointwise val loss；{_q7pa4d}
			> 3D finetuned 模型的 checkpoint 选择基于验证实现 $\mathcal{S}_4$ 上的表现（Appendix 8.3）
			> 在保存的 checkpoint 中保留 KE(t) 与 δPE(t) 全局能量演化与真值最一致的那个，而非仅按逐点 loss 选择
			* 反映 PDE 基础模型评估特殊性：val loss 不等于物理忠实度
	* 推理侧：自回归 rollout（即 delta-prediction 反馈）
		* 前 L 帧输入，每步预测下帧增量，反馈作输入
	* 数据与代码；{_q7pc1d}
		* 3D RTI DNS（5 个 256³→128³）：HF datasets/pmukhop/rti-dataset-boussinesq
		* 稳定分层 RTI 评估数据：HF datasets/pmukhop/rti-stratified-data
		* finetuned checkpoint：HF pmukhop/rti-walrus-model（safetensors + pth + yaml）
		* Walrus 训练代码：github.com/PolymathicAI/walrus（MIT）
		* 实验室实验数据（6 个 2D slices）未公开；DNS 生成码 TurMix3D 未公开
