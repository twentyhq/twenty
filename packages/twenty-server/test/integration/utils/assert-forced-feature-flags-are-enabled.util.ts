import { type DataSource } from 'typeorm';

// The seeding command logs and swallows its errors, so a typo in
// TEST_FORCED_FEATURE_FLAGS would otherwise leave the flagged CI pass green
// while running the unflagged code path.
export const assertForcedFeatureFlagsAreEnabled = async (
  dataSource: DataSource,
): Promise<void> => {
  const forcedFeatureFlags = (process.env.TEST_FORCED_FEATURE_FLAGS ?? '')
    .split(',')
    .map((featureFlagKey) => featureFlagKey.trim())
    .filter((featureFlagKey) => featureFlagKey.length > 0);

  if (forcedFeatureFlags.length === 0) {
    return;
  }

  const enabledRows: { key: string }[] = await dataSource.query(
    `SELECT DISTINCT "key" FROM core."featureFlag" WHERE "value" = true AND "key" = ANY($1)`,
    [forcedFeatureFlags],
  );

  const enabledKeys = new Set(enabledRows.map(({ key }) => key));

  const missingFeatureFlags = forcedFeatureFlags.filter(
    (featureFlagKey) => !enabledKeys.has(featureFlagKey),
  );

  if (missingFeatureFlags.length > 0) {
    throw new Error(
      `TEST_FORCED_FEATURE_FLAGS asked for ${missingFeatureFlags.join(', ')} but no workspace has them enabled. Re-run the suite with a database reset so the seeder picks them up.`,
    );
  }
};
