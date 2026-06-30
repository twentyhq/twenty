import gql from 'graphql-tag';
import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { createOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/create-one-field-metadata.util';
import { deleteOneFieldMetadata } from 'test/integration/metadata/suites/field-metadata/utils/delete-one-field-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { makeMetadataAPIRequestWithMemberRole } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-member-role.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { FieldMetadataType } from 'twenty-shared/types';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
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

  it('should deny /graphql updateOne on own record for standard field name.firstName when member lacks WORKSPACE_MEMBERS', async () => {
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

    expect(response.body.data).toStrictEqual({ updateWorkspaceMember: null });
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should deny /graphql updateOne on own record for a custom field when member lacks WORKSPACE_MEMBERS', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: `
        id
        ${customFieldName}
      `,
      recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      data: {
        [customFieldName]: 'self-custom-value',
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

  it('should deny /graphql updateOne on another workspace member for a custom field when member lacks WORKSPACE_MEMBERS', async () => {
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

    expect(response.body.data).toStrictEqual({ updateWorkspaceMember: null });
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
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

  it('should allow self update through dedicated metadata mutation', async () => {
    const operation = {
      query: gql`
        mutation UpdateWorkspaceMemberSettings(
          $input: UpdateWorkspaceMemberSettingsInput!
        ) {
          updateWorkspaceMemberSettings(input: $input)
        }
      `,
      variables: {
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          update: {
            timeZone: 'Europe/Paris',
          },
        },
      },
    };

    const response = await makeMetadataAPIRequestWithMemberRole(operation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateWorkspaceMemberSettings).toBe(true);
  });

  it('should deny updating another workspace member through dedicated metadata mutation (member role - no workspace member settings permission)', async () => {
    const operation = {
      query: gql`
        mutation UpdateWorkspaceMemberSettings(
          $input: UpdateWorkspaceMemberSettingsInput!
        ) {
          updateWorkspaceMemberSettings(input: $input)
        }
      `,
      variables: {
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
          update: {
            timeZone: 'Europe/Paris',
          },
        },
      },
    };

    const response = await makeMetadataAPIRequestWithMemberRole(operation);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should allow updating another workspace member through dedicated metadata mutation for admin (has workspace member settings permission)', async () => {
    const operation = {
      query: gql`
        mutation UpdateWorkspaceMemberSettings(
          $input: UpdateWorkspaceMemberSettingsInput!
        ) {
          updateWorkspaceMemberSettings(input: $input)
        }
      `,
      variables: {
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
          update: {
            timeZone: 'Europe/London',
          },
        },
      },
    };

    const response = await makeMetadataAPIRequest(operation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateWorkspaceMemberSettings).toBe(true);
  });

  it('should reject custom field updates through dedicated metadata mutation', async () => {
    const operation = {
      query: gql`
        mutation UpdateWorkspaceMemberSettings(
          $input: UpdateWorkspaceMemberSettingsInput!
        ) {
          updateWorkspaceMemberSettings(input: $input)
        }
      `,
      variables: {
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          update: {
            [customFieldName]: 'custom-value',
          },
        },
      },
    };

    const response = await makeMetadataAPIRequestWithMemberRole(operation);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      `Cannot update custom workspaceMember field via this endpoint: ${customFieldName}`,
    );
    expect(response.body.errors[0].extensions.code).toBe(
      ErrorCode.BAD_USER_INPUT,
    );
  });

  it('should reject custom relation join column updates through dedicated metadata mutation', async () => {
    const operation = {
      query: gql`
        mutation UpdateWorkspaceMemberSettings(
          $input: UpdateWorkspaceMemberSettingsInput!
        ) {
          updateWorkspaceMemberSettings(input: $input)
        }
      `,
      variables: {
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          update: {
            [customRelationJoinColumnName]: null,
          },
        },
      },
    };

    const response = await makeMetadataAPIRequestWithMemberRole(operation);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      `Cannot update custom workspaceMember field via this endpoint: ${customRelationJoinColumnName}`,
    );
    expect(response.body.errors[0].extensions.code).toBe(
      ErrorCode.BAD_USER_INPUT,
    );
  });

  it('should reject empty update payload through dedicated metadata mutation', async () => {
    const operation = {
      query: gql`
        mutation UpdateWorkspaceMemberSettings(
          $input: UpdateWorkspaceMemberSettingsInput!
        ) {
          updateWorkspaceMemberSettings(input: $input)
        }
      `,
      variables: {
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          update: {},
        },
      },
    };

    const response = await makeMetadataAPIRequestWithMemberRole(operation);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      'Update payload cannot be empty',
    );
    expect(response.body.errors[0].extensions.code).toBe(
      ErrorCode.BAD_USER_INPUT,
    );
  });

  it('should reject unknown top-level keys through dedicated metadata mutation (allowlist)', async () => {
    const unknownKey = 'notAStandardWorkspaceMemberField';

    const operation = {
      query: gql`
        mutation UpdateWorkspaceMemberSettings(
          $input: UpdateWorkspaceMemberSettingsInput!
        ) {
          updateWorkspaceMemberSettings(input: $input)
        }
      `,
      variables: {
        input: {
          workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
          update: {
            [unknownKey]: 'value',
          },
        },
      },
    };

    const response = await makeMetadataAPIRequestWithMemberRole(operation);

    expect(response.body.data).toBeNull();
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      `Cannot update custom workspaceMember field via this endpoint: ${unknownKey}`,
    );
    expect(response.body.errors[0].extensions.code).toBe(
      ErrorCode.BAD_USER_INPUT,
    );
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
