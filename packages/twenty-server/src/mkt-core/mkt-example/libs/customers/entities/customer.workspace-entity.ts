import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';
import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CUSTOMER_STANDARD_FIELD_IDS } from 'src/mkt-core/mkt-example/common/constants/custom-field-ids';
import { CUSTOM_OBJECT_IDS } from 'src/mkt-core/mkt-example/common/constants/custom-object-ids';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

@WorkspaceEntity({
  standardId: CUSTOM_OBJECT_IDS.customer,
  namePlural: 'mktCustomers',
  labelSingular: msg`CustomerTest`,
  labelPlural: msg`CustomerTest`,
  description: msg`Marketing CRM Customer Test Entity`,
  icon: 'IconUser',
  labelIdentifierStandardId: CUSTOMER_STANDARD_FIELD_IDS.name,
})
export class MktCustomerWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CUSTOMER_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Customer full name`,
    icon: 'IconUser',
  })
  name: string;

  @WorkspaceField({
    standardId: CUSTOMER_STANDARD_FIELD_IDS.customerType,
    type: FieldMetadataType.TEXT,
    label: msg`Customer Type`,
    description: msg`Type of customer`,
    icon: 'IconCategory',
  })
  @WorkspaceIsNullable()
  customerType?: string;

  @WorkspaceField({
    standardId: CUSTOMER_STANDARD_FIELD_IDS.customerEmailPrimaryEmail,
    type: FieldMetadataType.TEXT,
    label: msg`Email`,
    description: msg`Customer email address`,
    icon: 'IconMail',
  })
  @WorkspaceIsNullable()
  customerEmailPrimaryEmail?: string;

  @WorkspaceField({
    standardId: CUSTOMER_STANDARD_FIELD_IDS.customerPhonePrimaryPhoneNumber,
    type: FieldMetadataType.TEXT,
    label: msg`Phone`,
    description: msg`Customer phone number`,
    icon: 'IconPhone',
  })
  @WorkspaceIsNullable()
  customerPhonePrimaryPhoneNumber?: string;

  @WorkspaceField({
    standardId: CUSTOMER_STANDARD_FIELD_IDS.taxCode,
    type: FieldMetadataType.TEXT,
    label: msg`Tax Code`,
    description: msg`Customer tax identification code`,
    icon: 'IconReceipt',
  })
  @WorkspaceIsNullable()
  taxCode?: string;

  @WorkspaceField({
    standardId: CUSTOMER_STANDARD_FIELD_IDS.companyName,
    type: FieldMetadataType.TEXT,
    label: msg`Company`,
    description: msg`Customer company`,
    icon: 'IconBuilding',
  })
  @WorkspaceIsNullable()
  companyName?: string;

  @WorkspaceField({
    standardId: CUSTOMER_STANDARD_FIELD_IDS.customerAddress,
    type: FieldMetadataType.TEXT,
    label: msg`Address`,
    description: msg`Customer address`,
    icon: 'IconMapPin',
  })
  @WorkspaceIsNullable()
  customerAddress?: string;

  @WorkspaceField({
    standardId: CUSTOMER_STANDARD_FIELD_IDS.customerStatus,
    type: FieldMetadataType.TEXT,
    label: msg`Customer Status`,
    description: msg`Current status of customer`,
    icon: 'IconCircleCheck',
  })
  @WorkspaceIsNullable()
  customerStatus?: string;

  @WorkspaceField({
    standardId: CUSTOMER_STANDARD_FIELD_IDS.customerTier,
    type: FieldMetadataType.TEXT,
    label: msg`Customer Tier`,
    description: msg`Customer tier level`,
    icon: 'IconStar',
  })
  @WorkspaceIsNullable()
  customerTier?: string;

  @WorkspaceField({
    standardId: CUSTOMER_STANDARD_FIELD_IDS.customerLifecycleStage,
    type: FieldMetadataType.TEXT,
    label: msg`Lifecycle Stage`,
    description: msg`Customer lifecycle stage`,
    icon: 'IconGrowth',
  })
  @WorkspaceIsNullable()
  customerLifecycleStage?: string;

  @WorkspaceField({
    standardId: CUSTOMER_STANDARD_FIELD_IDS.customerTotalOrderValue,
    type: FieldMetadataType.NUMBER,
    label: msg`Total Order Value`,
    description: msg`Total value of all customer orders`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  customerTotalOrderValue?: number;

  @WorkspaceField({
    standardId: CUSTOMER_STANDARD_FIELD_IDS.customerTags,
    type: FieldMetadataType.TEXT,
    label: msg`Customer Tags`,
    description: msg`Tags associated with customer`,
    icon: 'IconTag',
  })
  @WorkspaceIsNullable()
  customerTags?: string;

  @WorkspaceField({
    standardId: CUSTOMER_STANDARD_FIELD_IDS.customerTest,
    type: FieldMetadataType.TEXT,
    label: msg`Customer Test`,
    description: msg`Test field for customer`,
    icon: 'IconTestPipe',
  })
  @WorkspaceIsNullable()
  customerTest?: string;

  @WorkspaceField({
    standardId: CUSTOMER_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position`,
    icon: 'IconHierarchy2',
    defaultValue: 1,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: CUSTOMER_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: CUSTOMER_STANDARD_FIELD_IDS.timelineActivities,
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
}
