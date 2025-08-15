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
  MKT_INVOICE_DATA_SEED_COLUMNS,
  MKT_INVOICE_DATA_SEEDS,
} from 'src/mkt-core/dev-seeder/constants/mkt-invoice-data-seeds.constants';
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
import { MKT_TEMPLATE_DATA_SEED_COLUMNS,MKT_TEMPLATE_DATA_SEEDS } from 'src/mkt-core/dev-seeder/constants/mkt-template-data-seeds.constants';
export const MKT_RECORD_SEEDS_CONFIGS = [
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
];
