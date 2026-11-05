import { Test } from '@nestjs/testing';
import { FeatureFlagKey, RecordShareAccessLevel } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { COMPANY_FLAT_OBJECT_MOCK } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/company-flat-object.mock';
import { PermissionsMetadataMapsService } from 'src/engine/permissions/combine/services/permissions-metadata-maps.service';
import { RecordAccessPolicyService } from 'src/engine/permissions/combine/services/record-access-policy.service';
import { type PermissionsMetadataMaps } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { PermissionsPrincipalsService } from 'src/engine/permissions/principal/services/permissions-principals.service';
import { type PermissionsPrincipalsWithRolesContext } from 'src/engine/permissions/principal/types/permissions-principals-with-roles-context.type';
import { PrivateRecordStorageService } from 'src/engine/permissions/private-record/services/private-record-storage.service';
import { RecordShareStorageService } from 'src/engine/permissions/record-share/services/record-share-storage.service';
import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/role/constants/no-role-records-permissions.constant';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';

const MAIN_ROLE_ID = 'main-role';
const LIMITING_ROLE_ID = 'limiting-role';
const APPLICATION_ROLE_ID = 'application-role';
const COMPANY_FLAT_OBJECT_METADATA = {
  ...COMPANY_FLAT_OBJECT_MOCK,
  disabledObjectPermissionActions: [],
};

describe('RecordAccessPolicyService.hasAccessToProposedRecord', () => {
  let service: RecordAccessPolicyService;
  let metadataMaps: PermissionsMetadataMaps;
  const loadMetadataMaps = jest.fn();
  const principals: PermissionsPrincipalsWithRolesContext = {
    workspaceId: 'workspace-id',
    mainPrincipal: {
      type: 'workspaceMember',
      workspaceMemberId: 'member-id',
      roleId: MAIN_ROLE_ID,
    },
    limitingPrincipal: {
      type: 'agent',
      agentId: 'agent-id',
      roleId: LIMITING_ROLE_ID,
    },
    applicationPrincipal: {
      type: 'application',
      applicationId: 'application-id',
      roleId: APPLICATION_ROLE_ID,
    },
  };
  const request: Parameters<
    RecordAccessPolicyService['hasAccessToProposedRecord']
  >[0] = {
    principals,
    objectMetadataId: COMPANY_FLAT_OBJECT_METADATA.id,
    operationType: 'update',
    record: { id: 'record-id' },
    privateRecordState: {
      isPrivate: true,
      createdByWorkspaceMemberId: 'owner-id',
    },
    hypotheticalRecordShareAccessLevel: RecordShareAccessLevel.READ_WRITE,
  };

  beforeEach(async () => {
    metadataMaps = {
      flatFieldMetadataMaps: createEmptyFlatEntityMaps(),
      flatObjectMetadataMaps: {
        ...createEmptyFlatEntityMaps(),
        universalIdentifierById: {
          [COMPANY_FLAT_OBJECT_METADATA.id]:
            COMPANY_FLAT_OBJECT_METADATA.universalIdentifier,
        },
        byUniversalIdentifier: {
          [COMPANY_FLAT_OBJECT_METADATA.universalIdentifier]:
            COMPANY_FLAT_OBJECT_METADATA,
        },
      },
      rolesPermissions: {
        [MAIN_ROLE_ID]: NO_ROLE_RECORDS_PERMISSIONS,
        [LIMITING_ROLE_ID]: NO_ROLE_RECORDS_PERMISSIONS,
        [APPLICATION_ROLE_ID]: NO_ROLE_RECORDS_PERMISSIONS,
      },
      flatApplicationMaps: {
        byId: {
          'application-id': {
            id: 'application-id',
            defaultRoleId: APPLICATION_ROLE_ID,
            deletedAt: null,
          },
        },
      },
      flatRowLevelPermissionPredicateMaps: createEmptyFlatEntityMaps(),
      flatRowLevelPermissionPredicateGroupMaps: createEmptyFlatEntityMaps(),
      featureFlagsMap: {
        [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: true,
      },
    };
    loadMetadataMaps.mockResolvedValue(metadataMaps);

    const module = await Test.createTestingModule({
      providers: [
        RecordAccessPolicyService,
        {
          provide: PermissionsMetadataMapsService,
          useValue: { load: loadMetadataMaps },
        },
        { provide: PermissionsPrincipalsService, useValue: {} },
        { provide: RecordShareStorageService, useValue: {} },
        { provide: PrivateRecordStorageService, useValue: {} },
        { provide: WorkspaceOrmManager, useValue: {} },
      ],
    }).compile();

    service = module.get(RecordAccessPolicyService);
  });

  it('admits a hypothetical share when every principal role is cached', async () => {
    await expect(service.hasAccessToProposedRecord(request)).resolves.toBe(
      true,
    );
  });

  it.each([MAIN_ROLE_ID, LIMITING_ROLE_ID, APPLICATION_ROLE_ID])(
    'rejects a hypothetical share when %s permissions are missing',
    async (missingRoleId) => {
      delete metadataMaps.rolesPermissions[missingRoleId];

      await expect(service.hasAccessToProposedRecord(request)).resolves.toBe(
        false,
      );
    },
  );
});
