import { ExtendCustomObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/extend-custom-object-metadata.decorator';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { IsNullable } from 'src/workspace/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { ActivityTargetObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/activity-target.object-metadata';
import { RelationMetadata } from 'src/workspace/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { FavoriteObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/favorite.object-metadata';

@ExtendCustomObjectMetadata()
export class CustomObjectStandardFields extends BaseObjectMetadata {
  @FieldMetadata({
    label: 'Name',
    description: 'Name',
    type: FieldMetadataType.TEXT,
    icon: 'IconAbc',
    defaultValue: { value: 'Untitled' },
  })
  name: string;

  @FieldMetadata({
    label: 'Position',
    description: 'Position',
    type: FieldMetadataType.NUMBER,
    icon: 'IconHierarchy2',
  })
  @IsNullable()
  @IsSystem()
  position: number;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Activities',
    description: (objectMetadata) =>
      `Activity tied to the ${objectMetadata.nameSingular}`,
    icon: 'IconCheckbox',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => ActivityTargetObjectMetadata,
  })
  @IsNullable()
  activityTargets: ActivityTargetObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Favorites',
    description: (objectMetadata) =>
      `Favorites tied to the ${objectMetadata.nameSingular}`,
    icon: 'IconHeart',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => FavoriteObjectMetadata,
  })
  @IsNullable()
  favorites: FavoriteObjectMetadata[];
}
