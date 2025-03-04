import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared';
import { EntityManager, In } from 'typeorm';

import { WorkspaceMigrationBuilderAction } from 'src/engine/workspace-manager/workspace-migration-builder/interfaces/workspace-migration-builder-action.interface';
import {
  ComparatorAction,
  FieldRelationComparatorResult,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';
import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { WorkspaceMigrationFieldRelationFactory } from 'src/engine/workspace-manager/workspace-migration-builder/factories/workspace-migration-field-relation.factory';
import { WorkspaceMigrationFieldFactory } from 'src/engine/workspace-manager/workspace-migration-builder/factories/workspace-migration-field.factory';
import { WorkspaceFieldRelationComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-field-relation.comparator';
import { StandardFieldRelationFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-field-relation.factory';
import { WorkspaceMetadataUpdaterService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-metadata-updater.service';
import { standardObjectMetadataDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects';
import { WorkspaceSyncStorage } from 'src/engine/workspace-manager/workspace-sync-metadata/storage/workspace-sync.storage';
import { mapObjectMetadataByUniqueIdentifier } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/sync-metadata.util';

@Injectable()
export class WorkspaceSyncFieldMetadataRelationService {
  private readonly logger = new Logger(
    WorkspaceSyncFieldMetadataRelationService.name,
  );

  constructor(
    private readonly standardFieldRelationFactory: StandardFieldRelationFactory,
    private readonly workspaceFieldRelationComparator: WorkspaceFieldRelationComparator,
    private readonly workspaceMetadataUpdaterService: WorkspaceMetadataUpdaterService,
    private readonly workspaceMigrationFieldFactory: WorkspaceMigrationFieldFactory,
    private readonly workspaceMigrationFieldRelationFactory: WorkspaceMigrationFieldRelationFactory,
  ) {}

  async synchronize(
    context: WorkspaceSyncContext,
    manager: EntityManager,
    storage: WorkspaceSyncStorage,
  ): Promise<Partial<WorkspaceMigrationEntity>[]> {
    const objectMetadataRepository =
      manager.getRepository(ObjectMetadataEntity);
    const fieldMetadataRepository = manager.getRepository(FieldMetadataEntity);

    // Retrieve object metadata collection from DB
    const originalObjectMetadataCollection =
      await objectMetadataRepository.find({
        where: {
          workspaceId: context.workspaceId,
          fields: {
            type: FieldMetadataType.RELATION,
          },
        },
        relations: ['dataSource', 'fields'],
      });
    const customObjectMetadataCollection =
      originalObjectMetadataCollection.filter(
        (objectMetadata) => objectMetadata.isCustom,
      );

    // Create map of object metadata & field metadata by unique identifier
    const originalObjectMetadataMapByName = mapObjectMetadataByUniqueIdentifier(
      originalObjectMetadataCollection,
      // Relation are based on the singular name
      (objectMetadata) => objectMetadata.nameSingular,
    );

    await this.synchronizeStandardObjectRelationFields(
      context,
      originalObjectMetadataCollection,
      originalObjectMetadataMapByName,
      storage,
    );

    await this.synchronizeCustomObjectRelationFields(
      context,
      customObjectMetadataCollection,
      originalObjectMetadataMapByName,
      storage,
    );

    this.logger.log('Updating workspace metadata');

    // Save field metadata to DB
    const metadataFieldRelationUpdaterResult =
      await this.workspaceMetadataUpdaterService.updateFieldRelationMetadata(
        manager,
        storage,
      );

    this.logger.log('Generating migrations');

    const updateFieldWorkspaceMigrations =
      await this.workspaceMigrationFieldFactory.create(
        originalObjectMetadataCollection,
        metadataFieldRelationUpdaterResult.updatedFieldMetadataCollection,
        WorkspaceMigrationBuilderAction.UPDATE,
      );

    const createFieldMetadataCollection = (await fieldMetadataRepository.find({
      where: {
        id: In(
          storage.fieldRelationMetadataCreateCollection.map(
            (field) => field.id,
          ),
        ),
        workspaceId: context.workspaceId,
        type: FieldMetadataType.RELATION,
      },
    })) as FieldMetadataEntity<FieldMetadataType.RELATION>[];

    const createFieldRelationWorkspaceMigrations =
      await this.workspaceMigrationFieldRelationFactory.create(
        originalObjectMetadataCollection,
        createFieldMetadataCollection,
        WorkspaceMigrationBuilderAction.CREATE,
      );

    const updateFieldMetadataCollection = (await fieldMetadataRepository.find({
      where: {
        id: In(
          storage.fieldRelationMetadataUpdateCollection.map(
            (field) => field.id,
          ),
        ),
        workspaceId: context.workspaceId,
        type: FieldMetadataType.RELATION,
      },
    })) as FieldMetadataEntity<FieldMetadataType.RELATION>[];

    const updateFieldRelationWorkspaceMigrations =
      await this.workspaceMigrationFieldRelationFactory.create(
        originalObjectMetadataCollection,
        updateFieldMetadataCollection,
        WorkspaceMigrationBuilderAction.UPDATE,
      );

    this.logger.log('Saving migrations');

    return [
      ...updateFieldWorkspaceMigrations,
      ...createFieldRelationWorkspaceMigrations,
      ...updateFieldRelationWorkspaceMigrations,
    ];
  }

  private async synchronizeStandardObjectRelationFields(
    context: WorkspaceSyncContext,
    originalObjectMetadataCollection: ObjectMetadataEntity[],
    originalObjectMetadataMapByName: Record<string, ObjectMetadataEntity>,
    storage: WorkspaceSyncStorage,
  ): Promise<void> {
    // Create standard field metadata map
    const standardFieldMetadataRelationCollection =
      this.standardFieldRelationFactory.createFieldRelationForStandardObject(
        standardObjectMetadataDefinitions,
        context,
        originalObjectMetadataMapByName,
      );

    // Create map of original and standard object metadata by standard ids
    const originalObjectMetadataMap = mapObjectMetadataByUniqueIdentifier(
      originalObjectMetadataCollection,
    );

    // Loop over all standard objects and compare them with the objects in DB
    for (const [
      standardObjectId,
      standardFieldMetadataCollection,
    ] of standardFieldMetadataRelationCollection) {
      const originalObjectMetadata =
        originalObjectMetadataMap[standardObjectId];

      const originalFieldRelationMetadataCollection =
        (originalObjectMetadata?.fields.filter(
          (field) => field.type === FieldMetadataType.RELATION,
        ) ?? []) as FieldMetadataEntity<FieldMetadataType.RELATION>[];

      if (originalFieldRelationMetadataCollection.length === 0) {
        continue;
      }

      const fieldComparatorResults =
        this.workspaceFieldRelationComparator.compare(
          originalFieldRelationMetadataCollection,
          standardFieldMetadataCollection,
        );

      this.storeComparatorResults(fieldComparatorResults, storage);
    }
  }

  private async synchronizeCustomObjectRelationFields(
    context: WorkspaceSyncContext,
    customObjectMetadataCollection: ObjectMetadataEntity[],
    originalObjectMetadataMapByName: Record<string, ObjectMetadataEntity>,
    storage: WorkspaceSyncStorage,
  ): Promise<void> {
    // Create standard field metadata collection
    const customFieldMetadataRelationCollection =
      this.standardFieldRelationFactory.createFieldRelationForCustomObject(
        customObjectMetadataCollection.map((objectMetadata) => ({
          object: objectMetadata,
          metadata: CustomWorkspaceEntity,
        })),
        context,
        originalObjectMetadataMapByName,
      );

    // Loop over all custom objects from the DB and compare their fields with standard fields
    for (const customObjectMetadata of customObjectMetadataCollection) {
      /**
       * COMPARE FIELD METADATA
       */
      const fieldComparatorResults =
        this.workspaceFieldRelationComparator.compare(
          customObjectMetadata.fields as FieldMetadataEntity<FieldMetadataType.RELATION>[],
          customFieldMetadataRelationCollection,
        );

      this.storeComparatorResults(fieldComparatorResults, storage);
    }
  }

  private storeComparatorResults(
    fieldComparatorResults: FieldRelationComparatorResult[],
    storage: WorkspaceSyncStorage,
  ): void {
    for (const fieldComparatorResult of fieldComparatorResults) {
      switch (fieldComparatorResult.action) {
        case ComparatorAction.CREATE: {
          storage.addCreateFieldRelationMetadata(fieldComparatorResult.object);
          break;
        }
        case ComparatorAction.UPDATE: {
          storage.addUpdateFieldRelationMetadata(fieldComparatorResult.object);
          break;
        }
        case ComparatorAction.DELETE: {
          storage.addDeleteFieldRelationMetadata(fieldComparatorResult.object);
          break;
        }
      }
    }
  }
}
