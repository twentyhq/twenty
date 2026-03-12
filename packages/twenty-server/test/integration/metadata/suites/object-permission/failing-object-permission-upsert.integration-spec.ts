import gql from 'graphql-tag';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { upsertObjectPermissions } from 'test/integration/metadata/suites/object-permission/utils/upsert-object-permissions.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { findRoles } from 'test/integration/metadata/suites/role/utils/find-roles.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type UpsertObjectPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-object-permissions.input';

type GlobalTestContext = {
  editableRoleId: string;
  nonEditableRoleId: string;
  systemObjectMetadataId: string;
  editableRoleWithNoReadId: string;
};

type TestContext = {
  input: (globalContext: GlobalTestContext) => UpsertObjectPermissionsInput;
};

const failingObjectPermissionUpsertTestCases: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when roleId is not a valid UUID',
      context: {
        input: () => ({
          roleId: 'invalid-uuid',
          objectPermissions: [
            {
              objectMetadataId: v4(),
              canReadObjectRecords: true,
              canUpdateObjectRecords: false,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            },
          ],
        }),
      },
    },
    {
      title: 'when roleId does not exist',
      context: {
        input: () => ({
          roleId: v4(),
          objectPermissions: [
            {
              objectMetadataId: v4(),
              canReadObjectRecords: true,
              canUpdateObjectRecords: false,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            },
          ],
        }),
      },
    },
    {
      title: 'when role is not editable (system role)',
      context: {
        input: (globalContext) => ({
          roleId: globalContext.nonEditableRoleId,
          objectPermissions: [
            {
              objectMetadataId: globalContext.systemObjectMetadataId,
              canReadObjectRecords: true,
              canUpdateObjectRecords: false,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            },
          ],
        }),
      },
    },
    {
      title: 'when objectMetadataId does not exist',
      context: {
        input: (globalContext) => ({
          roleId: globalContext.editableRoleId,
          objectPermissions: [
            {
              objectMetadataId: v4(),
              canReadObjectRecords: true,
              canUpdateObjectRecords: false,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            },
          ],
        }),
      },
    },
    {
      title: 'when object is system object',
      context: {
        input: (globalContext) => ({
          roleId: globalContext.editableRoleId,
          objectPermissions: [
            {
              objectMetadataId: globalContext.systemObjectMetadataId,
              canReadObjectRecords: true,
              canUpdateObjectRecords: false,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            },
          ],
        }),
      },
    },
    {
      title: 'when read=false but canUpdateObjectRecords=true (read/write consistency)',
      context: {
        input: (globalContext) => ({
          roleId: globalContext.editableRoleWithNoReadId,
          objectPermissions: [
            {
              objectMetadataId: globalContext.systemObjectMetadataId,
              canReadObjectRecords: false,
              canUpdateObjectRecords: true,
              canSoftDeleteObjectRecords: false,
              canDestroyObjectRecords: false,
            },
          ],
        }),
      },
    },
  ];

describe('Object permission upsert should fail', () => {
  let editableRoleId: string;
  let nonEditableRoleId: string;
  let systemObjectMetadataId: string;
  let editableRoleWithNoReadId: string;

  beforeAll(async () => {
    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Test Role For Object Permission Failing',
        description: 'Role for object permission failing tests',
        icon: 'IconSettings',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: true,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: false,
      },
    });

    editableRoleId = roleData?.createOneRole?.id;
    jestExpectToBeDefined(editableRoleId);

    const { data: roleNoReadData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Test Role No Read For Object Permission',
        description: 'Role with no read for consistency test',
        icon: 'IconSettings',
        canUpdateAllSettings: false,
        canAccessAllTools: true,
        canReadAllObjectRecords: false,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: true,
        canBeAssignedToAgents: false,
        canBeAssignedToApiKeys: false,
      },
    });

    editableRoleWithNoReadId = roleNoReadData?.createOneRole?.id;
    jestExpectToBeDefined(editableRoleWithNoReadId);

    const { data: rolesData } = await findRoles({
      expectToFail: false,
      gqlFields: `
        id
        label
        isEditable
      `,
    });

    jestExpectToBeDefined(rolesData?.getRoles);
    const adminRole = rolesData.getRoles.find(
      (role: { label: string; isEditable: boolean }) =>
        role.label === 'Admin' && role.isEditable === false,
    );
    jestExpectToBeDefined(adminRole);
    nonEditableRoleId = adminRole.id;

    const getObjectMetadataOperation = {
      query: gql`
        query {
          objects(paging: { first: 1000 }) {
            edges {
              node {
                id
                nameSingular
                isSystem
              }
            }
          }
        }
      `,
    };

    const objectMetadataResponse = await makeMetadataAPIRequest(
      getObjectMetadataOperation,
    );
    const edges = objectMetadataResponse.body.data?.objects?.edges ?? [];
    const personNode = edges.find(
      (edge: { node: { nameSingular: string } }) =>
        edge.node.nameSingular === 'person',
    )?.node;
    jestExpectToBeDefined(personNode);
    systemObjectMetadataId = personNode.id;
  });

  afterAll(async () => {
    if (isDefined(editableRoleId)) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: editableRoleId },
      });
    }
    if (isDefined(editableRoleWithNoReadId)) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: editableRoleWithNoReadId },
      });
    }
  });

  it.each(eachTestingContextFilter(failingObjectPermissionUpsertTestCases))(
    '$title',
    async ({ context }) => {
      const globalContext: GlobalTestContext = {
        editableRoleId: editableRoleId ?? '',
        nonEditableRoleId: nonEditableRoleId ?? '',
        systemObjectMetadataId: systemObjectMetadataId ?? '',
        editableRoleWithNoReadId: editableRoleWithNoReadId ?? '',
      };
      const input = context.input(globalContext);

      const { errors } = await upsertObjectPermissions({
        expectToFail: true,
        input,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
