import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import {
  ObjectMetadata,
  IsSystem,
  FieldMetadata,
} from 'src/workspace/workspace-sync-metadata/decorators/metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';

@ObjectMetadata({
  namePlural: 'comments',
  labelSingular: 'Comment',
  labelPlural: 'Comments',
  description: 'A comment',
  icon: 'IconMessageCircle',
})
@IsSystem()
export class CommentObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Body',
    description: 'Comment body',
    icon: 'IconLink',
    defaultValue: { value: '' },
  })
  body: string;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Author',
    description: 'Comment author',
    icon: 'IconCircleUser',
    joinColumn: 'authorId',
  })
  author: string;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Activity',
    description: 'Comment activity',
    icon: 'IconNotes',
    joinColumn: 'activityId',
  })
  activity: string;
}
