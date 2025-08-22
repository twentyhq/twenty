import { msg } from '@lingui/core/macro';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { MktAttributeWorkspaceEntity } from 'src/mkt-core/attribute/mkt-attribute.workspace-entity';
import { WORKSPACE_MEMBER_MKT_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MktContractWorkspaceEntity } from 'src/mkt-core/contract/mkt-contract.workspace-entity';
import { MktInvoiceWorkspaceEntity } from 'src/mkt-core/invoice/mkt-invoice.workspace-entity';
import { MktLicenseWorkspaceEntity } from 'src/mkt-core/license/mkt-license.workspace-entity';
import { MktOrderItemWorkspaceEntity } from 'src/mkt-core/order-item/mkt-order-item.workspace-entity';
import { MktProductWorkspaceEntity } from 'src/mkt-core/product/standard-objects/mkt-product.workspace-entity';
import { MktValueWorkspaceEntity } from 'src/mkt-core/value/mkt-value.workspace-entity';
import { MktVariantWorkspaceEntity } from 'src/mkt-core/variant/mkt-variant.workspace-entity';
import { MktVariantAttributeWorkspaceEntity } from 'src/mkt-core/variant_attribute/mkt-variant-attribute.workspace-entity';
import { MktTemplateWorkspaceEntity } from 'src/mkt-core/template/mkt-template.workspace-entity';

export class WorkspaceMemberMktEntity extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.accountOwnerForMktProducts,
    type: RelationType.ONE_TO_MANY,
    label: msg`Account Owner For Products`,
    description: msg`Account owner for products`,
    icon: 'IconBox',
    inverseSideTarget: () => MktProductWorkspaceEntity,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  accountOwnerForMktProducts: Relation<MktProductWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.accountOwnerForMktAttributes,
    type: RelationType.ONE_TO_MANY,
    label: msg`Account Owner For Attributes`,
    description: msg`Account owner for attributes`,
    icon: 'IconBox',
    inverseSideTarget: () => MktAttributeWorkspaceEntity,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  accountOwnerForMktAttributes: Relation<MktAttributeWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.accountOwnerForMktVariants,
    type: RelationType.ONE_TO_MANY,
    label: msg`Account Owner For Variants`,
    description: msg`Account owner for variants`,
    icon: 'IconBoxMultiple',
    inverseSideTarget: () => MktVariantWorkspaceEntity,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  accountOwnerForMktVariants: Relation<MktVariantWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.accountOwnerForMktValues,
    type: RelationType.ONE_TO_MANY,
    label: msg`Account Owner For Values`,
    description: msg`Account owner for values`,
    icon: 'IconListDetails',
    inverseSideTarget: () => MktValueWorkspaceEntity,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  accountOwnerForMktValues: Relation<MktValueWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId:
      WORKSPACE_MEMBER_MKT_FIELD_IDS.accountOwnerForMktVariantAttributes,
    type: RelationType.ONE_TO_MANY,
    label: msg`Account Owner For Variant Attributes`,
    description: msg`Account owner for variant attributes`,
    icon: 'IconListDetails',
    inverseSideTarget: () => MktVariantAttributeWorkspaceEntity,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  accountOwnerForMktVariantAttributes: Relation<
    MktVariantAttributeWorkspaceEntity[]
  >;

  // @WorkspaceRelation({
  //   standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.accountOwnerForMktOrders,
  //   type: RelationType.ONE_TO_MANY,
  //   label: msg`Account Owner For Orders`,
  //   description: msg`Account owner for orders`,
  //   icon: 'IconShoppingCart',
  //   inverseSideTarget: () => MktOrderWorkspaceEntity,
  //   inverseSideFieldKey: 'accountOwner',
  //   onDelete: RelationOnDeleteAction.SET_NULL,
  // })
  // accountOwnerForMktOrders: Relation<MktOrderWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.accountOwnerForMktLicenses,
    type: RelationType.ONE_TO_MANY,
    label: msg`Account Owner For Licenses`,
    description: msg`Account owner for licenses`,
    icon: 'IconBox',
    inverseSideTarget: () => MktLicenseWorkspaceEntity,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  accountOwnerForMktLicenses: Relation<MktLicenseWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.accountOwnerForMktContracts,
    type: RelationType.ONE_TO_MANY,
    label: msg`Account Owner For Contracts`,
    description: msg`Account owner for contracts`,
    icon: 'IconBox',
    inverseSideTarget: () => MktContractWorkspaceEntity,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  accountOwnerForMktContracts: Relation<MktContractWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.accountOwnerForMktOrderItems,
    type: RelationType.ONE_TO_MANY,
    label: msg`Account Owner For Order Items`,
    description: msg`Account owner for order items`,
    icon: 'IconShoppingCartCog',
    inverseSideTarget: () => MktOrderItemWorkspaceEntity,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  accountOwnerForMktOrderItems: Relation<MktOrderItemWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.accountOwnerForMktInvoices,
    type: RelationType.ONE_TO_MANY,
    label: msg`Account Owner For Invoices`,
    description: msg`Account owner for invoices`,
    icon: 'IconBox',
    inverseSideTarget: () => MktInvoiceWorkspaceEntity,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  accountOwnerForMktInvoices: Relation<MktInvoiceWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.accountOwnerForMktTemplates,
    type: RelationType.ONE_TO_MANY,
    label: msg`Account Owner For Templates`,
    description: msg`Account owner for templates`,
    icon: 'IconBox',
    inverseSideTarget: () => MktTemplateWorkspaceEntity,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  accountOwnerForMktTemplates: Relation<MktTemplateWorkspaceEntity[]>;

  // @WorkspaceRelation({
  //   standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.accountOwnerForMktKpiTemplates,
  //   type: RelationType.ONE_TO_MANY,
  //   label: msg`Account Owner For KPI Templates`,
  //   description: msg`Account owner for KPI templates`,
  //   icon: 'IconTemplate',
  //   inverseSideTarget: () => MktKpiTemplateWorkspaceEntity,
  //   inverseSideFieldKey: 'accountOwner',
  //   onDelete: RelationOnDeleteAction.SET_NULL,
  // })
  // accountOwnerForMktKpiTemplates: Relation<MktKpiTemplateWorkspaceEntity[]>;
}
