import { CurrencyMetadata } from 'src/metadata/field-metadata/composite-types/currency.composite-type';
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
import { FavoriteObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/favorite.object-metadata';
import { OpportunityObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/opportunity.object-metadata';
import { PersonObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/person.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/workspace-member.object-metadata';

@ObjectMetadata({
  namePlural: 'companies',
  labelSingular: 'شرکت',
  labelPlural: 'شرکت ها',
  description: 'یک شرکت',
  icon: 'IconBuildingSkyscraper',
})
export class CompanyObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'نام',
    description: 'نام شرکت',
    icon: 'IconBuildingSkyscraper',
  })
  name: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'وبگاه',
    description:
      'آدرس وب سایت شرکت. ما از این url برای واکشی نماد شرکت استفاده می کنیم',
    icon: 'IconLink',
  })
  domainName?: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'نشانی',
    description: 'نشانی شرکت',
    icon: 'IconMap',
  })
  address: string;

  @FieldMetadata({
    type: FieldMetadataType.NUMBER,
    label: 'کارمندان',
    description: 'تعداد کارکنان شرکت',
    icon: 'IconUsers',
  })
  @IsNullable()
  employees: number;

  @FieldMetadata({
    type: FieldMetadataType.LINK,
    label: 'لینکدین',
    description: 'حساب لینکدین شرکت',
    icon: 'IconBrandLinkedin',
  })
  @IsNullable()
  linkedinLink: LinkMetadata;

  @FieldMetadata({
    type: FieldMetadataType.LINK,
    label: 'X',
    description: 'حساب تویتتر شرکت',
    icon: 'IconBrandX',
  })
  @IsNullable()
  xLink: LinkMetadata;

  @FieldMetadata({
    type: FieldMetadataType.CURRENCY,
    label: 'درآمد سالانه',
    description:
      'درآمد دوره ای سالانه: درآمد واقعی یا تخمینی سالانه شرکت',
    icon: 'IconMoneybag',
  })
  @IsNullable()
  annualRecurringRevenue: CurrencyMetadata;

  @FieldMetadata({
    type: FieldMetadataType.BOOLEAN,
    label: 'نمایه مشتری ایده آل',
    description:
      'نمایه مشتری ایده آل: نشان می دهد که آیا شرکت مناسب ترین و با ارزش ترین مشتری برای شما است یا خیر',
    icon: 'IconTarget',
    defaultValue: { value: false },
  })
  idealCustomerProfile: boolean;

  @FieldMetadata({
    type: FieldMetadataType.NUMBER,
    label: 'Position',
    description: 'Position',
    icon: 'IconHierarchy2',
  })
  @IsSystem()
  @IsNullable()
  position: number;

  // Relations
  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'افراد',
    description: 'افراد مرتبط با شرکت.',
    icon: 'IconUsers',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'person',
  })
  @IsNullable()
  people: PersonObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'صاحب حساب',
    description:
      'عضو تیم شما مسئول مدیریت حساب شرکت است',
    icon: 'IconUserCircle',
    joinColumn: 'accountOwnerId',
  })
  @IsNullable()
  accountOwner: WorkspaceMemberObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'فعالیت ها',
    description: 'فعالیت های مرتبط با شرکت',
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
    label: 'فرصت ها',
    description: 'فرصت های مرتبط با شرکت',
    icon: 'IconTargetArrow',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'opportunity',
  })
  @IsNullable()
  opportunities: OpportunityObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'موارد دلخواه',
    description: 'موارد دلخواه مرتبط با شرکت',
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
    description: 'پیوست های مرتبط با شرکت',
    icon: 'IconFileImport',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'attachment',
  })
  @IsNullable()
  attachments: AttachmentObjectMetadata[];
}
