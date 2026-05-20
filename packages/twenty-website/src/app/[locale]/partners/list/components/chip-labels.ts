import { msg } from '@lingui/core/macro';
import type { MessageDescriptor } from '@lingui/core';

import type {
  DeploymentExpertise,
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
  };

export const DEPLOYMENT_EXPERTISE_LABELS: Record<
  DeploymentExpertise,
  MessageDescriptor
> = {
  CLOUD: msg`Cloud`,
  SELF_HOST: msg`Self-host`,
};
