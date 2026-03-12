# Plan: MCP OAuth Dynamic Discovery (RFC 9728 + RFC 8414)

## Current State

Twenty already has a **solid OAuth infrastructure**:

- **Authorization Server Metadata** (`/.well-known/oauth-authorization-server`) — `oauth-discovery.controller.ts` serves RFC 8414 metadata with issuer, endpoints, scopes, grant types, PKCE
- **Token endpoint** (`POST /oauth/token`) — supports `authorization_code` (with PKCE), `client_credentials`, `refresh_token`
- **Revocation** (`POST /oauth/revoke`) and **Introspection** (`POST /oauth/introspect`) — RFC 7009/7662
- **Consent screen** — frontend `Authorize.tsx` at `/authorize` with scope display, app logo, approve/cancel
- **App registration** — `ApplicationRegistrationEntity` with clientId, hashed secret, redirect URIs, scopes
- **MCP endpoint** (`POST /mcp`) — uses `JwtAuthGuard` + `WorkspaceAuthGuard`, accepts Bearer tokens

## Key Design Decision: OAUTH_ONLY Source Type

### Problem

The current `ApplicationRegistration` → `Application` flow is designed for **full apps** that ship code (logic functions, front components, agents, database objects, dependencies). When `oauth.service.ts` exchanges a token, `findOrInstallApplication()` auto-installs the full app package into the workspace.

MCP clients (Claude Desktop, Cursor, VS Code) just need an OAuth identity to get an access token. They should **never** trigger code installation or gain code execution capabilities.

### Solution

Add a new `ApplicationRegistrationSourceType.OAUTH_ONLY` enum value. This is the most elegant approach because:

1. **Reuses existing entity and flows** — no schema duplication, consent screen and token exchange work unchanged
2. **Has precedent** — the install flow already skips code for `LOCAL` type
3. **Clear semantics** — `OAUTH_ONLY` communicates exactly what the registration is for
4. **Natural guard point** — the install service can short-circuit for this type

```typescript
enum ApplicationRegistrationSourceType {
  NPM = 'npm',
  TARBALL = 'tarball',
  LOCAL = 'local',
  OAUTH_ONLY = 'oauth-only',  // NEW — dynamic MCP client registrations
}
```

**Constraints for OAUTH_ONLY registrations:**
- No tarball, no sourcePackage, no code artifacts
- Scopes limited to `['api', 'profile']`
- No client secret (public client, PKCE required)
- `grant_types` restricted to `['authorization_code']` (no `client_credentials`)
- Install creates a lightweight `ApplicationEntity` record (no logic functions, no packages)
- Cannot be promoted to a full app without re-registering through the normal flow

### Protection for the Dynamic Registration Endpoint

1. **Rate limiting** — Aggressive per-IP rate limit (e.g., 10 registrations/hour)
2. **sourceType always OAUTH_ONLY** — endpoint hardcodes this, callers cannot override
3. **No secret issued** — public clients only, PKCE enforced on token exchange
4. **No client_credentials grant** — prevents server-to-server token minting
5. **Scopes capped** — registration endpoint only allows `api` and `profile`
6. **Lightweight install** — even if the app gets "installed" during token exchange, it creates a bare record with no code execution surface

## What's Missing for MCP Dynamic Discovery

Per the [MCP Authorization Spec (2025-06-18)](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization):

### 1. Protected Resource Metadata (RFC 9728) — NEW

Add `GET /.well-known/oauth-protected-resource` to `OAuthDiscoveryController`.

```json
{
  "resource": "https://your-twenty-server.com/mcp",
  "authorization_servers": ["https://your-twenty-server.com"],
  "scopes_supported": ["api", "profile"],
  "bearer_methods_supported": ["header"]
}
```

### 2. WWW-Authenticate Header on MCP 401 — NEW

Create an MCP-specific auth guard that throws `UnauthorizedException` with:
```
WWW-Authenticate: Bearer resource_metadata="https://your-twenty-server.com/.well-known/oauth-protected-resource"
```

Currently `JwtAuthGuard` returns `false` → generic NestJS 403. Must become proper 401 with RFC 9728 header.

### 3. Dynamic Client Registration (RFC 7591) — NEW

Add `POST /oauth/register` that creates `ApplicationRegistrationEntity` with `sourceType: OAUTH_ONLY`.

Request:
```json
{
  "client_name": "Claude Desktop",
  "redirect_uris": ["http://localhost:12345/callback"],
  "grant_types": ["authorization_code"],
  "response_types": ["code"],
  "token_endpoint_auth_method": "none",
  "scope": "api profile"
}
```

Response:
```json
{
  "client_id": "<generated-uuid>",
  "client_name": "Claude Desktop",
  "redirect_uris": ["http://localhost:12345/callback"],
  "grant_types": ["authorization_code"],
  "response_types": ["code"],
  "token_endpoint_auth_method": "none",
  "scope": "api profile"
}
```

### 4. Update Authorization Server Metadata — MODIFY

Add `registration_endpoint` to `/.well-known/oauth-authorization-server`.

### 5. Standard OAuth Query Parameters — MODIFY

The `/authorize` page uses camelCase params (`clientId`, `codeChallenge`, `redirectUrl`). Standard OAuth uses `client_id`, `code_challenge`, `redirect_uri`. Support both for MCP client compatibility.

### 6. Resource Indicators (RFC 8707) — CONSIDER

Accept `resource` parameter in authorization and token flows to audience-bind tokens.

## Implementation Steps

### Step 1: Add OAUTH_ONLY source type
- Add `OAUTH_ONLY = 'oauth-only'` to `ApplicationRegistrationSourceType` enum
- Update `ApplicationInstallService.installApplication()` to skip code install for this type (like LOCAL)
- Update `oauth.service.ts` `findOrInstallApplication()` to create lightweight app for OAUTH_ONLY registrations

### Step 2: Protected Resource Metadata endpoint
- Add `GET /.well-known/oauth-protected-resource` to `OAuthDiscoveryController`

### Step 3: MCP auth guard with WWW-Authenticate
- Create `McpAuthGuard` extending `JwtAuthGuard` that throws `UnauthorizedException` with the RFC 9728 header
- Use it on the MCP controller instead of plain `JwtAuthGuard`

### Step 4: Dynamic Client Registration endpoint
- Create `POST /oauth/register` controller
- Validate input per RFC 7591
- Create `ApplicationRegistrationEntity` with `sourceType: OAUTH_ONLY`, no secret, limited scopes
- Rate-limit aggressively
- Register in `ApplicationOAuthModule`

### Step 5: Update Authorization Server Metadata
- Add `registration_endpoint` to `/.well-known/oauth-authorization-server`

### Step 6: Standard OAuth query parameters on /authorize
- Update `Authorize.tsx` to accept both camelCase and standard (`client_id`, `redirect_uri`, `code_challenge`) params

### Step 7: Resource parameter support
- Accept `resource` parameter in authorize and token flows
- Store with authorization code, validate during exchange

## Files to Create/Modify

| File | Action |
|------|--------|
| `application-registration/enums/application-registration-source-type.enum.ts` | Add `OAUTH_ONLY` |
| `application-install/application-install.service.ts` | Skip code install for OAUTH_ONLY |
| `application-oauth/oauth.service.ts` | Lightweight app creation for OAUTH_ONLY |
| `application-oauth/controllers/oauth-discovery.controller.ts` | Add PRM endpoint + registration_endpoint |
| `application-oauth/controllers/oauth-registration.controller.ts` | **NEW** — Dynamic Client Registration |
| `application-oauth/dtos/oauth-register.input.ts` | **NEW** — Registration DTO |
| `application-oauth/application-oauth.module.ts` | Register new controller |
| `engine/api/mcp/guards/mcp-auth.guard.ts` | **NEW** — MCP auth guard with 401 + WWW-Authenticate |
| `engine/api/mcp/controllers/mcp-core.controller.ts` | Use McpAuthGuard |
| `twenty-front/src/pages/auth/Authorize.tsx` | Support standard OAuth params |
| `application-oauth/dtos/oauth-token.input.ts` | Accept `resource` parameter |

## Risks & Considerations

1. **Dynamic registration abuse** — Mitigated by aggressive rate limiting, OAUTH_ONLY type restriction, no secrets, no client_credentials
2. **Public clients** — Rely on PKCE only (per MCP spec, already supported)
3. **Token audience** — Full RFC 8707 support means JWTs need `aud` field
4. **Backward compat** — API key auth for MCP continues to work; OAuth discovery is additive
5. **DB migration** — Adding OAUTH_ONLY enum value is a data-only change (text column), no schema migration needed
