import { prefillMktAttributes } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-attributes';
import { prefillMktComboVariants } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-combo-variants';
import { prefillMktCombos } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-combos';
import { prefillMktContracts } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-contracts';
import { prefillMktCustomers } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-customers';
import { prefillMktDepartments } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-departments';
import { prefillMktEmploymentStatuses } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-employment-statuses';
import { prefillMktInvoices } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-invoices';
import { prefillMktKpiTemplates } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-kpi-templates';
import { prefillMktKpis } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-kpis';
import { prefillMktLicenses } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-licenses';
import { prefillMktOrderItems } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-order-items';
import { prefillMktOrders } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-orders';
import { prefillMktOrganizationLevels } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-organization-levels';
import { prefillMktPaymentMethods } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-payment-methods';
import { prefillMktPayments } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-payments';
import { prefillMktProducts } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-products';
import { prefillMktResellerTierHistories } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-reseller-tier-histories';
import { prefillMktResellerTiers } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-reseller-tiers';
import { prefillMktResellers } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-resellers';
import { prefillMktStaffStatusHistories } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-staff-status-histories';
import { prefillMktTemplates } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-templates';
import { prefillMktValues } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-values';
import { prefillMktVariantAttributes } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-variant-attribute';
import { prefillMktVariants } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-variants';

export const MKT_PREFILLS = [
  // customer prefills
  prefillMktCustomers,
  // product prefills
  prefillMktProducts,
  prefillMktAttributes,
  prefillMktValues,
  prefillMktVariants,
  prefillMktVariantAttributes,
  // combo prefills
  prefillMktCombos,
  prefillMktComboVariants,
  // order prefills
  prefillMktOrders,
  prefillMktOrderItems,
  // template prefills
  prefillMktTemplates,
  // contract prefills
  prefillMktContracts,
  // license prefills
  prefillMktLicenses,
  // invoice prefills
  prefillMktInvoices,
  // payment prefills (after orders to reference existing orders)
  prefillMktPaymentMethods,
  prefillMktPayments,
  // reseller prefills
  prefillMktResellerTiers,
  prefillMktResellers,
  prefillMktResellerTierHistories,
  // organization level prefills
  prefillMktOrganizationLevels,
  prefillMktEmploymentStatuses,
  prefillMktDepartments,
  prefillMktStaffStatusHistories,
  prefillMktKpis,
  prefillMktKpiTemplates,
];
