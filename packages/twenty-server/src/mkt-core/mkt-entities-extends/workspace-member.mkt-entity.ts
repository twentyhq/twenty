import { msg } from '@lingui/core/macro';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WORKSPACE_MEMBER_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { MktAttributeWorkspaceEntity } from 'src/mkt-core/attribute/mkt-attribute.workspace-entity';
import { MktComboVariantWorkspaceEntity } from 'src/mkt-core/combo-variant/mkt-combo-variant.workspace-entity';
import { MktComboWorkspaceEntity } from 'src/mkt-core/combo/mkt-combo.workspace-entity';
import { WORKSPACE_MEMBER_MKT_FIELD_IDS } from 'src/mkt-core/constants/mkt-field-ids';
import { MktContractWorkspaceEntity } from 'src/mkt-core/contract/mkt-contract.workspace-entity';
import { MktCustomerTagWorkspaceEntity } from 'src/mkt-core/customer-tag/mkt-customer-tag.workspace-entity';
import { MktCustomerWorkspaceEntity } from 'src/mkt-core/customer/mkt-customer.workspace-entity';
import { MktInvoiceWorkspaceEntity } from 'src/mkt-core/invoice/mkt-invoice.workspace-entity';
import { MktLicenseWorkspaceEntity } from 'src/mkt-core/license/mkt-license.workspace-entity';
import { MktDataAccessPolicyWorkspaceEntity } from 'src/mkt-core/mkt-data-access-policy/mkt-data-access-policy.workspace-entity';
import { MktDepartmentWorkspaceEntity } from 'src/mkt-core/mkt-department/mkt-department.workspace-entity';
import { MktEmploymentStatusWorkspaceEntity } from 'src/mkt-core/mkt-employment-status/mkt-employment-status.workspace-entity';
import { MktKpiTemplateWorkspaceEntity } from 'src/mkt-core/mkt-kpi-template/mkt-kpi-template.workspace-entity';
import { MktKpiWorkspaceEntity } from 'src/mkt-core/mkt-kpi/mkt-kpi.workspace-entity';
import { MktOrganizationLevelWorkspaceEntity } from 'src/mkt-core/mkt-organization-level/mkt-organization-level.workspace-entity';
import { MktPermissionAuditWorkspaceEntity } from 'src/mkt-core/mkt-permission-audit/mkt-permission-audit.workspace-entity';
import { MktStaffStatusHistoryWorkspaceEntity } from 'src/mkt-core/mkt-staff-status-history/mkt-staff-status-history.workspace-entity';
import { MktTemporaryPermissionWorkspaceEntity } from 'src/mkt-core/mkt-temporary-permission/mkt-temporary-permission.workspace-entity';
import { MktOrderItemWorkspaceEntity } from 'src/mkt-core/order-item/mkt-order-item.workspace-entity';
import { MktProductWorkspaceEntity } from 'src/mkt-core/product/standard-objects/mkt-product.workspace-entity';
import { MktTagWorkspaceEntity } from 'src/mkt-core/tag/mkt-tag.workspace-entity';
import { MktTemplateWorkspaceEntity } from 'src/mkt-core/template/mkt-template.workspace-entity';
import { MktValueWorkspaceEntity } from 'src/mkt-core/value/mkt-value.workspace-entity';
import { MktVariantWorkspaceEntity } from 'src/mkt-core/variant/mkt-variant.workspace-entity';
import { MktVariantAttributeWorkspaceEntity } from 'src/mkt-core/variant_attribute/mkt-variant-attribute.workspace-entity';

export class WorkspaceMemberMktEntity extends BaseWorkspaceEntity {
  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.accountOwnerForMktCustomers,
    type: RelationType.ONE_TO_MANY,
    label: msg`Account Owner For Customers`,
    description: msg`Account owner for customers`,
    icon: 'IconUser',
    inverseSideTarget: () => MktCustomerWorkspaceEntity,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  accountOwnerForMktCustomers: Relation<MktCustomerWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.accountOwnerForMktTags,
    type: RelationType.ONE_TO_MANY,
    label: msg`Account Owner For Tags`,
    description: msg`Account owner for tags`,
    icon: 'IconUser',
    inverseSideTarget: () => MktTagWorkspaceEntity,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  accountOwnerForMktTags: Relation<MktTagWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.accountOwnerForMktCustomerTags,
    type: RelationType.ONE_TO_MANY,
    label: msg`Account Owner For Customer Tags`,
    description: msg`Account owner for customer tags`,
    icon: 'IconUser',
    inverseSideTarget: () => MktCustomerTagWorkspaceEntity,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  accountOwnerForMktCustomerTags: Relation<MktCustomerTagWorkspaceEntity[]>;

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
    standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.accountOwnerForMktCombos,
    type: RelationType.ONE_TO_MANY,
    label: msg`Account Owner For Combos`,
    description: msg`Account owner for combos`,
    icon: 'IconBox',
    inverseSideTarget: () => MktComboWorkspaceEntity,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  accountOwnerForMktCombos: Relation<MktComboWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.accountOwnerForMktComboVariants,
    type: RelationType.ONE_TO_MANY,
    label: msg`Account Owner For Combo Variants`,
    description: msg`Account owner for combo variants`,
    icon: 'IconBox',
    inverseSideTarget: () => MktComboVariantWorkspaceEntity,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  accountOwnerForMktComboVariants: Relation<MktComboVariantWorkspaceEntity[]>;

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

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.department,
    type: RelationType.MANY_TO_ONE,
    label: msg`Department`,
    description: msg`Person's department`,
    icon: 'IconBuilding',
    inverseSideTarget: () => MktDepartmentWorkspaceEntity,
    inverseSideFieldKey: 'people',
  })
  @WorkspaceIsNullable()
  department: Relation<MktDepartmentWorkspaceEntity> | null;

  @WorkspaceJoinColumn('department')
  departmentId: string | null;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.staffStatusHistories,
    type: RelationType.ONE_TO_MANY,
    label: msg`Staff Status Histories`,
    description: msg`Staff employment status change history`,
    icon: 'IconHistory',
    inverseSideTarget: () => MktStaffStatusHistoryWorkspaceEntity,
    inverseSideFieldKey: 'staff',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  staffStatusHistories: Relation<MktStaffStatusHistoryWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.organizationLevel,
    type: RelationType.MANY_TO_ONE,
    label: msg`Organization Level`,
    description: msg`Person's organization level`,
    icon: 'IconHierarchy',
    inverseSideTarget: () => MktOrganizationLevelWorkspaceEntity,
    inverseSideFieldKey: 'people',
  })
  @WorkspaceIsNullable()
  organizationLevel: Relation<MktOrganizationLevelWorkspaceEntity> | null;

  @WorkspaceJoinColumn('organizationLevel')
  organizationLevelId: string | null;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.employmentStatus,
    type: RelationType.MANY_TO_ONE,
    label: msg`Employment Status`,
    description: msg`Person's employment status`,
    icon: 'IconUserCheck',
    inverseSideTarget: () => MktEmploymentStatusWorkspaceEntity,
    inverseSideFieldKey: 'people',
  })
  @WorkspaceIsNullable()
  employmentStatus: Relation<MktEmploymentStatusWorkspaceEntity> | null;

  @WorkspaceJoinColumn('employmentStatus')
  employmentStatusId: string | null;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.createdKpis,
    type: RelationType.ONE_TO_MANY,
    label: msg`Created KPIs`,
    description: msg`KPIs created by this person`,
    icon: 'IconTarget',
    inverseSideTarget: () => MktKpiWorkspaceEntity,
    inverseSideFieldKey: 'assignedTo',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsSystem()
  createdKpis: Relation<MktKpiWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.createdKpiTemplates,
    type: RelationType.ONE_TO_MANY,
    label: msg`Created KPI Templates`,
    description: msg`KPI templates created by this person`,
    icon: 'IconTemplate',
    inverseSideTarget: () => MktKpiTemplateWorkspaceEntity,
    inverseSideFieldKey: 'assignedTo',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsSystem()
  createdKpiTemplates: Relation<MktKpiTemplateWorkspaceEntity[]>;

  // === TEMPORARY PERMISSIONS RELATIONS ===
  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.grantedTemporaryPermissions,
    type: RelationType.ONE_TO_MANY,
    label: msg`Granted Temporary Permissions`,
    description: msg`Temporary permissions granted by this user`,
    icon: 'IconUserCheck',
    inverseSideTarget: () => MktTemporaryPermissionWorkspaceEntity,
    inverseSideFieldKey: 'granterWorkspaceMember',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  grantedTemporaryPermissions: Relation<
    MktTemporaryPermissionWorkspaceEntity[]
  >;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.receivedTemporaryPermissions,
    type: RelationType.ONE_TO_MANY,
    label: msg`Received Temporary Permissions`,
    description: msg`Temporary permissions received by this user`,
    icon: 'IconUser',
    inverseSideTarget: () => MktTemporaryPermissionWorkspaceEntity,
    inverseSideFieldKey: 'granteeWorkspaceMember',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  receivedTemporaryPermissions: Relation<
    MktTemporaryPermissionWorkspaceEntity[]
  >;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.revokedTemporaryPermissions,
    type: RelationType.ONE_TO_MANY,
    label: msg`Revoked Temporary Permissions`,
    description: msg`Temporary permissions revoked by this user`,
    icon: 'IconUserX',
    inverseSideTarget: () => MktTemporaryPermissionWorkspaceEntity,
    inverseSideFieldKey: 'revokedBy',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsSystem()
  revokedTemporaryPermissions: Relation<
    MktTemporaryPermissionWorkspaceEntity[]
  >;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.dataAccessPolicies,
    type: RelationType.ONE_TO_MANY,
    label: msg`Data Access Policies`,
    description: msg`Data access policies specifically assigned to this member`,
    icon: 'IconShield',
    inverseSideTarget: () => MktDataAccessPolicyWorkspaceEntity,
    inverseSideFieldKey: 'specificMember',
  })
  @WorkspaceIsSystem()
  dataAccessPolicies: Relation<MktDataAccessPolicyWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_MKT_FIELD_IDS.permissionAudits,
    type: RelationType.ONE_TO_MANY,
    label: msg`Permission Audits`,
    description: msg`Permission audit logs for this workspace member`,
    icon: 'IconShieldSearch',
    inverseSideTarget: () => MktPermissionAuditWorkspaceEntity,
    inverseSideFieldKey: 'workspaceMember',
  })
  @WorkspaceIsSystem()
  permissionAudits: Relation<MktPermissionAuditWorkspaceEntity[]>;
}
