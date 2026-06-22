# GitHub Actions

37 workflows + 8 composite actions. Grouped by automation family.

## Composite Actions (.github/actions/)

### App Automation Actions

| Action | Inputs | Steps | Purpose |
|---|---|---|---|
| `deploy-twenty-app` | api-url, api-key, app-path | corepack → node → yarn install → configure remote → `yarn twenty deploy --remote target` | Build + deploy app to instance |
| `install-twenty-app` | api-url, api-key, app-path | corepack → node → yarn install → configure remote → `yarn twenty install --remote target` | Install/upgrade app on workspace |
| `spawn-twenty-app-dev-test` | twenty-version | docker pull + run `twentycrm/twenty-app-dev` on :2021 | Lightweight app-dev test instance |
| `spawn-twenty-docker-image` | twenty-version, twenty-repository, github-token | checkout → rewrite image tag → docker compose up → healthz on :3000 | Full Twenty stack for E2E |

### CI Plumbing Actions

| Action | Purpose |
|---|---|
| `yarn-install` | Node 24 + yarn install |
| `nx-affected` | Nx affected task runner with cache |
| `restore-cache` / `save-cache` | actions/cache v4 proxy |

## Create App Workflows (App Automation Core)

### ci-create-app.yaml
Package CI for `create-twenty-app`. Path gate: `packages/create-twenty-app/**`. Builds + lint/test via nx-affected.

### ci-create-app-e2e-minimal.yaml
**Most important workflow for app automation.** Validates minimal scaffold end-to-end.

Steps:
1. Publish `twenty-client-sdk`, `twenty-sdk`, `create-twenty-app` to local Verdaccio
2. Install `create-twenty-app@$CI_VERSION`
3. `create-twenty-app test-app --skip-local-instance`
4. `yarn install && npx --no-install twenty app build`
5. Spawn `spawn-twenty-docker-image`
6. `npx --no-install twenty app publish --api-url $TWENTY_API_URL --api-key $TWENTY_API_KEY`
7. `npx --no-install twenty app install --api-url $TWENTY_API_URL --api-key $TWENTY_API_KEY`

Trigger: push(main), pull_request. Path gate: create-twenty-app + twenty-sdk + twenty-client-sdk + twenty-shared.

### ci-create-app-e2e-hello-world.yaml / ci-create-app-e2e-postcard.yaml
Same flow as minimal but with `--example hello-world` / `--example postcard`. Also execute named logic functions after install.

Trigger: workflow_dispatch only (push/pull_request triggers commented out).

Additional steps:
```
npx --no-install twenty exec --functionName hello-world-logic-function
npx --no-install twenty exec --functionName create-hello-world-company
```

## Example App Workflows

### ci-example-app-hello-world.yaml / ci-example-app-postcard.yaml
Integration tests for committed example apps. Build SDK → start E2E server → `npx vitest run` in example dir. Path-gated per example + shared packages.

## SDK and Server CI

### ci-sdk.yaml
Lint + typecheck + test + build via nx-affected. Integration: build SDK → start E2E server → vitest e2e config.

### ci-server.yaml
Backend CI + drift enforcement. Runs metadata bundler audits, graphql/metadata/database/open-api generation, client-sdk drift check, integration tests, translation checks.

### ci-breaking-changes.yaml
Generates GraphQL + OpenAPI schemas at PR base and head. Runs `graphql-inspector diff` + custom OpenAPI breaking-change script. Posts results via `post-ci-comments.yaml`.

## Frontend CI Family

### ci-front.yaml
Storybook (sharded), lint/typecheck/test/build, graphql/metadata generation.

### ci-ui.yaml
Lint/typecheck/test/build + Storybook for `twenty-ui`.

### ci-front-component-renderer.yaml
Build + test for component renderer. Consumes Storybook artifacts from front.

## Other Package CI

| Workflow | Package | Trigger |
|---|---|---|
| ci-docs.yaml | twenty-docs | push(main), pull_request |
| ci-emails.yaml | twenty-emails | push(main), pull_request |
| ci-shared.yaml | twenty-shared | pull_request, merge_group |
| ci-website.yaml | twenty-website-new | pull_request, merge_group |
| ci-zapier.yaml | twenty-zapier | pull_request |
| ci-test-docker-compose.yaml | twenty-docker | pull_request |
| ci-create-app.yaml | create-twenty-app | push(main), pull_request |
| ci-ai-catalog-sync.yaml | Server script | schedule(06:00 UTC daily) |

## CD and Release

| Workflow | Trigger | Purpose |
|---|---|---|
| cd-deploy-main.yaml | push(main) | Deploy + Docker build via external `twentyhq/twenty-ci` |
| cd-deploy-tag.yaml | push(tags v*.*.*) | Tagged release deploy |
| ci-release-create.yaml | pull_request labeled | Prepare release PR |
| ci-release-merge.yaml | pull_request closed | Publish release |

## Infrastructure Workflows

| Workflow | Trigger | Purpose |
|---|---|---|
| changed-files.yaml | workflow_call | Path-gate reusable gate |
| preview-env-dispatch.yaml | pull_request | Spawn preview environment |
| preview-env-keepalive.yaml | schedule(0 */4 * * *) | Keep preview alive |
| visual-regression-dispatch.yaml | workflow_run | Visual regression tests |
| claude.yml | issue_comment, PR events | Claude Code AI assistant |
| ci-merge-queue.yaml | merge_group | Merge queue labeling |
| ci-utils.yaml | pull_request_target | Danger, congratulations, PR lifecycle |
| i18n-*.yaml | schedule + dispatch | Crowdin translation sync (app, docs, website) |

## Secrets Referenced

| Secret | Where Used |
|---|---|
| `GITHUB_TOKEN` | Universal |
| `ANTHROPIC_API_KEY` | claude.yml, AI catalog sync |
| `GH_PERSONAL_ACCESS_TOKEN` / `GH_PAT` | Preview env, i18n PRs |
| `CROWDIN_PERSONAL_TOKEN` | i18n workflows |
| `TWENTY_DEPLOY_URL` / `TWENTY_DEPLOY_API_KEY` | CD workflow template |
| `CLAUDE_API_KEY` / `OPENAI_API_KEY` | AI catalog sync |
