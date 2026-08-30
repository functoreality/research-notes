> 2026-08-30 从多个源笔记中抽取整合
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
* jNO-2605.10159 JAX 库：统一符号程序接 FEM/PINN/NO/PDE基模微调
	* "jNO: A JAX Library for Neural Operator and Foundation Model Training"
		* Leon Armbruster; Rathan Ramesh; Georg Kruse; Christopher Straub
		* Fraunhofer IISB
		> created on 2026-08-20 by Codex + GPT-5.6-Terra-high
	* 方法全称：jax Neural Operators
	* （Luna-xhigh 版 TLDR）用可追踪符号程序统一 PDE 求解、PINN、神经算子和基础模型微调，再按目标降为点值残差、弱形式、FEM 系统、含时块或训练路径
	* 回查点：怎样一次写含区域、边界、导数语义的 PDE，再改模型或求解路由
		* 方程图：区域变量、模型调用、导数、强/弱形式、监督 loss、诊断先只建符号节点，执行时才绑定 batch 并编译（sec. 2.1）
		* 统一前提：图共享的是带网格 tag、坐标、边界和微分/变分语义的方程表达
			> 网格、tag、变量和符号表达保留在同一 DSL，后端选择推迟到组装时。（sec. 2.3）
		* NO/PINN 路由：Domain 以 $(B,T,\ldots)$ 对齐坐标、参数 tensor 和 tag，模型输出接监督项与 PDE residual（sec. 2.2, 2.4）
		* 边界接入：tag 选取边界点或边界积分区；硬 Dirichlet 条件用输出包络，弱形式保留边界项（sec. 2.2, 2.5）
		* FEM 路由：NN 未知场作 trial 求弱残差；FEM 未知场和测试函数组装 $(A,b)$ 或残差/Jacobian，含 $u_t$ 时给时间块（sec. 2.3）
		* 编译收益：结构相同的模型调用、导数和公式子树合并一次，多 loss 共用中间量，再交给 XLA JIT、分片和 gradient checkpoint（sec. 2.1, 2.6）
	* 训练配置：冻结、mask、优化器、LoRA 贴在模型节点上；它们利用方程图的模型边界，但不属于 PDE 语义本身（sec. 2.1, 2.4）
	* （AI 评）作者定位是 NO/基础模型训练库；这里把可迁移部分重述为 PDE 的可编译中间表示，不把训练 API 当作图语义
		* 计算图编码 PDE 时，可据此复用方程后更换网络、离散或观测项，避免把这些改动散为 glue code
	* 适用边界：不是新算子、弱形式或 LoRA 算法
		* 统一 DSL 的价值依赖各后端 lowering 保持方程语义；sec. 4 报告单元/集成测试和示例，但未系统比较跨后端语义一致性、实现工作量或组合覆盖率
		* （AI 评）统一图没有消灭 glue code，而是将其集中到变量绑定、边界 tag、离散、shape 语义及测试矩阵；只有反复混合这些工作流时才值得承担该复杂度
	* 已整合的 PDE 基模：PDEformer-2，Poseidon，MORPH，Walrus，MPP，BCAT，DPOT；{_q8l71z}
* ARC-STAR-2605.22222 PDE 基模冻结、学后处理修正网络，全局+更新剧烈的局部块
	* "ARC-STAR: Auditable Post-Hoc Correction for PDE Foundation Models"
		* Li, Chengze; Wei, Lingwei; Sun, Li; Lv, Hongbo; Yang, Jie; Zhang, Hanrong; Zheng, Kening; Huang, Wei-Chieh; Ma, Enze; Yu, Philip S.;
		* University of Illinois Chicago，北邮，华北电力
		> created on 2026-07-19 by OpenCode + DeepSeek-V4-Pro
	* 方法全称：Adaptive Risk-Calibrated Spatial Triage for Auditable Refinement (ARC-STAR)
	* 场景：PDE 基模（Poseidon、DPOT 等）部署时 rollout 误差累积
		* 不想微调主模型（不稳定且贵），希望主模型冻结、加轻量修正层；{_q7jj3t}
		* 现有三条路：微调主模型（不稳定），全场 dense 后处理（浪费计算），手写空间指标路由（如涡度，不保证与误差分布对齐）
	* 方法概述：学后处理校正网络，先学全局校正，再叠加块状局部校正器 sec3.1:-1
		> ARC-STAR 通过三个阶段来处理这个被冻结的数据结构，这一过程与图 2 中的三个处理步骤相对应。
		> 第一阶段（图 2.I）中，系统会训练一个全局校正器 Gϕ ，以消除整体上的偏差（详见 3.2 节）。
		> 第二阶段（图 2.II）中，系统会在全局校正后的残差数据上，使用块状局部校正器 Lθ 来进行进一步处理。
			> 该过程遵循“光环读取、中心写入”的原则。
			> 算法 1 将这一过程分为两个步骤：首先是密集的块级预训练步骤（步骤 2a），然后是使用 k=B 进行的自回归微调步骤（步骤 2b）。
			> 这样一来，局部校正模块就不必依赖具体的部署方案，且可以在不同部署方案之间重复使用，而无需重新训练（详见 3.3 节）。
		> 第三阶段（图 2.III）则是实际应用阶段：系统会无标签地对各个块进行排序，然后根据“光环读取、中心写入”的原则，将全部数据或其中的前 k 个块发送给 Lθ 进行处理（详见 3.4 节）。
			> 在整个过程中， {Ωb}b=1B 表示将空间域划分为若干个互不重叠的块； Ωb+h 则表示同一个块经过扩展后形成的、宽度为 h 的“光环区域”。
			> 本地精化器读取的是 Ωb+h ，但实际写入的却是 Ωb 。
			> 该合约是实现高效且精确推理的关键：当为 k=B 时，同一个经过训练的本地模块会处理所有数据块；而当为 k<B 时，该模块仅处理部分数据块，无需重新训练。
	* 推理方式：冻结主模型，两阶段修正 全局+块状局部，局部选块依据时间更新幅度
		* 消全场偏移：$G(x_t, x̂_{t+1})$ 输出速度通道残差，加入主模型预测得到 $x^g_{t+1}$（方法 §3.2）
		* 消局部残差：blockwise $L(x_t, x̂^g_{t+1})$
			* 每块输出：16×16 块；为消块边界伪影，Hann 窗保中间幅值、到边缘衰减到 0，secD.1.3；{_q7jh9r}
				* （评）patchify 边界位置无法有效被 L 修正，因此处 Hann 窗衰减明显；不过 G 修复能力保持
				* 衰减宽度小：（from AI）紧邻边界的第二圈像素权重虽然低（~0.04），但不为 0。离边界稍微往里两三个像素，权重就上来了
			* 每块输入：pad halo=8 得 32×32（读邻域写中心）sec3.3；{_q7jh9b}
		* 局部性动机：全场修正后的残余误差空间上高度集中，非均匀分布；{_q7jh7r}
			* 图1：top 20% 空间块承载 38%–64% 残余误差，平均 Gini 0.48
			* 集中模式与湍流结构相关、跨主模型一致（Poseidon 和 DPOT-Ti 上都出现，附录 H）
			* 因此全场 dense 修正浪费算力，需要 blockwise 选择性修正
		* L 只修部分块以降计算量，选块依据时间更新幅度
			* 选块方式：label-free routing score（innovation_keg, Eq5），选 top-k
			* 基于预测场在时间步间的变化量，无需真值（§3.4）{_q7jh9k}
				* 直觉：预测场连续两步间变化剧烈 → 该区域"不确定"→ 需 L 介入
			* 与 9 种替代路由策略对比，同算力下追到最低或接近最低的误差前沿
			* （AI 评）与卡尔曼滤波的 innovation（观测-预测差）概念呼应；这里用时间差分替代，绕开真值依赖
		* 可审计性：G 和 L 独立，误差改进可分解为全局份额 A 和局部份额 (1-A)·J_loc
			* Eq11: 1-L_hyb/L_raw = A + (1-A)·J_loc，
			* 其中 A = 1-L_glob/L_raw, J_loc = 1-L_hyb/L_glob（§3.4）
			* 部署时诊断：新 regime 上全局修正不够还是局部残余太大
			* NS-G Ext. 是唯一 J_loc 很低的 cell（9.6%），审计正确标记它不适合 L，因为后全局残余不是空间局部化的
	* 训练方式：分阶段串行，保证 L 看到的输入分布与部署时一致
		* 阶段 1，训 G：自回归 5 步 rollout，主模型冻结（方法 §3.2）
		* 阶段 2，训 L（G 冻结后）：先 patch 预训练（3000 步，密集采样），再自回归微调（200 epoch，budget k/B=1，即全块）（方法 §3.3，算法1）
		* 串行训练的设计要点：G 训完冻结后 L 才训，L 在训和部署时看到的是同一个 (H, G) 的输出，消除训推分布差异
	* 实验：5 类流体 benchmark（NS、KF、NS-SL、NS-PwC、NS-Sines）各两个粘度，10 regime cell
		* 主模型 Poseidon（frozen），自回归 rollout 10 步，速度通道 relative L2
		* G 单独降 raw error 91–99%；L 进一步降后全局残余至多 94.4%
		* ARC-STAR 是唯一在每个 cell 上将 rollout error 降至 raw 的 1/36 以下的方法
		* 对比 Poseidon 参数高效微调（full-param、partial、LoRA r=8），9/10 cell 胜出
		* 跨主模型：Poseidon 移植到 DPOT-Ti，效果保持（附录 H）
		* （AI 评）DPOT-Ti 仅一个额外主模型，不够证明"host-independent"。应测更多（MPP、PROSE-FD）
	* 与已有后处理修正手段的关系
		* vs PDE-Refiner：都修正 rollout 误差，但 Refiner 每步内迭代自精化（去噪目标），ARC-STAR 是外挂串行修正+计算预算路由
		* vs PhysicsCorrect：PDE 残差单步 Newton 修正（无需训），但需已知 PDE 形式和特殊离散格式；ARC-STAR 用 learned correction，不依赖方程形式
		* （AI 评）vs SPINO denoiser/corrector：CNN 修正与主网络同步训练；ARC-STAR 的 G 和 L 独立于主模型
	* （AI 评）局限
		* G 和 L 依赖有监督训练（需真值），不能像 PhysicsCorrect 零样本部署
		* blockwise 接口假设规则网格（16×16），散点/非结构网格需改 patchify 或等效机制
		* innovation score 依赖时间差分，稳态或大时间步场景可能失效
* AOT-POT-2605.15793 DPOT 引入输入依赖算子变换，简化异构解算子
	* "AOT-POT: Adaptive Operator Transformation for Large-Scale PDE Pre-training"
		* Lv, Qitan; Wang, Hong; Hao, Zhongkai; Wu, Wen; Xu, Xuenan; Zhou, Bowen; Wu, Feng; Zhang, Chao;
		* 中科大，上海 AI Lab，清华
		> created on 2026-07-19 by OpenCode + DeepSeek-V4-Pro
	* 核心诊断：多 PDE 联训难不因模型容量不够，而是因为各 PDE 的解算子本身太异构，强行让一个网络同时近似它们相当于让一个函数逼近多个差异巨大的目标
		* 已有路线：扩大容量（DPOT 加宽加深、MoE-POT 加稀疏专家路由）
		* 本文路线：不动模型容量，改对目标的表述——学一个输入依赖的算子变换，把各异构解算子变换为对齐的等价形式，让骨干网络只需近似这些变简单后的目标
		* 类比古典数值分析：Fourier 变换把 Laplace 算子变逐点乘法、预条件子把病态矩阵变良态——都是变换算子本身以减少求解难度
		* （AI 评）这个视角区分了两类策略：让模型更强 vs 让任务更简单。目前领域主流在前者（scaling law 信仰），本文在后者开辟了一条新路线
	* 动机实验（DPOT-Tiny 骨干 + 点式线性变换验证 H1/H2）
		* H1（变换有用）：在 DPOT 前后加 4×4 可学线性层（仅 ~40 额外参数），四个 PDE 族上的 L2RE 全部下降
			* Matched Frozen（先在 PDE 1 上训变换再冻结、在 PDE 1 上从头训骨干）效果比 Joint Learned 还好——说明增益不是来自容量增加，而是变换本身简化了学习目标
			* Joint Learned 与 Matched Frozen 之间的差距说明单层 C×C 变换不够用，需要每层、输入依赖的变换（即 AOT 要做的）
		* H2（变换 PDE 特异）：将 PDE k 上训的冻结变换复用于 PDE j，对角元（源=目标）改善、非对角退化可达 46 倍
			* 即确实需要输入依赖的自适应变换，不能用一个全局固定变换服务所有 PDE
	* AOT block 三组件
		* 多流并行表示：隐表示扩展为 n 条并行流，提供多个潜在基底分量（类比潜在函数空间的多个基函数）
		* 输入依赖聚合/重分配：子层前用输入依赖权重将 n 条流聚合为一条 → 骨干子层处理 → 输出用另一组可学权重重新分配回 n 条流
			* 效果等同于对潜在解算子做逐样本的基底变换
		* Sinkhorn 双随机混合：每层用 Sinkhorn-Knopp 投影得到双随机矩阵 $T_l$（$T_l1 = 1, T_l^T1 = 1$），对各流做信息混合
			* 数学性质：体积保持（行列式=1）、谱范数有界 → 保证训练稳定，不改变前传中的信息量
		* 三组件合在一起相当于：每层对隐空间做一次输入依赖的基底变换 + 保范混合
	* 对骨干的改变：仅替换 DPOT 的普通残差连接为上述 AOT 连接，额外参数 ~3%；{_q7jb04}
		* 其余全部照搬 DPOT：AFNO 骨干（Fourier mixer 注意力层）、time-aggregation layer、去噪自回归预训练目标、加噪声稳定 rollout、分辨率/通道数/不规则形状处理
	* 实验结果要点
		* 12 个 PDE benchmark（FNO 数据集 + PDEBench + PDEArena + CFDBench），预训练后 L2RE 平均降 40.9%，最高 77.6%
		* AOT-POT-S（31M）在 11/12 数据集上超过 DPOT-M（122M）
		* 微调后 in-domain 误差再降至多 92%，out-of-domain（预训练未见 PDE 类型）至多 89%
		* 长轨迹 rollout 稳定性优于 DPOT；MoE + AOT 混合的初步实验不如纯 AOT
	* 可解释性：训练过程中各流逐渐分化，不同流对不同的 PDE 类型形成专业化响应
		* 学习到的变换 T_l 具分类能力——即使不做显式分类训，T_l 也能在训练中自发学会按 PDE 类型分离样本，且该能力随训练进程逐步涌现、跨模型尺度保持一致
	* （AI 评）interpretability 声称"自发学会分类 PDE 类型"，但可能只是学到了对不同 PDE 的幅值/频率分布做自适应归一化（类似 instance norm），不一定真正识别了 PDE 类型
		* 如果加噪声扰乱幅值分布后分类能力仍保持，说服力更强
* Tadpole-2605.15284 3D PDE 基模基于 P3D AE 预训练 + 微调，在隐空间演化、流匹配生成；动态生成数据集达百 TB
	* "Tadpole: Autoencoders as Foundation Models for 3D PDEs with Online Learning", ICML
		* Liu, Qiang; Koehler, Felix; Holzschuh, Benjamin; Thuerey, Nils;
		* Technical University of Munich
		> created on 2026-07-18 by OpenCode + deepseek-v4-pro
	* 摘要摘录
		> 我们推出了 Tadpole 这一新型基础模型，专门用于处理三维偏微分方程问题。
		> 该模型有效解决了模型可迁移性、高维数据处理能力以及多功能性方面的关键挑战。
		> Tadpole 是通过在由高效在线数据生成工具生成的合成 3D 偏微分方程数据上作为自动编码器进行预训练的。
			> 这样一来，就可以在不增加存储或 I/O 开销的情况下进行大规模、多样化的训练。
			> 实际上，该模型已成功处理了相当于数百 TB 的训练数据。
		> 通过自动编码单通道空间数据，Tadpole 能够学习到适用于各种物理系统的通用表示形式，这些系统的状态变量数量和空间分辨率各不相同。
			> 尽管 Tadpole 最初只是作为自动编码器进行预训练的，但它可以高效地应用于重建之外的多种任务，比如动态模拟和生成式建模。
		> 在动态模拟方面，我们提出了一种新的、更高效的参数处理方式。
			> 这是一种经过精心设计的微调策略，它结合了低阶适配、潜在空间变换以及重新引入的跳过连接机制。
			> 通过这种方式，该模型能够在使用最少的可训练参数的情况下，实现精确的时间建模。
	* 核心主张：PDE 基础模型不应预训练学动力学（$ u_t \mapsto  u_{t+\Delta t}$），应预训练学重建（$ u_t \mapsto  u_t$）{_q7if15}
		* 论证：重建只需学 PDE 解的流形（低维、光滑、由微分算子约束），动力学需学流形上的流（更难、且依赖 PDE 类型和参数）
		* 流形学好了，表征可迁移到多种下游任务；动力学预训练的表征只能用于动力学
		* （AI 评）这个区分简洁有力，但并非完全原创——CV 领域的 masked AE 预训练早已基于类似逻辑（学图像流形而非学变换）。论文的价值在于将这个区分清晰地论证到 PDE 基础模型场景，并提供了 3D 验证
	* 预训练：VAE + 对抗 loss（类似 VQGAN），骨干为 P3D（CNN + Transformer 混合，卷积提供平移等变性）
		* 单通道空间 crop（64³）训练：坍缩通道维到 batch 维，统一处理不同通道数的 PDE 系统。中间 pre-crop（96³）增加单次传输可抽的 crop 多样性
		* 重建目标回避了 crop 边界处变量耦合、误差累积等问题——动力学预训练下 crop 训练几乎不可行，这是选择重建目标的另一个好处
	* 下游微调：
		* 自编码：直接前传或 LoRA 微调解码器
		* 动力学（Tadpole-DFT）：三个组件——(1) LoRA 微调编码器，(2) 编解码间插轻量子网络做隐空间变换，(3) 重连预训练时去掉的 skip connections，各用零初始化可训缩放因子控制
			* 隐变换子网络聚合所有状态变量的隐向量，学跨变量耦合
			* （AI 评）三者分开看都不是新东西（SPNN 在 MR2.md 做过编解码间插网络、PhyCRNet-s 做过 skip 重连），组合在一起的设计是新的，零初始化缩放因子让 skip 逐步引入高频信息
		* 生成：在隐空间做 flow matching 生成
	* 对标 FMT-2509.18611，同样 AE + 隐空间生成做动力学，但 Tadpole 明确将三类下游拆为独立微调协议，框架更清晰
	* 预训练数据全在线生成，无离线数据集。代码开源，权重在 Hugging Face
		* 训练数据全由 GPU 伪谱求解器在线实时生成，算完就扔，无存储/IO 瓶颈
		* 三级缓冲：仿真 FIFO（先进先出）→ 训练 FIFO → MFU 缓存；{_q7if8g}
* Shodh-MoE-2605.15179 PDE 基础模型多物理联训有梯度冲突，建议用 MoE 架构
	* "Eradicating Negative Transfer in Multi-Physics Foundation Models via Sparse Mixture-of-Experts Routing"
		* Sharma, Ellwil; Sharma, Arastu; 
		> created on 2026-07-18
	* 摘要摘录
		> 将科学机器学习技术扩展到通用基础模型方面，面临着“负向迁移”这一瓶颈：同时训练各种不同的偏微分方程模型会导致梯度冲突、优化过程不稳定，以及神经网络的性能下降。
		> 尤其是，宽带开放通道流体动力学和受边界条件影响的多孔介质流动，对模型的光谱特性和几何结构提出了相互矛盾的要求。
		> 我们提出了 Shodh-MoE 这一基于稀疏激活机制的潜在变换器架构，用于处理多物理场问题。
			> 该模型利用物理信息自动编码器生成的压缩后的物理潜在状态进行运算，同时采用亥姆霍兹式的速度参数化方式，确保解码后的状态满足无散度条件。
			> 该模型中的“顶级软语义路由器”能够动态地将相应的潜在特征分配给各个专家子网络。
			> 这样一来，不同的物理机制就能拥有各自的参数处理路径，同时又能保持那些对实现普遍对称性至关重要的共享组件。
		> 这些结果表明，采用“稀疏专家路由”机制是一种有效的解决方案，有助于减少在通用神经网络中多种物理机制之间的相互干扰。{_q7ib0i}
* 2605.05488 多历史步 PDE 基础模型，针对守恒方程只预测通量，架构基于超网络
	* "A Robust Foundation Model for Conservation Laws: Injecting Context into Flux Neural Operators via Recurrent Vision Transformers"
		* Kim, Taeyoung; Ko, Joon-Hyuk; 
		> created on 2026-07-05
	* 基于守恒律的时间推进，eqn(3) 网络输出方程通量，简单时空离散（时间显式）得时间更新；{_q75f9x}
	* 主网络输入用预计算的 stencil 增强 eqn(4)；{_q75g12}
	* 方程信息输入：多历史时间步输入超网络 sec3.1:1
	* 方程信息使用：超网络生成对主网络的调制 eqn(6)；{_q75f9o}
	* 超网络架构：循环 ViT
* ICM-2604.23098 ICON 上下文式预测本构关系，条件为平衡方程系数（而非目标映射输入输出对），实验围绕超弹性力学；作者李卓远、杨柳等
	* "In-context modeling as a retrain-free paradigm for foundation models in computational science"
		* Li, Lingfeng; Li, Zhuoyuan; Li, Shun; Zhan, Kaixin; Gao, Huajian; Chen, Changqing; Yang, Liu; 
		> created on 2026-06-27
	* 摘要摘录
		> 该模型通过控制方程以无标签的方式被训练出来，因此能够适用于各种不同的材料、几何形状和加载条件。
		> 在超弹性研究中的应用表明，该技术可以与有限元仿真相结合，其有效性也得到了实验数据的验证。
		> 此外，随着数据多样性和计算资源的增加，该模型的性能也会提升，展现出与大型基础模型类似的良好扩展性。
	* 引言 建模任务，常规范式基于优化，有其局限
		> 我们认为，有三个根本性的瓶颈阻碍了这种泛化能力的提升：
		> 一是目前盛行的“通过优化来建立模型”的方法论；
		> 二是未能充分利用支配系统的物理规律；
		> 三是无法有效利用数据和计算资源来实现模型的扩展。
		> 现有的方法都是通过针对特定情况的优化来将物理关系纳入模型参数中，这使得模型难以适应新的系统。
		> 此外，由于未能将系统的本质物理结构与外部因素区分开来，往往会导致虚假的相关性，从而进一步限制了模型的泛化能力。
	* 本构问题设定：eqn(3) 离散化平衡方程 $\sum_eA^{ne}g(I^e)=0,\forall n$
		* $g$（物理意义 $g=\nabla_I\psi$）未知，需学出
		* 求和 $e\in N(n)$ 遍历节点 n 的所有邻居
		* eqn(20) 完整物理场景 BC 位置 RHS 非零，为给定载荷
		* 方程导出方式见 method 章节
		* 问题代表性：其他问题有类似数学形式，如 eqn(5) 质量守恒的扩散过程，浓度 到 扩散张量 的本构对应关系待学
	* 上下文条件：eqn(6) 每节点 n 提供一个 token，含多 sub-token（每个邻居 e 一个）$(A^{ne},I^e)$
		* 最终上下文 $C=\{\{(A^{ne},I^e)\}_e\}_n$；{_q6rk6g}
		* 网络表达映射 $(C,I)\mapsto g(I)$；{_q6rk3a}
		* 架构 fig1d
			* 各 e sub-token embed，自注意力，结果 pooling 得 token embed
			* 多层，每层内 各 n token 自注意力，query $I^e$ 对所有 n token 交叉注意力
		* 测量构建：对真实材料，构造该输入条件需 物理观测位移场（均匀网格）+ 插值到人造三角网格 secC.3
			> DIC 提供了在规则像素网格上各跟踪点的坐标和位移信息。
			> 我们对测量得到的位移场进行了去噪处理，
			> 并利用径向基函数插值器将其插值到三角网格上。{_q6rk01}
				> 该插值器采用了薄板样条核函数以及一次多项式函数作为插值方式。
				> 所生成的三角网格与 ICM 模型训练时所使用的网格类似。
				> 我们以每个点到其第 7 近邻点的距离的中值作为特征点间距 h ，该距离是在二维坐标系中计算的。
				> 插值器的平滑参数则定为 0.05h² 。
				> 这样的设置使得在采样良好的区域内能够得到准确的插值结果；同时，也能有效抑制测量噪声。
				> 对于那些未被 DIC 数据完全覆盖的区域（比如边界处），该插值方法也能提供稳定的插值结果。
			> 为了提高计算效率，每个网格节点上的插值运算都使用固定大小的局部邻域范围（此处为距离最近的 100 个 DIC 点）。
			> 为确保推理的可靠性，我们识别出了那些由于局部 DIC 数据不足而可能导致插值位移不准确的网格节点。
				> 具体而言，我们以 DIC 点中距离该节点最近的点的距离的中位数作为参考邻域半径 hn 。
				> 如果某个网格节点周围有至少 ne/2=4 个 DIC 点位于半径 hn 范围内，那么该节点就被视为可靠的；否则，该节点就被视为不可靠的。{_q6rk0i}
				> 在 ICM 推理过程中，只有可靠的节点才会被用来生成变形标记，这些标记则被用作推理的上下文信息。
	* （评）常规上下文学习提供 $(I^e,g^e)$，此处不显式提供各 $g^e$，而是仅给出 $(g^e)$ 满足的方程
		* 该代数方程未必是常规有唯一解的线性方程，方程数、变量数未必相同
		* 不过在归纳偏置存在情况下仍可找出这些数据表达的映射；{_q6rk37}
	* 无监督训练：eqn(7) 网络输出的 $g(I)$ 再次代入离散平衡方程，残差作为 loss；{_q6rk5h}
	* 数据设计，训练、测试所用依据不同
		* 训练集
			> 为了构建一个涵盖多种情况的训练数据集，我们基于多项式应变能函数，建立了 2,000 种超弹性材料模型（详见补充材料 1）。
			> 这些模型分别与七种不同的板状结构相结合，这些板状结构上具有不同数量和排列方式的圆形或椭圆形孔洞（见图 2a）。
			> 每种结构都经历了单轴拉伸、双轴拉伸以及平面剪切作用，从而产生了复杂的、不均匀的应变场。
			> 总体而言，该数据集包含了超过 5 亿个变形数据点，充分反映了超弹性材料的各种力学响应特性。
		* 测试集，多样性递增：同分布，改应变能形式（依据真实材料模型），再改几何，再增大载荷
			> 为了验证模型的泛化能力，我们构建了四个测试集，这些测试集的数据多样性逐渐增加：
			> (i) 在 Test-ID 中，我们用 400 种全新的多项式超弹性模型来替换训练数据中的模型，同时保持训练时的几何形状和加载方式不变，以此来评估模型在相同数据集上的预测能力。
			> (ii) 在 Test-M 中，我们加入了 500 种来自其他四种常见应变能量形式的材料，分别是 Ogden 模型、Pucci-Saccomandi 模型、Exp-ln 模型以及 van der Waals 模型（详见补充材料 1.1）。
				> 这些材料的加入同样是在保持训练时的几何形状和加载方式不变的条件下进行的。
			> (iii) Test-MGL 与 Test-M 使用相同的材料，但将其与五种全新的几何形状以及更多的加载方式相结合（见图 2b）。
			> (iv) Test-MGL+则进一步将 Test-MGL 中的最大加载幅度提高了 10%。
			> 这种逐步构建的方法有助于我们从多个角度来评估该模型在面对日益复杂的、未经验证的情境时的表现。
			> 这些情境包括各种新型材料，以及各种前所未有的几何结构和载荷条件。
		* 差异解释
			> 训练集与测试集之间的显著差异如图 2c 所示，其中清楚地体现了两者在应力水平上的巨大差异。
			> 图 2d 则展示了各数据集中变形状态的分布情况。
			> 值得注意的是，测试集所涵盖的范围超出了训练集的范畴，这反映了材料、几何形状和载荷等方面的变化所带来的综合影响。
			> 因此，这些测试集为评估模型在非训练数据上的泛化能力提供了理想的测试环境。
		* 数据集、生成代码 均随模型训练代码公开；{_q6rm52}
	* 学后机制解释：表示学习，对所得隐表征算 t-SNE，验证相邻点对应相似的应力应变本构关系 fig5
		> 该可视化结果表明，
			> 在 t-SNE 流形中，{_q6sm4r}
			> 相邻的点所对应的变形场的应变能密度函数几乎完全相同，
			> 而与所涉及的物质类型或应变能的绝对值无关。{_q6sm48}
			> 此外，即便这些变形场源自不同的几何结构或加载方式，只要它们的应变能密度函数具有相似的形态，那么它们所对应的潜在区域也有可能处于相邻的位置。{_q6sm65}
		> 这些观察结果表明，ICM 完全符合我们的设计预期：
			> 通过处理海量数据，ICM 能够识别出一种由应力-应变关系所决定的内在结构。{_q6sm8w}
			> 这一内在结构并不受材料类型、应变能量大小、几何形状或加载条件等外在因素的影响。
			> 通过将复杂的物理情境映射到这一内在结构上，ICM 实现了基于上下文的推理机制，从而实现了之前所展现出的强大泛化能力。
		* （评）大致手段链：评估训练后网络合理性可靠性
			* ← 内部运行机制拆解分析
			* ←（对象细化）中间层激活值隐表征分析
			* ←（标准与预期性质细化）激活值与任务关键特征（应变能函数而非物质类型/应变能绝对值）相关性高
			* ←（具体分析方式选取）激活值 t-SNE 下位置邻近性 反映 任务关键特征相似性
	* 训练 scaling law fig6
		> 在证明了 ICM 在测试阶段的出色扩展能力之后，我们现在来研究其在训练阶段的性能表现。
		> 具体来说，我们从两个相互独立的方面来考察预测误差的降低情况：(i) 训练所需的计算资源；(ii) 训练数据的多样性（见图 6）。
		> 为了更准确地分析这些因素的影响，我们进行了两项互补的研究：
		> 一项是固定数据集的情况下，研究模型规模和计算资源的调整对性能的影响；
		> 另一项则是固定模型规模和计算资源的情况下，研究训练数据多样性对性能的影响。
* OAT-2510.23667 拓扑优化基础模型，包括大规模数据集
	* "Optimize Any Topology: A Foundation Model for Shape- and Resolution-Free Structural Topology Optimization", NeurIPS 2025
		* Nobari, Amin Heyrani; Regenwetter, Lyle; Picard, Cyril; Han, Ligong; Ahmed, Faez; 
		> created on 2026-04-06
	> sec4.5 OpenTO 数据集；{_q46f6y}
		> 现有的 DL 数据集在 OpenTO 数据集创建过程中面临的四个挑战：
			> 1）大多数现有数据集仅限于一种特定领域形状（正方形）和一种分辨率（64 x 64），最广泛的数据集包含五种不同的形状和分辨率 [34];
			> 2）大多数现有作品仅限于一小部分预定义的边界条件（二维数据集 中最多 42 个 [34]）;
			> 3）现有数据集通常只包含单一施加的力;
			> 4）所有现有数据集仅在设计空间边界（域边界）施加力和边界条件，缺乏内部强迫和夹具。
		> 引入了拥有 219.4 亿样本的最大开源拓扑优化数据集，用于通用拓扑优化。
			> 为了实现基础性的数据规模，OpenTO 包含程序生成的随机 TO 问题、运行 SIMP 求解器，并从求解器中获得最优拓扑。
			> 数据生成方式使 OpenTO 克服了上述先前作品的限制。
			> OpenTO 有效的主要特点包括：
				> 1）OpenTO 的设计领域在分辨率和形状上完全随机，宽高比从非常窄的 10 比 1 到正方形（1 比 1），像素/单元大小从 1/64 到 1/10²四不等，涵盖了 TO 在 2D 实际应用中的矩形域形状和分辨率的全面范围;
				> 2）OpenTO 包含随机抽样的边界条件，包括内部边界条件点 ，每个样本具有唯一的边界条件配置;
				> 3）OpenTO 包含完全随机的力，包括内部力，以及一个配置中多达 4000 载荷 的配置（见附录 D 关于分布力）。
			> OpenTO 的详尽性使其成为首个解决 TO 通用问题的数据集，也是 TO 基础模型开发的起点。
			> OpenTO 包含 5000 个测试样本，采用完全随机配置，主要训练数据中未包含模型在一般问题环境中的性能测试。
			> 程序性数据生成的完整细节可见附录 D。
		> 最后，OpenTO 还包括在有限环境中开发的先前数据集（来自 Nobari 等 人[34] 的 194,000 个样本）。
			> 总体来看，OpenTO 包含 2,194 万个拓扑样本，其中 894,000 个样本被标记（定义 P^ 为 ），其余仅包含拓扑结构。
			> 我们用所有样本来训练自编码器，只有带标签的 894,000 个样本来训练 LDM。
* 2603.05598 PDE 基础模型的 tokenizer 预训练，基于普通 AE
	* "On the Value of Tokeniser Pretraining in Physics Foundation Models"
		* Sotoudeh, Hadi; Mukhopadhyay, Payel; Ohana, Ruben; McCabe, Michael; Lawrence, Neil D.; Ho, Shirley; Cranmer, Miles; 
		> created on 2026-03-30
	* 摘要摘录
		> 我们研究分词器预训练对物理仿真准确性和效率的影响。
		> 我们证明，在训练动力学模型之前，用自编码目标预训练分词器可以提升物理仿真的计算效率。{_q3vf8v}
		> 值得注意的是，这种益处的大小取决于域对齐：在与仿真任务相同的物理系统上预训练带来最大的改进，而在其他系统上预训练则带来适度的提升。
		> 我们还引入了灵活的时空压缩操作，扩展因果卷积以支持运行时可调压缩比，从而实现对多样化下游任务的高效适应。
	* sec2.4 架构
		> 处理器。我们采用 Walrus（McCabe 等 ，2025） 的处理器架构，采用因式分解空间和时间关注，采用轴向位置编码和因果时间结构。
		> 分词器。我们使用简化版的 MAGVIT-2（Yu 等 ，2024）， 保留因果卷积编码-解码器骨干，但去除向量量化、对抗和感知损失以及自适应群归一化。
			> 分词器仅通过连续、非量化潜在变量的 MSE 重建进行训练。
			> 我们进一步扩展该架构，支持运行时可调时空压缩，方法是将 Mukhopadhyay 等人（2025）的方法调整到因果卷积。
			> 这使得压缩比与重建保真度之间实现了灵活权衡。
			> 完整的建筑细节见附录 B。
* 2603.04354 PDE 基础模型下游微调，用于材料裂纹扩展预测（OoD），测了 Poseidon、MORPH
	* "Out-of-distribution transfer of PDE foundation models to material dynamics under extreme loading"
		* Rautela, Mahindra; Most, Alexander; Mansingh, Siddharth; Pachalieva, Aleksandra; Love, Bradley; Malley, Daniel O; Scheinker, Alexander; Hickmann, Kyle; Oyen, Diane; Debardeleben, Nathan; Lawrence, Earl; Biswas, Ayan; 
		> created on 2026-03-30
	* 时间处理：输入初态输出末态
		>  我们微调偏微分方程基础模型以实现终端状态预测，并将下游任务定为第一帧到末帧的长视野算子学习。
		> 给定早期多场状态 t0 ，模型在无中间监督的情况下预测终极状态， tT 从而学习长视野映射。
	* 实验比较的基础模型
		> 在该协议下，我们通过比较不同训练集大小下的微调与随机初始化，对两个主要为流体预训练的开源偏微分方程基础模型（MORPH 和 POSEIDON）进行了基准测试，从而量化样本效率和泛化。
	* 数据集，均开源；{_q3uf8s}
		> 本研究采用两个互补的开源数据集——扰动分层界面（PLI）和动态断裂/破坏演化（FRAC）——来评估极端载荷材料动力学的分布外转移评估方案。
	* 数据集 1：扰动的层叠界面 sec2.1.1
		> 为探究极端载荷区域，我们使用扰动分层界面（PLI）数据集，
			> 这是一个大型物理数据集，包含二维轴对称多材料模拟，旨在捕捉高爆驱动冲击波通过复杂目标的传播 （Banesh 等，2025）。
			>  每个样本由多场状态变量的时空轨迹组成，包括热力学和运动学场，如密度、压力、温度和速度，以及额外的与力学相关的推导量。
			> 这种结构使 PLI 非常适合学习从早期状态到晚期（终极）状态的长视野映射。
			> 这些轨迹表现出动量转移、冲击传播、塑性变形和热效应等关键现象。
			> 其底层动力学被强控制，因为激波和界面相互作用可能触发里希特迈尔-梅什科夫型不稳定性和喷射现象。
			> 在数据集中，几何形状在固定材料集（包括铜、铝、不锈钢、通用聚合物、通用高爆炸药和空气背景）时变化较大。
		> 该数据集包含 5,293 个模拟，每个模拟由 38 个通道表示，跨越 100 个时间步长，空间分辨率为 × 1120,400。
			> 对于终端状态预测，我们只使用每个轨迹的前后帧。
			> 除非另有说明，我们使用“av-density”信道，该信道编码材料间的混合平均密度。
			> 我们将数据集分为训练、验证和测试三个，采用 80/10/10 的比例。
			> 图 4（附录 A）展示了代表性的时空轨迹，其中列对应等距时间步长，每一行可视化多种材料的密度场。
	* 数据集 2：动态断裂与失效演化 sec2.1.2
		> 作为 PLI 的补充，我们使用材料压裂与失效模拟数据集（FRAC），
			> 重点关注断裂起始、传播及在多种材料和载荷条件下的相互作用 （Hill 等，2025）。
			> FRAC 由两种在表述和保真度上不同的求解器家族生成：相场断裂模型和结合有限-离散元方法（FDEM、HOSS），涵盖结构化（笛卡尔）和非结构化表示。
			> 该数据集涵盖多种材料类别（包括脆性和延展性响应）及边界/载荷配置（例如相场子集中的单轴和双轴张力），并随机初始断裂模式以驱动多样的裂纹网络演化。
			> 由于晚期裂纹拓扑结构和损伤定位依赖路径，并受运动前沿（裂纹尖端）和演化不连续点控制，FRAC 为极端、高度非线性固体力学下的长视野预测提供了严格的测试平台 （Marcato 等 ，2025）。
		> 该数据集包含多材料模拟。
			> 本研究重点关注水平边界条件下的钨子集，包含约 20 万次模拟，轨迹间时间步数可变。
			> 我们将该子集划分为训练、验证和测试三个，采用 80/10/10 的比例。
			> 图中展示了具有代表性的时空轨迹。
			> 5（附录 A），我们可视化了三个示例模拟。
			> 在每一行中，帧对应连续的时间步，并标注其特征时间。
	* sec4 实验结果：二模型各有所长；预训练有用，但加微调数据后收益减小
		> 在数据集中，转移行为依赖于不同系统：MORPH 在 PLI 上更准确，而 POSEIDON 在 FRAC 上略有优势。
		> 数据层级扩展表明预训练可以在低数据环境中提高样本效率，但随着更多领域内监督的增加，效益会减小，且会根据目标物理和微调设置有所不同。
	* sec4 结论：纯流体预训练迁移不足，预训练需更多样化数据集；{_q3uf9f}
		> 总体而言，这些结果表明，仅靠以流体为中心的预训练可能不足以实现冲击和断裂主导力学中的显著转移收益，凸显未来偏微分方程基础模型在预训练期间需要纳入更多多样化的极端负载数据集。
		> 持续学习策略可能进一步促进此类体系的渐进整合，而无需对基础模型进行全面重新训练。
* NESTOR-2602.22059 多步自回归 PDE 基础模型 靠 MoE 自动路由不同方程类型的模块；{_q3m909}
	* "NESTOR: A Nested MOE-based Neural Operator for Large-Scale PDE Pre-Training"
		* Sun, Dengdi; Zhou, Xiaoya; Wang, Xiao; Si, Hao; Lyu, Wanli; Tang, Jin; Luo, Bin; 
		* 作者单位为安徽大学
		> created on 2026-03-22
* OpsSplit-2602.23113 PDE 各项独立学网络，表达为 NeuralODE 形式，从而新方程可直接组合已有项
	* "Learning Physical Operators using Neural Operators"
		* Gopakumar, Vignesh; Gray, Ander; Giles, Dan; Zanisi, Lorenzo; Kusner, Matt J.; Betcke, Timo; Pamela, Stanislas; Deisenroth, Marc Peter; 
		> created on 2026-03-22
	* 摘要摘录
		> 本研究引入了一种基于物理的训练框架，通过运算符拆分方法分解偏微分方程，训练独立的神经算符学习单个非线性物理算符，同时近似具有固定有限差分卷积的线性算符。{_q3m871}
		> 这种模块化的专家混合架构通过显式编码底层算子结构，实现了对新物理范畴的推广。
		> 我们将建模任务表述为神经常微分方程（ODE），其中这些学到的算子构成右边，使得通过标准常微分方程求解器实现连续时间预测，并隐式强制偏微分方程约束。
		> 该方法保持参数高效，使得时间外推超越训练视野，并提供可解释的组件，其行为可根据已知物理验证。
	* 测试方程包括 INS、可压 Euler
* 2602.15004 Poseidon 微调用于火星大气预报，为适配 3D 引入 z-注意力模块
	* "PDE foundation models are skillful AI weather emulators for the Martian atmosphere"
		* Schmude, Johannes; Roy, Sujit; Wang, Liping; van Kessel, Theodore; Klein, Levente; Freitag, Marcus; Bentivegna, Eloisa; Manson-Sawko, Robert; Lutjens, Bjorn; Maskey, Manil; Watson, Campbell; Ramachandran, Rahul; Bernabe-Moreno, Juan; 
		> created on 2026-03-20
	* 挑战：数据受限，无 ERA5
	* 其他方法：架构设计嵌入物理知识，从地球气象模型迁移学习；本文关注基础模型迁移
	* 数据集：OpenMARS v5 再分析数据，经纬网格；{_q3kl07}
		> 我们所有实验均使用 OpenMARS 数据库第 5 版的再分析数据 （Holmes 等，2020）。
		>  数据的原始形式分辨率为五度，像素 36×72 分布在规则的纬度/经度网格上。
		> 有 35 个垂直的西格玛等级。
		> 垂直坐标定义为相对于表面压力 ps 的压力。
		>  σ=p/ps 数据集中的最高层， σ=5.0824954×10−5 位于约 105 公里的高度。
		> 数据集包含温度（ T ）以及东风（ u ）和北风（ v ）作为垂直变量。
		> 在地表层，我们有地表压力、地表温度和地表二氧化碳冰。
		> 最后，还有尘埃通过大气产生的光学深度。
		> 在我们的实验中，我们只在σ级杠杆，利用 u ， v T 。
		> 此外，我们从 sol 2674.416748 到 sol 训练， 5348.750000 并用 sol 5348.833496 到 6031.000000 。
		> 这对应于训练的火星年 28 至 31，验证的火星年 32。
		> 原则上，OpenMARS 数据集包含火星 28 年至 35 年的数据。
	* 数据处理：样条插值到 128×128；通道处理，数据 T 通道替换原 ρ 通道，原 p 置零
		> 为了匹配波塞冬数据集的固定分辨率和宽高比，我们通过样条插值将 OpenMars 数据插值到相同的分辨率—— 128×128 像素。
		> 鉴于预训练数据中通道的原始顺序为 ρ ， u ， v ， p ， ，我们将 OpenMars 通道排序为 T ，u , v；p 输入通常设为零。
		> 我们采用传统的标准缩放。
			> 缩放参数取决于通道和 level;但不是纬度或经度。
			> 统计数据是从训练数据中计算的。
	* 数据掩码，稀疏化训练，原 p 通道用作 mask；{_q3kl5u}
		> 稀疏性：在某些实验中，我们会对数据进行稀疏化。
		> 这意味着我们随机抽取一组纬度/经度位置，这些位置我们要么保留，要么丢弃整个垂直列。
		> 在此过程中，我们不再将第四通道（最初训练为压力 p ）设为零，而是填充一个二进制掩码，表示数据的存在或缺失。
	* 3D 适配：每个 SWin 层后引入新层，执行跨 z（海拔）注意力；有额外位置编码；{_q3kg33}
		* ConvNeXt 不调整
		* 为复用原代码 组织张量 shape，除跨 z 注意力外，其余情形把该维度并入 bsz
		> 沿垂直方向的轴向注意力需要合适的额外位置编码。
			> 我们学习的不是层级特定的学习嵌入或傅里叶类型的嵌入，而是学习一个将西格玛坐标映射到合适嵌入的函数。
			> 该功能是一个具有 GELU 激活的两层 MLP。
			> 这意味着我们可以在训练时未见到的层级上进行推断。
	* baseline 仅包括随机初始化的 Poseidon？
* 2603.04606 PDE 基础模型（自回归 MORPH）解反问题，加任务专用头后前传直接输出解，需正反问题联合微调
	* "PDE foundation model-accelerated inverse estimation of system parameters in inertial confinement fusion"
		* Rautela, Mahindra; Scheinker, Alexander; Love, Bradley; Oyen, Diane; DeBardeleben, Nathan; Lawrence, Earl; Biswas, Ayan; 
		> 2026-03-07 Pf 大群导师推荐
	* 摘要摘录
		> 本研究中，我们研究惯性约束聚变（ICF）中的一个反问题：从多模态快照式观测（输出）估算系统参数（输入）。
		> 利用开放的 JAG 基准测试，该基准提供高光谱 X 射线图像和标量可观测量，我们对偏微分方程基础模型进行微调，并训练一个轻量级任务专用头，共同重建高光谱图像和回归系统参数。
		>  R2=0.995 数据尺度实验（占训练集的 5%–100%）显示，随着训练数据量的增加，重建和回归损失均有持续改善，低数据区边际增益最大。
		> 最后，预训练 MORPH 权重的微调优于从零训练同一架构，表明基础模型初始化能提升 ICF 中数据有限逆问题的样本效率。
	* 反问题任务类型，惯性约束聚变 设计参数 secI；{_q39b0i}
		> 本研究通过多模态诊断观测估算潜在惯性约束聚变（ICF）设计参数的逆问题，并评估偏微分方程基础模型预训练相较于从零开始训练是否能提升反演准确性和数据效率。
		* 输入：由高光谱图像和标量可观测量组成的多模态诊断特征；输出：模拟器输入参数
	* fig1 引入任务专用头（TSH）；观测轨迹输入²基础模型，末层激活¹输入 TSH 输出反问题解
		* ¹取注意力模块的输出，不经过 unpatching 和输出投影
		* ²自回归基础模型本来就支持多时间步输入
		* TSH 额外输入：15 个标量，可观测量 or diagnostics；{_q39b23}
		* TSH 输出为 5 标量
		* 训练：正反问题联训，优化器独立；{_q39b26}
			> 基础模型和 TSH 通过独立的损耗函数和独立的优化器和学习率调度器，端到端联合训练。
			* （评）正问题 loss 仅作用于基础模型，反问题 loss 同时作用于基模和 TSH
			* （评）额外引入正问题 loss 动机，推测是为防止模型退化、泛化能力受损
	* 方程为 OoD secII-B:-2；{_q3kh0i}
		> （MORPH）预训练套件包含六个跨越 1D–3D 领域、场域和组分结构多样的时空数据集：1D-CFD（计算流体力学）、2D-DR（扩散-反应）、2D-SW（浅水）、2D-CFD-IC（不可压缩 CFD/Navier–Stokes）、3D-MHD（磁流体力学）和 3D-CFD（计算流体力学）。
		> 相比之下，控制 ICF 聚变及其高光谱 X 射线特征的物理学未在本预训练套件中体现[12]。
		>  因此，我们将 ICF 的超光谱重建和参数推断视为分布外转移环境。
	* （评）与我们做法的区别
		* 求解方式：✓前传即可给出结果，我们要解优化问题
		* 输入形式：
			* 样本量：✗似乎只能是 单个解样本（含多时间步），我们可以有几十个联合使用
				* 如果改用 ICON 类基模，或许也能同时用多个解轨迹
			* 完整度：✗似乎需完整时空观测；我们可以散点稀疏观测
			* 抗噪声：✗实验应该是用的干净的物理场输入（原文 noise/noisy 仅出现于引言）
			* 额外信息：✓可引入额外已知的信息（本文为 15 标量）；我们目前不行
				* 如果我们未来要支持：设计新计算图表示方案，除了 支持反问题观测解场作为模型输入，还支持这类额外输入
		* 网络结构：✗需引入额外参数，我们不需要
		* 模型微调（作为求解前的预备工作）
			* OoD 新方程：正反问题联合微调；我们是仅针对正问题微调，反问题要额外解优化问题
			* ID 已见过¹：✗训反问题预测头，同时保留正问题 loss 防模型退化；我们无需微调，直接解反问题
				* ¹本文实验不涉及，仅仅是我根据方法推测的这种场景下的做法
* OpInf-LLM-2602.01493 PDE 基础模型，多参化 PDE 算 POD 基底及降阶演化算子，新方程由 LLM 拟合新演化算子
	* "OpInf-LLM: Parametric PDE Solving with LLMs via Operator Inference"
		* Wang, Zhuoyuan; Hu, Hanjiang; Deng, Xiyu; Mowlavi, Saviz; Nakahira, Yorie; 
		> created on 2026-02-22
	* sec1
		> 在本研究中，我们提出了 OpInf-LLM，一种通过算子推断实现 LLM 参数偏微分方程求解框架（见图 2）。
		> 我们首先利用算子推断，从有限参数值和配置设置的少量解数据中学习不同参数偏微分方程实例的降阶模型，从而得到共享的约简基和依赖参数的约化算子。
		> 随后，我们整合大型语言模型，通过智能工具调用推断并求解新的降阶模型，从而预测多种实例的偏微分方程解，包括此前未见的参数和变化的边界条件。
		> 从结构上讲，降阶模型有效降低了偏微分方程推广到学习算子上的多项式拟合和低维常微分方程系统时间积分的复杂性，从而在测试时实现较低的计算需求，并在异构偏微分方程设置下实现高执行成功率。
		> 此外，LLM 的使用自然允许自然语言指令来指定偏微分方程的参数和配置，为多样化的偏微分方程求解任务提供了灵活统一的界面。
	* eqn(3) PDE 取线性 POD 基底，考察系数满足的 ODE
		* 假设 PDE 二次非线性，系数 ODE 仅涉及固定若干个降阶算符
		* 对每个参化 PDE，先构建 POD 基底，再拟合 ODE 涉及的算符 A,H,B,c
	* sec3:-1 步骤：对新物理场景，LLM 解析 PDE、参数，写代码算多项式回归以求出当前 A,H,B,c，然后解 ODE；{_q2mf5x}
		> 上述程序执行后，我们集成大型语言模型（LLM），允许指定目标偏微分方程及其配置的自然语言指令，并利用 LLM 工具调用能力推断简化算符并进行时间积分，实现跨不同环境的参数化偏微分方程求解。
		> 具体来说，给定一个自然语言描述的偏微分方程求解任务（例如，“求解带有粘 ν=0.03 度的粘性伯格斯方程......”），
			> LLM 首先解析控制方程和指定的参数。
			> 基于这些信息，LLM 调用现有工具进行多项式回归，推断出参数相关的约简算子 A(ξ) 、 H(ξ) 、、 B(ξ) 和 c(ξ) ，
			> 然后利用解析后的初始条件和边界条件规范对（4）中的降阶常微分方程系统 进行积分。
		> 该集成的关键特征包括：
			> （i） 以指令形式描述各种偏微分方程的自然语言;
			> （ii） 通过适度的多项式拟合和降阶常微分方程积分要求实现低执行失败率;
			> （iii） 从统一 ROM 结构中推广到未见偏微分方程参数和 ICBC 配置的零点子。
* Geo-NeW-2602.02788 （备用）基于外微分 FEM 的 PDE 基础模型
	* "Structure-Preserving Learning Improves Geometry Generalization in Neural PDEs"
		* Shaffer, Benjamin D.; Koohy, Shawn; Kinch, Brooks; Hsieh, M. Ani; Trask, Nathaniel; 
		> created on 2026-02-20
	* 摘要摘录
		> 我们致力于开发科学和工程的物理基础模型 ，这些模型能够实时解偏微分方程（PDE），从而在适应未知几何时保持结构和精度。
		> 为此，我们介绍了通用几何神经惠特尼形式 （Geo-NeW）：一种数据驱动的有限元方法。
		> 我们共同学习一个微分算子和定义在底层几何上的兼容约简有限元空间。
		> 通过有限元外微积分，计算模型以生成预测，同时精确保持物理守恒定律。
		> 几何以离散化网格的形式进入模型，既通过基于变换器的编码，也作为学习有限元空间的基础。
		> 这明确地将底层几何和施加的边界条件与解连接起来，为学习神经偏微分方程提供了强大的归纳偏向，我们展示了这种偏向提升了对未见域的推广能力。
		> 我们提供了本构模型的新参数化，确保解的存在性和唯一性。
		> 我们的方法在多个稳态偏微分方程基准测试上展现出最先进的性能，并在非分布几何上相比传统基线实现了显著提升。
