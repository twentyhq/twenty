import { gql } from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const CREATE_MESSAGE_SUPPRESSION = gql`
  mutation CreateMessageSuppression($input: CreateMessageSuppressionInput!) {
    createMessageSuppression(input: $input) {
      id
      emailAddress
      reason
      source
      unsubscribeTopicId
    }
  }
`;

const DELETE_MESSAGE_SUPPRESSION = gql`
  mutation DeleteMessageSuppression($id: UUID!) {
    deleteMessageSuppression(id: $id)
  }
`;

const MESSAGE_SUPPRESSIONS = gql`
  query MessageSuppressions($input: FindMessageSuppressionsInput!) {
    messageSuppressions(input: $input) {
      totalCount
      records {
        id
        emailAddress
        reason
      }
    }
  }
`;

describe('messageSuppressionResolver (integration)', () => {
  const createdSuppressionIds: string[] = [];

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
      value: true,
      expectToFail: false,
    });
  });

  afterAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_EMAIL_GROUP_ENABLED,
      value: false,
      expectToFail: false,
    });
  });

  afterEach(async () => {
    for (const id of createdSuppressionIds) {
      await testDataSource
        .query('DELETE FROM core."messageSuppression" WHERE id = $1', [id])
        .catch(() => {});
    }
    createdSuppressionIds.length = 0;
  });

  const createSuppression = async (emailAddress: string) => {
    const response = await makeMetadataAPIRequest({
      query: CREATE_MESSAGE_SUPPRESSION,
      variables: { input: { emailAddress } },
    });

    const createdId: string | undefined =
      response.body.data?.createMessageSuppression?.id;

    if (createdId !== undefined) {
      createdSuppressionIds.push(createdId);
    }

    return response;
  };

  const insertHardSuppression = async (emailAddress: string) => {
    const suppressionId = v4();

    await testDataSource.query(
      `INSERT INTO core."messageSuppression"
       ("id", "workspaceId", "emailAddress", "reason", "source", "providerEventId", "unsubscribeTopicId")
       VALUES ($1, $2, $3, 'BOUNCE', 'WEBHOOK', NULL, NULL)`,
      [suppressionId, SEED_APPLE_WORKSPACE_ID, emailAddress],
    );
    createdSuppressionIds.push(suppressionId);

    return suppressionId;
  };

  it('should suppress an address on request and expose it through the list query', async () => {
    const emailAddress = `manual-${v4()}@example.com`;

    const createResponse = await createSuppression(emailAddress);

    expect(createResponse.body.errors).toBeUndefined();
    expect(createResponse.body.data.createMessageSuppression).toMatchObject({
      emailAddress,
      reason: 'UNSUBSCRIBE',
      source: 'SYSTEM',
      unsubscribeTopicId: null,
    });

    const listResponse = await makeMetadataAPIRequest({
      query: MESSAGE_SUPPRESSIONS,
      variables: { input: { searchTerm: emailAddress, limit: 30, offset: 0 } },
    });

    expect(listResponse.body.data.messageSuppressions.totalCount).toBe(1);
  });

  it('should lower-case the suppressed address so sends match it', async () => {
    const emailAddress = `Mixed-${v4()}@Example.com`;

    const createResponse = await createSuppression(emailAddress);

    expect(createResponse.body.data.createMessageSuppression.emailAddress).toBe(
      emailAddress.toLowerCase(),
    );
  });

  it('should remove a suppression that was added by mistake', async () => {
    const emailAddress = `undo-${v4()}@example.com`;
    const createResponse = await createSuppression(emailAddress);
    const suppressionId = createResponse.body.data.createMessageSuppression.id;

    const deleteResponse = await makeMetadataAPIRequest({
      query: DELETE_MESSAGE_SUPPRESSION,
      variables: { id: suppressionId },
    });

    expect(deleteResponse.body.errors).toBeUndefined();
    expect(deleteResponse.body.data.deleteMessageSuppression).toBe(true);

    const listResponse = await makeMetadataAPIRequest({
      query: MESSAGE_SUPPRESSIONS,
      variables: { input: { searchTerm: emailAddress, limit: 30, offset: 0 } },
    });

    expect(listResponse.body.data.messageSuppressions.totalCount).toBe(0);
  });

  it('should refuse to remove a hard bounce', async () => {
    const suppressionId = await insertHardSuppression(
      `bounced-${v4()}@example.com`,
    );

    const deleteResponse = await makeMetadataAPIRequest({
      query: DELETE_MESSAGE_SUPPRESSION,
      variables: { id: suppressionId },
    });

    expect(deleteResponse.body.errors[0].extensions).toMatchObject({
      code: 'FORBIDDEN',
      subCode: 'MESSAGE_SUPPRESSION_NOT_REMOVABLE',
    });
  });

  it('should fail when the suppression does not exist', async () => {
    const deleteResponse = await makeMetadataAPIRequest({
      query: DELETE_MESSAGE_SUPPRESSION,
      variables: { id: v4() },
    });

    expect(deleteResponse.body.errors[0].extensions).toMatchObject({
      code: 'NOT_FOUND',
      subCode: 'MESSAGE_SUPPRESSION_NOT_FOUND',
    });
  });
});
