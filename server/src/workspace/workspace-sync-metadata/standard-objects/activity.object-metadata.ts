import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import {
  ObjectMetadata,
  IsSystem,
  IsNullable,
  FieldMetadata,
} from 'src/workspace/workspace-sync-metadata/decorators/metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';

@ObjectMetadata({
  namePlural: 'activities',
  labelSingular: 'Activity',
  labelPlural: 'Activities',
  description: 'An activity',
  icon: 'IconCheckbox',
})
@IsSystem()
export class ActivitydObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Title',
    description: 'Activity title',
    icon: 'IconNotes',
  })
  @IsNullable()
  title: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Body',
    description: 'Activity body',
    icon: 'IconList',
  })
  @IsNullable()
  body: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Type',
    description: 'Activity type',
    icon: 'IconCheckbox',
    defaultValue: { value: 'Note' },
  })
  type: string;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'Reminder Date',
    description: 'Activity reminder date',
    icon: 'IconCalendarEvent',
  })
  @IsNullable()
  reminderAt: Date;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'Due Date',
    description: 'Activity due date',
    icon: 'IconCalendarEvent',
  })
  @IsNullable()
  dueAt: Date;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'Completion Date',
    description: 'Activity completion date',
    icon: 'IconCheck',
  })
  @IsNullable()
  completedAt: Date;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Targets',
    description: 'Activity targets',
    icon: 'IconCheckbox',
  })
  activityTargets: object[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Attachments',
    description: 'Activity attachments',
    icon: 'IconFileImport',
  })
  attachments: object[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Comments',
    description: 'Activity comments',
    icon: 'IconComment',
  })
  comments: object[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Author',
    description: 'Activity author',
    icon: 'IconUserCircle',
    joinColumn: 'authorId',
  })
  author: object;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Assignee',
    description: 'Acitivity assignee',
    icon: 'IconUserCircle',
    joinColumn: 'assigneeId',
  })
  assignee: object;
}
