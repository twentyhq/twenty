import { CONDITIONAL_DISPLAY_DEVICES } from '@/constants/ConditionalDisplayDevices';
import { type ConditionalDisplayContextKey } from '@/types/conditional-display/ConditionalDisplayContextKey';
import { type ConditionalDisplayDevice } from '@/types/conditional-display/ConditionalDisplayDevice';
import { type ConditionalDisplaySurface } from '@/types/conditional-display/ConditionalDisplaySurface';

export const CONDITIONAL_DISPLAY_CONTEXT_KEYS: Record<
  ConditionalDisplayContextKey,
  {
    valueKind: 'ROLE_IDS' | 'WORKSPACE_MEMBER' | 'DEVICE';
    surfaces: ConditionalDisplaySurface[];
    allowedValues?: readonly ConditionalDisplayDevice[];
  }
> = {
  currentRoleId: {
    valueKind: 'ROLE_IDS',
    surfaces: [
      'pageLayoutWidget',
      'pageLayoutTab',
      'viewField',
      'commandMenuItem',
      'navigationMenuItem',
    ],
  },
  currentWorkspaceMemberId: {
    valueKind: 'WORKSPACE_MEMBER',
    surfaces: [
      'pageLayoutWidget',
      'pageLayoutTab',
      'viewField',
      'commandMenuItem',
      'navigationMenuItem',
    ],
  },
  device: {
    valueKind: 'DEVICE',
    surfaces: ['pageLayoutWidget', 'pageLayoutTab', 'viewField'],
    allowedValues: CONDITIONAL_DISPLAY_DEVICES,
  },
};
