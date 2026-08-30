> 2026-08-30 从多个源笔记中抽取整合
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
* Origo 自回归 PDE 基模算子分裂线性&非线性，非线性各块步进系数由超网络据多历史步预测
	* "Origo: Interpretable Multi-physics PDE Foundation Model through Neural Operator Splitting", ICML 2026
		* Sun, Li; Lv, Hongbo; Jiang, Zhikai; Sun, Zhongtian; Yang, Lanxu; Yu, Philip S.
		* 北邮、华北电力、Kent、UIC
		> created on 2026-08-03，人工主导，因 OpenCode + DeepSeek-V4-Flash-0731 版本，及 Codex + GPT-5.6-Terra-high 改进版本的整体逻辑都不太对
	* [公众号报道](https://mp.weixin.qq.com/s/QE2k0gHwL-homz74lGMlPw)
	* 原子拆分作为特殊 MoE，规避单个稠密网络局限性
		> 现有方法通常采用统一的稠密网络，直接学习从当前状态到未来状态的整体映射。
		> 这样的设计便于扩大模型规模，却也带来两个问题：
		* 稠密网络局限 1：多不同性质物理机制差异大，单网络联学可能负迁移
			> 一方面，不同物理系统之间可能出现负迁移，例如扩散过程倾向于平滑解场，而对流过程可能产生陡峭梯度甚至间断；
		* 稠密网络局限 2：可解释性差
			> 另一方面，多个物理机制被混合在同一高维表示中，模型即使能够完成预测，也很难说明哪些预训练知识真正被迁移到了目标方程。
	* 时间步进推理：Strang 算子分裂，带加性残差修正
		* 单步推进三子步：线性半步、非线性单步、线性半步+残差修正，各块均 NN
		* 线性（全局）块：谱卷积，频域系数矩阵 $\exp(\tau\Lambda(\theta_L))$（瞬时系数取矩阵指数得 τ-步进）{_q84g26}
			> $\Lambda(\theta_L)$ 是由潜在物理代码控制的频谱乘子。该设计主要针对扩散、色散等在相应频谱基底下可对角化的线性算子。
			* $\tau=\Delta t/2$；$\theta_L$ 由超网络据多历史步生成（见下）
		* 非线性（局部）块：原子算子库线性组合，组合中第 m 项系数 $\lambda\pi_m$：
			* $\lambda$ 非线性总更新强度，为整体系数，所有项共享
			* $\pi_m$ 特定非线性项权重占比：Entmax 生成，类似 softmax（非负归一化）但非零值相对稀疏
				> 为了避免所有候选机制被同时激活，论文采用 α-Entmax 生成稀疏路由权重：
				* $\pi=\operatorname{entmax}_{1.5}(W_\pi h+b_\pi)$，弱 logits 精确为零 eqn(11)
				> 与 Softmax 相比，Entmax 可以把部分不重要候选项的权重直接压缩为零。
				> 因此，模型在面对具体方程时，可以集中选择少量相关机制，而不是对整个算子库进行稠密混合。
				* $\alpha=1.5$ 系数消融：实验中 68.3% 权重为零；$\alpha=1$ 全密，$\alpha=2$ 过稀而欠拟合 tblE.3；{_q84e7k}
			* 原子算子 对应方程项：候选库含多项式、梯度耦合、局部卷积、通用局部映射；{_q84g2l}
				* （评）方程项全集应该是预设的，仅时间推进网络可学
					* 当前工作未（像常规 MoE 那样）让网络自己识别所有的可能的算子类型；{_q84f6a}
					* 暂未确认预设方程项如何在训练 loss 中体现，loss 看起来黑箱
			* 原子算子 架构：KAN 参化，为保可解释性，便于未来检查
				> 论文希望借助样条形式的单变量映射，提高对局部本构关系的表达能力，并保留一定的可检查性。
			* 原子算子 参数：$\theta_{N,m}$，同样超网络生成；{_q84k1p}
				* （评）当心符号含义差异，$N$ 是类型标记（用 roman 字体更合适），$m$ 是该项角标变量
				* （评）暂未确认超网络生成的是完整网络参数，还是仅仅生成其调制
		* 残差修正：架构为 CNN，输出乘上门控系数 $\rho$
			> 作者加入了一个带门控的残差修正项，用于补偿高阶分裂误差以及未被基础算子完全描述的相互作用
			* 幅值控制：为避免该项主导模型输出，训时对其门控系数 $\rho$ 加正则化
			* （评）输入未写清，导致不能据本文复现原始实现
				* 线性半步输出：eqn(18) $\hat u=u_{split}+\rho\,\mathrm{CNN}_{res}(u_{split})$
				* 非线性单步输出：eqn(14) $+\rho R(u^{(2)})$
		* 逼近能力理论分析
			> 在满足线性半群可进行频谱对角化、非线性流局部 Lipschitz 连续，以及经典 Strang 分裂所需正则性条件的情况下，所构造的线性和非线性子算子能够逼近真实子动力学。
			> 论文同时给出了多步滚动预测的全局误差界，并指出，当单步一致性误差达到 $O(h^3)$ 时，整体方法可以保持二阶收敛性质。
			* 条件性理论：半线性 PDE、线性流可谱对角化、非线性局部 Lipschitz 等假设下，存在最优码 $z^*$ 逼近子动力学 Thm3.2
			* 单步误差 $\delta(h)=O(h^3)$ 时有二阶全局收敛 Thm3.3
			* 部署码 $\hat z$ 另有从轨迹推断的编码误差 eqn(9)，理论未保证训练会找到 $z^*$
	* 各原子算子组合方式：超网络，据多历史步推断涉及哪些物理机制、激活哪些算子
		* 超网络架构：Transformer 或 CNN 等编码器
		* 超网络输入：定长 $k$ 历史步；仅末步用于算子分裂时间推进，先前步仅用作超网络输入；{_q84g4h}
		* 超网络输出汇总：线性项权重 $\theta_L$，非线性项总强度 $\lambda$、非线性各原子项路由权重 $\pi$、权重 $\theta_N$，残差补偿项系数 $\rho$；{_q84k15}
		* （评）选块策略特殊性，先前算子分裂基模是 使用者据方程形式手动选块，这里靠输入多历史步、超网络据此自动选块
		* 非线性项系数 准确性实验验证，Burgers 对流+粘性、NS 对流+粘性 预测系数相对误差最多 5%，其余无关候选项预测系数保持接近 0
		* 局限—非开放性系统识别：候选算子库受限，参化方式受限
	* 训练 loss：10 步 rollout 过程中所有步 MSE，加二正则项 eqn(19-22)
		* 正则项—非线性项路由权重 $\pi$ 应稀疏（最小化路由熵）{_q84k32}
		* 正则项—残差门控 $\rho$ 幅值不应太大（门控惩罚）
	* 微调：冻结从特征到控制码的机制推断模块（超网络），只更新演化模块 sec4.4
		* 目的：小数据适配时避免控制码漂移，而非重新解释未知机制
		* （评）暂未确认是将超网络输出的主网络参数 保存并作为待优化变量，还是 超网络照常使用，主网络只微调自带、不由超网络生成的那部分参数
			* 暂时认为后者可能性较高：微调后不假定每次输入的连续 k 时间步都一致，应该还是需要每次继续将其输入超网络
	* 零样本能力：已有算子知识
		> 其零样本能力因此被解释为已有算子知识的重新组合，而不只是高维特征空间中的隐式迁移。
		* OoD 类型：仅考虑已有算子的新组合，不支持任意形式新 PDE（如涉及新的非线性算子类型）
* PhysBiasBench-2605.29283 评估 PDE 基模泛化：因子化至 8 PDE、3 混和、5×5 设定动态-IC 测试网格
	* "Do Physics Foundation Models Learn Generalizable Physics? A Bias-Aware Benchmark Across Physical Regimes and Distribution Shifts"
		* Chu, Mengdi; Liu, Yang; Biswas, Ayan; Shen, Han-Wei;
		* Ohio State Univ, Los Alamos National Lab
		> created on 2026-07-19 by OpenCode + DeepSeek-V4-Pro
	* 动机：PDE 基模声称统一泛化，但评估压缩成单一平均分，看不清模型是否学到了可迁移物理、还是只在特定条件下表现好
		* 5 架构（DPOT、GPhyT、MORPH、MPP、Poseidon）
			* 每种 4 变体（scratch + pretrained S/M/L），共 20 模型
		* 8 PDE：Fisher-KPP、Gray-Scott、Swift-Hohenberg、
			* Burgers、Kolmogorov、Kuramoto-Sivashinsky、Decay、Wave
		* 数据由 APEBench/Exponax 过程式生成，100 帧 dense 轨迹，再时间子采样构造动态尺度
	* 因子化评估设计 sec3
		* 评估轴独立可控：架构、变体（pretrain+size）、PDE 族、训练混和、测试 regime（5×5 种设定）、预测 horizon
			> 25 个测试 regime 由动态尺度和初始条件复杂度偏移产生，覆盖分布内、分布偏移和 OOD 设置。
			* 每种设定称为 cell
		* 动态尺度轴：dense 轨迹时间子采样
			* 小 stride → 小帧间变化，大 stride → 大帧间变化
			* 训练内三档（small/medium/large），测试扩展 OOD-small/OOD-large
		* IC 复杂度轴：APEBench 生成器参数控制初始场空间复杂度
			* 五档：OOD-simple/simple/medium/complex/OOD-complex
		* 5×5 网格形成四类偏移：Compositional ID（未见过的 in-range 组合）、Dynamic OOD、IC OOD、Joint OOD
			> 水平移动改变动态尺度而保持 IC 不变；
			> 垂直移动改变 IC 而保持动态尺度不变。
		* 训练混和作为实验变量而非固定背景
			* 三组等量数据，改变简单/均衡/复杂 regime 配比
			* Mix-simple、Mix-balance、Mix-complex
	* 诊断指标 sec3.4
		* PDEBias：模型在 PDE p 上的误差除以该模型所有 PDE 的均值，>1 表示该 PDE 相对更难
		* ShiftDamage：测试 cell 误差 / 同模型同 PDE 的 train-seen cell 均值，衡量相对退化；{_q7kh65}
		* RolloutAmplification：E_roll / E_1-step，分离即时精度和时序稳定性；{_q7kh64}
			* roll 典型选取 10-step
			* （评）E_1 是首步误差不是单步误差，前者输入只考虑动力学初态，后者输入遍历所有非末态
		* PretrainingGain：(scratch_M − ft_M) / scratch_M，配对尺寸比较
		* ModelSizeGain：(ft_S − ft_s) / ft_S，s∈{M,L}，S baseline 衡量缩放收益
	* 主要发现
		* RQ1 物理 regime 偏差：同一模型在 train-seen 条件下，不同 PDE 误差差 1-2 数量级；{_q7kh66}
			* Fisher-KPP 最易（中位数 0.011），Wave/Kolmogorov 最难的几个
			* pretrain 和 scaling 改变误差量级但不消除 PDE 偏好模式
		* RQ2 horizon 依赖：首帧误差与 rollout 误差放大几乎不相关（Spearman ρ=0.04）；{_q7kl5r}
			* Poseidon 首帧最差（0.072）但 rollout 放大最低（2.09×），MORPH 相反（9.11×）
			* （AI 评）所有模型统一按自回归 rollout 评估，尽管 Poseidon 原生以 Δt 作 modulation 输入
				* 设计上可直接预测大 Δt 后状态，不必逐帧迭代；自回归非其最优使用方式
				* 在此不利条件下仍 rollout 最稳，反而更有力
		* RQ3 分布偏移：Dynamic-OOD 比 IC-OOD 严重得多，最高到 8× baseline；{_q7kl1g}
			* pretrain 大模型反而加大 normalized ShiftDamage：
				* scratch 3.24× → L 6.28×，train-seen 提升远大于 OOD 提升
		* RQ4 训练混和：复杂训练数据改善绝对精度，但 OOD 相对 gap 反而拉大（Mix-simple 4.33 → Mix-complex 4.98）{_q7kh63}
			* 数据在重新分配能力而非统一提升
		* RQ5 pretrain + scaling：
			* 37.5% 架构-PDE pair pretrain 负迁移；{_q7kh68}
			* 25% 更大模型劣于 S；{_q7kl88}
			* DPOT 和 Poseidon 在 Fisher-KPP 上严重逆缩放（−173%）
				* 但大模型在其他 PDE 上正向，缩放按 regime 重新分配能力
		* RQ6 失效指纹：各架构因不同机制失败；{_q7kh67}
			* DPOT OOD 最敏感（ShiftDamage 8.66×），MORPH rollout+缩放最不稳，MPP pretrain 负迁移最高（75%）
	* 讨论 sec5
		> 困难情形是有组织的：动态尺度偏移始终困难，
		> 长 horizon 误差在不同架构间增长方式不同，
		> 预训练或缩放可能强化已有 regime 偏好而非消除它。
		> 建议下一步不是扩大数据或规模，而是学物理表征以跨 regime/时间尺度/分布偏移更可靠地迁移
	* （AI 评）评估方法论本身比实验结论更有价值
		* 核心贡献是「把评估维度因子化，让模型能力的条件依赖可诊断」这一设计思想，而非具体的数据结论
		* 对比现有 benchmark：PDEBench/The Well 等提供更多方程但评估仍按平均分
			* PhysBiasBench 的区别：把评估本身当作实验设计，每个轴独立操纵
		* 动态尺度通过时间子采样定义的做法简洁有用：不需要改方程参数，只改数据采样方式就创造 OOD。可迁移到其他 benchmark 设计
		* 局限：只覆盖 2D 规则网格、周期性 BC
			* 统一自回归协议可能不利非自回归设计的模型
				* 如 Poseidon Δt-as-input、GPhyT NeuralODE 输出，自回归不是它们的最优使用方式
			* 对非自回归 PDE 求解（如 PINN、FNO 直接映射）适用性待检验
		* 与 largeNN 中「scaling law 对 AI4Sci 未必适用」的判断一致，提供了系统性实验支撑
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
* LegONet-2603.07882 含时 PDE 算子分裂、各项学独立网络，不同 BC 的网络独立
	* "LegONet: Plug-and-Play Structure-Preserving Neural Operator Blocks for Compositional PDE Learning"
		* Zhang, Jiahao; Wang, Yueqi; Lin, Guang; 
		> created on 2026-03-31
	* 摘要摘录
		> 我们介绍了类似乐高的运算子网络（LegONet），这是一个组合框架，通过定义在共享边界适应谱表示上的即插即用、结构保持的算子块构建偏微分方程求解器。
		> LegONet 将边界处理与机制学习分离，通过构造满足边界条件。
		> 它还将机制学习与时间积分分离，使预训练块能够在无需重新训练的情况下组装成新的求解器。{_q42b25}
		> 我们还推导出有限视距误差分解，将块错配与分裂误差区分开来，并为长视野预测提供机制层面的诊断。
	* BC 仅学齐次的，非齐次情形通过变换化归为齐次情形 eqn(2)-1
		> 对于非齐次边界数据，我们应用一个提升 u=ulift+u0 ，使 u0 得满足齐次约束，
	* 训练、推理方式差异 sec1:-1
		> LegONet 还将培训与部署区分开来。
		> 分组通过系数空间中的瞬时算符匹配离线预训练：我们采 𝐚 样可接受态，评估可信离散化以获得参考目标，并学习每个分组，使得 Fi𝜽(𝐚) 匹配无轨迹拟合的参考机制更新。
		> 部署时，通过选择底板、选择相关块并通过对称斯特朗分割推进所得的简化动力学，创建一个新的偏微分方程实例。
		> 因此，重新配置算符或边界设置变成了选择与组装的问题，而非重新训练的问题。
		> 这种模块化视角也使得长视野行为更具解释性：我们的有限视野分析将滚动错误分为块错配和拆分误差，使失败可以归因于学习机制或组合方案。
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
* 2602.11229 多历史步输入的 PDE 基础模型，下步预测在隐空间由扩散生成
	* "Latent Generative Solvers for Generalizable Long-Term Physics Simulation"
		* Chen, Zituo; Wu, Haixu; Deng, Sili; 
		> created on 2026-02-19
	* sec3.0:1 历史窗口长度固定；物理时间 s，扩散生成时间 t
	* sec3.1 隐空间预测
		> 我们引入了统一的潜在物理表示，协调异构偏微分方程系统，同时提升泛化性和计算效率。
		> 预训练物理变分自编码器（P2VAE）将高维物理态映射 𝐗 到共享的潜空间 𝐱 。
		> 所有动力学预测均在潜空间中进行，解码器仅用于重建和评估。
		> P2VAE 独立于下游求解器训练，并在任务和系统实例间重复使用。
		* 好处
			> 潜空间捕捉了系统不变的动力学结构，同时摒弃了表示特异的冗余，如分辨率和离散化伪影，使得具有相似动态的不同偏微分方程系统能够占据附近的潜在区域，从而提升跨数据集泛化。
			> 潜在状态的维度也明显低于原始场，减少了内存占用，同时加快了训练和推理速度。潜在轨迹可以预先计算和缓存，消除求解器训练中的重复编码，提高长视野自回归学习的效率。
			> 最后，紧凑且连续的潜空间为概率建模提供了自然的基础，使不确定性能够以受控且具有物理意义的方式注入和传播，而非直接施加在原始状态空间中的扰动。
	* 时间金字塔：远期历史信息衰减，通过 token avg-pool；{_q2jb25}
		> 由于自注意力在长历史中的二次复杂性，我们引入了时间金字塔以减少令牌数量，反映了许多偏微分方程系统的近似马尔可夫性质。
		> 对于早期 s ，我们使用下采样（平均池化）潜态来传播物理上下文 c ;得到一个金字塔 FFT（PFFT）。
* CompNO-2601.07384 PDE 基础模型，各项学独立网络块，根据待解方程组合
	* "CompNO: A Novel Foundation Model approach for solving Partial Differential Equations"
		* Hmida, Hamda; Joly, Hsiu-Wen Chang; Mesri, Youssef; 
		> created on 2026-01-26
	* 摘要摘录
		> 最近的科学基础模型（SFM）旨在通过从大量模拟系统中学习通用替代来减轻这种成本，但它们通常依赖于单体架构，解释性有限且预训练成本高昂。
		> 本研究介绍了合成神经算子（Compositional Neural Operators ，简称 CompNO）， 这是一个参数偏微分方程的合成神经算子框架。
			> CompNO 不是在异构数据上预训练单个大型模型，而是先学习一个基础模块库，每个模块是一个参数化的傅里叶神经算子，专门针对一个基本微分算子（例如对流、扩散、非线性对流）。{_q1qa6y}
			> 这些模块随后通过轻量级适应模块组装成任务专用求解器，近似目标偏微分方程的时间演化算子。
		> 专用的边界条件算子在推断时精确地进一步强制执行狄利克雷约束。
		> 我们验证了 PDEBench 套件中的一维对流、扩散、对流-扩散和 Burgers 方程的 CompNO 。
			> 该框架在线性参数系统上相比强基线（PFNO、PDEFormer 及基于上下文学习的模型）实现了更低的相对 L2 误差，同时在非线性 Burgers 流中保持竞争力。
			> 该模型在定义域边界处保持精确的边界满足，且在广泛的佩克莱数和雷诺数范围内展现出鲁棒的推广性。
	* 实验关注 PDEBench 1D，基线包括 PDEformer-1
* 2602.00884 （备用）PDE 基础模型，预训练学多系统网络权重，新系统先近似为已知系统的组合、再算子分裂预测
	* "Test-time Generalization for Physics through Neural Operator Splitting"
		* Serrano, Louis; Han, Jiequn; Oyallon, Edouard; Ho, Shirley; Morel, Rudy; 
		> created on 2026-02-19
	* 摘要摘录
		> 神经算子在学习偏微分方程（PDE）解图方面表现出潜力，但当测试输入超出训练分布时，如新初始条件、未见偏微分方程系数或未见物理，神经算符常难以推广。
		> 以往的研究通过大规模多重物理预训练和微调来解决这一限制，但仍需参考新动力学中的实例，未能实现真正的零射普推广。
		> 本研究提出一种在测试时增强泛化的方法，即无需修改预训练权重。
		> 基于 DISCO，该词典提供了跨不同动力学训练的神经算符词典，我们引入了一种神经算符拆分策略，在测试时会搜索训练算符的组合以近似未见的动态。
		> 在参数外推和物理现象新组合等具有挑战性的非分布任务中，我们的方法实现了最先进的零测向推广结果，同时能够恢复底层偏微分方程参数。
		> 这些结果强调了测试时间计算作为构建灵活、组合性和可推广神经算子的关键途径。
* DISCO-2504.19496 多步历史输入的 PDE 基础模型，通过超网络生成小网络参数；{_q1ng1t}
	* "DISCO: learning to DISCover an evolution Operator for multi-physics-agnostic prediction", ICML 2025, by 韩劼群
		* Morel, Rudy; Han, Jiequn; Oyallon, Edouard; 
		> created on 2026-01-23
* （备用）PDE 基础模型综述（目前仅 GitHub 版本）
	* [2026-01-23](https://mp.weixin.qq.com/s/3eM__xzyDGD-m-l9Q0Pwlg)
		* [GitHub](https://github.com/small-dumpling/Foundation-Neural-Operators-A-Survey)
	* 摘要
		> 本综述分析了预训练在建模范式、数据生态系统和适应方法三大核心领域的影响。
		> 引入一种与离散化无关的分类法，将预训练范式划分为四个主要目标类别，并评估符号条件和物理约束的作用。
		> 我们还整理了基础NO数据生态系统，包括大规模PDE语料库、标准化格式以及预测、逆问题、控制和实际应用任务套件。
		> 此外，还讨论了面向部署的优化策略，重点关注参数高效、稀疏和物理信息引导的适应方法。
		> 最后，指出数据标准化、物理一致性和工业规模化等持续面临的挑战。
	* 先前综述不足
		> 然而，现有的唯一综述[Zhou et al., 2024b] 仍主要是经验性的，基准测试特定策略，未建立理论分类，也未充分解决数据生态系统和下游部署的复杂性。
		> 因此，该领域缺乏对多样预训练目标的系统化分类，也未充分应对将大规模模型适应特定物理约束的工程挑战，亟需一个统一的框架以指导未来发展。
	* 分类方案
		> 这项调研通过建立一个对 PDE 基础模型的表示不变的分类体系，超越了特定离散化方案，为文献做出了独特贡献。
		> 如图1所示，我们将预训练范式分为四个目标类别：有监督条件算子回归 、自监督重建与潜在演化 、生成算子学习  和元推理与上下文学习 。
		> 此外，我们沿着规范条件  和物理注入  两个正交轴分析模型。
		> 我们还回顾了基础 NO 数据生态系统从标准准确率指标  到复杂多物理场和仿真到现实基准  的演变。
		> 最后，研究还涵盖了部署技术，重点介绍高效微调（PEFT）方法，如 F-Adapter 、可扩展的专家混合（MoE）架构  和物理约束适应 。
		> 此外，还分析了复杂场景中的泛化能力，包括分布外（OOD）泛化 、跨物理场迁移  和逆问题鲁棒性 ，以确保推理过程中的物理一致性和可靠性。
	> 是否可以根据学习原则而非实现细节对这些方法进行组织？
		> 为此，我们引入两个互补的轴，如图2所示。
		> 第一个轴，条件对象，指预测的目标变量。
			> 它将确定性算子学习（预测唯一解）与概率方法区分开来。
			> 概率方法预测给定输入条件下的可能解场的分布。
		> 第二个轴，目标类别，将方法按训练目标分组，包括似然回归、掩码重建、得分匹配和元推理。
		> 这两个轴共同为比较预训练范式提供了一个表示不变的基础，独立于架构选择或离散化方案。
	* （评）这个微信推送可能没经过认真复核：某个描述看起来像我们的 PDEFoundry-2 但引的是别人的文章，其中考察的是 LLM 写 NPDE 求解格式
		> 通过随机零系数在八种通用偏微分方程形式中生成大量数据集，尽管可能产生非物理方程。
* 2511.20455 （备用）CFD 的 scaling law，似有领域需求综述性质；Poseidon 组与 NVIDIA 合作
	* "Fluid Intelligence: A Forward Look on AI Foundation Models in Computational Fluid Dynamics"
		* Ashton, Neil; Brandstetter, Johannes; Mishra, Siddhartha; 
		> created on 2026-01-15
	* 摘要摘录
		> 本文通过将工业规模的 CFD 模拟拆解为其核心组成部分，弥合了机器学习与计算流体力学（CFD）领域之间的鸿沟。
		> 我们的主要贡献是提出首个将计算流体力学输入纳入数据生成和模型训练的尺度定律，以概述开发和部署这些下一代人工智能模型以应对复杂流体力学问题的独特挑战。
		> 利用我们的新缩放定律，我们建立了大规模极限的定量估计，区分了数据生成成本为总计算主导因素的区域与以模型训练成本为主的区域。
		> 我们得出结论，高保真度瞬态数据的纳入为基础模型提供了最佳路径。
		> 我们用具体数字来约束理论，首次公开估算构建计算流体力学基础模型的计算成本和时间。
	* sec2 CFD 计算过程概述
		* sec2.3.1 概述数据类型，稳态、瞬态、时间平均
	* sec3.2 eqn(9) CFD NO 输入，几何、几何预处理、IC/BC、网格（拓扑、分辨率）、物理模型（如湍流模型）、数值离散
		* 后两个变量离散，前面的连续
	* 训练瓶颈，compute/memory bound；PDE 求解时还涉及 data/train bound
	* sec5:1 网络输入包括仿真配置，包括湍流模型、数值方法
		> 这些数据不仅包括连续体输入，如初始/边界条件、域几何等，还包括类别变量，即底层物理（湍流）模型和网格离散化/数值方法等。
	* 数据比较了 用低保真 RANS、高保真 LES
* PDE-FM-2511.21861 PDE 基础模型，TheWell 预训练，PDE 泛化通过逐个训针对性输入层
	* "Towards a Foundation Model for Partial Differential Equations Across Physics Domains"
		* Soares, Eduardo; Brazil, Emilio Vital; Shirasuna, Victor; de Carvalho, Breno W. S. R.; Malossi, Cristiano; 
		> created on 2026-01-14
	* eqn(1)-1 dataset-specific 1x1 adapters, 输出 shared latent channel budget；{_q1ec4k}
* XNN-2510.13665 PDE 基础模型支持不同维数联训方案，卷积、池化、注意力均遍历所有轴置换
	* "Axial Neural Networks for Dimension-Free Foundation Models"
		* Kim, Hyunsu; Park, Jonggeon; Bruna, Joan; Yang, Hongseok; Lee, Juho; 
		> created on 2025-11-17
	* fig1,2 遍历坐标轴置换的操作，lifting 每次选一轴作汇总中心，注意力类似
	* sec3.1 set-based，eqn(12) 求和遍历所有轴，每轴轮换、对末轴操作、反轮换
		* 包括 Conv1D+Pool，注意力；{_pbha90}
		* eqn(13) Conv2D 也可用，每次选两轴
	* sec3.2 graph-based
		* eqn(15) 对坐标轴有类似 DeepSet 的操作
	* sec5.2 实验，基于 MPP 修改得 X-MPP，另有（仿 MPP 所用基线）X-CViT
		* 数据集：PDEBench，PDEArena
		* 1D 处理：p9:-1 zero-padding（> 为啥不是 repeat）
		* 跨维数迁移：p10:2 2D 预训练，1D、3D 微调；{_pbhb0l}
		* 各维数联合预训练 tbl2
