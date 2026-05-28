import type { MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const PARTNER_APPLICATION_STEP_IDS = [
  'identity',
  'profile',
  'expertise',
  'commercials',
] as const;

export type PartnerApplicationStepId =
  (typeof PARTNER_APPLICATION_STEP_IDS)[number];

export const PARTNER_APPLICATION_STEP_TITLES: Record<
  PartnerApplicationStepId,
  MessageDescriptor
> = {
  identity: msg`Identity`,
  profile: msg`Profile`,
  expertise: msg`Expertise & experience`,
  commercials: msg`Commercials`,
};

export const PARTNER_TYPE_OF_TEAM_VALUES = ['SOLO', 'AGENCY'] as const;
export type PartnerTypeOfTeam = (typeof PARTNER_TYPE_OF_TEAM_VALUES)[number];

export const PARTNER_TYPE_OF_TEAM_OPTIONS: ReadonlyArray<{
  value: PartnerTypeOfTeam;
  label: MessageDescriptor;
}> = [
  { value: 'SOLO', label: msg`Solo` },
  { value: 'AGENCY', label: msg`Agency` },
];

export const PARTNER_SCOPE_VALUES = [
  'APPS',
  'DATA_MODEL',
  'DATA_MIGRATION',
  'HOSTING_ENVIRONMENT',
  'WORKFLOWS',
] as const;
export type PartnerScopeValue = (typeof PARTNER_SCOPE_VALUES)[number];

export const PARTNER_SCOPE_OPTIONS: ReadonlyArray<{
  value: PartnerScopeValue;
  label: MessageDescriptor;
}> = [
  { value: 'APPS', label: msg`Apps` },
  { value: 'DATA_MODEL', label: msg`Data model` },
  { value: 'DATA_MIGRATION', label: msg`Data migration` },
  { value: 'HOSTING_ENVIRONMENT', label: msg`Hosting environment` },
  { value: 'WORKFLOWS', label: msg`Workflows` },
];

export const PARTNER_DEPLOYMENT_VALUES = ['CLOUD', 'SELF_HOST'] as const;
export type PartnerDeploymentValue =
  (typeof PARTNER_DEPLOYMENT_VALUES)[number];

export const PARTNER_DEPLOYMENT_OPTIONS: ReadonlyArray<{
  value: PartnerDeploymentValue;
  label: MessageDescriptor;
}> = [
  { value: 'CLOUD', label: msg`Cloud` },
  { value: 'SELF_HOST', label: msg`Self-host` },
];

export const PARTNER_COUNTRY_VALUES = [
  'UNITED_STATES',
  'UNITED_KINGDOM',
  'FRANCE',
  'GERMANY',
  'SPAIN',
  'ITALY',
  'NETHERLANDS',
  'BELGIUM',
  'PORTUGAL',
  'SWITZERLAND',
  'SWEDEN',
  'POLAND',
  'CANADA',
  'BRAZIL',
  'MEXICO',
  'ARGENTINA',
  'AUSTRALIA',
  'INDIA',
  'SINGAPORE',
  'UNITED_ARAB_EMIRATES',
  'SOUTH_AFRICA',
  'JAPAN',
  'CHINA',
  'SOUTH_KOREA',
] as const;
export type PartnerCountryValue = (typeof PARTNER_COUNTRY_VALUES)[number];

export const PARTNER_COUNTRY_OPTIONS: ReadonlyArray<{
  value: PartnerCountryValue;
  label: MessageDescriptor;
}> = [
  { value: 'UNITED_STATES', label: msg`United States 🇺🇸` },
  { value: 'UNITED_KINGDOM', label: msg`United Kingdom 🇬🇧` },
  { value: 'FRANCE', label: msg`France 🇫🇷` },
  { value: 'GERMANY', label: msg`Germany 🇩🇪` },
  { value: 'SPAIN', label: msg`Spain 🇪🇸` },
  { value: 'ITALY', label: msg`Italy 🇮🇹` },
  { value: 'NETHERLANDS', label: msg`Netherlands 🇳🇱` },
  { value: 'BELGIUM', label: msg`Belgium 🇧🇪` },
  { value: 'PORTUGAL', label: msg`Portugal 🇵🇹` },
  { value: 'SWITZERLAND', label: msg`Switzerland 🇨🇭` },
  { value: 'SWEDEN', label: msg`Sweden 🇸🇪` },
  { value: 'POLAND', label: msg`Poland 🇵🇱` },
  { value: 'CANADA', label: msg`Canada 🇨🇦` },
  { value: 'BRAZIL', label: msg`Brazil 🇧🇷` },
  { value: 'MEXICO', label: msg`Mexico 🇲🇽` },
  { value: 'ARGENTINA', label: msg`Argentina 🇦🇷` },
  { value: 'AUSTRALIA', label: msg`Australia 🇦🇺` },
  { value: 'INDIA', label: msg`India 🇮🇳` },
  { value: 'SINGAPORE', label: msg`Singapore 🇸🇬` },
  { value: 'UNITED_ARAB_EMIRATES', label: msg`United Arab Emirates 🇦🇪` },
  { value: 'SOUTH_AFRICA', label: msg`South Africa 🇿🇦` },
  { value: 'JAPAN', label: msg`Japan 🇯🇵` },
  { value: 'CHINA', label: msg`China 🇨🇳` },
  { value: 'SOUTH_KOREA', label: msg`South Korea 🇰🇷` },
];

export const PARTNER_LANGUAGE_VALUES = [
  'ENGLISH',
  'FRENCH',
  'GERMAN',
  'SPANISH',
  'PORTUGUESE',
  'ITALIAN',
  'DUTCH',
  'ARABIC',
  'CHINESE',
  'JAPANESE',
  'RUSSIAN',
  'HINDI',
] as const;
export type PartnerLanguageValue = (typeof PARTNER_LANGUAGE_VALUES)[number];

export const PARTNER_LANGUAGE_OPTIONS: ReadonlyArray<{
  value: PartnerLanguageValue;
  label: MessageDescriptor;
}> = [
  { value: 'ENGLISH', label: msg`English` },
  { value: 'FRENCH', label: msg`French` },
  { value: 'GERMAN', label: msg`German` },
  { value: 'SPANISH', label: msg`Spanish` },
  { value: 'PORTUGUESE', label: msg`Portuguese` },
  { value: 'ITALIAN', label: msg`Italian` },
  { value: 'DUTCH', label: msg`Dutch` },
  { value: 'ARABIC', label: msg`Arabic` },
  { value: 'CHINESE', label: msg`Chinese` },
  { value: 'JAPANESE', label: msg`Japanese` },
  { value: 'RUSSIAN', label: msg`Russian` },
  { value: 'HINDI', label: msg`Hindi` },
];

// Per-step required field names. The wizard reducer reads this to gate `goNext`.
export const PARTNER_APPLICATION_STEP_REQUIRED_FIELDS: Record<
  PartnerApplicationStepId,
  ReadonlyArray<string>
> = {
  identity: ['name', 'email', 'company'],
  profile: ['country'],
  expertise: ['typeOfTeam', 'partnerScope', 'deploymentExpertise'],
  commercials: [],
};
