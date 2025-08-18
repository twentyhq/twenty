import { MktAttributeWorkspaceEntity } from 'src/mkt-core/attribute/mkt-attribute.workspace-entity';
import { MktContractWorkspaceEntity } from 'src/mkt-core/contract/mkt-contract.workspace-entity';
import { MktInvoiceWorkspaceEntity } from 'src/mkt-core/invoice/mkt-invoice.workspace-entity';
import { MktLicenseWorkspaceEntity } from 'src/mkt-core/license/mkt-license.workspace-entity';
import { MktOrderItemWorkspaceEntity } from 'src/mkt-core/order-item/mkt-order-item.workspace-entity';
import { MktOrderWorkspaceEntity } from 'src/mkt-core/order/mkt-order.workspace-entity';
import { MktProductWorkspaceEntity } from 'src/mkt-core/product/standard-objects/mkt-product.workspace-entity';
import { MktTemplateWorkspaceEntity } from 'src/mkt-core/template/mkt-template.workspace-entity';
import { MktValueWorkspaceEntity } from 'src/mkt-core/value/mkt-value.workspace-entity';
import { MktVariantWorkspaceEntity } from 'src/mkt-core/variant/mkt-variant.workspace-entity';
import { MktVariantAttributeWorkspaceEntity } from 'src/mkt-core/variant_attribute/mkt-variant-attribute.workspace-entity';
import { MktPaymentMethodWorkspaceEntity } from 'src/mkt-core/payment-method/mkt-payment-method.workspace-entity';
import { MktPaymentWorkspaceEntity } from 'src/mkt-core/payment/mkt-payment.workspace-entity';
import { MktResellerTierWorkspaceEntity } from 'src/mkt-core/mkt-reseller-tier/mkt-reseller-tier';
import { MktResellerWorkspaceEntity } from 'src/mkt-core/mkt-reseller/mkt-reseller.workspace-entity';

export const MKT_WORKSPACE_ENTITIES = [
  // Product
  MktProductWorkspaceEntity,
  MktAttributeWorkspaceEntity,
  MktVariantWorkspaceEntity,
  MktValueWorkspaceEntity,
  MktVariantAttributeWorkspaceEntity,
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
];
