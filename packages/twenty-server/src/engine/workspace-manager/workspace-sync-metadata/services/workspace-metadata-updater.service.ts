import { Injectable } from '@nestjs/common';

import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  compositeTypeDefinitions,
} from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';
import {
  type EntityManager,
  type EntityTarget,
  type FindOptionsWhere,
  In,
  type ObjectLiteral,
  type Repository,
} from 'typeorm';
import { type DeepPartial } from 'typeorm/common/DeepPartial';
import { v4 as uuidV4 } from 'uuid';

import { type PartialFieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-field-metadata.interface';
import { type PartialIndexMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/partial-index-metadata.interface';
import { type UpdaterOptions } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/updater-options.interface';

import { isFieldMetadataRelationOrMorphRelation } from 'src/engine/api/graphql/workspace-schema-builder/utils/is-field-metadata-relation-or-morph-relation.utils';
import { type FieldMetadataComplexOption } from 'src/engine/metadata-modules/field-metadata/dtos/options.input';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type CompositeFieldMetadataType } from 'src/engine/metadata-modules/workspace-migration/factories/composite-column-action.factory';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';
import { type FieldMetadataUpdate } from 'src/engine/workspace-manager/workspace-migration-builder/factories/workspace-migration-field.factory';
import { type ObjectMetadataUpdate } from 'src/engine/workspace-manager/workspace-migration-builder/factories/workspace-migration-object.factory';
import { type WorkspaceSyncStorage } from 'src/engine/workspace-manager/workspace-sync-metadata/storage/workspace-sync.storage';

@Injectable()
export class WorkspaceMetadataUpdaterService {
  constructor() {}

  async updateObjectMetadata(
    manager: EntityManager,
    storage: WorkspaceSyncStorage,
    options?: UpdaterOptions,
  ): Promise<{
    createdObjectMetadataCollection: ObjectMetadataEntity[];
    updatedObjectMetadataCollection: ObjectMetadataUpdate[];
  }> {
    const objectMetadataRepository =
      manager.getRepository(ObjectMetadataEntity);
    let createdObjectMetadataCollection: ObjectMetadataEntity[] = [];
    let updatedObjectMetadataCollection: ObjectMetadataUpdate[] = [];

    /**
     * Create object metadata
     */
    if (!options || options.actions.includes('create')) {
      const createdPartialObjectMetadataCollection =
        await objectMetadataRepository.save(
          storage.objectMetadataCreateCollection.map((objectMetadata) => ({
            ...objectMetadata,
            isActive: true,
          })) as DeepPartial<ObjectMetadataEntity>[],
        );
      const identifiers = createdPartialObjectMetadataCollection.map(
        (object) => object.id,
      );

      createdObjectMetadataCollection = await manager.find(
        ObjectMetadataEntity,
        {
          where: { id: In(identifiers) },
          relations: ['dataSource', 'fields'],
        },
      );
    }

    /**
     * Update object metadata
     */
    if (!options || options.actions.includes('update')) {
      updatedObjectMetadataCollection = await this.updateEntities(
        manager,
        ObjectMetadataEntity,
        storage.objectMetadataUpdateCollection,
        [
          'fields',
          'dataSourceId',
          'workspaceId',
          'labelIdentifierFieldMetadataId',
          'imageIdentifierFieldMetadataId',
        ],
      );
    }

    /**
     * Delete object metadata
     */
    if (
      storage.objectMetadataDeleteCollection.length > 0 &&
      (!options || options.actions.includes('delete'))
    ) {
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
      ...((field.type === FieldMetadataType.SELECT ||
        field.type === FieldMetadataType.MULTI_SELECT) &&
      field.options
        ? {
            options: this.generateUUIDForNewSelectFieldOptions(
              field.options as FieldMetadataComplexOption[],
            ),
          }
        : {}),
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
    options?: UpdaterOptions,
  ): Promise<{
    createdFieldMetadataCollection: FieldMetadataEntity[];
    updatedFieldMetadataCollection: FieldMetadataUpdate[];
  }> {
    const fieldMetadataRepository = manager.getRepository(FieldMetadataEntity);
    const indexFieldMetadataRepository = manager.getRepository(
      IndexFieldMetadataEntity,
    );
    const indexMetadataRepository = manager.getRepository(IndexMetadataEntity);
    let createdFieldMetadataCollection: FieldMetadataEntity[] = [];
    let updatedFieldMetadataCollection: FieldMetadataUpdate[] = [];

    /**
     * Update field metadata
     */
    if (!options || options.actions.includes('update')) {
      updatedFieldMetadataCollection =
        await this.updateEntities<FieldMetadataEntity>(
          manager,
          FieldMetadataEntity,
          storage.fieldMetadataUpdateCollection,
          ['objectMetadataId', 'workspaceId'],
        );
    }

    /**
     * Create field metadata
     */
    if (!options || options.actions.includes('create')) {
      createdFieldMetadataCollection = await fieldMetadataRepository.save(
        storage.fieldMetadataCreateCollection.map((field) =>
          this.prepareFieldMetadataForCreation(field),
        ) as DeepPartial<FieldMetadataEntity>[],
      );
    }

    /**
     * Delete field metadata
     */
    // TODO: handle relation fields deletion. We need to delete the relation metadata first due to the DB constraint.
    const fieldMetadataDeleteCollectionWithoutRelationType =
      storage.fieldMetadataDeleteCollection.filter(
        (field) => field.type !== FieldMetadataType.RELATION,
      );

    if (
      fieldMetadataDeleteCollectionWithoutRelationType.length > 0 &&
      (!options || options.actions.includes('delete'))
    ) {
      await this.deleteIndexFieldMetadata(
        fieldMetadataDeleteCollectionWithoutRelationType,
        indexFieldMetadataRepository,
        indexMetadataRepository,
      );

      await fieldMetadataRepository.delete(
        fieldMetadataDeleteCollectionWithoutRelationType.map(
          (field) => field.id,
        ),
      );
    }

    return {
      createdFieldMetadataCollection:
        createdFieldMetadataCollection as FieldMetadataEntity[],
      updatedFieldMetadataCollection,
    };
  }

  async updateFieldRelationMetadata(
    manager: EntityManager,
    storage: WorkspaceSyncStorage,
    options?: UpdaterOptions,
  ): Promise<{
    createdFieldRelationMetadataCollection: FieldMetadataUpdate<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >[];
    updatedFieldRelationMetadataCollection: FieldMetadataUpdate<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >[];
    deletedFieldRelationMetadataCollection: FieldMetadataUpdate<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >[];
  }> {
    let createdFieldRelationMetadataCollection: FieldMetadataUpdate<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >[] = [];
    let updatedFieldRelationMetadataCollection: FieldMetadataUpdate<
      FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
    >[] = [];

    /**
     * Create field relation metadata
     */
    if (!options || options.actions.includes('create')) {
      createdFieldRelationMetadataCollection = await this.updateEntities<
        FieldMetadataEntity<
          FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
        >
      >(
        manager,
        FieldMetadataEntity,
        storage.fieldRelationMetadataCreateCollection,
        ['objectMetadataId', 'workspaceId'],
      );
    }

    /**
     * Update field relation metadata
     */
    if (!options || options.actions.includes('update')) {
      updatedFieldRelationMetadataCollection = await this.updateEntities<
        FieldMetadataEntity<
          FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
        >
      >(
        manager,
        FieldMetadataEntity,
        storage.fieldRelationMetadataUpdateCollection,
        ['objectMetadataId', 'workspaceId'],
      );
    }

    if (!options || options.actions.includes('delete')) {
      const fieldMetadataRepository =
        manager.getRepository(FieldMetadataEntity);

      if (storage.fieldRelationMetadataDeleteCollection.length > 0) {
        await fieldMetadataRepository.delete(
          storage.fieldRelationMetadataDeleteCollection.map(
            (field) => field.id,
          ),
        );
      }
    }

    return {
      createdFieldRelationMetadataCollection,
      updatedFieldRelationMetadataCollection,
      deletedFieldRelationMetadataCollection:
        storage.fieldRelationMetadataDeleteCollection.map((field) => ({
          current: field,
          altered: field,
        })),
    };
  }

  async deleteIndexFieldMetadata(
    fieldMetadataDeleteCollectionWithoutRelationType: Partial<FieldMetadataEntity>[],
    indexFieldMetadataRepository: Repository<IndexFieldMetadataEntity>,
    indexMetadataRepository: Repository<IndexMetadataEntity>,
  ) {
    const indexFieldMetadatas = await indexFieldMetadataRepository.find({
      where: {
        fieldMetadataId: In(
          fieldMetadataDeleteCollectionWithoutRelationType.map(
            (field) => field.id,
          ),
        ),
      },
      relations: {
        indexMetadata: true,
      },
    });

    const uniqueIndexMetadataIds = [
      ...new Set(indexFieldMetadatas.map((field) => field.indexMetadataId)),
    ];

    if (uniqueIndexMetadataIds.length > 0) {
      await indexMetadataRepository.delete(uniqueIndexMetadataIds);
    }
  }

  async updateIndexMetadata(
    manager: EntityManager,
    storage: WorkspaceSyncStorage,
    originalObjectMetadataCollection: ObjectMetadataEntity[],
  ): Promise<{
    createdIndexMetadataCollection: IndexMetadataEntity[];
  }> {
    const indexMetadataRepository = manager.getRepository(IndexMetadataEntity);

    const convertIndexMetadataForSaving = (
      indexMetadata: PartialIndexMetadata,
    ) => {
      const convertIndexFieldMetadataForSaving = (
        column: string,
        order: number,
      ): DeepPartial<IndexFieldMetadataEntity> => {
        // Ensure correct type
        const fieldMetadata = originalObjectMetadataCollection
          .find((object) => object.id === indexMetadata.objectMetadataId)
          ?.fields.find((field) => {
            if (isFieldMetadataRelationOrMorphRelation(field)) {
              if (field.settings?.joinColumnName === column) {
                return true;
              }
            }

            if (
              isFieldMetadataEntityOfType(
                field,
                FieldMetadataType.MORPH_RELATION,
              )
            ) {
              return;
            }

            if (field.name === column) {
              return true;
            }

            if (!isCompositeFieldMetadataType(field.type)) {
              return;
            }

            const compositeType = compositeTypeDefinitions.get(
              field.type as CompositeFieldMetadataType,
            );

            if (!compositeType) {
              throw new Error(
                `Composite type definition not found for type: ${field.type}`,
              );
            }

            const columnNames = compositeType.properties.reduce(
              (acc, column) => {
                acc.push(`${field.name}${capitalize(column.name)}`);

                return acc;
              },
              [] as string[],
            );

            if (columnNames.includes(column)) {
              return true;
            }
          });

        if (!fieldMetadata) {
          throw new Error(`
            Field metadata not found for column ${column} in object ${indexMetadata.objectMetadataId}
          `);
        }

        return {
          fieldMetadataId: fieldMetadata.id,
          order,
        };
      };

      return {
        ...indexMetadata,
        indexFieldMetadatas: indexMetadata.columns.map((column, index) =>
          convertIndexFieldMetadataForSaving(column, index),
        ),
      };
    };

    /**
     * Create index metadata
     */
    const createdIndexMetadataCollection = await indexMetadataRepository.save(
      storage.indexMetadataCreateCollection.map(convertIndexMetadataForSaving),
    );

    /**
     * Delete index metadata
     */
    if (storage.indexMetadataDeleteCollection.length > 0) {
      await indexMetadataRepository.delete(
        storage.indexMetadataDeleteCollection.map(
          (indexMetadata) => indexMetadata.id,
        ),
      );
    }

    return {
      createdIndexMetadataCollection,
    };
  }

  /**
   * Update entities in the database
   * @param manager EntityManager
   * @param entityClass Entity class
   * @param updateCollection Update collection
   * @param keysToOmit keys to omit in the merge process
   * @returns Promise<{ current: Entity; altered: Entity }[]>
   */
  private async updateEntities<Entity extends ObjectLiteral & { id: string }>(
    manager: EntityManager,
    entityClass: EntityTarget<Entity>,
    updateCollection: Array<
      DeepPartial<Omit<Entity, 'fields' | 'options' | 'settings'>> & {
        id: string;
      }
    >,
    keysToOmit: (keyof Entity)[] = [],
  ): Promise<{ current: Entity; altered: Entity }[]> {
    const repository = manager.getRepository(entityClass);

    const oldEntities = await repository.findBy({
      id: In(updateCollection.map((updateItem) => updateItem.id)),
    } as FindOptionsWhere<Entity>);

    // Pre-process old collection into a mapping for quick access
    const oldEntitiesMap = new Map(
      oldEntities.map((oldEntity) => [oldEntity.id, oldEntity]),
    );

    // Combine old and new field metadata to get whole updated entities
    const entityUpdateCollection = updateCollection.map((updateItem) => {
      const oldEntity = oldEntitiesMap.get(updateItem.id);

      if (!oldEntity) {
        throw new Error(`
              Entity ${updateItem.id} not found in oldEntities`);
      }

      // TypeORM 😢
      // If we didn't provide the old value, it will be set to null objects that are not in the updateObjectMetadata
      // and override the old value with null in the DB.
      // Also save method doesn't return the whole entity if you give a partial one.
      // https://github.com/typeorm/typeorm/issues/3490
      // To avoid calling update in a for loop, we did this hack.
      const mergedUpdate = {
        ...oldEntity,
        ...updateItem,
      };

      // Do not update isSystem for workspaceMember
      // TODO to remove after https://github.com/twentyhq/twenty/issues/15688
      const isObjectMetadataUpdate = entityClass === ObjectMetadataEntity;

      if (
        isObjectMetadataUpdate &&
        oldEntity?.standardId === STANDARD_OBJECT_IDS.workspaceMember &&
        'isSystem' in updateItem &&
        'isSystem' in oldEntity
      ) {
        (mergedUpdate as unknown as { isSystem: boolean }).isSystem =
          oldEntity.isSystem as boolean;
      }

      // Omit keys that we don't want to override
      keysToOmit.forEach((key) => {
        delete mergedUpdate[key];
      });

      return mergedUpdate;
    });

    const updatedEntities = await repository.save(entityUpdateCollection);

    return updatedEntities.map((updatedEntity) => {
      const oldEntity = oldEntitiesMap.get(updatedEntity.id);

      if (!oldEntity) {
        throw new Error(`
            Entity ${updatedEntity.id} not found in oldEntitiesMap
          `);
      }

      return {
        current: oldEntity,
        altered: {
          ...updatedEntity,
          ...keysToOmit.reduce(
            (acc, key) => ({ ...acc, [key]: oldEntity[key] }),
            {},
          ),
        },
      };
    });
  }
}
