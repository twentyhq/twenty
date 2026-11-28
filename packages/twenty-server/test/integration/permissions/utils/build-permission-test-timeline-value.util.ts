import {
  type PermissionTestTimelineFieldName,
  type PermissionTestTimelineRecordName,
} from 'test/integration/permissions/utils/permission-test-timeline-fixture.type';

export const buildPermissionTestTimelineValue = ({
  record,
  fieldName,
}: {
  record: PermissionTestTimelineRecordName;
  fieldName: PermissionTestTimelineFieldName;
}) => `Timeline ${fieldName} of ${record}`;
