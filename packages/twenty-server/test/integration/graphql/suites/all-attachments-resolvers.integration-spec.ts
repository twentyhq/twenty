import { TIM_ACCOUNT_ID } from 'test/integration/graphql/integration.constants';
import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteManyOperationFactory } from 'test/integration/graphql/utils/delete-many-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyManyOperationFactory } from 'test/integration/graphql/utils/destroy-many-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateManyOperationFactory } from 'test/integration/graphql/utils/update-many-operation-factory.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { generateRecordName } from 'test/integration/utils/generate-record-name';

const ATTACHMENT_1_ID = '777a8457-eb2d-40ac-a707-551b615b6987';
const ATTACHMENT_2_ID = '777a8457-eb2d-40ac-a707-551b615b6988';
const ATTACHMENT_3_ID = '777a8457-eb2d-40ac-a707-551b615b6989';

const ATTACHMENT_GQL_FIELDS = `
  id
  name
  fullPath
  type
  createdAt
  updatedAt
  deletedAt
  authorId
  activityId
  taskId
  noteId
  personId
  companyId
  opportunityId
`;

describe('attachments resolvers (integration)', () => {
  it('1. should create and return multiple attachments', async () => {
    const attachmentName1 = generateRecordName(ATTACHMENT_1_ID);
    const attachmentName2 = generateRecordName(ATTACHMENT_2_ID);

    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'attachment',
      objectMetadataPluralName: 'attachments',
      gqlFields: ATTACHMENT_GQL_FIELDS,
      data: [
        {
          id: ATTACHMENT_1_ID,
          name: attachmentName1,
          authorId: TIM_ACCOUNT_ID,
        },
        {
          id: ATTACHMENT_2_ID,
          name: attachmentName2,
          authorId: TIM_ACCOUNT_ID,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.createAttachments).toHaveLength(2);

    response.body.data.createAttachments.forEach((attachment) => {
      expect(attachment).toHaveProperty('name');
      expect([attachmentName1, attachmentName2]).toContain(attachment.name);
      expect(attachment).toHaveProperty('fullPath');
      expect(attachment).toHaveProperty('type');
      expect(attachment).toHaveProperty('id');
      expect(attachment).toHaveProperty('createdAt');
      expect(attachment).toHaveProperty('updatedAt');
      expect(attachment).toHaveProperty('deletedAt');
      expect(attachment).toHaveProperty('authorId');
      expect(attachment).toHaveProperty('activityId');
      expect(attachment).toHaveProperty('taskId');
      expect(attachment).toHaveProperty('noteId');
      expect(attachment).toHaveProperty('personId');
      expect(attachment).toHaveProperty('companyId');
      expect(attachment).toHaveProperty('opportunityId');
    });
  });

  it('2. should create and return one attachment', async () => {
    const attachmentName = generateRecordName(ATTACHMENT_3_ID);

    const graphqlOperation = createOneOperationFactory({
      objectMetadataSingularName: 'attachment',
      gqlFields: ATTACHMENT_GQL_FIELDS,
      data: {
        id: ATTACHMENT_3_ID,
        name: attachmentName,
        authorId: TIM_ACCOUNT_ID,
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const createdAttachment = response.body.data.createAttachment;

    expect(createdAttachment).toHaveProperty('name', attachmentName);
    expect(createdAttachment).toHaveProperty('fullPath');
    expect(createdAttachment).toHaveProperty('type');
    expect(createdAttachment).toHaveProperty('id');
    expect(createdAttachment).toHaveProperty('createdAt');
    expect(createdAttachment).toHaveProperty('updatedAt');
    expect(createdAttachment).toHaveProperty('deletedAt');
    expect(createdAttachment).toHaveProperty('authorId');
    expect(createdAttachment).toHaveProperty('activityId');
    expect(createdAttachment).toHaveProperty('taskId');
    expect(createdAttachment).toHaveProperty('noteId');
    expect(createdAttachment).toHaveProperty('personId');
    expect(createdAttachment).toHaveProperty('companyId');
    expect(createdAttachment).toHaveProperty('opportunityId');
  });

  it('2. should find many attachments', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'attachment',
      objectMetadataPluralName: 'attachments',
      gqlFields: ATTACHMENT_GQL_FIELDS,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const data = response.body.data.attachments;

    expect(data).toBeDefined();
    expect(Array.isArray(data.edges)).toBe(true);

    if (data.edges.length > 0) {
      const attachments = data.edges[0].node;

      expect(attachments).toHaveProperty('name');
      expect(attachments).toHaveProperty('fullPath');
      expect(attachments).toHaveProperty('type');
      expect(attachments).toHaveProperty('id');
      expect(attachments).toHaveProperty('createdAt');
      expect(attachments).toHaveProperty('updatedAt');
      expect(attachments).toHaveProperty('deletedAt');
      expect(attachments).toHaveProperty('authorId');
      expect(attachments).toHaveProperty('activityId');
      expect(attachments).toHaveProperty('taskId');
      expect(attachments).toHaveProperty('noteId');
      expect(attachments).toHaveProperty('personId');
      expect(attachments).toHaveProperty('companyId');
      expect(attachments).toHaveProperty('opportunityId');
    }
  });

  it('2b. should find one attachment', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'attachment',
      gqlFields: ATTACHMENT_GQL_FIELDS,
      filter: {
        id: {
          eq: ATTACHMENT_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const attachment = response.body.data.attachment;

    expect(attachment).toHaveProperty('name');
    expect(attachment).toHaveProperty('fullPath');
    expect(attachment).toHaveProperty('type');
    expect(attachment).toHaveProperty('id');
    expect(attachment).toHaveProperty('createdAt');
    expect(attachment).toHaveProperty('updatedAt');
    expect(attachment).toHaveProperty('deletedAt');
    expect(attachment).toHaveProperty('authorId');
    expect(attachment).toHaveProperty('activityId');
    expect(attachment).toHaveProperty('taskId');
    expect(attachment).toHaveProperty('noteId');
    expect(attachment).toHaveProperty('personId');
    expect(attachment).toHaveProperty('companyId');
    expect(attachment).toHaveProperty('opportunityId');
  });

  it('3. should update many attachments', async () => {
    const graphqlOperation = updateManyOperationFactory({
      objectMetadataSingularName: 'attachment',
      objectMetadataPluralName: 'attachments',
      gqlFields: ATTACHMENT_GQL_FIELDS,
      data: {
        name: 'Updated Name',
      },
      filter: {
        id: {
          in: [ATTACHMENT_1_ID, ATTACHMENT_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedAttachments = response.body.data.updateAttachments;

    expect(updatedAttachments).toHaveLength(2);

    updatedAttachments.forEach((attachment) => {
      expect(attachment.name).toEqual('Updated Name');
    });
  });

  it('3b. should update one attachment', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'attachment',
      gqlFields: ATTACHMENT_GQL_FIELDS,
      data: {
        name: 'New Name',
      },
      recordId: ATTACHMENT_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const updatedAttachment = response.body.data.updateAttachment;

    expect(updatedAttachment.name).toEqual('New Name');
  });

  it('4. should find many attachments with updated name', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'attachment',
      objectMetadataPluralName: 'attachments',
      gqlFields: ATTACHMENT_GQL_FIELDS,
      filter: {
        name: {
          eq: 'Updated Name',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.attachments.edges).toHaveLength(2);
  });

  it('4b. should find one attachment with updated name', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'attachment',
      gqlFields: ATTACHMENT_GQL_FIELDS,
      filter: {
        name: {
          eq: 'New Name',
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.attachment.name).toEqual('New Name');
  });

  it('5. should delete many attachments', async () => {
    const graphqlOperation = deleteManyOperationFactory({
      objectMetadataSingularName: 'attachment',
      objectMetadataPluralName: 'attachments',
      gqlFields: ATTACHMENT_GQL_FIELDS,
      filter: {
        id: {
          in: [ATTACHMENT_1_ID, ATTACHMENT_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    const deletedAttachments = response.body.data.deleteAttachments;

    expect(deletedAttachments).toHaveLength(2);

    deletedAttachments.forEach((attachment) => {
      expect(attachment.deletedAt).toBeTruthy();
    });
  });

  it('5b. should delete one attachment', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'attachment',
      gqlFields: ATTACHMENT_GQL_FIELDS,
      recordId: ATTACHMENT_3_ID,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.deleteAttachment.deletedAt).toBeTruthy();
  });

  it('6. should not find many attachments anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'attachment',
      objectMetadataPluralName: 'attachments',
      gqlFields: ATTACHMENT_GQL_FIELDS,
      filter: {
        id: {
          in: [ATTACHMENT_1_ID, ATTACHMENT_2_ID],
        },
      },
    });

    const findAttachmentsResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(findAttachmentsResponse.body.data.attachments.edges).toHaveLength(0);
  });

  it('6b. should not find one attachment anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'attachment',
      gqlFields: ATTACHMENT_GQL_FIELDS,
      filter: {
        id: {
          eq: ATTACHMENT_3_ID,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.attachment).toBeNull();
  });

  it('7. should find many deleted attachments with deletedAt filter', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'attachment',
      objectMetadataPluralName: 'attachments',
      gqlFields: ATTACHMENT_GQL_FIELDS,
      filter: {
        id: {
          in: [ATTACHMENT_1_ID, ATTACHMENT_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.attachments.edges).toHaveLength(2);
  });

  it('7b. should find one deleted attachment with deletedAt filter', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'attachment',
      gqlFields: ATTACHMENT_GQL_FIELDS,
      filter: {
        id: {
          eq: ATTACHMENT_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.attachment.id).toEqual(ATTACHMENT_3_ID);
  });

  it('8. should destroy many attachments', async () => {
    const graphqlOperation = destroyManyOperationFactory({
      objectMetadataSingularName: 'attachment',
      objectMetadataPluralName: 'attachments',
      gqlFields: ATTACHMENT_GQL_FIELDS,
      filter: {
        id: {
          in: [ATTACHMENT_1_ID, ATTACHMENT_2_ID],
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.destroyAttachments).toHaveLength(2);
  });

  it('8b. should destroy one attachment', async () => {
    const graphqlOperation = destroyOneOperationFactory({
      objectMetadataSingularName: 'attachment',
      gqlFields: ATTACHMENT_GQL_FIELDS,
      recordId: ATTACHMENT_3_ID,
    });

    const destroyAttachmentResponse =
      await makeGraphqlAPIRequest(graphqlOperation);

    expect(destroyAttachmentResponse.body.data.destroyAttachment).toBeTruthy();
  });

  it('9. should not find many attachments anymore', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'attachment',
      objectMetadataPluralName: 'attachments',
      gqlFields: ATTACHMENT_GQL_FIELDS,
      filter: {
        id: {
          in: [ATTACHMENT_1_ID, ATTACHMENT_2_ID],
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.attachments.edges).toHaveLength(0);
  });

  it('9b. should not find one attachment anymore', async () => {
    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'attachment',
      gqlFields: ATTACHMENT_GQL_FIELDS,
      filter: {
        id: {
          eq: ATTACHMENT_3_ID,
        },
        not: {
          deletedAt: {
            is: 'NULL',
          },
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data.attachment).toBeNull();
  });
});
