import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/workspace/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { ActivityObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/activity.object-metadata';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { CompanyObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/company.object-metadata';
import { PersonObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/person.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/workspace-member.object-metadata';

@ObjectMetadata({
  namePlural: 'attachments',
  labelSingular: 'Attachment',
  labelPlural: 'Attachments',
  description: 'An attachment',
  icon: 'IconFileImport',
})
@IsSystem()
export class AttachmentObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'Attachment name',
    icon: 'IconFileUpload',
  })
  name: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Full path',
    description: 'Attachment full path',
    icon: 'IconLink',
  })
  fullPath: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Type',
    description: 'Attachment type',
    icon: 'IconList',
  })
  type: string;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Author',
    description: 'Attachment author',
    icon: 'IconCircleUser',
    joinColumn: 'authorId',
  })
  author: WorkspaceMemberObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Activity',
    description: 'Attachment activity',
    icon: 'IconNotes',
    joinColumn: 'activityId',
  })
  @IsNullable()
  activity: ActivityObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Person',
    description: 'Attachment person',
    icon: 'IconUser',
    joinColumn: 'personId',
  })
  @IsNullable()
  person: PersonObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Company',
    description: 'Attachment company',
    icon: 'IconBuildingSkyscraper',
    joinColumn: 'companyId',
  })
  @IsNullable()
  company: CompanyObjectMetadata;
}
