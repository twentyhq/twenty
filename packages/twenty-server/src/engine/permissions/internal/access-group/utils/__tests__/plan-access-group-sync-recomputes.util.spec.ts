import { planAccessGroupSyncRecomputes } from 'src/engine/permissions/internal/access-group/utils/plan-access-group-sync-recomputes.util';

const familyRuleIdsByObjectMetadataId = new Map([
  ['opportunity', new Set(['owner-rule'])],
]);

describe('planAccessGroupSyncRecomputes', () => {
  it('should apply family group changes incrementally', () => {
    expect(
      planAccessGroupSyncRecomputes({
        changedAccessGroups: [
          {
            objectMetadataId: 'opportunity',
            rowLevelPermissionPredicateGroupId: 'owner-rule',
          },
        ],
        familyRuleIdsByObjectMetadataId,
        maxIncrementalChangesPerObject: 10,
      }),
    ).toEqual({
      fullRecomputeObjectMetadataIds: [],
      incrementalObjectMetadataIds: ['opportunity'],
    });
  });

  it('should recompute the whole object when a group outside a family changes', () => {
    expect(
      planAccessGroupSyncRecomputes({
        changedAccessGroups: [
          {
            objectMetadataId: 'opportunity',
            rowLevelPermissionPredicateGroupId: 'owner-rule',
          },
          {
            objectMetadataId: 'opportunity',
            rowLevelPermissionPredicateGroupId: null,
          },
          {
            objectMetadataId: 'company',
            rowLevelPermissionPredicateGroupId: 'owner-rule',
          },
        ],
        familyRuleIdsByObjectMetadataId,
        maxIncrementalChangesPerObject: 10,
      }),
    ).toEqual({
      fullRecomputeObjectMetadataIds: ['opportunity', 'company'],
      incrementalObjectMetadataIds: [],
    });
  });

  it('should recompute the whole object above the incremental change limit', () => {
    expect(
      planAccessGroupSyncRecomputes({
        changedAccessGroups: Array.from({ length: 3 }, () => ({
          objectMetadataId: 'opportunity',
          rowLevelPermissionPredicateGroupId: 'owner-rule',
        })),
        familyRuleIdsByObjectMetadataId,
        maxIncrementalChangesPerObject: 2,
      }),
    ).toEqual({
      fullRecomputeObjectMetadataIds: ['opportunity'],
      incrementalObjectMetadataIds: [],
    });
  });
});
