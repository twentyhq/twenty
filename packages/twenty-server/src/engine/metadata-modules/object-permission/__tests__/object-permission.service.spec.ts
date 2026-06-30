import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type UpsertObjectPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-object-permissions.input';
import { ObjectPermissionService } from 'src/engine/metadata-modules/object-permission/object-permission.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const createMockFlatRoleMaps = (roleId: string, isEditable: boolean) => ({
  byUniversalIdentifier: {
    [roleId]: {
      id: roleId,
      universalIdentifier: roleId,
      isEditable,
      canReadAllObjectRecords: true,
      canUpdateAllObjectRecords: true,
      canSoftDeleteAllObjectRecords: false,
      canDestroyAllObjectRecords: false,
    },
  },
  universalIdentifierById: { [roleId]: roleId },
  byId: { [roleId]: { id: roleId, universalIdentifier: roleId, isEditable } },
});

const createMockFlatObjectMetadataMaps = (
  objectMetadataId: string,
  isSystem: boolean,
) => ({
  byUniversalIdentifier: {
    [objectMetadataId]: {
      id: objectMetadataId,
      universalIdentifier: objectMetadataId,
      isSystem,
    },
  },
  universalIdentifierById: { [objectMetadataId]: objectMetadataId },
  byId: { [objectMetadataId]: { id: objectMetadataId, isSystem } },
});

describe('ObjectPermissionService', () => {
  let service: ObjectPermissionService;
  let workspaceManyOrAllFlatEntityMapsCacheService: jest.Mocked<WorkspaceManyOrAllFlatEntityMapsCacheService>;
  let workspaceMigrationValidateBuildAndRunService: jest.Mocked<WorkspaceMigrationValidateBuildAndRunService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ObjectPermissionService,
        {
          provide: ApplicationService,
          useValue: {
            findWorkspaceTwentyStandardAndCustomApplicationOrThrow: jest
              .fn()
              .mockResolvedValue({
                workspaceCustomFlatApplication: {
                  id: 'app-id',
                  universalIdentifier: 'app-universal-id',
                },
              }),
          },
        },
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            getOrRecomputeManyOrAllFlatEntityMaps: jest.fn(),
          },
        },
        {
          provide: WorkspaceMigrationValidateBuildAndRunService,
          useValue: {
            validateBuildAndRunWorkspaceMigration: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ObjectPermissionService>(ObjectPermissionService);
    workspaceManyOrAllFlatEntityMapsCacheService = module.get(
      WorkspaceManyOrAllFlatEntityMapsCacheService,
    );
    workspaceMigrationValidateBuildAndRunService = module.get(
      WorkspaceMigrationValidateBuildAndRunService,
    );
  });

  describe('upsertObjectPermissions', () => {
    const workspaceId = 'workspace-id';
    const roleId = 'role-id';
    const systemObjectMetadataId = 'system-object-id';
    const customObjectMetadataId = 'custom-object-id';

    it('should throw PermissionsException when trying to add object permission on system object', async () => {
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

      workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
        {
          flatObjectPermissionMaps: {
            byUniversalIdentifier: {},
            universalIdentifierById: {},
            byId: {},
          },
          flatRoleMaps: createMockFlatRoleMaps(roleId, true),
          flatObjectMetadataMaps: createMockFlatObjectMetadataMaps(
            systemObjectMetadataId,
            true,
          ),
        } as any,
      );

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

      expect(
        workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration,
      ).not.toHaveBeenCalled();
    });

    it('should successfully create object permission for custom (non-system) object', async () => {
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

      const permissionUniversalId = 'permission-universal-id';
      const freshFlatObjectPermission = {
        id: 'permission-id',
        universalIdentifier: permissionUniversalId,
        roleId,
        roleUniversalIdentifier: roleId,
        objectMetadataId: customObjectMetadataId,
        objectMetadataUniversalIdentifier: customObjectMetadataId,
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      };

      workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps
        .mockResolvedValueOnce({
          flatObjectPermissionMaps: {
            byUniversalIdentifier: {},
            universalIdentifierById: {},
            byId: {},
          },
          flatRoleMaps: createMockFlatRoleMaps(roleId, true),
          flatObjectMetadataMaps: createMockFlatObjectMetadataMaps(
            customObjectMetadataId,
            false,
          ),
        } as any)
        .mockResolvedValueOnce({
          flatObjectPermissionMaps: {
            byUniversalIdentifier: {
              [permissionUniversalId]: freshFlatObjectPermission,
            },
            universalIdentifierById: {
              [freshFlatObjectPermission.id]: permissionUniversalId,
            },
            byId: {
              [freshFlatObjectPermission.id]: freshFlatObjectPermission,
            },
          },
        } as any);

      workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration.mockResolvedValue(
        { status: 'success' } as any,
      );

      const result = await service.upsertObjectPermissions({
        workspaceId,
        input,
      });

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        objectMetadataId: customObjectMetadataId,
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
      });
      expect(
        workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration,
      ).toHaveBeenCalled();
    });

    it('should throw PermissionsException when object metadata is not found', async () => {
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

      workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
        {
          flatObjectPermissionMaps: {
            byUniversalIdentifier: {},
            universalIdentifierById: {},
            byId: {},
          },
          flatRoleMaps: createMockFlatRoleMaps(roleId, true),
          flatObjectMetadataMaps: {
            byUniversalIdentifier: {},
            universalIdentifierById: {},
            byId: {},
          },
        } as any,
      );

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
