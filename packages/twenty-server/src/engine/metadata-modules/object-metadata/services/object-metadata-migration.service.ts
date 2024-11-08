import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { buildMigrationsForCustomObjectRelations } from 'src/engine/metadata-modules/object-metadata/utils/build-migrations-for-custom-object-relations.util';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { RelationToDelete } from 'src/engine/metadata-modules/relation-metadata/types/relation-to-delete';
import { fieldMetadataTypeToColumnType } from 'src/engine/metadata-modules/workspace-migration/utils/field-metadata-type-to-column-type.util';
import { generateMigrationName } from 'src/engine/metadata-modules/workspace-migration/utils/generate-migration-name.util';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnDrop,
  WorkspaceMigrationTableAction,
  WorkspaceMigrationTableActionType,
} from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationFactory } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.factory';
import { WorkspaceMigrationService } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.service';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';

@Injectable()
export class ObjectMetadataMigrationService {
  constructor(
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(RelationMetadataEntity, 'metadata')
    private readonly relationMetadataRepository: Repository<RelationMetadataEntity>,
    private readonly workspaceMigrationService: WorkspaceMigrationService,
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
  ) {}

  public async createObjectMigration(
    createdObjectMetadata: ObjectMetadataEntity,
  ) {
    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`create-${createdObjectMetadata.nameSingular}`),
      createdObjectMetadata.workspaceId,
      [
        {
          name: computeObjectTargetTable(createdObjectMetadata),
          action: WorkspaceMigrationTableActionType.CREATE,
        } satisfies WorkspaceMigrationTableAction,
      ],
    );
  }

  public async createFieldMigrations(
    createdObjectMetadata: ObjectMetadataEntity,
    fieldMetadataCollection: FieldMetadataEntity[],
  ) {
    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(
        `create-${createdObjectMetadata.nameSingular}-fields`,
      ),
      createdObjectMetadata.workspaceId,
      [
        {
          name: computeObjectTargetTable(createdObjectMetadata),
          action: WorkspaceMigrationTableActionType.ALTER,
          columns: fieldMetadataCollection.flatMap((fieldMetadata) =>
            this.workspaceMigrationFactory.createColumnActions(
              WorkspaceMigrationColumnActionType.CREATE,
              fieldMetadata,
            ),
          ),
        },
      ],
    );
  }

  public async createRelationMigrations(
    createdObjectMetadata: ObjectMetadataEntity,
    relatedObjectMetadataCollection: ObjectMetadataEntity[],
  ) {
    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(
        `create-${createdObjectMetadata.nameSingular}-relations`,
      ),
      createdObjectMetadata.workspaceId,
      buildMigrationsForCustomObjectRelations(
        createdObjectMetadata,
        relatedObjectMetadataCollection,
      ),
    );
  }

  public async createRenameTableMigration(
    existingObjectMetadata: ObjectMetadataEntity,
    objectMetadataForUpdate: ObjectMetadataEntity,
    workspaceId: string,
  ) {
    const newTargetTableName = computeObjectTargetTable(
      objectMetadataForUpdate,
    );
    const existingTargetTableName = computeObjectTargetTable(
      existingObjectMetadata,
    );

    this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`rename-${existingObjectMetadata.nameSingular}`),
      workspaceId,
      [
        {
          name: existingTargetTableName,
          newName: newTargetTableName,
          action: WorkspaceMigrationTableActionType.ALTER,
        },
      ],
    );
  }

  public async createRelationsUpdatesMigrations(
    existingObjectMetadata: ObjectMetadataEntity,
    updatedObjectMetadata: ObjectMetadataEntity,
    workspaceId: string,
  ) {
    const existingTableName = computeObjectTargetTable(existingObjectMetadata);
    const newTableName = computeObjectTargetTable(updatedObjectMetadata);

    if (existingTableName !== newTableName) {
      const searchCriteria = {
        isCustom: false,
        settings: {
          isForeignKey: true,
        },
        name: `${existingObjectMetadata.nameSingular}Id`,
        workspaceId: workspaceId,
      };

      const fieldsWihStandardRelation = await this.fieldMetadataRepository.find(
        {
          where: {
            isCustom: false,
            settings: {
              isForeignKey: true,
            },
            name: `${existingObjectMetadata.nameSingular}Id`,
          },
        },
      );

      await this.fieldMetadataRepository.update(searchCriteria, {
        name: `${updatedObjectMetadata.nameSingular}Id`,
      });

      await Promise.all(
        fieldsWihStandardRelation.map(async (fieldWihStandardRelation) => {
          const relatedObject = await this.objectMetadataRepository.findOneBy({
            id: fieldWihStandardRelation.objectMetadataId,
            workspaceId: workspaceId,
          });

          if (relatedObject) {
            await this.fieldMetadataRepository.update(
              {
                name: existingObjectMetadata.nameSingular,
                label: existingObjectMetadata.labelSingular,
              },
              {
                name: updatedObjectMetadata.nameSingular,
                label: updatedObjectMetadata.labelSingular,
              },
            );

            const relationTableName = computeObjectTargetTable(relatedObject);
            const columnName = `${existingObjectMetadata.nameSingular}Id`;
            const columnType = fieldMetadataTypeToColumnType(
              fieldWihStandardRelation.type,
            );

            await this.workspaceMigrationService.createCustomMigration(
              generateMigrationName(
                `rename-${existingObjectMetadata.nameSingular}-to-${updatedObjectMetadata.nameSingular}-in-${relatedObject.nameSingular}`,
              ),
              workspaceId,
              [
                {
                  name: relationTableName,
                  action: WorkspaceMigrationTableActionType.ALTER,
                  columns: [
                    {
                      action: WorkspaceMigrationColumnActionType.ALTER,
                      currentColumnDefinition: {
                        columnName,
                        columnType,
                        isNullable: true,
                        defaultValue: null,
                      },
                      alteredColumnDefinition: {
                        columnName: `${updatedObjectMetadata.nameSingular}Id`,
                        columnType,
                        isNullable: true,
                        defaultValue: null,
                      },
                    },
                  ],
                },
              ],
            );
          }
        }),
      );
    }
  }

  public async deleteAllRelationsAndDropTable(
    objectMetadata: ObjectMetadataEntity,
    workspaceId: string,
  ) {
    const relationsToDelete: RelationToDelete[] = [];

    // TODO: Most of this logic should be moved to relation-metadata.service.ts
    for (const relation of [
      ...objectMetadata.fromRelations,
      ...objectMetadata.toRelations,
    ]) {
      relationsToDelete.push({
        id: relation.id,
        fromFieldMetadataId: relation.fromFieldMetadata.id,
        toFieldMetadataId: relation.toFieldMetadata.id,
        fromFieldMetadataName: relation.fromFieldMetadata.name,
        toFieldMetadataName: relation.toFieldMetadata.name,
        fromObjectMetadataId: relation.fromObjectMetadata.id,
        toObjectMetadataId: relation.toObjectMetadata.id,
        fromObjectName: relation.fromObjectMetadata.nameSingular,
        toObjectName: relation.toObjectMetadata.nameSingular,
        toFieldMetadataIsCustom: relation.toFieldMetadata.isCustom,
        toObjectMetadataIsCustom: relation.toObjectMetadata.isCustom,
        direction:
          relation.fromObjectMetadata.nameSingular ===
          objectMetadata.nameSingular
            ? 'from'
            : 'to',
      });
    }

    if (relationsToDelete.length > 0) {
      await this.relationMetadataRepository.delete(
        relationsToDelete.map((relation) => relation.id),
      );
    }

    for (const relationToDelete of relationsToDelete) {
      const foreignKeyFieldsToDelete = await this.fieldMetadataRepository.find({
        where: {
          name: `${relationToDelete.toFieldMetadataName}Id`,
          objectMetadataId: relationToDelete.toObjectMetadataId,
          workspaceId,
        },
      });

      const foreignKeyFieldsToDeleteIds = foreignKeyFieldsToDelete.map(
        (field) => field.id,
      );

      await this.fieldMetadataRepository.delete([
        ...foreignKeyFieldsToDeleteIds,
        relationToDelete.fromFieldMetadataId,
        relationToDelete.toFieldMetadataId,
      ]);

      if (relationToDelete.direction === 'from') {
        await this.workspaceMigrationService.createCustomMigration(
          generateMigrationName(
            `delete-${relationToDelete.fromObjectName}-${relationToDelete.toObjectName}`,
          ),
          workspaceId,
          [
            {
              name: computeTableName(
                relationToDelete.toObjectName,
                relationToDelete.toObjectMetadataIsCustom,
              ),
              action: WorkspaceMigrationTableActionType.ALTER,
              columns: [
                {
                  action: WorkspaceMigrationColumnActionType.DROP,
                  columnName: computeColumnName(
                    relationToDelete.toFieldMetadataName,
                    { isForeignKey: true },
                  ),
                } satisfies WorkspaceMigrationColumnDrop,
              ],
            },
          ],
        );
      }
    }

    // DROP TABLE
    await this.workspaceMigrationService.createCustomMigration(
      generateMigrationName(`delete-${objectMetadata.nameSingular}`),
      workspaceId,
      [
        {
          name: computeObjectTargetTable(objectMetadata),
          action: WorkspaceMigrationTableActionType.DROP,
        },
      ],
    );
  }
}
