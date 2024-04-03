import { CurrencyMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/currency.composite-type';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { opportunityStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { RelationMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { ActivityTargetObjectMetadata } from 'src/modules/activity/standard-objects/activity-target.object-metadata';
import { AttachmentObjectMetadata } from 'src/modules/attachment/standard-objects/attachment.object-metadata';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { CompanyObjectMetadata } from 'src/modules/company/standard-objects/company.object-metadata';
import { FavoriteObjectMetadata } from 'src/modules/favorite/standard-objects/favorite.object-metadata';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';
import { EventObjectMetadata } from 'src/modules/event/standard-objects/event.object-metadata';

@ObjectMetadata({
  standardId: standardObjectIds.opportunity,
  namePlural: 'opportunities',
  labelSingular: 'Opportunity',
  labelPlural: 'Opportunities',
  description: 'An opportunity',
  icon: 'IconTargetArrow',
})
export class OpportunityObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: opportunityStandardFieldIds.name,
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'The opportunity name',
    icon: 'IconTargetArrow',
  })
  name: string;

  @FieldMetadata({
    standardId: opportunityStandardFieldIds.amount,
    type: FieldMetadataType.CURRENCY,
    label: 'Amount',
    description: 'Opportunity amount',
    icon: 'IconCurrencyDollar',
  })
  @IsNullable()
  amount: CurrencyMetadata;

  @FieldMetadata({
    standardId: opportunityStandardFieldIds.closeDate,
    type: FieldMetadataType.DATE_TIME,
    label: 'Close date',
    description: 'Opportunity close date',
    icon: 'IconCalendarEvent',
  })
  @IsNullable()
  closeDate: Date;

  @FieldMetadata({
    standardId: opportunityStandardFieldIds.probability,
    type: FieldMetadataType.TEXT,
    label: 'Probability',
    description: 'Opportunity probability',
    icon: 'IconProgressCheck',
    defaultValue: "'0'",
  })
  probability: string;

  @FieldMetadata({
    standardId: opportunityStandardFieldIds.stage,
    type: FieldMetadataType.SELECT,
    label: 'Stage',
    description: 'Opportunity stage',
    icon: 'IconProgressCheck',
    options: [
      { value: 'NEW', label: 'New', position: 0, color: 'red' },
      { value: 'SCREENING', label: 'Screening', position: 1, color: 'purple' },
      { value: 'MEETING', label: 'Meeting', position: 2, color: 'sky' },
      {
        value: 'PROPOSAL',
        label: 'Proposal',
        position: 3,
        color: 'turquoise',
      },
      { value: 'CUSTOMER', label: 'Customer', position: 4, color: 'yellow' },
    ],
    defaultValue: "'NEW'",
  })
  stage: string;

  @FieldMetadata({
    standardId: opportunityStandardFieldIds.position,
    type: FieldMetadataType.POSITION,
    label: 'Position',
    description: 'Opportunity record position',
    icon: 'IconHierarchy2',
  })
  @IsSystem()
  @IsNullable()
  position: number;

  @FieldMetadata({
    standardId: opportunityStandardFieldIds.pointOfContact,
    type: FieldMetadataType.RELATION,
    label: 'Point of Contact',
    description: 'Opportunity point of contact',
    icon: 'IconUser',
    joinColumn: 'pointOfContactId',
  })
  @IsNullable()
  pointOfContact: PersonObjectMetadata;

  @FieldMetadata({
    standardId: opportunityStandardFieldIds.company,
    type: FieldMetadataType.RELATION,
    label: 'Company',
    description: 'Opportunity company',
    icon: 'IconBuildingSkyscraper',
    joinColumn: 'companyId',
  })
  @IsNullable()
  company: CompanyObjectMetadata;

  @FieldMetadata({
    standardId: opportunityStandardFieldIds.favorites,
    type: FieldMetadataType.RELATION,
    label: 'Favorites',
    description: 'Favorites linked to the opportunity',
    icon: 'IconHeart',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => FavoriteObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @IsNullable()
  @IsSystem()
  favorites: FavoriteObjectMetadata[];

  @FieldMetadata({
    standardId: opportunityStandardFieldIds.activityTargets,
    type: FieldMetadataType.RELATION,
    label: 'Activities',
    description: 'Activities tied to the opportunity',
    icon: 'IconCheckbox',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => ActivityTargetObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @IsNullable()
  activityTargets: ActivityTargetObjectMetadata[];

  @FieldMetadata({
    standardId: opportunityStandardFieldIds.attachments,
    type: FieldMetadataType.RELATION,
    label: 'Attachments',
    description: 'Attachments linked to the opportunity.',
    icon: 'IconFileImport',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => AttachmentObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @IsNullable()
  attachments: AttachmentObjectMetadata[];

  @FieldMetadata({
    standardId: opportunityStandardFieldIds.events,
    type: FieldMetadataType.RELATION,
    label: 'Events',
    description: 'Events linked to the opportunity.',
    icon: 'IconTimelineEvent',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => EventObjectMetadata,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @IsNullable()
  events: EventObjectMetadata[];
}
