import { type CONDITIONAL_EVALUATION_CONFIGURATION_BY_METADATA_NAME } from '@/conditional-evaluation/common/constants/ConditionalEvaluationConfigurationByMetadataName';

export type ConditionalEvaluationMetadataName =
  keyof typeof CONDITIONAL_EVALUATION_CONFIGURATION_BY_METADATA_NAME;
