import {
  closeSync,
  existsSync,
  openSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

import { isDefined } from 'twenty-shared/utils';

import {
  CHATGPT_PLAN_API_BASE_URL,
  CHATGPT_PLAN_TOKEN_URL,
} from 'src/engine/metadata-modules/ai/ai-models/chatgpt-plan-dev/chatgpt-plan-dev-provider.const';

// Written by `setu/dev/chatgpt-plan.mjs login`; this module shares its file
// layout and lock so the script and the server never race a token rotation.
type ChatGptPlanCredentials = {
  client_id: string;
  access_token: string;
  refresh_token: string;
  id_token?: string;
  expires_at: string;
  scopes?: string[];
  [key: string]: unknown;
};

const REFRESH_MARGIN_MS = 2 * 60 * 1000;
const LOCK_STALE_MS = 60 * 1000;
const LOCK_ATTEMPTS = 40;
const LOCK_RETRY_DELAY_MS = 250;

const getCredentialsDirectory = (): string =>
  process.env.SETU_DEV_CHATGPT_PLAN_DIR ??
  join(homedir(), '.config', 'setu-dev', 'chatgpt-plan');

const readCredentials = (path: string): ChatGptPlanCredentials | undefined =>
  existsSync(path)
    ? (JSON.parse(readFileSync(path, 'utf8')) as ChatGptPlanCredentials)
    : undefined;

const writeCredentialsAtomically = (
  path: string,
  credentials: ChatGptPlanCredentials,
): void => {
  const temporaryPath = `${path}.${process.pid}.tmp`;

  writeFileSync(temporaryPath, JSON.stringify(credentials, null, 2), {
    mode: 0o600,
  });
  renameSync(temporaryPath, path);
};

const isFresh = (credentials: ChatGptPlanCredentials): boolean =>
  Date.parse(credentials.expires_at) - Date.now() > REFRESH_MARGIN_MS;

const acquireLock = async (lockPath: string): Promise<void> => {
  for (let attempt = 0; attempt < LOCK_ATTEMPTS; attempt++) {
    try {
      closeSync(openSync(lockPath, 'wx', 0o600));

      return;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }

      if (Date.now() - statSync(lockPath).mtimeMs > LOCK_STALE_MS) {
        rmSync(lockPath, { force: true });
        continue;
      }

      await new Promise((resolve) => setTimeout(resolve, LOCK_RETRY_DELAY_MS));
    }
  }

  throw new Error('Could not acquire the ChatGPT plan credential lock.');
};

// Only the error code and type leave this function, so token endpoint
// responses never reach logs.
const refreshCredentials = async (
  credentials: ChatGptPlanCredentials,
): Promise<ChatGptPlanCredentials> => {
  const response = await fetch(CHATGPT_PLAN_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: credentials.client_id,
      refresh_token: credentials.refresh_token,
      resource: CHATGPT_PLAN_API_BASE_URL,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error(
      `ChatGPT plan token refresh failed with HTTP ${response.status}. Run: node setu/dev/chatgpt-plan.mjs login`,
    );
  }

  const tokenResponse = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    id_token?: string;
    expires_in?: number;
  };

  return {
    ...credentials,
    access_token: tokenResponse.access_token,
    refresh_token: tokenResponse.refresh_token ?? credentials.refresh_token,
    id_token: tokenResponse.id_token ?? credentials.id_token,
    expires_at: new Date(
      Date.now() + Number(tokenResponse.expires_in ?? 3600) * 1000,
    ).toISOString(),
    saved_at: new Date().toISOString(),
  };
};

// Refresh tokens rotate, so refreshes are serialized through the lock file and
// the replacement is written back before anyone else reads it.
export const getChatGptPlanAccessToken = async (): Promise<string> => {
  const directory = getCredentialsDirectory();
  const credentialsPath = join(directory, 'credentials.json');
  const lockPath = join(directory, 'credentials.lock');
  const current = readCredentials(credentialsPath);

  if (!isDefined(current)) {
    throw new Error(
      'ChatGPT plan is not signed in. Run: node setu/dev/chatgpt-plan.mjs login',
    );
  }

  if (isFresh(current)) {
    return current.access_token;
  }

  await acquireLock(lockPath);

  try {
    const latest = readCredentials(credentialsPath) ?? current;

    if (isFresh(latest)) {
      return latest.access_token;
    }

    const refreshed = await refreshCredentials(latest);

    writeCredentialsAtomically(credentialsPath, refreshed);

    return refreshed.access_token;
  } finally {
    rmSync(lockPath, { force: true });
  }
};
