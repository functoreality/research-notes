# Research Notes 博客部署指南

## 项目概述

本项目是一个基于 Astro + React + Tailwind 的静态博客网站，用于展示层级折叠式 Markdown 笔记。

### 功能特性

- **层级折叠**：按缩进层级折叠/展开 bullet points
- **链接跳转**：点击 `((pattern))` 链接跳转到目标行，自动展开父节点
- **子标签页**：支持在页面内打开多个标签页
- **全局搜索**：搜索所有笔记内容，高亮匹配结果
- **URL 参数**：支持通过 URL 直接跳转到特定文件和行

## 本地开发

### 1. 安装依赖

```bash
cd notes-app
npm install
```

### 2. 解析笔记数据

```bash
npm run parse
```

这会将 `../research/` 目录下的 Markdown 文件解析为 `src/data/notes.json`。

### 3. 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:4321/research-notes`

### 4. 构建生产版本

```bash
npm run build
```

构建输出在 `dist/` 目录。

## 部署到 GitHub Pages

### 方式一：手动部署

1. **构建项目**

   ```bash
   cd notes-app
   npm run parse
   npm run build
   ```

2. **部署到 GitHub Pages**

   如果你的 GitHub Pages 仓库是 `username.github.io`：

   ```bash
   # 假设你的 username.github.io 仓库克隆到 ~/Documents/projects/username.github.io
   cd ~/Documents/projects/username.github.io
   
   # 清空目标目录并复制构建结果
   rm -rf research-notes
   cp -r ~/Documents/projects/research-notes/notes-app/dist research-notes
   
   # 提交并推送
   git add research-notes
   git commit -m "Update research notes"
   git push
   ```

3. **访问网站**

   访问 `https://username.github.io/research-notes/`

### 方式二：GitHub Actions 自动部署

1. 在 `notes-app` 目录创建 `.github/workflows/deploy.yml`：

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
             cache-dependency-path: notes-app/package-lock.json
         
         - name: Install dependencies
           working-directory: notes-app
           run: npm ci
         
         - name: Parse notes
           working-directory: notes-app
           run: npm run parse
         
         - name: Build
           working-directory: notes-app
           run: npm run build
         
         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: notes-app/dist

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

2. 在 GitHub 仓库设置中：
   - Settings → Pages → Source: GitHub Actions

## URL 参数说明

可以通过 URL 参数直接打开特定页面：

- 打开文件：`https://username.github.io/research-notes/?file=filename`
- 打开并定位到行：`https://username.github.io/research-notes/?file=filename&line=123`

## 更新笔记

当 `research/` 目录下的 Markdown 文件有更新时：

```bash
cd notes-app
npm run parse
npm run build
```

然后按上述部署方式更新 GitHub Pages。

## 技术栈

- **框架**：Astro 5.x
- **前端**：React 19
- **样式**：Tailwind CSS 3.x
- **语言**：TypeScript

## 项目结构

```
notes-app/
├── scripts/
│   └── parse-notes.mjs    # Markdown 解析脚本
├── src/
│   ├── components/        # React 组件
│   ├── hooks/             # 自定义 Hooks
│   ├── data/              # 解析后的 JSON 数据
│   ├── pages/             # Astro 页面
│   └── styles/            # 全局样式
├── astro.config.mjs       # Astro 配置
├── tailwind.config.mjs    # Tailwind 配置
└── package.json
```
