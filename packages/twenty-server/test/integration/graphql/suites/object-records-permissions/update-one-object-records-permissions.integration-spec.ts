import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { makeGraphqlAPIRequestWithGuestRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-guest-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

describe('updateOneObjectRecordsPermissions', () => {
  const personId = randomUUID();
  let messageId: string;
  let originalMessageText: string;

  beforeAll(async () => {
    const createPersonOperation = createOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      data: {
        id: personId,
        jobTitle: 'Software Engineer',
      },
    });

    await makeGraphqlAPIRequest(createPersonOperation);

    const findAllMessagesOperation = findOneOperationFactory({
      objectMetadataSingularName: 'message',
      gqlFields: `
        id
        text
      `,
      filter: {
        subject: {
          eq: 'Meeting Request',
        },
      },
    });

    const findAllMessagesResponse = await makeGraphqlAPIRequest(
      findAllMessagesOperation,
    );

    messageId = findAllMessagesResponse.body.data.message.id;
    originalMessageText = findAllMessagesResponse.body.data.message.text;
  });

  afterAll(async () => {
    const updateMessageOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'message',
      gqlFields: 'id',
      recordId: messageId,
      data: {
        text: originalMessageText,
      },
    });

    await makeGraphqlAPIRequest(updateMessageOperation);
  });

  it('should throw a permission error when user does not have permission (guest role)', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      recordId: personId,
      data: {
        jobTitle: 'Senior Software Engineer',
      },
    });

    const response = await makeGraphqlAPIRequestWithGuestRole(graphqlOperation);

    expect(response.body.data).toStrictEqual({ updatePerson: null });
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should allow to update a system object record even without update permission (guest role)', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'message',
      gqlFields: `
          id
          text
        `,
      recordId: messageId,
      data: {
        text: "Hello, I'm fine, thank you!",
      },
    });

    const response = await makeGraphqlAPIRequestWithGuestRole(graphqlOperation);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.updateMessage).toBeDefined();
    expect(response.body.data.updateMessage.id).toBe(messageId);
    expect(response.body.data.updateMessage.text).toBe(
      "Hello, I'm fine, thank you!",
    );
  });

  it('should update an object record when user has permission (admin role)', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      recordId: personId,
      data: {
        jobTitle: 'Senior Software Engineer',
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.updatePerson).toBeDefined();
    expect(response.body.data.updatePerson.id).toBe(personId);
    expect(response.body.data.updatePerson.jobTitle).toBe(
      'Senior Software Engineer',
    );
  });

  it('should update an object record when executed by api key', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      recordId: personId,
      data: {
        jobTitle: 'Senior Software Engineer',
      },
    });

    const response = await makeGraphqlAPIRequestWithApiKey(graphqlOperation);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.updatePerson).toBeDefined();
    expect(response.body.data.updatePerson.id).toBe(personId);
    expect(response.body.data.updatePerson.jobTitle).toBe(
      'Senior Software Engineer',
    );
  });
});
