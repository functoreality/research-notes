# Research Notes 博客部署指南

## 项目概述

本项目是一个基于 Astro + React + Tailwind 的静态博客网站，用于展示层级折叠式 Markdown 笔记。

## 项目结构

```
notes-app/                     # 整个目录作为 Git 仓库
├── raw/                       # 原始 Markdown 笔记（git 追踪）
│   ├── PINN.md
│   ├── ML.md
│   └── ...（41个笔记文件）
├── public/data/
│   └── notes.json             # 解析后的结构化数据（git 追踪）
├── dist/                      # 构建产物（git 忽略）
├── src/                       # 源码（git 追踪）
└── scripts/                   # 解析脚本（git 追踪）
```

**Git 追踪策略**：
- ✅ 追踪：`raw/`（原始笔记）、`public/data/notes.json`（解析数据）、源码
- ❌ 忽略：`dist/`（构建产物）、`node_modules/`

这样每次更新笔记，只有 `notes.json` 会有增量 diff，而不是整个 HTML 文件被替换。

## 本地开发

```bash
# 安装依赖
npm install

# 解析笔记（生成 public/data/notes.json）
npm run parse

# 启动开发服务器
npm run dev
# 访问 http://localhost:4321/research-notes

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 部署到 GitHub Pages

### 方式一：手动部署到 username.github.io 子目录

如果你的 GitHub Pages 仓库是 `username.github.io`：

```bash
# 1. 构建项目
cd notes-app
npm run parse
npm run build

# 2. 复制构建产物到 Pages 仓库
cd ~/Documents/projects/username.github.io
rm -rf research-notes
cp -r ~/Documents/projects/research-notes/notes-app/dist research-notes

# 3. 提交并推送
git add research-notes
git commit -m "Update research notes"
git push
```

访问 `https://username.github.io/research-notes/`

### 方式二：GitHub Actions 自动部署

1. 创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '22'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Parse notes
        run: npm run parse
      
      - name: Build
        run: npm run build
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

2. 在 GitHub 仓库设置中启用 GitHub Actions 作为 Pages 源

## 更新笔记流程

```bash
# 1. 编辑 raw/ 目录下的 Markdown 文件
vim raw/ML.md

# 2. 重新解析
npm run parse

# 3. 提交源文件和数据
git add raw/ public/data/notes.json
git commit -m "Update notes"

# 4. 构建并部署
npm run build
# 然后按上述部署方式操作
```

## URL 参数

- 打开文件：`?file=filename`
- 定位到行：`?file=filename&line=123`

示例：`https://username.github.io/research-notes/?file=PINN&line=100`
