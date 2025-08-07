import {MKT_ATTRIBUTE_DATA_SEED_COLUMNS,MKT_ATTRIBUTE_DATA_SEEDS} from "src/mkt-core/dev-seeder/constants/mkt-attribute-data-seeds.constants";
import {MKT_PRODUCT_DATA_SEED_COLUMNS,MKT_PRODUCT_DATA_SEEDS} from "src/mkt-core/dev-seeder/constants/mkt-product-data-seeds.constants";
import {MKT_VALUE_DATA_SEED_COLUMNS,MKT_VALUE_DATA_SEEDS} from "src/mkt-core/dev-seeder/constants/mkt-value-data-seeds.constants";
import {MKT_VARIANT_ATTRIBUTE_DATA_SEED_COLUMNS,MKT_VARIANT_ATTRIBUTE_DATA_SEEDS} from "src/mkt-core/dev-seeder/constants/mkt-variant-attribute-data-seeds.constants";
import {MKT_VARIANT_DATA_SEED_COLUMNS,MKT_VARIANT_DATA_SEEDS} from "src/mkt-core/dev-seeder/constants/mkt-variant-data-seeds.constants";
import {CUSTOMER_DATA_SEED_COLUMNS,CUSTOMER_DATA_SEEDS} from "src/mkt-core/mkt-example/libs/customers/constants/customer-data-seeds.constant";

export const MKT_RECORD_SEEDS_CONFIGS = [
    {
        tableName: 'mktCustomer',
        pgColumns: CUSTOMER_DATA_SEED_COLUMNS,
        recordSeeds: CUSTOMER_DATA_SEEDS,
    },
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
    // add other records here if needed
]
