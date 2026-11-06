# SSO integration tests

These suites log in through a real identity provider tenant instead of mocked
passport strategies. They are skipped unless `OKTA_SSO_TEST_ISSUER` is set, so
fork PRs (no secrets) and local runs without a tenant are unaffected.

## Why Okta

| Provider                           | Free test tenant                               | OIDC | SAML               | Headless login over HTTP                                                                                         | Verdict                                                           |
| ---------------------------------- | ---------------------------------------------- | ---- | ------------------ | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Okta Integrator Free Plan          | Yes                                            | Yes  | Yes                | Yes: `/api/v1/authn` gives a one-time `sessionToken` that `/authorize` and `/login/sessionCookieRedirect` accept | Chosen                                                            |
| Google Workspace                   | No, paid seats; SAML apps need a super admin   | Yes  | Yes                | No: sign-in page has bot detection, CAPTCHA and device challenges                                                | Rejected, flaky by design                                         |
| Microsoft Entra ID                 | Free tenant, but security defaults enforce MFA | Yes  | Yes                | Only ROPC, which skips the authorization code flow Twenty uses                                                   | Rejected                                                          |
| Auth0 free tenant                  | Yes                                            | Yes  | Via the SAML addon | Partly, through the cross-origin `/co/authenticate` endpoint                                                     | Viable fallback                                                   |
| Keycloak in a CI service container | Self-hosted                                    | Yes  | Yes                | Yes                                                                                                              | Not a real hosted IdP; good later for deterministic failure cases |

Okta caveats: an Integrator Free Plan org is deactivated after 180 days without
activity (CI keeps it alive), `/api/v1/authn` only works when the app's
authentication policy is password-only, and free orgs get no Okta support.

## Tenant setup

1. Create an Okta Integrator Free Plan org from a team mailbox.
2. Security > General: turn off end-user notification emails (new sign-on,
   password changed). The test user's email belongs to the seed data, not to us.
3. Directory > People > Add person:
   - username: any email-shaped login you control, e.g. `sso-ci@<team domain>`
   - primary email: `phil.schiler@apple.dev` (seeded member of the Apple workspace)
   - "I will set password", no activation email, no forced password change
4. Security > Authentication policies: add a policy with a single rule
   "Password" as the only factor, for the test user.
5. Applications > Create App Integration > OIDC, Web Application:
   - grant type: Authorization Code
   - sign-in redirect URI: `http://localhost:3000/auth/oidc/callback` (the
     default `SERVER_URL`)
   - assign it to the test user and to the password-only policy from step 4
6. Add these repository secrets:

| Secret                        | Value                    |
| ----------------------------- | ------------------------ |
| `OKTA_SSO_TEST_ISSUER`        | `https://<org>.okta.com` |
| `OKTA_SSO_TEST_CLIENT_ID`     | app client ID            |
| `OKTA_SSO_TEST_CLIENT_SECRET` | app client secret        |
| `OKTA_SSO_TEST_USERNAME`      | test user login          |
| `OKTA_SSO_TEST_PASSWORD`      | test user password       |

## Running locally

Export the five variables above, then run the suite like any integration test:

```bash
npx nx run twenty-server:test:integration -- test/integration/sso
```

## Flow under test

1. `createOIDCIdentityProvider` discovers the Okta issuer and stores the IdP.
2. `GET /auth/oidc/login/:id` redirects to Okta and sets the session cookie that
   holds the PKCE verifier and state.
3. Okta `authn` + `/authorize?sessionToken=` returns the authorization code.
4. `GET /auth/oidc/callback` exchanges the code, reads userinfo and redirects to
   `/verify?loginToken=`.
5. `getAuthTokensFromLoginToken` and `currentUser` prove the session is Phil's in
   the Apple workspace.
