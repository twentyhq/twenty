import type { ComponentType } from 'react';
import { ActEducationIcon } from './ActEducation';
import type { ClientIconProps } from './client-icon-props';
import { AlternativePartnersIcon } from './AlternativePartners';
import { ElevateConsultingIcon } from './ElevateConsulting';
import { NetZeroIcon } from './Netzero';
import { NineDotsIcon } from './NineDots';
import { W3villaIcon } from './W3Villa';

export { ActEducationIcon } from './ActEducation';
export { AlternativePartnersIcon } from './AlternativePartners';
export { ElevateConsultingIcon } from './ElevateConsulting';
export { NetZeroIcon } from './Netzero';
export { NineDotsIcon } from './NineDots';
export { W3villaIcon } from './W3Villa';
export type { ClientIconProps } from './client-icon-props';

export const CLIENT_ICONS: Record<string, ComponentType<ClientIconProps>> = {
  'act-education': ActEducationIcon,
  'alternative-partners': AlternativePartnersIcon,
  'elevate-consulting': ElevateConsultingIcon,
  netzero: NetZeroIcon,
  'nine-dots': NineDotsIcon,
  w3villa: W3villaIcon,
};
