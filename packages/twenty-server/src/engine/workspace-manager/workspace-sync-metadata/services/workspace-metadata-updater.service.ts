import { Injectable, Logger } from '@nestjs/common';

import { EntityManager, In } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';
import omit from 'lodash.omit';

import { PartialFieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-field-metadata.interface';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { WorkspaceSyncStorage } from 'src/engine/workspace-manager/workspace-sync-metadata/storage/workspace-sync.storage';

@Injectable()
export class WorkspaceMetadataUpdaterService {
  private readonly logger = new Logger(WorkspaceMetadataUpdaterService.name);

  async updateObjectMetadata(
    manager: EntityManager,
    storage: WorkspaceSyncStorage,
  ): Promise<{
    createdObjectMetadataCollection: ObjectMetadataEntity[];
    updatedObjectMetadataCollection: ObjectMetadataEntity[];
  }> {
    const objectMetadataRepository =
      manager.getRepository(ObjectMetadataEntity);

    /**
     * Create object metadata
     */
    const createdPartialObjectMetadataCollection =
      await objectMetadataRepository.save(
        storage.objectMetadataCreateCollection.map((objectMetadata) => ({
          ...objectMetadata,
          isActive: true,
          fields: objectMetadata.fields.map((field) =>
            this.prepareFieldMetadataForCreation(field),
          ),
        })) as DeepPartial<ObjectMetadataEntity>[],
      );
    const identifiers = createdPartialObjectMetadataCollection.map(
      (object) => object.id,
    );
    const createdObjectMetadataCollection = await manager.find(
      ObjectMetadataEntity,
      {
        where: { id: In(identifiers) },
        relations: ['dataSource', 'fields'],
      },
    );

    /**
     * Update object metadata
     */
    const updatedObjectMetadataCollection = await objectMetadataRepository.save(
      storage.objectMetadataUpdateCollection.map((objectMetadata) =>
        omit(objectMetadata, ['fields']),
      ),
    );

    /**
     * Delete object metadata
     */
    if (storage.objectMetadataDeleteCollection.length > 0) {
      await objectMetadataRepository.delete(
        storage.objectMetadataDeleteCollection.map((object) => object.id),
      );
    }

    return {
      createdObjectMetadataCollection,
      updatedObjectMetadataCollection,
    };
  }

  /**
   * TODO: Refactor this
   */
  private prepareFieldMetadataForCreation(field: PartialFieldMetadata) {
    return {
      ...field,
      ...(field.type === FieldMetadataType.SELECT && field.options
        ? {
            options: this.generateUUIDForNewSelectFieldOptions(
              field.options as FieldMetadataComplexOption[],
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

  async updateFieldMetadata(
    manager: EntityManager,
    storage: WorkspaceSyncStorage,
  ): Promise<{
    createdFieldMetadataCollection: FieldMetadataEntity[];
    updatedFieldMetadataCollection: {
      current: FieldMetadataEntity;
      altered: FieldMetadataEntity;
    }[];
  }> {
    const fieldMetadataRepository = manager.getRepository(FieldMetadataEntity);

    /**
     * Create field metadata
     */
    const createdFieldMetadataCollection = await fieldMetadataRepository.save(
      storage.fieldMetadataCreateCollection.map((field) =>
        this.prepareFieldMetadataForCreation(field),
      ) as DeepPartial<FieldMetadataEntity>[],
    );

    /**
     * Update field metadata
     */
    const oldFieldMetadataCollection = await fieldMetadataRepository.findBy({
      id: In(storage.fieldMetadataUpdateCollection.map((field) => field.id)),
    });
    // Pre-process old collection into a mapping for quick access
    const oldFieldMetadataMap = new Map(
      oldFieldMetadataCollection.map((field) => [field.id, field]),
    );
    // Combine old and new field metadata to get whole updated entities
    const fieldMetadataUpdateCollection =
      storage.fieldMetadataUpdateCollection.map((updateFieldMetadata) => {
        const oldFieldMetadata = oldFieldMetadataMap.get(
          updateFieldMetadata.id,
        );

        if (!oldFieldMetadata) {
          throw new Error(`
            Field ${updateFieldMetadata.id} not found in oldFieldMetadataCollection`);
        }

        // TypeORM 😢
        // If we didn't provide the old value, it will be set to null fields that are not in the updateFieldMetadata
        // and override the old value with null in the DB.
        // Also save method doesn't return the whole entity if you give a partial one.
        // https://github.com/typeorm/typeorm/issues/3490
        // To avoid calling update in a for loop, we did this hack.
        return {
          ...omit(oldFieldMetadata, ['objectMetadataId', 'workspaceId']),
          ...omit(updateFieldMetadata, ['objectMetadataId', 'workspaceId']),
          options: updateFieldMetadata.options ?? oldFieldMetadata.options,
        };
      });

    const updatedFieldMetadataCollection = await fieldMetadataRepository.save(
      fieldMetadataUpdateCollection,
    );

    /**
     * Delete field metadata
     */
    // TODO: handle relation fields deletion. We need to delete the relation metadata first due to the DB constraint.
    const fieldMetadataDeleteCollectionWithoutRelationType =
      storage.fieldMetadataDeleteCollection.filter(
        (field) => field.type !== FieldMetadataType.RELATION,
      );

    if (fieldMetadataDeleteCollectionWithoutRelationType.length > 0) {
      await fieldMetadataRepository.delete(
        fieldMetadataDeleteCollectionWithoutRelationType.map(
          (field) => field.id,
        ),
      );
    }

    return {
      createdFieldMetadataCollection:
        createdFieldMetadataCollection as FieldMetadataEntity[],
      updatedFieldMetadataCollection: updatedFieldMetadataCollection.map(
        (alteredFieldMetadata) => {
          const oldFieldMetadata = oldFieldMetadataMap.get(
            alteredFieldMetadata.id,
          );

          if (!oldFieldMetadata) {
            throw new Error(`
              Field ${alteredFieldMetadata.id} not found in oldFieldMetadataCollection
            `);
          }

          return {
            current: oldFieldMetadata as FieldMetadataEntity,
            altered: {
              ...alteredFieldMetadata,
              objectMetadataId: oldFieldMetadata.objectMetadataId,
              workspaceId: oldFieldMetadata.workspaceId,
            } as FieldMetadataEntity,
          };
        },
      ),
    };
  }

  async updateRelationMetadata(
    manager: EntityManager,
    storage: WorkspaceSyncStorage,
  ): Promise<{
    createdRelationMetadataCollection: RelationMetadataEntity[];
    updatedRelationMetadataCollection: RelationMetadataEntity[];
  }> {
    const relationMetadataRepository = manager.getRepository(
      RelationMetadataEntity,
    );
    const fieldMetadataRepository = manager.getRepository(FieldMetadataEntity);

    /**
     * Create relation metadata
     */
    const createdRelationMetadataCollection =
      await relationMetadataRepository.save(
        storage.relationMetadataCreateCollection,
      );

    /**
     * Update relation metadata
     */

    const updatedRelationMetadataCollection =
      await relationMetadataRepository.save(
        storage.relationMetadataUpdateCollection,
      );

    /**
     * Delete relation metadata
     */
    if (storage.relationMetadataDeleteCollection.length > 0) {
      await relationMetadataRepository.delete(
        storage.relationMetadataDeleteCollection.map(
          (relationMetadata) => relationMetadata.id,
        ),
      );
    }

    /**
     * Delete related field metadata
     */
    const fieldMetadataDeleteCollectionOnlyRelation =
      storage.fieldMetadataDeleteCollection.filter(
        (field) => field.type === FieldMetadataType.RELATION,
      );

    if (fieldMetadataDeleteCollectionOnlyRelation.length > 0) {
      await fieldMetadataRepository.delete(
        fieldMetadataDeleteCollectionOnlyRelation.map((field) => field.id),
      );
    }

    return {
      createdRelationMetadataCollection,
      updatedRelationMetadataCollection,
    };
  }
}
