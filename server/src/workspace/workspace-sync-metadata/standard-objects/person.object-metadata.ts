import { FullNameMetadata } from 'src/metadata/field-metadata/composite-types/full-name.composite-type';
import { LinkMetadata } from 'src/metadata/field-metadata/composite-types/link.composite-type';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import {
  ObjectMetadata,
  FieldMetadata,
  IsNullable,
  RelationMetadata,
  IsSystem,
} from 'src/workspace/workspace-sync-metadata/decorators/metadata.decorator';
import { ActivityTargetObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/activity-target.object-metadata';
import { AttachmentObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/attachment.object-metadata';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { CompanyObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/company.object-metadata';
import { FavoriteObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/favorite.object-metadata';
import { OpportunityObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/opportunity.object-metadata';

@ObjectMetadata({
  namePlural: 'people',
  labelSingular: 'Person',
  labelPlural: 'People',
  description: 'A person',
  icon: 'IconUser',
})
export class PersonObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.FULL_NAME,
    label: 'Name',
    description: 'Contact’s name',
    icon: 'IconUser',
  })
  name: FullNameMetadata;

  @FieldMetadata({
    type: FieldMetadataType.EMAIL,
    label: 'Email',
    description: 'Contact’s Email',
    icon: 'IconMail',
  })
  email: string;

  @FieldMetadata({
    type: FieldMetadataType.LINK,
    label: 'Linkedin',
    description: 'Contact’s Linkedin account',
    icon: 'IconBrandLinkedin',
  })
  @IsNullable()
  linkedinLink: LinkMetadata;

  @FieldMetadata({
    type: FieldMetadataType.LINK,
    label: 'X',
    description: 'Contact’s X/Twitter account',
    icon: 'IconBrandX',
  })
  @IsNullable()
  xLink: LinkMetadata;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Job Title',
    description: 'Contact’s job title',
    icon: 'IconBriefcase',
  })
  jobTitle: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Phone',
    description: 'Contact’s phone number',
    icon: 'IconPhone',
  })
  phone: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'City',
    description: 'Contact’s city',
    icon: 'IconMap',
  })
  city: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Avatar',
    description: 'Contact’s avatar',
    icon: 'IconFileUpload',
  })
  @IsSystem()
  avatarUrl: string;

  // Relations
  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Company',
    description: 'Contact’s company',
    icon: 'IconBuildingSkyscraper',
    joinColumn: 'companyId',
  })
  company: CompanyObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'POC for Opportunities',
    description: 'Point of Contact for Opportunities',
    icon: 'IconTargetArrow',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'opportunity',
    inverseSideFieldName: 'pointOfContact',
  })
  pointOfContactForOpportunities: OpportunityObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Activities',
    description: 'Activities tied to the contact',
    icon: 'IconCheckbox',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'activityTarget',
  })
  activityTargets: ActivityTargetObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Opportunities',
    description: 'Opportunities linked to the contact.',
    icon: 'IconTargetArrow',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'opportunity',
  })
  opportunities: OpportunityObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Favorites',
    description: 'Favorites linked to the contact',
    icon: 'IconHeart',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'favorite',
  })
  favorites: FavoriteObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Attachments',
    description: 'Attachments linked to the contact.',
    icon: 'IconFileImport',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'attachment',
  })
  attachments: AttachmentObjectMetadata[];
}
