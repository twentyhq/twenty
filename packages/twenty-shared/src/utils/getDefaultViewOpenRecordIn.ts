import { ViewOpenRecordIn } from '../types/ViewOpenRecordIn';

// Records that read much better on a full page, so their views start there
// rather than deferring to the member's preference. This is a starting point,
// not a capability check: a view can still be set to the side panel by hand.
const OBJECT_NAME_SINGULARS_DEFAULTING_TO_RECORD_PAGE: string[] = [
  'workflow',
  'workflowVersion',
  'workflowRun',
  'dashboard',
  'messageCampaign',
];

export const getDefaultViewOpenRecordIn = (
  objectNameSingular: string,
): ViewOpenRecordIn =>
  OBJECT_NAME_SINGULARS_DEFAULTING_TO_RECORD_PAGE.includes(objectNameSingular)
    ? ViewOpenRecordIn.RECORD_PAGE
    : ViewOpenRecordIn.USER_PREFERENCE;
