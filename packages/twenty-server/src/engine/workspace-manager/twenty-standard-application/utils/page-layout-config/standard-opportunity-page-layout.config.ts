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

const OPPORTUNITY_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab03-4003-8003-0aa0b1ca1301',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac03-4003-8003-0aa0b1ca1311',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab03-4003-8003-0aa0b1ca1302',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac03-4003-8003-0aa0b1ca1321',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
  tasks: {
    universalIdentifier: '20202020-ab03-4003-8003-0aa0b1ca1303',
    ...TAB_PROPS.tasks,
    widgets: {
      tasks: {
        universalIdentifier: '20202020-ac03-4003-8003-0aa0b1ca1331',
        ...WIDGET_PROPS.tasks,
      },
    },
  },
  notes: {
    universalIdentifier: '20202020-ab03-4003-8003-0aa0b1ca1304',
    ...TAB_PROPS.notes,
    widgets: {
      notes: {
        universalIdentifier: '20202020-ac03-4003-8003-0aa0b1ca1341',
        ...WIDGET_PROPS.notes,
      },
    },
  },
  files: {
    universalIdentifier: '20202020-ab03-4003-8003-0aa0b1ca1305',
    ...TAB_PROPS.files,
    widgets: {
      files: {
        universalIdentifier: '20202020-ac03-4003-8003-0aa0b1ca1351',
        ...WIDGET_PROPS.files,
      },
    },
  },
  emails: {
    universalIdentifier: '20202020-ab03-4003-8003-0aa0b1ca1306',
    ...TAB_PROPS.emails,
    widgets: {
      emails: {
        universalIdentifier: '20202020-ac03-4003-8003-0aa0b1ca1361',
        ...WIDGET_PROPS.emails,
      },
    },
  },
  calendar: {
    universalIdentifier: '20202020-ab03-4003-8003-0aa0b1ca1307',
    ...TAB_PROPS.calendar,
    widgets: {
      calendar: {
        universalIdentifier: '20202020-ac03-4003-8003-0aa0b1ca1371',
        ...WIDGET_PROPS.calendar,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_OPPORTUNITY_PAGE_LAYOUT_CONFIG = {
  name: 'Default Opportunity Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: STANDARD_OBJECTS.opportunity.universalIdentifier,
  universalIdentifier: '20202020-a103-4003-8003-0aa0b1ca1003',
  defaultTabUniversalIdentifier: null,
  tabs: OPPORTUNITY_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
