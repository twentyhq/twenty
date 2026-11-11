import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { type PermissionsAuthContext } from 'src/engine/permissions/principal/types/permissions-auth-context.type';
import { type RecordFieldPermissionsReadService } from 'src/engine/permissions/record-field-permissions-read.service';
import { type RecordPermissionsReadService } from 'src/engine/permissions/record-permissions-read.service';
import { type WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { DatabaseEventTriggerConditionService } from 'src/engine/workspace-event-emitter/services/database-event-trigger-condition.service';

const COMPANY_FIELD = getFlatFieldMetadataMock({
  id: 'opportunity-company-id',
  universalIdentifier: 'opportunity-company',
  objectMetadataId: 'opportunity-id',
  type: FieldMetadataType.RELATION,
  name: 'company',
  relationTargetObjectMetadataId: 'company-id',
  settings: { relationType: RelationType.MANY_TO_ONE },
} as Parameters<typeof getFlatFieldMetadataMock>[0]);
const EMPLOYEES_FIELD = getFlatFieldMetadataMock({
  id: 'company-employees-id',
  universalIdentifier: 'company-employees',
  objectMetadataId: 'company-id',
  type: FieldMetadataType.NUMBER,
  name: 'employees',
});

const OPPORTUNITY = getFlatObjectMetadataMock({
  id: 'opportunity-id',
  universalIdentifier: 'opportunity',
  nameSingular: 'opportunity',
  fieldIds: [COMPANY_FIELD.id],
});
const COMPANY = getFlatObjectMetadataMock({
  id: 'company-id',
  universalIdentifier: 'company',
  nameSingular: 'company',
  fieldIds: [EMPLOYEES_FIELD.id],
});

const flatFieldMetadataMaps = [COMPANY_FIELD, EMPLOYEES_FIELD].reduce(
  (flatEntityMaps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
  createEmptyFlatEntityMaps() as FlatEntityMaps<FlatFieldMetadata>,
);
const flatObjectMetadataMaps = [OPPORTUNITY, COMPANY].reduce(
  (flatEntityMaps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
  createEmptyFlatEntityMaps() as FlatEntityMaps<FlatObjectMetadata>,
);

const PRINCIPALS = { workspaceId: 'workspace-id' };

const AGENT_AUTH_CONTEXT: PermissionsAuthContext = {
  type: 'application',
  workspace: { id: 'workspace-id' },
  application: { id: 'application-id' },
  agentId: 'agent-id',
};

const WEBHOOK_AUTH_CONTEXT: PermissionsAuthContext = {
  type: 'webhook',
  workspace: { id: 'workspace-id' },
  webhook: { id: 'webhook-id' },
};

const buildService = ({
  hiddenFieldIds = [],
  unreadableFieldIds = [],
  grantedRecordIds = ['big'],
  canReadTargetObject = true,
}: {
  hiddenFieldIds?: string[];
  unreadableFieldIds?: string[];
  grantedRecordIds?: string[];
  canReadTargetObject?: boolean;
}) => {
  const find = jest.fn().mockResolvedValue([{ id: 'big', employees: 500 }]);
  const executeInWorkspaceContext = jest.fn((run: () => unknown) => run());
  const resolvePermissionsPrincipals = jest.fn().mockResolvedValue(PRINCIPALS);
  const filterGrantedRecordIds = jest
    .fn()
    .mockResolvedValue(new Set(grantedRecordIds));

  const service = new DatabaseEventTriggerConditionService(
    {
      getOrRecompute: jest
        .fn()
        .mockResolvedValue({ flatObjectMetadataMaps, flatFieldMetadataMaps }),
    } as unknown as WorkspaceCacheService,
    {
      get: jest.fn().mockResolvedValue({ id: 'workspace-id' }),
    } as unknown as CoreEntityCacheService,
    {
      executeInWorkspaceContext,
      getRepositoryWithoutPermissionChecks: jest.fn().mockReturnValue({ find }),
    } as unknown as WorkspaceOrmManager,
    {
      resolvePermissionsPrincipals,
    } as unknown as PrincipalPermissionsReadService,
    {
      findUnreadableFields: jest
        .fn()
        .mockResolvedValue(new Set(unreadableFieldIds)),
      findFieldsHiddenOnMatchingRecords: jest
        .fn()
        .mockResolvedValue(
          hiddenFieldIds.length > 0
            ? [{ fieldMetadataIds: hiddenFieldIds }]
            : [],
        ),
    } as unknown as RecordFieldPermissionsReadService,
    {
      canAccessSomeRecords: jest.fn().mockResolvedValue(canReadTargetObject),
      filterGrantedRecordIds,
    } as unknown as RecordPermissionsReadService,
  );

  return {
    service,
    find,
    executeInWorkspaceContext,
    resolvePermissionsPrincipals,
    filterGrantedRecordIds,
  };
};

const BIG_COMPANY_EVENT = {
  recordId: 'opportunity-1',
  properties: { after: { companyId: 'big' } },
} as ObjectRecordEvent;

const filterBigCompanyEvent = (
  service: DatabaseEventTriggerConditionService,
  authContext: PermissionsAuthContext = AGENT_AUTH_CONTEXT,
) =>
  service.filterMatchingEvents({
    workspaceId: 'workspace-id',
    objectMetadata: OPPORTUNITY,
    events: [BIG_COMPANY_EVENT],
    eventName: 'opportunity.created',
    condition: 'company.employees > 100',
    authContext,
  });

describe('DatabaseEventTriggerConditionService', () => {
  it.each([
    ['an agent', AGENT_AUTH_CONTEXT],
    ['a webhook', WEBHOOK_AUTH_CONTEXT],
  ])('reads related fields as %s', async (_, authContext) => {
    const {
      service,
      find,
      executeInWorkspaceContext,
      resolvePermissionsPrincipals,
      filterGrantedRecordIds,
    } = buildService({});

    expect(await filterBigCompanyEvent(service, authContext)).toEqual({
      events: [BIG_COMPANY_EVENT],
      conditionErrorMessage: undefined,
    });
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ select: ['id', 'employees'] }),
    );
    expect(executeInWorkspaceContext).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({ type: 'system' }),
    );
    expect(resolvePermissionsPrincipals).toHaveBeenCalledWith({ authContext });
    expect(filterGrantedRecordIds).toHaveBeenCalledWith({
      principals: PRINCIPALS,
      objectMetadataId: COMPANY.id,
      operationType: 'read',
      recordIds: ['big'],
    });
  });

  it('reads a related record the trigger cannot see as empty', async () => {
    const { service } = buildService({ grantedRecordIds: [] });

    expect(await filterBigCompanyEvent(service)).toEqual({
      events: [],
      conditionErrorMessage: undefined,
    });
  });

  it('matches nothing when the trigger cannot read the related object', async () => {
    const { service, find } = buildService({ canReadTargetObject: false });

    expect(await filterBigCompanyEvent(service)).toEqual({
      events: [],
      conditionErrorMessage:
        'The condition reads "company", which this trigger cannot see',
    });
    expect(find).not.toHaveBeenCalled();
  });

  it.each([
    ['hidden on some records', { hiddenFieldIds: [EMPLOYEES_FIELD.id] }],
    ['unreadable', { unreadableFieldIds: [EMPLOYEES_FIELD.id] }],
  ])(
    'matches nothing when a related field is %s for the trigger',
    async (_, permissions) => {
      const { service, find } = buildService(permissions);

      expect(await filterBigCompanyEvent(service)).toEqual({
        events: [],
        conditionErrorMessage:
          'The condition reads "company.employees", which this trigger cannot always see',
      });
      expect(find).not.toHaveBeenCalled();
    },
  );
});
