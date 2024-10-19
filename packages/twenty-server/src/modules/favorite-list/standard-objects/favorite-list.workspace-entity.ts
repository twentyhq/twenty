import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { FAVORITE_LIST_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.favoriteList,
  namePlural: 'favoriteLists',
  labelSingular: 'Favorite List',
  labelPlural: 'Favorite Lists',
  description: 'A list of favorites',
  icon: 'IconList',
})
export class FavoriteListWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: FAVORITE_LIST_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'Name of the favorite list',
    icon: 'IconText',
  })
  name: string;

  @WorkspaceField({
    standardId: FAVORITE_LIST_STANDARD_FIELD_IDS.icon,
    type: FieldMetadataType.TEXT,
    label: 'Icon',
    description: 'Icon for the favorite list',
    icon: 'IconFolder',
  })
  icon: string;

  @WorkspaceRelation({
    standardId: FAVORITE_LIST_STANDARD_FIELD_IDS.favorites,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Favorites',
    description: 'Favorites in this list',
    icon: 'IconHeart',
    inverseSideFieldKey: 'favoriteList',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
  })
  favorites: Relation<FavoriteWorkspaceEntity[]>;
}
