---
name: main-note-refactoring
description: >-
  Use this skill when reorganizing AI-for-PDE main-note frameworks by extracting
  shared knowledge from multiple existing frameworks, discovering additional
  candidate source locations, or rebuilding the internal logic of one framework.
  It covers scope control, target-framework design, content ownership transfer,
  UID and link preservation, and structural and source-coverage review. Do not
  use it for integrating one paper into an existing framework, writing literature
  notes, or making a small local edit that does not change knowledge organization.
---

# 主笔记框架重构

本 Skill 将一个或多个既有主笔记框架中的知识重新组织到新的逻辑结构中。
它既处理多框架之间的共享知识提取，也处理单个框架的内部重组。

重构改变的是知识的归属和查阅路径，不只是复制、改写或增加链接。
每个源信息点都应有明确去向，目标结构和保留后的原结构都需独立成立。

## 输入与边界

开始前从用户要求和现有文件中确定：

1. 笔记根目录和允许修改的文件
2. 当前模式：多框架整合、单框架重组，或包含主动发现候选来源
3. 已知来源边界和目标文件；不存在目标框架时，确定新文件的预期主题
4. 用户是否已经批准目标结构、来源扩展和完整实施
5. 可用的历史基线、计划文档和任务记忆

能从当前上下文可靠获得的信息不重复询问。若不同答案会改变迁移范围、
删除权限或目标结构，且无法从文件中判断，再向用户确认。

详细模式和范围判断见 [references/modes-and-scope.md](references/modes-and-scope.md)。

## 与其他 Skill 的关系

根据当前阶段读取上游 Skill 的最新完整版本，不在每个机械迁移批次重复加载。

### Main Note Integration

正式写入主笔记、处理 UID 或设计链接时，完整阅读
`../main-note-integration/SKILL.md`。

采用其目标语境、来源映射、跨语境翻译、UID、链接和主笔记写作规则。
不采用其单篇论文输入流程、文献笔记正式写入、`keywd.md` 审批，
也不受其“不得大范围重构”边界限制。

### Literature Note Writing

设计检索路径、实质改写文字或准备未来读者审查时，完整阅读
`../literature-note-writing/SKILL.md`。

采用其未来读者回查、自解释节点、自然理解路径、信息压缩和正交维度原则。
不采用文献笔记骨架、TLDR、引文、`（AI 评）`、专用检查脚本，
也不采用其第三方审查角色和轮次。本 Skill 的审查规则见
[references/review.md](references/review.md)。

### Purpose Means Analysis

设计或显著调整目标框架、进行内部结构审查时，如该 Skill 可用，
完整阅读 `/home/yzh/.codex/skills/purpose-means-analysis/SKILL.md` 及其要求的
当前场景 reference。

采用直接目的手段关系、展开轴、抽象层级、桥接层、局部完备性和共享手段判断。
不把分析报告格式、`or`、`末端`、`暂缓` 等标记写入正式笔记，
也不为还原完整分析树而机械加深笔记层级。

### 冲突与新增规则

冲突时依次服从：用户最新要求和用户修改、本 Skill 的重构专门规则、
当前阶段的上游 Skill、一般写作或分析习惯。

上游出现本文件尚未分类的新规则时，判断它是否约束同一种产物或质量目标，
是否依赖原 Skill 独有输入、格式或权限，是否改变迁移范围、删除权限、暂停点
或审查成本。兼容且无冲突时采用；只适用于原工作流时不采用；
会实质改变权限或流程时向用户说明。

## 工作流程

### 1. 确认模式和稳定范围

阅读 `references/modes-and-scope.md`，确定来源是用户指定的封闭集合，
还是允许主动发现候选。用 UID、内容边界和祖先链描述长期范围，
行号只辅助临时定位。

### 2. 建立来源清单和概念边界

完整阅读每个来源局部及必要上下文，识别它讨论的对象、映射、目的、约束、
证据和场景角色。不要用关键词相似或位置相邻代替概念归属判断。

多框架整合需区分共享知识与场景特有知识。单框架重组需区分原知识内容与
旧结构提供的组织语境。主动发现的候选有实质歧义时保留原处并询问用户。

### 3. 设计目标框架

阅读 [references/framework-design.md](references/framework-design.md)。
先从来源还原共同问题或原框架真正承担的功能，再设计能容纳现有内容、
支持未来扩展和问题驱动查阅的骨架。

若用户尚未批准目标结构，先只写大纲和必要占位，等待批准后再移动正文。
用户已经明确批准完整实施时，不增加机械暂停点。

### 4. 规划和执行迁移

阅读
[references/migration-and-integrity.md](references/migration-and-integrity.md)。
为每个源信息点记录迁入、留存、合并、删除或暂缓。优先选择能独立成立的
语义块，按目标概念位置迁入，不受源内容连续顺序约束。

正文默认保留成熟主笔记的抽象层次、判断力度、公式和紧凑表达。
只有新语境确有需要时才做最小改写。先写入并核验目标位置，
再移除源端不应继续拥有的正文。

### 5. 完成导航收尾

正文所有权转移基本完成后，检查原框架入口、新框架入口、多用途知识的
主要位置和次要入口。导航链接和接口说明不能代替实质内容迁移。

### 6. 审查并交付

按 [references/review.md](references/review.md) 完成每批自检与双审查、
必要的中期累计审查和最终全盘审查。审查者只报告，由主执行者判断和修改。

审查后汇报：

- 哪些内容迁入、留存、合并或暂缓
- 哪些文字因新语境而改写及其原因
- 审查发现和处理结果
- 尚需用户决定的边界问题

## 不可违反的规则

1. 用户未授权时，不主动扩展来源或修改相邻框架。
2. 有实质语义歧义的内容默认保留原处，不擅自迁移。
3. 不因名称、符号或措辞相似就认定两个概念相同。
4. 不以行号作为长期范围或内容身份。
5. 先确认目标内容完整写入，再删除源端正文。
6. 删除源父节点前，枚举并妥善处理仍依赖其语境的直接子节点。
7. 不把新增链接、接口或一句概括算作内容迁移完成。
8. 不因结构迁移而无理由重写成熟正文。
9. 文件内容与此前读取不一致时，视为用户可能已修改，不恢复旧版本。
10. 文献 UID、主笔记 UID 和链接必须继续遵守 Main Note Integration。
11. 每个源信息点在最终状态中都有可解释去向。
12. 最终审查不能由多次局部审查替代。

## 开始执行

1. 读取用户提供的任务记忆、计划和来源文件
2. 识别模式、授权范围和需要加载的 reference 与上游 Skill
3. 建立来源边界和去向记录
4. 若目标结构未确认，先设计大纲；否则从已批准阶段恢复
5. 分批迁移、审查、修正并定期落盘
6. 完成导航与最终全盘审查后交付
