import { SecretEncryptionRotationRunnerService } from 'src/database/commands/secret-encryption-rotation/services/secret-encryption-rotation-runner.service';

describe('SecretEncryptionRotationRunnerService (integration)', () => {
  let runner: SecretEncryptionRotationRunnerService;

  beforeAll(() => {
    runner = global.app.get(SecretEncryptionRotationRunnerService);
  });

  it('exposes the expected stable list of sites', () => {
    expect(runner.listSiteNames()).toEqual([
      'connected-account-tokens',
      'application-variable',
      'application-registration-variable',
      'signing-key-private-keys',
      'sensitive-config-storage',
      'totp-secrets',
    ]);
  });

  it('is a no-op when every row is already encrypted under the primary keyId', async () => {
    const summary = await runner.run({ batchSize: 200, dryRun: false });

    const totalRotated = summary.results.reduce(
      (sum, result) => sum + result.rotated,
      0,
    );
    const totalErrors = summary.results.reduce(
      (sum, result) => sum + result.errors,
      0,
    );

    expect(totalRotated).toBe(0);
    expect(totalErrors).toBe(0);
    expect(summary.results).toHaveLength(6);
  });

  it('is idempotent: running twice in a row reports zero rotations on the second pass', async () => {
    const firstSummary = await runner.run({ batchSize: 200, dryRun: false });
    const secondSummary = await runner.run({ batchSize: 200, dryRun: false });

    const firstTotal = firstSummary.results.reduce(
      (sum, result) => sum + result.rotated,
      0,
    );
    const secondTotal = secondSummary.results.reduce(
      (sum, result) => sum + result.rotated,
      0,
    );

    expect(firstTotal).toBe(0);
    expect(secondTotal).toBe(0);
  });

  it('--site filter narrows the run to a single handler', async () => {
    const summary = await runner.run({
      site: 'signing-key-private-keys',
      batchSize: 200,
      dryRun: false,
    });

    expect(summary.results).toHaveLength(1);
    expect(summary.results[0].siteName).toBe('signing-key-private-keys');
    expect(summary.results[0].errors).toBe(0);
  });

  it('rejects an unknown --site value', async () => {
    await expect(
      runner.run({
        site: 'definitely-not-a-real-site',
        batchSize: 200,
        dryRun: false,
      }),
    ).rejects.toThrow(/Unknown rotation site/);
  });

  it('counts a row encrypted under a synthetic non-current keyId as remaining and reports an error trying to rotate it', async () => {
    const syntheticKeyId = 'deadbeef';
    const syntheticPayload = 'AAAAAAAAAAAAAAAAAAAAAAA=';
    const syntheticRowId = '00000000-0000-4000-8000-0000feedbeef';
    const syntheticEnvelope = `enc:v2:${syntheticKeyId}:${syntheticPayload}`;

    await global.testDataSource.query(
      `INSERT INTO core."signingKey" ("id", "publicKey", "privateKey", "isCurrent")
       VALUES ($1, $2, $3, false)
       ON CONFLICT ("id") DO UPDATE SET "privateKey" = EXCLUDED."privateKey", "isCurrent" = false`,
      [
        syntheticRowId,
        '-----BEGIN PUBLIC KEY-----\nfake\n-----END PUBLIC KEY-----',
        syntheticEnvelope,
      ],
    );

    try {
      const summary = await runner.run({
        site: 'signing-key-private-keys',
        batchSize: 200,
        dryRun: false,
      });

      const result = summary.results[0];

      expect(result.remainingBefore).toBeGreaterThanOrEqual(1);
      expect(result.errors).toBeGreaterThanOrEqual(1);
      expect(result.rotated).toBe(0);
    } finally {
      await global.testDataSource.query(
        `DELETE FROM core."signingKey" WHERE "id" = $1`,
        [syntheticRowId],
      );
    }
  });
});
