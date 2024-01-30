import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import diff from 'microdiff';
import { In, Repository } from 'typeorm';
import camelCase from 'lodash.camelcase';
import { v4 as uuidV4 } from 'uuid';

import { PartialFieldMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-field-metadata.interface';
import { PartialObjectMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-object-metadata.interface';
import {
  MappedFieldMetadataEntity,
  MappedObjectMetadata,
} from 'src/workspace/workspace-sync-metadata/interfaces/mapped-metadata.interface';

import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/metadata/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import {
  RelationMetadataEntity,
  RelationMetadataType,
} from 'src/metadata/relation-metadata/relation-metadata.entity';
import {
  filterIgnoredProperties,
  mapObjectMetadataByUniqueIdentifier,
  convertStringifiedFieldsToJSON,
} from 'src/workspace/workspace-sync-metadata/utils/sync-metadata.util';
import { standardObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects';
import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationColumnRelation,
  WorkspaceMigrationEntity,
  WorkspaceMigrationTableAction,
} from 'src/metadata/workspace-migration/workspace-migration.entity';
import { WorkspaceMigrationFactory } from 'src/metadata/workspace-migration/workspace-migration.factory';
import { WorkspaceMigrationRunnerService } from 'src/workspace/workspace-migration-runner/workspace-migration-runner.service';
import { ReflectiveMetadataFactory } from 'src/workspace/workspace-sync-metadata/reflective-metadata.factory';
import { FeatureFlagEntity } from 'src/core/feature-flag/feature-flag.entity';
import { computeObjectTargetTable } from 'src/workspace/utils/compute-object-target-table.util';
import { FieldMetadataComplexOption } from 'src/metadata/field-metadata/dtos/options.input';

@Injectable()
export class WorkspaceSyncMetadataService {
  constructor(
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly reflectiveMetadataFactory: ReflectiveMetadataFactory,

    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(RelationMetadataEntity, 'metadata')
    private readonly relationMetadataRepository: Repository<RelationMetadataEntity>,
    @InjectRepository(WorkspaceMigrationEntity, 'metadata')
    private readonly workspaceMigrationRepository: Repository<WorkspaceMigrationEntity>,
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  /**
   *
   * Sync all standard objects and fields metadata for a given workspace and data source
   * This will update the metadata if it has changed and generate migrations based on the diff.
   *
   * @param dataSourceId
   * @param workspaceId
   */
  public async syncStandardObjectsAndFieldsMetadata(
    dataSourceId: string,
    workspaceId: string,
  ) {
    try {
      const workspaceFeatureFlags = await this.featureFlagRepository.find({
        where: { workspaceId },
      });

      const workspaceFeatureFlagsMap = workspaceFeatureFlags.reduce(
        (result, currentFeatureFlag) => {
          result[currentFeatureFlag.key] = currentFeatureFlag.value;

          return result;
        },
        {},
      );

      const standardObjects =
        await this.reflectiveMetadataFactory.createObjectMetadataCollection(
          standardObjectMetadata,
          workspaceId,
          dataSourceId,
          workspaceFeatureFlagsMap,
        );

      const objectsInDB = await this.objectMetadataRepository.find({
        where: { workspaceId, isCustom: false },
        relations: ['dataSource', 'fields'],
      });

      const objectsInDBByName = mapObjectMetadataByUniqueIdentifier<
        ObjectMetadataEntity,
        FieldMetadataEntity
      >(objectsInDB);
      const standardObjectsByName = mapObjectMetadataByUniqueIdentifier<
        PartialObjectMetadata,
        PartialFieldMetadata
      >(standardObjects);

      const objectsToCreate: MappedObjectMetadata[] = [];
      const objectsToDelete = objectsInDB.filter(
        (objectInDB) => !standardObjectsByName[objectInDB.nameSingular],
      );
      const objectsToUpdate: Record<string, ObjectMetadataEntity> = {};

      const fieldsToCreate: PartialFieldMetadata[] = [];
      const fieldsToDelete: FieldMetadataEntity[] = [];
      const fieldsToUpdate: Record<string, MappedFieldMetadataEntity> = {};

      for (const standardObjectName in standardObjectsByName) {
        const standardObject = standardObjectsByName[standardObjectName];
        const objectInDB = objectsInDBByName[standardObjectName];

        if (!objectInDB) {
          objectsToCreate.push(standardObject);
          continue;
        }

        // Deconstruct fields and compare objects and fields independently
        const { fields: objectInDBFields, ...objectInDBWithoutFields } =
          objectInDB;
        const { fields: standardObjectFields, ...standardObjectWithoutFields } =
          standardObject;

        const objectPropertiesToIgnore = [
          'id',
          'createdAt',
          'updatedAt',
          'labelIdentifierFieldMetadataId',
          'imageIdentifierFieldMetadataId',
          'isActive',
        ];
        const objectDiffWithoutIgnoredProperties = filterIgnoredProperties(
          objectInDBWithoutFields,
          objectPropertiesToIgnore,
        );

        const fieldPropertiesToIgnore = [
          'id',
          'createdAt',
          'updatedAt',
          'objectMetadataId',
          'isActive',
        ];
        const objectInDBFieldsWithoutDefaultFields = Object.fromEntries(
          Object.entries(objectInDBFields).map(([key, value]) => {
            if (value === null || typeof value !== 'object') {
              return [key, value];
            }

            return [
              key,
              filterIgnoredProperties(
                value,
                fieldPropertiesToIgnore,
                (property) => {
                  if (property !== null && typeof property === 'object') {
                    return JSON.stringify(property);
                  }

                  return property;
                },
              ),
            ];
          }),
        );

        // Compare objects
        const objectDiff = diff(
          objectDiffWithoutIgnoredProperties,
          standardObjectWithoutFields,
        );

        // Compare fields
        const fieldsDiff = diff(
          objectInDBFieldsWithoutDefaultFields,
          standardObjectFields,
        );

        for (const diff of objectDiff) {
          // We only handle CHANGE here as REMOVE and CREATE are handled earlier.
          if (diff.type === 'CHANGE') {
            const property = diff.path[0];

            objectsToUpdate[objectInDB.id] = {
              ...objectsToUpdate[objectInDB.id],
              [property]: diff.value,
            };
          }
        }

        for (const diff of fieldsDiff) {
          const fieldName = diff.path[0];

          if (diff.type === 'CREATE') {
            fieldsToCreate.push({
              ...standardObjectFields[fieldName],
              objectMetadataId: objectInDB.id,
            });
          }
          if (diff.type === 'REMOVE' && diff.path.length === 1) {
            fieldsToDelete.push(objectInDBFields[fieldName]);
          }
          if (diff.type === 'CHANGE') {
            const property = diff.path[diff.path.length - 1];

            fieldsToUpdate[objectInDBFields[fieldName].id] = {
              ...fieldsToUpdate[objectInDBFields[fieldName].id],
              [property]: diff.value,
            };
          }
        }
      }

      // CREATE OBJECTS
      const createdObjectMetadataCollection =
        await this.objectMetadataRepository.save(
          objectsToCreate.map((object) => ({
            ...object,
            isActive: true,
            fields: Object.values(object.fields).map((field) =>
              this.prepareFieldMetadataForCreation(field),
            ),
          })),
        );
      const identifiers = createdObjectMetadataCollection.map(
        (object) => object.id,
      );
      const createdObjects = await this.objectMetadataRepository.find({
        where: { id: In(identifiers) },
        relations: ['dataSource', 'fields'],
      });

      // UPDATE OBJECTS, this is not optimal as we are running n queries here.
      for (const [key, value] of Object.entries(objectsToUpdate)) {
        await this.objectMetadataRepository.update(key, value);
      }
      // DELETE OBJECTS
      if (objectsToDelete.length > 0) {
        await this.objectMetadataRepository.delete(
          objectsToDelete.map((object) => object.id),
        );
      }

      // CREATE FIELDS
      const createdFields = await this.fieldMetadataRepository.save(
        fieldsToCreate.map((field) =>
          this.prepareFieldMetadataForCreation(field),
        ),
      );

      // UPDATE FIELDS
      for (const [key, value] of Object.entries(fieldsToUpdate)) {
        await this.fieldMetadataRepository.update(
          key,
          convertStringifiedFieldsToJSON(value),
        );
      }
      // DELETE FIELDS
      // TODO: handle relation fields deletion. We need to delete the relation metadata first due to the DB constraint.
      const fieldsToDeleteWithoutRelationType = fieldsToDelete.filter(
        (field) => field.type !== FieldMetadataType.RELATION,
      );

      if (fieldsToDeleteWithoutRelationType.length > 0) {
        await this.fieldMetadataRepository.delete(
          fieldsToDeleteWithoutRelationType.map((field) => field.id),
        );
      }

      // Generate migrations
      await this.generateMigrationsFromSync(
        createdObjects,
        objectsToDelete,
        createdFields,
        fieldsToDelete,
        objectsInDB,
      );

      // We run syncRelationMetadata after everything to ensure that all objects and fields are
      // in the DB before creating relations.
      await this.syncRelationMetadata(
        workspaceId,
        dataSourceId,
        workspaceFeatureFlagsMap,
      );

      // Execute migrations
      await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
        workspaceId,
      );
    } catch (error) {
      console.error('Sync of standard objects failed with:', error);
    }
  }

  private prepareFieldMetadataForCreation(field: PartialFieldMetadata) {
    const convertedField = convertStringifiedFieldsToJSON(field);

    return {
      ...convertedField,
      ...(convertedField.type === FieldMetadataType.SELECT &&
      convertedField.options
        ? {
            options: this.generateUUIDForNewSelectFieldOptions(
              convertedField.options as FieldMetadataComplexOption[],
            ),
          }
        : {}),
      isActive: true,
    };
  }

  private generateUUIDForNewSelectFieldOptions(
    options: FieldMetadataComplexOption[],
  ): FieldMetadataComplexOption[] {
    return options.map((option) => ({
      ...option,
      id: uuidV4(),
    }));
  }

  private async syncRelationMetadata(
    workspaceId: string,
    dataSourceId: string,
    workspaceFeatureFlagsMap: Record<string, boolean>,
  ) {
    const objectsInDB = await this.objectMetadataRepository.find({
      where: { workspaceId, isCustom: false },
      relations: ['dataSource', 'fields'],
    });
    const objectsInDBByName = mapObjectMetadataByUniqueIdentifier<
      ObjectMetadataEntity,
      FieldMetadataEntity
    >(objectsInDB);
    const standardRelations =
      this.reflectiveMetadataFactory.createRelationMetadataCollection(
        standardObjectMetadata,
        workspaceId,
        objectsInDBByName,
        workspaceFeatureFlagsMap,
      );

    // TODO: filter out custom relations once isCustom has been added to relationMetadata table
    const relationsInDB = await this.relationMetadataRepository.find({
      where: { workspaceId },
    });

    // We filter out 'id' later because we need it to remove the relation from DB
    const relationsInDBWithoutIgnoredProperties = relationsInDB
      .map((relation) =>
        filterIgnoredProperties(relation, ['createdAt', 'updatedAt']),
      )
      .reduce((result, currentObject) => {
        const key = `${currentObject.fromObjectMetadataId}->${currentObject.fromFieldMetadataId}`;

        result[key] = currentObject;

        return result;
      }, {});

    // Compare relations
    const relationsDiff = diff(
      relationsInDBWithoutIgnoredProperties,
      standardRelations,
    );

    const relationsToCreate: RelationMetadataEntity[] = [];
    const relationsToDelete: RelationMetadataEntity[] = [];

    for (const diff of relationsDiff) {
      if (diff.type === 'CREATE') {
        relationsToCreate.push(diff.value);
      }
      if (diff.type === 'REMOVE' && diff.path[diff.path.length - 1] !== 'id') {
        relationsToDelete.push(diff.oldValue);
      }
    }

    try {
      // CREATE RELATIONS
      await this.relationMetadataRepository.save(relationsToCreate);
      // DELETE RELATIONS
      if (relationsToDelete.length > 0) {
        await this.relationMetadataRepository.delete(
          relationsToDelete.map((relation) => relation.id),
        );
      }

      await this.generateRelationMigrationsFromSync(
        relationsToCreate,
        relationsToDelete,
        objectsInDB,
      );
    } catch (error) {
      console.error('Sync of standard relations failed with:', error);
    }
  }

  private async generateMigrationsFromSync(
    objectsToCreate: ObjectMetadataEntity[],
    _objectsToDelete: ObjectMetadataEntity[],
    fieldsToCreate: FieldMetadataEntity[],
    fieldsToDelete: FieldMetadataEntity[],
    objectsInDB: ObjectMetadataEntity[],
  ) {
    const migrationsToSave: Partial<WorkspaceMigrationEntity>[] = [];

    if (objectsToCreate.length > 0) {
      objectsToCreate.map((object) => {
        const migrations = [
          {
            name: computeObjectTargetTable(object),
            action: 'create',
          } satisfies WorkspaceMigrationTableAction,
          ...Object.values(object.fields)
            .filter((field) => field.type !== FieldMetadataType.RELATION)
            .map(
              (field) =>
                ({
                  name: computeObjectTargetTable(object),
                  action: 'alter',
                  columns: this.workspaceMigrationFactory.createColumnActions(
                    WorkspaceMigrationColumnActionType.CREATE,
                    field,
                  ),
                }) satisfies WorkspaceMigrationTableAction,
            ),
        ];

        migrationsToSave.push({
          workspaceId: object.workspaceId,
          isCustom: false,
          migrations,
        });
      });
    }

    // TODO: handle object delete migrations.
    // Note: we need to delete the relation first due to the DB constraint.

    const objectsInDbById = objectsInDB.reduce(
      (result, currentObject) => {
        result[currentObject.id] = currentObject;

        return result;
      },
      {} as Record<string, ObjectMetadataEntity>,
    );

    if (fieldsToCreate.length > 0) {
      fieldsToCreate.map((field) => {
        const migrations = [
          {
            name: computeObjectTargetTable(
              objectsInDbById[field.objectMetadataId],
            ),
            action: 'alter',
            columns: this.workspaceMigrationFactory.createColumnActions(
              WorkspaceMigrationColumnActionType.CREATE,
              field,
            ),
          } satisfies WorkspaceMigrationTableAction,
        ];

        migrationsToSave.push({
          workspaceId: field.workspaceId,
          isCustom: false,
          migrations,
        });
      });
    }

    if (fieldsToDelete.length > 0) {
      fieldsToDelete.map((field) => {
        const migrations = [
          {
            name: computeObjectTargetTable(
              objectsInDbById[field.objectMetadataId],
            ),
            action: 'alter',
            columns: [
              {
                action: WorkspaceMigrationColumnActionType.DROP,
                columnName: field.name,
              },
            ],
          } satisfies WorkspaceMigrationTableAction,
        ];

        migrationsToSave.push({
          workspaceId: field.workspaceId,
          isCustom: false,
          migrations,
        });
      });
    }

    await this.workspaceMigrationRepository.save(migrationsToSave);

    // TODO: handle delete migrations
  }

  private async generateRelationMigrationsFromSync(
    relationsToCreate: RelationMetadataEntity[],
    _relationsToDelete: RelationMetadataEntity[],
    objectsInDB: ObjectMetadataEntity[],
  ) {
    const relationsMigrationsToSave: Partial<WorkspaceMigrationEntity>[] = [];

    if (relationsToCreate.length > 0) {
      relationsToCreate.map((relation) => {
        const toObjectMetadata = objectsInDB.find(
          (object) => object.id === relation.toObjectMetadataId,
        );

        const fromObjectMetadata = objectsInDB.find(
          (object) => object.id === relation.fromObjectMetadataId,
        );

        if (!toObjectMetadata) {
          throw new Error(
            `ObjectMetadata with id ${relation.toObjectMetadataId} not found`,
          );
        }

        if (!fromObjectMetadata) {
          throw new Error(
            `ObjectMetadata with id ${relation.fromObjectMetadataId} not found`,
          );
        }

        const toFieldMetadata = toObjectMetadata.fields.find(
          (field) => field.id === relation.toFieldMetadataId,
        );

        if (!toFieldMetadata) {
          throw new Error(
            `FieldMetadata with id ${relation.toFieldMetadataId} not found`,
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
                  relation.relationType === RelationMetadataType.ONE_TO_ONE,
              } satisfies WorkspaceMigrationColumnRelation,
            ],
          } satisfies WorkspaceMigrationTableAction,
        ];

        relationsMigrationsToSave.push({
          workspaceId: relation.workspaceId,
          isCustom: false,
          migrations,
        });
      });
    }

    await this.workspaceMigrationRepository.save(relationsMigrationsToSave);

    // TODO: handle delete migrations
  }
}
