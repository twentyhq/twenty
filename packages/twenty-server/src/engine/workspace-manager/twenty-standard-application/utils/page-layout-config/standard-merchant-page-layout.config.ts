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

const MERCHANT_PAGE_TABS = {
  home: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.merchantRecordPage.tabs.home
        .universalIdentifier,
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.merchantRecordPage.tabs
            .home.widgets.fields.universalIdentifier,
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.merchantRecordPage.tabs
        .timeline.universalIdentifier,
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.merchantRecordPage.tabs
            .timeline.widgets.timeline.universalIdentifier,
        ...WIDGET_PROPS.timeline,
      },
    },
  },
  tasks: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.merchantRecordPage.tabs.tasks
        .universalIdentifier,
    ...TAB_PROPS.tasks,
    widgets: {
      tasks: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.merchantRecordPage.tabs
            .tasks.widgets.tasks.universalIdentifier,
        ...WIDGET_PROPS.tasks,
      },
    },
  },
  notes: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.merchantRecordPage.tabs.notes
        .universalIdentifier,
    ...TAB_PROPS.notes,
    widgets: {
      notes: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.merchantRecordPage.tabs
            .notes.widgets.notes.universalIdentifier,
        ...WIDGET_PROPS.notes,
      },
    },
  },
  files: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.merchantRecordPage.tabs.files
        .universalIdentifier,
    ...TAB_PROPS.files,
    widgets: {
      files: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.merchantRecordPage.tabs
            .files.widgets.files.universalIdentifier,
        ...WIDGET_PROPS.files,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_MERCHANT_PAGE_LAYOUT_CONFIG = {
  name: 'Default Merchant Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: STANDARD_OBJECTS.merchant.universalIdentifier,
  universalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.merchantRecordPage
      .universalIdentifier,
  defaultTabUniversalIdentifier: null,
  tabs: MERCHANT_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
