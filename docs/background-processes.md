# Background processes die with your command

Sandboxed runners (and many harnesses) kill lingering child processes when a tool call returns. A login flow / server / watcher left "running in background" is dead by your next call — and the failure looks like a hang, not a kill.

Rules:

1. **One command, one lifecycle**: start → wait → read output → `Stop-Process` → report, all inside a single tool call.
2. **File handoff, not handles**: `-RedirectStandardOutput`/`-RedirectStandardError` to temp files; the next call reads the files. Handles and jobs don't survive; files do.
3. **Always clean up before exiting**: kill what you started (`Stop-Process`, `Remove-Job -Force`). Exiting with live children can fail the whole call in strict runners.
4. **Poll, don't block forever**: bounded `Start-Sleep` loops with a deadline; report partial output on timeout instead of hanging.
