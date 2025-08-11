import { Injectable } from '@nestjs/common';

import { type EntityManager, type Repository } from 'typeorm';
import { FieldMetadataType } from 'twenty-shared/types';

import { type WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { StandardObjectFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-object.factory';
import { standardObjectMetadataDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects';
import { type WorkspaceSyncStorage } from 'src/engine/workspace-manager/workspace-sync-metadata/storage/workspace-sync.storage';
import { mapObjectMetadataByUniqueIdentifier } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/sync-metadata.util';

@Injectable()
export class WorkspaceSyncObjectMetadataIdentifiersService {
  constructor(private readonly standardObjectFactory: StandardObjectFactory) {}

  async synchronize(
    context: WorkspaceSyncContext,
    manager: EntityManager,
    _storage: WorkspaceSyncStorage,
  ): Promise<void> {
    const objectMetadataRepository =
      manager.getRepository(ObjectMetadataEntity);

    const originalObjectMetadataCollection =
      await this.getOriginalObjectMetadataCollection(
        context.workspaceId,
        objectMetadataRepository,
      );

    const standardObjectMetadataMap =
      this.createStandardObjectMetadataMap(context);

    await this.processObjectMetadataCollection(
      originalObjectMetadataCollection,
      standardObjectMetadataMap,
      objectMetadataRepository,
    );
  }

  private async getOriginalObjectMetadataCollection(
    workspaceId: string,
    objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ): Promise<ObjectMetadataEntity[]> {
    return await objectMetadataRepository.find({
      where: { workspaceId, isCustom: false, isRemote: false },
      relations: ['fields'],
    });
  }

  private createStandardObjectMetadataMap(
    context: WorkspaceSyncContext,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Record<string, any> {
    const standardObjectMetadataCollection = this.standardObjectFactory.create(
      standardObjectMetadataDefinitions,
      context,
    );

    return mapObjectMetadataByUniqueIdentifier(
      standardObjectMetadataCollection,
    );
  }

  private async processObjectMetadataCollection(
    originalObjectMetadataCollection: ObjectMetadataEntity[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    standardObjectMetadataMap: Record<string, any>,
    objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ): Promise<void> {
    for (const objectMetadata of originalObjectMetadataCollection) {
      const objectStandardId = objectMetadata.standardId;

      if (!objectStandardId) {
        throw new Error(
          `Object ${objectMetadata.nameSingular} is missing standardId`,
        );
      }

      const labelIdentifierFieldMetadata = this.findIdentifierFieldMetadata(
        objectMetadata,
        objectStandardId,
        standardObjectMetadataMap,
        'labelIdentifierStandardId',
      );

      const imageIdentifierFieldMetadata = this.findIdentifierFieldMetadata(
        objectMetadata,
        objectStandardId,
        standardObjectMetadataMap,
        'imageIdentifierStandardId',
      );

      this.validateFieldMetadata(
        objectMetadata,
        labelIdentifierFieldMetadata,
        imageIdentifierFieldMetadata,
      );

      // TODO: Add image identifier field metadata
      await objectMetadataRepository.save({
        ...objectMetadata,
        labelIdentifierFieldMetadataId:
          labelIdentifierFieldMetadata?.id ?? null,
        imageIdentifierFieldMetadataId:
          imageIdentifierFieldMetadata?.id ?? null,
      });
    }
  }

  private findIdentifierFieldMetadata(
    objectMetadata: ObjectMetadataEntity,
    objectStandardId: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    standardObjectMetadataMap: Record<string, any>,
    standardIdFieldName: string,
  ): FieldMetadataEntity | undefined {
    const identifierFieldMetadata = objectMetadata.fields.find(
      (field) =>
        field.standardId ===
          standardObjectMetadataMap[objectStandardId][standardIdFieldName] &&
        field.standardId !== null,
    );

    if (
      !identifierFieldMetadata &&
      standardObjectMetadataMap[objectStandardId][standardIdFieldName]
    ) {
      throw new Error(
        `Identifier field for object ${objectMetadata.nameSingular} does not exist`,
      );
    }

    return identifierFieldMetadata;
  }

  private validateFieldMetadata(
    objectMetadata: ObjectMetadataEntity,
    labelIdentifierFieldMetadata: FieldMetadataEntity | undefined,
    imageIdentifierFieldMetadata: FieldMetadataEntity | undefined,
  ): void {
    if (
      labelIdentifierFieldMetadata &&
      ![
        FieldMetadataType.UUID,
        FieldMetadataType.TEXT,
        FieldMetadataType.FULL_NAME,
      ].includes(labelIdentifierFieldMetadata.type)
    ) {
      throw new Error(
        `Label identifier field for object ${objectMetadata.nameSingular} has invalid type ${labelIdentifierFieldMetadata.type}`,
      );
    }

    if (
      imageIdentifierFieldMetadata &&
      imageIdentifierFieldMetadata.type !== FieldMetadataType.TEXT
    ) {
      throw new Error(
        `Image identifier field for object ${objectMetadata.nameSingular} has invalid type ${imageIdentifierFieldMetadata.type}`,
      );
    }
  }
}
