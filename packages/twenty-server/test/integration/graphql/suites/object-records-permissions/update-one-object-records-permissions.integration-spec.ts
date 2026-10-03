import { randomUUID } from 'node:crypto';

import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlApiRequestWithApiKey } from 'test/integration/graphql/utils/make-graphql-api-request-with-api-key.util';
import { makeGraphqlApiRequestWithGuestRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-guest-role.util';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { setManualRecordShare } from 'test/integration/utils/set-manual-record-share.util';
import { EVERYONE_PRINCIPAL_ID } from 'twenty-shared/constants';
import {
  RecordShareAccessLevel,
  RecordSharePrincipalType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

describe('updateOneObjectRecordsPermissions', () => {
  const personId = randomUUID();
  let messageId: string;
  let originalMessageText: string;
  let messageThreadShare:
    | Parameters<typeof setManualRecordShare>[0]['share']
    | undefined;

  beforeAll(async () => {
    const createPersonOperation = createOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: PERSON_GQL_FIELDS,
      data: {
        id: personId,
        jobTitle: 'Software Engineer',
      },
    });

    await makeGraphqlApiRequest(createPersonOperation);

    const findAllMessagesOperation = findOneOperationFactory({
      objectMetadataSingularName: 'message',
      gqlFields: `
        id
        text
        messageThreadId
      `,
      filter: {
        subject: {
          eq: 'Meeting Request',
        },
      },
    });

    const findAllMessagesResponse = await makeGraphqlApiRequest(
      findAllMessagesOperation,
    );

    messageId = findAllMessagesResponse.body.data.message.id;
    originalMessageText = findAllMessagesResponse.body.data.message.text;

    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: 'id nameSingular',
    });
    const messageThreadObjectMetadataId = objects.find(
      (objectMetadata) => objectMetadata.nameSingular === 'messageThread',
    )?.id;

    if (!isDefined(messageThreadObjectMetadataId)) {
      throw new Error('messageThread object metadata not found');
    }

    // Channels only share threads for reading, so the guest needs the thread
    // shared for editing to update its messages.
    messageThreadShare = {
      objectMetadataId: messageThreadObjectMetadataId,
      recordId: findAllMessagesResponse.body.data.message.messageThreadId,
      sourceId: messageId,
      principalId: EVERYONE_PRINCIPAL_ID,
      principalType: RecordSharePrincipalType.EVERYONE,
      accessLevel: RecordShareAccessLevel.READ_WRITE,
    };

    await setManualRecordShare({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      share: messageThreadShare,
      enabled: true,
    });
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

    // Restoring the text needs the write grant, so it is revoked afterwards
    // whatever the restore outcome.
    try {
      await makeGraphqlApiRequest(updateMessageOperation);
    } finally {
      if (isDefined(messageThreadShare)) {
        await setManualRecordShare({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          share: messageThreadShare,
          enabled: false,
        });
      }
    }
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

    const response = await makeGraphqlApiRequestWithGuestRole(graphqlOperation);

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

    const response = await makeGraphqlApiRequestWithGuestRole(graphqlOperation);

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

    const response = await makeGraphqlApiRequest(graphqlOperation);

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

    const response = await makeGraphqlApiRequestWithApiKey(graphqlOperation);

    expect(response.body.data).toBeDefined();
    expect(response.body.data.updatePerson).toBeDefined();
    expect(response.body.data.updatePerson.id).toBe(personId);
    expect(response.body.data.updatePerson.jobTitle).toBe(
      'Senior Software Engineer',
    );
  });
});
