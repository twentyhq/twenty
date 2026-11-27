import request from 'supertest';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  deletePublicDomains,
  insertPublicDomain,
} from 'test/integration/route-trigger/utils/public-domain-rows.util';
import { setupHttpResponseLogicFunctionApplication } from 'test/integration/route-trigger/utils/setup-http-response-logic-function-application.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { HTTPMethod } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const ECHO_FUNCTIONS_URL_HANDLER =
  'export const main = async () => ({ functionsUrl: process.env.TWENTY_FUNCTIONS_URL ?? null });\n';

const setupEchoFunctionsUrlApplication = async () => {
  const path = `/functions-url-${uuidv4()}`;

  const application = await setupHttpResponseLogicFunctionApplication({
    name: 'Route Functions Url App',
    handlerCode: ECHO_FUNCTIONS_URL_HANDLER,
    triggerSettings: {
      httpRouteTriggerSettings: {
        path,
        httpMethod: HTTPMethod.GET,
        isAuthRequired: false,
      },
    },
  });

  return { path, ...application };
};

describe('RouteTrigger TWENTY_FUNCTIONS_URL (integration)', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;
  const workspaceHost = `apple.localhost:${APP_PORT}`;

  const requestFunctionsUrl = async (path: string) => {
    const response = await request(baseUrl)
      .get(`/s${path}`)
      .set('Host', workspaceHost);

    expect(response.status).toBe(200);

    return response.body.functionsUrl;
  };

  it('points at the validated public domain of the application', async () => {
    const publicDomain = `${uuidv4()}.example.com`;
    const { path, applicationId, applicationUniversalIdentifier } =
      await setupEchoFunctionsUrlApplication();

    try {
      await insertPublicDomain({
        domain: publicDomain,
        isValidated: true,
        applicationId,
      });

      expect(await requestFunctionsUrl(path)).toBe(`https://${publicDomain}`);
    } finally {
      await deletePublicDomains([publicDomain]);
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    }
  }, 60000);

  it('ignores a public domain that is not validated yet', async () => {
    const publicDomain = `${uuidv4()}.example.com`;
    const { path, applicationId, applicationUniversalIdentifier } =
      await setupEchoFunctionsUrlApplication();

    try {
      await insertPublicDomain({
        domain: publicDomain,
        isValidated: false,
        applicationId,
      });

      expect(await requestFunctionsUrl(path)).not.toBe(
        `https://${publicDomain}`,
      );
    } finally {
      await deletePublicDomains([publicDomain]);
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    }
  }, 60000);

  it('uses the oldest validated public domain when the application has several', async () => {
    const olderPublicDomain = `older-${uuidv4()}.example.com`;
    const newerPublicDomain = `newer-${uuidv4()}.example.com`;
    const { path, applicationId, applicationUniversalIdentifier } =
      await setupEchoFunctionsUrlApplication();

    try {
      await insertPublicDomain({
        domain: newerPublicDomain,
        isValidated: true,
        applicationId,
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
      });
      await insertPublicDomain({
        domain: olderPublicDomain,
        isValidated: true,
        applicationId,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      });

      expect(await requestFunctionsUrl(path)).toBe(
        `https://${olderPublicDomain}`,
      );
    } finally {
      await deletePublicDomains([olderPublicDomain, newerPublicDomain]);
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    }
  }, 60000);
  const setPrimaryPublicDomain = async ({
    applicationId,
    domain,
  }: {
    applicationId: string;
    domain: string;
  }) => {
    await globalThis.testDataSource.query(
      `UPDATE core."application"
       SET "primaryPublicDomainId" =
         (SELECT id FROM core."publicDomain" WHERE domain = $1)
       WHERE id = $2`,
      [domain, applicationId],
    );

    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, ['flatApplicationMaps']);
  };

  it('prefers the validated primary public domain of the application', async () => {
    const olderPublicDomain = `older-${uuidv4()}.example.com`;
    const primaryPublicDomain = `primary-${uuidv4()}.example.com`;
    const { path, applicationId, applicationUniversalIdentifier } =
      await setupEchoFunctionsUrlApplication();

    try {
      await insertPublicDomain({
        domain: olderPublicDomain,
        isValidated: true,
        applicationId,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      });
      await insertPublicDomain({
        domain: primaryPublicDomain,
        isValidated: true,
        applicationId,
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
      });
      await setPrimaryPublicDomain({
        applicationId,
        domain: primaryPublicDomain,
      });

      expect(await requestFunctionsUrl(path)).toBe(
        `https://${primaryPublicDomain}`,
      );
    } finally {
      await deletePublicDomains([olderPublicDomain, primaryPublicDomain]);
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    }
  }, 60000);

  it('falls back to the oldest validated public domain when the primary one is not validated', async () => {
    const olderPublicDomain = `older-${uuidv4()}.example.com`;
    const primaryPublicDomain = `primary-${uuidv4()}.example.com`;
    const { path, applicationId, applicationUniversalIdentifier } =
      await setupEchoFunctionsUrlApplication();

    try {
      await insertPublicDomain({
        domain: olderPublicDomain,
        isValidated: true,
        applicationId,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      });
      await insertPublicDomain({
        domain: primaryPublicDomain,
        isValidated: false,
        applicationId,
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
      });
      await setPrimaryPublicDomain({
        applicationId,
        domain: primaryPublicDomain,
      });

      expect(await requestFunctionsUrl(path)).toBe(
        `https://${olderPublicDomain}`,
      );
    } finally {
      await deletePublicDomains([olderPublicDomain, primaryPublicDomain]);
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    }
  }, 60000);
  it('skips a validated public domain on an instance hostname', async () => {
    const instancePublicDomain = `${uuidv4()}.localhost`;
    const publicDomain = `${uuidv4()}.example.com`;
    const { path, applicationId, applicationUniversalIdentifier } =
      await setupEchoFunctionsUrlApplication();

    try {
      await insertPublicDomain({
        domain: instancePublicDomain,
        isValidated: true,
        applicationId,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      });
      await insertPublicDomain({
        domain: publicDomain,
        isValidated: true,
        applicationId,
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
      });

      expect(await requestFunctionsUrl(path)).toBe(`https://${publicDomain}`);
    } finally {
      await deletePublicDomains([instancePublicDomain, publicDomain]);
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    }
  }, 60000);
});
