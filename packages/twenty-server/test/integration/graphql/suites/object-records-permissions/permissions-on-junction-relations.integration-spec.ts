import { default as request } from 'supertest';
import gql from 'graphql-tag';
import { deleteRole } from 'test/integration/graphql/utils/delete-one-role.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequestWithMemberRole as makeGraphqlAPIRequestWithJony } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { updateWorkspaceMemberRole } from 'test/integration/graphql/utils/update-workspace-member-role.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { PERSON_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/person-data-seeds.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

const PERSON_WITH_JUNCTION = PERSON_DATA_SEED_IDS.ID_1;

const createRoleWithPermissions = async ({
  label,
  objectPermissions,
}: {
  label: string;
  objectPermissions: {
    objectName: string;
    canReadObjectRecords: boolean;
  }[];
}) => {
  const createRoleOperation = {
    query: gql`
      mutation CreateOneRole {
        createOneRole(
          createRoleInput: {
            label: "${label}"
            description: "Junction test role"
            canUpdateAllSettings: true
            canReadAllObjectRecords: true
            canUpdateAllObjectRecords: true
            canSoftDeleteAllObjectRecords: true
            canDestroyAllObjectRecords: true
          }
        ) {
          id
          label
        }
      }
    `,
  };

  const response = await makeMetadataAPIRequest(createRoleOperation);

  expect(response.body.errors).toBeUndefined();
  const roleId = response.body.data.createOneRole.id;

  const getObjectMetadataOperation = {
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
  };

  const objectMetadataResponse = await makeMetadataAPIRequest(
    getObjectMetadataOperation,
  );
  const objects = objectMetadataResponse.body.data.objects.edges;

  const permissions = objectPermissions.map((permission) => {
    const objectId = objects.find(
      (objectMetadata: any) =>
        objectMetadata.node.nameSingular === permission.objectName,
    )?.node.id;

    expect(objectId).toBeDefined();

    return {
      objectMetadataId: objectId,
      canReadObjectRecords: permission.canReadObjectRecords,
      canUpdateObjectRecords: false,
      canSoftDeleteObjectRecords: false,
      canDestroyObjectRecords: false,
    };
  });

  if (permissions.length > 0) {
    const upsertObjectPermissionsOperation = {
      query: gql`
        mutation UpsertObjectPermissions(
          $roleId: UUID!
          $objectPermissions: [ObjectPermissionInput!]!
        ) {
          upsertObjectPermissions(
            upsertObjectPermissionsInput: {
              roleId: $roleId
              objectPermissions: $objectPermissions
            }
          ) {
            objectMetadataId
            canReadObjectRecords
          }
        }
      `,
      variables: {
        roleId,
        objectPermissions: permissions,
      },
    };

    await makeMetadataAPIRequest(upsertObjectPermissionsOperation);
  }

  return { roleId };
};

describe('permissionsOnJunctionRelations', () => {
  let originalMemberRoleId: string;
  let customRoleId: string;

  beforeAll(async () => {
    const getRolesQuery = {
      query: `
        query GetRoles {
          getRoles {
            id
            label
          }
        }
      `,
    };

    const rolesResponse = await client
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(getRolesQuery);

    originalMemberRoleId = rolesResponse.body.data.getRoles.find(
      (role: any) => role.label === 'Member',
    ).id;
  });

  afterAll(async () => {
    await updateWorkspaceMemberRole({
      client,
      roleId: originalMemberRoleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });
  });

  afterEach(async () => {
    if (customRoleId) {
      await deleteRole(client, customRoleId);
    }
  });

  it('should return junction rows with nested target when user has read permission on all three objects', async () => {
    const { roleId } = await createRoleWithPermissions({
      label: 'JunctionAllAccessRole',
      objectPermissions: [
        { objectName: 'person', canReadObjectRecords: true },
        { objectName: 'employmentHistory', canReadObjectRecords: true },
        { objectName: 'company', canReadObjectRecords: true },
      ],
    });

    customRoleId = roleId;

    await updateWorkspaceMemberRole({
      client,
      roleId: customRoleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: `
        id
        previousCompanies {
          edges {
            node {
              id
              company {
                id
                name
              }
            }
          }
        }
      `,
      filter: {
        id: { eq: PERSON_WITH_JUNCTION },
      },
    });

    const response = await makeGraphqlAPIRequestWithJony(graphqlOperation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.person).toBeDefined();

    const previousCompanies = response.body.data.person.previousCompanies.edges;

    expect(previousCompanies.length).toBe(2);

    for (const edge of previousCompanies) {
      expect(edge.node.company).toBeDefined();
      expect(edge.node.company.id).toBeDefined();
      expect(edge.node.company.name).toBeDefined();
    }
  });

  it('should throw permission error when querying junction with nested target without target read permission', async () => {
    const { roleId } = await createRoleWithPermissions({
      label: 'JunctionNoTargetAccessRole',
      objectPermissions: [
        { objectName: 'person', canReadObjectRecords: true },
        { objectName: 'employmentHistory', canReadObjectRecords: true },
        { objectName: 'company', canReadObjectRecords: false },
      ],
    });

    customRoleId = roleId;

    await updateWorkspaceMemberRole({
      client,
      roleId: customRoleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: `
        id
        previousCompanies {
          edges {
            node {
              id
              company {
                id
                name
              }
            }
          }
        }
      `,
      filter: {
        id: { eq: PERSON_WITH_JUNCTION },
      },
    });

    const response = await makeGraphqlAPIRequestWithJony(graphqlOperation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should throw permission error when user has no read permission on the junction object (employmentHistory)', async () => {
    const { roleId } = await createRoleWithPermissions({
      label: 'JunctionNoJunctionAccessRole',
      objectPermissions: [
        { objectName: 'person', canReadObjectRecords: true },
        { objectName: 'employmentHistory', canReadObjectRecords: false },
        { objectName: 'company', canReadObjectRecords: true },
      ],
    });

    customRoleId = roleId;

    await updateWorkspaceMemberRole({
      client,
      roleId: customRoleId,
      workspaceMemberId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
    });

    const graphqlOperation = findOneOperationFactory({
      objectMetadataSingularName: 'person',
      gqlFields: `
        id
        previousCompanies {
          edges {
            node {
              id
            }
          }
        }
      `,
      filter: {
        id: { eq: PERSON_WITH_JUNCTION },
      },
    });

    const response = await makeGraphqlAPIRequestWithJony(graphqlOperation);

    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });
});
