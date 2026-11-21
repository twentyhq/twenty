import { planAccessGroupSyncRecomputes } from 'src/engine/permissions/internal/access-group/utils/plan-access-group-sync-recomputes.util';

const lookupRuleShapeHashesByObjectMetadataId = new Map([
  ['opportunity', new Set(['owner-rule-shape'])],
]);

describe('planAccessGroupSyncRecomputes', () => {
  it('should apply the changes of looked up groups incrementally', () => {
    expect(
      planAccessGroupSyncRecomputes({
        changedAccessGroups: [
          {
            objectMetadataId: 'opportunity',
            ruleShapeHash: 'owner-rule-shape',
          },
        ],
        lookupRuleShapeHashesByObjectMetadataId,
        maxIncrementalChangesPerObject: 10,
      }),
    ).toEqual({
      fullRecomputeObjectMetadataIds: [],
      incrementalObjectMetadataIds: ['opportunity'],
    });
  });

  it('should recompute the whole object when a group that is not looked up changes', () => {
    expect(
      planAccessGroupSyncRecomputes({
        changedAccessGroups: [
          {
            objectMetadataId: 'opportunity',
            ruleShapeHash: 'owner-rule-shape',
          },
          {
            objectMetadataId: 'opportunity',
            ruleShapeHash: 'other-rule-shape',
          },
          { objectMetadataId: 'company', ruleShapeHash: 'owner-rule-shape' },
        ],
        lookupRuleShapeHashesByObjectMetadataId,
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
          ruleShapeHash: 'owner-rule-shape',
        })),
        lookupRuleShapeHashesByObjectMetadataId,
        maxIncrementalChangesPerObject: 2,
      }),
    ).toEqual({
      fullRecomputeObjectMetadataIds: ['opportunity'],
      incrementalObjectMetadataIds: [],
    });
  });
});
