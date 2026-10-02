import gql from 'graphql-tag';
import request from 'supertest';
import { deleteOneRoleOperationFactory } from 'test/integration/graphql/utils/delete-one-role-operation-factory.util';
import { generateApiKeyToken } from 'test/integration/graphql/utils/generate-api-key-token.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { findManyObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/find-many-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { createOneRole } from 'test/integration/metadata/suites/role/utils/create-one-role.util';
import { upsertRowLevelPermissionPredicates } from 'test/integration/metadata/suites/row-level-permission-predicate/utils/upsert-row-level-permission-predicates.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { generateApplicationTokenPair } from 'test/integration/utils/generate-application-token-pair.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import {
  PermissionFlagType,
  SystemPermissionFlag,
} from 'twenty-shared/constants';
import {
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { v4 } from 'uuid';

import { fieldTextMock } from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import {
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

async function assertPermissionDeniedForMemberWithMemberRole({
  query,
}: {
  query: { query: string };
}) {
  await client
    .post('/metadata')
    .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
    .send(query)
    .expect(200)
    .expect((res) => {
      expect(res.body.data).toBeNull();
      expect(res.body.errors).toBeDefined();
      expect(res.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(res.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });
}

describe('roles permissions', () => {
  let adminRoleId: string;
  let guestRoleId: string;

  beforeAll(async () => {
    const query = {
      query: `
      query GetRoles {
          getRoles {
              label
              id
          }
      }
    `,
    };

    const resp = await client
      .post('/metadata')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(query);

    adminRoleId = resp.body.data.getRoles.find(
      // @ts-expect-error legacy noImplicitAny
      (role) => role.label === 'Admin',
    ).id;

    guestRoleId = resp.body.data.getRoles.find(
      // @ts-expect-error legacy noImplicitAny
      (role) => role.label === 'Guest',
    ).id;
  });

  describe('getRoles', () => {
    it('should allow admin to query getRoles', async () => {
      const query = {
        query: `
        query GetRoles {
            getRoles {
                label
                workspaceMembers {
                id
                name {
                    firstName
                    lastName
                    }
                }
            }
        }
      `,
      };

      const resp = await client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send(query);

      expect(resp.status).toBe(200);
      expect(resp.body.errors).toBeUndefined();
      expect(resp.body.data.getRoles.length).toBeGreaterThanOrEqual(4);

      const roles = resp.body.data.getRoles;
      const guestRole = roles.find((role: any) => role.label === 'Guest');
      const adminRole = roles.find((role: any) => role.label === 'Admin');
      const memberRole = roles.find((role: any) => role.label === 'Member');
      const objectRestrictedRole = roles.find(
        (role: any) => role.label === 'Object-restricted',
      );

      expect(guestRole).toBeDefined();
      expect(adminRole).toBeDefined();
      expect(memberRole).toBeDefined();
      expect(objectRestrictedRole).toBeDefined();

      expect(guestRole.workspaceMembers).toEqual([
        {
          id: '20202020-1553-45c6-a028-5a9064cce07f',
          name: {
            firstName: 'Phil',
            lastName: 'Schiler',
          },
        },
      ]);

      expect(adminRole.workspaceMembers).toEqual([
        {
          id: '20202020-463f-435b-828c-107e007a2711',
          name: {
            firstName: 'Jane',
            lastName: 'Austen',
          },
        },
      ]);

      expect(memberRole.workspaceMembers).toEqual(
        expect.arrayContaining([
          {
            id: '20202020-77d5-4cb6-b60a-f4a835a85d61',
            name: {
              firstName: 'Jony',
              lastName: 'Ive',
            },
          },
        ]),
      );

      expect(objectRestrictedRole.workspaceMembers).toEqual([
        {
          id: '20202020-0687-4c41-b707-ed1bfca972a7',
          name: {
            firstName: 'Tim',
            lastName: 'Apple',
          },
        },
      ]);
    });
    it('should throw a permission error when user does not have permission (member role)', async () => {
      const query = {
        query: `
          query GetRoles {
            getRoles {
                label
                workspaceMembers {
                id
                name {
                    firstName
                    lastName
                    }
                }
            }
        }
        `,
      };

      await assertPermissionDeniedForMemberWithMemberRole({ query });
    });

    describe('role relations', () => {
      let relationsRoleId: string;
      let relationsApiKeyId: string;
      let relationsPredicateId: string;
      let relationsPredicateGroupId: string;

      beforeAll(async () => {
        const { objects } = await findManyObjectMetadata({
          expectToFail: false,
          input: { filter: {}, paging: { first: 1000 } },
          gqlFields: `
            id
            nameSingular
            fieldsList {
              id
              name
            }
          `,
        });

        const companyObjectMetadata = objects.find(
          (object: { nameSingular: string }) =>
            object.nameSingular === 'company',
        );

        jestExpectToBeDefined(companyObjectMetadata);

        const companyNameField = companyObjectMetadata.fieldsList?.find(
          (field: { name: string }) => field.name === 'name',
        );

        jestExpectToBeDefined(companyNameField);

        const { data: roleData, errors: roleErrors } = await createOneRole({
          expectToFail: false,
          input: {
            label: `Role relations ${v4()}`,
            canUpdateAllSettings: false,
            canAccessAllTools: false,
            canReadAllObjectRecords: true,
            canUpdateAllObjectRecords: false,
            canSoftDeleteAllObjectRecords: false,
            canDestroyAllObjectRecords: false,
            canBeAssignedToUsers: true,
            canBeAssignedToAgents: false,
            canBeAssignedToApiKeys: true,
          },
        });

        expect(roleErrors).toBeUndefined();
        jestExpectToBeDefined(roleData);

        relationsRoleId = roleData.createOneRole.id;

        const {
          data: rowLevelPermissionData,
          errors: rowLevelPermissionErrors,
        } = await upsertRowLevelPermissionPredicates({
          expectToFail: false,
          input: {
            roleId: relationsRoleId,
            objectMetadataId: companyObjectMetadata.id,
            predicates: [
              {
                fieldMetadataId: companyNameField.id,
                operand: RowLevelPermissionPredicateOperand.CONTAINS,
                value: 'Apple',
              },
            ],
            predicateGroups: [
              {
                objectMetadataId: companyObjectMetadata.id,
                logicalOperator:
                  RowLevelPermissionPredicateGroupLogicalOperator.AND,
                parentRowLevelPermissionPredicateGroupId: null,
              },
            ],
          },
        });

        expect(rowLevelPermissionErrors).toBeUndefined();
        jestExpectToBeDefined(rowLevelPermissionData);

        relationsPredicateId =
          rowLevelPermissionData.upsertRowLevelPermissionPredicates
            .predicates[0].id;
        relationsPredicateGroupId =
          rowLevelPermissionData.upsertRowLevelPermissionPredicates
            .predicateGroups[0].id;

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
              name: 'Role relations API key',
              expiresAt: '2099-12-31T23:59:59Z',
              roleId: relationsRoleId,
            },
          },
        });

        expect(apiKeyResponse.status).toBe(200);
        expect(apiKeyResponse.body.errors).toBeUndefined();
        jestExpectToBeDefined(apiKeyResponse.body.data);

        relationsApiKeyId = apiKeyResponse.body.data.createApiKey.id;
      });

      afterAll(async () => {
        const assignResponse = await makeMetadataApiRequest({
          query: gql`
            mutation AssignRoleToApiKey($apiKeyId: UUID!, $roleId: UUID!) {
              assignRoleToApiKey(apiKeyId: $apiKeyId, roleId: $roleId)
            }
          `,
          variables: { apiKeyId: relationsApiKeyId, roleId: adminRoleId },
        });

        const revokeResponse = await makeMetadataApiRequest({
          query: gql`
            mutation RevokeApiKey($input: RevokeApiKeyInput!) {
              revokeApiKey(input: $input) {
                id
              }
            }
          `,
          variables: { input: { id: relationsApiKeyId } },
        });

        const deleteRoleResponse = await client
          .post('/metadata')
          .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
          .send(deleteOneRoleOperationFactory(relationsRoleId));

        await testDataSource
          .query('DELETE FROM core."apiKey" WHERE id = $1', [relationsApiKeyId])
          .catch(() => {});

        expect({
          assignRoleToApiKey: assignResponse.body.errors,
          revokeApiKey: revokeResponse.body.errors,
          deleteOneRole: deleteRoleResponse.body.errors,
        }).toEqual({
          assignRoleToApiKey: undefined,
          revokeApiKey: undefined,
          deleteOneRole: undefined,
        });
      });

      it('should resolve each relation for its own role only', async () => {
        const query = {
          query: `
            query GetRoles {
              getRoles {
                id
                workspaceMembers {
                  id
                }
                agents {
                  id
                }
                apiKeys {
                  id
                }
                rowLevelPermissionPredicates {
                  id
                  roleId
                }
                rowLevelPermissionPredicateGroups {
                  id
                  roleId
                }
              }
            }
          `,
        };

        const resp = await client
          .post('/metadata')
          .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
          .send(query);

        expect(resp.status).toBe(200);
        expect(resp.body.errors).toBeUndefined();

        const roles: {
          id: string;
          workspaceMembers: { id: string }[];
          agents: { id: string }[];
          apiKeys: { id: string }[];
          rowLevelPermissionPredicates: { id: string; roleId: string }[];
          rowLevelPermissionPredicateGroups: { id: string; roleId: string }[];
        }[] = resp.body.data.getRoles;

        const relationsRole = roles.find((role) => role.id === relationsRoleId);
        const guestRole = roles.find((role) => role.id === guestRoleId);

        expect(relationsRole).toMatchObject({
          id: relationsRoleId,
          workspaceMembers: [],
          agents: [],
          apiKeys: [{ id: relationsApiKeyId }],
          rowLevelPermissionPredicates: [
            { id: relationsPredicateId, roleId: relationsRoleId },
          ],
          rowLevelPermissionPredicateGroups: [
            { id: relationsPredicateGroupId, roleId: relationsRoleId },
          ],
        });

        expect(guestRole?.workspaceMembers).toEqual([
          { id: WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL },
        ]);
        expect(guestRole?.rowLevelPermissionPredicates).toEqual([]);
        expect(guestRole?.rowLevelPermissionPredicateGroups).toEqual([]);

        for (const role of roles.filter(
          (role) => role.id !== relationsRoleId,
        )) {
          expect(role.apiKeys).not.toContainEqual({ id: relationsApiKeyId });
          expect(role.rowLevelPermissionPredicates).not.toContainEqual(
            expect.objectContaining({ id: relationsPredicateId }),
          );
          expect(role.rowLevelPermissionPredicateGroups).not.toContainEqual(
            expect.objectContaining({ id: relationsPredicateGroupId }),
          );
        }
      });

      it('should gate role relations reached by an API key on the roles permission', async () => {
        const tokenResponse = await generateApiKeyToken({
          apiKeyId: relationsApiKeyId,
          accessToken: APPLE_JANE_ADMIN_ACCESS_TOKEN,
        });

        const relationsApiKeyToken: string | undefined =
          tokenResponse.body.data?.generateApiKeyToken?.token;

        jestExpectToBeDefined(relationsApiKeyToken);

        const query = {
          query: `
            query CurrentWorkspaceDefaultRoleRelations {
              currentWorkspace {
                defaultRole {
                  apiKeys {
                    id
                  }
                  workspaceMembers {
                    id
                  }
                }
              }
            }
          `,
        };

        const deniedResp = await client
          .post('/metadata')
          .set('Authorization', `Bearer ${relationsApiKeyToken}`)
          .send(query);

        expect(deniedResp.body.data.currentWorkspace.defaultRole).toBeNull();
        expect(deniedResp.body.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(deniedResp.body.errors[0].extensions.code).toBe(
          ErrorCode.FORBIDDEN,
        );

        const adminApiKeyResp = await client
          .post('/metadata')
          .set('Authorization', `Bearer ${API_KEY_ACCESS_TOKEN}`)
          .send(query);

        expect(adminApiKeyResp.body.errors).toBeUndefined();
        expect(
          adminApiKeyResp.body.data.currentWorkspace.defaultRole
            .workspaceMembers,
        ).toContainEqual({ id: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY });
      });
    });
  });

  describe('getRole', () => {
    const getRoleQuery = (roleId: string) => ({
      query: `
        query GetRole {
          getRole(id: "${roleId}") {
            id
            label
            workspaceMembers {
              id
            }
          }
        }
      `,
    });

    it('should return a single role with its workspace members', async () => {
      const resp = await client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send(getRoleQuery(adminRoleId));

      expect(resp.status).toBe(200);
      expect(resp.body.errors).toBeUndefined();
      expect(resp.body.data.getRole).toEqual({
        id: adminRoleId,
        label: 'Admin',
        workspaceMembers: [{ id: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE }],
      });
    });

    it('should throw a not found error when the role does not exist', async () => {
      const resp = await client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send(getRoleQuery('20202020-0000-4000-8000-000000000000'));

      expect(resp.body.data).toBeNull();
      expect(resp.body.errors[0].message).toBe(
        PermissionsExceptionMessage.ROLE_NOT_FOUND,
      );
      expect(resp.body.errors[0].extensions.code).toBe(ErrorCode.NOT_FOUND);
    });

    it('should throw a permission error when user does not have permission (member role)', async () => {
      await assertPermissionDeniedForMemberWithMemberRole({
        query: getRoleQuery(guestRoleId),
      });
    });
  });

  describe('role relations reached outside getRoles', () => {
    const defaultRoleQuery = (roleFields: string) => ({
      query: `
        query CurrentWorkspaceDefaultRole {
          currentWorkspace {
            defaultRole {
              id
              ${roleFields}
            }
          }
        }
      `,
    });

    it.each([
      'workspaceMembers',
      'agents',
      'apiKeys',
      'rowLevelPermissionPredicates',
      'rowLevelPermissionPredicateGroups',
    ])(
      'should deny defaultRole.%s to a member without the roles permission',
      async (roleField) => {
        const resp = await client
          .post('/metadata')
          .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
          .send(defaultRoleQuery(`${roleField} { id }`));

        expect(resp.status).toBe(200);
        expect(resp.body.errors).toHaveLength(1);
        expect(resp.body.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(resp.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
      },
    );

    it('should deny role relations reached through the workspace member roles to a member without the roles permission', async () => {
      const resp = await client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
        .send({
          query: `
            query CurrentUserWorkspaceMemberRoles {
              currentUser {
                workspaceMember {
                  roles {
                    workspaceMembers {
                      id
                    }
                  }
                }
              }
            }
          `,
        });

      expect(resp.status).toBe(200);
      expect(resp.body.data.currentUser.workspaceMember.roles).toBeNull();
      expect(resp.body.errors).toHaveLength(1);
      expect(resp.body.errors[0].message).toBe(
        PermissionsExceptionMessage.PERMISSION_DENIED,
      );
      expect(resp.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
    });

    it('should still let a member read the default role settings', async () => {
      const resp = await client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JONY_MEMBER_ACCESS_TOKEN}`)
        .send(defaultRoleQuery('label canUpdateAllSettings'));

      expect(resp.status).toBe(200);
      expect(resp.body.errors).toBeUndefined();
      expect(resp.body.data.currentWorkspace.defaultRole).toMatchObject({
        label: 'Member',
        canUpdateAllSettings: false,
      });
    });

    it('should let an admin read the default role relations', async () => {
      const resp = await client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send(
          defaultRoleQuery(`
            workspaceMembers { id }
            agents { id }
            apiKeys { id }
            rowLevelPermissionPredicates { id }
            rowLevelPermissionPredicateGroups { id }
          `),
        );

      expect(resp.status).toBe(200);
      expect(resp.body.errors).toBeUndefined();
      expect(
        resp.body.data.currentWorkspace.defaultRole.workspaceMembers,
      ).toContainEqual({ id: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY });
    });

    describe('application callers', () => {
      const createdApplications: ApplicationWithVariable[] = [];

      let deniedApplicationId: string;
      let grantedApplicationId: string;

      beforeAll(async () => {
        const deniedApplication = await setupApplicationWithVariable({
          name: 'Role relations denied app',
          variableKey: 'DENIED',
        });

        createdApplications.push(deniedApplication);

        const grantedApplication = await setupApplicationWithVariable({
          name: 'Role relations granted app',
          variableKey: 'GRANTED',
          permissionFlagUniversalIdentifiers: [SystemPermissionFlag.ROLES],
        });

        createdApplications.push(grantedApplication);

        deniedApplicationId = deniedApplication.id;
        grantedApplicationId = grantedApplication.id;
      }, 120000);

      afterAll(async () => {
        for (const application of createdApplications) {
          await cleanupApplicationAndAppRegistration({
            applicationUniversalIdentifier: application.universalIdentifier,
          });
        }
      });

      const queryDefaultRoleWorkspaceMembersAsApplication = async (
        applicationId: string,
      ) => {
        const { applicationAccessToken } = await generateApplicationTokenPair({
          workspaceId: SEED_APPLE_WORKSPACE_ID,
          applicationId,
        });

        return client
          .post('/metadata')
          .set('Authorization', `Bearer ${applicationAccessToken.token}`)
          .send(defaultRoleQuery('workspaceMembers { id }'));
      };

      it('should deny defaultRole.workspaceMembers to an application whose role lacks the roles permission', async () => {
        const resp =
          await queryDefaultRoleWorkspaceMembersAsApplication(
            deniedApplicationId,
          );

        expect(resp.body.data.currentWorkspace.defaultRole).toBeNull();
        expect(resp.body.errors[0].message).toBe(
          PermissionsExceptionMessage.PERMISSION_DENIED,
        );
        expect(resp.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
      });

      it('should let an application whose role has the roles permission read defaultRole.workspaceMembers', async () => {
        const resp =
          await queryDefaultRoleWorkspaceMembersAsApplication(
            grantedApplicationId,
          );

        expect(resp.body.errors).toBeUndefined();
        expect(
          resp.body.data.currentWorkspace.defaultRole.workspaceMembers,
        ).toContainEqual({ id: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY });
      });
    });
  });

  describe('updateWorkspaceMemberRole', () => {
    it('should throw a permission error when user does not have permission to update roles (member role)', async () => {
      const query = {
        query: `
          mutation UpdateWorkspaceMemberRole {
              updateWorkspaceMemberRole(workspaceMemberId: "test-workspace-member-id", roleId: "test-role-id") {
                  id
              }
          }
        `,
      };

      await assertPermissionDeniedForMemberWithMemberRole({ query });
    });

    it('should throw a permission error when tries to update their own role (admin role)', async () => {
      const query = {
        query: `
            mutation UpdateWorkspaceMemberRole {
                updateWorkspaceMemberRole(workspaceMemberId: "${WORKSPACE_MEMBER_DATA_SEED_IDS.JANE}", roleId: "test-role-id") {
                    id
                }
            }
          `,
      };

      await client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send(query)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeNull();
          expect(res.body.errors).toBeDefined();
          expect(res.body.errors[0].message).toBe(
            PermissionsExceptionMessage.CANNOT_UPDATE_SELF_ROLE,
          );
          expect(res.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
        });
    });

    it('should allow to update role when user has permission (admin role)', async () => {
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

      const resp = await client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send(getRolesQuery);

      const memberRoleId = resp.body.data.getRoles.find(
        // @ts-expect-error legacy noImplicitAny
        (role) => role.label === 'Member',
      ).id;

      const guestRoleId = resp.body.data.getRoles.find(
        // @ts-expect-error legacy noImplicitAny
        (role) => role.label === 'Guest',
      ).id;

      const updateRoleQuery = {
        query: `
          mutation UpdateWorkspaceMemberRole {
              updateWorkspaceMemberRole(workspaceMemberId: "${WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL}", roleId: "${memberRoleId}") {
                  id
              }
          }
        `,
      };

      await client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send(updateRoleQuery)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.errors).toBeUndefined();
          expect(res.body.data.updateWorkspaceMemberRole.id).toBe(
            WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
          );
        });

      const rollbackRoleUpdateQuery = {
        query: `
          mutation UpdateWorkspaceMemberRole {
              updateWorkspaceMemberRole(workspaceMemberId: "${WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL}", roleId: "${guestRoleId}") {
                  id
              }
          }
        `,
      };

      await client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send(rollbackRoleUpdateQuery)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.errors).toBeUndefined();
          expect(res.body.data.updateWorkspaceMemberRole.id).toBe(
            WORKSPACE_MEMBER_DATA_SEED_IDS.PHIL,
          );
        });
    });
  });

  describe('createRole', () => {
    it('should throw a permission error when user does not have permission to create roles (member role)', async () => {
      const query = {
        query: `
          mutation CreateOneRole {
              createOneRole(createRoleInput: {label: "test-role"}) {
                  id
              }
          }
        `,
      };

      await assertPermissionDeniedForMemberWithMemberRole({ query });
    });

    it('should create a role when user has permission to create a role (admin role)', async () => {
      const query = {
        query: `
          mutation CreateOneRole {
              createOneRole(createRoleInput: {label: "Test role"}) {
                  id
              }
          }
        `,
      };

      const result = await client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send(query)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.errors).toBeUndefined();
        });

      const createdRoleId = result.body.data.createOneRole.id;

      const deleteOneRoleQuery = deleteOneRoleOperationFactory(createdRoleId);

      await client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send(deleteOneRoleQuery);
    });
  });

  describe('updateRole', () => {
    let createdEditableRoleId: string;

    beforeAll(async () => {
      const query = {
        query: `
          mutation CreateOneRole {
              createOneRole(createRoleInput: {label: "Test role 2"}) {
                  id
              }
          }
        `,
      };

      await client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send(query)
        .then((res) => {
          createdEditableRoleId = res.body.data.createOneRole.id;
        });
    });

    afterAll(async () => {
      const deleteOneRoleQuery = deleteOneRoleOperationFactory(
        createdEditableRoleId,
      );

      await client
        .post('/metadata')
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
        .send(deleteOneRoleQuery);
    });

    describe('updateRole', () => {
      it('should throw a permission error when user does not have permission to update roles (member role)', async () => {
        const query = {
          query: `
          mutation UpdateOneRole {
              updateOneRole(updateRoleInput: {id: "${createdEditableRoleId}", update: {label: "new role label (1)"}}) {
                  id
              }
          }
        `,
        };

        await assertPermissionDeniedForMemberWithMemberRole({ query });
      });

      it('should update a role when user has permission to update a role (admin role)', async () => {
        const query = {
          query: `
          mutation UpdateOneRole {
              updateOneRole(updateRoleInput: {id: "${createdEditableRoleId}", update: {label: "new role label (3)"}}) {
                  id
                  label
              }
          }
        `,
        };

        await client
          .post('/metadata')
          .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
          .send(query)
          .expect(200)
          .expect((res) => {
            expect(res.body.data).toBeDefined();
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.updateOneRole.id).toBe(createdEditableRoleId);
            expect(res.body.data.updateOneRole.label).toBe(
              'new role label (3)',
            );
          });
      });
    });

    describe('upsertObjectPermission', () => {
      let listingObjectId = '';

      beforeAll(async () => {
        const { data } = await createOneObjectMetadata({
          expectToFail: false,
          input: {
            nameSingular: 'house',
            namePlural: 'houses',
            labelSingular: 'House',
            labelPlural: 'Houses',
            icon: 'IconBuildingSkyscraper',
          },
        });

        listingObjectId = data.createOneObject.id;
      });

      afterAll(async () => {
        await updateOneObjectMetadata({
          expectToFail: false,
          input: {
            idToUpdate: listingObjectId,
            updatePayload: {
              isActive: false,
            },
          },
        });
        await deleteOneObjectMetadata({
          expectToFail: false,
          input: { idToDelete: listingObjectId },
        });
      });

      const upsertObjectPermissionMutation = ({
        objectMetadataId,
        roleId,
      }: {
        objectMetadataId: string;
        roleId: string;
      }) => `
      mutation UpsertObjectPermissions {
          upsertObjectPermissions(upsertObjectPermissionsInput: { roleId: "${roleId}", objectPermissions: [{objectMetadataId: "${objectMetadataId}", canUpdateObjectRecords: true, canReadObjectRecords: true}]}) {
              objectMetadataId
              canUpdateObjectRecords
          }
      }
    `;

      it('should throw a permission error when user does not have permission to upsert object permission (member role)', async () => {
        const query = {
          query: upsertObjectPermissionMutation({
            objectMetadataId: listingObjectId,
            roleId: guestRoleId,
          }),
        };

        await assertPermissionDeniedForMemberWithMemberRole({ query });
      });

      it('should throw an error when role is not editable', async () => {
        const query = {
          query: upsertObjectPermissionMutation({
            objectMetadataId: listingObjectId,
            roleId: adminRoleId,
          }),
        };

        await client
          .post('/metadata')
          .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
          .send(query)
          .expect(200)
          .expect((res) => {
            expect(res.body.data).toBeNull();
            expect(res.body.errors).toBeDefined();
            expect(res.body.errors[0].extensions.code).toBe(
              ErrorCode.METADATA_VALIDATION_FAILED,
            );
            const objectPermissionErrors =
              res.body.errors[0].extensions.errors?.objectPermission ?? [];
            const hasRoleNotEditable = objectPermissionErrors.some(
              (failure: { errors?: Array<{ code?: string }> }) =>
                failure.errors?.some(
                  (err) =>
                    err.code === PermissionsExceptionCode.ROLE_NOT_EDITABLE,
                ),
            );
            expect(hasRoleNotEditable).toBe(true);
          });
      });

      it('should upsert an object permission when user has permission', async () => {
        const query = {
          query: upsertObjectPermissionMutation({
            objectMetadataId: listingObjectId,
            roleId: createdEditableRoleId,
          }),
        };

        await client
          .post('/metadata')
          .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
          .send(query)
          .expect(200)
          .expect((res) => {
            expect(res.body.data).toBeDefined();
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.upsertObjectPermissions).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  objectMetadataId: listingObjectId,
                  canUpdateObjectRecords: true,
                }),
              ]),
            );
          });
      });

      describe('upsertFieldPermissions', () => {
        it('should throw a permission error when user does not have permission to upsert field permission (member role)', async () => {
          const query = {
            query: `
              mutation UpsertFieldPermissions {
                upsertFieldPermissions(upsertFieldPermissionsInput: {roleId: "${guestRoleId}", fieldPermissions: [{objectMetadataId: "${listingObjectId}", fieldMetadataId: "${fieldTextMock.id}", canReadFieldValue: false, canUpdateFieldValue: false}]}) {
                  id
                  roleId
                  objectMetadataId
                  fieldMetadataId
                  canReadFieldValue
                  canUpdateFieldValue
                }
              }
            `,
          };

          await assertPermissionDeniedForMemberWithMemberRole({ query });
        });
      });
    });

    describe('upsertPermissionFlags', () => {
      const upsertSettingPermissionsMutation = ({
        roleId,
      }: {
        roleId: string;
      }) => `
      mutation UpsertPermissionFlags {
          upsertPermissionFlags(upsertPermissionFlagsInput: {roleId: "${roleId}", permissionFlagKeys: ["${PermissionFlagType.DATA_MODEL}"]}) {
              id
              roleId
              flag
          }
      }
    `;

      it('should throw a permission error when user does not have permission to upsert setting permission (member role)', async () => {
        const query = {
          query: upsertSettingPermissionsMutation({
            roleId: guestRoleId,
          }),
        };

        await assertPermissionDeniedForMemberWithMemberRole({ query });
      });

      it('should throw an error when role is not editable', async () => {
        const query = {
          query: upsertSettingPermissionsMutation({
            roleId: adminRoleId,
          }),
        };

        await client
          .post('/metadata')
          .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
          .send(query)
          .expect(200)
          .expect((res) => {
            expect(res.body.data).toBeNull();
            expect(res.body.errors).toBeDefined();
            expect(res.body.errors[0].extensions.code).toBe(
              ErrorCode.METADATA_VALIDATION_FAILED,
            );
            const rolePermissionFlagErrors =
              res.body.errors[0].extensions.errors?.rolePermissionFlag ?? [];
            const hasRoleNotEditable = rolePermissionFlagErrors.some(
              (failure: { errors?: Array<{ code?: string }> }) =>
                failure.errors?.some(
                  (err) =>
                    err.code === PermissionsExceptionCode.ROLE_NOT_EDITABLE,
                ),
            );
            expect(hasRoleNotEditable).toBe(true);
          });
      });

      it('should upsert a setting permission when user has permission', async () => {
        const query = {
          query: upsertSettingPermissionsMutation({
            roleId: createdEditableRoleId,
          }),
        };

        await client
          .post('/metadata')
          .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
          .send(query)
          .expect(200)
          .expect((res) => {
            expect(res.body.data).toBeDefined();
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.upsertPermissionFlags).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  roleId: createdEditableRoleId,
                  flag: PermissionFlagType.DATA_MODEL,
                }),
              ]),
            );
          });
      });
    });
  });
});
