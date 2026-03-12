# Plan: MCP OAuth Dynamic Discovery (RFC 9728 + RFC 8414)

## Current State

Twenty already has a **solid OAuth infrastructure**:

- **Authorization Server Metadata** (`/.well-known/oauth-authorization-server`) — `oauth-discovery.controller.ts` serves RFC 8414 metadata with issuer, token/revoke/introspect endpoints, supported scopes, grant types, and PKCE
- **Token endpoint** (`POST /oauth/token`) — supports `authorization_code` (with PKCE), `client_credentials`, and `refresh_token` grants
- **Revocation** (`POST /oauth/revoke`) and **Introspection** (`POST /oauth/introspect`) — RFC 7009/7662 compliant
- **Consent screen** — frontend `Authorize.tsx` at `/authorize` with scope display, app logo, approve/cancel
- **App registration** — `ApplicationRegistrationEntity` with clientId, hashed secret, redirect URIs, scopes
- **MCP endpoint** (`POST /mcp`) — uses `JwtAuthGuard` + `WorkspaceAuthGuard`, accepts Bearer tokens

## What's Missing for MCP Dynamic Discovery

Per the [MCP Authorization Spec (2025-06-18)](https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization), the following pieces are needed:

### 1. Protected Resource Metadata (RFC 9728) — **NEW**

The MCP server must expose `/.well-known/oauth-protected-resource` so MCP clients can discover which authorization server to use.

**Action:** Add a new `GET /.well-known/oauth-protected-resource` endpoint to the existing `OAuthDiscoveryController`.

Returns:
```json
{
  "resource": "https://your-twenty-server.com/mcp",
  "authorization_servers": ["https://your-twenty-server.com"],
  "scopes_supported": ["api", "profile"],
  "bearer_methods_supported": ["header"]
}
```

### 2. WWW-Authenticate Header on 401 from MCP endpoint — **NEW**

When the MCP endpoint returns a 401 Unauthorized, it MUST include a `WWW-Authenticate` header pointing to the resource metadata URL per RFC 9728 Section 5.1.

**Action:** Create an exception filter or interceptor for the MCP controller that catches 401 responses and adds:
```
WWW-Authenticate: Bearer resource_metadata="https://your-twenty-server.com/.well-known/oauth-protected-resource"
```

Currently `JwtAuthGuard` returns `false` which triggers a generic NestJS 403. This needs to be changed to throw an `UnauthorizedException` that results in a proper 401 with the correct header.

### 3. Dynamic Client Registration (RFC 7591) — **NEW**

MCP clients (Claude Desktop, Cursor, VS Code, etc.) need to automatically register themselves as OAuth clients without manual pre-registration. This is crucial because MCP clients don't know all possible servers in advance.

**Action:** Add a `POST /oauth/register` endpoint that accepts:
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

Returns:
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

This creates an `ApplicationRegistrationEntity` on the fly. Public clients (no secret) are allowed since MCP clients use PKCE.

Also add `registration_endpoint` to the authorization server metadata.

### 4. Update Authorization Server Metadata — **MODIFY**

Add the `registration_endpoint` field to the existing `/.well-known/oauth-authorization-server` response.

### 5. Fix Authorization Endpoint URL Format — **MODIFY**

The current discovery metadata returns `authorization_endpoint: "${serverUrl}/authorize"` but the actual flow goes through the **frontend** route (`/authorize` in the React SPA). MCP clients expect a standard HTTP endpoint that redirects to the consent screen. This is fine as-is since MCP clients open this in a browser — the frontend route handles the consent UI. However, we should verify the URL is correct (it maps to `AppPath.Authorize`).

Also, the current `/authorize` page uses non-standard query parameter names (`clientId`, `codeChallenge`, `redirectUrl` in camelCase). Standard OAuth uses `client_id`, `code_challenge`, `redirect_uri`. These should be supported for MCP client compatibility.

### 6. Resource Indicators (RFC 8707) — **CONSIDER**

MCP clients MUST include a `resource` parameter in authorization and token requests. The authorization server should accept (and ideally validate) this parameter to bind tokens to the MCP server audience.

**Action:** Accept the `resource` parameter in the authorization flow and token endpoint. Store it with the authorization code and validate it during token exchange. This ensures tokens are audience-bound.

## Implementation Steps (Ordered)

### Step 1: Protected Resource Metadata Endpoint
- Add `GET /.well-known/oauth-protected-resource` to `OAuthDiscoveryController`
- Return RFC 9728 compliant JSON with `resource`, `authorization_servers`, `scopes_supported`, `bearer_methods_supported`

### Step 2: WWW-Authenticate Header on MCP 401
- Modify the MCP auth flow so that a missing/invalid token returns HTTP 401 (not 403) with `WWW-Authenticate: Bearer resource_metadata="<url>"`
- Option A: Create a custom `McpAuthGuard` that extends `JwtAuthGuard` and throws `UnauthorizedException` with the correct header
- Option B: Add an exception filter to the MCP controller that intercepts auth failures

### Step 3: Dynamic Client Registration Endpoint
- Add `POST /oauth/register` controller method (or new controller)
- Validate input per RFC 7591 (redirect_uris, grant_types, response_types)
- Create `ApplicationRegistrationEntity` with generated clientId, no secret for public clients
- Return registration response per RFC 7591
- Rate-limit this endpoint to prevent abuse

### Step 4: Update Authorization Server Metadata
- Add `registration_endpoint` to `/.well-known/oauth-authorization-server` response

### Step 5: Support Standard OAuth Query Parameters
- Update the frontend `/authorize` page to accept both camelCase (`clientId`) and standard (`client_id`) query parameters for backward compatibility
- Or alternatively update the metadata to match the frontend's expected format

### Step 6: Resource Parameter Support
- Accept `resource` parameter in the authorize and token flows
- Store the resource value with the authorization code
- Validate during token exchange that the resource matches

## Files to Create/Modify

| File | Action |
|------|--------|
| `application-oauth/controllers/oauth-discovery.controller.ts` | Add `oauth-protected-resource` endpoint |
| `application-oauth/controllers/oauth-discovery.controller.ts` | Add `registration_endpoint` to AS metadata |
| `application-oauth/controllers/oauth-registration.controller.ts` | **NEW** — Dynamic Client Registration |
| `application-oauth/application-oauth.module.ts` | Register new controller |
| `engine/api/mcp/controllers/mcp-core.controller.ts` | Add WWW-Authenticate on 401 (guard or filter) |
| `engine/api/mcp/guards/mcp-auth.guard.ts` | **NEW** — MCP-specific auth guard with 401 + WWW-Authenticate |
| `twenty-front/src/pages/auth/Authorize.tsx` | Support standard `client_id`/`redirect_uri`/`code_challenge` params |
| `application-oauth/dtos/oauth-token.input.ts` | Accept `resource` parameter |

## Risks & Considerations

1. **Security of Dynamic Registration**: Rate-limiting and possibly feature-flag gating to prevent abuse. Consider requiring the registration endpoint be enabled via config.
2. **Scope of public clients**: Public MCP clients (no secret) rely entirely on PKCE for security. This is per spec and already supported.
3. **Token audience validation**: Full RFC 8707 support means tokens should include audience claims. The current JWT structure may need an `aud` field.
4. **Backward compatibility**: Existing API key auth for MCP continues to work. The OAuth discovery flow is an additional option, not a replacement.
