import {
  compositeTypeDefinitions,
  type FieldMetadataType,
} from 'twenty-shared/types';
import {
  getFieldMetadataFormulaCurrencyCodeExpression,
  getFieldMetadataFormulaExpression,
  isDefined,
  isFormulaFieldMetadataType,
} from 'twenty-shared/utils';

import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import {
  type FormulaSqlAggregationSourceResolver,
  type FormulaSqlReferenceResolver,
} from 'src/engine/metadata-modules/formula-field/utils/compile-formula-expression-to-sql.util';
import { compileFormulaFieldToSql } from 'src/engine/metadata-modules/formula-field/utils/compile-formula-field-to-sql.util';
import { computePostgresEnumName } from 'src/engine/workspace-manager/workspace-migration/utils/compute-postgres-enum-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export type CompiledFormulaFieldColumn = {
  columnName: string;
  columnFieldMetadataType: FieldMetadataType;
  compositePropertyName?: string;
  expression?: string;
};

export const compileFormulaFieldColumns = ({
  flatFieldMetadata: { name, type, settings },
  schemaName,
  tableName,
  resolveReference,
  resolveAggregationSource,
}: {
  flatFieldMetadata: Pick<OrmFlatFieldMetadata, 'name' | 'type' | 'settings'>;
  schemaName: string;
  tableName: string;
  resolveReference: FormulaSqlReferenceResolver;
  resolveAggregationSource?: FormulaSqlAggregationSourceResolver;
}):
  | { enumSqlType: string; columns: CompiledFormulaFieldColumn[] }
  | undefined => {
  const expression = getFieldMetadataFormulaExpression({ settings });

  if (!isFormulaFieldMetadataType(type) || !isDefined(expression)) {
    return undefined;
  }

  const enumSqlType = `${escapeIdentifier(schemaName)}.${escapeIdentifier(
    computePostgresEnumName({ tableName, columnName: name }),
  )}`;
  const compilation = compileFormulaFieldToSql({
    fieldMetadataType: type,
    expression,
    currencyCodeExpression: getFieldMetadataFormulaCurrencyCodeExpression({
      settings,
    }),
    selectEnumSqlType: enumSqlType,
    resolveReference,
    resolveAggregationSource,
  });

  const findCompiledExpression = (
    compositePropertyName: string | undefined,
  ): string | undefined =>
    compilation.isValid
      ? compilation.expressions.find(
          (compiledExpression) =>
            compiledExpression.compositePropertyName === compositePropertyName,
        )?.expression
      : undefined;

  const compositeProperties = compositeTypeDefinitions.get(type)?.properties;

  if (!isDefined(compositeProperties)) {
    return {
      enumSqlType,
      columns: [
        {
          columnName: name,
          columnFieldMetadataType: type,
          expression: findCompiledExpression(undefined),
        },
      ],
    };
  }

  return {
    enumSqlType,
    columns: compositeProperties.map((compositeProperty) => ({
      columnName: computeCompositeColumnName(name, compositeProperty),
      columnFieldMetadataType: compositeProperty.type,
      compositePropertyName: compositeProperty.name,
      expression: findCompiledExpression(compositeProperty.name),
    })),
  };
};
