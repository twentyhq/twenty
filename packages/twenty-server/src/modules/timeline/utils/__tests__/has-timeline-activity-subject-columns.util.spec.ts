import { hasTimelineActivitySubjectColumns } from 'src/modules/timeline/utils/has-timeline-activity-subject-columns.util';

const TARGET_JOIN_COLUMNS = [
  { joinColumnName: 'targetPersonId', objectMetadataId: 'person-object-id' },
];

describe('hasTimelineActivitySubjectColumns', () => {
  it('should be true when the linked and target columns are present', () => {
    expect(
      hasTimelineActivitySubjectColumns({
        timelineActivity: {
          linkedObjectMetadataId: null,
          targetPersonId: null,
        },
        targetJoinColumns: TARGET_JOIN_COLUMNS,
      }),
    ).toBe(true);
  });

  it('should be false when a target column was not selected', () => {
    expect(
      hasTimelineActivitySubjectColumns({
        timelineActivity: { linkedObjectMetadataId: null },
        targetJoinColumns: TARGET_JOIN_COLUMNS,
      }),
    ).toBe(false);
  });
});
