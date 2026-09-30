# PATH & env are per-session

Setting the machine/User `PATH` does **not** affect the session you're in — and session changes vanish when it ends. Do both, every time:

```powershell
$dir = "$env:USERPROFILE\.opencode\bin"
$cur = [Environment]::GetEnvironmentVariable("Path", "User")
if ($cur -notlike "*$dir*") {
  [Environment]::SetEnvironmentVariable("Path", "$cur;$dir", "User")  # future sessions
}
$env:Path = "$env:Path;$dir"                                          # THIS session
```

Then verify in the same command that will use the tool: `Get-Command <tool>`. If it's not found, your edit hasn't taken effect where it matters.
