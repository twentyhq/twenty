import { Injectable } from '@nestjs/common';

import { EntitySchemaRelationOptions } from 'typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { determineRelationDetails } from 'src/engine/twenty-orm/utils/determine-relation-details.util';
import { isRelationFieldMetadataType } from 'src/engine/utils/is-relation-field-metadata-type.util';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

type EntitySchemaRelationMap = {
  [key: string]: EntitySchemaRelationOptions;
};

@Injectable()
export class EntitySchemaRelationFactory {
  constructor(
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  async create(
    workspaceId: string,
    fieldMetadataCollection: FieldMetadataEntity[],
  ): Promise<EntitySchemaRelationMap> {
    const entitySchemaRelationMap: EntitySchemaRelationMap = {};

    for (const fieldMetadata of fieldMetadataCollection) {
      if (!isRelationFieldMetadataType(fieldMetadata.type)) {
        continue;
      }

      const relationMetadata =
        fieldMetadata.fromRelationMetadata ?? fieldMetadata.toRelationMetadata;

      if (!relationMetadata) {
        throw new Error(
          `Relation metadata is missing for field ${fieldMetadata.name}`,
        );
      }

      const objectMetadataCollection =
        await this.workspaceCacheStorageService.getObjectMetadataCollection(
          workspaceId,
        );

      if (!objectMetadataCollection) {
        throw new Error('Object metadata collection not found');
      }

      const relationDetails = await determineRelationDetails(
        fieldMetadata,
        relationMetadata,
        objectMetadataCollection,
      );

      entitySchemaRelationMap[fieldMetadata.name] = {
        type: relationDetails.relationType,
        target: relationDetails.target,
        inverseSide: relationDetails.inverseSide,
        joinColumn: relationDetails.joinColumn,
      } satisfies EntitySchemaRelationOptions;
    }

    return entitySchemaRelationMap;
  }
}
