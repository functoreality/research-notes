# 共享阅读器与多套笔记部署

## 当前结构

`research-notes` 继续同时保存科研笔记和网页阅读器。
另一套笔记使用独立的 `personal-notes` 仓库，只保存：

```text
personal-notes/
├── raw/
├── public/data/homepage.md
├── public/favicon.svg
├── site.config.json
├── README.md
└── .github/workflows/deploy.yml
```

Personal Notes 的 GitHub Actions 会在构建时取得 `research-notes` 的
`main` 分支，并使用其中的解析器和网页代码。生成的站点仍部署在
Personal Notes 自己的 GitHub Pages 中。

两套网页分别加载各自的 `notes.json`，不会因为共享阅读器而下载
另一套笔记的数据。

## 首次发布顺序

### 1. 先发布阅读器改动

当前仓库新增了共享工作流：

```text
.github/workflows/publish-notes.yml
```

需要先将当前仓库的本次改动提交并推送到 `main`。只有该文件已经存在于
GitHub 后，Personal Notes 仓库才能调用它。

### 2. 移动 Personal Notes 目录

当前骨架暂时位于：

```text
research-notes/personal-notes/
```

将它移动到与当前仓库同级的位置：

```text
projects/
├── research-notes/
└── personal-notes/
```

当前仓库的 `.gitignore` 已忽略 `personal-notes/`，避免移动前误提交。

### 3. 填入内容并检查配置

- 将准备公开的 Markdown 文件放入 `personal-notes/raw/`。
- 编辑 `personal-notes/public/data/homepage.md`。
- 如果 GitHub 仓库不叫 `personal-notes`，修改 `site.config.json` 的 `base`。
- 如需修改页面标题、说明或加载提示，也在 `site.config.json` 中调整。
- 根据计划采用的授权方式添加许可证。

### 4. 本地预览

在 `research-notes` 中运行：

```bash
npm install
npm run site -- dev ../personal-notes
```

访问终端显示的本地网址。生产构建可以运行：

```bash
npm run site -- build ../personal-notes
```

构建产物位于 `research-notes/dist/`，但不会提交到 Git。

### 5. 创建并推送新仓库

在 GitHub 创建空的 `personal-notes` 仓库，不要预先添加 README。
然后在本地的 `personal-notes` 目录初始化并推送：

```bash
git init
git add .
git commit -m "Initial public notes"
git branch -M main
git remote add origin git@github.com:functoreality/personal-notes.git
git push -u origin main
```

最后进入新仓库的 Settings → Pages，将 Source 设为 GitHub Actions。

## 日常更新

更新 Personal Notes 内容并推送到 `main` 后，网页会自动重新部署。

共享阅读器始终使用 `research-notes` 的 `main` 分支。不过，
`research-notes` 的提交不会自动触发另一个仓库的工作流。
修改阅读器后可以采用下面的流程：

1. 使用 `npm run site -- dev .` 检查科研笔记。
2. 使用 `npm run site -- dev ../personal-notes` 检查 Personal Notes。
3. 推送 `research-notes` 的修改。
4. 打开 Personal Notes 仓库的 Actions 页面。
5. 手动运行 “Deploy to GitHub Pages”。

以后如果认为手动触发已经成为负担，可以再使用 GitHub App 或
repository dispatch 增加跨仓库自动重建。目前只有两个站点，手动触发更简单。
