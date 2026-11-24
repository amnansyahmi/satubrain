# Cross-platform installation

SatuBrain requires **Python 3.11+** built with SQLite **FTS5** support.

## Linux (bash / zsh)

### Option A: `pipx` *(unverified on this host without pipx)*

```sh
pipx install git+https://github.com/amnansyahmi/satubrain.git
pipx ensurepath
```

Open a new terminal, then verify:

```sh
satubrain doctor
satubrain demo
```

### Option B: Virtual environment (`venv` + `pip`) *(verified on Linux Python 3.12)*

```sh
git clone https://github.com/amnansyahmi/satubrain.git
cd satubrain
python3 -m venv .venv
source .venv/bin/activate
python -m pip install .
satubrain doctor
satubrain demo
```

### Linux `PATH` troubleshooting

- If `satubrain: command not found` appears after `pipx install`, add `~/.local/bin` to your shell profile (`~/.bashrc` or `~/.zshrc`):
  ```sh
  export PATH="$HOME/.local/bin:$PATH"
  ```
- For virtual environments, either activate `.venv/bin/activate` or invoke the full path `.venv/bin/satubrain` (recommended for MCP client configs).

---

## macOS (zsh) *(unverified on this host)*

### Option A: `pipx`

```zsh
brew install pipx
pipx ensurepath
pipx install git+https://github.com/amnansyahmi/satubrain.git
```

Reopen your terminal and run:

```zsh
satubrain doctor
satubrain demo
```

### Option B: Virtual environment (`venv` + `pip`)

```zsh
git clone https://github.com/amnansyahmi/satubrain.git
cd satubrain
python3 -m venv .venv
source .venv/bin/activate
python -m pip install .
satubrain doctor
satubrain demo
```

### macOS `PATH` troubleshooting

- Ensure `~/.local/bin` (for `pipx`) is in `~/.zshrc`:
  ```zsh
  export PATH="$HOME/.local/bin:$PATH"
  ```
- If `satubrain doctor` reports missing FTS5 with system Python, install Python 3.11+ from Homebrew (`brew install python@3.12`) or python.org and recreate the environment.
- Locate the absolute binary path for MCP clients with `which satubrain`.

---

## Windows (PowerShell) *(unverified on this host)*

### Option A: `pipx`

```powershell
py -3.12 -m pip install --user pipx
py -3.12 -m pipx ensurepath
```

Close and reopen PowerShell, then install and verify:

```powershell
pipx install git+https://github.com/amnansyahmi/satubrain.git
satubrain doctor
satubrain demo
```

### Option B: Virtual environment (`venv` + `pip`)

```powershell
git clone https://github.com/amnansyahmi/satubrain.git
cd satubrain
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install .
satubrain doctor
satubrain demo
```

### Windows PowerShell `PATH` & execution policy troubleshooting

- If script activation fails with `running scripts is disabled on this system`, you do **not** have to change your execution policy — invoke the virtual environment executables directly instead:
  ```powershell
  .\.venv\Scripts\python.exe -m pip install .
  .\.venv\Scripts\satubrain.exe doctor
  .\.venv\Scripts\satubrain.exe demo
  ```
- Alternatively, if you prefer activating `.venv`, allow local signed/user scripts in the current user scope:
  ```powershell
  Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
  ```
- If `satubrain` is not recognized after `pipx install`, confirm `%USERPROFILE%\.local\bin` is in your User `Path` environment variable and open a new PowerShell window.
- Locate the absolute executable path for MCP clients with:
  ```powershell
  (Get-Command satubrain).Source
  ```

See [Troubleshooting](TROUBLESHOOTING.md) for SQLite FTS5, MCP `PATH`, and scope mismatch recovery examples.
