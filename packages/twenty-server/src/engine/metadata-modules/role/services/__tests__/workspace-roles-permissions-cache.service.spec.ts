import { Test, type TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { PermissionFlagType } from 'twenty-shared/constants';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { type Repository } from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceRolesPermissionsCacheService } from 'src/engine/metadata-modules/role/services/workspace-roles-permissions-cache.service';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';

const WORKSPACE_ID = '20202020-0000-4000-8000-000000000000';
const ROLE_ID = '11111111-1111-4111-8111-111111111111';
const WORKSPACE_MEMBER_OBJECT_METADATA_ID =
  '22222222-2222-4222-8222-222222222222';
const WORKFLOW_OBJECT_METADATA_ID = '33333333-3333-4333-8333-333333333333';
const PERSON_OBJECT_METADATA_ID = '44444444-4444-4444-8444-444444444444';

const createBaseRole = (
  overrides: Partial<RoleEntity> &
    Pick<RoleEntity, 'permissionFlags' | 'objectPermissions'>,
): RoleEntity =>
  ({
    id: ROLE_ID,
    label: 'Test role',
    workspaceId: WORKSPACE_ID,
    canUpdateAllSettings: false,
    canAccessAllTools: false,
    canReadAllObjectRecords: false,
    canUpdateAllObjectRecords: false,
    canSoftDeleteAllObjectRecords: false,
    canDestroyAllObjectRecords: false,
    description: null,
    icon: null,
    isEditable: true,
    canBeAssignedToUsers: true,
    canBeAssignedToAgents: true,
    canBeAssignedToApiKeys: true,
    fieldPermissions: [],
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
    ...overrides,
  }) as RoleEntity;

describe('WorkspaceRolesPermissionsCacheService', () => {
  let service: WorkspaceRolesPermissionsCacheService;
  let roleRepository: jest.Mocked<Pick<Repository<RoleEntity>, 'find'>>;
  let objectMetadataRepository: jest.Mocked<
    Pick<Repository<ObjectMetadataEntity>, 'find'>
  >;
  let objectPermissionRepository: jest.Mocked<
    Pick<Repository<ObjectPermissionEntity>, 'find'>
  >;
  let permissionFlagRepository: jest.Mocked<
    Pick<Repository<PermissionFlagEntity>, 'find'>
  >;

  const workspaceObjectMetadataFixture: ObjectMetadataEntity[] = [
    {
      id: WORKSPACE_MEMBER_OBJECT_METADATA_ID,
      isSystem: true,
      universalIdentifier: STANDARD_OBJECTS.workspaceMember.universalIdentifier,
      labelIdentifierFieldMetadataId: null,
    } as ObjectMetadataEntity,
    {
      id: WORKFLOW_OBJECT_METADATA_ID,
      isSystem: true,
      universalIdentifier: STANDARD_OBJECTS.workflow.universalIdentifier,
      labelIdentifierFieldMetadataId: null,
    } as ObjectMetadataEntity,
    {
      id: PERSON_OBJECT_METADATA_ID,
      isSystem: false,
      universalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
      labelIdentifierFieldMetadataId: null,
    } as ObjectMetadataEntity,
  ];

  beforeEach(async () => {
    roleRepository = {
      find: jest.fn(),
    };

    objectMetadataRepository = {
      find: jest.fn().mockResolvedValue(workspaceObjectMetadataFixture),
    };

    objectPermissionRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    permissionFlagRepository = {
      find: jest.fn().mockResolvedValue([]),
    };
    const fieldPermissionRepository = {
      find: jest.fn().mockResolvedValue([]),
    };
    const rowLevelPermissionPredicateRepository = {
      find: jest.fn().mockResolvedValue([]),
    };
    const rowLevelPermissionPredicateGroupRepository = {
      find: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkspaceRolesPermissionsCacheService,
        {
          provide: getRepositoryToken(ObjectMetadataEntity),
          useValue: objectMetadataRepository,
        },
        {
          provide: getRepositoryToken(RoleEntity),
          useValue: roleRepository,
        },
        {
          provide: getRepositoryToken(ObjectPermissionEntity),
          useValue: objectPermissionRepository,
        },
        {
          provide: getRepositoryToken(PermissionFlagEntity),
          useValue: permissionFlagRepository,
        },
        {
          provide: getRepositoryToken(FieldPermissionEntity),
          useValue: fieldPermissionRepository,
        },
        {
          provide: getRepositoryToken(RowLevelPermissionPredicateEntity),
          useValue: rowLevelPermissionPredicateRepository,
        },
        {
          provide: getRepositoryToken(RowLevelPermissionPredicateGroupEntity),
          useValue: rowLevelPermissionPredicateGroupRepository,
        },
      ],
    }).compile();

    service = module.get(WorkspaceRolesPermissionsCacheService);
  });

  describe('workspaceMember object', () => {
    it('should deny all record permissions when role has neither workspace members access nor update-all-settings', async () => {
      roleRepository.find.mockResolvedValue([
        createBaseRole({
          permissionFlags: [],
          objectPermissions: [],
        }),
      ]);

      const result = await service.computeForCache(WORKSPACE_ID);
      const workspaceMemberPermissions =
        result[ROLE_ID][WORKSPACE_MEMBER_OBJECT_METADATA_ID];

      expect(workspaceMemberPermissions.canReadObjectRecords).toBe(true);
      expect(workspaceMemberPermissions.canUpdateObjectRecords).toBe(false);
      expect(workspaceMemberPermissions.canSoftDeleteObjectRecords).toBe(false);
      expect(workspaceMemberPermissions.canDestroyObjectRecords).toBe(false);
    });

    it('should grant all record permissions when role has WORKSPACE_MEMBERS permission flag', async () => {
      permissionFlagRepository.find.mockResolvedValue([
        {
          roleId: ROLE_ID,
          flag: PermissionFlagType.WORKSPACE_MEMBERS,
        } as PermissionFlagEntity,
      ]);

      roleRepository.find.mockResolvedValue([
        createBaseRole({
          permissionFlags: [],
          objectPermissions: [],
        }),
      ]);

      const result = await service.computeForCache(WORKSPACE_ID);
      const workspaceMemberPermissions =
        result[ROLE_ID][WORKSPACE_MEMBER_OBJECT_METADATA_ID];

      expect(workspaceMemberPermissions.canReadObjectRecords).toBe(true);
      expect(workspaceMemberPermissions.canUpdateObjectRecords).toBe(true);
      expect(workspaceMemberPermissions.canSoftDeleteObjectRecords).toBe(true);
      expect(workspaceMemberPermissions.canDestroyObjectRecords).toBe(true);
    });

    it('should grant all record permissions when role has canUpdateAllSettings', async () => {
      roleRepository.find.mockResolvedValue([
        createBaseRole({
          canUpdateAllSettings: true,
          permissionFlags: [],
          objectPermissions: [],
        }),
      ]);

      const result = await service.computeForCache(WORKSPACE_ID);
      const workspaceMemberPermissions =
        result[ROLE_ID][WORKSPACE_MEMBER_OBJECT_METADATA_ID];

      expect(workspaceMemberPermissions.canReadObjectRecords).toBe(true);
      expect(workspaceMemberPermissions.canUpdateObjectRecords).toBe(true);
    });
  });

  describe('workflow object', () => {
    it('should deny all record permissions when role has neither workflows access nor update-all-settings', async () => {
      roleRepository.find.mockResolvedValue([
        createBaseRole({
          permissionFlags: [],
          objectPermissions: [],
        }),
      ]);

      const result = await service.computeForCache(WORKSPACE_ID);
      const workflowPermissions = result[ROLE_ID][WORKFLOW_OBJECT_METADATA_ID];

      expect(workflowPermissions.canReadObjectRecords).toBe(false);
      expect(workflowPermissions.canUpdateObjectRecords).toBe(false);
      expect(workflowPermissions.canSoftDeleteObjectRecords).toBe(false);
      expect(workflowPermissions.canDestroyObjectRecords).toBe(false);
    });

    it('should grant all record permissions when role has WORKFLOWS permission flag', async () => {
      permissionFlagRepository.find.mockResolvedValue([
        {
          roleId: ROLE_ID,
          flag: PermissionFlagType.WORKFLOWS,
        } as PermissionFlagEntity,
      ]);

      roleRepository.find.mockResolvedValue([
        createBaseRole({
          permissionFlags: [],
          objectPermissions: [],
        }),
      ]);

      const result = await service.computeForCache(WORKSPACE_ID);
      const workflowPermissions = result[ROLE_ID][WORKFLOW_OBJECT_METADATA_ID];

      expect(workflowPermissions.canReadObjectRecords).toBe(true);
      expect(workflowPermissions.canUpdateObjectRecords).toBe(true);
      expect(workflowPermissions.canSoftDeleteObjectRecords).toBe(true);
      expect(workflowPermissions.canDestroyObjectRecords).toBe(true);
    });
  });

  describe('regular object (person)', () => {
    it('should apply object permission overrides when object is not system', async () => {
      objectPermissionRepository.find.mockResolvedValue([
        {
          roleId: ROLE_ID,
          objectMetadataId: PERSON_OBJECT_METADATA_ID,
          canReadObjectRecords: true,
          canUpdateObjectRecords: false,
          canSoftDeleteObjectRecords: false,
          canDestroyObjectRecords: false,
        } as ObjectPermissionEntity,
      ]);

      roleRepository.find.mockResolvedValue([
        createBaseRole({
          permissionFlags: [],
          objectPermissions: [],
        }),
      ]);

      const result = await service.computeForCache(WORKSPACE_ID);
      const personPermissions = result[ROLE_ID][PERSON_OBJECT_METADATA_ID];

      expect(personPermissions.canReadObjectRecords).toBe(true);
      expect(personPermissions.canUpdateObjectRecords).toBe(false);
      expect(personPermissions.canSoftDeleteObjectRecords).toBe(false);
      expect(personPermissions.canDestroyObjectRecords).toBe(false);
    });

    it('should use role-wide CRUD defaults when no object permission row exists', async () => {
      roleRepository.find.mockResolvedValue([
        createBaseRole({
          canReadAllObjectRecords: true,
          canUpdateAllObjectRecords: true,
          canSoftDeleteAllObjectRecords: true,
          canDestroyAllObjectRecords: true,
          permissionFlags: [],
          objectPermissions: [],
        }),
      ]);

      const result = await service.computeForCache(WORKSPACE_ID);
      const personPermissions = result[ROLE_ID][PERSON_OBJECT_METADATA_ID];

      expect(personPermissions.canReadObjectRecords).toBe(true);
      expect(personPermissions.canUpdateObjectRecords).toBe(true);
      expect(personPermissions.canSoftDeleteObjectRecords).toBe(true);
      expect(personPermissions.canDestroyObjectRecords).toBe(true);
    });
  });
});
