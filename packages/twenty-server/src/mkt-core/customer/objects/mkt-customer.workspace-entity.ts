import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';
import { Relation } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/relation-metadata/relation-on-delete-action.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { MKT_CUSTOMER_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import {
  MKT_CUSTOMER_COMPANY_SIZE,
  MKT_CUSTOMER_COMPANY_SIZE_OPTIONS,
  MKT_CUSTOMER_INDUSTRY,
  MKT_CUSTOMER_INDUSTRY_OPTIONS,
  MKT_CUSTOMER_LIFECYCLE_STAGE,
  MKT_CUSTOMER_LIFECYCLE_STAGE_OPTIONS,
  MKT_CUSTOMER_STATUS,
  MKT_CUSTOMER_STATUS_OPTIONS,
  MKT_CUSTOMER_TAGS,
  MKT_CUSTOMER_TAGS_OPTIONS,
  MKT_CUSTOMER_TIER,
  MKT_CUSTOMER_TIER_OPTIONS,
  MKT_CUSTOMER_TYPE,
  MKT_CUSTOMER_TYPE_OPTIONS,
} from 'src/mkt-core/customer/constants/mkt-customer.constant';
import { MktCustomerTagWorkspaceEntity } from 'src/mkt-core/customer/objects/mkt-customer-tag.workspace-entity';
import { MktLicenseWorkspaceEntity } from 'src/mkt-core/license/mkt-license.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const TABLE_NAME = 'mktCustomer';
const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_MKT_CUSTOMER: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktCustomer,
  namePlural: `${TABLE_NAME}s`,
  labelSingular: msg`Customer`,
  labelPlural: msg`Customers`,
  description: msg`Customer entity for marketing`,
  icon: 'IconUser',
  labelIdentifierStandardId: MKT_CUSTOMER_FIELD_IDS.name,
})
@WorkspaceIsSearchable()
export class MktCustomerWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.mktWorkspaceId,
    type: FieldMetadataType.TEXT,
    label: msg`Workspace ID`,
    description: msg`Workspace ID`,
    icon: 'IconBuilding',
  })
  @WorkspaceIsNullable()
  mktWorkspaceId: string;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.mktCustomerCode,
    type: FieldMetadataType.TEXT,
    label: msg`Customer Code`,
    description: msg`Customer code`,
    icon: 'IconCode',
  })
  @WorkspaceIsNullable()
  mktCustomerCode: string;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.type,
    type: FieldMetadataType.SELECT,
    label: msg`Type`,
    description: msg`Customer type`,
    icon: 'IconUser',
    options: MKT_CUSTOMER_TYPE_OPTIONS,
  })
  @WorkspaceIsNullable()
  type: MKT_CUSTOMER_TYPE;

  // basic_info
  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Customer name`,
    icon: 'IconUser',
  })
  name: string;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.companyName,
    type: FieldMetadataType.TEXT,
    label: msg`Company Name`,
    description: msg`Customer company name`,
    icon: 'IconBuilding',
  })
  @WorkspaceIsNullable()
  companyName: string;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.companyShortName,
    type: FieldMetadataType.TEXT,
    label: msg`Company Short Name`,
    description: msg`Customer company short name`,
    icon: 'IconBuilding',
  })
  @WorkspaceIsNullable()
  companyShortName: string;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.email,
    type: FieldMetadataType.TEXT,
    label: msg`Email`,
    description: msg`Customer email`,
    icon: 'IconMail',
  })
  @WorkspaceIsNullable()
  email: string;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.phone,
    type: FieldMetadataType.TEXT,
    label: msg`Phone`,
    description: msg`Customer phone`,
    icon: 'IconPhone',
  })
  @WorkspaceIsNullable()
  phone: string;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.taxCode,
    type: FieldMetadataType.TEXT,
    label: msg`Tax Code`,
    description: msg`Customer tax code`,
    icon: 'IconTax',
  })
  @WorkspaceIsNullable()
  taxCode: string;

  // business_info

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.address,
    type: FieldMetadataType.TEXT,
    label: msg`Address`,
    description: msg`Customer address`,
    icon: 'IconMapPin',
  })
  @WorkspaceIsNullable()
  address: string;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.website,
    type: FieldMetadataType.TEXT,
    label: msg`Website`,
    description: msg`Customer website`,
    icon: 'IconGlobe',
  })
  @WorkspaceIsNullable()
  website: string;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.companySize,
    type: FieldMetadataType.SELECT,
    label: msg`Company Size`,
    description: msg`Customer company size`,
    icon: 'IconBuilding',
    options: MKT_CUSTOMER_COMPANY_SIZE_OPTIONS,
  })
  @WorkspaceIsNullable()
  companySize: MKT_CUSTOMER_COMPANY_SIZE;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.industry,
    type: FieldMetadataType.SELECT,
    label: msg`Industry`,
    description: msg`Customer industry`,
    icon: 'IconIndustry',
    options: MKT_CUSTOMER_INDUSTRY_OPTIONS,
  })
  @WorkspaceIsNullable()
  industry: MKT_CUSTOMER_INDUSTRY;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.legalRepresentative,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Legal Representative`,
    description: msg`Customer legal representative`,
    icon: 'IconUser',
  })
  @WorkspaceIsNullable()
  legalRepresentative: JSON;

  //assignment
  //sales_id (relation)
  //affiliate_id (relation)

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.assignedDate,
    type: FieldMetadataType.DATE,
    label: msg`Assigned Date`,
    description: msg`Customer assigned date`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  assignedDate: Date;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.assignmentReason,
    type: FieldMetadataType.TEXT,
    label: msg`Assigned Reason`,
    description: msg`Customer assigned reason`,
    icon: 'IconReason',
  })
  @WorkspaceIsNullable()
  assignedReason: string;

  //support_id (relation)

  //system_info
  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`Customer status`,
    icon: 'IconStatus',
    options: MKT_CUSTOMER_STATUS_OPTIONS,
  })
  @WorkspaceIsNullable()
  status: MKT_CUSTOMER_STATUS;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.tier,
    type: FieldMetadataType.SELECT,
    label: msg`Tier`,
    description: msg`Customer tier`,
    icon: 'IconTiers',
    options: MKT_CUSTOMER_TIER_OPTIONS,
  })
  @WorkspaceIsNullable()
  tier: MKT_CUSTOMER_TIER;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.lifecycleStage,
    type: FieldMetadataType.SELECT,
    label: msg`Lifecycle Stage`,
    description: msg`Customer lifecycle stage`,
    icon: 'IconLifeCycle',
    options: MKT_CUSTOMER_LIFECYCLE_STAGE_OPTIONS,
  })
  @WorkspaceIsNullable()
  lifecycleStage: MKT_CUSTOMER_LIFECYCLE_STAGE;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.registrationDate,
    type: FieldMetadataType.DATE,
    label: msg`Registration Date`,
    description: msg`Customer registration date`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  registrationDate: Date;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.tags,
    type: FieldMetadataType.MULTI_SELECT,
    label: msg`Tags`,
    description: msg`Customer tags`,
    icon: 'IconTag',
    options: MKT_CUSTOMER_TAGS_OPTIONS,
  })
  @WorkspaceIsNullable()
  tags: MKT_CUSTOMER_TAGS[];

  //tracking_info
  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.licensesCount,
    type: FieldMetadataType.NUMBER,
    label: msg`Licenses Count`,
    description: msg`Customer licenses count`,
    icon: 'IconLicense',
  })
  @WorkspaceIsNullable()
  licensesCount: number;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.totalOrderValue,
    type: FieldMetadataType.NUMBER,
    label: msg`Total Order Value`,
    description: msg`Customer total order value`,
    icon: 'IconMoney',
  })
  @WorkspaceIsNullable()
  totalOrderValue: number;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.lastPurchase,
    type: FieldMetadataType.DATE,
    label: msg`Last Purchase`,
    description: msg`Customer last purchase`,
    icon: 'IconCalendar',
  })
  @WorkspaceIsNullable()
  lastPurchase: Date;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.customerLtv,
    type: FieldMetadataType.NUMBER,
    label: msg`Customer LTV`,
    description: msg`Customer Lifetime Value`,
    icon: 'IconMoney',
  })
  @WorkspaceIsNullable()
  customerLtv: number;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.churnRiskScore,
    type: FieldMetadataType.NUMBER,
    label: msg`Churn Risk Score`,
    description: msg`Customer churn risk score`,
    icon: 'IconChurn',
  })
  @WorkspaceIsNullable()
  churnRiskScore: number;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.engagementScore,
    type: FieldMetadataType.NUMBER,
    label: msg`Engagement Score`,
    description: msg`Customer engagement score`,
    icon: 'IconEngagement',
  })
  @WorkspaceIsNullable()
  engagementScore: number;

  //other_info
  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.notes,
    type: FieldMetadataType.TEXT,
    label: msg`Notes`,
    description: msg`Customer notes`,
    icon: 'IconNote',
  })
  @WorkspaceIsNullable()
  notes: string;

  // common fields & relations
  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in the list`,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsNullable()
  position?: number;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: MKT_CUSTOMER_FIELD_IDS.mktLicenses,
    type: RelationType.ONE_TO_MANY,
    label: msg`Licenses`,
    description: msg`Licenses of the customer`,
    icon: 'IconLicense',
    inverseSideTarget: () => MktLicenseWorkspaceEntity,
    inverseSideFieldKey: 'mktCustomer',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  mktLicenses: Relation<MktLicenseWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: MKT_CUSTOMER_FIELD_IDS.mktCustomerTags,
    type: RelationType.ONE_TO_MANY,
    label: msg`Customer Tags`,
    description: msg`Customer tags of the customer`,
    icon: 'IconTag',
    inverseSideTarget: () => MktCustomerTagWorkspaceEntity,
    inverseSideFieldKey: 'mktCustomer',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktCustomerTags: Relation<MktCustomerTagWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: MKT_CUSTOMER_FIELD_IDS.accountOwner,
    type: RelationType.MANY_TO_ONE,
    label: msg`Account Owner`,
    description: msg`Your team member responsible for managing the customer`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'accountOwnerForMktCustomers',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  accountOwner: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('accountOwner')
  accountOwnerId: string | null;

  @WorkspaceRelation({
    standardId: MKT_CUSTOMER_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline Activities linked to the customer`,
    icon: 'IconIconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    inverseSideFieldKey: 'mktCustomer',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_MKT_CUSTOMER,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;

  // personal_info
  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.personalIdNumber,
    type: FieldMetadataType.TEXT,
    label: msg`Personal ID Number`,
    description: msg`Customer personal ID number`,
    icon: 'IconId',
  })
  @WorkspaceIsNullable()
  personalIdNumber: string;

  // payment_info
  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.billingAddress,
    type: FieldMetadataType.TEXT,
    label: msg`Billing Address`,
    description: msg`Customer billing address`,
    icon: 'IconMapPin',
  })
  @WorkspaceIsNullable()
  billingAddress: string;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.bankInfo,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Bank Info`,
    description: msg`Customer bank info`,
    icon: 'IconBank',
  })
  @WorkspaceIsNullable()
  bankInfo: JSON;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.paymentPreferences,
    type: FieldMetadataType.TEXT,
    label: msg`Payment Preferences`,
    description: msg`Customer payment preferences`,
    icon: 'IconPayment',
  })
  @WorkspaceIsNullable()
  paymentPreferences: string;

  // social_info
  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.fanpage,
    type: FieldMetadataType.TEXT,
    label: msg`Fanpage`,
    description: msg`Customer fanpage`,
    icon: 'IconFanpage',
  })
  @WorkspaceIsNullable()
  fanpage: string;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.socialLinks,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Social Links`,
    description: msg`Customer social links`,
    icon: 'IconSocial',
  })
  @WorkspaceIsNullable()
  socialLinks: JSON;

  // tracking_info
  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.trialStatus,
    type: FieldMetadataType.TEXT,
    label: msg`Trial Status`,
    description: msg`Customer trial status`,
    icon: 'IconTrial',
  })
  @WorkspaceIsNullable()
  trialStatus: string;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.customerAcquisitionCost,
    type: FieldMetadataType.NUMBER,
    label: msg`Customer Acquisition Cost`,
    description: msg`Customer acquisition cost`,
  })
  @WorkspaceIsNullable()
  customerAcquisitionCost: number;

  // assignment_history
  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.assignmentHistory,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Assignment History`,
    description: msg`Customer assignment history`,
    icon: 'IconHistory',
  })
  @WorkspaceIsNullable()
  assignmentHistory: JSON;

  // validation_info
  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.emailValidated,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Email Validated`,
    description: msg`Customer email validated`,
    icon: 'IconEmail',
  })
  @WorkspaceIsNullable()
  emailValidated: boolean;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.phoneValidated,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Phone Validated`,
    description: msg`Customer phone validated`,
    icon: 'IconPhone',
  })
  @WorkspaceIsNullable()
  phoneValidated: boolean;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.idNumberValidated,
    type: FieldMetadataType.BOOLEAN,
    label: msg`ID Number Validated`,
    description: msg`Customer ID number validated`,
    icon: 'IconId',
  })
  @WorkspaceIsNullable()
  idNumberValidated: boolean;

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.taxCodeValidated,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Tax Code Validated`,
    description: msg`Customer tax code validated`,
  })
  @WorkspaceIsNullable()
  taxCodeValidated: boolean;

  // merge_suggestion
  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.mergeSuggestion,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Merge Suggestion`,
    description: msg`Customer merge suggestion`,
  })
  @WorkspaceIsNullable()
  mergeSuggestion: JSON;
}
