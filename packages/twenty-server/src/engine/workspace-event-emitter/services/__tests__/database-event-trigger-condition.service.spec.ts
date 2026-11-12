import { Test } from '@nestjs/testing';

import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { PrincipalPermissionsReadService } from 'src/engine/permissions/principal-permissions-read.service';
import { RecordFieldPermissionsReadService } from 'src/engine/permissions/record-field-permissions-read.service';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { DatabaseEventTriggerConditionService } from 'src/engine/workspace-event-emitter/services/database-event-trigger-condition.service';

const COMPANY_FIELD = getFlatFieldMetadataMock<FieldMetadataType.RELATION>({
  id: 'opportunity-company-id',
  universalIdentifier: 'opportunity-company',
  objectMetadataId: 'opportunity-id',
  type: FieldMetadataType.RELATION,
  name: 'company',
  relationTargetObjectMetadataId: 'company-id',
  settings: { relationType: RelationType.MANY_TO_ONE },
});
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

const flatFieldMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: EMPLOYEES_FIELD,
  flatEntityMaps: addFlatEntityToFlatEntityMapsOrThrow({
    flatEntity: COMPANY_FIELD,
    flatEntityMaps: createEmptyFlatEntityMaps(),
  }),
});
const flatObjectMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: COMPANY,
  flatEntityMaps: addFlatEntityToFlatEntityMapsOrThrow({
    flatEntity: OPPORTUNITY,
    flatEntityMaps: createEmptyFlatEntityMaps(),
  }),
});

const buildService = async ({
  hiddenFieldIds = [],
  unreadableFieldIds = [],
}: {
  hiddenFieldIds?: string[];
  unreadableFieldIds?: string[];
}) => {
  const find = jest.fn().mockResolvedValue([{ id: 'big', employees: 500 }]);
  const executeInWorkspaceContext = jest.fn((run: () => unknown) => run());

  const module = await Test.createTestingModule({
    providers: [
      DatabaseEventTriggerConditionService,
      {
        provide: WorkspaceCacheService,
        useValue: {
          getOrRecompute: jest.fn().mockResolvedValue({
            flatObjectMetadataMaps,
            flatFieldMetadataMaps,
          }),
        },
      },
      {
        provide: CoreEntityCacheService,
        useValue: { get: jest.fn().mockResolvedValue({ id: 'workspace-id' }) },
      },
      {
        provide: WorkspaceOrmManager,
        useValue: {
          executeInWorkspaceContext,
          getRepository: jest.fn().mockReturnValue({ find }),
        },
      },
      {
        provide: PrincipalPermissionsReadService,
        useValue: {
          resolvePermissionsPrincipals: jest.fn().mockResolvedValue({}),
        },
      },
      {
        provide: RecordFieldPermissionsReadService,
        useValue: {
          findUnreadableFields: jest
            .fn()
            .mockResolvedValue(new Set(unreadableFieldIds)),
          buildUnreadableFieldsSQLConditions: jest
            .fn()
            .mockResolvedValue(
              hiddenFieldIds.length > 0
                ? [{ fieldMetadataIds: hiddenFieldIds }]
                : [],
            ),
        },
      },
    ],
  }).compile();

  return {
    service: module.get(DatabaseEventTriggerConditionService),
    find,
    executeInWorkspaceContext,
  };
};

const BIG_COMPANY_EVENT: ObjectRecordEvent = {
  recordId: 'opportunity-1',
  properties: { after: { companyId: 'big' } },
};

const filterBigCompanyEvent = (service: DatabaseEventTriggerConditionService) =>
  service.filterMatchingEvents({
    workspaceId: 'workspace-id',
    objectMetadata: OPPORTUNITY,
    events: [BIG_COMPANY_EVENT],
    eventName: 'opportunity.created',
    condition: 'company.employees > 100',
    application: { id: 'application-id' } as FlatApplication,
    agentId: 'agent-id',
  });

describe('DatabaseEventTriggerConditionService', () => {
  it('reads related fields as the trigger owner', async () => {
    const { service, find, executeInWorkspaceContext } = await buildService({});

    expect(await filterBigCompanyEvent(service)).toEqual({
      events: [BIG_COMPANY_EVENT],
      conditionErrorMessage: undefined,
    });
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({ select: ['id', 'employees'] }),
    );
    expect(executeInWorkspaceContext).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        type: 'application',
        application: { id: 'application-id' },
        agentId: 'agent-id',
      }),
    );
  });

  it.each([
    ['hidden on some records', { hiddenFieldIds: [EMPLOYEES_FIELD.id] }],
    ['unreadable', { unreadableFieldIds: [EMPLOYEES_FIELD.id] }],
  ])(
    'matches nothing when a related field is %s for the trigger',
    async (_, permissions) => {
      const { service, find } = await buildService(permissions);

      expect(await filterBigCompanyEvent(service)).toEqual({
        events: [],
        conditionErrorMessage:
          'The condition reads "company.employees", which this trigger cannot always see',
      });
      expect(find).not.toHaveBeenCalled();
    },
  );
});
