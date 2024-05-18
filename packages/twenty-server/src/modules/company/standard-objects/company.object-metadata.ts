import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { CurrencyMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/currency.composite-type';
import { LinkMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/link.composite-type';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { COMPANY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { RelationMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { ActivityTargetObjectMetadata } from 'src/modules/activity/standard-objects/activity-target.object-metadata';
import { AttachmentObjectMetadata } from 'src/modules/attachment/standard-objects/attachment.object-metadata';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { FavoriteObjectMetadata } from 'src/modules/favorite/standard-objects/favorite.object-metadata';
import { OpportunityObjectMetadata } from 'src/modules/opportunity/standard-objects/opportunity.object-metadata';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/modules/workspace-member/standard-objects/workspace-member.object-metadata';
import { TimelineActivityObjectMetadata } from 'src/modules/timeline/standard-objects/timeline-activity.object-metadata';

@ObjectMetadata({
  standardId: STANDARD_OBJECT_IDS.company,
  namePlural: 'companies',
  labelSingular: 'Organization',
  labelPlural: 'Organizations',
  description: 'An organization',
  icon: 'IconBuildingSkyscraper',
})
export class CompanyObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: COMPANY_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'The organization name',
    icon: 'IconBuildingSkyscraper',
  })
  name: string;

  @FieldMetadata({
    standardId: COMPANY_STANDARD_FIELD_IDS.domainName,
    type: FieldMetadataType.TEXT,
    label: 'Domain Name',
    description:
      'The organization website URL. We use this url to fetch the organization icon',
    icon: 'IconLink',
  })
  domainName?: string;

  @FieldMetadata({
    standardId: COMPANY_STANDARD_FIELD_IDS.address,
    type: FieldMetadataType.TEXT,
    label: 'Address',
    description: 'The organization address',
    icon: 'IconMap',
  })
  address: string;

  @FieldMetadata({
    standardId: COMPANY_STANDARD_FIELD_IDS.employees,
    type: FieldMetadataType.NUMBER,
    label: 'Employees',
    description: 'Number of employees in the organization',
    icon: 'IconUsers',
  })
  @IsNullable()
  employees: number;

  @FieldMetadata({
    standardId: COMPANY_STANDARD_FIELD_IDS.linkedinLink,
    type: FieldMetadataType.LINK,
    label: 'Linkedin',
    description: 'The organization Linkedin account',
    icon: 'IconBrandLinkedin',
  })
  @IsNullable()
  linkedinLink: LinkMetadata;

  @FieldMetadata({
    standardId: COMPANY_STANDARD_FIELD_IDS.xLink,
    type: FieldMetadataType.LINK,
    label: 'X',
    description: 'The organization Twitter/X account',
    icon: 'IconBrandX',
  })
  @IsNullable()
  xLink: LinkMetadata;

  @FieldMetadata({
    standardId: COMPANY_STANDARD_FIELD_IDS.annualRecurringRevenue,
    type: FieldMetadataType.CURRENCY,
    label: 'ARR',
    description:
      'Annual Recurring Revenue: The actual or estimated annual revenue of the organization',
    icon: 'IconMoneybag',
  })
  @IsNullable()
  annualRecurringRevenue: CurrencyMetadata;

  @FieldMetadata({
    standardId: COMPANY_STANDARD_FIELD_IDS.idealCustomerProfile,
    type: FieldMetadataType.BOOLEAN,
    label: 'ICP',
    description:
      'Ideal Customer Profile:  Indicates whether the organization is the most suitable and valuable customer for you',
    icon: 'IconTarget',
    defaultValue: false,
  })
  idealCustomerProfile: boolean;

  @FieldMetadata({
    standardId: COMPANY_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: 'Position',
    description: 'Organization record position',
    icon: 'IconHierarchy2',
  })
  @IsSystem()
  @IsNullable()
  position: number;

  // Relations
  @FieldMetadata({
    standardId: COMPANY_STANDARD_FIELD_IDS.people,
    type: FieldMetadataType.RELATION,
    label: 'People',
    description: 'People linked to the organization.',
    icon: 'IconUsers',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => PersonObjectMetadata,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @IsNullable()
  people: Relation<PersonObjectMetadata[]>;

  @FieldMetadata({
    standardId: COMPANY_STANDARD_FIELD_IDS.accountOwner,
    type: FieldMetadataType.RELATION,
    label: 'Account Owner',
    description:
      'Your team member responsible for managing the organization account',
    icon: 'IconUserCircle',
    joinColumn: 'accountOwnerId',
  })
  @IsNullable()
  accountOwner: WorkspaceMemberObjectMetadata;

  @FieldMetadata({
    standardId: COMPANY_STANDARD_FIELD_IDS.activityTargets,
    type: FieldMetadataType.RELATION,
    label: 'Activities',
    description: 'Activities tied to the organization',
    icon: 'IconCheckbox',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => ActivityTargetObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @IsNullable()
  activityTargets: Relation<ActivityTargetObjectMetadata[]>;

  @FieldMetadata({
    standardId: COMPANY_STANDARD_FIELD_IDS.opportunities,
    type: FieldMetadataType.RELATION,
    label: 'Opportunities',
    description: 'Opportunities linked to the organization.',
    icon: 'IconTargetArrow',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => OpportunityObjectMetadata,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @IsNullable()
  opportunities: Relation<OpportunityObjectMetadata[]>;

  @FieldMetadata({
    standardId: COMPANY_STANDARD_FIELD_IDS.favorites,
    type: FieldMetadataType.RELATION,
    label: 'Favorites',
    description: 'Favorites linked to the organization',
    icon: 'IconHeart',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => FavoriteObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @IsNullable()
  @IsSystem()
  favorites: Relation<FavoriteObjectMetadata[]>;

  @FieldMetadata({
    standardId: COMPANY_STANDARD_FIELD_IDS.attachments,
    type: FieldMetadataType.RELATION,
    label: 'Attachments',
    description: 'Attachments linked to the organization.',
    icon: 'IconFileImport',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => AttachmentObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @IsNullable()
  attachments: Relation<AttachmentObjectMetadata[]>;

  @FieldMetadata({
    standardId: COMPANY_STANDARD_FIELD_IDS.timelineActivities,
    type: FieldMetadataType.RELATION,
    label: 'Timeline Activities',
    description: 'Timeline Activities linked to the organization',
    icon: 'IconIconTimelineEvent',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => TimelineActivityObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @IsNullable()
  @IsSystem()
  timelineActivities: Relation<TimelineActivityObjectMetadata[]>;
}
