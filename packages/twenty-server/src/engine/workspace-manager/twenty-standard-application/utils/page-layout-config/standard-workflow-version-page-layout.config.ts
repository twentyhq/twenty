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

const WORKFLOW_VERSION_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab07-4007-8007-a0bcf10a7701',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac07-4007-8007-a0bcf10a7711',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  flow: {
    universalIdentifier: '20202020-ab07-4007-8007-a0bcf10a7702',
    ...TAB_PROPS.flowSecondary,
    widgets: {
      workflowVersion: {
        universalIdentifier: '20202020-ac07-4007-8007-a0bcf10a7721',
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
  universalIdentifier: '20202020-a107-4007-8007-a0bcf10ab007',
  defaultTabUniversalIdentifier:
    WORKFLOW_VERSION_PAGE_TABS.flow.universalIdentifier,
  tabs: WORKFLOW_VERSION_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
