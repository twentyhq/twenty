import { FieldMetadataType } from "twenty-shared/types";

import { type CompositeProperty } from "src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface";

import { computeColumnName, computeCompositeColumnName } from "src/engine/metadata-modules/field-metadata/utils/compute-column-name.util";
import { getCompositeTypeOrThrow } from "src/engine/metadata-modules/field-metadata/utils/get-composite-type-or-throw.util";
import { isCompositeFieldMetadataType } from "src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util";
import { serializeDefaultValue } from "src/engine/metadata-modules/field-metadata/utils/serialize-default-value";
import { type FlatFieldMetadata } from "src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type";
import { isFlatFieldMetadataEntityOfType } from "src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util";
import { type FlatObjectMetadataWithFlatFieldMaps } from "src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-with-flat-field-metadata-maps.type";
import { type FlatObjectMetadata, type FlatObjectMetadataWithoutFields } from "src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type";
import { fieldMetadataTypeToColumnType } from "src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util";
import { type WorkspaceSchemaColumnDefinition } from "src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type";
import { computePostgresEnumName } from "src/engine/workspace-manager/workspace-migration-runner/utils/compute-postgres-enum-name.util";
import { getTsVectorColumnExpressionFromFields } from "src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util";

import { getWorkspaceSchemaContextForMigration } from "./get-workspace-schema-context-for-migration.util";

export const generateCompositeColumnDefinition = ({
  compositeProperty,
  parentFieldMetadata,
  objectMetadata,
}: {
  compositeProperty: CompositeProperty;
  parentFieldMetadata: FlatFieldMetadata;
  objectMetadata: FlatObjectMetadata | FlatObjectMetadataWithFlatFieldMaps | FlatObjectMetadataWithoutFields;
}): WorkspaceSchemaColumnDefinition => {
  const { tableName } = getWorkspaceSchemaContextForMigration({
    workspaceId: objectMetadata.workspaceId,
    flatObjectMetadata: objectMetadata,
  });
  
  if (compositeProperty.type === FieldMetadataType.RELATION) {
    throw new Error(`Relation type not supported for composite columns`);
  }

  const columnName = computeCompositeColumnName(parentFieldMetadata.name, compositeProperty);
  const defaultValue = (compositeProperty as any).defaultValue?.[compositeProperty.name];
  const serializedDefaultValue = serializeDefaultValue(defaultValue);

  const columnType = fieldMetadataTypeToColumnType(compositeProperty.type);

  const isArrayFlag =
    compositeProperty.type === FieldMetadataType.ARRAY ||
    compositeProperty.type === FieldMetadataType.MULTI_SELECT ||
    Boolean((compositeProperty as any).isArray);

  const definition: WorkspaceSchemaColumnDefinition = {
    name: columnName,
    type: columnType === 'enum' ? computePostgresEnumName({ tableName, columnName }) : columnType,
    // Align composite column nullability with parent field nullability by default
    isNullable: parentFieldMetadata.isNullable ?? true,
    isUnique: parentFieldMetadata.isUnique ?? false,
    default: serializedDefaultValue,
    isArray: isArrayFlag,
  };

  if (columnType === 'enum') {
    definition.enumValues = compositeProperty.options?.map((option) => option.value);
  }

  return definition;
}

const generateTsVectorColumnDefinition = (
  fieldMetadata: FlatFieldMetadata,
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
  fieldMetadata: FlatFieldMetadata,
): WorkspaceSchemaColumnDefinition | null => {
  if (!fieldMetadata.settings || !(fieldMetadata.settings as any).joinColumnName) {
    return null;
  }

  const joinColumnName = (fieldMetadata.settings as any).joinColumnName;
  const columnName = joinColumnName;

  return {
    name: columnName,
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
  const serializedDefaultValue = serializeDefaultValue(fieldMetadata.defaultValue);
  const columnType = fieldMetadataTypeToColumnType(fieldMetadata.type);

  return {
    name: columnName,
    type: columnType === 'enum' ? computePostgresEnumName({ tableName, columnName }) : columnType,
    isNullable: fieldMetadata.isNullable ?? true,
    isArray: fieldMetadata.type === FieldMetadataType.ARRAY,
    isUnique: fieldMetadata.isUnique ?? false,
    default: serializedDefaultValue,
    enumValues: columnType === 'enum' ? fieldMetadata.options?.map((option) => option.value) : undefined,
  };
};

export const generateColumnDefinitions = ({
  fieldMetadata,
  objectMetadata,
}: {
  fieldMetadata: FlatFieldMetadata;
  objectMetadata: FlatObjectMetadata | FlatObjectMetadataWithFlatFieldMaps | FlatObjectMetadataWithoutFields;
}): WorkspaceSchemaColumnDefinition[] => {
  const { tableName } = getWorkspaceSchemaContextForMigration({
    workspaceId: objectMetadata.workspaceId,
    flatObjectMetadata: objectMetadata,
  });

  if (isCompositeFieldMetadataType(fieldMetadata.type)) {
    const compositeType = getCompositeTypeOrThrow(fieldMetadata.type);
    const columnDefinitions: WorkspaceSchemaColumnDefinition[] = [];

    for (const property of compositeType.properties) {
      columnDefinitions.push(generateCompositeColumnDefinition({ compositeProperty: property, parentFieldMetadata: fieldMetadata, objectMetadata }));
    }

    return columnDefinitions;
  }

  if (isFlatFieldMetadataEntityOfType(fieldMetadata, FieldMetadataType.TS_VECTOR)) {
    return [generateTsVectorColumnDefinition(fieldMetadata)];
  }

  if (
    isFlatFieldMetadataEntityOfType(fieldMetadata, FieldMetadataType.RELATION) ||
    isFlatFieldMetadataEntityOfType(fieldMetadata, FieldMetadataType.MORPH_RELATION)
  ) {
    const relationColumn = generateRelationColumnDefinition(fieldMetadata);

    return relationColumn ? [relationColumn] : [];
  }

  return [generateStandardColumnDefinition(fieldMetadata, tableName)];
}