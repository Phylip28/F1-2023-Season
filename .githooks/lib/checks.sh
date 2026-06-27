# Individual check functions for the pre-commit constraint guardian.
#
# Each check_* function:
#   - Receives the list of staged file paths as positional args
#   - Returns 0 on pass, 1 on fail
#   - Prints per-violation context (file + line + offending content)
#   - Uses [OK] / [WARN] / [FAIL] markers (per CONSTRAINTS.md: no emojis)
#
# Files under .githooks/ are skipped automatically to avoid self-references.

# Files inside this directory are the hook's own source and must be ignored
# by content checks (they contain the patterns we search for, by definition).
is_self_file() {
  case "$1" in
    .githooks/*|.githooks) return 0 ;;
    *) return 1 ;;
  esac
}

# Markdown documentation files are allowed to mention the patterns the hook
# searches for. CONSTRAINTS.md's "no emojis" rule applies to script output,
# log messages, and commit messages -- not documentation.
is_doc_file() {
  case "$1" in
    *.md|*.markdown|*.MD) return 0 ;;
    *) return 1 ;;
  esac
}

# Heuristic: is the file at HEAD a text file? Used to skip binaries.
is_text_file() {
  local file="$1"
  # git marks binary diffs with "-" in both numstat columns.
  if git diff --cached --numstat -- "$file" 2>/dev/null | grep -q '^-	^-	'; then
    return 1
  fi
  if command -v file >/dev/null 2>&1; then
    local mime
    mime=$(LC_ALL=C file --mime-type -b -- "$file" 2>/dev/null)
    case "$mime" in
      text/*|application/json|application/xml|application/javascript|application/x-shellscript|application/x-yaml) return 0 ;;
      *) return 1 ;;
    esac
  fi
  return 0
}

# Pretty-print a section header.
_section() {
  echo
  echo "--- $1 ---"
}

# ---------------------------------------------------------------------------
# Check 1: no "pip install" commands. CONSTRAINTS.md -> "No Pip"
# Matches a real command invocation at the start of a line (optionally
# indented) so that prose mentions and comments are not flagged.
# ---------------------------------------------------------------------------
check_no_pip_install() {
  _section "Check 1/4: no 'pip install' (use 'uv add')"
  local file failed=0
  local pattern='^[[:space:]]*(pip3?[[:space:]]+install|python[[:space:]]+-m[[:space:]]+pip[[:space:]]+install)\b'
  for file in "$@"; do
    is_self_file "$file" && continue
    is_doc_file  "$file" && continue
    is_text_file "$file" || continue
    local hits
    hits=$(git show ":$file" 2>/dev/null | grep -nE "$pattern" || true)
    if [ -n "$hits" ]; then
      echo "[FAIL] $file"
      printf '%s\n' "$hits" | sed 's/^/         /'
      failed=1
    fi
  done
  if [ "$failed" -eq 0 ]; then
    echo "[OK] no 'pip install' invocation found"
  fi
  return "$failed"
}

# ---------------------------------------------------------------------------
# Check 2: no emoji characters. CONSTRAINTS.md -> "No Emojis in Output"
# Uses grep -P with explicit Unicode ranges covering the common emoji blocks.
# Falls back to a warning (does not block) if grep -P is unavailable.
# ---------------------------------------------------------------------------
check_no_emojis() {
  _section "Check 2/4: no emoji characters"
  local file failed=0
  local pattern
  # Main color-emoji blocks only. The Dingbats range (2700-27BF) is excluded
  # because it contains typography symbols like the check mark (U+2713) that
  # are commonly used in docs and CI output but are not "emoji" in spirit.
  pattern='[\x{1F000}-\x{1FAFF}\x{1F100}-\x{1F2FF}]'

  # Verify grep -P works at all; if not, warn and skip (do not block).
  if ! printf 'ascii\n' | LC_ALL=C.UTF-8 grep -P '.' >/dev/null 2>&1; then
    echo "[WARN] grep -P unavailable; emoji check skipped (install GNU grep or add /usr/bin/ggrep to PATH)"
    return 0
  fi

  for file in "$@"; do
    is_self_file "$file" && continue
    is_doc_file  "$file" && continue
    is_text_file "$file" || continue
    local hits
    hits=$(git show ":$file" 2>/dev/null | LC_ALL=C.UTF-8 grep -nP "$pattern" || true)
    if [ -n "$hits" ]; then
      echo "[FAIL] $file"
      printf '%s\n' "$hits" | sed 's/^/         /'
      failed=1
    fi
  done
  if [ "$failed" -eq 0 ]; then
    echo "[OK] no emoji found"
  fi
  return "$failed"
}

# ---------------------------------------------------------------------------
# Check 3: no hardcoded "localhost:8000". CONSTRAINTS.md -> "No Hardcoded URLs"
# Catches the exact backend default URL anywhere in a text file.
# ---------------------------------------------------------------------------
check_no_localhost_backend() {
  _section "Check 3/4: no hardcoded 'localhost:8000' (use VITE_API_BASE_URL)"
  local file failed=0
  for file in "$@"; do
    is_self_file "$file" && continue
    is_doc_file  "$file" && continue
    is_text_file "$file" || continue
    local hits
    hits=$(git show ":$file" 2>/dev/null | grep -nF 'localhost:8000' || true)
    if [ -n "$hits" ]; then
      echo "[FAIL] $file"
      printf '%s\n' "$hits" | sed 's/^/         /'
      failed=1
    fi
  done
  if [ "$failed" -eq 0 ]; then
    echo "[OK] no hardcoded backend URL"
  fi
  return "$failed"
}

# ---------------------------------------------------------------------------
# Check 4: no large files (>10 MB) staged, unless they are gitignored.
# Uses git diff --cached --numstat for modified files, and git cat-file -s
# for new untracked files (numstat shows "-	-" for them).
# Gitignored files are allowed because the user has explicitly excluded them.
# ---------------------------------------------------------------------------
check_no_large_files() {
  _section "Check 4/4: no large files staged (>10 MB)"
  local failed=0
  local max_bytes=10485760   # 10 * 1024 * 1024
  local added filename size
  while IFS=$'\t' read -r added _ filename; do
    [ -z "${filename:-}" ] && continue
    if [ "$added" = "-" ]; then
      # New untracked file or pure-binary diff: get the staged blob size.
      size=$(git cat-file -s ":$filename" 2>/dev/null || echo 0)
    else
      size=$added
    fi
    [ "$size" -gt "$max_bytes" ] 2>/dev/null || continue
    # If the file is gitignored, the user has already accepted it as non-tracked.
    if git check-ignore -- "$filename" >/dev/null 2>&1; then
      continue
    fi
    local size_mb
    size_mb=$(awk "BEGIN{printf \"%.2f\", $size/1048576}")
    echo "[FAIL] $filename ($size_mb MB) -- add to .gitignore or use git LFS"
    failed=1
  done < <(git diff --cached --numstat)
  if [ "$failed" -eq 0 ]; then
    echo "[OK] no oversized files staged"
  fi
  return "$failed"
}
