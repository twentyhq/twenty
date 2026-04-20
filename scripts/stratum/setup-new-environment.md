# Setting up a fresh Linux environment for Stratum / Twenty CRM

Audience: a fresh Claude Code instance (or a human) standing up a new native
Linux box to replace the current WSL environment. The user will SSH in from
Windows-side Claude Code and expect the toolchain and repo to be ready.

Assume the target is Ubuntu 24.04 LTS (what the previous WSL box ran) or any
recent Debian / Ubuntu derivative. Notes for other distros are inline where
they matter.

Work through the sections in order. Each section ends with a verification step
— do not skip it. If a verification fails, stop and debug before moving on.

---

## 0. Context — what you are bringing up

You are setting up a dev workstation for **Stratum's fork of Twenty CRM**. The
user deploys from this box to Railway (UAT + production). The essentials:

- **Repo**: `git@github.com:StratumCM/CRM.git` (remote name `origin`), with
  `upstream` tracking `twentyhq/twenty`. Yarn 4 / Nx monorepo. Needs Node 24.
- **Python scripts**: `scripts/stratum/` in the repo contains operational
  scripts (migrations, imports, etc.) used against UAT and production via the
  Twenty API. They need Python 3.10+ and rely only on the stdlib (`urllib`,
  `json`, `csv` — no pip install).
- **Railway**: deploys managed by the `railway` CLI. UAT = `uat` branch,
  production = `prod` branch.
- **Local Postgres + Redis**: required for `yarn start`. The repo includes a
  setup script that can use either host services or Docker Compose.
- **Secrets**: a small set of API keys live in `~/_Projects/stratum/.env` on
  the old box — they cannot be committed. The user must copy them across.

Before touching anything, run `uname -a`, `lsb_release -a`, and `whoami` and
note the distro, version, and user. Everything below assumes a non-root user
with sudo.

---

## 1. System packages

```bash
sudo apt-get update
sudo apt-get install -y \
  build-essential curl git wget ca-certificates gnupg lsb-release \
  jq unzip zip tar \
  python3 python3-venv python3-pip \
  postgresql-client redis-tools \
  openssh-client
```

`build-essential` is needed because some Node deps compile native addons.
`postgresql-client` gives you `psql` for talking to Railway Postgres — the
server itself comes from Docker or the host Postgres in step 4.

Verification:

```bash
git --version        # any modern Git
python3 --version    # >= 3.10
psql --version       # any, client-only
```

---

## 2. Node 24 via nvm, and Yarn 4 via Corepack

This repo pins `node ^24.5.0` and `yarn 4.13.0` (see `package.json`
`engines` and `packageManager` fields). Use `nvm` so the version is per-user
and repeatable; do **not** install Node from apt.

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Install and pin Node 24
nvm install 24
nvm alias default 24
nvm use default

# Enable Corepack so `yarn` resolves to the pinned 4.13.0 in the repo
corepack enable
```

Verification:

```bash
node --version       # v24.x
yarn --version       # 4.13.0 once you cd into the repo (Corepack activates it)
npx --version        # present
```

If `yarn --version` prints a 1.x or errors out, rerun `corepack enable` and
open a new shell.

---

## 3. GitHub CLI + SSH key for GitHub

Install `gh`:

```bash
type -p curl >/dev/null || sudo apt-get install -y curl
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | \
  sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
sudo chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
  | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt-get update && sudo apt-get install -y gh
```

Authenticate. Two options — pick whichever the user prefers, but SSH is what
the existing remotes use:

```bash
# Option A: SSH (recommended — matches origin URL format)
ssh-keygen -t ed25519 -C "clive@<hostname>"        # press enter for all prompts unless they want a passphrase
eval "$(ssh-agent -s)" && ssh-add ~/.ssh/id_ed25519
gh auth login  # choose GitHub.com → SSH → upload existing key

# Option B: HTTPS with a PAT via gh
gh auth login  # choose GitHub.com → HTTPS → browser or token
```

Verification:

```bash
gh auth status
ssh -T git@github.com   # should say "Hi <user>! You've successfully authenticated"
```

---

## 4. Docker + Docker Compose (for Postgres/Redis)

The dev-env setup script will detect a local Postgres 16 cluster if present,
but on a fresh box it is simpler to run Postgres and Redis via Docker. Install
Docker Engine (not Docker Desktop):

```bash
sudo apt-get install -y docker.io docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
# Open a new shell or run: newgrp docker
```

Verification:

```bash
docker --version
docker compose version
docker run --rm hello-world     # must succeed without sudo
```

---

## 5. Railway CLI

```bash
curl -fsSL cli.new | bash
# installs to /usr/local/bin/railway
railway --version   # expect 4.x
```

Authenticate. `railway login` requires opening a URL in a browser — if you're
SSHed in without display forwarding, use `--browserless` and paste the
pairing code:

```bash
railway login --browserless
```

The Railway access/refresh token will be written to `~/.railway/config.json`.
If the user has the existing token handy, they can copy that file across
directly instead of re-logging in.

For unattended scripts (like the GraphQL calls used when fixing the
backup-status-notifier), you can also export `RAILWAY_TOKEN=<project-token>`
per invocation — project tokens are created per-project in the Railway web UI.

Verification:

```bash
railway whoami --json
```

---

## 6. Clone the repo

The repo layout mirrors the old WSL box intentionally, so paths in docs and
scripts keep working:

```bash
mkdir -p ~/_Projects/stratum/twenty
cd ~/_Projects/stratum/twenty
git clone git@github.com:StratumCM/CRM.git source
cd source

# Add the upstream Twenty remote (used by sync-upstream skill)
git remote add upstream https://github.com/twentyhq/twenty.git
git fetch upstream --tags
```

Branches you'll work with:

- `uat` — what UAT Railway deploys from.
- `prod` — what production Railway deploys from.
- `main` — integration branch; PRs land here.

Verification:

```bash
git remote -v                   # origin + upstream
git branch -a | head            # local + remote branches visible
git log -1 --oneline            # HEAD is on main/uat with recent commits
```

---

## 7. Secrets and non-committed files to copy from the old box

**None of this is in Git** (correctly — it's all secret or environment-
specific). The user must `scp` / rsync these from the old machine. Ask them to
run from the old box:

```bash
# From OLD WSL box — create a tarball, scp it over, extract on new box
cd ~
tar --create --gzip --file /tmp/stratum-secrets.tgz \
  _Projects/stratum/.env \
  _Projects/stratum/twenty/source/packages/twenty-server/.env \
  _Projects/stratum/twenty/source/packages/twenty-front/.env \
  .railway/config.json \
  .claude/settings.local.json 2>/dev/null
scp /tmp/stratum-secrets.tgz <new-host>:/tmp/
```

Then on the new box:

```bash
cd ~
tar --extract --gzip --file /tmp/stratum-secrets.tgz
rm /tmp/stratum-secrets.tgz
```

Do a pass on each .env after extracting — they may reference host-specific
paths (e.g. local Postgres URLs) that need updating for the new box. In
particular:

- `packages/twenty-server/.env` — check `PG_DATABASE_URL` and `REDIS_URL`
  point to `localhost` (fine if you're using Docker Compose mapping 5432/6379
  to localhost).
- `~/_Projects/stratum/.env` — contains `TWENTY_UAT_API_KEY`,
  `TWENTY_PROD_API_KEY`, `TWENTY_UAT_URL`, `TWENTY_PROD_URL`, and UAT admin
  credentials. These are all remote endpoints — copy as-is.

If any secrets are missing on the old box, they can be regenerated:

- Twenty API keys: Settings → Developers → API keys in the target workspace.
- Railway auth: `railway login` (Option in step 5).
- GitHub SSH: make a new key on this box and add it to GitHub.

---

## 8. First-time dev environment bring-up

From the repo root:

```bash
cd ~/_Projects/stratum/twenty/source

# Install all JS deps (yarn 4 workspace install — slow the first time)
yarn install

# Start Postgres + Redis and seed databases
bash packages/twenty-utils/setup-dev-env.sh --docker
```

`--docker` forces Docker Compose mode; omit it if you installed host Postgres
16 and prefer that. The script is idempotent — rerun it freely.

Build the shared library once (other packages depend on it):

```bash
npx nx build twenty-shared
```

Now bring up the app:

```bash
# In one terminal (foreground is fine, or use tmux / separate SSH sessions)
yarn start
```

That launches the frontend (Vite, port 5173), backend (NestJS, port 3000),
and worker concurrently. First boot takes a while as Nx warms its cache.

Verification:

- Visit `http://localhost:5173` — the Twenty sign-in page loads.
- Click **Continue with Email** — prefilled credentials from the repo work.
- `curl -s http://localhost:3000/healthz` returns 200.
- `docker ps` shows `twenty-db` and `twenty-redis` containers running.

---

## 9. Claude Code on the new box

The repo's `.claude/` directory (skills, agents, napkin) is committed and will
already be present after the clone. Claude Code-side settings to re-create:

- `~/.claude/settings.json` — global settings (permissions, hooks). Copy from
  the old box if the user wants identical behaviour, otherwise let Claude
  Code create it on first run.
- `.claude/settings.local.json` — per-project local overrides (was copied in
  step 7 if present).
- The memory directory at
  `~/.claude/projects/-home-clive--Projects-stratum-twenty-source/memory/`
  holds auto-memory that would otherwise be lost. Copy it across too:

  ```bash
  # From OLD box
  scp -r ~/.claude/projects/-home-clive--Projects-stratum-twenty-source \
    <new-host>:~/.claude/projects/
  ```

  The path encodes the working directory — keep the repo at the exact same
  filesystem location (`~/_Projects/stratum/twenty/source`) or the memory
  won't be picked up.

---

## 10. Smoke tests

Before declaring the environment ready, run these in order. Each must pass.

```bash
# Node / Yarn sanity
node --version                    # v24.x
yarn --version                    # 4.13.0
node -e 'console.log("ok")'       # prints ok

# Repo sanity
cd ~/_Projects/stratum/twenty/source
git status                        # clean, on a known branch
npx nx typecheck twenty-shared    # passes

# Python scripts sanity
python3 scripts/stratum/meta_client.py --help 2>/dev/null \
  || python3 -c "import urllib.request, json, csv; print('stdlib ok')"

# Railway connectivity
railway whoami --json             # shows the user and workspace
railway status --json --json | jq '.environments.edges[].node.name'

# Docker + local services
docker ps                         # twenty-db + twenty-redis up
psql "postgresql://postgres:postgres@localhost:5432/default" -c '\dt' | head
redis-cli -h localhost ping       # PONG

# App runtime
curl -sf http://localhost:3000/healthz && echo ok
curl -sI http://localhost:5173 | head -1  # 200 OK
```

If everything above is green, the environment is ready. Hand control back to
the user with a summary of what was installed and any follow-ups (e.g. if
Railway auth was done with `--browserless` and needs refreshing, or if a
secret was not available on the old box and needs regenerating).

---

## Appendix A — Directory layout this guide assumes

```
~/_Projects/stratum/
├── .env                          # stratum-wide secrets (API keys, URLs)
├── twenty/
│   └── source/                   # the Git repo — this is the repo root
│       ├── .claude/              # Claude skills, agents, napkin (committed)
│       ├── packages/
│       │   ├── twenty-front/     # has .env (local, not committed)
│       │   ├── twenty-server/    # has .env (local, not committed)
│       │   └── twenty-utils/setup-dev-env.sh
│       └── scripts/stratum/      # Python ops scripts (committed)
└── scripts/                      # historical symlink target, optional
```

The `~/_Projects/stratum/scripts/` directory used to hold a second copy of
the Python ops scripts — it's no longer needed; everything canonical lives in
`twenty/source/scripts/stratum/`. If any old code references the outer path,
either update it or symlink:

```bash
ln -s ~/_Projects/stratum/twenty/source/scripts/stratum \
      ~/_Projects/stratum/scripts
```

## Appendix B — Common commands after setup

```bash
# Dev loop
yarn start                                        # front + back + worker
npx nx start twenty-front                         # frontend only
npx nx run twenty-server:worker                   # worker only

# Tests (see .claude/skills/run-tests/ for more)
npx jest path/to/test.test.ts --config=packages/twenty-server/jest.config.mjs

# Lint changed files vs main
npx nx lint:diff-with-main twenty-server --configuration=fix

# Sync upstream Twenty into this fork
#   (use the sync-upstream skill via Claude Code, which handles conflicts)

# Push to Railway
#   uat:  checkout uat && git push                (Railway auto-deploys)
#   prod: use the push-to-production skill in Claude Code
```

## Appendix C — Known gotchas

- **Node must be 24.x.** The `engines` field blocks `yarn install` on older
  Node. If Corepack complains about the `packageManager` field, upgrade to a
  Node that ships a recent Corepack (24.5+).
- **Docker rootless vs rootful**: the dev-env script assumes the current user
  can run `docker` without sudo. If you see permission errors, you forgot the
  `newgrp docker` step.
- **Memory directory path is derived from the repo location.** Do not move
  the repo after cloning, or Claude Code will create a new empty memory
  store. Either keep the path stable or copy the memory dir afresh under the
  new derived name.
- **Local Postgres version matters only in host mode.** The `setup-dev-env.sh`
  script looks for Postgres 16 specifically; other versions fall through to
  Docker mode, which is fine.
- **Bun is not required for local dev.** The `backup-status-notifier` Railway
  function runs on `function-bun` upstream, but its source is stored inline
  in the Railway service config — nothing to build locally.
