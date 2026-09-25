import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { resolveSystemRelationTargetFlatObjectMetadatas } from 'src/engine/metadata-modules/object-metadata/utils/resolve-system-relation-target-flat-object-metadatas.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const {
  allFlatEntityMaps: { flatObjectMetadataMaps },
} = computeTwentyStandardApplicationAllFlatEntityMaps({
  now: '2026-09-24T00:00:00.000Z',
  workspaceId: '20202020-1111-4111-8111-111111111111',
  twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
});

const withoutObject = (nameSingular: keyof typeof STANDARD_OBJECTS) => ({
  ...flatObjectMetadataMaps,
  byUniversalIdentifier: Object.fromEntries(
    Object.entries(flatObjectMetadataMaps.byUniversalIdentifier).filter(
      ([universalIdentifier]) =>
        universalIdentifier !==
        STANDARD_OBJECTS[nameSingular].universalIdentifier,
    ),
  ),
});

describe('resolveSystemRelationTargetFlatObjectMetadatas', () => {
  it('resolves every relation target the workspace has', () => {
    const {
      standardTargetFlatObjectMetadataByNameSingular,
      missingDefaultRelationObjectNameSingulars,
    } = resolveSystemRelationTargetFlatObjectMetadatas({
      flatObjectMetadataMaps,
    });

    expect(Object.keys(standardTargetFlatObjectMetadataByNameSingular)).toEqual(
      [
        'timelineActivity',
        'attachment',
        'noteTarget',
        'taskTarget',
        'agentChatThreadTarget',
      ],
    );
    expect(missingDefaultRelationObjectNameSingulars).toEqual([]);
  });

  // Its upgrade command provisions the chat target and backfills the objects
  // created before it ran, so creating an object meanwhile must still work.
  it('leaves out the chat target without reporting it while it is not provisioned', () => {
    const {
      standardTargetFlatObjectMetadataByNameSingular,
      missingDefaultRelationObjectNameSingulars,
    } = resolveSystemRelationTargetFlatObjectMetadatas({
      flatObjectMetadataMaps: withoutObject('agentChatThreadTarget'),
    });

    expect(Object.keys(standardTargetFlatObjectMetadataByNameSingular)).toEqual(
      ['timelineActivity', 'attachment', 'noteTarget', 'taskTarget'],
    );
    expect(missingDefaultRelationObjectNameSingulars).toEqual([]);
  });

  it('reports a missing default relation target', () => {
    const {
      standardTargetFlatObjectMetadataByNameSingular,
      missingDefaultRelationObjectNameSingulars,
    } = resolveSystemRelationTargetFlatObjectMetadatas({
      flatObjectMetadataMaps: withoutObject('noteTarget'),
    });

    expect(missingDefaultRelationObjectNameSingulars).toEqual(['noteTarget']);
    expect(standardTargetFlatObjectMetadataByNameSingular).not.toHaveProperty(
      'noteTarget',
    );
  });
});
