import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';

export class FavoriteDeletionService {
  constructor(private readonly twentyORMManager: TwentyORMManager) {}

  async deleteFavorites(favoriteIds: string[]): Promise<void> {
    const favoriteRepository =
      await this.twentyORMManager.getRepository<FavoriteWorkspaceEntity>(
        'favorite',
      );

    await favoriteRepository.delete(favoriteIds);
  }
}
