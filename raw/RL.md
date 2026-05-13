> 2022-02-04 从 `freeNotes.md` 独立出来
## 观点
* （旧）(mine) 将人类的科研解读为探索自然界 transition rule 的过程，产生的结构因果模型等描述是否可用于建立某些 model-based RL 算法的 $p$ 描述
* （2021-09-17 CSI讨论，导师）action 较少的时候适合用 Q-learning，例如 Atari（仅上下左右ab），求极小很快；较多的时候，例如连续空间或者有随机性，policy gradient 更合适；{_n77k6l}
	* SyQi：MFG FBSDE 中的 $Z_t$ 项来自随机性，Ito 公式比普通求导多出来的项：$X$ 空间变量，$Y=\nabla_xg$ 对偶变量一阶导，随机情形额外引入 $Z=\nabla^2_xg$ 二阶导
	* SyQi：据说用 Stratonovich 积分写（与 Ito 等价）形式上更简单，不是很确定
* 揭秘深度强化学习的研究哲学:乐观主义与悲观主义
	* [2023-03-10 修订](https://mp.weixin.qq.com/s?__biz=MzU5ODg0MTAwMw==&mid=2247500951&idx=1&sn=378c4c5dc6cb2a456c31e000139d7c47) 
	* 离线学习数据不完整，只有最优路径附近的数据，而次优路径附近数据不足，因此需要“悲观主义”，对结果不确定性大（由于样本过少）的策略降低权重；
	* 在线学习则需要探索-利用平衡，对结果不确定性大的策略增加权重以更多采样
* [基于RL控制vs基于DRL决策](https://www.zhihu.com/question/304507185/answer/1663026861)
	* 前者本质上还是最优控制框架，只是用 RL 可以学习不确定的参数以及未知的互相关项，非线性项之类的。
		* 好处是在满足一定数学假设下，策略一般是可数学证明收敛的
		* 坏处：为了收敛证明，适用的范围很小；不能直接处理传感器数据，所以不是端到端的
	* DRL 问题：无严格证明，不保证可靠；鲁棒性差
		* 适用范围广但迁移能力差，要重训（而基于控制理论的微调即可）
* [NLP定理证明器](https://openai.com/blog/formal-math/)
	* OpenAI 的工作；[智源社区介绍文章](https://hub.baai.ac.cn/views/14548)
	* 结合了 Lean（函数式编程语言，官网说可用于交互式定理证明），似乎可形式化陈述和验证定理证明
		* 链接里有几个高中奥数题目与证明，包括形式化（用于机器生成和验证）、非形式化（人话）的版本
	* 每次找到一个新的证明，就把它作为新的训练数据，使它能够迭代地找到越来越难的题目的解。
		> 人也会从自己之前的成功案例中学习，不是只学别人的
	* 形式数学的两个主要挑战（相较传统 RL）：
		* 无限的动作空间（围棋只是搜索空间大，动作空间有限），需生成数学语句，例如“存在 x 使”，或者切分命题、引入引理以及引理序列
			* 解决方式：从语言模型中采样动作
		* 缺少 self-play，面对一个过难的命题时，没有显然的方式可以将其拆分为易解决的小问题。双人游戏中成功的 self-play 算法无法应用
			* 解决方式：先用一组不同难度的（辅助）问题训练，curriculum learning 以至能用于我们关心的那些问题
* DeepMind和OpenAI身后的两大RL流派的具体区别 - 知乎
	* [2023-03-10](https://www.zhihu.com/question/316626294/answer/627373838)
	* DeepMind 忠于 value-based，OpenAI 忠于 policy-based
	* 影响来源 1：主脑人物学派；{_n3ag6t}
		* 前者 David Silver 为 Sutton 的博士
		> OpenAI背后的派别是Berkeley帮，主要工作是围绕Pieter Abbeel以及他的两位superstar博士生Sergey Levine和John Schulman。
		* 评论区有人反对这个区分：Sutton 其实主张结合二者，如（其博士论文）actor-critic，且在上课时解释自己的书中忽视 policy-gradient 主要因为它当时研究 value 路线较多、且作为引入未涉及过多 SOTA 方法；{_n3ak0z}
	> policy-based RL以及衍生出的model-based RL比value-based RL效率高一个量级，
		> 以PPO为核心的Policy-based RL方法目前处于绝对领先位置，有着广泛的群众基础。
		> DeepMind着眼的那些AI明珠问题不是我等群众老百姓可以企及的，坐等吃瓜就好。
	* 影响来源 2：应用场景，游戏（仿真便宜）、机器人（机械臂昂贵、易坏），后者对 sample-efficiency 要求高许多；{_n3ag69}
		> 这跟Abbeel和Sergey的机器人背景关系非常大。在机器人的应用中，sample-efficiency非常重要。
		> 不像DeepMind随便就可以跑million级别数量的游戏仿真，{_n3ag6n}
		> 机械手臂这玩意其实是非常容易坏的，而且价格不菲，在构建RL算法的时候不得不从sample efficiency角度出发，
		* MAML 也是这方面的动机
		* 评论区有人认为 value-based 为全面学习、policy-based 则偏投机，故前者能力强、后者学习快；{_n3ak15}
			* 用的类比是 NN 模拟流体，前者要求 NN 结构遵循流体基本规律、后者对此无视
			* 另一类比：全真派武功、白驼山武功；另一人建议按气宗剑宗类比
			> 我的理解，value based的逻辑性更强，可以认为的确对物理系统进行了较可靠的建模然后在此基础上寻找策略，而policy based的底层建模可能就不需要，更唯象一点。
		> （评论区另一人）policy based 收敛一般比value based 快，毕竟policy稳定的时候value 不一定稳定，但value 稳定 policy必然稳定。{_n3ak1j}
	* 影响来源 3：公司定位，分别关注 AI 明珠问题、机器人等具体应用
		> DeepMind着眼于Go和Starcraft这样的AI明珠问题，可能确实Value-based RL+search的办法更work。{_n3ag6j}
		> OpenAI强调Open，大众普及RL，着眼于一些机器人应用和相对小规模的RL问题，Policy-based RL以其优秀的效率和稳定性更胜一筹。

## 知识
* 相关材料：
	* RLChina 目前只看了一部分，见下方
	* [以后给人推荐可用这个](https://zhuanlan.zhihu.com/p/111869532)；所属专栏有介绍 AlphaZero MCTS 的文章
	* [MARL-伦敦大学课程视频](https://app6ca5octe2206.pc.xiaoe-tech.com/detail/p_603db816e4b0a77c389892d3/6)
	* [一个中文社区：深度强化学习实验室](http://deeprl.neurondance.com/)
	* MFG (mean field game) 相关可见 2021 暑校笔记的大纲
		* slides8-p13/22 提供了作为汇总的 [RL Taxonomy](https://spinningup.openai.com/en/latest/spinningup/rl_intro2.html)；p14 DQN, p15 DDPG 算法
		* 2021-09-10 zjx在与CSI的会议上提到，有工作指出 MFG、MFC 最优 loss 之间的差距可解读为某 OT 优化问题 primal-dual 下 KKT 条件的 duality gap？
	* 带约束 MDP 求解见 `MuZero-RC-2202.06626` 列出的引文
	* AlphaZero `2022-07-09`(lectures)，涉及 MBRL 策略的递归
* [RLChina夏令营slides+视频](http://rlchina.org/) （已下载 slides）
	* [GitHub上的文件](https://github.com/redLinmumu/RLChina2021-)
	* lect5 RL 入门
		* p25 $\mathbb{E}_\pi$ 为 RL 中简写，其实表示乘 $\sum_t\gamma^t\mathbb{E}p(s_t=s,a_t=a)$ 积分
			> 不是真正的期望，$\mathbb{E}_\pi 1\ne 1$！也可定义为 $\mathbb{E}_\pi[f]=\mathbb{E}\sum_t\gamma^tf(s_t,a_t)$，例如 $f(s,a)=r(s,a)$ 为 reward
		* 传统算法（有限动作状态）$S$ 小适合策略迭代，否则适合价值迭代；“若无状态转移循环最好用价值迭代”
		* MDP 基于模型，有转移概率和 reward 函数表达式
		* 模型无关的 RL 方法没有 $p,R$，只能依据历史轨迹决策
		* MC 估计 $V^\pi$：给定 $\pi$ 下采样多条轨迹，用各轨道累计奖励 $G$（$=-J$）的平均作为估计
		* TD（时序差分学习）则先取定一个 $V^\pi$ 的初值、以学习率 $\alpha$ 不断更新
			* 观测到单次转移时 $V(s_t)\leftarrow V(s_t)+\alpha(R_t+\gamma V(s_{t+1})-V(s_t))$
			* 上式中 $V(s_{t+1})$ 为旧的预测值；$s\ne s_t$ 处 $V$ 取值不更新
		* MC,TD 比较 p49-53：
			* MC 只能离线学习，所有轨道要有限时间终止；TD 可在线学习
			> 我觉得 MC 学出的是 $V^\pi(s,t=0)$，而 TD 的环境为自治系统不含 $t$
			* MC 高方差、无偏差；TD 低方差、有偏差且对初值敏感
			* 使用函数近似 $V$ 时，MC 保证收敛到真值，TD 不保证（> 要学习率退火？）
		* 无模型时未知 $p$，即使有 $V$ 也无法给出最优策略，学 $Q$ 更合适
		* SARSA（> 用类似 TD 的方法学 $Q$），需 $\epsilon$-greedy 改进（> 针对在线学习？）
			* 命名其实就是 $s,a,r,s,a$
		* 离线策略学习：目标策略 $\pi(a|s)$ 不同于用于收集数据的行为策略 $\mu(a|s)$，后者探索开采平衡
			* 使用原因 p67；更新 $Q(s_t,a_t)$ 时涉及的 $a_t\sim\mu$，下一步预估 $a_{t+1}'\sim\pi$
			* $\pi$：贪心策略；$\mu$：$\epsilon$-贪心策略或其他
			* p70 thm: 控制收敛 $Q\to Q^*$（最优状态-动作对应的 $Q$）
			* p72 收敛错误的例子（SARSA 成功），选择的不是最短路径，而是容忍一定探索乱走的安全路径
		* 学策略 $\pi$ 而非值函数 $Q$ 的方法
			* p87 收敛性更好、高维或连续动作空间有效（无需取 max）、能学随机策略
			* 但通常会收敛到局部最优；策略评估通常不高效，方差大
		* p91 策略梯度定理 $\partial J/\partial\theta=\mathbb{E}_\pi[\partial\log\pi_\theta(a|s)/\partial\theta\cdot Q^\pi(s,a)]$
			* REINFORCE 算法用累积 reward $G$ 作为 $Q^\pi(s,a)$ 无偏采样；问题：任务需有终止状态，采样的值函数 $G$ 方差大（主要）
		* actor-critic：额外训练网络估计 $Q^\pi(s,a)$ 而不用每次的采样来分别估计，从而降低方差
			> 可理解为分离两种随机性，对二者分别估计均值？
			* 思想：评论家学会准确估计演员动作的艺术性评分，演员选择动作只需使评论家满意即可
			* A2C 进一步降低方差：用 $A^\pi(s,a)=Q^\pi(s,a)-V^\pi(s)$ 以提高好动作出现概率
			* （信源知乎）reward 稀疏时尤其需要用 $Q$ 估计值，例如围棋（下完一盘才有 reward）
* [策略梯度推导](https://zhuanlan.zhihu.com/p/75174892)
	* 对轨迹 $\tau=(s_1,a_1,s_2,\dots,s_T,a_T)$，$J=\mathbb{E}_\tau R(\tau)$，$R(\tau)=\sum_t\gamma^tr_t$
	* $\nabla_\theta J=\mathbb{E}_\tau R(\tau)\nabla_\theta\log p_\theta(\tau)$
		> 注意 $p(\tau)$ 非退化要求 $\pi(a|s),p(s'|s,a)$ 都非退化；$\pi$ 退化情形不能用这个式子，见 `DPG`“也可推导”
	* $\log p_\theta(\tau)=\log p(s_1)+\sum_t\log\pi_\theta(a_t|s_t)+\log p(s_{t+1}|s_t,a_t)$
	* $\nabla\log p_\theta(\tau)=\sum_t\nabla_\theta\log\pi_\theta(a_t|s_t)$，其他项不依赖于 $\theta$
	* > (mine) 代入 $R(\tau)$ 表达式后推导 $\mathbb{E}_\pi Q^\pi(s,a)\nabla_\theta\log\pi_\theta(s_t|a_t)$ 形式：
		* 利用 $t'<t$ 时 $\mathbb{E}_\tau r_{t'}\nabla_\theta\log\pi_\theta(s_t|a_t)=0$
			* 推导不难，利用积分号与 $\nabla_\theta$ 可交换，常数梯度为 0
		* 再利用 $\mathbb{E}_\pi[f]=\mathbb{E}_\tau[\sum_t\gamma^tf(s_t,a_t)]$（定义）即得
	* > (mine) 仿照 `DPG` 也可推导
		* $\nabla_\theta V^\pi(s)=\mathbb{E}_a[Q^\pi(s,a)\nabla_\theta\log\pi(a|s)]+\mathbb{E}_a\nabla_\theta Q^\pi(s,a)$
		* $\mathbb{E}_a\nabla_\theta Q^\pi(s,a)=\mathbb{E}_{s'}\nabla_\theta V(s')$ 反复代入即得
* 策略梯度的等价形式：$\nabla_\theta J=\mathbb{E}_{\pi_\theta}[?\nabla_\theta\log\pi_\theta(s,a)]$
	> from David Siver slides: lec7 policy gradient
	* REINFORCE $?=v_t$，Q actor-critic $?=Q^w(s,a)$，advantage actor-critic $?=A^{wv}(s,a)$
	* TD actor-critic $?=\delta$
		* $V_v\approx V^\pi$，$\delta=r+\gamma V(s')-V(s)$
		* $\text{TD}(\lambda)$：$\Delta\theta=\alpha\delta e$，$e\leftarrow\lambda e+\nabla_\theta\log\pi(s,a)$
		* 原文写 $\text{TD}(\lambda)$ actor-critic $?=\delta e$ 感觉不对
	* natural actor-critic (?) $G_\theta^{-1}\nabla_\theta J=w$，其中 $G_\theta=\mathbb{E}_\pi[\nabla_\theta\log\pi\nabla_\theta\log\pi^\mathrm{T}]$
* `DPG` 确定性策略下推导策略梯度（需要动作空间连续）
	* "Deterministic Policy Gradient Algorithms"
		* appendix 在 PMLR 网站能下（ICML2014 官网有指路）
		> created on 2022-02-03
	* 连续动作空间，确定性策略 $a=\mu_\theta(s)$，求 $\nabla_\theta J$
		* 确定性策略少了对 $a$ 的采样，更高效
	* thm1 $\nabla_\theta J=\mathbb{E}_\mu\nabla_\theta\mu\nabla_aQ(s,\mu(s))$（仍是 improper 分布）
	* secB 推导
		> $r(s,a,s')$ 即可，无需像原文假设它不依赖于 $s'$
		* $\nabla_\theta V^\mu(s)=\nabla_\theta Q^\mu(s,\mu(s))$
		* $=\nabla_\theta\mu(s)\nabla_aQ^\mu(s,\mu(s))+\nabla_\theta Q^{\mu_\theta}(s,a)|_{a=\mu(s)}$
		* $\nabla_\theta Q^{\mu_\theta}(s,a)=\int p(s'|s,a)\nabla_\theta V^\mu(s')ds$（注意 $a$ 取定，$r(s,a,s')$ 与 $\mu$ 无关）
		* 不断将 $\nabla_\theta V^\mu(s')$ 进行代换，结合 $J=\mathbb{E}_{s_1}V^\mu(s_1)$ 可得最终结果
		> 对 $p(s'|s,a)$ 为单点分布的情形似乎也成立，从而可用于连续动作空间、确定性动力系统的动态规划
	* > (mine) 仿照 `[策略梯度推导]` {也可推导}（需要 $p(s'|s,a)$ 非退化）
		* 由于 $p(\tau)$ 退化（$(s_t,a_t)$ 联合分布退化），改考虑 $\sigma=(s_1,s_2,\dots,)$
		* $R(\sigma)$ 依赖于 $\theta$（$r(s,a,s')$ 依赖于 $a$）
		* $\nabla_\theta J=\mathbb{E}_\sigma[\nabla_\theta R_\theta(\sigma)+R(\sigma)\nabla_\theta\log p_\theta(\sigma)]$
		* $\nabla_\theta\log p_\theta(\sigma)=\sum_t\nabla_\theta\log p(s_{t+1}|s_t,\mu(s_t))$
		* $\mathbb{E}_\sigma[R(\sigma)\nabla_\theta\log p(s_{t+1}|s_t,\mu(s_t))]=\gamma^t\mathbb{E}_{s'}(r(s,a,s')+\gamma V^\mu(s'))\nabla_\theta\log p(s'|s,a)$
			* 这里 $s=s_t,a=\mu_\theta(s_t),s'=s_{t+1}$；用到 $t'<t$ 的项无贡献
		* $\nabla_\theta R(\sigma)=\sum_t\gamma^t\nabla_\theta r(s_t,\mu_\theta(s_t),s_{t+1})$
		* $Q^\mu(s,a)=\mathbb{E}_{s'}[r(s,a,s')+\gamma V^\mu(s')]$
		* $\nabla_aQ^\mu(s,a)=\mathbb{E}_{s'}[\nabla_ar(s,a,s')+(r(s,a,s')+\gamma V^\mu(s'))\nabla_a\log p(s'|s,a)]$ 比较即证
	* thm2 确定性策略为随机策略 $\pi_\theta(a|s)$ 的极限（方差趋于 0）
	* sec4.1 on-policy deterministic actor-critic，近似网络 $Q^w\approx Q^\mu$，同时更新 $w$（用 TD）和 $\theta$
	* sec4.2 off-policy deterministic actor-critic，轨迹由随机策略 $\pi$ 生成
		* $\nabla_\theta J\approx\mathbb{E}_\pi[\nabla_\theta\mu(s)\nabla_aQ^\mu(s,\mu(s))]$
		* 注意上面扔掉了 $\nabla_\theta Q^{\mu_\theta}(s,a)$ 项；可证明仍为下降方向
		* 随机的 off-policy actor-critic 算法需要对 actor, critic 都重要性采样；这里不涉及动作空间积分故无 actor 重要性采样，用 Q-learning 避免对 critic 重要性采样
	* sec4.3 需设计特殊 $Q^w$ 形式才能保证用 $\nabla_aQ^w$ 代替 $\nabla_aQ^\mu$ 计算结果正确
		* 一种可能性是 $A^w(s,a)=w^\mathrm{T}\nabla_\theta\mu(s)(a-\mu(s))$，$V^v(s)$ 可为任意函数
* [DQN,DDQN,DDPG](https://zhuanlan.zhihu.com/p/362076700)
	* 经验池 存在的意义是为了消除experience的相关性
		* 因为强化学习中前后动作通常是强相关的，而将它们打散，放入经验池中，
		* 然后在训练神经网络时，随机地从经验池中选出一批experience，这样能够使神经网络训练地更好。 
	* DQN 适合动作空间离散的任务；区分 $Q,Q^t$（后者叫 target Q 网络；前者有时叫当前网络或 Q-eval）
		* 目标策略 $\pi(s)=\arg\max_aQ^t(s,a)$，行为策略 $\mu(s)$：$\epsilon$-贪婪 $\arg\max Q(s,a)$
		* 更新 $Q$ 的 loss $(Q(s,a)-r(s,a,s')-\gamma Q^t(s',a'))^2$
			* 其中：给定 $s$，$a=\mu(s)$，$a'=\pi(s')$，
		* 一段时间后将 $Q$ 参数硬拷贝给 $Q^t$（延缓更新 $Q^t$ 可提升训练稳定性）
		* 实践中是采样一堆 $(s,a,s',r)$ 放入经验池，之后从中取出 batch 批量进行 BP（此时才批量算 $a'$）
	* DDQN (double DQN) 解决高估 $Q(s,a)$ 的问题：DQN 中改取 $\pi(s)=\arg\max Q(s,a)$，其他相同
		* 即：$a'$ 根据 $Q$ 产生，但要放入 $Q^t$ 中求值
	* DDPG：相较 DPG 区分 $\mu,\mu^t,Q,Q^t$ 网络
		* 经验池 $(s,a,s',r)$：行为策略 $a=\mu(s)+n$，$n$ 噪声；目标策略 $a'=\mu^t(s')$
		* actor 更新：以 $-Q(s,\mu(s))$ 为 loss 对 $\mu$ 梯度下降
		> 这里其实就是 $\nabla_\theta\mu_\theta(s)\nabla_aQ^\mu(s,\mu_\theta(s))$，NN 反传不涉及 $\nabla_\theta Q^{\mu_\theta}(s,a)$
		* critic 更新 loss：$(Q(s,a)-r-\gamma Q^t(s',\mu^t(s')))^2$
		* actor $\mu$ 每步在经验池中更新，一段时间后参数软拷贝入 $\mu^t$；软拷贝指和原有参数线性组合
		* critic 与 actor 同理
* [TD3](https://zhuanlan.zhihu.com/p/111334500) Twin Delayed DDPG
	* [参考2](https://zhuanlan.zhihu.com/p/128477488)
	* 1. 相较 DDPG 网络有 $\mu,\mu^t,Q_i,Q_i^t$，$i=1,2$（共 6 个），额外网络进一步防止高估 $Q$
		* $Q$ 高估原因：用 $\arg\max Q(s,a)$ 代替 $V(s)$，每一步都这么做会出问题
		* 不同 $i$ 对应的网络独立随机参数化，同一点取值有大有小，取小的那个估计，从而缓解问题
	* critic $i$ loss：$(Q_i(s,a)-r-\gamma\min_jQ_j^t(s',a'))^2$
	* 2. target policy smoothing regularization: $a'=\mu^t(s')+n$，$n\sim N(0,\sigma)$ 且 clip 到 $(-c,c)$，进一步 clip $a'$ 在预设的最小最大之间
		* 局部光滑化，长时间来看是用局部平均代替单点 $Q_j^t(s,a)$ 取值
		* 噪音含义与行为策略内的噪声不同，此处未修改目标策略，噪声仅用于估计
	* actor 用 $Q_1,Q_2$ 构造 loss 都没问题，长时间后 $Q_1,Q_2$ 差不多
		* 也可直接取 $Q_j$，$j$ 依据 $\min_jQ_j^t(s',a')$ 选取
	* 3. delayed: critic 更新频率高于 actor，以为 actor 提供正确的梯度方向
		* 据说原文建议更新 2 步 critic 接一步 actor
* [分布式A3C,DPPO](https://zhuanlan.zhihu.com/p/111336330)，基本是工程考量
	* [DPPO](https://zhuanlan.zhihu.com/p/111346592)
	* 学习数据需求大，需与环境交互获得，故采用多智能体与环境互动
	* A3C 相较 actor-critic，网络分 global net 和 worker，仅 worker 与环境互动，并将梯度汇总给 global net 更新参数，然后复制 global net 更新后的参数继续与环境交互
	* PPO 解决了离线数据更新的问题，DPPO worker 只需将数据提供给 global net 统一学
		* recall [PPO](https://zhuanlan.zhihu.com/p/111049450) 用重要性采样，从而 actor-critic 可以 off-policy
	* 实现涉及 Python 多线程、线程间通信
* [MARL-reivew](https://link.springer.com/content/pdf/10.1007/s10462-021-09996-w.pdf) 可能有用；MARL 指 multi-agent RL
	* "Multi-agent deep reinforcement learning: a survey"
	* 相关：（备用）2204.09418 MBRL 用于 MARL，`DMPO-2207.06559` 也是
* RL 模型约简相关（state abstraction etc)
	* [MDP state abstraction](https://zhuanlan.zhihu.com/p/68364144) 里的 bisimulation
		* 定义 bisimulation relation：$S$ 上的等价关系，使得商掉之后 reward 和转移概率良定义
		* def bisimulation metric（定义使用不动点，似乎涉及 Wasserstein 距离）
	* [abstraction 不同严格程度的定义](https://zhuanlan.zhihu.com/p/65791924)：exact 版本，能表达最优策略-表达 $Q$ 函数-表达 reward 的要求逐渐严格；bisimulation 存在唯一最优的定理；approximate 版本的相应 3 种定义
* [HRLsurvey](https://zhuanlan.zhihu.com/p/267524544)（甚至包括了去中心化的做法）
	> 这只是文章列表，不算综述；
	* > (mine) HRL 相关：
		* 更生活化的想法在 `分层建模、优化%`，可互见
		* `[model-basedRL综述2006.16712]` 涉及状态空间、时间的抽象，且有对 option/GCVF 方法的比较；IMGEP 建立由目标组成的空间并从中采样
			* sec5.4 迁移学习三类型：动力学模型，技能或子程序，“知识”如 shaping rewards 与 representation；提到 agent space, problem space
		* `2022-03-02`(dbGrpMeet2) 讨论的 HRL 基于 option 子目标、子策略
		* `[Nature综述：整合的层级化强化学习]`
* [Nature综述：整合的层级化强化学习](https://mp.weixin.qq.com/s/twK_0Mc2JwvPFPTewGauSQ)
	* 回顾了认知心理学的文献，强调组合式抽象（compositional abstraction）和预测处理（predictive processing）的重要性
		> 后者似指 MBRL？
	* 发现所识别的所有认知机制，都已经在不同的计算架构中分别实施过了
	* 本文试图解答为何仍无统一架构将它们集成：提供新的综合视角，说明此统一需要解决的计算挑战
	* 认知科学中组合性可以改善迁移学习，概念整合等；RL 组合式的表征有效，用自然语言这种内在组合表征描述 HRL 高层级动作
	* 惊讶度通常被建模为前向预测误差的一个函数，好奇心对此发现提供 reward
	* HRL 的一个核心问题，是只有在低层的学习过程已收敛之后，高层的表征才会出现
		* 对体验的回顾式分析可缓解，后见学习
* [AutoRL综述-2201.03916](https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247559560&idx=2&sn=f23c97a454937e948f722714c0e6c9f9)
	* 方法分类：随机/网格搜索驱动，贝叶斯优化 BO，演化算法，元梯度（类似 MAML，在线调优），黑盒在线调优，环境设计；混合方法
	* 环境设计是强化学习智能体自动学习的重要组成部分。从课程学习到合成环境学习和生成，到将课程学习与环境生成相结合，这里的目标是加快机器学习智能体通过环境设计的学习速度
* [IRL简介](https://zhuanlan.zhihu.com/p/317846683)
	* 模仿学习的分支，给定专家决策序列试图模仿；不满足于简单模仿，IRL 试图从中恢复出效用函数 $r_\psi(s,a)$ 形式，再据此正向 RL 选取策略
	> 除了用于优化，还可用于对社会决策主体建模，根据行为数据反推人的效用函数；TODO 链接至 模拟+数据的社会范式，RL 建模的效用函数定义问题（帮助人想清楚自己的效用）
	* max entropy IRL 工作用极大（对数）似然推理：轨迹 $\tau$ 出现几率 $p_\psi(\tau)\propto\exp(R_\psi(\tau))$，求 $\max_\psi\sum_\tau\log p(\tau)$；有梯度计算推导
	* 这些似乎假设了 $p(s'|s,a)$ 已知；若不然，Guided Cost Learning 先用无模型 RL 学当前 reward 下最优策略，再用此策略生成样本来无偏估计 reward
	* 之前可先 GAIL，用 GAN 模拟专家的策略 $\pi_\theta(s)$（可之后生成更多数据再用于反推效用？）
* [model-basedRL综述2006.16712](https://zhuanlan.zhihu.com/p/412466742)
	> 直接看原文的笔记见 `MBRLreview-2006.16712`，示意图（包括本文选用的）很不错
	* 模型+决策两部分，若无已知模型要自己学
		> 相关：似乎有机器人训练是先据有限数据学出环境模型（从物理先验微调得到，也许是学出应怎么加随机性），但是学出后是直接按照无模型训的，决策器内部没有引入模型
	* 模型可行域，部分模型只在局部状态下有效，类似局部线性化
	* 建模时体现随机性，高维不好用高斯分布或高斯混合模型，可用生成模型，包括 variational inference, GAN
	* （原文）不确定性（指观测不足的结果）
	* 部分可观测性，需结合历史观测
		* windowing，$s_t=[o_{t-n},\dots,o_t]$
			> 也许可解读为：通过时间 stack 升维后成为无记忆的动力系统，类似 ((n35e96))paramDynConserv
		* belief states 建模 $p(s|o)$ 和 $p(s'|s,a)$
			> 为何不是 $p(o|s)$ 贝叶斯推断 $s$，像 2021春组会我讲的直观物理学 工作2 那样？
		* RNN
		* 引入 external memory 来表征 $s_t$
	* （原文）非平稳性，即 MDP $p(s'|s,a),r(s,a,s')$ 随时间改变
		* 部分模型方法，维护固定模型的集合，agent 检测状态切换并调整所用模型；有模型软组合、高学习率
		* 迁移学习、元学习
	* 多步预测误差问题：loss 体现多步误差，或者 time-bundling
	* 状态表征（状态抽象），用于 sim2real（模拟数据训练后用于有区别但表征相似的实际数据，例如自动驾驶模拟时看到的图片），以及探索问题（> ？）
		* AE 将 $s$ 编码为 $z$ 并学 $z'=f(z,a)$
	* 使状态表征允许隐空间规划：
		* 确保隐空间的一致性：额外损失惩罚 $z_{t+1}-E(s_{t+1})$，或“深度的状态空间模型（deep state-space methods）如deep Kalman Filters, deep variational Bayes filters”
		* 学习线性隐式传递函数以简化 planning（> 即 Koopman？）需添加损失函数以确保隐空间动力学线性性
		* grey-box system identification 相关，隐空间动力学已知（如物理规律）而编解码函数未知
	* 优化状态表征的 loss 设计：
		* 共享表征层，设置不同预测目标提供 loss，“auxiliary loss”（> MTL）
		* 针对预测目标的 loss，如控制时间变化量以确保学动态物体表征（而非背景），或使表征更可控，如 inverse dynamic loss 使用表征可据状态改变推断动作 $(s,s')\mapsto a$
		* contrastive loss，希望使之与其他状态表征的一致/不同，如不同视角看到的图像
	* 策略部分：若模型可微，可直接 optimal control 得最优策略；复杂/不可微模型可结合策略、价值函数，与 planning 互补
		> planning 指利用（学得的）模型做前向预测，并允许可能的 BP
		* 用 $V,Q$ 优化 planning：表达未来累积 reward
			> 从而无需搜索至终态，对围棋等稀疏 reward 等情形有用
		* 用 $\pi$ 优化 planning：作为 planning 的指导，如 AlphaGoZero 用之作为 MCTS 的 UCB；Guided Policy Search 中惩罚（KL）使 planning/$\pi$ 给出的路径接近（> 二者同时被优化）
		* planning 帮助学 $V,Q$：planning 搜得的最优累积奖励作为价值 ground-truth（> model-free RL 里它只从数据中来，这里以模型为中介，若模型非给定，则模型预测的 reward 本身是从数据学的）
		* planning 帮助学 $\pi$：AlphaGoZero 计算访问次数，希望 $\pi$ 分布与其一致（交叉熵）；Guided Policy Search 同 $\pi$ 指导 planning
		* 图示 Dyna、AlphaGoZero、Embed2control、DQN/SARSA 的各元素间信息流动
			* Dyna、AlphaGoZero 都涉及 planning 和 $V,Q,\pi$ 的交互，前者最终动作由 $V,Q,\pi$ 产生，后者来自 planning
		> 不是所有 MBRL 都在决策中引入规划，例如先学出环境模型 surrogate、再在其中像无模型 RL 那样训练的做法
	* 还推荐了另一篇 model-based RL benchmark 文章 1907.02057
* `MBRLreview-2006.16712` model-based RL 综述；知乎介绍见 `[model-basedRL综述2006.16712]`
	* "Model-based Reinforcement Learning: A Survey."
		> created on 2022-03-11
	* 时间抽象，或 HRL，跨多个时间步长的抽象动作空间
		* fig5 抽象层，高级控制器选择高级操作 $g_t$，解码为低级操作序列 $a_t,\dots,a_{t+k}$，$k$ 可取定或动态改变
		* option, GCVF (goal-conditioned policy-value function)；有理念差异：
			* 前者对每个 option 有独立的子策略，后者试图泛化到不同目标/子策略上
			* 前者根据状态信息决定始态终态，后者可任意起始、终止
			* 某种意义上，后者为单步模型（选取很短期的目标）和 model-free RL（直接考虑最终目标）之间的插值
		* 均涉及 subroutine 定义（option 终态，GCVF 目标状态）
			* 图结构：MDP 图将两子图连接的瓶颈状态
				* 识别方法举例，包括 predecessor 数比其 successor 要多的态；高维问题中受关注少
			* 状态空间覆盖：subroutine 结束状态分布于整个状态空间
				* 多数方法先状态空间聚类、学动态模型在其间移动；还可在压缩表示（> 隐空间？）中聚类
			* 信息论压缩（> ？）
			* reward relevancy，相关 subroutine 有助于产生 reward 从而在黑盒优化中自动出现
				* 确保模型可微、端到端优化；如 option-critic 等；用 EM 算法的，E 找 active option，M 最大化 reward
				* 挑战之一：确保多样性，防止退化为单子程序解决所有任务，或每个子程序只管一步
			* 利用先验知识；包括从专家演示中推断
	* planning 与 learning 结合，sec4.1-4 四个主要问题
		* planning 从哪个状态开始（`FRAP-2006.15009` fig4 展示其包含关系）：
			* 随机（如动态规划遍历所有状态）
			* 已访问（保证只考虑可达状态；如可能的图像只是一部分）
			* 优先级（按与下次规划的相关性）
			* （常见）仅当前真实状态
		* planning 与数据收集的资源预算
			* 例如 AlphaGoZero 每个实际步骤间 MCTS 迭代 1600 轨迹、200 深度；真实环境中高数据利用率的方法会规划到收敛
			* 常介于无规划（model-free RL）、无限规划之间，也是心理学课题
			* 自适应权衡，包括用元控制器选预算；开始学习时模型不好，无需规划太多
			> 若环境随机性高，规划时 MC 采样方差较大，似乎长时间规划不划算？
		* 如何规划：主要是前向；许多经典 RL 用离散规划；微分规划也可行，不过不适用于稀疏奖励
			* 不确定性随时间的传播（UQ），包括粒子方法等
		* planning 与学习、行动循环的整合
			* AlphaGoZero 是 多步近似实时动态规划 (MSA-RTDP) 的一个实例；理论研究表明更长规划降低真实环境样本复杂度，决策更明智（> ？）
		* sec4.5 无模型规划（隐式规划）
			* 例如规划启发的网络架构，外部像标准价值网络，内部结构像规划算法，可提泛化；MuZero 性能与 AlphaGoZero 可比
			* 学习规划算法的网络，如 MCTSNet
			* 有规划特征的黑盒 RNN
		* sec5.3:-1 人也有局部规划与全局近似的组合，认知科学“双重过程理论”，参考文献
	* sec5 model-based RL 的好处：
		* fig10 data efficient、探索、稳定性、可迁移性、安全性、可解释
			* sec5.3 model-free RL 在函数逼近设定下“notoriously unstable”
		* {两种探索}：
			* 标准探索，在纯规划、无模型 RL 中决定访问的状态、动作，目标为降低模型样本复杂度（用于规划）及实际样本复杂度（用于无模型 RL）；包括 $\epsilon$-贪心等
			* 两阶段探索：model-based RL 中牺牲模型样本复杂度，以降低实际样本复杂度
				> 先学出环境模型、再在此模型中训练不进行规划的 RL 的那类 MBRL 做法也可达到这种效果
		* sec5.2 探索的内在动机 intrinsic motivation：
			* knowledge-based；内在奖励函数，基于“新颖性”状态空间密度估计，recency 与模型预测误差（克服非平稳性），可多种结合；许多工作源于{情绪理论}，有引文
				* 基于模型：PAC-MDP 框架；R-Max（> 未访问状态采用乐观先验）
				* 一个缺点：内在奖励函数消失后会造成影响；有试图解决的工作
			* competence-based：同样是好奇原则，但依据为学习进度（能力而非知识），为课程学习生成任务
				* 形式化为 内在动机目标探索过程 (IMGEP)，三步：学目标空间、目标抽样、为目标制定计划
					* 目标抽样包括跟踪一组目标并选择最近有回报改进的目标
					> 目标和 option 的关系？
				* fig11 示意图：从 goal/competence space 采样 goal $g$，规划从当前态 $s$ 到 $g$ 路线
				* 与基于知识方法的区别除信息类型，还有：无需嵌入或传播内在奖励，复杂但可克服分离问题
			* sec5.5 有工作除探索网络外，另设网络验证探索提议的安全性（如真实机器人要防受伤）
		* sec5.4 迁移学习三类型：动力学模型，技能或子程序，“知识”如 shaping rewards 与 representation
			* 本文主要讨论动力学模型迁移，包括 reward 函数不同、动力学小变化（包括 sim2real）
			* 改变 reward：多目标的 MORL，无模型方法多；successor representation
			* 动力学小变化，涉及 MTL、元学习
		* sec5.6 可解释性：对比解释（用户问模型为何不选另一策略），基于 emotion，language grounding；{_ncaa5n}
	* sec6:3 Hamrick 文章用 model-based RL 模拟人类心理
	* （评）相关备用: 2204.09418 MBRL 用于 MARL，`DMPO-2207.06559` 也是
		* `2022-05-18`(AISCmeet2) PlaNet 以视频为输入，客观世界建模所用的 RSSM 结合了 RNN（表达隐状态 $h_t$ 的迭代）和 stochastic model（表达客观状态 $s_t$ 的迭代），实验有 Cartpole 等任务
* `2106.14080` MBRL 模型学习中引入 $V(s)$ 估计；理论估计学习与真实模型下 $J(\pi)$ 误差（备用）
	* "Model-Advantage Optimization for Model-Based Reinforcement Learning"
		> created on 2022-03-26
	* lem1 度量两个 MDP 下 $J(\pi)$ 大小差别（因学得模型与真实模型有出入）
	* alg2 value-aware MBRL，三个 replay buffer，分别用于训练真实模型的近似 $M$、回报估计 $V(s)$、策略 $\pi$（更新策略时也同步更新 $V$）
	* 摘要：可用于控制量连续的环境
* [RL抽象理论-2203.00397](https://mp.weixin.qq.com/s/H_gHOANZ4x_NE8log-TDhg)
	* （综述文章，为博士论文）
	* 执行抽象过程的函数所必备的三要素：
		* 维护近似最优行为的表示；
		* 它们应该被有效地学习和构建；
		* 计划或学习时间不应该太长。
	* 核心问题：强化学习智能体是如何发现和使用高质量的抽象？
		* 借鉴计算复杂性理论、决策理论和信息论的思想，可设计高效算法来启发抽象，从而减少决策的经验需求/思考时间
	* 结果概括：好的抽象 (1) 易发现，(2) 帮助高效学习，(3) 使学到的策略高价值
	* part2 状态抽象；thm3.1 总结框架；ch4 终身学习的 PAC 状态抽象，MDP 任务随机采样获得
		* ch5 信息论，设计相应算法高效构建状态抽象，在压缩和良好行为的表示之间取得了优雅的平衡
	* part3 行动抽象
		* ch6 （他人工作）如何找到使规划尽可能快的抽象动作：为 NP 难问题，甚至难以多项式时间内近似解
		* ch7 高级行为预测，即 $p(s'|s,a)$ 结果，预测多步时间或多步后某时间
		* ch8 抽象使探索过程改善
	* part4 状态-行动抽象的联合处理
		* ch9 状态、行动抽象结合的简单方案，thm9.1；连续抽象所得层次抽象机制，证明可表示全局近似最优策略
* `2203.00397` 
	* "A Theory of Abstraction in Reinforcement Learning"
		> created on 2022-03-25
	> TODO: summary, comparison tree, link, (broader impact?)
	* def2.11-13 state abstraction $\phi:S\to S_\phi$，相应的 $R_\phi(s_\phi',a,s_\phi)$，转移函数 $T_\phi(s_\phi'|s_\phi,a)$
		* $\pi_\phi(s)=\pi_\phi(\phi(s))$ 只依赖于抽象状态；寻找最佳 $\pi_\phi$
		* 术语约定：抽象 MDP 中态称为 抽象态/cluster，原 MDP 中态称为 ground/environmental 态
		* 之前的工作：
			* bisimulation
			* soft state aggregation（软状态聚合）$\tilde\phi:S\to\Delta(S_\phi)$，行动时采样 $s_\phi\sim\tilde\phi(s)$
			* 模型选择
			* 通过学习找出非关键因素；粗略地，若状态的最优动作相同，则可组合；统计测试确认哪些可忽略
			* 其他框架的状态表示，价值表示、价值保持，态抽象与探索，态抽象与规划
		* table2.1 现存的几种态抽象 $\phi$ 类型，使某元素只依赖于 $\phi(s)$；按 $\Phi$ 由小到大（特殊到一般）排序：
			1. $\phi_0$（> 本文？）
			2. $\phi_\text{model}$：要求 $R(s,a)$ 和 $T(s'|s,a)$ 只依赖于 $\phi(s)$
			3. $\phi_{Q^\pi}$：要求 $Q^\pi(s,a)$，$\forall a,\pi$
			4. $\phi_{Q^*}$：要求 $Q^*(s,a)$
			5. $\phi_{a^*}$：要求最佳行为 $a^*(s)$，即 $\arg\max_aQ^*(s,a)$
			6. $\phi_{\pi^*}$：要求最佳策略 $\pi^*(s)$
	* sec2.3 action abstraction 采用 option 框架
		* def2.17 动作抽象定义为 $\omega:A\to O$（option）
		* def2.18 multi-time model（MTM）$T_\gamma(s'|s,o)$，$R_\gamma(s,o)$
		* prior work；其他抽象形式，MDP 同态折叠等效的 $(s,a)$-pair，及近似版本；分层抽象
	* p72 fig2.9 四种抽象示意图：状态、动作、状态-动作、分层
	* sec2.4 “好”抽象的标准：
		* 高效创造（容易计算、学习出抽象方式）；度量方式：样本、计算复杂性
		* 高效决策（抽象后规划、学习更快）；度量方式：解决 RL 或子问题的速度，样本、计算复杂度
		* 接近最优（产生的策略可令人满意地解决问题）；度量用 value loss 
		* rmk2.1 去掉任一个要求都有平凡解
	* def2.19 value loss $\min_{\pi_\phi}\max_sV(s)-V^{\phi_\pi}(s)$
		* 用于动作抽象 $\omega$ 需对 $V$ 做额外处理，因 option 半 Markov；
		* 其他最优性度量包括递归最优、分层最优
	* ...
	* def9.5 depth n hierarchy，对状态、动作（option）多层抽象
		* eqn(9.84) 第 $i$ 层值函数 $V_i^\pi(s)$ 定义

## paper
* `1805.09801` RL 单任务终身学习，用元学习优化 loss 函数的参数
	* "Meta-Gradient Reinforcement Learning" by DeepMind
		> created on 2022-02-28
	* sec1.1 给定经验序列 $\tau_t=(s_t,a_t,r_{t+1},s_{t+1},\dots,s_{t+n})$，return $g_\eta(\tau_t)$ 由 $\eta$ 参数化
		* eqn(6) n-step return $g_\eta(\tau_t)=r_{t+1}+\gamma r_{t+2}+\cdots+\gamma^{n-1}r_{t+n}+\gamma^nV_\theta(s_{t+n})$，$\eta=(n,\gamma)$
		* eqn(7) $\lambda$-return $g_\eta(\tau_t)=R_{t+1}+\gamma(1-\lambda)V_\theta(s_{t+1})+\gamma\lambda g_\eta(\tau_{t+1})\,$，$\eta=(\gamma,\lambda)$
	* 常规任务 loss $J(\tau,\theta,\eta)$
		* 内层优化 $\theta$，用单步梯度下降更新 $\theta'=\theta-\alpha\nabla_\theta J$
	* 元任务：寻找合适的 $\eta$ 使常规任务用梯度下降学习最快
		> 属于学有限步算法-损失函数形式、以加速为元目标的那类元学习算法
		* sec1.0 元学习 loss $J(\tau',\theta',\eta')$，其中 $\tau'$ 为接着 $\tau$ 采样所得的后续轨道
		* 这里选取了固定的 $\eta'$，不参与反传
		> 对一般的学损失函数形式元学习算法，也是调整内层损失函数形式（$\eta$ 表示），来使外层的给定损失函数（$\eta'$ 表示）下降最快
	* sec1.2 （常规学习）学 $V_\theta(s)$ 的简单例子
		* TD($\lambda$) 算法取 $J(\tau,\theta,\eta)=(g_\eta(\tau)-V_\theta(s))^2$
		* 其中从初始状态 $s$ 采样得轨迹 $\tau$
		* 常规任务：优化 $\theta$ 使 $V_\theta$ 更接近真实 $V(s)$ 函数
	* sec1.3 （常规学习）再涉及学 $\pi_\theta(s)$，A2C 例子
		* 涉及采样，更新 $\pi_\theta$ 参数涉及 policy gradient
		* 内外层梯度都要手算 eqn(12,14)，不能自动 BP
		> 此时 $J(\theta;\eta)=\mathbb{E}_{\tau\sim\pi}g_\eta(\tau)$，可能带负号
	* sec1.4 应对策略、值函数的 non-stationary 性质，将 $\eta$ 作为二者的额外输入
		* 形如 $\pi_\theta(s;W_\eta\eta),V_\theta(s;W_\eta\eta)$，参数 $W_\eta$ 可学
		* 理由：$g_\eta(\tau)$ 改变后，$V_\theta,\pi_\theta$ 可能仍在表达原先的值，从而不准；例如在 $\gamma=0$ 时已训练较充分，但是变成 $\gamma=1$ 时就不准了
		> 看起来类似（只生成部分参数的）hypernet 或 conditional NN，原先对 $\eta$ 的更新完全靠对 $\theta$ 的更新体现，现在显式输入 $\eta$ 后对 $\theta$ 更新难度降低；
		> 相应问题框架见 ((n32e7d))domainShift 主动调整分布，解法框架见 ((n3gd5l))hyperNet
	> 属于框架 `1taskL2O:`，或许可用 `元学习内层用复杂优化器`
* `FRAP-2006.15009` （备用）
	* "A Framework for Reinforcement Learning and Planning"
		> created on 2022-03-12，同作者的文章 `MBRLreview-2006.16712` 中引用；仅备用
	* fig1 规划算法假设可逆的环境，RL 假设不可逆
		* 建模的分析模型可逆，现实的样本模型不可逆
	* 经典规划算法：DP，启发式搜索（如 Dijkstra 最短路径），基于样本（$A$ 中采样的 MCTS，$S$ 中采样的 RRT 仅适用于小 $A$），基于梯度，黑箱优化
* `DMPO-2207.06559` （备用）MARL+MBRL，智能体学自己的动态模型并与邻居交流其预测
	* "Fully Decentralized Model-based Policy Optimization for Networked Systems"
		> created on 2022-07-26
	* 远程通信开销大（能耗、计算复杂度、信号干扰），故只考虑邻居
		* 不如维护全局统一 $V(s)$ 精确，但那样代价不是总能承受
	* secIII.A networked MDP，图结构 $\mathcal{G=(V,E)}$，$i\in\mathcal{V}$ 邻居记为 $N_i$、$\kappa$-邻域 $N_i^\kappa$
		* $\mathcal{S=\prod_iS_i,A=\prod_iA_i}$，转移概率依赖于 $\kappa$-邻居 eqn(4) $p_i(s_i'|s_{N_i^\kappa},a_i)$，
		* 只可观察到一阶邻居，策略 $\pi_i^{\theta_i}(a_i|s_{N_i})$
		* （评）secIV.C 学习转移概率时似乎可以观察到 $\kappa$-阶邻居
		* （评）((n33j3u))多主体系统建模 为我建的汇总
	* secIV.A 模型中对转移概率的估计 $\hat p_i=p^{\psi_i}$ 参数 $\psi_i$，自选（未知的）$\kappa$ 以避免大计算开销
		* 数据集，真实环境的组成 $D^E$，学到的模型生成的 $D^M$
	* secIV.C 预测模型长时间预测有复合建模误差；采用先前文献提出的“branched rollout scheme”方法解决，模型 rollout 不从初始状态开始，而从最近的环境轨迹 $\tau$ 中随机选择的状态开始
		* rollout 长度固定为 $T$
		* alg1 每次采样 $s_i^t\sim D_i^E$（branching），用现有模型和策略推进 $T$ 步，轨迹放入 $D_i^M$。共生成 $M$ 条轨迹后，更新 $\pi,V$
		* （评）是人为引入初值随机性，相当于某种不严格的 UQ？
* `MuZero-RC-2202.06626` （备用）RL（MuZero）用于视频压缩，问题写为带约束 MDP
	* "MuZero with Self-competition for Rate Control in VP9 Video Compression"
		> 2022-07-28 CSImeet 群聊，导师推荐
	* 带约束 MDP（CMDP）设定：约束（> 感觉更像成本？）$c_k:S\times A\to\R$，函数形式同 $r$
		* 目标问题：$\max_\pi J^r_\pi$ 使 $J^{c_k}_\pi\le\beta_k$，$\forall k$
		* （评）各 $J^{c_k}_\pi$ 也是带时间 discount 的期望，定义从形式上与 $J^r$ 一致；约束针对策略的长期平均行为，而非特定状态、动作
		* 有经典文献讨论了求解方法
	* 此处约束为 bit rate，reward 为压缩后 PSNR
	* 与原版 MuZero 自我对战不同，这里是与自己的历史表现竞争
		* 由于性能是通过首先比较比特率约束满足来衡量的，因此代理首先学习满足约束，然后学习提高 PSNR
		* 不同于拉格朗日松弛法，该机制不包含任何代表约束满足难度的直接参数。这允许 agent 从观察中推断出满足约束的难度。 
* [DERL-2102.02202](https://mp.weixin.qq.com/s?__biz=MzA3MzI4MjgzMw==&mid=2650808404&idx=3&sn=a8f3a2b0f6a682575ca12ca313cc240b) 
	* “这是迄今为止最大规模的形态进化和 RL 同步模拟。”即遗传算法优化身体结构，RL 网络学习运动方式
		* 应该是遗传生成结构-学习-根据适应力繁殖得到下一代结构-再学习
	* 验证了复杂任务训练得到的结构 能够更好适应新任务（迁移学习/重新学习）
	* 首次观察到鲍德温效应（原本终生学到的东西会转化为本能、可遗传），子代学习速度加快（似乎这里应该是指收敛速度），即使没有对学习速度的选择压力（适应度仅仅根据迭代结束的状态确定）
	> 这种效应的生物原理我觉得可能是学得越快的个体占优势，有时优势包括迅速融入族群，从而靠本能学到的也占优；这里对学习速度无选择仍出现这种结果，可能是进化与学习的方向相同，不是有随机性地学到了某种东西（如两种无差异的可能，类似路上靠左或右走的那种）
	* 能源效率：消耗能量/(肢体质量x完成目标数)，在没有选择压力的情况下提升：“这表明能源效率是通过选择更有效地利用身体 - 环境相互作用的被动物理动力学的形态来实现的。此外，在任意固定代，能源效率更高的形态表现得更好（下图 6a），学习速度也更快（下图 6b）”
* `Botvinick08HOB` 神经科学相关，演员-评论家算法及其 HRL 版本的神经科学对应物
	* "Hierarchically organized behavior and its neural foundations: A reinforcement-learning perspective"
		* Matthew M. Botvinick, Yael Niv, and Andrew C. Barto
		* [link](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC2783353/)
		> recommended at `2023-02-13`(lectures)
	* fig2 actor-critic 与 HRL option-critic 的神经科学对应物
		* 普通 actor-critic：策略 $\pi(s)$ 对应 DLS，状态值函数 $V(s)$ 对应 VS，奖励函数 $R(s)$ 对应 HT+，时间差分预测误差（temporal difference prediction error）对应 DA，
		* HRL actor-critic：当前 option $o$ 对应 DLPFC+，给定 $o$ 的细层级策略 $\pi_o(s)$ 对应 DLS（同前）、奖励 $R_o(s)$ 对应 HT+（同前）、$V_o(s)$ 对应 VS（同前）和 OFC 二者，$\delta$ 对应 DA（同前）
		* 原文机翻
			> 演员-评论家的实现。（A） 基本演员-评论家架构示意图。R（s）：奖励函数；V（s）：值函数；δ： 时间差预测误差；π（s）：政策，由行动力量决定。
			> (B) HRL 的演员-评论家架构。o： 当前控制期权，Ro（s）：期权相关的奖励函数。Vo（s）：选项特定值函数；δ： 时间差预测误差；πo（s）：期权特定政策，由期权特定行动/期权强度决定。
			> （C）图 A 所示元素组分的所提出的神经对应物
			> （D）图 C 所示元素组分的可能神经对应物
		> 缩写：DA：多巴胺；DLPFC：背外侧前额叶皮层，以及其他可能包括前运动、辅助运动和前辅助运动皮层的额叶结构；DLS，背外侧纹状体；HT+：下丘脑和其他结构，可能包括缰核、脚桥核和上丘；OFC：眶额皮质；VS，腹侧纹状体。
	> fig6 根据引导激活理论（Miller&Cohen，2001），前额叶皮层的作用说明。前额叶皮层的激活模式（方框区域的填充元素）有效地选择了位于大脑其他地方（下部区域）的刺激反应途径。在这里，前额叶皮层内的表示对应于HRL中的 option identifier，而所选择的刺激反应路径对应于选项特定的策略。图改编自Miller和Cohen（2001年，许可待定）。

