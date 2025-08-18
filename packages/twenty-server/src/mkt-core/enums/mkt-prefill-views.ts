import { mktAttributesAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-attribute-all.view';
import { mktContractsAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-contract-all.view';
import { mktLicensesAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-license-all.view';
import { mktOrdersAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-order-all.view';
import { mktOrderItemsAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-order-item-all.view';
import { mktProductsAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-product-all.view';
import { mktValuesAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-value-all.view';
import { mktVariantsAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-variant-all.view';
import { mktVariantAttributesAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-variant-attribute-all.view';
import { mktTemplatesAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-template-all.view';
import { mktInvoicesAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-invoice-all.view';
import { mktPaymentMethodsAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-payment-method-all.view';
import { mktPaymentsAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-payment-all.view';
import { mktResellerTiersAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-reseller-tier-all.view';
import { mktResellersAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-reseller-all.view';
import { mktResellerTierHistoriesAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-reseller-tier-history-all.view';

export const MKT_ALL_VIEWS = [
  // product views
  mktProductsAllView,
  mktAttributesAllView,
  mktVariantsAllView,
  mktValuesAllView,
  mktVariantAttributesAllView,
  // order views
  mktOrdersAllView,
  mktOrderItemsAllView,
  // template views
  mktTemplatesAllView,
  // license views
  mktLicensesAllView,
  // contract views
  mktContractsAllView,
  // invoice views
  mktInvoicesAllView,
  // payment views
  mktPaymentMethodsAllView,
  mktPaymentsAllView,
  // reseller views
  mktResellerTiersAllView,
  mktResellersAllView,
  mktResellerTierHistoriesAllView,
];
