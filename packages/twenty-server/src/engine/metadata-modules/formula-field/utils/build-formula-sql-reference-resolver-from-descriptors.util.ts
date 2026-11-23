import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { buildFormulaSqlColumnValue } from 'src/engine/metadata-modules/formula-field/utils/build-formula-sql-column-value.util';
import { buildFormulaSqlColumnsByPath } from 'src/engine/metadata-modules/formula-field/utils/build-formula-sql-columns-by-path.util';
import { type FormulaSqlReferenceResolver } from 'src/engine/metadata-modules/formula-field/utils/compile-formula-expression-to-sql.util';
import { COMPUTED_COLUMN_RECORD_ALIAS } from 'src/engine/twenty-orm/table-shape/constants/computed-column-record-alias.constant';

const LOOKUP_ALIAS = 'lookup';

// Enough to type-check a formula before its field exists; the SQL it yields is never run
export const buildFormulaSqlReferenceResolverFromDescriptors = (
  fields: ValidationRuleFieldDescriptor[],
): FormulaSqlReferenceResolver => {
  const recordColumnsByPath = buildFormulaSqlColumnsByPath(fields);

  return (path) => {
    const recordColumn = recordColumnsByPath.get(path);

    if (isDefined(recordColumn)) {
      return buildFormulaSqlColumnValue({
        alias: COMPUTED_COLUMN_RECORD_ALIAS,
        formulaSqlColumn: recordColumn,
      });
    }

    const [relationFieldName, ...targetPathSegments] = path.split('.');
    const lookupColumn = buildFormulaSqlColumnsByPath(
      fields.find(({ name }) => name === relationFieldName)
        ?.relationTargetFields ?? [],
    ).get(targetPathSegments.join('.'));

    return isDefined(lookupColumn)
      ? buildFormulaSqlColumnValue({
          alias: LOOKUP_ALIAS,
          formulaSqlColumn: lookupColumn,
        })
      : undefined;
  };
};
