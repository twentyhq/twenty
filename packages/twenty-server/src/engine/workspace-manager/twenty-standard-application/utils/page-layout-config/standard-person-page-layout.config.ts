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

const PERSON_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab02-4002-8002-ae0a1ea11201',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac02-4002-8002-ae0a1ea11211',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab02-4002-8002-ae0a1ea11202',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac02-4002-8002-ae0a1ea11221',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
  tasks: {
    universalIdentifier: '20202020-ab02-4002-8002-ae0a1ea11203',
    ...TAB_PROPS.tasks,
    widgets: {
      tasks: {
        universalIdentifier: '20202020-ac02-4002-8002-ae0a1ea11231',
        ...WIDGET_PROPS.tasks,
      },
    },
  },
  notes: {
    universalIdentifier: '20202020-ab02-4002-8002-ae0a1ea11204',
    ...TAB_PROPS.notes,
    widgets: {
      notes: {
        universalIdentifier: '20202020-ac02-4002-8002-ae0a1ea11241',
        ...WIDGET_PROPS.notes,
      },
    },
  },
  files: {
    universalIdentifier: '20202020-ab02-4002-8002-ae0a1ea11205',
    ...TAB_PROPS.files,
    widgets: {
      files: {
        universalIdentifier: '20202020-ac02-4002-8002-ae0a1ea11251',
        ...WIDGET_PROPS.files,
      },
    },
  },
  emails: {
    universalIdentifier: '20202020-ab02-4002-8002-ae0a1ea11206',
    ...TAB_PROPS.emails,
    widgets: {
      emails: {
        universalIdentifier: '20202020-ac02-4002-8002-ae0a1ea11261',
        ...WIDGET_PROPS.emails,
      },
    },
  },
  calendar: {
    universalIdentifier: '20202020-ab02-4002-8002-ae0a1ea11207',
    ...TAB_PROPS.calendar,
    widgets: {
      calendar: {
        universalIdentifier: '20202020-ac02-4002-8002-ae0a1ea11271',
        ...WIDGET_PROPS.calendar,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_PERSON_PAGE_LAYOUT_CONFIG = {
  name: 'Default Person Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
  universalIdentifier: '20202020-a102-4002-8002-ae0a1ea11002',
  defaultTabUniversalIdentifier: null,
  tabs: PERSON_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
