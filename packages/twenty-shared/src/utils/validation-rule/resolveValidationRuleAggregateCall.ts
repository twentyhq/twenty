import { type ValidationRuleAggregate } from '@/types/ValidationRuleAggregate';
import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { type ValidationRuleAggregateCall } from '@/utils/validation-rule/collectValidationRuleAggregateCalls';
import { isValidationRuleToManyRelationField } from '@/utils/validation-rule/isValidationRuleToManyRelationField';

type ResolveValidationRuleAggregateCallResult =
  | {
      isResolved: true;
      aggregate: ValidationRuleAggregate;
      bindings: ValidationRuleBindings;
    }
  | { isResolved: false; errorMessage: string };

export const resolveValidationRuleAggregateCall = ({
  aggregateCall,
  fields,
}: {
  aggregateCall: ValidationRuleAggregateCall;
  fields: ValidationRuleFieldDescriptor[];
}): ResolveValidationRuleAggregateCallResult => {
  const { functionName, argumentPaths } = aggregateCall;
  const [relationFieldName] = argumentPaths;

  const relationField =
    argumentPaths.length === 1 && typeof relationFieldName === 'string'
      ? fields.find((field) => field.name === relationFieldName)
      : undefined;

  if (
    relationField === undefined ||
    !isValidationRuleToManyRelationField(relationField)
  ) {
    return {
      isResolved: false,
      errorMessage: `${functionName}() takes one to-many relation, like ${functionName}(opportunities)`,
    };
  }

  return {
    isResolved: true,
    aggregate: { functionName, relationFieldName: relationField.name },
    bindings: { [relationField.name]: relationField.universalIdentifier },
  };
};
