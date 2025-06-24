import { Injectable } from '@nestjs/common';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { getObjectMetadataFromObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/utils/get-object-metadata-from-object-metadata-Item-with-field-maps';
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
    const objectMetadataMaps =
      await this.workspaceCacheStorageService.getObjectMetadataMapsOrThrow(
        workspaceId,
      );

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
      const sourceFieldMetadata = sourceObjectMetadata?.fieldsById[id];
      const targetFieldMetadata =
        targetObjectMetadata?.fieldsById[relationTargetFieldMetadataId];

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
        sourceObjectMetadata:
          getObjectMetadataFromObjectMetadataItemWithFieldMaps(
            sourceObjectMetadata,
          ) as ObjectMetadataEntity,
        sourceFieldMetadata: sourceFieldMetadata as FieldMetadataEntity,
        targetObjectMetadata:
          getObjectMetadataFromObjectMetadataItemWithFieldMaps(
            targetObjectMetadata,
          ) as ObjectMetadataEntity,
        targetFieldMetadata: targetFieldMetadata as FieldMetadataEntity,
      };
    });
  }
}
