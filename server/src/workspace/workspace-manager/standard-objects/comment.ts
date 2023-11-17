import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';

const commentMetadata = {
  nameSingular: 'commentV2',
  namePlural: 'commentsV2',
  labelSingular: 'Comment',
  labelPlural: 'Comments',
  targetTableName: 'comment',
  description: 'A comment',
  icon: 'IconMessageCircle',
  isActive: true,
  isSystem: true,
  fields: [
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.TEXT,
      name: 'body',
      label: 'Body',
      targetColumnMap: {
        value: 'body',
      },
      description: 'Comment body',
      icon: 'IconLink',
      isNullable: false,
    },
    // Relations
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.RELATION,
      name: 'author',
      label: 'Author',
      targetColumnMap: {
        value: 'authorId',
      },
      description: 'Comment author',
      icon: 'IconCircleUser',
      isNullable: false,
    },
    {
      isCustom: false,
      isActive: true,
      type: FieldMetadataType.RELATION,
      name: 'activity',
      label: 'Activity',
      targetColumnMap: {
        value: 'activityId',
      },
      description: 'Comment activity',
      icon: 'IconNotes',
      isNullable: false,
    },
  ],
};

export default commentMetadata;
