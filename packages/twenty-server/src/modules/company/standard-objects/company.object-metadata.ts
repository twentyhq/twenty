import { CurrencyMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/currency.composite-type';
import { LinkMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/link.composite-type';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { companyStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
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
import { EventObjectMetadata } from 'src/modules/event/standard-objects/event.object-metadata';

@ObjectMetadata({
  standardId: standardObjectIds.company,
  namePlural: 'companies',
  labelSingular: 'Company',
  labelPlural: 'Companies',
  description: 'A company',
  icon: 'IconBuildingSkyscraper',
})
export class CompanyObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: companyStandardFieldIds.name,
    type: FieldMetadataType.TEXT,
    label: 'Name',
    description: 'The company name',
    icon: 'IconBuildingSkyscraper',
  })
  name: string;

  @FieldMetadata({
    standardId: companyStandardFieldIds.domainName,
    type: FieldMetadataType.TEXT,
    label: 'Domain Name',
    description:
      'The company website URL. We use this url to fetch the company icon',
    icon: 'IconLink',
  })
  domainName?: string;

  @FieldMetadata({
    standardId: companyStandardFieldIds.address,
    type: FieldMetadataType.TEXT,
    label: 'Address',
    description: 'The company address',
    icon: 'IconMap',
  })
  address: string;

  @FieldMetadata({
    standardId: companyStandardFieldIds.employees,
    type: FieldMetadataType.NUMBER,
    label: 'Employees',
    description: 'Number of employees in the company',
    icon: 'IconUsers',
  })
  @IsNullable()
  employees: number;

  @FieldMetadata({
    standardId: companyStandardFieldIds.linkedinLink,
    type: FieldMetadataType.LINK,
    label: 'Linkedin',
    description: 'The company Linkedin account',
    icon: 'IconBrandLinkedin',
  })
  @IsNullable()
  linkedinLink: LinkMetadata;

  @FieldMetadata({
    standardId: companyStandardFieldIds.xLink,
    type: FieldMetadataType.LINK,
    label: 'X',
    description: 'The company Twitter/X account',
    icon: 'IconBrandX',
  })
  @IsNullable()
  xLink: LinkMetadata;

  @FieldMetadata({
    standardId: companyStandardFieldIds.annualRecurringRevenue,
    type: FieldMetadataType.CURRENCY,
    label: 'ARR',
    description:
      'Annual Recurring Revenue: The actual or estimated annual revenue of the company',
    icon: 'IconMoneybag',
  })
  @IsNullable()
  annualRecurringRevenue: CurrencyMetadata;

  @FieldMetadata({
    standardId: companyStandardFieldIds.idealCustomerProfile,
    type: FieldMetadataType.BOOLEAN,
    label: 'ICP',
    description:
      'Ideal Customer Profile:  Indicates whether the company is the most suitable and valuable customer for you',
    icon: 'IconTarget',
    defaultValue: false,
  })
  idealCustomerProfile: boolean;

  @FieldMetadata({
    standardId: companyStandardFieldIds.position,
    type: FieldMetadataType.POSITION,
    label: 'Position',
    description: 'Company record position',
    icon: 'IconHierarchy2',
  })
  @IsSystem()
  @IsNullable()
  position: number;

  // Relations
  @FieldMetadata({
    standardId: companyStandardFieldIds.people,
    type: FieldMetadataType.RELATION,
    label: 'People',
    description: 'People linked to the company.',
    icon: 'IconUsers',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => PersonObjectMetadata,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @IsNullable()
  people: PersonObjectMetadata[];

  @FieldMetadata({
    standardId: companyStandardFieldIds.accountOwner,
    type: FieldMetadataType.RELATION,
    label: 'Account Owner',
    description:
      'Your team member responsible for managing the company account',
    icon: 'IconUserCircle',
    joinColumn: 'accountOwnerId',
  })
  @IsNullable()
  accountOwner: WorkspaceMemberObjectMetadata;

  @FieldMetadata({
    standardId: companyStandardFieldIds.activityTargets,
    type: FieldMetadataType.RELATION,
    label: 'Activities',
    description: 'Activities tied to the company',
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
    standardId: companyStandardFieldIds.opportunities,
    type: FieldMetadataType.RELATION,
    label: 'Opportunities',
    description: 'Opportunities linked to the company.',
    icon: 'IconTargetArrow',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => OpportunityObjectMetadata,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @IsNullable()
  opportunities: OpportunityObjectMetadata[];

  @FieldMetadata({
    standardId: companyStandardFieldIds.favorites,
    type: FieldMetadataType.RELATION,
    label: 'Favorites',
    description: 'Favorites linked to the company',
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
    standardId: companyStandardFieldIds.attachments,
    type: FieldMetadataType.RELATION,
    label: 'Attachments',
    description: 'Attachments linked to the company.',
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
    standardId: companyStandardFieldIds.events,
    type: FieldMetadataType.RELATION,
    label: 'Events',
    description: 'Events linked to the company',
    icon: 'IconIconTimelineEvent',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => EventObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @IsNullable()
  @IsSystem()
  events: EventObjectMetadata[];
}
