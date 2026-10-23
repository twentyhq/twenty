import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED } from 'twenty-shared/constants';

const UNASSOCIATED_MESSAGE_ID = '20202020-ca1e-4000-8000-000000000101';
const UNASSOCIATED_MESSAGE_PARTICIPANT_ID =
  '20202020-ca1e-4000-8000-000000000102';

const MASKED_FIELDS = {
  subject: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
  text: FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED,
};

describe('message visibility restrictions (e2e)', () => {
  beforeAll(async () => {
    const messageResponse = await makeGraphqlApiRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'message',
        gqlFields: 'id',
        data: {
          id: UNASSOCIATED_MESSAGE_ID,
          subject: 'Visibility test subject',
          text: 'Visibility test body',
          receivedAt: new Date().toISOString(),
        },
      }),
    );

    expect(messageResponse.body.errors).toBeUndefined();

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
  });

  it('should return a message without channel associations masked in findMany', async () => {
    const response = await makeGraphqlApiRequest(
      findManyOperationFactory({
        objectMetadataSingularName: 'message',
        objectMetadataPluralName: 'messages',
        gqlFields: 'id subject text',
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
        gqlFields: 'message { id subject text }',
        filter: { id: { eq: UNASSOCIATED_MESSAGE_PARTICIPANT_ID } },
      }),
    );

    expect(response.body.errors).toBeUndefined();
    expect(
      response.body.data.messageParticipants.edges[0].node.message,
    ).toMatchObject(MASKED_FIELDS);
  });
});
