---
name: arxiv-download
description: Retrieve and inspect public arXiv paper.
---

## 目标

获取可供本地阅读的 arXiv 论文全文。优先保留结构化、可检索的版本，
在网页内容不完整或下载受限时逐级降级，而不是反复请求同一个失败端点。

## 获取阶梯

### 1. 先获取 HTML

对 arXiv 论文，先用 WebFetch 获取官方 HTML：

```text
https://arxiv.org/html/{arXiv ID}
```

这是最适合阅读和检索的版本。官方 HTML 不可用或转换明显损坏时，尝试：

```text
https://ar5iv.labs.arxiv.org/html/{arXiv ID}
```

若 WebFetch 完整返回了所需内容，直接使用，不必下载文件。

### 2. 判断 WebFetch 是否截断

不要把看似正常的 WebFetch 输出自动当成全文。检查：

- 工具输出是否明确包含 `truncated`、`partial` 或类似提示
- 内容是否在句子、公式、章节中间结束
- 论文应有的后续章节、参考文献或页尾是否缺失

截断时，先仔细查看工具的完整返回信息。某些环境会在截断提示中给出
保存完整内容的本地文件路径、可继续读取的资源，或更精确的 URL。若有，
优先用当前环境允许的文件读取或资源读取工具按需读取该内容。不要假定
所有 WebFetch 工具都支持“继续输出”或采用同一种截断标记。

若没有可用的后续内容，尝试更小、更精确的网页资源，例如单独的小节、
站点提供的 Markdown 或文本版本。仍无法获得完整正文时，转到本地下载。
若当前环境的 WebFetch 没有提供可继续读取的路径或资源，也直接转到本地下载。

### 3. 下载 HTML 或 PDF 到本地

下载前选择专用临时目录和明确文件名。arXiv 可能限速，使用可续传、
带重试的请求，避免并发或高频重复请求。

```bash
wget -c --tries=20 --timeout=30 --waitretry=5 --read-timeout=20 \
  -O {arXiv ID}.html "https://arxiv.org/html/{arXiv ID}"
# similar for https://ar5iv.labs.arxiv.org/html/{arXiv ID}

wget -c --tries=20 --timeout=30 --waitretry=5 --read-timeout=20 \
  -O {arXiv ID}.pdf "https://arxiv.org/pdf/{arXiv ID}.pdf"
```

若 `wget` 未完成，使用 curl 续传同一个目标文件：

```bash
curl -L -C - --max-time 60 -o {arXiv ID}.pdf \
  "https://arxiv.org/pdf/{arXiv ID}.pdf"
```

出现 0 字节响应或传输速度持续为 0 时，通常是冷却或限速。等待后再续传，
不要只靠增大超时解决问题。确认文件类型和大小合理后再读取。先检查所需的
转换命令是否存在：

```bash
command -v html2text
command -v pdftotext
file {arXiv ID}.html {arXiv ID}.pdf
```

两种转换是替代关系，分别使用不同的输出文件，避免覆盖：

```bash
html2text -nobs {arXiv ID}.html > {arXiv ID}-html.txt
# 或
pdftotext {arXiv ID}.pdf {arXiv ID}-pdf.txt
```

若 `html2text` 的转换结果效果不理想，也可以尝试其他方案，例如使用已安装的 Python
库 `markdownify` 将 HTML 转换为 Markdown 再按需读取，或直接读取原始 HTML 文件。

HTML 仍是首选，PDF 是覆盖最完整的保底格式。下载的大文件建议先在本地
检索关键段落或分段读取，避免一次把全文塞回对话上下文。若转换工具不可用，
使用当前环境已有的文件阅读或 PDF 处理能力按需读取，勿为此阻塞下载流程。

### 4. 必要时下载 LaTeX 源文件

当 HTML 和 PDF 无法保留需要的公式、附录、图注或源码结构时，下载 arXiv
源文件：

```bash
wget -c --tries=20 --timeout=30 --waitretry=5 --read-timeout=20 \
  -O {arXiv ID}.tar.gz "https://arxiv.org/src/{arXiv ID}"
```

使用 `/src/`，而不是 `/e-print/`：后者可能返回单个 TeX 文件或 PDF，
而 `/src/` 提供 gzip 压缩的 tar 源包。源文件通常只保留最新版本，不能用它
可靠地还原历史版本。

先在独立目录中解包，避免平铺的归档文件污染工作目录。先检查解压后的
载荷类型，再决定是否继续解 tar：

```bash
mkdir {arXiv ID}-source
gzip -dc {arXiv ID}.tar.gz > {arXiv ID}-source/payload
file {arXiv ID}-source/payload
tar -tf {arXiv ID}-source/payload
tar -xf {arXiv ID}-source/payload -C {arXiv ID}-source
```

若 `payload` 是单个 TeX 文件而非 tar 归档，不要执行最后一条命令，直接将
它作为源文件读取。解包后从主 `.tex` 文件、`.bbl`、附录和图表目录按需读取。

### 5. 浏览器兜底

只有命令行下载多次失败，或目标页面依赖 JavaScript 渲染时，才考虑通过浏览器进行下载。
一种可能的途径是：检查当前环境的可用技能列表中是否有 `helium-browser-control`。
若可用，通过当前环境的 skill 加载机制加载它，例如调用 `skill(name="helium-browser-control")`，
或读取其 `SKILL.md`，再按其流程启动浏览器、访问公开页面并下载所需 HTML、PDF 或 LaTeX 源文件。

浏览器是兜底手段：它比 HTTP 下载更慢、更难复现，不能替代前面的直接获取。

## 结果记录

说明最终使用的版本和本地路径，例如 HTML、PDF 或 source。若因限速、撤稿、
转换失败或网页要求 JavaScript 而降级，也简要说明原因，避免后续工作误把
不完整版本当作全文。
