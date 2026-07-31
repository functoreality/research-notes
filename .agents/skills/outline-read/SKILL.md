---
name: outline-read
description: >-
  Use this skill when reading or browsing tab-indented outline Markdown files.
  These files use tab characters for hierarchical indentation with `((uid))`
  cross-references and `{uid}` anchor definitions. If you open a .md file and
  see lines starting with tab characters in a tree structure — especially with
  `((...))` or `{...}` patterns — load this skill. The native read tool will
  dump everything without folding, making deep hierarchies hard to navigate.
  This skill provides a specialized CLI tool for structure-aware browsing with
  smart fold/unfold, UID-based cross-file jumping, and TOC overviews. Trigger
  when the user asks to browse, navigate, or explore outline notes, or
  whenever you encounter tab-indented Markdown files yourself.
---

# outline-read — 大纲式 Markdown 笔记专用阅读器

## 这是什么

`outline-read` 是一个命令行工具，专门用于浏览**用 Tab 缩进表示层级**的大纲式 Markdown 笔记。它提供：

- **折叠展开**：按大纲层级折叠/展开内容，只显示你关心的那部分结构
- **UID 跨文件跳转**：通过 `((uid))` 引用和 `{uid}` 定义，一键跳到链接目标
- **目录模式**：只看顶层标题，快速了解文件结构

## 什么时候用它 vs 原生工具

| 你想要做的事 | 用什么 |
|-------------|--------|
| 看文件的大纲/目录 | `outline-read ML` |
| 折叠展开某个位置的层级上下文 | `outline-read ML 9` |
| 跟随 UID 跳到定义处 | `outline-read --uid n4sj8e` |
| 阅读连续多行原文（无折叠） | 原生 `read` 工具 |
| 搜索关键词 | `grep` |
| 查找谁引用了某个 UID | `grep '((uid))' *.md` |
| 查看文件全部内容 | 原生 `read` 工具 |

**原则：`outline-read` 做结构导航和 UID 跳转，原生 `read` 做连续原文阅读，`grep` 做内容搜索。** 不要在 outline-read 里试图做原生工具擅长的事。

## 运行方式

脚本位于 skill 目录的 `scripts/outline-read`，**不需要复制到笔记目录**。通过 `--dir` 指定笔记所在目录即可：

```bash
scripts/outline-read --dir /path/to/notes ML 9
```

需要 Python 3.6+（纯标准库，零外部依赖）。如果脚本没有可执行权限，先 `chmod +x scripts/outline-read`。

> 为了方便，后续示例省略 `--dir`，假设当前工作目录就是笔记目录。

## 调用方式

支持 `.md` 省略：

```bash
outline-read ML                    # 目录模式：只看顶层标题
outline-read ML 9                  # 折叠模式：展开第 9 行所在的结构
outline-read ML:9                  # file:line 简写

# UID 跳转
outline-read --uid n2bf31          # 找到 {n2bf31} 的定义位置并折叠展开
outline-read --uid n2bf31 ML       # 限定只在 ML.md 中查找
```

## 扁平文件的注意事项

如果文件几乎全部是 depth-0（无缩进，如术语表 keywd.md），折叠算法没有可折叠的层级结构。
此时 `outline-read keywd 50` 只会列出该行本身。
对于这类文件，用 `grep` 搜索关键词、用原生 `read` 看原文。

## UID 系统

笔记中有两种 UID 标记：

- **`{uid}`** —— 行尾花括号，定义了一个锚点（只出现一次，全局唯一）
- **`((uid))`** —— 行内双小括号，引用另一个 UID 定义的位置

UID 通常是 6-7 位小写字母数字（如 `n2bf31`、`_q64m81`）。

### 典型使用流程

```
# 1. 从关键词出发
grep -i "GAN" keywd.md              # 在术语表搜索

# 2. 跟随 UID 跳到定义
outline-read --uid n4sj8e           # 跨文件跳转到 generative.md:33

# 3. 看周围原文
read generative.md 28 50            # 原生 read 看连续内容

# 4. 发现另一个链接，继续跳
outline-read --uid _q64m81          # 跟随 RaGAN 的 UID
```

### 生成新 UID

笔记中新增条目需要 UID 时，使用项目自带的生成脚本：

```bash
scripts/gen-uid                        # 生成 + 碰撞检测（当前目录）
scripts/gen-uid --dir /path/to/notes   # 碰撞检测在指定笔记目录
scripts/gen-uid --no-collision-check   # 跳过碰撞检测
```

脚本执行后 stdout 输出基础 UID，stderr 输出使用提示（如何手动递增、文献笔记使用 `{_core}` 格式等）。默认自动检测已有笔记中的 UID 碰撞，遇到冲突自动递增直到找到唯一值。

## 展开级别 (`--expand`)

| 级别 | 行为 | 适用场景 |
|:----:|------|---------|
| `0` / `--tight` | 只显示祖先链 | 快速确认「我在哪」，最少 token |
| `1` | +紧邻父级的同级兄弟 | 「这一节还有哪些话题」 |
| `2` | +全部顶层标题 | Level 1 + 文件级方向感 |
| `3`（默认） | block-expand 全部层级 | 完整结构浏览 |

```bash
outline-read --tight ML 9          # 级别 0：最简，只有祖先链
outline-read --expand 1 ML 9       # 级别 1：展开父级的同级兄弟
outline-read --expand 2 ML 9       # 级别 2：级别 1 + 全部顶层标题
# 默认即为级别 3，无需显式指定
```

级别 1 和级别 3 的区别：
级别 1 只在目标行的**紧邻父级**展开兄弟节点（「这一节下还有哪些子话题」），但不会展开更高层级（祖父、曾祖父）的兄弟。
级别 3 则在所有层级都展开。
比如在深层嵌套的目标上，级别 1 可能从 13 行增加到 ~19 行，而级别 3 可能暴增到 60+ 行。
级别 2 在级别 1 的基础上额外展示全部顶层标题，提供文件级方向感。

## 其他选项

```bash
outline-read --depth 2 ML 9        # target 下方展开 2 层子节点（默认 1 层）
outline-read --no-top ML 9         # 抑制不相关的顶层标题（配合 --expand 2 使用）
                                   # 例：ML.md 有 8 个顶层标题，--expand 2 全显示；
                                   # 加 --no-top 则只保留 target 所属的那个
outline-read --no-fold-indicators  # 关闭默认的 '(N lines folded)' 标注
```

## 输出解读

```
1: * ML                           ← 顶层标题，始终显示
2: * 目标功能，预期映射形态
3: 	* 表示特定映射                 ← 一个 tab = 一级缩进
  (2 lines folded)                ← 折叠了 2 行
6: 		* 训练方式：分布距离刻画     ← 两个 tab = 二级缩进
>>> 9: 			* 距离度量—GAN...     ← >>> 标记目标行，三个 tab = 三级缩进
10: 				* 早期内容...       ← 目标行的子节点
```

行号不连续是正常现象——**间隙大小就是折叠掉的行数**。配合默认的 `(N lines folded)` 标注，可以快速判断哪些折叠块值得展开。

## UID 跳转后的工作流

每次 UID 跳转，stderr 会打印解析结果：

```
Resolved n4sj8e -> generative.md:33
```

拿到文件:行号后，立刻可以用原生 `read` 看周围原文：

```
read generative.md 28 50
```

## 辅助脚本

scripts/ 目录下还有三个辅助脚本：

- `tree-validate <file>`        验证 tab 层级结构，检测缩进跳跃和空行问题
- `tree-stats <file>`           节点数、深度、行数统计
- `tree-shift <file> L1 L2 N`   给 L1-L2 行统一 ±N 个 tab（输出到 stdout）
  - 若用于修改现有文件，可能方式之一：输出重定向到新文件，确认输出正确（read 或与原文件 diff），替换原文件
