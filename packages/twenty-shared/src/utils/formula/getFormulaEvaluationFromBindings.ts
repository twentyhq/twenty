import { type FieldMetadataFormulaEvaluation } from '@/types/FieldMetadataFormulaEvaluation';
import { RelationType } from '@/types/RelationType';
import { type ValidationRuleBindings } from '@/types/ValidationRuleBindings';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';

// Reading a one-to-many relation means aggregating it, which is too costly to do on every read
export const getFormulaEvaluationFromBindings = ({
  bindings,
  fields,
}: {
  bindings: ValidationRuleBindings;
  fields: ValidationRuleFieldDescriptor[];
}): FieldMetadataFormulaEvaluation => {
  const toManyRelationUniversalIdentifiers = new Set(
    fields
      .filter(({ relationType }) => relationType === RelationType.ONE_TO_MANY)
      .map(({ universalIdentifier }) => universalIdentifier),
  );

  return Object.values(bindings).some((universalIdentifier) =>
    toManyRelationUniversalIdentifiers.has(universalIdentifier),
  )
    ? 'STORED'
    : 'QUERY_TIME';
};
