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
  // customer fields
  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Customer name`,
    icon: 'IconUser',
  })
  name: string;

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
    standardId: MKT_CUSTOMER_FIELD_IDS.address,
    type: FieldMetadataType.TEXT,
    label: msg`Address`,
    description: msg`Customer address`,
    icon: 'IconMapPin',
  })
  @WorkspaceIsNullable()
  address: string;

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
    standardId: MKT_CUSTOMER_FIELD_IDS.totalOrderValue,
    type: FieldMetadataType.NUMBER,
    label: msg`Total Order Value`,
    description: msg`Customer total order value`,
    icon: 'IconMoney',
  })
  @WorkspaceIsNullable()
  totalOrderValue: number;

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

  @WorkspaceField({
    standardId: MKT_CUSTOMER_FIELD_IDS.tags,
    type: FieldMetadataType.MULTI_SELECT,
    label: msg`Tags`,
    description: msg`Customer tags`,
    icon: 'IconTags',
    options: MKT_CUSTOMER_TAGS_OPTIONS,
  })
  @WorkspaceIsNullable()
  tags: MKT_CUSTOMER_TAGS[];

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
}
