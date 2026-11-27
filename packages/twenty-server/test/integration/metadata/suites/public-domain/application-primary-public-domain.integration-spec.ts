import gql from 'graphql-tag';
import request from 'supertest';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { mockCloudflareConfigured } from 'test/integration/route-trigger/utils/mock-cloudflare-configured.util';
import {
  deletePublicDomains,
  insertPublicDomain,
} from 'test/integration/route-trigger/utils/public-domain-rows.util';
import { setupHttpResponseLogicFunctionApplication } from 'test/integration/route-trigger/utils/setup-http-response-logic-function-application.util';
import { HTTPMethod } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const ECHO_FUNCTIONS_URL_HANDLER =
  'export const main = async () => ({ functionsUrl: process.env.TWENTY_FUNCTIONS_URL ?? null });\n';

const SET_APPLICATION_PRIMARY_PUBLIC_DOMAIN = gql`
  mutation SetApplicationPrimaryPublicDomain(
    $applicationId: String!
    $publicDomainId: String!
  ) {
    setApplicationPrimaryPublicDomain(
      applicationId: $applicationId
      publicDomainId: $publicDomainId
    ) {
      id
      domain
    }
  }
`;

const FIND_APPLICATION_FUNCTIONS_BASE_URL = gql`
  query FindApplicationFunctionsBaseUrl($id: UUID!) {
    findOneApplication(id: $id) {
      id
      functionsBaseUrl
      primaryPublicDomainId
    }
  }
`;

const setPrimaryPublicDomain = ({
  applicationId,
  publicDomainId,
}: {
  applicationId: string;
  publicDomainId: string;
}) =>
  makeMetadataApiRequest({
    query: SET_APPLICATION_PRIMARY_PUBLIC_DOMAIN,
    variables: { applicationId, publicDomainId },
  });

const findPublicDomainId = async (domain: string): Promise<string> => {
  const [{ id }] = await globalThis.testDataSource.query(
    `SELECT id FROM core."publicDomain" WHERE domain = $1`,
    [domain],
  );

  return id;
};

const setupEchoFunctionsUrlApplication = async () => {
  const path = `/primary-public-domain-${uuidv4()}`;

  const application = await setupHttpResponseLogicFunctionApplication({
    name: 'Primary Public Domain App',
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

describe('Application primary public domain (integration)', () => {
  const baseUrl = `http://localhost:${APP_PORT}`;
  const workspaceHost = `apple.localhost:${APP_PORT}`;

  const requestFunctionsUrl = async (path: string) => {
    const response = await request(baseUrl)
      .get(`/s${path}`)
      .set('Host', workspaceHost);

    expect(response.status).toBe(200);

    return response.body.functionsUrl;
  };

  it('makes TWENTY_FUNCTIONS_URL and functionsBaseUrl follow the chosen validated public domain', async () => {
    const olderPublicDomain = `older-${uuidv4()}.example.com`;
    const newerPublicDomain = `newer-${uuidv4()}.example.com`;
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
        domain: newerPublicDomain,
        isValidated: true,
        applicationId,
        createdAt: new Date('2026-02-01T00:00:00.000Z'),
      });

      expect(await requestFunctionsUrl(path)).toBe(
        `https://${olderPublicDomain}`,
      );

      const newerPublicDomainId = await findPublicDomainId(newerPublicDomain);

      const response = await setPrimaryPublicDomain({
        applicationId,
        publicDomainId: newerPublicDomainId,
      });

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.setApplicationPrimaryPublicDomain.domain).toBe(
        newerPublicDomain,
      );
      expect(await requestFunctionsUrl(path)).toBe(
        `https://${newerPublicDomain}`,
      );

      const applicationResponse = await makeMetadataApiRequest({
        query: FIND_APPLICATION_FUNCTIONS_BASE_URL,
        variables: { id: applicationId },
      });

      expect(
        applicationResponse.body.data.findOneApplication.functionsBaseUrl,
      ).toBe(`https://${newerPublicDomain}`);
      expect(
        applicationResponse.body.data.findOneApplication.primaryPublicDomainId,
      ).toBe(newerPublicDomainId);
    } finally {
      await deletePublicDomains([olderPublicDomain, newerPublicDomain]);
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    }
  }, 60000);

  it('refuses a public domain that is not validated yet when Cloudflare is configured', async () => {
    const publicDomain = `pending-${uuidv4()}.example.com`;
    const { applicationId, applicationUniversalIdentifier } =
      await setupEchoFunctionsUrlApplication();
    const cloudflareConfigured = mockCloudflareConfigured();

    try {
      await insertPublicDomain({
        domain: publicDomain,
        isValidated: false,
        applicationId,
      });

      const response = await setPrimaryPublicDomain({
        applicationId,
        publicDomainId: await findPublicDomainId(publicDomain),
      });

      expect(response.body.errors?.[0]?.extensions?.code).toBe(
        'BAD_USER_INPUT',
      );
    } finally {
      cloudflareConfigured.mockRestore();
      await deletePublicDomains([publicDomain]);
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    }
  }, 60000);

  it("refuses another application's public domain", async () => {
    const otherApplicationPublicDomain = `other-${uuidv4()}.example.com`;
    const { applicationId, applicationUniversalIdentifier } =
      await setupEchoFunctionsUrlApplication();
    const [{ id: otherApplicationId }] = await globalThis.testDataSource.query(
      `SELECT id FROM core."application"
       WHERE "workspaceId" = $1 AND id != $2
       LIMIT 1`,
      [SEED_APPLE_WORKSPACE_ID, applicationId],
    );

    try {
      await insertPublicDomain({
        domain: otherApplicationPublicDomain,
        isValidated: true,
        applicationId: otherApplicationId,
      });

      const response = await setPrimaryPublicDomain({
        applicationId,
        publicDomainId: await findPublicDomainId(otherApplicationPublicDomain),
      });

      expect(response.body.errors?.[0]?.extensions?.code).toBe('NOT_FOUND');
    } finally {
      await deletePublicDomains([otherApplicationPublicDomain]);
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier,
      });
    }
  }, 60000);
});
