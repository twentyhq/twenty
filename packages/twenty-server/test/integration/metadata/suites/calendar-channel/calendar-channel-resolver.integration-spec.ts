import { gql } from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { CALENDAR_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/calendar-channel-data-seeds.constant';
import { CONNECTED_ACCOUNT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/connected-account-data-seeds.constant';

describe('calendarChannelResolver (e2e)', () => {
  describe('myCalendarChannels', () => {
    it('should return only the current user calendar channels', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          query MyCalendarChannels {
            myCalendarChannels {
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

      const channels = response.body.data.myCalendarChannels;
      const channelIds = channels.map((channel: { id: string }) => channel.id);

      expect(channelIds).toContain(CALENDAR_CHANNEL_DATA_SEED_IDS.JANE);
      expect(channelIds).not.toContain(CALENDAR_CHANNEL_DATA_SEED_IDS.JONY);
    });

    it('should deny filtering by another user connectedAccountId', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          query MyCalendarChannels($connectedAccountId: UUID) {
            myCalendarChannels(connectedAccountId: $connectedAccountId) {
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
  });

  describe('updateCalendarChannel', () => {
    it('should allow updating own channel', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          mutation UpdateCalendarChannel($input: UpdateCalendarChannelInput!) {
            updateCalendarChannel(input: $input) {
              id
              visibility
            }
          }
        `,
        variables: {
          input: {
            id: CALENDAR_CHANNEL_DATA_SEED_IDS.JANE,
            update: { visibility: 'METADATA' },
          },
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateCalendarChannel.visibility).toBe(
        'METADATA',
      );
    });

    it('should deny updating another user channel', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          mutation UpdateCalendarChannel($input: UpdateCalendarChannelInput!) {
            updateCalendarChannel(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            id: CALENDAR_CHANNEL_DATA_SEED_IDS.JONY,
            update: { visibility: 'METADATA' },
          },
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    });
  });
});
