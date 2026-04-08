import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { COMPANY_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/company-data-seeds.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const WORKSPACE_MEMBER_GQL_FIELDS = `
    id
    name {
      firstName
    }
`;

describe('workspace members permissions', () => {
  let customFieldId: string;
  let customFieldName: string;
  let customRelationFieldId: string;
  let customRelationJoinColumnName: string;

  beforeAll(async () => {
    const { objects } = await findManyObjectMetadata({
      input: {
        filter: {},
        paging: {
          first: 100,
        },
      },
      gqlFields: `
        id
        nameSingular
      `,
      expectToFail: false,
    });

    const workspaceMemberObjectMetadataId = objects.find(
      (objectMetadata) => objectMetadata.nameSingular === 'workspaceMember',
    )?.id;
    const companyObjectMetadataId = objects.find(
      (objectMetadata) => objectMetadata.nameSingular === 'company',
    )?.id;

    expect(workspaceMemberObjectMetadataId).toBeDefined();
    expect(companyObjectMetadataId).toBeDefined();

    customFieldName = 'region';

    const { data } = await createOneFieldMetadata({
      input: {
        objectMetadataId: workspaceMemberObjectMetadataId as string,
        name: customFieldName,
        label: 'In which region the workspace member is based',
        type: FieldMetadataType.TEXT,
      },
      gqlFields: `
        id
      `,
      expectToFail: false,
    });

    customFieldId = data.createOneField.id;

    const customRelationFieldName = `workingWithCompany`;

    const { data: customRelationFieldData } = await createOneFieldMetadata({
      input: {
        objectMetadataId: workspaceMemberObjectMetadataId as string,
        name: customRelationFieldName,
        label: 'Company the member is working with',
        type: FieldMetadataType.RELATION,
        relationCreationPayload: {
          targetObjectMetadataId: companyObjectMetadataId as string,
          targetFieldLabel: 'workspace members working with the company',
          targetFieldIcon: 'IconUsers',
          type: RelationType.MANY_TO_ONE,
        },
      },
      gqlFields: `
        id
        settings
      `,
      expectToFail: false,
    });

    customRelationFieldId = customRelationFieldData.createOneField.id;
    customRelationJoinColumnName = (
      customRelationFieldData.createOneField.settings as Record<string, unknown>
    ).joinColumnName as string;

    expect(customRelationJoinColumnName).toBeDefined();
  });

  afterAll(async () => {
    if (!customFieldId) {
      return;
    }

    await deleteOneFieldMetadata({
      input: {
        idToDelete: customFieldId,
      },
      expectToFail: false,
    });

    if (!customRelationFieldId) {
      return;
    }

    await deleteOneFieldMetadata({
      input: {
        idToDelete: customRelationFieldId,
      },
      expectToFail: false,
    });
  });

  it('should allow update when user is updating themself (member role)', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      data: {
        name: {
          firstName: 'Jony',
        },
      },
    });

    const response =
      await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

    expect(response.body.errors).not.toBeDefined();
    expect(response.body.data).toStrictEqual({
      updateWorkspaceMember: {
        id: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        name: {
          firstName: 'Jony',
        },
      },
    });
    expect(response.body.errors).toBeUndefined();
  });
  it('should throw when user does not have permission (member role)', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      data: {
        name: {
          firstName: 'Not Tim',
        },
      },
    });

    const response =
      await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

    expect(response.body.data).toStrictEqual({ updateWorkspaceMember: null });
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should allow update on custom field for another workspace member (member role)', async () => {
    const customFieldValue = 'Ile-de-france';
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: `
        id
        ${customFieldName}
      `,
      recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      data: {
        [customFieldName]: customFieldValue,
      },
    });

    const response =
      await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toStrictEqual({
      updateWorkspaceMember: {
        id: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
        [customFieldName]: customFieldValue,
      },
    });
  });

  it('should allow update on custom relation join column for another workspace member (member role)', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: `
        id
        ${customRelationJoinColumnName}
      `,
      recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      data: {
        [customRelationJoinColumnName]: COMPANY_DATA_SEED_IDS.ID_1,
      },
    });

    const response =
      await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toStrictEqual({
      updateWorkspaceMember: {
        id: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
        [customRelationJoinColumnName]: COMPANY_DATA_SEED_IDS.ID_1,
      },
    });
  });

  it('should throw when member updates a standard field for another workspace member', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      data: {
        timeZone: 'Europe/Paris',
      },
    });

    const response =
      await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

    expect(response.body.data).toStrictEqual({ updateWorkspaceMember: null });
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should throw when payload only contains updatedBy-managed changes', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      data: {},
    });

    const response =
      await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

    expect(response.body.data).toStrictEqual({ updateWorkspaceMember: null });
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should throw when calling deleteOne ', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    });

    const response =
      await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

    expect(response.body.data).toStrictEqual({ deleteWorkspaceMember: null });
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      'Please use /deleteUserFromWorkspace to remove a workspace member.',
    );
    expect(response.body.errors[0].extensions.code).toBe(
      ErrorCode.BAD_USER_INPUT,
    );
  });

  it('should throw when calling deleteMany', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    });

    const response =
      await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

    expect(response.body.data).toStrictEqual({ deleteWorkspaceMember: null });
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      'Please use /deleteUserFromWorkspace to remove a workspace member.',
    );
    expect(response.body.errors[0].extensions.code).toBe(
      ErrorCode.BAD_USER_INPUT,
    );
  });
});
