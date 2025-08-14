import { FieldMetadataType } from 'twenty-shared/types';

import { type CompositeProperty } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import {
  computeColumnName,
  computeCompositeColumnName,
} from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { getCompositeTypeOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/get-composite-type-or-throw.util';
import { serializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/serialize-default-value';
import { unserializeDefaultValue } from 'src/engine/metadata-modules/field-metadata/utils/unserialize-default-value';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isCompositeFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isFlatFieldMetadataEntityOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type FlatObjectMetadataWithoutFields } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { computePostgresEnumName } from 'src/engine/workspace-manager/workspace-migration-runner/utils/compute-postgres-enum-name.util';
import {
  WorkspaceSchemaMigrationException,
  WorkspaceSchemaMigrationExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/workspace-schema-migration-runner/exceptions/workspace-schema-migration.exception';
import { getTsVectorColumnExpressionFromFields } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';

import { getWorkspaceSchemaContextForMigration } from './get-workspace-schema-context-for-migration.util';

export const generateCompositeColumnDefinition = ({
  compositeProperty,
  parentFieldMetadata,
  flatObjectMetadataWithoutFields,
}: {
  compositeProperty: CompositeProperty;
  parentFieldMetadata: FlatFieldMetadata<CompositeFieldMetadataType>;
  flatObjectMetadataWithoutFields: FlatObjectMetadataWithoutFields;
}): WorkspaceSchemaColumnDefinition => {
  const { tableName } = getWorkspaceSchemaContextForMigration({
    workspaceId: flatObjectMetadataWithoutFields.workspaceId,
    flatObjectMetadataWithoutFields,
  });

  if (
    compositeProperty.type === FieldMetadataType.RELATION ||
    compositeProperty.type === FieldMetadataType.MORPH_RELATION
  ) {
    throw new WorkspaceSchemaMigrationException(
      `Relation type not supported for composite columns`,
      WorkspaceSchemaMigrationExceptionCode.UNSUPPORTED_COMPOSITE_COLUMN_TYPE,
    );
  }

  const columnName = computeCompositeColumnName(
    parentFieldMetadata.name,
    compositeProperty,
  );
  const defaultValue =
    // @ts-expect-error - TODO: fix this
    parentFieldMetadata.defaultValue?.[compositeProperty.name];

  const unserializedDefaultValue = unserializeDefaultValue(defaultValue);

  const columnType = fieldMetadataTypeToColumnType(compositeProperty.type);

  const isArrayFlag =
    compositeProperty.type === FieldMetadataType.ARRAY ||
    compositeProperty.type === FieldMetadataType.MULTI_SELECT ||
    Boolean(compositeProperty.isArray);

  const definition: WorkspaceSchemaColumnDefinition = {
    name: columnName,
    type:
      columnType === 'enum'
        ? computePostgresEnumName({ tableName, columnName })
        : columnType,
    // Align composite column nullability with parent field nullability by default
    isNullable: parentFieldMetadata.isNullable ?? true,
    isUnique: parentFieldMetadata.isUnique ?? false,
    default: unserializedDefaultValue,
    isArray: isArrayFlag,
  };

  if (columnType === 'enum') {
    definition.enumValues = compositeProperty.options?.map(
      (option) => option.value,
    );
  }

  return definition;
};

const generateTsVectorColumnDefinition = (
  fieldMetadata: FlatFieldMetadata<FieldMetadataType.TS_VECTOR>,
): WorkspaceSchemaColumnDefinition => {
  const columnName = computeColumnName(fieldMetadata.name);

  return {
    name: columnName,
    type: fieldMetadataTypeToColumnType(fieldMetadata.type),
    isNullable: true,
    isArray: false,
    isUnique: false,
    default: null,
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields([]), // TODO: setup asExpression in flatFieldMetadata transpilation
  };
};

const generateRelationColumnDefinition = (
  fieldMetadata: FlatFieldMetadata<
    FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
  >,
): WorkspaceSchemaColumnDefinition | null => {
  if (!fieldMetadata.settings || !fieldMetadata.settings.joinColumnName) {
    return null;
  }

  const joinColumnName = fieldMetadata.settings.joinColumnName;

  return {
    name: joinColumnName,
    type: fieldMetadataTypeToColumnType(FieldMetadataType.UUID),
    isNullable: true,
    isArray: false,
    isUnique: false,
    default: null,
  };
};

const generateStandardColumnDefinition = (
  fieldMetadata: FlatFieldMetadata,
  tableName: string,
): WorkspaceSchemaColumnDefinition => {
  const columnName = computeColumnName(fieldMetadata.name);
  const serializedDefaultValue = serializeDefaultValue(
    fieldMetadata.defaultValue,
  );
  const columnType = fieldMetadataTypeToColumnType(fieldMetadata.type);

  return {
    name: columnName,
    type:
      columnType === 'enum'
        ? computePostgresEnumName({ tableName, columnName })
        : columnType,
    isNullable: fieldMetadata.isNullable ?? true,
    isArray:
      fieldMetadata.type === FieldMetadataType.ARRAY ||
      fieldMetadata.type === FieldMetadataType.MULTI_SELECT,
    isUnique: fieldMetadata.isUnique ?? false,
    default: serializedDefaultValue,
    enumValues:
      columnType === 'enum'
        ? fieldMetadata.options?.map((option) => option.value)
        : undefined,
  };
};

export const generateColumnDefinitions = ({
  fieldMetadata,
  flatObjectMetadataWithoutFields,
}: {
  fieldMetadata: FlatFieldMetadata;
  flatObjectMetadataWithoutFields: FlatObjectMetadataWithoutFields;
}): WorkspaceSchemaColumnDefinition[] => {
  const { tableName } = getWorkspaceSchemaContextForMigration({
    workspaceId: flatObjectMetadataWithoutFields.workspaceId,
    flatObjectMetadataWithoutFields: flatObjectMetadataWithoutFields,
  });

  if (isCompositeFlatFieldMetadata(fieldMetadata)) {
    const compositeType = getCompositeTypeOrThrow(fieldMetadata.type);

    return compositeType.properties.map((property) =>
      generateCompositeColumnDefinition({
        compositeProperty: property,
        parentFieldMetadata: fieldMetadata,
        flatObjectMetadataWithoutFields: flatObjectMetadataWithoutFields,
      }),
    );
  }

  if (
    isFlatFieldMetadataEntityOfType(fieldMetadata, FieldMetadataType.TS_VECTOR)
  ) {
    return [generateTsVectorColumnDefinition(fieldMetadata)];
  }

  if (
    isFlatFieldMetadataEntityOfType(
      fieldMetadata,
      FieldMetadataType.RELATION,
    ) ||
    isFlatFieldMetadataEntityOfType(
      fieldMetadata,
      FieldMetadataType.MORPH_RELATION,
    )
  ) {
    const relationColumn = generateRelationColumnDefinition(fieldMetadata);

    return relationColumn ? [relationColumn] : [];
  }

  return [generateStandardColumnDefinition(fieldMetadata, tableName)];
};
