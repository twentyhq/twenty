import { getTimelineActivityTypeTargetRelationApplicationIds } from 'src/engine/workspace-manager/workspace-migration/services/utils/get-timeline-activity-type-target-relation-application-ids.util';

const CUSTOM_APPLICATION_ID = '00000000-0000-4000-8000-000000000001';
const TARGET_RELATION_FIELD_UNIVERSAL_IDENTIFIER =
  '00000000-0000-4000-8000-000000000002';

describe('getTimelineActivityTypeTargetRelationApplicationIds', () => {
  it('includes the application that owns a soft-referenced target relation', () => {
    const applicationIds = getTimelineActivityTypeTargetRelationApplicationIds({
      flatFieldMetadataMaps: {
        byUniversalIdentifier: {
          [TARGET_RELATION_FIELD_UNIVERSAL_IDENTIFIER]: {
            applicationId: CUSTOM_APPLICATION_ID,
          },
        },
      },
      timelineActivityTypeOperations: {
        flatEntityToCreate: {
          timelineActivityType: {
            targetRelationFieldUniversalIdentifier:
              TARGET_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
          },
        },
        flatEntityToUpdate: {},
        flatEntityToDelete: {},
      },
    });

    expect(applicationIds).toEqual([CUSTOM_APPLICATION_ID]);
  });

  it('ignores absent and unresolved target relations', () => {
    const applicationIds = getTimelineActivityTypeTargetRelationApplicationIds({
      flatFieldMetadataMaps: {
        byUniversalIdentifier: {},
      },
      timelineActivityTypeOperations: {
        flatEntityToCreate: {
          selfTimelineActivityType: {
            targetRelationFieldUniversalIdentifier: null,
          },
          missingRelationTimelineActivityType: {
            targetRelationFieldUniversalIdentifier:
              TARGET_RELATION_FIELD_UNIVERSAL_IDENTIFIER,
          },
        },
        flatEntityToUpdate: {},
        flatEntityToDelete: {},
      },
    });

    expect(applicationIds).toEqual([]);
  });
});
