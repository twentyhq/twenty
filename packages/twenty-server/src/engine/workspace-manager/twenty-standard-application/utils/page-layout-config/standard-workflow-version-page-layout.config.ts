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

const WORKFLOW_VERSION_PAGE_TABS = {
  home: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.workflowVersionRecordPage.tabs
        .home.universalIdentifier,
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.workflowVersionRecordPage
            .tabs.home.widgets.fields.universalIdentifier,
        ...WIDGET_PROPS.fields,
      },
    },
  },
  flow: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.workflowVersionRecordPage.tabs
        .flow.universalIdentifier,
    ...TAB_PROPS.flowSecondary,
    widgets: {
      workflowVersion: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.workflowVersionRecordPage
            .tabs.flow.widgets.workflowVersion.universalIdentifier,
        ...WIDGET_PROPS.workflowVersion,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_WORKFLOW_VERSION_PAGE_LAYOUT_CONFIG = {
  name: 'Default Workflow Version Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier:
    STANDARD_OBJECTS.workflowVersion.universalIdentifier,
  universalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.workflowVersionRecordPage
      .universalIdentifier,
  defaultTabUniversalIdentifier:
    WORKFLOW_VERSION_PAGE_TABS.flow.universalIdentifier,
  tabs: WORKFLOW_VERSION_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
