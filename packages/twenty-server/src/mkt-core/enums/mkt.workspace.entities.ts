import { MktAttributeWorkspaceEntity } from 'src/mkt-core/attribute/mkt-attribute.workspace-entity';
import { MktComboVariantWorkspaceEntity } from 'src/mkt-core/combo-variant/mkt-combo-variant.workspace-entity';
import { MktComboWorkspaceEntity } from 'src/mkt-core/combo/mkt-combo.workspace-entity';
import { MktContractWorkspaceEntity } from 'src/mkt-core/contract/mkt-contract.workspace-entity';
import { MktCustomerWorkspaceEntity } from 'src/mkt-core/customer/mkt-customer.workspace-entity';
import { MktInvoiceWorkspaceEntity } from 'src/mkt-core/invoice/mkt-invoice.workspace-entity';
import { MktLicenseWorkspaceEntity } from 'src/mkt-core/license/mkt-license.workspace-entity';
import { MktDepartmentWorkspaceEntity } from 'src/mkt-core/mkt-department/mkt-department.workspace-entity';
import { MktEmploymentStatusWorkspaceEntity } from 'src/mkt-core/mkt-employment-status/mkt-employment-status.workspace-entity';
import { MktKpiHistoryWorkspaceEntity } from 'src/mkt-core/mkt-kpi-history/mkt-kpi-history.workspace-entity';
import { MktKpiTemplateWorkspaceEntity } from 'src/mkt-core/mkt-kpi-template/mkt-kpi-template.workspace-entity';
import { MktKpiWorkspaceEntity } from 'src/mkt-core/mkt-kpi/mkt-kpi.workspace-entity';
import { MktOrganizationLevelWorkspaceEntity } from 'src/mkt-core/mkt-organization-level/mkt-organization-level.workspace-entity';
import { MktResellerTierHistoryWorkspaceEntity } from 'src/mkt-core/mkt-reseller-tier-history/mkt-reseller-tier-history.workspace-entity';
import { MktResellerTierWorkspaceEntity } from 'src/mkt-core/mkt-reseller-tier/mkt-reseller-tier.workspace-entity';
import { MktResellerWorkspaceEntity } from 'src/mkt-core/mkt-reseller/mkt-reseller.workspace-entity';
import { MktStaffStatusHistoryWorkspaceEntity } from 'src/mkt-core/mkt-staff-status-history/mkt-staff-status-history.workspace-entity';
import { MktOrderItemWorkspaceEntity } from 'src/mkt-core/order-item/mkt-order-item.workspace-entity';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/mkt-order.workspace-entity';
import { MktPaymentMethodWorkspaceEntity } from 'src/mkt-core/payment-method/mkt-payment-method.workspace-entity';
import { MktPaymentWorkspaceEntity } from 'src/mkt-core/payment/mkt-payment.workspace-entity';
import { MktProductWorkspaceEntity } from 'src/mkt-core/product/standard-objects/mkt-product.workspace-entity';
import { MktTemplateWorkspaceEntity } from 'src/mkt-core/template/mkt-template.workspace-entity';
import { MktValueWorkspaceEntity } from 'src/mkt-core/value/mkt-value.workspace-entity';
import { MktVariantWorkspaceEntity } from 'src/mkt-core/variant/mkt-variant.workspace-entity';
import { MktVariantAttributeWorkspaceEntity } from 'src/mkt-core/variant_attribute/mkt-variant-attribute.workspace-entity';

export const MKT_WORKSPACE_ENTITIES = [
  // Customer
  MktCustomerWorkspaceEntity,
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
  MktOrderWorkspaceEntity,
  MktOrderItemWorkspaceEntity,
  // Template
  MktTemplateWorkspaceEntity,
  // Contracts
  MktContractWorkspaceEntity,
  // License
  MktLicenseWorkspaceEntity,
  // Invoice
  MktInvoiceWorkspaceEntity,
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
];
