import { type ConditionalDisplay } from 'twenty-shared/types';

import { STANDARD_DEVICE_DESKTOP_CONDITIONAL_DISPLAY } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-device-desktop-conditional-display.constant';
import { STANDARD_DEVICE_MOBILE_CONDITIONAL_DISPLAY } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-device-mobile-conditional-display.constant';

export const LEGACY_DEVICE_CONDITIONAL_DISPLAY_REWRITES: {
  legacyConditionalDisplay: Record<string, unknown>;
  conditionalDisplay: ConditionalDisplay;
}[] = [
  {
    legacyConditionalDisplay: {
      and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
    },
    conditionalDisplay: STANDARD_DEVICE_MOBILE_CONDITIONAL_DISPLAY,
  },
  {
    legacyConditionalDisplay: {
      and: [{ '===': [{ var: 'device' }, 'DESKTOP'] }],
    },
    conditionalDisplay: STANDARD_DEVICE_DESKTOP_CONDITIONAL_DISPLAY,
  },
];
