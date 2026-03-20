import { randomUUID } from 'crypto';

import { gql } from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const JANE_USER_WORKSPACE_ID = '20202020-1e7c-43d9-a5db-685b5069d816';
const JONY_USER_WORKSPACE_ID = '20202020-3957-4908-9c36-2929a23f8353';

describe('messageFolderResolver (e2e)', () => {
  let janeAccountId: string;
  let jonyAccountId: string;
  let janeChannelId: string;
  let jonyChannelId: string;
  let janeFolderId: string;
  let jonyFolderId: string;

  beforeAll(async () => {
    janeAccountId = randomUUID();
    jonyAccountId = randomUUID();
    janeChannelId = randomUUID();
    jonyChannelId = randomUUID();
    janeFolderId = randomUUID();
    jonyFolderId = randomUUID();

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

    await testDataSource.query(
      `INSERT INTO core."messageFolder" (id, name, "isSynced", "isSentFolder", "messageChannelId", "workspaceId", "pendingSyncAction")
       VALUES ($1, 'INBOX', true, false, $2, $3, 'NONE'),
              ($4, 'INBOX', true, false, $5, $3, 'NONE')`,
      [janeFolderId, janeChannelId, WORKSPACE_ID, jonyFolderId, jonyChannelId],
    );
  });

  afterAll(async () => {
    await testDataSource
      .query('DELETE FROM core."messageFolder" WHERE id = ANY($1)', [
        [janeFolderId, jonyFolderId],
      ])
      .catch(() => {});
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

  describe('myMessageFolders', () => {
    it('should return only the current user message folders', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          query MyMessageFolders {
            myMessageFolders {
              id
              name
              isSynced
              messageChannelId
            }
          }
        `,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();

      const folders = response.body.data.myMessageFolders;
      const folderIds = folders.map((folder: { id: string }) => folder.id);

      expect(folderIds).toContain(janeFolderId);
      expect(folderIds).not.toContain(jonyFolderId);
    });

    it('should filter by messageChannelId', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          query MyMessageFolders($messageChannelId: UUID) {
            myMessageFolders(messageChannelId: $messageChannelId) {
              id
              name
            }
          }
        `,
        variables: { messageChannelId: janeChannelId },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();

      const folders = response.body.data.myMessageFolders;
      const folderIds = folders.map((folder: { id: string }) => folder.id);

      expect(folderIds).toContain(janeFolderId);
    });

    it('should deny filtering by another user messageChannelId', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          query MyMessageFolders($messageChannelId: UUID) {
            myMessageFolders(messageChannelId: $messageChannelId) {
              id
            }
          }
        `,
        variables: { messageChannelId: jonyChannelId },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    });

    it('should not expose hidden fields', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          query MyMessageFolders {
            myMessageFolders {
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

  describe('updateMessageFolder', () => {
    it('should allow updating own folder isSynced', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          mutation UpdateMessageFolder($input: UpdateMessageFolderInput!) {
            updateMessageFolder(input: $input) {
              id
              isSynced
            }
          }
        `,
        variables: {
          input: {
            id: janeFolderId,
            update: { isSynced: false },
          },
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateMessageFolder.isSynced).toBe(false);
    });

    it('should deny updating another user folder', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          mutation UpdateMessageFolder($input: UpdateMessageFolderInput!) {
            updateMessageFolder(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            id: jonyFolderId,
            update: { isSynced: false },
          },
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    });
  });
});
