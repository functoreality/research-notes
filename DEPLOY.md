# 部署指南

## 一、创建 GitHub 仓库

1. 在 GitHub 创建新仓库，名称任意（如 `research-notes`）
2. 不要勾选 README、.gitignore 等（项目已有）

## 二、推送代码

```bash
cd research-notes

# 初始化 git（如果还没有）
git init

# 添加所有文件
git add .

# 首次提交
git commit -m "Initial commit"

# 添加远程仓库（替换 YOUR_USERNAME 和 YOUR_REPO）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git

# 推送到 main 分支
git branch -M main
git push -u origin main
```

## 三、启用 GitHub Pages

1. 进入仓库页面 → **Settings** → **Pages**
2. **Source** 选择 **GitHub Actions**（不是 Deploy from a branch）
3. 保存

## 四、自动部署

推送代码后，GitHub Actions 会自动运行：

1. 解析 `raw/` 下的 Markdown 文件
2. 生成 `public/data/notes.json`
3. 构建静态站点到 `dist/`
4. 部署到 GitHub Pages

访问地址：`https://YOUR_USERNAME.github.io/YOUR_REPO/`

## 五、修改 site.config.json 中的站点信息

**重要**：如果仓库名不是 `research-notes`，需要修改 `site.config.json`：

```json
{
  "site": "https://YOUR_USERNAME.github.io",
  "base": "/YOUR_REPO_NAME"
}
```

当前配置：
- site: `https://functoreality.github.io`
- base: `/research-notes`

如果你要用其他用户名或仓库名，请修改这两个值。

## 六、更新笔记流程

```bash
# 1. 编辑 raw/ 下的 Markdown 文件
vim raw/ML.md

# 2. 本地测试（可选）
npm run parse
npm run dev

# 3. 提交并推送
git add raw/
git commit -m "Update notes"
git push

# GitHub Actions 会自动重新构建和部署
```

## 常见问题

### Q: 页面显示空白或 404？

检查：
1. `astro.config.mjs` 中的 `base` 是否与仓库名匹配
2. GitHub Pages 是否已启用（Settings → Pages → Source: GitHub Actions）
3. Actions 是否运行成功（仓库 → Actions 标签页）

### Q: 如何查看部署状态？

仓库页面 → **Actions** 标签页 → 查看最新的 workflow 运行状态

### Q: 如何手动触发部署？

仓库页面 → **Actions** → **Deploy to GitHub Pages** → **Run workflow**
