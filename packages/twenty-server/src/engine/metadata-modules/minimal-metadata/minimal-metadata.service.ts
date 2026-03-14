import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ViewVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { MinimalMetadataDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-metadata.dto';
import { MinimalObjectMetadataDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-object-metadata.dto';
import { MinimalViewDTO } from 'src/engine/metadata-modules/minimal-metadata/dtos/minimal-view.dto';

@Injectable()
export class MinimalMetadataService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  async getMinimalMetadata(
    workspaceId: string,
    userWorkspaceId?: string,
  ): Promise<MinimalMetadataDTO> {
    const [workspace, { flatObjectMetadataMaps, flatViewMaps }] =
      await Promise.all([
        this.workspaceRepository.findOneOrFail({
          where: { id: workspaceId },
          select: ['metadataVersion'],
        }),
        this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatViewMaps'],
        }),
      ]);

    const objectMetadataItems: MinimalObjectMetadataDTO[] = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((flatObjectMetadata) => flatObjectMetadata.isActive === true)
      .map((flatObjectMetadata) => ({
        id: flatObjectMetadata.id,
        nameSingular: flatObjectMetadata.nameSingular,
        namePlural: flatObjectMetadata.namePlural,
        labelSingular: flatObjectMetadata.labelSingular,
        labelPlural: flatObjectMetadata.labelPlural,
        icon: flatObjectMetadata.icon ?? undefined,
        isCustom: flatObjectMetadata.isCustom,
        isActive: flatObjectMetadata.isActive,
        isSystem: flatObjectMetadata.isSystem,
        isRemote: flatObjectMetadata.isRemote,
      }));

    const views: MinimalViewDTO[] = Object.values(
      flatViewMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((flatView) => flatView.workspaceId === workspaceId)
      .filter((flatView) => flatView.deletedAt === null)
      .filter(
        (flatView) =>
          flatView.visibility === ViewVisibility.WORKSPACE ||
          (flatView.visibility === ViewVisibility.UNLISTED &&
            isDefined(userWorkspaceId) &&
            flatView.createdByUserWorkspaceId === userWorkspaceId),
      )
      .map((flatView) => ({
        id: flatView.id,
        type: flatView.type,
        key: flatView.key,
        objectMetadataId: flatView.objectMetadataId,
      }));

    return {
      objectMetadataItems,
      views,
      metadataVersion: workspace.metadataVersion,
    };
  }
}
