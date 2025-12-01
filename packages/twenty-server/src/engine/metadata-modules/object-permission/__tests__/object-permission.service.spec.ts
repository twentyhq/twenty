import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type Repository } from 'typeorm';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type UpsertObjectPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-object-permissions.input';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

describe('ObjectPermissionService', () => {
  let service: ObjectPermissionService;
  let objectPermissionRepository: jest.Mocked<
    Repository<ObjectPermissionEntity>
  >;
  let roleRepository: jest.Mocked<Repository<RoleEntity>>;
  let workspaceCacheService: jest.Mocked<WorkspaceCacheService>;
  let workspaceManyOrAllFlatEntityMapsCacheService: jest.Mocked<WorkspaceManyOrAllFlatEntityMapsCacheService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObjectPermissionService,
        {
          provide: getRepositoryToken(ObjectPermissionEntity),
          useValue: {
            upsert: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(RoleEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ObjectMetadataEntity),
          useValue: {
            find: jest.fn(),
          },
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            invalidate: jest.fn(),
            invalidateAndRecompute: jest.fn(),
          },
        },
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            getOrRecomputeManyOrAllFlatEntityMaps: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ObjectPermissionService>(ObjectPermissionService);
    objectPermissionRepository = module.get(
      getRepositoryToken(ObjectPermissionEntity),
    );
    roleRepository = module.get(getRepositoryToken(RoleEntity));
    workspaceCacheService = module.get(WorkspaceCacheService);
    workspaceManyOrAllFlatEntityMapsCacheService = module.get(
      WorkspaceManyOrAllFlatEntityMapsCacheService,
    );
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

      // Mock flat object metadata maps with a system object
      workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
        {
          flatObjectMetadataMaps: {
            byId: {
              [systemObjectMetadataId]: {
                id: systemObjectMetadataId,
                isSystem: true,
                workspaceId,
                fieldMetadataIds: [],
                indexMetadataIds: [],
                viewIds: [],
                universalIdentifier: systemObjectMetadataId,
                applicationId: null,
              } as any,
            },
            idByUniversalIdentifier: {},
            universalIdentifiersByApplicationId: {},
          },
        } as any,
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
        workspaceCacheService.invalidateAndRecompute,
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

      // Mock flat object metadata maps with a custom object
      workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
        {
          flatObjectMetadataMaps: {
            byId: {
              [customObjectMetadataId]: {
                id: customObjectMetadataId,
                isSystem: false,
                workspaceId,
                fieldMetadataIds: [],
                indexMetadataIds: [],
                viewIds: [],
                universalIdentifier: customObjectMetadataId,
                applicationId: null,
              } as any,
            },
            idByUniversalIdentifier: {},
            universalIdentifiersByApplicationId: {},
          },
        } as any,
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
      expect(workspaceCacheService.invalidateAndRecompute).toHaveBeenCalledWith(
        workspaceId,
        ['rolesPermissions'],
      );
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

      // Mock empty flat object metadata maps
      workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
        {
          flatObjectMetadataMaps: {
            byId: {},
            idByUniversalIdentifier: {},
            universalIdentifiersByApplicationId: {},
          },
        } as any,
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
