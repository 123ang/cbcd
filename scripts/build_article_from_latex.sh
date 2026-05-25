#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ARTICLE="$ROOT/drafts/vision_assisted_risk_aware_framework_article"
PYTHON="${PYTHON:-/Users/123ang/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3}"
TMP="$ARTICLE.from_latex.tmp.docx"

pandoc "$ARTICLE.md" \
  --from markdown \
  --to latex \
  --standalone \
  --output "$ARTICLE.tex"

cd "$ROOT/drafts"
pandoc "$(basename "$ARTICLE").md" \
  --from markdown \
  --to docx \
  --resource-path=.:.. \
  --output "$TMP"

"$PYTHON" "$ROOT/scripts/polish_latex_docx.py" "$TMP"
mv "$TMP" "$ARTICLE.docx"

echo "Built $ARTICLE.tex and $ARTICLE.docx from $ARTICLE.md"
