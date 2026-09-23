export const APPLICATION_CAPABILITIES = ['microphone', 'camera'] as const;

export type ApplicationCapability = (typeof APPLICATION_CAPABILITIES)[number];

export const isApplicationCapability = (
  capability: string,
): capability is ApplicationCapability =>
  (APPLICATION_CAPABILITIES as readonly string[]).includes(capability);
