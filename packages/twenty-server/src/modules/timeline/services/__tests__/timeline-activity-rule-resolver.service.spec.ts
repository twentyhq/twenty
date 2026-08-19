import { Test } from '@nestjs/testing';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { TimelineActivityRuleResolverService } from 'src/modules/timeline/services/timeline-activity-rule-resolver.service';

const WORKSPACE_ID = 'workspace-id';
const COMPANY_OBJECT_ID = 'company-object-id';

const companyFlatObjectMetadata = {
  id: COMPANY_OBJECT_ID,
  nameSingular: 'company',
  isAuditLogged: true,
  isSystem: false,
} as unknown as FlatObjectMetadata;

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
  ...overrides,
});

describe('TimelineActivityRuleResolverService', () => {
  const setup = async (ruleRows: Record<string, unknown>[]) => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TimelineActivityRuleResolverService,
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
              flatFieldMetadataMaps: buildMaps(),
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

    return moduleRef.get(TimelineActivityRuleResolverService);
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

  it('should not derive a self rule for a system object', async () => {
    const service = await setup([]);

    const { sourceRules } = await service.getRulesForEventBatch({
      workspaceId: WORKSPACE_ID,
      flatObjectMetadata: {
        ...companyFlatObjectMetadata,
        isSystem: true,
      } as FlatObjectMetadata,
    });

    expect(sourceRules).toHaveLength(0);
  });
});
