import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { type ObjectsPermissionsByRoleId } from 'twenty-shared/types';
import { In, type Repository } from 'typeorm';

import {
  fieldRelationMock,
  fieldTextMock,
  objectMetadataItemMock,
} from 'src/engine/api/__mocks__/object-metadata-item.mock';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type UpsertFieldPermissionsInput } from 'src/engine/metadata-modules/object-permission/dtos/upsert-field-permissions.input';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { FieldPermissionService } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.service';
import {
  PermissionsException,
  PermissionsExceptionCode,
  PermissionsExceptionMessage,
} from 'src/engine/metadata-modules/permissions/permissions.exception';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getMockFieldMetadataEntity } from 'src/utils/__test__/get-field-metadata-entity.mock';

describe('FieldPermissionService', () => {
  let service: FieldPermissionService;
  let fieldPermissionsRepository: jest.Mocked<
    Repository<FieldPermissionEntity>
  >;
  let roleRepository: jest.Mocked<Repository<RoleEntity>>;
  let fieldMetadataRepository: jest.Mocked<Repository<FieldMetadataEntity>>;
  let workspaceCacheService: jest.Mocked<WorkspaceCacheService>;
  let workspaceManyOrAllFlatEntityMapsCacheService: jest.Mocked<WorkspaceManyOrAllFlatEntityMapsCacheService>;

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

  const mockRolesPermissions: ObjectsPermissionsByRoleId = {
    [testRoleId]: {
      [testObjectMetadataId]: {
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
        restrictedFields: {},
      },
      [fieldRelationMock.objectMetadataId]: {
        canReadObjectRecords: true,
        canUpdateObjectRecords: true,
        canSoftDeleteObjectRecords: false,
        canDestroyObjectRecords: false,
        restrictedFields: {},
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FieldPermissionService,
        {
          provide: getRepositoryToken(RoleEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(FieldPermissionEntity),
          useValue: {
            find: jest.fn(),
            upsert: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            getOrRecompute: jest.fn(),
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
        {
          provide: getRepositoryToken(FieldMetadataEntity),
          useValue: {
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<FieldPermissionService>(FieldPermissionService);
    fieldPermissionsRepository = module.get(
      getRepositoryToken(FieldPermissionEntity),
    );
    roleRepository = module.get(getRepositoryToken(RoleEntity));
    fieldMetadataRepository = module.get(
      getRepositoryToken(FieldMetadataEntity),
    );
    workspaceCacheService = module.get(WorkspaceCacheService);
    workspaceManyOrAllFlatEntityMapsCacheService = module.get(
      WorkspaceManyOrAllFlatEntityMapsCacheService,
    );

    // Setup default mocks
    roleRepository.findOne.mockResolvedValue(mockRole);
    fieldMetadataRepository.find.mockResolvedValue([
      fieldTextMock,
      fieldRelationMock,
    ]);
    (workspaceCacheService.getOrRecompute as jest.Mock).mockResolvedValue({
      rolesPermissions: mockRolesPermissions,
    } as any);
    const testFieldMetadata = getMockFieldMetadataEntity({
      ...fieldTextMock,
      label: 'Test Field',
      objectMetadataId: testObjectMetadataId,
      workspaceId: testWorkspaceId,
      id: testFieldMetadataId,
    });

    workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
      {
        flatObjectMetadataMaps: {
          byId: {
            [testObjectMetadataId]: {
              ...objectMetadataItemMock,
              id: testObjectMetadataId,
              fieldMetadataIds: [testFieldMetadataId],
              indexMetadataIds: [],
              viewIds: [],
              universalIdentifier: testObjectMetadataId,
              applicationId: null,
            } as any,
            [fieldRelationMock.objectMetadataId]: {
              ...objectMetadataItemMock,
              id: fieldRelationMock.objectMetadataId,
              fieldMetadataIds: [fieldRelationMock.id],
              indexMetadataIds: [],
              viewIds: [],
              universalIdentifier: fieldRelationMock.objectMetadataId,
              applicationId: null,
            } as any,
          },
          idByUniversalIdentifier: {},
          universalIdentifiersByApplicationId: {},
        },
        flatFieldMetadataMaps: {
          byId: {
            [testFieldMetadataId]: testFieldMetadata as any,
            [fieldRelationMock.id]: fieldRelationMock as any,
          },
          idByUniversalIdentifier: {},
          universalIdentifiersByApplicationId: {},
        },
      } as any,
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
          workspaceCacheService.invalidateAndRecompute,
        ).toHaveBeenCalledWith(testWorkspaceId, ['rolesPermissions']);
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

    describe('relation cases', () => {
      it('should create two field permissions when a relation field permission is created', async () => {
        const input = createUpsertInput([
          {
            canReadFieldValue: false,
            canUpdateFieldValue: false,
            fieldMetadataId: fieldRelationMock.id,
            objectMetadataId: fieldRelationMock.objectMetadataId,
          },
        ]);

        await service.upsertFieldPermissions({
          workspaceId: testWorkspaceId,
          input,
        });

        expect(fieldPermissionsRepository.upsert).toHaveBeenCalledWith(
          [
            {
              fieldMetadataId: fieldRelationMock.id,
              objectMetadataId: fieldRelationMock.objectMetadataId,
              canReadFieldValue: false,
              canUpdateFieldValue: false,
              roleId: testRoleId,
              workspaceId: testWorkspaceId,
            },
            {
              fieldMetadataId: fieldRelationMock.relationTargetFieldMetadataId,
              objectMetadataId:
                fieldRelationMock.relationTargetObjectMetadataId,
              canReadFieldValue: false,
              canUpdateFieldValue: false,
              roleId: testRoleId,
              workspaceId: testWorkspaceId,
            },
          ],
          { conflictPaths: ['fieldMetadataId', 'roleId'] },
        );
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
        workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
          {
            flatObjectMetadataMaps: {
              byId: {},
              idByUniversalIdentifier: {},
              universalIdentifiersByApplicationId: {},
            },
            flatFieldMetadataMaps: {
              byId: {},
              idByUniversalIdentifier: {},
              universalIdentifiersByApplicationId: {},
            },
          } as any,
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

        workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
          {
            flatObjectMetadataMaps: {
              byId: {
                [testObjectMetadataId]: {
                  ...systemObjectMetadata,
                  id: testObjectMetadataId,
                  fieldMetadataIds: [],
                  indexMetadataIds: [],
                  viewIds: [],
                  universalIdentifier: testObjectMetadataId,
                  applicationId: null,
                } as any,
              },
              idByUniversalIdentifier: {},
              universalIdentifiersByApplicationId: {},
            },
            flatFieldMetadataMaps: {
              byId: {},
              idByUniversalIdentifier: {},
              universalIdentifiersByApplicationId: {},
            },
          } as any,
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
        workspaceManyOrAllFlatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue(
          {
            flatObjectMetadataMaps: {
              byId: {
                [testObjectMetadataId]: {
                  ...objectMetadataItemMock,
                  id: testObjectMetadataId,
                  fieldMetadataIds: [],
                  indexMetadataIds: [],
                  viewIds: [],
                  universalIdentifier: testObjectMetadataId,
                  applicationId: null,
                } as any,
              },
              idByUniversalIdentifier: {},
              universalIdentifiersByApplicationId: {},
            },
            flatFieldMetadataMaps: {
              byId: {},
              idByUniversalIdentifier: {},
              universalIdentifiersByApplicationId: {},
            },
          } as any,
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
        (workspaceCacheService.getOrRecompute as jest.Mock).mockResolvedValue({
          rolesPermissions: {},
        } as any);

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
