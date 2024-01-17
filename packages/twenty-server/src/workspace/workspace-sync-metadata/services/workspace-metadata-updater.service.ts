import { Injectable } from '@nestjs/common';

import { EntityManager, In } from 'typeorm';

import { MappedObjectMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/mapped-metadata.interface';
import { PartialFieldMetadata } from 'src/workspace/workspace-sync-metadata/interfaces/partial-field-metadata.interface';

import { ObjectMetadataEntity } from 'src/metadata/object-metadata/object-metadata.entity';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/metadata/field-metadata/field-metadata.entity';
import { convertStringifiedFieldsToJSON } from 'src/workspace/workspace-sync-metadata/utils/sync-metadata.util';

interface WorkspaceMetadataUpdaterContext {
  objectMetadataCreateCollection: MappedObjectMetadata[];
  objectMetadataUpdateCollection: Partial<ObjectMetadataEntity>[];
  objectMetadataDeleteCollection: ObjectMetadataEntity[];

  fieldMetadataCreateCollection: PartialFieldMetadata[];
  fieldMetadataUpdateCollection: Partial<FieldMetadataEntity>[];
  fieldMetadataDeleteCollection: FieldMetadataEntity[];
}

@Injectable()
export class WorkspaceMetadataUpdaterService {
  constructor() {}

  public async update(
    manager: EntityManager,
    context: WorkspaceMetadataUpdaterContext,
  ): Promise<{
    createdObjectMetadataCollection: ObjectMetadataEntity[];
    updatedObjectMetadataCollection: ObjectMetadataEntity[];
    createdFieldMetadataCollection: FieldMetadataEntity[];
    updatedFieldMetadataCollection: FieldMetadataEntity[];
  }> {
    const updateObjectMetadataResult = await this.updateObjectMetadata(
      manager,
      context,
    );
    const updateFieldMetadataResult = await this.updateFieldMetadata(
      manager,
      context,
    );

    return {
      ...updateObjectMetadataResult,
      ...updateFieldMetadataResult,
    };
  }

  private async updateObjectMetadata(
    manager: EntityManager,
    context: WorkspaceMetadataUpdaterContext,
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
        context.objectMetadataCreateCollection.map((object) => ({
          ...object,
          isActive: true,
          fields: Object.values(object.fields).map((field) => ({
            ...convertStringifiedFieldsToJSON(field),
            isActive: true,
          })),
        })),
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
      context.objectMetadataUpdateCollection,
    );

    /**
     * Delete object metadata
     */
    if (context.objectMetadataDeleteCollection.length > 0) {
      await objectMetadataRepository.delete(
        context.objectMetadataDeleteCollection.map((object) => object.id),
      );
    }

    return {
      createdObjectMetadataCollection,
      updatedObjectMetadataCollection,
    };
  }

  private async updateFieldMetadata(
    manager: EntityManager,
    context: WorkspaceMetadataUpdaterContext,
  ): Promise<{
    createdFieldMetadataCollection: FieldMetadataEntity[];
    updatedFieldMetadataCollection: FieldMetadataEntity[];
  }> {
    const fieldMetadataRepository = manager.getRepository(FieldMetadataEntity);

    /**
     * Create field metadata
     */
    const createdFieldMetadataCollection = await fieldMetadataRepository.save(
      context.fieldMetadataCreateCollection.map((field) =>
        convertStringifiedFieldsToJSON(field),
      ),
    );

    /**
     * Update field metadata
     */
    const updatedFieldMetadataCollection = await fieldMetadataRepository.save(
      context.fieldMetadataUpdateCollection.map((field) =>
        // TODO: Fix this typing issue, it's not a big deal but it's annoying
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        convertStringifiedFieldsToJSON(field),
      ),
    );

    /**
     * Delete field metadata
     */
    // TODO: handle relation fields deletion. We need to delete the relation metadata first due to the DB constraint.
    const fieldMetadataDeleteCollectionWithoutRelationType =
      context.fieldMetadataDeleteCollection.filter(
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
      createdFieldMetadataCollection,
      updatedFieldMetadataCollection,
    };
  }
}
