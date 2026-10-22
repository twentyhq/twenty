import { getMessageDescriptorSource } from '@/platform/i18n/get-message-descriptor-source';

import { type PlanFeature } from './plans-data';

export const getPlanFeatureKey = (feature: PlanFeature) =>
  `${getMessageDescriptorSource(feature.title)}|${getMessageDescriptorSource(feature.description)}`;
