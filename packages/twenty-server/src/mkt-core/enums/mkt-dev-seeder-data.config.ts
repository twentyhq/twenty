import {
  MKT_ATTRIBUTE_DATA_SEED_COLUMNS,
  MKT_ATTRIBUTE_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-attribute-data-seeds.constants';
import {
  MKT_PRODUCT_DATA_SEED_COLUMNS,
  MKT_PRODUCT_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-product-data-seeds.constants';
import {
  MKT_VALUE_DATA_SEED_COLUMNS,
  MKT_VALUE_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-value-data-seeds.constants';
import {
  MKT_VARIANT_ATTRIBUTE_DATA_SEED_COLUMNS,
  MKT_VARIANT_ATTRIBUTE_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-variant-attribute-data-seeds.constants';
import {
  MKT_VARIANT_DATA_SEED_COLUMNS,
  MKT_VARIANT_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-variant-data-seeds.constants';
//Order configs
import {
  MKT_CONTRACT_DATA_SEED_COLUMNS,
  MKT_CONTRACT_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-contract-data-seeds.constants';
import {
  MKT_CUSTOMER_DATA_SEED_COLUMNS,
  MKT_CUSTOMER_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-customer-data-seeds.constants';
import {
  MKT_DEPARTMENT_DATA_SEED_COLUMNS,
  MKT_DEPARTMENT_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-department-data-seeds.constants';
import {
  MKT_EMPLOYMENT_STATUS_DATA_SEED_COLUMNS,
  MKT_EMPLOYMENT_STATUS_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-employment-status-data-seeds.constants';
import {
  MKT_INVOICE_DATA_SEED_COLUMNS,
  MKT_INVOICE_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-invoice-data-seeds.constants';
import {
  MKT_KPI_DATA_SEED_COLUMNS,
  MKT_KPI_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-kpi-data-seeds.constants';
import {
  MKT_KPI_TEMPLATE_DATA_SEED_COLUMNS,
  MKT_KPI_TEMPLATE_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-kpi-template-data-seeds.constants';
import {
  MKT_LICENSE_DATA_SEED_COLUMNS,
  MKT_LICENSE_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-license-data-seeds.constants';
import {
  MKT_ORDER_DATA_SEED_COLUMNS,
  MKT_ORDER_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-order-data-seeds.constants';
import {
  MKT_ORDER_ITEM_DATA_SEED_COLUMNS,
  MKT_ORDER_ITEM_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-order-item-data-seeds.constants';
import {
  MKT_ORGANIZATION_LEVEL_DATA_SEED_COLUMNS,
  MKT_ORGANIZATION_LEVEL_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-organization-level-data-seeds.constants';
import {
  MKT_PAYMENT_DATA_SEED_COLUMNS,
  MKT_PAYMENT_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-payment-data-seeds.constants';
import {
  MKT_PAYMENT_METHOD_DATA_SEED_COLUMNS,
  MKT_PAYMENT_METHOD_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-payment-method-data-seeds.constants';
import {
  MKT_RESELLER_DATA_SEED_COLUMNS,
  MKT_RESELLER_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-reseller-data-seeds.constants';
import {
  MKT_RESELLER_TIER_DATA_SEED_COLUMNS,
  MKT_RESELLER_TIER_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-reseller-tier-data-seeds.constants';
import {
  MKT_RESELLER_TIER_HISTORY_DATA_SEED_COLUMNS,
  MKT_RESELLER_TIER_HISTORY_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-reseller-tier-history-data-seeds.constants';
import {
  MKT_STAFF_STATUS_HISTORY_DATA_SEED_COLUMNS,
  MKT_STAFF_STATUS_HISTORY_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-staff-status-history-data-seeds.constants';
import {
  MKT_TEMPLATE_DATA_SEED_COLUMNS,
  MKT_TEMPLATE_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-template-data-seeds.constants';

export const MKT_RECORD_SEEDS_CONFIGS = [
  // Customer configs
  {
    tableName: 'mktCustomer',
    pgColumns: MKT_CUSTOMER_DATA_SEED_COLUMNS,
    recordSeeds: MKT_CUSTOMER_DATA_SEEDS,
  },
  // Product configs
  {
    tableName: 'mktProduct',
    pgColumns: MKT_PRODUCT_DATA_SEED_COLUMNS,
    recordSeeds: MKT_PRODUCT_DATA_SEEDS,
  },
  {
    tableName: 'mktAttribute',
    pgColumns: MKT_ATTRIBUTE_DATA_SEED_COLUMNS,
    recordSeeds: MKT_ATTRIBUTE_DATA_SEEDS,
  },
  {
    tableName: 'mktVariant',
    pgColumns: MKT_VARIANT_DATA_SEED_COLUMNS,
    recordSeeds: MKT_VARIANT_DATA_SEEDS,
  },
  {
    tableName: 'mktValue',
    pgColumns: MKT_VALUE_DATA_SEED_COLUMNS,
    recordSeeds: MKT_VALUE_DATA_SEEDS,
  },
  {
    tableName: 'mktVariantAttribute',
    pgColumns: MKT_VARIANT_ATTRIBUTE_DATA_SEED_COLUMNS,
    recordSeeds: MKT_VARIANT_ATTRIBUTE_DATA_SEEDS,
  },
  {
    tableName: 'mktTemplate',
    pgColumns: MKT_TEMPLATE_DATA_SEED_COLUMNS,
    recordSeeds: MKT_TEMPLATE_DATA_SEEDS,
  },
  {
    tableName: 'mktOrder',
    pgColumns: MKT_ORDER_DATA_SEED_COLUMNS,
    recordSeeds: MKT_ORDER_DATA_SEEDS,
  },
  {
    tableName: 'mktContract',
    pgColumns: MKT_CONTRACT_DATA_SEED_COLUMNS,
    recordSeeds: MKT_CONTRACT_DATA_SEEDS,
  },
  {
    tableName: 'mktOrderItem',
    pgColumns: MKT_ORDER_ITEM_DATA_SEED_COLUMNS,
    recordSeeds: MKT_ORDER_ITEM_DATA_SEEDS,
  },
  {
    tableName: 'mktLicense',
    pgColumns: MKT_LICENSE_DATA_SEED_COLUMNS,
    recordSeeds: MKT_LICENSE_DATA_SEEDS,
  },
  {
    tableName: 'mktInvoice',
    pgColumns: MKT_INVOICE_DATA_SEED_COLUMNS,
    recordSeeds: MKT_INVOICE_DATA_SEEDS,
  },
  // Payment configs
  {
    tableName: 'mktPaymentMethod',
    pgColumns: MKT_PAYMENT_METHOD_DATA_SEED_COLUMNS,
    recordSeeds: MKT_PAYMENT_METHOD_DATA_SEEDS,
  },
  {
    tableName: 'mktPayment',
    pgColumns: MKT_PAYMENT_DATA_SEED_COLUMNS,
    recordSeeds: MKT_PAYMENT_DATA_SEEDS,
  },
  // Reseller configs
  {
    tableName: 'mktResellerTier',
    pgColumns: MKT_RESELLER_TIER_DATA_SEED_COLUMNS,
    recordSeeds: MKT_RESELLER_TIER_DATA_SEEDS,
  },
  {
    tableName: 'mktReseller',
    pgColumns: MKT_RESELLER_DATA_SEED_COLUMNS,
    recordSeeds: MKT_RESELLER_DATA_SEEDS,
  },
  {
    tableName: 'mktResellerTierHistory',
    pgColumns: MKT_RESELLER_TIER_HISTORY_DATA_SEED_COLUMNS,
    recordSeeds: MKT_RESELLER_TIER_HISTORY_DATA_SEEDS,
  },
  // Organization configs
  {
    tableName: 'mktOrganizationLevel',
    pgColumns: MKT_ORGANIZATION_LEVEL_DATA_SEED_COLUMNS,
    recordSeeds: MKT_ORGANIZATION_LEVEL_DATA_SEEDS,
  },
  {
    tableName: 'mktEmploymentStatus',
    pgColumns: MKT_EMPLOYMENT_STATUS_DATA_SEED_COLUMNS,
    recordSeeds: MKT_EMPLOYMENT_STATUS_DATA_SEEDS,
  },
  {
    tableName: 'mktDepartment',
    pgColumns: MKT_DEPARTMENT_DATA_SEED_COLUMNS,
    recordSeeds: MKT_DEPARTMENT_DATA_SEEDS,
  },
  {
    tableName: 'mktStaffStatusHistory',
    pgColumns: MKT_STAFF_STATUS_HISTORY_DATA_SEED_COLUMNS,
    recordSeeds: MKT_STAFF_STATUS_HISTORY_DATA_SEEDS,
  },
  // KPI System configs
  {
    tableName: 'mktKpi',
    pgColumns: MKT_KPI_DATA_SEED_COLUMNS,
    recordSeeds: MKT_KPI_DATA_SEEDS,
  },
  {
    tableName: 'mktKpiTemplate',
    pgColumns: MKT_KPI_TEMPLATE_DATA_SEED_COLUMNS,
    recordSeeds: MKT_KPI_TEMPLATE_DATA_SEEDS,
  },
];
