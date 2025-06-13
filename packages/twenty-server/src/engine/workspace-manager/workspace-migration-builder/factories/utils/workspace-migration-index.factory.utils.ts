import { CompositeType } from 'src/engine/metadata-modules/field-metadata/interfaces/composite-type.interface';

import { compositeTypeDefinitions } from 'src/engine/metadata-modules/field-metadata/composite-types';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationEntity,
  WorkspaceMigrationIndexActionType,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';

export const createIndexMigration = async (
  indexMetadataByObjectMetadataMap: Map<
    ObjectMetadataEntity,
    IndexMetadataEntity[]
  >,
): Promise<Partial<WorkspaceMigrationEntity>[]> => {
  const workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];

  for (const [
    objectMetadata,
    indexMetadataCollection,
  ] of indexMetadataByObjectMetadataMap) {
    const targetTable = computeObjectTargetTable(objectMetadata);

    const fieldsById = Object.fromEntries(
      objectMetadata.fields.map((field) => [field.id, field]),
    );

    const indexes = indexMetadataCollection.map((indexMetadata) => {
      const columns = indexMetadata.indexFieldMetadatas
        .sort((a, b) => a.order - b.order)
        .map((indexFieldMetadata) => {
          const fieldMetadata = fieldsById[indexFieldMetadata.fieldMetadataId];

          if (!fieldMetadata) {
            throw new Error(
              `Field metadata with id ${indexFieldMetadata.fieldMetadataId} not found in object metadata with id ${objectMetadata.id}`,
            );
          }

          if (isRelationFieldMetadataType(fieldMetadata.type)) {
            return `${fieldMetadata.name}Id`;
          }

          if (!isCompositeFieldMetadataType(fieldMetadata.type)) {
            return fieldMetadata.name;
          }

          const compositeType = compositeTypeDefinitions.get(
            fieldMetadata.type,
          ) as CompositeType;

          return compositeType.properties
            .filter((property) => property.isIncludedInUniqueConstraint)
            .map((property) =>
              computeCompositeColumnName(fieldMetadata, property),
            );
        })
        .flat();

      const defaultWhereClause = indexMetadata.isUnique
        ? `${columns.map((column) => `"${column}"`).join(" != '' AND ")} != '' AND "deletedAt" IS NULL`
        : null;

      return {
        name: indexMetadata.name,
        action: WorkspaceMigrationIndexActionType.CREATE,
        isUnique: indexMetadata.isUnique,
        columns,
        type: indexMetadata.indexType,
        where: indexMetadata.indexWhereClause ?? defaultWhereClause,
      };
    });

    workspaceMigrations.push({
      workspaceId: objectMetadata.workspaceId,
      name: generateMigrationName(
        `create-${objectMetadata.nameSingular}-indexes`,
      ),
      isCustom: false,
      migrations: [
        {
          name: targetTable,
          action: WorkspaceMigrationTableActionType.ALTER_INDEXES,
          indexes,
        },
      ],
    });
  }

  return workspaceMigrations;
};

export const deleteIndexMigration = async (
  indexMetadataByObjectMetadataMap: Map<
    ObjectMetadataEntity,
    IndexMetadataEntity[]
  >,
): Promise<Partial<WorkspaceMigrationEntity>[]> => {
  const workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];

  for (const [
    objectMetadata,
    indexMetadataCollection,
  ] of indexMetadataByObjectMetadataMap) {
    const targetTable = computeObjectTargetTable(objectMetadata);

    const indexes = indexMetadataCollection.map((indexMetadata) => ({
      name: indexMetadata.name,
      action: WorkspaceMigrationIndexActionType.DROP,
      columns: [],
      isUnique: indexMetadata.isUnique,
    }));

    workspaceMigrations.push({
      workspaceId: objectMetadata.workspaceId,
      name: generateMigrationName(
        `delete-${objectMetadata.nameSingular}-indexes`,
      ),
      isCustom: false,
      migrations: [
        {
          name: targetTable,
          action: WorkspaceMigrationTableActionType.ALTER_INDEXES,
          indexes,
        },
      ],
    });
  }

  return workspaceMigrations;
};
