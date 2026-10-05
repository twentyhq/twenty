import { gql } from 'graphql-tag';
import { makeMetadataApiRequestWithMemberRole } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-member-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { CONNECTED_ACCOUNT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/connected-account-data-seeds.constant';
import { MESSAGE_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/message-channel-seed-ids.constant';

describe('messageChannelResolver (e2e)', () => {
  describe('myMessageChannels', () => {
    it('should return only the current user message channels', async () => {
      const response = await makeMetadataApiRequest({
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

      expect(channelIds).toContain(MESSAGE_CHANNEL_DATA_SEED_IDS.JANE);
      expect(channelIds).not.toContain(MESSAGE_CHANNEL_DATA_SEED_IDS.JONY);
    });

    it('should filter by connectedAccountId', async () => {
      const response = await makeMetadataApiRequest({
        query: gql`
          query MyMessageChannels($connectedAccountId: UUID) {
            myMessageChannels(connectedAccountId: $connectedAccountId) {
              id
              handle
            }
          }
        `,
        variables: {
          connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.JANE,
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();

      const channels = response.body.data.myMessageChannels;
      const channelIds = channels.map((channel: { id: string }) => channel.id);

      expect(channelIds).toContain(MESSAGE_CHANNEL_DATA_SEED_IDS.JANE);
      expect(channelIds).not.toContain(MESSAGE_CHANNEL_DATA_SEED_IDS.JONY);
    });

    it('should deny filtering by another user connectedAccountId', async () => {
      const response = await makeMetadataApiRequest({
        query: gql`
          query MyMessageChannels($connectedAccountId: UUID) {
            myMessageChannels(connectedAccountId: $connectedAccountId) {
              id
            }
          }
        `,
        variables: {
          connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY,
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    });

    it('should hide the channels of an archived workspace-shared account from other members', async () => {
      await global.testDataSource.query(
        `UPDATE core."connectedAccount" SET "archivedAt" = now() WHERE id = $1`,
        [CONNECTED_ACCOUNT_DATA_SEED_IDS.SUPPORT_GROUP],
      );

      try {
        const response = await makeMetadataApiRequestWithMemberRole({
          query: gql`
            query MyMessageChannels {
              myMessageChannels {
                id
              }
            }
          `,
        });

        expect(response.status).toBe(200);
        expect(response.body.errors).toBeUndefined();

        const channelIds = response.body.data.myMessageChannels.map(
          (channel: { id: string }) => channel.id,
        );

        expect(channelIds).not.toContain(
          MESSAGE_CHANNEL_DATA_SEED_IDS.SUPPORT_GROUP,
        );
      } finally {
        await global.testDataSource.query(
          `UPDATE core."connectedAccount" SET "archivedAt" = NULL WHERE id = $1`,
          [CONNECTED_ACCOUNT_DATA_SEED_IDS.SUPPORT_GROUP],
        );
      }
    });

    it('should not return syncCursor', async () => {
      const response = await makeMetadataApiRequest({
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
      const response = await makeMetadataApiRequest({
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
            id: MESSAGE_CHANNEL_DATA_SEED_IDS.JANE,
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
      const response = await makeMetadataApiRequest({
        query: gql`
          mutation UpdateMessageChannel($input: UpdateMessageChannelInput!) {
            updateMessageChannel(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            id: MESSAGE_CHANNEL_DATA_SEED_IDS.JONY,
            update: { visibility: 'METADATA' },
          },
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    });

    it('should not queue a group emails cleanup on a group channel', async () => {
      try {
        const response = await makeMetadataApiRequest({
          query: gql`
            mutation UpdateMessageChannel($input: UpdateMessageChannelInput!) {
              updateMessageChannel(input: $input) {
                id
                excludeGroupEmails
              }
            }
          `,
          variables: {
            input: {
              id: MESSAGE_CHANNEL_DATA_SEED_IDS.SUPPORT_GROUP,
              update: { excludeGroupEmails: true },
            },
          },
        });

        expect(response.body.errors).toBeUndefined();
        expect(response.body.data.updateMessageChannel.excludeGroupEmails).toBe(
          true,
        );

        const [messageChannel] = await global.testDataSource.query(
          `SELECT "pendingGroupEmailsAction" FROM core."messageChannel" WHERE id = $1`,
          [MESSAGE_CHANNEL_DATA_SEED_IDS.SUPPORT_GROUP],
        );

        expect(messageChannel.pendingGroupEmailsAction).toBe('NONE');
      } finally {
        await global.testDataSource.query(
          `UPDATE core."messageChannel" SET "excludeGroupEmails" = false, "pendingGroupEmailsAction" = 'NONE' WHERE id = $1`,
          [MESSAGE_CHANNEL_DATA_SEED_IDS.SUPPORT_GROUP],
        );
      }
    });

    it('should deny a member updating a workspace-shared group channel', async () => {
      const response = await makeMetadataApiRequestWithMemberRole({
        query: gql`
          mutation UpdateMessageChannel($input: UpdateMessageChannelInput!) {
            updateMessageChannel(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            id: MESSAGE_CHANNEL_DATA_SEED_IDS.SUPPORT_GROUP,
            update: { excludeGroupEmails: true },
          },
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    });
  });
});
