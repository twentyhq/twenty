import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { TimelineActivityRoutingPlanService } from 'src/modules/timeline/services/timeline-activity-routing-plan.service';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';

const {
  allFlatEntityMaps: {
    flatObjectMetadataMaps: standardFlatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatTimelineActivityTypeMaps,
  },
} = computeTwentyStandardApplicationAllFlatEntityMaps({
  now: '2026-11-16T12:00:00.000Z',
  workspaceId: WORKSPACE_ID,
  twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
});

const flatFieldMetadatas = Object.values(
  flatFieldMetadataMaps.byUniversalIdentifier,
).filter(isDefined);

const flatObjectMetadataMaps = addAllFlatEntitiesToFlatEntityMaps({
  flatEntities: Object.values(
    standardFlatObjectMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .map((flatObjectMetadata) => ({
      ...flatObjectMetadata,
      fieldIds: flatFieldMetadatas
        .filter(
          ({ objectMetadataId }) => objectMetadataId === flatObjectMetadata.id,
        )
        .map(({ id }) => id),
    })),
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const buildRoutingPlanService = () =>
  new TimelineActivityRoutingPlanService({
    getOrRecomputeManyOrAllFlatEntityMapsWithHashes: jest
      .fn()
      .mockResolvedValue({
        data: {
          flatObjectMetadataMaps,
          flatFieldMetadataMapsOrm: flatFieldMetadataMaps,
          flatTimelineActivityTypeMaps,
        },
        hashes: {
          flatObjectMetadataMaps: 'objects',
          flatFieldMetadataMapsOrm: 'fields',
          flatTimelineActivityTypeMaps: 'timeline-activity-types',
        },
      }),
  } as unknown as WorkspaceManyOrAllFlatEntityMapsCacheService);

describe('TimelineActivityRoutingPlanService', () => {
  it('routes attachment events only to objects the timeline can point to', async () => {
    const attachmentFlatObjectMetadata = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatObjectMetadataMaps,
      universalIdentifier: STANDARD_OBJECTS.attachment.universalIdentifier,
    });

    if (attachmentFlatObjectMetadata === undefined) {
      throw new Error('Standard attachment object is missing');
    }

    const { sourceRules } =
      await buildRoutingPlanService().getRulesForEventBatch({
        workspaceId: WORKSPACE_ID,
        flatObjectMetadata: attachmentFlatObjectMetadata,
      });

    const targetObjectNamesSingular = new Set(
      sourceRules.flatMap((rule) =>
        rule.targetShape.kind === 'SELF'
          ? []
          : rule.targetShape.targetJoinColumns.map(
              ({ targetObjectNameSingular }) => targetObjectNameSingular,
            ),
      ),
    );

    expect([...targetObjectNamesSingular].sort()).toEqual([
      'company',
      'dashboard',
      'note',
      'opportunity',
      'person',
      'task',
    ]);
  });
});
