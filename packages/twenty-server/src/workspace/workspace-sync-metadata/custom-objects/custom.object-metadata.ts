import { BaseCustomObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/base-custom-object-metadata.decorator';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { IsNullable } from 'src/workspace/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/metadata/relation-metadata/relation-metadata.entity';
import { ActivityTargetObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/activity-target.object-metadata';
import { RelationMetadata } from 'src/workspace/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { FavoriteObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/favorite.object-metadata';
import { AttachmentObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/attachment.object-metadata';
import { customObjectStandardFieldIds } from 'src/workspace/workspace-sync-metadata/constants/standard-field-ids';

@BaseCustomObjectMetadata()
export class CustomObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: customObjectStandardFieldIds.name,
    label: 'Name',
    description: 'Name',
    type: FieldMetadataType.TEXT,
    icon: 'IconAbc',
    defaultValue: { value: 'Untitled' },
  })
  name: string;

  @FieldMetadata({
    standardId: customObjectStandardFieldIds.position,
    label: 'Position',
    description: 'Position',
    type: FieldMetadataType.POSITION,
    icon: 'IconHierarchy2',
  })
  @IsNullable()
  @IsSystem()
  position: number;

  @FieldMetadata({
    standardId: customObjectStandardFieldIds.activityTargets,
    type: FieldMetadataType.RELATION,
    label: 'Activities',
    description: (objectMetadata) =>
      `Activities tied to the ${objectMetadata.labelSingular}`,
    icon: 'IconCheckbox',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => ActivityTargetObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @IsNullable()
  activityTargets: ActivityTargetObjectMetadata[];

  @FieldMetadata({
    standardId: customObjectStandardFieldIds.favorites,
    type: FieldMetadataType.RELATION,
    label: 'Favorites',
    description: (objectMetadata) =>
      `Favorites tied to the ${objectMetadata.labelSingular}`,
    icon: 'IconHeart',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => FavoriteObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @IsNullable()
  @IsSystem()
  favorites: FavoriteObjectMetadata[];

  @FieldMetadata({
    standardId: customObjectStandardFieldIds.attachments,
    type: FieldMetadataType.RELATION,
    label: 'Attachments',
    description: (objectMetadata) =>
      `Attachments tied to the ${objectMetadata.labelSingular}`,
    icon: 'IconFileImport',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => AttachmentObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @IsNullable()
  attachments: AttachmentObjectMetadata[];
}
