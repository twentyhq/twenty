import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import {
  CONDITIONAL_DISPLAY_DEVICE_DESKTOP,
  CONDITIONAL_DISPLAY_DEVICE_MOBILE,
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
      noteRichText: {
        universalIdentifier: '20202020-ac04-4004-8004-a0be5a11a412',
        title: WIDGET_PROPS.noteRichText.title,
        type: WIDGET_PROPS.noteRichText.type,
        gridPosition: WIDGET_PROPS.noteRichText.gridPosition,
        position: { layoutMode: TAB_PROPS.home.layoutMode, index: 1 },
        conditionalDisplay: CONDITIONAL_DISPLAY_DEVICE_MOBILE,
      },
    },
  },
  note: {
    universalIdentifier: '20202020-ab04-4004-8004-a0be5a11a402',
    ...TAB_PROPS.note,
    widgets: {
      noteRichText: {
        universalIdentifier: '20202020-ac04-4004-8004-a0be5a11a421',
        ...WIDGET_PROPS.noteRichText,
        conditionalDisplay: CONDITIONAL_DISPLAY_DEVICE_DESKTOP,
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
  name: 'Default Note Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: STANDARD_OBJECTS.note.universalIdentifier,
  universalIdentifier: '20202020-a104-4004-8004-a0be5a11a004',
  defaultTabUniversalIdentifier: null,
  tabs: NOTE_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
