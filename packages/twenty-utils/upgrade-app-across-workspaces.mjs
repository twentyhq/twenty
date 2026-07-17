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
//     [--version 1.2.3] [--dry-run] [--force] [--batch 20]
//
// Notes:
//   --base-url is the server base URL (the one serving /graphql, /metadata, /admin-panel)
//   --force re-runs the install even when the workspace already reports the target version
//   In non-development environments, server-level impersonation requires the admin to
//   have a verified 2FA method.

import { createInterface } from 'node:readline/promises';

const args = parseArgs(process.argv.slice(2));

const BASE_URL = requireArg('base-url').replace(/\/$/, '');
let ADMIN_TOKEN = requireArg('token');
const APP_UNIVERSAL_IDENTIFIER = requireArg('app');
const TARGET_VERSION = args['version'] ?? null;
const DRY_RUN = Boolean(args['dry-run']);
const FORCE = Boolean(args['force']);
const BATCH_SIZE = args['batch'] === undefined ? 20 : Number(args['batch']);

if (!Number.isInteger(BATCH_SIZE) || BATCH_SIZE < 1) {
  console.error('--batch must be a positive integer');
  process.exit(1);
}

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
      'Usage: node upgrade-app-across-workspaces.mjs --base-url <url> --token <admin-access-token> --app <universal-identifier> [--version <x.y.z>] [--dry-run] [--force] [--batch <n>]',
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

function isTokenExpired(token) {
  const { exp } = decodeJwtPayload(token);

  return typeof exp === 'number' && exp * 1000 <= Date.now() + 30_000;
}

async function promptForNewAdminToken(reason) {
  if (!process.stdin.isTTY) {
    throw new Error(`${reason} (re-run with a fresh --token)`);
  }

  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    while (true) {
      const answer = (
        await readline.question(`${reason}. Paste a new admin token: `)
      ).trim();

      if (answer.length > 0 && !isTokenExpired(answer)) {
        return answer;
      }

      console.log('Token is empty or already expired, try again.');
    }
  } finally {
    readline.close();
  }
}

// Batched upgrades can hit an expired token concurrently; share one prompt so
// stdin is not read by several questions at once.
let adminTokenRefreshPromise = null;

function refreshAdminToken(reason) {
  adminTokenRefreshPromise ??= promptForNewAdminToken(reason)
    .then((token) => {
      ADMIN_TOKEN = token;
    })
    .finally(() => {
      adminTokenRefreshPromise = null;
    });

  return adminTokenRefreshPromise;
}

async function ensureAdminToken() {
  if (isTokenExpired(ADMIN_TOKEN)) {
    await refreshAdminToken('Admin token has expired');
  }

  return ADMIN_TOKEN;
}

function isExpiredTokenError(error) {
  return /expired/i.test(error.message);
}

// The admin resolver crashes (server-side) when an installation's workspace has
// been soft-deleted: the workspace relation comes back null and it reads
// `workspace.id`. It surfaces as this GraphQL error message.
function isDeletedWorkspaceError(error) {
  return /Cannot read properties of null/i.test(error.message);
}

async function adminGraphqlRequest({ endpoint, query, variables }) {
  const token = await ensureAdminToken();

  try {
    return await graphqlRequest({ endpoint, token, query, variables });
  } catch (error) {
    if (!isExpiredTokenError(error)) {
      throw error;
    }

    if (ADMIN_TOKEN === token) {
      await refreshAdminToken('Admin token was rejected as expired');
    }

    return graphqlRequest({ endpoint, token: ADMIN_TOKEN, query, variables });
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
  const data = await adminGraphqlRequest({
    endpoint: ADMIN_PANEL_ENDPOINT,
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

// Fetches one page, salvaging around the server-side crash on soft-deleted
// workspaces: on that error the page is bisected until the poisoned rows are
// isolated to single-row windows, which are skipped while healthy rows survive.
async function fetchInstalledWorkspacesPage(registrationId, offset, limit) {
  try {
    const data = await adminGraphqlRequest({
      endpoint: ADMIN_PANEL_ENDPOINT,
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

    return data.findAdminApplicationRegistrationInstalledWorkspaces;
  } catch (error) {
    if (!isDeletedWorkspaceError(error)) {
      throw error;
    }

    if (limit === 1) {
      console.warn(
        `  skipping installation at offset ${offset}: ${error.message} (workspace likely deleted)`,
      );

      return { workspaces: [], hasMore: true };
    }

    const half = Math.ceil(limit / 2);
    const first = await fetchInstalledWorkspacesPage(
      registrationId,
      offset,
      half,
    );
    const second = await fetchInstalledWorkspacesPage(
      registrationId,
      offset + half,
      limit - half,
    );

    return {
      workspaces: [...first.workspaces, ...second.workspaces],
      hasMore: first.hasMore || second.hasMore,
    };
  }
}

async function listInstalledWorkspaces(registrationId, version) {
  const workspaces = [];
  const limit = 100;
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const page = await fetchInstalledWorkspacesPage(
      registrationId,
      offset,
      limit,
    );

    workspaces.push(...page.workspaces.filter((w) => w.version !== version));
    hasMore = page.hasMore;
    offset += limit;
  }

  return workspaces;
}

async function lookupWorkspaceUsers(workspaceId) {
  const data = await adminGraphqlRequest({
    endpoint: ADMIN_PANEL_ENDPOINT,
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
  const data = await adminGraphqlRequest({
    endpoint: METADATA_ENDPOINT,
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

  const data = await adminGraphqlRequest({
    endpoint: METADATA_ENDPOINT,
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
    const application = await installApplication(await ensureAdminToken());

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
  await ensureAdminToken();

  console.log(`Instance: ${BASE_URL}`);
  console.log(`Application: ${APP_UNIVERSAL_IDENTIFIER}`);

  const registration = await findApplicationRegistration();
  const targetVersion = TARGET_VERSION ?? registration.latestAvailableVersion;

  console.log(
    `Registration: ${registration.name} (${registration.id}), target version: ${targetVersion ?? 'latest'}`,
  );

  const workspaces = await listInstalledWorkspaces(
    registration.id,
    targetVersion,
  );

  console.log(`Found ${workspaces.length} workspace(s) with the app installed\n`);

  const results = { upgraded: 0, skipped: 0, failed: 0 };
  const failures = [];

  const processWorkspace = async (workspace) => {
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

      return;
    }

    if (DRY_RUN) {
      console.log(
        `  DRY-RUN ${workspaceLabel}: would upgrade from ${workspace.version ?? 'unknown'} to ${targetVersion ?? 'latest'}`,
      );
      results.skipped++;

      return;
    }

    try {
      const adminJwtPayload = decodeJwtPayload(ADMIN_TOKEN);

      await upgradeWorkspace(
        workspace,
        adminJwtPayload.sub ?? null,
        adminJwtPayload.workspaceId ?? null,
      );
      results.upgraded++;
    } catch (error) {
      console.error(`  FAIL ${workspaceLabel}: ${error.message}`);
      results.failed++;
      failures.push(workspaceLabel);
    }
  };

  for (
    let batchStart = 0;
    batchStart < workspaces.length;
    batchStart += BATCH_SIZE
  ) {
    const batch = workspaces.slice(batchStart, batchStart + BATCH_SIZE);

    console.log(
      `Batch ${Math.floor(batchStart / BATCH_SIZE) + 1}/${Math.ceil(workspaces.length / BATCH_SIZE)} (${batch.length} workspace(s))`,
    );

    await Promise.all(batch.map(processWorkspace));
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
