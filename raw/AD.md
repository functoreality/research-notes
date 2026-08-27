> 2022-01-05 从原版 `~/nutstoreFiles/research/papers/metaLearning/autoDecoderNotes.md` 修改而来
* `DeepSDF-1901.05103`: #PINN/#meta, #SDF, (#idea) #inverse_design, #meta-learning
	* "DeepSDF: Learning Continuous Signed Distance Functions for Shape Representation"
	> 本来是组会上别人介绍的文章，由于自己相关想法很多，并且作为本科毕业论文主题，在这里单独列出
* 问题：使用 NN 表达 SDF $s(x)$，要求在不同场景（物体分布）下快速生成表达（相当于 PINN 的 meta-learning）；
	* 方法：“AutoDecoder”，$(z,x)\xmapsto{\theta}s$，其中 $z$ 作为“场景”的隐空间表达；给定场景 $i$ 下有数据 $X_i=\{(x_j,s_j)\}$（或者更一般的，问题参数 $\lambda_i$），训练时优化 $\{z_i\},\theta$，测试时只优化 $z$；行文使用 Bayesian 语言下的最大似然
	* $\lambda$ 编码进入隐空间得到低维向量表达 $z$
	* 我认为可以用于一般的 PINN、反问题的 meta-learning 版本
	* 关于 CG 渲染中用到的 SDF：针对光线追踪的用途，似乎改拟合带方向的距离场更方便，用 $s(x,v)$ 表示从点 $x\in\R^3$ 沿 $v\in S^2$ 方向走多远会碰到曲面，有 $\text{SDF}(x)=\max_vs(x,v)$；只用简单的 SDF 会在视线贴近某个物体表面时低效，例如从管道里往外看的情形
	* CG 其他做法见 `NeRF_5s`
* 组会上导师的解读：可以解决 PINN 重训的问题，遍历所有的 BC 找到 $\theta$ 并把 BC 编码入 latent space（$z$），遇到新的 BC 时不需要重新训练参数，只需要训练低维的 $z$ 就行了
	* SDF 可以视为 Eikonel（？）方程的解，也可以直接计算逐点取值，从而可以 fine-tune
	> 这里待训练的 $z$ 其实按照这种 decoder 的写法是有一个概率分布，取最大似然则成为一个确定的东西，可以优化算法找到
* 没有阅读原文；以下均为我的思考（来源：2021-03-10 组会 PPT，知乎）
	* `~/nutstoreFiles/research/slides/mine/others/20210311-DeepSDF-meeting.tex` 为 PINN 等一般元学习框架的笔记
* 按照 meta-learning hypernet 方式的理解，如果把 $z$ 看作 meta-task input：$(x,z)\mapsto s$ 相当于 $z\mapsto(x\mapsto s)$，后者的映射使用 NN 表达（PINN）时相当于 $z\mapsto\omega$ ($s=s_\omega(x)$) 这样的 hypernet；
	* 原有的 $s_\theta(x;z)$ 形式下，相当于 hypernet 只影响 regular-net $s_\omega(x)$ 的第一层，hypernet $z\mapsto\omega$ 参数为 $s_\theta(x;z)$ 的输入层、第一隐藏层之间的权重，输出相当于 $s_\omega(x)$ 第一隐藏层的 bias
		> MetaSDF secA 写下了这一点
	* [谈谈DeepSDF中AutoDecoder - 知乎](https://zhuanlan.zhihu.com/p/102904841) 中提出可以直接把 $s_\theta(x)$ 第一层的参数作为 $z$，这部分允许针对每个问题 $X_i$ 分别训练，其他参数则与 $i$ 无关
* 按照 optimization 的 meta 版本理解（PINN 优化对象为 $\omega$，反问题、inverse design 也有相应优化对象）
	> 在按照一般 meta-learning 问题理解时，可能还是使用函数空间而不是 $\omega$ 来表达优化问题的空间更加合适（像上次导师让写的严格文件里那样），因为 $\omega\mapsto u_\omega$ 不是单射；Reptile 里讨论了这一问题
	* 原有问题 $\omega\xmapsto{\lambda}L$ 要对于每一个参数 $\lambda$ 训练（优化）得到 $\omega_\lambda$，这里的 $\lambda$ 可能作为特殊数据结构无法给出（定长的）参数化
	* 假设：在考虑的所有 $\lambda$ 下，$\{\omega_\lambda\}$ 其实是低维流形 $M_\theta$（或者包含于这个流形），可以用 latent vector $z_\lambda$ 表达，$z\xmapsto{\theta}\omega$
		* $Z$ 可以先取大一点，训练好之后对 $\{z_i\}$ 做 PCA 以估计真实需要的维度（来自导师），或者再做一次非线性降维
	* 使用时（regular task）只需要对给定的 $\lambda$ 优化 $z\xmapsto{\theta}\omega\xmapsto{\lambda}L$ 这一复合映射（收敛快于直接训练 $\omega$），对得到的 $z$ 再使用一次前传即可得到想要的 $\omega$
		* 对于 $z$ 的 SGD 优化也许未必对应对于 $\omega$ 的 SGD 优化，从而这种 meta-optimization 也许不完全算 gradient-based 框架下的？
		* 得到的 $\omega$ 可以继续 fine-tune，在 DeepSDF 的设定里即对 $\theta$ fine-tune，类似 MAML 等；效果提升的主要贡献应该还是来源于对 $z$ 的优化；此时要求可以放宽为 $\{\omega_\lambda\}$ 位于一个低维流形附近（例如概率分布）
		* i.e. 结合 MAML 的方式：1. 对 $z$ 给出先验，此时 $\theta$ 还是需要逼近 $\{\omega_\lambda\}$ 本身；2. 对 $(z,\theta)$ 给出先验，此时训练得到的 $\theta$ 只需要与 $\{\omega_\lambda\}$ 距离上接近即可
		* （旧）对于 PINN 的 design 问题（真正优化对象为 $\lambda$），可以得到 PINN 参数 $\omega$ 即方程解的形式后，再反推方程的参数
	* 训练为给定 $\{\lambda_i\}$，优化对象 $\{z_i\},\theta$（得到最优的 $\theta$ 后各个 $\{z_i\}$ 不再被需要）
	* 一般的 AE 思路其实是 $z_i=z_\phi(\omega_i)$ 由生成器给出而不是直接分别训练，能够体现不同 $\lambda_i$ 下 $z_i$ 的关系（如对 $\phi$ 正则化），但需要求解各个 $\omega_i$；
	* 这里把求解 $\omega_i$ 的优化和对 AE 参数的优化合并为一个优化，优化目标为 $\sum L_i$，不需要给出 $\omega_i$ 的明确表达
	* 在 $\omega$ 很大并且有结构（例如为某个 NN 的参数，拉成一个向量表达会忽略结构）时，这种不需要给出明确表达的训练方式应该会比较高效，并且容易编程实现
	* AutoDecoder 给出的生成模型与其他场合需要的（eg. GAN）不同，这里训练不需要显式给出样本 $\omega_i$，且训练目标上允许 $M_\theta$ 包含 $\{\omega_\lambda\}$ 之外的点（虽然 AE 也允许），降低了拟合难度，并且当 $\{\omega_\lambda\}$ 包含于但本身不是流形时仍可用
* `LRasAD:` 学习 representation 可看作特殊的 AD
	* 按学 argmin 假设空间的元学习方法理解 `unifyMethod2:`(metaL)
	* 原版假设空间 $H_\theta$ 由 $Z\to H,z\mapsto f_\theta(-,z)$ 给出，元学习目标为找到合适的 $\theta$
	* 现做法的参数化为 $F\to H,f\mapsto f\circ h_\theta$，用小函数空间 $F$ 参数化大函数空间 $H$ 中的流形
	* 常见例子为通过元学习找出 feature extractor $h_\theta$，后续任务学习只找 $f$
	* 若另有参数化映射 $Z\to F$，则最终假设空间的参数化为 $Z\to H,z\mapsto f_z\circ h_\theta$
	* 例如，若元推断只负责找最后一层参数，则 $F$ 由线性函数组成，$Z$ 选取显然
	* AD 中若 $z$ 取为网络最后几层的参数（类似 ANIL），则和这样的方法相同
	* 相当于这给出了 AD 映射 $Z\to H$ 的另一种构造方式
	* 这一框架不适合描述一般 AD 框架，例如 AD 可以每层拿出部分参数组成 $z$，或者每层 concat 入相同的一个向量 $z$；$z$ 作为网络输入的做法也描述不了
	* 相关：((n3rn3e))representation
* 与其他 meta-learning (meta-optimization) 做法的比较
	> 可参考 `metaLearningNotes.md`
	* ANIL（本来是一种 MAML 改版）提供的启发：
		* ANIL 相当于显式声明一个先验参数 $z^*$，取 $z_i=z^*-c\nabla_zL^\lambda[u(x;\theta,z)]$，而不是 DeepSDF 那样分别通过优化得到；
		* DeepSDF 结合 MAML 获得 $z$ 先验的版本，如果同时训练 $(\theta,z)$ 则与 ANIL 类似，不过还有先训练 $\theta$ 的版本，此时后续的 $z$ prior 训练可以无监督 loss（使用 $L[u]$），也可以有监督 loss（使用 $\|z-z_i\|^2$，可以证明此时优化结果就是 $z_i$ 均值）；ANIL 没有 AutoDecoder 解读无法像这样先训练 $\theta$
		* ANIL：meta-train $(\theta,z)$ 为 pretrain/“feature reuse” $\theta$，“rapid learning”$z$，regular-train $z$；这里 DeepSDF 为 meta-train $\theta$（$z_i$ 为辅助），regular-train $z$；MAML 不把参数区分为两部分
		* ANIL（regular task）网络参数为 $(\theta,z)$（即：$z$ 可以看作网络内部结构而不是输入），且 $z$ 为最后一层的网络参数（而不是用第一层）：前面层的特征提取是多个任务可以共用的，后面层才与任务有关，图像任务里有很多这样的例子（不过不知道对 PINN 任务有多大一致性）
		* 这样看来，在纯粹 pretrain 得到的参数下，将最后一层的参数作为 $z$（即只变化最后一层参数）即可大致拟合 $\{u_\lambda\}$，这是网络结构给出的，不需要像 DeepSDF 那样显式要求这种拟合（虽然有显式要求会效果更好）；如果改为变化前面几层的参数，在函数空间划出的流形就不再接近 $\{u_\lambda\}$
		* ANIL 对 $z$ 采用 rapid-learning 设定相当于也在显式要求这种拟合，不过相当于只要求局部拟合（因为各个 $z_i$ 只局部微调得到，而不是像分别训练那样可以相距很远）
		* 如果 $z$ 是最后一层参数，负责将（倒数第二层的）特征通过线性组合得到输出，则关于 $z$ 的优化问题可能是凸的，例如可能相当于在特征空间做 meta-SVM；这样隐空间维数可控（取定特征维数即可），而如果该参数为矩阵形式则隐空间维数太大；此时可以考虑改按照最后几层 concate 进来的方法引入 $z$ 参数
		* 实现相关：有监督问题，ANIL 如果 $z$ 在最后几层输入，可以保存之前的 activation，fine-tune 时不必重算
			* 不过在 loss 本身涉及导数的 PINN 任务还是需要重算
	* LEO (Latent Embedding Optimization): 
		> `metaLearningNotes.md` 有更多笔记
		* $z_i$ 得到：初始化来自 hypernet $z_i^0=z_w(\lambda)$（显式 VAE encoder，要求 $\lambda$ 能作为网络输入），根据 $L^\lambda$ 做若干步 fine-tune 得到 $z_i$
		* 在 meta-learning 设定下，取 $\lambda=\{(x_i,y_i)\}$，使用 DeepSets 方式构造对称函数 $z_w(\lambda)=g_w(\frac1n\sum\psi_w(x_i,y_i))$
		* （形式等价改写后）相较 ANIL 只是 regular-task 使用 hypernet 而不是统一初始化
		* 主网络写为第二个 hypernet $f(x;\phi_\theta(z))$，应该不是本质的
		* 其 sec4.6 的实验有说明隐空间的作用，隐空间的小变化在 decoder 之后对应大的变化
	* 在 `unifyMethod2:`(metaL) 框架下可看出与其他方法的关系（只是一个角度）
* MetaSDF (`2006.09662`) 改使用 MAML 做法，实验效果好于 DeepSDF；猜测通过以下调整可能提高 DeepSDF：
	> 文中只展示了两种设定下“平均”的不同，把“解释为何效果好”作为后续工作；但我觉得 DeepSDF 改进后未必不如它；另外注意文中的 concat 可能也指代 DeepSDF（也可能指其引文 2）；
	> 另外，DeepSDF 文章中没有提到 meta-learning，似乎主要考虑压缩存储、根据部分观测恢复形状的问题（后者也属于 meta-learning）
	* $z$ 输入位置放在网络最后一层，或者在第一层和最后一层同时输入；
	* 测试阶段，优化得到 $z$ 之后对 $\theta$ fine-tune，包括分级 fine-tune（从网络深层向浅层逐步解冻 fine-tune）
	* 训练阶段，先对 $z$ 调整多步之后再接一步 $\theta,z$ 同时优化？也许类似 GAN 的分类器要训练稍好而不太好
	* 针对大数据集的优化，能够使用 batch！如果本次 $z_i$ 在前面许多次 batch 都不涉及，此时需要先对它多步优化而固定 $\theta$，也可以考虑一定概率重新初始化后多步优化；维护一系列 $\{z\}$，从其中找最接近的作为初值开始后面的优化？
	* 大模型（MAML 内存需求大）可能效果好一些（但是 AutoDecoder 做法高精度需要大 $z$ 或对其余参数的后续 fine-tune）
	* 仍需要考虑的问题：$z_i$ 数目与维数选取的关系，原则上如果点个数 $n+1$ 则隐空间维数 $n$ 即可超平面拟合，即数据太少时不适合使用太多维数？
	* 文中提到的细节问题，针对 SDF 任务：如果按照 DeepSDF 设定在 loss 里使用 clamp 做法，内层 fine-tune 会出现训练不稳定，故本文改为双输出分别预测距离大小和符号，可以更好表现曲面细节；DeepSDF 改用这一 loss 只有较小提升（> 这似乎说明 MAML 做法的稳定性需要精细设计 loss，不如 AD 做法容许粗放使用）
* meta-learning 小样本学习 few-shot 框架的用途：
	* 样本少导致 loss 为零的点很多（可能也是一个流形），且很多零点都泛化不好；但是如果限制在 $\{\omega_\lambda\}_\lambda$ 流形上则零点变少，为泛化好的点；此时 AD 作用类似学出某种正则化
	* 传统小样本似乎 meta-train 就要在小样本上做，AD 则似乎可以也更适合在大样本上做
	* MAML 等做法 meta-train 时可以区分训练集验证集，原版 AD 不能这样，需要修改
		* 详见 `AD3losses:`；这种区分的一般说明见 `metaL-tr-val:`(metaL)
	* 一般 AD 的流形比真实的取值范围 $\{\omega_\lambda\}$ 稍大，为避免太大（导致学习阶段的正则化失效）也许需要对 $z$ 加额外正则化，DeepSDF 那样的 L2 正则化，或者 L1；
		* 更高的维数处加更大惩罚，即 $R(z)=\sum l_iz_i^2$ 之类，是否可以有效降维？
* `AD3losses:` loss 有训练内层、训练外层、推断三种
	* 原版三者一致；推断取不同 loss 为较简单修改
	* 关于一般元学习 3 种 loss 可见 `3losses:`(metaL)
	* 区分训练内外层，问题形式同 `2104.01677`(metaL) 的 bilevel optimization，其中的算法也可用
		* 内层严格 argmin 再对外层优化
		* 原来的设定不区分内外数据，故内外层 loss 一致，bilevel 优化退化为简单的直接联合优化
		* 其他算法可见 ((n8jk45))OB-diffOrd
		* 对小样本可能 $z$ 维数大于样本数，内层 argmin 解不唯一，外层需要 $\mathbb{E}_{z\sim z(\theta)}$；抗噪、PINN loss 等情形应该不用，见 `ADnotConstrOpt:`
	* 可能用于 few-shot，PINN 等使用不理想 loss 推断的情形
		* 受限 loss $\hat L$（小数据集或 PINN loss）极小点与真实 loss $L$（大样本或函数 L2 loss）极小点有不同，希望用前者推断时，结果尽量接近后者
		* 需要避免流形过拟合；具体地，(a) 尽量穿过真实最优对应的点，(b) 远离受限 loss 下虚假最优的点，从而依据虚假最优优化的结果最接近真实最优
		* 训练内外层分别用受限、准确 loss 的做法最有希望，(a,b) 都能做到；区分 tr,val 数据外层仅在期望下为准确 loss，但同样能达到这一效果
		* 上面提到的另一种方案，{训练内外层均用准确 loss}，推断在受限 loss；只能保证 (a)，需要通过限制流形维数来勉强替代 (b)；可见 `ADnotConstrOpt:`
		* 可{分阶段训练}，前期用准确 loss，后期用受限 loss 并区分 tr,val
			* 相关：((o6nf4v))OB_diffOrd-训练代价高、不稳定问题（这里双边优化会遇到）
	* 关于内外层区分 tr,val 数据，`metaL-tr-val:`(metaL)“无偏估计”可能也有优势
		* 应用场景包括 PINN 内外使用不同采样点
* `ADnotConstrOpt:` 小样本区分 S/Q 数据必要性的例子，并且不应用写为约束优化问题的形式来区分
	> TODO: link
	* 假设区分支撑、查询集，使用双边优化形式 $z(\theta)=\arg\min_zL^s[f_\theta(-,z)]$，外层 $\min_\theta L^q[f_\theta(-,z)]$
		* $z=(z_i)$，$L^s=\|f_\theta(x^s,z)-y^s\|^2$，$x^s=(x_{ij}^s)$，这里为简便省略角标与求和
	* 过参数化、数据无噪声情形，可能想写为约束优化形式：$\min_{\theta,z}L^q[f_\theta(-,z)]$，满足约束 $f_\theta(x^s,z)=y^s$；但实际上不行
		> 欠参数化、或者数据有噪声则显然不能写为约束优化；
		> 小样本情形通常确实是过参数化（即使只更新 $z$）；
		> 抗噪情形要处理的过拟合风险源于 $\theta$ 过参数化，但只更新 $z$ 时未必，不过反正也不打算在支撑集上完全拟合；
		* 或者不区分 S/Q 数据的原版 $\min_{\theta,z}L^s+L^q$，相当于优化约束写为惩罚项
		> 抗噪情形不能合并 loss，最多元训练只用查询集，元推断才用支撑集；估计这和小样本约束优化形式会遇到相同问题
		* 此时 $z(\theta)$ 为集合（满足 $L^s=0$ 的参数组合很多，从而可写为约束优化问题）
		* 若推断时用随机优化算法找单个 $z$，可认为 $z(\theta)$ 上有概率分布
		* 真正应该使用的优化形式为：$\min_\theta\mathbb{E}_{z\sim z(\theta)}L^q[f_\theta(-,z)]$
		* 大意：推断会获得大量可能的 $z$，双边优化形式能保证它们泛化都很好（训练内层体现了多种可能 $z$），而约束优化不行（训练内层仅体现最好的 $z$）
	* 回归例子：$X=\{x_1=1,x_2=2,x_3=-1\}$，$F=(X\to Y)=\R^3$
		> 这个例子已经可以直观理解，即使我没在笔记里画图
		* 真实解为所有线性映射 $l=\{x\mapsto\lambda x\}\subset F$，为一维子流形
		* 考察 $Z=\R^2$ 从而假设空间 $H_\theta$ 总是二维；选取特定 $\theta\mapsto H_\theta$ 使 $\{H_\theta\}$ 为 $F$ 中一系列二维平面（为简便不考虑一般子流形）
		* 假设（重参数化后）$\theta=(\theta_1,\theta_2)$，其中 $\theta_1$ 控制 $H_\theta$ 是否经过 $l$，经过时 $\theta_2$ 控制它绕 $l$ 旋转
		* 以下说明：约束优化只能保证 $\theta_1$ 选取恰当，泛化需要 $\theta_2$ 也恰当，双边优化可保证
		* 小样本数据集：对每个 $\lambda$ 随机划分数据集（共 3 数据），使支撑集 2 样本查询集 1 样本
			* 约束优化的最优解，$H_\theta$ 通过 $l$（即 $\theta_1$ 训练成功），$z_i$ 最优点使 $f_\theta(-,z_i)\in l$ 都成立
			* 但是如果 $H_\theta$ 上有平行于 $y_3$ 的直线（即包含某条线 $\{h\in F|h(x_1)=\lambda,h(x_2)=2\lambda\}$），则元推断时若见到的数据为 $(x_1,\lambda),(x_2,2\lambda)$，推断所得模型可能是这条线上的任意点，未必在 $l$ 上，从而在 $x_3$ 上泛化未必好
			* 双边优化能发现这个问题，进一步找到合适的 $\theta_2$ 使 $H_\theta$ 与三条坐标轴夹角都较大，元推断时不会出现上述问题
		* 对单样本学习（支撑集 1 样本查询集 2 样本）$z$ 明显为过参数化，问题更明显
			* 此时约束优化同解，双边优化解尽量让 $\theta_2$ 退化，从而 $H_\theta\approx l$
			* 例如，若选取表达力更强的 $\theta$，$H_\theta$ 可以是绕 $l$ 的小圆柱面
		* 抗噪版本的例子（此时当然不能是约束优化形式），用于说明双边优化仍能抗噪
			* （记号同上）元推断见到的数据包含所有 $x_i$，但相应 $y_i$ 上加了噪声
			* 此时学习到的参数还是尽量让 $\theta_2$ 退化
			* $z(\theta)$ 不再是集合也不是 $L^s$ 零点，与单样本的 $z$ 过参数化情形不同，无需 $\mathbb{E}_z$
			* $\theta$ 仍过参数化，因此需要通过元学习取定，元推断时固定
	* 若元目标为快速学习（原版 AD），则无需区分 S/Q 数据，或对 $L^s+L^q$ 单层优化
		* 双边优化退化为加权单层优化的例子还有：约束优化问题，约束可写为内层优化，内外 loss 加权可得带惩罚项的无约束优化问题；例如 ((n35e9x))PINNinvDesnBiOpt
		* 但这里{有本质不同}：
			* 对约束优化问题，其相应的双边优化问题本身就等价于求解目标；
			* 约束优化对应的双边优化改写为加权单层优化，是同一目标下改用一个精度稍低的替代手段
			* 对元目标为小样本、抗噪等元学习，双边优化只是达到目标的手段，这不能用单层优化近似
				* ((n32e2y))双边优化-单层优化的极限
			* 对元目标为快速学习的元学习，其对应的手段本来就不是双边优化
			* 从而 AD 改写为加权单层优化，是目标变化对应的手段调整，而非双边优化这一手段的导出手段
		* 示意图：约束优化 $\Leftrightarrow$ 双边优化 $\Leftarrow$ 加权单层优化
			* 小样本 $\Leftarrow$ AD 双边优化 $\not\Leftarrow$ AD 加权单层优化
			* 快速学习 $\Leftarrow$ AD 加权单层优化
		* 双边优化问题形式相关的其他问题见 ((n32e3d))双边优化
* （idea）应用于 meta inverse problem/design $\mu_\lambda$ 的可能方式：
	> 其实应该叫“learning to inverse design”，不是一般的 meta 含义
	* DeepXDE 版本，$z\xmapsto{\theta}[\omega,\mu]\xmapsto{\lambda}L$，在 $\{[\omega_\lambda,\mu_\lambda]\}$ 找低维结构（不必分别找）；
		* 注：这里的旧版本需重整；引用于 `invDesign-metaPINN:`“n1bf6y”；{n1bf6u}
		> 对非 meta 情形，如果 $\mu\in\R^d$，则直接训练 $s_\theta(\mu,x)$ 即可（反正 $\{\omega_\mu\}$ 维数不会比 ${\mu}$ 低多少）；其他情形 $\{\omega_\mu\}$ 通常不会低维，故非 meta 情形这种方法用处不大
		* 如果 $\mu\in\R^d$，网络形式 $s_\theta(z,x),\mu_\theta(z)$（两个网络其实参数独立或者部分共享，不在表达式里体现）；
		* 如果 $\mu\in X(D)$（例如 PDE 内部系数），网络 $[s,\mu]_\theta(z,x)$；
		* 如果 $\mu\in L^2(\partial D)$，分开两个网络 $s_\theta(z,x),\mu_\theta(z,y),y\in\partial D$
		* 难以直接处理 $\mu$ 无法直接参数化的复杂情形，需要转化，如形状转化为 SDF
	* 对于复杂的、需要以数据形式给出的可行参数范围 $\{\mu\}$
		* 此类参数例如电磁仿真的元器件位置形状，制造能力限制不是所有形状都可以造出来，可造范围由复杂的符号化规则给出，无法使用一个（可求导的）loss 表达某个形状的“可制造程度”，只能按照数据输入网络（虽然也可以 active learning）；
		* $\{\omega_\mu=\operatorname*{\arg\min}_{\omega}L^\mu_\text{PDE}[\omega]\}$，目标是 $\min_{\omega\in\{\omega_\mu\}}L^\lambda_\text{task}[\omega]$
		* 此时可以给出 $\{\omega_\mu\}$ 的低维流形表达，然后直接在该流形上优化 $L^\lambda_\text{task}$
		* 流形表达要求比 learning 更加严格，不再允许流形 $M_\theta$ 包含 $\{\omega_\mu\}$ 之外的点，需要其他变种的 generator；这可能比较困难，有时可能 $\{\omega_\mu\}$ 包含于某个流形内但本身不是流形（有分叉等非流形结构，因为 $\{\mu\}$ 的拓扑结构可能就如此），最后优化需要使用 $L^\lambda_\text{task}+L^\mu_\text{PDE}$
		* 得到 $\omega_\lambda$ 后反推 $\mu$，对于离散设计可能需要遗传算法、模拟退火之类的离散算法
		* 对于 $L^{\lambda,\mu}_\text{PDE}$ 也依赖于 $\lambda$ 的情形，可以考虑 $z=[z^\lambda,z^\mu]$，训练 $\theta$ 时 $(\lambda_i,\mu_j)$ 按网格生成，使用时对 $\lambda$ 先生成大量 $\mu_j$ 用 PDE loss 训练 $z^\lambda$（同时优化的 $z^\mu_j$ 不再需要）再针对 task loss 优化 $z^\mu$；但这方法看起来并不聪明，估计效果不行
* `invDesign-metaPINN:` 使用 meta-learning 加速的 PINN 求解反问题/设计问题
	* 以下记 PDE residual loss $L$，反问题观测误差/设计目标 $G$
		* 总 loss $L+G$，原则上 $L$ 项应加权且权重趋于无穷，以下简便起见省略；另外不能 Ritz loss ((n35e9x))PINNinvDesnBiOpt
	* （((n7vn70))invDPs 框架下）不同 invDP 场景视为任务、训 metaL
		* 要求：有大量 invDP 场景 $\eta$ 作为数据，可能也已有相应真解
			* 自行估计 $\eta$ 分布（往大了估计）的做法大致也属于这类，以及随机生成 $\lambda$ 后再获得相应 $\eta$；
			* 可利用这些信息发掘“问题分布”等 meta objective
		* 训练 loss $L[u;\lambda]+G[u,\lambda;\eta]$
		* AD 用于这种场景：找 $\{(\lambda_\eta,u_\eta)\}$ 的低维结构，见 ((n1bf6u))；{n1bf6y}
		* MAML 类做法相当于找初始化 $(\lambda_0,u_0)$，或对 $u$（可还包括 $\lambda$）进行参化表征后，找其参化的初始化
	* 不同 PDE 参数视为任务、训 metaL（即针对正问题的 metaL），并将其用于下游 invDP
		* 注：这里考虑的是 invDP 加速，针对正问题的 metaL 也只面向加速
			* 一般 invDP 可能需考虑反问题观测不足、反向设计有可制造约束等，需通过 `invDP%` 中方法刻画该约束，最终只剩下计算速度的问题之后，才考虑继续使用这里的框架
			* 两部分互不干扰，例如 $\lambda,u$ 均用 AD 参化，前者用于缩小假设空间，后者用于加速求解
		* 只考虑单个 invDP 场景，下游 loss $L[u;\lambda]+G[u,\lambda]$，正问题 metaL 训练 loss $L[u;\lambda]$
		* 找初始化的做法（MAML 类）可能不再高效：
			* 元训练内层 loss 与元推断（下游 invDP 应用）loss 不同，对前者的好初值未必对后者也好
			* 元训练内层只优化 $u$，下游应用同时优化 $\lambda,u$
			* 下游应用中 $\lambda$ 随迭代变化；metaL 能保证从 $u_0$ 变到 $u_\lambda$ 快，但从 $u_\lambda$ 继续变到 $u_{\lambda'}$ 未必快
				* 每次都从 $u_0$ 重新初始化的做法看起来更不可取
			* 不过在这种解读下可能仍能加速：考虑 NN 参化映射 $\theta\mapsto u_\theta$ 非单射情形（如 `ReptileIdeas:`），MAML 找到好初值 $\theta_0$，使 $\theta$ 在其小邻域内变化时，$u_\theta$ 已可（或近似地）取遍解流形
		* hypernet/NO surrogate，下游 loss 只有 $G$ 项、优化自变量仅 $\lambda$ 而无 $u$，加速潜力大
			* 一个前提是 metaL 阶段 $\lambda\mapsto u_\lambda$ 要训练好，这可能有难度；且不擅长处理 $\lambda$ OoD 情形
			* `2110.13297` 用 PI-DeepONet 进行了这种做法
			* 可能性：hypernet 仅用于生成 $u$ 的初始参数
		* AD，下游优化问题自变量空间 $\Lambda\times Z$，维数低于 PINN $\Lambda\times U/\Theta$
			* 若考虑下游问题对 $\lambda$ OoD，或需考虑同时 fine-tune AD 主网络参数；不过不排除会遇到和 MAML 类一样的问题
		* 注：若认为正问题 metaL 训练后表达力仍不足，则用于下游 invDP 时可同步微调 $\theta$，其形式同 invDP from-scratch
			* 区别仅在 $\theta$ 在那里是从头训，而非微调；另外 hypernet loss 需用回 $L+G$
	* 仍针对正问题的 metaL、用于下游 invDP，但同时优化一组（而非单个）PDE 参数
		* 类似 粒子群算法、SVGD 等
		* naive PINN 需要同时解一批 PDE，在不同参数间无共享部分，速度很慢
			* 写文章或可考虑与单 PDE 参数的 PINN 比较
		* hypernet/NO surrogate，下游 loss 仅 $G$ 项、优化自变量仅 $\lambda$，与普通粒子群算法无区别
		* AD 与下方 from-scratch 一组 PDE 参数情形，只是 MAD-L 不优化 $\theta$，MAD-LM 可在后期才优化 $\theta$
	* invDP from-scratch 求解，不过算法用 metaL 思想加速
		* `invDP%`“n1ch8h”考虑的 $\lambda\mapsto u$ 替代映射只需在最优 $\lambda^*$ 附近好用，包括直接推断的形式（hypernet 取值准）、算法形式（PINN 训练快）
		* naive PINN 训练：$\min_{\theta,\lambda}(L+G)[u_\theta,\lambda]$
		* hypernet：$\min_{\theta,\lambda}(L+G)[u_\theta(-;\lambda),\lambda]$
			* 相较 naive PINN，$\theta$ 更新幅度似能减小，从而加速；若 hypernet 训练较充分，则可能无需更新
			* 新颖性不高；似乎 PINN 原始论文就这么干了？
		* AD：$\min_{\theta,\lambda,z}(L+G)[u_\theta(-;z),\lambda]$
			* $\theta$ 缓慢变化，低维 $z$ 快速变化，较 naive PINN $\theta$ 快速变化应能加速
			* 似比不过 hypernet（在它可用时），仅在 $\lambda$ 无法直接作为网络输入时考虑用
		* AD 相当于在 $\lambda^*$ 附近拟合解流形
			* 非预先训练，拟合流形需动态调整，故不区分 MAD-L,MAD-LM
			* 后期接近最优，$\lambda$ 变化范围充分小，为局部拟合，使用线性的拟合流形已经足够（涉及局部 Kolmogorov n-width）
			* 鉴于前期 $\lambda$ 变化范围较大，AD 的非线性拟合流形应有作用
		* MAML，Reptile 等似用处不大：所有步骤均 online，不像 offline 对成本不敏感，元训练代价不值得
	* invDP from-scratch，同时优化一组（而非单个）PDE 参数，常需引入 metaL 思想以处理多 PDE 参数
		* AD：$\min_{\theta,\lambda_i,z_i}\sum_i(L+G)[u_\theta(-;z_i),\lambda_i]$
			* 强制各 task 共享 $\theta$，故只是 MAD-L
		* hypernet：AD 中取 $z_i=\lambda_i$ 即可
		* 可再加 $\lambda_i$ 互斥项，以模拟粒子群算法、SVGD 等
		* hypernet 仿照 `ISMO-2008.05730` 版本，$\theta,\lambda_i$ 交替（而非同步）优化：
			* 对给定 $\theta$（surrogate），优化 $\lambda_i$，目标函数仅 $G$
				* 按原版 ISMO，各 $\lambda_i$ 需重初始化，不从原来值微调？
				* 各 $\lambda_i$ 优化独立，可并行计算
			* 用所得最优取值微调 $\theta$，目标函数仅 $L$
				* 不同于同步优化版本：无需考虑 $L+G$ 中的加权问题
				* 不同于同步优化版本：此处不仅可只用当前最优 $\lambda_i$，还可将当前最优值汇总入历史数据、用所有这些历史数据训
				* 不同于原 ISMO：直接用 PDE 残差 loss，无需调用传统数值求解器
			* 暂不确定相对于同步优化版本 是否有优势
		* AD 仿照 ISMO 的交替优化版本：
			* 对给定 $\theta$（surrogate），优化 $\lambda_i,z_i$，目标函数 $L+G$（要加权；可并行）
			* 给定 $\lambda_i$ 微调 $\theta,z_i$，目标函数仅 $L$
			* 看起来意义不如 hypernet 交替版、AD 同步版，因为总要优化 $z_i$
	* `invDP%`“额外非设计参数”情形，$G=\mathbb{E}_\mu G[u,\lambda,\mu]$，$L=L[u;\lambda,\mu]$
		* 以下主要讨论单个 $\lambda$ 情形
			* 粒子群 $\lambda_j$ 情形，hypernet、AD 均补充 $\sum_j$，AD 再用 $z_{ij}$ 即可
		* 记号不再区分是否针对正问题用 metaL 预训：默认按 from-scratch，已预训的再固定 $\theta$ 即可
		* hypernet $\min_{\lambda,\theta}\mathbb{E}_\mu(L+G)[u(-;\lambda,\mu),\lambda,\mu]$，可对 $\mu$ Monte Carlo
		* AD 必须预先采 $\mu_i$：$\min_{\lambda,\theta,z_i}\sum_i(L+G)[u(-;z_i),\lambda,\mu_i]$
		* 若有部分参数有限维，则 AD 中这部分参数可直接作为网络输入，像 hypernet 一样
			* 例如 $\mu$：EIT 中为边界若干电极位置的电流，机翼设计中可能为风速（3D 向量）
			* 对未 metaL 预训、而 $\mu$ 可直接作为输入的情形，ansatz 可用 $u(-;\mu)$，从而介于（没有额外非设计参数情形的）PINN 和 hypernet 之间；仍可再像 AD 一样再输入 $z$
		* 随训练进行，可提高精度，动态增加 $\mu_i$ 个数；hypernet 直接增加 MC batch 即可
			* AD 新增时或需暂固定 $\lambda,\theta$、训练几步新增的 $z_i$；可从最近的已有 $\mu_j$ 初始化，或直接按原有 $\mu_i$ 一分为二的方式来进行新增
			* 写文章可对此 ablation
		* 注：若写论文，可将 from-scratch 版本称为 MAD-FS，有预训练版本仍称为 MAD-L,MAD-LM
			* 网络架构选取（modulation 等）可先在 MAD-FS 上试，得最好架构后再预训练
			* 实验除了机翼、EIT 还可考虑 Optic Diffraction Tomography（ODT），from 2023-02-03 导师 MAD 小群；{n23a0r}
				* 若用于 3D 机翼，ansatz 需小心设计，如 block-NeRF，或之前的 AD 区域分解想法
				* EIT 的病态性或部分来自数据（采样的 $\mu$ 个数）不足，但这部分从采样而言或许本身成本不高（用电流应该很快能得上千组数据？），可能只是传统无法同时处理大量数据、只能使用少量，从而才造成了需引入先验的问题
				* 注意若 EIT 系数场有突变，用 PINN loss 时需小心((n29l0z))
				* EIT 有时用于扫描动态物体（如心跳）？是否 CT 也会遇到差不多的问题？
			* 对 EIT，写文章时可强调好处：
				* $\mu$ 个数，可大批量；且不同 $\mu$ 对应的电极位置可以不同
				* 不局限于特定形状（之前无论是学反问题算子、学先验的多数都有此依赖性），无论是 FS 还是有预训练
	* 注：以上涉及多维度组合
		* invDP 问题，是否有非设计参数
		* metaL 算法，MAML,AD,hypernet
		* invDP 优化算法，是否引入粒子群等
	* 注：以下为旧版本，上面新版记录于 2023-01-11
	* 原始 PINN 求解的设定理解：在 $\Lambda\times U$ 空间找 $L^\lambda[u]+G_\eta[u]$ 极小值
		* 不适用 Ritz loss：$\min_uL^\lambda$ 取值依赖于 $\lambda$，联合优化时会出问题
		* TT (tensor train) 是否能做？未 check
	* 可能设定（观测/设计目标场景 $\eta$ 提供目标函数 $G_\eta[u]$，要找相应 $\lambda$）：
		> 以下均为 TODO，每个场景应该都能至少讨论 MAML, AD, hypernet 三种方法，以及确认其他 meta-learning 方法；
		> 另外这里只考虑 $\lambda$ 可进行连续优化的问题；对于形状等问题需要另行讨论；以及 BIP 多对一版本
		* 似乎除了第一种明确考虑对一系列 $\eta$ 加速（针对反问题的元学习）以外，其他都可用于针对某一 $\eta$ 的加速（元学习仅针对正问题）
	1. 有大量观测/设计目标场景，可能也已有相应真解，据此运行针对反问题/设计问题的 meta 算法
		> 自行估计 $\eta$ 分布（往大了估计）的做法大致也属于这类，以及随机生成 $\lambda$ 后再获得相应 $\eta$；
		> 利用这些信息发掘“问题分布”等 meta objective
		* AD 用于这种场景：见上方，找 $(\lambda_\eta,u_\eta)$ 的低维结构
		* MAML 类做法找初始化 $(\lambda_0,u_0)$；$G_\eta$ 的形式也可以不取定，而是来自一个分布
	2. 预先无观测/场景，自行生成一批 $\lambda$ 训练（针对解方程的）meta-PINN，遇到观测/场景直接推断
		* 针对解方程训练的 MAML 类可能不高效：从初始参数 $u_0$ 快速找到 $u_\lambda$ 快，但是 $\lambda$ 改变后从 $u_\lambda$ 转移到 $u_{\lambda'}$ 不行
			* 但也可能取决于解释，例如如果按照 $\phi\mapsto h_\phi$ 非单射的角度解读初始参数意义（如 `ReptileIdeas:`(metaL)），可能这种转移也还是快的
		* hypernet 如果能训练好（可能有难度），优化目标少了 $L^\lambda[u]$ 只有 $G_\eta[u]$，优化对象少了 $u$ 只有 $\lambda$，当然快；相当于间接 surrogate
			* `2110.13297`(AISC) 用 PI-DeepONet 进行了这种做法
		* AD 将优化问题搜索范围从 $\Lambda\times U$ 变成 $\Lambda\times Z$，$Z$ 维度接近 $\Lambda$ 而低于 $U$，$G\to Z\to\Lambda$ 的梯度传递效率应该高于 $G\to U\to\Lambda$（PINN 中在 $U$ 上的优化转化为在 $\Theta$ 上）
			* 不过 fine-tune $\theta$ 的版本可能遇到和 MAML 一样的问题
	3. 自行生成 $\lambda$ 预训练 meta-PINN，但认为真实遇到的观测/场景可能 OoD，推断时对模型 fine-tune
		* 是否可能 hypernet 仅用于生成 $u$ 的初始参数？
	4. 无预先训练，像 PINN 那样对特定 $\eta$ 直接上，只是使用 meta-learning 改进的版本加速
		* 相当于动态预测哪些范围的 $\lambda$ 为解的可能性大，现场针对这一分布跑元学习算法，“找 $\lambda$ 同时用现有的训 meta”，元训练、元推断耦合
		* 需拟合的任务分布只在 $\lambda^*$ 附近，为 ((n32e7d))domainShift 主动调整目标（任务）分布的框架
		* hypernet 做法：$u_\theta(x;\lambda)$，每个 $\theta$ 给出 $\Lambda\times U$ 空间的一条曲线（函数图像 $\lambda\mapsto u$），训练希望曲线在 $\lambda^*$ 附近拟合真实曲线
			* 传统 PINN 相当于对应常值函数图像，必须同时调整 $\lambda,\theta$；hypernet 如果在周围较大范围采样一圈之后，主要优化 $\lambda$ 即可，对 $\theta$ 只需微调
		* hypernet 可假定 $\theta$ 表达力不足，而允许其动态微调（若不显式输入 $\lambda$ 则为大改）
			* （后来追加）看 ((n3gd5l))hyperNet 中描述，“表达力不足”似指未充分训练，不像前一种预先训练的情形；这种情况当然需要参与训练，不止是微调
			* 为 ((n3gd5l))hyperNet 提到的一种应用场景；类似的有 `1805.09801` sec1.4 RL 应付 loss 函数（在元学习过程中）改变
			* $\theta$ 表达力有限的假定还用于说明 AD 元推断时微调的合理性
		* AD 在 $\lambda^*$ 附近流形拟合；由于训练推断耦合，有无 fine-tune 版本应无区别
		* 可能涉及两种双边优化（设计问题与元学习都是），解读：
			* 设计问题，目标本来就写成双边优化形式；对于元学习，双边优化是达成目的的一种手段
			* 目的-手段层级：找最优 $\lambda\Leftarrow$ 快速获得 $u_\lambda\Leftarrow$ 元学习 $\Leftarrow$ 双边优化
				* 手段都不唯一，第二个箭头是“用 PINN 解 $u_\lambda$”时才成立的手段
				* 第三个也只是部分可能性
			* （后来追加）该设定下，加速型元学习中使用双边优化的形式 有点奇怪
				* 双边优化元学习通常用于提高泛化性而非加速
				* 若提高 PINN 对空间采样点泛化性，则可减少采样点数以加速特定任务训练((n1gk49))，但在本设定下未必有收益：双边优化会增大训练成本，而这里所有训练都 online，不像 offline 时一样不那么在乎训练代价
				* 尽管双边优化设定下采样点数目（包括优化 $\lambda$ 的，以及泛化型双边优化训练本身相较加速型元学习）减少，但双边优化涉及内外两组采样点，若按 `2104.01677` 内层还要算两次以作差分，若不按则二阶导计算更慢
			* 设计问题双边优化的外层变量是参数 $\lambda$；元学习的外层变量是 $g:\lambda\mapsto u$ 涉及的元素，例如 AD 以假设空间 $U_\theta=\{u\}$ 为优化对象
			* 双边优化套娃框架整理于 `L2O加速双边优化`
	> 回忆有观点认为 PINN 正问题通常不太行，反问题有优势
	* 也许 `L2O加速双边优化`, ((n35f06))invCtrlRL-三层优化 对理解这些可能性有帮助
* `假设空间参化方式汇总`，形如 $Z\to H(X,Y)$，用何种网络架构实现；{n3vg75}
	* 注：目前似乎主要针对 $x,z$ 均为有限维向量情形讨论，尽管部分做法适用范围不限于此
		* 与 ((n3gd5l))hyperNet 超网络生成哪些主网络参数 的讨论似有重合，那里侧重于一般 $x,z$ 形式
	* DeepSDF 原版 $f_\theta(-,z)$；以及若干中间层都可以将 $z$ concat 进来作为额外输入；{n4dl2q}
		* 每个中间层都 concat 的做法另有 `CAVIA-1810.03642`
		* 代码实现的细节：第一层线性变换权重初始化，默认会依赖于输入维数，导致 $x$ 分配到的权重变小；可改实现为 $x,z$ 分别过一线性层后相加
		* 若 $z$ 只作为 MLP 输入，((n4dl2u))超网络的逼近阶分析表明，这种做法效率可能不如修改所有 MLP 隐层参数的做法
		* 相关：若 concat 内容也随空间位置变化，算((p8bf7k))INR-输入增广
	* modulation：基础 NN 给定，每层加额外 shift（有时还有 scale¹），只需对该 shift 参化（可线性参化）{n2il89}
		* `functa-2201.12204` secA.2 提到该做法
		* scale modulation：在 COIN++ 文章中说用处不大，但(('n8ig9i))对我们自己试的 PDE 任务似乎能提精度；{n92h7w}
			* INR MLP 架构（不涉及超网络）用类似参化方案((n92h7j))，并对 scale 用 exp 参化，以允许权重系数跨量级
			* 推广后版本，((_nb2l1u))对 INR 完整权重矩阵引入低秩 modulation，针对压缩任务
			* ((o3ll25))DiT 对 Transformer block 同时有 scale 和 shift modulation
			* 相关：DeepONet 的类似变种((p2bg0f))，不过不是用 z 调制 x 的网络，而是根据 (z,x) 联合信息调制 z,x 各自的网络
		* modulation 向量存储时可用很低的浮点数精度 `COIN++-2201.12904`，或表明其表达的 $Z\to H$ 映射 Lipschitz 常数小
		* 针对特定架构的 modulation
			* 若基础 NN 使用 MFN，则((n2il9j))modulation 后所得场可表达为变量分离形式 $\sum c_i(z)g_i(x)$，如用于含时 PDE 时成为时空变量分离
			* 若用于 PINN，或许最后一层线性权重也需参化；NeRF、SDF 等任务输出值的范围基本不变，可能因此才适合只管各层 bias
				* 用于拟合 PDE 解（有监督）时发现这样会导致效果下降(('n8cg48))；该技巧或许需要把输出幅度调整到特定区间才可用，默认取值不 work
			* 基础 NN 为有网格 FNO 时，((n8ja9w))CTFNO 对其权重矩阵的调制采用矩阵乘形式；{n8jb05}
			* 针对 Transformer 的 adaLN((o3ll25))，相当于改写 layer-norm
		* modulation encoder，生成调制向量的超网络（可能输入低维向量）
			* 所有层 modulation 均由一个 encoder 给出，且 encoder 输入为隐向量 $z$ 的情形：相当于用 $z$ 对 modulation 参化
				* 参化方式可包括线性参化、子集限制（只保留若干层 shift、直接作为 $z$），此时相当于用表达力受限的 encoder 架构
				* `functa-2201.12204`“n2ha6p”子集限制效果比线性参化稍差
				* 等价架构：带线性参化 encoder 的网络 等价于 DeepSDF 所有中间层都 concat $z$，记于 `CAVIA-1810.03642`
			* COIN++ 用 MLP，另可((n8vg4p))用 CDE
			* 超网络中引入 layernorm 对性能重要((nb2l1e))；{nb2l28}
			* ((o3ll1o))DiT modulation encoder 超网络最后一层权重用零初始化（从而初始化时 Transformer 相当于只有 residual block）效果好
		* 交叉注意力((nbih2c)) 视为特殊的 modulation 机制；{p5kg1c}
			* 属于 shift modulation，不涉及 scale 调制
			* modulation 值不仅依赖于外部条件 z（即 KV），还依赖于当前激活值 h（即 Q）
			* 外部条件（z，KV）长度自动可变，无需额外引入特殊的 modulation encoder 来允许这点
		* modulation 依赖于 x 则属于((n3vf61))INR-坐标每层反复输入，无论它是否同时依赖于 z
			* 依赖于 x 所在区域、patch((p48e5p))，算是间接依赖于 x
			* 同时依赖于 x,z 情形
				* coordinate-aware modulation CAM((_p44f2v))，z 为网格离散，据 x 双线性插值得 modulation
					* 即：类似 ((p44f3l))grid-based INR，插值结果引入位置为 MLP 中间层而非输入层
				* ((_p44e9a))空间基底线性组合、组合系数线性依赖于 z
		* 概念澄清v1：modulation 指作用于主网络激活值 以影响其前传行为
			* 影响主网络前传行为的多种方式见((p4pb1p))旁路输入
			* 图形化表示，((p4pb0v))与作用于主网络参数的 hypernet 用不同示意图
	* 对有特殊架构的网络，可((n3vg40))针对性地参化其中的部分参数
		* ((oa2b1i))物理场表征—散点离散、参化复合—modulation
	* `tileAD+sinArch-2104.03960` $z,x$ 都是网络输入，但走两个不同网络，其间不断交换信息
		* `functa-2201.12204`“n2ha3d”认为其精度不高
	* NN 部分层的参数
		* `LRasAD:` 相当于参数化 $Z\to F$ 后，还用函数空间 $F$ 参数化 $H$ 中的流形 $F\to H$
		* 特例：最后一层的参数组成 $Z$，则算下面 $Z\to H$ 为线性映射情形
	* 主网络参数量可变情形：((n54f4n))Transformer 中主网络输入给出 Q、被参化部分为 K,V；{nase8f}
		* 由于 K,V token 可变，可认为对假设空间进行的参数化不是有限维的，而是（类似多项式函数空间那样的）无穷维
	* $Z\to H$ 为线性映射情形，某种意义上已成为{基底表达}；{n8gh41}
		* 要求关心的解集有低 Kolmogorov n-width `NOMAD-2206.03551`
		* DeepONet 即此情形
			* 实现的一处细节考量（影响不大）：((n8gh3s))最后一层引入缩放因子，以保证末层初始化良好（有单位方差）
		* NN 最后一层参数作为 $Z$，前面层参数预先学习确定：如 ANIL，`2105.14633`
			* 前面层参数可由 元学习 确定
			* 前面层参数还可来自 其他任务预训练，迁移学习到当前任务后不再调整：`pretrain-1904.04232`, `tuneNNwhichLayer:`
				* ((_n3vh0y))一种看起来价值不大的做法，各任务训独立网络，当前任务网络表达为这些网络的线性组合；不过此时的一个好处是，用于预训练的任务可用贪心算法选取
			* ((_n3vh0c))若空间场的采样点取定，可预先计算前面层在各个采样点上的输出、时空导数值，从而对 $z$ 的训练代价降低
			* 若允许网格，似乎就是 POD-DeepONet
		* NN 最后一层参数作为 $Z$，前面层参数随机生成、不训练：见 `coordMLP%`“ELM”
		* 其他非 NN 形式传统基底见 ((n32e9r))场的数值表征，如 `PINO-2111.03794`
		* $z$ 作为基底表达系数，可通过线性最小二乘求解，而不再需要解优化问题，如 `2105.14633`，`coordMLP%`“ELM”
			* 解 PDE 情形见 `singlePDE%`“ELM”，内部、边界给出的方程组联立；包括非线性 PDE 可能导出非线性最小二乘问题
			* 传统 FEM 也用 Galerkin 弱形式，不过似乎不涉及 BC
	* （常见于 ((n31m5r))数据压缩）NN 参数稀疏扰动 $f(-,\theta+z)$，$z$ 稀疏；{ncnc0l}
		* 通常为不定长编码，可为难表征数据使用更长编码（传统 JPEG 等编码也有此特性）
		* 此时 $Z\ne\R^n$ 通常不为维数给定的向量空间，或许更像长度可变的多项式空间 $Z=K[X]$；$z$ 各分量除了取值之外，还需要标明其扰动的是网络全参数 $\theta$ 的哪个分量
		* 相关：((ncnc0n))场的隐向量表征-隐向量稀疏性，((ncaa47))对隐向量引入正则化
	* 注：架构还可结合 `coordMLP%` 中做法、从而引入其他约束等
		* 例如可能性：结合 `BINet-2110.00352`，只参化边界上定义的函数；用于处理含参 PDE 问题时延拓到内部所用基本解可随微分算子变化
	* 以上讨论架构；这里讨论给定参化方式后，其参数 $\theta$ 的训练方式，以及是否学 $z$ 初值：
		* 双边优化 `unifyMethod2:`“学 $H$”，如 AD；不包括 $z$ 初值
		* MAML 型元学习，如 ANIL，包括 $z$ 初值
			* `CAVIA-1810.03642` $z$ 为每层额外 bias 的线性低维表达的形式，与 $\theta$ 中部分参数（自带的 bias）为求和关系，故其初值无关紧要；其内层学习率也不重要
		* 若用于 ((n3gd5l))hyperNet 主网络，$z$ 由外挂超网络直接生成而无需指定初值（混合版本 `LEO-1807.05960` 等除外），$\theta$ 也可按简单优化训练
			* 另：((n3gd5l))hyperNet 讨论了 $z$ 部分学初值、可优化的情形，无需所有分量一致
		* 用 AE，编码器在训练完成后可丢弃 `CROM-2206.02607`，不学 $z$ 初值
		* 相关：元学习中学初值并基于其微调，原理上可行性或许可理解为 `元知识存在性` 假设空间流形
	* 隐向量 $z$ 作为场 $f$ 的表征，$F(X,Y)\to Z$：{ncnc0b}
		* 给定 $f$ 获取 $z$
			* 基于 $Z\to F(X,Y)$、优化找 $z$，见((n2h89x))优化隐向量
			* 另一方法：((ncnb69))nf2vec $\Theta\to F(X,Y)$、$\Theta\to Z$，$\theta$ 靠优化获得（优化初值固定）、$z$ 靠另一 NN 前传获得
		* $z$ 稀疏性；{ncnc0n}
			* 自动出现的稀疏性：若 $Z$ 维度本身有冗余（大于数据流形维度），部分架构可学出稀疏的 $Z$，如观察到(('nc1j6y))MFN 隐向量稀疏性高于 Siren，或表明 MFN 架构更优秀
			* 设计中引入稀疏性((ncnc0l))
			* 相关：((n4ta57))隐向量含义-有结构隐向量，((n6sf8q))取值总数有限的隐向量
		* 所得的 $z$ 用于下游任务；{ncnb9m}
			* 可能包括：((n31m5r))数据压缩，表达((n32f2t))随机场，生成模型（通过((n5bk3f))隐空间生成模型 来((n3vg4l))刻画随机场）
			* `functa-2201.12204` 函数空间的推断、生成等任务可由 $z$ 代替来完成
			* ((_ncnb9z))nf2vec 下游任务包括 分类，非条件生成，retrieval，分割，曲面重建，补全
* 函数族（图片、形状数据集等）表达可用 Siren 作基础网络、用每层不同 shift 表达不同的特定函数
	* 混合做法
	* 可参考 ((n3gd5l))hyperNet
* `ADvsAE:` 与 AE 的比较
	* 在无穷维空间（如函数空间）学习时，AE 输入需要对无穷维向量做显式有限维近似；
		* 不过不排除通过 `NO%` 里的一些做法可以做到
		* `1-s2.0-S0045782520307532` 的做法利用流形学习的思路（Laplacian pyramid 试图找流形参数化）大致也能表达解码 $z\mapsto u$，但是看起来不如 AD 灵活
	* 并且输入的函数有多尺度等的结构时，AE 不高效？
	* 即使是有限维，{AE 可能需要隐空间维数冗余}
		* 从而不适合流形估计维数的任务，见((n32f1h))流形学习
		* 例如二维空间、数据组成圆，连续的编码器无法将它变换为直线，无法捕获一维结构
	* 即使有限维平凡拓扑，共享解码器 $D(z)$，AD loss 与 AE loss 也可不同！
		* 例如数据为长矩形（内的均匀分布），$D(Z)$ 为其三边（去掉一个短边），则 AD 最优 $z$ 关于 $x$ 不连续
* `AD-UAP:` 作为元学习算法的 approximation 能力
	* 注意 NN 架构不是必要的，可以按一般框架来看（函数 $f(x,z)$ 或假设空间 $H$ 的存在性）
	* 作为双边优化类算法无法表达任意的 $g$ `metaModelUniv:`(metaL)，这点弱于有限更新 MAML 类算法，更弱于 hypernet
	* 单样本情形，似乎能拟合的充要条件是 数据按任务组成等价类，即：
		1. $g(x,y)(x)=y$，
		2. $g(x_1,y_1)(x_2)=y_2$ 时 $g(x_2,y_2)(x_1)=y_1$
		3. 若 $g(x_1,y_1)(x_2)=y_2$, $g(x_2,y_2)(x_3)=y_3$ 则 $g(x_3,y_3)(x_1)=y_1$
		* 此时 $H=f(x,y,\cdot)$ 即可，作为参数化有重复，但在同一个 argmin 内时是等价的
	* 多样本情形应该做什么假定？
	* 也许可以把 hypernet UAP 性质搬过来用于证明，存在 hypernet $f_\theta(x,z=\sum\phi(x_i,y_i))$
		* 包括 DeepONet 的 UAP 证明
	* 可能的重点之一：NN 表达能力，假设空间要求不能少也不能多（argmin 需要唯一），后者对 NN 需考察
	* 对 PINN 问题的表达能力：
		* 区域形状可变情形，若都能变换到某确定的参考区域，则网络能表达：前几层先把 $x$ 变成参考区域的 $\tilde x$，$z$ 不变，随后的层直接用区域固定情形的 UAP 性质
* 试图 justify 论文假设 2（近似低维），先考虑 PDE
	* 可能的问题分类
		* 含时方程，$G$ 为固定时间步长的演化算子 $u(x,0)\mapsto u(x,T)$
		* 含时方程，$G$ 为解算子 $u(x,0)\mapsto u(x,t)$ 获得完整的时空变量函数
		* 不含时方程，例如椭圆方程等
	* 若 $G$ 为 $L$-Lipschitz 且 $A$ 近似低维，则 $G(A)$ 近似低维，gap 从 $c$ 变成 $Lc$
		* 注意涉及度量选取；若 $A$ 涉及区域形状，可先变换到标准区域
		* 对线性方程，若 $A$ 线性，可试图给出 $A$ 按模长大小排列的某种特征向量分解，证明这些特征向量上满足 Lipschitz 即可，尤其是含时方程
			* 不含时方程可考虑用 Green 函数给出的解表达来证明 Lipschitz 性质
		* 非线性方程，可能考虑用类似 Koopman 算子的方法转化为线性方程
			* 原版的完整 Koopman 无视了原空间的概率分布结构，且新空间（函数空间）也没有近似低维性质；故直接考虑有损版本的变换，ML 中可用 AE 学的那种
			* 不含时的也许可参考 `DeepGreen-2101.07206`(AISC)，也是用 AE 转化为线性方程
			* 变化后 $A$ 未必线性（例如未必 GRF），不过只要变换 Lipschitz 且变换前近似低维，则变换后的 $A$ 也近似低维，结论还是可用
	* 可能的证明手段包括：离散网格解近似低维，网格分辨率趋于无穷下保持
		* 可用于 Darcy flow 这样不好描述 $A$ 性质的情形
	* 部分内容见 `2022-01-05`
* 编程实现可能用到：
	* 不规则区域生成问题和 ground-truth：取巧的办法是直接生成真解然后拿到边界条件；真解可以是解析解，如果嫌这样解流形形式已知，可以在大区域上（比如圆，或者方便调用传统方法的矩形）给定边值生成解，然后限制在不规则子区域上得到测试问题
	* 原文总结部分提到对 $z$ 的优化也许考虑 Gauss-Newton 等做法取代 Adam；也许 Adam 针对高维优化问题设计，我们降到低维就可以改采用更加合适的优化器？
	* $z$ 可以考虑在中间输入，而不一定一开始就和 $x$ 一起输入；有的工作输入问题参数（这里的 $z$ 与之类似）是在快要输出的位置 concat 进来，因为影响的方式需要如此；此外如果输入 $x$ 需要升维（例如加入 sin，或者 MscaleDNN）这样也很方便
		* 引入不一定靠加或 concat，还可以靠乘
	* 网络结构设计，试着使用 loss landscape 可视化工具查看 $z$ 空间 loss 形态？
		* MAML PyTorch 非官方实现可以看出架构，ANIL 应该是采用相同架构
		* ANIL 文章里有比较 MAML 各层的 fine-tune 多少（CCA 指标），我可以在 fine-tune $\theta$ 的阶段也比较一下
	* 在 $z$ 空间做 PCA，看它与 $\lambda$ 的对应关系（散点图，几个点周围注释 $\lambda$ 形态，例如形状等）
	* 考虑 BN 层是否有可能引入/使用替代版本
	* `2206.00711` 训练阶段可用 batch，另可在输入坐标加随机噪声以提高泛化
* 论文撰写可能涉及（idea）：
	* 引入已有算法的新解读，表述可参考 LLAMA 用 HBM 解读 MAML（`HBM-MAML-1801.08930`(metaL)）
	* hypernet $f(x;\phi_\theta(z))$ 与 $f(x;\theta,z)$ 的等价性，对网络设计是否有指导
	* 在高维方程求解上是否有优势
* 本科毕业论文&部分实验结果(('q4ta6b))

## Related Work
> 不同于普通文献整理，这里强调与 DeepSDF 的相关性，会有 `(compare with) tag`, `cited-by` 这样的 tag
* AD
	* [7,20] AutoDecoder 用于有限维问题的例子（图像生成，矩阵补全）
	* `2206.00711` 反问题用 AD 表达待恢复系数场
* `GON-2007.02798`: #AD, #generative_model
	* "G RADIENT O RIGIN N ETWORKS"；基于 VAE 的生成模型，改成 AD 形式，用优化问题求解得到隐向量
* `SRN-1906.01618`: #AD, #SDF, #citing_DeepSDF, #inverse_problem, #meta-learning/#few-shot
	* "Scene Representation Networks: Continuous 3D-Structure-Aware Neural Scene Representations"
	* SDF 训练依据不再用逐多个点上取值，而是用不同角度渲染得到的图像，属于反问题
		* 提到了推断阶段可以 few-shot，只使用少数角度重建 SDF 及 3D 形状
	* 渲染算法可训练（alg1 涉及 LSTM）；（> 猜测能保证正确性，训练只为提速）
	* $f_\theta(x,z)$ 现在使用 hypernet 构造，文中记号 $\Phi_{\Psi(z)}(x)$
	* 训练对象包括渲染算法、AD 参数；推断仍只涉及 $z$
* `funcGAN-2102.04776`: #AD, #DeepSDF, #GAN, #rand_func
	* 训练 GAN 表达随机函数，用于生成分辨率无关的随机图像、3D 形状等
	* "Generative Models as Distributions of Functions"
	* sec3.1:1 文中采用 NFD（neural distribution of functions）这一称呼
	* hypernet 输入随机向量，输出网络参数，以此刻画网络参数的分布，进而表达函数的分布
		> 元学习中 hypernet 输入数据集，与这里不同；输出则与这里一致，这里叫 hypernet 没问题
	* 用 GAN 训练，sec3.4 判别器使用点云分类器，PointConv 等
		* 不使用 CNN 的原因：希望与分辨率无关
		* 实验发现 PointNet 与 DeepSets 不足以满足需求：输入数据集 $\{(x_i,y_i)\}$ 时，体现 $x_i$ 在坐标空间的距离很关键，尤其对于 large scale 数据集；{_o12g3l}
			* sec3.6 set functions 的 Lipschitz 常数很大，导致 GAN 训练不稳定；具体论证在附录
		* PointConv 特点：每层关于平移、重排不变，使用网格上排列的 $x_i$ 时效果接近常规 CNN；{_o12g45}
		> 我解读的 PointConv：点云邻域连边，边有 feature $x_i-x_j$，用 GNN
		* 脚注 1：GNN 卷积有加速方式，通过重排求和来明显加速计算
		* 下采样实现为随机扔掉部分点，做 average pooling
			* sec6:3 训练稳定性变差，改用 patch 内而非全局的采样也许会缓解
	* sec3.5 训练 loss，惩罚项
		> 与 WGAN 稍有区别，WGAN 的惩罚项是希望判别器梯度 $\nabla D\approx 1$，这里是希望它尽量接近 0
	* 里面提到 auto-decoder 是“embedding functions into a latent space”的做法，并且不适用于生成模型任务，有实验
		> 这也不难理解，类似 AE 不适合用于生成任务，只有一部分的 $z$ 表达的是合理数据点
	* 实验：生成 CelebAHQ 人脸图像（作者所知的最早用连续方式建模如此复杂数据集的文章）
		* 超分辨率（> 其实是说明生成图像的分辨率高于训练集分辨率，不是给定一张图片做超分辨率）
		* 生成 3D 形状
* `2009.05290`: #AD, #citing_DeepSDF, #point_cloud
	* "Unsupervised Partial Point Set Registration via Joint Shape Completion and Registration"
	* AD 用于点云补全，并与点云匹配（两个点云之间差多少旋转）任务共享信息
* `tileAD+sinArch-2104.03960`: #AD, #compared_with_DeepSDF, #Siren, #NN_architecture, #image|#video|#surface
	* "Modulated Periodic Activations for Generalizable Local Functional Representations"
	* 认为 AD 使用 sin 激活函数时，$x,z$ 不应该 concat 输入，sec3.1 设计了相应输入方式和网络架构（外挂 ReLU 网络）
	* （评）为 `假设空间参化方式汇总` 的可能性之一
		* 若主网络内前传理解为动力学，加入外挂网络可理解为 ((n35f0h))invCtrlRL-耦合另一动力学，这是 hypernet 设计的方式之一
		* `functa-2201.12204` secB.2 称该架构精度不如 LatentModulatedSIREN
	* 此外 sec3.3 tile 做法，全空间打网格，每个网格对应一个 $z_i$，即只负责拟合局部；{_oc2987}
		* 网格坐标 rescale 到 $[0,1]^2$ 输入 AD；{_q8s66b}
		* 为连续性，tile 划分使用单位分解 fig5，即网格有重叠
* `1-s2.0-S0045782520307532`: #manifold-learning, #NO, #solution_manifold
	* PDE 不同参数的解组成图，图上做 diffusion 以给出解流形参数化，并用于建立神经算子
	* "Diffusion maps-aided Neural Networks for the solution of parametrized PDEs"
		> 2022-01-20
	* 解 $u$ 与隐向量 $z$ 对应方式：
		* $\{u_i\}$ 数据，视为完全图的顶点，eqn(1) 根据距离给出边权重
		* eqn(5) graph Laplacian 特征值 $\lambda_j$，特征向量 $\psi_j$
		* eqn(8) 前 $n$ 个特征向量给出与隐向量的对应 $(\psi_j):u_i\mapsto z_i\in\R^n$
		> 该编码映射似乎无法对任意 $u\in U$ 计算隐向量，从而不算 encoder
	* eqn(24) 利用 Laplacian pyramid（LP）给出 $z\mapsto u$
		> 这次是对任意 $z\in\R^n$ 可计算对应 $u$，但是好像未必保证 $z_i\mapsto u_i$
		* 求和，用 $u_i-u^{(l)}$ 加权平均（$u^{(-1)}=0$）
		* 权重根据 $z$ 与诸 $z_i$ 距离给出（高斯核），并且求和层数 $l$ 越高所用高斯核标准差越小
		> 如果总层数 $L$ 太大，似乎最终是离 $z$ 最近的 $z_i$ 占优，导致解等于 $u_i$；从而此时 $z\mapsto u$ 映射接近分片常数，区域划分为 $z_i$ 给出的 Voronoi tesselation
	* 建立 NO：训练 surrogate NN $\lambda\mapsto z$（文中记号 $e=(\theta,t)\mapsto z$）
		* 推断时再用 Laplacian pyramid $z\mapsto u$ 获得解
	* > (mine) 和 AD 一样都可用于无穷维空间建立隐向量，但显然不如 AD 灵活
		* 在数据 $u_i$ 很多时，$z\mapsto u$ 的训练与推断代价都高
		* AD 只训练代价高，推断所需的所有信息都在网络权重里不会减速，不像这种 lazy-learning 做法
* `GLO-1707.05776` 训生成模型，随机为每样本 $x_i$ 生成隐向量 $z_i$，只优化解码器 $\theta$，无编码器
	* "Optimizing the Latent Space of Generative Networks"
		> created on 2022-03-23
	* Generative Latent Optimization (GLO)
	* 使用 Laplacian pyramid loss $\sum_j2^{-2j}|L^j(x)-L^j(x')|$，$L^j$ 表示图片 $x$ 的第 $j$ 层 Laplacian pyramid 表示
		* 多尺度细节赋予相近权重，不像 L2 距离那样惩罚边界的微小移动，从而避免其模糊化问题
	* 在隐空间进行图像插值
	* 条件生成，通过优化 $z$：设有差图 $x$，求极小化 $\|P(g(z))-x\|$（$P$ 可为下采样、遮罩等）
		> 若将图像重建问题视为优化问题，则功能上有点像元学习，只是训练 loss 没有特别体现；
		> 相当于学出了 $z$ 参数化的图像流形！
* `Siren-2006.09661` sin 激活函数及对应初始化策略，实验包括图像、PINN 求解 SDF 和 Helmholtz 等方程
	* "Implicit Neural Representations with Periodic Activation Functions"
		* Vincent Sitzmann, Julien N. P. Martel, David B. Lindell, Alexander W. Bergman, Gordon Wetzstein
	* sec4.3 Helmholtz 方程正问题，Gauss 点源，PINN loss
	* sec4.3 Helmholtz 反问题 FWI；{n2ib0q}
		* 除了波场 $\Phi$ 以外，速度场 $m$ 也用 SIREN 表达；{n2ib0j}
			* （评）我预估为保证其非负性质，$m$ 应表达为 NN 输出过一个 exp
		* eqn(14) 具体问题求解时，PDE loss 与 data loss 加权得总 loss，优化即可
		* eqn(13) 预训练，PDE loss 与 slowness loss 加权，后者为 $\|m(x)-m_0\|_1$，$m_0=1$；{n2ib19}
			* （评）前一项针对的系数场 $m$ 也待学，由于后一项促使 $m$ 接近常数场，我认为这里其实可 $u,m$ 分开预训练，$m$ 直接用有监督训练使接近常数波场，$u$ 用系数场取常数的 PDE 预训练
		* 优化算法，用了基于 ADMM 的 principled 方法（有引文）？{n2ib3n}
	* （评）相关：
		* `functa-2201.12204` secA.2 提到函数族（图片、形状数据集等）表达可用 Siren 作基础网络、用每层不同 shift 表达不同的特定函数
		* `2111.15135` 分析 sine 好用原因、提出更好激活函数
* `2111.15135` 理论分析 sin 激活函数好源于二性质，几个非周期激活函数也好、关于参数初始化更稳定
	* "Beyond Periodicity: Towards a Unifying Framework for Activations in Coordinate-MLPs"
		> created on 2022-07-29
	* rmk2 好激活函数需满足 2 性质：Q1 局部 Lipschitz 常数上下界…，二阶导非零且连续
	* 新激活函数例子：Gaussian $\exp(-ax^2)$，exp-sine $\exp(\sin ax)$
	* table1 若干已有激活函数、新提出的激活函数各性质比较，常见已有激活函数仅 sine 满足二性质
		* （评）怎么感觉 Q1 和激活函数是否含参数 两栏是一样的？
	* 实验主要是 CV
	* 注：本文未引用无激活函数的 `Fathony2021MFN`，自然也未与它比较
* `2208.04924` 分析 NN spectral bias（通过联系 FEM 理论），提出用 hat 激活函数好于 ReLU,tanh（未比较 sine；备用）
	* "On the Activation Function Dependence of the Spectral Bias of Neural Networks" by 许进超
		> 2022-09-03 CSImeet 群导师推荐
	* 摘要：我们通过利用与有限元方法理论的联系，为 ReLU 神经网络的谱偏差提供了理论解释。
	* hat 函数：分段线性 B-spline
	* （评）未比较 sine，因此理论完备程度可能不如 `2111.15135`？
	* 实验，最后一个是 MNIST 二分类子问题（其他都是 coordMLP）
* `VAD-1903.00840` （备用）用 ELBO 的生成模型，针对数据不完整观测；名字有 AD 但与 DeepSDF 无关
	* "Variational Auto-Decoder: A Method for Neural Generative Modeling from Incomplete Data"
		> created on 2022-11-22
	* 针对的情形：ground-truth 随机变量 $p(\hat x)$ 在 $\R^d$ 中，观察到的数据会有部分分量缺失，相应的观测随机变量 $\alpha\sim\{0,1\}^d$；在数据中已知哪些分量不可观测
	* 训练完毕后，采样也是在隐空间采样、之后通过解码器生成数据
* related work: 
	* "Transfer learning based multi-fidelity physics informed deep neural network"
	* "Transfer learning enhanced physics informed neural network for phase-field modeling of fracture"
	* VAD "Variational Auto-Decoder: A Method for Neural Generative Modeling from Incomplete Data"（训练目标 $p(x\mid z)$ 不涉及 encoder）；（另有 GrAD 处理从 $z$ 生成 graph 结构的工作，这里不放进来）
	* "Deep Meta Functionals for Shape Representation" hypernet SDF
	* MetaSDF `2006.09662`, OoD 泛化好于 CNP（这个标准下没有比较其他）
		* 实验发现 MetaSDF 的 $z^*$ 不对应有意义形状而 DeepSDF $z=0$ 能对应
		* 注意文中好像部分地方使用 concat 指代 DeepSDF；此外还可能指代引文 2；引文 8 按文中说法似乎是 DeepSDF 的 hypernet 版本
	* `1909.11446` “Decoder Choice Network for Meta-Learning”，看起来涉及参数空间降维；当时无引用故降低阅读优先级，未仔细看
	* `~/AISC/scanlist/+o-paperLists-NN+PDE` 里提到的文献
	* `NOMAD-2206.03551` 也用 decoder $f(\beta,y)$ 表达映射 $\R^n\to L^2(Y)$
	* 含参 PDE 的 AE ROM 系列工作（大领域），在 `paramPDE%`“ROM”，例如 `1812.08373` 及其 arXiv 引用
* compTree 关于加速参数化 PDE 求解，里面有汇总元学习加速 PINN 的工作

## Research Ideas/Directions
* (2021-04-15 MR) 理论部分，DeepSDF 的有效性描述给出一个严谨的理论（不是只用实验说明有效性，先把理论讲清楚）
	* 对 $\{\lambda\}$ 做一些假设（给出合适的条件），使得“流形”的某个描述确实成立；本来应该是一个无穷维子流形 $\{u^\lambda\}$（是流形也要说明），为何可以用一个有限维的 $\{u^z\}$ 逼近
	* 周老师提议，除了使用流形描述，还可以把 $L^\lambda$ 视为给出了一个 $X$ 空间上的测度（概率分布？），被 $z$ 参数化的子集落在测度大的区域；“近似”的含义，如果 $X$ 为可分 Banach 空间，可以视为元素在某个基底下展开得到的系数做某种 perturb 之后落在 $z$ 给出的子集内（> ？）
		> 原文就是用概率框架解读的，先试着整合原文的理解；原文 $p(X_i\mid z_i)$ 假设 $s_j$ 两两独立，而不是 $x_j$ 接近的那些 $s_j$ 有相关系数，如果要推广到函数空间分布应该需要修改；
		> 不过原文的解读就是在极大似然，最多用于加速，无法用于泛化类元学习（需要双边优化形式，但极大似然无法体现）；
		> 仿照 NP 系列工作使用随机过程建模？似乎那里只针对有监督问题，尤其回归问题
	* DeepSDF 方法未必很新（和 ANIL 比较像），但是它的数学解释可以是一个重要 contribution
	> 问老师一个理论应该长什么样子，可能需要看一些之前的例子；NTK 的理论倒是大致知道，但似乎和我们的这个不太一样；看 lyp 学长的组会 slides？
	* (2021-05-08) 不好找人合作，他人应该不会感兴趣；可以找人提供一些看法，例如告诉我们什么理论可能有用，什么（纯数）研究者的工作方向可能有关、我们可以找一找他的文章；纯数老师通常忙，可以问他们的学生，下次讨论也可以问周老师
	* 先搜文章（尤其纯数），例如“PDE solution manifold/space”之类（要多试错），model reduction 也包括
	* 要知道自己需要什么样的理论
	* 如果还是没有方向，我们最后还可以考虑自行建立一套相关理论
	> NN 表达函数分布的部分方法见 ((n32f2t))NN表达函数空间中分布，但不是理论分析它应该是什么分布
	* （2021-06-04 CSI 讨论）理论指导意义包括 PINN 在什么情况下要重训，robustness 即外推能力
* (2021-04-15 MR)（当前主要方向）DeepSDF 相较 ANIL 的优势，我们的猜测是 $z_i$ 相互差别很大允许处理相互之间差别很大的任务类 $\{\lambda\}$，而 ANIL 只能处理相近的任务
	* (mine) ANIL 由于梯度可以很大，未必确实是只能处理相近的任务？其对任务单峰分布的假设有多关键
	* 我们要试图通过实验说明，试着找相应的数据集（meta-learning 类的？），或者自己创建一个
	* (mine) 例如 PINN 问题，同时处理方程类型（椭圆、双曲、Helmholtz），区域形状，区域维度（以及输出维度），Ritz 或普通 PINN loss；反应扩散方程这样涉及相变、任务流形有突变的情形？
	* (2021-05-08) 方案很多，区域形状就可以试一试
	* (mine) 任务分布有若干个 outlier 的情形，ANIL 可能会直接不重视这些奇异任务，本来需要使用类似于 MAML 的（TAML？）做法改变任务权重才能学到
* (2021-04-15 MR) 针对一般 meta-learning 问题的能力，试一下找 few-shot 数据集和 benchmark 来试一试，然后找其他 meta-learning 问题（有非常多种）
	* 可以搜一下“孟德宇”（西交？数学出身）看他有没有给 meta-learning 写过相关 review
	> 数据集可以用已有 meta-learning 论文内使用的 benchmark
* `tuneNNwhichLayer:` (2021-04-15 MR, mine) meta-learning 任务的分布，为什么大部分分布都对应调整 NN 最后几层的参数的分布，是否有哪些任务类对应调整前面几层的
	* 相当于对 meta-learning 任务分类，使得不同的类在函数拟合上对应 NN 调整的层位置不同
	* image 相关的不同任务只调整后几层是因为 feature-reuse，PINN 任务只调整后几层是因为前面层学出了相应 basis func $\phi_i(x)$
	* 注意调整最后一层相当于给出函数空间的一个线性子流形！不知道是不是调整前面几层划出的流形被折叠很严重，从而通常不符合任务的分布
	* （导师，CSI讨论）传统 PDE basis func 的选取需要根据解的正则性，例如 $L^\infty,L^2$，分片光滑函数空间上使用的基函数应该不同，有的可以小波有的不行；但也可能前面几层把所有正则性需要的基函数都找出来了；NS 方程这样不同分量性质不同的也同理，各输出分量共用前面参数，目前相关学者用 PINN 求解 NS 看起来还挺欢快的
	* 2021-08-06 CSI讨论，Burgers、Laplace 方程上的结果是 PINN 迁移学习做法 fine-tune 前面几层更为高效
* PINN 问题，meta-train 使用混合 L2、PINN loss，regular-train 使用 PINN loss；
	* NN 参数化的空间上两种 loss 最小点不一样，使用这种方法是否可以仍用 PINN loss 帮助找出 L2 loss 极小？希望 $\theta$ 参数化的流形为 L2 loss 极小；可能相当于学出某种正则化来减小 PINN loss 造成的偏差，和 few-shot 的作用类似
	* ANIL 等做法应该也可以如此（PINN loss fine-tune，L2 loss outer-loop）？
	* 用 hypernet 的做法也可以利用 L2 loss 训练来直接推断新的方程，但是没有利用 PINN loss 的信息，并且无法适用于 PDE 问题形式不统一的情形
	* 可能有一些类似半监督学习（有监督的数据点才能使用 L2 loss）
	* 可能的问题：两种 loss 的权重比例如何选取（半监督设定也有这一问题）
	* 可能需要实验说明两种 loss 极小不同；如果使用有历史的 Adam 优化算法，需要考虑换 loss 的时候 Adam 是否忘记全部历史信息
* domDecmp: 类似 FEM 的做法：每个单元 $i$ 内部分别对应一个 $z_i$，{o6fn12}
	> `tileAD+sinArch-2104.03960` 在图像、曲面 SDF 问题上做法类似
	* 注：新记录位置((n4ta1s))INR-区域分解-共享部分-场的参化表征
		* （旧）2023-01-14 补注：INR-区域分解((n2pe8f)) 的多维度比较已完善，想法可在其框架下发展
	* 属于单个任务拆为不同子任务的多任务学习，还不是考虑泛化到不同 PDE 的版本
		* 有单任务 hypernet 的形式 ((n3hg7a))1TaskHypernet
		* 按那里的记号，手动设定的区域划分相当于依据领域知识设计的分类网络 $l$
		* 分类网络自动划分区域((n2pk9m)) 则相当于学出的 hypernet $l$
		* $h_\lambda=f(-,z_\lambda)$ 为各任务采用的不同模型
		* 最后在函数空间（而非 $z$ 参数空间）取平均得到特定 $x$ 的推断模型
		* 若按那里的分类，将离散任务划分改成连续任务划分，则一个子任务有可能对应一条特征线之类？
			* 这样的划分也可以根据领域知识手动选择（特征线，激波）或者自动学出，也可以都用
	* FEM 每个单元上的函数空间为线性空间，使用线性基底，这里相当于使用 AD 给出的非线性空间
		* 可以人工引入传统的 FEM 基底，使得 AD 给出的空间包含 FEM 空间
		* 不同单元边界连续如何保证需要考虑；例如顶点基元 $g_i(x)$ 取定（Maxwell 方程的 edge element 同理），$\sum_ig_if_\theta(x,z_i)$
		* element 可以不规则形状，不一定都三角形；边界上保证采样在区域内即可，element 本身可以延伸到区域外部，网格生成更容易
		* 单元内非线性基空间的好处：例如激波，可行函数组成一维流形（只需刻画激波位置），但其张成的线性空间无穷维；传统 FEM 只能靠加密网格来处理这种情形，并且需要考虑网格的更新
			* 已有理论：参数化双曲方程的 Kolmogorov n-width 衰减慢
			* 也许用其他非线性降维（流形学习）方法也可，例如 AE？
		* `HiDeNN`(AISC2) 也是 PINN 和 FEM 结合，关系待确认
	* 另外一种理解方式：XPINN 每个区域对应不同 $z$；例如流体的椭圆、双曲区域可以使用不同网络分开处理
		* `NeRF_5s` 与本做法进行了比较
	* 区域个数可以多于 XPINN 少于传统 FEM；
	* 可以对每个 element 仿射变换到单位基元 $f_\theta(\Delta_i(x),z_i)$，也许效果会好于直接网络输入原空间坐标？{q81b6w}
		* 对于规则网格考虑仿照 DeepSDF 的某个后续工作，输入为多尺度形式（三维的八岔树），各级尺度的坐标 concat；是否可能推广到一般 FEM 网格？
		* `[PINN适用范围-知乎]` FBPINN-2107.07871 确实是这么做的区域分解
		* 类比 FEM，各单元内基底 可认为是先将输入变换到标准单元
		* 一般框架((q81b66))元素分类处理-分流-处理器输入
	* 还可以使用 多尺度求和形式，类似小波的 $\sum f_{s,i}(x;z_{s,i},\theta)$，不同 $s$ 对应基函数的 support 大小不同，同一个点取值涉及不同尺度 $f$ 的求和；{n2pf3y}
		* 相关：((n2pe8f))INR 区域分解，((n2pe88))INR 多尺度形式（频域区域分解），((n2pf83))散点离散表征下的网格加密
		* MINER((_ocge3q))各求和项用独立 MLP，而非共享 NN 骨架、仅输入 z 独立
		* NFFB((_o6fn0s)) 动机叙述提到同时做空间、频域区域分解
		* sub-gridding 方式，某个尺度的函数可以不铺满全空间，只在关键的局部加细
			* 也可以动态增加((n4rg7x))，比如误差大的地方动态引入新网络
			* MINER 就是这样的思路：((_n3292d))均匀方块区域分解，误差大的块边长平分、还大就再平分
			* 相关：((q1ij5t))局部自适应加密
		* 可仿照 `NeRF_5s` 全局细网格，但用 hash 方法压缩参数量，从而其实只关注局部网格
		* 将求和换为复合则得到((_n76f4o))TINC，其中区域按八岔树分解；{n76f5d}
			* 此时相当于某种参数共享，小块（区域分解最小单元）距离越近则共享的参数越多；见((n2pk8u))INR-区域分解-参数共享
			* 文中同时讨论了参数量分配策略((_n76f80))，层间差异取决于全局冗余性大小，层内差异取决于不同区域重要性；{n76f8e}
				* 一般框架((n76f8h))元素分类处理-分流-处理器容量
		* 多网络求和 改为单网络各中间层结果求和，((_o6fn3t))NFFB 用到
	* 或许可体现物理系统的自相似性质（如 NS 方程）
		* PDE 自身也可能有自相似性质；统计物理里的重整化群？
		* 以下均取均匀规则网格（不适用于一般 FEM 网格）
		* 考虑最简单的单区域划分 $X=X_1\cup X_2$
			* 若要体现一般的自相似性质，应该是一步拆分为 $2^n$ 个（空间维度 $n$）
			* 不过若每个维度可以分别自相似，用这里划分为 2 个的方法也还行
			* 可复合多次，类似 Ising 模型重整化群（及反向的加细精度方向），逐步划分网格得 $X=\bigcup_cX_c$
		* 可以考虑的空间有 $S_i=U(X_i),\{u^\eta|X_i\},Z_i$，以下讨论其间可能存在的映射
			* 在隐空间描述的映射原则上用 AE 也可以，只是处理无穷维空间不如 AD 方便
			* AD $Z_i\to U(X_i)$ 映射原则上可以显式依赖于尺度因子，即涉及的 $X_i$ 尺寸
		* 每个映射的可能的讨论角度：提供了什么 insight，映射如何训练获得，能用于什么下游任务
			* 后两个主要针对 $S_i=Z_i$ 的情形，不过用 NO 给出映射也是可能的
		* 限制算子 $S\to S_1$：似乎没什么用，也就能组装出 $S\to S_1\times S_2$ 映射
		* 自相似映射 $S_1\to S$
		* 拆分映射 $S\to S_1\times S_2$
			* 解 PDE 时可用于局部自适应加细网格，误差大的地方加细，$Z\to Z_1\times Z_2$ 映射给出了划分后的子区域的隐向量初值，便于微调提高精度
			* 但是精度上可能不如局部用细网格学残差的做法（上方“多尺度求和形式”），尽管存储需求可能稍小（注意还多了训练隐空间的拆分映射 $Z\to Z_1\times Z_2$ 的计算代价）
		* 整合映射 $S_1\times S_2\to S$：类似 Ising 模型的重整化群？具体怎么用不知道
			* 此外 xpi 2021-12-29 的讨论觉得 $S\times S\to S$ 的形式有点像乘法结构，李半群？
		* xpi 2022-01-04 讨论觉得也许需要知道 PINN 多尺度问题的 SOTA
	* 另外可以不用“硬区域划分”，“软”的版本输出 $\sum_i\operatorname{softmax}(\{g(x,z_j)\})_if(x,z_i)$，由 $g$ 给出区域的连续过渡
		* 自动保证边界连续性
		* `[PINN适用范围-知乎]` FBPINN-2107.07871 用人工选定的 $\omega_i(x)$ 加权形式保证连续过渡
		* 可以动态调整各个区域的边界（传统 FEM 的调整方法在 `AI+SC-notes.md` comparison 部分有，比较麻烦？）；流体情形或许可以让某个边界匹配激波？需要精细设计
		* 是否可能动态调整“区域”个数，即自主增、删、合并任务？{n4rg7x}
			* 若在误差大区域动态添加，需恰当选取初始化参数，可参考 ANE ((n37g53)) 网络动态添加神经元作为新基底函数（尽管那里添加的东西比这里小很多）
			* 误差大区域可“网格分裂”，一块本来是统一的 $z$，现在分裂为多个不同 $z$（初始化都用分裂前的值）
			* 注：之后的更完备讨论见((ocaf68))元素分类处理-类别演化-状态继承
		* 高维可考虑((n2pk9m))分类网络自动划分区域，分类数与区域数一致，分类网络同步优化；注意这样的区域不一定是连通的
			* `POUnet-2101.11256` 已体现自动划分区域的想法，尽管其实验主要考虑低维问题；里面记录的后续工作引入类似 BNN 结构，开始考虑高维
	* 还需要仔细的数学推导以明确思路；例如除了 Ritz loss，Galerkin 弱形式是否可行
		* 理论分析，人工切分空间区域分别拟合是否让函数空间变小/易于学习，是否可以给出误差估计
		* 原始 PINN 全局统一参数化可能导致了 local min，例如这个可能的情形：某个局部 loss 大，但该部分 loss BP 之后涉及函数的全局修改，会导致更大的 loss，从而为局部极小；如果像这里的做法进行空间 detach 可能缓解问题
			* 验证可以对某个 loss 大的点 $x$，绘制 $\langle\frac{\partial l_\theta(x)}{\partial \theta},\frac{\partial l_\theta(y)}{\partial \theta}\rangle$ 关于 $y$ 的分布（相当于体现对 $x$ 点 loss BP 后函数的全局变化），其中 $l(x)$ 为 PINN loss 在 $x$ 点处的取值
		* 含时问题，可能采用时间推进，使用 $z_i(t;\theta)$ 形式预测区域参数的时间变化，而让每个 $z_i$ 只表达空间形态？
		* 有间断情形下的训练算法？弱形式，VPINN 那样采样一堆 $\phi_i$ 测试函数（而不是对其求解优化问题）？采样一堆方形按内部积分为 0 转化为边界积分条件来训练（回忆 CFD 的守恒律）？
	* `POUnet-2101.11256` 可认为是该 ansatz 的一种特殊情形（在那里有讨论），也从传统 FEM 出发
		* 其中学得的区域单位分解 相当于 自适应的软区域分解；各区域内函数表达为给定（全局）基底线性组合形式
	* 可能还有其他类似思路的工作，需要文献调研，如 `POUnet-2101.11256` 的 citation
	* (2021-07-02 MR) 属于区域分解做法，可以自己试试有间断的 Burgers 方程，和 PDE-Net 比较之类；
	* 区域分解相关文献（日后写论文可能引用），一般的在 ((n7nd86))PINN-区域分解：
		* `2021-11-10`(AISCmeet) 不同区域的网络，前面层随机生成不训练（可能共享），最后一层各区域单独训练
			* 前面层共享参数，但是却不进行训练，也许不太算 MTL？
		* `XPINN-285_2002`(AISC)
	* 对于含时 PDE，在时间维度做区域分解的可能性？可能联系 `spline-PINN-2109.07143`
		* 注意此时类似 online-learning，时间推进后之前算过的时间步都是单独任务，AD 训练要兼顾逐渐增多的任务（不排除每次迭代采样任务 batch 的方式）
		* `PPINN-1909.10145` 近似方程快速获得各区域初值，之后各区域独立并行训 PINN，其初值不准问题靠整体预测-校正迭代
			* 此处框架易用：各区域 PINN 原本用独立网络，现换为 AD、各区域仅独立低维向量；不过各区域并行计算或需小心实现；{n1eh3r}
* (2021-08-28 wx) DIP 等做法是否可以放到 AD 框架下
	* `我在听纪辉的报告，突然想到，DIP以及他的Bayes NN，那个seed不重要，主要是他们逼近的只是两个点，而不是整个流形，所以不需要调整这个seed（即流形的参数化）`
	* `和DIP这系列的联系你也可以思考一下，能否放到你现在的framework下讨论`
	* 相关笔记在当日 lectureNotes（DIP 自己的理解在 freeNotes），不调整 seed（latent code）无需用流形框架解读（并且这里是有限维输出）；对网络结构研究倒是可能有意义，例如 CNN 之外的架构能否 DIP
	* 可以试试 DIP 训练好之后，微调 seed 后得到什么图像？
* (2022-08-01) MTL/meta-learning 原理上的可行性，是否可从 ROM 角度说明，task manifold；可导出相应算法
	* 目前 MAML 系列文章有直观示意图：$\Theta$ 空间能表达单任务的参数集合组成流形；但是并没有认真利用该流形结构，相应算法和单点的直观下是一样的
	* 可调研一下是否已有用 ROM 的工作；可能之前的人不太在 $U(X,Y)$ 空间下考察问题（毕竟定义域和值域都可能离散）故不会想到利用传统 ROM 方法
	* （评）想法记录在 `元知识存在性` 假设空间流形
* 杂项 idea：
	* 能否像原始 PINN 一样用于反问题
	* 流形拟合是否也有 F-principle（回忆高维数据分布类似“刺球”，函数空间的分布可能也类似），是否可以 MscaleDNN 类似方式解决
	* 像 MAML 那样引入 tr, val loss，$\min_\theta L^\text{val}[f_\theta(\cdot,\operatorname*{\arg\min}_{z}L^\text{tr}[f])]$；可能利用类似于 deep equilibrium model 的推导获得外层梯度

> 本科毕设历史记录主体在旧文件中，这里只保留部分
* 以下方向按重要性排序：
	* 设计相差较大的 PDE 任务，先椭圆方程区域形状
		* 区域：星形，随机选择顶点个数、各顶点角度（需要 sort）和半径，MC 时每个三角形区域随机采相同样本后乘上三角形面积；求解给定边界取值 Poisson 方程
		* 区域：MNIST 数据集设置某个阈值，大于这个阈值的像素点为区域内部（边界连续化？MetaSDF 文章里使用 SciPy 包生成 MNIST 的 SDF，不过仍然是图像）
		* 系数场，MNIST 像素强度（需要转化为连续函数）；此时可以在已知 Green 函数的规则区域进行，积分即可求出真解（网格上积分，得到任意点的真解）
		* 系数场，Gauss 过程 2D
	* 设计效果好于 train-from-scratch 的任务
		* 双曲方程初值问题，初值 loss 传播到全局需要时间
	* 低维实验表明流形假设成立，其他可能：PDE 区域为单位圆，系数场分片常数，一片为圆，半径 $r$ 改变，原则上应该能够划出一维流形
	* AE 的比较，可以考虑引入多尺度系数场？
	* few-shot 任务（估计会在 l2l 包的框架下）

