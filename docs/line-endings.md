# Line endings & paths

- `git add` warnings about LF→CRLF are **cosmetic**. Don't "fix" them, don't convert repos.
- Always use `-LiteralPath` (not positional paths): OneDrive folders, accents, `[brackets]`, and spaces break wildcard path resolution.
- Prefer `--depth 1` clones on Windows: fewer files, fewer long-path failures, faster everything.
- Case-insensitive filesystem: `Readme.md` vs `README.md` collisions are real — keep filenames distinct.
