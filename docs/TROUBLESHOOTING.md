# Troubleshooting

| Symptom | What to try |
| --- | --- |
| Command not found | Verify installation and PATH; for pipx run `pipx ensurepath` and reopen the terminal. |
| SQLite FTS5 unavailable | Run `satubrain doctor`; use a Python distribution built with FTS5. |
| Agent cannot launch MCP | Use the absolute installed executable path, merge the generated configuration into the correct client file, and restart the client. |
| Agent cannot find a checkpoint | Check project ID, task, branch and database path on both clients. Run `satubrain scopes` locally. |
| Sync does not appear on another device | Verify folder delivery, matching passphrase and project ID; run push and pull explicitly. |

## Reproducible examples

All examples below use synthetic data and temporary databases under a throwaway directory.

### 1. Missing SQLite FTS5

**Check runtime support:**

```sh
satubrain doctor
```

**Expected error when FTS5 is missing:**

```text
satubrain: SQLite FTS5 extension is unavailable in this Python build; install Python 3.11+ with FTS5 enabled and rerun 'satubrain doctor'
```

(Exit code `1`.)

**Recovery:**

1. Confirm which Python build is running `satubrain`:
   ```sh
   python3 -c "import sqlite3; conn = sqlite3.connect(':memory:'); conn.execute('CREATE VIRTUAL TABLE t USING fts5(x)'); print('FTS5 OK', sqlite3.sqlite_version)"
   ```
2. Install or switch to a Python 3.11+ build compiled with SQLite FTS5 (for example official python.org installers, Homebrew Python on macOS, or `uv python install 3.12`), then reinstall `satubrain` with that interpreter and re-run `satubrain doctor`.
3. When healthy, `satubrain doctor` exits `0` and prints `"fts5": true`.

### 2. MCP executable not found on `PATH`

GUI clients (Claude Code, Cursor, VS Code / Copilot) often launch MCP servers with a minimal `PATH` that excludes `~/.local/bin` or a virtual environment's `bin/` / `Scripts/` folder.

**Symptom in client logs:**

```text
ENOENT: spawn satubrain ENOENT
```

**Recovery:**

1. Locate the absolute executable path from your shell:
   ```sh
   # Linux / macOS
   which satubrain
   # Windows PowerShell
   (Get-Command satubrain).Source
   ```
2. Regenerate the client config with the installed binary or replace `"command": "satubrain"` with the absolute path (for example `"/home/example/.local/bin/satubrain"` or `"C:\\Users\\example\\.local\\bin\\satubrain.exe"`):
   ```sh
   satubrain config codex --project demo-app --task DEMO-17 --branch main
   ```
3. Merge the snippet into the client's MCP configuration file and fully restart the client.

### 3. Mismatched task, branch, or project scopes

Because SatuBrain isolates memories by `(project, task, branch)` and database path, a small mismatch returns an empty context.

**Reproduce with a temporary database:**

```sh
DB="$(mktemp -d)/memory.sqlite3"
satubrain --db "$DB" handoff --project demo-app --task DEMO-17 --branch main "Schema migration verified."
satubrain --db "$DB" resume  --project demo-app --task DEMO-18 --branch main "migration"
```

**Expected output (empty `items` because `DEMO-18` does not match `DEMO-17`):**

```json
{
  "items": [],
  "context_bytes": 2,
  "budget": 1600
}
```

**Recovery:**

1. List the recorded scopes in that database:
   ```sh
   satubrain --db "$DB" scopes
   ```
2. Compare `project`, `task`, and `branch` from `scopes` against the flags passed to `resume` / `search` / `satubrain config`.
3. Re-run with the matching scope:
   ```sh
   satubrain --db "$DB" resume --project demo-app --task DEMO-17 --branch main "migration"
   ```

See [agent setup](agents.md) and [data portability](data.md). The runtime doctor does not verify a live agent connection. Never post your database, transcripts, credentials or unredacted configuration in a public issue.
