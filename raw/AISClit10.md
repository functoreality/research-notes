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
		* checkpoint 选择基于物理诊断，非 pointwise val loss
			> 3D finetuned 模型的 checkpoint 选择基于验证实现 $\mathcal{S}_4$ 上的表现（Appendix 8.3）
			> 在保存的 checkpoint 中保留 KE(t) 与 δPE(t) 全局能量演化与真值最一致的那个，而非仅按逐点 loss 选择
			* 反映 PDE 基础模型评估特殊性：val loss 不等于物理忠实度
	* 推理侧：自回归 rollout（即 delta-prediction 反馈）
		* 前 L 帧输入，每步预测下帧增量，反馈作输入
	* 数据与代码
		* 3D RTI DNS（5 个 256³→128³）：HF datasets/pmukhop/rti-dataset-boussinesq
		* 稳定分层 RTI 评估数据：HF datasets/pmukhop/rti-stratified-data
		* finetuned checkpoint：HF pmukhop/rti-walrus-model（safetensors + pth + yaml）
		* Walrus 训练代码：github.com/PolymathicAI/walrus（MIT）
		* 实验室实验数据（6 个 2D slices）未公开；DNS 生成码 TurMix3D 未公开
