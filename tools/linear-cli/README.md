# Linear Environment Setup

Three scripts for managing Linear API credentials and environment configuration.

## Scripts Overview

### 1. `1-update-env.sh` - Update Environment
**Purpose:** Create or update `.env` file with validated Linear credentials and generate `.env.example` template.

**What it does:**
- Prompts for Linear OAuth credentials (Client ID, Secret, API Key)
- Validates credentials by testing API connection
- Verifies Team ID and Project ID exist in your workspace
- Backs up existing `.env` to `.env.backup`
- Removes old `.env` and creates new validated version
- Generates fresh `.env.example` template for sharing
- Updates `.gitignore` to protect secrets

**When to use:**
- First-time setup
- Rotating API keys
- Adding new Linear credentials
- After creating a new Linear OAuth application

**Usage:**
```bash
./1-update-env.sh
```

**Prompts you'll see:**
```
LINEAR_CLIENT_ID: lin_oauth_xxxxx
LINEAR_CLIENT_SECRET: lin_oacs_xxxxx
LINEAR_API_KEY: lin_api_xxxxx
LINEAR_TEAM_ID: xxxxxxxx-xxxx-...
LINEAR_PROJECT_ID: xxxxxxxx-xxxx-... (optional)
N8N_WEBHOOK_URL: https://... (optional)
```

**Output files:**
- `.env` - Your actual credentials (never commit)
- `.env.example` - Template for others (safe to commit)
- `.env.backup` - Previous version (if existed)

---

### 2. `2-export-env.sh` - Export to Shell
**Purpose:** Load `.env` variables and export them to your shell environment.

**What it does:**
- Reads variables from `.env` file
- Detects your shell (bash/zsh)
- Offers three export methods:
  1. **Current session only** - Variables available until terminal closes
  2. **Shell profile** - Permanently add to `~/.bashrc` or `~/.zshrc`
  3. **Both** - Immediate + permanent
- Tests connection after export
- Removes old Linear blocks before adding new ones (prevents duplicates)

**When to use:**
- After running `1-update-env.sh`
- Opening new terminal sessions
- After updating credentials

**Usage:**
```bash
./2-export-env.sh
```

**Choose export method:**
```
1) Current session only (temporary)
   → Variables available in this terminal only
   → Lost when you close terminal
   → Good for: Testing, one-time use

2) Add to ~/.bashrc (permanent)
   → Variables available in all new terminals
   → Persists across reboots
   → Good for: Daily development work

3) Both
   → Immediate access + permanent setup
   → Recommended for first-time setup
```

**What gets exported:**
```bash
LINEAR_CLIENT_ID
LINEAR_CLIENT_SECRET
LINEAR_API_KEY
LINEAR_TEAM_ID
LINEAR_PROJECT_ID
N8N_WEBHOOK_URL
```

---

### 3. `3-rotate-keys.sh` - Rotate Linear CLI Keys
**Purpose:** Update Linear CLI configuration with new API keys from `.env`.

**What it does:**
- Backs up existing Linear CLI config (`~/.config/linear/config.json`)
- Clears old Linear CLI configuration
- Sets new API key from `.env` file
- Tests new configuration by fetching user info
- Lists available teams to verify access
- Restores backup if rotation fails

**When to use:**
- After rotating API keys in Linear dashboard
- After running `1-update-env.sh` with new credentials
- When Linear CLI shows authentication errors
- When switching between different Linear workspaces

**Usage:**
```bash
./3-rotate-keys.sh
```

**Safety features:**
- Confirmation prompt before making changes
- Automatic backup of existing config
- Connection test before finalizing
- Auto-restore on failure

**Verifies:**
- Linear CLI can authenticate
- You can access your teams
- API key has correct permissions

---

## Complete Workflow

**First-time setup:**
```bash
# 1. Get credentials and validate
./1-update-env.sh

# 2. Export to shell (choose option 3 for both)
./2-export-env.sh

# 3. Update Linear CLI
./3-rotate-keys.sh
```

**Rotating credentials:**
```bash
# 1. Enter new credentials
./1-update-env.sh

# 2. Update shell environment
./2-export-env.sh

# 3. Sync Linear CLI
./3-rotate-keys.sh
```

**New terminal session:**
```bash
# Option A: If you chose "permanent" export
# (Nothing needed - variables auto-loaded)

# Option B: If you chose "current session only"
source .env  # or run ./2-export-env.sh again
```

---

## Getting Linear Credentials

### 1. Create OAuth Application
1. Go to https://linear.app/settings/api/applications
2. Click "Create new application"
3. Fill in:
   - **Name:** "Smartout AI Agents" (or your app name)
   - **Description:** "AI agent tracking system"
   - **Redirect URLs:** `http://localhost:3000/callback`
   - **Scopes:** Select required permissions (issues:read, issues:write, etc.)
4. Copy these values:
   - `CLIENT_ID` (starts with `lin_oauth_`)
   - `CLIENT_SECRET` (starts with `lin_oacs_`)

### 2. Generate API Key
1. Go to https://linear.app/settings/api
2. Click "Create new personal API key"
3. Name it (e.g., "Development")
4. Copy the key (starts with `lin_api_`)

### 3. Find Team ID
```bash
# After setting up, list teams:
linear team list

# Or view in URL when in Linear:
# https://linear.app/your-workspace/team/ABC/...
#                                      ^^^
#                                      Team Key
```

### 4. Find Project ID (optional)
```bash
# List projects:
linear project list

# Or get from URL:
# https://linear.app/your-workspace/project/smartout-ai/...
```

---

## Troubleshooting

**"Invalid API key"**
→ Regenerate API key in Linear settings
→ Run `./1-update-env.sh` with new key

**"Variables not available in new terminal"**
→ You chose "current session only"
→ Run `./2-export-env.sh` and choose option 2 or 3

**"Linear CLI not authenticated"**
→ Run `./3-rotate-keys.sh`
→ Verify API key has correct permissions

**"Team ID not found"**
→ Check you have access to the team
→ Run `linear team list` to verify
→ Use correct Team ID (UUID format)

---

## Files Structure
```
.
├── 1-update-env.sh          # Update and validate credentials
├── 2-export-env.sh          # Export to shell environment
├── 3-rotate-keys.sh         # Rotate Linear CLI keys
├── .env                     # Your credentials (DO NOT COMMIT)
├── .env.example             # Template (safe to commit)
├── .env.backup              # Previous .env (auto-generated)
└── .gitignore               # Protects .env files
```

---

## Security Notes

- `.env` contains sensitive credentials - never commit to git
- Scripts automatically update `.gitignore`
- Backups (`.env.backup`) are also protected
- API keys should be rotated regularly
- Use `.env.example` for team onboarding

---

## Quick Reference

| Task | Command |
|------|---------|
| Update credentials | `./1-update-env.sh` |
| Export to current session | `./2-export-env.sh` → Choose 1 |
| Export permanently | `./2-export-env.sh` → Choose 2 |
| Rotate CLI keys | `./3-rotate-keys.sh` |
| Test connection | `linear viewer` |
| List teams | `linear team list` |
| List issues | `linear issue list` |
| Load .env manually | `source .env` |

---

## Integration with n8n

After setup, these environment variables are available for n8n workflows:
```javascript
// In n8n Code node
const linearApiKey = process.env.LINEAR_API_KEY;
const teamId = process.env.LINEAR_TEAM_ID;
const projectId = process.env.LINEAR_PROJECT_ID;
```

Or use in n8n Linear node credentials configuration.