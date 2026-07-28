import { ViewOpenRecordIn } from '../types/ViewOpenRecordIn';

// Records that need the room of a full page to be usable at all. Their views
// open there rather than deferring to a preference the layout cannot honour.
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
