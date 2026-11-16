import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';

import { PageLayoutType } from 'twenty-shared/types';
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
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.workflowRunRecordPage.tabs.home
        .universalIdentifier,
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.workflowRunRecordPage.tabs
            .home.widgets.fields.universalIdentifier,
        ...WIDGET_PROPS.fields,
      },
    },
  },
  flow: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.workflowRunRecordPage.tabs.flow
        .universalIdentifier,
    ...TAB_PROPS.flowSecondary,
    widgets: {
      workflowRun: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.workflowRunRecordPage.tabs
            .flow.widgets.workflowRun.universalIdentifier,
        ...WIDGET_PROPS.workflowRun,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_WORKFLOW_RUN_PAGE_LAYOUT_CONFIG = {
  name: 'Default Workflow Run Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: STANDARD_OBJECTS.workflowRun.universalIdentifier,
  universalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.workflowRunRecordPage
      .universalIdentifier,
  defaultTabUniversalIdentifier:
    WORKFLOW_RUN_PAGE_TABS.flow.universalIdentifier,
  tabs: WORKFLOW_RUN_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
