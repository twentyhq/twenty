import { isDefined } from 'twenty-shared/utils';

import { FormulaSqlCompilationException } from 'src/engine/metadata-modules/formula-field/exceptions/formula-sql-compilation.exception';
import { type FormulaSqlValue } from 'src/engine/metadata-modules/formula-field/types/formula-sql-value.type';

export const getFormulaSqlUnitOrThrow = <TUnit extends string>({
  value,
  units,
  usage,
}: {
  value: Pick<FormulaSqlValue, 'textLiteral'>;
  units: readonly TUnit[];
  usage: string;
}): TUnit => {
  const unit = units.find((candidate) => candidate === value.textLiteral);

  if (!isDefined(unit)) {
    throw new FormulaSqlCompilationException({
      message: `${usage} needs one of ${units.map((candidate) => `"${candidate}"`).join(', ')}`,
    });
  }

  return unit;
};
