import request from 'supertest';
import { deleteOneRoleOperationFactory } from 'test/integration/graphql/utils/delete-one-role-operation-factory.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { deleteOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/delete-one-object-metadata.util';
import { updateOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/update-one-object-metadata.util';
import { PermissionFlagType } from 'twenty-shared/constants';

import { fieldTextMock } from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const client = request(`http://localhost:${APP_PORT}`);

async function assertPermissionDeniedForMemberWithMemberRole({
  query,
}: {
  query: { query: string };
}) {
  await client
    .post('/graphql')
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
      .post('/graphql')
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
        .post('/graphql')
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
        .post('/graphql')
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

      // Act and assert
      await client
        .post('/graphql')
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

      // Clean
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
        .post('/graphql')
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
        .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
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
        .post('/graphql')
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
        .post('/graphql')
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
          .post('/graphql')
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
          .post('/graphql')
          .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
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
          upsertPermissionFlags(upsertPermissionFlagsInput: {roleId: "${roleId}", permissionFlagKeys: [${PermissionFlagType.DATA_MODEL}]}) {
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
          .post('/graphql')
          .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
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
