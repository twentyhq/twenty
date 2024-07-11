import { Injectable, Logger } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { StandardObjectFactory } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-object.factory';
import { standardObjectMetadataDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects';
import { WorkspaceSyncStorage } from 'src/engine/workspace-manager/workspace-sync-metadata/storage/workspace-sync.storage';
import { mapObjectMetadataByUniqueIdentifier } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/sync-metadata.util';

@Injectable()
export class WorkspaceSyncObjectMetadataIdentifiersService {
  private readonly logger = new Logger(
    WorkspaceSyncObjectMetadataIdentifiersService.name,
  );

  constructor(private readonly standardObjectFactory: StandardObjectFactory) {}

  async synchronize(
    context: WorkspaceSyncContext,
    manager: EntityManager,
    _storage: WorkspaceSyncStorage,
    workspaceFeatureFlagsMap: FeatureFlagMap,
  ): Promise<void> {
    const objectMetadataRepository =
      manager.getRepository(ObjectMetadataEntity);

    const originalObjectMetadataCollection =
      await objectMetadataRepository.find({
        where: {
          workspaceId: context.workspaceId,
          isCustom: false,
        },
        relations: ['fields'],
      });

    const standardObjectMetadataCollection = this.standardObjectFactory.create(
      standardObjectMetadataDefinitions,
      context,
      workspaceFeatureFlagsMap,
    );

    const standardObjectMetadataMap = mapObjectMetadataByUniqueIdentifier(
      standardObjectMetadataCollection,
    );

    for (const objectMetadata of originalObjectMetadataCollection) {
      const objectStandardId = objectMetadata.standardId;

      const labelIdentifierFieldMetadata = objectMetadata.fields.find(
        (field) =>
          objectStandardId &&
          field.standardId ===
            standardObjectMetadataMap[objectStandardId]
              ?.labelIdentifierStandardId,
      );

      if (
        labelIdentifierFieldMetadata &&
        labelIdentifierFieldMetadata.type !== FieldMetadataType.TEXT
      ) {
        throw new Error(
          `Label identifier field for object ${objectMetadata.nameSingular} must be of type TEXT`,
        );
      }

      const imageIdentifierFieldMetadata = objectMetadata.fields.find(
        (field) =>
          objectStandardId &&
          field.standardId ===
            standardObjectMetadataMap[objectStandardId]
              ?.imageIdentifierStandardId,
      );

      if (imageIdentifierFieldMetadata) {
        throw new Error(
          `Image identifier field for object ${objectMetadata.nameSingular} are not supported yet.`,
        );
      }

      await objectMetadataRepository.save({
        ...objectMetadata,
        labelIdentifierFieldMetadataId:
          labelIdentifierFieldMetadata?.id ?? null,
      });
    }
  }
}
