# AI frontend components

`IS_AI_CHAT_COMPONENT_BUILDER_ENABLED` is off by default. Authoring requires application-management permission and a signed-in chat. Chat and CLI share the system-created Workspace custom application and its stored `package.json` and `yarn.lock`.

The flow is sample preview, revision, explicit approval, then publication. Each draft has one authored TSX file and one selected surface, dashboard or record page. The compiler requires a named `Component` export; it adds the theme, static query and SDK registration. Preview uses fictional records, never live query results. Queries select accessible top-level fields from one object, at most 100 records. Components receive `{ records, count, hasNextPage }` and should show when results are partial.

Lambda compilation uses app-scoped immutable dependency layers and React, React DOM and Twenty UI vendors. Publication saves the exact preview bytes and vendor without rebuilding. Approval is bound to the current immutable draft in its original chat; permissions, dependencies and browser diagnostics are rechecked. Browser readiness is reported by the author, not server attestation. Drafts expire after 24 hours.

Saved components read records with each viewer’s current permissions and run in the restricted renderer without application credentials. Source lives at `src/ai-front-components/<id>.front-component.tsx`, alongside a generated runtime artifact. Sample records are not written to the CRM. Saving makes the component available in its selected widget picker; placement is a separate action with normal layout permissions.

Deletion requires a separate approval for the exact component ID and name. It is limited to Workspace-app components and blocked while widgets, commands or settings reference them. It delegates registration removal to the existing component service and does not remove shared vendors.

Focused unit tests cover compilation, draft revisions, approval, publication retries, viewer reads, deletion guards and preview readiness. Live Lambda and authenticated chat E2E are not covered by these unit tests. CLI pull support, published edits, broader queries and cross-workspace dependency sharing remain separate work.
