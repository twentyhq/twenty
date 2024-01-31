import { CurrencyMetadata } from 'src/metadata/field-metadata/composite-types/currency.composite-type';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/workspace/workspace-sync-metadata/decorators/is-nullable.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { RelationMetadata } from 'src/workspace/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { ActivityTargetObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/activity-target.object-metadata';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { CompanyObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/company.object-metadata';
import { FavoriteObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/favorite.object-metadata';
import { PersonObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/person.object-metadata';
import { PipelineStepObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/pipeline-step.object-metadata';

@ObjectMetadata({
  namePlural: 'opportunities',
  labelSingular: 'Opportunity',
  labelPlural: 'Opportunities',
  description: 'An opportunity',
  icon: 'IconTargetArrow',
})
export class OpportunityObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'The opportunity name',
    icon: 'IconTargetArrow',
  })
  name: string;

  @FieldMetadata({
    type: FieldMetadataType.CURRENCY,
    label: 'Amount',
    description: 'Opportunity amount',
    icon: 'IconCurrencyDollar',
  })
  @IsNullable()
  amount: CurrencyMetadata;

  @FieldMetadata({
    type: FieldMetadataType.DATE_TIME,
    label: 'Close date',
    description: 'Opportunity close date',
    icon: 'IconCalendarEvent',
  })
  @IsNullable()
  closeDate: Date;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Probability',
    description: 'Opportunity probability',
    icon: 'IconProgressCheck',
    defaultValue: { value: '0' },
  })
  probability: string;

  @FieldMetadata({
    type: FieldMetadataType.SELECT,
    label: 'Stage',
    description: 'Opportunity stage',
    icon: 'IconProgressCheck',
    options: [
      { value: 'new', label: 'New', position: 0, color: 'red' },
      { value: 'screening', label: 'Screening', position: 1, color: 'purple' },
      { value: 'meeting', label: 'Meeting', position: 2, color: 'sky' },
      {
        value: 'proposal',
        label: 'Proposal',
        position: 3,
        color: 'turquoise',
      },
      { value: 'customer', label: 'Customer', position: 4, color: 'yellow' },
    ],
    defaultValue: { value: 'new' },
  })
  stage: string;

  // Relations
  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Pipeline Step',
    description: 'Opportunity pipeline step',
    icon: 'IconKanban',
    joinColumn: 'pipelineStepId',
  })
  @IsNullable()
  pipelineStep: PipelineStepObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Point of Contact',
    description: 'Opportunity point of contact',
    icon: 'IconUser',
    joinColumn: 'pointOfContactId',
  })
  @IsNullable()
  pointOfContact: PersonObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Company',
    description: 'Opportunity company',
    icon: 'IconBuildingSkyscraper',
    joinColumn: 'companyId',
  })
  @IsNullable()
  company: CompanyObjectMetadata;

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Favorites',
    description: 'Favorites linked to the opportunity',
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
    label: 'Activities',
    description: 'Activities tied to the opportunity',
    icon: 'IconCheckbox',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'activityTarget',
  })
  @IsNullable()
  activityTargets: ActivityTargetObjectMetadata[];
}
