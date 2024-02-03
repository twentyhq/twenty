import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { ActivityObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/activity.object-metadata';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/workspace-member.object-metadata';

@ObjectMetadata({
  namePlural: 'comments',
  labelSingular: 'اظهار نظر',
  labelPlural: 'نظرات',
  description: 'اظهار نظر',
  icon: 'IconMessageCircle',
})
@IsSystem()
export class CommentObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'متن',
    description: 'متن نظر',
    icon: 'IconLink',
  })
  body: string;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'نویسنده',
    description: 'نویسنده نظر',
    icon: 'IconCircleUser',
    joinColumn: 'authorId',
  })
  author: WorkspaceMemberObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'فعالیت',
    description: 'فعالیت های نظر',
    icon: 'IconNotes',
    joinColumn: 'activityId',
  })
  activity: ActivityObjectMetadata;
}
