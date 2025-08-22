import { prefillMktAttributes } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-attributes';
import { prefillMktContracts } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-contracts';
import { prefillMktInvoices } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-invoices';
import { prefillMktLicenses } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-licenses';
import { prefillMktOrderItems } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-order-items';
import { prefillMktOrders } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-orders';
import { prefillMktProducts } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-products';
import { prefillMktTemplates } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-templates';
import { prefillMktValues } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-values';
import { prefillMktVariantAttributes } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-variant-attribute';
import { prefillMktVariants } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-variants';
import { prefillMktPaymentMethods } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-payment-methods';
import { prefillMktPayments } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-payments';
import { prefillMktResellerTiers } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-reseller-tiers';
import { prefillMktResellers } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-resellers';
import { prefillMktResellerTierHistories } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-reseller-tier-histories';
import { prefillMktOrganizationLevels } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-organization-levels';
import { prefillMktEmploymentStatuses } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-employment-statuses';
import { prefillMktStaffStatusHistories } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-staff-status-histories';
import { prefillMktDepartments } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-departments';
import { prefillMktKpis } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-kpis';
import { prefillMktKpiTemplates } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-kpi-templates';

export const MKT_PREFILLS = [
  // product prefills
  prefillMktProducts,
  prefillMktAttributes,
  prefillMktValues,
  prefillMktVariants,
  prefillMktVariantAttributes,
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
