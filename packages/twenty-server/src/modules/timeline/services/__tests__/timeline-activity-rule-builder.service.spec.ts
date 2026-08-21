import { Test } from '@nestjs/testing';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { TimelineActivityRuleBuilderService } from 'src/modules/timeline/services/timeline-activity-rule-builder.service';

const WORKSPACE_ID = 'workspace-id';
const COMPANY_OBJECT_ID = 'company-object-id';

const companyFlatObjectMetadata = getFlatObjectMetadataMock({
  universalIdentifier: 'company-universal-identifier',
  id: COMPANY_OBJECT_ID,
  nameSingular: 'company',
  isAuditLogged: true,
  isSystem: false,
});

const buildMaps = (
  entities: { universalIdentifier: string; id: string }[] = [],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  ),
  universalIdentifierById: Object.fromEntries(
    entities.map((entity) => [entity.id, entity.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildSelfOverrideRow = (overrides: Record<string, unknown>) => ({
  id: 'rule-id',
  universalIdentifier: 'rule-universal-identifier',
  objectMetadataId: COMPANY_OBJECT_ID,
  relationFieldMetadataId: null,
  resolution: 'MATERIALIZED',
  actions: [],
  triggerFieldMetadataIds: null,
  isActive: true,
  overrides: null,
  ...overrides,
});

describe('TimelineActivityRuleBuilderService', () => {
  const setup = async (
    ruleRows: Record<string, unknown>[],
    fieldRows: { universalIdentifier: string; id: string; name: string }[] = [],
  ) => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TimelineActivityRuleBuilderService,
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
              flatObjectMetadataMaps: buildMaps([
                {
                  universalIdentifier: 'company-universal-identifier',
                  id: COMPANY_OBJECT_ID,
                },
              ]),
              flatFieldMetadataMaps: buildMaps(fieldRows),
              flatTimelineActivityRuleMaps: buildMaps(
                ruleRows as {
                  universalIdentifier: string;
                  id: string;
                }[],
              ),
            }),
          },
        },
      ],
    }).compile();

    return moduleRef.get(TimelineActivityRuleBuilderService);
  };

  it('should derive the self rule when no override row exists', async () => {
    const service = await setup([]);

    const { sourceRules } = await service.getRulesForEventBatch({
      workspaceId: WORKSPACE_ID,
      flatObjectMetadata: companyFlatObjectMetadata,
    });

    expect(sourceRules).toHaveLength(1);
    expect(sourceRules[0].targetShape).toEqual({ kind: 'SELF' });
    expect(sourceRules[0].actions).toEqual([
      'created',
      'updated',
      'deleted',
      'restored',
    ]);
  });

  it('should drop the self rule when an inactive override row exists', async () => {
    const service = await setup([buildSelfOverrideRow({ isActive: false })]);

    const { sourceRules } = await service.getRulesForEventBatch({
      workspaceId: WORKSPACE_ID,
      flatObjectMetadata: companyFlatObjectMetadata,
    });

    expect(sourceRules).toHaveLength(0);
  });

  it('should apply the override actions when an active override row exists', async () => {
    const service = await setup([
      buildSelfOverrideRow({ actions: ['created', 'deleted'] }),
    ]);

    const { sourceRules } = await service.getRulesForEventBatch({
      workspaceId: WORKSPACE_ID,
      flatObjectMetadata: companyFlatObjectMetadata,
    });

    expect(sourceRules).toHaveLength(1);
    expect(sourceRules[0].actions).toEqual(['created', 'deleted']);
  });

  it('should resolve the trigger field names of an override row', async () => {
    const service = await setup(
      [buildSelfOverrideRow({ triggerFieldMetadataIds: ['name-field-id'] })],
      [
        {
          universalIdentifier: 'name-field-universal-identifier',
          id: 'name-field-id',
          name: 'name',
        },
      ],
    );

    const { sourceRules } = await service.getRulesForEventBatch({
      workspaceId: WORKSPACE_ID,
      flatObjectMetadata: companyFlatObjectMetadata,
    });

    expect(sourceRules).toHaveLength(1);
    expect(sourceRules[0].triggerFieldNames).toEqual(['name']);
  });

  it('should keep the surviving trigger fields when one has been deleted', async () => {
    const service = await setup(
      [
        buildSelfOverrideRow({
          triggerFieldMetadataIds: ['name-field-id', 'deleted-field-id'],
        }),
      ],
      [
        {
          universalIdentifier: 'name-field-universal-identifier',
          id: 'name-field-id',
          name: 'name',
        },
      ],
    );

    const { sourceRules } = await service.getRulesForEventBatch({
      workspaceId: WORKSPACE_ID,
      flatObjectMetadata: companyFlatObjectMetadata,
    });

    expect(sourceRules[0].triggerFieldNames).toEqual(['name']);
  });

  it('should emit on any field when every trigger field has been deleted', async () => {
    const service = await setup([
      buildSelfOverrideRow({ triggerFieldMetadataIds: ['deleted-field-id'] }),
    ]);

    const { sourceRules } = await service.getRulesForEventBatch({
      workspaceId: WORKSPACE_ID,
      flatObjectMetadata: companyFlatObjectMetadata,
    });

    expect(sourceRules).toHaveLength(1);
    expect(sourceRules[0].triggerFieldNames).toBeNull();
  });

  it('should let the overrides blob win over the application owned actions', async () => {
    const service = await setup([
      buildSelfOverrideRow({
        actions: ['created', 'deleted'],
        overrides: { actions: ['restored'] },
      }),
    ]);

    const { sourceRules } = await service.getRulesForEventBatch({
      workspaceId: WORKSPACE_ID,
      flatObjectMetadata: companyFlatObjectMetadata,
    });

    expect(sourceRules[0].actions).toEqual(['restored']);
  });

  it('should let the overrides blob turn a rule off', async () => {
    const service = await setup([
      buildSelfOverrideRow({ isActive: true, overrides: { isActive: false } }),
    ]);

    const { sourceRules } = await service.getRulesForEventBatch({
      workspaceId: WORKSPACE_ID,
      flatObjectMetadata: companyFlatObjectMetadata,
    });

    expect(sourceRules).toHaveLength(0);
  });

  it('should not derive a self rule for a system object', async () => {
    const service = await setup([]);

    const { sourceRules } = await service.getRulesForEventBatch({
      workspaceId: WORKSPACE_ID,
      flatObjectMetadata: {
        ...companyFlatObjectMetadata,
        isSystem: true,
      },
    });

    expect(sourceRules).toHaveLength(0);
  });
});
