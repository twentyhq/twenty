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
import { MktProductWorkspaceEntity } from 'src/mkt-core/product/standard-objects/mkt-product.workspace-entity';
import { MktValueWorkspaceEntity } from 'src/mkt-core/value/mkt-value.workspace-entity';
import { MktVariantWorkspaceEntity } from 'src/mkt-core/variant/mkt-variant.workspace-entity';
import { MktVariantAttributeWorkspaceEntity } from 'src/mkt-core/variant_attribute/mkt-variant-attribute.workspace-entity';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/mkt-order.workspace-entity';

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
}
