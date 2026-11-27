import { type CONDITIONAL_EVALUATION_CONFIGURATION_BY_METADATA_NAME } from '@/conditional-evaluation/common/constants/ConditionalEvaluationConfigurationByMetadataName';
import { type ConditionalEvaluationMetadataName } from '@/conditional-evaluation/common/types/ConditionalEvaluationMetadataName';

export type ConditionalEvaluationVariableName<
  TMetadataName extends ConditionalEvaluationMetadataName,
> =
  keyof (typeof CONDITIONAL_EVALUATION_CONFIGURATION_BY_METADATA_NAME)[TMetadataName]['variables'];
