/* @license Enterprise */

import { EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { RotateSigningKeysCronJob } from 'src/engine/core-modules/jwt/crons/jobs/rotate-signing-keys.cron.job';
import { JwtKeyManagerService } from 'src/engine/core-modules/jwt/services/jwt-key-manager.service';
import { SigningKeyRotationService } from 'src/engine/core-modules/jwt/services/signing-key-rotation.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

describe('RotateSigningKeysCronJob (integration)', () => {
  let cronJob: RotateSigningKeysCronJob;
  let enterprisePlanService: EnterprisePlanService;
  let jwtKeyManagerService: JwtKeyManagerService;
  let signingKeyRotationService: SigningKeyRotationService;
  let rotationDays: number;
  let isValidSpy: jest.SpyInstance;

  beforeAll(async () => {
    // RotateSigningKeysCronJob and SigningKeyRotationService live in JwtModule,
    // and EnterprisePlanService lives in EnterpriseModule; neither is @Global,
    // so we have to widen the lookup with { strict: false }.
    cronJob = global.app.get(RotateSigningKeysCronJob, { strict: false });
    enterprisePlanService = global.app.get(EnterprisePlanService, {
      strict: false,
    });
    jwtKeyManagerService = global.app.get(JwtKeyManagerService, {
      strict: false,
    });
    signingKeyRotationService = global.app.get(SigningKeyRotationService, {
      strict: false,
    });
    rotationDays = global.app
      .get(TwentyConfigService, { strict: false })
      .get('SIGNING_KEY_ROTATION_DAYS');

    // Current signing keys are created lazily on first sign. Force creation
    // so this suite is robust when run in isolation.
    await jwtKeyManagerService.getCurrentSigningKey();
  });

  beforeEach(() => {
    isValidSpy = jest.spyOn(enterprisePlanService, 'isValid');
  });

  afterEach(() => {
    isValidSpy.mockRestore();
  });

  it('is a no-op when the Enterprise plan is not valid', async () => {
    isValidSpy.mockReturnValue(false);

    const before = await global.testDataSource.query(
      `SELECT "id" FROM core."signingKey" WHERE "isCurrent" = true LIMIT 1`,
    );
    const previousCurrentId: string = before[0].id;

    await cronJob.handle();

    const after = await global.testDataSource.query(
      `SELECT "id" FROM core."signingKey" WHERE "isCurrent" = true LIMIT 1`,
    );

    expect(after).toHaveLength(1);
    expect(after[0].id).toBe(previousCurrentId);
  });

  it('does not rotate when the current key is younger than SIGNING_KEY_ROTATION_DAYS', async () => {
    isValidSpy.mockReturnValue(true);

    const before = await global.testDataSource.query(
      `SELECT "id" FROM core."signingKey" WHERE "isCurrent" = true LIMIT 1`,
    );
    const previousCurrentId: string = before[0].id;

    await cronJob.handle();

    const after = await global.testDataSource.query(
      `SELECT "id" FROM core."signingKey" WHERE "isCurrent" = true LIMIT 1`,
    );

    expect(after).toHaveLength(1);
    expect(after[0].id).toBe(previousCurrentId);
  });

  it('rotates the current key when it is older than SIGNING_KEY_ROTATION_DAYS and preserves the previous private key', async () => {
    isValidSpy.mockReturnValue(true);

    const before = await global.testDataSource.query(
      `SELECT "id", "privateKey" FROM core."signingKey" WHERE "isCurrent" = true LIMIT 1`,
    );
    const previousCurrentId: string = before[0].id;
    const previousPrivateKey: string = before[0].privateKey;

    await global.testDataSource.query(
      `UPDATE core."signingKey"
       SET "createdAt" = NOW() - ($1 || ' days')::interval
       WHERE "id" = $2`,
      [String(rotationDays + 1), previousCurrentId],
    );

    await cronJob.handle();

    const previousAfter = await global.testDataSource.query(
      `SELECT "isCurrent", "revokedAt", "privateKey"
       FROM core."signingKey" WHERE "id" = $1`,
      [previousCurrentId],
    );

    expect(previousAfter[0].isCurrent).toBe(false);
    expect(previousAfter[0].revokedAt).toBeNull();
    expect(previousAfter[0].privateKey).toBe(previousPrivateKey);

    const currentRows = await global.testDataSource.query(
      `SELECT "id", "isCurrent", "revokedAt", "privateKey", "publicKey"
       FROM core."signingKey" WHERE "isCurrent" = true`,
    );

    expect(currentRows).toHaveLength(1);
    expect(currentRows[0].id).not.toBe(previousCurrentId);
    expect(currentRows[0].revokedAt).toBeNull();
    expect(currentRows[0].privateKey).toMatch(/^enc:v2:/);
    expect(currentRows[0].publicKey).toMatch(
      /^-----BEGIN PUBLIC KEY-----[\s\S]+-----END PUBLIC KEY-----\s*$/,
    );
  });

  it('rethrows rotation errors so the BullMQ job is marked failed and the Sentry monitor reports non-ok', async () => {
    isValidSpy.mockReturnValue(true);

    const rotateSpy = jest
      .spyOn(signingKeyRotationService, 'rotateIfDue')
      .mockRejectedValueOnce(new Error('rotation boom'));

    await expect(cronJob.handle()).rejects.toThrow('rotation boom');

    rotateSpy.mockRestore();
  });
});
