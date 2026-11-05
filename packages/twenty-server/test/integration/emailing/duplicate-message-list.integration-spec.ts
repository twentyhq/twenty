import gql from 'graphql-tag';
import request from 'supertest';
import { createManyOperation } from 'test/integration/graphql/utils/create-many-operation.util';
import { generateApiKeyToken } from 'test/integration/graphql/utils/generate-api-key-token.util';
import { updateWorkspaceMemberRole } from 'test/integration/graphql/utils/update-workspace-member-role.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { deleteRecordsByIds } from 'test/integration/utils/delete-records-by-ids';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { FieldActorSource } from 'twenty-shared/types';
import { v4 } from 'uuid';

import { PermissionsExceptionMessage } from 'src/engine/permissions/permissions.exception';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

const duplicateMessageList = ({ id, token }: { id: string; token?: string }) =>
  makeMetadataApiRequest(
    {
      query: gql`
        mutation DuplicateMessageList($id: UUID!) {
          duplicateMessageList(id: $id) {
            id
            name
            memberCount
          }
        }
      `,
      variables: { id },
    },
    token,
  );

const createRecord = async ({
  objectMetadataSingularName,
  objectMetadataPluralName,
  data,
}: {
  objectMetadataSingularName: string;
  objectMetadataPluralName: string;
  data: Record<string, unknown>;
}) => {
  const result = await createManyOperation({
    objectMetadataSingularName,
    objectMetadataPluralName,
    data: [data],
  });

  expect(result.errors).toBeUndefined();

  const id: string = result.data.createdRecords[0].id;

  return id;
};

describe('duplicateMessageList', () => {
  const messageListName = `Duplicated ${v4()}`;
  const duplicatedMessageListIds: string[] = [];

  let messageListId: string;
  let messageListMemberId: string;
  let personId: string;
  let originalJonyRoleId: string;
  let restrictedRoleId: string;
  let apiKeyId: string;
  let apiKeyToken: string;

  beforeAll(async () => {
    personId = await createRecord({
      objectMetadataSingularName: 'person',
      objectMetadataPluralName: 'people',
      data: {
        name: { firstName: 'Duplicated', lastName: v4() },
        createdBy: { source: FieldActorSource.EMAIL },
      },
    });
    messageListId = await createRecord({
      objectMetadataSingularName: 'messageList',
      objectMetadataPluralName: 'messageLists',
      data: { name: messageListName },
    });
    messageListMemberId = await createRecord({
      objectMetadataSingularName: 'messageListMember',
      objectMetadataPluralName: 'messageListMembers',
      data: { listId: messageListId, personId },
    });

    const rolesResponse = await makeMetadataApiRequest({
      query: gql`
        query GetRoles {
          getRoles {
            id
            label
          }
        }
      `,
    });
    const memberRole = rolesResponse.body.data.getRoles.find(
      ({ label }: { label: string }) => label === 'Member',
    );

    originalJonyRoleId = memberRole.id;

    const { objects } = await findManyObjectMetadata({
      expectToFail: false,
      input: { filter: {}, paging: { first: 1000 } },
      gqlFields: 'id nameSingular',
    });
    const messageListObjectMetadataId = objects.find(
      ({ nameSingular }) => nameSingular === 'messageList',
    )?.id;

    jestExpectToBeDefined(messageListObjectMetadataId);

    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: `Message list read-only ${v4()}`,
        description: 'Reads message lists without updating them',
        icon: 'IconKey',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: true,
        canDestroyAllObjectRecords: true,
        canBeAssignedToUsers: true,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: true,
      },
    });

    jestExpectToBeDefined(roleData?.createOneRole?.id);
    restrictedRoleId = roleData.createOneRole.id;

    await upsertObjectPermissions({
      expectToFail: false,
      input: {
        roleId: restrictedRoleId,
        objectPermissions: [
          {
            objectMetadataId: messageListObjectMetadataId,
            canReadObjectRecords: true,
            canUpdateObjectRecords: false,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          },
        ],
      },
      gqlFields: 'objectMetadataId',
    });

    const apiKeyResponse = await makeMetadataApiRequest({
      query: gql`
        mutation CreateApiKey($input: CreateApiKeyInput!) {
          createApiKey(input: $input) {
            id
          }
        }
      `,
      variables: {
        input: {
          name: `Duplicate message list ${v4()}`,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          roleId: restrictedRoleId,
        },
      },
    });

    apiKeyId = apiKeyResponse.body.data.createApiKey.id;

    const tokenResponse = await generateApiKeyToken({
      apiKeyId,
      accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    apiKeyToken = tokenResponse.body.data.generateApiKeyToken.token;
  });

  afterEach(async () => {
    await updateWorkspaceMemberRole({
      client,
      roleId: originalJonyRoleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });
  });

  afterAll(async () => {
    await deleteRecordsByIds('messageListMember', [messageListMemberId]);
    await global.testDataSource.query(
      `DELETE from "workspace_1wgvd1injqtife6y4rvfbu3h5"."messageListMember" WHERE "listId" = ANY($1)`,
      [duplicatedMessageListIds],
    );
    await deleteRecordsByIds('messageList', [
      messageListId,
      ...duplicatedMessageListIds,
    ]);
    await deleteRecordsByIds('person', [personId]);
    await global.testDataSource.query(
      `DELETE from "core"."apiKey" WHERE id = $1`,
      [apiKeyId],
    );
    await deleteOneRole({
      expectToFail: false,
      input: { idToDelete: restrictedRoleId },
    });
  });

  it('should copy the list and its members for a role that can read and update them', async () => {
    const response = await duplicateMessageList({ id: messageListId });

    expect(response.body.errors).toBeUndefined();

    const duplicated = response.body.data.duplicateMessageList;

    duplicatedMessageListIds.push(duplicated.id);

    expect(duplicated.id).not.toBe(messageListId);
    expect(duplicated.name).toContain(messageListName);
    expect(duplicated.memberCount).toBe(1);
  });

  it('should deny a user whose role cannot update message lists', async () => {
    await updateWorkspaceMemberRole({
      client,
      roleId: restrictedRoleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

    const response = await duplicateMessageList({
      id: messageListId,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(response.body.errors?.[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
  });

  it('should reject a token that is not bound to a user workspace', async () => {
    const response = await duplicateMessageList({
      id: messageListId,
      token: apiKeyToken,
    });

    expect(response.body.errors?.[0].message).toContain(
      'requires a token bound to a user workspace',
    );
  });
});
