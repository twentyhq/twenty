import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { ObjectRecordsPermissionsByRoleId } from 'twenty-shared/types';
import { In, Repository } from 'typeorm';

import {
  fieldTextMock,
  objectMetadataItemMock,
} from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { UpsertFieldPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-field-permissions.input';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { FieldPermissionService } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { getMockFieldMetadataEntity } from 'src/utils/__test__/get-field-metadata-entity.mock';

describe('FieldPermissionService', () => {
  let service: FieldPermissionService;
  let fieldPermissionsRepository: jest.Mocked<
    Repository<FieldPermissionEntity>
  >;
  let roleRepository: jest.Mocked<Repository<RoleEntity>>;
  let workspacePermissionsCacheService: jest.Mocked<WorkspacePermissionsCacheService>;
  let workspaceCacheStorageService: jest.Mocked<WorkspaceCacheStorageService>;

  const testWorkspaceId = '20202020-0000-0000-0000-000000000000';
  const testRoleId = '20202020-0000-0000-0000-000000000001';
  const testObjectMetadataId = '20202020-0000-0000-0000-000000000002';
  const testFieldMetadataId = fieldTextMock.id;

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
          [testObjectMetadataId]: {
            ...objectMetadataItemMock,
            fieldsById: {
              [fieldTextMock.id]: getMockFieldMetadataEntity({
                ...fieldTextMock,
                label: 'Test Field',
                objectMetadataId: testObjectMetadataId,
                workspaceId: testWorkspaceId,
                id: '20202020-0000-0000-0000-000000000003',
              }),
            },
            fieldIdByJoinColumnName: {},
            fieldIdByName: {},
            indexMetadatas: [],
          },
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
      fieldPermissions: {
        canReadFieldValue?: boolean | null;
        canUpdateFieldValue?: boolean | null;
        objectMetadataId?: string;
        fieldMetadataId?: string;
      }[],
    ): UpsertFieldPermissionsInput => ({
      roleId: testRoleId,
      fieldPermissions: fieldPermissions.map((fieldPermission) => ({
        objectMetadataId: testObjectMetadataId,
        fieldMetadataId: testFieldMetadataId,
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

        await service.upsertFieldPermissions({
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
      });

      it('should delete field permissions when both canReadFieldValue and canUpdateFieldValue are null', async () => {
        const existingFieldPermission: FieldPermissionEntity = {
          id: 'existing-field-permission-id',
          roleId: testRoleId,
          objectMetadataId: testObjectMetadataId,
          fieldMetadataId: testFieldMetadataId,
          canReadFieldValue: null,
          canUpdateFieldValue: false,
          workspaceId: testWorkspaceId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as unknown as FieldPermissionEntity;

        fieldPermissionsRepository.find.mockResolvedValue([
          existingFieldPermission,
        ]);

        const input = createUpsertInput([
          {
            canUpdateFieldValue: null,
          },
        ]);

        await service.upsertFieldPermissions({
          workspaceId: testWorkspaceId,
          input,
        });

        expect(fieldPermissionsRepository.delete).toHaveBeenCalledWith({
          id: In(['existing-field-permission-id']),
        });
      });

      it('should not delete field permissions when one value is null and the other is false', async () => {
        const existingFieldPermission: FieldPermissionEntity = {
          id: 'existing-field-permission-id',
          roleId: testRoleId,
          objectMetadataId: testObjectMetadataId,
          fieldMetadataId: testFieldMetadataId,
          canReadFieldValue: false,
          canUpdateFieldValue: null,
          workspaceId: testWorkspaceId,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as FieldPermissionEntity;

        fieldPermissionsRepository.find.mockResolvedValue([
          existingFieldPermission,
        ]);

        const input = createUpsertInput([
          {
            canUpdateFieldValue: false,
            canReadFieldValue: null,
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
        const systemObjectMetadata = {
          ...objectMetadataItemMock,
          isSystem: true,
        };

        workspaceCacheStorageService.getObjectMetadataMapsOrThrow.mockResolvedValue(
          {
            byId: {
              [testObjectMetadataId]: {
                ...systemObjectMetadata,
                fieldsById: {},
                fieldIdByJoinColumnName: {},
                fieldIdByName: {},
                indexMetadatas: [],
              },
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
        const objectMetadataWithoutField = {
          ...objectMetadataItemMock,
          fieldsById: {},
          fieldIdByJoinColumnName: {},
          fieldIdByName: {},
          indexMetadatas: [],
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
            version: '1',
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

      it('should throw error when object is not readable (permission wise)', async () => {
        const nonReadableObjectPermissions: ObjectRecordsPermissionsByRoleId = {
          [testRoleId]: {
            [testObjectMetadataId]: {
              canRead: false,
              canUpdate: false,
              canSoftDelete: false,
              canDestroy: false,
              restrictedFields: {},
            },
          },
        };

        workspacePermissionsCacheService.getRolesPermissionsFromCache.mockResolvedValue(
          {
            version: '1',
            data: nonReadableObjectPermissions,
          },
        );

        const input = createUpsertInput([
          {
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
            version: '1',
            data: nonUpdatableObjectPermissions,
          },
        );

        const input = createUpsertInput([
          {
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
            canReadFieldValue: null,
            canUpdateFieldValue: null,
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
  });
});
