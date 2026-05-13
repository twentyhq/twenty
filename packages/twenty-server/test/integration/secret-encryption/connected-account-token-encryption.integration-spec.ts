import crypto from 'crypto';

import gql from 'graphql-tag';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AuthModule } from 'src/engine/core-modules/auth/auth.module';
import {
  SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX,
  SECRET_ENCRYPTION_KEY_ID_REGEX,
} from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

// Temporary: replace with a richer integration test once an API surface
// exists that itself performs token encryption.

const CONNECTED_ACCOUNT_GQL_FIELDS = `
  id
  handle
  provider
  accessToken
  refreshToken
`;

const fetchCurrentWorkspaceContext = async (): Promise<{
  workspaceId: string;
  workspaceMemberId: string;
}> => {
  const response = await makeGraphqlAPIRequest({
    query: gql`
      query CurrentUserForEncryptionTest {
        currentUser {
          currentWorkspace {
            id
          }
          workspaceMember {
            id
          }
        }
      }
    `,
  });

  const currentUser = response.body?.data?.currentUser;
  const workspaceId = currentUser?.currentWorkspace?.id as string | undefined;
  const workspaceMemberId = currentUser?.workspaceMember?.id as
    | string
    | undefined;

  if (!isDefined(workspaceId) || !isDefined(workspaceMemberId)) {
    throw new Error(
      `currentUser query did not return workspace context: ${JSON.stringify(
        response.body,
      )}`,
    );
  }

  return { workspaceId, workspaceMemberId };
};

describe('ConnectedAccount token encryption (integration)', () => {
  let service: ConnectedAccountTokenEncryptionService;
  let workspaceId: string;
  let workspaceMemberId: string;
  const seededRowIds: string[] = [];

  beforeAll(async () => {
    // AuthModule imports ConnectedAccountTokenEncryptionModule which
    // exports the service — select() scopes the lookup to that module's
    // container so the provider is found.
    service = global.app
      .select(AuthModule)
      .get(ConnectedAccountTokenEncryptionService);

    ({ workspaceId, workspaceMemberId } = await fetchCurrentWorkspaceContext());
  });

  afterEach(async () => {
    for (const id of seededRowIds) {
      await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'connectedAccount',
          gqlFields: 'id',
          recordId: id,
        }),
      );
    }
    seededRowIds.length = 0;
  });

  it('stores both tokens as enc:v2 via the GraphQL API and decrypts back to the original plaintext', async () => {
    const connectedAccountId = crypto.randomUUID();
    const accessTokenPlaintext = 'integration-access-token';
    const refreshTokenPlaintext = 'integration-refresh-token';

    const { encryptedAccessToken, encryptedRefreshToken } =
      service.encryptTokenPair({
        accessToken: accessTokenPlaintext,
        refreshToken: refreshTokenPlaintext,
        workspaceId,
      });

    const createResponse = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'connectedAccount',
        gqlFields: CONNECTED_ACCOUNT_GQL_FIELDS,
        data: {
          id: connectedAccountId,
          handle: `enc-integration-${connectedAccountId}`,
          provider: ConnectedAccountProvider.GOOGLE,
          accessToken: encryptedAccessToken,
          refreshToken: encryptedRefreshToken,
          accountOwnerId: workspaceMemberId,
        },
      }),
    );

    expect(createResponse.body.errors).toBeUndefined();
    seededRowIds.push(connectedAccountId);

    const findResponse = await makeGraphqlAPIRequest(
      findOneOperationFactory({
        objectMetadataSingularName: 'connectedAccount',
        gqlFields: CONNECTED_ACCOUNT_GQL_FIELDS,
        filter: { id: { eq: connectedAccountId } },
      }),
    );

    expect(findResponse.body.errors).toBeUndefined();
    const storedRow = findResponse.body.data.connectedAccount;

    expect(isDefined(storedRow)).toBe(true);

    const envelopeShape = new RegExp(
      `^${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}${SECRET_ENCRYPTION_KEY_ID_REGEX.source.replace(
        /^\^|\$$/g,
        '',
      )}:[A-Za-z0-9+/=]+$`,
    );

    expect(storedRow.accessToken).toMatch(envelopeShape);
    expect(storedRow.refreshToken).toMatch(envelopeShape);
    expect(storedRow.accessToken).not.toContain(accessTokenPlaintext);
    expect(storedRow.refreshToken).not.toContain(refreshTokenPlaintext);

    expect(
      service.decrypt({
        ciphertext: storedRow.accessToken,
        workspaceId,
      }),
    ).toBe(accessTokenPlaintext);
    expect(
      service.decrypt({
        ciphertext: storedRow.refreshToken,
        workspaceId,
      }),
    ).toBe(refreshTokenPlaintext);
  });

  it('rejects a plaintext accessToken at the Postgres CHECK constraint level via GraphQL', async () => {
    const connectedAccountId = crypto.randomUUID();

    const response = await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'connectedAccount',
        gqlFields: 'id',
        data: {
          id: connectedAccountId,
          handle: `enc-integration-rejected-${connectedAccountId}`,
          provider: ConnectedAccountProvider.GOOGLE,
          accessToken: 'plaintext-should-be-rejected',
          accountOwnerId: workspaceMemberId,
        },
      }),
    );

    expect(response.body.errors).toBeDefined();
    expect(JSON.stringify(response.body.errors)).toMatch(/check constraint/i);
  });
});
