> 2022-07-03 从 `AD.md` 独立出来
* 相关话题
	* `2022-08-26`(CSImeet2) 在数据压缩的框架下提到了 n-widths，图像、场景等 INR 表征可压缩程度如何，或许可考虑图像在图像空间分布的 width；暂未考虑 JPEG 等不定长编码
	* `~/nutstoreFiles/research/reserved/PDECO.md` 中有一些未迁移过来的内容可参考
	* `DL-ROM-2103.06183` 维数的定义中要求 AE loss 降到 0；对该维数有理论估计
* 变区域PDE；{n6tg3i}
	* 维度 1：考察极限情形 $\Omega\to\Omega_0$，考察 $\{\Omega\}$ 整体性质（如 width）
		* 极限情形，区域收敛性的多种定义：{n1sb7w}
			* 性质很好的连续变化，如((n1sb7o))空间区域随流场形变
			* `Daners08DomainPL` sec5.2 Moscow 意义下的区域收敛，较弱
			* 考虑拓扑变化，洞收缩至单点而消失，如((n1sm29))（相关性主要在((n1sm6z))解摄动 ansatz）
		* 极限情形，可考虑解的相应极限行为：连续性，可微性，泰勒展开
			* 收敛性：((n1sf1s))为证性质较差区域 PDE 有解，通过性质良好区域解（子列）收敛得到
			* 连续性：((n1sb6d))在区域奇异摄动时可考虑，包括解是在什么意义下收敛（解收敛性定义）
			* （基于可微性）导数计算：((n1sb6c))形状优化中的敏度分析涉及这些
			* 高阶可微时可泰勒：((n1sg8e))域被小扰动后给出近似解
				* 2211.13105 摘要信息：嵌套的大小区域，考察 Laplace eqn 非线性、非自治传输问题解存在性、对域扰动解析依赖性
		* 另有非极限情形，只比较 $\Omega_1,\Omega_2$ 解差异的 `Savare02DomainPE`，`arXiv1205.2027`
	* 维度 2，不同区域解如何比较：变换至 reference domain，靠限制，靠延拓；{n7n92v}
		* 限制、延拓 均在公共区域 $\Omega_0$ 比较，前者 $\Omega_0\subset\Omega$，后者 $\Omega\subset\Omega_0$
		* 若维度 1 下为考察 $\Omega\to\Omega_0$ 情形，这里靠限制到子区域定义解收敛性，可能性较多样；{n1sb85}
			* 若 $\Omega\supset\Omega_0$ 总成立，则只需考察 $u_\Omega|\Omega_0\to u_0$ 是否成立
			* 若 $\Omega\subset\Omega_0$，可考虑“内闭收敛”，即 $\forall K\Subset\Omega_0$，极限充分接近时 $K\subset\Omega$ 且 $u_\Omega|K\to u_0|K$；{n1sf1m}
				* 不要求 $u_\Omega$ 可直接延拓至整个 $\Omega_0$，例如可在边界有奇点、发散等
				* 例如((n1sf1d))
			* 另有 $\Omega\subset\Omega_0$ 但不直接讨论解收敛性，而仅构造解摄动 ansatz((n1sm6z))
		* 有时可零延拓，如 `Savare02DomainPE`，`arXiv1205.2027`
		* 我的 decoder width 定义涉及延拓，理论估计中用延拓后的 PDE 定义延拓部分函数值
		* 延拓相关：((n7n96e))传统谱方法的 Fourier continuation 技巧
		* 相关：NO-复杂拓扑处理 也涉及((n7ne5l))参考域，((n7n92y))延拓
	* 形状优化可涉及 解对区域变化的敏度分析；{n1sb6c}
		* 维度 1 考察极限 $\Omega_t\to\Omega_0$，通过区域变换产生 $\Omega_t=T_t(\Omega_0)$，该区域变换常通过速度场 这一简单方式 给出 $T_t(x)=x+tV(x)$；{n1sb7o}
		* 维度 2 中用 $\Omega_0$ 作为 reference domain，因其区域变换已显式给出
		* 考察 $u_t$（变换到参考域后）关于 $t$ 的导数
		* 推导过程中可涉及 PDE 弱形式中各项的导数，包括内部积分（涉及 Jacobian 变换）、边界积分（包括直接积分、带 $\partial_nu$ 的积分等）
		* 稍具体的内容记录于 `Haug1986DSASSbook`
		* 我的 decoder width 理论文章还引了其他文献，包括 `Sokolowski92ISObook`，`Bochniak03LinearEB`
	* 区域摄动（尤其奇异摄动）下解收敛性，或主要是纯数学在关心；{n1sb6d}
		* 维度 1 下考察极限 $\Omega_n\to\Omega$，所考虑的收敛性可较弱，汇总于((n1sb7w))
		* 维度 2 下常用限制到子区域方式比较不同定义域的解，见((n1sb85))，解收敛性也在该意义下讨论
		* 我的 decoder width 理论文章引了一些相关文献
	* 作为理论工具，已证明良好性质区域解具某结论，通过区域逼近推广到性质较差的区域；{n1sf1s}
		* 例如 22spring 椭圆方程课程 ch2-thm7.2，要证解存在性，对 $C^\infty$ 区域已知成立，靠区域逼近推广，最终只要求区域有“外球性质”
			* 为构造内闭一致收敛子列以得解 $u\in C^{2,\alpha}(\Omega)$，对 $\Omega_n$ 上解 $u_n$ 使用 Ascoli 引理、用对角线法使对 $\forall K\Subset\Omega$ 成立；{n1sf1d}
				* 一般框架：((n1sf1m))按内闭一致收敛 定义变区域函数的极限
			* 为证明解在边界连续，使用了闸函数技巧
	* 数值算法，已知标准域的解，域摄动后靠渐近展开得近似解；{n1sg8e}
		* 维度 1 介于 极限、整体性质 之间（考察 $\Omega_0$ 邻域性质）
		* 维度 2 主要靠参考域（若不改变拓扑，区域小变化所用的变换接近恒同映射，不难找出）
		* 或许类似 `Guillaume99DomainPM`（不过其区域形状待求解，而非给定）
	* 相关：有些问题中区域形状为待求解对象（之一），如 `Guillaume99DomainPM` 流体中运动气泡形状求解
	* 相关：一些工作考察 $\Omega\to\Omega_0$ 极限情形，但并不直接关注其上的 PDE 解
		* `Novotny20AITDMbook` 关注标量（而非作为 PDE 解的场）的收敛，并求该标量（关于区域变化）的导数
			* 该标量可能是 关于某 PDE 解的泛函，不过讨论收敛性仍只讨论该泛函，而非解本身
			* 不过讨论奇异摄动（拓扑变化）时包括了解摄动的 ansatz eqn(2.21,45,100)；另有正则摄动（变系数场）的 eqn(3.54)；{n1sm6z}
			* ch2 关注拓扑变化，洞收缩至点而消失；可认为是 $\Omega_{0+}=\Omega_0\setminus p$；{n1sm29}
		* 关注 $\Delta$ 算子（(D/N/R) BC）的谱
			* 2203.01971 摘要提到 (D) 谱对域扰动稳定，而 (N/R) 下可突变；本文试图添加 resonator 式域扰动
			* 对任意 Lipschitz 域，构造任意小局部扰动，使 (D/N/R) 谱分解为简单特征值；二法，切洞、扰动边界，或域边界变形
				* "A localized domain perturbation which splits the spectrum of the Laplacian" by Alexander Dabrowski, 2020
	* 相关：((n6tg6l))一般 PDE
* 变区域椭圆方程Kol衰减
	* 主要用 `1911.06598` 的结论：若 $\eta\mapsto a_\eta$ 为 $\mathbb{C}^N\to L^\infty(D)$ 全纯映射（或许限制在子区域即可），限制在 $[-1,1]^N$ 上 UAE，则 Taylor 展开给出 $d_n$ 次指数衰减
		* （评）可能是当时笔误，应为 `1508.01821`
	* 以下主要讨论二维区域椭圆方程，维数不是本质的
	* 考察按 $A_\eta=A_{\eta^A}|D_{\eta^D}$ 形式给出的问题，$\nabla\cdot(A_\eta\nabla u)=f_\eta$，在 $D_\eta$ 的边界上为 0
		* 系数场为大范围定义的系数场在特定区域上的限制，参数 $\eta$ 的两部分分别控制大系数场和区域形状
		* 映到标准域后 $\bar A_\eta=J_\eta^\mathrm{T}(A_\eta\circ b_\eta)J_\eta/\det J_\eta$（只需对 $x\in\bar D$ a.e. 有定义），只需验证这个 $\bar D$ 上的方程满足已有定理的条件
	* 假设 1（关于大系数场）：采用 KL 展开 $A_\eta=(A_0+\sum_i\eta_i^A\Psi_i)|D_\eta$
		* 1+: 对所有 $\eta\in[-1,1]^N$，$x\in\bar D$（只考虑实参数的那些 $D_\eta$ 覆盖的区域，复参数 $D_\eta$ 不用管），UAE 成立
	* 假设 2（关于区域形变）：$\forall\eta\in[-1,1]^N,x\in\bar D$，有 $J_\eta:=\nabla_xb_\eta$ UAE 成立（从而联合 1+ 能保证 $\bar A_\eta$ UAE 成立）
	* 最简单情况，考虑三角形旋转：
		* MAD 论文里的例子是变形的三角形，这里只考虑旋转，且变的是系数场，而论文变非齐次 BC 并固定系数场为 1
		* 假设 2a：$\bar D$ 为 $(0,0),(0,1),(1,0)$ 为顶点的三角形，$b_\eta(x)=[\cos\pi\eta^D_1,\sin\pi\eta^D_1;-\sin\pi\eta^D_1,\cos\pi\eta^D_1]$ 为线性旋转变换，从而 $J_\eta$ 与 $x$ 无关
		* 现已有 UAE 性质；对于全纯性，希望能延拓到 $\eta\in B_1^N\subset\mathbb{C}^N$ 后 $A_\eta\circ b_\eta$ 关于 $\eta^D_1$ 全纯（最终要的是 $\bar A_\eta$ 全纯延拓，而 $J_\eta$ 全纯延拓容易；关于 $\eta^A$ 延拓显然），发现需要添加如下条件：
		* 1a：$A_0,\Psi_i\in C^\omega(B_\rho\times B_\rho)$，$\rho=\sqrt{(\cosh2\pi+1)/2}$
		> 实 $\eta$ 的情形涉及的比 $C^\omega([-1,1]^2)$ 还弱
	* 容易推广到三角形的一般仿射变换，只是 $\rho$ 要再增大
	* 一般 $n+2$-边形区域：$\bar D$ 为 $n+2$-边形，拆分为 $n$ 个三角形
		* 可以是退化的 $n+2$-边形，只要能拆分出三角形即可
		* 每个三角形分别仿射变换到 $D_\eta$ 上对应区域，从而 $b_\eta$ 为分片仿射变换、$J_\eta$ 为分片常值矩阵（在零测集上无定义）
		* 注意这样是被允许的：$b_\eta(x)$ 关于 $\eta$ 为 $C^\omega$ 即可，关于 $x$ 只需 $L^\infty$，这样的条件就能传递到 $\bar A_\eta$ 上；它是分片 $C^\omega$ 的，间断只出现在所划分三角形的边界
		* 对 $D_\eta$ 形状施加一些限制、适当扩大 $\rho$，则所用定理的条件仍能满足
	* 更一般区域可尝试考察 $\kappa(J_\eta(x))$ 关于 $\eta^D,x$ 一致有界的变换族
		* 但还不知道是什么，可考虑问纯数背景同学；先考察平面全纯映射？物理里的 canonical transformation 参考价值？搜？
		* 巩：ahlfors "complex analysis" 讨论了 Riemann 映照定理延拓到边界的情形
			* 另：可试图只考虑边界 Jordan 曲线的对应，再试图延拓到内部，或许可各分量分别解 Poisson 方程再证明是单射？某种意义上的极小曲面？
		* 还需确认该变换关于 $\eta$ 的全纯性？不如直接把 $b_\eta$ 的存在性放假设里
			* 如果是平面上的多边形，其顶点位置用全纯参数化不难，但不能直接推广到一般形状
			* 注意对非实数 $\eta$，$D_{\eta^D}$ 为 $\mathbb{C}^2$ 子集，不在 $\R^2$ 上
	* 另一种场景，$A_\eta$ 有间断（上面的是 $C^\omega$ 无间断，仅在变换到标准域后出现间断）
		* 为简便起见，考虑 $D_\eta=\bar D$ 不变，$A_\eta$ 有两分支 $A_\eta^1,A_\eta^2$，其光滑分界线由 $\eta^D$ 解析地参数化（例如用 control points，Bezzier 或样条等）
		* 取 $\bar D$ 为单位圆盘，分出左右两区域，只允许间断出现在分界线上；自行选取 $b_{\eta^D}$ 使 $\bar D$ 的分界线映到 $A_\eta$ 两分支的分界线
		* UAE 不难满足（需要曲线不能太奇异，或者太靠近 $D_\eta$ 边界）
		* 全纯延拓存在性条件，需要 $A_\eta^1,A_\eta^2$ 都可延拓到更大的 $\mathbb{C}^2$ 中区域上（定义域会有重叠）
	* 注：最后打算用 master domain 而非 reference domain；推导直接用 tex 记录，暂未整理到笔记系统
* 变区域椭圆方程解算子Lip常数
	* 引理：$\det J$ 取值范围 $(1\pm\|J-I\|_2)^d$
		* 证明：令 $J=I+C$，$\|C\|_2=\epsilon<1$，要证 $\det(I+C)$ 最大最小值 $(1\pm\epsilon)^d$
		* 若 $C$ 对称，正交对角化后不妨 $C$ 对角，最大值成立
		* 一般 $C$：$\det(I+C)^2=\det(I+C)(I+C^\mathrm{T})=\det(I+C+C^\mathrm{T}+CC^\mathrm{T})$，$I$ 后的对称矩阵 $\|-\|_2\le 2\epsilon+\epsilon^2$，最大值即得
		* 最小值等价于 $\det(I-C)$ 最小值，$1=\det(I-C)\det(I+C+C^2+\cdots)$ 后者 $I$ 后的矩阵 $\|-\|_2\le\epsilon+\epsilon^2+\cdots$ 即证
* GRF熵数；{o1mh2l}
	* 相关：((o42l65))熵数汇总
	* $\sum\alpha_k\sqrt{\lambda_k}\phi_k(x)$，为简便设 $\alpha_k\in[-1,1]$
	* 等距同构 $L^2\cong\ell^2(\mathbb{Z})$ 于 $\prod[-\sqrt{\lambda_k},\sqrt{\lambda_k}]$
	* 从而 $2^n=\prod(1+[2\sqrt{\lambda_k}/\epsilon])$
		* 后来发现这是用的 $\ell^\infty(\mathbb{Z})$-范数！
		* 如果用 2-范数，还需解集合有界条件，这要求 $\sqrt{\sum\lambda_k}<+\infty$
	* $2\sqrt{\lambda_k}\sim k^{-s}$ 时估计：
		* 求和上限 $K\sim\epsilon^{-1/s}$，$2^n\approx\prod^K(k^{-s}/\epsilon)$
		* 代入 $\epsilon\sim K^{-s}$ 并用 Stirling 公式估计 $K!$
		* 再利用 $K\gg(\ln K)/2$ 可忽略后一项，最终代换回 $\epsilon$ 有估计 $\epsilon_n\sim cn^{-s}$
	* $2\sqrt{\lambda_k}\sim q^{-k},q>1$ 时估计：
		* $K\sim-\ln\epsilon/\ln q$
		* $2^n\approx\prod^Kq^{-k}/\epsilon=q^{K(K-1)/2}\approx q^{K^2/2}$
		* $\epsilon\sim\exp(-c\sqrt n)$，$c=\sqrt{2\ln 2\ln q}$
	* 如果只处理初值 $u^0\sim$GRF，推导结论不需要直接算熵数
		* Kolmogorov n-width 可直接估计，如果再做 Lipschitz 变换则结果的 AE width 也可看出来
		* 但若系数场按 GRF 设定，由于系数和解的度量不同，估计 AE width 仍只能通过熵数作中介
	* 以下进一步简化为{有限求和版本} $\sum_{k=1}^{K}\alpha_k\sqrt{\lambda_k}\phi_k(x)$；{o1mh2n}
		* 可在任意 $U\in\mathsf{Ban}$ 考虑
		* $\|u^1-u^2\|_U\le\sum c_k|\alpha_k^1-\alpha_k^2|$，$c_k=\sqrt{\lambda_k}\|\phi_k\|_U$
		* 设第 $k$ 维拆分为 $n_k$ 个均匀格点（用于近似表达 $[-1,1]$ 最大误差为 $1/n_k$）
		* 为使各维度拆分均匀，取 $n_k=[c_k/\delta_n]$，$\delta_n$ 待定
		* 约束 $\prod n_k\le 2^n$，充分条件为 $\delta_n^K\ge 2^{-n}\prod c_k$ 故取 $\delta_n=2^{-n/K}(\prod c_k)^{1/K}$
		* $\epsilon_n\le\sum c_k/n_k\le\delta_n\sum c_k/(c_k-\delta_n)\sim K\delta_n=K2^{-n/K}(\prod c_k)^{1/K}$
* 变速度场对流方程熵数估计
	> 草稿在 `ADwidth.xoj`
	* 先考虑一维 $u_t+c(x)u_x=0$，固定初值 $u_0(x)=\chi_{x<0}$，无界区域 $x\in\R$ 但只在有限区域 $L^2[0,1]\times[-1,1]$ 上度量解距离（相当于吸收边界条件）
		* 特征线 $\dot x=c(x),t(x)=\int dx/c(x)$，故解为 $u(t,x)=\chi_{t<\int_0^xds/c(s)}$
		* 解距离 $\|u_1-u_2\|_2^2\le\int_0^1dx\int_0^x|1/c_1(s)-1/c_2(s)|ds\le\int_0^1|1/c_1(s)-1/c_2(s)|ds=\|1/c_1-1/c_2\|_1$
		* 设 $1/c(x)=r^0(x)+\sum_{k=1}^{K}\alpha_k\sqrt{\lambda_k}\phi_k(x)$（有限和，保证非负）， $\alpha_k\in[-1,1]$
		* 根据 ((o1mh2n))GRF熵数-有限求和版本 $U=L^1$，将其结果开根号应有 $\epsilon_n\le C\sqrt K2^{-n/2K}$
			* $\lesssim$ 情形的渐近系数 $C$ 可写出
		* 若系数换为 l1 约束 $\sum|\alpha_k|\le 1$，预计原来推导里的 $2^n$ 要换成 $K!2^n$
			* 从而原有表达式里 $n$ 换成 $n+\ln I!/\ln 2$
			* 以上 l1 仅是直观，仍需精细验证；l0 约束 $\|\alpha\|_0\le m$ 情形同样需精细检查
		* 注意一维且 $c(x)>0$ 保证了解关于 $c\in L^\infty$ 连续
			* 这里讨论 $1/c$ 之间的距离应该还有改进空间；直观上 $\|c^1-c^2\|$ 较小时 $|u^1-u^2|$ 总能小，即使 $c$ 较小
			* 恒非负是本质的；否则考虑 $\alpha$ 参数化 $c(x)$ 间断位置，$c(x)$ 间断两侧 $\pm 1$，则当 $\alpha$ 横跨 0 时解有突变
				* 有点像 Lyapunov 不稳定性，或者无穷维 ODE（即 PDE）的“分岔”？
			* $D$ 维无法添加“恒非负”条件，故下方讨论必须添加 $c$ 关于 $x$ 可微的条件，不像这里允许间断
	* 以下考虑 $D$ 维 $c:X\to\R^D$，初值 $u_0(x)=\chi_{x\preceq 0}$（逐分量；二维时即第三象限）
		* 方程现可写为 $u_t+c(x)\cdot\nabla u=0$
		* $\|\chi_{x\preceq x^1}-\chi_{x\preceq x^2}\|_2^2\le\int\sum_{d=1}^{D}\chi_{(x_d-x_d^1)(x_d-x_d^2)<0}\,\mathrm{d}x=2^{D-1}\sum_d|x_d^1-x_d^2|$
			* 由集合运算 $A\subset\bigcup A_i$ 推出 $\chi_A\le\sum\chi_{A_i}$；二维不难画出几何直观
		* 从而易知 $c^1,c^2$ 对应的解距离 $\le 2^{D-1}\|x^1-x^2\|_{L^1([0,1],\ell^1[D])}$ 由特征线距离给出
		* 用 ODE 解对参数可微性来估 $\epsilon_n$ 大小：设某一维参数 $\eta$
			* $x(t;\eta)=\int_0^tc(x(s;\eta);\eta)ds$
			* $\partial x/\partial\eta=\int_0^t[c_1'\partial_\eta x($$s;\eta)+c_2']ds$，$\partial_\eta x(0;\eta)=0$
			* 以下设 $\|c_1'(x;\eta)\|_1\le a$，$\|c_2'(x;\eta)\|_1\le b$ 关于 $(x,\eta)$ 一致地成立，其中矩阵范数依据 $X$ 上 $\ell^1$ 范数确定
				* $\eta$ 空间上的范数可自选？
			* 对固定的 $\eta$ 定义 $r(t)=|\partial_\eta x(t;\eta)|_1$ 有 $r(t)\le\int_0^t(ar(s)+b)ds$
			* 可证明 $r(t)\le b(e^{at}-1)/a$，从而 $|x(t;\eta^1)-x(t;\eta^2)|\le|\eta^1-\eta^2|b(e^{at}-1)/a$
				* 事实上 $p(t)=\int_0^t(ar(s)+b)ds$ 满足 $p'(t)=ar(t)+b\le ap(t)+b$，可给出 $p(t)$ 的估计
				* 注意 $|x^1-x^2|$ 的估计不能用微分中值定理（因为 $x$ 是多元函数，每个分量对应的 $\theta\in(0,1)$ 不同），要用对 $\eta$ 积分的形式来写
		* 需要的条件：$c(x)$ 有界，以使特征线在有限时间内不爆破
			* 还需要关于 $x$ 可微且导数有界，这不同于一维；原因解释在一维的讨论中
		* 从而考虑参数距离：$\|u^1-u^2\|_2^2\le C|\eta^1-\eta^2|$，$C=2^{D-1}b\int_0^1(e^{at}-1)dt$
			* 应有 $\epsilon_n(\{u^\eta\})=\sqrt{C\epsilon_n(\{\eta\})}$
			* 选取 $\{\eta\}$ 空间上合适的范数即可；注意这会影响 $a,b$ 的取值
		* 考虑 $c$-距离（而非参数距离）的另法：给定 $c^1,c^2$ 令 $\eta$ 给出线性插值 $c_\eta=\eta c^1+(1-\eta)c^2$，重复上述 ODE 变分论证（此时 $b=\|c^1-c^2\|$ 是小量）
		* 例：若 $c(x)=\bar c(x)+\sum\alpha_k\sqrt{\lambda_k}\phi_k(x)$，$\phi_k:X\to\R^D$
			* 若考虑参数 $\alpha$-距离：似乎用 $\eta=\alpha$ 参化已比较均匀
				* 易知可取 $a=\|\partial_x\bar c(x)\|+\sum\sqrt{\lambda_k}\|\partial_x\phi_k(x)\|$
					* 其中范数在 $L^\infty(X,\mathsf{Ban}(\ell^1[D]))$ 取，即对 $x\in X$ 取 $\infty$ 范，对 $c$ 取 $1$-范，对 $\partial_{x_d}$（各方向切分量，$T_xX$）取 $2^*=\infty$-范）
				* 如果改用 $\eta=\alpha\sqrt\lambda$，由于 $k$ 大时 $\partial_x\phi_k(x)$ 通常大，无法被 $\sqrt{\lambda_k}$ 压下去，导致较大的 $a$
				* $\eta$ 空间的距离选取，直观上取 2-范数能得到最佳结果？
			* 若考虑 $c$-距离，可继续用 ((o1mh2n))GRF熵数-有限求和版本，其中 $U=L^\infty([-1,1]^D;\ell^1[D])$
	* 待考察：同时变初值，变右端项（或许用 Duhammal 可转化为变初值）；变区域？
		* 变初值：1D 或许可考虑 BV 函数从而只需单调初值类
			* 先考虑固定但更一般的初值；单调函数或许可写为某测度下 Heaviside 函数的积分（Stieljes？积分？）
			* 或者用简单函数逼近？这样有机会处理高维，不限于 BV 函数
		* 抛物 diffusion 方程，对流-扩散方程（后者用特征线似乎可化前者）
			* 可参考椭圆已有的简单估计 `DL-ROM-2103.06183` lemC.2
			* `EvansPDE2ndOrd` p376 的估计可用，只是推导时需改用 $\|f\|_{H^{-1}}$
				* 找已有文献是否有已经按 $H^{-1}$ 讨论的？
				* 或者文章里直接说换度量后几乎所有推导都能过（除了 $\langle f,u\rangle\le\beta\|u\|^2/2+C\|f\|^2$ 与原来不同）
				* 只写稍有差异的前一部分，之后写同原文？
				* 默认解存在性，只推导此时满足的性质
		* 波方程；变系数不好处理
			* "Homogenization of the variable-speed wave equation" 将 $u_{tt}+c(x)u_{xx}=0$ 变换化为常系数 Klein-Gorden 方程
			* 似乎仍不好获得解析解，不过如果能像椭圆方程那样直接给出解估计还是可以的
			* Evans 里讨论二次双曲方程的部分可参考 `EvansPDE2ndOrd`
		* 相关：椭圆方程区域拓扑可变，可考虑大区域上 level set 表达方程区域，解空间 $U$ 定义中商掉方程区域外部分的 $u$ 取值（等价类）
* PoincareConst 关于区域的 Poincaré constant 大小
	* [目前主要信源](https://handwiki.org/wiki/Poincar%C3%A9_inequality)
	* 考察 $u\in W^{1,p}_0(\Omega)$，要求 $\|u\|_{L^p}\le C\|\nabla u\|_{L^p}$
	* $p=1$ 时 $C\le\mathrm{diam}(\Omega)/2$，有引文（结论形式上与维数无关）
	* $p=2$ 时 $C\le\mathrm{diam}(\Omega)/\pi$，见 arXiv:1112.4398
		* （评）看原文似乎这是针对 Neumann 边界的 $C$，对 Dirichlet 的相对复杂，涉及最大内接球半径？
			* 或许算出来会比这个 Neumann 边界的小，但未确认细节
			* 原文是针对 $\R^n$ 上任意范数 $F$ 及其对偶 $F^0$ 讨论的
	* 相关：$p=2$ 时 $\lambda=\min(\int|\nabla u|^2/\int u^2)$ 为 Reyleigh 商，极小值为 $-\Delta$ 的最小特征值，可用于估计 Poincaré 常数大小

## 文献笔记
* `Maiorov99width`
	* "On the Degree of Approximation by Manifolds of Finite Pseudo-Dimension"
		> created on 2022-01-26
	* eqn(1) nonlinear n-width 定义：用 $\dim_pH\le n$ 的函数类来逼近函数类 $F$ 的最小 gap
		* def2 pseudo-dimension $\dim_p$ 定义：在 $n$ 点上函数类取值有充分多样性
		* def2 是 VC-dimension 的拓展；
		> n-width 衡量给定集合能多大程度上被某类的集合逼近；其他地方的类按流形维数给出，这里利用 ambient space 为函数空间，可用 VC 维数
* `Dung96onNLwidth` AE/Alexandrov width 不等式关系
	* DINH DUNG AND VU QUOC THANH "ON NONLINEAR n-WIDTHS"
	* DeVore 等人定义的 nonlinear n-width $\delta_n$（> 即隐空间 $n$ 维时的最佳 AE loss）
	* $\delta_n$ 与 Alexandrov nonlinear n-width $a_n$ 之间的关系：$\delta_{2n+1}\le a_n\le\delta_n$
		* 条件要求集合 $W$ 紧
		> 即 AE loss vs AD loss；回忆集合拓扑不平凡的时候右侧为严格小于号
		* （评）`DL-ROM-2103.06183` thm2 也涉及 $2n+1$，写文章可一起引用
	> 文中所用的 Alexandrov width 定义基本同 `BndsUrysohnW`，按那里的记号声明了 $Z$ 为 $n$-维多面体
	> 如果是这么定义，则与 AD loss 不同，是要求集合 $W$ 有一个 $n$-维单纯复形的骨架 和到其上的 contraction map，map 移动的最大距离为 width 定义
* [cohenSlidesWidth](http://smai.emath.fr/cemracs/cemracs21/data/presentation-speakers/cohen.pdf)
	* "approximation of multivariate functions : reduced modeling and recovery from uncomplete measurements"
	* 训练 PDE 解算子、反问题等，数据采样可给定或 active sample（即自行选取采样点）
	* p48/271 $-\nabla\cdot(a\nabla u)=f$，$a\in L^\infty$ 分片常数，解流形的 Kolmogorov n-width 满足（用多元泰勒多项式逼近）$d_n(K)_{H^1}=O(\exp(-ck))$，其中 $n=\binom{k+d}k$（$k\lesssim n^{1/d}$）
		> Darcy flow；2022-02-15 讨论，若变化的是 $f$ 和边界条件则会在有限 $n$ 衰减到 0，因为解用 Green 函数写后，解流形维数显然是有限的
	* p70/271 线性降维不适用于参数化的双曲方程：$u_t+au_x=0$，$d_n(H)_{L^p}\sim n^{-1/p}$；{_o1mh6n}
		> `1903.08488` 对波方程推导了衰减速率
		* 相应 reduced basis method 效果也不行，不好于 uniform mesh 上分片常数逼近
		> 我当时在 ((o6fn12))domDecmp 说明 AD 区域分解效果好于 FEM 时也是认为非线性好处理激波；TODO 链接过去
	* p79/271 library width $d_{N,n}(K)_V$ 感兴趣的是 $N\gg n$ 的情形
		> 似乎是针对稀疏约束，要求至多 $n$ 个非零分量，从而考虑分量选取方式总数 $N$ 确实大
	* manifold width 要避免填满空间的曲线；DeVore 版本 $\delta_n$ 要求 AE 连续
		* p89 stable nonlinear width $\delta_{n,L}$ 要求 AE 编码解码器均 $L$-Lipschitz（$\R^n$ 上范数任取）；p91 与 entropy number 的不等式关系
	* p86 取 $V=L^\infty(I)$，$K$ 为 $\mathrm{Lip}(I)$ 上的单位球，则 $\delta_n(K)_V\ge b_n(K)_V=n^{-1}$
		* 而 2020 年一篇论文指出 NN 逼近速率 $n^{-2}$，因此参数选择不是连续的
		* Bernstein n-width 定义见 p41/271，能作为子集的 $n+1$ 维圆盘的最大半径
		> 这个定义要求集合是“实心”的，例如区域或闭区域；内部有“洞”的不行
	* p94 由 entropy number 为中介导出了 $\{\mathbf{1}_{[a,a+1]}|a\in[a_1,a_2]\}$ 的 $\delta_n$ 大小
		* 用到的 $\epsilon_n,\delta_{n,L}$ 关系见 p136 [3] `[DeVore]-2009.09907`
		* （评）$\epsilon_n$ 大小估计容易：本来就有一维参数化，在其上取均匀网格为球心
			* 注意参数距离与 $L^2$ 距离不一致，应有 $\epsilon_n(K)\sim 2^{-n/2}$ 而非参数距离的 $\epsilon_n([0,1])_\R\sim 2^{-n}$
			* 由于问题特殊，若无 Lipschitz 要求，AE 可直接构造，例如编码器直接用积分 $u\mapsto\int_0^1u$；若 $a_2-a_1$ 较大，还可分段定义积分
				* 隐空间维数 $n=1$ 已可完全拟合，无需考察渐近行为
			* 但是这样构造所得解码器不是 Lipschitz 的，在有 $\gamma$-Lipschitz 条件下还是只知道存在性
	* p136 day1 ref，[2] 中提出了最初 AE 版 width，并证了几个有关单位球的界; 
		* [7] 为 `1509.07045`(x)，其引用 [8] 为 `[8]=-1509.07045`
	* 备用：p16 与 active-learning 有关：算子学习的 active aquisition 设定，数据收集（如实验、数值模拟）昂贵，可花一些离线时间设计采样哪些数据点
		* （评）((n1gf2v))有的需事先设计所有样本，有的可动态选样本；{n1gf2y}
		* p24,26 反问题有限观测（点取值，或局部平均），观测位置可自行选取，包括成像
		* 这些主要应在 day2 讨论，不过内容似乎较理论就没细看
* `1511.02021` 对流方程 Kolmogorov n-width 衰减阶，及非线性逼近的初步工作
	* "Reduced Basis Methods: Success, Limitations and Future Challenges"
		> created on 2023-01-26
	* sec5.1 考虑对流方程（常数波速），时间为唯一参数，证明解流形 $d_n\ge n^{-1/2}/2$（全空间 $L^2[0,1]$）{_o1mh6k}
	* sec5.2 初步工作，基于字典的逼近，激波检测，非线性参化
		* 非线性参化包括：用李群，用 Lagrange 插值多项式，低阶逼近，基于 Lax pair 的逼近
		* 低阶逼近中，变换 $Y$ 基于 PCA、解 snapshot 的 Wasserstein 距离，之后 $u(x,t)$ 表达式涉及 $\det\nabla_xY(x,t)$，$R(Y(x,t),t)$ 等
* `1903.08488` 证明波方程 Kolmogorov n-width 衰减阶下界 $n^{-1/2}$
	* "Decay of the Kolmogorov $N$-width for wave problems"
		> created on 2022-04-20
	* 波方程 $u_{tt}-c^2u_{xx}=0$，$t=0$ 时初值 $u=\mathrm{sgn}(x)$，$u_t=0$，$u\in L^2([0,1]\times[-1,1])$
		* 解析解 $u(t,x)=\phi(x/t)$；讨论解集 $d_n$ 相当于对 $\phi_c$ 组成的集合讨论 $d_n$
		> 由 $\phi$ 奇函数，又相当于对 $\phi|_{s>0}=\chi_{[c,1]}$ 讨论；
		> 以下按这个写，尽管原文包括了正负半轴；并且各符号也基于自己理解写，不按原文
	* prop4.4 相当于证 $d_n(\{\chi_{[k/2n,(k+1)/2n]}|k\})\le 2d_n(\{\chi_{[c,1]}|c\})$
		> 不难；左侧集合的任意元素为右侧某两元素之差，有限维空间中的近似点也可作差（因为是线性逼近）
	* lem4.1 $d_n(\{e_1,\dots,e_{2n}\})=1/\sqrt 2$，用线性代数找 $V_n$ 标准正交基底可证明
		* lem4.3 ambient space 可以是无穷维 Hilbert 空间，不局限于 $2n$ 维的 $e_k$ 张成的空间
	* 在 $L^2[0,1]$ 中可认为 $\chi_{[k/2n,(k+1)/2n]}=e_k/\sqrt{2n}$（它们显然两两正交，模长均为 $1/\sqrt{2n}$），从而联合上面有 $d_n(\{\chi_{[c,1]}|c\})$ 的下界估计
	* 上界用构造性证明立得，故确实是 $1/\sqrt n$ 的阶；{_o1mh6z}
* `2305.00066` 对流方程 Kolmogorov n-width 衰减阶，在初值有一定光滑性情形
	* "The Kolmogorov N-width for linear transport: Exact representation and the influence of the data"
		* Arbes, Florian; Greif, Constantin; Urban, Karsten; 
		> created on 2024-01-22
	* 摘要：初值 $g\in H^r$（Sobolev space）时 $d_N=c_rN^{-(r+1/2)}$，有额外数值实验验证；{_o1mh6t}
* [EncycMathWidth](https://encyclopediaofmath.org/wiki/Width) 多种 n-宽度定义
	* 包括线性子空间、仿射空间、紧集、n 离散点
	* 另有 {coding} 考察原像集合直径上确界的
		> 只编码不解码；取 $C=S^1,A=\R^1$ 无法以 0 宽度拟合；
		> 相比只解码的好处：可避免 Peano 曲线；
	* 两种定义都考察的是映射 $C\to A$，用某类中的 $A$ 拟合 $C$
		> 第二种不要求 $A,C$ 为同一度量空间的子集，可以是任意的独立集合；若要求 $f$ 连续，也许可有拓扑；
		> 若 $A$ 也是同一空间的子集，则第二种给出的宽度稍大于第一种（直径大于半径）
	* 其中所指的 Aleksandrov n-width 是用的 $n$-维紧集/多面体（二者 inf 等价）？
		> 由于待拟合的集合 $C$ 为紧集，用紧集去拟合应该还好；
		> $n$-维多面体可以像 TDA 里那样用 $n$-单纯复形定义，由 simplex 组合而成，这样无需引入 $\R^n$，类似我们的 AD 论文那样用解码器
* `Pinkus85width`
	* "n-widths in approximation theory" by Pinkus
	> `[EncycMathWidth]` 推荐的书，PKU 图书馆可下载电子版；
	> 文中似乎讨论的几种都是 linear n-width；内容稍丰富，包括不同定义间的不等式关系、算子范数下算子类的 n-宽度
	* Gelfand n-width $d^n$，与余维数 $n$ 的子空间交集的最小可能半径（从原点算）
		* 与 ambient space 选取无关
		* secII.6 与 $d_n$ 有对偶关系
	* `[DeVore]-2009.09907` 对本书的评价：fundamental results for Kolmogorov and linear widths
* `0711.3081` "Widths of $l^p$ balls"
	> created on 2022-02-11
	* 定义 $\epsilon$-embedding $f:X\xhookrightarrow{\epsilon}Y$ 指 $f$ 连续，$\forall y\in Y$ 有 $\mathrm{diam}(f^{-1}(y))\le\epsilon$
	* 定义 $\mathrm{wdim}_\epsilon(X,d)=\inf_{f:X\xhookrightarrow{\epsilon}K}\dim K$，其中 $K$ 为 $k$-维的多面体
		> 在 `[EncycMathWidth]` 中有介绍这种
		* Urysohn width 或称 Alexandrov width $a_n(X)\coloneqq\inf\{\epsilon|\exists f:X\xhookrightarrow{\epsilon}K,\dim K=n\}$ 
		> $a_\cdot(X):\mathbb{N}\to\R_+$ 递减序列，这里给出的则是反函数 $\mathrm{wdim}_\cdot(X,d):\R_+\to\mathbb{N}$，为递减阶梯函数
	* 本文主要关心 $\R^n$ 中 $l^p$ 范数下单位球在 $l^q$ 范数下的 wdim，$1\le p,q\le\infty$
* `BndsUrysohnW`
	* "Bounds on Urysohn width", 2021 PhD thesis of Alexey Balitskiy
		> created on 2022-02-12
	* def2.1.3 Alexandrov d-cowidth 就是 Urysohn d-width，$a^d(X)=u_d(X)$
	* def2.1.4 Alexandrov d-width 定义 $a_d(X)=\inf_{f:X\to Z}\sup_{x\in X}\|x-f(x)\|$，要求 $Z$ 为至多 $d$-维子空间，$f$ 连续
		> 按它后面给的不等式，应该不要求 $Z$ 是线性空间，只需单纯复形；按 `Dung96onNLwidth` 的定义确实如此
	* 有 $a_d\le u_d=a^d\le 2a_d$，第一个等式要求 ambiant space 为 Banach 空间
	* def2.1.5 homological d-width（略）, def2.1.6 Kolmogorov d-width
	* def2.1.7 absolute Alexandrov d-width 考察所有可能的 ambient space 使得 $X$ 可等距嵌入其中，取 inf；thm2.1.8 最小值可取到, thm2.1.9 为 $a^d/2$
	* def2.3.1 Urysohn width 的多个等价定义
	* sec2.4 Urysohn width 若干性质，例如 $u_d(X\times Y)$
	> 看文中的描述，似乎这些概念讨论的是度量几何（metric geometry）的内容？
* `[DeVore]-2009.09907` 讨论了 entropy number 与 AE width 的不等式关系
	* "Optimal Stable Nonlinear Approximation" by Cohen, DeVore
		> created on 2022-02-20
		* 发表于 Foundations of Computational Mathematics 2021
	* 推荐 [12] 作为现有各种 n-width 的汇总
	* p3:-1 所关心的主要问题表述为：给定 model class $K$ 上的数值任务，是否存在该任务的最佳数值算法
		> 可能是考虑解一类特定 PDE，如流体，针对这样的参数化系统设计最优数值算法？这样就确实和我们所关注的问题相似
		* 以及是否存在  optimal rate-distortion performance which incorporates the notion of stability
		* (?) we need a precise definition of what are admissible numerical algorithms
	* width 定义细节：eqn(1.7) $\delta_{n,\gamma}^*(K)_X$ 要求 $E:K\to\R^n$ Lipschitz
		* eqn(2.2) $\bar\delta_{n,\gamma}(K)_X$ 则要求 $E:X\to\R^n$ Lipschitz
		* 由定义前者较小；lem2.1 若 $X\in\mathsf{Hilb}$ 且 $K$ 紧凸集，则相等
		* 定义中还涉及对 $\R^n$ 上的范数 $\|-\|_Y$ 取极小；不过在 thm4.1 中直接取的 $\ell_2^{26n}$ 固定范数即可给出结论
	* eqn(1.4) entropy number $\epsilon_n(K)$ 定义：$2^n$ 个 $\epsilon$-ball 可覆盖 $K$，对 $\epsilon$ 取下界
		* （评）$=\inf_{\#S_n=2^n}\sup_{u\in K}\inf_{v\in S_n}\|u-v\|$，从而形式类似 Kolmogorov/Alexandrov n-width
	* eqn(1.10), thm4.1 Lipschitz AE width $\delta_{n,L}$ 与 entropy number $\epsilon_n$ 的关系
		> 似乎 `[cohenSlidesWidth]` p91 汇报的结论更强
		* $\delta_{26n,2}(K)_H\le 3\epsilon_n(K)_H$，$H$ Hilbert；以下为证明框架
		* 由 Johnson-Lindenstrauss 引理，存在线性编码器 $E':H\to\R^{26n}$ 近似保 $f_1,\dots,f_{2^n}$（entropy number 定义中的球心）的两两距离
			* 具体地，$\|E'(f_i)-E'(f_j)\|/\|f_i-f_j\|\in[1/2,1]$
			* 对 $E'$ scaling 后等价于找 $\Delta E^2/\Delta f^2\in[1-\epsilon,1+\epsilon]$
			* 引文引理证明，$E$ 选取方式：
				* 设 $H$ 的 $d$ 维子空间含 $f_i$
				* $d$ 只要是有限值均能证明，虽然不同子空间选取会影响 $E$ 构造方式
					* 最简单可取张成的空间 $d\le N=2^n$
				* 再在子空间随机取 $k$-维子空间，$k=26n\ge c(\epsilon)n$
				* 考察 $H$ 到该子空间的投影算子 $P$ 的 scaling $E=\sqrt{d/k}P$
					* （旧，未确认）scaling 系数 $d/k$ 选取是使 $|\Delta E|$ 随机变量中位数恰为 $|\Delta f|$
			> 避免记号冲突，引文 $n$ 在此处笔记对应 $N=2^n$
			* 引理证明纲要：这样随机选的 $E$ 不满足条件的概率小于 1，故存在满足条件的 $E$
			* 不妨直接将 $k$-维子空间当成全空间，因 $E$ 在 $X$ 其余部分取值不影响引理结论
			* $\Pr(|E_i-E_j|^2\le(1-\epsilon)|f_i-f_j|^2)\le 1/N^2$
				* 由于 $E$ 线性，只需证 $\Pr(|E(f)|^2\le(1-\epsilon)|f|^2)\le 1/N^2$，$\forall|f|=1$
				* $d$-维子空间随机选取，等价于固定子空间 $\R^k\subset\R^d$、$f\sim U(S^{d-1})$
				* 随机变量构造为 $f=x/|x|$，$x\sim N(0,I_d)$，有 $Ef=d(x_1,\dots,x_k)/k|x|$
				* lem2.2a 估 $\Pr(|E(f)|^2\le\beta|f|^2)$，概率论常见技巧
					* 乘 $t$ 用 Markov 不等式、$\mathbb{E}\exp(sx_i^2)$ 表达式，取 $\min_t$
				* 如 lem2.2a 叙述中用 $1+s\le e^s$，使结果不再依赖于 $d$
				* 代入 $\beta=1-\epsilon$ 及 $k,\epsilon,N$ 关系即证
			* 同理 $\Pr(|E_i-E_j|^2\ge(1+\epsilon)|f_i-f_j|^2)\le 1/N^2$；共 $N(N-1)/2$ 个 $(i,j)$-pair，存在某对不成立的概率为 $N(N-1)/N^2<1$，即证
		* 由 Kirszbraun extension 定理，$D:E_i'\mapsto f_i$ 可延拓为 $\R^{26n}\to H$，保 2-Lipschitz
			* 引文有证明，涉及 Zorn 引理，只需证明定义域总可添加单点
			* 引文只需 $D$ 类似一致连续的条件，用更强的 Lipschitz 条件证明变简单；不妨 1-Lipschitz
			> 虽然 $E$ 线性，但显然无法保证 $D$ 线性
			* 引文 prop1.13，
		* 命题证明：$|f-D(E'f)|$ 大小估计，找 $\epsilon_n$ 定义中对应的 $f_i,D(E_i')$ 即可给出
			* 注意 $E'$ 1-Lipschitz，$D$ 2-Lipschitz，复合也 2-Lipschitz
	* thm2.9 最优的 AE 可取到
	* eqn(3.1) 无法期待 $\epsilon_n$ 能被 $\delta_{n,\gamma}$ bound 住；只有反向的
	> arXiv 有不少引用，包括 Jinchao Xu? 可确认
* `LipWidth-2111.01341` AD width 对范数也取 inf 的版本
	* "Lipschitz widths"
		* Petrova, Guergana; Wojtaszczyk, Przemyslaw; 
		> created on 2023-06-20
	* 要求 $\gamma$-Lipschitz，证明了 width 关于 $\gamma$ 连续
		* $n\to\infty$ 或 $\gamma\to\infty$ 时 width 趋于 0 iff $K$ totally bounded¹
			* ¹rmk2.2 等价定义：$\epsilon_n\to 0$；另外 Banach 空间子集紧 iff 完全有界+闭
	* thm3.3 对范数的 inf 可取到 min
	* prop4.4 $\gamma$ 的下界估计
	* thm4.2 Lipschitz width 不大于熵数
		* 证明的构造用 $l^\infty(\R^n)$ 而非 2-范数：单位球划分为 $2^n$ 小方块，每个中心映射到 熵数 对应的球心，方块边界映射到原点
		* 证明示意图见 `<n6li8i>`
	* prop4.6 熵数同时给出 Lipschitz width 的下界
	* thm5.1 与 Kolmogorov n-width 的关系，对 $\gamma$ 有要求
		* eg5.1 L1 范数下对流方程解集的 Kolmogorov n-width $\sim 1/n$、(inner) entropy number $\sim 1/2^n$；{_o1mh6e}
	* thm6.1 与 SMani width 关系，thm6.2 $n$ 维的严格小的例子
* `[8]=-1509.07045` 椭圆方程解流形的 Kolmogorov n-width 超多项式收敛
	* "Analytic regularity and polynomial approximation of parametric and stochastic elliptic PDEs"
		> created on 2022-02-27; 原文 2011 年发表
	* 设定：$\nabla\cdot(a(x;z)\nabla u(x,z))=f(x)$，$u|\partial D=0$
		* 函数空间 $a_z\in L^\infty(D),u_z\in H_0^1(D)$，$f\in H^{-1}(D)$ 取定
			* 本文 $H_0^1(D)$ 范数为 $\|\nabla u\|_2$；之后证明会涉及各元素范数
			> 若在 $H^1$ 讨论并涉及相应范数，则无法保证 $a$ coercive，$\|u\|\le\|f\|/r$ 不成立
		* 其中 $a(x,z)=\bar a(x)+\sum z_j\psi_j(x)$ 
			* 注：`1508.01821` 假设 2 只要求 $\mathbb{C}^n\to L^\infty(D),z\mapsto a$ 全纯（只需限制在有限区域上一致椭圆）；结论限于有限维参数，不过能达到次指数收敛阶
		* eqn(1.26) 复一致椭圆假设 $\mathrm{UEAC}(r,R)$：$0<r\le\Re a\le|a|\le R<\infty$，$\forall x\in D,z\in U=B(\ell^\infty(\mathbb{N,C}))$
		* 再假设 $\psi\in\ell^p(\mathbb{N},L^\infty(D))$, $p<1$
		> $\|\gamma_n\|_p=(\sum_n|\gamma_n|^p)^{1/p}$ 不是范数
	* 主定理 thm1.3：解算子 $u:B(\ell^\infty(\mathbb{N,C}))\to H_0^1,z\mapsto u(z)$ 可泰勒展开
		* 对指标 $\nu\in F=\bigoplus_\mathbb{N}\mathbb{N}$，泰勒系数 $t_\nu=\partial^\nu u/\nu!(\partial z)^\nu$
		* 泰勒系数满足 $t\in\ell^p(\bigoplus_\mathbb{N}\mathbb{N},H_0^1(D))$，记其模长为 $C$
		* 泰勒展开收敛：若指标集序列满足 $\liminf_N\Lambda_N=\bigoplus_\mathbb{N}\mathbb{N}$，则 $S(\Lambda_N)u(z)\coloneqq\sum_{\nu\in\Lambda_N}t_\nu z^\nu\to u(z)$ 对 $z\in B(\ell^\infty(\mathbb{N,C}))$ 一致成立（收敛在 $H_0^1(D)$ 中）
		> 想说泰勒展开的收敛是在 $L^\infty(B(\ell^\infty(\mathbb{N,C})),H_0^1(D))$ 中，但是这需要为 $B(\ell^\infty(\mathbb{N,C}))$ 赋予可测结构、零测集定义；对其赋予适当拓扑后，这种可测结构应该不难获得，只是这里不必讨论这些东西
		* 收敛阶：若 $\Lambda_N$ 对应模最大的 $N$ 个 $t_\nu$，则 余项模长小于 $CN^{-s}$，其中 $s=1/p-1$，$C$ 为 $t$ 的范数
	* 多数时候关心的是实数的特殊情况 thm1.2，不过用复数形式更方便证明
		> 用到复数的地方：lem2.2 有一阶导就 $C^\omega$；lem2.3 用到 Banach space valued 全纯函数性质（有限维泰勒展开的 uniform summability）；lem2.4 用 Cauchy 积分公式估计泰勒系数大小
	* > (mine) 定理说明的事情：该 $z$-参数化的 PDE 解流形的 Kolmogorov width $d_N\sim N^{-s}$，POD 线性基底由模最大的 $N$ 个 $t_\nu$ 给出
		* 注意基底不是由形如 $x^\nu$ 的多项式给出；这里的泰勒展开是针对无穷维解算子，而非特定参数下的解
		* 若 $\psi_j$ 只有有限个非零，则定理条件对于 $\forall p$ 成立，说明收敛阶快于任意多项式；已有文献有证明此时收敛阶形如 $C\exp(-cN^{1/d})$ 形式，可回到其 citation 找相应参考文献
	> 以下为我整理的证明大纲
	* 预备引理：thm1.1；lem2.1 $u$ 的变化被 $a$ 的变化 bound 住
		* （评）`Quarteroni2016book-RBM` prop5.1 与这里 lem2.1 差不多
		* （评）`DL-ROM-2103.06183` (arXiv-v2) lemC.1,2 为此处 lem2.1 推广，$\nabla\cdot(A\nabla u)+b\cdot\nabla u=f,u|\partial D=g$，同时变化 $A,b,f,g$；不过有额外限制 $\nabla\cdot b=0$
			* 其中 lemC.1 证明思路是这里的自然推广：$u-u'$ 为某方程的解，用解的范数估计
	* 泰勒系数 $t_\nu$ 的可定义性
		* lem2.2 $\partial_{z_j}u$ 可定义，为某方程弱解；证明，差分为某方程弱解，方程右端项在 $H^{-1}$ 收敛，从而差分在 $H_0^1$ 收敛
		> 注意复函数性质，有一阶导数就解析；此处用到该结论对于有限维（任意混合偏导只需在有限维中考虑）、Banach 空间取值的复函数成立；
		> 将高阶导数写为某方程弱解也不难，不过用不到
	* 泰勒展开 $\sum t_\nu z^\nu$ 的收敛性
		* prop2.3 若 $\bar a+\sum_jz_j\psi_j\to a(-,z)$ 在 $L^\infty(D)$ 中关于 $z\in B(\ell^\infty(\mathbb{N,C}))$ 一致收敛，则 $\exists\Lambda^*$，$\liminf_N\Lambda_N^*=\bigoplus_\mathbb{N}\mathbb{N}$，使 $S(\Lambda_N^*)u(z)\to u(z)$ 在 $H_0^1(D)$ 中关于 $z$ 一致收敛
		* proof step1: $u(z)$ 用有限维的 $u(z|[J])$ 逼近；这由于 $u$ 的差别可用 $a$ 的差别 bound 住，用到条件里 $a$ 收敛性
		* step2：对 $u(z|[J])$ 泰勒展开到 $K$ 次；用到有限维泰勒展开的结论
		* step3：注意当指标 $\nu$ 支集在 $[J]$ 上时，$u(z)$ 与 $u(z|[J])$ 的泰勒系数（在 $z=0$ 的混合偏导数）相同，均为 $t_\nu$
		* 从而用 $(J,K)$ 可定义 $\Lambda_N^*$，$u(z)$ 可用到 $\Lambda_N^*$ 的泰勒展开逼近
	* 泰勒系数 $t_\nu$ 大小估计
		* eqn(2.7) 对于正实数序列 $\rho:\mathbb{N}\to\R_+$（> 其实主要用的 $\to[1,+\infty)$），将 $U$ 扩展为 $U_\rho=\prod_{j\in\mathbb{N}}B(\mathbb{C},\rho_j)$
		> $\rho\equiv 1$ 对应未扩展 $U_\rho=U$
		* eqn(2.8) 定义 $\rho$ 为 $\delta$-admissible
		* eqn(2.1) 定义 $A_\delta$ 为满足 $\mathrm{UEAC}(\delta,2R)$ 成立的 $z$ 集合；此时有 $U_\rho\subseteq A_\delta$
		* lem2.4 $\|t_\nu\|\le\|f\|\rho^{-\nu}/\delta$（范数在相应空间取）；证明，Cauchy 积分公式估计各阶偏导数
		* eqn(3.5) 取 $\delta=r/2$，选特定的 $\rho$ 以得到 $\|t_\nu\|$ 的具体估计；推导包括 eqn(3.1-6)
		* 注：eqn(3.4+1) 估计用到了 $\max(1,x)\le 1+x$
	* 泰勒展开余项估计（收敛阶）
		> 注意收敛性证明仍是必要的，这里只估求和余项 $\sum_{\nu\notin\Lambda_N}t_\nu z^\nu$ 大小，有了收敛性后才能说它估的是 $u-\sum_{\nu\in\Lambda_N}t_\nu z^\nu$
		* sec3.2 证明泰勒系数满足 $t\in\ell^p(\bigoplus_\mathbb{N}\mathbb{N},H_0^1(D))$：
			* 用上一步 $\|t_\nu\|$ 估计，$\nu$ 拆分为支集在 $[J],\mathbb{N}\setminus[J]$ 的两部分，从而 eqn(3.8) $\sum\|t_\nu\|^p$ 写为两项乘积（差常数），需分别证有限
			* eqn(3.9) 易证 $[J]$ 对应的项有限
			* 另一项估计中 $\nu^\nu$ 项用 Stirling 公式放缩，最后用 thm1.1 得有限
		* sec3.3 证明 $\|t_\nu\|$ 按大小排序为 $\Lambda_N$ 后，收敛阶 $N^{-s}$，$s=1/p-1$
			* 由 $\Lambda_N^*$ 泰勒展开部分和收敛推出 $\Lambda_N$ 的部分和也收敛
			> 根据构造方式可能 $\#\Lambda_N^*\gg N$，而 $\#\Lambda_N=N$
			* eqn(3.13) Stechkin 关于递减序列的结论，$0<p\le q\le\infty$ 时整体 $\ell^p$-范数 bound 住去掉前 $N$ 项后的 $\ell^q$-范数；取 $q=1$ 此处收敛阶立得
	* > (mine) 应用于可变区域可能性，假设可从标准域变换得到 $b_\eta:\bar D\to D_\eta$
		* 本文方程需改为：$\nabla\cdot(A\nabla u)=f$，$a$ 换为对称矩阵 $A$
			* 可设 $\psi_j(x)$ 实对称，对其 $L^\infty$ 范数假设应可用特征值假设替代，这不随域变换改变
		* $\mathrm{UAEC}(r,R)$ 改为：$r\le\Re v^\mathrm{H}Av\le|v^\mathrm{H}Av|\le R$，$\forall x\in\bar D,z\in B(\ell^\infty(\mathbb{N,C})),v\in B(\mathbb{C}^d)$；注意 H 共轭转置
		* 初看起来所有定理都能过去
			* 以 eqn(2.2) 为例：$\Re\int f\bar u\le|\int f\bar u\le\|f\|_{H^{-1}}\|u\|_{H_0^1}$，
			* 而 $\Re\int(\nabla u)^\mathrm{H}A\nabla u\ge\delta\int(\nabla u)^\mathrm{H}\nabla u$
			* lem2.1 对 $a$ 的误差大小似应使用矩阵 2-范数
		* 坐标变换下，写出相应能量泛函，易得标准域下的方程 $\bar A=J^\mathrm{T}AJ/\det J$，$\bar f=f/\det J$，$J=\partial\bar x/\partial x^\eta$
			> 不要用强形式 PDE 直接推导 $\nabla$ 的坐标变换，也不要用测试函数 $v$，都不好算
		* 从而对变换的假设只需：$J^\mathrm{T}J$ 最大最小特征值有界（回忆特征值与实/复数域无关）
			* 能写出相应 $\bar r,\bar R$ 即可；原文收敛速率只要求其存在，与具体大小无关
* `1508.01821` 有限维全纯参数化椭圆方程解流形 Kolmogorov n-width 次指数收敛
	* "Analysis of quasi-optimal polynomial approximations for parameterized PDEs with deterministic and stochastic coefficients"
		> created on 2022-03-06
	* sec2 假设1 $a(z)$ 在 $z\in[-1,1]^N$ 一致椭圆（不妨取下界 1）
		* 假设 2 在 $z\in\mathbb{C}^N$ 上为 $L^\infty(D)$-取值的全纯函数
		> 需确认哪里用到全复空间全纯，而不是只在一个区域上全纯？搜了 holomorphic 没看到；
		> 若方程定义域被参数化，变换到标准域的 Jacobian $J_z$ 似乎不好延拓到全复空间；另外还要确认 $a$ 变为矩阵是否成立
		* def1 在 $\rho$-圆盘上一致椭圆条件 $\mathrm{DUE}(\delta,\rho)$；另有椭圆版本 $\mathrm{EUE}$
	* p11 thm1 若满足假设，则 $u(z)$ 在 $\rho$-圆盘上（其实可延拓到邻域）全纯
	* p12 prop1 用 $\rho$ 给出 $\|t_\nu\|$ 估计
	* 对抽象的形如 $\exp(-b(\nu))$ 项求和估计：
		* p16 假设 3，对 $b(\nu)$ 的要求
		* p19 thm2 此时去掉最大 $M$ 项求和次指数收敛
	* p22 prop3 $d_M\le CM\exp(-cM^{1/N})$ 对充分大 $M$ 成立（原文有更具体表达式）
	* Legendre 多项式展开相比 Taylor 展开的优越性（细节略）
	* （评）有限维参化时 $\delta_n$ 已经可到 0 了（至少可见 `DL-ROM-2103.06183` thm4），本文结果对非线性逼近估计意义不大？
* `1911.06598` 人工设计定义域形变以减小 Kolmogorov n-width
	* "Overcoming slowly decaying Kolmogorov n-width by transport maps: application to model order reduction of fluid dynamics and fluid–structure interaction problems"
		> created on 2022-03-24
	* （我的记号）$d_n(\{u^\eta\})$ 衰减慢，针对特定问题人工设计区域变换 $F^\eta:D\to D$ 使 $d_n(\{u^\eta\circ F^\eta\})$ 衰减快
	* 例子：
		* 圆柱扰流，圆柱周围画半径 7 倍区域，内外分别 POD 表达，外部无需区域形变，内部考虑旋转变换，并自适应选取随时间变化的角度
		* 流固耦合（顺着水流漂的碎片）：场峰值平移到管道中间位置；考虑到不是周期边界，实际上是做的管道水平形变
* `Cagniart19MOR4convect` POD 定义域形变以提高表达力，形变被参化、最优参数自动学出
	* "Model Order Reduction for Problems with Large Convection Effects"
		> created on 2022-04-10, cited by `1911.06598`
	* 解 $u(x,t;\mu)$，形变 $F$ 由 $\gamma$ 参化（形式人工选取），针对 $(t,\mu)$ 学出最优 $\gamma$
	* 最终 $u$ 参化涉及线性参数 $\alpha$、非线性 $\gamma$：$u\approx\sum\alpha_i\phi_i\circ F_\gamma$
	* alg3 时间推进时算 $(n+1)\delta t$ 处的 $\alpha,\gamma$：解优化问题，目标函数为显式 Euler 格式预测结果（未来工作拓展到隐式等），交替优化 $\alpha,\gamma$
	* sec3 Burgers 方程例子：
		* $F_\gamma$ 为平移算子，参数一维
		* fig1 原始解族（固定初值 $\mu$ 只变 $t$），fig2 形变（calibrated）解族，复杂度降低
		> (?) 怎么选的 $\phi_i$？
		* fig3 解族数据上（offline）POD 特征值衰减速率，形变后明显加快
		* fig5 形变后取基底数 3 即精确拟合，未形变 10 基底也不行
		* online...
	* （评）取 $z=(\alpha,\mu)$ 则该参化为 AD 特例，不知道有没有对 width 的相关分析
* `EvansPDE2ndOrd` Evans PDE 教材 ch7.1,2 二阶抛物、双曲方程部分
	* 方程形式：$L=-D_ia^{ij}D_j+b^iD_i+c$，$a,b,c$ 依赖于 $x,t$，区域 $D$（原文记号 $U$）上 (D) BC
		* 源项 $f\in L^2$，初值 $g$（抛物），$g,h$（双曲），$a$ 一致椭圆
		* （我的记号）时间区间 $I=[0,T]$，$H=H_0^1$
	* ch7.1 抛物方程 $u_t+Lu=f$
		* 先考虑弱解，存在性用 Galerkin FEM 逼近证明（无穷基底截断有限 $m$ 项）{_o3ok69}
			* 基底 $w_k$ 在 $L^2$ 单位正交、在 $H_0^1$ 正交；例如可取 $\Delta$ 各特征函数
		* ch7.1.2 thm1 保留 $m$ 基底时近似解 $u_m$ 存在（由 ODE 可解性显然）
		* thm2 $u_m$ 能量估计，$L^\infty(I,L^2),L^2(I,H_0^1)$ 范数被 $\|f\|,\|g\|$ 控制
			* （评）这里只是近似解 $u_m$ 的结论，但同样适用于真解，无论是用 $u$ 重写一遍证明，还是用 $u_m\to u$
			* 证明，弱解测试函数取为 $u_m$，时间导数处理用 $2\langle u',u\rangle=(\|u\|_2^2)'$
			* 用椭圆算子强制性 eqn(22)；eqn(23) $(\|u\|_2^2)',\|u\|_H^2$ 之和被 $\|u\|_2^2+\|f\|^2$ 控制
			* （评）这里其实可用 $\|f\|_{-1}^2$：由 $\langle f,u\rangle\le\|f\|_{-1}\|u\|_H\le\beta\|f\|_{-1}^2/2+C_\beta\|u\|_H^2$ 代入可得
			* 先只考虑前一项，由 ODE 解估计得 $\|u\|_2^2$ 有界；再对 eqn(23) 时间积分得 $\|u\|_H^2$ 关于 $t$ 积分有界
			* （$u'$ 估计这里略去）
		* thm3 弱解存在性：取子列使 $u_m,u_m'$ 均收敛，测试函数只需考虑有限项 $v_n$ 情形，验证初值
		* ch7.1.3 解正则性（略）
		* 相关：SRS 中位置((o3oj90))
	* ch7.2 双曲方程 $u_{tt}+Lu=f$；与抛物情形主体相同
		* $u_m$ 能量估计，$u\in L^\infty(I,H),u'\in L^\infty(I,L^2),u"\in L^2(I,H^{-1})$ 范数之和被 $f,g,h$ 范数之和控制
			* 证明，此时测试函数取为 $u'$！$\langle Lu,u'\rangle$ 项拆为 $B_1+B_2$，前者转化出 $A[u,u]$ 的时间导数，后者柯西不等式（结合高阶导控制低阶）拆 $\|\nabla u\|^2+\|u'\|^2$
			* 关于 $\|u'\|_2^2+A[u,u]$ 的 ODE 不等式，可给出其上界
			* （关于 $u"$ 的项略去）
		* p410 thm5 解正则性估计，若 $f'\in L^2(D_I)$ 则对 $u"$ 有估计；按 eqn(46) 还能对 $D^2u$ 有估计？
			* （评）椭圆方程课程教材 ch3.3 有讨论用 $\Delta u$ 估计 $D^2u$ 范数
	* （评）抛物方程结果应该可改为 $f\in H^{-1}$；双曲的似乎不行，因为 $\langle f,u'\rangle$ 放缩无法直接给出这一范数？结合解正则性估计是否有可能？
* `Novotny20AITDMbook` （备用）拓扑导数
	* "An Introduction to the Topological Derivative Method" by Antonio André Novotny, Jan Sokolowski
		> created on 2023-01-28； ~/documents/noSync/research/intro2TopDerv.pdf
	* 以下按 PDF 页码；与原文记号对应：$s:\epsilon,y:\hat x$，((n1sk8h))$\gamma_s:\chi_\epsilon$
	* ch1.1 场景：有界区域 $\Omega$ 挖洞，洞由小区域 $\omega$ 缩放 $s$、平移 $y$ 而得，考虑 $s\to 0$
		* 具体地：任取 $y\in\Omega$，考虑的小区域为 $\omega_s(y)=y+s\omega$，要求其闭包包含于 $\Omega$
		* 考虑依赖于区域形状的映射 $\Omega\mapsto\psi(\Omega)$；实现方式为 接收特征函数的泛函
			* 定义特征函数 $\chi=1_\Omega$，$\chi_s=1_{\Omega\setminus\omega_s}$，则可令 $\psi(\Omega)=\psi(\chi)$ 之类（省略了 $y$）
		* eqn(1.2) （希望获得的）拓扑渐近展开：$\psi(\chi(-;s,y))=\psi(\chi)+f(s)T(y)+o(f(s))$
		* p13 eg1.1 $\psi=\int\chi$ 求面积，eg1.2 $\psi=\int\chi g$（$g$ Lipschitz），可求得导数 $f(s)$
			* eg1.3 加权版本，$\gamma_s$ 在洞内 $\gamma$、其余区域 1、区域外 0，$\psi=\int\gamma_sg$
				* （评）原文 $\chi_s$ 记号与原来混淆，我将一直用 eg1.5 的 $\gamma_s$ 记号；{n1sk8h}
			* eg1.4 乘积求导 $\psi=\psi_1\psi_2$，以及商求导
			* eg1.5 参化 ODE 解 $u_s$：$\Omega$ 区间，$(\gamma_su_s')'=0$（弱解）与 BC，有解析解；可求导
		* p21 lem1.2 $\Delta u_s=\gamma_s$ 弱解，满足 $\|u_s-u\|_{H^1}\le Cs^{1+\delta}$
			* $\delta$ 来自 lem1.1
	* ch2 奇异摄动：形状泛函定义为 场能量泛函的最小值（此场为某方程 Ritz 弱解），考察挖洞的影响；原区域 (D) BC，挖洞分 (D/N/R) 三种齐次 BC
		* 具体地：$\psi(\chi)=\min_{u\in H_0^1(\Omega)}J(u;\Omega)$，$J=\int_\Omega\|\nabla u\|^2/2-bu$；极小值点 $u$ 为方程弱解
		* eqn(2.5,6) 挖洞后，$u_s$ 所在空间 $H_0^1(\Omega_s)$ （(D) BC）或不要求内边界为 0（(N) BC）
		* eqn(2.7) 考虑椭圆 PDE，扰动为区域内挖洞，洞边界用齐次 (D/N) BC
		* eqn(2.19) $\psi_s-\psi$ 估计，开头两项分别在 (N,D) BC 下被去掉
		* 齐次 (N) 情形 eqn(2.34) $\psi_s-\psi$ 与 $s^2$ 同阶
			* 推导涉及 eqn(2.21) 取解摄动 ansatz $u_s=u+sw(x/s)+\tilde u_s$；未 check
				* （评）ansatz 定义域应为 $\Omega_s$，挖掉的部分不用管
		* 齐次 (D) 情形 eqn(2.80) 与 $1/\log s$ 同阶，慢于任意幂函数
			* 具体地 $\psi_s=\psi-\pi|u(y)|^2/(\log s+2\pi g(y))+O(s^2)$
			* 推导涉及解摄动 ansatz eqn(2.45)，涉及 Green 函数（未 check）
		* eqn(2.99) 齐次 (R) 情形要求内边界 $\partial_nu+u=0$，eqn(2.102) 与 $s$ 同阶
			* 解摄动 ansatz eqn(2.100) 最简单
		* table2.1 (N,D,R) 三种 BC 结果汇总
	* ch3 正则摄动：扰动 PDE 不再直接改区域，仅调整系数场
		* 原始形状泛函 $\psi(\chi)=\int_\Omega bu$，$u$ 满足 PDE $-\Delta u+u=b$，(D) BC
		* 摄动后形状泛函 $\psi_s=\int\gamma_sbu_s$，PDE $-\nabla\cdot(\alpha_s\nabla u)+\beta_su=\gamma_sb$，弱形式下自动给出洞处的 BC（$\alpha_s,\beta_s$ 定义同 $\gamma_s$）
		* lem3.1 $\|u_s-u\|_{H^1}\le Cs$，稍慢于 lem1.2
		* eqn(3.102) $\psi_s-\psi$ 与 $s^2$ 同阶
			* 推导大意：分别只考虑 $\gamma_s,\beta_s,\alpha_s$，均得类似结果，最后再将所有项加起来
			* 推 $\alpha_s$ 时最复杂，涉及 $u_s$ 摄动的 ansatz eqn(3.54)
	* ch4 domain truncation 方法，大意似为 大区域中有小区域，小区域边界连续变动；涉及区域分解等
	* ch5 拓扑优化，包括弹性模型问题、优化算法、数值实验
* `Haug1986DSASSbook` 讨论到区域形变对解的影响，用 reference domain，区域按速度场形变下考虑解变化速度
	* "Design Sensitivity Analysis of Structural Systems", 1986
		> created at 2022-11-26；在 2022-11-24 Xournal 笔记有部分记录；
		> ~/documents/noSync/research/DSAofStructuralSystems.pdf
	* 主要是 sec3.2；以下按 PDF 页码（总共 394）
		* 与原文记号对应：$t:\tau,u:z,v:\bar z$
	* 区域变换 $T:\Omega\to\Omega_t$，取为常速度场 $T(x)=x+tV(x)$
		* p206 记号 $\dot u=d_tu_t(x+tV(x))$，$u'=d_tu_t(x)$
	* p207 方程形式 $a_{\Omega_t}(u_t,v_t)=l_{\Omega_t}(v_t)$，测试函数 $v_t$
		* 设二次型具有形式 $a(u,v)=\int c(u,v)dx$
	* p208 $J=\partial T/\partial x=I+t\partial V/\partial x$，满足 $d_t|_0\det J=\nabla\cdot V$
		* 后面还讨论了边界 $\Gamma$、法向 $n$ 的时间导数（未看）
	* 求以下量的 $d_t|_0$：p211 $\int_{\Omega_t}f_t$，p212-214 $\int_{\partial\Omega_t}g_t$，p214 $\int_{\partial\Omega_t}h_t\cdot n_t$
	* p217 导出了 $\dot u$ 满足的方程 $a_\Omega(\dot u,v)=\cdots$
* `Sokolowski92ISObook` （备用）形状优化，区域形变对解影响
	* "Introduction to Shape Optimization: Shape Sensitivity Analysis", J. Sokolowski and J. P. Zolesio
* `Bochniak03LinearEB` （备用）形状优化，区域形变对解影响
	* "Linear elliptic boundary value problems in varying domains", Marius Bochniak
	* 推荐了 `Haug1986DSASSbook`，`Sokolowski92ISObook`
* `Daners08DomainPL` （备用）线性、半线性椭圆 PDE 的区域摄动，综述
	* "Domain Perturbation for Linear and Semi-Linear Boundary Value Problems", Daniel Daners
		> created on 2023-01-28
	* 摘要的部分信息：
		* 第二部分：线性椭圆方程的区域扰动，考虑不同 BC
			> 我们完全描述了Dirichlet边界条件的收敛性，并给出了简单的充分条件。
			> 然后，我们证明了具有快速振荡边界的区域上Robin边界条件的边界均匀化结果，其中边界条件在极限中变化。
			> 最后，我们提到了关于Neumann边界条件问题的一些简单结果。
		* 第三部分：非线性椭圆方程，解存在性（包括无界区域）
			> 使用Leray-Schauder度证明了微扰动域上解的存在性。
			> 我们还演示了如何使用近似结果来获得无界域上非线性方程的解。
		> 关键词：椭圆边值问题，区域扰动，半线性方程，先验估计，边界均匀化
	* sec5.2 def $\Omega_n\to\Omega$ in the sense of Moscow: $u_n\in H_0^1(\Omega_n)$ 的极限与 $u\in H_0^1(\Omega)$ 对应，分两个方向
		* ass5.2.1 若 $u_n$ 有弱极限，必在 $H_0^1(\Omega)$ 中
			* （评）极限应是在 $H_0^1(\R^d)$ or $H^1(\R^d)$ 中定义
		* ass5.2.2 任意 $u$ 均可写为 $u_n$ 在 $H^1(\R^d)$ 的极限
			* （评）强极限；若所有区域均有界，似等价于用 $H_0^1(\R^d)$）
		* fig5.1,2 例子，圆盘加上一个无界的条状/锥形区域，令该区域宽度趋于 0，讨论收敛性等
	* 注：原文关注算子的谱，讨论其收敛性等，泛函味道重，未细看
* `Guillaume99DomainPM` 求流体中运动气泡形状，静止解已知，低速情形解靠泰勒渐近展开获得
	* "Domain perturbation method and shape of a bubble in a uniform flow of an inviscid liquid" by O. Séro-Guillaume, M. Er-Riani
		> created on 2023-01-28
	* 摘要：区域未摄动（$\epsilon=0$）解已知，一般情形 $\Omega_\epsilon$ 可在标准域写出方程并求解，本文试图证明这是好方法
		> 该方法的有效范围将在理想流体绕气泡无旋流动的模型实例上进行研究。
		> 将确定级数解的收敛半径，以及第一个实奇点附近解的性质。
	* 流体自由边界问题，$\epsilon$ 无量纲；区域变换 $T(x;\epsilon)$，各场用随体（Lagrange）方式表达
	* 本文物理问题：无重力、不可压、无粘流体中 运动气泡稳态形状
		* 以运动气泡为参考系，从而设无穷远流体速度 $V_\infty$
		* 未知场 $u$ 为气泡导致的势能（sec2.1 还要无量纲化），内部方程 $\Delta u=0$
		* 方程在气泡区域补集定义；此时流速场 $v=V_\infty+\nabla u$，要求无穷远处 $u,\nabla u\to 0$
		* 考虑表面张力 $\sigma$，气泡表面液体压强为 $p=p_0-\sigma C$（$C$ 平均曲率）；结合动量方程（$\rho v^2/2+p$ 取值等于无穷远）得 eqn(2)
			* （评）问题考虑平衡状态，此时 $\sigma$ 似应为常数场
		* eqn(1) 还要求 BC 满足 $\partial_nu=-V_\infty\cdot n$，不知其物理背景
	* （评）未知量包括场 $u$、区域形状 $\Omega$；从而需要两个 BC 才可解
		* 似乎 eqn(4) 常数场 $k=R(p_\infty-p_0)/\sigma$ 也是未知量；原则上 $p_0,\sigma$ 均未知，不过这里无需分开考虑
	* sec2.1 无量纲化后方程，$\epsilon=R\rho V_\infty^2/\sigma$ 为 Weber number
		* sec1 $V_\infty=0$ 对应无穷远无流动，此时平衡状态气泡为球形；结合对称性知 $\epsilon$ 定义合理
	* 球极坐标下表达区域变换 $T=rg(\psi,\theta;\epsilon)e_r$
		* 气泡表面方程为 $r=Rg(\psi,\theta)$
		* 要求：参考状态下 $g(-,-;0)=1$；eqn(5) 变换体积守恒
		* eqn(6-1) 变换至标准域后方程形式，eqn(6,7,8) 用 $g$ 表示
	* sec2.3 区域变换 $g$、标量 $k$、场 $u$ 均按 $\epsilon$ Taylor 展开，可迭代求解（同一般摄动问题）
* `Savare02DomainPE` 区域变化对椭圆方程解影响，解零延拓后直接求距离，证明其被二区域距离控制
	* "Domain perturbations and estimates for the solutions of second order elliptic equations" 
		* Giuseppe Savaré, Giulio Schimperna
		> created on 2023-06-29
	* p2:-1 之前工作在讨论 $\Omega_n\to\Omega$ 时解 $u_n\to u$ 的行为；本文试图得到显式、定量 $u_n-u$ 误差分析，在 $\Omega_n,\Omega$ 足够接近的前提下
	* p16 thm2 误差用 $e(\Omega_1,\Omega_2)+e(\Omega_2,\Omega_1)$ 控制
		* eqn(1.10) 定义 $e(D_1,D_2)=\sup_{x\in D_1}d(x,D_2)$
* `arXiv1205.2027` 区域变化对椭圆方程解影响，解零延拓后直接求距离，证明其被二区域对称差的测度控制
	* "Stability estimates in H01 for solutions of elliptic equations in varying domains"
		* José M. Arrieta, Gerassimos Barbatis
		> created on 2023-06-29
	* 椭圆方程 $Lu=f$，$L,f$ 在区域 $\Omega\cup\Omega_2$ 定义，解 $u,u_2$ 零延拓后可比较
	* 设二区域均在某特定类 $C_M^{0,1}(V,R)$ 中，$\|f\|_q\le M$，$q>2$
	* p8:-1 thm4 $\|u-u_2\|_{H_0^1}\le c|\Omega\triangle\Omega_2|^{(q-2)/2q}$，$c$ 只依赖于 $M$
		* 证明大意：由引文，可构造变换 $\Omega_2=\phi(\Omega)$ 使大部分点为不动点，$\phi,\phi^{-1}$ 均 $M$-Lipschitz
		* 之后用本文 thm2，解变换被 $\phi$ 下动点集合的测度控制

