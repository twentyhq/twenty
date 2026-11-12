import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { uploadFileWithDirectUpload } from 'test/integration/graphql/utils/upload-file-with-direct-upload.util';
import { ONE_BY_ONE_TRANSPARENT_PNG } from 'test/integration/metadata/suites/file/utils/seed-workspace-logo.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { v4 } from 'uuid';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { type MessagingMessageCleanerService } from 'src/modules/messaging/message-cleaner/services/messaging-message-cleaner.service';

const WORKSPACE_SCHEMA_NAME = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

describe('message cleaner attachment files (e2e)', () => {
  const messageId = v4();
  const attachmentId = v4();
  const messageExternalId = `message-cleaner-attachment-${v4()}`;
  let messageChannelId: string;
  let fileId: string;

  const createRecord = async (
    objectMetadataSingularName: string,
    data: Record<string, unknown>,
  ) => {
    const response = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName,
        gqlFields: 'id',
        data,
      }),
    );

    expect(response.body.errors).toBeUndefined();
  };

  beforeAll(async () => {
    const [attachmentFileField] = await globalThis.testDataSource.query(
      `SELECT id FROM core."fieldMetadata"
         WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
      [
        SEED_APPLE_WORKSPACE_ID,
        STANDARD_OBJECTS.attachment.fields.file.universalIdentifier,
      ],
    );
    const file = await uploadFileWithDirectUpload({
      filename: 'photo.png',
      content: ONE_BY_ONE_TRANSPARENT_PNG,
      fileFolder: 'FilesField',
      fieldMetadataId: attachmentFileField.id,
    });

    fileId = file.id;

    const [messageChannel] = await globalThis.testDataSource.query(
      `SELECT id FROM core."messageChannel" WHERE "workspaceId" = $1 LIMIT 1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    messageChannelId = messageChannel.id;

    await createRecord('message', {
      id: messageId,
      subject: 'Message cleaner attachment',
      text: 'Message cleaner attachment body',
      receivedAt: new Date().toISOString(),
    });
    await globalThis.testDataSource.query(
      `INSERT INTO "${WORKSPACE_SCHEMA_NAME}"."messageChannelMessageAssociation"
         ("messageId", "messageChannelId", "messageExternalId")
         VALUES ($1, $2, $3)`,
      [messageId, messageChannelId, messageExternalId],
    );
    await createRecord('attachment', {
      id: attachmentId,
      name: 'photo.png',
      file: [{ fileId, label: 'photo.png' }],
      targetMessageId: messageId,
    });
  });

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM "${WORKSPACE_SCHEMA_NAME}"."messageChannelMessageAssociation" WHERE "messageExternalId" = $1`,
      [messageExternalId],
    );
    await globalThis.testDataSource.query(
      `DELETE FROM "${WORKSPACE_SCHEMA_NAME}"."message" WHERE id = $1`,
      [messageId],
    );
    await globalThis.testDataSource.query(
      `DELETE FROM core."file" WHERE id = $1`,
      [fileId],
    );
  });

  it('should delete the files of the attachments of the messages it removes', async () => {
    const messagingMessageCleanerService =
      getAppProviderByClassName<MessagingMessageCleanerService>(
        'MessagingMessageCleanerService',
      );

    await messagingMessageCleanerService.deleteMessagesChannelMessageAssociationsAndRelatedOrphans(
      {
        workspaceId: SEED_APPLE_WORKSPACE_ID,
        messageExternalIds: [messageExternalId],
        messageChannelId,
      },
    );
    await waitForAllJobsToFinish();

    const remainingAttachments = await globalThis.testDataSource.query(
      `SELECT id FROM "${WORKSPACE_SCHEMA_NAME}"."attachment" WHERE id = $1`,
      [attachmentId],
    );
    const liveFiles = await globalThis.testDataSource.query(
      `SELECT id FROM core."file" WHERE id = $1 AND "deletedAt" IS NULL`,
      [fileId],
    );

    expect(remainingAttachments).toEqual([]);
    expect(liveFiles).toEqual([]);
  });
});
