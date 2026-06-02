import { msg } from '@lingui/core/macro';
import type { MessageDescriptor } from '@lingui/core';

import type {
  PartnerScope,
  ServedGeo,
  SpokenLanguage,
} from '@/lib/partners-api';

export const SERVED_GEO_LABELS: Record<ServedGeo, MessageDescriptor> = {
  EUROPE: msg`Europe`,
  US: msg`US`,
  LATAM: msg`LATAM`,
  MENA: msg`MENA`,
  APAC: msg`APAC`,
  AFRICA: msg`Africa`,
};

export const SPOKEN_LANGUAGE_LABELS: Record<SpokenLanguage, MessageDescriptor> =
  {
    ENGLISH: msg`English`,
    FRENCH: msg`French`,
    GERMAN: msg`German`,
    CHINESE: msg`Chinese`,
    SPANISH: msg`Spanish`,
    ARABIC: msg`Arabic`,
    BENGALI: msg`Bengali`,
    CATALAN: msg`Catalan`,
    CZECH: msg`Czech`,
    DANISH: msg`Danish`,
    DUTCH: msg`Dutch`,
    FARSI: msg`Farsi`,
    FINNISH: msg`Finnish`,
    GREEK: msg`Greek`,
    HINDI: msg`Hindi`,
    INDONESIAN: msg`Indonesian`,
    ITALIAN: msg`Italian`,
    JAPANESE: msg`Japanese`,
    KOREAN: msg`Korean`,
    MALAY: msg`Malay`,
    NORWEGIAN: msg`Norwegian`,
    POLISH: msg`Polish`,
    PORTUGUESE: msg`Portuguese`,
    PUNJABI: msg`Punjabi`,
    ROMANIAN: msg`Romanian`,
    RUSSIAN: msg`Russian`,
    SWAHILI: msg`Swahili`,
    SWEDISH: msg`Swedish`,
    TAGALOG: msg`Tagalog`,
    TAMIL: msg`Tamil`,
    THAI: msg`Thai`,
    TURKISH: msg`Turkish`,
    UKRAINIAN: msg`Ukrainian`,
    URDU: msg`Urdu`,
    VIETNAMESE: msg`Vietnamese`,
  };

// Mirrors the Partner.partnerScope ("Categories") option labels in the
// twenty-partners SDK app.
export const PARTNER_SCOPE_LABELS: Record<PartnerScope, MessageDescriptor> = {
  ADVISORY: msg`Advisory & Discovery`,
  SOLUTIONING: msg`Solutioning`,
  DEVELOPMENT: msg`Custom Development`,
  HOSTING: msg`Hosting & Infrastructure`,
  SUPPORT: msg`Training & Adoption`,
};
