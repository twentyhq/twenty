import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { buildDescriptionForRelationFieldMetadataOnFromField } from 'src/engine/metadata-modules/object-metadata/utils/build-description-for-relation-field-on-from-field.util';
import { buildDescriptionForRelationFieldMetadataOnToField } from 'src/engine/metadata-modules/object-metadata/utils/build-description-for-relation-field-on-to-field.util';
import { buildMigrationsForCustomObjectRelations } from 'src/engine/metadata-modules/object-metadata/utils/build-migrations-for-custom-object-relations.util';
import { buildNameLabelAndDescriptionForForeignKeyFieldMetadata } from 'src/engine/metadata-modules/object-metadata/utils/build-name-label-and-description-for-foreign-key-field-metadata.util';
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

  public async createStandardRelationsUpdatesMigrations(
    existingObjectMetadata: ObjectMetadataEntity,
    updatedObjectMetadata: ObjectMetadataEntity,
    workspaceId: string,
  ) {
    const existingTableName = computeObjectTargetTable(existingObjectMetadata);
    const newTableName = computeObjectTargetTable(updatedObjectMetadata);

    if (existingTableName !== newTableName) {
      const relatedObjectsIds = await this.relationMetadataRepository
        .find({
          where: {
            workspaceId,
            fromObjectMetadataId: existingObjectMetadata.id,
          },
        })
        .then((relations) =>
          relations.map((relation) => relation.toObjectMetadataId),
        );

      const foreignKeyFieldMetadataForStandardRelation =
        await this.fieldMetadataRepository.find({
          where: {
            isCustom: false,
            settings: {
              isForeignKey: true,
            },
            name: `${existingObjectMetadata.nameSingular}Id`,
            workspaceId: workspaceId,
          },
        });

      await Promise.all(
        foreignKeyFieldMetadataForStandardRelation.map(
          async (foreignKeyFieldMetadata) => {
            if (
              relatedObjectsIds.includes(
                foreignKeyFieldMetadata.objectMetadataId,
              )
            ) {
              const relatedObject =
                await this.objectMetadataRepository.findOneBy({
                  id: foreignKeyFieldMetadata.objectMetadataId,
                  workspaceId: workspaceId,
                });

              if (relatedObject) {
                // 1. Update to and from relation fieldMetadata
                const toFieldRelationFieldMetadataId =
                  await this.fieldMetadataRepository
                    .findOneByOrFail({
                      name: existingObjectMetadata.nameSingular,
                      objectMetadataId: relatedObject.id,
                      workspaceId: workspaceId,
                    })
                    .then((field) => field.id);

                const { description: descriptionForToField } =
                  buildDescriptionForRelationFieldMetadataOnToField({
                    relationObjectMetadataNamePlural: relatedObject.namePlural,
                    targetObjectLabelSingular:
                      updatedObjectMetadata.labelSingular,
                  });

                await this.fieldMetadataRepository.update(
                  toFieldRelationFieldMetadataId,
                  {
                    name: updatedObjectMetadata.nameSingular,
                    label: updatedObjectMetadata.labelSingular,
                    description: descriptionForToField,
                  },
                );

                const fromFieldRelationFieldMetadataId =
                  await this.relationMetadataRepository
                    .findOneByOrFail({
                      fromObjectMetadataId: existingObjectMetadata.id,
                      toObjectMetadataId: relatedObject.id,
                      toFieldMetadataId: toFieldRelationFieldMetadataId,
                      workspaceId,
                    })
                    .then((relation) => relation?.fromFieldMetadataId);

                await this.fieldMetadataRepository.update(
                  fromFieldRelationFieldMetadataId,
                  {
                    description:
                      buildDescriptionForRelationFieldMetadataOnFromField({
                        relationObjectMetadataNamePlural:
                          relatedObject.namePlural,
                        targetObjectLabelSingular:
                          updatedObjectMetadata.labelSingular,
                      }).description,
                  },
                );

                // 2. Update foreign key fieldMetadata
                const {
                  name: updatedNameForForeignKeyFieldMetadata,
                  label: updatedLabelForForeignKeyFieldMetadata,
                  description: updatedDescriptionForForeignKeyFieldMetadata,
                } = buildNameLabelAndDescriptionForForeignKeyFieldMetadata({
                  targetObjectNameSingular: updatedObjectMetadata.nameSingular,
                  targetObjectLabelSingular:
                    updatedObjectMetadata.labelSingular,
                  relatedObjectLabelSingular: relatedObject.labelSingular,
                });

                await this.fieldMetadataRepository.update(
                  foreignKeyFieldMetadata.id,
                  {
                    name: updatedNameForForeignKeyFieldMetadata,
                    label: updatedLabelForForeignKeyFieldMetadata,
                    description: updatedDescriptionForForeignKeyFieldMetadata,
                  },
                );

                const relatedObjectTableName =
                  computeObjectTargetTable(relatedObject);
                const columnName = `${existingObjectMetadata.nameSingular}Id`;
                const columnType = fieldMetadataTypeToColumnType(
                  foreignKeyFieldMetadata.type,
                );

                await this.workspaceMigrationService.createCustomMigration(
                  generateMigrationName(
                    `rename-${existingObjectMetadata.nameSingular}-to-${updatedObjectMetadata.nameSingular}-in-${relatedObject.nameSingular}`,
                  ),
                  workspaceId,
                  [
                    {
                      name: relatedObjectTableName,
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
            }
          },
        ),
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
