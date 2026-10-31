import { MEDIA_CAPABILITIES } from '../constants/MediaCapabilities';

export const APPLICATION_CAPABILITIES = MEDIA_CAPABILITIES;

export type ApplicationCapability = (typeof APPLICATION_CAPABILITIES)[number];

export const isApplicationCapability = (
  capability: string,
): capability is ApplicationCapability =>
  (APPLICATION_CAPABILITIES as readonly string[]).includes(capability);
