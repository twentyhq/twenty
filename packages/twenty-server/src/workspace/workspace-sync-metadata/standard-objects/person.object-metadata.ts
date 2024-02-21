import { FullNameMetadata } from 'src/metadata/field-metadata/composite-types/full-name.composite-type';
import { LinkMetadata } from 'src/metadata/field-metadata/composite-types/link.composite-type';
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
import { CompanyObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/company.object-metadata';
import { FavoriteObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/favorite.object-metadata';
import { MessageParticipantObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-participant.object-metadata';
import { OpportunityObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/opportunity.object-metadata';

@ObjectMetadata({
  namePlural: 'people',
  labelSingular: 'شخص',
  labelPlural: 'افراد',
  description: 'یک شخص',
  icon: 'IconUser',
})
export class PersonObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.FULL_NAME,
    label: 'نام',
    description: 'نام مخاطب',
    icon: 'IconUser',
  })
  @IsNullable()
  name: FullNameMetadata;

  @FieldMetadata({
    type: FieldMetadataType.EMAIL,
    label: 'ایمیل',
    description: 'ایمیل مخاطب',
    icon: 'IconMail',
  })
  email: string;

  @FieldMetadata({
    type: FieldMetadataType.LINK,
    label: 'لینکدین',
    description: 'حساب لینکدین مخاطب',
    icon: 'IconBrandLinkedin',
  })
  @IsNullable()
  linkedinLink: LinkMetadata;

  @FieldMetadata({
    type: FieldMetadataType.LINK,
    label: 'X',
    description: 'حساب توییتر مخاطب',
    icon: 'IconBrandX',
  })
  @IsNullable()
  xLink: LinkMetadata;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'عنوان شغلی',
    description: 'عنوان شغلی مخاطب',
    icon: 'IconBriefcase',
  })
  jobTitle: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'شماره تماس',
    description: 'شماره تماس مخاطب',
    icon: 'IconPhone',
  })
  phone: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'شهر',
    description: 'شهر مخاطب',
    icon: 'IconMap',
  })
  city: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'آواتار',
    description: 'آواتار مخاطب',
    icon: 'IconFileUpload',
  })
  @IsSystem()
  avatarUrl: string;

  @FieldMetadata({
    type: FieldMetadataType.NUMBER,
    label: 'Position',
    description: 'Record Position',
    icon: 'IconHierarchy2',
  })
  @IsSystem()
  @IsNullable()
  position: number;

  // Relations
  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'شرکت',
    description: 'شرکت مخاطب',
    icon: 'IconBuildingSkyscraper',
    joinColumn: 'companyId',
  })
  @IsNullable()
  company: CompanyObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'نقطه تماس برای فرصت ها',
    description: 'نقطه تماس برای فرصت ها',
    icon: 'IconTargetArrow',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'opportunity',
    inverseSideFieldName: 'pointOfContact',
  })
  @IsNullable()
  pointOfContactForOpportunities: OpportunityObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'فعالیت ها',
    description: 'فعالیت های مرتبط با مخاطب',
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
    label: 'موارد دلخواه',
    description: 'موارد دلخواه به مخاطب پیوند داده شده است',
    icon: 'IconHeart',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'favorite',
  })
  @IsNullable()
  favorites: FavoriteObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'پیوست ها',
    description: 'پیوست‌های مرتبط با مخاطب.',
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
    label: 'پیام شرکت کنندگان',
    description: 'پیام شرکت کنندگان',
    icon: 'IconUserCircle',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'messageParticipant',
    inverseSideFieldName: 'person',
  })
  @IsNullable()
  messageParticipants: MessageParticipantObjectMetadata[];
}
