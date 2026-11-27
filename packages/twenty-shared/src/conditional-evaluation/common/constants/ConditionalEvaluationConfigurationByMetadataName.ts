import { CONDITIONAL_EVALUATION_FUNCTIONS } from '@/conditional-evaluation/common/constants/ConditionalEvaluationFunctions';
import { type ConditionalEvaluationConfiguration } from '@/conditional-evaluation/common/types/ConditionalEvaluationConfiguration';
import { expressionComparisonOperatorSchema } from '@/expression/utils/expressionComparisonOperatorSchema';
import { type AllMetadataName } from '@/metadata/types/AllMetadataName';

export const CONDITIONAL_EVALUATION_CONFIGURATION_BY_METADATA_NAME = {
  pageLayoutWidget: {
    variables: {
      device: true,
      selectedRecords: true,
      featureFlags: true,
      permissionFlags: true,
      currentRole: true,
      currentWorkspaceMember: true,
    },
    functions: CONDITIONAL_EVALUATION_FUNCTIONS,
    comparisonOperators: expressionComparisonOperatorSchema.options,
  },
} as const satisfies Partial<
  Record<AllMetadataName, ConditionalEvaluationConfiguration>
>;
