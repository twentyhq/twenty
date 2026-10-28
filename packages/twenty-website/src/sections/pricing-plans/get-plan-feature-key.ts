import { getMessageDescriptorSource } from '@/platform/i18n/get-message-descriptor-source';

import { type PlanFeature } from './plans-data';

export const getPlanFeatureKey = (feature: PlanFeature, featureIndex: number) =>
  `${featureIndex}|${getMessageDescriptorSource(feature.title)}|${getMessageDescriptorSource(feature.description)}`;
