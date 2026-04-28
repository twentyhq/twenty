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

// Minimal page layout for OpportunityMilestoneDependency: just the fields
// widget on the home tab. Edges aren't records users open often, but the
// layout still has to exist so the page-layout customization editor doesn't
// fall back to placeholder UUIDs (the bug we fixed in Fase 6.6 follow-up).
const OPPORTUNITY_MILESTONE_DEPENDENCY_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab07-4007-8007-0aa0b1ca1701',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac07-4007-8007-0aa0b1ca1711',
        ...WIDGET_PROPS.fields,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_OPPORTUNITY_MILESTONE_DEPENDENCY_PAGE_LAYOUT_CONFIG = {
  name: 'Default Milestone Dependency Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier:
    STANDARD_OBJECTS.opportunityMilestoneDependency.universalIdentifier,
  universalIdentifier: '20202020-a107-4007-8007-0aa0b1ca1007',
  defaultTabUniversalIdentifier: null,
  tabs: OPPORTUNITY_MILESTONE_DEPENDENCY_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
