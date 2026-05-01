# Twenty CRM Contribution Plan: 16 Small PRs

## Strategy
- Each PR is independent (no cross-dependencies except PR 2)
- Scoped to 1-2 days of work, <300 lines of changes
- Follow Twenty contribution flow: `git checkout -b feat/pr-short-description` → implement → lint/typecheck → test → commit → PR

---

## Email Verification PRs (7 PRs)

| PR # | Status | Title | Scope | Key Files |
|------|--------|-------|-------|-----------|
| 1 | **Done** | Add EMAIL_UPDATE support to resend flow | Add `verificationTrigger` param to `resendEmailVerificationToken`, fix hardcoded SIGN_UP | `email-verification.service.ts`, resolvers |
| 2 | Pending | Make resend endpoint authenticated + remove user repo dependency | Add auth guard, use session user instead of email query (addresses line 137 TODO) | `email-verification.controller.ts`, `email-verification.service.ts` |
| 3 | Pending | Make resend cooldown configurable | Replace hardcoded 1m with `EMAIL_VERIFICATION_RESEND_COOLDOWN_MS` via TwentyConfigService | `email-verification.service.ts`, config definitions |
| 4 | Pending | Add max resend attempts protection | Add `EMAIL_VERIFICATION_MAX_RESENDS` config, track count in AppToken, block abuse | `email-verification.service.ts`, `app-token.entity.ts` |
| 5 | Pending | Fix email enumeration protection | Return generic responses ("If your email exists, a verification email has been sent") | `email-verification.service.ts`, exception messages |
| 6 | Pending | Handle expired tokens in resend flow | Skip cooldown if existing token is already expired | `email-verification.service.ts` |
| 7 | Pending | Add audit logging for verification events | Log email sends, rate limits, token events via TwentyLogger | `email-verification.service.ts`, `email-verification-token.service.ts` |

---

## AI Features PRs (9 PRs)

| PR # | Status | Title | Scope | Key Files |
|------|--------|-------|-------|-----------|
| 8 | Pending | Add tests for agent-async-executor | Unit tests for core execution logic, mock AI SDK | `ai-agent-execution/__tests__/` |
| 9 | Pending | Add tests for chat-execution.service | Tests for tool calls, streaming setup | `ai-chat/__tests__/` |
| 10 | Pending | Add tests for agent-turn-grader | Tests for AI-powered turn evaluation | `ai-agent-monitor/__tests__/` |
| 11 | Pending | Add Cohere AI provider | Integrate `@ai-sdk/cohere`, add API key config | `sdk-provider-factory.service.ts`, `package.json` |
| 12 | Pending | Add Ollama support | Configure via OpenAI-compatible provider, add base URL config | `sdk-provider-factory.service.ts` |
| 13 | Pending | Add reusable prompt templates | Seed lead scoring/summarization templates to Skills system | `skill.service.ts`, skill seeds |
| 14 | Pending | Improve AI execution error handling | Add retries for transient errors, better logging | `agent-async-executor.service.ts` |
| 15 | Pending | Document AI_AGENT workflow action | Add examples/guides to docs site | `packages/twenty-website/` |
| 16 | Pending | Polish AI Chat streaming | Fix edge cases (disconnects, incomplete chunks) | `agent-chat-streaming.service.ts`, frontend hooks |

---

## Per-PR Execution Checklist
1. Create branch: `git checkout -b feat/pr-short-description`
2. Implement changes
3. Run lint/typecheck:
   ```bash
   npx nx lint:diff-with-main twenty-server --configuration=fix
   npx nx typecheck twenty-server
   ```
4. Add tests, run:
   ```bash
   npx jest path/to/test.spec.ts --config=packages/twenty-server/jest.config.mjs
   ```
5. Commit (follow existing style: `feat(email-verification): add EMAIL_UPDATE support`)
6. Push + create PR with description of changes and test steps

---

## Recommended Priority Order (Start Here)
1. PR 1 (EMAIL_UPDATE support) - no dependencies, clear value
2. PR 5 (enumeration protection) - security fix, small scope
3. PR 6 (expired token handling) - UX improvement, small scope
4. PR 8 (agent-async-executor tests) - foundational test coverage
5. PR 3 (configurable cooldown) - simple config change
