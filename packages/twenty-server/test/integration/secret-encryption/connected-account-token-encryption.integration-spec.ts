import crypto from 'crypto';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX,
  SECRET_ENCRYPTION_KEY_ID_REGEX,
} from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';

// Temporary: should be replaced by an integration test against a simpler
// API surface once one exists that itself performs token encryption. For
// now the GraphQL workspace mutation does no encryption of its own, so we
// pre-compute encrypted ciphertexts via the DI-resolved encryption
// service and assert the storage + retrieval contract through GraphQL.

const APPLE_JANE_WORKSPACE_MEMBER_ID = '20202020-463f-435b-828c-107e007a2711';
const APPLE_WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const CONNECTED_ACCOUNT_GQL_FIELDS = `
  id
  handle
  provider
  accessToken
  refreshToken
`;

describe('ConnectedAccount token encryption (integration)', () => {
  let service: ConnectedAccountTokenEncryptionService;
  const seededRowIds: string[] = [];

  beforeAll(() => {
    // strict: false searches the whole module tree — the service is
    // provided by a feature module that isn't on the root injector.
    service = global.app.get(ConnectedAccountTokenEncryptionService, {
      strict: false,
    });
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
        workspaceId: APPLE_WORKSPACE_ID,
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
          accountOwnerId: APPLE_JANE_WORKSPACE_MEMBER_ID,
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
        workspaceId: APPLE_WORKSPACE_ID,
      }),
    ).toBe(accessTokenPlaintext);
    expect(
      service.decrypt({
        ciphertext: storedRow.refreshToken,
        workspaceId: APPLE_WORKSPACE_ID,
      }),
    ).toBe(refreshTokenPlaintext);
  });

  it('rejects a plaintext accessToken at the Postgres CHECK constraint level', async () => {
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
          accountOwnerId: APPLE_JANE_WORKSPACE_MEMBER_ID,
        },
      }),
    );

    expect(response.body.errors).toBeDefined();
    expect(JSON.stringify(response.body.errors)).toMatch(/check constraint/i);
  });
});
