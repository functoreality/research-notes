> 2022-07-27 从 AISC.md 分裂出来
* HiNOTE-2405.12202 用于物理场超分辨率的 NO
	* "Hierarchical Neural Operator Transformer with Learnable Frequency-aware Loss Prior for Arbitrary-scale Super-resolution"
		* Luo, Xihaier; Qian, Xiaoning; Yoon, Byung-Jun; 
		> created on 2024-08-05
	* sec3.2 eqn(2) 整体架构形如 $D\circ S\circ E$，其中 sampler $S$ 不包含可训练参数
	* sec3.3 编码器 $E$ 输入低分辨率物理场、输出隐向量
		* 混合上采样模块，同时包含卷积上采样（捕捉空间局部信息）和（别人提出的）Fourier 上采样（捕捉全局特征）{_o8fe3x}
			* fig1 Fourier 上采样实现，以 2D 为例，矩形切 4 份、填充到大矩形的 4 个角
		* 建议将上采样模块放在网络输入位置，而非（像往常超分辨模型那样）输出位置
	* sec3.4 sampler $S$，feature map 从网格点插值到任意点：query point 找在 grid 中的矩形小区域，对其 4 顶点 feature 加权平均，权重系数为小矩形相对面积；{_o8fe5a}
	* sec3.5 解码器 $D$ 为 NO，包括初始 lifting 层、多层 kernel 积分、投影到解空间
		* kernel 积分用了 Galerkin-type 自注意力
		* sec3.5.1 提到通过输入层上采样避免（可能由非线性激活等引入的）aliasing，引了之前别人的论文（> 针对 PDE 的 CNN，不是我之前知道的那篇讨论等变性的）{_o8fe6f}
* 2407.17616 用低维 PDE（数据便宜）预训练 FFNO 并泛化到高维 PDE
	* "Pretraining a Neural Operator in Lower Dimensions"
		* Hemmasian, AmirPouya; Farimani, Amir Barati; 
		> created on 2024-07-29
	* fig1b FFNO 层有点像 Transformer，只是注意力层换成 $\mathcal{K}$，且只做一次残差连接（跨过 $\mathcal{K}$ 和 FFN 层）{_o7ta7k}
		* 正文确实提到受 Transformer 启发
	* fig1d FFNO 中的 $\mathcal{K}$ 算子为逐轴分别作用，各轴作用结果求和；{_o7ta69}
		* eqn(4) $\mathcal{K}(z)=\sum_dIFFT_d(R_d\cdot FFT_d(z))$
		* （评）与 axial attention 可比较
	* sec3 低维训练、高维微调方式
		* 参数可共享：模型只涉及逐点变换和逐轴变换；{_o7tb69}
		* 微调方式：（仿照经典 CV）只训最后一层
			* 好处：训练便宜（BP 无需算到输入端），冻结大多数参数缓解过拟合
		* 最后实验中比较了各种微调方式
			* 纯扩散方程仍是全量微调效果好，甚至只用 4 个、8 个样本都泛化得不错
			* 对流方程上微调模型和 from-scratch 训练效果差异不大（除非样本非常少），只训最后一层的做法效果很差
	* sec4 实验设定，考虑 5 步自回归损失，1D 迁移到 2D；扩散方程效果不错，Advection 相比从头训练没什么提升
* BlastNet 斯坦福大学流体力学开源大模型，包括高精度训练数据集
	* [2024-07-13](https://mp.weixin.qq.com/s/cNeH-bZ9QZB-uI-wMh8YQg)
		* https://blastnet.github.io/
	> 现在数据集有来自30多种不同配置的700多个样本，足够大和多样化；{_o7dl1z}
	> These contributions now include
		> (i) 4.8 TB of high-fidelity simulation datasets that have been processed in a convenient format for ML applications,
		> (ii) >13,000 lines of code that aid the training and evaluating of these models,
		> (iii) >100 pre-trained weights in flow physics problems, and
		> (iv) regular workshop events that disseminate ML for flow physics via seminars and competitions.
* 2406.08473 NO 预训练策略综述、实验比较
	* "Strategies for Pretraining Neural Operators"
		* Zhou, Anthony; Lorsung, Cooper; Hemmasian, AmirPouya; Farimani, Amir Barati; 
		> created on 2024-07-03
	* sec3.1 数据增强
		* 3.1.1 Lie point symmetry
		* 3.1.2 与物理无关的数据增强：加高斯噪声，幅值缩放（对某些非线性 PDE 可能导致物理失真）
			* 注意 CV 中常用的图像裁剪、挖空可能导致不符合物理
			* （评）幅值缩放算一种特殊的 Lie 对称性？从而其实属于前一种
	* sec3.2 预训练策略
		* 3.2.1 CV 中预训练策略：binary 预训练（判断数据是否被打乱时间顺序），对各帧进行正确排序（$\#S_n$-路分类任务）{_o73j9m}
			* 另有空间 shuffle 策略，经验上表现不佳，故本文实验中省略
			* Jigsaw，对打乱的时空 patch 排序；问题 1. 排列数太大，2. 多种 shuffle 方式可能物理上区别不明显
				> 为了缓解这种情况，我们对最大化混洗序列和原始序列之间的汉明距离的前k个混洗排列进行了采样（Noroozi&Favaro，2016）；这确保了模型在预训练期间可以看到不同的样本，同时限制了预训练任务中的类的数量。
		* 3.2.2 PDE 预测策略：根据解预测 PDE 系数；{_o73k0h}
			* 预测物理场的时空导数 $u_x,u_y,u_{xx},u_{yy},u_t$；{_q3af8x}
			* 另有 masked 策略，从部分观测恢复被 mask 掉的部分（> 不理解为什么这分类到 PDE 预测下面）{_o73k0p}
		* 3.2.3 对比学习策略；实验观察到两种方法无明显提升，故实验不包含；{_o73k12}
			* 1. PICL，用 GCL（广义对比损失）对 PDE 数据聚类
			> 2. 使用编码器来对齐李增广或物理不变的潜在PDE样本
* DeltaPhi-2406.09795 NO 不直接学 $a\mapsto u$，而是预测和参考解残差，已知 $(a',u')$ 学 $(a,a')\mapsto u-u'$；{_p8ge86}
	* "DeltaPhi: Learning Physical Trajectory Residual for PDE Solving", NeurIPS 2025
		* Yue, Xihang; Zhu, Linchao; Yang, Yi; 
		> created on 2024-07-01
	* fig1 含时方程预测，输入 1–10 时间步预测 11–20
	* 训练时 $(a,a')$ pair 选择方式：随机采样 $a$，计算所有剩余样本 $a'$ 与 $a$ 的余弦相似度，从相似度前 K 样本中随机选择 $a'$；{_p8gf35}
	* 推理时，对 $a$ 从数据集选择最接近的 $a'$ 作为样本；实验结果，对 $a'$ 选择 robust；{_p8gf3f}
	* sec3.2.5 优势：
		* 缓解分布偏差：针对非混沌系统，$a,a'$ 相似则 $u,u'$ 也相似
		* 缓解过拟合（NN 倾向于记忆训练集，而 $(a,a')$ 联合分布多样性更高）{_p8ge8c}
		* 提供物理先验：辅助样本充当物理先验，有相关参考文献有证实；{_o72k8a}
			> 此外，显式外部存储器允许推理过程中的特定需求，例如处理边界条件和高分辨率样本。
		* fig5 Darcy flow 数据集对 label 做 PCA、绘制 σ 与 3σ 椭圆，可看出传统直接式 NO 的 $\{u\}$ 训练集、测试集分布有一定偏离，本文残差式 NO 训练集分布大于（可覆盖）测试集分布；{_p8gf44}
* DiffusionPDE-2406.17763 （备用）扩散模型建立 a,u 联合分布，从而在 a 只知道部分散点值（不足以完全确定解）的前提下可给出 u 分布；同时用于正反问题
	* "DiffusionPDE: Generative PDE-Solving Under Partial Observation"
		* Huang, Jiahe; Yang, Guandao; Wang, Zichen; Park, Jeong Joon; 
		> created on 2024-06-30
	* fig1 扩散模型推理时同时有 observation guidance、PDE guidance（PDE loss）{_o6uf06}
		* alg1 l14 两种 guidance 都将梯度添加到每步扩散过程中（> 类似 Langevin 采样）
		* fig3 引入 PDE loss 的效果，从图中看起来可提高准确度、消除非物理 pattern；{_o6uf4l}
	* 知道的可以是 a 的部分散点值、u 的部分散点值、或 a,u 皆有，重构完整的 a,u（可生成多个候选解）
		* 包括 fig4 NS 给定初态部分值预测终态，或者（反问题）给定终态预测初值
		* fig4 Burgers 每个时间步有 5 个空间观测，恢复所有时间步的完整解
* CoNO-2406.02597 基于分数阶 Fourier 变换（FrFT）的 FNO
	* "CoNO: Complex Neural Operator for Continous Dynamical Physical Systems"
		* Tiwari, Karn; Krishnan, N M Anoop; Prathosh, A P; 
		> created on 2024-06-30
	* 摘要中认为的 FrFT 优势：善于表示 频率特性随时间变化的 非平稳时空信号；{_o6ua7c}
	* fig1 FrFT 示意图，$\alpha=0,1$ 分别对应时域、频域
	* related work 讨论了 Complex Valued Neural Networks (CVNNs)；{_o6ua6k}
	* eqn(4) 复数的 GeLU 激活即实部虚部分别作用；{_o6ua74}
* CViT-2405.13998
	* (v1) "Bridging Operator Learning and Conditioned Neural Fields: A Unifying Perspective"
		* (v3) "CViT: Continuous Vision Transformer for Operator Learning", ICLR 2025
		* Wang, Sifan; Seidman, Jacob H; Sankaran, Shyam; Wang, Hanwen; Pappas, George J.; Perdikaris, Paris; 
		> created on 2024-06-28
	* fig2(v3-fig8) 试图把 DeepONet，NoMaD，GNO，FNO 用统一的框架表示（没完全看懂）
	* fig3(v3-fig1) 架构
		* 编码器部分，输入场 tokenize 后加时间、位置编码，过 Transformer Encoder
		* INR 输入部分，坐标从 latent grid 插值得隐向量
		* 调制部分，用 Transformer Decoder 汇总两部分信息（坐标隐向量作为 Q）再过 MLP；{_o6sl6f}
* LNO-2303.10528 （备用）NO 架构设计涉及 Laplace 变换、Laurant 级数
	* "LNO: Laplace Neural Operator for Solving Differential Equations", Nature machine intelligence
		* Cao, Qianying; Goswami, Somdatta; Karniadakis, George Em; 
		> created on 2024-06-27，lyp推荐
	* eqn(1) Laplace 变换，“Fourier domain 可视为 Laplace domain 的 slice”；{_o6r94s}
	* eqn(2) 考虑 Laurant 级数，不同于“传统 Laplace 变换只能为几个简单的函数找到解析函数”
* PICL-2401.16327 用对比学习预训练 NO
	* "PICL: Physics Informed Contrastive Learning for Partial Differential Equations"
		* Lorsung, Cooper; Farimani, Amir Barati; 
		> created on 2024-06-24
	* eqn(5) 之前文献已提出的 GCL（generalized contrastive loss），惩罚 $\{z_i\}$ 成对距离，再额外惩罚距离不足 $\tau$ 的样本对之间的接近程度
		* （评）希望各样本比较接近，但相互至少保留 $\tau$ 的距离
	* eqn(1-3) PDE 形式 $u_t+(\alpha u^2+\gamma u-\beta u_x)_x=0$，实际总共 3 种 PDE
	* sec3.2 基于 PDE 系数的相似度度量，$\theta=[\alpha,\beta,\gamma]$，用于计算二方程的相似度（公式略）
	* sec3.3 基于物理的相似度度量，其中涉及 NO 前传结果，如 eqn(7) 二轨迹时间更新幅度的相似程度 $\delta_tu_i-\delta_tu_j$ 以及其他（细节未确认）
	* fig1 训练流程，先做对比预训练得各 sample 的 embedding，再在最终的目标任务上微调；{_o6of13}
		* 微调阶段未冻结权重，因发现不必要
	* 下游任务，sec4.1 时间步 $\{1,10\}\to 50$（不确认是否是 $\{1,\dots,10\}$ 打错了），sec4.2 自回归，输入输出时间步 $[n-9,n]\mapsto n+1$；{_o6of1v}
* 2403.17728 PDE 的 MAE 式训练
	* "Masked Autoencoders are PDE Learners"
		* Zhou, Anthony; Farimani, Amir Barati; 
		> created on 2024-06-23
	* 网络架构 ViT，ViT3D（看引文好像是针对视频的 ViViT）{_o6nf9d}
	* encoder 接后续网络用于下游任务，如接 MLP 判断粘性系数，接 FNO 做时间推进
* DiverseNO-2403.10642
	* "Using Uncertainty Quantification to Characterize and Improve Out-of-Domain Learning for PDEs"
		* Mouli, S. Chandra; Maddix, Danielle C.; Alizadeh, Shima; Gupta, Gaurav; Stuart, Andrew; Mahoney, Michael W.; Wang, Yuyang; 
		> created on 2024-06-22
	* sec4.1 NO UQ 用 ensemble 方式，仅末层参数不同（之前层所有参数共享）以降低推理成本
		* 也可解读为 一个 NO 有 $M$ 个输出头，一次性预测 $M$ 个结果；{_o6ml36}
			* 相比全系综架构，减小推理成本，但多样性有所降低
		* 为鼓励多样化预测，额外惩罚末层 $M$ 组参数间接近程度；{_o6ml2w}
	* sec4.2 Operator-ProbConserv，从 OoD 预测分布中找最符合物理约束（如质量守恒）的解；{_o6mm3u}
		* 具体地，利用 NO 输出估计分布的 $\mu,\Sigma$
		* 在物理约束 $Gy=b$ 下解极小化问题 $\min\|y-\mu\|^2_{\Sigma^{-1}}$ 得预测解 $y$
		* （评）我的理解：UQ 给出解分布的概率密度函数，采用正态分布 ansatz，之后在满足约束的集合上取极大似然作为最终解
		* 最终解 $y$ 有解析表达式
* MPIPN-2403.01132
	* "MPIPN: A Multi Physics-Informed PointNet for solving parametric acoustic-structure systems"
		* Wang, Chu; Wu, Jinhong; Wang, Yanzhi; Zha, Zhijian; Zhou, Qi; 
		> created on 2024-06-22
	> （引言）Kashefi等人[14]设计了一个基于PointNet[13]的框架来求解不规则几何形状上的流体流场。
		> [14] A. Kashefi, D. Rempe, L.J. Guibas, A point-cloud deep learning framework for prediction of fluid flow fields on irregular geometries, Physics of Fluids, 33 (2021). 
	> （引言）Kashefi等人[30]提出了PIPN来求解具有不规则几何形状的多个计算域上的偏微分方程。
		> [30] A. Kashefi, T. Mukerji, Physics-informed PointNet: A deep learning solver for steady-state incompressible flows and thermal fields on multiple sets of irregular geometries, Journal of Computational Physics, 468 (2022) 111510. 
* PIPN-2202.05476 NO 输入区域几何形状（散点过 PointNet），输出该区域上不可压 NS 方程的解，PINN loss 训练
	* "Physics-informed PointNet: A deep learning solver for steady-state incompressible flows and thermal fields on multiple sets of irregular geometries"
		* Kashefi, Ali; Mukerji, Tapan; 
		> created on 2024-06-22, refered by MPIPN
	* fig2 网络架构，区域表达为散点 $\{x_i\}$，$\alpha_i=MLP_1(x_i)$，$\beta=\max_i(MLP_2(\alpha_i))$，$\hat u(x_i)=MLP_3(\alpha_i,\beta)$；{_o6mk80}
	* tbl1 区域形状为挖洞，洞形状：圆，半圆，3/4 圆，正多边形，梯形、矩形、椭圆、十字星等
* 2402.15734 （备用）提高 NO 数据利用率：有监督训练前增加 无监督预训练，后加 上下文学习
	* "Data-Efficient Operator Learning via Unsupervised Pretraining and In-Context Learning"
		* Chen, Wuyang; Song, Jialin; Ren, Pu; Subramanian, Shashank; Morozov, Dmitriy; Mahoney, Michael W.; 
		> created on 2024-06-22
	* sec3.1.1:-2 无监督数据生成，不含时方程求解成本低得多；{_o6mb1m}
	* sec3.1.2 无监督预训练的 proxy tasks，MAE、超分辨率，fig2 基于 mask、blur 后的解重建超分辨率完整解；{_o6mb1c}
	* sec3.1.4 架构用 MAE 里的 ViT，非对称设计（解码器规模小于编码器）；{_o6mb1i}
	* in-context learning 方式未看细节；{_o6mb5w}
* `CoDA-NO-2403.12553`
	* "Pretraining Codomain Attention Neural Operators for Solving Multiphysics PDEs"
		* Rahman, Md Ashiqur; George, Robert Joseph; Elleithy, Mogab; Leibovici, Daniel; Li, Zongyi; Bonev, Boris; White, Colin; Berner, Julius; Yeh, Raymond A.; Kossaifi, Jean; Azizzadenesheli, Kamyar; Anandkumar, Anima; 
		> 2024-03-27 Pf 群 lhu 推荐
	* fig2 为每个场分量添加相应位置编码（variable-specific positional encoding，VSPE）{_o44b4y}
		* fig3 若新方程有新的分量，只需引入新的 VSPE 微调，网络架构无需修改
	* fig 网络架构，各变量由原来的 mesh 变换到均匀的 latent grid，之后在该均匀域上算注意力等，最后从均匀 latent grid 解码到原 mesh；{_p26f2d}
	* fig3 预训练任务与迁移的下游任务 区别较大
		* PDE 设定：前者为纯流体，后者为流固耦合（有两个额外分量）
		* 任务设定：前者为流场补全，后者为时间推进预测
		* 输入输出：前者输入 masked $u,v,p$ 分量、输出 mask 部分预测结果，后者输入 5 分量的当前时间步、预测下一时间步
		* 网络架构：前者 encoder + reconstructor，后者 encoder + predictor
	* p6:r-2 数据集包括流体、流固相互作用，均用 TurtleFSI 包生成；{_o44b34}
		* 流固相互作用为不可压 NS + 弹性体方程
* `Transolver-2402.02366` 基于 Transformer 实现输入网格可变，注意力计算局限于自适应学出的区域之间
	* "Transolver: A Fast Transformer Solver for PDEs on General Geometries"
		* Wu, Haixu; Luo, Huakun; Wang, Haowen; Wang, Jianmin; Long, Mingsheng; 
		* 作者单位为清华软件学院
		> created on 2024-02-12
	* 提出物理注意力，fig3 架构示意图
		* 不是直接对所有网格点算自注意力，而是将 N 点的信息先加权汇总到 M 个 slice，对 M 个 slice 算注意力；{_o2cg04}
			* 优势包括注意力计算复杂度降低为关于 N 线性
		* 两部分权重：slice（从 N 点到 M slice 作为注意力输入），deslice（注意力输出的 M 个 slice 分配给 N 点）
		* slice 权重可学
	* sec3 架构细节
		* eqn(1) 对顶点嵌入 $x_i$ 过可学线性层、softmax 生成权重 $w_{ij}$
		* eqn(2) 用该权重加权平均生成 slice 嵌入向量 $z_j$
			* （评）原来的 softmax 保证 $w_{ij}$ 对 $j$ 求和为 1，这里加权平均是要对 $i$ 求和为 1
		* eqn(4) 注意力得到 $z_j'$，用 $w_{ij}$ 加权求和得 $x_i'$
	* thm3.4 物理注意力等价于可学的积分算子
	* fig1 学出的区域分解示意图，正文提到汽车挡风玻璃、车牌、前灯分到同一区域，直观上合理（因其均与阻力相关）
* Transolver++-2502.02414 （备用）针对多 GPU 并行的架构优化
	* "Transolver++: An Accurate Neural Solver for PDEs on Million-Scale Geometries"
		* Luo, Huakun; Wu, Haixu; Zhou, Hang; Xing, Lanxiang; Di, Yichen; Wang, Jianmin; Long, Mingsheng; 
		> created on 2025-02-16
	* 摘要摘录
		> 基于之前通过Transolver学习物理状态来解决PDE的进展，Transolver++还配备了极其优化的并行框架和局部自适应机制，可以有效地从大量网格点捕获理想的物理状态，成功地解决了在扩大输入网格尺寸时计算和物理学习中的棘手挑战。
		> Transolver++首次将单GPU输入容量增加到百万个缩放点，并能够通过增加GPU以线性复杂度连续缩放输入大小。
	* fig3b 随网格点增加，GPU 通信量为常数，而 DeepSpeed-Ulysses 线性增长、ring attention 超线性增长
* AROMA-2406.02176 无网格 NO，输入散点信息用交叉注意力汇总到固定数目 token，输出用交叉注意力 INR 解码
	* "AROMA: Preserving Spatial Structure for Latent PDE Modeling with Local Neural Fields"
		* Serrano, Louis; Wang, Thomas X; Naour, Etienne Le; Vittaut, Jean-Noël; Gallinari, Patrick; 
		> created on 2024-06-29
	* related work 提到架构与 Transolver 类似，但不像本文针对含时问题设计
	* related work 提到与 UPT-2402.12365 区别：
		> （Alkin等人，2024）最近提出了一种能够在欧拉和拉格朗日（粒子）表示上操作的通用模型。它们通过将来自输入值的信息聚合到通过消息传递从输入网格中选择的“超级节点”上来降低输入维度，同时使用类似感知器的架构执行解码。相反，AROMA在交叉关注的情况下执行隐式空间编码，以编码几何体和聚集观测值。最后，他们的训练涉及复杂的端到端优化，而我们更喜欢两个更容易实现的简单训练步骤。
	* fig1 网络架构
		* M 个 learnable token 作为初始输入
		* 第一个 Transformer 编码几何：Q 为 M 个输入 token，KV 来自输入的散点坐标 $x$（或其位置编码结果 $\gamma(x)$，文中用 Fourier feature）
		* 第二个 Transformer 接收输入场 $a(x)$ 散点值，Q 为上一步输入结果，K 为输入散点坐标，V 为输入场函数值；{_o6tf5w}
		* 之后的 diffusion Transformer 在隐空间时间推进；{_o6tf6n}
		* 最后 INR 解码，通过 cross-attention 机制接收之前解的信息；{_o6tf6z}
	* intro 提到网络架构中有随机性，以提高稳定性、预测准确性
* UPT-2402.12365 无网格 NO，输入散点信息汇总到固定数目 token，输出为 INR 形式
	* "Universal Physics Transformers: A Framework For Efficiently Scaling Neural Operators"
		* Alkin, Benedikt; Fürst, Andreas; Schmid, Simon; Gruber, Lukas; Holzleitner, Markus; Brandstetter, Johannes; 
		> created on 2024-06-30
	* p3 常见 Lagrange 数值格式有三种：离散元，材料点，SPH；本文专注于 SPH；{_o6u964}
		> Roughly speaking, there are three families of Lagrangian schemes: discrete element methods (Cundall & Strack, 1979), material point methods (Sulsky et al., 1994; Brackbill & Ruppel, 1986), and smoothed particle hydrodynamics (SPH) (Gingold & Monaghan, 1977; Lucy, 1977; Monaghan, 1992, 2005).
	* p4:0 本文方法可在多达 4.2M 个输入点上训练；实验之一当中超节点数目 2048
	* fig1 总体架构，任意散点（Eulerian 均匀网格、Lagrange 散点网格）输入编码器得 $n_s$ 个超节点，隐空间时间推进，散点 query 解码；{_o6ua3a}
* `HAMLET-2402.03541` 基于 graph Transformer 实现 NO 输入网格可变，基于交叉注意力 Transformer INR 实现输出任意网格，结合 MLP 时间演化
	* "HAMLET: Graph Transformer Neural Operator for Partial Differential Equations"
		* Bryutkin, Andrey; Huang, Jiahao; Deng, Zhongying; Yang, Guang; Schönlieb, Carola-Bibiane; Aviles-Rivero, Angelica; 
		> created on 2024-02-09
	* 基于 graph Transformer 实现 NO 输入网格可变；{_o29k9q}
		* （评）似乎是只连半径 $r$ 范围内的边，消息传递仅限直接邻域，仅仅是消息传递机制形式类似注意力
	* 基于交叉注意力 Transformer 实现输出任意网格；{_o29l0g}
* `1905.02789` NO 数据生成，随机生成解、据此求源项的做法有数据分布的问题，不如 PDE 残差 loss
	* "Variational training of neural network approximations of solution maps for physical models"
		* Li, Yingzhou; Lu, Jianfeng; Mao, Anqi; 
		> created on 2024-01-28
	* sec1.2 假设 PDE 形如 $Au=f$
		* TD1 随机生成 $f_i$、用传统求解器求 $u_i$
		* TD2 随机生成 $u_i$、求 $f_i$
			* 认为这种做法所得 $f_i$ 分布不同于真实的 $f$ 分布，要获得准确 NO 需拟合整个 $A^{-1}$，这比 TD1 只拟合特定分布内的 $A^{-1}|D_f$ 更难；{_o1s95f}
		* 提出的方法：用 PDE loss $\|f-A(N(f))\|$；{_o1s95r}
			* （评）TD2 相当于 $\|u-N(A(u))\|$
		* fig1 用的称呼 fit-training 和 solve-training
	* sec2.1 算例，$-\nabla\cdot(a(x)\nabla u)=f$，$a(x)$ 为棋盘形分片常数函数，取值 1、10
		* （评）这种情况确实 TD2 容易出问题，$a$ 间断处 $u$ 应满足相应间断条件，随机生成的 $u$ 很容易导致 $a(x)\nabla u$ 也有间断，从而理论上无法再求散度；{_o1s95n}
			* Darcy flow（随机生成 $a,u$ 再求 $f$）也会遇到类似的问题
		* sec2.2 非线性算例，左式再加上 $bu^3$
* `2401.02398` NO 数据生成，不用数值求解器，随机生成解、再计算源项
	* "Generating synthetic data for neural operators", ICLR2024 spotlight
		* Hasani, Erisa; Ward, Rachel A.; 
		> created on 2024-01-21
	* 针对方程 $L_au=f$ 生成 $(a,f)\mapsto u$ 数据：随机生成 $(a,u)$，代入方程得到 $f$；{_o1lk2r}
* 2501.03300 （备用）NO 数据生成，随机生成解，再计算源项、BC 等；实验用 INS 方程
	* "Method of data forward generation with partial differential equations for machine learning modeling in fluid mechanics"
		* Chen, Ruilin; Jin, Xiaowei; Adams, Nikolaus A.; Li, Hui; 
		> created on 2025-01-13
* `IPOT-2312.10975` 基于 Transformer 实现 NO 输入、输出离散点可任意选取
	* "Inducing Point Operator Transformer: A Flexible and Scalable Architecture for Solving PDEs"
		* Lee, Seungjun; Oh, Taeil; 
		> created on 2024-01-13
	* fig1 基于 Transformer 实现 NO 输入、输出离散点可任意选取；{_o1df8g}
	* fig2 含时方程，在隐空间计算时间推进
* `PEDS-2111.05841` 似乎是 NO 与低保真求解器联合使用（只学它与高保真解的误差？），训练数据需求较纯黑箱 NO 减少 100 倍
	* "Physics-enhanced deep surrogates for PDEs", Nature Machine Intelligence
		* Pestourie, Raphaël; Mroueh, Youssef; Rackauckas, Chris; Das, Payel; Johnson, Steven G.; 
		> created on 2023-12-11
	* [中文介绍](https://mp.weixin.qq.com/s/CI9F5lz0sj-qhEbKSptgTA)
		* 文末有发表版本链接
		> 具体来说，提出了低保真、可解释的物理模拟器和神经网络生成器组合，该生成器经过端到端训练，以全局匹配昂贵的高保真数值求解器的输出。
		> 在扩散、反应-扩散和电磁散射模型这三个示例测试用例上的实验表明，物理增强深度代理PEDS 替代项的精度，比数据有限的前馈神经网络集合（大约 10e3训练点），并将训练数据需求至少减少 100 倍，以实现 5% 目标误差。
* `PITT-2305.08757` （备用）将 PDE 形式输入 Transformer，似乎用于 为 NO 的时间迭代误差的修正提供信息
	* "Physics Informed Token Transformer"
		* Lorsung, Cooper; Li, Zijie; Farimani, Amir Barati; 
		> created on 2023-12-01
* `sFNO-2301.11509` FNO 将线性层与 FT 积分算子层分开（实验有明显提升），并引入残差连接、随机深度
	* "Out-of-distributional risk bounds for neural operators with applications to the Helmholtz equation"
		* Benitez, J. Antonio Lara; Furuya, Takashi; Faucher, Florian; Kratsios, Anastasis; Tricoche, Xavier; de Hoop, Maarten V.; 
		> created on 2023-09-17
	* （李宗宜定义的）NO 每层 $\sigma\circ(W+\mathcal{K}+b)$，sNO 换成 $f\circ \sigma\circ(\mathcal{K}+b)$，实验发现相比 NO 有 significant improvement；{_n9me4a}
		* 其中 $f$ 为 MLP
	* sNO+εI 每层 $(I+fN)\circ(I+\sigma(\mathcal{K}+b)N)$，$N$ 为 normalize 层
		* 带 stochastic depth 版本，每层的残差连接以一定概率取消；{_n9me53}
	* fig8 loss landscape 比较，FNO、sFNO、v1、v2；secD.1 有更多图
		> FNO景观的特点是存在一个浅而不规则的褶皱状结构，该结构贯穿整个区域。
		> sFNO和sFNO+εI景观具有显著的相似性，这与表2中所示的相似损失值一致。两者都有一个清晰的、更深的汇聚盆地。
		> 最后，sFNO+εI v2景观表现出类似于FNO景观的褶皱状结构，但其拓扑结构要简单得多，并且中心各向异性盆地是所有考虑的模型中最深的。
* `VIDON-2205.11404` DeepONet 输入散点位置可变
	* "Variable-Input Deep Operator Networks"
		* Prasthofer, Michael; De Ryck, Tim; Mishra, Siddhartha; 
		> created on 2023-08-20
	* eqn(2.2) 输入形如 $\{(x_j,a(x_j))\}$，散点个数 $\le M$
		* branch net 使用 DeepSet 方式处理输入
		* eqn(2.3) 逐点分开过 MLP，得初级特征 $\psi_j=\Psi_c(x_j)+\Psi_v(a(x_j))$；{_n93k49}
		* 中间特征 $v_l=\sum_j\omega_l(\psi_j)\tilde v_l(\psi_j)$，$l\le H$ 文中称为注意力头；{_n93k40}
			* 其中 $\omega_l(\psi_j)=softmax(\tilde\omega_l(\psi_j))_j$ 进行了归一化
			* （评）这里已类似于把 DeepSet 的求和换为平均，只不过是加权平均
* `FNO-DEQ` 稳态 PDE 解可表示为非线性算子不动点，据此将 FNO 改为 DEQ 网络架构
	* "Deep Equilibrium Based Neural Operators for Steady-State PDEs", 
		* ICML2023 Workshop on New Frontiers in Learning, Control, and Dynamical Systems
		* Tanya Marwah * 1 Ashwini Pokle * 1 J. Zico Kolter 1 2 Zachary C. Lipton 1 Jianfeng Lu 3 Andrej Risteski 1
		> created on 2023-08-19
	* def4.4 NO ansatz $Q\circ B\circ\cdots\circ B\circ P$，$B$ 为 $L$ 层 FNO block；平衡点可解析微分
	* 实验，Darcy、不可压 NS 稳态解
	* sec6 一致逼近定理
* `CTFNO-2302.00854` 表达连续时间动力学，超网络输入 $t$、输出为对 FNO $W,R$ 的调制
	* "Learning PDE Solution Operator for Continuous Modeling of Time-Series", 被 ICLR2023 拒稿
		* Park, Yesom; Choi, Jaemoo; Yoon, Changyeon; Song, Chang hoon; Kang, Myungjoo; 
		> created on 2023-08-19
	* eqn(5) FNO 架构使用 $v^+=\sigma(W_l\psi_l(t)v+F^{-1}(\phi_l(t,y)R_l(y)(Fv)))$
		* $\psi_l(t)\in\R^{d_v\times d_v}$，$\phi_l(t):\R^n\to\mathbb{C}$
	* 一致逼近定理，ICLR2023 拒稿意见中认为值得怀疑；且含时 PDE 按一般形式写、但所用 Green 函数按平移不变方式写；且未提供说明该做法（相比迭代式时间推进做法？）有效性的算例
* `OFormer-2205.13671` （备用）基于（逐点）Transformer 的 NO 架构，输入函数、查询位置的采样点均可变
	* "Transformer for Partial Differential Equations' Operator Learning", TMLR2023
		* Li, Zijie; Meidani, Kazem; Farimani, Amir Barati; 
		> created on 2023-08-07
	* 引用了 GalerkinTf（无 softmax 的 Transformer，Fourier、Galerkin 两种角度）
		* eqn(4)-1 GalerkinTf 中用 layer norm，但依据基函数归一化应用 instance norm，本文实验发现后者的效果有少许提升，故全文采用这种架构；{_n9g94q}
			* 注：eqn(6) input encoder 中除了注意力里的 instance norm，原始 Transformer 的 layernorm 仍保留，不像 GalerkinTf 里面去掉了
		* p7 提到 GalerkinTf 将坐标 $x$ concat 到输入特征中，每个注意力头内做隐嵌入，以体现空间位置信息（否则无法体现）；并加了一个 spectral convolution decoder “on top of the attn layers”；{_n9gf1z}
		* 本文做法用 RoPE 编码位置信息，有给公式；并讨论了 2D 版本的 RoPE；{_n9gf5r}
	* fig1 大意，（记 NO $a\mapsto u$）每个坐标点（$a,u$ 的分开）为 Transformer 一个样本点
		* p5 encoder 3 部分：input encoder 输入 $a(x)$，query encoder 输入 $y$，cross-attn 将前者信息传给后者
		* eqn(6) input encoder 先让 $a$ 各个坐标点（$(x_i,a(x_i))$）相互自注意力，即经过 Transformer encoder
			* Transformer 编码器架构有 layernorm¹，其中注意力换为 GalerkinTf 线性注意力（用 instance norm）
				* ¹还提到若 $a,u$ 未归一化，则去掉 layernorm 以使 scaling 可跨层传播；{_n9gg3g}
		* $u$ 的各个查询坐标点产生 $Q$，前传过程中与 $a$ 各点的 $K,V$ 算注意力；包括 query encoder, cross-attn；{_n9ha74}
		* eqn(7) query encoder 首层用 random Fourier projection $\cos,\sin(2\pi YB)$
		* eqn(8) cross attn 只有一层，$K,V$ 用 input encoder 最后一层的激活值计算
			* 注：这里的 $K,V$ 计算所用的投影矩阵可认为是 input encoder 的第 $L+1$ 层的参数
			* 这部分注意力不用 layernorm
		* （评）这种做法似乎有点像原始 Transformer，同时有编码、解码器；只是这里解码器仅一层
		* 之后在隐空间算时间推进，更新各 query point 隐向量的信息
	* p6 时间推进，认为学时间推进算子的做法比一次性预测完整时空解的做法更高效、省参数、容易训练
		* 在隐空间时间推进
* `IAE-Net-2203.05142` （备用；沈佐伟）NO 可变散点离散，且允许输入输出所用散点集不同；利用积分算子构造
	* "IAE-Net: Integral Autoencoders for Discretization-Invariant Learning", JMLR2022
		* Ong, Yong Zheng; Shen, Zuowei; Yang, Haizhao; 
		> created on 2023-08-06
	* 注：以下仅初步看到的东西，未进一步确认理解准确
	* sec2.3.0 整体架构 $f\to a_0\to\cdots\to a_L\to g$；为简便起见，以下讨论仅针对 $f,a_l,g$ 定义域相同（包括维度相同）、使用相同离散网格 $S$ 情形，尽管实际上并非必要
	* sec2.3.1 中间映射拆分 $a\to v\to u\to b$，$a,b$ 均用 $S$（随输入数据而变？），$v,u$ 用固定（不依赖于 $S$）的离散网格 $S_z$，$\#S_z\le\#S$
		* $v\to u$ 用固定尺寸 NN
		* eqn(8) $a\to v$ 由积分变换给出 $v(z)=\int\phi_1(a(x),x,z)a(x)$；$u\to b$ 同理
	* sec2.3.3 fig4 类似 DenseNet 的结构；{_n86k2l}
* `NIO-2301.11167`
	* "Neural Inverse Operators for Solving PDE Inverse Problems", ICML2023
		* Molinaro, Roberto; Yang, Yunan; Engquist, Björn; Mishra, Siddhartha; 
		> created on 2023-07-30
	* 一系列反问题的统一数学框架，包括 EIT、FWI 等；{_n7ul2l}
		* 设内部系数场 $a$，它给出边界观测算子 $\Lambda_a:G(\partial D)\to H(\partial D)$
		* 正问题：$F:A(D)\to L(G(\partial D),H(\partial D))$，$a\mapsto\Lambda_a$
		* 反问题即 $F^{-1}$；其存在唯一性已有理论保证，为“反问题理论的最高成就”，2017 年文章
			* 另有对其 Lipschitz/Hölder 稳定性的证明，甚至（弱）对数稳定性
		* EIT：$-\nabla\cdot(a\nabla u)=0$，DtN map $\Lambda_a:H^{1/2}\to H^{-1/2}$，$A(D)=C^2(D)$
			* $L$ 有界线性算子的空间
			* $F^{-1}$ 良定义、对数稳定性在 2010 年文章证明
		* 散射波反演（inverse wave scattering），$-(\Delta+\omega^2a)u=0$
			* DtN map 同 EIT，$A(D)=L^\infty$
			* $F^{-1}$ 良态、稳定性在 1988 年被证明（针对 Helmholtz）
		* 辐射输运与光学成像（方程涉及 collision term $Q[u]$，出现积分）{_n7ul4r}
			* Albedo 算子 $\Lambda_a:L^1(\Gamma_-)\to L^1(\Gamma_+)$，$A(D)=C(D)$；$L$ 同 EIT（有界线性算子）
			* $F^{-1}$ 的良态性、Lipschitz 稳定性在 2008 年文章有证明
		* 地震波成像（或全波反演 FWI）$u_{tt}+a^2\Delta u=s$，源项可为空间上点源 $s=g(t)\delta(z)$
			* StR（source to receiver）map $\Lambda_a:L^2(D_T)\to L^2(R_T)$，$s\mapsto u|_R$
				* $R\subset\partial D$ 有限集，表示探测器位置
			* $A(D)=L^\infty$；L 同 EIT
			* 有关于其良态性的相关研究
	* （以下架构部分未细看）
	* 基于该算子形式构造的求解算子 ansatz， 利用 $-\Delta$（(N) BC¹）特征值 $\lambda_k$
		* ¹常数通过 $\int_D\phi_k=0$ 确定
		* 特征向量 $\phi_k$ 组成 $L^2(D)$ 正交基、在其下展开有 $u=\sum u_k\phi_k$，$a=\sum a_k\phi_k$
		* 实际操作时截断到充分大 $k$
	* sec3.3 最终设计的架构有多模块；sec3.4 根据各模块形式，最终架构包含 DeepONet、FNO；{_n85f3x}
* `U-FNet-2209.15616` （未确认）U-Net 层用 FNO 增强
	* "Towards Multi-spatiotemporal-scale Generalized PDE Modeling"
		* Gupta, Jayesh K.; Brandstetter, Johannes; 
		> created on 2023-07-23
	* 实验，浅水波方程，数据生成基于开源的 SpeedyWeather.jl；{_n7nf7v}
		* 周期 BC，192×96 均匀网格（球面定义域，x,y 方向共 360°，虽然我不理解为什么 y 方向不是 180°）
	* 源代码仓库里 docs/data_download.md 提到自己生成的数据，可在 HuggingFace 上下载
		* 注：OmniArch 引用本文并称之为 PDEArena；{_o39c1i}
		* 2D 不可压 NS（Φ-Flow 生成）{_o39c0z}
			* 额外粒子密度标量场，看表述可能形如 $D_ts=0$；说是通过浮力项影响速度（> 没给公式）(p7:-2 )
			* BC：速度用齐次 Dirichlet，标量值用齐次 Neumann (secB.4)
		* 浅水波（SpeedyWeather.jl）
		* 3D Maxwell（Python 3D FDTD simulator）{_o39c14}
		* 1D KS（LPSDA 生成）{_o39c1b}
* `Geo-FNO-2207.05209` FNO 输入可扩展到点云等不规则域，通过坐标变换、延拓达到
	* "Fourier Neural Operator with Learned Deformations for PDEs on General Geometries"
		* Li, Zongyi; Huang, Daniel Zhengyu; Liu, Burigede; Anandkumar, Anima; 
		> created on 2023-07-22
	* sec3.1 对不规则物理区域 $D_a$ 引入域变换 $\phi_a:D^c\to D_a$，在 $D^c$ 上跑 FNO；{_n7n90m}
		* 原来的算子定义域、值域均为 $D_a$，变换后均为 $D^c$
		* $\phi_a^{-1}$ 似为可学习映射
	* sec3.3 坐标映射考虑 给定、学习（NN 参化）两种
		* NN 参化 ansatz $\xi=x+f(x,a)$，带 residual，$f$ 初始化为 0 附近
			* 像 INR 一样用正弦特征 $\sin(2^kx)$ 以增强网络表达力；{_n7nf0j}
	* sec3.4 Fourier 延拓：$D_a$ 拓扑不规则时（不与 disk/torus 同胚），域延拓 $D_a\to\bar D_a$；{_n7n91a}
		* 例如弹性问题，定义域为中空正方形，将中空部分补全
		* 该做法对应于传统谱方法的 Fourier continuation 技巧
			* 常规操作为 通过多项式拟合来延拓；{_n7n912}
			* 但算子学习中只需要无视 $D_a$ 以外的 loss 即可
	* 实验，好于 GKN、DeepONet、（直接插值到均匀网格¹的）FNO；{_n7nf1i}
		* ¹（评）和本文延拓做法的区别？Fourier 延拓属于特殊延拓方式？未确认
* `F-FNO-2111.13802` （原记录）Fourier 变换改为 tensor product 版本，用全连接补偿精度损失，可省内存（尤其高维）
	* "Factorized Fourier Neural Operators"
		* Tran, Alasdair; Mathews, Alexander; Xie, Lexing; Ong, Cheng Soon; 
		* factorized FNO，`2021-12-17`(CSImeet2)；不是 FNO 的组做的
	* fig2 对 $x,y$ 的 FT 分开进行、都有相应的 $R$，二者结果求和
* `SFNO-2306.03838` 球面上定义的 FNO，利用球谐函数
	* "Spherical Fourier Neural Operators: Learning Stable Dynamics on the Sphere", ICML2023, by NVIDIA
		* Bonev, Boris; Kurth, Thorsten; Hundt, Christian; Pathak, Jaideep; Baust, Maximilian; Kashinath, Karthik; Anandkumar, Anima; 
		> created on 2023-07-20
	* 摘要：用于大气动力学预测，模拟时间一年（1460 步）；附录提到为 ERA5 数据集
	* 作者同时公开了软件包 torch-harmonics，见 GitHub；{_n7l973}
	* 变换群为 $SO(3)$
	* 球面卷积定义，卷积核 $\kappa\in L^2(S^2)$（不是 $L^2(SO(3))$ 的版本）；在 $SO(3)$ 计算积分
		* 空间域卷积对应频域逐点乘积（频域指标有一些小区别），为先前文献定理
	* fig2 SFNO block 示意图，$u'=u+MLP(MLP(u)+iFT(R(FT(u))))$；{_n7l946}
	* 另一实验，旋转球面上浅水波方程，方程的项包括 Coriolis 力
	* 2023-08-08 CSImeet，导师：这种做法目前不属于我们组的关注范围，我们无需过多关注
		* 数学框架漂亮，不过不太利于工程实现，工程上本来也有更好的解决方案
		* 之前和别人的共识是能变换到规则区域就用针对规则区域的网络
* `G-FNO-2306.05697` （备用）FNO 在频域引入（有限群）等变性
	* "Group Equivariant Fourier Neural Operators for Partial Differential Equations", ICML2023
		* Helwig, Jacob; Zhang, Xuan; Fu, Cong; Kurtin, Jerry; Wojtowytsch, Stephan; Ji, Shuiwang; 
		> created on 2023-07-19
	* fig2 示意图（以 4 角度旋转群为例），FNO 在频域额外引入旋转；{_n7jm21}
	* 注：未细看，不保证理解准确
* `NUNO-2305.18694` （备用）NO 输入场在固定散点上定义，将散点近似为分片均匀网格（KD-tree 构造）再设计架构
	* "NUNO: A General Framework for Learning Parametric PDEs with Non-Uniform Data", ICML2023, by THU-MLP
		* Liu, Songming; Hao, Zhongkai; Ying, Chengyang; Su, Hang; Cheng, Ze; Zhu, Jun; 
		> created on 2023-07-18
	* sec3.2 区域分解目的：原始散点分布 $P$ 近似为 一系列子区域内的均匀分布 $Q$（即 分片均匀网格）{_n7je83}
		* 使用 K-D tree（似为传统 CS 算法）
		* 之后可在各子区域内用均匀格点，并选取网格密度，使格点数近似等于内部原有散点数
* `GNOT-2302.14376` 基于 Transformer 的 NO，处理多类输入（形状、散点取值给出的场、不规则网格），软区域分解处理多尺度（通过 Transformer 逐层引入 MoE）
	* "GNOT: A General Neural Operator Transformer for Operator Learning", ICML2023, by THU-MLP
		* Hao, Zhongkai; Wang, Zhengyi; Su, Hang; Ying, Chengyang; Dong, Yinpeng; Liu, Songming; Cheng, Ze; Song, Jian; Zhu, Jun; 
		> created on 2023-07-17
	* 摘要：几何门控机制，为软区域分解，解决多尺度问题
		* sec3.5 MoE 为 Transformer 提高模型效率、容量的常用技术；{_n7hk73}
		* eqn(11) Transformer 每层的残差连接部分都做一次这样的 MoE；这里各专家权重只依赖于输入，从而在 Transformer 的不同层使用相同权重；{_n7hl62}
	* fig2 Transformer 使网络能同时处理多种输入：向量，形状，函数，边（不规则网格） 等；{_n7hl7p}
		* （评）可用于 PDE 基础模型
		* query points 作为 Transformer 输入，从而属于 INR 架构？
		* sec3.3 边界形状作为输入：若形状由 $N$ 散点刻画，逐点过 MLP 得到 $N$ token 参与注意力
			* 在散点给出取值的函数同理，MLP 输入 $(x_i,a(x_i))$
			* FEM 网格等可将网格顶点、边信息也输入 Transformer
* `LSM-2301.12664` NO 架构：在隐空间建立算子，编码器架构为对多尺度 patch 用 Transformer
	* "Solving High-Dimensional PDEs with Latent Spectral Models", ICML2023, by THU
		* Wu, Haixu; Hu, Tengge; Luo, Huakun; Wang, Jianmin; Long, Mingsheng; 
		> created on 2023-05-12
	* [THUML 公众号报道](https://mp.weixin.qq.com/s/JUN8hLKKIWp_7eG6NOxWBQ)，未讲解分块多尺度部分
	* fig2 整体架构示意图
		* 注：lvy 学长说他看了源码，其实编码阶段有类似 U-Net 的卷积结构，示意图上未体现
	* 注：以下用我的记号 $a(x),u(x)$ 而非原文记号 $x(s),y(s)$
		* 本文似要求 $a,u$ 有相同定义域
	* 对单个 patch 的求解：设置 $C$ 个隐 token
		* 编码：这些 token 作为 Q，函数值 $\{a(x)|x\}$ 作为 KV，注意力得 $C$ token，称为“输入隐令牌”；{_n5d97m}
		* 隐空间求解：$N$ 个基算子（用三角函数构造）的线性组合
		* 解码：“输出隐令牌”作为 KV，$a(x)$ 作为 Q，注意力得 $u(x)$
		* 这里的注意力结果均加上 Q 作为输出，即 注意力仅表示残差
			* （评）因此按解码部分架构，注意力机制表达的其实是 $u(x)-a(x)$；不确定有用性
	* 考虑 PDE 多尺度结构（湍流等），用分块多尺度（patchified multiscale）架构；{_n5da0n}
		* 每个尺度独立维护 $C$ 个隐 token
		* 第 $k$ 尺度的第 $j$ patch 编码得到 $C$ 个输入隐令牌；{_n5d987}
		* 隐空间求解，所有尺度、patch 的所有输入隐令牌同时参与
	* secF 超参数默认 $C=4$（隐令牌数）、$N=24$（隐空间求解用的谱单元个数），经验证对其鲁棒
* `funcPCA-2005.03180`: #NO, #PCA
	* 表达 NO，只需要在相应函数空间做 PCA 后的空间表达映射
	* "Model Reduction And Neural Networks For Parametric PDEs"
	* 要表达算子 $\Psi:X\to Y$，有数据 $\{(x_i,y_i)\}$：这里假设 $X,Y\in\mathsf{Hilb}$
	* 根据 $N$ 数据 $\{x_i\}$ 得到 $X$ 的 PCA 近似 $F_X:X\to\R^{d_x}$ 以及反向的映射 $G_X$，$Y$ 同理
		* PCA 定义：$C_N=\bigoplus x_i\otimes x_i$ 的前 $d_x$ 个特征向量张成子空间，正交投影
		> 若数据 $x_i$ 由观测点上的离散值给出，则基底函数也只能给出离散点上的取值，重建映射 $G_X$ 只映射到离散点取值，需要人为插值才能获得连续定义的函数；
		> $N\gg d$，离散观测点的数目应该也远大于 $d$
	* 最后用 NN 表达 $\R^{d_x}\to\R^{d_y}$ 即可获得算子 $\Psi$ 的近似
	> 以下为最早的批注
	* $\mathcal{H}\in\mathsf{Hilb}$ 根据数据找有限维（$d$ 维）逼近 $V_d=\mathrm{span}\{\phi_i\}$，正交投影，再用 $\R^d$ 上的 NN 表达 $\mathsf{Hilb}(\mathcal{X},\mathcal{Y})$ 的元素
	> p7, $\operatorname{tr}C=\operatorname*{\mathbb{E}}_{u\sim\nu}\left[\operatorname{tr}u\odot u\right]=\operatorname*{\mathbb{E}}\left[\|u\|^2\right]$
	* 相关：`FNOvsDpONet-2111.05512` POD-DeepONet 只对 $Y$ 求 POD，NN（branch-net）表达 $X\to\R^{d_y}$
* `MGKN-2006.09535` 基于 GNN 的 NO，使用 multi-level graph，算子内前传格式类似 U-Net
	* "Multipole Graph Neural Operator for Parametric Partial Differential Equations", Zongyi Li et al.
		> 第一次 AISC 会议 cyy 报告，2023-01-03 补充记录
	* 前序工作 `GKN-2003.03485`
	* 摘要：受经典 multipole 方法启发，提出 multi-level GNN 框架，可在网格细化下泛化；线性复杂度捕获所有范围交互作用，相当于将 GNN 与 kernel 的 multi-resolution 分解统一起来
	* fig1 multi-level graph，以及在其上的 V-cycle
		* （评）V-cycle 相当于 U-Net 的 graph 版本，U-Net 下、上采样对应这里 kernel $K_{(i+1)i},K_{i(i+1)}$，同分辨率复制在这里是用 kernel $K_{ii}$
		* （评）相关框架 ((n5da0x))NO-多尺度架构 
	* fig2 传统快速多极（multipole）分解 $K=K_1+K_2+\cdots+K_L$
		* $K_1$ 对应短程相互作用，高秩但稀疏；$K_L$ 对应长程相互作用，稠密但低秩
	* 本文进一步 $K_3\approx K_{12}K_{23}K_{33}K_{32}K_{21}$ 等
		* 在算子内部，有不同的 $\kappa_{ij}(a(x),a(y),x,y)$ 作卷积核，另有局域卷积的积分半径 $r_{ij}$（$|i-j|\le 1$）
		* 最终给出 $K_{ij}:v_j\mapsto v_i$ 等一系列映射，$v_i$ 指定义于第 $i$ 级 graph 上的 feature
	* （评）似乎相当于说，可将 U-Net 解读为 multipole 分解+V-cycle 近似长程作用？
		* 框架 ((n32b5g))NN架构解读
* `GF-Net-2105.11045`: #PINN/#Green_func
	* PINN 学出椭圆方程的 Green's func；技巧包括高斯核近似 Dirac func，使用网格均匀分配采样点并局部加密
	* "Learning Green’s Functions of Linear Reaction-Diffusion Equations with Application to Fast Numerical Solver"
	* 求解近似的 Green's func $\mathcal{L}G(x,\xi)=\rho(x,\xi)$，剩余两项 loss：(D) BC，对称性
		> 对称性其实可以直接在网络结构设计中体现；
		> 另外似乎可以像 PDE 经典处理那样，选取一个固定的满足 $\mathcal{L}G_1=\delta$ 的函数表达式，PINN 只负责学习残差以满足 (D) BC；这样采样可能也不再需要局部加密
		* 区域分解，对 $\xi$ 划分多个区域，分别训练对应的 PINN，区域间训练独立
	* 采样 $(\xi,x)$：每个区域均匀设置 $\xi$-mesh 的顶点，每个 $\xi$ 周围划分近、中、远区域（按 $L^\infty$ 距离），使用不同的 $x$ 顶点密度
* `flowMap-1910.06948`: #PDE/#time-dependent, #NO, #Fourier
	* 考察含时 PDE，空间用基底展开（Fourier 变换等），学系数的时间演化算子（架构 ResNet）
	* "Data-Driven Deep Learning of Partial Differential Equations in Modal Space"
	* > (mine) 在算子表达上与 FNO 的区别：
		* 这里直接在原空间变换，FNO 作为一般算子框架先升维 $U(X;\R)\to U(X;\R^{d_v})$ 再 FT
			* 一般算子框架见 `reviewNO-2108.08481`
		* 频域变换使用一般 NN（融合频域各点信息），而 FNO 逐点做线性变换（仅在不同分量之间交换信息）
* `FNO-2010.08895`: #parameteric_PDE (#grid-independent), #NO
	* "Fourier Neural Operator for Parametric Partial Differential Equations"
	> 上方 GKN 的同系列工作
	* 概括：问题：函数型参数 $a$ 到解 $u$ 映射；方法：取定 grid 后，$a$ 格点取值经过若干次 FT-变换-IFT 后得到 $u$ 的格点取值
	* NN 表达参数到解的预测 $\mathcal{A}\to\mathcal{U}$
		> 参数是边值、初值等函数形式才方便这么做；上方 ISMO 只试图预测可观测量 $\mathcal{L}$
	* sec2:-1 $D$ 离散化（网络参数与此无关）
		* 似乎网络都是逐点作用 sec3:1 "local"
		* or spectral domain 逐点作用 eqn(5)
		* 离散化只在 FT 时起作用，因此离散点取值、基底展开形式的离散化都可用；
		> 最开始的升维操作 $a\mapsto v$ 使用 NN 进行逐点或逐系数的变换，其合理性要求离散化映射 $\mathcal{A}\to\R^{n\times d_a}$ 为线性映射，故还不算 mesh-free
		* FT 的输出允许超分辨率
	* 全连接逐点作用升维至 $v_t\in(D\to\R^{d_v})$，前传后再降维到 $u\in(D\to\R^{d_u})$
		* 迭代格式 $v_+=\sigma((W+\mathcal{K}(a))v)$，这里算子 $\mathcal{K}$ 用 Fourier 变换构造
		> 计算图中输入的 $a$ 有两个分支：分量域变换得到 $v_0$ 用于迭代，空间域变换得到 $\mathcal{F}a$ 用于生成 $R_\phi$
	* eqn(5) $\mathcal{K}$ 算子形式
		* （日后补充的简短版本）$\mathcal{K}v=iFT(R(FT(v)))$，$R$ 直接参化为 $s_1\times\cdots\times s_d\times d_v\times d_v$ 张量
		> 思路：卷积在 FT 下为逐点乘积，故只考虑学频域逐点矩阵乘积的形式（注意 $v$ 有多分量）
		* （旧）矩阵卷积核在 FT 下为矩阵向量乘法，故只参数化频域的卷积核
		* FT 作用于空间域后，待学的矩阵乘法 $R_\phi$ 作用于分量域，矩阵在频率域（变换后的空间域）不同位置可不同
		> GKN 中 GNN 的使用则同时作用，也许自由度更大，映射也可以依赖于 $a$
		* p6:1 $R_\phi$ 原则上可以依赖于 $a$，而有的问题并不需要真正依赖，如 $a$ 表示初值；本文实验没有引入这种依赖，只使用 direct parameterization（见 def3 后的一段，$R\in\mathbb{C}^{k_{\max}\times d_v^2}$ 为张量）
			* $k_{\max}=s_1\cdots s_d$ 为截断的 Fourier 系数个数（注意 Fourier 系数为 $d$ 维指标）
		> 感觉应该是 $R_\phi:\mathbb{Z}^d\times\R^{d_a}\to\R^{d_v^2}$，用 $\mathbb{C}$ 也行；
	* > (mine) 我对 p6:1 依赖于 $a$ 的频域变换形式的解读，使用 fiber bundle 语言
		* 记 $Z=\hat D$ 为空间域 $D$ 对应的频域（回忆 $\hat D=\mathsf{Grp}(D,S^1)$），文中使用 $\mathbb{Z}^d$ 或者其截断；记号简便记 $A=\R^{d_a}$，$V$ 同理
		* 以下的 fiber bundle 均以 $Z$ 为基空间，并且为 trivial bundle（没有非平凡丛结构，仍使用纤维丛范畴是为了对态射进行限制，回忆 $\mathsf{FB}(M,N)\subset\mathsf{Top}(M,N)$）
		* 纤维丛截面 $\mathcal{F}v=\hat v\in\Gamma(Z\times V)$, $\hat a\in\Gamma(Z\times A)$, 
		* FB 之间的态射可以解读为某 FB 的一个截面：$R_\phi\in\Gamma(Z\times\mathsf{Top}(A,\mathsf{Vec}(V)))$，（作为态射）作用于 $\hat a$，即（作为截面）与 $\hat a$ 取纤维积后使用 $\text{ev}$ 映射，得到 $R_\phi(\hat a)\in\Gamma(Z\times\mathsf{Vec}(V))$ 也是态射或截面
		* $V=\R$ 情形：频域逐点乘积可以按这种纤维丛态射解读
	* results
		* sec5.3 轮胎面（即 2D 周期边界）NS，用前 10s 的 vorticity，预测 10s 后的情况
		* sec5.5 作为 surrogate 用于加速 BIP，使用最终流场推断初始流场
			* MCMC 从后验分布采样 25k 样本（加上之前 5k burn-in 样本），即使加上数据生成、训练时间也比传统方法快
		* 频域部分截断未限制 FNO 逼近函数的最高频率：激活函数会恢复高频 mode；{_ncqf01}
			* NS 方程解，FT 截断 20 mode 误差 2%，FNO 截断 12 个参化 mode 误差低于 1%
		* 不像传统 Fourier 方法只能处理周期 BC：线性变换 $W$ 提供的 bias term 保持了非周期 BC 的信息；{_ncqf2l}
	> 算子逼近能力的理论分析不在本文，见 `FNOvsDpONet-2111.05512` 或 `reviewNO-2108.08481`, `2107.07562`(x)
	* > (mine) 与 BCR-Net（记录于 MR 笔记）算子形式的比较：
		* 利用的传统变换分别为 Fourier 和仿照小波的变换（通过线性 CNN 表达）
		* 这里先逐点升维得到 $v_0$ 再 FT，BCR-Net 直接进行仿小波变换（我姑且这么称呼）
		* 这里算子每层在频域的作用形式是逐点（即单个 fiber 上，或者对于给定的频率向量）线性变换，BCR-Net 是同频率分量内进行 locally-connected 变换（最低频分量做全连接）；均只涉及同频率内部的交互
		* 非线性的引入：这里利用 FT 表达的算子（作为整个算子的组件）是线性的，对变换结果再作用非线性；BCR-Net 在仿小波域的作用就使用了含非线性的 NN
		* 变换次数：这里每层进行一次 FT 和 IFT，BCR-Net 整体只进行一次仿小波变换
		* 表达能力均需要确认（BCR-Net 也许只能表达一小类的算子）
	* 导师：与 `flowMap-1910.06948` 想法相似度高，不过好像没直接引；我自己写文章可以引
		* 2021-10-29 CSI讨论，当时的特定实验中效果不如 Galerkin Transformer，时间迭代外插偏弱
	* 其他相关工作：
		* 作者后续工作改用 PINN loss `PINO-2111.03794`
		* `FNOvsDpONet-2111.05512` 提出 dFNO+，针对输入输出定义域不同，前者为后者减维数/子集时的处理；gFNO+ 定义域复杂时可作为方形区域子集，用最近邻延拓
		* `HyperFNO-NIPS22` 输入同时有场、实向量时，实向量部分输入 hypernet 生成 FNO 参数
		* AFNO（`2021-12-10`(CSImeet2)，adaptive FNO）用于处理图像
		* `F-FNO-2111.13802`（factorized FNO，`2021-12-17`(CSImeet2)；不是 FNO 的组做的）Fourier 变换改为 tensor product 版本，用全连接补偿精度损失，可省内存（尤其高维）
		* 可作为 ViT 内部替换注意力机制的架构 `FourCastNet-2202.11214`
		* `2022-03-16`(dbGrpMeet2) 鄂维南老师觉得其设计基于 Green 函数，未必适用于非线性方程
		* `FNOvsDpONet-2111.05512` 2022-08-15 MSML 会议 LuLu 提到对有间断问题表现不如 DeepONet（Fourier 变换性质）
* `DeepONet-1910.03193`: #PDE, #NO
	* "DeepONet: Learning nonlinear operators based on the universal approximation theorem of operators"
	* 一种 neural operator，输出无网格，thm1 逼近性质的定理与证明
	* thm1 operator 的构造，及 universal approximation 定理
		* 形式 $G(u)(y)=\sum a_k(u)\sigma(w_ky+\zeta_k)$，$\sigma$ 部分称为“trunk-net”；系数 $a_k(u)=\sum c_i^k\sigma(\sum\xi_{ij}^ku(x_j)+\theta_i^k)$，称为“branch-net”；定理叙述为 $\exists\{x_j\}$
		> 其实就是 hypernet，“branch-net”即 hypernet 的外挂部分，定理均使用单隐层网络，regular net 的最后一层系数由 hypernet 生成
		* p3:2 “sensor location”$\{x_j\}$ 需要固定，不过不要求在规则 lattice 上
		> 按照 hypernet 的设定原则上可以改成 mesh-topology independent 版本，使用 DeepSets 方式；或者在这里将 $\xi_{ij}^k$ 换成 $\xi_i^k(x_j)$；
		> 不过 universal approximation 性质可能需要另行证明，对采样点需要加一些条件
		* 后续工作 `FNOvsDpONet-2111.05512` 提到 branch net 可用 CNN,RNN,GNN
	* thm2 为达到 $\epsilon$ 精度需要多少 $u$ 的采样点；附录有提到实验涉及的算子均为 Holder（事实上 Lipschitz）连续
		> 作者均为数学方向，泛函的东西比较多
	* related: `reviewNO-2108.08481`“线性基底表达的解流形并不高效” ，最后两网络输出需要在高维空间内积，如果是非线性做法不需要这么高的维度
	* 后续工作 `PI-DeepONet-2103.10974`(x) 使用 PINN loss 训练
		* 其中的实验：
			* 1D anti-derivative operator（就是算 $u$ 的积分；由于 GRF 积分高振荡，网络输入进行了 random Fourier mapping 预处理）
			* 反应扩散方程（变化不含时源 $u(x)$）
			* Burgers 方程（变化初值）
			* 2D Eikonal eqn（即求解 SDF），p13:-1 $u$ 似乎是参数化曲线，在固定参数位置的值输入网络（原文有点费解，可能用弧长比例参数化），算例为圆和机翼
		> 可视为 hypernet 元学习加速 PINN ((n35e9n))NOasMetaL
	* 后续工作 `2110.13297` 用于处理 inverse design 问题
	* 续作 `FNOvsDpONet-2111.05512` 提出 POD-DeepONet
	* 续作 `MIONet-2202.06137` 输入有多个函数分量，网络架构、逼近定理
	* 续作 `NOMAD-2206.03551`，最后解码表达为函数的非线性组合，以提高大 Kolmogorov n-width 下的效率
		* 他人的 `NIF-2204.03216` 相当于 branch net 生成的低维向量作为 trunk net 的 modulation，或许非线性表达能力更强
	* 续作 `DeepM&Mnet-2009.12935` 多解方程解集用 DeepONet 提供的约束来表示，并用于反问题
* `FNOvsDpONet-2111.05512`: #NO, #comparison
	* 比较 DeepONet 和 FNO，提出相应的一些改进可能，比较逼近理论性质与实验
	* "A comprehensive and fair comparison of two neural operators (with practical extensions) based on FAIR data"
	* sec2.2:0 之前文献提出的科学数据标准："findability, accessibility, interoperability, and reusability (FAIR)"
	* sec3.1.2 DeepONet 的 branch net 可以用 FNN,CNN,RNN,GNN 等
	* sec3.1.4 提出 POD-DeepONet，trunk net 用 POD，仅 branch net 用 NN
		* 实验表现比原版 DeepONet 和 FNO 都好
		> 回忆作为 hypernet，这里 regular net 前几层用传统算法 POD 代替（在 ((n32e9r))场的数值表征 下：函数表达方式由参数化改成基底展开），基底线性组合用 hypernet 生成，hypernet 还是 NN
		> (?) 但是如果数据 $u_i$ 有网格，POD 必然有网格，函数表达只能是离散化而非基底展开，无法保留原来的无网格特点？
		> 并且可能不适合 PI-DeepONet，无法预先获得 POD basis
		* （评）`funcPCA-2005.03180` 对输入、输出函数均 PCA，而这里只对输出函数 POD
	* sec3.1.5 DeepONet 输出的正则化：初始化时宜每部分单位方差，试图在最后一层乘积时引入 scaling 保证这点
		* 理论推导（假设 trunk,branch net 均 ReLU），内积后应乘上 $O(1/\sqrt p)$（$p$ 为末层宽度，即 basis 数目）；{_n8gh38}
		* 实际中考虑后续优化，这未必最优；实验发现 DeepONet 不 scale 也不错，POD-DeepONet $O(1/p)$ 稍好一点
	* sec3.1.6 $n>1$ 个输出的 DeepONet 可能性：用 $n$ 个独立 DeepONet；branch/trunk-net 输出均分 $n$ 组，同组取内积生成对应输出；共用 trunk-net 输出，只对 branch-net 分组，以及反过来
		* 哪种方法好依赖于问题，本文用法 2
	* sec3.2.2 提出 dFNO+，用于处理输入输出域不同的部分情形：
		* NO 输入比输出少一维时的处理（如只给定初值）：对输入升维，或者用 RNN 压缩输出
		* 输入为输出子区域，可零延拓；若少一维需要更高效延拓方式，如连续版本
	* sec3.2.3 提出 gFNO+，输入输出域复杂的情形：若作为某区域的复杂子区域，可零延拓或者最近邻延拓
		* （发表版本）non-Cartesian 区域，用最小 bounding box 替代，近邻延拓效果好于零延拓；{_n7na5w}
		* non-lattice mesh 可插值到规则网格；{_n7na3w}
	* sec3.3 DeepONet 和 FNO 比较，DeepONet 限制更小（> 本文是 DeepONet 的组当然偏向 DeepONet）
		* sec5.4.1 的结果表明 FNO 最大的问题在 robustness，加了 noise 之后效果明显变差；{_n7na6i}
	* sec4 一致逼近理论，DeepONet 和 FNO 都有，后者在 `2107.07562`(x)
		* sec4:-2 二者都是 $O(1/m)$ 误差需要 $O(m^3\ln m)$ 网络尺寸；{_n7na9k}
	* sec5 更多数值实验
		> 2021-11-19 CSI讨论提到“实验非常完整”，已经劝退 follower 了
	* 注：LuLu 2022-08-15 MSML 报告提到二者精度各有胜负，取决于问题
		* Euler 激波预测由于 Fourier 变换性质，FNO 在间断附近预测不好
* `MIONet-2202.06137` DeepONet 多输入版本，有相应算子逼近理论
	* "MIONet: Learning multiple-input operators via tensor product"
		> created on 2022-08-15
	* 逼近理论（没看懂），$G:\prod K_i\to Y$ 连续则可被逼近
		* 取各 $X_i\supset K_i$ 的 Schauder basis（即所有线性组合稠密），考察对偶基底 $\phi_i$；为简便，可在有限基子空间取等价的对偶基底，使成为在格点上 evaluation
		* （未细看）
	* 网络架构：high-rank 版本与 low-rank 版本，默认后者
		* 高秩版本，$n$ 个独立的 branch-net，一个 trunk-net（其输出张量的秩较高）
		* 低秩版本，$n$ 个 branch-net 输出、trunk-net 输出放到一起，$n+1$ 个向量取逐分量乘积
		* secB 输入为有限维图像空间时架构（未看）
	* 实验，sec4.3 反应-扩散方程变扩散项系数、源项，二分量均作为输入时精度明显高于同尺寸 DeepONet
		* 若在 trunk-net 网络结构中引入周期性先验知识（先 sine embedding）能再提高
* `DeepM&Mnet-2009.12935` 反问题，多解方程依据散点观测找特定解，双向 DeepONet（类似 cycleGAN）作约束表达方程解集
	* "DeepM&Mnet: Inferring the electroconvection multiphysics fields based on operator approximation by neural networks"
		> created on 2022-08-16
	* M&M 指 multiphysics and multiscale
		* （评）多物理似乎只改变方程形式，对求解算法影响不大；多尺度这里应主要指目标场不同区域量级差别大（尤其航天器再入），可以靠 NO 表达能力捕捉，无需特别处理，只对数据生成有一定挑战
	* sec2 电对流问题：不可压 NS 方程，涉及阴阳离子（浓度分别 $c^\pm$）在电场 $\phi$ 中运动
		* fig2 计算区域 2D，左右周期边界，上下表面电势差 $\Delta\Phi$ 给定、$u=0$，上表面 $c^\pm=1$，下表面有只能透过阳离子的膜使 $c^+=2$，不透过阴离子 $J^-=0$
		* 含时方程，参数 $\epsilon,\Delta\Phi$ 在某些范围内有稳定解，故数据不含时
		* （评）解应该不唯一，至少水平平移（周期边界）后仍是解
			* 生成数据时，估计是靠所用初值中带的随机扰动来体现不同解
			* 鉴于待拟合算子可定义，应该是在给定 $\phi$ 下解唯一，或者给定 $c^+,c^-$ 解也唯一
			* 从而或许可视为 $\phi$ 参化的 PDE，额外加上由解反推该参数的机理；不过实际中 $\phi$ 由系统自发形成，不是人为给定的
		* 传统求解器生成数据：自己组开发的 NekTar，高阶谱有限元（spectral element）方法，网格在上下表面附近加密，时间推进用二阶 stiffly-stable 格式（有引文）
		* 先验证求解器准确
			* $\epsilon=10^{-3}$，对多个 $\Delta\Phi$ 值模拟，发现随它增大解由时间稳定变不稳定、混沌，符合已有文献结果
			> 初始条件通过求解无流动的控制方程生成，并在局部随机扰动所得浓度场 1%
			* 时间推进至“此时上表面上的电流进入统计静止状态”（> 估计指只有 noise 无 drift 随机过程）
		* 再生成数据：$\epsilon=10^{-2}$（均时间稳定），用较粗网格、低阶有限元、大时间步，时间推进至解达到稳态，将最后时间步 snapshot 作为数据
			* （评）数据中似乎没有保存 $\Delta\Phi$ 的取值，尽管它是在变化的！
			* （评）根据 sec3.2，每个 $\Delta\Phi$ 只生成一个 snapshot，不知道为何不生成多个；那里将采样点个数也算进数据量，从而说有 $15\times 800$ 个数据点
	* sec3 先训 5 个独立 DeepONet：$\phi\mapsto(u,v,c^+,c^-)$，$(c^+,c^-)\mapsto\phi$
		* 提到：暂未考虑电对流的压力场，不过不难引入
		* 可用 MSE loss；另考虑 MAPE 平均绝对百分比误差 $\bigoplus|V_i-\hat V_i|/(|V_i|+\eta)$，“在输出具有大范围函数值的情况下效果更好”
			* 本文 MAPE 用于训练 $\phi\mapsto(u,v)$，secA 相较 MSE 误差明显小；其他仍用 MSE
			* secA 解释：多尺度预测用 MSE 则 loss 被场的大幅度取值控制，小尺度贡献小
		* sec3.2 训练数据关于 $\Delta\Phi$ 归一化，使训练更稳定；输入在 21x11 网格表达，输出为每个状态变量随机采 800 数据点
	* sec4 DeepM&Mnet：在 5 个场分量均在少量散点有观测的前提下，推断完整场；用 DeepONet 作约束
		* （评-弃用）与普通反问题设定可认为等价，$(c^\pm,\phi)$ 对应 $(\lambda,u)$
			* 普通反问题设定：$\lambda$ 参化的 PDE，$\lambda\mapsto u,u\mapsto\lambda$ 均唯一；现给定散点观测 $u|S$，要求恢复完整场 $u$（不一定要求恢复 $\lambda$）
			* 此处问题设定：关于双分量场 $(\lambda,u)$ 的 PDE，有多解，但给定其中一个后另一个唯一；也是给定散点观测恢复完整场
			* 均可认为存在 $u$ 所有可能性的集合 $\{u_\lambda\}$，要根据散点观测从该集合中找出 $u$
		* （评）本文自称“数据同化”，指的是结合有限观测数据、先验的物理知识（PDE）形式恢复完整数据
			* 我笔记系统中目前只把含时问题、动态引入新数据的叫做“数据同化”，本文只视为反问题
	* （评）与普通反问题设定关系，$(c^\pm,\phi)$ 对应 $(\lambda,u)$，$\lambda$ 合法取值小于全空间
		* 联合分布形成流形 $\{(\lambda,u)\}$，且构成定义域上的双射，即 $\lambda\mapsto u,u\mapsto\lambda$ 均良定义
			* 现在是有部分观测 $u(x_i)$，希望恢复出对应的联合流形中的元素 $(\lambda,u)$
			* 可表达为约束优化问题，限制在联合流形上极小化观测误差
		* 普通反问题，边际分布 $\{\lambda\}$ 充满全空间，故可转化为对 $\lambda$ 的无约束优化问题
			* 解法可如单 NO 表达 $\lambda\mapsto u\mapsto G$ 后对 $\lambda$ 优化，见 `invDP%` surrogate 部分
		* 本文的问题 $\{\lambda\}$ 不充满全空间
			* 不必再将 $\lambda$ 视为参数，可认为是关于 $(\lambda,u)$ 二分量的不定方程，所有可行解组成流形
			* 另：本文其实有额外参数 $\mu=\Delta\Phi$ 及边界条件，这可与双参数方程类比：若 $\mu$ 固定且已知，可类比参化的反问题（已知 $\mu$ 恢复 $\lambda$）
				* 本文及后续航天器再入似乎 $\mu$ 事先未知，但在 $(\lambda,u)$ 同时给出后可确定
				* 本文训 NO 时训练数据还按 $\Delta\Phi$ 归一化了，没打算恢复
		* 故本文只能按照有约束优化问题求解，对 $(\lambda,u)$ 施加的约束由两个 DeepONet 给出
			* 这种循环映射 loss 给出约束的方式类似 cycleGAN，本文给了并行串行两种方案
			* 反问题 PINN 等则是靠 PDE loss 表达约束，对这里的问题也可用
			* 若不要求符合观测，只需找到一个可行解，或许可用 NO 不断迭代 $\phi\leftrightarrow c^\pm$（如果迭代收敛）
		* 若想求的是 $u$，参化 $\lambda_\theta,u_\theta$ 均可
			* 普通反问题由于可能的 $u$ 不充满全空间，对 $u$ 是约束优化，但对 $\lambda$ 是无约束优化，故即使想求 $u$，参化并直接求解的还是 $\lambda$
			* 本文反问题对 $\lambda,u$ 都是约束优化，故直接参化想求的 $u$ 更方便（采用并行 NO 架构约束时需同时参化 $\lambda$）
	* sec4.1.1 平行/并行架构（parallel architecture）
		* 用 NN（参数 $\theta$）作为 5 个场分量 $(\phi,u,v,c^+,c^-)$ ansatz，待找出该场
		* loss1：场在散点处取值符合观测数据；如果只有部分场分量观测也行
		* loss2：场满足 DeepONet 给出的约束
		* figB2 5 分量都有对应 DeepONet，将所需的 ansatz 分量输入可得 5 预测值，作差得 loss2
		* loss3：$\|\theta\|_2$ 网络参数正则化，避免过拟合、稳定训练；secB ablation
		* 称 DeepONet 预测值与 NN 表达的场有 bias，因为 DeepONet 有逼近误差、NN 有优化误差
	* sec4.1.2 序列/串行架构（series architecture）
		* fig9 NN 作为 $\phi$ 场 ansatz，其余分量靠 DeepONet 预测
		* loss1：$\phi$ 在观测点处取值符合观测（不管其他分量）
		* loss2：$\phi$ 通过 DeepONet 预测其他分量，再将 $c^\pm$ 又输入 DeepONet 获得 $\phi$，要求与原 $\phi$ 一致
		* loss3 同理
	* sec4.2 结果；平行架构下 NN 直接表达的场精度还低于它输入 DeepONet 后的输出结果（？）
		* fig12 考察 loss2（DeepONet 约束）所用点个数的影响
		* （评）按 fig7，DeepONet 输入用了一套网格的所有点，应该不变；只改输出函数采样点位置与数目
		* 序列架构精度（除 $\phi$ 都由 DeepONet 推断）稍高于平行架构 NN 直接表达，较明显地不如平行架构 DeepONet 后处理结果
	* 后续工作 2011.03349：流动与化学反应耦合问题，例如航天器再入大气时的激波
		* 提到对马赫数测试了 OoD，DeepONet 不再准但是有散点观测时整体预测仍准
			* （评）是否表明：学习的物理模型用于 OoD，用来推断时精度或许不如用来做先验以同化数据？
		* 涉及的化学反应：$N_2,O_2$ 分解为原子，又形成 $NO$
			* 主要位于激波下游，温度高、流速降低；激波处流体时间尺度比化学反应短很多
			* 同样是含时方程、且只考虑稳态
		* 2D Euler 方程，质量守恒之外还有各成分的质量方程，带化学反应导致的源项
			* 压强与温度的依赖关系 $p=\sum_s\rho^sR^sT$ 与各成分占比有关
			* 传统算法 MUTATION；fig2 数据中 $\rho_{NO}$ 取值跨了 8 个数量级
				* （评）可让 NO 输出 $\ln\rho$ 取值
			* sec2:-1 马赫数 $M_\infty\in[8,10]$ 生成了 400 轨迹，未说初值如何生成（> 能表明同马赫数下解不唯一？）
		* fig4 DeepONet 两个：$\rho_{N_2,O_2,N,O,NO}\leftrightarrow(U,T)$
		* （评）与电对流问题变量地位对应关系：$\Delta\Phi,\phi,c^\pm$ 对应 $M_\infty,(U,T),\rho_*$
		* 类似的并行、串行两种架构
* `2204.06684` 多保真 DeepONet，高保真部分输入低保真部分输出、结果加到低保真结果上，并用于拓扑优化反向设计（松弛为连续优化）
	* "Multifidelity deep neural operators for efficient learning of partial differential equations with application to fast inverse design of nanoscale heat transport"
		> created on 2022-11-04
	* fig1 架构，引入多保真方式可包括 残差（高精度网络只学低精度预测的修正），输入增强（低精度预测作为高精度网络输入）
		* 本文两者同时用，实验有 ablation 表明确实都有帮助
	* 反向设计，传统拓扑优化传统使用无导数的遗传算法（GA），可调包 DEAP
	* 拓扑优化有 NO 后可松弛为有导数连续优化问题，随问题增长调阈值使结果接近二值输出
		* 尽管训练数据每像素位置只有二值，NO 本身可输入连续取值给出预测
			* fig7 训好的 DeepONet 输入连续变化的值，相应的预测场变化
		* smoothed Heaviside 函数，参数 $\beta$ 控制输出有多接近 01 取值
		* 初始 $\beta=1$，每轮优化后翻倍（优化问题刚性增加）
		* 这种阈值函数通常能收敛到二值输出，但不总能，此时可对结果加惩罚项使接近二值
	* 实验，steady-state phonon Boltzmann transport equation (BTE)
		* （评）声子输运，模拟的是热传导
		* 方程定义域为方形内随机打孔，“totally diffuse 边界条件”
		* 使用开源软件 OpenBTE 有限体积方法生成解，不同算例用的 mesh 不同（> DeepONet 预测解用参数化表达故可方便处理 mesh 变化）
		* 低精度解用 2 次迭代生成，高精度用 5 次
	* 实验，BTE 上训好的 DeepONet 用于反向设计
		* 目标函数：sec3.2.3 特定网格点的法向热流，sec3.2.4 多网格点法向热流，sec3.2.5 再增加 pore 个数约束
		* DeepONet 优化最后阶段的目标函数有突跃，是因为收敛后改用二值设计替代连续设计
		* （评）似乎收敛需要的迭代数多于 GA
			* 不知是否 GA 单次迭代耗时更长，因为同时维护多个候选设计
			* 不过反正 GA 获得各候选设计的目标值也要调用 NO，不完全算是传统方法
* `NOMAD-2206.03551` DeepONet 中线性解码器换成非线性，以处理大 Kolmogorov n-width 情形
	* "NOMAD: Nonlinear Manifold Decoders for Operator Learning", NeurIPS2022
		> created on 2022-07-16
		* [GitHub](https://github.com/PredictiveIntelligenceLab/NOMAD) （文中没给这个链接）
	* 解算子近似形式 $D\circ A\circ E$，$A$ 表达 $\R^n$ 中的变换
	* 线性的 $D$ 下算子误差不低于 Kolmogorov n-width；改用 $\beta\mapsto\tilde D(\beta,\cdot)$ 形式
	* motivating example: $G(U)=\sin(2\pi tx)$，参数 $t$
	* 实验包括流体 Euler 方程
* `HyperDeepONet` DeepONet 变体的通用框架，分支网作 hypernet 生成主干网参数，估各变体逼近阶
	* "HyperDeepONet: learning operator with complex target function space using the limited resources via hypernetwork", ICLR2023 spotlight
		* Jae Yong Lee, SungWoong CHO, Hyung Ju Hwang
		> recommended from CSImeet group at 2023-02-01
	* 算子 $G:U\to S$ 的通用 ansatz：$E:U\to\R^m$，$A:\R^m\to\R^p$，$R:\R^p\to S$
		* 以下 $E$ 均用固定散点离散（> 虽然我觉得这里应该也可以做文章）
	* fig4 通用框架下看，分支网在 DeepONet 中只生成主干网最后一层参数，Shift-DeepONet 和 FlexDeepONet 生成首层、末层参数，NOMAD（仿 DeepSDF）分支网输出作为主干网的部分输入；{_n4bn7u}
	* 提出的架构：一般超网络，生成所有层的参数
		* （评）实验中使用了较小的主网络，从而参数总量不大
	* 理论，考察 $W^{r,\infty}([-1,1]^n)$ 单位球（$n$ 为空间维度+分支网输出维度）中函数，用 MLP 函数族 $L^\infty$ 逼近，考察参数量随逼近精度要求增长；{_n4bn8u}
		* （评）逼近度量类似 width，不过怎么看起来像用 Sobolev 单位球逼近 MLP 函数族？写反了？
		* 引用了 `2002.10006`
	* secD fig9 提出的架构 2，chunked 版本、分组生成参数，从而可用较大的主网络
		* 该做法似源于 2020 年引文（似乎还有理论分析，在合适的分组策略下为 universal approximator），非本文提出
		* 具体地：主网络第 $i$ 层对应隐向量 $z_i$，超网络输入 $u,z_i$ 后生成该层参数（允许生成多余的，去掉这部分多生成的即可）{_n4bn76}
			* （日后追加）其实只是分组生成，未必是按层分组；p8 tbl2 超网络输出数确实明显少于主网络线性权重矩阵大小
			* 若某些组参数个数比其他组小，可生成多余参数并丢弃
		> （本文 OpenReview 作者回应审稿意见提到）使用几乎相同数量参数的情况下，c-HyperDeepONet 显示出比 DeepONet、HyperDeepONet 更好的准确度，如表 2 所示。然而，它比 HyperDeepONet 花费近 2 倍的训练时间和 2∼30 倍的内存使用量。 
* `PINO-2111.03794`: #PDE, #NO, #PINN, #inverse_problem
	* FNO 使用 PINN loss 训练的版本，元测试时可微调；反问题用正反向 NO 均可处理；可作为 PDE 解的 ansatz
	* "Physics-Informed Neural Operator for Learning Partial Differential Equations"
		> 2021-11-12 CSI讨论提到
	* sec3.1 alg1 预训练（> 即元训练）假设有给定数据集，在用 L2 loss 之外还可以 PINN loss，也可以额外动态采样 PDE 参数取 PINN loss
		* 二者使用量可独立选取；若都不用（即不预训练），仍可测试阶段微调，table2 只是收敛慢一点，精度能保持
		> 不预训练，相当于 NO 结构替代 NN 作为 PDE 的 {ansatz}；
		* 考察非齐次 Dirichlet 边值（含时问题还有初值），像普通 PINN 通过惩罚项保证
	* sec3.2 测试阶段可用 PINN loss 微调
		* 鉴于 PINN loss 不好优化，可以额外引入 operator loss 惩罚微调导致的解 $u$ 改变量（与未微调所得解的 L2 距离）
			* 引入原因：sec3.2:-1 网格高分辨率时优化不稳定，引入该 loss 可缓解
			* 没有展示消融实验（>  不过看表述作者应该是试过的）
		* 此外可以用优化技巧微调最后几层，
		* 还可用 progressive training 不断增加网格分辨率，测试时使用更高分辨率
	* sec3.2:2 声称会比纯 PINN 好优化：
		* 这里 $u$ 表达为基函数的组合，优化基底与系数比 PINN 直接优化单个函数容易；
		* operator learning phase 已经学出了基底的形式，使 test time optimization 更容易
		* {不需要将初边值传播到区域内部}，只需要对 NO 给出的解进行微调即可
		> 感觉基本就是元学习的好处，尽管作者没有提到元学习
	* sec3.3 PDE 涉及空间导数，在 NO 中的计算方式（FNO 通常用 FFT，输出为均匀网格）
		1. 数值微分，可空间有限差分或者直接 Fourier 域求；但是 FD 方法需要细的均匀网格，谱方法需要均匀网格且函数光滑
			> 并且不好处理高维问题，但本文没有考虑高维的实验？
		2. 自动微分 autograd，构造一个 query function $\hat u$，它可以在任意 $x$ 点求值
			* NO 内部每层变换具形式 $K+W$；按我的语言，$K$ 在空间域变换，例如是 kernel func 给出的积分算子，$W$ 在分量域变换，为矩阵
			* $Kv(x)$ 直接在 Fourier 域计算，不进行 IFFT
				> 在 autograd 里还是算出函数值，也即 Fourier 展开基底求和，而不是直接在 Fourier 域求导？
			* $Wv(x)$ 用插值或者 LNO 表达形式
				> LNO 见 `reviewNO-2108.08481`，但是我感觉里面说的是 $Kv(x)$ 项的另一种构造？
			* 作者认为不高效：网络参数 $\theta$ 规模比网格尺寸 $n$ 大很多，从而比数值微分更慢、耗内存
				> 不太理解？并且看起来确实是低维问题
		3. 精确梯度，手动在 Fourier 域算梯度、用链式法则
			* $Wv(x)$ 的导数可以用 Fourier 方法插值，“numerical Fourier gradient”
			* 可计算 $u$ 的 Jacobian 和 Hessian（> 只考虑不超过 2 阶 PDE？）
			> 似乎是只在 grid 上求，不像自动微分一样需要延拓为连续定义域的函数？
			* 数值实验主要使用精确梯度和 numerical Fourier gradient
	* > (mine) 视为（弱意义的）hypernet 的方式：
		* 仍算元学习：在允许对 $x$ 微分之后（三种方式皆可），常规任务即极小化 PINN loss
		* regular model $x\mapsto u(x)$ 不是 NN 参数化 ((n32e9r))场的数值表征，从而整个网络不算狭义 hypernet（低层不是 net）
			* 若最后一层做了 IFFT，则属于离散化表达；包括空间域 FD 近似微分
			* 若最后一层按 Fourier 基函数组合，或者 grid 插值解读，则属于基底表达；包括频域计算微分、autograd
			* 手动设置求梯度公式的做法未确认
		* 关于微调，hypernet 的微调可以只调 regular net 的参数，也可以整个地调 hypernet 的参数
			* 这里非狭义 hypernet 的做法，文中考虑整个调；
			* regular model 用离散化或基底展开的方式应该也允许只调结果；手动梯度未确认
	* sec4.3 用于反问题，假设可获得完整无噪声的观测（可以求 PINN loss 的那种）
		> 假设有点强了，一般性不足，实际只能观测到散点取值，不能得到一个可求导的观测；
		> 而且看起来也无法用在 inverse design 上面
		* forward model 仍用数据里学的 $G:a\mapsto u$ 算子，对 $a$ 优化，包括 PINN loss、data loss（这里涉及 $G$）、对 $a$ 正则化项
			> PINN/data loss 保留一个即可表达反问题；同时用相当于提供了正则化项？
		* backward model 改用数据学 $F_\theta:u\mapsto a$ 算子，对 $\theta$ 微调
			* 微调包括 PINN loss、operator loss（防止微调后输出的 $a$ 变化过大）、正则化，三项均涉及 $F_\theta(u)$
			* 在 Darcy flow 下 $a$ 为随机边界，从而 $F_\theta(u)$ 为分类网络（对每个 $x$ 分类），正则化使用 TV
		* 实验比 MCMC 快 3000 倍，而 PINN 未收敛；backward 表现好于 forward
			> (?) 为什么 PINN 会不行？是否因为 Darcy flow 要恢复的参数不对应连续优化问题，但原则上这里也应该会用梯度类算法？
	* sec4.2 实验，NO 作为 ansatz 的效果
		* table2 若不预训练直接推断，时间较预训练版本稍慢，精度一致，都明显好于 PINN
		> 此时测试精度不损失我觉得有点奇怪，不预训练就没有好的 operator loss；
		> 也许需要确认该效果提升是否和方程类型有关，或者 PINN 没有用 sin 激活函数（这里的 FFT 当然用到了）
* `1901.06314` 基于 CNN AE 的 NO，用 PINN loss 训，Sobel filter 求近似微分
	* #PDE, #NO, #PINN, #UQ
	* "Physics-Constrained Deep Learning for High-dimensional Surrogate Modeling and Uncertainty Quantification without Labeled Data"
		> recommended on 2022-04-07 by ICML2022 MAD reviewer；主要做 literature review 时用
	* 好像还提供了 FCNN 的版本，更像 PI-DeepONet？
	* secA.1 Sobel filter eg. $H=[1,0,-1;2,0,-2;1,0,-1]$
	* eqn(14) 引入新变量成一阶方程再求 PINN loss，从而用 Sobel filter 算的近似微分只需作用一次
		* （评）不直接用二阶算子可能是因为系数场不连续，$\nabla\cdot(K\nabla u)$ 难设计二阶差分算子
* `HyperFNO-NIPS22` PDE 参数同时有场和低维参数时，hypernet 接收低维参数、输出 FNO 各层系数矩阵
	* "HyperFNO: Improving the Generalization Behavior of Fourier Neural Operators"
		* Francesco Alesiani, Makoto Takamoto, Mathias Niepert University of Stuttgart
		* 来源：`[NeurIPS2022-ML4phyWorkshop]`，No.89
		> created on 2023-01-02
	* （评）摘要中认为原版 FNO 只能输入函数、不能输入粘性系数、外力项这样的低维参数；但这不太对，完全可以输入常数取值的场
		* 不过若改用这里的 ansatz，由外挂网络接收低维参数，不排除效果可提升
		* 若实向量参数维数较高，按常数取值场输入时，输入场的不同分量确实需要区分，见 ((n32f34))
	* 记号，NO $(x,\lambda)\mapsto u$，$\lambda$ 为实向量参数，$x$ 为场（用于时间演化时为初值场）
		* 注：原文有记号混乱，sec2:1 最开头 $x$ 表示空间坐标、$a$ 为 NO 输入第一分量，但之后的段落 $x$ 表示 NO 输入
	* fig1 示意图，hypernet 输出结果会修改 FNO 内各组分，包括首层升维 $P$、末层降维 $Q$、中间各 Fourier layer 的二通路（频域作用的 $R$，空间域直接作用的权重矩阵 $W$）
	* hypernet 结构，希望内存友好故未用 MLP：
		* 注：原文文本和公式不太匹配，文本说的是 $W$ 行列分别 scale、$R$ 只 scale 行
		* eqn(3) 加法版本，$R=R_0+(V_0\mathrm{diag}(\lambda)V_1^\mathrm{T})\odot R_1$，$W=W_0+(U_0\lambda\mathbf{1}^\mathrm{T})\odot W_1$
		* eqn(4) Taylor 版本进一步减少参数，取 $R_1=R_0$，$W_1=W_0$
		* $\lambda$ 也可换成小 NN 编码的结果 $\lambda'=g_\theta(\lambda)$
		* （评）均为低秩的仿射变换生成，相关框架 ((n3gd5l))hyperNet 超网络生成哪些主网络参数、如何生成
	* 训练完成后可用于反问题，给定多个 $(x,u)$ 数据对，恢复 $\lambda$
	* 注：文中参考文献部分认为 hypernet 提出于 arXiv:1609.09106，当时作为元学习方法
* `GalerkinTf-2105.14995` 无 softmax 的 Transformer，说明该形式可将 FNO 作为其特例，并且用 FNO 给出了其逼近能力的证明
	* "Choose a Transformer: Fourier or Galerkin"
		* [作者给的中文介绍](https://mp.weixin.qq.com/s/9Dc_44btmA8Ml5QFUQoo1Q)
	* Transformer 无 softmax 时大致为 $QK^\mathrm{T}V$ 的形式（后续还有全连接 $\sigma$ 和残差连接）
	* Transformer 输入序列以及 $Q,K,V$ 矩阵均看作输出 $d$-维向量的函数在离散点上的采样值，不同行对应不同离散点，不同列对应函数的不同输出分量
		> 序列长度可以不同，对应选取的离散点个数可以不同；
		> 要求均匀 grid 而不能随机撒点。矩阵乘积 $K^\mathrm{T}V$ 中的每个元素对应向量内积，在均匀离散化下这才对应函数 L2 内积
			* （日后补充）其实均匀散点也可以，非均匀分布不行；{_n8vn3e}
	* Fourier type：先组合 $QK^\mathrm{T}$，它在连续情形对应积分算子的 kernel $\kappa(x,\xi)$，输出 $z_{ij}=z_j(x_i)=\int\kappa(x_i,\xi)v_j(\xi)\,\mathrm{d}\xi$
		* 这个 kernel 可以是 Fourier 变换的核，Green 函数，etc；{_n9294e}
		> (?) 积分方程 eqn(11) 关于 $v_j(x)$ 的方程是什么意思？不像是在描述 Transformer 的一层？
	* Galerkin type：先组合 $K^\mathrm{T}V$，相当于两个 Hilbert 空间的双线性型 $b$（用积分给出），$z_j(x)=b(k_l,v_j)q_l(x)$（对 $l$ 默认求和）
	* eqn(6,7) 涉及的基底函数需归一化，Fourier-type 对 $Q,K$ 用 layerNorm，Galerkin-type 对 $K,V$ 用
		* （评）layernorm 其实是对逐点 feature 归一化；instance norm 才对应基函数归一化，((n9g951))OFormer 论文认为这也确实能提高效果
	* 实验，据说好于 FNO，并且可以处理 FNO 不好做的反问题
		> Burgers方程的初始值问题（如下图），文中用4个Galerkin attention算子层外加两个FNO中的频率域卷积层结合…{_n8vm6l}
		> 在相同参数量的前提下，新模型比FNO论文中4个频率域卷积层的网络的练500个epochs结果，好了10倍！？
	* 推送结尾致谢提到：反问题加 noise 很重要；{_n8vm7p}
	* 相关讨论：
		* 2021-09-29 CSI讨论有涉及相关的东西；导师认为讲清了 Transformer 用于线性 PDE 的合理性
		* 2021-10-29 CSI讨论，他们的实验表明该方法在 FNO 测试的所有实验上都明显比它好；大网格上 FNO 开销明显大于 U-Net；一个缺点在于无法对网格分辨率泛化；
* `HyperPINN-2111.01008`: #PDE, #NO, #meta-learning
	* 用 hypernet PINN 处理参数化 PDE
	* "HyperPINN: Learning parameterized differential equations with physics-informed hypernetworks"
		> from `2021-12-15`(AISCmeet)
	> 如果 hypernet 只学 main network 最后一层的参数，基本就是 PI-DeepONet 的框架 `DeepONet-1910.03193`
* `2110.13297`: #inverse-design, #NO
	* 训练完 PI-DeepONet 后用于 inverse design 问题
	* "Fast PDE-constrained optimization via self-supervised operator learning"
		> from `2021-12-15`(AISCmeet)
	* （评）是对正问题算子完整训练的结果，原则上可以只对 inverse design 最优附近的正问题算子训练良好即可，不过这里可能考虑一批 design 问题；idea 新颖性不大
	* （评）属于我 `invDesign-metaPINN:`(AD) 中的第 2 类思路，适合处理批量问题；只求解单个问题可以考虑其中的 4
* `reviewNO-2108.08481`: #NO, #review
	* 现有 NO 方法给出统一框架（积分算子迭代）并说明各方法为何特殊情形；理论逼近性质证明与实验比较
	* "Neural operator: Learning maps between function spaces"
		* 2021-09-29 组会li+1学长介绍，细节可见 slides
	* 方法包括：GNO（GKN），MGNO，LNO，FNO，DeepONet，Transformer 法
	* sec3.2:-2 {线性基底表达的解流形并不高效}，如 DeepONet 和 sec5.2 LNO
		* 本文给的一般框架是非线性的
		* sec3.2:-1 非线性逼近的优势在函数逼近中有深入研究，但在算子逼近中还不成熟；下面 sec4 中给出的逼近理论性质也只利用线性情形，没有体现非线性优势
	* eqn(17) 以下在 sec5 中讨论的方法都针对线性积分算子的 kernel 函数 $\kappa:D\times D\to\R$ 说明
		* $\sigma,W,b$ 没有新意不单独讨论
		* 并且只考虑一维特征
			* 一般情形 $\kappa:D\times D\to\R^{d\times d'}$，每个分量可按 sec5 下面所述方式表达（完全独立或者部分独立）
			* 例如 sec5.2 LNO 积分算子一般情形分解为 $L^2(D;\R^n)\to\R^r\to L^2(D;\R^m)$（> 原文 $m,n$ 反了），由最开始讨论的 $m=n=1$ 情形推广得到
		* 没有按 eqn(7,8) 那样 $\kappa$ 同时可依赖 $v,a$ 的取值，不过 idea 可以迁移过去
	* related: `FNOvsDpONet-2111.05512` 比较 DeepONet 和 FNO 并分别提供一些变种可能性
* `spline-PINN-2109.07143`: #PDE/#time-dependent, #NO, #PINN, 
	* 使用样条作为基函数，用 PINN loss 学预测时间迭代的 NO
	* "Spline-PINN: Approaching PDEs without Data using Fast, Physics-Informed Hermite-Spline CNNs"
		* 2021-10-13 li+1学长在 AISC 讨论上介绍
		* 为 `2006.08762` 的后续工作，之前记过的这里不再重复
	* 使用 Hermite spline 基底表达解，时空每个维度做张量积，相应系数 $c_{i,j,n}$ at $(x_i,y_j,t_n)$
		> 回忆：高维可以 tensor train 表达系数
	* NO（Neural Operator）用于预测 $(c_n,\lambda_n)\mapsto c_{n+1}$，训练使用 PINN loss
		* $\lambda_n$ 表达当前区域形状和边界条件
		* 架构：学增量 $\Delta c_n$，根据问题形式用 U-Net 或普通 CNN
		* PINN loss 在时空内随机采样
	* > (mine) 我的解读：原问题 $(u_{t=0},\lambda_{[0,T]})\mapsto u_{[0,T]}$
		* 时间维度做区域分解，$(u_{t_n},\lambda_{t_n})\mapsto u_{[t_n,t_{n+1}]}$
		* 之后每个子问题不区分时空维度，用通常参数化 PDE 的解算子法求解
		* 解 $u$ 的表达 1，这里使用时间上有局部性的 $c=(c_n)$ 表达，与时间维的分解对应
			* $u_{[t_n,t_{n+1}]}$ 由 $(c_n,c_{n+1})$ 唯一决定
			* 不进行时间分解的方法不体现时间局部性，如 `DeepONet-1910.03193v2` 及 PI 版本
			* 这里的样条空间上也有局部性，但与时间分解关系不大，倒是有助于算子表达空间依赖局部性和平移等变性
		* 2 这里的基底表达有参数到函数的双向映射 ((n32e9r))场的数值表征 
			* 原则上函数的时空分量可以选用不同表达方式，这里都用基底表达
			* 讨论时导师在考虑空间（其实对时间做区域分解即可）改用 NN，AE，AD 等参数化
			* 但用 AE、AD 参数化方式需要额外训练，可先训它再训时间演化算子，之后可联合训练
			* 这里的泛化能力来自空间上表达了依赖局部性与平移等变性，这要求特殊设计的参数化方式以使算子能够高效学出
		* 映射形式：这里的初值 $u_n$ 用 $c_n$ 表达，目标 $u_{[t_n,t_{n+1}]}$ 涉及 $(c_n,c_{n+1})$，故最终算子形式 $(c_n,\lambda_n)\mapsto c_{n+1}$
			* hypernet 之外的其他元学习架构也可，只是推断速度稍慢，不排除时间步可以增大
		* 若时间区域分解后对每个子问题用 PI-DeepONet 求解，则框架与这里十分接近
			* PINN loss 训练时间演化 NO
			* 区别仅在于 PI-DeepONet 输入函数用（空间）离散，输出函数用（时空）参数化，而这里统一用样条基底表达
	* 导师在思考能否和 PIAD 结合用于电磁模拟问题
		> 可能与 ((o6fn12))domDecmp 时间维区域分解对应？
* `OneShotNO-2104.05512`: #NO, #few-shot
	* 单样本训练一个（非常规）NO，只要求能处理小摄动；其中训练的单样本可自行选取
		> 由于使用迭代算法，不按照常规 NO 理解
	* "One-shot learning for solution operators of partial differential equations"
		* 2021-10-13 AISC li+1学长介绍
	* 要解 $u=G(f)$，允许自行生成一个 $f_T$ 计算 $u_T=G(f_T)$，根据这单个样本求 $u$
		* 通常 $f=f_0+\Delta f$，$u_0=G(f_0)$ 已知，只要求对小扰动 $\Delta f$ 推断
		* 可用于前向映射十分昂贵的情形，生成单个样本后可用于一系列微扰 $\Delta f$ 下的推断
		> 我能想到的允许“自行生成单样本”场景：实验生成的数据（但下面的生成方式没有连续极限？），已知模型前向映射计算过于复杂（例如为多个复杂映射的复合，高维，区域太大甚至无界等，但方法似乎不能用于无界）
	* 方法：1. 在网格上逐点 $U[-1,1]$ 生成 $f_T$
		> 没有对应的连续极限
	* 2. 学习邻域预测算子 $\tilde G:(u|\partial U(x),f|U(x))\mapsto u(x)$ or $(u|U_0(x),f(x))\mapsto u(x)$（限制在网格上）
	* 3. 用该算子 Jacobi 迭代求 $u$，初值 $u_0$
	* （讨论）认为其思想接近 void2void（> 拼错了？）；$\tilde G$ 形式相当于中心差分
		* 2021-10-29 CSI讨论导师提出是否有可能按 AD 流形解读，迭代理解为对 $z$ 优化
		> 但我感觉 FPN 框架不好这么理解；若解流形 $\{u_f\}$，这里的局部迭代中流形上初值 $u_0$ 被算子推到邻域的 $u_f$，但流形观点看不出有什么启发意义；考察 $\{(u_f,f)\}$ 联合流形也不怎么样
	* > (mine) 关于算子形式
		* 应假设了 $G$ 算子能用邻域整合方式描述；若正问题 $u\mapsto f$ 为平移不变的微分算子时是可以的
		* 生成 $f_T$ 的方式用于保证该邻域预测算子有充分数据，单样本做区域分解获得多样本；
		* 若微分算子与空间位置有关（如与 $f,u$ 无关的系数场），$\tilde G$ 的输入应该需要加上 $x$；
		* 没有用 $(f_0,u_0)$ 训练，似乎默认用随机单点数据训练后 $\tilde G$ 满足 $u_0$ 为 $\tilde G(u;f_0)$ 不动点，这样来看所得 NO 使用范围应不限于 $f_0$ 附近
		* 该版本无法对分辨率泛化，不排除改进后可以做到（如对方程有某种先验知识时之类）
		* 比较：Meta-MgNet 等学的迭代算子则是用传统迭代格式改进得到，非从数据中推测
		* 迭代格式类似 FPN 版本的普通 NO
		* 2021-10-29 CSI讨论有提到相似的工作 `2104.02452` 及后续，也为 FPN 格式，只是局部更新使用的区域看起来更大（空间区域分解后的一块，通过 AE 降维来压缩便于学习迭代方式）
	* 实验，非线性反应扩散方程，邻域 $U(x)$ 格点选取需要包括物理依赖域，否则效果不好
	* Nature Communication 2025 发表版本
		* fig1 学出局部解算子后，三种推理范式
			* 1. FPI：解迭代（最开始的方法），要求均匀网格，不断局部作用更新局部解
			* 2. LOINN：解用 NN 表示，各位置局部作用结果给出 loss；{_pa6f4d}
			* 3. cLOINN：预设 $u_0$，真解与 $u_0$ 的差用 NN 表示
* `MNO-2207.11417` 含时 PDE 空间粗尺度用传统无导数求解器，NO 表达修正项恢复细尺度贡献；架构基于 FNO
	* "Multiscale Neural Operator: Learning Fast and Grid-independent PDE Solvers", ICML2022
		> created on 2022-11-14
	* 方程 $u_t=N(u)$，设大尺度解由卷积算子 $G$ 给出（> 如磨光，或到粗网格的投影算子），磨光后的方程成为 $(G*u)_t=N(G*u)+[G*,N](u)$
	* commutator 形式的封闭项用 NO 表达 $K_\theta\approx[G*,N]$
		* （评）真正学的应该是其时间演化算子形式；此外看 loss 设置其实是希望 $K_\theta(G*u)=[G*,N]u$，这也更符合实际使用的目的（只在粗尺度计算）
	* 只在粗尺度算 $\bar u=G*u$ 时间推进，相当于给出了 surrogate
		* $N(\bar u)$ 项时间积分用传统求解器算，训练 NO 时不要求这里的传统求解器可自动微分
	* 架构选了 FNO，性质包括 grid 分辨率无关
		> 由于引入了交换误差的对称性和守恒性质这样重要的先验知识[96]，MNO的显式公式提高了可解释性和合并对称性和约束的容易性。
		> 利用FNO，我们利用了数据中的近似平移对称性，并为利用子网格参数化项的所有已知等式和不变性（如伽利略不变性[105]）的神经算子留下了新的机会，以供未来的工作。
* `MLevelML-1909.09448` 学 PDE 参数到可观测量映射（低维）；多 NN 拟合网格分辨率提高时数值解变化，以用多保真数据，降低数据生成代价；理论证明泛化误差界
	* "A Multi-level procedure for enhancing accuracy of machine learning algorithms"
		> created on 2022-11-28
	* （评）算 数据量不足的解决((n32b4n)) 中的多保真数据生成框架
		* `paramPDE%`“数据生成昂贵” 也可用本文框架；不过这里的做法学的不是解，故无法 NN 和传统求解器联合演进式训练
	* sec2.1 问题设定，含时 PDE 参数 $y$，可观测量 $L(y)=\int\psi(x,t)g(u(t,x;y))dx\,dt$ 为待学算子
		* （评）参数到可观测量的 NO，NO 不用于预测方程解
		* 在给定网格分辨率 $\Delta$ 下，数值算子 $L^\Delta(y)$
		* （评）含时问题故无法用多重网格加速计算；否则不一定要区分不同分辨率的数值算子
	* fig2 multi-level 训练设定：网格 $\Delta_l$ 从粗到细 $l=0,1,\dots,L$
	* alg3.2 第 $l$ 层网络学 $l,l-1$ 层数值算子预测的差
		* 具体地，选训练参数集 $y_1^l,\dots,y_{N_l}^l$（$N_l$ 随 $l$ 递减，即细网格数据少）
		* 网络拟合对象 $L^l(y_i^l)-L^{l-1}(y_i^l)$（> 不妨 $L^{-1}(y)=0$）
		* 所有 $l$ 的网络相加得 NO 输出
	* （评）各 $l$ 训练可并行，包括数据生成和训练
		* 但我认为这样的做法更高效：$l$ 从小到大串行训练，第 $l$ 个 NN 拟合对象换成第 $l$ 层数值解和前 $l-1$ 层 NN 求和结果（即第 $l-1$ 层预测值）
		* 这样做精度应该更高，粗层级网络的误差能在细层级网络得到补偿
		* 且总计算量变小（调用前 $l-1$ 层 NN 代价应小于第 $l-1$ 层网格上数值求解）；不过由于各 $l$ 不能并行，不保证一定有速度提升
		* 相关：不引入新 NN，只用高精度数据 fine-tune 原网络的做法见 `MLFT-2102.07169`
	* 定理，估计这种 multi-level 训练的泛化误差，并说明比 single-level 优越
	* sec4 考虑 forward UQ，即 uncertainty propagation
		* 设定：$y\sim\mu$，push-forward $\mu^\Delta=f^\Delta_\#\mu$ 为 $\R$ 上概率分布
		* 之前文献的 DLMC 算法，用 NN 作为 $L^\Delta$ surrogate 从而 MC 时能采样更多样本来计算；原文有复杂度分析
		* alg4.1 ML2MC（multi-level machine learning Monte Carlo），只是 surrogate 改用上面的 multi-level 办法训练
	* 实验，抛体运动，输入 7 维；机翼流场，输入 6 维
* `MLFT-2102.07169` （备用）利用多保真数据训 NO，逐步用更高精度数据 fine-tune；有用 NTK 的理论分析
	* "Multi-Level Fine-Tuning: Closing Generalization Gaps in Approximation of Solution Maps under a Limited Budget for Training Data" by Zhihan Li, Yuwei Fan, Lexing Ying
		> created on 2022-11-28
	* 系数场和解均有网格，只定义一个针对最细网格的 NO
	* alg2.2 算法：先在最粗网格 $l=1$ 数据上训，之后逐步用更细网格数据 fine-tune
		* fig2 NO 只接受细网格数据；对分辨率 $l$ 时的训练，细网格参数先下采样得粗网格参数，调用粗网格数值求解器得粗网格解，再插值得细网格解作为 label
	* 与 `MLevelML-1909.09448` 比较，fig4,5,6 示意图；似乎认为本文做法精度更高
* AFNO-2111.13587-知乎：FNO 在频域用 ViT
	* [2023-02-07](https://zhuanlan.zhihu.com/p/574157098)
	* 算法名 Adaptive FNO
	* token mixing 背景介绍
		> Vinilla ViT通过linear embedding将一个个patch映射为序列元素，这个过程也被称为token mixing。
		> 如何mixing这些patch将显著影响模型的效果。
		> 特别是针对高分辨率数据集，如果采用较大的patch size，则会丢失这些成分的相互关系的信息，
		> 如果采用较小的patch size，则又会出现序列较长的问题；
		> 除此之外，long range relationship也是也是十分重要的，不同的patch间的关系受mixing的方式影响比较大。
		> 因此需要一种更好的token mixing方法来去处理这些问题。
	> AFNO借鉴FNO的思路，采用在Fourier域下进行token mixing，将傅里叶域下的不同模态进行mixing。
		> 由于Fourier域具有global的属性，进而解决了long range relationship的问题。
	* 本文用于图像分类；后续 FourCastNet 将该架构用于科学计算任务
	* 后续：AFNO 代码解读
		* [2023-08-16](https://zhuanlan.zhihu.com/p/575265615)
		* （评）我理解的与 FNO 区别：
			* 输入升维部分，FNO 逐点升维，AFNO 是 patch 编码为 token¹（从而特征图长宽减少）{_n8hj56}
				* ¹用卷积实现，卷积核尺寸、stride 均等于 patch 大小；似乎是线性变换？
			* 频域的操作，FNO 线性变换，AFNO 相当于在这里分块、每块过 2 层 MLP；{_n8hm02}
				* 等价的说法：在频域乘分块对角矩阵、过 ReLU、再乘分块对角
				* 似为模拟 Transformer 的多头注意力机制，每块对角元相当于一个头
				* 实现细节：MLP 涉及的两个线性变换为复矩阵，乘法实际上是手动分别计算实部虚部
			* 与传统 ViT 不同之处：不同 patch（在中间层对应 feature map 不同像素）信息混合似乎不是靠注意力，而是 FFT 后对特征过（单隐层）MLP

