import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ObjectRecordsPermissionsByRoleId } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { objectMetadataItemMock } from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { UpsertFieldPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-field-permissions.input';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { FieldPermissionService } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.service';
import {
    PermissionsException,
    PermissionsExceptionCode,
    PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

describe('FieldPermissionService', () => {
  let service: FieldPermissionService;
  let fieldPermissionsRepository: jest.Mocked<
    Repository<FieldPermissionEntity>
  >;
  let roleRepository: jest.Mocked<Repository<RoleEntity>>;
  let workspacePermissionsCacheService: jest.Mocked<WorkspacePermissionsCacheService>;
  let workspaceCacheStorageService: jest.Mocked<WorkspaceCacheStorageService>;

  const testWorkspaceId = 'test-workspace-id';
  const testRoleId = 'test-role-id';
  const testObjectMetadataId = 'test-object-metadata-id';
  const testFieldMetadataId = 'test-field-metadata-id';

  const mockRole: RoleEntity = {
    id: testRoleId,
    label: 'Test Role',
    description: 'Test role for unit tests',
    canUpdateAllSettings: false,
    canReadAllObjectRecords: true,
    canUpdateAllObjectRecords: false,
    canSoftDeleteAllObjectRecords: false,
    canDestroyAllObjectRecords: false,
    workspaceId: testWorkspaceId,
    createdAt: new Date(),
    updatedAt: new Date(),
    isEditable: true,
  } as RoleEntity;

  //   const objectMetadataItemMock: ObjectMetadataItemWithFieldMaps = {
  //     id: testObjectMetadataId,
  //     workspaceId: testWorkspaceId,
  //     nameSingular: 'testObject',
  //     namePlural: 'testObjects',
  //     labelSingular: 'Test Object',
  //     labelPlural: 'Test Objects',
  //     description: 'Test object for unit tests',
  //     icon: 'IconTest',
  //     targetTableName: 'test_object',
  //     isSystem: false,
  //     isCustom: false,
  //     isActive: true,
  //     isRemote: false,
  //     isAuditLogged: false,
  //     isSearchable: true,
  //     fieldsById: {
  //       [testFieldMetadataId]: {
  //         id: testFieldMetadataId,
  //         name: 'testField',
  //         type: 'TEXT',
  //         isSystem: false,
  //         workspaceId: testWorkspaceId,
  //         objectMetadataId: testObjectMetadataId,
  //         label: 'Test Field',
  //         description: 'Test field for unit tests',
  //         icon: 'IconTest',
  //         placeholder: 'Test placeholder',
  //         isCustom: false,
  //         isActive: true,
  //         isNullable: true,
  //         defaultValue: null,
  //         options: null,
  //         targetColumnMap: {},
  //         settings: {},
  //         createdAt: new Date(),
  //         updatedAt: new Date(),
  //       },
  //     },
  //     fieldIdByJoinColumnName: {},
  //     fieldIdByName: {},
  //     indexMetadatas: [],
  //   } as ObjectMetadataItemWithFieldMaps;

  const mockRolesPermissions: ObjectRecordsPermissionsByRoleId = {
    [testRoleId]: {
      [testObjectMetadataId]: {
        canRead: true,
        canUpdate: true,
        canSoftDelete: false,
        canDestroy: false,
        restrictedFields: {},
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldPermissionService,
        {
          provide: getRepositoryToken(RoleEntity, 'core'),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FieldPermissionEntity, 'core'),
          useValue: {
            find: jest.fn(),
            upsert: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: WorkspacePermissionsCacheService,
          useValue: {
            getRolesPermissionsFromCache: jest.fn(),
            recomputeRolesPermissionsCache: jest.fn(),
          },
        },
        {
          provide: WorkspaceCacheStorageService,
          useValue: {
            getObjectMetadataMapsOrThrow: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FieldPermissionService>(FieldPermissionService);
    fieldPermissionsRepository = module.get(
      getRepositoryToken(FieldPermissionEntity, 'core'),
    );
    roleRepository = module.get(getRepositoryToken(RoleEntity, 'core'));
    workspacePermissionsCacheService = module.get(
      WorkspacePermissionsCacheService,
    );
    workspaceCacheStorageService = module.get(WorkspaceCacheStorageService);

    // Setup default mocks
    roleRepository.findOne.mockResolvedValue(mockRole);
    workspacePermissionsCacheService.getRolesPermissionsFromCache.mockResolvedValue(
      {
        version: '1',
        data: mockRolesPermissions,
      },
    );
    workspaceCacheStorageService.getObjectMetadataMapsOrThrow.mockResolvedValue(
      {
        byId: {
          [testObjectMetadataId]: objectMetadataItemMock,
        },
        idByNameSingular: {
          testObject: testObjectMetadataId,
        },
      },
    );
    fieldPermissionsRepository.find.mockResolvedValue([]);
    fieldPermissionsRepository.upsert.mockResolvedValue({} as any);
    fieldPermissionsRepository.delete.mockResolvedValue({} as any);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upsertFieldPermissions', () => {
    const createUpsertInput = (
      fieldPermissions: Partial<
        UpsertFieldPermissionsInput['fieldPermissions'][0]
      >[],
    ): UpsertFieldPermissionsInput => ({
      roleId: testRoleId,
      fieldPermissions: fieldPermissions.map((fieldPermission) => ({
        objectMetadataId: testObjectMetadataId,
        fieldMetadataId: testFieldMetadataId,
        canReadFieldValue: false,
        canUpdateFieldValue: false,
        ...fieldPermission,
      })),
    });

    describe('successful cases', () => {
      it('should successfully upsert field permissions', async () => {
        const input = createUpsertInput([
          {
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ]);

        const result = await service.upsertFieldPermissions({
          workspaceId: testWorkspaceId,
          input,
        });

        expect(fieldPermissionsRepository.upsert).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              roleId: testRoleId,
              workspaceId: testWorkspaceId,
              objectMetadataId: testObjectMetadataId,
              fieldMetadataId: testFieldMetadataId,
              canReadFieldValue: false,
              canUpdateFieldValue: false,
            }),
          ]),
          {
            conflictPaths: ['fieldMetadataId', 'roleId'],
          },
        );

        expect(
          workspacePermissionsCacheService.recomputeRolesPermissionsCache,
        ).toHaveBeenCalledWith({
          workspaceId: testWorkspaceId,
          roleIds: [testRoleId],
        });

        expect(result).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              roleId: testRoleId,
              workspaceId: testWorkspaceId,
              objectMetadataId: testObjectMetadataId,
              fieldMetadataId: testFieldMetadataId,
              canReadFieldValue: false,
              canUpdateFieldValue: false,
            }),
          ]),
        );
      });

      it('should delete field permissions when both canReadFieldValue and canUpdateFieldValue are null', async () => {
        const existingFieldPermission: FieldPermissionEntity = {
          id: 'existing-field-permission-id',
          roleId: testRoleId,
          objectMetadataId: testObjectMetadataId,
          fieldMetadataId: testFieldMetadataId,
          canReadFieldValue: false,
          canUpdateFieldValue: false,
          workspaceId: testWorkspaceId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as FieldPermissionEntity;

        fieldPermissionsRepository.find.mockResolvedValue([
          existingFieldPermission,
        ]);

        const input = createUpsertInput([
          {
            canReadFieldValue: null,
            canUpdateFieldValue: null,
          },
        ]);

        await service.upsertFieldPermissions({
          workspaceId: testWorkspaceId,
          input,
        });

        expect(fieldPermissionsRepository.delete).toHaveBeenCalledWith({
          id: ['existing-field-permission-id'],
        });
      });

      it('should not delete field permissions when one value is null and the other is false', async () => {
        const existingFieldPermission: FieldPermissionEntity = {
          id: 'existing-field-permission-id',
          roleId: testRoleId,
          objectMetadataId: testObjectMetadataId,
          fieldMetadataId: testFieldMetadataId,
          canReadFieldValue: false,
          canUpdateFieldValue: false,
          workspaceId: testWorkspaceId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as FieldPermissionEntity;

        fieldPermissionsRepository.find.mockResolvedValue([
          existingFieldPermission,
        ]);

        const input = createUpsertInput([
          {
            canReadFieldValue: undefined,
            canUpdateFieldValue: false,
          },
        ]);

        await service.upsertFieldPermissions({
          workspaceId: testWorkspaceId,
          input,
        });

        expect(fieldPermissionsRepository.delete).not.toHaveBeenCalled();
      });
    });

    describe('validation errors', () => {
      it('should throw error when canReadFieldValue is true', async () => {
        const input = createUpsertInput([
          {
            canReadFieldValue: true,
            canUpdateFieldValue: false,
          },
        ]);

        await expect(
          service.upsertFieldPermissions({
            workspaceId: testWorkspaceId,
            input,
          }),
        ).rejects.toThrow(
          new PermissionsException(
            PermissionsExceptionMessage.ONLY_FIELD_RESTRICTION_ALLOWED,
            PermissionsExceptionCode.ONLY_FIELD_RESTRICTION_ALLOWED,
          ),
        );
      });

      it('should throw error when canUpdateFieldValue is true', async () => {
        const input = createUpsertInput([
          {
            canReadFieldValue: false,
            canUpdateFieldValue: true,
          },
        ]);

        await expect(
          service.upsertFieldPermissions({
            workspaceId: testWorkspaceId,
            input,
          }),
        ).rejects.toThrow(
          new PermissionsException(
            PermissionsExceptionMessage.ONLY_FIELD_RESTRICTION_ALLOWED,
            PermissionsExceptionCode.ONLY_FIELD_RESTRICTION_ALLOWED,
          ),
        );
      });

      it('should throw error when object metadata is not found', async () => {
        workspaceCacheStorageService.getObjectMetadataMapsOrThrow.mockResolvedValue(
          {
            byId: {},
            idByNameSingular: {},
          },
        );

        const input = createUpsertInput([
          {
            objectMetadataId: 'non-existent-object',
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ]);

        await expect(
          service.upsertFieldPermissions({
            workspaceId: testWorkspaceId,
            input,
          }),
        ).rejects.toThrow(
          new PermissionsException(
            PermissionsExceptionMessage.OBJECT_METADATA_NOT_FOUND,
            PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
          ),
        );
      });

      it('should throw error when trying to add field permission on system object', async () => {
        const systemObjectMetadata: ObjectMetadataItemWithFieldMaps = {
          ...objectMetadataItemMock,
          isSystem: true,
        };

        workspaceCacheStorageService.getObjectMetadataMapsOrThrow.mockResolvedValue(
          {
            byId: {
              [testObjectMetadataId]: systemObjectMetadata,
            },
            idByNameSingular: {
              testObject: testObjectMetadataId,
            },
          },
        );

        const input = createUpsertInput([
          {
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ]);

        await expect(
          service.upsertFieldPermissions({
            workspaceId: testWorkspaceId,
            input,
          }),
        ).rejects.toThrow(
          new PermissionsException(
            PermissionsExceptionMessage.CANNOT_ADD_FIELD_PERMISSION_ON_SYSTEM_OBJECT,
            PermissionsExceptionCode.CANNOT_ADD_FIELD_PERMISSION_ON_SYSTEM_OBJECT,
          ),
        );
      });

      it('should throw error when field metadata is not found', async () => {
        const objectMetadataWithoutField: ObjectMetadataItemWithFieldMaps = {
          ...objectMetadataItemMock,
          fieldsById: {},
        };

        workspaceCacheStorageService.getObjectMetadataMapsOrThrow.mockResolvedValue(
          {
            byId: {
              [testObjectMetadataId]: objectMetadataWithoutField,
            },
            idByNameSingular: {
              testObject: testObjectMetadataId,
            },
          },
        );

        const input = createUpsertInput([
          {
            fieldMetadataId: 'non-existent-field',
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ]);

        await expect(
          service.upsertFieldPermissions({
            workspaceId: testWorkspaceId,
            input,
          }),
        ).rejects.toThrow(
          new PermissionsException(
            PermissionsExceptionMessage.FIELD_METADATA_NOT_FOUND,
            PermissionsExceptionCode.FIELD_METADATA_NOT_FOUND,
          ),
        );
      });

      it('should throw error when object permission is not found', async () => {
        workspacePermissionsCacheService.getRolesPermissionsFromCache.mockResolvedValue(
          {
            version: undefined,
            data: {},
          },
        );

        const input = createUpsertInput([
          {
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ]);

        await expect(
          service.upsertFieldPermissions({
            workspaceId: testWorkspaceId,
            input,
          }),
        ).rejects.toThrow(
          new PermissionsException(
            PermissionsExceptionMessage.OBJECT_PERMISSION_NOT_FOUND,
            PermissionsExceptionCode.OBJECT_PERMISSION_NOT_FOUND,
          ),
        );
      });

      it('should throw error when object is not readable', async () => {
        const nonReadableObjectPermissions: ObjectRecordsPermissionsByRoleId = {
          [testRoleId]: {
            [testObjectMetadataId]: {
              canRead: false,
              canUpdate: true,
              canSoftDelete: false,
              canDestroy: false,
              restrictedFields: {},
            },
          },
        };

        workspacePermissionsCacheService.getRolesPermissionsFromCache.mockResolvedValue(
          {
            version: undefined,
            data: nonReadableObjectPermissions,
          },
        );

        const input = createUpsertInput([
          {
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ]);

        await expect(
          service.upsertFieldPermissions({
            workspaceId: testWorkspaceId,
            input,
          }),
        ).rejects.toThrow(
          new PermissionsException(
            PermissionsExceptionMessage.FIELD_RESTRICTION_ONLY_ALLOWED_ON_READABLE_OBJECT,
            PermissionsExceptionCode.FIELD_RESTRICTION_ONLY_ALLOWED_ON_READABLE_OBJECT,
          ),
        );
      });

      it('should throw error when trying to restrict update on non-updatable object', async () => {
        const nonUpdatableObjectPermissions: ObjectRecordsPermissionsByRoleId =
          {
            [testRoleId]: {
              [testObjectMetadataId]: {
                canRead: true,
                canUpdate: false,
                canSoftDelete: false,
                canDestroy: false,
                restrictedFields: {},
              },
            },
          };

        workspacePermissionsCacheService.getRolesPermissionsFromCache.mockResolvedValue(
          {
            version: undefined,
            data: nonUpdatableObjectPermissions,
          },
        );

        const input = createUpsertInput([
          {
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ]);

        await expect(
          service.upsertFieldPermissions({
            workspaceId: testWorkspaceId,
            input,
          }),
        ).rejects.toThrow(
          new PermissionsException(
            PermissionsExceptionMessage.FIELD_RESTRICTION_ON_UPDATE_ONLY_ALLOWED_ON_UPDATABLE_OBJECT,
            PermissionsExceptionCode.FIELD_RESTRICTION_ON_UPDATE_ONLY_ALLOWED_ON_UPDATABLE_OBJECT,
          ),
        );
      });

      it('should throw error when both canReadFieldValue and canUpdateFieldValue are null', async () => {
        const input = createUpsertInput([
          {
            canReadFieldValue: undefined,
            canUpdateFieldValue: undefined,
          },
        ]);

        await expect(
          service.upsertFieldPermissions({
            workspaceId: testWorkspaceId,
            input,
          }),
        ).rejects.toThrow(
          new PermissionsException(
            PermissionsExceptionMessage.EMPTY_FIELD_PERMISSION_NOT_ALLOWED,
            PermissionsExceptionCode.EMPTY_FIELD_PERMISSION_NOT_ALLOWED,
          ),
        );
      });
    });

    describe('role validation errors', () => {
      it('should throw error when role is not found', async () => {
        roleRepository.findOne.mockResolvedValue(null);

        const input = createUpsertInput([
          {
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ]);

        await expect(
          service.upsertFieldPermissions({
            workspaceId: testWorkspaceId,
            input,
          }),
        ).rejects.toThrow(
          new PermissionsException(
            PermissionsExceptionMessage.ROLE_NOT_FOUND,
            PermissionsExceptionCode.ROLE_NOT_FOUND,
          ),
        );
      });

      it('should throw error when role is not editable', async () => {
        const nonEditableRole: RoleEntity = {
          ...mockRole,
          isEditable: false,
        };

        roleRepository.findOne.mockResolvedValue(nonEditableRole);

        const input = createUpsertInput([
          {
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ]);

        await expect(
          service.upsertFieldPermissions({
            workspaceId: testWorkspaceId,
            input,
          }),
        ).rejects.toThrow(
          new PermissionsException(
            PermissionsExceptionMessage.ROLE_NOT_EDITABLE,
            PermissionsExceptionCode.ROLE_NOT_EDITABLE,
          ),
        );
      });
    });

    describe('cleanup', () => {
      it('should clean up created field permissions after test', async () => {
        const input = createUpsertInput([
          {
            canReadFieldValue: false,
            canUpdateFieldValue: false,
          },
        ]);

        // Mock the find method to return the created field permissions
        const createdFieldPermission: FieldPermissionEntity = {
          id: 'created-field-permission-id',
          roleId: testRoleId,
          objectMetadataId: testObjectMetadataId,
          fieldMetadataId: testFieldMetadataId,
          canReadFieldValue: false,
          canUpdateFieldValue: false,
          workspaceId: testWorkspaceId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as FieldPermissionEntity;

        fieldPermissionsRepository.find.mockResolvedValue([
          createdFieldPermission,
        ]);

        await service.upsertFieldPermissions({
          workspaceId: testWorkspaceId,
          input,
        });

        // Verify that the service properly handles the cleanup
        expect(fieldPermissionsRepository.find).toHaveBeenCalledWith({
          where: {
            roleId: testRoleId,
            objectMetadataId: expect.any(Array),
            workspaceId: testWorkspaceId,
          },
        });
      });
    });
  });
});
