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

const FAVORITE_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab0e-400e-800e-fa0e0b1e0e01',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac0e-400e-800e-fa0e0b1e0e11',
        ...WIDGET_PROPS.fields,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab0e-400e-800e-fa0e0b1e0e02',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac0e-400e-800e-fa0e0b1e0e21',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_FAVORITE_PAGE_LAYOUT_CONFIG = {
  name: 'Default Favorite Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: STANDARD_OBJECTS.favorite.universalIdentifier,
  universalIdentifier: '20202020-a10e-400e-800e-fa0e0b1e0001',
  defaultTabUniversalIdentifier: null,
  tabs: FAVORITE_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
