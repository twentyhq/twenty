import { Injectable, Logger } from '@nestjs/common';

import { FieldMetadataType } from 'twenty-shared/types';
import { type EntityManager } from 'typeorm';

import { WorkspaceMigrationBuilderAction } from 'src/engine/workspace-manager/workspace-migration-builder/interfaces/workspace-migration-builder-action.interface';
import {
  ComparatorAction,
  type FieldRelationComparatorResult,
} from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';
import { type WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { WorkspaceMigrationFieldRelationFactory } from 'src/engine/workspace-manager/workspace-migration-builder/factories/workspace-migration-field-relation.factory';
import {
  type FieldMetadataUpdate,
  WorkspaceMigrationFieldFactory,
} from 'src/engine/workspace-manager/workspace-migration-builder/factories/workspace-migration-field.factory';
import { WorkspaceFieldRelationComparator } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/workspace-field-relation.comparator';
import { StandardFieldRelationFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-field-relation.factory';
import { WorkspaceMetadataUpdaterService } from 'src/engine/workspace-manager/workspace-sync-metadata/services/workspace-metadata-updater.service';
import { standardObjectMetadataDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects';
import { type WorkspaceSyncStorage } from 'src/engine/workspace-manager/workspace-sync-metadata/storage/workspace-sync.storage';
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
    let originalObjectMetadataCollection =
      await this.getOriginalObjectMetadataCollection(context, manager);

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
    const metadataFieldUpdaterResult =
      await this.workspaceMetadataUpdaterService.updateFieldRelationMetadata(
        manager,
        storage,
      );

    this.logger.log('Generating migrations');

    const updateFieldWorkspaceMigrations =
      await this.workspaceMigrationFieldFactory.create(
        originalObjectMetadataCollection,
        [
          // Both of them are update as field where created in WorkspaceSyncFieldMetadataService
          ...metadataFieldUpdaterResult.createdFieldRelationMetadataCollection,
          ...metadataFieldUpdaterResult.updatedFieldRelationMetadataCollection,
          ...metadataFieldUpdaterResult.deletedFieldRelationMetadataCollection,
        ] as FieldMetadataUpdate[],
        WorkspaceMigrationBuilderAction.UPDATE,
      );

    // Resync updated object metadata
    originalObjectMetadataCollection =
      await this.getOriginalObjectMetadataCollection(context, manager);

    const deletedFieldRelationMetadataCollection =
      metadataFieldUpdaterResult.deletedFieldRelationMetadataCollection.map(
        (field) => field.altered,
      );

    const deleteFieldRelationWorkspaceMigrations =
      await this.workspaceMigrationFieldRelationFactory.create(
        originalObjectMetadataCollection,
        deletedFieldRelationMetadataCollection,
        WorkspaceMigrationBuilderAction.DELETE,
      );

    const createdFieldRelationMetadataCollection =
      metadataFieldUpdaterResult.createdFieldRelationMetadataCollection.map(
        (field) => field.altered,
      );

    const createFieldRelationWorkspaceMigrations =
      await this.workspaceMigrationFieldRelationFactory.create(
        originalObjectMetadataCollection,
        createdFieldRelationMetadataCollection,
        WorkspaceMigrationBuilderAction.CREATE,
      );

    const updateFieldRelationWorkspaceMigrations =
      await this.workspaceMigrationFieldRelationFactory.create(
        originalObjectMetadataCollection,
        metadataFieldUpdaterResult.updatedFieldRelationMetadataCollection,
        WorkspaceMigrationBuilderAction.UPDATE,
      );

    // TODO: Should we handle deletion of relation here?

    this.logger.log('Saving migrations');

    return [
      ...updateFieldWorkspaceMigrations,
      ...deleteFieldRelationWorkspaceMigrations,
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
    // Create map of original and standard object metadata by standard ids
    const originalObjectMetadataMap = mapObjectMetadataByUniqueIdentifier(
      originalObjectMetadataCollection,
    );

    // Loop over all standard objects and compare them with the objects in DB
    for (const standardObjectMetadataDefinition of standardObjectMetadataDefinitions) {
      const workspaceEntityMetadataArgs = metadataArgsStorage.filterEntities(
        standardObjectMetadataDefinition,
      );

      if (!workspaceEntityMetadataArgs) {
        continue;
      }

      const standardFieldMetadataRelationCollection =
        this.standardFieldRelationFactory.computeRelationFieldsForStandardObject(
          standardObjectMetadataDefinition,
          context,
          originalObjectMetadataMapByName,
        );

      const originalObjectMetadata =
        originalObjectMetadataMap[workspaceEntityMetadataArgs.standardId];

      const originalFieldRelationMetadataCollection =
        (originalObjectMetadata?.fields.filter(
          (field) =>
            field.type === FieldMetadataType.RELATION ||
            field.type === FieldMetadataType.MORPH_RELATION,
        ) ?? []) as FieldMetadataEntity<
          FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
        >[];

      if (originalFieldRelationMetadataCollection.length === 0) {
        continue;
      }

      const fieldComparatorResults =
        this.workspaceFieldRelationComparator.compare(
          originalFieldRelationMetadataCollection,
          standardFieldMetadataRelationCollection,
        );

      this.storeComparatorResults(fieldComparatorResults, storage);
    }
  }

  private async synchronizeCustomObjectRelationFields(
    _context: WorkspaceSyncContext,
    customObjectMetadataCollection: ObjectMetadataEntity[],
    originalObjectMetadataMapByName: Record<string, ObjectMetadataEntity>,
    storage: WorkspaceSyncStorage,
  ): Promise<void> {
    // Loop over all custom objects from the DB and compare their fields with standard fields
    for (const customObjectMetadata of customObjectMetadataCollection) {
      const originalFieldRelationMetadataCollection =
        (customObjectMetadata.fields.filter(
          (field) =>
            field.type === FieldMetadataType.RELATION ||
            field.type === FieldMetadataType.MORPH_RELATION,
        ) ?? []) as FieldMetadataEntity<
          FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
        >[];

      const customFieldMetadataRelationCollection =
        this.standardFieldRelationFactory.computeRelationFieldsForCustomObject(
          customObjectMetadata,
          originalObjectMetadataMapByName,
        );

      const fieldComparatorResults =
        this.workspaceFieldRelationComparator.compare(
          originalFieldRelationMetadataCollection,
          customFieldMetadataRelationCollection,
        );

      this.storeComparatorResults(fieldComparatorResults, storage);
    }
  }

  private async getOriginalObjectMetadataCollection(
    context: WorkspaceSyncContext,
    manager: EntityManager,
  ): Promise<ObjectMetadataEntity[]> {
    const objectMetadataRepository =
      manager.getRepository(ObjectMetadataEntity);

    const originalObjectMetadataCollection =
      await objectMetadataRepository.find({
        where: {
          workspaceId: context.workspaceId,
        },
        relations: ['dataSource', 'fields'],
      });

    return originalObjectMetadataCollection;
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
