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

const TASK_PAGE_TABS = {
  home: {
    universalIdentifier: '20202020-ab05-4005-8005-ba5ca11a5501',
    ...TAB_PROPS.home,
    widgets: {
      fields: {
        universalIdentifier: '20202020-ac05-4005-8005-ba5ca11a5511',
        ...WIDGET_PROPS.fields,
      },
      taskRichText: {
        universalIdentifier: '20202020-ac05-4005-8005-ba5ca11a5512',
        title: WIDGET_PROPS.taskRichText.title,
        type: WIDGET_PROPS.taskRichText.type,
        gridPosition: WIDGET_PROPS.taskRichText.gridPosition,
        position: { layoutMode: TAB_PROPS.home.layoutMode, index: 1 },
        conditionalDisplay: CONDITIONAL_DISPLAY_DEVICE_MOBILE,
      },
    },
  },
  note: {
    universalIdentifier: '20202020-ab05-4005-8005-ba5ca11a5502',
    ...TAB_PROPS.note,
    widgets: {
      taskRichText: {
        universalIdentifier: '20202020-ac05-4005-8005-ba5ca11a5521',
        ...WIDGET_PROPS.taskRichText,
        conditionalDisplay: CONDITIONAL_DISPLAY_DEVICE_DESKTOP,
      },
    },
  },
  timeline: {
    universalIdentifier: '20202020-ab05-4005-8005-ba5ca11a5503',
    ...TAB_PROPS.timeline,
    widgets: {
      timeline: {
        universalIdentifier: '20202020-ac05-4005-8005-ba5ca11a5531',
        ...WIDGET_PROPS.timeline,
      },
    },
  },
  files: {
    universalIdentifier: '20202020-ab05-4005-8005-ba5ca11a5504',
    ...TAB_PROPS.files,
    widgets: {
      files: {
        universalIdentifier: '20202020-ac05-4005-8005-ba5ca11a5541',
        ...WIDGET_PROPS.files,
      },
    },
  },
} as const satisfies Record<string, StandardPageLayoutTabConfig>;

export const STANDARD_TASK_PAGE_LAYOUT_CONFIG = {
  name: 'Default Task Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectUniversalIdentifier: STANDARD_OBJECTS.task.universalIdentifier,
  universalIdentifier: '20202020-a105-4005-8005-ba5ca11a1005',
  defaultTabUniversalIdentifier: null,
  tabs: TASK_PAGE_TABS,
} as const satisfies StandardPageLayoutConfig;
