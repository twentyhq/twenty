import { Injectable } from '@nestjs/common';

import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/metadata/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnRelation,
  WorkspaceMigrationEntity,
  WorkspaceMigrationTableAction,
} from 'src/metadata/workspace-migration/workspace-migration.entity';
import { computeObjectTargetTable } from 'src/workspace/utils/compute-object-target-table.util';
import { WorkspaceMigrationFactory } from 'src/metadata/workspace-migration/workspace-migration.factory';
import {
  RelationMetadataEntity,
  RelationMetadataType,
} from 'src/metadata/relation-metadata/relation-metadata.entity';
import { camelCase } from 'src/utils/camel-case';
import { generateMigrationName } from 'src/metadata/workspace-migration/utils/generate-migration-name.util';

@Injectable()
export class WorkspaceSyncFactory {
  constructor(
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
  ) {}

  async createObjectMigration(
    originalObjectMetadataCollection: ObjectMetadataEntity[],
    createdObjectMetadataCollection: ObjectMetadataEntity[],
    objectMetadataDeleteCollection: ObjectMetadataEntity[],
    createdFieldMetadataCollection: FieldMetadataEntity[],
    fieldMetadataDeleteCollection: FieldMetadataEntity[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];

    /**
     * Create object migrations
     */
    if (createdObjectMetadataCollection.length > 0) {
      for (const objectMetadata of createdObjectMetadataCollection) {
        const migrations = [
          {
            name: computeObjectTargetTable(objectMetadata),
            action: 'create',
          } satisfies WorkspaceMigrationTableAction,
          ...objectMetadata.fields
            .filter((field) => field.type !== FieldMetadataType.RELATION)
            .map(
              (field) =>
                ({
                  name: computeObjectTargetTable(objectMetadata),
                  action: 'alter',
                  columns: this.workspaceMigrationFactory.createColumnActions(
                    WorkspaceMigrationColumnActionType.CREATE,
                    field,
                  ),
                }) satisfies WorkspaceMigrationTableAction,
            ),
        ];

        workspaceMigrations.push({
          workspaceId: objectMetadata.workspaceId,
          name: generateMigrationName(`create-${objectMetadata.nameSingular}`),
          isCustom: false,
          migrations,
        });
      }
    }

    /**
     * Delete object migrations
     * TODO: handle object delete migrations.
     * Note: we need to delete the relation first due to the DB constraint.
     */
    // if (objectMetadataDeleteCollection.length > 0) {
    //   for (const objectMetadata of objectMetadataDeleteCollection) {
    //     const migrations = [
    //       {
    //         name: computeObjectTargetTable(objectMetadata),
    //         action: 'drop',
    //         columns: [],
    //       } satisfies WorkspaceMigrationTableAction,
    //     ];

    //     workspaceMigrations.push({
    //       workspaceId: objectMetadata.workspaceId,
    //       isCustom: false,
    //       migrations,
    //     });
    //   }
    // }

    /**
     * Create field migrations
     */
    const originalObjectMetadataMap = originalObjectMetadataCollection.reduce(
      (result, currentObject) => {
        result[currentObject.id] = currentObject;

        return result;
      },
      {} as Record<string, ObjectMetadataEntity>,
    );

    if (createdFieldMetadataCollection.length > 0) {
      for (const fieldMetadata of createdFieldMetadataCollection) {
        const migrations = [
          {
            name: computeObjectTargetTable(
              originalObjectMetadataMap[fieldMetadata.objectMetadataId],
            ),
            action: 'alter',
            columns: this.workspaceMigrationFactory.createColumnActions(
              WorkspaceMigrationColumnActionType.CREATE,
              fieldMetadata,
            ),
          } satisfies WorkspaceMigrationTableAction,
        ];

        workspaceMigrations.push({
          workspaceId: fieldMetadata.workspaceId,
          name: generateMigrationName(`create-${fieldMetadata.name}`),
          isCustom: false,
          migrations,
        });
      }
    }

    /**
     * Delete field migrations
     */
    if (fieldMetadataDeleteCollection.length > 0) {
      for (const fieldMetadata of fieldMetadataDeleteCollection) {
        const migrations = [
          {
            name: computeObjectTargetTable(
              originalObjectMetadataMap[fieldMetadata.objectMetadataId],
            ),
            action: 'alter',
            columns: [
              {
                action: WorkspaceMigrationColumnActionType.DROP,
                columnName: fieldMetadata.name,
              },
            ],
          } satisfies WorkspaceMigrationTableAction,
        ];

        workspaceMigrations.push({
          workspaceId: fieldMetadata.workspaceId,
          name: generateMigrationName(`delete-${fieldMetadata.name}`),
          isCustom: false,
          migrations,
        });
      }
    }

    return workspaceMigrations;
  }

  async createRelationMigration(
    originalObjectMetadataCollection: ObjectMetadataEntity[],
    createdRelationMetadataCollection: RelationMetadataEntity[],
    // TODO: handle relation deletion
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    relationMetadataDeleteCollection: RelationMetadataEntity[],
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const workspaceMigrations: Partial<WorkspaceMigrationEntity>[] = [];

    if (createdRelationMetadataCollection.length > 0) {
      for (const relationMetadata of createdRelationMetadataCollection) {
        const toObjectMetadata = originalObjectMetadataCollection.find(
          (object) => object.id === relationMetadata.toObjectMetadataId,
        );

        const fromObjectMetadata = originalObjectMetadataCollection.find(
          (object) => object.id === relationMetadata.fromObjectMetadataId,
        );

        if (!toObjectMetadata) {
          throw new Error(
            `ObjectMetadata with id ${relationMetadata.toObjectMetadataId} not found`,
          );
        }

        if (!fromObjectMetadata) {
          throw new Error(
            `ObjectMetadata with id ${relationMetadata.fromObjectMetadataId} not found`,
          );
        }

        const toFieldMetadata = toObjectMetadata.fields.find(
          (field) => field.id === relationMetadata.toFieldMetadataId,
        );

        if (!toFieldMetadata) {
          throw new Error(
            `FieldMetadata with id ${relationMetadata.toFieldMetadataId} not found`,
          );
        }

        const migrations = [
          {
            name: computeObjectTargetTable(toObjectMetadata),
            action: 'alter',
            columns: [
              {
                action: WorkspaceMigrationColumnActionType.RELATION,
                columnName: `${camelCase(toFieldMetadata.name)}Id`,
                referencedTableName:
                  computeObjectTargetTable(fromObjectMetadata),
                referencedTableColumnName: 'id',
                isUnique:
                  relationMetadata.relationType ===
                  RelationMetadataType.ONE_TO_ONE,
              } satisfies WorkspaceMigrationColumnRelation,
            ],
          } satisfies WorkspaceMigrationTableAction,
        ];

        workspaceMigrations.push({
          workspaceId: relationMetadata.workspaceId,
          name: generateMigrationName(
            `create-relation-from-${fromObjectMetadata.nameSingular}-to-${toObjectMetadata.nameSingular}`,
          ),
          isCustom: false,
          migrations,
        });
      }
    }

    // if (relationMetadataDeleteCollection.length > 0) {
    //   for (const relationMetadata of relationMetadataDeleteCollection) {
    //     const toObjectMetadata = originalObjectMetadataCollection.find(
    //       (object) => object.id === relationMetadata.toObjectMetadataId,
    //     );

    //     if (!toObjectMetadata) {
    //       throw new Error(
    //         `ObjectMetadata with id ${relationMetadata.toObjectMetadataId} not found`,
    //       );
    //     }

    //     const migrations = [
    //       {
    //         name: computeObjectTargetTable(toObjectMetadata),
    //         action: 'drop',
    //         columns: [],
    //       } satisfies WorkspaceMigrationTableAction,
    //     ];

    //     workspaceMigrations.push({
    //       workspaceId: relationMetadata.workspaceId,
    //       isCustom: false,
    //       migrations,
    //     });
    //   }
    // }

    return workspaceMigrations;
  }
}
