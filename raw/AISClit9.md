* STCast-2509.25210 全球骨干按月份分专家，区域细化用地理先验从全球取信息
	* "STCast: Adaptive Boundary Alignment for Global and Regional Weather Forecasting", CVPR 2026
		* Hao Chen; Tao Han; Jie Zhang; Song Guo; Lei Bai;
		* HKUST，上海 AI lab
		> created on 2026-08-20 by Codex + GPT-5.6-Terra-high
	* 方法全称：Spatial-Temporal Weather Forecasting
	* 训练两阶段：先训含 TMoE 的全球骨干，区域阶段仅训 SAA、冻结其余主结构，再融合全球区域特征
		* 状态更新：$X_g^{t+1}=\Phi_g(X_g^t)$，$X_r^{t+1}=\Phi_r(X_r^t,X_g^t)$（sec3.1）
	* 数据：ERA5 1979--2019；全球 70 变量、$1.4^\circ$，东亚区域 5 个地表变量、$0.25^\circ$（appendix，Dataset Details）
	* 区域受全球影响范围：SAA 跨尺度融合模块不预设相邻扩张区，而是给全部全球位置到目标区域的注意力加距离先验
		* 几何先验：按经纬向弧长构造区域外距近似，区域内权重为 1，区域外 $f(d)=\exp(-\alpha d^2)$（eqn1--4）
		* 融合记号：原文令全球特征作 $Q,K$，区域特征作 $V$，以 $f(d)$ 调制线性交叉注意力，复杂度 $O(n)$（eqn5）{_q8mh2j}
		* （AI 评）原文称该融合输出区域预测，eqn(5) 却未明说输出 token 的排布，复现时需对照实现确认
		* 训练：每个 SAA block 将初始 $f(d)$ 与注意力图逐元素相乘，训练中细化远程影响（sec3.2）
		* 消融：10 日区域 normalized RMSE 以 Xavier uniform 替代距离先验初始化，$0.4921\to0.7192$（table2）
		> SAA 将可训练的先验分布用于引导优化，并逐步细化以捕获全球与区域大气型之间的潜在相关性。（sec3.2）
		* （AI 评）这里的边界不是数值 PDE 的界面条件，而是跨尺度信息选择核；适合学远程耦合，不能替代通量连续性或边界稳定性约束
	* 输入月份已知时分配专家：TMoE 用月份的环状邻近关系约束 Top-K MoE router
		* 路由先验：以输入时刻月份为峰值的可学习环状离散高斯，编码为 $M$；{_q8mi4t}
		* 路由得分：eqn(7) 写 $I=\operatorname{Softmax}(\operatorname{Conv}(X^t)+M)$，文字却说 index 与 $M$ 拼接
			* （AI 评）原文 concat/add 不一致，复现应以代码为准
		* （AI 评）高斯只偏置相邻月份共享专家，不保证 Top-K 专家集合重合
		* 消融：12 专家、高斯编码比同数 one-hot 月份编码的全球 10 日 normalized RMSE 低 $0.0148$，参数同为 654.8M（table4）{_q8mi4d}
		* （AI 评）仅当标签在推理时可得且标签距离可信，才能迁移到其他周期或有序条件；环状只适于周期条件
	* 实验范围：区域预报只验证东亚，区域阶段仅训 SAA（sec4.1，appendix，Implementation Details）
		* （AI 评）空间泛化：全球区域分布能否跨目标区域、跨气候带复用没有证据
		* （AI 评）冻结主干排除了全球表征随区域目标共同适配，结果仅验证固定全球特征上的信息选择
	* [公众号报道](https://mp.weixin.qq.com/s/I5gTxXLGa2hTwGDJEk9-Xg)
* AI流体综述，湍流闭式、ROM、控制，多相状态表示与燃烧反应代理，按流型组织的综述索引
	* "Intelligent fluid flows: A survey of deep learning methods for turbulent flows, multiphase flows, and combustion", Neurocomputing 2026
		* Sidharth S. Menon; Mahdi Lavari; Amelia Kokernak; Joel Mathew; Charulatha A. Jagtap; Jagannath Jayachandran; Aswin Gnanaskandan; Ameya D. Jagtap;
		* WPI, Brown Univ
		> created on 2026-08-20 by Codex + GPT-5.6-Terra-high
	* 定位：PINN、算子学习、混合模型、生成模型在三类流动中的应用索引
		> 先介绍 PINN、算子学习、混合建模和生成模型，再讨论湍流、多相流和燃烧中的应用。（Abstract）
	* 按方法找工作：PINN、算子学习、混合模型、生成模型均须在下列三流型任务下回查
	* 湍流工作：闭式、ROM、主动控制和多尺度质量
		> 湍流部分涵盖闭式建模、降阶模型和主动流动控制。（Abstract）
		* 查 RANS 闭式：例，以流动状态预测 Reynolds 应力，补全平均方程的未解析应力项
		* 查 ROM、控制：原文将其列为湍流应用任务，具体模型设计须回查所引原始工作
		* （AI 评）查多尺度质量：评估、训练与物理标度分开
			* 评估：频带误差查误差的尺度分布，能谱查能量的尺度分布，流动统计量查统计一致性
			* （AI 评）训练：谱感知损失或正阶 $H^s$ 损失可提高高频误差权重
			* （AI 评）存在惯性区间时，Kolmogorov 标度可作统计诊断，不能替代解误差或守恒检查
		* （AI 评）应用部分按流型组织，跨体系复用时应回到“补何种缺失映射”框架
	* 多相工作：按状态表示与预测任务比较
		* 连续界面表示：界面追踪或相场法，处理不可混溶相的界面演化；{_q8mg8k}
		* 分散相对象：液滴、颗粒、气泡动力学，先核查其状态是否适合连续界面表示；{_q8mg8i}
		* 场重建任务：预测高保真流场，不等同于选择界面状态表示
		* （AI 评）比较原始工作时再核查界面演化约束，不能由“多相流”标签判断可迁移性
	* 燃烧代理：化学动力学代理与反问题
		* 代理任务：以流场状态预测反应源项或化学演化，降低昂贵子过程的求解成本；{_q8mh0c}
		* 反问题任务：据观测反推反应相关参数，不能直接等同于源项代理；{_q8mh0j}
		* （AI 评）迁移时仍分别核查闭式耦合稳定性与化学刚性、守恒
	* （AI 评）跨流型选可迁移工作：分别比较缺失映射、状态表示和子过程代理，勿把流型名称当方法类别
	* [公众号报道](https://mp.weixin.qq.com/s/KuYXQiHhSxA602Vz92nigA)
* 2604.23528 有限配点 PINN 的低残差假解，靠伪时间差商+重采样揭露
	* "When PINNs Go Wrong: Pseudo-Time Stepping Against Spurious Solutions"
		* Sifan Wang; Shawn Koohy; Yiping Lu; Paris Perdikaris;
		* Yale; UPenn; Northwestern
		> created on 2026-08-20 by Codex + GPT-5.6-Terra-high
	* 方法全称：Adaptive pseudo-time stepping
	* 定位：PINN loss 失效归因+自适应伪时间训练法
	* 低训练残差却解错：有限 collocation 的经验残差可把物理解与伪解并列为全局极小 sec2.2
		* 固定点伪解：各训练点邻域贴真解或零解，其余位置可退成平凡解，经验 PDE、IC、齐次 BC 项均为零 thm2.1；{_q8me9g}
		* 随机重采样不自动排除：特设宽 $h$ 的过渡层使新增点 PDE loss 的期望仍为 $O(h^{-1})$，优化未降到该尺度仍会漏掉 sec2.2, rmk2.2
		* （AI 评）论文未给 $h$ 与 batch 数的覆盖准则，只说明随机抽样本身不能保证排除这类窄层伪解
		* （AI 评）伪解存在无需诉诸条件数或梯度冲突，实际训练会否吸入它仍可与谱偏置、参数化和优化病理耦合
		> 固定有限 collocation set 上的经验 PINN loss 可有对应平凡或伪解的许多不同全局极小。sec2.2, thm2.1
	* 伪时间残差：让伪解在新点上暴露，而非仅把原 loss 优化得更好 sec2.3；{_q8mf0y}
		* loss：$L_{pts}=\mathbb {E}_x|[u_\theta-u_{k-1}]/\tau+\mathcal {R}[u_\theta]|^2$，BC、IC 项不变 eqn(2.38)
		* 训练闭环：冻结 $u_{k-1}$，当前参数对该 loss 做一步更新得 $u_k$，下一步再冻结新 $u_k$ sec2.3, alg1
		* 角标含义：$k$ 是训练中的人工伪时间，不是含时 PDE 的物理时间 $t$ sec2.3, rem2.4
		* 新配置点上的 interior loss 期望：特设伪解经显式一步更新后从 $O(h^{-1})$ 变 $O(h^{-1}+\tau^2h^{-3})$ thm2.5
		* 固定点反而可得更小训练 loss 却预测更差，重采样版 loss 较大却逼近真解 fig2--3
		* 证明用显式伪时间更新展示放大，实际训练最小化的是隐式松弛 loss，前者只是机制代理 sec2.3
		* （AI 评）gPINN 以空间或时间残差导数抑制尖峰，这里依赖前一模型改残差、再重采样使窄缺陷可见，代价是保存前一模型
	* 无真解选伪时间步：以输出到残差的局部变化率替代调参 sec2.4；{_q8mf19}
		* 大 $\tau$ 更强地暴露缺陷，却会使松弛目标难稳；不同 $\tau$ 的训练 loss 可近似、相对 $L^2$ error 却差很多 fig5
		* 符号：$e^k=u^k-u^*$，$J_*$ 是解处 residual Jacobian
		* 理想松弛迭代：$e^k\approx(I+\tau J_*)^{-1}e^{k-1}$ eqn(2.54--2.57)
		* 该局部收缩条件只给选 $\tau$ 的动机，实际估计器不恢复全谱也不保证稳定
		* 同一新批次：$\Delta u=u_k-u_{k-1}$，$\Delta r=\mathcal {R}[u_k]-\mathcal {R}[u_{k-1}]$
		* 不显式求 $J$：$\widehat\tau=\gamma\|\Delta u\|_2/(\|\Delta r\|_2+\epsilon)$ eqn(2.62--2.65)
		* 两个时间尺度：每个 iteration 重采样，$\tau$ 每 1000 iteration 更新
		* 选步稳定化：EMA 平滑，后期按 residual 降幅 cosine shrink $\gamma$ sec2.4, fig9
		* 方程组：按残差分量各设 $\tau$ sec2.4
		* （AI 评）这是解空间残差算子的方向刚性估计，不是参数优化器的自适应学习率，两点比值只见当前方向
		* （AI 评）$\Delta u$ 很小、随机批次噪声大或 $J$ 强非正规时估计会不稳，$\epsilon$、EMA、间隔更新只是工程缓冲
	* 强基线下仍有效：10 个含激波、混沌、反应扩散与高 Re 流的前向 PINN benchmark 均优于基线，且优于所测步长网格内最优固定 $\tau$ table1
		* 基线已含 PirateNet、因果训练、自适应 loss weighting、SOAP，伪时间是与这些组件叠加的残差改法 sec3
		* （AI 评）伪解定理只处理代表性齐次构造，实验显示净增益但未直接测过渡层残差，不能把所有改善都归给该机制
	* 复现数据：GitHub `sifanexisted/jaxpi2` 公开各 benchmark 的参考解文件与 PINN 代码，2026-08-20 核验
		* 例：方腔流 `ldc_Re100.mat` 至 `ldc_Re5000.mat`，Rayleigh--Taylor `rayleigh_taylor.npy`
		* 参考解由 Chebfun、PyClaw、SU2、JAX-Fluids、IncompressibleNavierStokes 等生成 appC，仓库未见对应传统求解器脚本
* 2604.16721 （备用）已知常参 PDE 区间外推，状态先编码，末层稀疏组合状态项和含参项
	* "Late Fusion Neural Operators for Extrapolation Across Parameter Space in Partial Differential Equations"
		* Eva van Tegelen; Taniya Kapoor; George A.K. van Voorn; Peter van Heijster; Ioannis N. Athanasiadis;
		* Wageningen University & Research
		> created on 2026-08-20 by Codex + GPT-5.6-Terra-high
	* 方法全称：Late Fusion Neural Operator
	* 参数外推，意图避免状态特征混入参数效应：$u_t\mapsto h$，再以 $(h,\beta)$ 给出状态增量 $\delta u$
		* 推理，严格单步自回归：$\delta u=\Theta(h(u_t),\beta)\Xi$，$u_{t+\Delta t}=u_t+\delta u$，无额外历史窗口或测试时微调
		* 结构定义，$h_j$、$\delta u$ 都是网格场，$\Theta$ 在各点列候选项，$\Xi$ 对候选项加权。eq5-8
		* 分工，状态编码器输出供候选库组合的隐特征，参数不作为其输入通道
		* 导数类比，$h$ 可视作数值格式中导数和非线性交互中间量的类比，未获显式物理命名。sec3, sec6
		* 参数作用，$\Theta$ 枚举 $h_j$、$\beta_i h_j$、多项式等候选项，$\Xi$ 在末层决定其贡献
		> 经典数值格式先由当前状态近似空间导数，再把导数和方程参数结合以近似时间导数；这里仿照该二阶段结构，但不提供方程形式或导数。sec3
		* 适用边界，参数在一条轨迹内恒定，实验均用固定 $\Delta t$ 的单步更新再 rollout。sec4
		* （AI 评）若参数作用难由候选库覆盖，或刚性和长 rollout 使累积误差主导，尚无实证支持
		* （AI 评）参数只经可分组的输出库影响增量，可检查贡献是否符合已知参数依赖，不等于已验证 $h$ 解耦
	* 训练，以稀疏正则抑制候选项在训练区间拟合：数据 MSE 加 $\lambda_{\rm sparse}\lVert\Xi\rVert_1$，检验其外推影响
		* 库复杂时外推更依赖 $\lambda_{\rm sparse}$，对流消融中最小的 6 项库最好，较大库的 seed 方差也更大。sec5.3
		* （AI 评）库是人为给出的参数和隐特征交互 ansatz，稀疏性并不使隐状态自动成为导数或方程项
	* 设计约束与机制检查，判断参数是否只作用于对应过程：拆分 $\Theta\Xi$ 的含参和无参贡献，再对照已知 PDE 结构
		* 对流的参数相关贡献近似空间导数，参数无关贡献近零；二维反应扩散中 $k$ 只直接作用的 $u$ 方程保留含参贡献。sec5.5
		* （AI 评）透明分组不保证物理语义，需在多输入、参数和 seed 下量化各组与目标过程的对应稳定性，尚未恢复符号方程
	* 评测，控制 FNO 骨干来比较整套参数化方案：对流、Burgers、一维和二维反应扩散重采参数，设训练和区间外测试
		* 同一 FNO backbone 下，四个方程的 ID、OD RMSE 都优于参数作输入通道的 FNO 和 CAPE-FNO。table2
		* 难度，对流速度 $(0,0.5)\to(0.5,1)$，Burgers 黏性 $(0.01,0.02)\to(0,0.01)$；一维、二维反应扩散也在扩散或 $k$ 上外推。table1
		* 对流 CNO 上也有同方向收益，支持接口可迁移到该骨干的该任务。sec5.4
		* （AI 评）主对比同时改输出头、候选库和稀疏正则，缺少只移动参数注入位置的消融，不能单独归因于后置融合
		* （AI 评）实验不给模型方程式，却用已知合成 PDE 的项复杂度定制库；尚未验证同一库或自动选库能否兼顾覆盖与外推
	* 数据，参数外推基准：公开仓库含 1D 对流、Burgers、1D 和 2D 反应扩散的 train、ID test、OD test `.pt` 文件
		* 公开位置：`https://github.com/evantegelen/LateFusionNeuralOperator`。sec4, Data Availability
		* 可复现性，截至 2026-08-20 所查默认分支含训练、评测、模型、配置和预处理，未见原始 PDE 轨迹生成脚本
* CHONKNORIS-2511.19980 （备用）解 PDE 靠残差迭代算子，所涉 Newton 逆正规因子学出
	* "Operator Learning at Machine Precision", JCP 2026
		* Aras Bacho; Aleksei G. Sorokin; Xianjin Yang; Théo Bourdais; Edoardo Calvello; Matthieu Darcy; Alexander Hsu; Bamdad Hosseini; Houman Owhadi;
		* Caltech; Illinois Tech; UW
		> created on 2026-08-14 by Codex + GPT-5.6-Sol-high
	* 方法全称：Cholesky Newton--Kantorovich Neural Operator Residual Iterative System
	* 前提—方程已知：依赖残差、Jacobian 与伴随作用，是学习型非精确 Newton 求解器，不替代黑箱 NO
	* 推理—按误差预算换算力：显式算残差、Jacobian 与伴随作用，保留线搜索与停止准则，只学习逆算子应用（sec2.4, alg1）
		* CHONKNORIS 映射：输入 $(u,v_n,\lambda_n)$，每轮重新输出三角因子 $R_n$
			* 监督目标：$R_nR_n^T\approx(J_n^*J_n+\lambda_n I)^{-1}$，$J_n=\partial_v\mathcal F(u,v_n)$（eqn9）
		* 迭代更新：$r_n=\mathcal F(u,v_n)$，$v_{n+1}=v_n-\alpha_nR_nR_n^TJ_n^*r_n$（eqn11）
		* 步长与正则化：线搜索调 $\alpha_n,\lambda_n$，每次试新 $\lambda_n$ 都重新预测 $R_n$（alg1）
		* 停止方式：残差或更新量达到容差才停；收缩预算成立且迭代留在局部域时，增加迭代可继续换精度
		> 选择逼近 $\mathcal Q$ 的 Cholesky 因子以强制正定性，这能稳定学习、保证下降方向、减少参数并支持高效三角求解。（sec2.4）
		* 因子应用：通常预测逆算子因子后相乘；地震实验改为预测正规算子因子后做三角求解（sec3.4.3）
	* 精度与理论失效条件：相对线性化残差保持收缩即可迭代消误差，但保证只在局部成立
		* 误差预算：forcing term $\theta_k\leq\lambda_k/(\lambda_k+\sigma_*^2)+M^2\epsilon_{\lambda_k}$（thm4.2）
			* $\sigma_*$ 是 $J$ 的一致最小奇异值，$M$ 控制 $\|J\|$，$\epsilon_{\lambda_k}$ 是代理算子误差
		* 收敛阶：固定 $\theta<1$ 至少线性；$\lambda_k,\epsilon_{\lambda_k}\to0$ 得超线性（cor4.3）
			* 二次收敛条件：$\theta_k=O(\|\mathcal F(v_k)\|)$
		* 理论前提：局部球内 $J$ 一致可逆、Lipschitz 且所有迭代留在球内，不能直接替一般病态反问题兜底（assump4.1）
		* （AI 评）标题精度归因应放在求解器闭环而非代理精度：网络只提供足够好的下降度量，精度由残差反馈与迭代预算产生
	* 训练—近似覆盖预期访问状态：用精确 NK 前若干步轨迹 $(u,v_k)$ 生成 Cholesky 标签，避免在整个函数空间采样（sec2.4, alg1）
		* 多正则化训练：同一轨迹状态可配多个 $\lambda$ 生成标签，使推理能随条件数和残差调节正则化
		* （AI 评）理论要求局部球内代理误差受控，训练却只采精确 NK 轨迹；非精确轨迹偏离后没有闭环保证
		* （AI 评）精确求解器仍承担离线标签成本；它省的是同分布重复求解，不是取消传统数值计算
	* 跨 PDE 复用线性化求解能力：FONKNORIS 用 $J$ 的微分系数函数替换上述映射输入，每步仍接回同一 Newton 闭环（sec2.5）
		* 一维实例输入 $(a_n,b_n,c_n,\lambda_n)$，前三项表示 $a_n\partial_{xx}+b_n\partial_x+c_n$，输出 $R_n$（eqn12--15）
		* 跨 PDE 外推：nested Kriging 加权聚合 elliptic、Burgers、Darcy 三个 GP 专家的因子预测，再测未训练方程（sec3.3）
		> FONKNORIS 学习从 Fréchet 导数的系数函数到其 Tikhonov 正则化逆算子 Cholesky 因子的映射。（sec2.5）
		* （AI 评）可迁移要素是 Jacobian 系数族上的近似逆，不是 foundation model 标签；证据仅含一维局部二阶 PDE、同网格与相近系数分布
	* 大规模因子压缩依据：max-min 排序揭示秩结构且使因子条目随空间距离衰减，据此截断可得稀疏不完全 Cholesky（appC）
		* （AI 评）输出尺寸仍随网格增长且绑定离散化，附录的近线性稀疏复杂度尚未在大规模实验兑现
	* 收敛代价与失效实例：误差均相对同一离散 NK 参考解衡量，难例靠大量迭代，粗糙介质参数网格细化后失效
		* 前向：elliptic 常约 10 步；Darcy 需 1000 步才有 95% 测试例达到机器精度（sec3.2.4）
		* 反问题：Calderón 跑 $10^3$ 步后超过 75% 测试例达到机器精度，wave scattering 约 40 步（sec3.4.4）
		* 地震反演：$5^2,7^2,10^2$ 参数网格误差为 $2.0\times10^{-14},3.0\times10^{-12},1.2\times10^{-3}$（table1）
		* （AI 评）报告的是相对同一离散 NK 参考解的代数误差；网格离散误差、模型误差与反问题可辨识性没有随之降到机器精度
	* 复现数据：代码仓库给出实验 notebook、参数与 FWI 生成脚本，没有打包的预生成数据文件（sec6, GitHub 文件树）
		* （AI 评）更准确的公开状态是合成数据可由代码复现；OpenFWI 是外部已有数据集，不是新数据贡献
	* [公众号报道](https://mp.weixin.qq.com/s/_L0FyHgstTbaOg0RfD14pQ)
* NN-SM 谱方法+NN 混合求解设计综述：按解表示、残差离散、子域分工三个非互斥层面组织网络与谱组件；模态量只辅助筛查频谱异常
	* "Integrating Spectral Methods with Neural Network Architectures: A Review of Hybrid Approaches to Solving Differential Equation", Archives of Computational Methods in Engineering 2026
		* Yolande Vanelle Ngueabou; Shina Daniel Oloniiju;
		* Rhodes Univ
		> created on 2026-08-13 by Codex + GPT-5.6-Sol-high
	* 方法全称：hybrid neural network-spectral method
	* 定位：系统综述 27 项 NN-SM 工作，另用 Bratu 方程对照 PINN 与 Chebyshev 配点法
	* （AI 评）按耦合层面比按架构、谱耦合、训练策略并列，更易定位可复用的设计选择
	* 三个非互斥耦合层面：可单独采用，也可在同一求解器中组合
		* 构造解表示：谱基作固定输出基底，或由网络按 PDE 解族生成
			* 固定输出基底：网络预测谱系数，既可拟合单实例，也可学习输入到系数的算子
				> $u_\theta(x)=\sum_k\alpha_k(\theta)\phi_k(x)$，$\phi_k$ 为固定谱基。eqn(29)
				* 单实例中直接优化 $\alpha_k$；解族学习中由网络按输入参数 $\xi$ 预测 $\hat u_k(\xi)$。eqn(42)
			* 复杂域或局部结构下经典全局基难选：从 PDE 解族学习候选函数空间
				* 实现：DeepONet trunk 候选函数 → SVD 筛选与正交化 → 层次基 → Galerkin 推进 sec8.3
				* 在线求解：训练好的 DeepONet 只供基；文中案例由 Galerkin 推进到网络训练时间区间外
		* 计算 PDE 残差：谱离散可替代高阶空间 AD，并在特定条件下减少物理域求积
			* 避高阶空间 AD：配点处采网络输出，谱微分矩阵算空间导数，权重梯度仍走 BP
				* CD-PINN 用 Chebyshev 配点；适合低维光滑解与规则域，结果对多项式阶数敏感 sec8.5；{_q8ef5u}
			* 改写物理域求积：网络预测正交基系数，用 Parseval 把残差范数转到谱域
				> $L_{\mathrm{spectral}}=\sum_k|\hat R_k(\theta)|^2$，$\hat R_k$ 为 PDE 残差的谱系数。eqn(43)
				* 仅当微分算子在系数域有简单表示时，原文才主张其计算更高效 sec4.3
				* （AI 评）变系数或非线性项仍可能需要卷积、伪谱变换或求积，并处理 aliasing
		* 子域分工与接口耦合：按观测可用性分配网络与传统求解器，NeuroSEM sec8.6
			* 区域分解：含稀疏或噪声观测的局部区域、无数据的主体区域
			* 算法分配：局部区用 PINN 同化稀疏噪声 PIV，主体区用 Nektar++ 谱元法；{_q8ef1l}
			* 在线耦合：PINN 连续预测单向供给谱元区界面 BC，局部网络不替代整个高精度求解器
			* （AI 评）综述未交代界面通量约束、双向反馈或误差传播，不能据此判断耦合稳定性
	* （AI 评）选型边界：学习基受训练解族覆盖限制；谱离散受光滑性、几何与阶数限制；子域法还需界面稳定性证据
	* 三类频谱检查的对象不同，不能都作为解质量证据 sec8.6
		* 有参考解时，逐模态误差定位未学到的频率范围
		* （AI 评）无参考解时，系数衰减停滞只提示欠分辨或训练不足，不能鉴别原因或证明解正确
		* （AI 评）Parseval 跨域能量只检查变换与归一化自洽，错误解也可满足该恒等式
		* （AI 评）原文把谱模态收敛与系数衰减检查称为 cross-validation；这里记作输出质量诊断
	* 真实观测验证稀缺，且综述所列 27 项语料的统计边界存疑
		> 27 项工作中，26 项只用合成数据，仅 NeuroSEM 同时使用真实 PIV 与合成数据。sec8.3
	* 公平比较缺口：多数工作未与传统方法统一比较稳定性、收敛、精度、成本与扩展性 sec9
		> 对 1D Bratu 方程，$C$ 是非线性参数；文中 PINN 相对 $L^2$ 误差为 $10^{-4}$ 量级或更低，谱配点在 $N\geq12$ 时达到机器精度。Table 4-5
		* （AI 评）该实验比较纯 PINN 与纯谱法，不是 NN-SM；也未统一 wall time 与目标误差，不能证明混合方法更优
	* （AI 评）综述适合作概念地图，不宜直接采用其方法分类与统计结论
		* FNO、谱基激活、ELM、PINN-SEM 子域耦合解决不同层级问题，Table 6 的横向类别不是正交设计轴
		* sec6.4.1 声称排除 preprint，Ref. [34] 却明确列作 arXiv preprint，27 项语料的统计边界难复现
	* 原文主张令两项误差相当，可配平谱模态数 $N$ 与网络宽度 $n$
		> $\|u-u_{\mathrm{hybrid}}\|_2\leq\|u-u_N\|_2+\|u_N-u_{\mathrm{hybrid}}\|_2$。eqn(45)
		* 原文令谱截断误差 $e^{-\beta N}$ 与神经网络逼近误差 $n^{-1/2}$ 相当，得 $n\sim e^{2\beta N}$
	* （AI 评）容量配平失效：NN 误差界常数依赖目标 $u_N$ 并随 $N$ 变化，eqn(45) 不能直接作设计规则
	* （AI 评）术语歧义：把 truncation error 写成 spectral bias，易与 NN 的低频优先学习混淆
	* 可复现资料：综述未发布数据集或代码；Bratu 数据运行时生成，PIV 数据来自被综述工作。Data/Code Availability
	* [公众号报道](https://mp.weixin.qq.com/s/AS91sItJ_nit7AGvs3eZ5g)
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
