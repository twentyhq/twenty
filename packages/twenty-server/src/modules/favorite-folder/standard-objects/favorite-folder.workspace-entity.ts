import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';

export class FavoriteFolderWorkspaceEntity extends BaseWorkspaceEntity {
  position: number;
  name: string | null;
  favorites: EntityRelation<FavoriteWorkspaceEntity[]>;
}
