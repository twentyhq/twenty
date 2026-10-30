#!/usr/bin/env node
// Local-development helper for "Sign in with ChatGPT" plan usage.
// OpenAI permits plan usage for personal projects that run locally; never use
// this against a hosted Setu instance. Docs:
// https://developers.openai.com/siwc/token-sharing-open-source
//
//   node setu/dev/chatgpt-plan.mjs login [--port 1455]
//   node setu/dev/chatgpt-plan.mjs status
//   node setu/dev/chatgpt-plan.mjs probe [--model <slug>]
//   node setu/dev/chatgpt-plan.mjs logout
//
// Credentials are written to ~/.config/setu-dev/chatgpt-plan/credentials.json
// (mode 0600, or $SETU_DEV_CHATGPT_PLAN_DIR). This script never prints token
// values; keep it that way, because its output is read by coding agents.

import { spawn } from 'node:child_process';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  openSync,
  closeSync,
  readFileSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createServer } from 'node:http';
import { homedir } from 'node:os';
import { join } from 'node:path';

const AUTHORIZE_URL = 'https://auth.openai.com/api/accounts/authorize';
const TOKEN_URL = 'https://auth.openai.com/api/accounts/oauth/token';
const OPENID_CONFIGURATION_URL =
  'https://auth.openai.com/.well-known/openid-configuration';
const ISSUER = 'https://auth.openai.com';
const API_BASE_URL = 'https://api.openai.com/v1';
const REGISTRATION_CLIENT_ID = 'dynamic_agent_client';
const AGENT_NAME_HINT = 'Setu (local dev)';
const PLAN_USAGE_SCOPE = 'chatgpt.tokens.use.direct';
const SCOPES = [
  'openid',
  'profile',
  'email',
  'offline_access',
  'resource.invoke',
  PLAN_USAGE_SCOPE,
];
const DEFAULT_CALLBACK_PORT = 1455;
const LOGIN_TIMEOUT_MS = 5 * 60 * 1000;
const REFRESH_MARGIN_MS = 2 * 60 * 1000;
const LOCK_STALE_MS = 60 * 1000;

// Rejected by the plan-usage route (preview limitations page).
const UNSUPPORTED_RESPONSES_FIELDS = [
  'background',
  'conversation',
  'max_output_tokens',
  'max_tool_calls',
  'metadata',
  'moderation',
  'multi_agent',
  'previous_response_id',
  'prompt',
  'prompt_cache_retention',
  'safety_identifier',
  'temperature',
  'top_logprobs',
  'top_p',
  'truncation',
  'user',
];

const CREDENTIALS_DIRECTORY =
  process.env.SETU_DEV_CHATGPT_PLAN_DIR ??
  join(homedir(), '.config', 'setu-dev', 'chatgpt-plan');
const CREDENTIALS_PATH = join(CREDENTIALS_DIRECTORY, 'credentials.json');
const HOST_PATH = join(CREDENTIALS_DIRECTORY, 'host.json');
const LOCK_PATH = join(CREDENTIALS_DIRECTORY, 'credentials.lock');

const base64Url = (buffer) => buffer.toString('base64url');

const decodeJwtPayload = (jwt) =>
  JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString('utf8'));

const truncate = (text, length = 160) =>
  text.length > length ? `${text.slice(0, length)}…` : text;

const ensureCredentialsDirectory = () => {
  mkdirSync(CREDENTIALS_DIRECTORY, { recursive: true, mode: 0o700 });
  chmodSync(CREDENTIALS_DIRECTORY, 0o700);
};

const writeFileAtomically = (path, value) => {
  const temporaryPath = `${path}.${process.pid}.tmp`;

  writeFileSync(temporaryPath, JSON.stringify(value, null, 2), { mode: 0o600 });
  renameSync(temporaryPath, path);
};

const readJson = (path) =>
  existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : undefined;

// The host id must stay stable per machine; OpenAI uses it to attribute the
// registration, so it is created once and reused across sign-ins.
const getHostId = () => {
  ensureCredentialsDirectory();
  const host = readJson(HOST_PATH);

  if (host?.extAgentHostId) {
    return host.extAgentHostId;
  }

  const extAgentHostId = `urn:uuid:${randomUUID()}`;

  writeFileAtomically(HOST_PATH, { extAgentHostId });

  return extAgentHostId;
};

// Error bodies are reduced to code/type/message so nothing else from a
// response can reach the terminal.
const describeErrorBody = async (response) => {
  const text = await response.text();

  try {
    const parsed = JSON.parse(text);
    const error = parsed.error ?? parsed;
    const code =
      typeof error === 'object'
        ? (error.code ?? error.type ?? error.error)
        : undefined;
    const message =
      typeof error === 'object'
        ? (error.message ?? error.error_description)
        : String(error);

    return `HTTP ${response.status}${code ? ` ${code}` : ''}${message ? `: ${truncate(String(message))}` : ''}`;
  } catch {
    return `HTTP ${response.status}`;
  }
};

const postForm = async (url, parameters) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(parameters).toString(),
  });

  if (!response.ok) {
    throw new Error(
      `Token endpoint failed: ${await describeErrorBody(response)}`,
    );
  }

  return response.json();
};

const parseScopes = (scope) =>
  Array.isArray(scope)
    ? scope
    : String(scope ?? '')
        .split(/[\s+]+/)
        .filter(Boolean);

const buildCredentialRecord = ({ tokenResponse, clientId, extAgentHostId }) => {
  const scopes = parseScopes(tokenResponse.scope);
  const idTokenClaims = tokenResponse.id_token
    ? decodeJwtPayload(tokenResponse.id_token)
    : {};

  return {
    email: idTokenClaims.email,
    issuer: ISSUER,
    subject: idTokenClaims.sub,
    client_id: clientId,
    ext_agent_host_id: extAgentHostId,
    id_token: tokenResponse.id_token,
    access_token: tokenResponse.access_token,
    refresh_token: tokenResponse.refresh_token,
    token_type: tokenResponse.token_type,
    expires_in: tokenResponse.expires_in,
    expires_at: new Date(
      Date.now() + Number(tokenResponse.expires_in ?? 3600) * 1000,
    ).toISOString(),
    scopes,
    saved_at: new Date().toISOString(),
  };
};

const readFlag = (name, fallback) => {
  const index = process.argv.indexOf(`--${name}`);

  return index === -1 ? fallback : process.argv[index + 1];
};

const login = async () => {
  ensureCredentialsDirectory();

  const existing = readJson(CREDENTIALS_PATH);
  const extAgentHostId = getHostId();
  const port = Number(readFlag('port', DEFAULT_CALLBACK_PORT));
  const redirectUri = `http://127.0.0.1:${port}/auth/callback`;
  const isReauthorization = Boolean(existing?.client_id);
  const requestedClientId = isReauthorization
    ? existing.client_id
    : REGISTRATION_CLIENT_ID;

  const codeVerifier = base64Url(randomBytes(48));
  const codeChallenge = base64Url(
    createHash('sha256').update(codeVerifier).digest(),
  );
  const state = base64Url(randomBytes(24));
  const nonce = base64Url(randomBytes(24));

  const authorizeParameters = new URLSearchParams({
    client_id: requestedClientId,
    ext_agent_host_id: extAgentHostId,
    response_type: 'code',
    redirect_uri: redirectUri,
    scope: SCOPES.join(' '),
    resource: API_BASE_URL,
    state,
    nonce,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });

  if (!isReauthorization) {
    authorizeParameters.set('agent_name_hint', AGENT_NAME_HINT);
  }

  const callback = await new Promise((resolve, reject) => {
    const server = createServer((request, response) => {
      const url = new URL(request.url ?? '/', redirectUri);

      if (url.pathname !== '/auth/callback') {
        response.writeHead(404).end();

        return;
      }

      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(
        '<p>Setu local dev: sign-in received. You can close this tab and return to the terminal.</p>',
      );
      clearTimeout(timeout);
      server.close();
      resolve(Object.fromEntries(url.searchParams));
    });

    const timeout = setTimeout(() => {
      server.close();
      reject(
        new Error('Timed out waiting for the browser sign-in (5 minutes).'),
      );
    }, LOGIN_TIMEOUT_MS);

    server.on('error', (error) => {
      clearTimeout(timeout);
      reject(
        error.code === 'EADDRINUSE'
          ? new Error(
              `Port ${port} is in use (the Codex CLI login also uses 1455). Retry with --port <free port>.`,
            )
          : error,
      );
    });

    // The listener must be up before the browser is opened.
    server.listen(port, '127.0.0.1', () => {
      const authorizeUrl = `${AUTHORIZE_URL}?${authorizeParameters}`;

      console.log('Opening your browser to sign in with ChatGPT.');
      console.log(`If it does not open, visit:\n\n${authorizeUrl}\n`);
      spawn('open', [authorizeUrl], {
        stdio: 'ignore',
        detached: true,
      }).unref();
    });
  });

  if (callback.state !== state) {
    throw new Error('State mismatch in the sign-in callback; aborting.');
  }

  if (callback.error) {
    throw new Error(`Sign-in was not completed: ${callback.error}`);
  }

  // A new registration must return the issued client id; a reauthorization
  // may omit it but must never switch to a different one.
  const clientId = isReauthorization ? requestedClientId : callback.client_id;

  if (!clientId || clientId === REGISTRATION_CLIENT_ID) {
    throw new Error(
      'Registration incomplete: no issued client id in callback.',
    );
  }

  if (
    isReauthorization &&
    callback.client_id &&
    callback.client_id !== clientId
  ) {
    throw new Error('Callback returned a different client id; aborting.');
  }

  const tokenResponse = await postForm(TOKEN_URL, {
    grant_type: 'authorization_code',
    client_id: clientId,
    code: callback.code,
    code_verifier: codeVerifier,
    redirect_uri: redirectUri,
    resource: API_BASE_URL,
  });

  // The ID token comes straight from the token endpoint over TLS, which OIDC
  // Core 3.1.3.7 accepts in place of a signature check; claims are still
  // checked against this request.
  const idTokenClaims = decodeJwtPayload(tokenResponse.id_token);
  const audiences = [idTokenClaims.aud].flat();

  if (idTokenClaims.iss !== ISSUER) {
    throw new Error('Unexpected ID token issuer; aborting.');
  }

  if (!audiences.includes(clientId)) {
    throw new Error('ID token audience does not match the issued client id.');
  }

  if (idTokenClaims.nonce !== nonce) {
    throw new Error('ID token nonce mismatch; aborting.');
  }

  const record = buildCredentialRecord({
    tokenResponse,
    clientId,
    extAgentHostId,
  });

  if (!record.scopes.includes(PLAN_USAGE_SCOPE)) {
    throw new Error(
      `Signed in, but the ${PLAN_USAGE_SCOPE} scope was not granted, so plan usage is unavailable for this account.`,
    );
  }

  writeFileAtomically(CREDENTIALS_PATH, record);

  console.log(`Signed in as ${record.email ?? record.subject}.`);
  console.log(`Plan usage granted. Credentials saved to ${CREDENTIALS_PATH}.`);
};

const acquireLock = async () => {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      closeSync(openSync(LOCK_PATH, 'wx', 0o600));

      return;
    } catch (error) {
      if (error.code !== 'EEXIST') {
        throw error;
      }

      if (Date.now() - statSync(LOCK_PATH).mtimeMs > LOCK_STALE_MS) {
        rmSync(LOCK_PATH, { force: true });
        continue;
      }

      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  throw new Error('Could not acquire the credential lock.');
};

// Refresh tokens rotate, so refreshes are serialized and the latest
// replacement is always written back before anyone else reads it.
const getAccessToken = async () => {
  const current = readJson(CREDENTIALS_PATH);

  if (!current) {
    throw new Error('Not signed in. Run: node setu/dev/chatgpt-plan.mjs login');
  }

  if (Date.parse(current.expires_at) - Date.now() > REFRESH_MARGIN_MS) {
    return current.access_token;
  }

  await acquireLock();

  try {
    const latest = readJson(CREDENTIALS_PATH);

    if (Date.parse(latest.expires_at) - Date.now() > REFRESH_MARGIN_MS) {
      return latest.access_token;
    }

    const tokenResponse = await postForm(TOKEN_URL, {
      grant_type: 'refresh_token',
      client_id: latest.client_id,
      refresh_token: latest.refresh_token,
      resource: API_BASE_URL,
    });

    const record = {
      ...latest,
      ...buildCredentialRecord({
        tokenResponse: {
          ...tokenResponse,
          id_token: tokenResponse.id_token ?? latest.id_token,
          refresh_token: tokenResponse.refresh_token ?? latest.refresh_token,
          scope: tokenResponse.scope ?? latest.scopes,
        },
        clientId: latest.client_id,
        extAgentHostId: latest.ext_agent_host_id,
      }),
    };

    writeFileAtomically(CREDENTIALS_PATH, record);

    return record.access_token;
  } finally {
    rmSync(LOCK_PATH, { force: true });
  }
};

const status = () => {
  const current = readJson(CREDENTIALS_PATH);

  if (!current) {
    console.log('Not signed in.');

    return;
  }

  const minutesLeft = Math.round(
    (Date.parse(current.expires_at) - Date.now()) / 60000,
  );

  console.log(`Signed in as ${current.email ?? current.subject}.`);
  console.log(
    `Plan usage scope: ${current.scopes.includes(PLAN_USAGE_SCOPE) ? 'granted' : 'missing'}.`,
  );
  console.log(
    `Access token ${minutesLeft > 0 ? `valid for ~${minutesLeft} min` : 'expired (refreshes on next use)'}.`,
  );
};

const logout = async () => {
  const current = readJson(CREDENTIALS_PATH);

  if (!current) {
    console.log('Not signed in.');

    return;
  }

  try {
    const configuration = await (await fetch(OPENID_CONFIGURATION_URL)).json();
    const response = await fetch(configuration.revocation_endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        token: current.refresh_token,
        token_type_hint: 'refresh_token',
        client_id: current.client_id,
      }).toString(),
    });

    if (!response.ok) {
      throw new Error(await describeErrorBody(response));
    }

    console.log('Session revoked.');
  } catch (error) {
    console.log(
      `Remote revocation not confirmed (${error.message}). Disconnect the app in ChatGPT Settings to be sure.`,
    );
  }

  // Keep client id and host id so a later sign-in reuses the registration.
  writeFileAtomically(CREDENTIALS_PATH, {
    client_id: current.client_id,
    ext_agent_host_id: current.ext_agent_host_id,
    email: current.email,
    subject: current.subject,
  });
  console.log('Local tokens cleared.');
};

// ---------------------------------------------------------------- probes ---

const readServerSentEvents = async function* (response) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });

    let separatorIndex;

    while ((separatorIndex = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, separatorIndex);

      buffer = buffer.slice(separatorIndex + 2);

      const data = rawEvent
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trimStart())
        .join('\n');

      if (data && data !== '[DONE]') {
        yield JSON.parse(data);
      }
    }
  }
};

const createResponse = async ({ accessToken, body }) => {
  const response = await fetch(`${API_BASE_URL}/responses`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ store: false, stream: true, ...body }),
  });

  if (!response.ok) {
    throw new Error(await describeErrorBody(response));
  }

  let text = '';
  const streamedOutputItems = [];

  for await (const event of readServerSentEvents(response)) {
    if (event.type === 'response.output_text.delta') {
      text += event.delta;
    }

    if (event.type === 'response.output_item.done') {
      streamedOutputItems.push(event.item);
    }

    // With store=false the completed event may omit output items, so fall
    // back to the items streamed individually.
    if (event.type === 'response.completed') {
      const completedOutput = event.response?.output ?? [];

      return {
        text,
        response: {
          ...event.response,
          output:
            completedOutput.length > 0 ? completedOutput : streamedOutputItems,
        },
      };
    }

    if (
      event.type === 'response.failed' ||
      event.type === 'response.incomplete'
    ) {
      const error = event.response?.error ?? event.response?.incomplete_details;

      throw new Error(
        `${event.type}${error?.code ? ` ${error.code}` : ''}${error?.message ? `: ${truncate(error.message)}` : ''}`,
      );
    }

    if (event.type === 'error') {
      throw new Error(
        `stream error${event.code ? ` ${event.code}` : ''}: ${truncate(String(event.message ?? ''))}`,
      );
    }
  }

  throw new Error('Stream ended before response.completed.');
};

const LOOKUP_COMPANY_TOOL = {
  type: 'function',
  name: 'lookup_company',
  description: 'Look up a company in the CRM by name.',
  strict: true,
  parameters: {
    type: 'object',
    properties: { name: { type: 'string' } },
    required: ['name'],
    additionalProperties: false,
  },
};

const FAKE_COMPANY = {
  name: 'Acme',
  stage: 'Proposal',
  lastActivityDaysAgo: 42,
};

// Adapts a Responses API request to the plan-usage route's restrictions; the
// M1 dev provider would use the same adapter as its fetch implementation.
const createPlanFetch =
  ({ rewrites }) =>
  async (input, init) => {
    const url = typeof input === 'string' ? input : input.url;

    if (!url.endsWith('/responses') || typeof init?.body !== 'string') {
      return fetch(input, init);
    }

    const body = JSON.parse(init.body);

    for (const field of UNSUPPORTED_RESPONSES_FIELDS) {
      if (field in body) {
        delete body[field];
        rewrites.add(`removed ${field}`);
      }
    }

    if (body.store !== false) {
      body.store = false;
      rewrites.add('set store=false');
    }

    if (body.stream !== true) {
      rewrites.add('caller requested non-streaming (would need aggregation)');
    }

    if (Array.isArray(body.input)) {
      for (const item of body.input) {
        if (item.role === 'system') {
          item.role = 'developer';
          rewrites.add('system message -> developer');
        }
      }
    }

    return fetch(input, { ...init, body: JSON.stringify(body) });
  };

const runProbe = async (name, check) => {
  const startedAt = Date.now();

  try {
    const detail = await check();

    return {
      name,
      result: 'PASS',
      detail,
      seconds: (Date.now() - startedAt) / 1000,
    };
  } catch (error) {
    return {
      name,
      result: 'FAIL',
      detail: truncate(error.message, 220),
      seconds: (Date.now() - startedAt) / 1000,
    };
  }
};

const probe = async () => {
  const accessToken = await getAccessToken();
  let model = readFlag('model');
  const results = [];

  results.push(
    await runProbe('List models', async () => {
      const response = await fetch(`${API_BASE_URL}/models`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!response.ok) {
        throw new Error(await describeErrorBody(response));
      }

      const payload = await response.json();
      const slugs = (payload.models ?? payload.data ?? [])
        .filter((entry) => (entry.visibility ?? 'list') === 'list')
        .map((entry) => entry.slug ?? entry.id);

      model = model ?? slugs[0];

      return `${slugs.length} listed: ${slugs.join(', ')}`;
    }),
  );

  if (!model) {
    console.table(results);
    throw new Error('No model available; pass --model <slug>.');
  }

  results.push(
    await runProbe('Streaming text', async () => {
      const { text, response } = await createResponse({
        accessToken,
        body: {
          model,
          instructions: 'You are a terse test assistant.',
          input: [{ role: 'user', content: 'Reply with exactly: pong' }],
        },
      });

      return `"${truncate(text.trim(), 40)}", usage ${response.usage?.input_tokens ?? '?'} in / ${response.usage?.output_tokens ?? '?'} out`;
    }),
  );

  results.push(
    await runProbe('Non-streaming request rejected', async () => {
      const response = await fetch(`${API_BASE_URL}/responses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          input: [{ role: 'user', content: 'Reply with exactly: pong' }],
          store: false,
          stream: false,
        }),
      });

      if (response.ok) {
        await response.text();

        return 'accepted (no aggregation adapter needed)';
      }

      return `rejected as documented: ${await describeErrorBody(response)}`;
    }),
  );

  results.push(
    await runProbe('Function tool round trip', async () => {
      const userMessage = {
        role: 'user',
        content:
          'Use the lookup_company tool to look up Acme, then state its stage in one sentence.',
      };
      const first = await createResponse({
        accessToken,
        body: {
          model,
          instructions: 'You are a CRM assistant. Use tools when asked.',
          input: [userMessage],
          tools: [LOOKUP_COMPANY_TOOL],
        },
      });
      const functionCall = first.response.output.find(
        (item) => item.type === 'function_call',
      );

      if (!functionCall) {
        throw new Error('Model did not call the function.');
      }

      const second = await createResponse({
        accessToken,
        body: {
          model,
          instructions: 'You are a CRM assistant. Use tools when asked.',
          input: [
            userMessage,
            {
              type: 'function_call',
              call_id: functionCall.call_id,
              name: functionCall.name,
              arguments: functionCall.arguments,
            },
            {
              type: 'function_call_output',
              call_id: functionCall.call_id,
              output: JSON.stringify(FAKE_COMPANY),
            },
          ],
          tools: [LOOKUP_COMPANY_TOOL],
        },
      });

      return `called ${functionCall.name}(${truncate(functionCall.arguments, 40)}); answer mentions stage: ${/proposal/i.test(second.text) ? 'yes' : 'no'}`;
    }),
  );

  results.push(
    await runProbe('Hosted web search', async () => {
      const { text, response } = await createResponse({
        accessToken,
        body: {
          model,
          instructions: 'Answer briefly and cite your source.',
          input: [
            {
              role: 'user',
              content:
                'Search the web for the official website of the Node.js project and reply with its URL.',
            },
          ],
          tools: [{ type: 'web_search' }],
        },
      });
      const searchCalls = response.output.filter(
        (item) => item.type === 'web_search_call',
      ).length;
      const citations = response.output
        .filter((item) => item.type === 'message')
        .flatMap((item) => item.content ?? [])
        .flatMap((content) => content.annotations ?? [])
        .filter((annotation) => annotation.type === 'url_citation').length;

      if (searchCalls === 0) {
        throw new Error(
          `No web_search_call in output (answer: "${truncate(text.trim(), 60)}").`,
        );
      }

      return `${searchCalls} search call(s), ${citations} citation(s)`;
    }),
  );

  results.push(
    await runProbe('Vercel AI SDK streamText + tool', async () => {
      const { streamText, jsonSchema, isStepCount } = await import('ai');
      const { createOpenAI } = await import('@ai-sdk/openai');
      const rewrites = new Set();
      const openai = createOpenAI({
        apiKey: accessToken,
        fetch: createPlanFetch({ rewrites }),
      });
      let calledWith;
      let streamError;

      const result = streamText({
        model: openai.responses(model),
        instructions: 'You are a CRM assistant. Use tools when asked.',
        messages: [
          {
            role: 'user',
            content:
              'Use the lookup_company tool to look up Acme, then state its stage in one sentence.',
          },
        ],
        tools: {
          lookup_company: {
            description: LOOKUP_COMPANY_TOOL.description,
            inputSchema: jsonSchema(LOOKUP_COMPANY_TOOL.parameters),
            execute: async ({ name }) => {
              calledWith = name;

              return FAKE_COMPANY;
            },
          },
        },
        stopWhen: isStepCount(3),
        providerOptions: { openai: { store: false } },
        onError: ({ error }) => {
          streamError = error;
        },
      });

      let text = '';

      for await (const delta of result.textStream) {
        text += delta;
      }

      if (streamError) {
        throw new Error(streamError.message ?? String(streamError));
      }

      if (!calledWith) {
        throw new Error(
          `Tool not called (answer: "${truncate(text.trim(), 60)}").`,
        );
      }

      return `tool ran (${calledWith}); answer mentions stage: ${/proposal/i.test(text) ? 'yes' : 'no'}; adapter: ${[...rewrites].join(', ') || 'no rewrites'}`;
    }),
  );

  console.log(`\nModel: ${model}\n`);

  for (const { name, result, detail, seconds } of results) {
    console.log(
      `${result === 'PASS' ? 'PASS' : 'FAIL'}  ${name} (${seconds.toFixed(1)}s)\n      ${detail}`,
    );
  }
};

const commands = { login, status, probe, logout };
const command = commands[process.argv[2]];

if (!command) {
  console.log(
    'Usage: node setu/dev/chatgpt-plan.mjs <login|status|probe|logout> [--port N] [--model slug]',
  );
  process.exit(1);
}

try {
  await command();
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
