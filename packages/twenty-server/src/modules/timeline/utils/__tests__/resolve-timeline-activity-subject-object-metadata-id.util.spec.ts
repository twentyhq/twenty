import { resolveTimelineActivitySubjectObjectMetadataId } from 'src/modules/timeline/utils/resolve-timeline-activity-subject-object-metadata-id.util';

const TARGET_JOIN_COLUMNS = [
  { joinColumnName: 'targetPersonId', objectMetadataId: 'person-object-id' },
  { joinColumnName: 'targetCompanyId', objectMetadataId: 'company-object-id' },
];

describe('resolveTimelineActivitySubjectObjectMetadataId', () => {
  it('should resolve the linked object of a linked activity', () => {
    expect(
      resolveTimelineActivitySubjectObjectMetadataId({
        timelineActivity: {
          linkedObjectMetadataId: 'note-object-id',
          targetPersonId: 'person-id',
        },
        targetJoinColumns: TARGET_JOIN_COLUMNS,
      }),
    ).toBe('note-object-id');
  });

  it('should resolve the target object of an activity about its own record', () => {
    expect(
      resolveTimelineActivitySubjectObjectMetadataId({
        timelineActivity: {
          linkedObjectMetadataId: null,
          targetPersonId: null,
          targetCompanyId: 'company-id',
        },
        targetJoinColumns: TARGET_JOIN_COLUMNS,
      }),
    ).toBe('company-object-id');
  });

  it('should not resolve an object when no target is set', () => {
    expect(
      resolveTimelineActivitySubjectObjectMetadataId({
        timelineActivity: {
          linkedObjectMetadataId: null,
          targetPersonId: null,
          targetCompanyId: null,
        },
        targetJoinColumns: TARGET_JOIN_COLUMNS,
      }),
    ).toBeUndefined();
  });
});
