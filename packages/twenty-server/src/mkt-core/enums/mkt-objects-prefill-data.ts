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

export const MKT_PREFILLS = [
  // product prefills
  prefillMktProducts,
  prefillMktAttributes,
  prefillMktValues,
  prefillMktVariants,
  prefillMktVariantAttributes,
  // order prefills
  prefillMktTemplates,
  prefillMktOrders,
  prefillMktOrderItems,
  prefillMktContracts,
  prefillMktLicenses,
  prefillMktInvoices,
];
