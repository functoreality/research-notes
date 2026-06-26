> 2022-01-05 从原版 `~/nutstoreFiles/research/slides/mine/20summer-AI+SC/AI+SC-notes.md` 修改而来
## presented
* `GKN-2003.03485`: #GNN, #PDE (#generalizable_grid, #grid-independent), #inf-dim_operator, (#open_source)
	* 问题：（椭圆）PDE $\mathcal{L}_a(u)=f$, $u|\partial D=0$ eqn (4)，固定 $f$，希望学到求解映射 $a\mapsto u$ eqn (2)
		* (before p5 eg.1) 一般情形可以学 $(a,f,g)\mapsto u$ ($u|\partial D=g$)
		> not meta: $u\ne\mathrm{NN}(x;\theta)$
		* p2 3rd par. 可以处理未知 PDE，不像 NN 解
		> 原则上可以用于超分辨率等非 PDE 的无穷维空间变换
	* Green's func $G_a$
	* 基于迭代算法 eqn (7-9)；
		> (?) eqn (7) why not init using $f$, as in eg1? 
		1. eqn (5), Green 函数
		2. 推广得到迭代格式 eqn (6)（下方 eg1 说明是推广）
		3. 取测度 $d\nu_x(y)=\mathbf{1}_{B(x,r)}dy$ 得到 eqn (8)（p7 首段，可根据先验知识改选测度）
		4. GNN 离散化（相当于 Monte Carlo 采样）得 eqn (10)
		5. p8 首段采样（$l$ 次）$m$ 顶点 sub-graph 加速计算（下方实验的 sec 4.1, 4.3 还是用完整的 graph）
		> p8 when $r=\infty$, $d\nu(y)=dy$: $T=\mathrm{id}$  
		> (?) p8, $f$ same as in PDE? 
		* 构造图，grid 为顶点，$r$-邻域连边，得到类似 RNN 的迭代格式 eqn (10), $a$ 的信息放入 edge feature $e$ 中
		* p8 采样合理性，只用关于 $\kappa:D\times D\to\R$ 的定理说明，算法中事实上用到的是 $\to\R^{n\times n}$
		> 引用的 `GEN-1904.09019`(x) p5 3.4+p6 考虑了优化 node 位置，类似 meta 的梯度
	* sub-graph 应该不产生新的边
	* 应该不能处理 NN 解，导致难以处理高维 PDE
	* (slides: numerical results)
	* eg2 ($f\mapsto u$), “需要样本数少”（不是采样点），类似 few-shot
	* p8 末段, $\mathcal{N}(0,(9I-\Delta)^{-2})$ 函数空间上的分布的定义? $\psi_\#$ 的含义；
		> 找到的资料：测度使得 $\forall x\in\mathcal{H}$, $\langle x,y\rangle\sim\mathcal{N}(\mu_x,\sigma_x^2)$；计算有限维情形，应该是 $\langle x,y\rangle\sim\mathcal{N}(0,x^\mathrm{T}\Sigma x)$  
		> $\infty$-dim 下能否求特征函数（FT）？在 $f:\mathcal{H}_1\to\mathcal{H}_2$（未必线性）下推出测度 $f_\#$ 对应的特征函数变换？
		* 定义最终在李铁军“随机模拟方法”课程教材中找到，并且在该课程笔记里记录；不过更多在讨论 $(9I-\Delta)^{-1}$ 类似的情形
		* (mine) $\psi_\#$ 含义，我习惯的范畴论语言解读
			* $\psi\in\mathsf{Top}(\R,S)$, $S=\{3,12\}$
			* $\mathsf{Top}(\Omega,-)[\psi]:\mathsf{Top}(\Omega,\R)\to\mathsf{Top}(\Omega,S)$
			* $\mathbb{P}:\mathsf{Set}\to\mathsf{Set}$（这里不赋予更多结构，例如结合 Wasserstein 距离带来的结构）
			* $\psi_\#=\mathbb{P}[\mathsf{Top}(\Omega,-)[\psi]]$，而 $\mathcal{N}(0,(9I-\Delta)^{-2})\in\mathbb{P}(\mathsf{Top}(\Omega,\R))$
	* 算法 grid 无关，训练与测试网格不同（eg 规模）
	* “半监督”指 label 不完整（只有 $m$ 网格点的值）而不是部分数据无 label？（$a$ 在整个 $D$ 有定义，不知道是否只取 $m$ 点取值作为训练输入）
	* 讲解时参考文中 contribution 和 conclusion 部分
	* (pre comments)
		* 迭代格式（连续情形）像 Han Jiequn: ODE control framework, MM 逼近 ODE dynamics
		* $\mathcal{L}_a$ eqn, 从点开始，random walk, take $\mathbb{E}$? Laplace 方程似乎不像和 random walk 联系（没有时间，不像热方程）；首达时（？）
		* 2D 上可能有特征线相交问题，提高到高维可能不相交，$\R^n$
		* 群里可能会发一个工作作为 justify, 椭圆方程转化为双曲的；NN 求解不怕复杂，怕不对，需要理论解释
	* （评）后续工作 `MGKN-2006.09535`；下方 FNO 为同系列工作
* `DFLM-2001.06145`: #SDE, #RL, #PDE_NN_solution
	* 问题：PDE eqn (1+6/7)/(8) NN 解 $u(x;\theta)$，不用 $\nabla_x u$ 的值
		> $F$ 依赖于 $\nabla u$ 时应该还是要用的，文中只考虑 $F(x,u)$
	* PDE 等价于随机过程 eqn (2/10+3) 为鞅 eqn (4), loss eqn (12)
		* eqn (11): Bellman eqn in RL，区别在 known policy
	* 避免“drift”和“volatility”：改用鞅过程 $B_t$+eqn (13)=(19-21)，loss eqn (14)
		> $X_t$ 带标准布朗运动，应该不会出现太慢的问题？
		* 离散化 eqn (23-25), B.C. eqn (26), loss eqn (27)
		* p16 experiment 2: 原来的做法 $F$ 只影响 Bellman eqn 的 policy（随机过程演化方式），这里只影响 discount $\mathcal{D}$；$G$ 始终在 reward $\mathcal{R}$ 里；原来的方法在这一实验的情形，随机过程在两区域速度不同，造成采样不均匀；这里相当于“importance sampling”
		> 似乎 $\mathcal{R}$ 应该是 negative reward？
	* NN struct eqn (17+18), ResNet，结构可根据问题设计（如数值实验 2 间断边界）
	* activation Swish $\phi(x)=x\cdot\sigma(\beta x)$ (sigmoid)，形状像 softplus（ReLU 光滑版）
	* alg 1；脚注，布朗运动跑出区域的两处处理方式不同
	* 实验：(1) $\nabla u_2$ 有奇点 0，(2) 区域内有间断
		> 2 中约束 $[\sigma\partial u/\partial n]$ 似乎不可避免在 loss 中引入 $\nabla u$？
	* feature: no $\nabla u$, "prescribed jumps", 
	> 看起来可以处理不可微、甚至不连续的广义解？  
	> 形式上可以解薛定谔方程，但是不好处理无界区域情形（布朗运动会离开重点区域），可能需要改用有“回复力”的布朗运动，或者足够远时有更大概率“重新初始化”（算法中是当且仅当离开区域后）  
	> 对于涉及 $\nabla u$ 的 NN 方法，或许参数化的空间 $\{u_\theta\}\ne C^2(\Omega)$ 导致（用能量泛函与直接逼近真解的）最优解不重合 $\operatorname*{\arg\min}_{\theta}E(u_\theta)\ne\operatorname*{\arg\min}_{\theta}\|u_\theta-u^*\|^2$？差异多大？本方法是否缓解这一问题？至少实验 2 的结果二者比较相近
	* discussion
		* MC 在高维 variance 大，积分计算效率不高；随机场维数未必低
		* 两种常见做法：1 MC iid 采样，variance reduction 有很多技巧；2 样本不是 iid，更符合 distribution 的 sample
		* 用 test function $v$ 也可以不依赖 $\nabla u$，难点在 $\forall v$ 成立；WGAN 的做法，限制 $v$？用取 $v$ 积分也会引入 approximate error
		* 效果好不一定是因为 $\mathcal{L}$，也可能是因为采样，sampling 方式与 PDE 相关；不知道与用 variation principle 的方法哪个收敛快
		* **关于讲法** ：讲的时候不需要赶，把 pros/cons 想清楚；要保证他人能听明白，不图多，重点是让大家学到东西；超时让别人推迟到下次讲不会有问题
		> 讲之前想好怎么让重点能有足够的重复，而不是 cover 掉一些似是而非的要点；目标不是讲出更多的东西，而是让听的人接受更多东西；
* `2002.02600`: (#backward) #SDE, #eigenvalue_problem, #PDE_NN_solution, #DMC (#diffusion_MC), 
	* full title: Solving high-dimensional eigenvalue problems using deep neural networks: A diffusion Monte Carlo like approach
	* problem: $\mathcal{L}\psi=\lambda\psi$, $\mathcal{L}$ eqn (2,18); 
		> when $\sigma\equiv I$, $\mathcal{L}=-\frac12\Delta-b\cdot\nabla+f$
		* rewrite: (backward PDE) $(\partial_t-\mathcal{L}+\lambda)u=0$, $u_T=\Psi\Rightarrow u_0=\Psi$; "backward" because from BSDE method
		* high-dim: use stochastic process $X_t$, SDE $u(t,X_t)$ eqn (6)
		> (?) 一般的随机模拟解 PDE 框架下的观点？eg. Poisson eqn 解可以对单点求值
		* $\psi_\theta(x)$, init $u(0,X_0)=\psi_\theta(X_0)$, $\min\|u(T,X_T)-\psi_\theta(X_T)\|^2$
		* ansatz+$\mathfrak{N}_{\sigma^\mathrm{T}\nabla\psi}=\sigma^\mathrm{T}\nabla\psi$, loss eqn (7+17)
			> 需要引入这一项的原因：eqn (6,19) $\mathrm{d}u(t,X_t)$ 涉及 $u(t,X_t)$、$\nabla u(t,X_t)$，但随机采样下我们只有 $u$ 的单点取值，无法得到 $\nabla u$，只能用 NN 给出这一项的估计来演化 $u_t$  
			> 其他相关：（1）分子动力学中有的文章称另外拟合梯度 比 BP 求梯度 效果要好（可能梯度所在的函数空间比直接 NN 拟合的空间要小？）；（2）下方 BSDE 参考文献，方程关于 $(Y,Z)$，在解处有 $Z=\nabla Y$
		* avoid $\psi_\theta=0$, require $\|\psi\|^2=|\Omega|$, normalize $Z_\psi$ eqn (12-16)
			* $=|\Omega|$ not 1: when considering $d\to\infty$
			* Discretization, $\hat{Z}_\psi^\ell$ unbiased but $\nabla\text{loss}$ can be biased, so using "exponential moving average scheme"
			* $\mathrm{sign}$ component of $Z_\psi$: $\psi,-\psi$ both solutions, this avoids ambiguity
		* semilin case need clip
		* alg 1
	* p4 2nd par, remark $X_t$ "drift" version, $X_0\sim\nu$ importance sampling with prior knowledge
	* BSDE ref[13] (`1706.04702`) eqn (BSDE,3): unique sol $(Y_t,Z_t)=(u,\nabla u)$
		> 看起来方程 (BSDE) 里似乎任取 $Z_t$ 都能积分解出 $Y_t$，但实际上只有一个 $Z_t$ 对应解 $Y_t$；见 (2nd order) ref[25] p14/18 thm3.1（在 SciHub 找到）
	* NN ansatz, input FT basis $\sin kx,\cos kx$, fig 1, to ensure periodicity
		> input truncation of $\hat\delta_x$
	* experiment, plotting high-dim func using "density", i.e. $\psi(U(\Omega))$ 的概率分布
		* experiment 3 semilin case
	> p2:0, compare with conventional DMC: (a) direct approx of $\psi$; (b) no need of nodal set; (c) $X_t$ 不需要消失、复制；运动方式与方程形式基本无关...
	> (!) finish TODO in `_eigDNN_DMC.tex`
	* 讨论：反向 PDE 类似正向热方程，如果改为正向则未必有解或不稳定；反向 PDE 对应正向 SDE? 
	> 本次讲的一些做法：可以同义反复，可以使用讲一部分之后重新回顾前面讲过内容的方式；开始往后讲之前可以大致预告一下接下来的思路，包括提示后面的内容／当前表达式都是套路不需要关注细节；注意讲出动机；适当不讲一些启发性不大的细节
* `RL_MR4PDE`: #RL, #model_reduction, #PDE, #POD
	* PDE 用 POD 降阶所得 ODE 不稳定，用 RL 先以稳定性为目标学余项，再以误差为目标调系数得降阶模型
	* "Reinforcement Learning-based Model Reduction for Partial Differential Equations"
	* problem eqn(5) $\dot{z}=\mathcal{F}(z;\mu)$，主要框架：
	1. (a) discretize $\mathcal{Z}^n$, (b) coef's $q_i(t)$ for basis $\{\phi_i\}$ (eg. FT spectral domain), eqn (2), (c) Galerkin projection $\dot{q}=F(q;\mu)$
		* 假设降阶模型稳定性、精度对 $\mu$ 敏感，例如流体力学里的粘性系数；真解有限时可能数值爆炸
	2. stablize: $\dot{q}=F(q;\mu)+H(q)$ eqn (7)
		* eqn(8) $F(q;\mu)=F(q)+\mu Dq$，$F(q)$ 来自 POD 降阶，负定矩阵 $D$ 来自流体粘性项
		* learn $H$: use RL, $u=H$ policy, step cost $\mathcal{U}(q,u)=q^\mathrm{T}Qq+u^\mathrm{T}Ru$ eqn (21)
		> 单步损失 $\mathcal{U}$ 的目的：第一项能够避免 $q$ 爆炸，保证稳定性；第二项防止 action $u=H$ 太大（即：方程与原问题相差太远）
		* infinite horizon cost functional $\mathcal{J}(q(0),u)$ eqn (11)
		> 推测 $q(k)$ 指 $q(t_k)$
		* RL: adaptive/approximate 动态规划
		* 交替更新 value $\mathcal{J}_I(q)$, policy $u_I(q)$ eqn (18a,b)
			> $J$ 常见记号应该是 $V$；形式类似 actor-critic，只是学 $V$ 而非 $Q$
		* ansatz: $\mathcal{J}_I(q)=\omega_I^\mathrm{T}\psi(q)$ eqn (22), $u_I(q)$ eqn (23b); update $\omega_I$ eqn (23a)
		* p6/8 thm3, stablized
	3. tuning coef's, $\dot{q}=F(q;\mu+\mu_\text{e})+\mu_\text{nl}H(q)$，调 $\hat\mu=[\mu_e,\mu_{nl}]$
		> 上一步是先保证数值格式稳定，这一步是微调数值格式，来减小数值解的误差
		* cost $Q(\hat\mu)$ eqn (26), ground truth 用 FEM 计算（不进行基底展开）
		* $\hat\mu$ eqn(27)“extremum-seeking algorithm”，解写为某 ODE 系统 $t\to\infty$ 的取值
		> 不是用梯度下降类的算法
	* (?) queries
		* ES (extremum seeking) algorithm 什么原理
		* $H(q)$ 的 ansatz 似乎过于简单？
	* 实验：Burgers 方程，POD 用显式 Euler 离散，演化时长 $t_f=1$
* `2006.08762`: #fluid_PDE (#MAC_grid), #CNN (#U-Net), #unsupervised, #time-dependent_domain, (#open_source)
	* "Unsupervised Deep Learning of Incompressible Fluid Dynamics"
	* ArXiv: with "Supplementary Information", experiment video
	* 概括：问题：解 NS eqn $v,p$，区域 $\Omega$、BC 随时间变化；方法：NN 预测解的更新 $(v,p,\Omega,v_b)\mapsto(\dot v,\dot p)$，用 U-Net，loss 来自方程（无监督）；
	* problem: NS eqn (1-3) on $v,p$，本工作只考虑 2D 情形
		* $\partial\Omega$ 只要没有流体的地方都算，包括障碍物内部；障碍物内部有“假想流体”速度场与障碍物移动速度 $v_d$ 一致, eqn (D) BC
		> 从而速度场定义域不变，只是方程只在障碍物以外定义，即 loss 只在障碍物外计算
		* （p5 eqn (14) 后）希望在 $\mathrm{d}t$ 大时仍然稳定
	* $\nabla v=0$ condition: "Helmholtz decomposition" eqn (9), here $v=\nabla\times a$
		> 此处 2D 情形 $a$ 为标量；注意 $a$ 可以差常数，实现时也许可以每隔几步平移到均值 0，以防止爆炸？
		* 可以少一项 loss term；数值实验比较了不分解（保留相应 loss）的情形 ("$a$-Net", "$v$-Net")，发现分解效果好
		> idea: 没有无散限制的情形，这种分解也可能有用，便于引入散度的大小限制，单独衡量散度影响
	* grid: "Marker and Cell (MAC) grid", fig 1a
		> 保存、计算 $p,a,v_x,v_y$ 的格点互不重合，求梯度等均为中心差分
		* $\Delta v$ see SI eqn (7)
	* loss eqn (4-7)
		* eqn (8) $+\|\nabla p\|^2$ "pressure regularization" for stability
		* Karman vortex street $+L_\text{frequency}$ eqn (16), from FT of $v_y(t)$ in a box (SI p5/6 sec7, fig 6a), Gassian $\sigma$ for stability
		> 高斯平滑的作用应该和选用 OT Wasserstein distance 的意义类似，避免 0 梯度
		* discretized: eqn (14)，时间差分格式，$v$ 可以用 $(v^t+v^{t+1})/2$ 做估计值，$p$ 用 $p^{t+1}$（？）
		> 相当于希望它对 $v$ 逼近 Crank-Nicolson 时间迭代格式，对 $p$ 仍完全隐式，据此设计 loss，以增强稳定性？
		* 控制优化问题（优化 $v_d$ 选取以达到目的）用隐式格式 $v^{t+1}$ 估计，精度低一些但更稳定
		> 没有对 $\Omega(t)$ 做时间插值
	* NN: $(p,a,\mathbf{1}_\Omega,v_d)^t\mapsto(p,a)^{t+1}$（事实上只算残差）fig 1b
		* U-Net 架构，SI fig 1
		* BC 的实际输入是 $v_d\mathbf{1}_{\partial\Omega(t)}$
		> 知乎：U-Net 架构常用于图像分割（输出保尺寸），原作示意图比较清晰，CNN 多尺度变种  
		> idea：如果改写为无网格的情形可能考虑 GNN？
	* training: unsupervised
		* 边预测边训练：演化一个时间步，计算 loss（预测值不满足方程的程度）BP 更新模型，再演化下一个时间步
		> 开始训练时，错误预测可能导致问题演化到当前时间步的结果与真实不同，但不影响继续训练（直接当成凭空冒出来的一个新问题即可）
		* 事实上（sec 3.6）是 batch 梯度：生成一系列问题 $(\Omega,v_d,a,p)$，每次采样一个 minibatch 演化一步（从而训练多步后每个问题已经演化的步数不同），BP 更新一次
		> 属于 online-learning，数据集（注意无监督不需要标签）动态添加，可采样 minibatch
		* p6/10:0 初始化速度压强均取 0；p6:2 有时把一些问题修改掉，重新选择问题（还是 0 初始化）
	* experiments: (see video) (a) Karman vortex street, $Re$, (b) Magnus effect, (c) 泛化到没见过的障碍物形状，(d) 计算结果与软件包 PhiFlow 比较 (faster)
		> (?) $dt=?$
		* 与软件包比较，table1 没有比较 $L_p$，应该是因为时间步长大导致不好估计时间导数项，loss 不能体现精度；只能比较无散条件，说明在大时间步长下效果比软件包好
	* related work (literature review): 
		* Lagrangian 随粒子运动的坐标系，需要模拟大量粒子，有用到 regression forests, GNN, continuous convolutions 的工作；适合处理液体边界变化的问题
		* Eulerian continuous approach (grid-free) 擅长处理复杂、高维边界；一些工作 domain-specific 无法用于交互问题（如辅助专家设计障碍物形状？）
		* Eulerian grid-based, MAC grid 常用
	> idea: fine-tune NN 预测结果，形成类似 meta 解 PDE NN solution 的框架？  
	> 大时间步精度未必有保证（loss 本身就不准），可能只适合 CG 而不适合模拟；是否可以小时间步训练得到 teacher，再大时间步训练得到 student，从而保证无监督且有精度
	* discussion: 
		* sample 高效？另一种做法是全部重新 sample，$(\Omega,v,a,p)$ 只用一个时间步就丢掉；PDENet 就如此（？）
		> PDE-Net 为有监督训练
		* 稳定性的保证？可能误差会 blow-up，每一个时间步 loss 小未必 $[0,T]$ 误差小，改进精度应该对长时间误差来反传；如经典算法有 $u^{t+1}=u^t+Au^t$, 稳定要求 $\lambda(A)<1$ 从而有指数衰减误差，这个在单时间步是看不出来的
	* 后续有三维版本，以及 `spline-PINN-2109.07143`
* `LED-2006.13431`: #AE, #RNN, #multiscale, #model_reduction, #grid-free_dynamics, #PDE_SDE_etc, 
	* "LEARNING THE EFFECTIVE DYNAMICS OF COMPLEX MULTISCALE SYSTEMS"
		* 发表版本："Multiscale simulations of complex systems by learning their effective dynamics", Nature Machine Intelligence
	* LED: Learning the Effective Dynamics
	* 复杂动力系统计算代价高，本文先 AE 约简到 latent space，在其上用 RNN 表达 non-Markovian 的有记忆动力学
		* latent space 的演化不需要回到原空间
		* perm inv encoder $g(\sum\phi(x_i))$ see fig10
			> 若用 VAE 输出应该是 $\mu,\sigma(x)$
		* 随机模型 AE 用 mixture density decoder (fig11)，loss 用 max likelihood（不是 VAE loss）；确定性模型用确定性输出 decoder 与经典 loss，eg experiment2
		> * 一般 VAE, encoder decoder 都是随机的，这里似乎可以只有一个随机的: fig9 似乎仅 encoder 随机，没有用 mixture density decoder; 实验1用随机 decoder 的单纯 AE，fig10 encoder 确定，用了 MDN decoder
		> * 对第一性原理随机情形，模型随机性体现在 decoder 而不是 latent space RNN! 不知道有什么意义
		> * 宏观与微观动力学用同样时间间隔，感觉不必要
	* 训练：fig1, 似乎是先训练 AE 再 RNN, 
		* eqn(2) VAE loss 似乎只极大似然，不是标准的 VAE loss
		> 感觉可以最后联合训练微调？
	* fig2 为初始化 RNN hidden vector $h$，需要先预热 $T_\text{warm}$，使用第一性原理计算的动力学结果来输入
	* 为了防止误差累积：fig2, latent space 演化（macro dynamics）一段长时间后，回到原空间用第一性原理演化短时间（micro dynamics）
		> 感觉只能去掉原方程演化能磨光的那一部分，仍然有消不掉的累积误差；虽然实验结果 fig5 似乎说明大部分误差还是可以磨光的 artifact
		* conclusion 段：通过调整时间比例可以方便地调整精度、速度的 tradeoff 权重
		* 随时 encode 以保持 RNN hidden state 更新
	* 实验结果 1
		> (?) eqn(6) 后说 eqn(5) 求解用零初始化，而数据集生成用 “randomly selected initial conditions”？什么意思
		* fig3a,b WD M1 含义：每次模拟 $N=1000$ 个粒子计算第一个矩（均值）M1，同一初值的 600 次模拟得到 600 个 M1 值，与 ground-truth 比较计算（600 个离散点的）Wasserstein distance（WD），所得结果再对 12 种不同初值平均
		* fig3h 注意纵坐标是 $\log$
		* $s_t$ 状态包括所有粒子的状态（尽管每个粒子运动独立），
			> 这么做的意义？看 fig4 decode 结果似乎粒子间独立性不强，可能是因为 drift 含时，latent space 大部分体现的是时间变化，确定时间处所有粒子确实有聚集到一起的趋势
		* fig4 在隐空间（而非原空间）谱聚类，用 PCA 画图；选代表点在原空间画 decode 结果
			> [谱聚类-知乎](https://zhuanlan.zhihu.com/p/29849122), [与 $k$-means 比较](https://zhuanlan.zhihu.com/p/97155369)
		> fig4c 预测密度在边界误差大，可能是因为 MD decoder fig11 采用了 sigmoid 输出，不易取到边界值；也许控制有界输出可以用反射/循环边界条件，即无界输出平移到有限区间？
		> * (?) fig4c $x_i$ 指的应该是哪一个坐标轴，也许是一个三维数据点看成三个一维里的数据点？
		* fig5 可以看出，增大 Pe（即减小扩散项，减小磨光力度）后误差增加；（另外此时扩散项模拟需要的时间步变短，micro dynamics 代价变小，隐空间演化的意义变小）
	* 实验结果 3
		* fig8d,e 用 $u_x$-$u_{xx}$ 平面上分布来表示抓住了原动力学的特征（猜测每个点来自 $(x,t)$ 空间上的网格点）；fig8f 似乎就是用这个分布来度量误差（WD, Wasserstein distance）
			> 似乎由于混沌性质，直接用 $L^2$ error 比较得到的（局部特征的）误差总会大，但是这种方法能够比较动力学的整体特征，不关心具体时间空间的情况；原文隐含的类比“天气与气候”
		> 如果方程显式涉及 $x$（项或者非周期边界条件）则应该用 $u_x-u_{xx}-x$
	> 不足：好奇同比例缩短 $T_m,T_\mu$ 演化的结果是否会有不同
	> * 与 `papers/ModelReduction/+ModRedNotes.md` 中 GDyNet 的比较：
	| | LED | GDyNet |
	|:--:|:--:|:--:|
	| encoder | 确定性或 VAE，可以保轮换对称；体现平移旋转不变及粒子种类需要专门改进 | GNN |
	| decoder | 确定性或 MDN 高斯混合概率分布 | 无 |
	| 降维依据 | 数据点 VAE（不含时） | 数据点时间配对 Koopman（含时） |
	| 隐空间演化 | RNN（hidden memory 导致 non-Markovian） | Markovian |
	| 隐空间中解读“暂稳态” | 聚类 | 单纯形 $\Delta^{d-1}\subset[0,1]^d$ 按坐标轴先验划分 $d$ 类（向量解读为分类概率） |
	| 考察对象 | 一般动力系统，eg粒子群体、PDE空间离散 | 单个粒子周围环境 |
	| 结果解读举例 | 隐空间谱聚类识别暂稳态 | state 对应的粒子位置分布、代表性局部构型 |
	| 有效性展示举例 | PDE气候比较 | 自动识别的 state 与科学背景比较；对锂离子导电性贡献；计算弛豫时间eqn(11)说明Markovian为较好近似 |
	* 讨论 2020-09-16
		* PDENet multilayer-training 可以在训练阶段就控制动力学误差，不像这里需要从隐空间回到原空间
		* 一般的 VAE 里 decoder 是确定性的
		* 全用微观动力学都能降低 loss（而不是使 loss 增长慢一点）可能是度量定义的问题；例如 PDENet 如果用 absolute error 一定降低因为有 diffusion，全部收敛到 0 的动力学也是，这时应该用 relative error
		* 下方通用讨论记录里 SyQi 评论实验 1 的相关课题
* `ISMO-2008.05730`: #active_learning, #surrogate, #optimal_control, #PDE, (#open_source)
	* "Iterative Surrogate Model Optimization (ISMO): An active learning algorithm for PDE constrained optimization with deep neural networks"
	* 概要：问题、main idea 见下方；$\mathcal{L}_\theta$ 网络只要求在最优附近逼近，据此选择训练样本 $y$；交替优化 $\mathcal{L}_\theta,y$
		* 要点：使用类似 active-learning 的方式选取 surrogate 的训练样本
	* 问题：eqn(2.1) 给定控制变量 $y$ 得到 PDE 解 $U_y$，进而有 observable $\mathcal{L}(U_y)$（不是 loss），loss $G(\mathcal{L})$
		* $U_y$ 求解数值格式代价高且不可微
		> 似乎没有考虑带随机性的问题；可能就针对机翼等问题；
		> 因此属于传统优化问题，不像 RL 有状态转移、需要随状态演化给出新的策略（与外部随机性或其他主体交互），这里相当于只需要设定最开始的状态，参数空间不像 RL 那么复杂高维
		* 问题形式中 $x\in D(y)$ 定义域可以依赖于参数；实验 3 机翼优化就是这种情形
	* main idea：NN 拟合 $\mathcal{L}:y\mapsto\mathcal{L}$ 为 $\min G$ 提供梯度
		> 训练 $\mathcal{L}_\theta$ 过程只涉及 $\nabla_\theta$，训练完成后的用处是提供 $\nabla_y$；不是直接训练 $G(\mathcal{L})$；  
		> 似乎没有说为什么不是直接训练 $G(\mathcal{L})$；猜测：
		> 1. p2:-2 前序工作（非优化问题）针对拟合 observable 映射，本文保证连续性；
		> 1. 训练好的网络迁移至其他 $G$ 形式（虽然极小值不一样，本方法针对性采样的区域不再重要）；
		> 1. 有显式求导表达式也许直接利用会提高精度；注意梯度为 $G'(\mathcal{L})\nabla\mathcal{L}$，许多情形（例如 $|\mathcal{L}-\bar{\mathcal{L}}|^p$ 情形）保证梯度零点准确只需要 $\mathcal{L}(\bar y)$ 准确，而直接拟合 $\mathcal{G}$ 则需要保证 $\nabla\mathcal{G}(\bar y)$ 准确，但是我们的训练数据只有逐点取值没有梯度，要保证梯度准确不容易
		> 1. 对理论证明应该没有帮助，证明直接假设了 NN 对梯度拟合能力
	* p6 alg3.1: naive 算法 DNNopt，先随机采样几个 $y$ 训练 $\mathcal{L}_\theta$（SGD），然后用拟牛顿法优化 $G$
		* sec2.3.1 选取初始点 $y_i$ 有比随机更好的方法 Sobol
			* sec3.1.1 理论分析中满足条件 H5
			* fig4 右侧使用
			* sec5.2:-2 实验提升有限，不继续采用
		* 最后优化使用多初值，因为作为传统优化问题会受到非凸性影响
			> 算法里初值个数也是 $N$，其实可以随意选
		> recall: NN 优化不用 quasi-Newton，知乎有说法是梯度本身有噪声，把下降方向算更准、做线搜索不如用这点计算资源多迭代几个 batch；未简化的 quasi-Newton 矩阵计算量大（因参数很多，矩阵维数高）
		> 为什么会有名字，看起来并不是引用之前的工作
	* p11 alg4.1 ISMO 算法，“active learning”，$G$ 作为 oracle，$\mathcal{L}_\theta$ 作为 learner，以在 local min 附近更好逼近
		* 不断增大 $\mathcal{L}_\theta$ 训练集，每次优化 $G$ 得到的较优 $y$，用这些样本重新训练 $\mathcal{L}_\theta$ 后再优化 $G$
			> 之前的样本不再重新使用，从 sec4.2 单步复杂度与已经经过的步数无关可以看出；由于是继续训练，算法中仍把得到的网络解读为：用历史样本的并集 训练得到的 NN；
		* > (mine) 感觉应该对最后的较优 $y$ 加上微扰，否则会像 fig2 那样后续训练 $\mathcal{L}_\theta$ 没能发现该处梯度非 0；即：如果 loss 本身不包含梯度，要求 NN 对梯度拟合准确需要邻域采样；
			* 此外，似乎应该引入探索-开采平衡，每一步除了加入上一步极小之外，还随机加入若干个样本；更一般地可以成为 RL 问题，在 meta learning 情境下训练(添加新样本方式)
			* 后来发现 BO（Bayesian optimization）做法属于这种带探索开采平衡的做法，其 surrogate 能体现 UQ
		* 优化 $G$ 时多个随机初始值并行，更容易找到更好的非凸极小；多个初值得到的优化终点 $y$ 都要加入，而不是只加入最好的
		> 因为 $\mathcal{L}_\theta$ 还不准，这些极小中谁重要还无法确定；  
		> 多个初值下都能达到的某个极小 $y$ 会成为重复训练样本：flat min 价值更大，故在附近使用更精确估计？
		* （评）属于 active-learning 这件事可按 ((n1gj5a))的框架理解
	* 方法的理论分析，给出真实极小与 surrogate 极小的距离上界 $|\bar y-\bar y_j^k|$
		* sec3.1 baseline (sec3.1.1 对假设条件的解读，如强凸等）
			> Sobolev space $W^{k,p}(X)$ 见 wiki，范数为 $(f,\dots,f^{(k)}):[k+1]\times X\to\R$ 的 $p$-norm；  
			> (H5) 假设中，如果要随机采样 $(y_i)$，应该假设 $Y$ 体积小于 1 才成立？sec2.1:1 确实有假定 $Y=[0,1]^d$；注意用的是 $L^\infty$-ball；
			* eqn(3.5-7) $\mathcal{E}^*$ 度量 NN 拟合训练集的能力（不需要对整个定义域一致，当然因为之前的几个正则性假设实际上是自然有一致性的）；eqn(3.19) 对其做出假设后 lem3.4 有简化结果
			> 注意 NN 没有维数灾难指的应该是网络规模增长慢，应该不是指减小误差需要的训练集规模增长速度；eqn(3.19) 训练集足够多时，训练集一致拟合能力应该有下界而右侧没有，因此该理论分析不适用太大的 $N$ 的情形；  
			> 此外，训练只有逐点取值，没有梯度（底层 PDE 求解器不能提供），要保证梯度准确有难度
			* lem3.4 证明只是复杂，常规操作
			> sec3.1.1 对局部最优假设 (H6) 放宽，相当于可以用它设置拟牛顿法终止迭代条件
		* ISMO 多了假设 H7，新训练样本的分布; rmk4.4 指极小点的连续性假设（训练单步后局部极小位移小）
		* sec4.1 lem4.3 关于 ISMO 理论分析
			* 条件 eqn(4.7) 最开始的样本点需要足够；实验见 fig3,4，不够时稳定性不如 baseline
			> well-trained 条件 eqn(4.11) 会导致 eqn(4.8) $\sigma_k\to 0$（当然假设 $\Delta N$ 足够大），从而该条件无法对太大的 $k$ 依然成立；因此最大迭代步数 $K$ 不能随意选取（如果需要较大的总样本个数，理论上应该用小一些的 $\Delta N$ 和较大的 $K$；但是这样并不能减小最终误差，eqn(4.12) 的下界似乎仍被拟合能力决定）  
			> 证明里 $T_4$ 的估计似乎有 typo；似乎右式应该保留 $\nabla$；
			> 证明最后一个公式有跳步，被省略步骤见如文字说明
		* sec4.2 比较，文字部分讨论增长阶（关于迭代步数 $K$），唯一全局极小 $\bar y$ 已知的版本与只根据训练结果 $\bar y_i$ 的版本（均精确地求 $G(\mathcal{L})$ 而不是用 NN 近似）；训练代价主要为样本数 $(1+cK)N_0$（调用精确求解器的次数）
		> 感觉应该讨论相同代价下最小可能误差（允许变化 $N_0,K$）；ISMO 在代价预算 $B\mathcal{C}^d\gg 1$ 给定情况下最优 $K=B/e$ ($N_0\approx\mathcal{C}^de/c$)，最终收敛阶 $e^{-K/d}\sigma_0$；基准的与 $K$ 选取无关
	* 实验
		* 画图用到的 eqn(3.16) 是精确的 $G(\mathcal{L})$，而不是 NN 估计的
			* fig3,4,9 等展示 $G(\mathcal{L}(\bar y_k))$ 的均值方差；在机翼任务中均值不会接近 0
		* inverse heat eqn
			* $y$ 为初值（限定傅里叶系数有限，只需要系数 $a_\ell$ eqn(5.5)）+热导率 $q$，$\mathcal{L}$ 为演化后在给定测量点的值（5 个点，分别构造独立的 NN 拟合），$G$ 为 $\mathcal{L}$ 误差
			* fig6 "control points" 正文为 "measurement points", loss 只在这几个点求
			> fig6 应该只展示一组解，但是是效果最好的解还是最接近平均的解，似乎没有提到
		* 机翼形状优化：
			* $y$ 为机翼形状（上、下表面），$\mathcal{L}$ 为升力 $C_L$、阻力 $C_D$，$G$ eqn(5.14) 固定升力下最小化阻力
				* $G$ 形式只要求升力达到标准的 $0.99$，但是 p22/28:2 训练结果升力会稍高于标准
				> 也许是优化时步长不那么小，为保持升力不带来 loss 会与临界点离开一段距离
			* 基底函数 eqn(5.10); p21/28:0 防止上下表面交叉；p21:-1 用软件包精确求解 Euler 方程，机翼形状改变后 mesh 对应形变方式
			* fig9,10 似乎最终均值的提升一般（p22:1 原文说是明显），但是本文提出的方法更稳定（迭代时效果不会波动），收敛快方差小
				> 我觉得应该比较最小值，或者最小几个；比较平均可能意义不大，初值的随机性导致全局最优计算精度效应被掩盖；
			> p22:1 DNNopt 样本数也是 $N_0+kN$，可能是 eqn(4.15) 前的做法，保证二者使用相同数目训练样本，DNNopt 这些样本是相互独立地生成的，为了画 fig3 可能也按类似 ISMO 的流程训练，只是新数据集随机生成而不是用上一步的极小；这样也可以动态调整精度，发现训练结果方差大就加一些样本
			* p24:-1 几乎消除上方激波（> 应该是指高速区后方速度突变）
			* fig11 流场比较（展示马赫数分布，即速率大小）；右边是算法找到的最优；中间是 cost 与平均（对优化初值）cost 最接近的机翼（我认为应该是要表现算法在任意初始化下，效果期望就不错，不一定尝试多个初始化）
			* p23:1 fig20 与更 naive 的方法比较（TNC）
				> 应该也是只需要待优化函数取值的算法，不需要梯度
	> 下方 DeepXDE 也处理参数优化的问题，为 PINN 做法，也有“重要性采样”；那里有二者比较；
	* 讲法设计：
		* 讲 setting 与实验时，列下面的几个对象：eqn, $y,\mathcal{L},G$
		* DNNopt alg 表明主要想法；+评价：主要代价、缺点（从而需要 active learning）
		* notation: $y_j,\tilde y_j,\bar y_j$
	* > date: 2020-11-18 讨论
		* (H3) 凸性可以认为是局部的假设，只要 $G(\mathcal{L})$ 局部极小 isolated 就可以选取局部的 $Y$ 只包含单一极小
		* 我给报告时，证明应该好好准备，我们会关心文章是否回答了 DL 的一些根本性的问题，如 sample, 收敛性等
			* 本文直接回避了这些点，在这方面没有 non-trivial 部分；主要卖点不在这里，在算法
		* 证明部分，功利地讲自己文章证明一些结论可以让 reviewer 少一个批评的点；有的理论性质涉及 DL 的 foundamental problem 很难做，但是有一些简单的部分还是可以做的（否则被质疑能做的也不做），难点只需要 claim 即可
			* 作者知道需要补上对假设条件的说明，属于质量相对高的文章；虽然对 $\mathcal{E}$（经验误差）的根本性的问题没有提到
			> 对自己论文写作有参考价值
		* 没有想清楚 active learning 在证明中是怎么体现（帮助得到更好的误差界）的；
			> my problem! 
		* 训练只用 $\mathcal{L}(y_i)$，但是证明假设里的逼近能力 $\mathcal{E}$ 涉及了 $\nabla\mathcal{L}(y_i)$，并且声称训练找到了其 argmin! 
			> my problem! 
			* 即使是用正则项来隐式限制梯度，对参数 $\theta$ penalty 能对 $\nabla\mathcal{L}(y)$ 起到什么样的限制作用
		* 其他：
			* `2021-12-03`(CSImeet2) 真实机翼设计不只关注升阻比，专业人员还会看压力分布；更多见((n35f0p))
* `BIP-ADNN-1911.08926`: #surrogate, #BIP (#Bayesian_inverse_problem), #active_learning, #MCMC, #elliptic_PDE_inverse_problem (#in_experiment)
	* "An Adaptive Surrogate Modeling Based on Deep Neural Networks for Large-Scale Bayesian Inverse Problems"
	* 概括——问题：Bayesian 反问题，根据观测 $d$（有 noise 分布）推测模型参数 $z$ 分布；方法：正问题 $f(z)$ 复杂，用 NN multi-fidelity 近似，边对 $z$ MCMC 边用 $f$ 修正
	* 问题：采样 $\pi(z\mid d)\propto\mathcal{L}(z\mid d,f)\pi(z)$，$\mathcal{L}(z\mid d,f)=p_\xi(d-f(z))$
	* 方法：surrogate $\tilde f$，multi-fidelity 在于先训练 $\mathcal{NN}^L$，再用 $\mathcal{NN}^H(z,\mathcal{NN}^L(z))$ 提高精度，外层可以使用浅层网络 alg1
		> 为什么不用 $\mathcal{NN}\approx\log f$？虽然 eqn(3.8) 的 relative error 已经处理了相差常系数的问题，但是不使用 log 不能保证输出为正，文中使用的 swich activation 也不保证非负输出
		* 本文训练得到的网络只针对一个给定的 $d$
		> ToDo: p6:-1 ref[24] 查看这样做的理论依据
		* p8:1 训练 $\mathcal{NN}^L$ 使用的是先验选取的 $z_i$（结合 sec4.2.1:1 "prior-based DNN surrogate $\mathcal{NN}^H$"），而训练 $\mathcal{NN}^H$ 使用的是动态生成的样本点，以在关心的高密度区域提高精度，p13:1 在需要更新的区域的周围随机采集修正样本
			> 分开两个网络分别训练的好处也许需要实验比较，而文中没有，只有后一个过拟合的实验
		* p10:1 $\mathcal{NN}^H$ 为浅层网络，且 online training 时只训练这一网络，以避免过拟合
			* 关于过拟合的实验见 sec4.2.3
		> 另外，这样分成两个网络能否缓解 surrogate 在某处取值低于实际导致缺少修正机会的问题？其实 ISMO 也有同样的问题，需要假设先验训练样本点不能太少
		* sec3.2:2 $f^H=f$
		> alg2 似乎多次调用 alg1，从 p8:-2 "to correct the model $\mathcal{NN}^\text{H}$" 可以看出应该是 fine-tune 外层网络而不是加入新的网络
		* alg3：MCMC 运行到某一次待 accept 时，计算精确的 $f$ 与 surrogate 比较，误差大则邻域采样几个 $z_i$ 用于进一步训练 surrogate，使用更新的 surrogate 计算接受概率、加入 MC 采样结果
		> 似乎有笔误，不应该用更新的 surrogate 计算这一步的接受概率，应该像 alg2 一样使用精确 $f$ 的计算结果
		* alg3:7 把 $z_1,\dots,z_m$ 全部作为算法输出的样本（而不是只加入使用精确 $f$ 计算采样概率的 $z_{m}$）
			* sec4.2.2:1 可以扔掉 burn-in samples
		* alg3:4 按照文中写法（> 不知道是否有笔误），在前 $m$ 步 MCMC（第一次判断是否需要邻域采样修正之前） 仍然使用 $\mathcal{NN}^\text{L}$（> 注意此时 $\mathcal{NN}^\text{H}$ 没有经过训练，只有初始化参数，准确度通常还不如 $\mathcal{NN}^\text{L}$），并且判断与真实模型的差距的时候也用它，之后才使用 $\mathcal{NN}^\text{H}$
			> 或许可以在采样前根据先验信息训练的时候就训练 $\mathcal{NN}^\text{H}$，只是使用内外两个 label，以防止使用训练不充分的 $\mathcal{NN}^\text{H}$ 进行 MCMC 采样？也可以训练完 $\mathcal{NN}^\text{L}$ 后再用先验数据训练 $\mathcal{NN}^\text{H}$；不知道这样是否会导致 Adaptive 训练成为 fine-tune，从而模型最终精度不如文中的 train from scratch
		* p8:-1 有点奇怪的最后两步：从 $z^-$ propose $z^+$ 之后，
			* 先用精确模型计算接受概率，在新的点判断是否更新 NN，这样新的点能够接近真实分布的大概率区间
			* 然后用 surrogate 重新计算接受概率，生成 MCMC 的下一步样本点
			> 猜测可能是希望适用定理，所以不使用精确模型接受概率的结果，全部使用 surrogate 生成 MCMC samples? 但其实感觉没必要，假设更新的模型收敛序列为 $\pi_1,\pi_2,\dots\to\pi$, 那同样也有 $\pi_1,\pi,\pi_2,\pi,\dots\to\pi$，即中途插入一步精确接受概率不影响收敛性定理的使用
	* p8:1 主要在动态采样的时候更新 surrogate 的必要性：后验分布通常集中于小的区域，而在预训练阶段无法利用这些信息，采样数目提升对于精度提升贡献太慢
	> 可能的缺点：如果某处学到的 $f^L$ 小于真值，根据它的 MCMC 采样很难到达这里，从而没有足够修正的机会，错误会持续保留；
	* sec1:2 提到了之前工作 surrogate 方法收敛性的理论分析：如果 surrogate 收敛，则生成的后验概率也收敛到真实概率分布；见 ref[34] thm3.1
		> 对 surrogate 的收敛要求似乎允许这里的 Adaptive 训练；
	* 实验：（参考了引文）从观测到的 $u$（给定 grid 上的取值；带噪声）恢复 $\kappa$
		> 比较起来，常见的 EIT 没有要求 (D) BC，而是施加 $u|\partial\Omega$ 观测 $\frac{\partial u}{\partial n}|\partial\Omega$，似乎很多文献没有假设有噪声，并且很多文献假设了 $f=0$；这里则是观测 $u$ 的内部信息；当然这些区别并不是本质的
		* example1 假设了 $\kappa$ 由若干参数 $\kappa_i$ RBF 线性组合给出，只估计这些参数；应该是用本文方法采样 $\kappa_i$ 然后求均值（注意由于 RBF 为线性组合，这等价于对函数 $\kappa$ 求均值）作为最终估计结果
			> (?) 似乎没有说明 RBF 的中心如何选取；猜测是格点，并且应该不需要被推断；fig5.6 的 std 应该是逐点求，而不是先求出各参数的 std；
			> 猜测 $z=\log\kappa$，否则“邻域 $B(z,R)$ 选取 $Q$ 样本更新”不保证有意义
		> (?) polynomial degree? 
		* 生成参数的真实分布与反问题推断使用的先验分布不同
		* sec4:2 迭代次数等参数设定，surrogate 至多只更新 50 次（回忆只在误差大于给定值时才更新）
		> table1 的 high-fidelity model 调用总数可能是实验跑出来的结果，而不是预先设定，使用更多的先验样本（$N=110$）训练模型应该确实可以在 adaptive 时出现更少的误差大于临界值、需要邻域采样训练的情形；
		> (?) p15:1, table1 和纯先验的做法比较，没有使用（大致）相同的训练样本总数？并且，纯先验的做法使用的网络没有 $\mathcal{NN}^\text{H}$ 部分，网络拟合能力本来就有差距？
			> 若是如此，这种比较可能不够公平；table3 关于邻域采样数 $Q$ 的实验同理
		> table1 似乎生成数据（即调用 high-fidelity model 求值）的时间代价小于训练网络；但考虑到全部使用 high-fidelity model 需要的求值次数，surrogate 还是有必要的
		* example3 $\kappa$ 使用高斯过程先验，用 K-L expansion 生成，假设空间高维（$x$ 仍然只有 2 维），实验里截断为 111 维
			* 采样空间为 KL expansion 的系数（不使用 grid）
			* 估计真实 $\kappa$ 有直接取样本平均、对 $\log\kappa$ 取平均的做法
			* fig16 维数更高之后，不经过 adaptive training 的做法变得更差
	> 本文与 ISMO 的比较：
	> * 相同点：使用 adaptive 更新的 NN surrogate，目的是使模型在重点关注的区域提高精度（分别是概率密度大、接近局部最优点的区域）
	> * 不同：
	> 1. 这里先验与 adaptive 部分使用了不同网络（并且被训练参数独立），而不是对先验训练结果模型的加细，目的是为了防止 adaptive 训练阶段的过拟合，而 ISMO 没有类似机制
	> 1. 这里 adaptive 部分的修正只在发现误差较大时（ISMO 对所有的 local min 都用来修正），p9:-1 并且会在该点邻域随机采样多个点作为样本；其实我感觉这里发现误差不大时也可以使用这单个样本训练，如果有了 label 后 BP 消耗不大的话（虽然从实验里看可能未必如此），除非担心训练集样本不平衡问题
	* 2021-01-20 讨论见 AISCmeet
* `Maxwell-MG-FEM`: #Maxwell, #FEM/#Galerkin/#multigrid, #PDE/#hyperbolic|#implicit (#Crank-Nicolson)
	* "MULTIGRID METHOD FOR MAXWELL'S EQUATIONS" (1998)
	* 大意：直接求解电场方程（忽略磁场），隐式格式，单步迭代在 FEM Galerkin 离散下化为求解线性方程组，此时使用多重网格；Helmholtz 分解后发现一类分量收敛慢，但是可以改写为收敛快的形式，故在 smoother 中对其使用特殊处理方式；
	* 本文只考虑向量场 (D) BC（eqn(1.5,6) 之间），这里指边界处沿着法向，记号用下标 0 表示
		* 实验也均为 (D) BC，且没有与真解的误差比较
	* 在引用 [13] 中有说明 隐式格式使用 FEM 能够避免某种数值问题？待确认隐式格式优点（大时间步长？）、为何 FEM 而不是有限差分
		* "edge elements are well suited to avoid the pollution of the numerical solution by so-called spurious modes [13]."
		> 我关于隐式格式的注记，推导来自 1D 有限差分 $u_t=cu_x$：迎风格式仍需要（否则不稳定），仍有数值耗散可能需要加入 $\Delta u$ 项（不过由于隐式格式是在 $t+\Delta t/2$ 列方程，对应时间步长可能需要减半）
	* $H^k=W^{k,2}\in\mathsf{Hilb}$
	* 针对 Maxwell 问题的 Nedelec element
		* p4:2 电场满足切向连续（其他资料表明法向可以不连续），用这种离散化能体现
		> 此外这里的 (D) BC 就对应边界面上的 edge element 取 0
		* p4:3 在规则网格上，使用的 edge element 和 Yee 网格有联系（需要时可以查看其引文）
		* sec2:2 六面体和四面体网格皆可（注意相应有限元基函数为 3 分量的，写为函数空间乘积形式）；（sec2:1 triangulation 可以是六面体）
		* eqn(2.1) 一个 element 内插值结果（使用基函数）由被插函数的“自由度”（由若干线性泛函给出）唯一决定，这里（一阶情形）自由度指被插函数在 6（或 12）个棱边的积分值（即一个 element 内函数有 6（或 12）个自由度），$t$ 应该指该边的方向向量（取定一个方向）
			* p18:-1 标量函数空间 $S(T_l)$ 则将自由度放在顶点
		* lem2.2 插值误差的估计；thm2.3 插值算子与微分算子可交换；eqn(2.2) 这允许使用多项式次数提高的 hierarchical 分解（而不是多重网格那样使用网格加密）
		> thm2.3 中 $\mathcal{D}()$ 应该表示算子的定义域
		* ref[19] 里的 Raviart-Thomas spaces（即 curl 后的空间）$RT_k(T)=P_k(T)^d+P_k(T)^d\odot\pmb{x}$（单纯形 eqn(3.12) p116）$=Q_{k,\dots,k}(T)^d+Q_{k,\dots,k}(T)^d\odot\pmb{x}$（矩形 eqn(3.21) p119）
			* 自由度为 $\{\xi\mapsto\int_f(\xi\cdot\nu)p\,\mathrm{d}S\mid p\in P_k(f), f\text{ face}\}\cup\{\xi\mapsto\int_T\xi\cdot p\,\mathrm{d}V\mid p\in P_{k-1}(T)^d\}$
			> 应该这里定义的次数 $k$ 相当于本文的 $k+1$，从而本文的最低阶情形自由度恰好为 6 个面
		> 似乎无论是四面体还是六面体网格，最低阶基函数都满足 $\operatorname{div}=0$，也即无法表达净电荷！
	* sec4 Helmholtz decomp
		> Wikipedia “Helmholtz decomposition” 有计算方式，用类似 Poisson 积分，或者 Fourier 变换；这种计算复杂度高，显然不适合在求解 PDE 的问题中使用；
		> 事实上 Helmholtz 分解的 grad 分量可以通过求解 Laplace 方程得到，如 $\xi=\operatorname{grad}\phi+\operatorname{curl}A$ 有 $\Delta\phi=\operatorname{div}\xi$，因此有 Poisson 积分表达式
		* thm2.5 在 (D) BC 下，grad 项也使用 (D) BC
		* 使用原因 p4:-2,-1；sec3:2 $\mathcal{N}(\operatorname{curl})$ 上 $A$ 退化为 0 阶算子，迭代无法消除高频误差
		> 我的理解：系数矩阵 $A$（就是下面一行的）在两个空间分别为 $I+\Delta$ 和 $I$，前者不需特殊处理，后者特征值不够大从而收敛慢（尽管 $A$ 的特征值大小和迭代 smoother 的特征值大小不完全等价，需要进一步考察）；
		> FEM 刚度矩阵为 $I$ 时原理上可以 Helmholtz 分解之后，无散项迭代求解而无旋项直接求解（$I^{-1}f$ 很好计算；由于是正交补没有交叉项故分别求解可行），但 Helmholtz 分解计算复杂；此外在这里 edge element 刚度矩阵下，即使分解也不好求解
		> 该无旋部分转化至势能部分成为 $\Delta$（eqn(3.3)），能够提供大特征值；当然也有小的特征值，而这可以在粗网格上加快收敛
	* eqn(3.2) $A=I+\operatorname{curl}\operatorname{curl}$; $\mathcal{N}(\operatorname{curl})$ 应该就是 curl 为 0 的场，在其上与其正交补上使用不同的方式处理 $A$
		> 注意 $\langle f,\nabla\times g\rangle=\langle\nabla\times f,g\rangle$ 没有负号；直观取 $f=g$ 可知负号不成立；证明见下方（mine）部分
		* $a(,)$ 来自 eqn(1.5) 的双线性型
		* $\mathcal{N}(\operatorname{curl})^\perp=\operatorname{Im}(\operatorname{curl})$ p8:-1, 注意 $\nabla\xi\in L^2(\R^3;\R^{3\times 3})$
			> $\operatorname{Im}(curl)$ 上 $A=I+\Delta$ 证明，只需证 $\|\nabla\xi\|^2=\|\nabla\times\xi\|^2$，以 $\xi=\nabla\times[0,0,f]$ 为例，最后约化到 $\int f_{xx}f_{yy}\,\mathrm{d}x\,\mathrm{d}y=\int f_{xy}^2\,\mathrm{d}x\,\mathrm{d}y$ 由分部积分及边界成立；
			> 另外，由 $\nabla\times(\nabla\times\xi)=(I_3\Delta)\xi-\nabla(\nabla\cdot\xi)$ 也可以导出
		* $\mathcal{N}(\operatorname{curl})$ p9:1： 由于 $A$ 后一项在此处为 0，有 eqn(3.3)
		> 注意 eqn(3.2,3) 中使用的 $\Delta=-\partial_{ii}$ 与我们常用的记号反号
		* p18 fig6.2 (alg): smoother 中先统一一步 Gauss-Seidel，再专门针对 $\mathcal{N}(\operatorname{curl})$ 分量进行一次修正（通过使用 $\psi_l$）；$T_l=\operatorname{grad}$
		> 注意记号，$\xi$ 在 eqn(1.5) 表示 test func，在这里则表示待求解的 $E_n$；
		> 如果 $\psi_l$ 为精确求解（而不是这里只迭代一步），则我们得到的解在 $\mathcal{N}(\operatorname{curl})$ 分量已经等于精确解
	* eqn(3.5) idea of MG 
		* V-cycle
	* （mine）代码实现的可能细节：
		> 我已经有实现（FDTD 文件夹 `~/nutstoreFiles/research/Python_codes/FDTD/fem_mg.py`），并且 Meta-MgNet 的记录文件中自己想法章节也有相关记录
		* fig6.2 算法中，电场系数 $\xi$ 在边界的 edge 默认为 0，不需存储（建立数组时）
		* 注意 $\xi$ 为 3-channel 数组（2D 时为 2-channel），smoother、微分算子的离散化也是 multi-channel 卷积
		* 原本 $\nabla\times(\nabla\times E)|\partial\Omega\ne 0$ 可以成立，但是由于 eqn(1.5) 使用的（连续情形）test func 为 (D) 边界，此时应该有物理背景的额外假设——$j|\partial\Omega=0$（否则连续情形弱形式不再等价于原问题）从而 $\sigma$ 也 0 边界，并且 $A\xi$ 也应该使用 0 边界（试函数系数空间的对偶），即仍按照 curl curl 边界为 0 处理；
			> (?) 或者只要求 $j\cdot n=0$? 
			* 回忆标量场的 FEM 处理，(D) BC 的 test func 也使用 (D) BC，(N) BC 对 test func 无限制（此时待求解函数的 (N) BC 自动保证满足，无需像 (D) 那样对解空间进行限制）
		* 标量势 $\rho,\sigma$ 使用 vertex element，边界 0 不存储
		* 预先计算 $A,\Delta$，前者的 curl curl 部分按定义逐个元素推导（实现时为卷积）；$R,P,A_0^{-1}$ 同理，预计算相应的迭代矩阵
			* 如果 $\mu,\epsilon,\sigma$ 系数场不是常数，实现比单纯卷积要复杂，见 Meta-MgNet 代码笔记
			* 注意 FEM 下相邻 edge 并不正交，从而 $\Delta$ 并非 7 点差分格式
			* $\Delta_l$ 的定义依赖于 $T_l$; $\Delta\psi=\rho$ 离散使用的弱形式就是 $\langle\nabla\eta,\nabla\psi\rangle=\langle\nabla\eta,\bm{\rho}\rangle$
		* 代码中 vertex element，edge element 都使用点/边上的场强值，而不是积分值
		* 关于使用（一阶）Mur BC 的版本：离散化为 Robin BC，弱形式待推导（curl 算子的弱形式导出原理还不清楚）；可以问 jhc,xxy
	* （mine）一些理论推导：
		> 相关笔记：`freeNotes.md` FEM 部分
		* $\langle u,\nabla\times v\rangle=\langle\nabla\times u,v\rangle$ 证明，在标量 (D) BC 时 $\begin{bmatrix} v_1&v_2&v_3\\\partial_x&\partial_y&\partial_z\\u_1&u_2&u_3 \end{bmatrix}$ 和对称式的对应项比较（不需要用到行列式交换两行的性质）
		* 一般情形微分形式推导（参考 wiki "hodge star" 词条提供的结论） $\langle\nabla\times u,v\rangle=\int\langle*du,v\rangle_.\omega$（表示逐点内积）$=\int(du)\wedge v$（$\int d(uv)$ 使用 stokes）$=\int u\wedge dv+\int_{\partial\Omega}u\wedge v$
		* $v$ 向量 (D) BC 时用微分形式推导简单一些，此时边界满足 $v|\partial\Omega=i_{\partial\Omega}^*v=0$（按微分形式理解成立，按向量场未必），上式最后一项为 0
		* 边界项显然不只依赖于 $\partial u/\partial n$（取定边界为 $z=0$ 平面，可以构造出在 $\partial u/\partial z=0$ 而边界项不为 0 的例子）；故 Neumann/Robin BC 下的弱形式仍无法消除边界项
		* (N/R) BC 下的弱形式：用 $\nabla\times(\nabla\times-)=\cdots$ 的形式推导，$\langle\nabla\times(\nabla\times u),v\rangle$ 成为两个内部项和两个边界项；替换掉 $\partial u/\partial n$ 项即得弱形式（弱形式可以包含边界项，只要等价问题是 $\langle Lu,v\rangle+\lambda\langle\partial u/\partial n,v\rangle$ 即可分别对应原问题的内部方程和边界两项）
			* 注意最低阶 Nedelec element 没有散度，FEM 离散后弱形式里的散度项直接为 0，从而刚度矩阵的计算得到简化
	* TODO：FEM 而不是有限差分的目的；
		* eqn(3.5) 为何 $\psi_\kappa$ 项只能表达正交补项，感觉应该可以表达所有
		* p11 两种分解的区别（不过似乎只用于理论分析，实际计算时并不会显式计算分解）
		* 改写为 Mur 边界版本？
* `metaPINN-2107.05544`: #meta-learning/#loss, #PINN
	* 学在具体任务上 loss 形式的元学习版本，用于 PINN；针对 PINN 问题给出了理想 loss 条件及推导
		* 元学习方式来源见 `ML^3-1906.05374`(metaL)
	* "Meta-learning PINN loss functions"
	* eqn(14) 采用的 meta-learning 形式（两层极小问题），meta-train $\eta$，meta-test $\theta$
		> meta-learning 形式引用自 `2004.05439`(metaL)
		* 该形式常用解法 3 类，本文属于 gradient-based 做法
		* eqn(17,18) 训练 loss $L_O$ 不是内层推断 loss $L_\tau$（> $L^\lambda$）对任务取期望！前者固定 MSE，后者待学
		* alg1 内层使用 $J$ 步迭代
		> 内层求精确极小的情形可以用 `2104.01677`(metaL) 的技巧
		* > (mine) 外层优化涉及的求导阶数问题（一般讨论见 ((n8jk45))OB-diffOrd）
			* $J>1$ 总涉及高于内层的求导阶数：$\partial_{\theta\theta}\ell(f)$ 项存在
			* $J=1$ 只有 $\partial_{\theta\eta}\ell(f)=\partial_{\eta f}\ell\partial_\theta f$，额外引入的导数二阶，而内层本身至少二阶（$f$ 涉及 $\partial_xu$）
			* 这种降阶出现原因：$\ell(f)$ 中 $\ell$ 只依赖于 $\eta$，$f$ 只依赖于 $\theta$
		* alg1 每步外循环重新采样任务 $\lambda$ 与初始参数 $\theta_\tau^{(0)}$；secC:1 可改为多步后才重采样
		* secC:2 外层停机准则可用元训练、元测试的 error，但由于噪声太大，实验直接取足够大迭代步数
	* 内层 loss $\ell_\eta$ 形式（初始化均接近 L2 loss）
		* sec3.4.1.1 LAL（人工设计的形式），PDE 逐点 error $d$ 进行变换
			> LAL error 关于 $(q,u)$ 有对称性和平移不变性；
			> 2021-11-26 CSI讨论提到：$\alpha$ 取不同值时有不同极限行为，得到统计涉及的多种 loss？
			* 在先前的文献提出，当时是作为 online adaptive loss（OAL），其参数在训练过程中自动调整（根据当前逐点误差在空间中的分布）{_n48j7b}
			* 本文主要用元学习中学出的参数，该参数在训练（元测试）过程中取定
		* sec3.4.1.2 FFN 使用前传网络 $\ell_\eta(,)$
			* figA.1 各种形式从简单到复杂
			> 猜测实际上使用了 $\ell_\eta(q-u)$ 形式保证平移不变性，类似 eqn(A.3)，因为实验图展示学出来的 FFN 形式横轴都是 discrepancy；
		> 初始化接近 L2 的方式没 check 原文是否有，我觉得至少可以 $\ell_\eta(q,u)=(q-u)^2\mathrm{softplus}(F_\eta(q,u))$
	> 记号 $u:\mathcal{X}\to\mathcal{U}\subseteq\R^{D_u}$，$\mathcal{U}$ 不是函数空间！
	* sec3.4.3 对 $\ell_\eta$ 期望性质的理论分析
		* sec3.4.3:2 采用回归问题形式，并认为比 PINN 更一般化
			> PINN 考虑 $\ell(f_\theta,0)$，其中 $f_\theta$ 以网络 $u_\theta$ 为 backbone，则 loss 极小处仍对应解；BC loss $\ell(b_\theta,0)$ 额外加入似乎也没问题
		* thm1 loss（已 MC 离散）梯度 0 的点都全局极小，若 $\ell$ 如此，且满足某种过参数化（参数多于采样点）带来的非退化性质
			* proof 非退化条件下，loss 梯度 0 等价于 $\ell$ 梯度 0
		* thm2 优化算法、loss 性质、学习率衰减（两种）假设下，保证收敛到全局极小
			* 详细假设：优化算法满足假设 1（更新量被梯度控制，与梯度内积不太小）
			* loss 仅在全局极小处梯度 0，且梯度场 Lipschitz
			* 学习率都要求有上界
			* proof，lem1 证明通过考察连线线段，主定理见 PDF 批注
		* 得出 meta-objective 需要加的 penalty 形式 eqn(28)：希望 $\ell_\eta(q,q)$ 与 $q$ 无关，$\nabla_q\ell_\eta(q,u)$ 各处的梯度不要太小（模长 $c$）
		* 有无 penalty 的实验对比 fig12，penalty 提升了对称性
	* 实验
		* 场景：回归问题变频率，输运方程变初值，反应扩散方程变源项，Burgers 变粘度
		* FFN 表达的 loss 比 LAL 复杂，fig4 还可以非对称，fig17a 相同时不是极小点的
		* OoD 测试，fig3 回归问题 LAL 好于 MSE 和 FFN，fig14 反应扩散反过来，fig22 都好于 MSE
		* figD4 增加训练时内层迭代次数，模型表现与稳定性提高
	* 备讲
		* 自己的评论，例如与 AD 比较？学 loss 为何可以提速的理解（例子）？
* moved: `SPNN-2106.13301`(MR)

## Scanned
* `FEM-ML-GoalOriented-2003.04485`: #FEM, #QoI (#quality_of_interest)
	* (not properly scanned) problem eqn (6) ($v$ test func), eqn (8), offline/online procedure
* `2006.09044`: #Schrodinger, #RL
	* title: Quantum Ground States from Reinforcement Learning
	* main point: from path integral, $E_0=\lim_{T\to\infty}\min_v C_T(v)$, $C_T(v)$ def eqn (13), $\mathbb{E}$ over $\mathrm{d}r_t=v(r_t,t)\,\mathrm{d}t+\mathrm{d}B_t$
		* use RL to find $v$
		> not giving $\psi_0$
	> not further check
* `2007.13977`: #theory (#proof), #nonlinear_model_reduction, #fluid (#shock_wave), #DNN_model_compression? 
	* "DEPTH SEPARATION FOR REDUCED DEEP NETWORKS IN NONLINEAR MODEL REDUCTION: DISTILLING SHOCK WAVES IN NONLINEAR HYPERBOLIC PROBLEMS"
	* "Kolmogorov $N$-width"
* `PhyGeoNet-2004.13145`: #PINN, #CNN, #PDE (#Cartesian_grid, #reference_domain), #unsupervised, (#open_source)
	* "PhyGeoNet: Physics-Informed Geometry-Adaptive Convolutional Neural Networks for Solving Parametric PDEs on Irregular Domain"
	* idea: 方程区域 $\Omega$ 边缘与坐标轴不平行，rasterization（栅格化）会出问题（p10，6 个），故找一个 reference domain 作为 grid 定义域，用椭圆映射放回 physical domain 上；{_n7ne61}
		> NN solution 也可以处理这种复杂区域问题；对环形区域还不需要引入额外的循环边界条件
	* 方程形式变换 sec2.2.1-2
	* BC 见 sec2.2.3, padding
	* NN design fig4
	* loss: data-based eqn(5), physics-based eqn(6)
* `2008.10632`: #PDE (#Maxwell_eqn, #grid, #parameter_to_solution), #optics
	* "Deep learning to accelerate Maxwell’s equations for inverse design of dielectric metasurfaces"
	> (?) "bloch BC"? 
	* 电导率分布 $\epsilon(x)$（这里是径向分布，光学元件径向对称）到电场 $\mathcal{E}_x(x)$ 的映射，$\R^9\to\mathbb{C}^{10^2}$
		> $\epsilon(x)$ 似乎是只保存纹路的半径，共 9 个圆形纹路；
		> 方程应该也是频域形式，和下面这篇类似
	* 法 1：SVD，法 2：DNN
		> 其实输出有二维结构更适合用 CNN
* `2008.11520`: #PDE/#CFD/#NS, #classical-method-based, #multigrid
	* （备用）NS 方程 FEM-MG 方法用 NN 加速，包括 MG 提升算子和时间演化算子（RNN,GRU）
		> 和 Meta-MgNet 有相似性！
	* "A neural network multigrid solver for the Navier-Stokes equations"
* `s41598-019-56212-5`: #PDE (#Maxwell_eqn, #Yee_grid), #classical-method-based, #optics
	* 概述：频域稳态 Maxwell 方程加速求解，试图拓展 Krylov 子空间，使用两种方法：PCA（取定 Krylov 子空间）和 CNN 输入算子 $A$ 输出 Krylov 子空间
		* 有些类似 Meta-MgNet，比较在下方
	* "Data-driven acceleration of photonic simulations"
	* 似乎针对光栅（grating splitter）问题
	* eqn(1) Maxwell eqn 对时间求 FT 后，频域方程只涉及 $x$；只关心电场；周期 BC
		> 应该只对线性介质成立；不直接涉及磁场，从而磁单极子不存在之类的需要严格保证成立的方程自动满足；
		> 推导：用到两个关于旋度的方程，不涉及散度方程；需要在 $\mu(x)$ 为常数时成立
		* 离散化为 Yee grid
		> 据说为 Maxwell eqn 离散化的默认网格，每个立方晶胞面心为磁场棱心为电场（反之也等价，只是错开），每个位点只存一个分量；据说 $E,H$ 存储的时间步也错开；类似于流体常用的 MAC grid；
		> 看 fig1 说明里的未知数个数，似乎计算使用的网格仍是二维的，并且作为标量场考虑？由于不了解物理背景决定不深入考虑
	* eqn(2)（基于 GMRES，为经典做法）Krylov 子空间方法求解离散化问题；为了提高精度，Krylov 子空间添加基底 $(v_1,\dots,v_N)$，在近似包含了 $A^{-1}b$ 时效果最好；Krylov 迭代 $i$ 到误差小于预设精度为止
		* GMRES 迭代进行方式见 Supplementary Information
	* 本文给定波长，试图预测出添加的基底；sec-Results:1 训练数据为几个模拟结果
		> 应该是对应几组输入参数 $\epsilon(x),J(x)$ 下的精确解，测试使用未见过的值
	* 法 1，数据集所有结果 PCA（SVD），使用前 $N$ 个主成分作为新增基底
		> 似乎遇到任何新的问题都使用同样的新增基底
	* 法 2，CNN，输入 $\epsilon(x)$ 和“effective index electric field”(>? p7:1 还是复值；周老师也不知道)，输出新增基底
		* 看 CNN 架构，似乎 $V$ 是复空间，CNN 输出实部虚部代替
		> 感觉 CNN 输入应该也包括频率 $\omega$，否则不能体现时间维度；
		> 架构可以考虑 U-Net
		* 两种 loss: projection（有监督）和 residual（无监督），注意 $f^{(k)}$ 指 ground-truth；p5:1 后者最开始训练快（因为比较标准就是 residual）但后面变慢；fig3b（图片误放在 fig2b 位置）表明后者变慢后效果依然好于前者
		> 这里 residual loss 公式放错了，正确版本见 [网页版](https://www.nature.com/articles/s41598-019-56212-5)，用 $\|Af-b\|/\|b\|$
		* 两种 loss 都只考虑 CNN 输出张成的空间 $V$ 而无视（狭义）Krylov 子空间，其中有监督 loss 甚至不涉及 $A,b$
		> 迭代格式的每一步则都涉及 $A,b$，如无监督 loss 相当于第一步（$i=0$）迭代的残差范数，注意这里每一步迭代都是精确 argmin 因此与初值无关；
		> 这可以避免 BP 穿过 Krylov 子空间迭代；$N=1$ 时相当于直接试图训练解算子（差倍数意义下）；
		> 但是用于预测时还是会迭代 $i$ 到误差足够小，因此穿过子空间迭代若干步可能还是有意义的；或许这就是效果不如 PCA 原因
	* (mine，比较) 类似于 Meta-MgNet 用子空间校正给出 $B$ 的版本；
		* 都在均匀 grid 上训练（本文 Yee grid）；
		1. 本文不涉及多重网格，只在原网格迭代
		1. 本文输入为 $\epsilon(x)$ 和另一个 field，相当于 meta-MgNet 的 $A$（即使用 $B(A)$），而 Meta-MgNet 里使用 $B(r,A)$，即子空间还依赖于当前误差 $r=Af-b$（注意 $f=0$ 时 $r=-b$；若有精确的算子 $(A,b)\mapsto f$，则用它生成的一维 $V$ 可以直接终止迭代；$B(r,A)$ 相当于解算子的弱化版本）
		1. 进而，本文的 $V$ 无法随迭代更新（因为不依赖于 $r$），迭代只拓展 Krylov 子空间，类似传统共轭梯度法
		1. 训练 loss，本文不像 Meta-MgNet 一样 BP 穿过多重网格和给定网格内的多次迭代（这里有监督做法与迭代格式无关，无监督做法相当于单网格一次迭代，即取 $i=0$ 的那一次迭代），更小的区别包括：本文有对 $\|b\|$ 归一化，另有有监督 loss
	* 实验
		> 排版有毛病，如 fig1,2,3 图的正确位置要做一个轮换以匹配文字说明，网页版也一样；不是用 LaTeX 编译的，而是 InDesign
		* (?) PCA 表现好于 CNN？还没有解释？文中没有说明 CNN 使用的基底个数
		* CNN 训练就比较慢，p5:3 8 GPU 10 小时有点夸张
			> 但注意它可以无监督，如果加入精确解计算时间则 PCA 训练也不快
		> idea: active learning，只对需要精确解的方程调用精确数值求解器，当然这里的迭代解多迭代几次就可以；未确认文章是否使用先生成 $u,\epsilon$ 再生成 $f=J$ 的方式
	* (mine) 关于文中未考虑，但是摘要中提到的 design 问题，假设是选取 $\epsilon(x)$ 以优化目标 $G(E)$，考虑 BP 优化方法，这里的两种做法都允许 BP（GMRES 应该没问题？）：
		* PCA 做法，Krylov 子空间固定（即 smoother 取定），只在残差 $b-Af$ 计算中涉及对 $\epsilon$ 的梯度
		* CNN 做法，smoother 也依赖于 $\epsilon$，也提供梯度（即优化所用到的梯度从两类运算来）
	* 讨论 date: 2020-12-12
		* 只是提出了一个一般的数值代数算法，应用到了 Maxwell 方程求解上；发在不差的杂志，说明优点可能在实验、数据、应用之类的方面，而不是我们能够关心的算法层面
* `sec3.1-285_1886`: #PDE (#Ritz_grid-free), #multi-scale
	* "A Multi-Scale DNN Algorithm for Nonlinear Elliptic Equations with Multiple Scales"
	> 作者与 F-principle 是一拨
	* 问题：（非线性）椭圆方程 eqn(1.1)，为 eqn(3.1) 能量泛函极小，DNN 表达解；
		* sec3.1 $\kappa(x)$ 具有多尺度结构，用 MscaleDNN 表达解（F-principle 大意：NN 会快速拟合函数低频成分，慢拟合高频成分，有时这是防止过拟合的原因；不像传统数值迭代格式）
		* MscaleDNN 大意：频域分解为多个环状区域（单位分解），从而 $f$ 分解为各种频率成分的和，分别用各自的 NN 表达（需要各自进行适当的 scaling 变为基本类似的频率）；需要专门的激活函数
* `XPINN-285_2002`: #PDE (#grid-free_PINN, #domain_decomposition), (#open_source)
	* "Extended Physics-Informed Neural Networks (XPINNs): A Generalized Space-Time Domain Decomposition Based Deep Learning Framework for Nonlinear Partial Differential Equations"
	* 时空区域分解（不是仅空间），各自训练网络，乘上示性函数求和；
		> 区域边界硬连接在一起了，感觉用光滑单位分解替代示性函数可能好一些，尤其解本身不会有间断的时候？
		* 可以并行；
		* 可以针对各区域函数复杂程度选用不同深度的网络
		> 实验里区域划分似乎是任意的，没有根据方程性态；如果我们将它应用于复杂边界的 Maxwell eqn，可能需要自己设计区域
	* fig1 示意图，loss 来源包括方程、初边值、区域界面，可能有有监督的 data
		* p7:-1 区域界面条件可以包括多种，如连续性、流量连续性；
		* fig2 不连续界面值取均值
	* table1 与 PINN, cPINN 比较
	> PINN 区域分解相关文献汇总放在 `PINN%`“区域分解”
	> idea：区域匹配可以使用类似 PFNN 的思路，无需引入惩罚项
* `TOuNN`: #topology_optimization, #material, #design
	* "TOuNN: Topology Optimization using Neural Networks"
	* 问题描述：eqn(1) 给定材料用量，设计材料形状（给定设计框内）使得应变峰值最小；给定了材料受力与固定情况作为边界条件
		* 配图可以帮助理解 ![fig5](https://media.springernature.com/full/springer-static/image/art%3A10.1007%2Fs00158-020-02748-4/MediaObjects/158_2020_2748_Fig5_HTML.png?as=webp) 
	* 做法：设计框内，材料密度视为坐标函数（0 为镂空，1 为实心；似乎训练收敛后都没有中间值），用 NN 表达它（ReLU 激活 + sigmoid 输出），
		> 还有 BN 层，不太清楚意义在哪
		* 限制条件（材料总质量等）改为惩罚项
		* 算法中应变 $u$ 写为关于密度的可微函数
	* baseline: SIMP
	> 相关工作："Multiscale topology optimization using neural network surrogate models"
* `MIM-2008.01491`: #PINN, #BC
	* "Enforcing exact boundary and initial conditions in the deep mixed residual method"
	* PINN 求解 PDE 的边界条件处理：网络构造直接满足，讨论了 (D,N,R,C) 及混合边界条件，还有初值条件（这个比较显然）
	> 可以利用 length factor（到边界距离，相当于 $\partial\Omega$ 的 SDF 函数）构造 $L(x)$；$-\nabla L(x)$ 可以作为对边界法向 $n(x)$ 的延拓
	* 对波动方程吸收边界 $\dot u+c\partial u/\partial n=0$ 也适用：$u=L(x)F(\dot N,\partial N/\partial n)+N_\theta(x,t)$，容易设计出 $F$
		* 日后补注：这似乎是当时我自己的想法，文章里没看到
			* 一个难点在于将 $\partial_nN$ 平滑延拓到整个定义域内部，用 SDF 不行
	* 原文似乎没证该表示是通用的，即 $\forall u\exists N$；对 (D,C) 边界显然，其他的则不是
		* 我的证明思路：对算子 $D=a\cdot\nabla$，$(I-D)^{-1}=I+D+D^2+\cdots$（无穷求和的定义可能较特殊），用于求解形如 $(I-D)N=u$ 的方程
* `HFM-1808.04327`: #CFD, #PINN, #inverse_problem
	* PINN 解反问题例子：流体给定物理边界，某时刻观测到局部某可观测标量场 $c$，试图恢复流体全域所有物理量
	* "Hidden Fluid Mechanics: A Navier-Stokes Informed Deep Learning Framework for Assimilating Flow"
	* 就是 PINN 反问题思路的一个特殊例子；要反推的不是物理边界形状，未必是流体粘度等，主要是流体不稳定，需要反推的更类似于时间、初值（这些大致能决定此刻的流场）
	> 作者同 PINN；可以作为求解反问题的 baseline
* `2003.12159`: #PINN, #GAN, #UQ, #meta-learning
	* GAN 版 PINN 对初值（> 其他应也可）做元学习的 hypernet 法，用 reconstructor 防退化
	* "Learning To Solve Differential Equations Across Initial Conditions"
	> TODO: check ref (for AISC report; x3)
	* sec1 作为对 `1812.03511`（GAN 版 PINN）的推广
		* 此处 UQ 用于大致描绘解的误差（> 实验似乎初值等没有 noise）
	* sec3:3 生成器 $G_\theta(x,t,i,z)$ 组成：先对初值编码 $v(i)$，随后的网络根据 $(x,t,v)$ 输出函数值
		* 为防止输出退化（无视 $i$），加上一个 reconstructor 及相应 loss，输入若干对 $(x,t)$（给定 $i$）处预测的函数值，试图恢复 $v$；启发部分来自 InfoGAN
		> 但是 eqn(6) reconstructor loss 试图恢复的是 $i$
	> 似乎没说判别器使用的训练数据哪来，不太像在 follow 的文章里用初边值；
	* 实验 Burgers，初值 $i$ 为 512 网格点（IC loss 在 SGD 下每次使用 64 个）
* `1812.03511`: #PINN, #GAN, #UQ
	* GAN 版本的 PINN，训练后得到解的分布，表征带噪声输入/观测下解的不确定程度
	* "Physics-informed deep generative models"
	> TODO: check ref（for AISC report; 不少）
	* 解形式由 GAN 生成器给出 $f_\theta(x,t,z)$，loss 为 PDE loss 和 GAN loss（生成器部分）的组合
		> 理想状态下，训练完成后输出与 $z$ 无关
		* sec3:2 实验中 $z$ 一维
		* PDE loss 包括残差和部分点的 L2 误差，后一部分在实验中为初值边值
		> 原则上后一部分可以有内点观测值，从而可以拿来做反问题
	* 判别器输入 $(x,t,u(x,t))$ 判断它来自真解或者生成器
		* p2:2 判别器用于“匹配观测数据”（> 从而通常只针对初边值）
	* 摘要：生成模型用于表征物理系统的不确定程度，源于输入/观测的噪声随机性
		> 有类似于 UQ 效果；还可以体现 PINN 训练不完全准确
	* fig1 Burgers 实验，输出解分布的逐点均值方差
		* 初值的数据带噪声（> 且不小）
	* citation 包括 `2003.12159` meta-learning 的 hypernet 版本（不同初值）
* `DyAd-2102.10271`: #meta-learning/#hypernet, #PDE/#time-dependent, #dynamical_system, #domain_decomposition, #PAC/#Rademacher
	* 动力学预测问题，先用 hypernet 推断系统参数，再据此做时间推进；理论泛化误差证明
	* "Meta-Learning Dynamics Forecasting Using Task Inference"
	> TODO: summary, comparison tree, link, (broader impact?)
	* 映射形式：$f:(x_{t-l+1},\dots,x_t)\mapsto(x_{t+1},\dots,x_{t+h})$
	* > (mine) 关于这一形式：
		* hypernet 的形式符合框架 `1TaskHypernet:`(metaL)
		* 可解读为含参系统先升维转化为单系统，从而参数预测问题变成守恒量预测问题；单系统时间演化预测任务按守恒量分解为多任务 ((n35e96))paramDynConserv
		* `2021-12-03`(CSImeet2) 讨论了该工作，可能比这里记的详细
	* p3:0 系统参数可包括雷诺数、average vorticity/magnitude 等
	* sec2.4 时间推进部分有 AdaPad 结构，用 hidden feature 补全边界条件，并据其做 padding
	* 理论分析涉及 Rademacher 复杂度
* `invDirechletPINN`: #PINN, #multi-objective, #multiscale
	* PINN 训练多目标优化，使各目标提供的梯度能平衡，防止有任务退化
	* "Inverse Dirichlet Weighting Enables Reliable Training of Physics Informed Neural Networks"
		> created on 2021-12-26
		* [doi](https://iopscience.iop.org/article/10.1088/2632-2153/ac3712)
	> reserved only
	* secIII 多 loss 训练的梯度平衡方式
		* secIII.A weighting based on mean gradient statistics
		* secIII.B inverse Dirichlet weighting
		* secIII.C gradient-based multi-objective optimization
	* 实验包括了多尺度的例子
* `gPINN-2111.02801`: #PINN, #loss
	* PINN 引入额外 loss 使方程两端空间导数也相同，以提高精度；可结合 RAR 网格细化
	* "Gradient-enhanced physics-informed neural networks for forward and inverse PDE problems"
		> created on 2021-12-26
		* 作者为 George
	* 对 $f(x,u,u',u",\dots,)=0$ 形式的 PDE，原版 PINN 只提供 $|f|^2$ loss，本文额外加 $|\nabla f|^2$ loss
		* eg. $\Delta u=f$ 引入的额外 loss 为 $|\partial_x(\Delta u-f)|^2+|\partial_y(\Delta u-f)|^2$
	* 可用于反问题，并结合 `XPINN-285_2002` 里的 RAR 网格自适应加密技巧
		* fig10 实验，相同采样点数下 PINN+RAR 好于 gPINN；最好当然是 gPINN+RAR
		> 依据的是相同采样点数下的误差大小？我觉得比较相同计算量更合适，毕竟额外 loss 引入更多计算
	> 看起来额外的 loss 起到正则化作用；类似 DeepPot 要求空间梯度拟合之后精度提高；PINN 表现好于 DRM 同理

## Recommended
* `SimNet-2012.07938`: #PDE (#PINN), (#open_source)
	* "NVIDIAS IM N ET TM: AN AI- ACCELERATED MULTI - PHYSICS SIMULATION FRAMEWORK"
	* sec4.3 网络架构需要克服 F-principle，"spectral bias"
		* Fourier feature networks，第一层先提取数据高频特征再输入后续层，frequency matrix 可训练；modified 版本再加一层，使用凸组合
		* SiReNs 前序工作使用 sin 激活函数，直接表达高频信息
* `DeepXDE-1907.04502`: #PINN (#PDE_NN_solution, #or_other_DE, #grid-free), #software (#open_source)
	* "DEEPXDE: A DEEP LEARNING LIBRARY FOR SOLVING DIFFERENTIAL EQUATIONS"
	* 就是一个解 DE 软件包的说明书；包括积分方程，反问题（恢复参数）
		> 不仅是恢复未知参数，找最优控制也可以，只是新的 loss term 不是 $L^2$ 距离形式；
	* sec2.5 列表比较 PINN 和 FEM（> 相对显然）
	* sec2.8 提出 RAR 采样，在方程不满足程度（loss）大的地方多采样
	* > (mine) PINN 解 PDE 最优参数问题，比较上方 ISMO：
		1. 这里解用 NN 表达且待训练，不是不可导、涉及 grid 的数值求解器；
			* 若待恢复参数是区域形状（如机翼设计问题，方程的 loss 计算区域即 MC 采样区域与参数有关），也许这里的做法不像 ISMO 那么适用？
		1. 待优化变量除了参数 $y$（这里记号 $\lambda$），额外的参数 $\theta$ 参数化 $U_\theta(x)$ 而不是 ISMO $\mathcal{L}_\theta(y)$，对应的 loss 为方程满足程度 $\|f(U_\theta;y)\|$ 而不是 ISMO 的 observable 预测精度 $\|\mathcal{L}_\theta-L(U(y))\|$；（$y$-loss $G(L(U_\theta(y)))$ 和 $G(\mathcal{L}_\theta(y))$ 同理）；
			* 如果 ISMO NN 直接预测 $U_\theta(y)$，则对应 $\theta$-loss 为与真解的距离，和这里方程满足程度仍有一点区别（与 Ritz 变分 loss 都有区别）；
			* 如果这里 PINN loss penalty 足够大，解可以视为满足 $\nabla_{(y,\theta)}\text{PINN-loss}(y,\theta)=0$, 隐函数给出 $\theta(y)$ 即 $y\mapsto U$，某种意义上是隐式 BP 将 $\nabla_UG$ 传递到 $y$ 上；ISMO 中底层求解器换为 PINN 就相当于这种情况
		1. 不涉及 $\partial U/\partial y$，优化 $y$ 的方式是用方程满足程度（相当于让 $y,U$ 相互拟合对方，而不是通过求解器让 $U$ 根据 $y$ 得到）
		1. 采样在 DE 定义域进行，不像 ISMO 是参数空间（因为不需要 Surrogate model）
			* 进而“重要性采样”针对误差大的空间点，而不是 ISMO 针对最优附近的参数
			* 不过如果在参数空间也选取多个随机初值分别训练，则和 ISMO 更加接近
		1. 看起来都适用于高维？
* `MeshingNet-2004.07016`: #PDE (#FEM_mesh), #mesh_generation
	* "MeshingNet: A New Mesh Generation Method based on Deep Learning"
	* NN 生成 mesh 用于求解 PDE；生成方式为预测局部需要的网格面积
	* p5:1 训练数据：（对给定的一组 PDE、多边形区域、BC）生成均匀粗网格，解上采样（线性插值），与均匀细网格的解比较后，误差 $E$（大的地方认为此处粗网格需要加密），局部最大剖分面积（一个粗网格内）的 ground-truth 设置为 $A(x_i)\coloneqq K/E(x_i)$
		* 粗网格的一个 element 对应多个细网格 element 进而有多个 $E$ 值，p5:1 "selected norm" 将这些结合来给出粗网格的一个整体的 $E$，sec2.1:-1 文中 L1 norm，sec2:-1 讨论，eqn(3) 对比的（弹性力学专有） energy norm（两个量二次缩并）
		* 用 NN 预测 $A(x)$，其后用软件包据此生成 mesh（p5:0 不完全是加细，顶点增加而原来的边可能取消；p6:1 可能保持总 element 个数不变）
			* sec2.1:2end 基于粗网格（$A(x)$ 只在粗网格中心点计算）可以加细或者生成全新的网格
		* p5:-1 NN 输入：多边形区域（PDE 定义域）顶点坐标，（这些顶点之下）当前点重心坐标，PDE 关键参数（即不是靠 PINN 那样先找粗略解再得出局部不满足程度，而是相当于直接预测不满足程度，不找粗网格解）
		> 注意预测 $A$ 时还没有 mesh；这个方法导致只能处理多边形区域，且顶点个数固定；顶点数大于 3 时，当前点重心坐标取值不唯一，NN 设计中没有保证这种对称性的机制
		* p6:1 预测对象：（生成粗网格后）粗网格每个 element 中心处 $A(x)$ 的值
		> 感觉不够 Adaptive, 局部相同误差未必表示需要相同程度的加细，可能 p4:1 里的 $\alpha$ 与位置也是有关的；还不如 RL 预测网格；并且一个粗网格 element 里使用相同的加细程度，即局部均匀网格，粗网格太粗时不见得好；
		> 训练数据针对一种 PDE？泛化到其他种类 PDE 需要 meta learning？
		> (idea) 用 GNN 可以同时生成所有粗网格 element 中心的 $A(x)$ 取值，且可以根据需要动态添加粗网格顶点（future work 也提到 GNN）
	* fig4 问题 1 的效果，与均匀网格误差对比；
		> 注意所有元的误差求和即总误差；一个元的 L1 误差本身与其面积相关，图中大面积网格的误差似乎也并不很大；没有说明网格的最优性；
		* fig6 问题 2 与均匀网格、ZZ 网格对比
		> 感觉效果提升没有预想的好，不过可能是问题形式使得均匀网格本来就不太差；
		> (?) fig3,4,7 没有说明用什么 NN 架构，仅 fig6 说用 FCN
	* sec4:2 无法完成后验误差估计
* `GenModSDE-2011.13456`: #generative_model/#explicit?/#SDE/#reverse-time_SDE, #BIP, 
	* "Score-Based Generative Modeling through Stochastic Differential Equations"
		> 2021-01-20 讨论（我讲）时被推荐；更多记录见 `2021-06-02`(dbGrpMeet)
	* > (mine) 相关材料（本文更多记录见 `2021-06-02`(dbGrpMeet)）
		* [Diffusion models=AE](https://benanne.github.io/2022/01/31/diffusion.html)
			* [知乎版介绍](https://zhuanlan.zhihu.com/p/466572823)
		* neural SDE 可参考 `[NeuralDE综述-2202.02435]`，包括 BP 方式
			* ((n35f03))invCtrlRL 我的不完善的框架
	* 数据有原始分布和加入噪声以后的分布，加噪声是一个正向 diffusion 过程，用 SDE 刻画，而反向去噪使用其反向的 SDE（取消随机项的 ODE 亦可）
	* 传统方法：
		* SMLD (DENOISING SCORE MATCHING WITH LANGEVIN DYNAMICS): BIP, generative model/explicit?/MCMC/Langevin|simulated annealing
			* 正问题噪声 $p_\sigma(\tilde x\mid x)$, $\sigma$ 表示添加噪音的大小（很大时 $p_\sigma(\tilde x)$ 近似正态）；eqn(1) 拟合梯度 $s_\theta(\tilde x,\sigma)\approx\nabla\log p_\sigma(\tilde x)$ ("score")，使用类似模拟退火算法的方式逐步降低 $\sigma$（同时降低 Langevin MCMC 步长）以得到 $p(x)$ 的采样样本
			> i.e. 正态到 $p(x)$ 的生成模型；
			> eqn(2) 给出的 Langevin 动力学模型，drift 向着增大 $p_\sigma(\tilde x\mid x)$ 的方向
		* DDPM (DENOISING DIFFUSION PROBABILISTIC MODELS): generative model/explicit?/MCMC/reverse Markov chain|ancestral sampling
			> 形式上似乎只是比上一个方法加了一个指向原点的 drift，类似 regularizaiton
* [机器学习与流体动力学：谷歌AI利用「ML+TPU」实现流体模拟数量级加速](https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2650808533&idx=1&sn=5fc69889f64a2dcb7b6d5656ae29ea21) `CFD-2102.01010`: fluid, physics embedded
	* 物理模块保证了局部动量守恒、不可压缩；
	* 两个版本：learned interpolation 版本先 CNN 再物理模块，learned correction 先物理模块再 CNN
	* 需要额外高精度求解器提供 label；
	> 应该不是完全基于经典数值算法；在学过 CFD 课程之后再回来确认
* `PFNN-2004.06490`: #PINN/#penalty-free, #complex_boundary, #experiments/#baseline/#PDE
	* "PFNN: A Penalty-Free Neural Network Method for Solving a Class of Second-Order Boundary-Value Problems on Complex Geometries"
	* 要点：给出复杂分段边界、非齐次边界条件下的 PINN 版本，网络设计自动满足 (D) 边界不需惩罚项
	* PINN Ritz 形式，方程为比较一般的 $\nabla\cdot(\rho(|\nabla u|)\nabla u)+h(u)=0$（(N) BC 也相应涉及 $\rho$），能量泛函 $I[w]$ 涉及内部与 (N) 边界
	* 网络表达为 $w_\theta(x)=g_\theta(x)+\ell(x)f_\theta(x)$，length factor $\ell$ 在 (D) 边界为 0 在内部 $>0$，用于近似体现到边界的距离
		* 先训练前者以拟合（非齐次、无法直接用解析式延拓到内部的）(D) 边界条件，再训练后者以极小化 $I[w]$
		* $\ell(x)$ 构造：边界划分为 segments，对 (D) 边界 $k$ 构造 $\ell_k(x)$，按 eqn(10) 方式组合
		> 按照下方构造，这些边界似乎并不需要是直线，也许不太长就行
		* $\ell_k(x)$ 要求：当前边界 $k$ 上为 0，取定的一条（不相邻）边界上为 1，其余位置 0、1 之间
		> 不相邻边界可以为 (N) 边界；猜测加入对另一边界的额外要求是防止退化，$\ell(x)$ 在内部不会太小
		* $\ell_k(x)$ 构造（针对没有解析版本情形）：使用 RBF eqn(11)，插值点从涉及的两条边界上面采样，系数通过求解线性方程组得出
			* RBF 中心即插值点，固定而不动态调整
			* （评）这样所给出的线性方程未知量、等式个数刚好一致
		> 从表达式看，这些插值点应该与训练 $g_\theta(x)$ 用到的采样点不同；注意训练 $g_\theta$ 与构造 $\ell$ 可以独立进行；
		> 边界复杂不规则时这里给出的构造似乎带来的计算开销大，尤其是 $\ell$ 需要 BP（或者可以某种方式预先存储 BP 结果？）
			* （后来补充）其实本文未要求各 segment 是线段（当时似乎有这个误解），完全可以是复杂折线、曲线等，因此构造不见得复杂
		> idea：对于复杂边界（如手机电磁仿真，假设还用 (D)），难度化归到构造 $\ell(x)$ 即 level-set 函数，没必要使用这里的分片构造，可以参考传统图像处理的做法构造 level-set，不过需要保证可以 BP
	* 理论分析 thm1：如果 $f_\theta,g_\theta$ 均使用单隐层网络，存在参数能够逼近真解（不考虑找到这个参数的优化问题）
		> 证明细节未看；似乎没有考虑 $\ell(x)$ 构造的误差
		* p8:-1 实验中假设并不全部满足，但效果仍可以
	* 与其他方法比较：相较 PINN 不涉及高阶导数；相较 DeepRitz 和 DeepNische（即 Lagrange 乘子版本）不需要惩罚因子
		* 一些工作使用解析表达或者 spline 表达 $g_\theta(x)$ 项，$\ell(x)$ 需要将区域映射到（超）球，这只适合低维简单几何；
		> (?) 这里分段构造似乎也不适合不规则复杂边界/高维很多段边界情形？
		* 实验还比较了线性基函数 FEM p11:-1（猜测是 Ritz）
	* 实验：ResNet，sinusoid（即 $\sin$）
		> 使用的是不简单的问题，以后自己写相关文章可以用作 baseline
		* 10 次测试，error 绘图使用几个分位数（> 10 次测试对于 1/4 分位数似乎有点少）
		* 先取定真解再据此给出测试样例的 (D,N) 边界条件
		* anisotropic diffusion，即二阶算子 $A$ 依赖于位置；左侧边界为 (D)；
		* Koch snowflake 上极小曲面问题，截断分形阶数 $L=5,6,7$，左半部分边界 (D)；FEM 网格划分已经困难
			> $\ell_k(x)$ 这里应该是显式构造的线性函数，且几段边界可以共用；
			> 由于边界有规律，我发现也可以构造为 $\sum_l\ell_l(x)$（因为三角形边界的构造容易），每一级的 support 要延伸进入上一级内部
		* twisted torus 上 $p$-Liouville-Bratu 方程，(D) BC，$\rho=|\nabla u|^{p-2}$, $h=c\exp(u)$
		* high-dim（100 维）$p$-Helmholtz，$\rho$ 同上，(D,R) BC；error curve 发现收敛快得多
	* （在我细读之前的 2020-10-21 有讨论，见下方）
	* 2021-02-26 与CSI讨论：SimNet 使用了 SDF（signed distance function），可能与这里的 $\ell(x)$ 有联系
* `PFNN2-2205.00593` NN ansatz 含时抛物方程，弱形式取定一组测试函数给出 loss，空间有重叠区域分解，迭代时每区域内 网络构造自动满足 BC
	* "PFNN-2: A Domain Decomposed Penalty-Free Neural Network Method for Solving Partial Differential Equations"
		> created on 2023-01-08
	* 考虑抛物方程（可非线性），写出弱形式（引入测试函数、时空积分，保留 $u_t$）
		* 方程 $u_t-\nabla\cdot(A\nabla u-B)+C$，$A(u,x,t)$ 为矩阵，$B,C$ 同理
			* 注：“抛物”是我加的，原文没这个词
		* 弱形式，约束有 IC, (D) BC（(N) BC 弱形式自动满足）
	* 回忆 `PFNN-2004.06490` 自动保证 BC 成立的 ansatz $u()=g_\theta()+l()f_\theta()$
	* loss：取定一组测试函数，要求方程弱形式在其上成立
		* eqn(2.7) 测试函数用紧支的，而非多项式，以能适应复杂几何区域、降低 loss 计算代价
		* eqn(2.10,11) loss 为弱形式积分方程的 MSE，对测试函数角标 $s$ 求和
	* （空间）区域分解，无 overlap 的 $\tilde\Omega_i$、延拓得有 overlap 的 $\Omega_i$，用后者计算
		* 记号：$\partial\Omega_i=\Gamma_i\cup\Gamma_{i,D}\cup\Gamma_{i,N}$ 分解为内边界、大区域 (D,N) 边界
		* 迭代格式，为 PDE 传统有重叠区域分解算法：每区域计算新解，其 (D) BC 来自上一步其他区域解的内部值（根据非重叠的 $\tilde\Omega_i$）
			* （评）所有时间等价处理，未考虑时间推进等
		* 每区域网络构造自动满足该 (D) BC；用到的 $l_i()$ 一次构造即可，$g_i^k$ 需根据上一步的结果增量训练 eqn(3.4)
		* 获得 $g_i^k$ 后，训 $f_i^k$，loss eqn(3.5) 来自弱形式方程，用每区域的一组测试函数 $v_{i,s}$（支集在该区域内）
		* 最后所得整体解，使用无重叠区域方式，各区域解限制在 $\tilde\Omega_i$ 上，未引入连续过渡
		* （评）有重叠区域分解仅用于构造迭代格式，而构造整体 ansatz 只用无重叠区域分解；有重叠区域分解迭代时 单区域 ansatz 保证满足 BC，而最后用的整体 ansatz 未直接保证满足连续性
	* alg1 区域分解后，多处理器（数目同区域数）并行计算，包括通信顺序（通信为下一步计算提供 BC）
		* 步骤：通信获得 BC，各区域训 $g_i^k$、再训 $f_i^k$
		* 注：文中将有通信的叫 online、无通信的叫 offline
	* 相关工作，sec4.2 区域分解提到 DeepDDM、D3M 为重叠方法，cPINN、XPINN 为非重叠方法
		* 按下面给出的表达式，D3M 为 DeepDDM 基础上对方程降阶，通过引入额外变量（升维）
		* （评）看原文，DeepDDM-2004.04884 用 PINN loss，D3M-1909.12236 用 Ritz loss；二者均将区域分解用于 PDE 迭代格式，而非仅作为 ansatz
		* cPINN 在区域交界要求 $u,\partial_nu$ 一致，XPINN 则要求 $u,\Delta u$ 一致；{n18h4h}
	* 实验：L 形区域各向异性对流-扩散方程；周期区域 Allen-Cahn；南极洲形状区域 非线性 各向异性 对流扩散方程；3D cube 粘性 Burgers
* `o-2102.11830`: #traditional_method, #TT (#tensor_train), #BSDE, #parabolic_PDE/#high-dim 
	* "Solving high-dimensional parabolic PDEs using the tensor train format"
	* 抛物型 PDE $(\partial_t+L)V+h=0$ 的终值问题，无界区域
	* ansatz：每个维度有基函数 $\phi_{i_d}(x_d)$（$d\le D$，与原文记号有区别），用多项式或者 FEM 基底构造；系数 $c[i_1,\dots,i_D]$ 为避免维数灾难使用 TT (tensor train) 分解，由 $u_d\in\R^{r_d\times I\times r_{d+1}}$ 缩并得到
		> 似乎维度之间排序变得重要？本来不一定能说哪两个维度关系更加密切，但是 TT 分解导致相邻的两个维度之间的关系似乎更加紧密了
	* 高维 loss 使用 BSDE 给出，$\mathrm{d}V(X_s,s)$ 过程满足的 SDE 给出了 loss 表达式
	* 方程求解：alg2 时间推进逐步求解，每步 MC 得到 loss 后求极小
		* 求极小方式 alg1，每次迭代中对逐个维度的 $u_d$ 求解最小二乘问题（有显式解），迭代到收敛为止
	* 实验，相较 PINN 更快，精度更高
	* (mine) 和 PINN 其他方面优势比较：复杂区域这里需要考虑停时，涉及时间步长（局部）加密；对双曲方程等适用性存疑；

