import {
  compositeTypeDefinitions,
  FieldMetadataType,
  type FormulaFieldMetadataType,
} from 'twenty-shared/types';
import {
  getFieldMetadataFormulaCurrencyCodeExpression,
  getFieldMetadataFormulaExpression,
  isDefined,
  isFormulaFieldMetadata,
  isFormulaFieldMetadataType,
} from 'twenty-shared/utils';

import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-flat-fields-for-flat-object-metadata.util';
import { type FormulaSqlColumn } from 'src/engine/metadata-modules/formula-field/types/formula-sql-column.type';
import { buildFormulaSqlColumnValue } from 'src/engine/metadata-modules/formula-field/utils/build-formula-sql-column-value.util';
import { buildFormulaSqlColumnsByPath } from 'src/engine/metadata-modules/formula-field/utils/build-formula-sql-columns-by-path.util';
import { type FormulaSqlReferenceResolver } from 'src/engine/metadata-modules/formula-field/utils/compile-formula-expression-to-sql.util';
import { compileFormulaFieldToSql } from 'src/engine/metadata-modules/formula-field/utils/compile-formula-field-to-sql.util';
import { COMPUTED_COLUMN_RECORD_ALIAS } from 'src/engine/twenty-orm/table-shape/constants/computed-column-record-alias.constant';
import {
  type WorkspaceComputedColumnShape,
  type WorkspaceComputedLookupShape,
} from 'src/engine/twenty-orm/table-shape/types/workspace-table-shape.type';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';
import { computePostgresEnumName } from 'src/engine/workspace-manager/workspace-migration/utils/compute-postgres-enum-name.util';

type FormulaSqlObjectColumns = {
  formulaSqlColumnsByPath: Map<string, FormulaSqlColumn>;
  fieldMetadataIdByFieldName: Map<string, string>;
  relationTargetObjectMetadataIdByFieldName: Map<string, string>;
};

// A formula reads stored values only, so formula fields are not readable columns
const buildFormulaSqlObjectColumns = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: FlatEntityMaps<OrmFlatFieldMetadata>;
}): FormulaSqlObjectColumns => {
  const storedFlatFieldMetadatas = getFlatFieldsFromFlatObjectMetadata(
    flatObjectMetadata,
    flatFieldMetadataMaps,
  ).filter((flatFieldMetadata) => !isFormulaFieldMetadata(flatFieldMetadata));

  return {
    formulaSqlColumnsByPath: buildFormulaSqlColumnsByPath(
      storedFlatFieldMetadatas.map(({ name, type, settings }) => ({
        name,
        type,
        relationType:
          isDefined(settings) && 'relationType' in settings
            ? settings.relationType
            : undefined,
      })),
    ),
    fieldMetadataIdByFieldName: new Map(
      storedFlatFieldMetadatas.map(({ name, id }) => [name, id]),
    ),
    relationTargetObjectMetadataIdByFieldName: new Map(
      storedFlatFieldMetadatas.flatMap(
        ({ name, relationTargetObjectMetadataId }) =>
          isDefined(relationTargetObjectMetadataId)
            ? [[name, relationTargetObjectMetadataId]]
            : [],
      ),
    ),
  };
};

const getColumnSqlTypes = ({
  fieldMetadataType,
  enumSqlType,
}: {
  fieldMetadataType: FormulaFieldMetadataType;
  enumSqlType: string;
}): string[] => {
  switch (fieldMetadataType) {
    case FieldMetadataType.TEXT:
      return ['text'];
    case FieldMetadataType.NUMBER:
      return ['double precision'];
    case FieldMetadataType.BOOLEAN:
      return ['boolean'];
    case FieldMetadataType.DATE:
      return ['date'];
    case FieldMetadataType.DATE_TIME:
      return ['timestamptz'];
    case FieldMetadataType.SELECT:
    case FieldMetadataType.RATING:
      return [enumSqlType];
    case FieldMetadataType.CURRENCY:
      return ['numeric', 'text'];
  }
};

const getColumnNames = ({
  name,
  type,
}: Pick<OrmFlatFieldMetadata, 'name' | 'type'>): string[] =>
  compositeTypeDefinitions
    .get(type)
    ?.properties.map((compositeProperty) =>
      computeCompositeColumnName(name, compositeProperty),
    ) ?? [name];

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
  ).filter(isFormulaFieldMetadata);

  if (formulaFlatFieldMetadatas.length === 0) {
    return { computedColumnShapes: [], computedLookupShapes: [] };
  }

  const recordColumns = buildFormulaSqlObjectColumns({
    flatObjectMetadata,
    flatFieldMetadataMaps,
  });
  const lookupByRelationFieldName = new Map<
    string,
    { alias: string; columns: FormulaSqlObjectColumns }
  >();

  const findLookup = (relationFieldName: string) => {
    const existingLookup = lookupByRelationFieldName.get(relationFieldName);

    if (isDefined(existingLookup)) {
      return existingLookup;
    }

    const targetObjectMetadataId =
      recordColumns.relationTargetObjectMetadataIdByFieldName.get(
        relationFieldName,
      );
    const targetFlatObjectMetadata =
      isDefined(targetObjectMetadataId) &&
      recordColumns.formulaSqlColumnsByPath.has(relationFieldName)
        ? findFlatEntityByIdInFlatEntityMaps({
            flatEntityId: targetObjectMetadataId,
            flatEntityMaps: flatObjectMetadataMaps,
          })
        : undefined;

    if (!isDefined(targetFlatObjectMetadata)) {
      return undefined;
    }

    const lookup = {
      alias: `lookup${lookupByRelationFieldName.size}`,
      columns: buildFormulaSqlObjectColumns({
        flatObjectMetadata: targetFlatObjectMetadata,
        flatFieldMetadataMaps,
      }),
    };

    lookupByRelationFieldName.set(relationFieldName, lookup);

    return lookup;
  };

  const computedColumnShapes = formulaFlatFieldMetadatas.flatMap(
    (formulaFlatFieldMetadata): WorkspaceComputedColumnShape[] => {
      const { name, type, settings } = formulaFlatFieldMetadata;
      const expression = getFieldMetadataFormulaExpression({ settings });

      if (!isFormulaFieldMetadataType(type) || !isDefined(expression)) {
        return [];
      }

      const dependencies = new Map<
        string,
        { alias: string; fieldMetadataId: string }
      >();

      const addDependency = ({
        alias,
        columns,
        fieldName,
      }: {
        alias: string;
        columns: FormulaSqlObjectColumns;
        fieldName: string;
      }) => {
        const fieldMetadataId =
          columns.fieldMetadataIdByFieldName.get(fieldName);

        if (isDefined(fieldMetadataId)) {
          dependencies.set(`${alias}.${fieldMetadataId}`, {
            alias,
            fieldMetadataId,
          });
        }
      };

      const resolveReference: FormulaSqlReferenceResolver = (path) => {
        const recordColumn = recordColumns.formulaSqlColumnsByPath.get(path);

        if (isDefined(recordColumn)) {
          addDependency({
            alias: COMPUTED_COLUMN_RECORD_ALIAS,
            columns: recordColumns,
            fieldName: recordColumn.fieldName,
          });

          return buildFormulaSqlColumnValue({
            alias: COMPUTED_COLUMN_RECORD_ALIAS,
            formulaSqlColumn: recordColumn,
          });
        }

        const [relationFieldName, ...targetPathSegments] = path.split('.');
        const lookup = findLookup(relationFieldName);
        const lookupColumn = lookup?.columns.formulaSqlColumnsByPath.get(
          targetPathSegments.join('.'),
        );

        if (!isDefined(lookup) || !isDefined(lookupColumn)) {
          return undefined;
        }

        addDependency({
          alias: COMPUTED_COLUMN_RECORD_ALIAS,
          columns: recordColumns,
          fieldName: relationFieldName,
        });
        addDependency({
          alias: lookup.alias,
          columns: lookup.columns,
          fieldName: lookupColumn.fieldName,
        });

        return buildFormulaSqlColumnValue({
          alias: lookup.alias,
          formulaSqlColumn: lookupColumn,
        });
      };

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
      });
      const columnSqlTypes = getColumnSqlTypes({
        fieldMetadataType: type,
        enumSqlType,
      });

      return getColumnNames({ name, type }).map((columnName, index) => ({
        columnName,
        sqlType: columnSqlTypes[index],
        expression: compilation.isValid
          ? compilation.columnExpressions[index]
          : undefined,
        dependencies: [...dependencies.values()],
      }));
    },
  );

  return {
    computedColumnShapes,
    computedLookupShapes: [...lookupByRelationFieldName].map(
      ([relationFieldName, { alias }]) => ({ alias, relationFieldName }),
    ),
  };
};
