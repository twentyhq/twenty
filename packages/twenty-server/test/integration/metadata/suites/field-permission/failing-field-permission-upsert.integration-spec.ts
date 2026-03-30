import gql from 'graphql-tag';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { findManyFieldsMetadata } from 'test/integration/metadata/suites/field-metadata/utils/find-many-fields-metadata.util';
import { upsertFieldPermissions } from 'test/integration/metadata/suites/field-permission/utils/upsert-field-permissions.util';
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

import { type UpsertFieldPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-field-permissions.input';

type GlobalTestContext = {
  editableRoleId: string;
  nonEditableRoleId: string;
  systemObjectMetadataId: string;
  nonSystemObjectMetadataId: string;
  oneFieldMetadataId: string;
};

type TestContext = {
  input: (globalContext: GlobalTestContext) => UpsertFieldPermissionsInput;
};

const failingFieldPermissionUpsertTestCases: EachTestingContext<TestContext>[] =
  [
    {
      title: 'when roleId is not a valid UUID',
      context: {
        input: () => ({
          roleId: 'invalid-uuid',
          fieldPermissions: [
            {
              objectMetadataId: v4(),
              fieldMetadataId: v4(),
              canReadFieldValue: false,
              canUpdateFieldValue: false,
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
          fieldPermissions: [
            {
              objectMetadataId: v4(),
              fieldMetadataId: v4(),
              canReadFieldValue: false,
              canUpdateFieldValue: false,
            },
          ],
        }),
      },
    },
    {
      title: 'when role is not editable (system role)',
      context: {
        input: (globalContext: GlobalTestContext) => ({
          roleId: globalContext.nonEditableRoleId,
          fieldPermissions: [
            {
              objectMetadataId: globalContext.nonSystemObjectMetadataId,
              fieldMetadataId: globalContext.oneFieldMetadataId,
              canReadFieldValue: false,
              canUpdateFieldValue: false,
            },
          ],
        }),
      },
    },
    {
      title: 'when objectMetadataId does not exist',
      context: {
        input: (globalContext: GlobalTestContext) => ({
          roleId: globalContext.editableRoleId,
          fieldPermissions: [
            {
              objectMetadataId: v4(),
              fieldMetadataId: globalContext.oneFieldMetadataId,
              canReadFieldValue: false,
              canUpdateFieldValue: false,
            },
          ],
        }),
      },
    },
    {
      title: 'when fieldMetadataId does not exist',
      context: {
        input: (globalContext: GlobalTestContext) => ({
          roleId: globalContext.editableRoleId,
          fieldPermissions: [
            {
              objectMetadataId: globalContext.nonSystemObjectMetadataId,
              fieldMetadataId: v4(),
              canReadFieldValue: false,
              canUpdateFieldValue: false,
            },
          ],
        }),
      },
    },
    {
      title: 'when object is system object',
      context: {
        input: (globalContext: GlobalTestContext) => ({
          roleId: globalContext.editableRoleId,
          fieldPermissions: [
            {
              objectMetadataId: globalContext.systemObjectMetadataId,
              fieldMetadataId: globalContext.oneFieldMetadataId,
              canReadFieldValue: false,
              canUpdateFieldValue: false,
            },
          ],
        }),
      },
    },
    {
      title: 'when canReadFieldValue is true (only restriction allowed)',
      context: {
        input: (globalContext: GlobalTestContext) => ({
          roleId: globalContext.editableRoleId,
          fieldPermissions: [
            {
              objectMetadataId: globalContext.nonSystemObjectMetadataId,
              fieldMetadataId: globalContext.oneFieldMetadataId,
              canReadFieldValue: true,
              canUpdateFieldValue: false,
            },
          ],
        }),
      },
    },
    {
      title: 'when canUpdateFieldValue is true (only restriction allowed)',
      context: {
        input: (globalContext: GlobalTestContext) => ({
          roleId: globalContext.editableRoleId,
          fieldPermissions: [
            {
              objectMetadataId: globalContext.nonSystemObjectMetadataId,
              fieldMetadataId: globalContext.oneFieldMetadataId,
              canReadFieldValue: false,
              canUpdateFieldValue: true,
            },
          ],
        }),
      },
    },
  ];

describe('Field permission upsert should fail', () => {
  let editableRoleId: string;
  let nonEditableRoleId: string;
  let systemObjectMetadataId: string;
  let nonSystemObjectMetadataId: string;
  let oneFieldMetadataId: string;

  beforeAll(async () => {
    const { data: roleData } = await createOneRole({
      expectToFail: false,
      input: {
        label: 'Test Role For Field Permission Failing',
        description: 'Role for field permission failing tests',
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
    const systemObjectNode = edges.find(
      (edge: { node: { isSystem: boolean | string } }) =>
        edge.node.isSystem === true || String(edge.node.isSystem) === 'true',
    )?.node;
    jestExpectToBeDefined(systemObjectNode);
    systemObjectMetadataId = systemObjectNode.id;

    const nonSystemObjectNode = edges.find(
      (edge: { node: { isSystem: boolean | string } }) =>
        edge.node.isSystem === false || String(edge.node.isSystem) === 'false',
    )?.node;
    jestExpectToBeDefined(nonSystemObjectNode);
    nonSystemObjectMetadataId = nonSystemObjectNode.id;

    const { fields } = await findManyFieldsMetadata({
      expectToFail: false,
      input: {
        filter: { objectMetadataId: { eq: nonSystemObjectMetadataId } },
        paging: { first: 50 },
      },
      gqlFields: 'id type',
    });
    jestExpectToBeDefined(fields);
    expect(fields?.length).toBeGreaterThan(0);
    const nonRelationField = fields.find(
      (field: { node: { type: string } }) => field.node.type !== 'RELATION',
    );
    jestExpectToBeDefined(nonRelationField);
    oneFieldMetadataId = nonRelationField.node.id;

    await upsertObjectPermissions({
      expectToFail: false,
      input: {
        roleId: editableRoleId,
        objectPermissions: [
          {
            objectMetadataId: nonSystemObjectMetadataId,
            canReadObjectRecords: true,
            canUpdateObjectRecords: false,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          },
        ],
      },
    });
  });

  afterAll(async () => {
    if (isDefined(editableRoleId)) {
      await deleteOneRole({
        expectToFail: false,
        input: { idToDelete: editableRoleId },
      });
    }
  });

  it.each(eachTestingContextFilter(failingFieldPermissionUpsertTestCases))(
    '$title',
    async ({ context }) => {
      const globalContext: GlobalTestContext = {
        editableRoleId: editableRoleId ?? '',
        nonEditableRoleId: nonEditableRoleId ?? '',
        systemObjectMetadataId: systemObjectMetadataId ?? '',
        nonSystemObjectMetadataId: nonSystemObjectMetadataId ?? '',
        oneFieldMetadataId: oneFieldMetadataId ?? '',
      };
      const input = context.input(globalContext);

      const { errors } = await upsertFieldPermissions({
        expectToFail: true,
        input,
      });

      expectOneNotInternalServerErrorSnapshot({
        errors,
      });
    },
  );
});
