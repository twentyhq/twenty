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

const WORKFLOW_AUTOMATED_TRIGGER_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab15-4015-8015-a0bcf1151501',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac15-4015-8015-a0bcf1151511',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab15-4015-8015-a0bcf1151502',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac15-4015-8015-a0bcf1151521',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_WORKFLOW_AUTOMATED_TRIGGER_PAGE_LAYOUT_CONFIG = {
  name: 'Default Workflow Automated Trigger Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier:
    STANDARD_OBJECTS.workflowAutomatedTrigger.universalIdentifier,
  universalIdentifier: '20202020-a115-4015-8015-a0bcf1150001',
  defaultTabUniversalIdentifier: null,
  tabs: WORKFLOW_AUTOMATED_TRIGGER_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
