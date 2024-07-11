import { Injectable, Logger } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';
import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

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

      objectMetadata.labelIdentifierFieldMetadataId =
        objectMetadata.fields.find(
          (field) =>
            objectStandardId &&
            field.standardId ===
              standardObjectMetadataMap[objectStandardId]
                ?.labelIdentifierStandardId,
        )?.id ?? null;

      objectMetadata.imageIdentifierFieldMetadataId =
        objectMetadata.fields.find(
          (field) =>
            objectStandardId &&
            field.standardId ===
              standardObjectMetadataMap[objectStandardId]
                ?.imageIdentifierStandardId,
        )?.id ?? null;

      await objectMetadataRepository.save(objectMetadata);
    }
  }
}
