import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { attachmentStandardFieldIds } from 'src/workspace/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/workspace/workspace-sync-metadata/constants/standard-object-ids';
import { CustomObjectMetadata } from 'src/workspace/workspace-sync-metadata/custom-objects/custom.object-metadata';
import { DynamicRelationFieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/dynamic-field-metadata.interface';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/workspace/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { ActivityObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/activity.object-metadata';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { CompanyObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/company.object-metadata';
import { OpportunityObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/opportunity.object-metadata';
import { PersonObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/person.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/workspace-member.object-metadata';

@ObjectMetadata({
  standardId: standardObjectIds.attachment,
  namePlural: 'attachments',
  labelSingular: 'Attachment',
  labelPlural: 'Attachments',
  description: 'An attachment',
  icon: 'IconFileImport',
})
@IsSystem()
export class AttachmentObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: attachmentStandardFieldIds.name,
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'Attachment name',
    icon: 'IconFileUpload',
  })
  name: string;

  @FieldMetadata({
    standardId: attachmentStandardFieldIds.fullPath,
    type: FieldMetadataType.TEXT,
    label: 'Full path',
    description: 'Attachment full path',
    icon: 'IconLink',
  })
  fullPath: string;

  @FieldMetadata({
    standardId: attachmentStandardFieldIds.type,
    type: FieldMetadataType.TEXT,
    label: 'Type',
    description: 'Attachment type',
    icon: 'IconList',
  })
  type: string;

  @FieldMetadata({
    standardId: attachmentStandardFieldIds.author,
    type: FieldMetadataType.RELATION,
    label: 'Author',
    description: 'Attachment author',
    icon: 'IconCircleUser',
    joinColumn: 'authorId',
  })
  author: WorkspaceMemberObjectMetadata;

  @FieldMetadata({
    standardId: attachmentStandardFieldIds.activity,
    type: FieldMetadataType.RELATION,
    label: 'Activity',
    description: 'Attachment activity',
    icon: 'IconNotes',
    joinColumn: 'activityId',
  })
  @IsNullable()
  activity: ActivityObjectMetadata;

  @FieldMetadata({
    standardId: attachmentStandardFieldIds.person,
    type: FieldMetadataType.RELATION,
    label: 'Person',
    description: 'Attachment person',
    icon: 'IconUser',
    joinColumn: 'personId',
  })
  @IsNullable()
  person: PersonObjectMetadata;

  @FieldMetadata({
    standardId: attachmentStandardFieldIds.company,
    type: FieldMetadataType.RELATION,
    label: 'Company',
    description: 'Attachment company',
    icon: 'IconBuildingSkyscraper',
    joinColumn: 'companyId',
  })
  @IsNullable()
  company: CompanyObjectMetadata;

  @FieldMetadata({
    standardId: attachmentStandardFieldIds.opportunity,
    type: FieldMetadataType.RELATION,
    label: 'Opportunity',
    description: 'Attachment opportunity',
    icon: 'IconBuildingSkyscraper',
    joinColumn: 'opportunityId',
  })
  @IsNullable()
  opportunity: OpportunityObjectMetadata;

  @DynamicRelationFieldMetadata((oppositeObjectMetadata) => ({
    standardId: attachmentStandardFieldIds.custom,
    name: oppositeObjectMetadata.nameSingular,
    label: oppositeObjectMetadata.labelSingular,
    description: `Attachment ${oppositeObjectMetadata.labelSingular}`,
    joinColumn: `${oppositeObjectMetadata.nameSingular}Id`,
    icon: 'IconBuildingSkyscraper',
  }))
  custom: CustomObjectMetadata;
}
