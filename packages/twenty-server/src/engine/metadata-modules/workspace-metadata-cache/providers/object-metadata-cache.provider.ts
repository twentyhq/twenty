import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { generateObjectMetadataMaps } from 'src/engine/metadata-modules/utils/generate-object-metadata-maps.util';
import { WorkspaceContextCache } from 'src/engine/workspace-context-cache/decorators/workspace-context-cache.decorator';
import { WorkspaceContextCacheProvider } from 'src/engine/workspace-context-cache/workspace-context-cache-provider.service';

@Injectable()
@WorkspaceContextCache('objectMetadataMaps')
export class ObjectMetadataCacheProvider extends WorkspaceContextCacheProvider<ObjectMetadataMaps> {
  constructor(
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(IndexMetadataEntity)
    private readonly indexMetadataRepository: Repository<IndexMetadataEntity>,
  ) {
    super();
  }

  async computeForCache(workspaceId: string): Promise<ObjectMetadataMaps> {
    const objectMetadataItems = await this.objectMetadataRepository.find({
      where: { workspaceId },
      relations: ['fields'],
    });

    const objectMetadataItemsIds = objectMetadataItems.map(
      (objectMetadataItem) => objectMetadataItem.id,
    );

    const indexMetadataItems = await this.indexMetadataRepository.find({
      where: { objectMetadataId: In(objectMetadataItemsIds) },
      relations: ['indexFieldMetadatas'],
    });

    const objectMetadataItemsWithIndexMetadatas = objectMetadataItems.map(
      (objectMetadataItem) => ({
        ...objectMetadataItem,
        indexMetadatas: indexMetadataItems.filter(
          (indexMetadataItem) =>
            indexMetadataItem.objectMetadataId === objectMetadataItem.id,
        ),
      }),
    );

    const freshObjectMetadataMaps = generateObjectMetadataMaps(
      objectMetadataItemsWithIndexMetadatas,
    );

    return freshObjectMetadataMaps;
  }

  dataCacheKey(workspaceId: string): string {
    return `metadata:object-metadata-maps:${workspaceId}`;
  }

  hashCacheKey(workspaceId: string): string {
    return `metadata:object-metadata-maps:${workspaceId}:hash`;
  }
}

