import { CurrencyMetadata } from 'src/metadata/field-metadata/composite-types/currency.composite-type';
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
import { PersonObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/person.object-metadata';
import { PipelineStepObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/pipeline-step.object-metadata';

@ObjectMetadata({
  namePlural: 'opportunities',
  labelSingular: 'فرصت',
  labelPlural: 'فرصت ها',
  description: 'یک فرصت',
  icon: 'IconTargetArrow',
})
export class OpportunityObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'نام فرصت',
    description: 'نام فرصت',
    icon: 'IconTargetArrow',
  })
  name: string;

  @FieldMetadata({
    type: FieldMetadataType.CURRENCY,
    label: 'مبلغ',
    description: 'مبلغ فرصت',
    icon: 'IconCurrencyDollar',
  })
  @IsNullable()
  amount: CurrencyMetadata;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'تاریخ بسته شدن',
    description: 'تاریخ بسته شدن فرصت',
    icon: 'IconCalendarEvent',
  })
  @IsNullable()
  closeDate: Date;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'احتمال',
    description: 'احتمال فرصت',
    icon: 'IconProgressCheck',
    defaultValue: { value: '0' },
  })
  probability: string;

  @FieldMetadata({
    type: FieldMetadataType.SELECT,
    label: 'مرحله',
    description: 'مرحله فرصت',
    icon: 'IconProgressCheck',
    options: [
      { value: 'NEW', label: 'جدید', position: 0, color: 'red' },
      { value: 'SCREENING', label: 'غربالگری', position: 1, color: 'purple' },
      { value: 'MEETING', label: 'جلسه', position: 2, color: 'sky' },
      {
        value: 'PROPOSAL',
        label: 'پیشنهاد',
        position: 3,
        color: 'turquoise',
      },
      { value: 'CUSTOMER', label: 'مشتری', position: 4, color: 'yellow' },
    ],
    defaultValue: { value: 'NEW' },
  })
  stage: string;

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
    label: 'مرحله خط لوله',
    description: 'مرحله خط لوله فرصت',
    icon: 'IconKanban',
    joinColumn: 'pipelineStepId',
  })
  @IsNullable()
  pipelineStep: PipelineStepObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'نقطه ارتباط فرصت',
    description: 'نقطه ارتباط فرصت',
    icon: 'IconUser',
    joinColumn: 'pointOfContactId',
  })
  @IsNullable()
  pointOfContact: PersonObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'شرکت',
    description: 'فرصت شرکت',
    icon: 'IconBuildingSkyscraper',
    joinColumn: 'companyId',
  })
  @IsNullable()
  company: CompanyObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'موارد دلخواه',
    description: 'موارد دلخواه مرتبط با فرصت',
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
    label: 'فعالیت ها',
    description: 'فعالیت های مرتبط با فرصت',
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
    description: 'پیوست های مرتبط با فرصت.',
    icon: 'IconFileImport',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'attachment',
  })
  @IsNullable()
  attachments: AttachmentObjectMetadata[];
}
