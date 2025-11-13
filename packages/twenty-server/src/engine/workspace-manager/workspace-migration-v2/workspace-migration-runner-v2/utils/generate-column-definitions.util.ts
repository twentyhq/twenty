import { type CompositeProperty, FieldMetadataType } from 'twenty-shared/types';
import { type ColumnType } from 'typeorm';

import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import {
  computeColumnName,
  computeCompositeColumnName,
} from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { getCompositeTypeOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/get-composite-type-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isCompositeFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { computePostgresEnumName } from 'src/engine/workspace-manager/workspace-migration-runner/utils/compute-postgres-enum-name.util';
import { serializeDefaultValueV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/utils/serialize-default-value-v2.util';
import {
  WorkspaceMigrationRunnerException,
  WorkspaceMigrationRunnerExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/exceptions/workspace-migration-runner.exception';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/get-workspace-schema-context-for-migration.util';

export const generateCompositeColumnDefinition = ({
  compositeProperty,
  parentFieldMetadata,
  flatObjectMetadata,
}: {
  compositeProperty: CompositeProperty;
  parentFieldMetadata: FlatFieldMetadata<CompositeFieldMetadataType>;
  flatObjectMetadata: FlatObjectMetadata;
}): WorkspaceSchemaColumnDefinition => {
  const { tableName, schemaName } = getWorkspaceSchemaContextForMigration({
    workspaceId: flatObjectMetadata.workspaceId,
    flatObjectMetadata,
  });

  if (
    compositeProperty.type === FieldMetadataType.RELATION ||
    compositeProperty.type === FieldMetadataType.MORPH_RELATION
  ) {
    throw new WorkspaceMigrationRunnerException(
      `Relation type not supported for composite columns`,
      WorkspaceMigrationRunnerExceptionCode.UNSUPPORTED_COMPOSITE_COLUMN_TYPE,
    );
  }

  const columnName = computeCompositeColumnName(
    parentFieldMetadata.name,
    compositeProperty,
  );
  const defaultValue =
    // @ts-expect-error - TODO: fix this
    parentFieldMetadata.defaultValue?.[compositeProperty.name];
  const columnType = fieldMetadataTypeToColumnType(compositeProperty.type);
  const serializedDefaultValue = serializeDefaultValueV2({
    columnName,
    schemaName,
    tableName,
    columnType: columnType as ColumnType,
    defaultValue,
  });

  const isArrayFlag =
    compositeProperty.type === FieldMetadataType.ARRAY ||
    compositeProperty.type === FieldMetadataType.MULTI_SELECT ||
    Boolean(compositeProperty.isArray);

  const definition: WorkspaceSchemaColumnDefinition = {
    name: columnName,
    type:
      columnType === 'enum'
        ? `"${schemaName}"."${computePostgresEnumName({ tableName, columnName })}"`
        : columnType,
    isNullable: parentFieldMetadata.isNullable || !compositeProperty.isRequired,
    isUnique: parentFieldMetadata.isUnique ?? false,
    default: serializedDefaultValue,
    isArray: isArrayFlag,
    isPrimary: false,
  };

  return definition;
};

const generateTsVectorColumnDefinition = (
  flatFieldMetadata: FlatFieldMetadata<FieldMetadataType.TS_VECTOR>,
): WorkspaceSchemaColumnDefinition => {
  const columnName = computeColumnName(flatFieldMetadata.name);

  return {
    name: columnName,
    type: fieldMetadataTypeToColumnType(flatFieldMetadata.type),
    isNullable: true,
    isArray: false,
    isUnique: false,
    default: null,
    asExpression: flatFieldMetadata.settings?.asExpression ?? undefined,
    generatedType: flatFieldMetadata.settings?.generatedType ?? undefined,
    isPrimary: false,
  };
};

const generateRelationColumnDefinition = (
  flatFieldMetadata: FlatFieldMetadata<
    FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
  >,
): WorkspaceSchemaColumnDefinition | null => {
  if (
    !flatFieldMetadata.settings ||
    !flatFieldMetadata.settings.joinColumnName
  ) {
    return null;
  }

  const joinColumnName = flatFieldMetadata.settings.joinColumnName;

  return {
    name: joinColumnName,
    type: fieldMetadataTypeToColumnType(FieldMetadataType.UUID),
    isNullable: true,
    isArray: false,
    isUnique: false,
    default: null,
    isPrimary: false,
  };
};

const generateColumnDefinition = ({
  flatFieldMetadata,
  schemaName,
  tableName,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  tableName: string;
  schemaName: string;
}): WorkspaceSchemaColumnDefinition => {
  const columnName = computeColumnName(flatFieldMetadata.name);
  const columnType = fieldMetadataTypeToColumnType(
    flatFieldMetadata.type,
  ) as ColumnType;
  const serializedDefaultValue = serializeDefaultValueV2({
    columnName,
    schemaName,
    tableName,
    columnType,
    defaultValue: flatFieldMetadata.defaultValue,
  });

  return {
    name: columnName,
    type:
      columnType === 'enum'
        ? `"${schemaName}"."${computePostgresEnumName({ tableName, columnName })}"`
        : (columnType as string),
    isNullable: flatFieldMetadata.isNullable ?? true,
    isArray:
      flatFieldMetadata.type === FieldMetadataType.ARRAY ||
      flatFieldMetadata.type === FieldMetadataType.MULTI_SELECT,
    isUnique: flatFieldMetadata.isUnique ?? false,
    default: serializedDefaultValue,
    isPrimary: flatFieldMetadata.name === 'id',
  };
};

export const generateColumnDefinitions = ({
  flatFieldMetadata,
  flatObjectMetadata,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  flatObjectMetadata: FlatObjectMetadata;
}): WorkspaceSchemaColumnDefinition[] => {
  const { tableName, schemaName } = getWorkspaceSchemaContextForMigration({
    workspaceId: flatObjectMetadata.workspaceId,
    flatObjectMetadata,
  });

  if (isCompositeFlatFieldMetadata(flatFieldMetadata)) {
    const compositeType = getCompositeTypeOrThrow(flatFieldMetadata.type);

    return compositeType.properties.map((property) =>
      generateCompositeColumnDefinition({
        compositeProperty: property,
        parentFieldMetadata: flatFieldMetadata,
        flatObjectMetadata,
      }),
    );
  }

  if (
    isFlatFieldMetadataOfType(flatFieldMetadata, FieldMetadataType.TS_VECTOR)
  ) {
    return [generateTsVectorColumnDefinition(flatFieldMetadata)];
  }

  if (isMorphOrRelationFlatFieldMetadata(flatFieldMetadata)) {
    const relationColumn = generateRelationColumnDefinition(flatFieldMetadata);

    return relationColumn ? [relationColumn] : [];
  }

  return [
    generateColumnDefinition({ flatFieldMetadata, tableName, schemaName }),
  ];
};
