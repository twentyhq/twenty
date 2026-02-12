import {
  STANDARD_COMPANY_PAGE_LAYOUT_CONFIG,
  STANDARD_DASHBOARD_PAGE_LAYOUT_CONFIG,
  STANDARD_NOTE_PAGE_LAYOUT_CONFIG,
  STANDARD_OPPORTUNITY_PAGE_LAYOUT_CONFIG,
  STANDARD_PERSON_PAGE_LAYOUT_CONFIG,
  STANDARD_TASK_PAGE_LAYOUT_CONFIG,
  STANDARD_WORKFLOW_PAGE_LAYOUT_CONFIG,
  STANDARD_WORKFLOW_RUN_PAGE_LAYOUT_CONFIG,
  STANDARD_WORKFLOW_VERSION_PAGE_LAYOUT_CONFIG,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config';
import { type StandardRecordPageLayouts } from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config/standard-page-layout-config.type';

export const STANDARD_PAGE_LAYOUTS = {
  myFirstDashboard: STANDARD_DASHBOARD_PAGE_LAYOUT_CONFIG,
  companyRecordPage: STANDARD_COMPANY_PAGE_LAYOUT_CONFIG,
  personRecordPage: STANDARD_PERSON_PAGE_LAYOUT_CONFIG,
  opportunityRecordPage: STANDARD_OPPORTUNITY_PAGE_LAYOUT_CONFIG,
  noteRecordPage: STANDARD_NOTE_PAGE_LAYOUT_CONFIG,
  taskRecordPage: STANDARD_TASK_PAGE_LAYOUT_CONFIG,
  workflowRecordPage: STANDARD_WORKFLOW_PAGE_LAYOUT_CONFIG,
  workflowVersionRecordPage: STANDARD_WORKFLOW_VERSION_PAGE_LAYOUT_CONFIG,
  workflowRunRecordPage: STANDARD_WORKFLOW_RUN_PAGE_LAYOUT_CONFIG,
} as const;

const { myFirstDashboard: _myFirstDashboard, ...recordPageLayouts } =
  STANDARD_PAGE_LAYOUTS;

export const STANDARD_RECORD_PAGE_LAYOUTS =
  recordPageLayouts satisfies StandardRecordPageLayouts;
