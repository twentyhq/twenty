import { Injectable } from '@nestjs/common';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { removeFieldMapsFromObjectMetadata } from 'src/engine/metadata-modules/utils/remove-field-maps-from-object-metadata.util';
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
      sourceObjectMetadata: ObjectMetadataEntity;
      sourceFieldMetadata: FieldMetadataEntity;
      targetObjectMetadata: ObjectMetadataEntity;
      targetFieldMetadata: FieldMetadataEntity;
    }>
  > {
    const metadataVersion =
      await this.workspaceCacheStorageService.getMetadataVersion(workspaceId);

    if (!metadataVersion) {
      throw new FieldMetadataException(
        `Metadata version not found for workspace ${workspaceId}`,
        FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR,
      );
    }

    const objectMetadataMaps =
      await this.workspaceCacheStorageService.getObjectMetadataMaps(
        workspaceId,
        metadataVersion,
      );

    if (!objectMetadataMaps) {
      throw new FieldMetadataException(
        `Object metadata map not found for workspace ${workspaceId} and metadata version ${metadataVersion}`,
        FieldMetadataExceptionCode.INTERNAL_SERVER_ERROR,
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
        throw new FieldMetadataException(
          `Relation target object metadata id or relation target field metadata id not found for field metadata ${id}`,
          FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
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
        throw new FieldMetadataException(
          `Field relation metadata not found for field metadata ${id}`,
          FieldMetadataExceptionCode.FIELD_METADATA_RELATION_MALFORMED,
        );
      }

      return {
        sourceObjectMetadata: removeFieldMapsFromObjectMetadata(
          sourceObjectMetadata,
        ) as ObjectMetadataEntity,
        sourceFieldMetadata: sourceFieldMetadata as FieldMetadataEntity,
        targetObjectMetadata: removeFieldMapsFromObjectMetadata(
          targetObjectMetadata,
        ) as ObjectMetadataEntity,
        targetFieldMetadata: targetFieldMetadata as FieldMetadataEntity,
      };
    });
  }
}
