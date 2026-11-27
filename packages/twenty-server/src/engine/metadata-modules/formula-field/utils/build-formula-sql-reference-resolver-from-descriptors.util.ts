import {
  RelationType,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FormulaSqlColumn } from 'src/engine/metadata-modules/formula-field/types/formula-sql-column.type';
import { buildFormulaSqlColumnValue } from 'src/engine/metadata-modules/formula-field/utils/build-formula-sql-column-value.util';
import { buildFormulaSqlColumnsByPath } from 'src/engine/metadata-modules/formula-field/utils/build-formula-sql-columns-by-path.util';
import { getFormulaSqlAggregateAlias } from 'src/engine/metadata-modules/formula-field/utils/get-formula-sql-aggregate-alias.util';
import { type FormulaSqlReferenceResolver } from 'src/engine/metadata-modules/formula-field/utils/compile-formula-expression-to-sql.util';
import { COMPUTED_COLUMN_RECORD_ALIAS } from 'src/engine/twenty-orm/table-shape/constants/computed-column-record-alias.constant';

const LOOKUP_ALIAS = 'lookup';

type FormulaSqlFieldRead = {
  alias: string;
  fieldUniversalIdentifier: string;
};

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

  return (path) => {
    const recordColumn = recordColumnsByPath.get(path);

    if (isDefined(recordColumn)) {
      onFieldRead?.({
        alias: COMPUTED_COLUMN_RECORD_ALIAS,
        fieldUniversalIdentifier: recordColumn.fieldUniversalIdentifier,
      });

      return buildFormulaSqlColumnValue({
        alias: COMPUTED_COLUMN_RECORD_ALIAS,
        formulaSqlColumn: recordColumn,
      });
    }

    const [relationFieldName, ...targetPathSegments] = path.split('.');
    const relationField = fields.find(({ name }) => name === relationFieldName);
    const relationTargetFields = relationField?.relationTargetFields;

    if (!isDefined(relationField) || !isDefined(relationTargetFields)) {
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

    // A to-many path is read inside an aggregate, whose subquery names the related records
    const lookupAlias =
      relationField.relationType === RelationType.ONE_TO_MANY
        ? getFormulaSqlAggregateAlias(relationFieldName)
        : getLookupAlias(relationFieldName);

    onFieldRead?.({
      alias: COMPUTED_COLUMN_RECORD_ALIAS,
      fieldUniversalIdentifier: relationField.universalIdentifier,
    });
    onFieldRead?.({
      alias: lookupAlias,
      fieldUniversalIdentifier: lookupColumn.fieldUniversalIdentifier,
    });

    return buildFormulaSqlColumnValue({
      alias: lookupAlias,
      formulaSqlColumn: lookupColumn,
    });
  };
};
