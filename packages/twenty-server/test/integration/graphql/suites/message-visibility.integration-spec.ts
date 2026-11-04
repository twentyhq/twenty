import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { uploadFileWithDirectUpload } from 'test/integration/graphql/utils/upload-file-with-direct-upload.util';
import { ONE_BY_ONE_TRANSPARENT_PNG } from 'test/integration/metadata/suites/file/utils/seed-workspace-logo.util';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const UNASSOCIATED_MESSAGE_ID = '20202020-ca1e-4000-8000-000000000101';
const UNASSOCIATED_MESSAGE_PARTICIPANT_ID =
  '20202020-ca1e-4000-8000-000000000102';

const MASKED_FIELDS = {
  subject: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
  text: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
  attachments: [],
};

const RESTRICTABLE_FIELDS = 'id subject text attachments { fileId }';

describe('message visibility restrictions (e2e)', () => {
  let attachmentFileId: string;

  beforeAll(async () => {
    const [attachmentsField] = await globalThis.testDataSource.query(
      `SELECT id FROM core."fieldMetadata"
         WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
      [
        SEED_APPLE_WORKSPACE_ID,
        STANDARD_OBJECTS.message.fields.attachments.universalIdentifier,
      ],
    );
    const attachmentFile = await uploadFileWithDirectUpload({
      filename: 'photo.png',
      content: ONE_BY_ONE_TRANSPARENT_PNG,
      fileFolder: 'FilesField',
      fieldMetadataId: attachmentsField.id,
    });

    attachmentFileId = attachmentFile.id;

    const messageResponse = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'message',
        gqlFields: 'id',
        data: {
          id: UNASSOCIATED_MESSAGE_ID,
          subject: 'Visibility test subject',
          text: 'Visibility test body',
          receivedAt: new Date().toISOString(),
          attachments: [{ fileId: attachmentFileId, label: 'photo.png' }],
        },
      }),
    );

    expect(messageResponse.body.errors).toBeUndefined();

    const [storedMessage] = await globalThis.testDataSource.query(
      `SELECT attachments FROM "${getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID)}"."message" WHERE id = $1`,
      [UNASSOCIATED_MESSAGE_ID],
    );

    expect(storedMessage.attachments).toEqual([
      expect.objectContaining({ fileId: attachmentFileId }),
    ]);

    const participantResponse = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'messageParticipant',
        gqlFields: 'id',
        data: {
          id: UNASSOCIATED_MESSAGE_PARTICIPANT_ID,
          messageId: UNASSOCIATED_MESSAGE_ID,
          role: 'FROM',
          handle: 'message-visibility@example.com',
        },
      }),
    );

    expect(participantResponse.body.errors).toBeUndefined();
  });

  afterAll(async () => {
    await makeGraphqlApiRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'messageParticipant',
        gqlFields: 'id',
        recordId: UNASSOCIATED_MESSAGE_PARTICIPANT_ID,
      }),
    );

    await makeGraphqlApiRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'message',
        gqlFields: 'id',
        recordId: UNASSOCIATED_MESSAGE_ID,
      }),
    );

    await globalThis.testDataSource.query(
      `DELETE FROM core."file" WHERE id = $1`,
      [attachmentFileId],
    );
  });

  it('should return a message without channel associations masked in findMany', async () => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'message',
        objectMetadataPluralName: 'messages',
        gqlFields: RESTRICTABLE_FIELDS,
        filter: { id: { eq: UNASSOCIATED_MESSAGE_ID } },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.messages.edges).toHaveLength(1);
    expect(response.body.data.messages.edges[0].node).toMatchObject(
      MASKED_FIELDS,
    );
  });

  it('should mask a message without channel associations fetched through a relation', async () => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'messageParticipant',
        objectMetadataPluralName: 'messageParticipants',
        gqlFields: `message { ${RESTRICTABLE_FIELDS} }`,
        filter: { id: { eq: UNASSOCIATED_MESSAGE_PARTICIPANT_ID } },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.messageParticipants.edges[0].node.message,
    ).toMatchObject(MASKED_FIELDS);
  });
});
