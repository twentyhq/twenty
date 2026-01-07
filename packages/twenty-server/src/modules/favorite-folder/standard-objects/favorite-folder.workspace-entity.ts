import { type Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';

export class FavoriteFolderWorkspaceEntity extends BaseWorkspaceEntity {
  position: number;
  name: string | null;
  favorites: Relation<FavoriteWorkspaceEntity[]>;
}
