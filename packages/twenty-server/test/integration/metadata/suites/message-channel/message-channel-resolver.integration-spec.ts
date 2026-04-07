import { gql } from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { CONNECTED_ACCOUNT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/connected-account-data-seeds.constant';
import { MESSAGE_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/message-channel-data-seeds.constant';

describe('messageChannelResolver (e2e)', () => {
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

      expect(channelIds).toContain(MESSAGE_CHANNEL_DATA_SEED_IDS.JANE);
      expect(channelIds).not.toContain(MESSAGE_CHANNEL_DATA_SEED_IDS.JONY);
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
      const response = await makeMetadataAPIRequest({
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
            id: MESSAGE_CHANNEL_DATA_SEED_IDS.JONY,
            update: { visibility: 'METADATA' },
          },
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    });
  });
});
