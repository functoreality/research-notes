#!/bin/bash
# 文献笔记格式验证脚本
# 用法: ./check-note.sh <笔记文件路径>
# 
# 分为三级：PASS(通过) / WARN(不推荐，建议检查) / FAIL(违反规则，应修改)
# 行长度阈值：统一 WARN>80字符, VLONG>100字符（基于专家笔记统计, 90%行≤80）

set -e

FILE="${1:?用法: $0 <笔记文件>}"
[ -f "$FILE" ] || { echo "文件不存在: $FILE"; exit 1; }

pass=0; warn=0; fail=0

check_pass() { pass=$((pass + 1)); printf "  [PASS] %s\n" "$1"; }
check_warn() { warn=$((warn + 1)); printf "  [WARN] %s  %s\n" "$1" "${2-}"; }
check_fail() { fail=$((fail + 1)); printf "  [FAIL] %s  %s\n" "$1" "${2-}"; }

BODY="$(tail -n +2 "$FILE" | grep -vP '^\t*>')"   # 正文(排除标题行和带缩进的引文)
TITLE="$(head -1 "$FILE")"
HEADER_LINES="$(echo "$BODY" | grep -P '^\t{0,2}\*')"  # 子标题行(也排除行长检查)

echo "========== 笔记格式检查: $(basename "$FILE") =========="
echo ""

# ============ Tier 1: 必须通过 (FAIL) ============
echo "--- 必须项 ---"

# 1. 标题行格式
if echo "$TITLE" | grep -qP '^\* [\w\s-]+\d{4}\.\d{5} '; then
    check_pass "标题行格式"
else
    check_fail "标题行格式" "应匹配: * 方法名-arXivID 描述"
fi

# 2. created-on 行
if grep -qP 'created on \d{4}-\d{2}-\d{2} by' "$FILE"; then
    check_pass "created-on行"
else
    check_fail "created-on行" "应匹配: > created on YYYY-MM-DD by 框架+模型"
fi

# 3. 正文禁止EM dash（排除引文）
if echo "$BODY" | grep -qP '——'; then
    # 显示具体行
    while IFS= read -r line; do
        line_num=$(grep -nF "$line" "$FILE" | head -1 | cut -d: -f1)
        check_fail "EM dash L$line_num" "$(echo "$line" | head -c 80)"
    done < <(echo "$BODY" | grep -P '——')
else
    check_pass "正文无EM dash"
fi

# 4. 禁止粗体/斜体标记
if grep -qP '\*\*|__' "$FILE"; then
    check_fail "粗体/斜体标记" "检测到 ** 或 __（若为 URL 误报，请忽略）"
else
    check_pass "无粗体/斜体标记"
fi

# 5. 行首格式：每行必须匹配 ^\t*(\*|>)  (任意个 tab 缩进 + * 或 > + 空格)
#    覆盖原"空格缩进"检查：凡符合此模式必不以空格起手
#    空白行视为违规
violations=$(grep -vnP '^\t*(\*|>) ' "$FILE" || true)
if [ -n "$violations" ]; then
    while IFS= read -r line; do
        line_num=${line%%:*}
        content=${line#*:}
        check_fail "行格式 L${line_num}" "${content:0:80}"
    done <<< "$violations"
else
    check_pass "行首格式"
fi

if echo "$HEADER_LINES" | grep -qP '^\t*\* (引言|相关工作|摘要)$'; then
    check_fail "论文结构标题" "笔记逻辑结构应自行重新设计，禁止照搬原文结构，更不应以论文的章节名作为笔记组织标题"
else
    check_pass "无论文结构标题"
fi

# 7. 禁止"作者认为/提出/发现"（第三人称归因）
if echo "$BODY" | grep -qP '作者(认为|提出|发现|指出|强调)'; then
    while IFS= read -r line; do
        line_num=$(grep -nF "$line" "$FILE" | head -1 | cut -d: -f1)
        check_fail "第三人称归因 L$line_num" "$(echo "$line" | head -c 80)"
    done < <(echo "$BODY" | grep -P '作者(认为|提出|发现|指出|强调)')
else
    check_pass "无第三人称归因"
fi

echo ""

# ============ Tier 2: 建议检查 (WARN) ============
echo "--- 建议项 ---"

# 8. 引文数量
quote_count=$(grep -cP '^\t*> (?!created on)' "$FILE" || true)
if [ "$quote_count" -ge 1 ]; then
    check_pass "引文数量($quote_count)"
else
    check_warn "引文数量(0)" "没有引文——如果笔记中有高度压缩的关键论断，建议补充引文作为安全网"
fi

# 9. 正文出现"本文/该论文/本工作"（第三人称主语）
if echo "$BODY" | grep -qP '(本文|该论文|本工作)'; then
    while IFS= read -r line; do
        check_warn "第三人称主语" "$(echo "$line" | head -c 80)"
    done < <(echo "$BODY" | grep -P '(本文|该论文|本工作)' | head -5)
else
    check_pass "无第三人称主语"
fi

# 11. 元概括句式
if echo "$BODY" | grep -qP '(这本质上是|核心贡献不是|揭示了一个机制)' ; then
    while IFS= read -r line; do
        check_warn "元概括句式" "$(echo "$line" | head -c 80)"
    done < <(echo "$BODY" | grep -P '(这本质上是|核心贡献不是|揭示了一个机制)' | head -3)
else
    check_pass "无元概括句式"
fi

# 12. 空洞强调词
if echo "$BODY" | grep -qP '(值得注意的是|值得一提的是|有趣的是|值得关注的是)'; then
    while IFS= read -r line; do
        check_warn "空洞强调词" "$(echo "$line" | head -c 80)"
    done < <(echo "$BODY" | grep -P '(值得注意的是|值得一提的是|有趣的是|值得关注的是)')
else
    check_pass "无空洞强调词"
fi

echo ""

# ============ 行长度检查 ============
echo "--- 行长度 (统一阈值: WARN>80, VLONG>100) ---"
LONG_LINES=$(tail -n +2 "$FILE" | grep -vP '^\t*>' | grep -vP '^\t*\*' | awk '
{ l=length($0) }
l>100 { printf "  [VLONG %dc L%d] %s...\n", l, NR+1, substr($0,1,100); vc++ }
l>80 && l<=100 { printf "  [LONG  %dc L%d] %s...\n", l, NR+1, substr($0,1,80); lc++ }
END { printf "%d %d\n", lc+0, vc+0 }
')
LONG_STATS=$(echo "$LONG_LINES" | tail -1)
LONG_LINES=$(echo "$LONG_LINES" | head -n -1)
[ -n "$LONG_LINES" ] && echo "$LONG_LINES"
long_count=$(echo "$LONG_STATS" | awk '{print $1}')
vlong_count=$(echo "$LONG_STATS" | awk '{print $2}')
if [ "${vlong_count:-0}" -eq 0 ] && [ "${long_count:-0}" -eq 0 ]; then
    check_pass "正文行长度(全部≤80字符)"
else
    [ "${vlong_count:-0}" -gt 0 ] && check_warn "正文行(${vlong_count}行>100字符)" "建议精简内容或从逗号/句号处拆分换行"
    [ "${long_count:-0}" -gt 0 ] && check_warn "正文行(${long_count}行>80字符)" "考虑压缩或拆分"
fi

echo ""

# 标题行长度
TITLE_LEN=${#TITLE}
if [ "$TITLE_LEN" -gt 100 ]; then
    check_warn "标题行长度(${TITLE_LEN}字符>100)" "专家均值56-63，严重超标，需大幅压缩"
elif [ "$TITLE_LEN" -gt 80 ]; then
    check_warn "标题行长度(${TITLE_LEN}字符>80)" "专家均值56-63，建议压缩"
else
    check_pass "标题行长度(${TITLE_LEN}字符)"
fi

# 子标题行长度 (tab缩进 + * 开头，非顶级标题行)
SUBH_COUNT=$(tail -n +2 "$FILE" | grep -vP '^\t*>' | grep -P '^\t+\* ' | awk '
{ l=length($0) }
l>100 { printf "  [VLONG-SUBH %dc L%d] %s...\n", l, NR+1, substr($0,1,90); vc++ }
l>80 && l<=100 { printf "  [LONG-SUBH  %dc L%d] %s...\n", l, NR+1, substr($0,1,80); lc++ }
END { printf "%d %d\n", lc+0, vc+0 }
')
SUBH_STATS=$(echo "$SUBH_COUNT" | tail -1)
SUBH_LINES=$(echo "$SUBH_COUNT" | head -n -1)
[ -n "$SUBH_LINES" ] && echo "$SUBH_LINES"
sub_long=$(echo "$SUBH_STATS" | awk '{print $1}')
sub_vlong=$(echo "$SUBH_STATS" | awk '{print $2}')
if [ "${sub_vlong:-0}" -eq 0 ] && [ "${sub_long:-0}" -eq 0 ]; then
    check_pass "子标题行长度(全部≤80字符)"
else
    [ "${sub_vlong:-0}" -gt 0 ] && check_warn "子标题行(${sub_vlong}行>100字符)" "建议精简或从逗号/句号处拆分"
    [ "${sub_long:-0}" -gt 0 ] && check_warn "子标题行(${sub_long}行>80字符)" "考虑压缩或拆分"
fi

# 引文行长度（与正文统一标准：80/100）
QUOTE_COUNT=$(tail -n +2 "$FILE" | grep -P '^\t+>' | awk '
{ l=length($0) }
l>100 { printf "  [VLONG-QT %dc L%d] %s...\n", l, NR+1, substr($0,1,100); vc++ }
l>80 && l<=100 { printf "  [LONG-QT  %dc L%d] %s...\n", l, NR+1, substr($0,1,80); lc++ }
END { printf "%d %d\n", lc+0, vc+0 }
')
QUOTE_STATS=$(echo "$QUOTE_COUNT" | tail -1)
QUOTE_LINES=$(echo "$QUOTE_COUNT" | head -n -1)
[ -n "$QUOTE_LINES" ] && echo "$QUOTE_LINES"
quote_long=$(echo "$QUOTE_STATS" | awk '{print $1}')
quote_vlong=$(echo "$QUOTE_STATS" | awk '{print $2}')
if [ "${quote_vlong:-0}" -eq 0 ] && [ "${quote_long:-0}" -eq 0 ]; then
    check_pass "引文行长度(全部≤80字符)"
else
    [ "${quote_vlong:-0}" -gt 0 ] && check_warn "引文行(${quote_vlong}行>100字符)" "引文也是笔记的一部分，可从句号/分号处拆分换行"
    [ "${quote_long:-0}" -gt 0 ] && check_warn "引文行(${quote_long}行>80字符)" "考虑在标点处拆分"
fi

echo ""

# ============ 额外自查提示 ============
echo "--- 自查提示 ---"
echo "  建议自行 grep 检查以下模式（根据论文内容选择相关项）:"
echo "  - 括号解释已知概念: grep -P '（[A-Za-z].*）' \"\$FILE\""
echo "  - 英文半角标点混入正文: grep -P '^[^>].*[;,?](?!.*\\\$)' \"\$FILE\""
echo "  - 描述句式替代归因句式: grep -P '(其原因|问题根源|背后的原因)' \"\$FILE\""
echo ""
echo "--- 长行处理建议 ---"
echo "  对于标记为 LONG/VLONG 的行，按优先级处理："
echo "  1. 精简内容：删除不必要的修饰词、过渡语、元概括"
echo "  2. 从标点拆分：在句号、分号、逗号处插入换行，一个 bullet 变多个子 bullet"
echo "  3. 引文同理：长引文从原文句号处切分，保持每个 > 子行独立可读"
echo ""

# ============ 汇总 ============
echo "========== 汇总: PASS=$pass WARN=$warn FAIL=$fail =========="
if [ "$fail" -gt 0 ]; then
    echo "存在 $fail 项必须修改的问题"
    exit 1
elif [ "$warn" -gt 0 ]; then
    echo "通过，但建议检查 $warn 项"
else
    echo "全部通过"
fi
