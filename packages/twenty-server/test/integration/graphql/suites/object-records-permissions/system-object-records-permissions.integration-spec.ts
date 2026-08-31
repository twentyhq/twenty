import { randomUUID } from 'node:crypto';

import gql from 'graphql-tag';
import { default as request } from 'supertest';
import { MESSAGE_GQL_FIELDS } from 'test/integration/constants/message-gql-fields.constants';
import { PERSON_GQL_FIELDS } from 'test/integration/constants/person-gql-fields.constants';
import { createRoleOperation } from 'test/integration/graphql/utils/create-custom-role-operation-factory.util';
import { createOneOperationFactory } from 'test/integration/graphql/utils/create-one-operation-factory.util';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { deleteRole } from 'test/integration/graphql/utils/delete-one-role.util';
import { destroyOneOperationFactory } from 'test/integration/graphql/utils/destroy-one-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { updateWorkspaceMemberRole } from 'test/integration/graphql/utils/update-workspace-member-role.util';
import { createUpsertObjectPermissionsOperation } from 'test/integration/graphql/utils/upsert-object-permission-operation-factory.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

type GraphqlResponse = {
  body: {
    errors: { message: string; extensions: { code: string } }[];
  };
};

describe('systemObjectRecordsPermissions', () => {
  const messageId = randomUUID();
  const personId = randomUUID();

  let originalMemberRoleId: string;
  let messageObjectId: string;
  let customRoleId: string | undefined;

  const createCustomRole = async ({
    label,
    canUpdateAllObjectRecords = true,
    canSoftDeleteAllObjectRecords = true,
    canDestroyAllObjectRecords = true,
  }: {
    label: string;
    canUpdateAllObjectRecords?: boolean;
    canSoftDeleteAllObjectRecords?: boolean;
    canDestroyAllObjectRecords?: boolean;
  }) => {
    const response = await makeMetadataAPIRequest(
      createRoleOperation({
        label,
        description: 'Role asserting permissions on system objects',
        canUpdateAllSettings: false,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords,
        canSoftDeleteAllObjectRecords,
        canDestroyAllObjectRecords,
      }),
    );

    expect(response.body.errors).toBeUndefined();

    const roleId: string = response.body.data.createOneRole.id;

    customRoleId = roleId;

    return roleId;
  };

  const assignRoleToMember = async (roleId: string) =>
    updateWorkspaceMemberRole({
      client,
      roleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

  const expectPermissionDenied = (response: GraphqlResponse) => {
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  };

  beforeAll(async () => {
    const rolesResponse = await makeMetadataAPIRequest({
      query: gql`
        query GetRoles {
          getRoles {
            id
            label
          }
        }
      `,
    });

    originalMemberRoleId = rolesResponse.body.data.getRoles.find(
      (role: { label: string }) => role.label === 'Member',
    ).id;

    const objectMetadataResponse = await makeMetadataAPIRequest({
      query: gql`
        query {
          objects(paging: { first: 1000 }) {
            edges {
              node {
                id
                nameSingular
              }
            }
          }
        }
      `,
    });

    const objects = objectMetadataResponse.body.data.objects.edges;

    messageObjectId = objects.find(
      (object: { node: { nameSingular: string } }) =>
        object.node.nameSingular === 'message',
    )?.node.id;

    expect(messageObjectId).toBeDefined();

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
  });

  afterEach(async () => {
    if (customRoleId !== undefined) {
      await deleteRole(client, customRoleId);
      customRoleId = undefined;
    }

    await assignRoleToMember(originalMemberRoleId);
  });

  afterAll(async () => {
    await makeGraphqlAPIRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'message',
        gqlFields: 'id',
        recordId: messageId,
      }),
    );

    await makeGraphqlAPIRequest(
      destroyOneOperationFactory({
        objectMetadataSingularName: 'person',
        gqlFields: 'id',
        recordId: personId,
      }),
    );
  });

  describe('when the role overrides a system object to read-only', () => {
    beforeEach(async () => {
      const roleId = await createCustomRole({
        label: `MessageReadOnlyRole-${randomUUID()}`,
      });

      await makeMetadataAPIRequest(
        createUpsertObjectPermissionsOperation(roleId, [
          {
            objectMetadataId: messageObjectId,
            canReadObjectRecords: true,
            canUpdateObjectRecords: false,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          },
        ]),
      );

      await assignRoleToMember(roleId);
    });

    it('should still allow reading a message', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(
        findOneOperationFactory({
          objectMetadataSingularName: 'message',
          gqlFields: MESSAGE_GQL_FIELDS,
          filter: { id: { eq: messageId } },
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.message.id).toBe(messageId);
    });

    it('should deny updating a message', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(
        updateOneOperationFactory({
          objectMetadataSingularName: 'message',
          gqlFields: MESSAGE_GQL_FIELDS,
          recordId: messageId,
          data: { text: 'Updated by a read-only role' },
        }),
      );

      expectPermissionDenied(response);
    });

    it('should deny soft-deleting a message', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(
        deleteOneOperationFactory({
          objectMetadataSingularName: 'message',
          gqlFields: 'id',
          recordId: messageId,
        }),
      );

      expectPermissionDenied(response);
    });

    it('should deny destroying a message', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(
        destroyOneOperationFactory({
          objectMetadataSingularName: 'message',
          gqlFields: 'id',
          recordId: messageId,
        }),
      );

      expectPermissionDenied(response);
    });
  });

  describe('when the role sets no override on a system object', () => {
    beforeEach(async () => {
      const roleId = await createCustomRole({
        label: `NoMessageOverrideRole-${randomUUID()}`,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
      });

      await assignRoleToMember(roleId);
    });

    // System objects stay writable when a role expresses no opinion on them: the
    // default lives in the permissions cache, so removing the ORM-level bypass
    // must not turn "no override" into a denial.
    it('should allow updating a message', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(
        updateOneOperationFactory({
          objectMetadataSingularName: 'message',
          gqlFields: MESSAGE_GQL_FIELDS,
          recordId: messageId,
          data: { text: 'Updated through the system object default' },
        }),
      );

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateMessage.text).toBe(
        'Updated through the system object default',
      );
    });

    it('should deny updating a non-system object', async () => {
      const response = await makeGraphqlAPIRequestWithMemberRole(
        updateOneOperationFactory({
          objectMetadataSingularName: 'person',
          gqlFields: PERSON_GQL_FIELDS,
          recordId: personId,
          data: { jobTitle: 'Senior Software Engineer' },
        }),
      );

      expectPermissionDenied(response);
    });
  });
});
