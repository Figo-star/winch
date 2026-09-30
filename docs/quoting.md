# Quoting (the #1 Windows agent killer)

PowerShell 5.1 `Start-Process -ArgumentList` **splits array elements on spaces**:

```powershell
# BROKEN on PS 5.1: "OAuth with Google (Antigravity)" arrives as 4 args
Start-Process gh.exe -ArgumentList 'auth','login','-m','OAuth with Google (Antigravity)'
```

Fixes, in order of preference:

1. **Skip `Start-Process`** — call CLI tools directly with `&`; PowerShell quoting then works normally:
   ```powershell
   & gh auth login -p google -m 'OAuth with Google (Antigravity)'
   ```
2. **One pre-quoted string** — a single `-ArgumentList` string is passed through intact:
   ```powershell
   Start-Process gh.exe -ArgumentList 'auth login -m "OAuth with Google (Antigravity)"'
   ```
3. **Batch wrapper** — put the full command (with `< answers.txt` stdin redirect) in a `.bat` and launch that.

Also: `>`/`>>` inside an argument string do nothing (redirection belongs to the launcher — use `-RedirectStandardOutput`); exe paths with spaces need the call operator (`& "C:\path with spaces\tool.exe"`); and `$env:VAR` with spaces must be quoted at every use.
