> 2022-01-05 从原版 `~/nutstoreFiles/research/slides/mine/20summer-AI+SC/AISC2.md` 修改而来
* `QuaSiModO-2102.04722` 最优控制问题求解算法，离散候选动作集合、训练可观测量演化 surrogate 后松弛为连续问题求解，相应误差估计
	* #PDE, #dynamics, #control, #surrogate, #error_bound, #open_source
	* "On the Universal Transformation of Data-Driven Models to Control Systems"
		> created on 2021-12-01
		* [作者的介绍视频](https://www.newton.ac.uk/seminar/34425/)
	* fig1 流程图
		> 似乎是：状态空间考察约简（POD、Koopman 等），控制空间考察“量子化”（离散点代替），约简之后算完再回来原空间
	1. eqn(I) 原问题，连续动作空间 $U$、完整状态变量 $y$ 的控制问题
		* 注意目标函数不依赖于 $u$，sec1.0:-1 对于推导理论泛化误差界有用
		> 但是 secB.4 里疫情控制的例子是依赖的
		* 假设控制变量在时间上为分片常数 $u_i$，故写为时间离散的形式
		> 以下我用的记号：$i<p$ 时间步，$j\le m$ 控制变量角标
	2. eqn(II) 量子化，动作空间离散为 $V=\{u^1,\dots,u^m\}\subseteq U$
		* 描述时间更新的 $y'=\Phi(y,u)$ 现在被 $y'=\Phi_j(y)$ 替代
		* sec1.3:1 最后优化的控制限制在了这个离散的空间（> 此外还有时间离散），限制了控制的自由度
		* 不过 sec2（理论部分）会说明这种限制对一大类问题够用了
		* 并且训练时实现（actuated）了所有 $V$ 中的输入，便于 online learning（> ？）
		* sec1.1:-1 若要理论上保证解的相似性，需要 $V$ 等于 $U$ 的凸包
			> 不过实验中 Burgers 的例子就不等于
	3. eqn(III) 状态变量约简为 $z=f(y)$（描述哪些量可观测）
		* #Koopman, #reservoir
		* 只涉及可观测量的时间更新模型 $z'=\Phi_j^r(z)$
			> 注意后文实验部分用到 RNN，会依赖于更早的时间信息
		* 单步目标函数 $P^r(z)$，sec1.2.0:-1 不依赖 $y$ 的其余部分
			* 这一假设不算强，因为目标函数一般基于可观测量给出
			> 观测不到的部分一般不会影响效用；至少可以把效用 concat 进 $z$ 里
		> 如果 $f$ 描述观测而非人为约简建模，我觉得时间迭代不应该用单步方式表示，可能用 RNN 这样有记忆的方式会更好；实验确实有出现
		* 实验中用到的 surrogate：Koopman，POD，LSTM，reservoir computing
			* p21:-1 POD 需要系统完全可观测 $z=y$
		* sec1.2.0:2 训练 $\Phi_j^r$ 需要生成数据（模拟或者实验）
			* 要么生成一个（长）时间序列、其中各步动作随机选取
				> 若使用 RNN surrogate，似乎必须是这个选项
			* 要么生成多个（短）时间序列，每个 $V$ 中动作对应一个
				* 实验只有 COVID-19 用了这个策略
		* secA.4:-1 使用有记忆的 RNN surrogate 时，输入为多时间步
			* 针对 $u^j$ 的 RNN 训练数据，输入的历史序列对应任意控制序列（不是都用 $u^j$），仅下一步的产生用 $u^j$
			* secA.3:-1 reservoir computing 各 $j$ 共享随机系数矩阵 $W$，仅可训练的输出矩阵相互独立
				* （训练时）启动需要预热
			> 使用阶段（给定 $\alpha$ 生成 $z_i$）猜测是所有 $j$ 对应的 RNN 都同步接收新 $z_i$ 并预测各自的 $z_{i+1}$，通过 $\alpha_i$ 组合后得到最终 $z_{i+1}$ 再由所有 RNN 同步接收；
			* > (mine) 对训练方式的猜测：
				* 输入一长串观测序列，但只在当前控制为 $u^j$ 时对当前预测求 loss
				* 各 $j$ 对应的 RNN 可并行训练
				* 可能遇到多步输出之后才有一步提供 loss 的问题，是否导致训练不稳定？
				* RL 中也有 reward 出现晚的问题，也许可以参考其中的解决方案？
				* reservoir 的不稳定问题应该不大，隐状态更新不可学习
		* sec1.2.1 eqn(2) 假设有已知的误差 $|f(y)-\bar z|$ 随时间迭代增长速度的表达式（实验中有具体形式）
	4. 求解 (III) 给出的 surrogate-based 问题，三种做法
		* eqn(III-$\omega$) 等价为整数规划问题，$\omega_i\in\{0,1\}^m$（加了约束后其实是 one-hot 向量）表示当前步骤采用哪个动作，时间推进写为 $\Phi_j$ 的线性组合
		1. sec1.3:1 直接求解组合优化问题（动态规划等），仅适用于控制参数少的情况
		2. eqn(IV) one-hot $\omega_i$ 松弛为 $\alpha_i\in[0,1]^m$，p5:-1 对于 control-affine 系统、且 $U$ 为凸集时，直接用 $\alpha_i$ 给出的 $V$ 元素凸组合作为最终选用的控制变量
			> (II) 中离散化后这里又连续化，我在下方必要性部分有解读其意义
			* fig5(b) 非 control-affine 系统上精度较差，不如 SUR 方法
		3. 一般系统还是只用 $V$ 的元素作为最终控制变量，松弛问题 eqn(IV) 的解要恢复成组合问题的解
			* eqn(3a-c) 采用 SUR (sum up rounding) procedure，希望每个 $V$ 中动作的历史总采用次数和松弛问题下的相当，即 $\sum\omega_{kj}\approx\sum\alpha_{kj}$ （对 $1\le k\le i$ 求和，$\forall i$）
			* p5:-1 附录的实验表明在 control-affine 问题下二者表现差不多
	* > (mine) 方法中各部分的必要性：
		* 问题场景的分类：观测是否完整（$z=y$ 与否），生成数据用模拟或实验（动力学是否已知）
			* 实验收集数据时假设了可以任取控制变量来观测；更多情形暂不考虑
		* (I) 对控制变量 $u$ 的时间离散：默认（否则不好求解）
		* (IV) 对离散系统用松弛法求解：默认
		* (II) 对 $u$ 的空间离散（相当于说明 (II) 离散后又在 (IV) 中松弛转回连续问题的意义）：
			* 若不然，surrogate 形式为 $\Phi^r(z,u)$
			* surrogate 设计难度增大、保证拟合精度有难度
			> 若对 $u$ 用 ((n3hg7a))1TaskHypernet 的框架也许可简化，算是部分回到了 (II) 做法
			* 对 $\alpha$ 的优化变为对 $u$ 直接优化，BP 时还需要显式计算对 $u$ 的梯度（用了 (II) 后只需要对 $z$ BP）
			* 生成的数据要保证 $\Phi^r(z,u)$ 拟合精确，这就需要采样更多的 $u$，实验或模拟的代价增大
		* 这种空间离散似乎对最终精度影响不大（实验里离散化都很粗放）
			* 似乎是时间步长不太大时，可以通过控制一段时间内 $u$ 在各离散点的切换频率，从而在平均意义上得到某种凸组合
				> 类似开关电源；不过这里没有电容高通滤波器之类的东西
			* 猜测需要 $u$ 的凸组合能够近似对应 $u$ 所起效果（$\Phi(y,u)$）的凸组合，至少按分量单调时可以
			* 也许理论部分有相应误差保证，还没仔细看
		* (III) 使用 surrogate；若不然，只能靠模拟替代（否则总要靠学习给出时间演化模型）：
			* 应用场景局限于 $z=y$ 且动力学已知
			* 速度慢了；注意每次更新 $\alpha$ 后，在每个 $z_i$（也更新了）处都要对所有的 $u_j$ 重新模拟，并且模拟时间步小于 $u$ 时间离散时间步以保证精度
			* 对 $\alpha$ 的优化需要用到 $\partial z_{i+1}/\partial z_i$，模拟算法 BP 困难
			* 如果还不进行 (II)，则 BP 还需要对 $u$ 进行
	* sec2 误差的理论分析
		> 先跳过，暂未看细节
		* (II) 量子化的误差
			> MPC：model prediction control
		* (III) 建模误差
		* (IV) SUR 误差
		* sec2.4 一个直观的例子：Duffing eqn，p12:-2 控制目标为抑制运动 $P=\|y\|$
			* fig2(a) 初值 $y^0=(0,1)$，真实最优控制与数值解的误差
				> 蓝色、红色应该分别代表 control-affine 做法和 SUR 做法
			* 使用完整状态空间；为引入建模误差，人为在模型里添加 $\epsilon$ 项
	* fig3 secB 实验，eqn(hat IV) 使用 tracking objective，实际观测与 $z_i^\text{ref}$ 尽量接近
		* 接近程度加权 $Q$（半正定矩阵）
		> 通过 $z^\text{ref}$ 给出的目标函数和反问题一致，但这里可能拟合对象本来就没有相应的 $u(t)$
		* secB.1 Lorenz 系统第二个分量加控制，希望第二分量拟合正弦曲线（fig3 拟合方波）；
			> (?) table2 里问题参数，$p$ 是什么含义，似乎不是控制问题的总离散时间步？
			* surrogate 用 Koopman EDMD，特征为三次单项式
			* fig5(a) 如果控制变量线性输入，则用 $\alpha$ 对 $u$ 线性插值精度略好于 SUR
			* fig5(b) 控制变量非线性输入时，线性插值精度明显变差，SUR 还行
		* secB.2 Burgers $z=y$ ref 为恒 0（stablize 问题），控制为分片（5 片）常数源项
			* POD 做 surrogate；离散控制 $V$ 取原点和每维度两端点（其他维度 0）
		* secB.3 COVID-19 疫情控制，建模为 8 类人群占比变化满足方程，带噪声 SDE
			* 控制参数为简便取 $\alpha=\gamma$ 只控制单参数，越小表示措施（社交距离、封锁）越严格
				* 本身就是离散取值，4 种可能；控制的时间步长为一周
			* 目标函数 3 项
				* 当前总感染人数（> 写错了？应该是和平方，而非平方和）
				* 重症人数少于 ICU 床位
				* 严格措施带来的代价（> 从而目标函数显式涉及控制参数）
			* $z$ 去除了目标函数不涉及的分量，剩 5 项
			* Koopman DMD 建模（> 反正本来也是线性 SDE）
		* secB.4 圆柱扰流，可观测为升力阻力，控制目标升力正弦变化，控制为圆柱转速
			* LSTM surrogate
		* secB.5 Mackey-Glass delay 微分方程（含时间延迟项），似乎与医学造血细胞复制有关
			* "a benchmark for predicting chaotic delay systems"
			* ODE 无控制时有混沌性质；$z=y$，控制源项，目标为稳定值 $y=1$
			* 使用 reservoir computing 建模
	* 2021-12-08 AISC 讨论：
		* 可能贡献在于先转化为一个离散优化问题再切换回连续的优化问题，更常见的做法还是直接连续优化
		* 关于 surrogate $\Phi^r$，RL 中其实只要求它在最优控制路径 $u$ 附近能够准确预测，这里实际上要求全局的精确性
		* RL 场景其实不好假设 reward $P(y)$ 只根据 $z$ 即可确定，是执行一步动作之后，下一步由环境返回一个 reward，它由完整状态 $y$ 生成，不只依赖于 $z$（信息不足的问题）
		* 导师觉得其实用 RL 已经能比较好地处理这一类的问题
* `1-s2.0-S1270963821006118` 多目标的机翼设计，先 GAN 表达可观测量的可能范围，然后根据设计目标选某个可观测量，再找出相应翼形
	* #CFD, #airfoil, #inverse_design, #GAN
	* "Deep learning based multistage method for inverse design of supercritical airfoil"
		> recommended at `2021-12-11`(CSImeet2)
	* 基本记号与关系：$x=(x_1,\dots,x_p)$ 机翼形状（用坐标表示）
		* $c$ 翼形参数化，eqn(11) $x=h(c)$（似乎仅在生成训练数据时用到）
		* $y=(y_1,\dots,y_q)$ 可观测物理量 CP（pressure coefficient）
			> 猜测是压强在机翼表面的分布
		* $F=T(y)$ 设计目标（多个）；sec4.2 几个例子，如压强梯度、激波位置与强度
		* 正问题 $x\mapsto y$ 与数据生成：eqn(13) 网格生成 $V=\Theta(x)$
			* eqn(14) RANS CFD 求解流场 $w$：$R(V,w)=0$
			* eqn(15) 压强提取算子 $y=\Upsilon(V,w)$
		* 反向映射 $f:y\mapsto x$ 直接由 CNN 给出
	* fig2 流程图，3 步
	1. 用 GAN 表达物理上可能的 CP $y$ 的分布
		> 即 $x\mapsto y$ 的像集
		* $y=g(Z;\theta)$，训练集另有所有可能的 CP eqn(6)
		* 相关：`2005.08832`(MR) 只考虑单个 $G$ 的设计问题，故可以用 GAN 直接生成设计目标（即本文的 $x$）；本文还考虑目标调整后的设计，这时生成 $x$ 的模型就需要重训
	2. 从物理上可能的 $y$ 中挑出符合设计目标 $F$ 满足要求的单个 $y$
		* 使用 GA（genetic algorithm）找出合适的隐向量 $Z$ 输入 $g$
	3. 找出这个 $y$ 对应的 $x$，方式为直接训练反向映射 $x=f(y;\phi)$
		* eqn(9) 训练数据为 $(x,y)$ 样本对
		> 如果只要找出某个 $y$ 对应的 $x$，训练对所有 $y$ 都精确的 $f$ 是否低效了一点；
		> 不过本文优势似乎在改变设计目标时，1,3 步无需重做，从而高效
		* 导师：这种做法某种意义上似乎有一些简单直接；另一篇 "Learning the aerodynamic design of supercritical airfoils through deep reinforcement learning" 只针对这一步，但用了 RL，更精细
	* sec4.2 过往经验表明，多目标优化可通过限制 CP feature $y$ 来隐式达到
* `DeepGreen-2101.07206` 非线性方程 AE 变换为线性方程，Green 函数表达的解在离散化下为矩阵乘法
	* #NO, #Green_func
	* "DeepGreen: Deep Learning of Green's Functions for Nonlinear Boundary Value Problems"
		> recommended at `2021-12-29`(AISCmeet)，以下原文位置按已发表版本标记
	* 原问题：非线性方程 $N[u]=F,B[u]|\partial\Omega=0$；希望坐标变换后为 $L[v]=f,\hat B[v]=0$ 线性方程，解可用 Green 函数写为 $v(x)=\int G(x,y)f(y)\,dy$
	* 离散化问题的计算，AE $v=\psi(u),f=\phi(F)$（均同时训练逆映射），待训练参数还有矩阵 $L$
		* loss eqn(21-26) 除了 AE loss 还要求变换后线性系统由 $L$ 给出、$L$ 线性、$u\mapsto F,F\mapsto u$ 映射的准确程度
		> $L$ 是矩阵故自然是线性的，额外针对 $L$ 线性给出的 loss 理论上多余，可能是试出来的经验做法，也许起到了正则化效果
		* （会议上评论）转化为线性系统的想法类似 Koopman（> 不过这里不涉及时间迭代，用处较原版 Koopman 小？）
	* 实验都考虑的一维问题，二维结果已经不是很好
* `HiDeNN` TODO
	* #PINN, #FEM, #multiscale
	* "Hierarchical Deep Learning Neural Network (HiDeNN): An artificial intelligence (AI) framework for computational science and engineering"
		> `2021-12-29`(AISCmeet) 的前序工作
	> TODO: summary, comparison tree, link, (broader impact?)
	* > 待确认的关键点：
		* 可统一数据、物理机制的占比，纯数据和纯物理都行？（对应 MOC 位置？）
		* NN 表达的 FEM 空间容易实现 adaptive mesh 这个不难理解，不过与 ((o6fn12))domDecmp 的关联是啥，二者都是 PINN+FEM？
		* fig9 multiscale 怎么实现的？
		* 会议讨论的后续工作 HiDeNN-TD 处理了什么问题
* `SelectNet-2001.04860` PINN loss 大的地方增大权重，权重使用额外网络生成，训练成为 minimax 问题
	* #PINN, #adaptive_loss
	* "SelectNet: Self-paced Learning for High-dimensional Partial Differential Equations"
		> 2021-12-31 组会群里lyp提到
	* eqn(3.1) 图像分类问题里的自步学习 $\min_{\theta,v}\sum v_iL(y_i,\phi(x_i;\theta))-\lambda v_i$，难的样本不参与训练
		* eqn(3.3) 改用网络推断权重 $v_i=\phi_s(x_i)$（参数 $\theta_s$）
	* p5/23:-2 PINN 各点权重选取的要求（权重也通过网络生成）：
		1. 权重非负有界；末层用有界激活函数，再平移一下即可
		2. 训练初期不应有 strong bias；随机初始化即可保证
		3. 训练后期在 loss 大的地方权重大；在下方说明
		> 直接把权重当成参数而非网络生成：相关消融实验在 sec6.1.2
	* 权重选取：
		* 在 $\phi_s^1$ 积分平均为 1 的约束下，取 $\max_{\phi_s^1}\mathbb{E}_x\phi_s^1(x)|Du-f|^2$
			> 文中其实是对 $\theta_s^1$ 的优化；我认为写成这种形式以后效果接近 $L^\infty$-loss
		* 边界项 $\phi_s^2$ 同理（sec5.2 对 Dirichlet 边界直接通过网络设计保证）
		* 约束改惩罚项可得 eqn(3.10)
		* 最后 eqn(3.11) 形如 $\min_\theta\max_{\theta_s^1,\theta_s^2}$，成为 minimax 问题
		* eqn(3.12) 另一种方式：$\max_{\phi_s^1}\mathbb{E}_x[\phi_s^1(x)|Du-f|^2]/\|\phi_s^1\|$
			* 但这种方式对范数与超参数选取敏感，实际效果较差
		> 除了这里的增大采样点权重之外，另有局部增加采样点数目的方式，不过对高维问题（如 sec6.2 测试的）可能不如这里的方法
	* sec4 误差估计的定理
		> 大意好像是：限制在 NN 表达的函数空间里，原版训练方式和这里的 minimax 有相同误差界
	* sec5 实现细节：
		* sec5.3 若激活函数不可微，需要有限差分代替 BP 精确求导 eqn(5.9)
			> 低维问题似乎一般用 sin 激活，而高维不适用有限差分，感觉都用不上
	* （评）PINN 对抗法表达 $L^\infty$-loss 汇总于 ((n3pj3j))coordLoss，包括权重生成、采样点生成、采样点更新
* `2206.02016` （备用）高维非线性方程 PINN 用 L2 loss 不对，对 HJB 方程有定理；改 $L^\infty$-loss，可通过对抗更新采样点位置实现
	* "Is $L^2$ Physics-Informed Loss Always Suitable for Training Physics-Informed Neural Network?"
		> `2022-08-19`(lectures) 王立威 CSML2022 报告中提到
	* def4.1 称方程关于 $(Z_1,Z_2,Z_3)$-范数稳定，若 $\|u^*-u\|_{Z_3}=O(\|Lu-f\|_{Z_1}+\|Bu-g\|_{Z_2})$；{_o6ea85}
	* thm4.3（充分条件，informal）HJB 方程 $(L^p(X_T),L^q(X),W^{1,r}(Q))$-稳定（$Q\subset X=\R^n$ 有界），若 $p>n,q>kn$，$r$ 不太大（$k$ 形式等细节见原文）
	* thm4.4（必要条件，informal）HJB 方程不稳定，若 $p<n/4$；具体地可使 $Bu=Bu^*$，$\|Lu-f\|$ 任意小，$\|u-u^*\|$（紧支且）任意大，$r$ 任取
	* 使用对抗训练方式表达 $Z_1=Z_2=L^\infty$-loss：采样点更新，方向沿相应 loss 正梯度（这里单点 loss 可用 l2），要投影回 $\Omega,\partial\Omega$；{_o6ea7k}
		* （评）最后形式上仍是据 L2 loss 更新，不过采样点给出的新测度作用确实相当于 $L^\infty(\Omega,\partial\Omega)$
		* （评）PINN 对抗法表达 $L^\infty$-loss 汇总于 ((n3pj3j))coordLoss，包括权重生成、采样点生成、采样点更新
* `DEBOSH-2109.13337` BO 用于形状优化，用 mesh 上的 GNN 给出 surrogate
	* #BO, #inverse_design/#shape_optimization, #GNN
	* "DEBOSH: Deep Bayesian Shape Optimization"
		> recommended at `2022-01-07`(CSImeet2)
	* sec3.3:2 记号：$z$ 待优化形状的参数化，$x=P(z)$ 三角形 mesh
		* $y$ 预测的物理量，$r=R(y)$ 最终优化目标
		* $g:z\mapsto r$：用 PDE solver 给出 $x\mapsto y$；$\hat{g_\Theta}$：用 CGNN 给出
	* 使用 BO（Bayesian Optimization）找最优 $z$
		* 带 UQ 的 surrogate 取为 MC-Dropout 和 Deep Ensembles（均有引文），后者需训练多个网络
		> surrogate 应该只涉及 GNN，从而这是描述了一个随机的 GNN
		* eqn(1) 使用 EI（Expected Improvement）算法选取下一步的 $z$ 用于训练 surrogate
	* 实验：
		* 机翼形状优化，$z$ 使用 NACA 参数；
			> 猜测 NACA 参数为翼形的一种参数化方式
		* 汽车风阻极小化，$z$ 使用 DeepSDF 方式给出
			* 第二个实验使用 `MeshSDF` 优化 $z$
		* 材料形状设计，极小化最大应力，$z$ 给出控制点后 RBF 插值描述形状
* `MeshSDF` 形状优化中有目标函数对 mesh 顶点位置的梯度，试图反传至对整体形状的梯度
	* #AD, #inverse_design/#shape_optimization, #SDF
	* "MeshSDF: Differentiable Iso-Surface Extraction"
		> created on 2022-01-10, 被 `DEBOSH-2109.13337` 引用
	* 曲面用 SDF 表达，AD 方式描述 $f_\theta(z,x)$，从而形状优化成为对 $z$ 的优化
	* mesh 顶点集合 $V$，梯度 $\partial L/\partial z=\sum_v\frac{\partial L}{\partial v}\frac{\partial v}{\partial z}$
		> 没有像原文拆分 $\partial v/\partial z$
		* thm1 根据几何意义得 $\partial v/\partial z=-(\frac{\partial f_\theta(v,z)}{\partial v})^\mathrm{T}\frac{\partial f_\theta(v,z)}{\partial z}$
		> 注意隐函数求导不完全适用，给定 $z$ 下所有 $v$ 组成一个曲面，不是单点，从而不是 $v(z)$；
		> $\partial v/\partial z$ 解不唯一，上面那个可验证是解，且是 $\|-\|_F^2$ 最小的解；
		> 用到了 $\|\partial f_\theta/\partial v\|=1$
	* alg1 MeshSDF 的前传：给定 $z$，用 marching cube 算法生成 mesh $(V,F)$
	* alg2 反传，输入 $\{\partial L/\partial v\}_v$ 输出 $\partial L/\partial z$
	* 实验：单视角曲面重建，形状优化减小汽车风阻
		> 曲面重建属于反问题，正问题是给定曲面后在一个角度拍照；问题本身多对一，而 $f_\theta$ 训练后 $z$ 表达了可行的曲面集合，{避免重建出不符合常识的曲面}
* `2105.08633` NN 学出物理降阶模型封闭（本构方程），理论收敛性证明，并用流体 RANS 湍流封闭模型测试
	* #CFD/#RANS, #theory, #adjoint_eqn
	* "PDE-constrained Models with Neural Network Terms: Optimization and Global Convergence"
		> created on 2022-01-13
	* 降阶模型封闭/反问题：目标函数 $J=\|u-h\|^2/2$，约束 $Au=f(x;\theta)$，Dirichlet 边界条件
		* 文中假设了 $A$ 二阶椭圆算子
		* eqn(1.3) adjoint PDE（关于 $\hat u$），内部为 $A^*\hat u=u-h$，同样 Dirichlet 边界
		> Dirichlet 边界下才有 $\langle\hat u,Au\rangle=\langle A^*\hat u,u\rangle$；
		> 注意对于给定的 $\theta$，该约束 PDE 解存在唯一，从而不算 Lagrange 乘数法（可行域为单点）；但它又可对任意 $\theta$ 定义（并用于计算 $\nabla_\theta J$），从而也不能按照关于 $(u,\theta)$ 的约束优化问题理解
		* eqn(1.6) 梯度计算 $\nabla_\theta J=\langle\hat u,f\rangle$
		* > (mine) 从而算一次梯度的流程：根据 $f$ 解 $u$，据之解对偶变量 $\hat u$，然后求梯度
			* 可用前向微分推导：$\dot J=\langle u-h,\dot u\rangle=\langle A^*\hat u,\dot u\rangle=\langle\hat u,A\dot u\rangle=\langle\hat u,\dot f\rangle$
			* 不过这样看来只是在凑 $u-h=A^*p$ 的形式，不知应该如何直接看出来这东西来自 adjoint 方程
	* 主要定理：用连续时间梯度下降训练，令 $f$ 层数 $N\to\infty$，训练时间 $t\to\infty$，则 $J\to 0$
		> 本文其实主要是理论文章，不过我不太关心这部分
	* sec3 例子：流体 RANS 模型的 turbulence closure（尽管它是非线性方程，不符合定理假设）
		* sec3.3.1 传统模型 $k$-$\epsilon$ model（eddy-viscosity），sec3.3.2 本文考虑用 NN 表达其修正项
		* fig3 在 staggered mesh 上用二阶中心差分格式求解所得的 RANS 模型，发现 NN 修正模型计算的流体平均速度更接近数据集
* `2011.00568` 摄动问题解流形维数低于网格格点数，区域分解，每区域用预先生成数据 kNN 线性插值给出近似解，整体迭代；不涉及 NN 的流形学习
	* #manifold-learning, #domain_decomposition, #multi-scale
	* "Manifold Learning and Nonlinear Homogenization"
		> created on 2022-01-15
	* $N^\epsilon u^\epsilon=0$，边界 $u^\epsilon=\phi$ 刚性方程（如高振荡），传统格式需要精细网格
		* 鉴于极限方程 $N^*u^*=f$ 与 $\epsilon$ 无关，所需网格规模 $N$ 有限，从而解流形至多 $N$ 维
		* sec1.2:1 从而原方程近似低维（即使细网格），用该观点解决 $\epsilon$ 小带来的问题
		* sec1.2:2 方式：预先计算小规模的 effective solution set
		* sec1.1:-1 不假设知道极限方程的形式
	* 区域分解 $\Omega=\bigcup\Omega_m$（有 overlap）及单位分解 $1=\sum\chi_m$
	* offline 阶段：再适当扩大区域得 $\tilde\Omega$ 以避免边界层
		* 随机采 $N$ 个 $\|\tilde\phi_m\|\le R_m$ 的边界条件，用 FDM/FEM 解得 $\tilde u_{m,i}$
		> 没有考虑对不同 $\epsilon$ 泛化的问题
		* sec2.1:-1 全区域边界 $\phi$ 固定，不采样
		> 这里似乎只致力于求解单个方程，但我觉得全区域边界也采样的做法完全可用于做一般的 NO
		* 记录字典 $\{(\phi_{m,i}=\tilde u_{m,i}|\partial\Omega_m,u_{m,i}=\tilde u_{m,i}|\Omega_m)\}$
		> 如果 $N^\epsilon$ 空间平移不变，只生成单个区域的就行了
	* sec2.2 online 阶段，每区域给定边界 $\phi_m$
		* 在字典里找 $k$ 邻域、求最小二乘系数、线性组合给出 $u_m$ 估计
			* $k$ 邻域估计了解流形的切空间
			> 线性组合估计的误差是否会导致迭代不动点位置不对，从而解不准？虽然从实验结果来看还行
		* 所有区域解完后，对区域 $m$ 用相邻区域估计解的信息给出更新的 $\phi_m$，再解
		* 如此迭代（Schwarz iteration），收敛后最终结果 $u=\sum\chi_mu_m$
	* 实验：高振荡介质的 semilinear 椭圆方程，非线性辐射输运方程
* `2110.13361` 元学习用于 PINN：hypernet（事实上用 RBF 等而非 NN）求 NN 初始化参数，有监督训练 hypernet；主网络仍为普通 NN
	* #PINN, #meta-learning/#hypernet
	* "Physics-Informed Neural Networks (PINNs) for Parameterized PDEs: A Metalearning Approach"
		> created on 2022-01-20
	* alg1 训练算法：
		* 先找出 PDE 参数空间中心点，寻找相应 PDE 参数下的最优 NN 参数 $w^C$（> 常见记号 $\theta$）
		* 假设：若用 $w^C$ 初始化来训练，PDE 参数到最优 NN 参数的映射光滑
		* PDE 参数空间采样 $K$ 参数 $\xi_j$，以 $w^C$ 为初始化训练找最优 NN 参数 $w_j$
		* 用 $\{(\xi_j,w_j)\}$ 数据训练预测模型 $\xi\mapsto w$
			> loss 不涉及常规任务的网络（main net），与常见 hypernet 不同
		* 对新任务 $\xi$ 用 $w(\xi)$ 作为初始化参数开始训练
	* 预测模型选取：
		* GP（高斯过程），映射输出多元而非一元的版本：
			* multi-task GP（注意这里的 task 是不同输出分量，不是不同 PDE 参数给出的元学习任务）
			* LMC（linear method of coregularization/linear model of coregionalization，原文给了这两个不同的），有时也叫 PCA-GP：假设最终映射为基函数的线性组合，每个的系数是 GP，各系数独立生成
		* 数值逼近器：三次样条（针对 $\xi$ 一维或二维情形），RBF（测试了立方、高斯、multiquadric 这些选择），多项式
	* 实验，将 MAML 作为基线
		* Adam 效果差于 L-BFGS
		* MAML 效果不如本文方法，前几个算例在 L-BFGS 上甚至不如随机初始化
* `1910.09098` BO 学 PINN 及随机版 sPINN 超参数，用于正反问题，反问题涉及数据 multi-fidelity
	* （原文关键词）#PINN, #aPC, #multi-fidelity (data), #UQ, #BO, #inverse_problem
	* "Learning and meta-learning of stochastic advection–diffusion–reaction systems from sparse measurements" by George
		> created on 2022-03-10，备用
	* 非线性对流扩散反应方程；随机方程用两个 NN 分别表示扩散率均值、KL 展开 mode
* `FourCastNet-2202.11214` ViT 内注意力换为 FNO，用于天气预报
	* "FourCastNet: A Global Data-driven High-resolution Weather Model using Adaptive Fourier Neural Operators"
	* 详细记录见 `2022-03-16`(dbGrpMeet2)
	> 之前和CSI合作手机电磁参数预测，patch 用 AE 编码降尺寸后再过 CNN，这里降尺寸的为 ViT 主干（待确认是无解码的简化版，还是预训练 MAE 的强化版），后续处理 CNN 换 AFNO
	* [微信介绍](https://mp.weixin.qq.com/s/60ujv8qDE0T-puePOFH5JA)
		* 选择 ViT 骨干的原因是它能够很好地建模长程依赖
		* 可以解析细粒度的特征，并能够很好地随分辨率和数据集大小扩展
	* (CSImeet2) 2022-02-28 微信讨论，导师：
		* 或可考虑用 PDE-Net 学，IFS model 里 $F,Q,M$ 都应学
		* 感觉 multi-head attention 会比 FNO 更好一些，能更好地学出复杂流体特征；FNO 价值感觉在 nonlocal，但或许 MSA 更合适
		* MSA 属于 dynamic nonlocal weighting，AFNO 不是 dynamic 的，有本质区别
* `2202.05122` 学流体 RANS 封闭模型，用无导数的集成 Kalman 优化
	* #CFD/#RANS, #Kalman, #UQ
	* "Ensemble-based learning of turbulence model from indirect observation data"
		> created on 2022-03-18
	* fig1,11 整体框架：选 RANS 模型权重 $w$ 分布，求解并后处理得可观测量，与观测数据比较并更新 $w$
	* eqn(1,2) RANS 模型需给出 Reynolds stress $\tau=a+2kI/3$ 表达式，湍流动能 $k$ 提供各项同性项
		> 回忆 RANS 为不含时方程 $L[u,\tau(u),p]=0$，给定封闭模型 $\tau(u)$ 后可解出 $u$
		* eqn(3) 基于张量基的 ansatz $a=2k\sum_ig^{(i)}(\theta_1,\dots,\theta_5)T^{(i)}$
		* 保伽利略不变性，张量基构造：$S,W=k(\nabla u\pm\nabla u^\mathrm{T})/2\epsilon$，$T^{(i)}$ 由 $S,W$ 的多项式给出
			* secA $k,\epsilon$ 在湍流输运方程中解得（> 可见 2202.08342 eqn(4,5)）
		* 标量不变量 $\theta_j$ 构造，$\theta_1=\mathrm{tr}S^2$ 等
		* p7:0 该表示方式做了 3 个假设
			1. Reynolds stress 可被标量不变量、独立张量局部地表示；sec1:3 物理上需要弱平衡假设
				> 不同于 `2021-08-08`(lectures) 单点 $\tau$ 依赖于邻域中的 $u$，nonlocal；
				> 不过本文提出的算法足够一般，完全可用于 nonlocal 的 ansatz
			2. Reynolds stress 在张量基上的投影可被 NN 表达
			3. 特征相似的流动可用一个通用模型描述
		> 似乎依赖于 $u$ 的单点取值而非邻域取值？待确认
	* > (mine) 试用 `[Kalman滤波]` 框架叙述
		* 流体观测性质为 $y$（我觉得不应该有角标 $j$），设某个参数 $w$ 对应的 RANS 网络能表达该性质
			* sec2.0 传统 ensemble Kalman 用于推断系统状态，这里不同
		* $p(w)\sim N(\hat w,P)$，$p(y|w)\sim N(Hw,\gamma R)$，则后验 $p(w|y)\sim N(\hat w',P')$，$\hat w'=\hat w+K(y-H\hat w)$，$P'=P-KHP$，$K=PH^\mathrm{T}(HPH^\mathrm{T}+\gamma R)^{-1}$
		* 若 $w$ 分布用类似粒子的方法估计，则可这些样本点估计方差 eqn(9) $P=S_wS_w^\mathrm{T}$，更新均值改成独立更新各粒子 $w_j'=w_j+K(y-Hw_j)$
		* 观测矩阵 $H$ 也用粒子方法估计（$\mathcal{H}:W\to Y$ 的局部线性化/Jacobian，这里不靠 BP，而是粒子方法）：$(y-\mathcal{H}(w_j))$ 组成矩阵 $S_y$，令 $S_w=HS_y$，用时无需显式解出
			* eqn(7)+1 算符 $\mathcal{H}$ 表示 NN 模型、RANS 求解、后处理（观测量计算）的组合
			* $S_w,S_y$ 定义在 secA
		* 不断用同一公式更新对 $w$ 的分布估计，从而成为解反问题的迭代算法；无显式求导，但用粒子给出 梯度、Hessian 的估计，为近似二阶算法
			* secB Kalman 更新矩阵恰好对应二阶的牛顿法的说明
		* secA ensemble 方差小于观测误差后可结束迭代
	* eqn(8) 自适应步长 $\gamma^l$，根据已有文章
		* eqn(9+1) inflation 系数控制预测与真实差异、正则化项之间权重，文中 $\gamma^l=\beta^lS_y^l:S_y^l/\mathrm{tr}R$，$\beta^l$ 随迭代步数变化（> 与当前解形态无关）
		* secA $\beta^l$ 选取中可出现子迭代，初始值 $\beta=1$
			* 若更新后的 $w$ 使数据拟合程度变高，则接受更新（不继续子迭代，并减小 $\beta$）
			* 否则增大 $\beta$（> 假设有更大的观测噪声）并重算 $K$；这样迭代最多 5 步
			> 像信赖域算法里动态改参数的方式
	* table1 与之前工作的比较（DNS：直接数值模拟）：
		* 用 DNS 算出 $\tau$ ground-truth 用于训练 RANS 网络，loss $J=\|\tau^w-\tau^\text{DNS}\|^2$
			* 梯度下降更新 $w^{l+1}=w^l-\beta(\tau^w-\tau^\text{DNS})\partial\tau^w/\partial w$，无粒子
			* 不足：$\tau\mapsto u$ 对应关系病态，$\tau$ 准不意味着 $u$ 预测准，而目标是 $u$ 准
				* eqn(2.10) 计算 $\tau$ 所用的 $S,W$ 特征也来自 DNS（其余方法直接由 RANS 给出）
			* sec1 这种病态性在高雷诺数问题中尤为突出；且获得 $\tau$ 数据只在高保真模拟（仅可用于低雷诺数）可用
				* 还是希望能利用间接观测数据（速度，阻力等）
		* 基于伴随的更新 $J=\|u^w-u^\text{DNS}\|^2$
			* $w^{l+1}=w^l-\beta(\partial J/\partial\tau)(\partial\tau/\partial w)$
			* eqn(12)+1 $\partial J/\partial\tau$ 用伴随方程解，$\partial\tau/\partial w$ 用 BP
			> 为 PDECO 问题 $\min J[u]$ s.t. $L[u,\tau(u;w)]=0$，原则上隐函数求导可推出梯度表达式？
			* sec1:-3 缺乏鲁棒性，不擅长处理本文实验的分离流
				> 看原文其实处理了这个场景，但是自变量只输入了 $\theta_1$，没有其他的；
				> 可能就是因为输入更多会炸，也可能是因为那里用了完整流场，而像这里用部分观测会加剧不稳定
			* sec1:-2 侵入式，需编写 adjoint solver，sec5.2 有多种不同可观测量还需编写多个
		* 基于 ensemble 的梯度近似，eqn(13) 可用于算近似伴随梯度 $\partial J/\partial\tau$
			* 2104.07811, sec2.1:-1 提到 ill-posed 情形可能有多解或多个高精度近似解
			* sec1 不如伴随求解器解析梯度准
			* sec1 不如 ensemble Kalman 隐式使用 Hessian 和 Jacobian 加速收敛
	* table1 引文：{EKI-1808.03620} 带自适应步长的 ensemble Kalman inversion 方法，将 ML 视为 BIP
		* "Ensemble Kalman Inversion: A Derivative-Free Technique For Machine Learning Tasks"
		> 不过其中似乎写为连续时间优化问题，与本文离散框架稍不同；按里面确实应为 $y$ 而非 $y_j$
	* sec1:-2 本文算法优势总结：
		1. 降低数据要求，只需测量量，如稀疏观测的平均速度、升阻力等积分量
			> 导师觉得这还可以做 task-driven 的训练，使最关心的预测量尽可能准确
		2. 训练预测环境一致，从而方程病态性不造成影响
			* table3 $u,\tau$ 误差大小相差确实大
		3. 非侵入性，可用于任何求解器，无需额外开发伴随求解器等
	* sec2.2:-2 ensemble 方法 3 优点：
		1. 权重集合，可 UQ，类似 BNN
		2. 非侵入、无导数，可用于黑盒系统；本文用 OpenFOAM + TensorFlow
			* sec5.2 数据可含不同物理量，不像伴随方法需要每种分别开发
			> 长时稳定性训练下 loss 需跨多个时间步，常规做法 BP 复杂，这里无导数优化完全能用于任意长时间步；实际仍可逐步增大时间步从而易训练
		3. 内存占用不高
		* sec5.1 数据可并行，相较 SGD 用 batch 高效（> ？）可抗噪以避免过拟合；不同 configuration 场景下同时生成数据用于训练，每个 CPU 核算一个场景，场景间无需通信
			> 这或许就是记号用 $y_j$ 而非 $y$ 的原因，
			> 每组参数可分别演化自己的流体方程（就算初值相同，不同参数给出不同演化法则，后期也不同）
			> 并且硬件上也能分配各自计算核心
	* 实验
		* 方管二次流，使用 Shih 二次模型作为 RANS 模型的真解（synthetic 类数据）
			* sec3 50x50 grid，采样模型个数 $N_e=50$，网络 2 隐层宽 5（table5 消融表明增大无益）
			* sec4.1:1 观测 $y$ 除了用完整 $u$，也可只用反对角线（右上到左下）上的 $u$，不过精度会降
		* periodic hills 用 DNS 生成数据
			* sec3.2:-1 没有能正确捕捉现象的 RANS 模型，只能 DNS 并缩放到 RANS 时间尺度
				> 回忆 RANS 是做了时间平均，DNS 应该只是求解了含时 NS 方程然后算平均
			* 最大时长 490 大于上一算例 10，需要更大的 10 隐层宽 10 网络，$N_e=50$
			* sec4.2:1 用 $\alpha=1$ 训练，$x/H=1,3,5,7$ 处的速度 profile 作为观测 $y$
			* fig10 对 $\alpha$ 泛化效果稍差，虽然仍明显好于 $k-\epsilon$
			> 本来就应该用一个范围的 $\alpha$ 训
	* secA 实现细节：
		* 网络初始权重需预训练为等效的线性涡粘模型，将之作为优化初值；随机初始化可导致非物理值
		> $K$ 计算似乎涉及高维矩阵求逆（例如实验 1 中 $y$ 为 $2500$ 维），如何实现的？说代码在 GitHub 上有但没找到
* [PINN反问题解材料缺陷](https://mp.weixin.qq.com/s/4RRcCe72CsceEuIYK8pz_A)
	* 根据材料边界应力应变推测内部空隙/裂纹/填充物形状与属性（仅备用）
	* "Analyses of internal structures and defects in materials using physics-informed neural networks"
		* [Science 官网网页版](https://www.science.org/doi/10.1126/sciadv.abk0644)，有补充材料
		> created on 2022-03-23
	* 设定 6 个特定平面应变问题：线性弹性材料内单个椭圆洞，超弹性（不可压）材料内单椭圆洞/直线裂纹/双圆洞/圆形填充杂质且性质未知，变形塑性材料圆洞
		> 似乎不包含拓扑形状改变，甚至形状参化都固定，只是参数恢复问题
	> 如果是外加多组应力测量多组应变，据此恢复内部形态，则场景与 EIT 类似；可惜能处理的几何变化无法应对 EIT 需求
	* 网格随几何参数变化形变
	* 不同材料涉及不同的物理场，从而使用输出（包括维数）不同的 PINN
* `s-PINN-2202.02710` 无界区域 PINN，自适应谱方法（基底展开）下只学系数，涉及坐标采样点选取
	* "Spectrally Adapted Physics-Informed Neural Networks for Solving Unbounded Domain Problems"
		> created on 2022-03-29，备用；
		> 似乎这不是第一个起名叫 s-PINN 的工作，注意可能的名称混淆
	* fig1 取定基底 $\phi_i(x)$，ansatz $u_N(x,t)=\sum_{i=0}^Nw_i(t;\theta)\phi_i(x)$
	* sec3 解含时 PDE 关于时间可以惩罚 Runge-Kutta 的残差 eqn(9)，RK 中多方程残差求和
		> 有点奇怪，Runge-Kutta 的中间量无显式物理含义，例如预估-校正格式中间量就对应时间 $t+1$，该预估值与最后真正的 $u(t+1)$ 不同
		* 基底 $\phi_i(x)$ 手动选取，故空间导数容易获得
		> 没有利用 BP 所得的显式时间导数，也不是时间维度 MC 采样；该取定基底的 ansatz 下得到的是 ODE，loss 相当于用 PINN 解 ODE
	* sec4 用于反问题，参数、源项形态推断
	* 根据方程特性选基底：解衰减、振荡等
		* eg1 函数逼近问题
			* 特定参数下基底基于 Chebyshev 多项式 $T_i$ 构造：$\phi_i(x)=T_i(\beta x/\sqrt{1+(\beta x)^2})/\sqrt{1+(\beta x)^2}$
			* 一般参数下涉及 modified mapped Gegenbauer functions (MMGFs)（> ？）
			* 坐标点采样自 Cauchy 分布（无期望）
		* eg2 有界区域基底用 Chebyshev 多项式
		* eg3 Laguerre 多项式基底，采样点 Laguerre-Gauss quadrature allocation nodes and weights
		* eg4 广义 Hermite 多项式基底
		* eg5 无界薛方也用广义 Hermite 多项式基底
			* 自适应：scaling $\beta$ 以捕捉耗散效应，平移 $x_L$ 捕捉 advective 行为，$p$-adaptive 增加基底个数 $N$ 以捕捉振荡
			> 这些参数可以像系数 $w_i$ 那样用 NN 表达而依赖于 $t$；未确认原文处理方式
	* table5 传统、PINN 方法，spectral/non-spectral，各方法的优劣
		> spectral 无论传统还是 PINN 都说需要选基底、用于规则区域；相关：`2021-10-27`(dbGrpMeet) 对不规则区域用了类似谱方法的 Fourier frame
* `2204.02488` （备用）用 NO 预测极端事件，结合主动学习采数据，用 ensemble 做 UQ
	* "Discovering and forecasting extreme events via active learning in neural operators" by George
		> created on 2022-04-24
	* fig5 总体流程（> 很像 `ISMO-2008.05730`）
		* 先初步生成数据（可能不含极端事件）、训 NO
		* 用 Bayesian experimental design（BED）搜可能的新训练数据点
			* 包括 explore 以减小模型不确定度、exploit 以发现可能的极端事件
			> 怎么感觉 探索-利用 的定义反过来了？
		* 实验或模拟生成新训练数据，用于进一步训练
		* 循环；最后完成训练后可用于预测极端事件
	* sec2.2.1:1 “双下降”现象，数据增多时变差（过拟合），只有继续充分增多数据泛化才变好
		* 本文方法在实验中避免此现象，认为是主动学习高效选出了对学的系统动力学有显着贡献的样本点
	* sec4.1.1 UQ 方案：随机权重初始化（本文用）、不同的网络架构（包括激活函数）、数据混洗、 数据增强、bagging、bootstrapping 和 snapshot ensembles
		* secD.1 三类技术：单一确定性网络（直接预测方差），BNN，ensemble
			* 推荐了 review 文章 2107.03342, 2201.07766
			* 单网络训练推断容易，但导致很大的 sensitivity，量化物理不稳定性、极端事件回归上质量不行
			* BNN 理论和实验效果好，但太复杂，训练费力、不易实现
			* ensemble 介于二者之间，即单一模型与无穷个模型之间
		* 有最近研究认为 DNN ensemble 提供了合理（可能更好）的后验近似值
	* sec4.2.1 不确定性采样（US），又称 active-learning-MacKay (ALC) 算法
		* 优势：易实现、evaluation 便宜（对于带有 GP 的小型数据集）和 分析梯度（故允许梯度优化）
* [PINN适用范围-知乎](https://zhuanlan.zhihu.com/p/468748367) 综述性质文章
	> 2022-06-15, CSImeet 群聊推荐
	* 纯数据驱动的问题：多解时找到其平均（有统计意义、无物理意义），不如物理驱动找到物理可行解之一
		* 例子，流体涡开始可顺时针或逆时针摆动
		* 问题还有：观测偏差、外推泛化性能差
	* 可处理数据、机理都只有一部分（无完整机理），需融合二者的情形
		* 正问题比传统方法慢、精度低，但解反问题高效；数据机理融合是特殊反问题
		* 可用少量的散点测量来推断未知部分的参数（参数恢复）、补全PDE中某些项（模型发现），同时得到数值解；{_p4jk80}
	* 边界惩罚等，多项 loss 自适应加权：
		* 2001.04536 参数梯度流角度
		* 2005.00615 建模为极小极大问题、惩罚大损失项
		* 2104.06217 权重与损失的方差关联、建模为概率模型
	* CFD PINN 相较传统方法优势，机理数据融合的现实应用（流场据部分观测恢复、据载物浓度还原流场）
		* CFD 传统方法问题：
			* 目前已有的各类CFD方法并不能很好地融合各类保真数据
			* 逆问题的求解，也就是边界条件和流体的各种参数未知的情形下，如何通过部分测量数据得到精确的模型参数和流场的重构；{_p4jl1t}
			* CFD网格质量对结果的影响比较大，计算中网格划分本身也是非常耗时的
			* 最后，目前的CFD软件都非常庞大
				* 比如OpenFoam，对每一类问题都有专门的求解模块，拥有超过10万行的科学计算代码
				* 其更新与维护也是一件难事。
		* CFD 中 PINN 优势：
			* 对各种数据的融合非常自然
				* eg. 压强标量场的时空散点数据、速度矢量场的时空散点数据，示踪粒子的运动轨迹；{_p4jl07}
			* 正问题与包含数据的逆问题，形式上区别不大
			* 不需要网格（当然对应的如何选配点是个别的问题）
			* 最后，PINN的算法核心相对简单
				* 只要NS方程能够描述，都能使用统一的形式进行处理，在更新和维护上也是相对容易的。
			* PINN 适合在时空散点测量数据比较充足时，进行CFD相关的参数估计、 流场重建、代理模型构建等问题的求解
			* 与传统的CFD求解器相比，PINN在集成数据（流量的观测值） 和物理知识（描述物理现象的控制方程）方面更胜一筹。
			* 对于某些应用场景的大规模CFD问题，需要对混合数据进行并行计处理
				* PINN可能是一种非常适应于多 GPU数据并行和模型并行的范式
				* 或许可以在不久的将来用于传统CFD方法无法解决的工业中的大规模复杂问题
		* 通过速度观测来重建全流场，某种超分辨率；{_p4jk6i}
			* 在气动力学等学科的实验研究中，可以利用光学设备，通过粒子图像测速（Particle Image Velocimetry，PIV）和Particle Tracking Velocimetry（PTV）方法测量的得到多个散点速度
			* 散点速度并不能满足需求，高分辨率的速度场对于可视化和后续分析必不可少
			* 类似图像插值来实现“超分辨”，但是结果可能“并不符合物理规律”
			* PINN在扩展PIV/PTV功能方面具有一定潜力，论文：
			* "Dense velocity reconstruction from particle image velocimetry/particle tracking velocimetry using a physics-informed neural network."
		* 无速度散点测量，直接从流体中载物的浓度来还原流场
			* NS方程组上再添加一个对流扩散方程，代入到PINN进行求解，也就是求解所谓的隐流体力学（Hidden fluid mechanics）
			* 类似技术被用于颅内血管瘤血流的重建上，论文：
			* Hidden fluid mechanics: Learning velocity and pressure fields from flow visualizations
	* 改进工作，发展中的典型技术：区域分解，融合传统格式，浅层网络
		* 区域分解：
			* 利用传统Parareal时域分割方法并行化：`PPINN-1909.10145`（图示，预测校正格式？）
			* 空间上区域分割的并行方法 FBPINN-2107.07871
				* 看图示是区域有重叠，加权组合光滑过渡；各区域 $x$ 先 normalize 再输入 NN、unnormalize（> ？）、乘权重、对区域求和得结果
			* 不仅可以从时空关系上，还可对微分的阶数分解来降低复杂度，避免对单神经网络求高阶导 MIM-2006.04146
		* 融合传统求导格式，加速信息传播
			* （通常的）差分格式可以利用多点的局部信息，在多重网格下，其信息传播的速度还能加快
			* 但差分格式需要均匀网格，对于较为复杂的边界，有限差分方法需要对边界进行逼近处理， 过程比较繁琐繁琐而且会引入误差
			* 利用有限差分格式模板构造投影算子，利用投影后得到的目标函数值作为神经网络的目标学习 HCP-2012.06148；{_p4jk7d}
				* "Theory-guided hard constraint projection (HCP): A knowledge-based data-driven scientific machine learning method"
			* 另有用有限差分（如算 $\Delta u$）替代 BP，避免高阶自动微分，训练更鲁棒；{_p4jk78}
				* $h,x_i$ 选择都会影响结果
				* 对于某些方程不稳定的差分格式，在融合格式中也能起加速作用， 这大大提升了算法设计的灵活度
			* 不是新想法，2012 年有文章已在传统无网格方法中融合有限差分格式
		* 浅层网络
			* 多层的网络是造成PINN本身非线性非凸难以求解的主要原因
			* 浅层网络中，结合了 ELM（Extreme Learning Machine）的内嵌物理知识极限学习机（Physics Informed ELM，PIELM）
			* 看起来非常粗暴，就一个隐藏层，而且隐藏层的输入参数进行随机初始化后被固定不再需要更新：
			* PIELM-1907.03507 "Physics informed extreme learning machine (pielm)–a rapid method for the numerical solution of partial differential equations"
			* 可视为Kansa无网格方法，或者（本身也算是一种浅层网络的）RBF-net 后续发展的回溯（> ？）
			> `2021-11-10`(AISCmeet) 也涉及 ELM，关系？
	* 非典型应用：航天器转移轨道优化，传染病、交通流参数估计
		* 优化问题例子，航天器转移轨道的优化设计
			* 天体力学的运作原理，列成方程，可作为物理知识嵌入到神经网络中
			* 通过应用Pontryagin极小原理得到最优控制问题的一阶必要条件
			* 这个必要条件刚好刚好是一个两点边值问题的常微分方程组
			* eg. 地球到火星的电推飞行器的转移轨道
			* "Physics-Informed Neural Networks for Optimal Planar Orbit Transfers"
		* 参数估计例子，传染病 SIR 模型变体 SVIHDR
			* 有8个固定参数和2个随时间变化的参数，这两个时变的参数就交给PINN处理
			* 通过对现有的六个维度的现实数据进行学习，利用可微分编程， 结合了一种隐式有限差分格式实现对这两个时变参数的训练和估计。
		* 参数估计，交通流用守恒方程描述，用 PINN 估计扩散项系数 $\gamma$ 2103.13852
			* 十个损失项
			* 三个观测数据项损失：探测车辆误差项（类似拉格朗日观点下的流体粒子，或者 PTV 方法）、密度误差项、速度误差项
			* 两个统计偏差损失项
			* 守恒方程损失、流量函数凹性约束、探测车辆轨迹损失、速度耦合观测车辆损失、$\gamma$ 平方正则化项五个“物理”先验损失
	* 编程实现{求解包}：
		* DeepXDE，集成了基于残差的自适应细化（RAR），构造实体几何（CSG）技术的复杂几何区域定义
		* NeuroDiffEq，基于PyTorch
			* 通过硬约束来构造NN满足初始/边界条件，细分下来叫PCNN（Physics Constrained Neural Network）
			* 由于要设计特定的边界，这种方式会受限于对边界的具体形式。
		* Modulus（原 SimNet）by Nvidia，看公司或许可以期待有比较好的硬件性能优化大型工业算例
		* SciANN，基于Keras包封装实现。有比较丰富的应用示例，包括弹性、结构力学和振动应用等
		* NeuralPDE.jl，是SciML大项目的一部分
		* ADCME，基于TensorFlow，有一些非线性方程的例子，比如非线性弹性、NS问题和Burgers方程。
		* TensorDiffEq，基于Tensorflow，特点是做分布式计算
			* 主旨是通过可伸缩（scalable）计算框架来求解PINN，明显是为大规模工业应用做铺垫。
		* IDRLnet，国内团队发布的基于Pytorch和sympy的开源求解器
			* 包含了鲁棒参数估计、变分极小化问题（比如极小曲面计算）、积分方程求解、 参数化代理模型等基础算例。
		* Elvet，可以求解PDE和变分极小化问题（如悬链线计算）的Python库。
		* Nangs，PyDEns，貌似没有更新
* `2207.01546` （备用）理论证明 CNN 逼近 NO 能力（包括存在合适的网格分辨率），估网络大小增长界；通过建立 CNN 与离散 Fourier 变换关系证明；数值实验验证
	* "Approximation bounds for convolutional neural networks in operator learning"
		> created on 2022-07-27
	* thm2 对任意算子 $\R^p\to H^s(\Omega)$，假设 $r$-次 Fréchet 可微、导数 Lipschitz，则 $\forall\epsilon$ 存在合适的网格分辨率 $h=2^{-k}$ 和网络参数达到该逼近精度
		* 并有对全连接层数、卷积层数、通道数和总参数关于 $\epsilon,p,s,r,h$ 的增长速度估计
		* 网格总点数 $N_h$（> 由于 $\Omega$ 形状自由，未必 $2^{dk}$ 形式）
		>  (i) dense layer 的数量与所需的精度成对数关系，而卷积层的数量与网格分辨率（即离散化点的数量）成对数关系。
		>  (ii) 密集块的宽度与算子本身的正则性有关，平滑算子需要较少的神经元。
		>  (iii) 卷积特征的数量取决于输出信号 $u^\mu$ 的正则性
	* 摘要：所有证明均构造性
* `MaxwellNet-2107.06164` 反向设计中 DeepSDF 参化待设计形状，形状输入 NO 得局部波场，已知变换推得全局波场，整体反传优化；NO 用 PDE loss 训
	* "MaxwellNet: Physics-driven deep neural network training based on Maxwell's equations"
		> recommended at `2022-08-12`(CSImeet2)
	* 考察频域方程（故不含时）$\nabla\times\nabla\times E(r)-k^2\epsilon(r)E(r)=0$
		* $\epsilon$ 二值（透镜内外）
	* NO 称为 MaxwellNet，fig1 U-Net 架构（补充材料有说明）
		* 用 physics-informed loss 训练；Yee 网格上高阶有限差分逼近梯度
			* 补充材料 secII，差分在一个方向上涉及 4 个 Yee 格点
		* PML 层将 Sommerfeld 辐射条件纳入散射场
			* 补充材料 secIII：总电场矢量分解为散射场、入射场矢量，仅应用于散射场矢量的旋度算子被替换（> ？），之后离散化同主计算区域；{n2ia5w}
			* 频域方程首项拆为 $\nabla_s\times\nabla_s\times E^s+\nabla\times\nabla\times E^i$
			* 相关：`Song2021AVersatileFS` 也是 PML，不过是波方程，不涉及电磁
	* 只预测镜头内部的电场，外部由于是均匀介质，可通过均质介质格林函数推算
		* 补充材料 secI：在均匀介质中为 Helmholtz 方程，Green 函数有相应表达式
	* DeepSDF 参化透镜形状，采用二值输出 $\pm 0.5$；由于对称性，只表达镜头一半即可
		> 隐空间表示的意义在于它是透镜完整形状的压缩版本，因此在隐空间中进行优化在计算上变得高效
		* （评）不是直接表达 SDF，或许二值输出便于接受 NO 反传回的梯度
		* 补充材料示意图：隐向量 18 维
		* （评）相关：`2206.00711` 待恢复目标也 AD 表达，不过目的稍有不同，那里要推断场而非设计形状，AD 用于提供正则化先验，避免获得非物理的高振荡解
	* 反向设计算例：fig4b 希望在透镜光轴后 8nm 处电场强度达到最大
		* （评）生成的透镜截面有点像双曲线；几何光学用费马原理能推双曲面聚焦，这里按波动光学算（原文说问题线度为 $10\lambda$）出类似结果
* `2206.00711` PDE 反问题，GNN NO 前接 AD 生成系数场，从而只考虑低维优化问题、用先验避免不良局部最优；实现时允许微调 AD 网络参数从而近似低维
	* "Learning to Solve PDE-constrained Inverse Problems with Graph Networks", ICML2022
		> `2022-06-10`(CSImeet2)，另在 `2022-11-02`(dbGrpMeet2) 讨论
	* 预训练 1：解算子 NO，架构 `MeshGraphNets-2010.03409` GNN；用 FEM 生成数据（GRF 初值）
	* 预训练 2：AD 给出系数场降维表达（“先验”），允许在任意点求值以输入 GNN
		* 原文描述为“深度生成模型”，隐向量映射到材料参数、初值的低维子空间，其中包含反问题合理解
		* （传统 CNN 做法只适合处理规则网格）
		* 实现细节：secS1.2 ReLU 激活、输入带 Fourier feature，batch size 32，学习率 5e-4，在输入坐标加随机噪声以提高泛化；secS2.2 第 3，5 层重新 concat $z$
		* 实验 fig4,S1,S2 若不用 AD 先验则恢复出的场高度振荡、不符合物理
		* （评）文中提到了 manifold，这些人也认识到 AD 刻画了流形
		* （评）相关：`MaxwellNet-2107.06164` 待优化目标也用 AD 表达，目的与这里不同，那里应该主要是形状直接优化困难，故用 AD 给一个参数化
	* 使用阶段，由于 NO,AD 均可微分，联合优化即可
		* sec4.2 NS 方程实验，AD 的模型参数也参与微调
	* 实验 1：波方程，复杂形状障碍物给出复杂边界，(D) BC
		* loss: 给定 $t\in T_\text{iter}$ 内部分散点上的观测，恢复相应初值 $u_0(x)$、速度场 $c(x)$
			* 恢复 $c(x)$，“全波形反演 FWI”的用途包括地震学恢复介质中结构密度；{n2ia37}
		* 障碍物为复杂鱼形，固定下来不变化
		* GNN 前向求解器
			* FEM 求解器需要比 GNN 求解器小 5 倍的时间步才能获得稳定的结果。
			* 在精细不规则网格上模拟的 FEM 求解器比 GNN 慢大约 8 倍；
			* 在与 GNN 相同的网格上运行 FEM 求解器比 GNN 慢 2.5 倍，在 MSE 方面的准确度大约差 80 倍
		* AD 初态恢复
			* 先验在 10,000 个 $u_\text{init}$（或 $c$）值的数据集上预训练
			* 数据生成：对高斯随机场进行采样，并将解在边界附近逐渐变为零以满足 Dirichlet 边界条件
			> GRF 这种条件下也可以有低维假设？我觉得最多近似低维，得 fine-tune，而原文只在实验 2 fine-tune AD 参数；
			> 不过如果本来就不指望能完整恢复（信息不足问题），只恢复低维流形假设空间中的近似也还行
			* 无论 NO 用 U-Net, FEM 还是本文方法，使用学习的先验显着提高了最终的准确性
				* “解决方案空间限制在学习的流形上，并避免远离数据集分布的不良局部最优值”
		* p6:r1 恢复 $c(x)$ 为病态反问题，progressive training
			* 假设最开始只有 $2\Delta t$ 处的观测，120 步迭代后 $\{2\Delta t,4\Delta t\}$，再 120 步再加，最终 $\{2\Delta t,\dots,30\Delta t\}$
			* 以及引入阻尼函数、首先优化低频
	* 实验 2：NS 方程恢复初值，文中用了“数据同化”说法
* `Song2021AVersatileFS` PINN 解频域波方程（Helmholtz），涉及 PML 边界
	* "A versatile framework to solve the Helmholtz equation using physics-informed neural networks"
		> recommended at `2022-08-12`(CSImeet2)
	* eqn(5) 改写方程中微分算子（形如 $\partial_1(A_i\partial_1u)$）以体现 PML 层，最终 loss 只有 PDE 内部项，形式上无边界项
		* sec4 discussion，应用 PML 边界需要扩张模型，增加训练成本
		* 频域波场为复数，若无 BC，则解只涉及实部（来自点源）
		> 不考虑自由表面边界条件。 如果应用自由表面边界条件，我们会在损失函数中加入一个附加项，将应力或压力强制为零。 否则，PINN 通过其优化实现不允许沿边界反射。
		* 相关：`MaxwellNet-2107.06164` 有网格的 PDE loss，也用了 PML 层
	* sec4 discussion sin 激活、第一层用固定系数：
		>  sin(x) 激活函数更稳定（Raissi et al. 2019b）。 西茨曼等人 (2020) 指出，用固定系数初始化正弦网络第一层的权重很重要
	* 提到源位置改变情形可将源位置作为网络输入，有引文
* `DPA-1-2208.08236` （备用）分子动力学 DeepPot 大模型
	* "DPA-1: Pretraining of Attention-based Deep Potential Model for Molecular Simulation"
		> `2022-08-19`(lectures) 张林峰 CSML2022 报告中提到
	> （摘要）当在包含 56 个元素的大规模数据集上进行预训练时，DPA-1 可以成功地应用于各种下游任务
	* fig1 网络架构，输入有 atom type，中间结构涉及注意力 $Q,K,V$
	* fig3a atom type 输入 type embedding 网络后所得 feature 的 3D PCA，关于元素有螺旋形结构
		> （摘要）对于不同的元素，学习到的类型嵌入参数在潜在空间中形成一个螺旋形，并且与它们在元素周期表上的位置具有自然对应关系
* `BOP-DMD-2107.10878` （备用）Koopman DMD 变量投影优化版本，再考虑 bagging 改进，可提供时空 UQ
	* "Bagging, optimized dynamic mode decomposition (BOP-DMD) for robust, stable forecasting with spatial and temporal uncertainty-quantification"
		> created on 2022-09-03
	* 摘要：
	> 大多数 DMD 算法容易产生来自动态噪声测量的偏差误差，导致模型拟合不佳和预测能力不稳定。
	> 优化的 DMD 算法通过变量投影优化最大限度地减少模型偏差，从而实现稳定的预测能力。
	> 在这里，优化的 DMD 算法通过使用统计 bagging 方法得到改进……
	> BOP-DMD 不仅提高了性能，还增强了模型的鲁棒性，
	> 并提供了空间和时间不确定性量化 (UQ)……具有全面的 UQ 指标。 
* `Pro-CoNNS-2106.02543` （备用）动力系统模拟，加速隐式 RK 求解，两种 NN 替代牛顿迭代单步，分别形如线性变换、全局收缩映射
	* "Accelerating Dynamical System Simulations with Contracting and Physics-Projected Neural-Newton Solvers"
		> created on 2022-09-03
	* 隐式 Runge-Kutta 时间推进，每步迭代涉及求解方程组，传统用牛顿迭代，本文试图 NN 改进
	* ProNNS (physics-projected neural-Newton solver) 替代单个牛顿步中 Jacobian 矩阵的逆；{_oa4m2x}
		* 残差（归一化后）再输入网络，从而成为迭代
		* （评）是带非线性激活的 NN 吗？还是只有一个可训练的线性变换？
		> 能够以比基于牛顿的求解器快 31% 的速度实现极高的数值精度。
	* CoNNS (contracting neural-Newton solver) 牛顿迭代替代为收缩映射，由 NN 给出；{_oa4m2y}
		* 从而不像普通牛顿迭代那样需要很好的初值
		* 控制参数以确保为收缩映射：用 ReLU 激活、无残差连接，控制权重矩阵谱半径小于 1
* `HINTS-2208.13273` 加速传统算法，PDE 离散得线性方程组，若干步 Jacobi 迭代中插入一步 DeepONet 迭代，多重网格内各 Jacobi 步也可如此
	* "A Hybrid Iterative Numerical Transferable Solver (HINTS) for PDEs Based on Deep Operator Network and Relaxation Methods"
		* "Blending Neural Operators and Relaxation Methods in PDE Numerical Solvers", Nature Machine Intelligence 2024
		* Zhang, Enrui; Kahana, Adar; Kopaničáková, Alena; Turkel, Eli; Ranade, Rishikesh; Pathak, Jay; Karniadakis, George Em; 
		> `2022-09-07`(AISCmeet2)
	* 传统迭代处理低频慢，在 Helmholtz 上甚至发散；DeepONet 迭代算子参与部分迭代可缓解
		* 实验结果为收敛速度提升一个数量级
	* （评）导师推测用 DeepONet 可能非本质，NN 低频优势应是由于它用梯度训练，DeepONet 应可替换为由 NN 改进的梯度流
	* （评）`Rizutti2019LearnedIS` 做法类似，若干步 Krylov 子空间迭代中插入一步 U-Net 修正，不过那里似乎考虑的不是高频低频问题（Helmholtz 似乎也不好这么解读？），且每次用的 U-Net 不同（从而总迭代步数固定）
	* [2024-10-24 公众号报道](https://mp.weixin.qq.com/s/-wXxIyhvxxevuygSaaBiAQ)
* `2010.15761` Helmholtz（PML 边界）方程求解迭代视为序列决策 RL，迭代用有记忆 U-Net，其训练用多步累积 PDE loss
	* "A Helmholtz equation solver using unsupervised learning: Application to transcranial ultrasound", JCP2021
		* Antonio Stanziola, Simon R. Arridge, Ben T. Cox, Bradley E. Treeby
		> created on 2022-09-14；记录根据 JCP 发表版本而非 arXiv 版本
	* 问题背景：医学脑部超声治疗，穿过颅骨的声场满足 Helmholtz 方程
		* 用 Helmholtz 方程建模合理性
			* （评）感觉其实是反向设计问题，找源位置使最终波场焦点在给定位置；本文仅按正问题考虑
			* sec1.2:1 可这样建模要求声波正入射颅骨（也是多数情况），否则还要考虑剪切波效应等；{_n31e43}
			* 实际中还有声波高强度位置的非线性效应，但仅限于焦点附近小区域，而焦点后的波场对治疗不那么重要；{_n31e49}
			* 治疗中超声信号持续数毫秒到数秒，远长于达到稳态所需时间，故建模为不含时方程
			* 未来实际使用需推广到 3D，而引入非线性效应、（头骨内部）密度变化、声学吸收等也算未来工作
		* 方程 $A(c)u=\rho$，算子 $A(c)=(\nabla^2+(\omega/c(x))^2)$，边界条件针对 $|r|\to\infty$ 给出
		* 复数取值 $u(x)\in\mathbb{C}$
		* 数值上用 PML 边界，用于离散 Laplacian
		* 定义残差 $e_k=A(c)u_k-\rho$，单步 loss $L_k=\|e_k\|_2^2$
		* 在网格上算空间导数，secA 用 Fourier collocation spectral method，FT 后在频域操作，而不用 FD；{_n2ll44}
	* 传统数值方法太慢：计算域比波长大很多
		* 通常需要几十分钟到几个小时，无法用于治疗时在线计算、校正；目前用光线追踪等近似模型替代
		* 若用 GMRES 等收敛慢，因 Laplacian 为局部算子，Krylov 子空间每次只引入局部更新
			> Krylov 子空间方法对亥姆霍兹问题的收敛速度较慢 [31]。
			> 从直观的角度来看，如果解从空波场和空间局部源开始，则亥姆霍兹方程的性质使 Krylov 方法的每次更新都是局部的（由于拉普拉斯算子）。
			> 这意味着解将从源所在位置开始缓慢生长（示例见 fig9）。
			> 然而，异构亥姆霍兹问题的解决方案显然具有非局部依赖性。
		* 相关工作：预处理方法
			> 这意味着找到一个合适的基础变化，以减少正向算子的奇异值的动态范围，这通常导致使用可以考虑长期依赖关系的多尺度表示。
			> 然而，为波方程寻找合适的预处理方法是一项具有挑战性的任务。
			> p3:-2 [37]中…Krylov迭代与UNet[38]交错…保留一些Krylov迭代的一个很好的优点是它们可以充当正则化器，防止解发散。{_n2o88z}
		* 多重网格：（引了 Meta-MgNet，学 GMRES 最佳子空间）
			* 另有引文 37 `Rizutti2019LearnedIS`，Krylov 迭代与 U-Net 交错
	* 本文学求解的迭代算子（只生成更新量），形如 $u_{k+1}=u_k+f(u_k,\cdots)$，需引入额外信息
		* 若引入 $c,\rho$，文中认为它们与 $u$ 属于不同 domain，难以直接利用这部分信息帮助更新；{_n2rm17}
			* 若用 AUTOMAP-1704.08841 [41] 等组合不同域的输入，难以引入合适的 inductive bias 而又能快速推理；需靠大量数据而非物理方程
			* （评）这篇引文从流形观点出发，似乎是 AE 放到隐空间后可组合
		* 改引入当前残差 $e_k$；不过信息不足，同波场、残差未必来自相同问题
		* （评）我觉得输入 $e_k$ 的同时可以再输入 $c,\rho$ 作为辅助？
			* 另外 Helmholtz 为线性方程，下一步迭代直接解 $A(c)v=e_k$ 即可得 $\Delta u_{k+1}=v$
			* 不过这样的用于迭代的解算子还是需要显式引入 $c$ 的信息，而本文做法记录了 $e_k$ 的历史变化，可认为 $c$ 的信息已经隐式编码于记忆 $h_k$ 中
			* 算 `paramPDE%`“学求解器迭代算子”线性方程迭代算子的框架
	* 视为只有部分观察的 MDP，引入 recurrent belief state 转化为可完全观察的 MDP：$(\Delta u_{k+1},h_{k+1})=f(u_k,e_k,h_k)$；{_n2rm3a}
		* 许多传统迭代优化器可对应特殊形式的 $h_k$，认为本文形式允许 $f$ 自适应换用优化器
		> 使用隐藏状态增强输入可以提高神经 ODE [45] 的表示能力，因此可以合理地假设它也有助于离散化的对应物。
		> 如果将函数 f θ 视为迭代求解器，则状态变量 h 的存在允许在此框架中转换多个优化器。
		> 例如，如果 h 存储先前的梯度及其大小，则 f θ 原则上可以用作准牛顿方法 [39,40]，而如果它存储所有先前残差的集合，则可以推广 Krylov 子空间方法。
		* （评）`[Dong]-RL-WENO-1905.11079` 处理含时方程（同样已知），将时间迭代（不同于这里的求解器迭代）算子视为 RL 动作
			* 本文未引这篇，但引了 MgNet 和 Meta-MgNet
		* （评）引入记忆项属于 ((n77k4o))RL状态空间观测不完全 框架；预测问题不完整观测也同理引入记忆项
	* sec2.1, sec2.3 基于 PDE 的无监督 RL loss
		* 数据不好生成，尤其 3D 模拟耗时很长，故适合无监督
		* 若用 $T$ 步后的 loss $\|e_T\|_2^2$：穿过大量迭代 BP 计算困难，$T$ 选择也应依赖于问题准确度需求
		* eqn(10) 改优化历史 loss 总和 $\sum\|e_k\|_2^2$；{_n3hg39}
		* sec2.3 用 replay buffer 避免穿过大量迭代 BP，并截断时间反传（TBPTT）至仅 10 步
			> 网络使用重放缓冲区和截断的时间反向传播 (TBPTT) 进行训练，其中 TBPTT 是通过展开 10 次迭代来实现的。
			* 存许多 $(c,u_k,h_k)$ 三元组（可再存 $e_k$ 而不重算；还存了迭代指标 $k$），每次随机取 minibatch 迭代 10 次，算 loss 并 BP
			* $k>T$ 的三元组扔掉，替换为新算例
			* 损失超过阈值也认为发散而扔掉；{_n2sm1c}
			> 注意，使用小窗口进行反向传播会使网络偏向于学习具有短时间依赖性的状态表示。
			> 虽然有减轻这种偏差的技术[51]，但我们并没有发现这在实践中是一个问题。
			> 将置信状态 hk 存储在重放缓冲区中（而不是重新初始化它）也被证明可以提高使用经验重放训练的循环网络的性能。
	* sec2.2 网络架构基于 U-Net，各尺度均有相应记忆项
		* 输入 6 通道：$u_k,e_k$ 实虚部，PML 两方向吸收系数（随空间变化）
		* fig3 基于 U-Net 的架构示意图，每个尺度的编码器有自己的 $h_k$ 记忆项；{_n2s96g}
		* 背后的直观：全卷积操作有部分平移不变性；能编码不同尺度先验，校正波场局部失真、又体现长程依赖（引了 MgNet）
	* （评）根据 fig11,fig12，U-Net 可对网格分辨率泛化
	* 实验（仅 2D）；生成随机头骨，包括形状（圆上采样调和函数）、厚度、波速；{_q26a85}
		* 训练中途用验证集，将源 $\rho$ 位置移动到圆上随机位置，以测试网络泛化
		* 测试 OoD：fig11 24 个头骨拼成 480x480 网格（训练只用 96x96 网格以节省时间）能算出
		* 测试 OoD：fig12 用真实 CT 头骨，点源换成弧线源，512x512 网格，也能解；线性方程，线源可视为点源求和得到
	* sec4 总结
		* TBPTT 可能导致状态表示漂移等，可考虑通过 Q-learning 等方式缓解；{_n2sm2f}
	* 2023-03-01 AISC 讨论
		* 导师：整体思路本身对他自己来说不那么新，想法在之前 RL WENO 的工作已经有了
			* 对他来说，这个领域里他这几年都没有看到什么足够本质性的新东西
		* SyQi：内部 c 突变边界处的边界条件设置问题，直接写 Helmholtz 方程（对于真实应用场景）是过于简化了；{_n31e3n}
			* 对解所在的空间影响大，比如椭圆方程不引入这个边界则解 $H^2$，引入的话 $H^{1+\epsilon}$，光滑性差很多，用当前这种设定来测试算法有可能不太合理
		* SyQi：可解释性不如 MG，并且所有东西都让 NN 学似乎没有必要，（他个人认为）只学传统算法搞不好的低频部分就够了；{_n31e4p}
* `Rizutti2019LearnedIS` 解 Helmholtz 方程，网格离散得线性方程组，若干 Krylov 子空间迭代中插入一步 U-Net 迭代，固定总迭代步数、每次所用 U-Net 不同
	* "Learned iterative solvers for the Helmholtz equation"
		* 记录主要依据相应 [slides](https://www.researchgate.net/publication/333662516) 
		> created on 2022-09-15；为 `2010.15761` 引文 [37]
	* 观察到的相似性：ResNet，（含时系统）FD 时间推进，（反问题）非线性优化，（Helmholtz 等方程）迭代求解器
	* 每 $q$ 步 Krylov 子空间迭代后接一步 U-Net 迭代，这样共 $p$ 次，每次 U-Net 所用参数不同
		* （评）这导致成为固定步数迭代格式，而非在精度低于某阈值后终止
	* （评）类似的 `HINTS-2208.13273` 若干 Jacobi 迭代中插入一步 DeepONet 迭代，不过那里强调 DeepONet 优先处理低频分量的性质，并且中间的各个 DeepONet 是同一个
	* 训练 loss：有监督（输出结果与真解取 L2 距离）或无监督（用方程网格离散后的 PDE loss）
		* （评）固定总迭代步数后有点像 NO
* `2206.08594` 从元学习角度分析训练得的迭代格式，认为目前常用的 loss 不符合加速求解目标，并给解决方案
	* "Principled Acceleration of Iterative Numerical Methods Using Machine Learning"
		* Sohei Arisaka, Qianxiao Li
		> created on 2023-02-22
	* （评）引了 MAD，Meta-MgNet，`2010.15761`
		* 元学习针对加速求解，而非有限信息（小样本，或者依据 PDE 残差优化使结果 L2 好）
	* 注：以下根据回忆概述，日后需精细整理，为有价值文章
		* solver 参数 $\theta$，metasolver（参数 $\omega$）在输入 task 后负责输出 $\theta$
			* 分析了已有各算法在该框架下的理解方式，如 MAML 的 $\theta$ 为迭代的初始参数，其 metasolver 输出其实与任务无关
		* 目前训 metasolver 所用的 loss $L_m$ 是希望使它 $m$ 步后的残差尽量小；但真实目标应该是达到误差 $\epsilon$ 所用的步数 $L_\epsilon$ 比较少
		* 实验表明这有区别：大量简单任务中加入少量困难任务（需要更多迭代步数才可满足给定误差界），此时 $L_m$ 被困难任务 dominate，学得的算子根本没有对简单任务进行优化
		* （评）考虑（关于任务分布的）期望迭代步数，而非最大迭代步数；后者直接用文中说的 $L_m$ 则表现更好
		* 提出的解决方案：用 $L_\epsilon$ 作为优化目标
			* 由于它本身离散取值、不可微，先改写为示性函数的求和，再用 sigmoid 光滑化、成为 surrogate
			* 进一步只截断到有限的 $m$（选得较大）步，否则开始训练可能 loss 取值无穷
	* solver：$\Phi:T\times\Theta\to U$ 由 $\theta$ 参化
		* eg1，迭代求解器的迭代初值，即 initial guess；可包括 Jacobi 迭代的初始场猜测，NN ansatz 的初始化参数
	* meta-solver $\Psi:T\times\Omega\to\Theta$ 由 $\omega$ 参化，对特定 task 生成其求解器参数 $\theta_\tau$
		* p4:1 MAML 中 $\Phi$ 是从 $\theta$ 开始做若干梯度下降（通常固定步数，而非根据 loss 决定何时停止迭代），$\Psi$ 返回常数值 $\omega$（对所有任务选取方式一致）
		* （评）这种形式化方式不完全合理，$\Phi$ 不应当成黑箱映射，必须考虑其内部结构（迭代求解器）
			* 我采用的形式化框架为((n3hf8z))让 $g=\Psi_\omega$ 生成迭代算法的初值、迭代格式，这两者打包视为 $\Phi_\theta$
	* def2.1 meta-solving problem，$\min_\omega\mathbb{E}_{\tau}[L(\tau;\omega)]$
		* eg1 中该目标函数可以有监督或无监督（取方程的 residual loss）
		* sec2.1:-1 科学计算中常用的目标函数应为 $L_\epsilon$：达到给定误差 $\epsilon$ 所需的迭代步数
		* sec2.2:1 已有工作常有这种 gap，训练时极小化 $m$ 步后方程残差 $L_m$，但测试性能时却在用 $L_\epsilon$
		* sec2.2.0:-1 强调 $L_m$ 并非 $L_\epsilon$ 的好 surrogate，这是“significant departure from classical meta-learning”；{_n3hf3o}
	* sec2.2.1 例子，1D Poisson 方程离散化，$\Phi$ 为 Jacobi 迭代，$\Psi$ 为生成初值的 NN
		* $\Psi$ 全连接 NN，输入方程右端项（源项 $f$）、输出 Jacobi 迭代初值；比较基线为恒生成 0 初值的 $\Psi$
		* 用有监督 loss；注意用 $L_{m=0}$ 优化相当于训 NO
		* 训练任务（右端项）分布：比例 $p$ 的困难任务，其余为简单任务
		* fig1 用不同方式训练后的测试 $L_\epsilon$ 结果，发现用 $L_m$ 训、随 $m$ 增大未必变好，全简单任务时可能和没训时差不多，引入一些困难任务则甚至不如不训；都不如直接用 $L_\epsilon$ 训的好
			* （评）之前 helmnet 规避 $m$ 选取问题是改用 $\sum_mL_m$ 形式的 loss？
		* fig2 解释原因，有困难任务时 loss 被困难任务 dominant，减少困难任务迭代步数的同时 增大了大多数简单任务的迭代步数；{_n3hf3x}
	* sec2.2.2 例子的分析，假设只有二任务、均为特征向量（从而特征值越小越难）
		* meta-solver 取右端项的固定倍数作为 Jacobi 迭代初值 $\theta=\omega f$
		* 可证明存在唯一极小值 $\omega_m$
		* prop2.2 (1) $m\to\infty$ 时 $\omega_m\to 1/\mu_1$，即被困难任务主导；(2) 给定 $\epsilon,p$ 时，$m>m_0$ 后 $m$ 越大，以 $L_\epsilon$ 度量的 $\omega_m$ 表现越差，(3) 通过改选任务，$L_\epsilon$ 可以任意地差
	* sec3.1.1 例子的分析，现在改用 $L_\epsilon$ 优化
		* prop3.1 在 $\epsilon\to 0$ 下 $\omega_\epsilon$ 趋于 $1/\mu_1$ 或 $1/\mu_2$，取决于某参数与临界值的关系
		* 注意结论 eqn(7) 表明可在 $\epsilon=\delta_1,\delta_2$ 下训练、但用另一个更小的 $\epsilon<\delta_2$ 来测试，即希望它训练后泛化到更精确的求解任务上；{_n3hg3v}
		* eqn(8) 通过改选任务，$\omega_{\epsilon=\delta}$ 的效果可以比原 loss 训练得的 $\omega_m$ 表现差异任意大，即好的程度可以任意多
	* sec3.2 需找 $L_\epsilon$ 的可微替代，之前说了不是 $L_m$；{_n39e6q}
		* eqn(9) loss 等价表达为对迭代步 $k$ 求和形式，每步为关于 $L_k$ 的示性函数；{_n3bd9x}
		* 第一步：截断至有限求和 $L_\epsilon^{(m)}$，将 $m$ 固定为较大值；{_n3bd9t}
		* 第二步：eqn(10) 示性函数改为 sigmoid 函数，带参数 $a$ 控制跳跃强度；{_n3bd9n}
		* 该 loss 下最优求解器记号 $\Phi_{\epsilon,m}$
			* 与原记号关系：$\Phi_\epsilon=\Phi_{\epsilon,\infty}$，$\Phi_m=\Phi_{0,m}$
	* （评）许多文章不是用 $L_m$ 而是用 $\sum_mL_m$，不确认是否会有差别
* `2107.05729` （备用）概率图模型求（顶点子集）边缘分布，用 GNN 快速获得近似解
	* "Generalization of graph network inferences in higher-order probabilistic graphical models"
		> created on 2022-11-14
	* 摘要：概率图模型边缘分布不好求，传统算法用分布式消息传递算法（如 belief propagation）近似，但对有环路的图表现不好，对复杂的连续概率分布可能也不好
		* （评）这里的“消息传递”应该是概率图模型里的术语，传统上手动设计，而 GNN 语境下的消息传递默认都是学出来的形式
	> 本文使用定义在因子图上的图神经网络构造迭代消息传递算法，以实现对涉及多变量交互的图形模型的快速近似推断
	* sec3.3 为构造因子图的消息传递算法，先构造二部图上的 GNN，这不像传统 GNN 平等对待所有顶点；包括注意力机制；隐状态用 GRU 更新
	* 实验，sec3.4.1 先在有解析解的高斯图模型上测试、与真解比较；之后试其他模型；
		* sec4.1.1 带环路的图，sec4.1.2 tree graph，sec4.2 带三阶相互作用的 spin system
* [PDEBench-2210.07182](https://mp.weixin.qq.com/s/wqPC6m23H_V9Gp5ZPo3EPQ) DL 解 PDE benchmark 数据集
	* "PDEBENCH: An Extensive Benchmark for Scientific Machine Learning", NeurIPS2022
		* [GitHub 地址](https://github.com/pdebench/PDEBench)
		> created at 2022-11-22
	* 数据集（GitHub 上给了链接）：对流，Burgers，反应扩散，NS 可压不可压，Darcy flow（唯一不含时的），浅水波
		* [数据集下载地址](https://darus.uni-stuttgart.de/dataset.xhtml?persistentId=doi:10.18419/darus-2986)，[预训练模型下载地址](https://darus.uni-stuttgart.de/dataset.xhtml?persistentId=doi:10.18419/darus-2987)
	* 提出的指标：RMSE 及其 normalized 版本，max error；物理角度的守恒量 RMSE、边界 RMSE、Fourier 域低/中/高频的 RMSE
	* 几种经典模型预训练代码，主要是 U-Net、FNO、PINN
		* 文中的实验，RMSE 基本都是 FNO 最小
		* 数据格式统一，他人容易贡献，加入更多数据集、基准模型
	* 其他：发现 JAX 速度大约为 PyTorch 6 倍
* `2111.08005` 线性反问题（部分观测+噪声）用 SDE 式生成模型，训练先拟合样本分布，生成时每步根据观测值解优化问题以施加偏移
	* "Solving Inverse Problems in Medical Imaging with Score-Based Generative Models", ICLR2022
		> `2022-11-30`(dbGrpMeet2)，前置知识也可以按那里的框架
	* 线性反问题，带噪声、不完整观测 $y=Ax+\epsilon$ 要恢复 $x$
		* 其中 $A=P(\Lambda)T$，$T$ 为可逆变换，$P(\Lambda)$ 只观测部分分量（例如场在某些点的采样）
		* 包括 CT, MRI
		* （评）可重复使用，属于 ((n7vn70))invDPs 给出多可能性的框架
	* 非条件生成模型记为 $x_{i-1}=h(x_i,z_i,s(x_i,t_i))$
		* 其参数可从数据集 $\{x\}$ 中无监督学习（> 之前可能积累了一些高成本、高清晰度的数据？）
		* $h$ 具体形式同传统 score-based 生成模型，这里省略
		* $z_i$ 为第 $i$ 时间步的噪声
	* fig3 条件生成时引入额外步骤
		* $p(y_i|y)$ 可算出解析表达式（$x_i$ 前向 SDE，做线性变换后的相应方程不难给出）
		* 根据 $x_i$ 引入条件给出 $x_i'$：解 proximal 优化问题，使它同时接近非条件估计 $x_i$、无噪声情形可能解的集合 $\{u|Au=y_i\}$
			* thm1 其实有显式解
		* 时间反向 $x_{i-1}=h(x_i',z_i,s(x_i,t_i))$
			* （评）单步 SDE 出发点是（根据 $y$ 做某种软投影后的）$x_i'$，但 drift 计算用未投影的 $x_i$；可能因为训练所得 $s(x,t)$ 只在 $x_i$ 位置比较准确？
* `APNN-2111.02541` 考虑方程中小参数，希望极限方程对应 loss 等于方程 loss 的极限；对 Boltzmann 方程设计合适 ansatz 达到该目标
	* "Asymptotic-Preserving Neural Networks for Multiscale Time-Dependent Linear Transport Equations" Shi Jin, Zheng Ma, and Keke Wu
		> `2022-12-10`(lectures)
	* （评）算框架 `PINN%`-杂项技巧-摄动项
	* 定义 APNN：小量 $\epsilon\to 0$ 时，设微观方程收敛于宏观方程，要求网络满足微观方程 loss 收敛于宏观方程 loss
	* 考虑线性输运方程 $\epsilon\partial_tf+v\cdot\nabla_xf=Lf/\epsilon+\epsilon Q$，$f(t,x,v)$
		* $\epsilon\to 0$ 宏观方程 $\partial_t\rho=D\nabla_x\cdot(\nabla_x\rho/\sigma)-\sigma_A\rho+Q$
	* 1D 情形推导可奇偶分解（even- and odd-parity method）：$r(t,x,v)=(f(t,x,v)+f(t,x,-v))/2$，$j(t,x,v)=(f(t,x,v)-f(t,x,-v))/2\epsilon$
	* 宏观微观分解 $f=\rho+\epsilon g$（平衡部分+非平衡部分）；可导出 $\epsilon\to 0$ 时极限方程 $\partial_t\rho+\nabla_x\cdot\langle vg\rangle=Q$，$v\cdot\nabla_x\rho=Lg$
	* PINN（NN 直接表达 $f_\theta$）失效，loss 中令 $\epsilon\to 0$ 得 $f_\theta=\rho$ 而非想要的宏观方程的解
	* 本文 NN 表达 $\rho_\theta(t,x),g_\theta(t,x,v)$，可验证 loss 极限对应的方程 等于极限方程对应的 loss
	* 相关：`APNN-2206.12625` 传染病 SIR 模型的 PDE 版本（考虑人的空间分布与移动），为双曲方程，可用类似方法处理；似乎不是同一个组的工作？
* `BINet-2110.00352` PDE 解 ansatz 用边界元，参化边界函数后用积分算子给出区域内函数，训练仅边界 loss
	* "BINet: Learning to Solve Partial Differential Equations with Boundary Integral Networks" Guochang Lin, Pipi Hu1,, Fukai Chen, Xiang Chen, Junqing Chen, Jun Wang, Zuoqiang Shi2,3∗ 2
		> `2022-12-11`(lectures)
	* 方程 $Lu=0$ in $\Omega$，设微分算子的基本解 $G(x,y)$ 已知
		* （评）似乎这里 $G$ 指全空间的 Green 函数，而非 $\Omega$ 对应的 Green 函数
		* 同组后续工作 `BI-GreenNet-2204.13247` 面向学特定区域的 Green 函数
	* 解 ansatz：在 $\partial\Omega$ 上定义 $h$，用 $G$ 积分来表达内部解
		* thm1 对任意 $\partial\Omega$ 上函数 $h$：
		* single layer potential $S[h](x)=-\int_{\partial\Omega}G(x,y)h(y)dS(y)$ 满足 $Lu=0$
		* double layer potential $D[h](x)=-\int_{\partial\Omega}(\partial G/\partial n)(x,y)h(y)dS(y)$ 也满足 $Lu=0$
		* 前者在边界连续，后者有突变 $\pm h(x)/2$，符号取决于从有界区域内部或外部逼近
	* 现用 NN 参化边界函数 $h_\theta(y)$；对 BC $u|\partial\Omega=g$，loss 为 $\|S[h_\theta]-g\|_{\partial\Omega}^2$，用双层位势的为考虑了跳跃的相应版本
	* 好处：区域内部 PDE 自动满足，仅在边界采样降低 sample complexity，无需计算微分而只需积分
		* （评）不用算微分是因为微分部分约束信息已全部放进 Green 函数里了
			* 属框架 `coordMLP%` 满足特殊约束的 ansatz、非直接 NN 表达 ansatz
			* 注意有的网络架构 ansatz 是自动满足 $u=g,\partial\Omega$ 而 loss 只考虑 $Lu=0$，而这里是反过来
	* 收敛性分析理论，用 NTK
	* 实验，Laplace 方程在边界不光滑（折线形状）时表达正确，但 PINN 与 DRM 表达的解在边界光滑、非尖点
		* Helmholtz 方程
	* （评）可能性：用于解含参 PDE（NO 或元学习式），边界所用 $h$ 随 PDE 参数变；注意积分算子所用 Green 函数也要随微分算子变化（如果微分算子含参）
		* 后续工作 `BI-GreenNet-2204.13247` 也可认为给出了 NO，但对获得的解求值时需要显式提取 PDE 参数值，不是这里考虑的直接表达解的形式（完成计算得到相应 $h$ 后无需再保留 PDE 参数值）
* `BI-GreenNet-2204.13247` 学 PDE Green 函数，ansatz 用边界元
	* "BI-GreenNet: Learning Green’s functions by boundary integral network" Guochang Lin, Fukai Chen, Pipi Hu1,, Xiang Chen, Junqing Chen, Jun Wangand Zuoqiang Shi1,3* Yau
		> `2022-12-11`(lectures)，为 `BINet-2110.00352` 续作
	* 考虑两种问题：单区域 $Lu=f,\Omega;u=g,\partial\Omega$；interface problem $\Omega=\Omega_1\cup\Omega_2\cup\Gamma_1$，$Lu=f,\Omega;u=g_3,\partial\Omega$ 且 $[u]=g_1,[u_n/\mu]=g_2,\Gamma_1$
		* 注：以下均只记录单区域问题，界面问题文中有相应讨论但不记录
	* 希望用 NN 表达 Green 函数；为避免奇点，只学基于全空间 Green 函数 $G_0$ 的增量，即 $G=G_0+H$ 只学 $H$；对两种问题可分别写出 $H$ 方程
		* （评）框架 ((n3fe2j))paramPDE-学 Green 函数
	* DB-GreenNet 直接参化 $H_\theta$，按 PINN loss 训；注意采样内部 $(x,y)\in\Omega\times\Omega$，边界 $(x,y)\in\Omega\times\partial\Omega$
	* BI-GreenNet ansatz 仿照 `BINet-2110.00352`
		* 单层位势 $S[h](x,y)=\int_{\partial\Omega}G_0(x,y)h(x,z)dS(z)$，双层位势类似
		* loss 只涉及边界 $(x,y)\in\Omega\times\partial\Omega$
	* 数值实验，L 形区域、源项用位图随机噪声给出情形；Helmholtz 方程无界区域（或说是某有界区域的补集），来自CSI给的双三角天线电磁辐射算例
		* 界面问题用圆角星形界面，内外 $\mu$ 值突变
* `POUnet-2101.11256` 坐标网络 ansatz 引入自适应单位分解，每区域为给定基底线性组合，优化交替更新单位分解与基底线性系数；后续工作另有类似 BNN 衍生版本
	* "Partition of unity networks: deep hp-approximation" Kookjin Lee, Nathaniel A. Trask, Ravi G. Patel, Mamikon A. Gulian, Eric C. Cyr
		> `2022-12-14`(dbGrpMeet2)
	* ansatz $f_\theta(x)=\Phi_\xi(x)^\mathrm{T}CP(x)$，$\theta=(\xi,C)$，$\Phi_\xi:X\to\R^N$ 单位分解映射
		* 输入仍为原空间坐标 $x$，未先映射到 FEM 标准单元；{_q8s67u}
		* $P(x)$ 预先选定的基底，如不超过 $m$ 次的多项式；乘上单位分解后使该基底被 localize；{_q8s66d}
		* 传统数值分析中用 meshing 方式构造矩阵 $C$
		* （评）传统上应该生成 mesh 后获得（硬）单位分解 $\Phi$，基底 $P(x)$ 取定，只需拟合各单元内的各系数、组装成为 $C$，$C$ 常为瘦高矩阵；标题的 hp-approximation 应该是这个意思
		* （评）自适应区域单位分解属框架 ((n2pe8f))INR-区域分解
	* 误差分析定理 thm1
	* 单位分解网络 $\Phi_\xi(x)$（> 相当于可学区域分解）{_ocae9z}
		* 构造 1：RBF-Net，各 RBF 的中心位置、方差为可学参数
		* 构造 2：ResNet，最后一层用 softmax
	* 优化算法 alg1 regularized LSGD（最小二乘 GD），二分量依次迭代，最小二乘更新 $C$、再 GD 更新 $\xi$
		* regularized 表示加入额外正则化项 $\lambda\|C\|_F^2$，若 LSGD 连续几步未更新则减小 $\lambda$
		* alg2 two-phase LSGD，执行完 alg1 后再做无正则化项的 LSGD
	* 实验，拟合连续函数、分片光滑函数
	* 注：组会讨论时提到的好处包括 INR 拟合图像时可顺便完成图像分割任务
	* （评）算 ((o6fn12))domDecmp 特殊情形，那里 ansatz $\sum\phi_i(x)f(x,c_i)$，若取特殊的基底线性组合形式 $f(x,c_i)=c_i^\mathrm{T}P(x)$ 则成为这里的 ansatz
		* 那里还可进一步取 $\phi(x)=\mathrm{softmax}\{g(x,c_i)\}$，若 $g$ 取为参数 $c_i$ 的 RBF 则成为这里的构造 1
			* 这样构造的区域个数可动态增加，而这里构造 2 不行
			* 若在误差大地方动态添加新区域，可适当设定初始化参数选取，以在特定位置引入新基底，也许类似新增神经元的做法 ANE ((n37g53))
			* 不过固定输出维数、NN 直接生成所有单位分解结果的做法或许计算上更高效
		* 相关的框架还包括 ((n3hg7a))1TaskHypernet
	* （备用）后续工作 PPOUnet-2107.03066 引入随机性（> 类似 BNN）
		* "Probabilistic partition of unity networks: clustering based deep approximation"
		* 单点取值随机取一个 $i$，取的概率正比于单位分解值 $\phi_i(x)$
		* （评）看 eqn(9) 是逐点取值独立的那类随机性，不是随机函数形式
			* 由于选择概率 $\phi_i(x)$ 也依赖于 $x$，也难以改成随机函数版本
		* 此外额外引入加性高斯噪声
	* （备用）后续工作 PPOUnet-2210.02694 随机性之外再考虑高维问题
		* "Probabilistic partition of unity networks for high-dimensional regression problems"
		* fig2 串行架构，先降维得编码 $\psi(x)$ 再将之输入基函数、分类器（即单位分解）；并行架构，分类器直接输入 $x$，基函数仍输入降维编码结果
		* alg1 EM 算法训练，降维版本、以及考虑背景噪声版本
* `2210.01741` 坐标 MLP 架构自动满足无散条件，推导涉及外微分形式；流体守恒律方程可写为 4 维无散
	* "Neural Conservation Laws: A Divergence-Free Perspective", NeurIPS2022
		> 2022-10-14 组会群推荐
	* 推导 div-free 网络构造，用外微分形式，可写为 $\star d\mu$
		* 这需参化 $O(n^2)$ 个函数；若改写为 $\star d\delta\nu$ 则只需 $n$ 个
		* 实现上，前者相当于参化一个反对称矩阵场 $A$，后者用向量场 Jacobian 的对称差表达 $A=J_b-J_b^\mathrm{T}$
		* （评）3 维情形旋度场自动无散，估计在 3 维时上面的构造会与旋度场等价
	* 例子：守恒律 $\rho_t+\nabla\cdot(\rho u)=0$ 可写为 4 维无散条件 $\nabla\cdot[\rho;\rho u]=0$
* `Lagaris1998ANN` 最早的 PINN，已考虑网络构造自动满足 BC（针对简单区域，包括 (D,N) 混合 BC）
	* "Artificial neural networks for solving ordinary and partial differential equations", I.E. Lagaris, A. Likas, D.I. Fotiadis, IEEE transactions on neural networks, 9 (1998) 9871000.
		* 以下依据版本 arXiv:physics/9705023
		> created on 2023-01-06，信源为某篇审稿的 CMAME 投稿文章引用
	* 方程形式 $G(x,\Psi(x),\nabla\Psi(x),\nabla^2\Psi(x))=0$ 在 $D$ 内，改写为在离散点 $x_i$ 上成立，$\min\sum_iG(x_i)^2$
	* 为满足 BC，ansatz $\Psi(x)=A(x)+F(x,N(x,\theta))$，$A$ 构造成满足 BC，$F$ 构造使其对 BC 无贡献
		* （评）这个框架写得比较一般，不限于 (D)
	* 针对 ODE 的问题解法说明
	* PDE，Poisson 方程 $\Delta\Psi=f$ 在 $[0,1]^2$ 上
		* 给定四条边 (D) BC，ansatz $\Psi=A+x(1-x)y(1-y)N(x,y;\theta)$，$A$ 构造也涉及多个 $x,(1-x)$ 之类的项
		* 不同边分别 (D)、(N) BC，(N) 仅 $\partial_y\Psi(x,1)=g_1(x)$，ansatz $\Psi=B+x(1-x)y[N(x,y)-N(x,1)-\partial_yN(x,1)]$，$B$ 构造略
	* 实验，与 FEM 比较等
* `Lagaris2000NNM` 最早 PINN 中复杂 BC 处理，靠每次重计算 RBF 补偿项，或靠惩罚项
	* "Neural-network methods for boundary value problems with irregular boundaries", I.E. Lagaris, A.C. Likas, D.G. Papageorgiou, IEEE Transactions on Neural Networks, 11 (2000) 1041-1049.
		> created on 2023-01-06
	* 针对最早的 `Lagaris1998ANN`，考虑到复杂边界形状、边界条件下，难以手动设计 ansatz，故用自适应版
	* 法 1，ansatz $\Psi(x)=N(x;\theta)+$RBF，每次对 NN 梯度更新后，重新计算 RBF 参数使 BC 成立；重新计算代价较大
	* 法 2（> 即后来 PINN 最开始用的）纯 NN ansatz，BC 靠惩罚项引入
* `DPGM-2201.12995` PDE ELM ansatz，系数确定用弱形式方程、一族取定的测试函数导出的等式
	* "Deep Petrov-Galerkin Method for Solving Partial Differential Equations"
		> from `2023-01-12`(lectures)
	* ELM ansatz $u=\sum u_i\phi_i$（> 可见 `coordMLP%`“ELM”）
	* Galerkin 弱形式方程；取测试函数 $v_j$，得线性方程组 $\sum u_i\langle\phi_i,v_j\rangle=l(v_j)$，其中系数矩阵可预先计算（涉及数值积分）
		* 与 FEM 不同，这里的系数矩阵不对称，且不排除有时条件数大
		* 注意 $l(v)$ 项中体现了非齐次 Neumann BC
	* Dirichlet 部分 BC 给出线性方程组 $\sum u_i\phi_i(x_k)=g(x_k)$（Neumann 部分已在弱形式中）
	* 联立二方程组求解得系数，作为最终解
	* 另有 mixed DPGM，靠升维（引入新场 $p=\nabla u$）对 PDE 降阶
		* Galerkin 弱形式下对 $p-\nabla u$ 再引入对偶变量 $q$
		* 考虑对二方程是否分部积分（有相应 BC），弱形式方程有 4 种可能形式；{_n56f3o}
		* （评）没搞懂动机，原文只说仿照 mixed FEM；当日作者介绍提到可处理一般的多未知量情形
	* 含时方程：热方程，Galerkin 弱形式涉及时空积分、保留 $u_t$
		* （评）该形式与 `PFNN2-2205.00593` 类似，只是这里系数场 $a$ 形式没那里一般
		* IC 作为特殊 (D) BC，求解方法与之前类似
	* 含时方程：波方程，Galerkin 弱形式涉及时空积分、有 $u_t,v_t$
	* （评）按当天作者介绍，应可视为 FEM 改进，使之无网格、测试函数选取灵活、BC 处理灵活；对含时方程，统一时空处理以避免误差累积，时间不离散化、无需插值
	* 注：当天作者介绍 slides 里写 LRNN-DG 也是 ELM+弱形式方程 的做法
* `locELM-2012.02895` （备用）PDE ELM ansatz，硬区域分解，含时方程长时演化可时间分块推进
	* "Local Extreme Learning Machines and Domain Decomposition for Solving Linear and Nonlinear Partial Differential Equations", Suchuan Dong, Zongwei Li
		> recommended at `2021-11-10`(AISCmeet), cited by `DPGM-2201.12995`
	* 摘要：
		> 在精度和计算成本方面，当前方法的计算性能与FEM性能相当，并且经常超过FEM性能。
		* （评）线性假设空间下，高精度需要解集 Kolmogorov n-width 低，不过这方面 FEM 有一样的问题
		* （评）会议记录中讨论：精度高可能因为各区域阶数高于 FEM，速度上不知为何它跑的 FEM 这么慢
	* （评）框架 `coordMLP%`“ELM”NN 除最后一层外，前面层参数随机取定做法
	* （评）更多见当时会议记录，这里记录不完善；INR-区域分解((n2pe8f)) 提到时的表述复制如下：
		* 2110.14121、本文：不同区域的网络，前面层随机生成不训练（可能共享），最后一层各区域单独训练；区域为硬分解，有时间分解的讨论；{_q8s66e}
	* 方程 $Lu=f$，边界 $u=g$，系数靠最小二乘求解（以下用我的记号）：
		* 单区域，设 ansatz $u=\sum w_jV_j(x)$，则线性方程组形式：内部 $\sum w_jLV_j(x_p)=f(x_p)$，边界 $\sum w_jV_j(x_q)=g(x_q)$
		* 硬区域分解，每区域内像单区域那样处理，再引入边界上取值一致的约束
	* 含时方程 $u_t=Lu+f$，BC $u=g$，IC $u=h$，也可处理，包括时空硬区域分解
		* （评）取 $L'=\partial_t-L$ 即化为之前不含时情形
		* 长时间模拟的 block time-marching 策略，每个时间块上分别解 PDE
	* 不含时非线性方程 $Lu+F(u,\nabla u)=f$
		* 得关于系数 $w_j$ 的非线性代数系统；p14:-2 方程数与未知数个数分别计算
		* 解法 1：解非线性最小二乘问题
			* 用 scipy.optimize 包
			* 发现可能陷入局部极小，如当模拟分辨率不足时，或含时非线性方程、长时模拟时
			* 解决方案，求解时引入子循环，其中对初始猜测进行随机扰动：NLSQ-perturb
		* 解法 2：Newton 迭代，结合线性最小二乘计算：Newton-LLSQ
		* 注：关于二解法更多见会议记录
	* 含时非线性方程 $u_t=Lu+F(u,\nabla u)+f$
	* 实验：1D Helmholtz，sec3.4.1 非线性版本 $u"-\lambda u+\beta\sin u=f$
* `Neural-ePDO` 待学微分算子保场旋转等变，允许各项系数依赖于场当前点取值，离散为依赖于空间的卷积，实验为图像分类
	* "Neural ePDOs: Spatially Adaptive Equivariant Partial Differential Operator Based Networks", ICLR2023 spotlight
		* Lingshen He, Yuxuan Chen, Zhengyang Shen, Yibo Yang, Zhouchen Lin
		> recommended from CSImeet group at 2023-02-01
	* 要求在仿射群 $H=\R^2\rtimes G$ 下等变，$G\le GL(2,\R)$，实验取 $C_8,C_{16}$
	* 作用于场 $f\in\mathsf{Set}(\R^2,\R^n)$ 上的方式，在空间仿射变换基础上，加上 fiber $\R^n$ 上的群作用 $\rho:G\to\mathsf{Vec}(\R^n)^\times$
		* 具体地，$(\pi(h)f)(x)=\rho(g)f(g^{-1}(x-t))$，$h=(t,g)\in H$，
		* 用我的记号：坐标仿射变换 $\mathsf{Set}(-,\R^n)[.]\circ(.)^{-1}$（为两个反变函子复合 $H\to H\to Set(F)^\times$，$F=Set(\mathbb{A^2,R^n})$）
			* fiber 作用 $Set(\mathbb{A}^2,-)[.]\circ\rho$，为二协变函子复合 $G\to Vec(\R^n)\to Set(F)^\times$
				* 似乎还有 $H\to G$？回忆半直积为 $G\to Grp(\R^2)^\times$，向 $G$ 分量投影应能定义
			* 之后再在 $Set(F)^\times$ 中取复合即可
		* secA 群表示背景知识：正则表示指 $G$ 作用于 $Set(G,\R)$（基于在集合 $G$ 上的作用，右乘），商表示则基于在陪集 $G/H=\{gH\}$ 上的作用
	* PDO 形如 $\sum W_aD^a$，最高阶数 $\le N$ 的多重指标组成集合 $\Gamma_N$
		* 其中 $W_a\in Vec(\R^{ci},\R^{co})$，给出的算子的定义域、陪域分别为 $C^\infty(\R^2,\R^{ci,co})$
		* （评）相应 PDO 组成空间 $Set(\Gamma_N,\R)\in Vec$；原文用记号 $\R^{|\Gamma_N|}$
		* eqn(5) 可给出表示 $\hat\rho:G\to Vec(Set(\Gamma_N,\R))^\times$
	* sec4.1 非线性 PDO 若用 $W_a(x)$，要求等变只能与 $x$ 无关；考虑 $W_a(f(x))$
		* prop2 等变性要求为 $W(\rho(g)y)(\hat\rho(g)\otimes\rho(g))=\rho'(g)W(y)$，$\forall g,y$
		* 注：未搞清楚 $\rho'$ 含义，是只要求存在？另外 $\rho$-field 含义也未确认
	* sec4.3 高效实现，将所有 $W_a$ 取为 $n$ 阶对角矩阵（额外要求 $ci=co$）；约束改写为 prop3
		* 使用 MLP 生成，单隐层 bottelneck 宽度 $ci/r$，输入 $ci$ 维，输出 $|\Gamma_N|ci$ 维
		* $\rho$ 也假设可分解为多个相同表示的乘积（未确认细节），对 $W$ 输出的表示也是
	* sec5.2 PDO 离散化，用 FD 为卷积
		* 用 GA 则为对高斯卷积核（标准差 $\sigma$）求 PDO 后再作用于 $f$ 上
	* 实验较简单，MNIST-rot $G=C_{16}$ 循环群，ImageNet $G=C_8$ 基于 ResNet26 构建、参数更少且更准

