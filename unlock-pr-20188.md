# Plan: Unlock PR #20188

## Overview
This plan focuses on resolving the critical CI failure in the `api-breaking-changes` check for PR #20188 in the `twenty-hq/twenty` repository. The primary objective is to debug the GraphQL schema crash in CI and prepare the necessary justification for breaking changes.

**Project Type**: BACKEND

## Success Criteria
- [ ] CI job `api-breaking-changes` completes without JSON parsing errors or crashes.
- [ ] `main-schema-introspection.json` is correctly retrieved/generated and parsed in the CI runner.
- [ ] Breaking changes introduced in this PR are identified, audited, and justified.
- [ ] Required CI checks (Lint, Typecheck) are addressed in the context of the fixes.

## Tech Stack
- **Framework**: NestJS with GraphQL
- **Package Manager**: Yarn v4 (Berry)
- **CI/CD**: GitHub Actions
- **Build System**: Nx

## File Structure (Key Areas)
- `.github/workflows/`: CI workflow definitions.
- `packages/twenty-server/`: Main backend application.
- `packages/twenty-server/src/engine/core-modules/`: Specific modules potentially causing changes.

## Task Breakdown

### Phase 1: ANALYSIS (Discovery)
- [ ] **Task 1.1**: Analyze `.github/workflows/api-breaking-changes.yml` to understand the schema comparison process.
  - **Agent**: `devops-engineer`
  - **Skills**: `bash-linux`, `nodejs-best-practices`
  - **Verify**: Identified the script/command that fails to parse `main-schema-introspection.json`.
- [ ] **Task 1.2**: Locate and inspect the script used for GraphQL introspection and comparison.
  - **Agent**: `explorer-agent`
  - **Skills**: `clean-code`
  - **Verify**: Path to the comparison script and introspection command found.

### Phase 2: CI DEBUGGING (Fixing the Crash) - 🚧 IN PROGRESS
- [x] **Task 2.1**: Fix the schema generation/retrieval logic in CI to ensure valid JSON is produced.
  - **Agent**: `debugger`
  - **Skills**: `systematic-debugging`, `bash-linux`
  - **Verify**: Mocked or local simulation of the CI step passes JSON validation (Added HTTP status checks and -sf flag).
- [ ] **Task 2.2**: Update the comparison script or components to handle edge cases in schema loading.
  - **Agent**: `backend-specialist`
  - **Skills**: `clean-code`, `api-patterns`
  - **Verify**: Script no longer crashes when the input file is missing or invalid.

### Phase 3: SOLUTIONING (Breaking Changes Audit)
- [ ] **Task 3.1**: Run GraphQL introspection on the current branch.
  - **Agent**: `backend-specialist`
  - **Skills**: `nodejs-best-practices`
  - **Verify**: Successful generation of current schema.
- [ ] **Task 3.2**: Identify differences between current schema and main branch schema.
  - **Agent**: `backend-specialist`
  - **Skills**: `api-patterns`
  - **Verify**: List of breaking changes generated.

### Phase 4: IMPLEMENTATION & DOCUMENTATION
- [ ] **Task 4.1**: Document justifications for each identified breaking change.
  - **Agent**: `documentation-writer`
  - **Skills**: `documentation-templates`
  - **Verify**: Draft justification text ready for PR.
- [ ] **Task 4.2**: Resolve Lint/Typecheck errors in files touched by the fix.
  - **Agent**: `orchestrator`
  - **Skills**: `lint-and-validate`
  - **Verify**: `npm run lint` and `tsc --noEmit` pass for modified files.

## Phase X: Final Verification
- [ ] Run `python .agent/scripts/verify_all.py .`
- [ ] Verify CI logs for the `api-breaking-changes` step.
- [ ] Ensure all required checks are green.

## ✅ PHASE X COMPLETE
- Date: [Pending]
