import { randomUUID } from 'crypto';

import { gql } from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const JANE_USER_WORKSPACE_ID = '20202020-1e7c-43d9-a5db-685b5069d816';
const JONY_USER_WORKSPACE_ID = '20202020-3957-4908-9c36-2929a23f8353';

describe('calendarChannelResolver (e2e)', () => {
  let janeAccountId: string;
  let jonyAccountId: string;
  let janeCalendarChannelId: string;
  let jonyCalendarChannelId: string;

  beforeAll(async () => {
    janeAccountId = randomUUID();
    jonyAccountId = randomUUID();
    janeCalendarChannelId = randomUUID();
    jonyCalendarChannelId = randomUUID();

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
      `INSERT INTO core."calendarChannel" (id, handle, visibility, "syncStage", "isContactAutoCreationEnabled", "contactAutoCreationPolicy", "isSyncEnabled", "connectedAccountId", "workspaceId")
       VALUES ($1, 'jane@test.com', 'SHARE_EVERYTHING', 'CALENDAR_EVENT_LIST_FETCH_PENDING', false, 'NONE', true, $2, $3),
              ($4, 'jony@test.com', 'SHARE_EVERYTHING', 'CALENDAR_EVENT_LIST_FETCH_PENDING', false, 'NONE', true, $5, $3)`,
      [
        janeCalendarChannelId,
        janeAccountId,
        WORKSPACE_ID,
        jonyCalendarChannelId,
        jonyAccountId,
      ],
    );
  });

  afterAll(async () => {
    await testDataSource
      .query('DELETE FROM core."calendarChannel" WHERE id = ANY($1)', [
        [janeCalendarChannelId, jonyCalendarChannelId],
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

      expect(channelIds).toContain(janeCalendarChannelId);
      expect(channelIds).not.toContain(jonyCalendarChannelId);
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
        variables: { connectedAccountId: jonyAccountId },
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
            id: janeCalendarChannelId,
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
            id: jonyCalendarChannelId,
            update: { visibility: 'METADATA' },
          },
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    });
  });
});
