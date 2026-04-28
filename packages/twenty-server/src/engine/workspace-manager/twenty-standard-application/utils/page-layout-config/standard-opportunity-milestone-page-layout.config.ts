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

// Default record page layout for OpportunityMilestone — keeps the layout
// minimal (Home + Timeline + Tasks + Notes + Files) since the rich slot
// for Opportunity is the Roadmap view itself, not the record page.
const OPPORTUNITY_MILESTONE_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab06-4006-8006-0aa0b1ca1601',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac06-4006-8006-0aa0b1ca1611',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab06-4006-8006-0aa0b1ca1602',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac06-4006-8006-0aa0b1ca1621',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
  tasks: {
    universalIdentifier: '20202020-ab06-4006-8006-0aa0b1ca1603',
    ...TAB_PROPS.tasks,
    widgets: {
      tasks: {
        universalIdentifier: '20202020-ac06-4006-8006-0aa0b1ca1631',
        ...WIDGET_PROPS.tasks,
      },
    },
  },
  notes: {
    universalIdentifier: '20202020-ab06-4006-8006-0aa0b1ca1604',
    ...TAB_PROPS.notes,
    widgets: {
      notes: {
        universalIdentifier: '20202020-ac06-4006-8006-0aa0b1ca1641',
        ...WIDGET_PROPS.notes,
      },
    },
  },
  files: {
    universalIdentifier: '20202020-ab06-4006-8006-0aa0b1ca1605',
    ...TAB_PROPS.files,
    widgets: {
      files: {
        universalIdentifier: '20202020-ac06-4006-8006-0aa0b1ca1651',
        ...WIDGET_PROPS.files,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_OPPORTUNITY_MILESTONE_PAGE_LAYOUT_CONFIG = {
  name: 'Default Milestone Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier:
    STANDARD_OBJECTS.opportunityMilestone.universalIdentifier,
  universalIdentifier: '20202020-a106-4006-8006-0aa0b1ca1006',
  defaultTabUniversalIdentifier: null,
  tabs: OPPORTUNITY_MILESTONE_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
