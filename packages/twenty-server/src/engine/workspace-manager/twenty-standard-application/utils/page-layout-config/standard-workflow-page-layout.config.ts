import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import {
  TAB_PROPS,
  WIDGET_PROPS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout-tabs.template';
import {
  type StandardPageLayoutConfig,
  type StandardPageLayoutTabConfig,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config/standard-page-layout-config.type';

const WORKFLOW_PAGE_TABS = {
  flow: {
    universalIdentifier: '20202020-ab06-4006-8006-a0bcf10a6601',
    ...TAB_PROPS.flow,
    widgets: {
      workflow: {
        universalIdentifier: '20202020-ac06-4006-8006-a0bcf10a6611',
        ...WIDGET_PROPS.workflow,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_WORKFLOW_PAGE_LAYOUT_CONFIG = {
  name: 'Default Workflow Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: STANDARD_OBJECTS.workflow.universalIdentifier,
  universalIdentifier: '20202020-a106-4006-8006-a0bcf10aa006',
  defaultTabUniversalIdentifier: null,
  tabs: WORKFLOW_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
