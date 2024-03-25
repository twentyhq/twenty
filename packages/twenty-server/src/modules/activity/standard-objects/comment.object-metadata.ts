import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { commentStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { ActivityObjectMetadata } from 'src/modules/activity/standard-objects/activity.object-metadata';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';

@ObjectMetadata({
  standardId: standardObjectIds.comment,
  namePlural: 'comments',
  labelSingular: 'Comment',
  labelPlural: 'Comments',
  description: 'A comment',
  icon: 'IconMessageCircle',
})
@IsSystem()
export class CommentObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: commentStandardFieldIds.body,
    type: FieldMetadataType.TEXT,
    label: 'Body',
    description: 'Comment body',
    icon: 'IconLink',
  })
  body: string;

  @FieldMetadata({
    standardId: commentStandardFieldIds.author,
    type: FieldMetadataType.RELATION,
    label: 'Author',
    description: 'Comment author',
    icon: 'IconCircleUser',
    joinColumn: 'authorId',
  })
  author: WorkspaceMemberObjectMetadata;

  @FieldMetadata({
    standardId: commentStandardFieldIds.activity,
    type: FieldMetadataType.RELATION,
    label: 'Activity',
    description: 'Comment activity',
    icon: 'IconNotes',
    joinColumn: 'activityId',
  })
  activity: ActivityObjectMetadata;
}
