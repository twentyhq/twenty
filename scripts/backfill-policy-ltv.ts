// Backfill script: stamps LTV on existing policies from CarrierProduct commission.
//
// Usage:
//   npx ts-node scripts/backfill-policy-ltv.ts [--dry-run]
//
// Date-aware overrides:
//   For known historical commission changes (e.g., UHF health sharing changed
//   from $117 to $630 on Jan 20 2025), the script applies the correct value
//   based on the policy's effectiveDate. Going forward, the frozen snapshot
//   from CarrierProduct.commission handles everything automatically.

import { DataSource } from 'typeorm';

const DRY_RUN = process.argv.includes('--dry-run');

// Date-based commission overrides: keyed by carrier name (lowercase).
// Each entry lists overrides for specific product types with date boundaries.
// "before" means policies with effectiveDate < cutoffDate get the override value.
const DATE_OVERRIDES: Record<
  string,
  Array<{
    productTypeNamePattern: RegExp;
    cutoffDate: string; // ISO date string (YYYY-MM-DD)
    beforeAmountMicros: number;
  }>
> = {
  // UHF health sharing: was $117 (ancillary rate) before Jan 20 2025, then $630
  'universal health fellowship': [
    {
      productTypeNamePattern: /./i, // All UHF products (Thrive, Standard, STx)
      cutoffDate: '2025-01-20',
      beforeAmountMicros: 117_000_000,
    },
  ],
};

async function main() {
  const dbUrl =
    process.env.DATABASE_URL ||
    'postgres://twenty:twenty@localhost:5432/default';

  const dataSource = new DataSource({
    type: 'postgres',
    url: dbUrl,
  });

  await dataSource.initialize();
  console.log(`Connected to database. Dry run: ${DRY_RUN}`);

  try {
    // Get all active workspaces with their schemas
    const workspaces: Array<{ id: string; schemaName: string }> =
      await dataSource.query(
        `SELECT w.id, ds.schema as "schemaName"
         FROM core.workspace w
         JOIN core."dataSource" ds ON ds."workspaceId" = w.id
         WHERE w."deletedAt" IS NULL AND ds."isRemote" = false`,
      );

    let totalUpdated = 0;
    let totalSkipped = 0;

    for (const workspace of workspaces) {
      const { id: workspaceId, schemaName } = workspace;

      if (!schemaName) continue;

      console.log(`\nProcessing workspace ${workspaceId} (${schemaName})`);

      const policyTable = await findTableName(dataSource, schemaName, 'policy');

      if (!policyTable) {
        console.log('  No policy table found, skipping');
        continue;
      }

      const carrierProductTable = await findTableName(
        dataSource,
        schemaName,
        'carrierProduct',
      );

      if (!carrierProductTable) {
        console.log('  No carrierProduct table found, skipping');
        continue;
      }

      const carrierTable = await findTableName(
        dataSource,
        schemaName,
        'carrier',
      );
      const productTable = await findTableName(
        dataSource,
        schemaName,
        'product',
      );
      const productTypeTable = await findTableName(
        dataSource,
        schemaName,
        'productType',
      );

      // Get policies missing LTV that have both carrierId and productId
      const policies: Array<{
        id: string;
        carrierId: string;
        productId: string;
        effectiveDate: string | null;
      }> = await dataSource.query(
        `SELECT p.id, p."carrierId", p."productId", p."effectiveDate"
         FROM "${schemaName}"."${policyTable}" p
         WHERE p."ltvAmountMicros" IS NULL
           AND p."carrierId" IS NOT NULL
           AND p."productId" IS NOT NULL
           AND p."deletedAt" IS NULL`,
      );

      console.log(`  Found ${policies.length} policies missing LTV`);

      for (const policy of policies) {
        // Look up CarrierProduct commission
        const carrierProducts: Array<{
          commissionAmountMicros: number | null;
          commissionCurrencyCode: string | null;
        }> = await dataSource.query(
          `SELECT "commissionAmountMicros", "commissionCurrencyCode"
           FROM "${schemaName}"."${carrierProductTable}"
           WHERE "carrierId" = $1 AND "productId" = $2
           AND "deletedAt" IS NULL
           LIMIT 1`,
          [policy.carrierId, policy.productId],
        );

        if (
          carrierProducts.length === 0 ||
          !carrierProducts[0].commissionAmountMicros
        ) {
          totalSkipped++;
          continue;
        }

        let amountMicros = carrierProducts[0].commissionAmountMicros;
        const currencyCode =
          carrierProducts[0].commissionCurrencyCode || 'USD';

        // Check date-based overrides
        if (policy.effectiveDate && carrierTable) {
          const carrierRows: Array<{ name: string }> = await dataSource.query(
            `SELECT name FROM "${schemaName}"."${carrierTable}" WHERE id = $1`,
            [policy.carrierId],
          );

          if (carrierRows.length > 0) {
            const carrierNameLower = carrierRows[0].name.trim().toLowerCase();
            const overrides = DATE_OVERRIDES[carrierNameLower];

            if (overrides && productTable) {
              // Resolve product type name for matching
              let productTypeName = '';

              if (productTypeTable) {
                const ptRows: Array<{ name: string }> =
                  await dataSource.query(
                    `SELECT pt.name
                     FROM "${schemaName}"."${productTable}" pr
                     JOIN "${schemaName}"."${productTypeTable}" pt ON pt.id = pr."productTypeId"
                     WHERE pr.id = $1`,
                    [policy.productId],
                  );

                if (ptRows.length > 0) {
                  productTypeName = ptRows[0].name;
                }
              }

              for (const override of overrides) {
                if (
                  override.productTypeNamePattern.test(productTypeName) &&
                  policy.effectiveDate < override.cutoffDate
                ) {
                  console.log(
                    `  Override for policy ${policy.id}: ${amountMicros} -> ${override.beforeAmountMicros} (before ${override.cutoffDate})`,
                  );
                  amountMicros = override.beforeAmountMicros;
                  break;
                }
              }
            }
          }
        }

        if (DRY_RUN) {
          console.log(
            `  [DRY RUN] Would set policy ${policy.id} LTV = ${amountMicros / 1_000_000} ${currencyCode}`,
          );
        } else {
          await dataSource.query(
            `UPDATE "${schemaName}"."${policyTable}"
             SET "ltvAmountMicros" = $1, "ltvCurrencyCode" = $2
             WHERE id = $3`,
            [amountMicros, currencyCode, policy.id],
          );
        }

        totalUpdated++;
      }
    }

    console.log(
      `\nDone. ${DRY_RUN ? '[DRY RUN] Would update' : 'Updated'} ${totalUpdated} policies. Skipped ${totalSkipped} (no matching CarrierProduct commission).`,
    );
  } finally {
    await dataSource.destroy();
  }
}

async function findTableName(
  dataSource: DataSource,
  schemaName: string,
  baseName: string,
): Promise<string | null> {
  const prefixed: Array<{ exists: boolean }> = await dataSource.query(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = $1
      AND table_name = $2
    )`,
    [schemaName, `_${baseName}`],
  );

  if (prefixed[0].exists) {
    return `_${baseName}`;
  }

  const unprefixed: Array<{ exists: boolean }> = await dataSource.query(
    `SELECT EXISTS (
      SELECT FROM information_schema.tables
      WHERE table_schema = $1
      AND table_name = $2
    )`,
    [schemaName, baseName],
  );

  if (unprefixed[0].exists) {
    return baseName;
  }

  return null;
}

main().catch((error) => {
  console.error('Backfill failed:', error);
  process.exit(1);
});
