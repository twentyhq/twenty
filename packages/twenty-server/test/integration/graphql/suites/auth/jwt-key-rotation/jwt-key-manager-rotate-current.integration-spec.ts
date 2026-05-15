import { JwtKeyManagerService } from 'src/engine/core-modules/jwt/services/jwt-key-manager.service';

describe('JwtKeyManagerService.rotateCurrent (integration)', () => {
  let jwtKeyManagerService: JwtKeyManagerService;

  beforeAll(() => {
    jwtKeyManagerService = global.app.get(JwtKeyManagerService);
  });

  it('flips the previous current key to active and inserts a new current key in one transaction', async () => {
    const before = await global.testDataSource.query(
      `SELECT "id", "isCurrent", "revokedAt", "privateKey"
       FROM core."signingKey" WHERE "isCurrent" = true LIMIT 1`,
    );

    expect(before).toHaveLength(1);

    const previousCurrentRow = before[0];

    const next = await jwtKeyManagerService.rotateCurrent();

    expect(next.id).not.toBe(previousCurrentRow.id);
    expect(next.privateKeyPem).toMatch(
      /^-----BEGIN PRIVATE KEY-----[\s\S]+-----END PRIVATE KEY-----\s*$/,
    );

    const previousAfter = await global.testDataSource.query(
      `SELECT "id", "isCurrent", "revokedAt", "privateKey"
       FROM core."signingKey" WHERE "id" = $1`,
      [previousCurrentRow.id],
    );

    expect(previousAfter).toHaveLength(1);
    expect(previousAfter[0].isCurrent).toBe(false);
    expect(previousAfter[0].revokedAt).toBeNull();
    expect(previousAfter[0].privateKey).not.toBeNull();
    expect(previousAfter[0].privateKey).toMatch(/^enc:v2:/);

    const newRow = await global.testDataSource.query(
      `SELECT "id", "isCurrent", "revokedAt", "privateKey", "publicKey"
       FROM core."signingKey" WHERE "id" = $1`,
      [next.id],
    );

    expect(newRow).toHaveLength(1);
    expect(newRow[0].isCurrent).toBe(true);
    expect(newRow[0].revokedAt).toBeNull();
    expect(newRow[0].privateKey).toMatch(/^enc:v2:/);
    expect(newRow[0].publicKey).toMatch(
      /^-----BEGIN PUBLIC KEY-----[\s\S]+-----END PUBLIC KEY-----\s*$/,
    );

    const currentRows = await global.testDataSource.query(
      `SELECT COUNT(*)::int AS count FROM core."signingKey" WHERE "isCurrent" = true`,
    );

    expect(currentRows[0].count).toBe(1);
  });

  it('exposes the freshly rotated key via getCurrentSigningKeyMetadata', async () => {
    const meta = await jwtKeyManagerService.getCurrentSigningKeyMetadata();

    expect(meta).not.toBeNull();
    expect(meta?.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(meta?.createdAt).toBeInstanceOf(Date);

    const dbCurrent = await global.testDataSource.query(
      `SELECT "id" FROM core."signingKey" WHERE "isCurrent" = true LIMIT 1`,
    );

    expect(dbCurrent[0].id).toBe(meta?.id);
  });
});
