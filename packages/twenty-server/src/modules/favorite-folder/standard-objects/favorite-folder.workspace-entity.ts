import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration-v2/types/entity-relation.interface';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';

export class FavoriteFolderWorkspaceEntity extends BaseWorkspaceEntity {
  position: number;
  name: string | null;
  favorites: EntityRelation<FavoriteWorkspaceEntity[]>;
}
