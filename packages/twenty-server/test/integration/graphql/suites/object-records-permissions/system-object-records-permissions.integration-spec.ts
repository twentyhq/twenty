import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { MESSAGE_GQL_FIELDS } from 'test/integration/constants/message-gql-fields.constants';
import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { generateApiKeyToken } from 'test/integration/graphql/utils/generate-api-key-token.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { isDefined } from 'twenty-shared/utils';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

type GraphqlResponse = {
  body: {
    data: Record<string, unknown> | null;
    errors?: { message: string; extensions: { code: string } }[];
  };
};

const expectPermissionDenied = (response: GraphqlResponse) => {
  expect(response.body.errors).toBeDefined();
  expect(response.body.errors?.[0].message).toBe(
    PermissionsExceptionMessage.PERMISSION_DENIED,
  );
  expect(response.body.errors?.[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
};

const createApiKeyForRole = async ({
  name,
  roleId,
}: {
  name: string;
  roleId: string;
}) => {
  const createApiKeyResponse = await makeMetadataAPIRequest({
    query: gql`
      mutation CreateApiKey($input: CreateApiKeyInput!) {
        createApiKey(input: $input) {
          id
        }
      }
    `,
    variables: {
      input: {
        name,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        roleId,
      },
    },
  });

  const apiKeyId: string | undefined =
    createApiKeyResponse.body.data?.createApiKey?.id;

  jestExpectToBeDefined(apiKeyId);

  const tokenResponse = await generateApiKeyToken({
    apiKeyId,
    accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
  });

  const token: string | undefined =
    tokenResponse.body.data?.generateApiKeyToken?.token;

  jestExpectToBeDefined(token);

  return { apiKeyId, token };
};

describe('systemObjectRecordsPermissions', () => {
  const messageId = randomUUID();
  const personId = randomUUID();

  let readOnlyRoleId: string | undefined;
  let readOnlyApiKeyId: string | undefined;
  let readOnlyApiKeyToken: string;

  let noOverrideRoleId: string | undefined;
  let noOverrideApiKeyId: string | undefined;
  let noOverrideApiKeyToken: string;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: 'id nameSingular',
    });

    const messageObjectMetadataId = objects.find(
      (objectMetadata) => objectMetadata.nameSingular === 'message',
    )?.id;
    const messageThreadObjectMetadataId = objects.find(
      (objectMetadata) => objectMetadata.nameSingular === 'messageThread',
    )?.id;

    jestExpectToBeDefined(messageObjectMetadataId);
    jestExpectToBeDefined(messageThreadObjectMetadataId);

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'message',
        gqlFields: MESSAGE_GQL_FIELDS,
        data: {
          id: messageId,
          subject: 'System object permissions',
          text: 'Original text',
        },
      }),
    );

    await makeGraphqlAPIRequest(
      createOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: PERSON_GQL_FIELDS,
        data: { id: personId, jobTitle: 'Software Engineer' },
      }),
    );

    const { data: readOnlyRoleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Message read-only role',
        description: 'API key role overriding messaging objects to read-only',
        icon: 'IconKey',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: true,
        canDestroyAllObjectRecords: true,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: true,
      },
    });

    readOnlyRoleId = readOnlyRoleData?.createOneRole?.id;
    jestExpectToBeDefined(readOnlyRoleId);

    await upsertObjectPermissions({
      expectToFail: false,
      input: {
        roleId: readOnlyRoleId,
        objectPermissions: [
          messageObjectMetadataId,
          messageThreadObjectMetadataId,
        ].map((objectMetadataId) => ({
          objectMetadataId,
          canReadObjectRecords: true,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
        })),
      },
    });

    ({ apiKeyId: readOnlyApiKeyId, token: readOnlyApiKeyToken } =
      await createApiKeyForRole({
        name: 'Message read-only key',
        roleId: readOnlyRoleId,
      }));

    const { data: noOverrideRoleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'No write permissions role',
        description: 'API key role with no override on system objects',
        icon: 'IconKey',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: true,
      },
    });

    noOverrideRoleId = noOverrideRoleData?.createOneRole?.id;
    jestExpectToBeDefined(noOverrideRoleId);

    ({ apiKeyId: noOverrideApiKeyId, token: noOverrideApiKeyToken } =
      await createApiKeyForRole({
        name: 'No write permissions key',
        roleId: noOverrideRoleId,
      }));
  });

  afterAll(async () => {
    await deleteRecordsByIds('message', [messageId]);
    await deleteRecordsByIds('person', [personId]);

    for (const apiKeyId of [readOnlyApiKeyId, noOverrideApiKeyId]) {
      if (isDefined(apiKeyId)) {
        await global.testDataSource.query(
          'DELETE FROM core."apiKey" WHERE id = $1',
          [apiKeyId],
        );
      }
    }

    for (const roleId of [readOnlyRoleId, noOverrideRoleId]) {
      if (isDefined(roleId)) {
        await deleteOneRole({
          expectToFail: false,
          input: { idToDelete: roleId },
        });
      }
    }
  });

  describe('API key whose role overrides message to read-only', () => {
    it('should allow reading messages', async () => {
      const response = await makeGraphqlAPIRequest(
        findOneOperationFactory({
          objectMetadataSingularName: 'message',
          gqlFields: MESSAGE_GQL_FIELDS,
          filter: { subject: { eq: 'Meeting Request' } },
        }),
        readOnlyApiKeyToken,
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.message.subject).toBe('Meeting Request');
    });

    it('should deny updating a message', async () => {
      const response = await makeGraphqlAPIRequest(
        updateOneOperationFactory({
          objectMetadataSingularName: 'message',
          gqlFields: MESSAGE_GQL_FIELDS,
          recordId: messageId,
          data: { text: 'Updated by a read-only key' },
        }),
        readOnlyApiKeyToken,
      );

      expectPermissionDenied(response);
    });

    it('should deny soft-deleting a message', async () => {
      const response = await makeGraphqlAPIRequest(
        deleteOneOperationFactory({
          objectMetadataSingularName: 'message',
          gqlFields: 'id',
          recordId: messageId,
        }),
        readOnlyApiKeyToken,
      );

      expectPermissionDenied(response);
    });

    it('should deny destroying a message', async () => {
      const response = await makeGraphqlAPIRequest(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'message',
          gqlFields: 'id',
          recordId: messageId,
        }),
        readOnlyApiKeyToken,
      );

      expectPermissionDenied(response);
    });

    it('should deny creating a message thread', async () => {
      const response = await makeGraphqlAPIRequest(
        createOneOperationFactory({
          objectMetadataSingularName: 'messageThread',
          gqlFields: 'id',
          data: { id: randomUUID() },
        }),
        readOnlyApiKeyToken,
      );

      expectPermissionDenied(response);
    });
  });

  describe('API key whose role has no override on message', () => {
    it('should allow updating a message through the system object default', async () => {
      const response = await makeGraphqlAPIRequest(
        updateOneOperationFactory({
          objectMetadataSingularName: 'message',
          gqlFields: MESSAGE_GQL_FIELDS,
          recordId: messageId,
          data: { text: 'Updated through the system object default' },
        }),
        noOverrideApiKeyToken,
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateMessage.text).toBe(
        'Updated through the system object default',
      );
    });

    it('should deny updating a standard object', async () => {
      const response = await makeGraphqlAPIRequest(
        updateOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          recordId: personId,
          data: { jobTitle: 'Senior Software Engineer' },
        }),
        noOverrideApiKeyToken,
      );

      expectPermissionDenied(response);
    });
  });
});
