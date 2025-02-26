import request from 'supertest';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/database/typeorm-seeds/core/workspaces';
import { DEV_SEED_WORKSPACE_MEMBER_IDS } from 'src/database/typeorm-seeds/workspace/workspace-members';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

const client = request(`http://localhost:${APP_PORT}`);

describe('roles permissions', () => {
  beforeAll(async () => {
    const enablePermissionsQuery = updateFeatureFlagFactory(
      SEED_APPLE_WORKSPACE_ID,
      'IsPermissionsEnabled',
      true,
    );

    await makeGraphqlAPIRequest(enablePermissionsQuery);
  });

  afterAll(async () => {
    const disablePermissionsQuery = updateFeatureFlagFactory(
      SEED_APPLE_WORKSPACE_ID,
      'IsPermissionsEnabled',
      false,
    );

    await makeGraphqlAPIRequest(disablePermissionsQuery);
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
        .post('/graphql')
        .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
        .send(query);

      expect(resp.status).toBe(200);
      expect(resp.body.errors).toBeUndefined();
      expect(resp.body.data.getRoles).toHaveLength(3);
      expect(resp.body.data.getRoles).toEqual(
        expect.arrayContaining([
          {
            label: 'Guest',
            workspaceMembers: [
              {
                id: '20202020-1553-45c6-a028-5a9064cce07f',
                name: {
                  firstName: 'Phil',
                  lastName: 'Schiler',
                },
              },
            ],
          },
          {
            label: 'Admin',
            workspaceMembers: [
              {
                id: '20202020-0687-4c41-b707-ed1bfca972a7',
                name: {
                  firstName: 'Tim',
                  lastName: 'Apple',
                },
              },
            ],
          },
          {
            label: 'Member',
            workspaceMembers: [
              {
                id: '20202020-77d5-4cb6-b60a-f4a835a85d61',
                name: {
                  firstName: 'Jony',
                  lastName: 'Ive',
                },
              },
            ],
          },
        ]),
      );
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

      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${MEMBER_ACCESS_TOKEN}`)
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

      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${MEMBER_ACCESS_TOKEN}`)
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
    });

    it('should throw a permission error when tries to update their own role (admin role)', async () => {
      const query = {
        query: `
            mutation UpdateWorkspaceMemberRole {
                updateWorkspaceMemberRole(workspaceMemberId: "${DEV_SEED_WORKSPACE_MEMBER_IDS.TIM}", roleId: "test-role-id") {
                    id
                }
            }
          `,
      };

      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
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
      // Arrange
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
        .post('/graphql')
        .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
        .send(getRolesQuery);

      const memberRoleId = resp.body.data.getRoles.find(
        (role) => role.label === 'Member',
      ).id;

      const guestRoleId = resp.body.data.getRoles.find(
        (role) => role.label === 'Guest',
      ).id;

      const updateRoleQuery = {
        query: `
          mutation UpdateWorkspaceMemberRole {
              updateWorkspaceMemberRole(workspaceMemberId: "${DEV_SEED_WORKSPACE_MEMBER_IDS.PHIL}", roleId: "${memberRoleId}") {
                  id
              }
          }
        `,
      };

      // Act and assert
      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
        .send(updateRoleQuery)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.errors).toBeUndefined();
          expect(res.body.data.updateWorkspaceMemberRole.id).toBe(
            DEV_SEED_WORKSPACE_MEMBER_IDS.PHIL,
          );
        });

      // Clean
      const rollbackRoleUpdateQuery = {
        query: `
          mutation UpdateWorkspaceMemberRole {
              updateWorkspaceMemberRole(workspaceMemberId: "${DEV_SEED_WORKSPACE_MEMBER_IDS.PHIL}", roleId: "${guestRoleId}") {
                  id
              }
          }
        `,
      };

      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
        .send(rollbackRoleUpdateQuery)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.errors).toBeUndefined();
          expect(res.body.data.updateWorkspaceMemberRole.id).toBe(
            DEV_SEED_WORKSPACE_MEMBER_IDS.PHIL,
          );
        });
    });
  });
});
