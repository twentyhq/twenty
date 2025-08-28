import { mktAttributesAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-attribute-all.view';
import { mktContractsAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-contract-all.view';
import { mktLicensesAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-license-all.view';
import { mktOrdersAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-order-all.view';
import { mktOrderItemsAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-order-item-all.view';
import { mktPaymentsAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-payment-all.view';
import { mktPaymentMethodsAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-payment-method-all.view';
import { mktProductsAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-product-all.view';
import { mktValuesAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-value-all.view';
import { mktVariantsAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-variant-all.view';
import { mktVariantAttributesAllView } from 'src/mkt-core/dev-seeder/prefill-data/mkt-variant-attribute-all.view';
import { mktCombosAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-combo-all.view';
import { mktComboVariantsAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-combo-variant-all.view';
import { mktCustomersAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-customer-all.view';
import { mktCustomerTagsAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-customer-tag-all.view';
import { mktDataAccessPoliciesAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-data-access-policy-all.view';
import { mktDepartmentsAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-department-all.view';
import { mktDepartmentHierarchiesAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-department-hierarchy-all.view';
import { mktEmploymentStatusesAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-employment-status-all.view';
import { mktInvoicesAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-invoice-all.view';
import { mktKpisAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-kpi-all.view';
import { mktOrganizationLevelsAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-organization-level-all.view';
import { mktPermissionAuditsAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-permission-audit-all.view';
import { mktResellersAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-reseller-all.view';
import { mktResellerTiersAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-reseller-tier-all.view';
import { mktResellerTierHistoriesAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-reseller-tier-history-all.view';
import { mktStaffStatusHistoryAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-staff-status-history-all.view';
import { mktTagsAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-tag-all.view';
import { mktTemplatesAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-template-all.view';
import { mktTemporaryPermissionsAllView } from 'src/mkt-core/dev-seeder/prefill-view/mkt-temporary-permission-all.view';

export const MKT_ALL_VIEWS = [
  // customer views
  mktCustomersAllView,
  mktTagsAllView,
  mktCustomerTagsAllView,
  // product views
  mktProductsAllView,
  mktAttributesAllView,
  mktVariantsAllView,
  mktValuesAllView,
  mktVariantAttributesAllView,
  // combo views
  mktCombosAllView,
  mktComboVariantsAllView,
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
  // organization level views
  mktOrganizationLevelsAllView,
  mktEmploymentStatusesAllView,
  mktDepartmentsAllView,
  mktStaffStatusHistoryAllView,
  // prefillMktKpiTemplates,
  mktKpisAllView,
  // temporary permission views
  mktTemporaryPermissionsAllView,
  mktDepartmentHierarchiesAllView,
  mktDataAccessPoliciesAllView,
  mktPermissionAuditsAllView,
];
