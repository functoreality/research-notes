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
├── site.config.json           # 当前站点配置
├── .github/workflows/         # GitHub Actions 配置
├── .agents/skills/            # AI 智能体读写原始笔记的相关技能
└── dist/                      # 构建产物（不提交）
```

## 本地开发

```bash
npm install
npm run parse    # 解析笔记
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
```

阅读器也可以为外部的笔记目录服务。内容目录需要包含 `raw/`、
`public/data/homepage.md` 和 `site.config.json`：

```bash
npm run site -- dev ../personal-notes
npm run site -- build ../personal-notes
```

## 功能

- 层级折叠（支持键盘操作）
- `((pattern))` 链接跳转
- 页面内子标签页
- 全局搜索（⌘K）
- URL 参数定位

### 分享链接

可直接复制浏览器地址栏中的链接，供他人打开同一份笔记内容：

- `?file=AISClit8`：打开整个文件
- `?file=AISClit8&line=657`：打开并高亮指定行
- `?uid=_q26a91`：按笔记行末的唯一 UID 直接定位

文件参数中的 `.md` 后缀可省略，也可保留。UID 不包含花括号，例如
原文中的 `{_q26a91}` 应写成 `uid=_q26a91`。

## 部署

详见 [DEPLOY.md](./DEPLOY.md)

复用当前阅读器发布另一套独立笔记时，参见
[MULTI_SITE.md](./MULTI_SITE.md)。
