import { type CompositeProperty, FieldMetadataType } from 'twenty-shared/types';
import { type ColumnType } from 'typeorm';

import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/composite-field-metadata-type.type';
import {
  computeColumnName,
  computeCompositeColumnName,
} from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { getCompositeTypeOrThrow } from 'src/engine/metadata-modules/field-metadata/utils/get-composite-type-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isCompositeUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-composite-flat-field-metadata.util';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { isMorphOrRelationUniversalFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type WorkspaceSchemaColumnDefinition } from 'src/engine/twenty-orm/workspace-schema-manager/types/workspace-schema-column-definition.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { computePostgresEnumName } from 'src/engine/workspace-manager/workspace-migration/utils/compute-postgres-enum-name.util';
import { serializeDefaultValue } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/utils/serialize-default-value.util';
import {
  WorkspaceMigrationActionExecutionException,
  WorkspaceMigrationActionExecutionExceptionCode,
} from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/exceptions/workspace-migration-action-execution.exception';
import { fieldMetadataTypeToColumnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/field-metadata-type-to-column-type.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

export const generateCompositeColumnDefinition = ({
  compositeProperty,
  parentUniversalFieldMetadata,
  universalFlatObjectMetadata,
  workspaceId,
}: {
  compositeProperty: CompositeProperty;
  parentUniversalFieldMetadata: UniversalFlatFieldMetadata<CompositeFieldMetadataType>;
  universalFlatObjectMetadata: UniversalFlatObjectMetadata;
  workspaceId: string;
}): WorkspaceSchemaColumnDefinition => {
  const { tableName, schemaName } = getWorkspaceSchemaContextForMigration({
    workspaceId,
    objectMetadata: universalFlatObjectMetadata,
  });

  if (
    compositeProperty.type === FieldMetadataType.RELATION ||
    compositeProperty.type === FieldMetadataType.MORPH_RELATION
  ) {
    throw new WorkspaceMigrationActionExecutionException({
      message: `Relation type not supported for composite columns`,
      code: WorkspaceMigrationActionExecutionExceptionCode.UNSUPPORTED_COMPOSITE_COLUMN_TYPE,
    });
  }

  const columnName = computeCompositeColumnName(
    parentUniversalFieldMetadata.name,
    compositeProperty,
  );
  const defaultValue =
    // @ts-expect-error - TODO: fix this
    parentFieldMetadata.defaultValue?.[compositeProperty.name];
  const columnType = fieldMetadataTypeToColumnType(compositeProperty.type);
  const serializedDefaultValue = serializeDefaultValue({
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
    isNullable:
      parentUniversalFieldMetadata.isNullable || !compositeProperty.isRequired,
    isUnique: parentUniversalFieldMetadata.isUnique ?? false,
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
  flatFieldMetadata: UniversalFlatFieldMetadata<
    FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
  >,
): WorkspaceSchemaColumnDefinition | null => {
  if (
    !flatFieldMetadata.universalSettings ||
    !flatFieldMetadata.universalSettings.joinColumnName
  ) {
    return null;
  }

  const joinColumnName = flatFieldMetadata.universalSettings.joinColumnName;

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
  universalFlatFieldMetadata,
  schemaName,
  tableName,
}: {
  universalFlatFieldMetadata: UniversalFlatFieldMetadata;
  tableName: string;
  schemaName: string;
}): WorkspaceSchemaColumnDefinition => {
  const columnName = computeColumnName(universalFlatFieldMetadata.name);
  const columnType = fieldMetadataTypeToColumnType(
    universalFlatFieldMetadata.type,
  ) as ColumnType;
  const serializedDefaultValue = serializeDefaultValue({
    columnName,
    schemaName,
    tableName,
    columnType,
    defaultValue: universalFlatFieldMetadata.defaultValue,
  });

  return {
    name: columnName,
    type:
      columnType === 'enum'
        ? `"${schemaName}"."${computePostgresEnumName({ tableName, columnName })}"`
        : (columnType as string),
    isNullable: universalFlatFieldMetadata.isNullable ?? true,
    isArray:
      universalFlatFieldMetadata.type === FieldMetadataType.ARRAY ||
      universalFlatFieldMetadata.type === FieldMetadataType.MULTI_SELECT,
    isUnique: universalFlatFieldMetadata.isUnique ?? false,
    default: serializedDefaultValue,
    isPrimary: universalFlatFieldMetadata.name === 'id',
  };
};

export const generateColumnDefinitions = ({
  universalFlatFieldMetadata,
  universalFlatObjectMetadata,
  workspaceId,
}: {
  universalFlatFieldMetadata: UniversalFlatFieldMetadata;
  universalFlatObjectMetadata: UniversalFlatObjectMetadata;
  workspaceId: string;
}): WorkspaceSchemaColumnDefinition[] => {
  const { tableName, schemaName } = getWorkspaceSchemaContextForMigration({
    workspaceId,
    objectMetadata: universalFlatObjectMetadata,
  });

  if (isCompositeUniversalFlatFieldMetadata(universalFlatFieldMetadata)) {
    const compositeType = getCompositeTypeOrThrow(
      universalFlatFieldMetadata.type,
    );

    return compositeType.properties.map((property) =>
      generateCompositeColumnDefinition({
        compositeProperty: property,
        parentUniversalFieldMetadata: universalFlatFieldMetadata,
        universalFlatObjectMetadata,
        workspaceId,
      }),
    );
  }

  if (
    isFlatFieldMetadataOfType(
      universalFlatFieldMetadata,
      FieldMetadataType.TS_VECTOR,
    )
  ) {
    return [generateTsVectorColumnDefinition(universalFlatFieldMetadata)];
  }

  if (
    isMorphOrRelationUniversalFlatFieldMetadata(universalFlatFieldMetadata)
  ) {
    const relationColumn = generateRelationColumnDefinition(
      universalFlatFieldMetadata,
    );

    return relationColumn ? [relationColumn] : [];
  }

  return [
    generateColumnDefinition({
      universalFlatFieldMetadata,
      tableName,
      schemaName,
    }),
  ];
};
