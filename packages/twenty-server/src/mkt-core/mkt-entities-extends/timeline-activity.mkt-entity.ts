import { msg } from '@lingui/core/macro';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { MktAttributeWorkspaceEntity } from 'src/mkt-core/attribute/mkt-attribute.workspace-entity';
import { TIMELINE_ACTIVITY_MKT_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MktInvoiceWorkspaceEntity } from 'src/mkt-core/invoice/mkt-invoice.workspace-entity';
import { MktLicenseWorkspaceEntity } from 'src/mkt-core/license/mkt-license.workspace-entity';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/mkt-order.workspace-entity';
import { MktProductWorkspaceEntity } from 'src/mkt-core/product/standard-objects/mkt-product.workspace-entity';
import { MktValueWorkspaceEntity } from 'src/mkt-core/value/mkt-value.workspace-entity';
import { MktVariantWorkspaceEntity } from 'src/mkt-core/variant/mkt-variant.workspace-entity';
import { MktVariantAttributeWorkspaceEntity } from 'src/mkt-core/variant_attribute/mkt-variant-attribute.workspace-entity';
import { MktTemplateWorkspaceEntity } from 'src/mkt-core/template/mkt-template.workspace-entity';

export class TimelineActivityMktEntity extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_MKT_FIELD_IDS.mktProduct,
    type: RelationType.MANY_TO_ONE,
    label: msg`Product`,
    description: msg`Event product`,
    icon: 'IconBox',
    inverseSideTarget: () => MktProductWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktProduct: Relation<MktProductWorkspaceEntity> | null;

  @WorkspaceJoinColumn('mktProduct')
  mktProductId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_MKT_FIELD_IDS.mktAttribute,
    type: RelationType.MANY_TO_ONE,
    label: msg`Attribute`,
    description: msg`Event attribute`,
    icon: 'IconTag',
    inverseSideTarget: () => MktAttributeWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktAttribute: Relation<MktAttributeWorkspaceEntity> | null;

  @WorkspaceJoinColumn('mktAttribute')
  mktAttributeId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_MKT_FIELD_IDS.mktVariant,
    type: RelationType.MANY_TO_ONE,
    label: msg`Variant`,
    description: msg`Event variant`,
    icon: 'IconBoxMultiple',
    inverseSideTarget: () => MktVariantWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktVariant: Relation<MktVariantWorkspaceEntity> | null;

  @WorkspaceJoinColumn('mktVariant')
  mktVariantId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_MKT_FIELD_IDS.mktValue,
    type: RelationType.MANY_TO_ONE,
    label: msg`Value`,
    description: msg`Event value`,
    icon: 'IconListDetails',
    inverseSideTarget: () => MktValueWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktValue: Relation<MktValueWorkspaceEntity> | null;

  @WorkspaceJoinColumn('mktValue')
  mktValueId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_MKT_FIELD_IDS.mktVariantAttribute,
    type: RelationType.MANY_TO_ONE,
    label: msg`Variant Attribute`,
    description: msg`Event variant attribute`,
    icon: 'IconListDetails',
    inverseSideTarget: () => MktVariantAttributeWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktVariantAttribute: Relation<MktVariantAttributeWorkspaceEntity> | null;

  @WorkspaceJoinColumn('mktVariantAttribute')
  mktVariantAttributeId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_MKT_FIELD_IDS.mktOrder,
    type: RelationType.MANY_TO_ONE,
    label: msg`Order`,
    description: msg`Event order`,
    icon: 'IconShoppingCart',
    inverseSideTarget: () => MktOrderWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktOrder: Relation<MktOrderWorkspaceEntity> | null;

  @WorkspaceJoinColumn('mktOrder')
  mktOrderId: string | null;

  // Temporarily commented out due to TimelineActivityMktEntity not being a registered entity
  // @WorkspaceRelation({
  //   standardId: TIMELINE_ACTIVITY_MKT_FIELD_IDS.mktOrderItem,
  //   type: RelationType.MANY_TO_ONE,
  //   label: msg`Order Item`,
  //   description: msg`Event order item`,
  //   icon: 'IconShoppingCartCog',
  //   inverseSideTarget: () => MktOrderItemWorkspaceEntity,
  //   inverseSideFieldKey: 'timelineActivity',
  //   onDelete: RelationOnDeleteAction.CASCADE,
  // })
  // @WorkspaceIsNullable()
  // mktOrderItem: Relation<MktOrderItemWorkspaceEntity> | null;

  // @WorkspaceJoinColumn('mktOrderItem')
  // mktOrderItemId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_MKT_FIELD_IDS.mktLicense,
    type: RelationType.MANY_TO_ONE,
    label: msg`License`,
    description: msg`Event license`,
    icon: 'IconBox',
    inverseSideTarget: () => MktLicenseWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktLicense: Relation<MktLicenseWorkspaceEntity> | null;

  @WorkspaceJoinColumn('mktLicense')
  mktLicenseId: string | null;

  // Temporarily commented out due to relation conflicts
  // @WorkspaceRelation({
  //   standardId: TIMELINE_ACTIVITY_MKT_FIELD_IDS.mktContract,
  //   type: RelationType.MANY_TO_ONE,
  //   label: msg`Contract`,
  //   description: msg`Event contract`,
  //   icon: 'IconBox',
  //   inverseSideTarget: () => MktContractWorkspaceEntity,
  //   inverseSideFieldKey: 'timelineActivities',
  //   onDelete: RelationOnDeleteAction.CASCADE,
  // })
  // @WorkspaceIsNullable()
  // mktContract: Relation<MktContractWorkspaceEntity> | null;

  // @WorkspaceJoinColumn('mktContract')
  // mktContractId: string | null;


  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_MKT_FIELD_IDS.mktInvoice,
    type: RelationType.MANY_TO_ONE,
    label: msg`Invoice`,
    description: msg`Event invoice`,
    icon: 'IconBox',
    inverseSideTarget: () => MktInvoiceWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktInvoice: Relation<MktInvoiceWorkspaceEntity> | null;

  @WorkspaceJoinColumn('mktInvoice')
  mktInvoiceId: string | null;

  @WorkspaceRelation({
    standardId: TIMELINE_ACTIVITY_MKT_FIELD_IDS.mktTemplate,
    type: RelationType.MANY_TO_ONE,
    label: msg`Template`,
    description: msg`Event template`,
    icon: 'IconBox',
    inverseSideTarget: () => MktTemplateWorkspaceEntity,
    inverseSideFieldKey: 'timelineActivities',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  mktTemplate: Relation<MktTemplateWorkspaceEntity> | null;

  @WorkspaceJoinColumn('mktTemplate')
  mktTemplateId: string | null;
}
