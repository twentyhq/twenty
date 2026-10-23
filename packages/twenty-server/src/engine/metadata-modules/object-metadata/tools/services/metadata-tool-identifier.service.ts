import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { getObjectMetadataIdByName } from 'src/engine/metadata-modules/flat-object-metadata/utils/get-object-metadata-id-by-name.util';
import {
  ObjectMetadataException,
  ObjectMetadataExceptionCode,
} from 'src/engine/metadata-modules/object-metadata/object-metadata.exception';

@Injectable()
export class MetadataToolIdentifierService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async getObjectMetadataIdOrThrow({
    workspaceId,
    objectName,
  }: {
    workspaceId: string;
    objectName: string;
  }): Promise<string> {
    const { flatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const objectMetadataId = getObjectMetadataIdByName({
      flatObjectMetadataMaps,
      objectName,
    });

    if (!isDefined(objectMetadataId)) {
      throw new ObjectMetadataException(
        `Object "${objectName}" not found. Use get_object_metadata to list available objects.`,
        ObjectMetadataExceptionCode.OBJECT_METADATA_NOT_FOUND,
      );
    }

    return objectMetadataId;
  }
}
