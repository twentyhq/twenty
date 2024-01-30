import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/workspace/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { RelationMetadata } from 'src/workspace/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { ActivityTargetObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/activity-target.object-metadata';
import { AttachmentObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/attachment.object-metadata';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { CommentObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/comment.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/workspace-member.object-metadata';

@ObjectMetadata({
  namePlural: 'activities',
  labelSingular: 'فعالیت',
  labelPlural: 'فعالیت ها',
  description: 'یک فعالیت',
  icon: 'IconCheckbox',
})
@IsSystem()
export class ActivityObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'عنوان',
    description: 'عنوان فعالیت',
    icon: 'IconNotes',
  })
  title: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'متن',
    description: 'متن فعالیت',
    icon: 'IconList',
  })
  body: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'نوع',
    description: 'نوع فعالیت',
    icon: 'IconCheckbox',
    defaultValue: { value: 'Note' },
  })
  type: string;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'تاریخ یادآوری',
    description: 'تاریخ یادآوری فعالیت',
    icon: 'IconCalendarEvent',
  })
  @IsNullable()
  reminderAt: Date;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'تاریخ سررسید',
    description: 'تاریخ سررسید فعالیت',
    icon: 'IconCalendarEvent',
  })
  @IsNullable()
  dueAt: Date;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'تاریخ تکمیل',
    description: 'تاریخ تکمیل فعالیت',
    icon: 'IconCheck',
  })
  @IsNullable()
  completedAt: Date;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'اهداف',
    description: 'اهداف فعالیت',
    icon: 'IconCheckbox',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'activityTarget',
  })
  @IsNullable()
  activityTargets: ActivityTargetObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'پیوست ها',
    description: 'پیوست های فعالیت',
    icon: 'IconFileImport',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'attachment',
  })
  @IsNullable()
  attachments: AttachmentObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'نظرات',
    description: 'نظرات فعالیت',
    icon: 'IconComment',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'comment',
  })
  @IsNullable()
  comments: CommentObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'نویسنده',
    description: 'نویسنده فعالیت',
    icon: 'IconUserCircle',
    joinColumn: 'authorId',
  })
  author: WorkspaceMemberObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'منتسب',
    description: 'Acitivity assignee',
    icon: 'IconUserCircle',
    joinColumn: 'assigneeId',
  })
  @IsNullable()
  assignee: WorkspaceMemberObjectMetadata;
}
