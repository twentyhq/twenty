import {
  compositeTypeDefinitions,
  type FieldMetadataType,
  type ValidationRuleFieldDescriptor,
} from 'twenty-shared/types';
import {
  isDefined,
  isFormulaFieldMetadataType,
  printFieldMetadataFormula,
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
import { fieldMetadataTypeToColumnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/field-metadata-type-to-column-type.util';

export type CompiledFormulaFieldColumn = {
  columnName: string;
  sqlType: string;
  compositePropertyName?: string;
  expression?: string;
};

const ENUM_COLUMN_TYPE = 'enum';

export const compileFormulaFieldColumns = ({
  flatFieldMetadata: { name, type, formula },
  fields,
  schemaName,
  tableName,
  resolveReference,
  resolveAggregationSource,
}: {
  flatFieldMetadata: Pick<OrmFlatFieldMetadata, 'name' | 'type' | 'formula'>;
  fields: ValidationRuleFieldDescriptor[];
  schemaName: string;
  tableName: string;
  resolveReference: FormulaSqlReferenceResolver;
  resolveAggregationSource?: FormulaSqlAggregationSourceResolver;
}): CompiledFormulaFieldColumn[] | undefined => {
  const { expression, currencyCodeExpression } = printFieldMetadataFormula({
    formula,
    fields,
  });

  if (!isFormulaFieldMetadataType(type) || !isDefined(expression)) {
    return undefined;
  }

  const enumSqlType = `${escapeIdentifier(schemaName)}.${escapeIdentifier(
    computePostgresEnumName({ tableName, columnName: name }),
  )}`;
  const compilation = compileFormulaFieldToSql({
    fieldMetadataType: type,
    expression,
    currencyCodeExpression,
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

  const toSqlType = (columnFieldMetadataType: FieldMetadataType): string => {
    const columnType = fieldMetadataTypeToColumnType(columnFieldMetadataType);

    return columnType === ENUM_COLUMN_TYPE ? enumSqlType : columnType;
  };

  const compositeProperties = compositeTypeDefinitions.get(type)?.properties;

  if (!isDefined(compositeProperties)) {
    return [
      {
        columnName: name,
        sqlType: toSqlType(type),
        expression: findCompiledExpression(undefined),
      },
    ];
  }

  return compositeProperties.map((compositeProperty) => ({
    columnName: computeCompositeColumnName(name, compositeProperty),
    sqlType: toSqlType(compositeProperty.type),
    compositePropertyName: compositeProperty.name,
    expression: findCompiledExpression(compositeProperty.name),
  }));
};
