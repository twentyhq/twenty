import crypto from 'crypto';

import request from 'supertest';
import { type DataSource } from 'typeorm';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const OWNER_WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;

const resolverNotFoundMessage = (universalIdentifier: string) =>
  `Server resolver function ${universalIdentifier} not found`;

const requiresAuthenticationMessage = (universalIdentifier: string) =>
  `Server resolver function ${universalIdentifier} requires authentication and cannot be dispatched through the public server route`;

// Emitted once a resolver has passed the authorization boundary and been
// dispatched to the executor. A raw-seeded function is absent from the
// flat-entity cache the executor reads, so execution stops here — this message
// is the proof of acceptance. Genuine 200 execution is covered by the
// logic-function-execution integration suite, which builds real sources.
const DISPATCHED_TO_EXECUTOR_MESSAGE = 'Logic function not found';

type SeededLogicFunction = { id: string; universalIdentifier: string };

describe('ServerRouteTrigger authorization (integration)', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;

  let ds: DataSource;

  let applicationRegistrationId: string;
  let applicationId: string;

  let nonExposedFunction: SeededLogicFunction;
  let exposedFunction: SeededLogicFunction;
  let authRequiredExposedFunction: SeededLogicFunction;

  const insertLogicFunction = async ({
    serverRouteExposed,
    authRequired,
  }: {
    serverRouteExposed: boolean;
    authRequired: boolean;
  }): Promise<SeededLogicFunction> => {
    const id = crypto.randomUUID();
    const universalIdentifier = crypto.randomUUID();

    await ds.query(
      `INSERT INTO core."logicFunction"
        (id, name, "workspaceId", "universalIdentifier", "applicationId",
         "sourceHandlerPath", "builtHandlerPath", "handlerName",
         "httpRouteTriggerSettings", "serverRouteTriggerSettings")
       VALUES ($1, $2, $3, $4, $5, 'src/handler.ts', 'dist/handler.js', 'main', $6, $7)`,
      [
        id,
        `Server Route Auth - ${serverRouteExposed ? 'exposed' : 'non-exposed'}${authRequired ? ' auth-required' : ''}`,
        OWNER_WORKSPACE_ID,
        universalIdentifier,
        applicationId,
        authRequired
          ? '{"path":"/proof","httpMethod":"POST","isAuthRequired":true}'
          : null,
        serverRouteExposed ? '{"forwardedRequestHeaders":[]}' : null,
      ],
    );

    return { id, universalIdentifier };
  };

  beforeAll(async () => {
    ds = global.testDataSource;

    applicationRegistrationId = crypto.randomUUID();
    await ds.query(
      `INSERT INTO core."applicationRegistration"
        (id, "universalIdentifier", name, "oAuthClientId", "workspaceId")
       VALUES ($1, $2, $3, $4, $5)`,
      [
        applicationRegistrationId,
        crypto.randomUUID(),
        'Server Route Auth Test App',
        crypto.randomUUID(),
        OWNER_WORKSPACE_ID,
      ],
    );

    applicationId = crypto.randomUUID();
    await ds.query(
      `INSERT INTO core."application"
        (id, "universalIdentifier", name, "workspaceId", "applicationRegistrationId", "sourceType", "sourcePath", "canBeUninstalled")
       VALUES ($1, $2, $3, $4, $5, 'local', '', true)`,
      [
        applicationId,
        crypto.randomUUID(),
        'Server Route Auth Test App',
        OWNER_WORKSPACE_ID,
        applicationRegistrationId,
      ],
    );

    nonExposedFunction = await insertLogicFunction({
      serverRouteExposed: false,
      authRequired: true,
    });
    exposedFunction = await insertLogicFunction({
      serverRouteExposed: true,
      authRequired: false,
    });
    authRequiredExposedFunction = await insertLogicFunction({
      serverRouteExposed: true,
      authRequired: true,
    });
  });

  afterAll(async () => {
    if (applicationId) {
      await ds.query(`DELETE FROM core."application" WHERE id = $1`, [
        applicationId,
      ]);
    }
    if (applicationRegistrationId) {
      await ds.query(
        `DELETE FROM core."applicationRegistration" WHERE id = $1`,
        [applicationRegistrationId],
      );
    }
  });

  describe('POST /webhooks/server/:universalIdentifier (public, unauthenticated)', () => {
    it('rejects an owner-workspace function without serverRouteTriggerSettings before executing it', async () => {
      const response = await request(baseUrl)
        .post(`/webhooks/server/${nonExposedFunction.universalIdentifier}`)
        .send({ any: 'payload' });

      expect(response.status).toBe(404);
      expect(response.body?.code).toBe('LOGIC_FUNCTION_NOT_FOUND');
      expect(response.body?.messages).toEqual([
        resolverNotFoundMessage(nonExposedFunction.universalIdentifier),
      ]);
    });

    it('dispatches a server-route-exposed resolver to the executor instead of rejecting it', async () => {
      const response = await request(baseUrl)
        .post(`/webhooks/server/${exposedFunction.universalIdentifier}`)
        .send({ any: 'payload' });

      // The exposed resolver must reach the executor, not be rejected at the
      // authorization boundary. A boundary rejection would carry the
      // resolver-not-found message (404), the auth guard would answer 403, and
      // a genuine platform/invalid-result failure would carry a different
      // message — asserting the exact dispatched-to-executor outcome rules all
      // of those out.
      expect(response.status).toBe(404);
      expect(response.body?.messages).toEqual([DISPATCHED_TO_EXECUTOR_MESSAGE]);
      expect(response.body?.messages).not.toContain(
        resolverNotFoundMessage(exposedFunction.universalIdentifier),
      );
    });

    it('rejects a server-route-exposed resolver that requires authentication before executing it', async () => {
      const response = await request(baseUrl)
        .post(
          `/webhooks/server/${authRequiredExposedFunction.universalIdentifier}`,
        )
        .send({ any: 'payload' });

      expect(response.status).toBe(403);
      expect(response.body?.code).toBe('RESOLVER_REQUIRES_AUTHENTICATION');
      expect(response.body?.messages).toEqual([
        requiresAuthenticationMessage(
          authRequiredExposedFunction.universalIdentifier,
        ),
      ]);
    });
  });
});
