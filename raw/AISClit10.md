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
* SuperMeshNet-2605.09284 超分辨率半监督学习：辅助网络据二 LR 输入预测其 HR 差，对无标签样本罚主辅模型预测差
	* "Semi-Supervised Neural Super-Resolution for Mesh-Based Simulations", ICML 2026
		* Jiyeon Kim; Youngjoon Hong; Won-Yong Shin;
		* 延世大学；首尔大学
		> created on 2026-08-01 by OpenCode + deepseek-v4-flash
	* 方法全称：SuperMeshNet
	* 推理方式：部署只用主网络 $F:u_l\mapsto u_h$，输入 LR 解加节点坐标作节点特征，输出 HR 解
		* F_θ 结构：encoder → LR 处理器(MPNN) → 上采样到 HR 网格 → HR 处理器(MPNN) → decoder
			* 上采样双路径相加：kNN 插值粗估计加潜表示上采样精修，网络只学细部差异；{_q82710}
	* 辅助网络 $G:(u_l^r,u_l^s)\mapsto u_h^r-u_h^s$，仅训练引入
		* 细节—网格差异：二样本可能几何结构不同，网格也不同
		* 网格统一，通过样本插值：用 kNN 插值（有引文）将 s 到与 r 相同网格，再算二者之差 eqn(2)；{_q82c43}
	* 架构—归纳偏置：节点级 & 消息级中心化，MPNN 层内节点嵌入或聚合消息减全局均值
		> （sec1）为了进一步提升基于网格的超分辨率算法的性能，我们根据实证观察结果，为 MPNNs 引入了各种引导性机制。
			> 具体而言，我们采用了两种与 MPNN 架构无关的引导性机制：节点级中心化和消息级中心化。
			> 节点级中心化是通过从每个节点的嵌入向量中减去所有节点嵌入向量的全局平均值来实现的；
			> 而消息级中心化则是对聚合后的消息进行类似的处理。
			* eqn(11,12)
		* （评）“中心化”是 centering 不是 centralize，指减均值，而非与“去中心化”相对
			* 这里似乎分别对应 InstanceNorm（作者说是 LayerNorm 可能因为误解术语含义）和 BatchNorm，差别在于只减去均值，不做后续的幅值归一化
		* 效果：平滑 loss landscape（同 BN 的解释），超分辨跨 6 种 MPNN 一致提升（sec3.6）
		* 适用条件：仅当任务不依赖输入全局均值时有效，超分辨、涡度预测、节点分类有益，预测场范数 $\|u\|_2$ 有害（secI.3）{_q82805}
		* 对照：纯中心化优于完整 LayerNorm/BN，方差缩放与可学习 scale/shift 不必要（secI.3.4）{_q82812}
		* （AI 评）中心化与 NO 去 LayerNorm 的既有记录同向，都指向不依赖全局尺度信息的任务可用纯中心化
	* 训练方式 fig3：互补学习，F_θ 与 G_φ 联合训练互监督
		* 监督学习，用数据 $(u_l^r,u_h^r),(u_l^s,u_h^s)$ eqn(6)
		* 半监督学习，用数据 $(u_l^r,u_h^r),(u_l^p,/)$ eqn(7,8)
			* 训练依据：二网络预测的 $u_h^p$ 一致，相应 loss $\|u_h^r+G(u_l^p,u_l^r)-F(u_l^p)\|$
				* 后文 secI.12.3 据此主动学习，二网络预测结果差异大时 算真实 HR 解
			* （评）原文写法是 $F,G$ 分别为另一网络提供伪标签
				* 相当于同一个 loss（其中二项涉及可学网络）用两次，每次对一项 stop-grad 向另一项 BP
				* 我认为等价且更直接的做法：loss 只用一次，同时对二项 BP
			* （评）naive 做法是 $G$ 仅用数据训、为 $F$ 提供伪标签，$F$ 不再给 $G$ 伪标签
				* 该方案下训练可分二阶段，先 $G$ 后 $F$
				* 原文方案（$G$ 额外用 $F$ 伪标签）可能好处：扩大可用样本量
					* 不担心伪标签误导：互补学习机制（见下），$F$ 归纳偏置、误差模式不同于 $G$；{_q81m7r}
		* 网格失配：两样本节点位置不同不能直接相减，用 kNN 插值投影到同一网格（附录D）
		* （AI 评）伪标签误差有放大阈值，每步 loss 都含配对真标签项锚定，可抑制误差累积（secI.13）
		* （AI 评）互补学习是 co-training 的任务分解版，按预测目标分解而非按特征分组，误差去相关机制不同
	* 互补学习机制：两模型预测不同目标使误差去相关，伪标签信息量高于同目标双模型；对照 Mean-Teacher/UCVME 同目标双模型伪标签高度相似（sec3.5）{_q82b3h}
		* 前提：数据集对同一 PDE 取不同参数 μ 生成多个解，不同 μ 样本的网格几何不同（节点位置不同）
		* 主模型 F_θ 学单样本 LR→HR 映射（inter-resolution）
		* 辅助模型 G_φ 从两样本 LR 预测其 HR 解之差 u_h^r − u_h^s（intra-resolution，r/s 为不同 μ 样本，eqn2）
			* 物理意义：两 HR 解同 PDE 仅参数 μ 不同，其差即解对参数扰动的响应（sec2.2.2）
		* （AI 评）误差去相关的根基 critique：两模型共享 encoder（省训练成本）会重新引入误差相关；不共享 encoder 精度更高但训练贵约 3 倍（secI.2.1）
	* 数据：3 FEM 加 3 CFD 公开，GitHub 仓库含 Google Drive 下载链接与生成代码
		* FEM（FEniCSx 生成）：
			* 线性弹性 von Mises-力角度、线性弹性 von Mises-孔形状、{_q82f9u}
			* Poisson 电场-孔形状；{_q82g0z}
			* LR 约 333-388 节点，HR 约 4000；{_q82g08}
		* CFD：
			* OpenFOAM 摩托车骑手 RANS 真实几何、{_q82g17}
			* OpenFOAM 圆柱绕流含时、{_q82g1i}
			* JAX-CFD Kolmogorov 湍流涡度，Kochkov 风格（HR 1024² 谱网格，LR 32²）{_q82g1n}
		* 实验还在现成 BlastNet 2.0 数据上验证可扩展性（secI.6.2）
	* 真标签生成时选样本，主动学习等 secI.12
		* 均匀分配：有 HR 标签的那 20 个样本分布 应匹配 全体 200 LR 样本分布 secI.12.2
			* 分布差异度量：maximum mean discrepancy (MMD) 最大平均差异
			* 分布匹配度、最终网络精度 正相关性；{_q82a6w}
				> 如表 34 所示，最大平均差异值与均方根误差之间存在很强的相关性：那些更符合整体低分辨率样本分布的子集，其均方根误差更低。
			* HR 样本选取方式：最小化 MMD，用贪心算法，所谓“核群聚算法”；{_q82a32}
				> 最小化 MMD 的贪婪采样方法（即“核群聚算法”（Chen 等人，2010 年））
				> 首先从 200 个候选样本中随机选择一个高分辨率样本，
				> 然后迭代地选择下一个能够最大程度降低所选子集与完整低分辨率数据集之间的 MMD 的高分辨率样本。
				> 这种做法确保了所选高分辨率样本能够很好地代表整个数据集。
		* 主动学习，基于 $F,G$ 二模型伪标签差异，选差别大的样本算 HR secI.12.3
			> 我们研究了一种基于不一致性的主动学习策略：该策略根据主模型 Fθ 和辅助模型 Gϕ 生成的伪标签之间的差异来选择高价值样本。{_q82a7o}
			> 训练过程始于第一轮：此时，使用 MMD 最小化策略选出 10 个高价值样本。
			> 此后，每轮训练都会再选择一个高价值样本，具体方法是从当前候选样本中选出不一致性损失最大的那个样本，直到高价值样本的总数达到 20 个。{_q82a8r}
			> 如表 35 所示，基于不一致性的主动学习方式比随机抽样方式更能提升性能。
		* 组合使用：在 MMD 建议样本内再选伪标签差异最大的 secI.12.3
			> 我们还测试了一种混合策略，即将基于不一致性的主动学习与基于 MMD 的样本选择方法相结合。
			> 具体而言，在主动学习过程中，首先选出 MMD 值最小的 10 个候选样本，
			> 然后再从这 10 个样本中选出不一致性最大的那个样本作为高价值样本。{_q82f1l}
			> 混合策略的均方根误差最低，这说明将基于不一致性的选择方式与考虑数据分布的抽样方式相结合，能够更有效地获取 HR 数据。
		* RMSE 从大到小 tbl35：1. 随机选，2. 前十 MMD 后十每个按伪标签差异，3. 全 MMD，4. 前十 MMD、后十每个为“MMD 前 10 中伪标签差异最大”；{_q82f32}
	* （AI 评）未配对 LR 恒可低成本大量生成，互补学习是数据生成昂贵场景下数据效率的通用路线，不限于超分辨，代价是训练时间高于全监督
	* （评）大致手段链：学映射← （资源层）半监督
		* ← 造伪标签← 整合多模型输出← 给出多个模型预测← 保多样性← 辅网络用异质形式← 辅网络用带参考样本映射
		* ← 造真标签← 选样本
			* ← 训前选样本← 据全样本中代表性← 二分布距离极小化
				* ← 分布距离定义← MMD
				* ← 极小化算法← 贪心
			* ← 训中选样本← 兼顾预设、动态标准
				* ← 预设标准（同上）← 据全样本中代表性
				* ← 动态标准← 误差估计← UQ数值
					* ← 预测值分布← ensemble多网络分别预测
						* ← 主网络 F
						* ← 辅助网络 G
					* ← 分布转不确定度数值← （二点等概率分布情形）二点距离度量（同训练所用互监督 loss）
				* ← 兼顾策略← 标准叠加← 预设标准列前10、动态标准从中选最佳
		* ← 训练方式（略）
* MetaColloc-2605.12368 PDE 免训练求解：元学习基函数字典，测试时冻结、配点矩阵最小二乘定系数（线性单次、非线性迭代）；但训练目标与算子用途错配，高频失稳
	* "MetaColloc: Optimization-Free PDE Solving via Meta-Learned Basis Functions"
		* Zichuan Yang;
		* 同济
		> created on 2026-08-01 by OpenCode + deepseek-v4-flash
	* 方法全称：MetaColloc（Meta-learned Collocation，元学习配点法）
	* 相对已有方法：是 ELM（随机基函数+最小二乘）的元学习版，相对 PINO 免测试时微调
	* 推理方式：冻结基函数网络，PDE 求解降为线性代数（线性单次、非线性迭代数次）
		* 网络输出 H 个基函数 Φ(x)，解表达为 u(x)=Φ(x)w，测试时唯一未知量是系数 w
		* 线性 PDE：散点过网络得基函数值，forward-mode AD 求导数，组装 collocation 矩阵
			* 内部矩阵 Aeq：算子作用在基函数上，强制满足内部方程
			* 边界矩阵 Abd：基函数值或方向导数满足 BC；堆叠后最小二乘一步解 w（sec3.4）
		* 非线性 PDE：Newton-Raphson 在函数空间线性化算子，逐次解线性系统 Δw=lstsq(A,-R)，5~8 次迭代（sec3.5）
		* 复杂几何与混合 BC（Neumann/Robin）零重训：训练在单位方形上，测试换域仅需重采散点（secB.4，L-shape 与 annulus）
		* 规模与速度：H=128~1024，采 2000 内点+300 边界点，测试约 1.3s（附录 A、B.5）
	* 双分支架构：原始坐标 MLP + 多尺度 Fourier 特征，对抗 spectral bias（sec3.2）
		* 低频分支：原始坐标过 SwiGLU MLP，表达光滑宏观结构
		* 高频分支：输入先做多尺度正弦编码（固定轴对齐频率 1~128），再过 SwiGLU，表达高频振荡
		* 消融（sec4.1）：low-only 光滑好、高频崩；high-only 反之；双分支平衡最佳，且都远胜随机基函数
	* 训练方式：多尺度高斯随机场（GRF）上元学习基函数，内层 lstsq、外层梯度更新（sec3.3）
		* 每个任务=对随机函数做基底表达拟合：解 w=lstsq(Φθ(X),Y)、算 MSE、AdamW 更新 θ（Algorithm 1）
		* GRF 三模式（Appendix C）：RBF 光滑 40%、高频 40%（中心频率 10~300、带宽 1~15 振荡）、混合 20%
		* 选 GRF 依据：样本路径光滑性由相关核尺度控制，覆盖光滑与高频两种形状
		* 训练完全无物理数据：data-free，测试问题由解析给定的源项 f 与边界值 g 定义，解的约束由此隐式进入（sec3.4）
	* 失效分析：operator-function mismatch，函数值拟合好≠算子下稳定（sec5）
		* 频率扫描：高频时 RMSE(u) 小但 RMSE(Δu) 大 3~5 个数量级，基函数在算子作用下剧烈抖动；{_q81f0t}
		* 排除条件数（cond≈10⁹ 好坏解不变）与浮点精度（FP32+FP64 与全 FP64 同结果），归因于 function-only 元训练目标（secB.1）
		* 论文提出的改进方向：operator-aware meta-learning，离线阶段就把「基函数在关心的算子下稳定」加进目标，测试流程不变
		* 实证：高频 Helmholtz（k=64π）多数方法失效（RMSE≈0.5），GP-HM 略优但需 4500s；MetaColloc 精度亦受限，3200 散点 1.3s 换速度
	* （AI 评）借鉴价值
		* operator-function mismatch 对学基底再在线求解类框架（PINO、CROM、ROM 解码器）都是潜在坑，训练目标必须匹配下游算子用途
		* 归因是否过硬：排除 cond 与浮点精度只说明非这两者所致，但 collocation 最小二乘在算子高频下是否本就病态（换基底也一样），训练目标匹配真能救吗
* CATO-2605.09016 轴向注意力中 RoPE 相对坐标改由学得 chart 给出，应对坐标几何与解结构不匹配；稳态解有标签时，以梯度双头压局部过平滑
	* "CATO: Charted Attention for Neural PDE Operators"
		* Chun-Wun Cheng; Sifan Wang; Carola-Bibiane Schönlieb; Angelica I. Aviles-Rivero
		* Cambridge DAMTP, Yale IFDS, 清华丘成桐数学科学中心
		> created on 2026-07-31 by OpenCode + GPT-5.6-terra
	* 方法全称：Charted Axial Transformer Operator
	* 定位：神经算子的几何感知架构改进，用学习 chart 改写轴向注意力的位置几何
	* 适用几何：原坐标与解的相对距离结构不匹配，直接把坐标送入位置编码会误导轴内注意力
		* 推理坐标：网格点物理坐标 $x=(x,y)$ 经 $\zeta=\Phi_{\rm chart}(x)=(\xi,\eta)$ 映为连续二维 chart，不要求可逆
		* 推理分组：结构化网格原有的行、列 token 分组不变，$\xi$ 只作行内 RoPE 位置变量，$\eta$ 只作列内变量；{_q81007}
			* 局部补偿：depthwise 加 pointwise 卷积并联，补轴向全局交互不擅长的局部 stencil
		* （AI 评）这仍是位置编码层，不重排 token 或重建交互拓扑
			* 有效性归因不一定是几何对齐，也可能仅来自新增的可学习位置表示，现有消融不足以分开二者
			* Geo-FNO 的形变服务于让 FNO 处理不规则几何，这里服务于让轴向分解贴近算子的低秩方向
			* 二者不能只按都有 deformation 合并
		> 合适坐标中，解算子可沿坐标方向近似分离，学习 chart 后轴向注意力可高效逼近这种结构。
		> 原文 §3.1、§3.3
	* 训练监督：仅为稳态 PDE，主头 $\hat u$ 外再预测梯度代理 $\hat q$
		* 参考导数：依赖带坐标网格的中心差分和局部 $2\times 2$ 线性系统，不是自动微分 PDE residual
		* 值监督：$\mathcal {L}_{\rm val}$ 令 $\hat u\approx u$
		* 导数监督：$\mathcal {L}_{\rm grad}$ 令 $\nabla\hat u\approx\nabla u$
		* 双头监督：$\mathcal {L}_{\rm flux}$ 令 $\hat q\approx\nabla u$
		* 自洽约束：$\mathcal {L}_{\rm cons}$ 令 $\hat q\approx\nabla\hat u$；{_q81c3t}
		* （AI 评）名字叫 physical loss，但训练信号来自 $\nabla u$ 真值，归类应是有监督导数匹配
			* 价值在于让辅助头与主头可导出的物理量相容，不是新增无监督物理约束
		> 联合值、梯度、辅助通量及通量和预测梯度的一致性，以提高局部结构保真度。
		> 原文 §3.2
	* 点云变体：没有可定义的行列轴时保留 chart，换成 KNN 局部聚合和全局不规则注意力
		* （AI 评）chart 是可复用的表示层，轴向注意力只是规则或结构化网格上的一项 interaction 选择
			* 若 chart 未使邻域关系或有效秩变简单，CATO-PC 不会从同一机制获益
	* 实验范围：Darcy、Navier-Stokes、Airfoil、Pipe、Plasticity、Elasticity，覆盖规则网格、结构化网格和点云
		* 效果：六个基准均优于比较方法，原文 §4
		* （AI 评）结果能支持在这些数据上 chart 有用，尚不能支持 chart 对任意复杂几何都能产生可分坐标
			* 论文也没有公开 CATO 代码或权重，复现须自行实现
* NEST-2605.12343 静态 3D 超弹性大域不重训全域 NO，改训最小局部 solver，再经 Schwarz 迭代传递块间位移，组装全局一致解
	* "Neural-Schwarz Tiling for Geometry-Universal PDE Solving at Scale"
		* Paolo Secchi；Daniel S. Balint；Marco Maurizi；
		* Imperial College London；Italian Institute of Artificial Intelligence
		> created on 2026-07-31 by OpenCode + GPT-5.6-Terra
	* 方法全称：Neural-Schwarz Tiling
	* 定位：神经局部求解器嵌入区域分解，不是新的全域 NO 架构
	* 双 GNO：位移 GNO 迭代解全局位移，梯度 GNO 在收敛后恢复导数
	* 推理：位移图神经算子 GNO 不直接负责全局解，反复充当重叠块上的 Dirichlet 解算器；{_q7vn5b}
		* 输入：3×3×3 体素 patch 的二值实体几何和 patch 边界位移
			* 周围一层 cell 提供重叠缓冲，中心 cell 是唯一可作非平凡局部更新的内部 cell，sec4.1
		* 通信：外边界取给定 $g$，内部边界取上轮全局位移 $u^{(n)}$，sec4.2 eqn(11)
		* 组装：重叠处各 patch 预测以权重和为 1 的单位分解 $\chi_p$ 加权，再迭代至收敛，
			* $u^{(n+1)}=\sum_p\chi_p\hat u_p^{(n+1)}$，sec4.2 eqn(12)-(13)
		> 通过重叠区域交换接口信息，局部解逐步与彼此及全局边界条件一致，sec4.2
	* 训练：局部 solver 要见过推理时可能接到的多尺度接口数据，不能只拟合小域边界
		* 几何：面连通的活动 cell 集随机取样，允许孔洞，不允许空集和仅中心 cell，sec4.1 eqn(6)
		* 边界：多尺度随机场以 zoom $\zeta$ 在随机偏移处截取长度 $1/\zeta$ 的窗口，sec4.1 eqn(7)
			* 大结构内的局部块会接到更陡或更缓的接口位移，zoom 在训练时模拟这类分布
			* （AI 评）这不是普通数据增强，目标是补训练边界和 Schwarz 接口之间的分布缺口
		* 监督：FEniCS 生成 15,000 个几何和边界条件配对的局部 neo-Hookean 解，
			* 位移 GNO 加梯度 MSE 约束导数一致性，梯度 GNO 直接用梯度 MSE，sec4.1
	* 导数恢复：位移收敛后另跑梯度 GNO，不对 $\hat u$ 数值微分
		* 同一 patch 几何和收敛位移作输入，以同一单位分解单次组装；只演示 $\nabla u_{11}$，sec4.1-4.2
		* （AI 评）把迭代求解和易放大误差的导数恢复解耦，适合应力为下游目标的情形
			* 但完整应力或应变张量需多个输出分量，成本和误差耦合未验证
	* 证据边界：只证明最小块可拼接所测 3D 超弹性几何，不证明几何或 PDE 普适
		* 测试为 SimJEB 支架和合成 TPMS，均是体素化固体，分辨率至 $60^3$，sec5.1
		* 只处理全 Dirichlet 的可压缩 neo-Hookean 静态平衡，sec3、4.2
		* （AI 评）材料参数或 PDE 类别变化仍要重训局部 solver，未展示跨物理复用
		* （AI 评）无非线性 Schwarz 收敛或误差理论，单次不做 Schwarz 耦合时误差显著增大
	* 复现：自建局部数据与 NEST 代码均未公开
		* SimJEB 是公开测试几何，TPMS、FEniCS 生成脚本、权重和训练数据均未发布
* Iso-FNO-2605.02597 FNO 频域核反映 D4（2D 方形旋转反射）对称性
	* "Isotropic Fourier Neural Operators"
		* Michael F. Staddon
		* Independent Researcher
		> created on 2026-07-31 by OpenCode + GPT-5.6-terra
	* 方法全称：Isotropic Fourier Neural Operator
	* 论文定位：FNO Fourier 层的轻量 D4 等变参数化，对照 R-FNO 的径向核约束、G-FNO 的 activation 群增广和群卷积
	* 方法：将 D4 作用转成 Fourier 核的权重绑定，再由种子参数生成完整核；{_q7vg94}
		* 对称约束：频点通道矩阵 $R_{k,l}$ 在 x、y 反射下满足 $R_{k,l}=R_{-k,l}=R_{k,-l}$
		* 坐标交换约束：$R_{k,l}=R_{l,k}$
			> x 反射要求 $R_{k,l}=R_{-k,l}$，而实值输入输出要求对应 Fourier 项互为复共轭，因此核参数为实数。论文 §III
		* 核生成：只训独立频率轨道的实值种子 $R^{iso}$，前传时经反射、转置补全完整核
		* （AI 评）群生成元对应参数相等关系，故等变性和压缩是同一硬约束的两面
	* 验证：2D Darcy flow，16 modes、32 channels，参数从 4.202M 降至 0.565M。table1
		* 等变检验：训练样本作 x、y 翻转或转置，Iso-FNO 的 $L_2$ 误差仍等于原训练误差 0.00436，标准 FNO 约为 0.018。table1
	* （AI 评）局限
		* 归因边界：训练误差更高，测试改善也可能来自减参正则化，不能单独归因于对称归纳偏置
		* 比较边界：只比较标准 FNO，未直比 R-FNO、G-FNO
		* 构造边界：仅标量场、二维 D4 有完整构造，3D、向量场和球面 FNO 均无实验
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
