# SatuBrain

**Pick up the same coding task in a different AI agent.**

SatuBrain gives Claude Code, Codex, GitHub Copilot and Cursor a shared, searchable task memory. Save the decisions, selected conversation turns and next steps for a task. When you switch agents or return the next day, retrieve the context for the same Git branch from local SQLite.

![SatuBrain terminal demo showing handoff, resume and scoped search](docs/demo.gif)

## Try it in 60 seconds

No AI account or API key is needed for the synthetic demo. With Python 3.11+ and pipx installed:

```sh
pipx install git+https://github.com/amnansyahmi/satubrain.git
satubrain doctor
satubrain demo
```

The demo uses a temporary database, not your real workspace or memory. The doctor checks runtime prerequisites, not live agent connectivity.

## Quick start

Requires Python 3.11+ with SQLite FTS5. Install from a checkout with `python -m pip install .`, then run these commands in your Git project.

```sh
satubrain remember --task DEMO-17 --kind decision "Keep imports transactional."
satubrain handoff --task DEMO-17 "Import tests passed. Verify cancellation on large files next."
satubrain resume --task DEMO-17 "imports" --budget 1200
satubrain dashboard --task DEMO-17
```

Run `satubrain config codex --task DEMO-17` to generate a client configuration. Substitute `claude`, `copilot` or `cursor` for other clients. Use the same task ID in each client. [Client setup and hooks](docs/agents.md)

## How memory works

| Feature | Behavior |
| --- | --- |
| Isolation | Reads and writes use a project, task and Git branch. The project ID comes from the credential-free Git remote or a local path. Use `--project` for a shared ID across clones with different remotes. |
| Task continuity | MCP exposes `remember`, `search`, `resume`, `handoff` and `record_message`. Opt-in Claude Code and Codex hooks resume context at startup and save a marked handoff summary at the end of a turn. |
| Retrieval | SQLite FTS5 ranks matches. `resume` prioritizes the latest handoff and fits the selected context into a conservative UTF-8 byte budget. |
| History | Save selected messages through MCP or `satubrain record`. Use `history-import` for JSONL, `history` for ordered replay, and `search --kind message` for full-text search. |
| Dashboard | Browse tasks and branches, search and filter memories, inspect full entries, add notes and delete records in a loopback-only dashboard. |
| Portability | Export a portable JSON snapshot or use optional passphrase-encrypted sync through a folder you control. |

The core uses local SQLite and has zero third-party runtime dependencies. Examples and tests use synthetic data. SatuBrain stores data in `~/.satubrain/memory.sqlite3` by default. Use `SATUBRAIN_DB` or the global `--db` option to select a different database.

- [Agent configuration](docs/agents.md)
- [History, import/export and encrypted sync](docs/data.md)
- [Security and trust model](SECURITY.md)
- [Verification and benchmarks](docs/verification.md)

## Community

[Contribute](CONTRIBUTING.md) · [Troubleshooting](docs/TROUBLESHOOTING.md) · [Roadmap](docs/ROADMAP.md)

SatuBrain is currently a release candidate. If it helps you switch coding agents without losing context, consider starring the repository. Feedback and reproducible bug reports are welcome.

MIT licensed.

## Website hosting

The portfolio page lives in `site/` and uses synthetic examples. The repository's `vercel.json` selects the **Other** framework preset and serves that directory as static files. For a local preview, run `python -m http.server --bind 127.0.0.1 --directory site`. Run `satubrain dashboard` separately to access your local memory.
