#!/usr/bin/env node
// Upgrades an application to its latest version on every workspace where it is installed.
//
// Requires an access token of an instance admin (user with canImpersonate server-level
// access). For each workspace with the app installed, the script impersonates a user of
// that workspace and calls the installApplication mutation, which upgrades the app to
// the latest available version (or a specific one with --version).
//
// Usage:
//   node upgrade-app-across-workspaces.mjs \
//     --base-url https://api.mytwenty.com \
//     --token <ADMIN_ACCESS_TOKEN> \
//     --app <APPLICATION_UNIVERSAL_IDENTIFIER> \
//     [--version 1.2.3] [--dry-run] [--force]
//
// Notes:
//   --base-url is the server base URL (the one serving /graphql, /metadata, /admin-panel)
//   --force re-runs the install even when the workspace already reports the target version
//   In non-development environments, server-level impersonation requires the admin to
//   have a verified 2FA method.

const args = parseArgs(process.argv.slice(2));

const BASE_URL = requireArg('base-url').replace(/\/$/, '');
const ADMIN_TOKEN = requireArg('token');
const APP_UNIVERSAL_IDENTIFIER = requireArg('app');
const TARGET_VERSION = args['version'] ?? null;
const DRY_RUN = Boolean(args['dry-run']);
const FORCE = Boolean(args['force']);

const ADMIN_PANEL_ENDPOINT = `${BASE_URL}/admin-panel`;
const METADATA_ENDPOINT = `${BASE_URL}/metadata`;

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index++) {
    const current = argv[index];

    if (!current.startsWith('--')) {
      continue;
    }

    const key = current.slice(2);
    const next = argv[index + 1];

    if (next === undefined || next.startsWith('--')) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      index++;
    }
  }

  return parsed;
}

function requireArg(name) {
  const value = args[name];

  if (typeof value !== 'string' || value.length === 0) {
    console.error(`Missing required argument --${name}`);
    console.error(
      'Usage: node upgrade-app-across-workspaces.mjs --base-url <url> --token <admin-access-token> --app <universal-identifier> [--version <x.y.z>] [--dry-run] [--force]',
    );
    process.exit(1);
  }

  return value;
}

function decodeJwtPayload(token) {
  const payloadPart = token.split('.')[1];

  if (!payloadPart) {
    return {};
  }

  try {
    return JSON.parse(Buffer.from(payloadPart, 'base64url').toString('utf8'));
  } catch {
    return {};
  }
}

async function graphqlRequest({ endpoint, token, query, variables }) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  let body;

  try {
    body = await response.json();
  } catch {
    throw new Error(
      `Non-JSON response from ${endpoint} (HTTP ${response.status})`,
    );
  }

  if (body.errors?.length) {
    const error = new Error(
      body.errors.map((graphqlError) => graphqlError.message).join('; '),
    );

    error.graphqlErrors = body.errors;

    throw error;
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} from ${endpoint}`);
  }

  return body.data;
}

async function findApplicationRegistration() {
  const data = await graphqlRequest({
    endpoint: ADMIN_PANEL_ENDPOINT,
    token: ADMIN_TOKEN,
    query: `
      query FindRegistrations($searchTerm: String) {
        findAllApplicationRegistrations(searchTerm: $searchTerm, limit: 25, offset: 0) {
          registrations {
            id
            universalIdentifier
            name
            latestAvailableVersion
          }
        }
      }
    `,
    variables: { searchTerm: APP_UNIVERSAL_IDENTIFIER },
  });

  const registration =
    data.findAllApplicationRegistrations.registrations.find(
      (candidate) =>
        candidate.universalIdentifier.toLowerCase() ===
        APP_UNIVERSAL_IDENTIFIER.toLowerCase(),
    );

  if (!registration) {
    throw new Error(
      `No application registration found for universal identifier ${APP_UNIVERSAL_IDENTIFIER}`,
    );
  }

  return registration;
}

async function listInstalledWorkspaces(registrationId) {
  const workspaces = [];
  const limit = 100;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const data = await graphqlRequest({
      endpoint: ADMIN_PANEL_ENDPOINT,
      token: ADMIN_TOKEN,
      query: `
        query InstalledWorkspaces($input: FindApplicationRegistrationInstalledWorkspacesInput!) {
          findAdminApplicationRegistrationInstalledWorkspaces(input: $input) {
            workspaces {
              id
              displayName
              version
            }
            hasMore
          }
        }
      `,
      variables: { input: { id: registrationId, limit, offset } },
    });

    const page = data.findAdminApplicationRegistrationInstalledWorkspaces;

    workspaces.push(...page.workspaces);
    hasMore = page.hasMore;
    offset += limit;
  }

  return workspaces;
}

async function lookupWorkspaceUsers(workspaceId) {
  const data = await graphqlRequest({
    endpoint: ADMIN_PANEL_ENDPOINT,
    token: ADMIN_TOKEN,
    query: `
      query WorkspaceLookup($workspaceId: UUID!) {
        workspaceLookupAdminPanel(workspaceId: $workspaceId) {
          workspaces {
            id
            allowImpersonation
            users {
              id
              email
            }
          }
        }
      }
    `,
    variables: { workspaceId },
  });

  return data.workspaceLookupAdminPanel.workspaces.find(
    (workspace) => workspace.id === workspaceId,
  );
}

async function impersonateUser(userId, workspaceId) {
  const data = await graphqlRequest({
    endpoint: METADATA_ENDPOINT,
    token: ADMIN_TOKEN,
    query: `
      mutation Impersonate($userId: UUID!, $workspaceId: UUID!) {
        impersonate(userId: $userId, workspaceId: $workspaceId) {
          loginToken {
            token
          }
          workspace {
            id
            workspaceUrls {
              subdomainUrl
              customUrl
            }
          }
        }
      }
    `,
    variables: { userId, workspaceId },
  });

  return data.impersonate;
}

async function exchangeLoginTokenForAccessToken(loginToken, workspaceUrls) {
  const origin = new URL(workspaceUrls.customUrl ?? workspaceUrls.subdomainUrl)
    .origin;

  const data = await graphqlRequest({
    endpoint: METADATA_ENDPOINT,
    token: ADMIN_TOKEN,
    query: `
      mutation GetAuthTokensFromLoginToken($loginToken: String!, $origin: String!) {
        getAuthTokensFromLoginToken(loginToken: $loginToken, origin: $origin) {
          tokens {
            accessOrWorkspaceAgnosticToken {
              token
            }
          }
        }
      }
    `,
    variables: { loginToken, origin },
  });

  return data.getAuthTokensFromLoginToken.tokens.accessOrWorkspaceAgnosticToken
    .token;
}

async function installApplication(accessToken) {
  const data = await graphqlRequest({
    endpoint: METADATA_ENDPOINT,
    token: accessToken,
    query: `
      mutation InstallApplication($universalIdentifier: String!, $version: String) {
        installApplication(universalIdentifier: $universalIdentifier, version: $version) {
          id
          name
          version
        }
      }
    `,
    variables: {
      universalIdentifier: APP_UNIVERSAL_IDENTIFIER,
      version: TARGET_VERSION,
    },
  });

  return data.installApplication;
}

async function upgradeWorkspace(workspace, adminUserId, adminWorkspaceId) {
  const workspaceLabel = `${workspace.displayName ?? '(unnamed)'} [${workspace.id}]`;

  // The admin cannot impersonate themselves in their own workspace, but their own
  // token already carries the right workspace context to install directly.
  if (workspace.id === adminWorkspaceId) {
    const application = await installApplication(ADMIN_TOKEN);

    console.log(
      `  OK ${workspaceLabel}: upgraded to ${application.version} (own workspace, no impersonation)`,
    );

    return { status: 'upgraded', workspace };
  }

  const lookup = await lookupWorkspaceUsers(workspace.id);

  if (!lookup) {
    throw new Error('workspace lookup returned no result');
  }

  if (!lookup.allowImpersonation) {
    throw new Error('workspace has impersonation disabled');
  }

  const candidates = lookup.users.filter((user) => user.id !== adminUserId);

  if (candidates.length === 0) {
    throw new Error('no impersonatable user found in workspace');
  }

  const attemptErrors = [];

  for (const candidate of candidates) {
    try {
      const impersonation = await impersonateUser(candidate.id, workspace.id);
      const accessToken = await exchangeLoginTokenForAccessToken(
        impersonation.loginToken.token,
        impersonation.workspace.workspaceUrls,
      );
      const application = await installApplication(accessToken);

      console.log(
        `  OK ${workspaceLabel}: upgraded to ${application.version} (as ${candidate.email})`,
      );

      return { status: 'upgraded', workspace };
    } catch (error) {
      attemptErrors.push(`${candidate.email}: ${error.message}`);
    }
  }

  throw new Error(`all user attempts failed:\n    ${attemptErrors.join('\n    ')}`);
}

async function main() {
  const adminJwtPayload = decodeJwtPayload(ADMIN_TOKEN);
  const adminUserId = adminJwtPayload.sub ?? null;
  const adminWorkspaceId = adminJwtPayload.workspaceId ?? null;

  console.log(`Instance: ${BASE_URL}`);
  console.log(`Application: ${APP_UNIVERSAL_IDENTIFIER}`);

  const registration = await findApplicationRegistration();
  const targetVersion = TARGET_VERSION ?? registration.latestAvailableVersion;

  console.log(
    `Registration: ${registration.name} (${registration.id}), target version: ${targetVersion ?? 'latest'}`,
  );

  const workspaces = await listInstalledWorkspaces(registration.id);

  console.log(`Found ${workspaces.length} workspace(s) with the app installed\n`);

  const results = { upgraded: 0, skipped: 0, failed: 0 };
  const failures = [];

  for (const workspace of workspaces) {
    const workspaceLabel = `${workspace.displayName ?? '(unnamed)'} [${workspace.id}]`;

    if (
      !FORCE &&
      targetVersion !== null &&
      workspace.version === targetVersion
    ) {
      console.log(
        `  SKIP ${workspaceLabel}: already on ${targetVersion} (use --force to re-install)`,
      );
      results.skipped++;
      continue;
    }

    if (DRY_RUN) {
      console.log(
        `  DRY-RUN ${workspaceLabel}: would upgrade from ${workspace.version ?? 'unknown'} to ${targetVersion ?? 'latest'}`,
      );
      results.skipped++;
      continue;
    }

    try {
      await upgradeWorkspace(workspace, adminUserId, adminWorkspaceId);
      results.upgraded++;
    } catch (error) {
      console.error(`  FAIL ${workspaceLabel}: ${error.message}`);
      results.failed++;
      failures.push(workspaceLabel);
    }
  }

  console.log(
    `\nDone: ${results.upgraded} upgraded, ${results.skipped} skipped, ${results.failed} failed`,
  );

  if (failures.length > 0) {
    console.log(`Failed workspaces:\n  ${failures.join('\n  ')}`);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`Fatal: ${error.message}`);
  process.exit(1);
});
