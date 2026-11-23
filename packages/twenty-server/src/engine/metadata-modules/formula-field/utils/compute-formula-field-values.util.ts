import { type ObjectRecord } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

import { type FormulaFieldEvaluationPlan } from 'src/engine/metadata-modules/formula-field/types/formula-field-evaluation-plan.type';

const areFormulaFieldDependenciesLoaded = ({
  record,
  formulaFieldEvaluationPlan: { ownFields, lookups },
}: {
  record: ObjectRecord;
  formulaFieldEvaluationPlan: Pick<
    FormulaFieldEvaluationPlan,
    'ownFields' | 'lookups'
  >;
}): boolean =>
  ownFields.every(({ fieldName }) => fieldName in record) &&
  lookups.every(({ relationFieldName, targetFields }) => {
    const relatedRecord: unknown = record[relationFieldName];

    return (
      !isPlainObject(relatedRecord) ||
      targetFields.every(({ fieldName }) => fieldName in relatedRecord)
    );
  });

// A value the caller could not load, e.g. an unreadable field, yields null instead of a partial result
export const computeFormulaFieldValues = <TRecord extends ObjectRecord>({
  record,
  formulaFieldEvaluationPlans,
  now,
}: {
  record: TRecord;
  formulaFieldEvaluationPlans: FormulaFieldEvaluationPlan[];
  now: string;
}): TRecord => {
  const selectedFormulaFieldEvaluationPlans =
    formulaFieldEvaluationPlans.filter(({ fieldName }) => fieldName in record);

  if (selectedFormulaFieldEvaluationPlans.length === 0) {
    return record;
  }

  return {
    ...record,
    ...Object.fromEntries(
      selectedFormulaFieldEvaluationPlans.map((formulaFieldEvaluationPlan) => [
        formulaFieldEvaluationPlan.fieldName,
        areFormulaFieldDependenciesLoaded({
          record,
          formulaFieldEvaluationPlan,
        })
          ? formulaFieldEvaluationPlan.evaluate({ record, now })
          : null,
      ]),
    ),
  };
};
