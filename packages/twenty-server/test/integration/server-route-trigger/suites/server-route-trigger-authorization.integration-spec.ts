import crypto from 'crypto';

import request from 'supertest';
import { type DataSource } from 'typeorm';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const OWNER_WORKSPACE_ID = SEED_APPLE_WORKSPACE_ID;

const resolverNotFoundMessage = (universalIdentifier: string) =>
  `Server resolver function ${universalIdentifier} not found`;

type SeededLogicFunction = { id: string; universalIdentifier: string };

describe('ServerRouteTrigger authorization (integration)', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;

  let ds: DataSource;

  let applicationRegistrationId: string;
  let applicationId: string;

  let nonExposedFunction: SeededLogicFunction;
  let serverRouteExposedFunction: SeededLogicFunction;

  const insertLogicFunction = async ({
    serverRouteExposed,
  }: {
    serverRouteExposed: boolean;
  }): Promise<SeededLogicFunction> => {
    const id = crypto.randomUUID();
    const universalIdentifier = crypto.randomUUID();

    await ds.query(
      `INSERT INTO core."logicFunction"
        (id, name, "workspaceId", "universalIdentifier", "applicationId",
         "sourceHandlerPath", "builtHandlerPath", "handlerName",
         "httpRouteTriggerSettings", "serverRouteTriggerSettings")
       VALUES ($1, $2, $3, $4, $5, 'src/handler.ts', 'dist/handler.js', 'main',
         '{"path":"/proof","httpMethod":"POST","isAuthRequired":true}'::jsonb, $6)`,
      [
        id,
        serverRouteExposed
          ? 'Server Route Auth - exposed resolver'
          : 'Server Route Auth - non-exposed function',
        OWNER_WORKSPACE_ID,
        universalIdentifier,
        applicationId,
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
    });
    serverRouteExposedFunction = await insertLogicFunction({
      serverRouteExposed: true,
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
      expect(response.body?.messages).toEqual([
        resolverNotFoundMessage(nonExposedFunction.universalIdentifier),
      ]);
    });

    it('still accepts a legitimately server-route-exposed resolver at the authorization boundary', async () => {
      const response = await request(baseUrl)
        .post(
          `/webhooks/server/${serverRouteExposedFunction.universalIdentifier}`,
        )
        .send({ any: 'payload' });

      expect(response.body?.messages ?? []).not.toContain(
        resolverNotFoundMessage(serverRouteExposedFunction.universalIdentifier),
      );
    });
  });
});
