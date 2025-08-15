import { prefillMktAttributes } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-attributes';
import { prefillMktLicenses } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-licenses';
import { prefillMktOrders } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-orders';
import { prefillMktProducts } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-products';
import { prefillMktValues } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-values';
import { prefillMktVariantAttributes } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-variant-attribute';
import { prefillMktVariants } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-variants';
import { prefillMktOrderItems } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-order-items';
import { prefillMktContracts } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-contracts';
import { prefillMktPaymentMethods } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-payment-methods';
import { prefillMktPayments } from 'src/mkt-core/dev-seeder/prefill-data/prefill-mkt-payments';

export const MKT_PREFILLS = [
  // product prefills
  prefillMktProducts,
  prefillMktAttributes,
  prefillMktValues,
  prefillMktVariants,
  prefillMktVariantAttributes,
  // payment prefills (before orders to ensure payment methods exist first)
  prefillMktPaymentMethods,
  // order prefills
  prefillMktOrders,
  prefillMktOrderItems,
  prefillMktContracts,
  prefillMktLicenses,
  // payment prefills (after orders to reference existing orders)
  prefillMktPaymentMethods,
  prefillMktPayments,
];
