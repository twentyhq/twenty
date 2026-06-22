# CLI Commands

Binary: `twenty` (from `twenty-sdk`). Global option: `-r, --remote <name>` selects target server before every command action. Default remote from `~/.twenty/config.json` when omitted.

## App Lifecycle

### `twenty dev [appPath]`
Watch-mode local development sync. Default behavior; `--once` for one-shot CI sync.

| Flag | Purpose |
|---|---|
| `-w, --watch` | Explicit watch (default) |
| `-o, --once` | Build + sync once, then exit |
| `-v, --verbose` | Detailed logs |
| `-d, --debug` | Alias for --verbose |

**Orchestrator pipeline**: check server → build manifest → register app → upload files → sync application → generate API client (on object/field changes). Writes `.twenty/output/`.

### `twenty build [appPath]`
Build app to `.twenty/output/`. Validates manifest, builds files, runs typecheck, updates checksums.

| Flag | Purpose |
|---|---|
| `--tarball` | Also pack `.tgz` in output dir |

### `twenty deploy [appPath]`
Build tarball + upload to Twenty server registry. Calls `ApiService.uploadAppTarball`.

| Flag | Purpose |
|---|---|
| `-r, --remote <name>` | Target server |

### `twenty install [appPath]`
Install deployed app on connected server by manifest universal identifier. Calls `ApiService.installTarballApp`.

| Flag | Purpose |
|---|---|
| `-r, --remote <name>` | Target server |

### `twenty publish [appPath]`
Build + `npm publish` from `.twenty/output/`. npm dist-tag controlled.

| Flag | Purpose |
|---|---|
| `--tag <tag>` | npm dist-tag (beta, next, etc.) |

### `twenty typecheck [appPath]`
TypeScript validation only. Exits 0 on clean, 1 on errors.

### `twenty uninstall [appPath]`
Uninstall app + clear registration/access/refresh token config.

| Flag | Purpose |
|---|---|
| `-y, --yes` | Skip confirmation |

## Entity Generation

### `twenty add [entityType]`
Generate source files from templates. Writes under `src/<entity>s/` by default or custom `--path`.

| Flag | Purpose |
|---|---|
| `--path <path>` | Custom output directory |

**Entity types**: Object, Field, LogicFunction, FrontComponent, Role, Skill, Agent, ConnectionProvider, View, NavigationMenuItem, PageLayout, PageLayoutTab, CommandMenuItem.

Object creation can also generate companion view, navigation menu item, and record page layout. Connection provider creation appends server variables to `src/application-config.ts`.

**Gap**: Most entity data is collected via interactive prompts. No non-interactive flags for entity fields exist. Automation needs stdin piping or direct template utility calls.

## Function Runtime

### `twenty exec [appPath]`
Execute a logic function with JSON payload.

| Flag | Purpose |
|---|---|
| `--postInstall` | Run post-install hook |
| `--preInstall` | Run pre-install hook |
| `-u, --functionUniversalIdentifier <id>` | By universal ID |
| `-n, --functionName <name>` | By name |
| `-p, --payload <json>` | JSON payload (default `{}`) |

### `twenty logs [appPath]`
Stream logic function logs via SSE subscription.

| Flag | Purpose |
|---|---|
| `-u, --functionUniversalIdentifier <id>` | Filter by function |
| `-n, --functionName <name>` | Filter by name |

## Remote / Auth

### `twenty remote add`
Register a Twenty server. API key auth or OAuth flow.

| Flag | Purpose |
|---|---|
| `--api-url <url>` | Server base URL |
| `--api-key <key>` | API key (skips OAuth) |
| `--as <name>` | Remote name |
| `--local` | Detect local Docker server |
| `--test` | Write test config |

### `twenty remote list`
Show configured remotes.

### `twenty remote switch [name]`
Set default remote.

### `twenty remote status`
Validate current remote auth.

### `twenty remote remove <name>`
Delete remote config.

**Note**: No standalone `login`/`logout` CLI commands registered. Auth via `remote add` or programmatic `authLogin`/`authLoginOAuth`/`authLogout` from `twenty-sdk/cli`.

## Server Management

### `twenty server start`
Start local Twenty Docker instance.

| Flag | Purpose |
|---|---|
| `-p, --port <port>` | Port (default 3000) |
| `--test` | Isolated test instance |

### `twenty server stop [--test]`
Stop container.

### `twenty server logs [-n <lines>] [--test]`
Follow container logs.

### `twenty server status [--test]`
Report container health, URL, version, login.

### `twenty server reset [--test]`
Remove container + data/storage volumes.

### `twenty server upgrade [version] [--test]`
Pull new image + recreate if digest changed.

### `twenty server catalog-sync [-r <name>]`
Trigger marketplace catalog refresh. (Top-level `catalog-sync` is deprecated.)

## Generated Artifacts

| Command | Output |
|---|---|
| `dev` / `dev --once` | `.twenty/output/` manifest + built files + generated API client |
| `build` | `.twenty/output/` manifest + built files |
| `build --tarball` | `.twenty/output/*.tgz` |
| `add` | `src/<entity>s/*.ts` (or `.tsx` for front components) |

## CLI API Service Wrappers

Internal wrappers used by commands, exposed via `twenty-sdk/cli` for programmatic use:

| Wrapper | Endpoints |
|---|---|
| `ApplicationApi` | POST `/metadata`: syncMarketplaceCatalog, findApplicationRegistration, createApplicationRegistration, rotateApplicationRegistrationClientSecret, createDevelopmentApplication, syncApplication, uninstallApplication |
| `FileApi` | POST `/metadata`: UploadAppTarball (multipart), InstallMarketplaceApp, UploadApplicationFile (multipart) |
| `LogicFunctionApi` | POST `/metadata`: FindManyLogicFunctions, ExecuteOneLogicFunction; SSE `/metadata`: logicFunctionLogs |
| `SchemaApi` | POST `/graphql` + `/metadata`: schema introspection |
| `ClientService` | generateCoreClient → `twenty-client-sdk/generate` replaceCoreClient |
