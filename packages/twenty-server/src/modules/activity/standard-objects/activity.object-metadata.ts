import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { activityStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { RelationMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { ActivityTargetObjectMetadata } from 'src/modules/activity/standard-objects/activity-target.object-metadata';
import { AttachmentObjectMetadata } from 'src/modules/attachment/standard-objects/attachment.object-metadata';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { CommentObjectMetadata } from 'src/modules/activity/standard-objects/comment.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';

@ObjectMetadata({
  standardId: standardObjectIds.activity,
  namePlural: 'activities',
  labelSingular: 'Activity',
  labelPlural: 'Activities',
  description: 'An activity',
  icon: 'IconCheckbox',
})
@IsSystem()
export class ActivityObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: activityStandardFieldIds.title,
    type: FieldMetadataType.TEXT,
    label: 'Title',
    description: 'Activity title',
    icon: 'IconNotes',
  })
  title: string;

  @FieldMetadata({
    standardId: activityStandardFieldIds.body,
    type: FieldMetadataType.TEXT,
    label: 'Body',
    description: 'Activity body',
    icon: 'IconList',
  })
  body: string;

  @FieldMetadata({
    standardId: activityStandardFieldIds.type,
    type: FieldMetadataType.TEXT,
    label: 'Type',
    description: 'Activity type',
    icon: 'IconCheckbox',
    defaultValue: { value: "'Note'" },
  })
  type: string;

  @FieldMetadata({
    standardId: activityStandardFieldIds.reminderAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Reminder Date',
    description: 'Activity reminder date',
    icon: 'IconCalendarEvent',
  })
  @IsNullable()
  reminderAt: Date;

  @FieldMetadata({
    standardId: activityStandardFieldIds.dueAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Due Date',
    description: 'Activity due date',
    icon: 'IconCalendarEvent',
  })
  @IsNullable()
  dueAt: Date;

  @FieldMetadata({
    standardId: activityStandardFieldIds.completedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Completion Date',
    description: 'Activity completion date',
    icon: 'IconCheck',
  })
  @IsNullable()
  completedAt: Date;

  @FieldMetadata({
    standardId: activityStandardFieldIds.activityTargets,
    type: FieldMetadataType.RELATION,
    label: 'Targets',
    description: 'Activity targets',
    icon: 'IconCheckbox',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => ActivityTargetObjectMetadata,
  })
  @IsNullable()
  activityTargets: ActivityTargetObjectMetadata[];

  @FieldMetadata({
    standardId: activityStandardFieldIds.attachments,
    type: FieldMetadataType.RELATION,
    label: 'Attachments',
    description: 'Activity attachments',
    icon: 'IconFileImport',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => AttachmentObjectMetadata,
  })
  @IsNullable()
  attachments: AttachmentObjectMetadata[];

  @FieldMetadata({
    standardId: activityStandardFieldIds.comments,
    type: FieldMetadataType.RELATION,
    label: 'Comments',
    description: 'Activity comments',
    icon: 'IconComment',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => CommentObjectMetadata,
  })
  @IsNullable()
  comments: CommentObjectMetadata[];

  @FieldMetadata({
    standardId: activityStandardFieldIds.author,
    type: FieldMetadataType.RELATION,
    label: 'Author',
    description: 'Activity author',
    icon: 'IconUserCircle',
    joinColumn: 'authorId',
  })
  author: WorkspaceMemberObjectMetadata;

  @FieldMetadata({
    standardId: activityStandardFieldIds.assignee,
    type: FieldMetadataType.RELATION,
    label: 'Assignee',
    description: 'Activity assignee',
    icon: 'IconUserCircle',
    joinColumn: 'assigneeId',
  })
  @IsNullable()
  assignee: WorkspaceMemberObjectMetadata;
}
