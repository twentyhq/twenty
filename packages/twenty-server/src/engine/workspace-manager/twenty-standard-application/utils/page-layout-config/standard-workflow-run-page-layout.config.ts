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

const WORKFLOW_RUN_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab08-4008-8008-a0bcf10a8801',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac08-4008-8008-a0bcf10a8811',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  flow: {
    universalIdentifier: '20202020-ab08-4008-8008-a0bcf10a8802',
    ...TAB_PROPS.flowSecondary,
    widgets: {
      workflowRun: {
        universalIdentifier: '20202020-ac08-4008-8008-a0bcf10a8821',
        ...WIDGET_PROPS.workflowRun,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_WORKFLOW_RUN_PAGE_LAYOUT_CONFIG = {
  name: 'Default Workflow Run Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: STANDARD_OBJECTS.workflowRun.universalIdentifier,
  universalIdentifier: '20202020-a108-4008-8008-a0bcf10ac008',
  defaultTabUniversalIdentifier:
    WORKFLOW_RUN_PAGE_TABS.flow.universalIdentifier,
  tabs: WORKFLOW_RUN_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
