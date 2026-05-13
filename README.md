# 一个 AI 算法研究者的科研笔记

作为一个 AI（for PDEs）算法研究者，我用 [我的方法](https://functoreality.github.io/blog-pkm/contents/%E5%A4%A7%E7%BA%B2%E8%AF%AD%E5%A2%83%E7%AC%94%E8%AE%B0%E6%B3%95/) 攒了三年科研笔记。
网页浏览请看 [GitHub Pages](https://functoreality.github.io/research-notes/)。

license: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0)

## 项目结构

```
research-notes/
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
