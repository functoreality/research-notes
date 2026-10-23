# Scholar Inbox 推荐页读取

浏览器连接与会话保护遵循 `helium-browser-control`。以下为该推荐源的读取线索，
页面实现变化时以当前页面和实际响应为准。

## 确认当前输入

- 枚举标签页，定位 `https://www.scholar-inbox.com/digest`，标题通常为
  `Digest - Scholar Inbox`。不要为读取而导航或刷新用户现有标签页。
- 读取日期选择器，当前实现可用 `[aria-label="Select date range"]` 定位。
  读取 `Relevant Papers`，跳过独立的热门论文栏。
- 屏幕外条目的 `innerText` 可能为空，但 `textContent` 中仍有标题和摘要。
  必要时读取完整 DOM，或从页面已加载的论文数据中提取对应字段。

## 核对完整性与分页

页面推荐总数可能超过初始加载的 50 篇。不能把已加载数量当作总数，
也不能因为滚动未出现更多条目就认定已读完。

可在页面内通过 `page.evaluate` 发起只读、沿用登录态的请求。
当前已知推荐接口为：

```text
https://api.scholar-inbox.com/api/?from=MM-DD-YYYY&to=MM-DD-YYYY&p=0
```

- `from`、`to` 必须取当前页面选定范围，可从页面日期或该页近期网络请求取得。
  单日推荐也可能使用 `date=MM-DD-YYYY`，沿用页面实际请求格式。
- `p` 从 0 开始递增，初始请求可能省略 `p`。只读请求使用现有页面会话，
  例如 `fetch(url, { credentials: 'include' })`，不导出登录凭据。
- 响应的 `digest_df` 包含条目，可提取 `arxiv_id`、`title`、`abstract`。
  `digest_papers` 是推荐总数，`has_more_papers_in_digest` 表示是否还有下一页。
- 按 `has_more_papers_in_digest` 继续读取，按去版本号的 arXiv ID 去重，
  并核对总数。分页请求失败时说明未完成的范围，不将部分列表宣称为完整列表。

API 或字段发生变化时，检查页面当前请求或沿用页面的只读加载方式。
不要修改账户、推荐设置或论文的点赞、收藏、已读状态。
