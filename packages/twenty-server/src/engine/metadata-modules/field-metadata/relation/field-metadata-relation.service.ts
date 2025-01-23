import { Injectable, NotFoundException } from '@nestjs/common';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { cleanObjectMetadata } from 'src/engine/metadata-modules/utils/clean-object-metadata.util';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class FieldMetadataRelationService {
  constructor(
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
  ) {}

  async findCachedFieldMetadataRelation(
    fieldMetadataItems: Array<
      Pick<
        FieldMetadataInterface,
        | 'id'
        | 'type'
        | 'objectMetadataId'
        | 'relationTargetFieldMetadataId'
        | 'relationTargetObjectMetadataId'
      >
    >,
    workspaceId: string,
  ): Promise<
    Array<{
      sourceObjectMetadata: ObjectMetadataInterface;
      sourceFieldMetadata: FieldMetadataInterface;
      targetObjectMetadata: ObjectMetadataInterface;
      targetFieldMetadata: FieldMetadataInterface;
    }>
  > {
    const metadataVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspaceId);

    if (!metadataVersion) {
      throw new NotFoundException(
        `Metadata version not found for workspace ${workspaceId}`,
      );
    }

    const objectMetadataMaps =
      await this.workspaceCacheStorageService.getObjectMetadataMaps(
        workspaceId,
        metadataVersion,
      );

    if (!objectMetadataMaps) {
      throw new NotFoundException(
        `Object metadata map not found for workspace ${workspaceId} and metadata version ${metadataVersion}`,
      );
    }

    return fieldMetadataItems.map((fieldMetadataItem) => {
      const {
        id,
        objectMetadataId,
        relationTargetFieldMetadataId,
        relationTargetObjectMetadataId,
      } = fieldMetadataItem;

      if (!relationTargetObjectMetadataId || !relationTargetFieldMetadataId) {
        throw new NotFoundException(
          `Relation target object metadata id or relation target field metadata id not found for field metadata ${id}`,
        );
      }

      const sourceObjectMetadata = objectMetadataMaps.byId[objectMetadataId];
      const targetObjectMetadata =
        objectMetadataMaps.byId[relationTargetObjectMetadataId];
      const sourceFieldMetadata = sourceObjectMetadata.fieldsById[id];
      const targetFieldMetadata =
        targetObjectMetadata.fieldsById[relationTargetFieldMetadataId];

      if (
        !sourceObjectMetadata ||
        !targetObjectMetadata ||
        !sourceFieldMetadata ||
        !targetFieldMetadata
      ) {
        throw new NotFoundException(
          `Field relation metadata not found for field metadata ${id}`,
        );
      }

      return {
        sourceObjectMetadata: cleanObjectMetadata(sourceObjectMetadata),
        sourceFieldMetadata,
        targetObjectMetadata: cleanObjectMetadata(targetObjectMetadata),
        targetFieldMetadata,
      };
    });
  }
}
