import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import diff from 'microdiff';
import { DataSource, EntityManager, Repository } from 'typeorm';
import camelCase from 'lodash.camelcase';

import { PartialFieldMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-field-metadata.interface';
import { PartialObjectMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-object-metadata.interface';
import {
  MappedObjectMetadata,
  MappedObjectMetadataEntity,
} from 'src/workspace/workspace-sync-metadata/interfaces/mapped-metadata.interface';
import { WorkspaceSyncContext } from 'src/workspace/workspace-sync-metadata/interfaces/workspace-sync-context.interface';
import { ComparatorAction } from 'src/workspace/workspace-sync-metadata/interfaces/comparator.interface';
import { FeatureFlagMap } from 'src/core/feature-flag/interfaces/feature-flag-map.interface';

import { FieldMetadataEntity } from 'src/metadata/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import {
  RelationMetadataEntity,
  RelationMetadataType,
} from 'src/metadata/relation-metadata/relation-metadata.entity';
import {
  filterIgnoredProperties,
  mapObjectMetadataByUniqueIdentifier,
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
import { ReflectiveMetadataFactory } from 'src/workspace/workspace-sync-metadata/factories/reflective-metadata.factory';
import { computeObjectTargetTable } from 'src/workspace/utils/compute-object-target-table.util';
// import { Transaction } from 'src/database/decorators/transaction.decorator';
// import { TransactionManager } from 'src/database/decorators/transaction-manager.decorator';
import { StandardObjectFactory } from 'src/workspace/workspace-sync-metadata/factories/standard-object.factory';
import { StandardRelationFactory } from 'src/workspace/workspace-sync-metadata/factories/standard-relation.factory';
import { FeatureFlagFactory } from 'src/workspace/workspace-sync-metadata/factories/feature-flags.factory';
import { WorkspaceObjectComparatorService } from 'src/workspace/workspace-sync-metadata/services/workspace-object-comparator.service';
import { WorkspaceFieldComparatorService } from 'src/workspace/workspace-sync-metadata/services/workspace-field-comparator.service';
import { WorkspaceMetadataUpdaterService } from 'src/workspace/workspace-sync-metadata/services/workspace-metadata-updater.service';
import { WorkspaceSyncFactory } from 'src/workspace/workspace-sync-metadata/factories/workspace-sync.factory';
import { WorkspaceRelationComparatorService } from 'src/workspace/workspace-sync-metadata/services/workspace-relation-comparator.service';

@Injectable()
export class WorkspaceSyncMetadataService {
  constructor(
    private readonly workspaceMigrationFactory: WorkspaceMigrationFactory,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly reflectiveMetadataFactory: ReflectiveMetadataFactory,
    private readonly featureFlagFactory: FeatureFlagFactory,
    private readonly standardObjectFactory: StandardObjectFactory,
    private readonly standardRelationFactory: StandardRelationFactory,
    private readonly workspaceObjectComparatorService: WorkspaceObjectComparatorService,
    private readonly workspaceFieldComparatorService: WorkspaceFieldComparatorService,
    private readonly workspaceRelationComparatorService: WorkspaceRelationComparatorService,
    private readonly workspaceMetadataUpdaterService: WorkspaceMetadataUpdaterService,
    private readonly workspaceSyncFactory: WorkspaceSyncFactory,

    @InjectDataSource('metadata')
    private readonly metadataDataSource: DataSource,

    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(RelationMetadataEntity, 'metadata')
    private readonly relationMetadataRepository: Repository<RelationMetadataEntity>,
    @InjectRepository(WorkspaceMigrationEntity, 'metadata')
    private readonly workspaceMigrationRepository: Repository<WorkspaceMigrationEntity>,
  ) {}

  /**
   *
   * Sync all standard objects and fields metadata for a given workspace and data source
   * This will update the metadata if it has changed and generate migrations based on the diff.
   *
   * @param dataSourceId
   * @param workspaceId
   */
  // @Transaction()
  public async syncStandardObjectsAndFieldsMetadata(
    context: WorkspaceSyncContext,
    // // Maybe we can find a better way to inject the manager here
    // @TransactionManager() manager?: EntityManager,
  ) {
    const metadataQueryRunner = this.metadataDataSource.createQueryRunner();

    await metadataQueryRunner.connect();
    await metadataQueryRunner.startTransaction();

    const manager = metadataQueryRunner.manager;

    if (!manager) {
      throw new Error('EntityManager is undefined');
    }

    try {
      const objectMetadataRepository =
        manager.getRepository(ObjectMetadataEntity);

      // Retrieve feature flags
      const workspaceFeatureFlagsMap =
        await this.featureFlagFactory.create(context);

      // Retrieve object metadata collection from DB
      const originalObjectMetadataCollection =
        await objectMetadataRepository.find({
          where: { workspaceId: context.workspaceId, isCustom: false },
          relations: ['dataSource', 'fields'],
        });

      // Create map of object metadata & field metadata by unique identifier
      const originalObjectMetadataMap = mapObjectMetadataByUniqueIdentifier<
        ObjectMetadataEntity,
        FieldMetadataEntity
      >(originalObjectMetadataCollection);

      await this.syncObjectMetadataCollection(
        manager,
        context,
        originalObjectMetadataCollection,
        originalObjectMetadataMap,
        workspaceFeatureFlagsMap,
      );

      await metadataQueryRunner.commitTransaction();

      await this.syncRelationMetadataCollection(
        manager,
        context,
        originalObjectMetadataCollection,
        originalObjectMetadataMap,
        workspaceFeatureFlagsMap,
      );

      // // We run syncRelationMetadata after everything to ensure that all objects and fields are
      // // in the DB before creating relations.
      // await this.syncRelationMetadata(
      //   context.workspaceId,
      //   context.dataSourceId,
      //   workspaceFeatureFlagsMap,
      // );

      // // Execute migrations
      // await this.workspaceMigrationRunnerService.executeMigrationFromPendingMigrations(
      //   context.workspaceId,
      // );
    } catch (error) {
      console.error('Sync of standard objects failed with:', error);
    }
  }

  private async syncObjectMetadataCollection(
    manager: EntityManager,
    context: WorkspaceSyncContext,
    originalObjectMetadataCollection: ObjectMetadataEntity[],
    originalObjectMetadataMap: Record<string, MappedObjectMetadataEntity>,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ) {
    console.log('1');
    const workspaceMigrationRepository = manager.getRepository(
      WorkspaceMigrationEntity,
    );

    console.log('2');
    // Create standard object metadata collection
    const standardObjectMetadataCollection =
      await this.standardObjectFactory.create(
        context,
        workspaceFeatureFlagsMap,
      );

    console.log('3');
    // Create map of standard object metadata by unique identifier
    const standardObjectMetadataMap = mapObjectMetadataByUniqueIdentifier<
      PartialObjectMetadata,
      PartialFieldMetadata
    >(standardObjectMetadataCollection);

    // Store object metadata by action
    const objectMetadataCreateCollection: MappedObjectMetadata[] = [];
    const objectMetadataUpdateCollection: Partial<ObjectMetadataEntity>[] = [];
    const objectMetadataDeleteCollection =
      originalObjectMetadataCollection.filter(
        (originalObjectMetadata) =>
          !standardObjectMetadataMap[originalObjectMetadata.nameSingular],
      );

    // Store field metadata by action
    const fieldMetadataCreateCollection: PartialFieldMetadata[] = [];
    const fieldMetadataUpdateCollection: Partial<FieldMetadataEntity>[] = [];
    const fieldMetadataDeleteCollection: FieldMetadataEntity[] = [];

    console.log('4');
    // Loop over all standard objects and compare them with the objects in DB
    for (const standardObjectName in standardObjectMetadataMap) {
      const originalObjectMetadata =
        originalObjectMetadataMap[standardObjectName];
      const standardObjectMetadata =
        standardObjectMetadataMap[standardObjectName];

      /**
       * COMPARE OBJECT METADATA
       */
      const objectComparatorResult =
        this.workspaceObjectComparatorService.compare(
          originalObjectMetadata,
          standardObjectMetadata,
        );

      if (objectComparatorResult.action === ComparatorAction.CREATE) {
        objectMetadataCreateCollection.push(standardObjectMetadata);
        continue;
      }

      if (objectComparatorResult.action === ComparatorAction.UPDATE) {
        objectMetadataUpdateCollection.push(objectComparatorResult.object);
      }

      /**
       * COMPARE FIELD METADATA
       */
      const fieldComparatorResults =
        this.workspaceFieldComparatorService.compare(
          originalObjectMetadata,
          standardObjectMetadata,
        );

      for (const fieldComparatorResult of fieldComparatorResults) {
        switch (fieldComparatorResult.action) {
          case ComparatorAction.CREATE: {
            fieldMetadataCreateCollection.push(fieldComparatorResult.object);
            break;
          }
          case ComparatorAction.UPDATE: {
            fieldMetadataUpdateCollection.push(fieldComparatorResult.object);
            break;
          }
          case ComparatorAction.DELETE: {
            fieldMetadataDeleteCollection.push(fieldComparatorResult.object);
            break;
          }
        }
      }
    }

    console.log('5');

    // Apply changes to DB
    const metadataUpdaterResult =
      await this.workspaceMetadataUpdaterService.update(manager, {
        objectMetadataCreateCollection,
        objectMetadataUpdateCollection,
        objectMetadataDeleteCollection,
        fieldMetadataCreateCollection,
        fieldMetadataUpdateCollection,
        fieldMetadataDeleteCollection,
      });

    console.log('6');

    // Create migrations
    const workspaceObjectMigrations =
      await this.workspaceSyncFactory.createObjectMigration(
        originalObjectMetadataCollection,
        metadataUpdaterResult.createdObjectMetadataCollection,
        objectMetadataDeleteCollection,
        metadataUpdaterResult.createdFieldMetadataCollection,
        fieldMetadataDeleteCollection,
      );

    console.log('7');

    // Save migrations into DB
    await workspaceMigrationRepository.save(workspaceObjectMigrations);
  }

  private async syncRelationMetadataCollection(
    manager: EntityManager,
    context: WorkspaceSyncContext,
    originalObjectMetadataCollection: ObjectMetadataEntity[],
    originalObjectMetadataMap: Record<string, MappedObjectMetadataEntity>,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ) {
    const relationMetadataRepository = manager.getRepository(
      RelationMetadataEntity,
    );

    // const relationMetadataCreateCollection: RelationMetadataEntity[] = [];
    // const relationMetadataDeleteCollection: RelationMetadataEntity[] = [];

    // Retrieve relation metadata collection from DB
    // TODO: filter out custom relations once isCustom has been added to relationMetadata table
    const originalRelationMetadataCollection =
      await relationMetadataRepository.find({
        where: { workspaceId: context.workspaceId },
      });

    // Create standard relation metadata collection
    const standardRelationMetadataCollection =
      this.standardRelationFactory.create(
        context,
        originalObjectMetadataMap,
        workspaceFeatureFlagsMap,
      );

    this.workspaceRelationComparatorService.compare(
      originalRelationMetadataCollection,
      standardRelationMetadataCollection,
    );
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
