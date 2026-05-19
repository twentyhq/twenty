/* @license Enterprise */

import { config } from 'dotenv';
import { DataSource, type Repository } from 'typeorm';

import { buildSecretEncryptionServiceFromEnv } from 'test/integration/upgrade/utils/build-secret-encryption-service.util';

import { type CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { type EnterprisePlanService } from 'src/engine/core-modules/enterprise/services/enterprise-plan.service';
import { RotateSigningKeysCronJob } from 'src/engine/core-modules/jwt/crons/jobs/rotate-signing-keys.cron.job';
import { SigningKeyEntity } from 'src/engine/core-modules/jwt/entities/signing-key.entity';
import { JwtKeyManagerService } from 'src/engine/core-modules/jwt/services/jwt-key-manager.service';
import { SigningKeyRotationService } from 'src/engine/core-modules/jwt/services/signing-key-rotation.service';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

jest.useRealTimers();

config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
  override: true,
});

const ROTATION_DAYS = 90;

describe('RotateSigningKeysCronJob (integration)', () => {
  let dataSource: DataSource;
  let repository: Repository<SigningKeyEntity>;
  let jwtKeyManagerService: JwtKeyManagerService;
  let signingKeyRotationService: SigningKeyRotationService;
  let cronJob: RotateSigningKeysCronJob;
  let isValidStub: jest.Mock<boolean, []>;
  let originalCurrentKeyId: string | null = null;
  const rotatedKeyIds: string[] = [];

  const getCurrentKeyIdFromDb = async (): Promise<string | null> => {
    const rows = await dataSource.query(
      `SELECT id FROM core."signingKey" WHERE "isCurrent" = true LIMIT 1`,
    );

    return rows.length > 0 ? (rows[0].id as string) : null;
  };

  beforeAll(async () => {
    dataSource = new DataSource({
      type: 'postgres',
      url: process.env.PG_DATABASE_URL,
      schema: 'core',
      entities: [SigningKeyEntity],
      synchronize: false,
    });
    await dataSource.initialize();
    repository = dataSource.getRepository(SigningKeyEntity);

    const secretEncryptionService = buildSecretEncryptionServiceFromEnv();
    const coreEntityCacheStub = {
      invalidate: jest.fn().mockResolvedValue(undefined),
    } as unknown as CoreEntityCacheService;
    const twentyConfigStub = {
      get: (key: string) =>
        key === 'SIGNING_KEY_ROTATION_DAYS' ? ROTATION_DAYS : undefined,
    } as unknown as TwentyConfigService;

    jwtKeyManagerService = new JwtKeyManagerService(
      repository,
      coreEntityCacheStub,
      secretEncryptionService,
    );
    signingKeyRotationService = new SigningKeyRotationService(
      jwtKeyManagerService,
      twentyConfigStub,
    );

    isValidStub = jest.fn<boolean, []>();
    const enterprisePlanServiceStub = {
      isValid: isValidStub,
    } as unknown as EnterprisePlanService;

    cronJob = new RotateSigningKeysCronJob(
      enterprisePlanServiceStub,
      signingKeyRotationService,
    );

    // Ensure a current signing key exists for the suite. Current keys are
    // created lazily on first sign, so this is robust when the suite runs in
    // isolation.
    const anchor = await jwtKeyManagerService.getCurrentSigningKey();

    originalCurrentKeyId = anchor?.id ?? null;
  }, 30000);

  beforeEach(() => {
    isValidStub.mockReset();
  });

  afterAll(async () => {
    if (rotatedKeyIds.length > 0) {
      await dataSource.query(
        `DELETE FROM core."signingKey" WHERE id = ANY($1::uuid[])`,
        [rotatedKeyIds],
      );
    }

    // Re-promote the snapshot key so other test suites in the same shard see
    // the same current signing key as before this suite ran.
    if (originalCurrentKeyId !== null) {
      await dataSource.query(
        `UPDATE core."signingKey" SET "isCurrent" = true WHERE id = $1`,
        [originalCurrentKeyId],
      );
    }

    await dataSource?.destroy();
  });

  it('is a no-op when the Enterprise plan is not valid', async () => {
    isValidStub.mockReturnValue(false);

    const before = await getCurrentKeyIdFromDb();

    await cronJob.handle();

    const after = await getCurrentKeyIdFromDb();

    expect(after).toBe(before);
  });

  it('does not rotate when the current key is younger than SIGNING_KEY_ROTATION_DAYS', async () => {
    isValidStub.mockReturnValue(true);

    const before = await getCurrentKeyIdFromDb();

    await cronJob.handle();

    const after = await getCurrentKeyIdFromDb();

    expect(after).toBe(before);
  });

  it('rotates the current key when it is older than SIGNING_KEY_ROTATION_DAYS and preserves the previous private key', async () => {
    isValidStub.mockReturnValue(true);

    const previousCurrentId = await getCurrentKeyIdFromDb();

    expect(previousCurrentId).not.toBeNull();

    const [previousBefore] = await dataSource.query(
      `SELECT "privateKey" FROM core."signingKey" WHERE id = $1`,
      [previousCurrentId],
    );
    const previousPrivateKey: string = previousBefore.privateKey;

    await dataSource.query(
      `UPDATE core."signingKey"
       SET "createdAt" = NOW() - ($1 || ' days')::interval
       WHERE id = $2`,
      [String(ROTATION_DAYS + 1), previousCurrentId],
    );

    await cronJob.handle();

    const [previousAfter] = await dataSource.query(
      `SELECT "isCurrent", "revokedAt", "privateKey"
       FROM core."signingKey" WHERE id = $1`,
      [previousCurrentId],
    );

    expect(previousAfter.isCurrent).toBe(false);
    expect(previousAfter.revokedAt).toBeNull();
    expect(previousAfter.privateKey).toBe(previousPrivateKey);

    const currentRows = await dataSource.query(
      `SELECT id, "isCurrent", "revokedAt", "privateKey", "publicKey"
       FROM core."signingKey" WHERE "isCurrent" = true`,
    );

    expect(currentRows).toHaveLength(1);
    expect(currentRows[0].id).not.toBe(previousCurrentId);
    rotatedKeyIds.push(currentRows[0].id as string);
    expect(currentRows[0].revokedAt).toBeNull();
    expect(currentRows[0].privateKey).toMatch(/^enc:v2:/);
    expect(currentRows[0].publicKey).toMatch(
      /^-----BEGIN PUBLIC KEY-----[\s\S]+-----END PUBLIC KEY-----\s*$/,
    );
  });

  it('rethrows rotation errors so the BullMQ job is marked failed and the Sentry monitor reports non-ok', async () => {
    isValidStub.mockReturnValue(true);

    const rotateSpy = jest
      .spyOn(signingKeyRotationService, 'rotateIfDue')
      .mockRejectedValueOnce(new Error('rotation boom'));

    await expect(cronJob.handle()).rejects.toThrow('rotation boom');

    rotateSpy.mockRestore();
  });
});
