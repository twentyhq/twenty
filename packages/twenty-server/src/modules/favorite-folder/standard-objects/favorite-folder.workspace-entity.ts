import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationOnDeleteAction } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { FAVORITE_FOLDER_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.favoriteFolder,

  namePlural: 'favoriteFolders',
  labelSingular: msg`Favorite Folder`,
  labelPlural: msg`Favorite Folders`,
  description: msg`A Folder of favorites`,
  icon: 'IconFolder',
})
@WorkspaceIsSystem()
export class FavoriteFolderWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: FAVORITE_FOLDER_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.NUMBER,
    label: msg`Position`,
    description: msg`Favorite folder position`,
    icon: 'IconList',
    defaultValue: 0,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: FAVORITE_FOLDER_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Name of the favorite folder`,
    icon: 'IconText',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  name: string | null;

  @WorkspaceRelation({
    standardId: FAVORITE_FOLDER_STANDARD_FIELD_IDS.favorites,
    type: RelationType.ONE_TO_MANY,
    label: msg`Favorites`,
    description: msg`Favorites in this folder`,
    icon: 'IconHeart',
    inverseSideFieldKey: 'favoriteFolder',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsFieldUIReadOnly()
  favorites: Relation<FavoriteWorkspaceEntity[]>;
}
