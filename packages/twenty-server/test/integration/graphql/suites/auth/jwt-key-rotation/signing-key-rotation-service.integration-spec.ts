/* @license Enterprise */

import { SigningKeyRotationService } from 'src/engine/core-modules/jwt/services/signing-key-rotation.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('SigningKeyRotationService.rotateIfDue (integration)', () => {
  let signingKeyRotationService: SigningKeyRotationService;
  let twentyConfigService: TwentyConfigService;
  let originalRotationDays: number;

  beforeAll(() => {
    signingKeyRotationService = global.app.get(SigningKeyRotationService);
    twentyConfigService = global.app.get(TwentyConfigService);
    originalRotationDays = twentyConfigService.get('SIGNING_KEY_ROTATION_DAYS');
  });

  it('does not rotate when the current key is younger than SIGNING_KEY_ROTATION_DAYS', async () => {
    const before = await global.testDataSource.query(
      `SELECT "id" FROM core."signingKey" WHERE "isCurrent" = true LIMIT 1`,
    );
    const previousCurrentId: string = before[0].id;

    const result = await signingKeyRotationService.rotateIfDue();

    expect(result.rotated).toBe(false);
    expect(result.previousId).toBe(previousCurrentId);
    expect(result.newId).toBeNull();

    const after = await global.testDataSource.query(
      `SELECT "id" FROM core."signingKey" WHERE "isCurrent" = true LIMIT 1`,
    );

    expect(after[0].id).toBe(previousCurrentId);
  });

  it('rotates when the current key is older than SIGNING_KEY_ROTATION_DAYS', async () => {
    const before = await global.testDataSource.query(
      `SELECT "id" FROM core."signingKey" WHERE "isCurrent" = true LIMIT 1`,
    );
    const previousCurrentId: string = before[0].id;

    // Backdate the current key by (rotationDays + 1) days so the threshold is crossed.
    const backdateDays = originalRotationDays + 1;

    await global.testDataSource.query(
      `UPDATE core."signingKey"
       SET "createdAt" = NOW() - ($1 || ' days')::interval
       WHERE "id" = $2`,
      [String(backdateDays), previousCurrentId],
    );

    const result = await signingKeyRotationService.rotateIfDue();

    expect(result.rotated).toBe(true);
    expect(result.previousId).toBe(previousCurrentId);
    expect(result.newId).not.toBeNull();
    expect(result.newId).not.toBe(previousCurrentId);

    const previousAfter = await global.testDataSource.query(
      `SELECT "isCurrent", "revokedAt", "privateKey"
       FROM core."signingKey" WHERE "id" = $1`,
      [previousCurrentId],
    );

    expect(previousAfter[0].isCurrent).toBe(false);
    expect(previousAfter[0].revokedAt).toBeNull();
    expect(previousAfter[0].privateKey).not.toBeNull();

    const newRow = await global.testDataSource.query(
      `SELECT "isCurrent", "revokedAt"
       FROM core."signingKey" WHERE "id" = $1`,
      [result.newId],
    );

    expect(newRow[0].isCurrent).toBe(true);
    expect(newRow[0].revokedAt).toBeNull();

    const currentCount = await global.testDataSource.query(
      `SELECT COUNT(*)::int AS count FROM core."signingKey" WHERE "isCurrent" = true`,
    );

    expect(currentCount[0].count).toBe(1);
  });
});
