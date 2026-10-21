import { gql } from 'graphql-tag';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { CALENDAR_CHANNEL_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/constants/calendar-channel-seed-ids.constant';
import { CONNECTED_ACCOUNT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/connected-account-data-seeds.constant';

describe('calendarChannelResolver (e2e)', () => {
  describe('myCalendarChannels', () => {
    it('should return only the current user calendar channels', async () => {
      const response = await makeMetadataApiRequest({
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
      const response = await makeMetadataApiRequest({
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
      const response = await makeMetadataApiRequest({
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
      const response = await makeMetadataApiRequest({
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

    it('should restart a full sync when private events exclusion changes', async () => {
      try {
        await global.testDataSource.query(
          `UPDATE core."calendarChannel" SET "syncCursor" = 'previous-cursor', "syncStage" = 'CALENDAR_EVENT_LIST_FETCH_PENDING' WHERE id = $1`,
          [CALENDAR_CHANNEL_DATA_SEED_IDS.JANE],
        );

        const response = await makeMetadataApiRequest({
          query: gql`
            mutation UpdateCalendarChannel(
              $input: UpdateCalendarChannelInput!
            ) {
              updateCalendarChannel(input: $input) {
                id
                excludePrivateEvents
              }
            }
          `,
          variables: {
            input: {
              id: CALENDAR_CHANNEL_DATA_SEED_IDS.JANE,
              update: { excludePrivateEvents: true },
            },
          },
        });

        expect(response.body.errors).toBeUndefined();
        expect(
          response.body.data.updateCalendarChannel.excludePrivateEvents,
        ).toBe(true);

        const [calendarChannel] = await global.testDataSource.query(
          `SELECT "syncCursor" FROM core."calendarChannel" WHERE id = $1`,
          [CALENDAR_CHANNEL_DATA_SEED_IDS.JANE],
        );

        expect(calendarChannel.syncCursor).toBe('');
      } finally {
        await global.testDataSource.query(
          `UPDATE core."calendarChannel" SET "excludePrivateEvents" = false, "syncCursor" = NULL, "syncStage" = 'CALENDAR_EVENT_LIST_FETCH_PENDING' WHERE id = $1`,
          [CALENDAR_CHANNEL_DATA_SEED_IDS.JANE],
        );
      }
    });

    it('should not restart a sync when private events exclusion changes during configuration', async () => {
      try {
        await global.testDataSource.query(
          `UPDATE core."calendarChannel" SET "syncCursor" = 'previous-cursor', "syncStage" = 'PENDING_CONFIGURATION' WHERE id = $1`,
          [CALENDAR_CHANNEL_DATA_SEED_IDS.JANE],
        );

        const response = await makeMetadataApiRequest({
          query: gql`
            mutation UpdateCalendarChannel(
              $input: UpdateCalendarChannelInput!
            ) {
              updateCalendarChannel(input: $input) {
                id
              }
            }
          `,
          variables: {
            input: {
              id: CALENDAR_CHANNEL_DATA_SEED_IDS.JANE,
              update: { excludePrivateEvents: true },
            },
          },
        });

        expect(response.body.errors).toBeUndefined();

        const [calendarChannel] = await global.testDataSource.query(
          `SELECT "syncCursor", "syncStage" FROM core."calendarChannel" WHERE id = $1`,
          [CALENDAR_CHANNEL_DATA_SEED_IDS.JANE],
        );

        expect(calendarChannel.syncCursor).toBe('previous-cursor');
        expect(calendarChannel.syncStage).toBe('PENDING_CONFIGURATION');
      } finally {
        await global.testDataSource.query(
          `UPDATE core."calendarChannel" SET "excludePrivateEvents" = false, "syncCursor" = NULL, "syncStage" = 'CALENDAR_EVENT_LIST_FETCH_PENDING' WHERE id = $1`,
          [CALENDAR_CHANNEL_DATA_SEED_IDS.JANE],
        );
      }
    });
  });
});
