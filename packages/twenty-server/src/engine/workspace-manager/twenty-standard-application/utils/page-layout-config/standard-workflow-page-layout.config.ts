import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';

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
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.workflowRecordPage.tabs.flow
        .universalIdentifier,
    ...TAB_PROPS.flow,
    widgets: {
      workflow: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.workflowRecordPage.tabs
            .flow.widgets.workflow.universalIdentifier,
        ...WIDGET_PROPS.workflow,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_WORKFLOW_PAGE_LAYOUT_CONFIG = {
  name: 'Default Workflow Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: STANDARD_OBJECTS.workflow.universalIdentifier,
  universalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.workflowRecordPage
      .universalIdentifier,
  defaultTabUniversalIdentifier: null,
  tabs: WORKFLOW_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
