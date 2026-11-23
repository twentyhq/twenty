import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FormulaSqlColumn } from 'src/engine/metadata-modules/formula-field/types/formula-sql-column.type';
import { buildFormulaSqlColumnValue } from 'src/engine/metadata-modules/formula-field/utils/build-formula-sql-column-value.util';
import { buildFormulaSqlColumnsByPath } from 'src/engine/metadata-modules/formula-field/utils/build-formula-sql-columns-by-path.util';
import { type FormulaSqlReferenceResolver } from 'src/engine/metadata-modules/formula-field/utils/compile-formula-expression-to-sql.util';
import { COMPUTED_COLUMN_RECORD_ALIAS } from 'src/engine/twenty-orm/table-shape/constants/computed-column-record-alias.constant';

const LOOKUP_ALIAS = 'lookup';

type FormulaSqlFieldRead = {
  alias: string;
  fieldUniversalIdentifier: string;
};

// The one place that says which columns a formula path reads, for validation and for the query alike
export const buildFormulaSqlReferenceResolverFromDescriptors = ({
  fields,
  getLookupAlias = () => LOOKUP_ALIAS,
  onFieldRead,
}: {
  fields: ValidationRuleFieldDescriptor[];
  getLookupAlias?: (relationFieldName: string) => string;
  onFieldRead?: (fieldRead: FormulaSqlFieldRead) => void;
}): FormulaSqlReferenceResolver => {
  const recordColumnsByPath = buildFormulaSqlColumnsByPath(fields);
  const lookupColumnsByPathByRelationFieldName = new Map<
    string,
    Map<string, FormulaSqlColumn>
  >();

  const readField = ({
    alias,
    fieldName,
    candidateFields,
  }: {
    alias: string;
    fieldName: string;
    candidateFields: ValidationRuleFieldDescriptor[];
  }) => {
    const field = candidateFields.find(({ name }) => name === fieldName);

    if (isDefined(field)) {
      onFieldRead?.({
        alias,
        fieldUniversalIdentifier: field.universalIdentifier,
      });
    }
  };

  return (path) => {
    const recordColumn = recordColumnsByPath.get(path);

    if (isDefined(recordColumn)) {
      readField({
        alias: COMPUTED_COLUMN_RECORD_ALIAS,
        fieldName: recordColumn.fieldName,
        candidateFields: fields,
      });

      return buildFormulaSqlColumnValue({
        alias: COMPUTED_COLUMN_RECORD_ALIAS,
        formulaSqlColumn: recordColumn,
      });
    }

    const [relationFieldName, ...targetPathSegments] = path.split('.');
    const relationTargetFields = fields.find(
      ({ name }) => name === relationFieldName,
    )?.relationTargetFields;

    if (!isDefined(relationTargetFields)) {
      return undefined;
    }

    const lookupColumnsByPath =
      lookupColumnsByPathByRelationFieldName.get(relationFieldName) ??
      buildFormulaSqlColumnsByPath(relationTargetFields);

    lookupColumnsByPathByRelationFieldName.set(
      relationFieldName,
      lookupColumnsByPath,
    );

    const lookupColumn = lookupColumnsByPath.get(targetPathSegments.join('.'));

    if (!isDefined(lookupColumn)) {
      return undefined;
    }

    const lookupAlias = getLookupAlias(relationFieldName);

    readField({
      alias: COMPUTED_COLUMN_RECORD_ALIAS,
      fieldName: relationFieldName,
      candidateFields: fields,
    });
    readField({
      alias: lookupAlias,
      fieldName: lookupColumn.fieldName,
      candidateFields: relationTargetFields,
    });

    return buildFormulaSqlColumnValue({
      alias: lookupAlias,
      formulaSqlColumn: lookupColumn,
    });
  };
};
