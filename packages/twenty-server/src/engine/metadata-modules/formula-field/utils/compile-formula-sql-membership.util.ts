import { type FormulaSqlValue } from 'src/engine/metadata-modules/formula-field/types/formula-sql-value.type';
import { unifyFormulaSqlValuesOrThrow } from 'src/engine/metadata-modules/formula-field/utils/formula-sql-values.util';

export const compileFormulaSqlMembershipOrThrow = ({
  value,
  candidates,
}: {
  value: FormulaSqlValue;
  candidates: FormulaSqlValue[];
}): FormulaSqlValue => {
  if (candidates.length === 0) {
    return { sql: 'FALSE', type: 'boolean' };
  }

  const comparisons = candidates.map((candidate) => {
    const [left, right] = unifyFormulaSqlValuesOrThrow({
      left: value,
      right: candidate,
      usage: '"in"',
      shouldCompareDatesByDay: true,
    });

    return `${left.sql} = ${right.sql}`;
  });

  return {
    sql: `COALESCE(${comparisons.join(' OR ')}, FALSE)`,
    type: 'boolean',
  };
};
