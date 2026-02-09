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

const COMPANY_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab01-4001-8001-c0aba11c0101',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac01-4001-8001-c0aba11c0111',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab01-4001-8001-c0aba11c0102',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac01-4001-8001-c0aba11c0121',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
  tasks: {
    universalIdentifier: '20202020-ab01-4001-8001-c0aba11c0103',
    ...TAB_PROPS.tasks,
    widgets: {
      tasks: {
        universalIdentifier: '20202020-ac01-4001-8001-c0aba11c0131',
        ...WIDGET_PROPS.tasks,
      },
    },
  },
  notes: {
    universalIdentifier: '20202020-ab01-4001-8001-c0aba11c0104',
    ...TAB_PROPS.notes,
    widgets: {
      notes: {
        universalIdentifier: '20202020-ac01-4001-8001-c0aba11c0141',
        ...WIDGET_PROPS.notes,
      },
    },
  },
  files: {
    universalIdentifier: '20202020-ab01-4001-8001-c0aba11c0105',
    ...TAB_PROPS.files,
    widgets: {
      files: {
        universalIdentifier: '20202020-ac01-4001-8001-c0aba11c0151',
        ...WIDGET_PROPS.files,
      },
    },
  },
  emails: {
    universalIdentifier: '20202020-ab01-4001-8001-c0aba11c0106',
    ...TAB_PROPS.emails,
    widgets: {
      emails: {
        universalIdentifier: '20202020-ac01-4001-8001-c0aba11c0161',
        ...WIDGET_PROPS.emails,
      },
    },
  },
  calendar: {
    universalIdentifier: '20202020-ab01-4001-8001-c0aba11c0107',
    ...TAB_PROPS.calendar,
    widgets: {
      calendar: {
        universalIdentifier: '20202020-ac01-4001-8001-c0aba11c0171',
        ...WIDGET_PROPS.calendar,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_COMPANY_PAGE_LAYOUT_CONFIG = {
  name: 'Default Company Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: STANDARD_OBJECTS.company.universalIdentifier,
  universalIdentifier: '20202020-a101-4001-8001-c0aba11c0001',
  defaultTabUniversalIdentifier: null,
  tabs: COMPANY_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
