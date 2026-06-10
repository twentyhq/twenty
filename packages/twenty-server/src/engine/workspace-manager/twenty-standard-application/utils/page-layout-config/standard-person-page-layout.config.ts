import {
  STANDARD_OBJECTS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';

import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import {
  GRID_POSITIONS,
  TAB_PROPS,
  VERTICAL_LIST_LAYOUT_POSITIONS,
  WIDGET_PROPS,
} from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout-tabs.template';
import {
  type StandardPageLayoutConfig,
  type StandardPageLayoutTabConfig,
} from 'src/engine/workspace-manager/twenty-standard-application/utils/page-layout-config/standard-page-layout-config.type';

const PERSON_PAGE_TABS = {
  home: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.home
        .universalIdentifier,
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.home
            .widgets.fields.universalIdentifier,
        ...WIDGET_PROPS.fields,
      },
      company: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.home
            .widgets.company.universalIdentifier,
        title: 'Company',
        type: WidgetType.FIELD,
        gridPosition: GRID_POSITIONS.FULL_WIDTH,
        position: VERTICAL_LIST_LAYOUT_POSITIONS.SECOND,
        fieldUniversalIdentifier:
          STANDARD_OBJECTS.person.fields.company.universalIdentifier,
      },
      pointOfContactForOpportunities: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.home
            .widgets.pointOfContactForOpportunities.universalIdentifier,
        title: 'Opportunities',
        type: WidgetType.FIELD,
        gridPosition: GRID_POSITIONS.FULL_WIDTH,
        position: VERTICAL_LIST_LAYOUT_POSITIONS.THIRD,
        fieldUniversalIdentifier:
          STANDARD_OBJECTS.person.fields.pointOfContactForOpportunities
            .universalIdentifier,
      },
      messageTopicSubscriptions: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.home
            .widgets.messageTopicSubscriptions.universalIdentifier,
        title: 'Topics',
        type: WidgetType.FIELD,
        gridPosition: GRID_POSITIONS.FULL_WIDTH,
        position: VERTICAL_LIST_LAYOUT_POSITIONS.FOURTH,
        fieldUniversalIdentifier:
          STANDARD_OBJECTS.person.fields.messageTopicSubscriptions
            .universalIdentifier,
      },
      listMemberships: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.home
            .widgets.listMemberships.universalIdentifier,
        title: 'Lists',
        type: WidgetType.FIELD,
        gridPosition: GRID_POSITIONS.FULL_WIDTH,
        position: VERTICAL_LIST_LAYOUT_POSITIONS.FIFTH,
        fieldUniversalIdentifier:
          STANDARD_OBJECTS.person.fields.listMemberships.universalIdentifier,
      },
    },
  },
  timeline: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.timeline
        .universalIdentifier,
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs
            .timeline.widgets.timeline.universalIdentifier,
        ...WIDGET_PROPS.timeline,
      },
    },
  },
  tasks: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.tasks
        .universalIdentifier,
    ...TAB_PROPS.tasks,
    widgets: {
      tasks: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.tasks
            .widgets.tasks.universalIdentifier,
        ...WIDGET_PROPS.tasks,
      },
    },
  },
  notes: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.notes
        .universalIdentifier,
    ...TAB_PROPS.notes,
    widgets: {
      notes: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.notes
            .widgets.notes.universalIdentifier,
        ...WIDGET_PROPS.notes,
      },
    },
  },
  files: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.files
        .universalIdentifier,
    ...TAB_PROPS.files,
    widgets: {
      files: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.files
            .widgets.files.universalIdentifier,
        ...WIDGET_PROPS.files,
      },
    },
  },
  emails: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.emails
        .universalIdentifier,
    ...TAB_PROPS.emails,
    widgets: {
      emails: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs
            .emails.widgets.emails.universalIdentifier,
        ...WIDGET_PROPS.emails,
      },
    },
  },
  calendar: {
    universalIdentifier:
      STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs.calendar
        .universalIdentifier,
    ...TAB_PROPS.calendar,
    widgets: {
      calendar: {
        universalIdentifier:
          STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage.tabs
            .calendar.widgets.calendar.universalIdentifier,
        ...WIDGET_PROPS.calendar,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_PERSON_PAGE_LAYOUT_CONFIG = {
  name: 'Default Person Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: STANDARD_OBJECTS.person.universalIdentifier,
  universalIdentifier:
    STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS.personRecordPage
      .universalIdentifier,
  defaultTabUniversalIdentifier: null,
  tabs: PERSON_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
