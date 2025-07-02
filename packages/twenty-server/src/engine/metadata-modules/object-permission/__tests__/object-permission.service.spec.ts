import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { UpsertObjectPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-object-permissions.input';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

describe('ObjectPermissionService', () => {
  let service: ObjectPermissionService;
  let objectPermissionRepository: jest.Mocked<
    Repository<ObjectPermissionEntity>
  >;
  let roleRepository: jest.Mocked<Repository<RoleEntity>>;
  let workspacePermissionsCacheService: jest.Mocked<WorkspacePermissionsCacheService>;
  let workspaceCacheStorageService: jest.Mocked<WorkspaceCacheStorageService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObjectPermissionService,
        {
          provide: getRepositoryToken(ObjectPermissionEntity, 'core'),
          useValue: {
            upsert: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RoleEntity, 'core'),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ObjectMetadataEntity, 'core'),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: WorkspacePermissionsCacheService,
          useValue: {
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

    service = module.get<ObjectPermissionService>(ObjectPermissionService);
    objectPermissionRepository = module.get(
      getRepositoryToken(ObjectPermissionEntity, 'core'),
    );
    roleRepository = module.get(getRepositoryToken(RoleEntity, 'core'));
    workspacePermissionsCacheService = module.get(
      WorkspacePermissionsCacheService,
    );
    workspaceCacheStorageService = module.get(WorkspaceCacheStorageService);
  });

  describe('upsertObjectPermissions', () => {
    const workspaceId = 'workspace-id';
    const roleId = 'role-id';
    const systemObjectMetadataId = 'system-object-id';
    const customObjectMetadataId = 'custom-object-id';

    beforeEach(() => {
      // Mock role validation
      roleRepository.findOne.mockResolvedValue({
        id: roleId,
        workspaceId,
        isEditable: true,
        objectPermissions: [],
      } as unknown as RoleEntity);
    });

    it('should throw PermissionsException when trying to add object permission on system object', async () => {
      // Arrange
      const input: UpsertObjectPermissionsInput = {
        roleId,
        objectPermissions: [
          {
            objectMetadataId: systemObjectMetadataId,
            canReadObjectRecords: true,
            canUpdateObjectRecords: false,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          },
        ],
      };

      // Mock object metadata maps with a system object
      workspaceCacheStorageService.getObjectMetadataMapsOrThrow.mockResolvedValue(
        {
          byId: {
            [systemObjectMetadataId]: {
              id: systemObjectMetadataId,
              isSystem: true,
              workspaceId,
            } as ObjectMetadataItemWithFieldMaps,
          },
          idByNameSingular: {},
        },
      );

      // Act & Assert
      await expect(
        service.upsertObjectPermissions({
          workspaceId,
          input,
        }),
      ).rejects.toThrow(
        new PermissionsException(
          PermissionsExceptionMessage.CANNOT_ADD_OBJECT_PERMISSION_ON_SYSTEM_OBJECT,
          PermissionsExceptionCode.CANNOT_ADD_OBJECT_PERMISSION_ON_SYSTEM_OBJECT,
        ),
      );

      // Verify that upsert was never called
      expect(objectPermissionRepository.upsert).not.toHaveBeenCalled();
      expect(
        workspacePermissionsCacheService.recomputeRolesPermissionsCache,
      ).not.toHaveBeenCalled();
    });

    it('should successfully create object permission for custom (non-system) object', async () => {
      // Arrange
      const input: UpsertObjectPermissionsInput = {
        roleId,
        objectPermissions: [
          {
            objectMetadataId: customObjectMetadataId,
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          },
        ],
      };

      // Mock object metadata maps with a custom object
      workspaceCacheStorageService.getObjectMetadataMapsOrThrow.mockResolvedValue(
        {
          byId: {
            [customObjectMetadataId]: {
              id: customObjectMetadataId,
              isSystem: false,
              workspaceId,
            } as ObjectMetadataItemWithFieldMaps,
          },
          idByNameSingular: {},
        },
      );

      // Mock successful upsert
      const mockObjectPermission = {
        id: 'permission-id',
        roleId,
        objectMetadataId: customObjectMetadataId,
        workspaceId,
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      } as ObjectPermissionEntity;

      objectPermissionRepository.upsert.mockResolvedValue({
        generatedMaps: [{ id: 'permission-id' }],
        identifiers: [],
        raw: [],
      });

      objectPermissionRepository.find.mockResolvedValue([mockObjectPermission]);

      // Act
      const result = await service.upsertObjectPermissions({
        workspaceId,
        input,
      });

      // Assert
      expect(result).toEqual([mockObjectPermission]);
      expect(objectPermissionRepository.upsert).toHaveBeenCalledWith(
        [
          {
            objectMetadataId: customObjectMetadataId,
            canReadObjectRecords: true,
            canUpdateObjectRecords: true,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
            roleId,
            workspaceId,
          },
        ],
        {
          conflictPaths: ['objectMetadataId', 'roleId'],
        },
      );
      expect(
        workspacePermissionsCacheService.recomputeRolesPermissionsCache,
      ).toHaveBeenCalledWith({
        workspaceId,
        roleIds: [roleId],
      });
    });

    it('should throw PermissionsException when object metadata is not found', async () => {
      // Arrange
      const input: UpsertObjectPermissionsInput = {
        roleId,
        objectPermissions: [
          {
            objectMetadataId: 'non-existent-object-id',
            canReadObjectRecords: true,
            canUpdateObjectRecords: false,
            canSoftDeleteObjectRecords: false,
            canDestroyObjectRecords: false,
          },
        ],
      };

      // Mock empty object metadata maps
      workspaceCacheStorageService.getObjectMetadataMapsOrThrow.mockResolvedValue(
        {
          byId: {},
          idByNameSingular: {},
        },
      );

      // Act & Assert
      await expect(
        service.upsertObjectPermissions({
          workspaceId,
          input,
        }),
      ).rejects.toThrow(
        new PermissionsException(
          'Object metadata id not found',
          PermissionsExceptionCode.OBJECT_METADATA_NOT_FOUND,
        ),
      );
    });
  });
});
