import { compositeTypeDefinitions } from 'twenty-shared/types';
import {
  getFieldMetadataFormulaCurrencyCodeExpression,
  getFieldMetadataFormulaExpression,
  isDefined,
  isFormulaFieldMetadataType,
  isQueryTimeFormulaFieldMetadata,
} from 'twenty-shared/utils';

import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { buildFormulaFieldDescriptorsFromFlatEntityMaps } from 'src/engine/metadata-modules/formula-field/utils/build-formula-field-descriptors-from-flat-entity-maps.util';
import { buildFormulaSqlReferenceResolverFromDescriptors } from 'src/engine/metadata-modules/formula-field/utils/build-formula-sql-reference-resolver-from-descriptors.util';
import { compileFormulaFieldToSql } from 'src/engine/metadata-modules/formula-field/utils/compile-formula-field-to-sql.util';
import {
  type WorkspaceComputedColumnShape,
  type WorkspaceComputedLookupShape,
} from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';
import { computePostgresEnumName } from 'src/engine/workspace-manager/workspace-migration/utils/compute-postgres-enum-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { fieldMetadataTypeToColumnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/field-metadata-type-to-column-type.util';

const ENUM_COLUMN_TYPE = 'enum';

export const buildFormulaComputedColumnShapes = ({
  flatObjectMetadata,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  schemaName,
  tableName,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
  schemaName: string;
  tableName: string;
}): {
  computedColumnShapes: WorkspaceComputedColumnShape[];
  computedLookupShapes: WorkspaceComputedLookupShape[];
} => {
  const formulaFlatFieldMetadatas = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  ).filter(isQueryTimeFormulaFieldMetadata);

  if (formulaFlatFieldMetadatas.length === 0) {
    return { computedColumnShapes: [], computedLookupShapes: [] };
  }

  const fields = buildFormulaFieldDescriptorsFromFlatEntityMaps({
    flatObjectMetadata,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });
  const lookupAliasByRelationFieldName = new Map<string, string>();

  const getLookupAlias = (relationFieldName: string): string => {
    const lookupAlias =
      lookupAliasByRelationFieldName.get(relationFieldName) ??
      `lookup${lookupAliasByRelationFieldName.size}`;

    lookupAliasByRelationFieldName.set(relationFieldName, lookupAlias);

    return lookupAlias;
  };

  const computedColumnShapes = formulaFlatFieldMetadatas.flatMap(
    ({ name, type, settings }): WorkspaceComputedColumnShape[] => {
      const expression = getFieldMetadataFormulaExpression({ settings });

      if (!isFormulaFieldMetadataType(type) || !isDefined(expression)) {
        return [];
      }

      const dependencyByKey = new Map<
        string,
        WorkspaceComputedColumnShape['dependencies'][number]
      >();
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
        resolveReference: buildFormulaSqlReferenceResolverFromDescriptors({
          fields,
          getLookupAlias,
          onFieldRead: ({ alias, fieldUniversalIdentifier }) => {
            const fieldMetadataId =
              flatFieldMetadataMaps.byUniversalIdentifier[
                fieldUniversalIdentifier
              ]?.id;

            if (isDefined(fieldMetadataId)) {
              dependencyByKey.set(`${alias}.${fieldMetadataId}`, {
                alias,
                fieldMetadataId,
              });
            }
          },
        }),
      });
      const columns = compositeTypeDefinitions
        .get(type)
        ?.properties.map((compositeProperty) => ({
          columnName: computeCompositeColumnName(name, compositeProperty),
          columnFieldMetadataType: compositeProperty.type,
          compositePropertyName: compositeProperty.name,
        })) ?? [
        {
          columnName: name,
          columnFieldMetadataType: type,
          compositePropertyName: undefined,
        },
      ];

      const findCompiledExpression = (
        compositePropertyName: string | undefined,
      ): string | undefined => {
        if (!compilation.isValid) {
          return undefined;
        }

        return compilation.expressions.find(
          (compiledExpression) =>
            compiledExpression.compositePropertyName === compositePropertyName,
        )?.expression;
      };

      return columns.map(
        ({ columnName, columnFieldMetadataType, compositePropertyName }) => {
          const columnType = fieldMetadataTypeToColumnType(
            columnFieldMetadataType,
          );

          return {
            columnName,
            sqlType: columnType === ENUM_COLUMN_TYPE ? enumSqlType : columnType,
            expression: findCompiledExpression(compositePropertyName),
            dependencies: [...dependencyByKey.values()],
          };
        },
      );
    },
  );

  return {
    computedColumnShapes,
    computedLookupShapes: [...lookupAliasByRelationFieldName].map(
      ([relationFieldName, alias]) => ({ alias, relationFieldName }),
    ),
  };
};
