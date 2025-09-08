import { MktCustomerTagWorkspaceEntity } from 'src/mkt-core/customer/objects/mkt-customer-tag.workspace-entity';
import { MktCustomerWorkspaceEntity } from 'src/mkt-core/customer/objects/mkt-customer.workspace-entity';
import { MktTagWorkspaceEntity } from 'src/mkt-core/customer/objects/mkt-tag.workspace-entity';
import { MktInvoiceWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-invoice.workspace-entity';
import { MktSInvoiceAuthWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice-auth.workspace-entity';
import { MktSInvoiceFileWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice-file.workspace-entity';
import { MktSInvoiceItemWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice-item.workspace-entity';
import { MktSInvoiceMetadataWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice-metadata.workspace-entity';
import { MktSInvoicePaymentWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice-payment.workspace-entity';
import { MktSInvoiceTaxBreakdownWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice-tax-breakdown.workspace-entity';
import { MktSInvoiceWorkspaceEntity } from 'src/mkt-core/invoice/objects/mkt-sinvoice.workspace-entity';
import { MktLicenseWorkspaceEntity } from 'src/mkt-core/license/mkt-license.workspace-entity';
import { MktDataAccessPolicyWorkspaceEntity } from 'src/mkt-core/mkt-data-access-policy/mkt-data-access-policy.workspace-entity';
import { MktDepartmentHierarchyWorkspaceEntity } from 'src/mkt-core/mkt-department-hierarchy/mkt-department-hierarchy.workspace-entity';
import { MktDepartmentWorkspaceEntity } from 'src/mkt-core/mkt-department/mkt-department.workspace-entity';
import { MktEmploymentStatusWorkspaceEntity } from 'src/mkt-core/mkt-employment-status/mkt-employment-status.workspace-entity';
import { MktKpiHistoryWorkspaceEntity } from 'src/mkt-core/mkt-kpi-history/mkt-kpi-history.workspace-entity';
import { MktKpiTemplateWorkspaceEntity } from 'src/mkt-core/mkt-kpi-template/mkt-kpi-template.workspace-entity';
import { MktKpiWorkspaceEntity } from 'src/mkt-core/mkt-kpi/mkt-kpi.workspace-entity';
import { MktOrganizationLevelWorkspaceEntity } from 'src/mkt-core/mkt-organization-level/mkt-organization-level.workspace-entity';
import { MktPermissionAuditWorkspaceEntity } from 'src/mkt-core/mkt-permission-audit/mkt-permission-audit.workspace-entity';
import { MktResellerTierHistoryWorkspaceEntity } from 'src/mkt-core/mkt-reseller-tier-history/mkt-reseller-tier-history.workspace-entity';
import { MktResellerTierWorkspaceEntity } from 'src/mkt-core/mkt-reseller-tier/mkt-reseller-tier.workspace-entity';
import { MktResellerWorkspaceEntity } from 'src/mkt-core/mkt-reseller/mkt-reseller.workspace-entity';
import { MktStaffStatusHistoryWorkspaceEntity } from 'src/mkt-core/mkt-staff-status-history/mkt-staff-status-history.workspace-entity';
import { MktTemporaryPermissionWorkspaceEntity } from 'src/mkt-core/mkt-temporary-permission/mkt-temporary-permission.workspace-entity';
import { MktContractWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-contract.workspace-entity';
import { MktOrderItemWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-order-item.workspace-entity';
import { MktTemplateWorkspaceEntity } from 'src/mkt-core/order/objects/mkt-template.workspace-entity';
import { MktPaymentMethodWorkspaceEntity } from 'src/mkt-core/payment-method/mkt-payment-method.workspace-entity';
import { MktPaymentWorkspaceEntity } from 'src/mkt-core/payment/mkt-payment.workspace-entity';
import { MktAttributeWorkspaceEntity } from 'src/mkt-core/product/objects/mkt-attribute.workspace-entity';
import { MktComboVariantWorkspaceEntity } from 'src/mkt-core/product/objects/mkt-combo-variant.workspace-entity';
import { MktComboWorkspaceEntity } from 'src/mkt-core/product/objects/mkt-combo.workspace-entity';
import { MktProductWorkspaceEntity } from 'src/mkt-core/product/objects/mkt-product.workspace-entity';
import { MktValueWorkspaceEntity } from 'src/mkt-core/product/objects/mkt-value.workspace-entity';
import { MktVariantAttributeWorkspaceEntity } from 'src/mkt-core/product/objects/mkt-variant-attribute.workspace-entity';
import { MktVariantWorkspaceEntity } from 'src/mkt-core/product/objects/mkt-variant.workspace-entity';

export const MKT_WORKSPACE_ENTITIES = [
  // Customer
  MktCustomerWorkspaceEntity,
  MktTagWorkspaceEntity,
  MktCustomerTagWorkspaceEntity,
  // Product
  MktProductWorkspaceEntity,
  MktAttributeWorkspaceEntity,
  MktVariantWorkspaceEntity,
  MktValueWorkspaceEntity,
  MktVariantAttributeWorkspaceEntity,
  // Combo
  MktComboWorkspaceEntity,
  MktComboVariantWorkspaceEntity,
  // Order
  //MktOrderWorkspaceEntity,
  MktOrderItemWorkspaceEntity,
  // Template
  MktTemplateWorkspaceEntity,
  // Contracts
  MktContractWorkspaceEntity,
  // License
  MktLicenseWorkspaceEntity,
  // Invoice
  MktInvoiceWorkspaceEntity,
  MktSInvoiceAuthWorkspaceEntity,
  MktSInvoiceWorkspaceEntity,
  MktSInvoicePaymentWorkspaceEntity,
  MktSInvoiceItemWorkspaceEntity,
  MktSInvoiceTaxBreakdownWorkspaceEntity,
  MktSInvoiceMetadataWorkspaceEntity,
  MktSInvoiceFileWorkspaceEntity,
  // Payment
  MktPaymentMethodWorkspaceEntity,
  MktPaymentWorkspaceEntity,
  // Seller Tier
  MktResellerTierWorkspaceEntity,
  MktResellerWorkspaceEntity,
  MktResellerTierHistoryWorkspaceEntity,
  // Organization Level
  MktOrganizationLevelWorkspaceEntity,
  MktEmploymentStatusWorkspaceEntity,
  MktDepartmentWorkspaceEntity,
];

export const MKT_FINAL_WORKSPACE_ENTITIES = [
  MktStaffStatusHistoryWorkspaceEntity,
  // KPI System
  MktKpiWorkspaceEntity,
  MktKpiTemplateWorkspaceEntity,
  MktKpiHistoryWorkspaceEntity,
  // Temporary Permission
  MktTemporaryPermissionWorkspaceEntity,
  MktDepartmentHierarchyWorkspaceEntity,
  MktDataAccessPolicyWorkspaceEntity,
  MktPermissionAuditWorkspaceEntity,
];
