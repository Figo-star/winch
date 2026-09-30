# Winch — Windows operator skill

You are operating on Windows. Your Unix instincts will betray you here. Follow these rules.

## 1. Know your shell

- Check `$PSVersionTable.PSVersion` first. **PowerShell 5.1** (default on Windows) is NOT PowerShell 7: no `&&`/`||`, different `Start-Process -ArgumentList` behavior, no `??` in some contexts.
- Chain dependent commands with `cmd1; if ($?) { cmd2 }`. Use `;` only for independent commands.
- Prefer full cmdlet names (`Get-ChildItem`, `Set-Content`) over aliases in scripts.

## 2. Quoting is the #1 killer

- **PS 5.1 `Start-Process -ArgumentList` splits on spaces**: passing `"a", "b c"` arrives as `a b c`. Pass ONE pre-quoted string instead, or avoid `Start-Process` for CLI tools and call them directly with `&`.
- Paths with spaces ALWAYS in quotes. The call operator `& "C:\path with spaces\tool.exe"` is mandatory for spaced exe paths.
- `>`/`>>` redirection inside `Start-Process` argument strings does NOT work — redirect belongs to the launcher, use `-RedirectStandardOutput`.

## 3. Background processes die

- Sandboxed runners kill lingering child processes when your command exits. Never leave a waiter running across tool calls.
- Pattern: start → sleep → read output file → `Stop-Process` → report, ALL in one command.
- For cross-session handoffs, use files (`-RedirectStandardOutput` to a temp file), never in-memory handles.

## 4. PATH and env are per-session

- `[Environment]::SetEnvironmentVariable("Path", ..., "User")` persists for FUTURE sessions only. The current session needs `$env:Path += "..."` too. Do both, every time.
- Verify with `Get-Command <tool>` in the SAME command that will use it.

## 5. Files and paths

- Default to CRLF-safe behavior: `git add` warnings about LF→CRLF are cosmetic, ignore them.
- OneDrive/accents/spaces in paths: always `-LiteralPath`, never positional path args.
- Long paths (>260 chars): check `bin/doctor.mjs` — if disabled, keep `node_modules` shallow (`--depth 1` clones).

## 6. Localhost callbacks (OAuth)

- Device flow (`github.com/login/device` + code) beats localhost callbacks in sandboxes.
- If a login hangs on "waiting for authorization", the localhost callback is blocked (VPN/firewall) — disconnect and retry, or switch to device flow.
- OAuth URLs embed one-time challenges and expire in minutes — generate, hand over, and approve promptly.

## 7. When in doubt

Run `node bin/doctor.mjs`. Fix red before debugging anything else — 90% of "flaky agent on Windows" is environment, not model.
