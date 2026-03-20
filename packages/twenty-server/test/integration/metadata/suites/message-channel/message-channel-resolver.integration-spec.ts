import { randomUUID } from 'crypto';

import { gql } from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const JANE_USER_WORKSPACE_ID = '20202020-1e7c-43d9-a5db-685b5069d816';
const JONY_USER_WORKSPACE_ID = '20202020-3957-4908-9c36-2929a23f8353';

describe('messageChannelResolver (e2e)', () => {
  let janeAccountId: string;
  let jonyAccountId: string;
  let janeChannelId: string;
  let jonyChannelId: string;

  beforeAll(async () => {
    janeAccountId = randomUUID();
    jonyAccountId = randomUUID();
    janeChannelId = randomUUID();
    jonyChannelId = randomUUID();

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED,
      value: true,
      expectToFail: false,
    });

    await testDataSource.query(
      `INSERT INTO core."connectedAccount" (id, handle, provider, "userWorkspaceId", "workspaceId")
       VALUES ($1, 'jane@test.com', 'google', $2, $3),
              ($4, 'jony@test.com', 'google', $5, $3)`,
      [
        janeAccountId,
        JANE_USER_WORKSPACE_ID,
        WORKSPACE_ID,
        jonyAccountId,
        JONY_USER_WORKSPACE_ID,
      ],
    );

    await testDataSource.query(
      `INSERT INTO core."messageChannel" (id, handle, visibility, type, "syncStage", "isContactAutoCreationEnabled", "contactAutoCreationPolicy", "messageFolderImportPolicy", "excludeNonProfessionalEmails", "excludeGroupEmails", "pendingGroupEmailsAction", "isSyncEnabled", "connectedAccountId", "workspaceId")
       VALUES ($1, 'jane@test.com', 'SHARE_EVERYTHING', 'EMAIL', 'MESSAGE_LIST_FETCH_PENDING', false, 'SENT_AND_RECEIVED', 'ALL_FOLDERS', false, false, 'NONE', true, $2, $3),
              ($4, 'jony@test.com', 'SHARE_EVERYTHING', 'EMAIL', 'MESSAGE_LIST_FETCH_PENDING', false, 'SENT_AND_RECEIVED', 'ALL_FOLDERS', false, false, 'NONE', true, $5, $3)`,
      [
        janeChannelId,
        janeAccountId,
        WORKSPACE_ID,
        jonyChannelId,
        jonyAccountId,
      ],
    );
  });

  afterAll(async () => {
    await testDataSource
      .query('DELETE FROM core."messageChannel" WHERE id = ANY($1)', [
        [janeChannelId, jonyChannelId],
      ])
      .catch(() => {});
    await testDataSource
      .query('DELETE FROM core."connectedAccount" WHERE id = ANY($1)', [
        [janeAccountId, jonyAccountId],
      ])
      .catch(() => {});
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED,
      value: false,
      expectToFail: false,
    });
  });

  describe('myMessageChannels', () => {
    it('should return only the current user message channels', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          query MyMessageChannels {
            myMessageChannels {
              id
              handle
              visibility
              syncStatus
              syncStage
            }
          }
        `,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();

      const channels = response.body.data.myMessageChannels;
      const channelIds = channels.map((channel: { id: string }) => channel.id);

      expect(channelIds).toContain(janeChannelId);
      expect(channelIds).not.toContain(jonyChannelId);
    });

    it('should filter by connectedAccountId', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          query MyMessageChannels($connectedAccountId: UUID) {
            myMessageChannels(connectedAccountId: $connectedAccountId) {
              id
              handle
            }
          }
        `,
        variables: { connectedAccountId: janeAccountId },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();

      const channels = response.body.data.myMessageChannels;
      const channelIds = channels.map(
        (channel: { id: string }) => channel.id,
      );

      expect(channelIds).toContain(janeChannelId);
    });

    it('should deny filtering by another user connectedAccountId', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          query MyMessageChannels($connectedAccountId: UUID) {
            myMessageChannels(connectedAccountId: $connectedAccountId) {
              id
            }
          }
        `,
        variables: { connectedAccountId: jonyAccountId },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    });

    it('should not return syncCursor', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          query MyMessageChannels {
            myMessageChannels {
              id
              syncCursor
            }
          }
        `,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('updateMessageChannel', () => {
    it('should allow updating own channel settings', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          mutation UpdateMessageChannel($input: UpdateMessageChannelInput!) {
            updateMessageChannel(input: $input) {
              id
              visibility
            }
          }
        `,
        variables: {
          input: {
            id: janeChannelId,
            update: { visibility: 'METADATA' },
          },
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateMessageChannel.visibility).toBe(
        'METADATA',
      );
    });

    it('should deny updating another user channel', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          mutation UpdateMessageChannel($input: UpdateMessageChannelInput!) {
            updateMessageChannel(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            id: jonyChannelId,
            update: { visibility: 'METADATA' },
          },
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    });
  });
});
