# Localhost OAuth callbacks

Many CLIs (`gh`, `opencode` plugins) finish browser login via a `localhost` callback. In sandboxes/remote shells this breaks silently: the browser opens (or the URL works), you approve, and the CLI hangs on "waiting for authorization" forever.

Playbook:

1. **Prefer device flow** when offered (`github.com/login/device` + short code). No callback server needed.
2. **If stuck on "waiting"**: VPN/firewall is usually blocking localhost — disconnect and retry.
3. **OAuth URLs are one-time and expire in minutes**: generate → hand over → approve promptly. A code read from a dead session is worthless; keep the waiter alive until approval lands.
4. **No TTY, no prompts**: pipe answers via stdin redirect (`tool < answers.txt`) or flags (`-p`, `-m`) — never assume interactivity.
