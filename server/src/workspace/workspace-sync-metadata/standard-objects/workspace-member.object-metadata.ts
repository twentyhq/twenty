import { FullNameMetadata } from 'src/metadata/field-metadata/composite-types/full-name.composite-type';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import {
  ObjectMetadata,
  IsSystem,
  FieldMetadata,
  IsNullable,
  RelationMetadata,
} from 'src/workspace/workspace-sync-metadata/decorators/metadata.decorator';
import { ActivityObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/activity.object-metadata';
import { AttachmentObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/attachment.object-metadata';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { CommentObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/comment.object-metadata';
import { CompanyObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/company.object-metadata';
import { FavoriteObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/favorite.object-metadata';

@ObjectMetadata({
  namePlural: 'workspaceMembers',
  labelSingular: 'Workspace Member',
  labelPlural: 'Workspace Members',
  description: 'A workspace member',
  icon: 'IconUserCircle',
})
@IsSystem()
export class WorkspaceMemberObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.FULL_NAME,
    label: 'Name',
    description: 'Workspace member name',
    icon: 'IconCircleUser',
  })
  name: FullNameMetadata;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Color Scheme',
    description: 'Preferred color scheme',
    icon: 'IconColorSwatch',
    defaultValue: { value: 'Light' },
  })
  colorScheme: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Language',
    description: 'Preferred language',
    icon: 'IconLanguage',
    defaultValue: { value: 'en' },
  })
  locale: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Avatar Url',
    description: 'Workspace member avatar',
    icon: 'IconFileUpload',
  })
  avatarUrl: string;

  @FieldMetadata({
    type: FieldMetadataType.UUID,
    label: 'User Id',
    description: 'Associated User Id',
    icon: 'IconCircleUsers',
  })
  userId: string;

  // Relations
  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Authored activities',
    description: 'Activities created by the workspace member',
    icon: 'IconCheckbox',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'activity',
    inverseSideFieldName: 'author',
  })
  @IsNullable()
  authoredActivities: ActivityObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Assigned activities',
    description: 'Activities assigned to the workspace member',
    icon: 'IconCheckbox',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'activity',
    inverseSideFieldName: 'assignee',
  })
  @IsNullable()
  assignedActivities: ActivityObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Favorites',
    description: 'Favorites linked to the workspace member',
    icon: 'IconHeart',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'favorite',
  })
  @IsNullable()
  favorites: FavoriteObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Account Owner For Companies',
    description: 'Account owner for companies',
    icon: 'IconBriefcase',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'company',
    inverseSideFieldName: 'accountOwner',
  })
  @IsNullable()
  accountOwnerForCompanies: CompanyObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Authored attachments',
    description: 'Attachments created by the workspace member',
    icon: 'IconFileImport',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'attachment',
    inverseSideFieldName: 'author',
  })
  @IsNullable()
  authoredAttachments: AttachmentObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Authored comments',
    description: 'Authored comments',
    icon: 'IconComment',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'comment',
    inverseSideFieldName: 'author',
  })
  @IsNullable()
  authoredComments: CommentObjectMetadata[];
}
