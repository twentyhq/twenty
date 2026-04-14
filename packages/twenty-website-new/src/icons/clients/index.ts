import type { ComponentType } from 'react';
import { ActEducationIcon } from './act-education';
import type { ClientIconProps } from './client-icon-props';
import { AlternativePartnersIcon } from './alternative-partners';
import { ElevateConsultingIcon } from './elevate-consulting';
import { NetZeroIcon } from './netzero';
import { NineDotsIcon } from './nine-dots';
import { W3villaIcon } from './w3villa';

export { ActEducationIcon } from './act-education';
export { AlternativePartnersIcon } from './alternative-partners';
export { ElevateConsultingIcon } from './elevate-consulting';
export { NetZeroIcon } from './netzero';
export { NineDotsIcon } from './nine-dots';
export { W3villaIcon } from './w3villa';
export type { ClientIconProps } from './client-icon-props';

export const CLIENT_ICONS: Record<string, ComponentType<ClientIconProps>> = {
  'act-education': ActEducationIcon,
  'alternative-partners': AlternativePartnersIcon,
  'elevate-consulting': ElevateConsultingIcon,
  netzero: NetZeroIcon,
  'nine-dots': NineDotsIcon,
  w3villa: W3villaIcon,
};
