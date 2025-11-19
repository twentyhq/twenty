import {
  type CompositeType,
  compositeTypeDefinitions,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { type IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  type WorkspaceMigrationEntity,
  WorkspaceMigrationIndexActionType,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

export const createIndexMigration = async (
  indexMetadataByObjectMetadataMap: Map<
    Pick<
      ObjectMetadataEntity,
      'id' | 'workspaceId' | 'nameSingular' | 'isCustom'
    > & {
      fields: Pick<FieldMetadataEntity, 'id' | 'name' | 'type' | 'settings'>[];
    },
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

          if (
            isFieldMetadataEntityOfType(
              fieldMetadata,
              FieldMetadataType.RELATION,
            ) ||
            isFieldMetadataEntityOfType(
              fieldMetadata,
              FieldMetadataType.MORPH_RELATION,
            )
          ) {
            if (!fieldMetadata.settings) {
              throw new Error(
                `Join column name is not supported for relation fields`,
              );
            }

            return fieldMetadata.settings.joinColumnName;
          }

          if (!isCompositeFieldMetadataType(fieldMetadata.type)) {
            return fieldMetadata.name;
          }

          const compositeType = compositeTypeDefinitions.get(
            fieldMetadata.type,
          ) as CompositeType;

          const columns = compositeType.properties
            .filter((property) => property.isIncludedInUniqueConstraint)
            .map((property) =>
              computeCompositeColumnName(fieldMetadata, property),
            );

          return columns;
        })
        .flat()
        .filter(isDefined);

      return {
        name: indexMetadata.name,
        action: WorkspaceMigrationIndexActionType.CREATE,
        isUnique: indexMetadata.isUnique,
        columns,
        type: indexMetadata.indexType,
        where: indexMetadata.indexWhereClause,
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
