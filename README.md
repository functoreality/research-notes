# Research Notes 博客

个人研究笔记的网页展示应用，支持层级折叠、链接跳转和全文搜索。

## 项目结构

```
notes-app/
├── raw/                       # 原始 Markdown 笔记
├── public/data/notes.json     # 解析后的数据
├── src/                       # React/Astro 源码
├── scripts/                   # 解析脚本
├── .github/workflows/         # GitHub Actions 配置
└── dist/                      # 构建产物（不提交）
```

## 本地开发

```bash
npm install
npm run parse    # 解析笔记
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
```

## 功能

- 层级折叠（支持键盘操作）
- `((pattern))` 链接跳转
- 页面内子标签页
- 全局搜索（⌘K）
- URL 参数定位

## 部署

详见 [DEPLOY.md](./DEPLOY.md)
