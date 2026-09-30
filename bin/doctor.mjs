#!/usr/bin/env node
// winch doctor — Windows agent-environment health check. Read-only.
// Usage: node bin/doctor.mjs
import { execSync } from "node:child_process";

let bad = 0, warnings = 0;
const ok = (name, detail = "") => console.log(`OK    ${name}${detail ? " — " + detail : ""}`);
const warn = (name, detail = "") => { console.log(`WARN  ${name}${detail ? " — " + detail : ""}`); warnings++; };
const fail = (name, detail = "") => { console.log(`FAIL  ${name}${detail ? " — " + detail : ""}`); bad++; };

function run(cmd) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"], shell: "powershell.exe", timeout: 15000 }).toString().trim();
  } catch { return null; }
}

// 1. Shell
const psv = run("$PSVersionTable.PSVersion.ToString()");
if (psv) {
  if (psv.startsWith("5.1")) warn("shell powershell " + psv, "quote carefully, see docs/quoting.md");
  else ok("shell powershell " + psv);
} else fail("shell", "could not detect PowerShell version");

// 2. Toolchain (PATH + known install locations)
const known = {
  git: ["C:\\Program Files\\Git\\cmd\\git.exe"],
  gh: ["C:\\Program Files\\GitHub CLI\\gh.exe"],
  bun: [process.env.APPDATA + "\\.bun\\bin\\bun.exe"],
  opencode: [process.env.USERPROFILE + "\\.opencode\\bin\\opencode.exe"],
  winget: ["C:\\Users\\User\\AppData\\Local\\Microsoft\\WindowsApps\\winget.exe"],
};
for (const [tool, paths] of Object.entries(known)) {
  const probe = `$c = Get-Command ${tool} -ErrorAction SilentlyContinue; if ($c) { $c.Source } ${paths.map((p) => `elseif (Test-Path '${p}') { '${p}' }`).join(" ")}`;
  const v = run(probe);
  if (v) ok(`toolchain ${tool}`, v.split("\n").pop());
  else fail(`toolchain ${tool}`, "not found");
}

// 3. Git identity
const gname = run("git config --global user.name");
const gemail = run("git config --global user.email");
if (gname && gemail) ok("git identity", `${gname} <${gemail}>`);
else fail("git identity", "set with: git config --global user.name X && git config --global user.email Y");

// 4. Execution policy (scripts must run)
const ep = run("Get-ExecutionPolicy -Scope CurrentUser");
if (ep && ep !== "Restricted") ok("exec-policy", ep);
else warn("exec-policy", (ep || "unknown") + " — scripts may be blocked; set RemoteSigned for CurrentUser");

// 5. Long paths
const lp = run("(Get-ItemProperty 'HKLM:\\SYSTEM\\CurrentControlSet\\Control\\FileSystem' -Name LongPathsEnabled -ErrorAction SilentlyContinue).LongPathsEnabled");
if (lp === "1") ok("long-paths", "enabled");
else warn("long-paths", "disabled — deep node_modules may fail; enable LongPathsEnabled");

// 6. Node (probe the binary directly — PATH shims don't survive Get-Command)
const nv = run("node --version");
if (nv) ok("node", nv);
else warn("node", "not found — winch CLI needs Node 18+");

if (bad > 0) { console.log(`winch doctor: ${bad} FAILING — fix red first`); process.exit(1); }
if (warnings > 0) console.log(`winch doctor: OK with ${warnings} warnings`);
else console.log("winch doctor: ALL GREEN");
