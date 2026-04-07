import type { ComponentType } from 'react';
import { BeagleIcon } from './Beagle';
import { EvergreenIcon } from './Evergreen';
import { FlexportIcon } from './Flexport';
import { RealyticsIcon } from './Realytics';
import { ZapierIcon } from './Zapier';

export { BeagleIcon } from './Beagle';
export { EvergreenIcon } from './Evergreen';
export { FlexportIcon } from './Flexport';
export { RealyticsIcon } from './Realytics';
export { ZapierIcon } from './Zapier';

export type ClientIconProps = { fillColor: string; size: number };

export const CLIENT_ICONS: Record<string, ComponentType<ClientIconProps>> = {
  beagle: BeagleIcon,
  evergreen: EvergreenIcon,
  flexport: FlexportIcon,
  realytics: RealyticsIcon,
  zapier: ZapierIcon,
};
