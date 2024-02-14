import { Injectable, Logger } from '@nestjs/common';

import { EntityManager, In } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';
import omit from 'lodash.omit';

import { PartialFieldMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-field-metadata.interface';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/metadata/field-metadata/field-metadata.entity';
import { RelationMetadataEntity } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { FieldMetadataComplexOption } from 'src/metadata/field-metadata/dtos/options.input';
import { WorkspaceSyncStorage } from 'src/workspace/workspace-sync-metadata/storage/workspace-sync.storage';

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
    const oldFieldMetadataCollection = await fieldMetadataRepository.find({
      where: {
        id: In(storage.fieldMetadataUpdateCollection.map((field) => field.id)),
      },
    });
    const updatedFieldMetadataCollection = await fieldMetadataRepository.save(
      storage.fieldMetadataUpdateCollection as DeepPartial<FieldMetadataEntity>[],
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
      updatedFieldMetadataCollection: oldFieldMetadataCollection.map(
        (oldFieldMetadata) => {
          const alteredFieldMetadata = updatedFieldMetadataCollection.find(
            (field) => field.id === oldFieldMetadata.id,
          );

          if (!alteredFieldMetadata) {
            throw new Error(
              `Field ${oldFieldMetadata.id} not found in updatedFieldMetadataCollection`,
            );
          }

          return {
            current: oldFieldMetadata as FieldMetadataEntity,
            // TypeORM save method doesn't return the whole entity...
            // https://github.com/typeorm/typeorm/issues/3490
            altered: {
              ...oldFieldMetadata,
              ...alteredFieldMetadata,
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
    };
  }
}
