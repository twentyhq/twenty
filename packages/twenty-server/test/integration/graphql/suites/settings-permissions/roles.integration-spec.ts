import request from 'supertest';
import { deleteOneRoleOperationFactory } from 'test/integration/graphql/utils/delete-one-role-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateFeatureFlagFactory } from 'test/integration/graphql/utils/update-feature-flag-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';

import { SEED_APPLE_WORKSPACE_ID } from 'src/database/typeorm-seeds/core/workspaces';
import { DEV_SEED_WORKSPACE_MEMBER_IDS } from 'src/database/typeorm-seeds/workspace/workspace-members';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';

const client = request(`http://localhost:${APP_PORT}`);

async function assertPermissionDeniedForMemberWithMemberRole({
  query,
}: {
  query: { query: string };
}) {
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
}

describe('roles permissions', () => {
  let adminRoleId: string;
  let guestRoleId: string;

  beforeAll(async () => {
    const enablePermissionsV2Query = updateFeatureFlagFactory(
      SEED_APPLE_WORKSPACE_ID,
      'IsPermissionsV2Enabled',
      true,
    );

    await makeGraphqlAPIRequest(enablePermissionsV2Query);

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
      .post('/graphql')
      .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
      .send(query);

    adminRoleId = resp.body.data.getRoles.find(
      (role) => role.label === 'Admin',
    ).id;

    guestRoleId = resp.body.data.getRoles.find(
      (role) => role.label === 'Guest',
    ).id;
  });

  afterAll(async () => {
    const disablePermissionsQuery = updateFeatureFlagFactory(
      SEED_APPLE_WORKSPACE_ID,
      'IsPermissionsEnabled',
      false,
    );

    const disablePermissionsV2Query = updateFeatureFlagFactory(
      SEED_APPLE_WORKSPACE_ID,
      'IsPermissionsV2Enabled',
      false,
    );

    await makeGraphqlAPIRequest(disablePermissionsQuery);
    await makeGraphqlAPIRequest(disablePermissionsV2Query);
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

      await assertPermissionDeniedForMemberWithMemberRole({ query });
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
      // Act and assert
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
        .post('/graphql')
        .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
        .send(query)
        .expect(200)
        .expect((res) => {
          expect(res.body.data).toBeDefined();
          expect(res.body.errors).toBeUndefined();
        });

      const createdRoleId = result.body.data.createOneRole.id;

      // Clean
      const deleteOneRoleQuery = deleteOneRoleOperationFactory(createdRoleId);

      await client
        .post('/graphql')
        .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
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
        .post('/graphql')
        .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
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
        .post('/graphql')
        .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
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

      it('should throw an error when role is not editable', async () => {
        const query = {
          query: `
          mutation UpdateOneRole {
              updateOneRole(updateRoleInput: {id: "${adminRoleId}", update: {label: "new role label (2)"}}) {
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
              PermissionsExceptionMessage.ROLE_NOT_EDITABLE,
            );
            expect(res.body.errors[0].extensions.code).toBe(
              ErrorCode.FORBIDDEN,
            );
          });
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
          .post('/graphql')
          .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
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
        await deleteOneObjectMetadata({
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
          upsertOneObjectPermission(upsertObjectPermissionInput: {objectMetadataId: "${objectMetadataId}", roleId: "${roleId}", canUpdateObjectRecords: true}) {
              id
              roleId
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
          .post('/graphql')
          .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
          .send(query)
          .expect(200)
          .expect((res) => {
            expect(res.body.data).toBeNull();
            expect(res.body.errors).toBeDefined();
            expect(res.body.errors[0].message).toBe(
              PermissionsExceptionMessage.ROLE_NOT_EDITABLE,
            );
            expect(res.body.errors[0].extensions.code).toBe(
              ErrorCode.FORBIDDEN,
            );
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
          .post('/graphql')
          .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
          .send(query)
          .expect(200)
          .expect((res) => {
            expect(res.body.data).toBeDefined();
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.upsertOneObjectPermission.roleId).toBe(
              createdEditableRoleId,
            );
            expect(
              res.body.data.upsertOneObjectPermission.canUpdateObjectRecords,
            ).toBe(true);
          });
      });
    });

    describe('upsertSettingPermissions', () => {
      const upsertSettingPermissionsMutation = ({
        roleId,
      }: {
        roleId: string;
      }) => `
      mutation UpsertSettingPermissions {
          upsertSettingPermissions(upsertSettingPermissionsInput: {roleId: "${roleId}", settingPermissionKeys: [${SettingPermissionType.DATA_MODEL}]}) {
              id
              roleId
              setting
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
          .post('/graphql')
          .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
          .send(query)
          .expect(200)
          .expect((res) => {
            expect(res.body.data).toBeNull();
            expect(res.body.errors).toBeDefined();
            expect(res.body.errors[0].message).toBe(
              PermissionsExceptionMessage.ROLE_NOT_EDITABLE,
            );
            expect(res.body.errors[0].extensions.code).toBe(
              ErrorCode.FORBIDDEN,
            );
          });
      });

      it('should upsert a setting permission when user has permission', async () => {
        const query = {
          query: upsertSettingPermissionsMutation({
            roleId: createdEditableRoleId,
          }),
        };

        await client
          .post('/graphql')
          .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
          .send(query)
          .expect(200)
          .expect((res) => {
            expect(res.body.data).toBeDefined();
            expect(res.body.errors).toBeUndefined();
            expect(res.body.data.upsertSettingPermissions).toEqual(
              expect.arrayContaining([
                expect.objectContaining({
                  roleId: createdEditableRoleId,
                  setting: SettingPermissionType.DATA_MODEL,
                }),
              ]),
            );
          });
      });
    });
  });
});
