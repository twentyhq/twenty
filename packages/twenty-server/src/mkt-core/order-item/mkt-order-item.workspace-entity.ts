import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
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
import { MKT_ORDER_ITEM_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MKT_OBJECT_IDS } from 'src/mkt-core/constants/mkt-object-ids';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/mkt-order.workspace-entity';
import { MktProductWorkspaceEntity } from 'src/mkt-core/product/standard-objects/mkt-product.workspace-entity';
import { MktVariantWorkspaceEntity } from 'src/mkt-core/variant/mkt-variant.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const SEARCH_FIELDS_FOR_ORDER_ITEM: FieldTypeAndNameMetadata[] = [
  { name: 'name', type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktOrderItem,
  namePlural: 'orderItems',
  labelSingular: msg`Order Item`,
  labelPlural: msg`Order Items`,
  description: msg`Represents an item in an order.`,
  icon: 'IconShoppingCartCog',
  shortcut: 'OI',
  labelIdentifierStandardId: MKT_ORDER_ITEM_FIELD_IDS.name,
})
@WorkspaceIsSearchable()
export class MktOrderItemWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MKT_ORDER_ITEM_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
  })
  name: string;

  @WorkspaceField({
    standardId: MKT_ORDER_ITEM_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Position in list`,
    icon: 'IconHierarchy',
  })
  @WorkspaceIsNullable()
  position: number;

  @WorkspaceField({
    standardId: MKT_ORDER_ITEM_FIELD_IDS.quantity,
    type: FieldMetadataType.NUMBER,
    label: msg`Quantity`,
    description: msg`Quantity of the product`,
    icon: 'IconNumbers',
  })
  @WorkspaceIsNullable()
  quantity: number;

  @WorkspaceField({
    standardId: MKT_ORDER_ITEM_FIELD_IDS.unitPrice,
    type: FieldMetadataType.NUMBER,
    label: msg`Unit Price`,
    description: msg`Price per unit of the product`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  unitPrice?: number;

  @WorkspaceField({
    standardId: MKT_ORDER_ITEM_FIELD_IDS.snapshotProductName,
    type: FieldMetadataType.TEXT,
    label: msg`Snapshot Product Name`,
    description: msg`Snapshot product name`,
  })
  @WorkspaceIsNullable()
  snapshotProductName: string;

  @WorkspaceField({
    standardId: MKT_ORDER_ITEM_FIELD_IDS.unitName,
    type: FieldMetadataType.TEXT,
    label: msg`Unit Name`,
    description: msg`Unit name`,
  })
  @WorkspaceIsNullable()
  unitName: string;

  @WorkspaceField({
    standardId: MKT_ORDER_ITEM_FIELD_IDS.taxPercentage,
    type: FieldMetadataType.NUMBER,
    label: msg`Tax Percentage`,
    description: msg`Tax percentage for this line item`,
  })
  @WorkspaceIsNullable()
  taxPercentage: number;

  @WorkspaceField({
    standardId: MKT_ORDER_ITEM_FIELD_IDS.taxAmount,
    type: FieldMetadataType.NUMBER,
    label: msg`Tax Amount`,
    description: msg`Tax amount for this line item`,
  })
  @WorkspaceIsNullable()
  taxAmount: number;

  @WorkspaceField({
    standardId: MKT_ORDER_ITEM_FIELD_IDS.totalAmountWithTax,
    type: FieldMetadataType.NUMBER,
    label: msg`Total Amount with Tax`,
    description: msg`Total amount with tax for this line item`,
  })
  @WorkspaceIsNullable()
  totalAmountWithTax: number;

  @WorkspaceField({
    standardId: MKT_ORDER_ITEM_FIELD_IDS.totalPrice,
    type: FieldMetadataType.NUMBER,
    label: msg`Total Price`,
    description: msg`Total price for this line item (quantity * unit price)`,
    icon: 'IconCurrencyDollar',
  })
  @WorkspaceIsNullable()
  totalPrice?: number;

  @WorkspaceRelation({
    standardId: MKT_ORDER_ITEM_FIELD_IDS.mktOrder,
    type: RelationType.MANY_TO_ONE,
    label: msg`Order`,
    description: msg`Order this item belongs to`,
    icon: 'IconShoppingCart',
    inverseSideTarget: () => MktOrderWorkspaceEntity,
    inverseSideFieldKey: 'orderItems',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  mktOrder: Relation<MktOrderWorkspaceEntity>;

  @WorkspaceJoinColumn('mktOrder')
  mktOrderId: string;

  @WorkspaceRelation({
    standardId: MKT_ORDER_ITEM_FIELD_IDS.mktProduct,
    type: RelationType.MANY_TO_ONE,
    label: msg`Product`,
    description: msg`Product for this order item`,
    icon: 'IconBox',
    inverseSideTarget: () => MktProductWorkspaceEntity,
    inverseSideFieldKey: 'orderItems',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  mktProduct?: Relation<MktProductWorkspaceEntity>;

  @WorkspaceJoinColumn('mktProduct')
  mktProductId?: string;

  @WorkspaceRelation({
    standardId: MKT_ORDER_ITEM_FIELD_IDS.mktVariant,
    type: RelationType.MANY_TO_ONE,
    label: msg`Variant`,
    description: msg`Variant for this order item`,
    icon: 'IconBox',
    inverseSideTarget: () => MktVariantWorkspaceEntity,
    inverseSideFieldKey: 'mktOrderItems',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  mktVariant?: Relation<MktVariantWorkspaceEntity>;

  @WorkspaceJoinColumn('mktVariant')
  mktVariantId: string | null;

  // Temporarily commented out due to TimelineActivityMktEntity not being a registered entity
  // @WorkspaceRelation({
  //   standardId: MKT_ORDER_ITEM_FIELD_IDS.timelineActivities,
  //   type: RelationType.MANY_TO_ONE,
  //   label: msg`Timeline Activity`,
  //   description: msg`Timeline Activity that owns this order item`,
  //   icon: 'IconTimelineEvent',
  //   inverseSideTarget: () => TimelineActivityMktEntity,
  //   inverseSideFieldKey: 'mktOrderItem',
  //   onDelete: RelationOnDeleteAction.SET_NULL,
  // })
  // @WorkspaceIsNullable()
  // @WorkspaceIsSystem()
  // timelineActivity: Relation<TimelineActivityMktEntity> | null;

  // @WorkspaceJoinColumn('timelineActivity')
  // timelineActivityId: string | null;

  @WorkspaceField({
    standardId: MKT_ORDER_ITEM_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconSearch',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_ORDER_ITEM,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;

  @WorkspaceRelation({
    standardId: MKT_ORDER_ITEM_FIELD_IDS.accountOwner,
    type: RelationType.MANY_TO_ONE,
    label: msg`Account Owner`,
    description: msg`Your team member responsible for managing the order item`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'accountOwnerForMktOrderItems',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  accountOwner: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('accountOwner')
  accountOwnerId: string | null;

  @WorkspaceField({
    standardId: MKT_ORDER_ITEM_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;
}
