import { CONDITIONAL_EVALUATION_FUNCTIONS } from '@/conditional-evaluation/common/constants/ConditionalEvaluationFunctions';
import { type ConditionalEvaluationConfiguration } from '@/conditional-evaluation/common/types/ConditionalEvaluationConfiguration';
import { conditionalEvaluationComparisonOperatorSchema } from '@/conditional-evaluation/common/utils/conditionalEvaluationComparisonOperatorSchema';
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
    comparisonOperators: conditionalEvaluationComparisonOperatorSchema.options,
  },
} as const satisfies Partial<
  Record<AllMetadataName, ConditionalEvaluationConfiguration>
>;
