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

const NOTE_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab04-4004-8004-a0be5a11a401',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac04-4004-8004-a0be5a11a411',
        ...WIDGET_PROPS.fields,
      },
      richText: {
        universalIdentifier: '20202020-ac04-4004-8004-a0be5a11a412',
        title: WIDGET_PROPS.richText.title,
        type: WIDGET_PROPS.richText.type,
        gridPosition: WIDGET_PROPS.richText.gridPosition,
        position: { layoutMode: TAB_PROPS.home.layoutMode, index: 1 },
      },
    },
  },
  note: {
    universalIdentifier: '20202020-ab04-4004-8004-a0be5a11a402',
    ...TAB_PROPS.note,
    widgets: {
      richText: {
        universalIdentifier: '20202020-ac04-4004-8004-a0be5a11a421',
        ...WIDGET_PROPS.richText,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab04-4004-8004-a0be5a11a403',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac04-4004-8004-a0be5a11a431',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
  files: {
    universalIdentifier: '20202020-ab04-4004-8004-a0be5a11a404',
    ...TAB_PROPS.files,
    widgets: {
      files: {
        universalIdentifier: '20202020-ac04-4004-8004-a0be5a11a441',
        ...WIDGET_PROPS.files,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_NOTE_PAGE_LAYOUT_CONFIG = {
  layoutName: 'noteRecordPage',
  name: 'Default Note Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
  universalIdentifier: '20202020-a104-4004-8004-a0be5a11a004',
  defaultTabUniversalIdentifier: NOTE_PAGE_TABS.home.universalIdentifier,
  tabs: NOTE_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
