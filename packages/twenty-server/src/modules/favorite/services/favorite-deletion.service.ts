import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FieldMetadataType } from 'twenty-shared/types';
import { In, Repository } from 'typeorm';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { FAVORITE_DELETION_BATCH_SIZE } from 'src/modules/favorite/constants/favorite-deletion-batch-size';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';

@Injectable()
export class FavoriteDeletionService {
  constructor(
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,

    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async deleteFavoritesForDeletedRecords(
    deletedRecordIds: string[],
    workspaceId: string,
  ): Promise<void> {
    const favoriteRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<FavoriteWorkspaceEntity>(
        workspaceId,
        'favorite',
      );

    const favoriteObjectMetadata = await this.objectMetadataRepository.findOne({
      where: {
        nameSingular: 'favorite',
        workspaceId,
      },
    });

    if (!favoriteObjectMetadata) {
      throw new Error('Favorite object metadata not found');
    }

    const favoriteFields = await this.fieldMetadataRepository.find({
      where: {
        objectMetadataId: favoriteObjectMetadata.id,
        type: FieldMetadataType.RELATION,
      },
    });

    const favoritesToDelete = await favoriteRepository.find({
      select: {
        id: true,
      },
      where: favoriteFields.map((field) => ({
        [`${field.name}Id`]: In(deletedRecordIds),
      })),
      withDeleted: true,
    });

    if (favoritesToDelete.length === 0) {
      return;
    }

    const favoriteIdsToDelete = favoritesToDelete.map(
      (favorite) => favorite.id,
    );

    const batches: string[][] = [];

    for (
      let i = 0;
      i < favoriteIdsToDelete.length;
      i += FAVORITE_DELETION_BATCH_SIZE
    ) {
      batches.push(
        favoriteIdsToDelete.slice(i, i + FAVORITE_DELETION_BATCH_SIZE),
      );
    }

    for (const batch of batches) {
      await favoriteRepository.delete(batch);
    }
  }
}
