import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import {
  SECRET_ENCRYPTION_ENVELOPE_PREFIX,
  SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX,
} from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SECRET_ENCRYPTION_KEY_ID_REGEX } from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionExceptionCode } from 'src/engine/core-modules/secret-encryption/exceptions/secret-encryption.exception';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';

// Temporary: should be replaced by an integration test against a simpler
// HTTP/GraphQL surface once one exists for connected-account creation.
const TEST_HANDLE_PREFIX = 'enc-integration-test-';

describe('ConnectedAccountTokenEncryptionService (integration)', () => {
  let dataSource: DataSource;
  let service: ConnectedAccountTokenEncryptionService;
  let workspaceId: string;
  let userWorkspaceId: string;
  const seededRowIds: string[] = [];

  beforeAll(async () => {
    dataSource = global.testDataSource;
    service = global.app.get(ConnectedAccountTokenEncryptionService);

    const [row] = await dataSource.query(
      `SELECT uw.id AS "userWorkspaceId", uw."workspaceId" AS "workspaceId"
         FROM "core"."userWorkspace" uw
         LIMIT 1`,
    );

    if (!isDefined(row)) {
      throw new Error(
        'No seeded userWorkspace row found; run database:reset before the integration suite.',
      );
    }

    userWorkspaceId = row.userWorkspaceId as string;
    workspaceId = row.workspaceId as string;
  });

  afterEach(async () => {
    if (seededRowIds.length === 0) {
      return;
    }

    await dataSource.query(
      `DELETE FROM "core"."connectedAccount" WHERE id = ANY($1::uuid[])`,
      [seededRowIds],
    );
    seededRowIds.length = 0;
  });

  it('encrypts both tokens, stores them as enc:v2 in Postgres, and round-trips back to the original plaintext', async () => {
    const accessTokenPlaintext = 'integration-access-token';
    const refreshTokenPlaintext = 'integration-refresh-token';

    const { encryptedAccessToken, encryptedRefreshToken } =
      service.encryptTokenPair({
        accessToken: accessTokenPlaintext,
        refreshToken: refreshTokenPlaintext,
        workspaceId,
      });

    const [{ id }] = await dataSource.query(
      `INSERT INTO "core"."connectedAccount"
         ("handle", "provider", "accessToken", "refreshToken",
          "userWorkspaceId", "workspaceId")
       VALUES ($1, 'google', $2, $3, $4, $5)
       RETURNING id`,
      [
        `${TEST_HANDLE_PREFIX}round-trip`,
        encryptedAccessToken,
        encryptedRefreshToken,
        userWorkspaceId,
        workspaceId,
      ],
    );

    seededRowIds.push(id);

    const [storedRow] = await dataSource.query(
      `SELECT "accessToken", "refreshToken"
         FROM "core"."connectedAccount" WHERE id = $1`,
      [id],
    );

    // The wire format on disk is enc:v2:<8 hex>:<base64>. Both columns
    // carry it; neither column contains the original plaintext anywhere.
    const envelopeShape = new RegExp(
      `^${SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX}${SECRET_ENCRYPTION_KEY_ID_REGEX.source.replace(
        /^\^|\$$/g,
        '',
      )}:[A-Za-z0-9+/=]+$`,
    );

    expect(storedRow.accessToken).toMatch(envelopeShape);
    expect(storedRow.refreshToken).toMatch(envelopeShape);
    expect(storedRow.accessToken).not.toContain(accessTokenPlaintext);
    expect(storedRow.refreshToken).not.toContain(refreshTokenPlaintext);

    expect(
      service.decrypt({ ciphertext: storedRow.accessToken, workspaceId }),
    ).toBe(accessTokenPlaintext);
    expect(
      service.decrypt({ ciphertext: storedRow.refreshToken, workspaceId }),
    ).toBe(refreshTokenPlaintext);
  });

  it('produces a different ciphertext for the same plaintext under a different workspaceId (HKDF context binding)', async () => {
    const plaintext = 'same-plaintext';

    const ciphertextA = service.encryptTokenPair({
      accessToken: plaintext,
      refreshToken: null,
      workspaceId,
    }).encryptedAccessToken;

    const ciphertextB = service.encryptTokenPair({
      accessToken: plaintext,
      refreshToken: null,
      workspaceId: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    }).encryptedAccessToken;

    expect(ciphertextA).not.toBe(ciphertextB);
  });

  it('fails to decrypt a row under a workspaceId that did not encrypt it (GCM context check)', () => {
    const ciphertext = service.encryptTokenPair({
      accessToken: 'workspace-bound',
      refreshToken: null,
      workspaceId,
    }).encryptedAccessToken;

    expect(() =>
      service.decrypt({
        ciphertext,
        workspaceId: 'ffffffff-ffff-ffff-ffff-ffffffffffff',
      }),
    ).toThrow();
  });

  it('rejects a plaintext INSERT at the Postgres CHECK constraint level', async () => {
    await expect(
      dataSource.query(
        `INSERT INTO "core"."connectedAccount"
           ("handle", "provider", "accessToken", "refreshToken",
            "userWorkspaceId", "workspaceId")
         VALUES ($1, 'google', $2, NULL, $3, $4)`,
        [
          `${TEST_HANDLE_PREFIX}rejected`,
          'plaintext-should-be-rejected',
          userWorkspaceId,
          workspaceId,
        ],
      ),
    ).rejects.toThrow(/check constraint/i);
  });

  it('rejects double-encryption: re-encrypting an already-v2 envelope throws ALREADY_ENCRYPTED', () => {
    const encrypted = service.encrypt({
      plaintext: 'plain',
      workspaceId,
    });

    expect(encrypted.startsWith(SECRET_ENCRYPTION_ENVELOPE_PREFIX)).toBe(true);

    expect(() =>
      service.encrypt({ plaintext: encrypted, workspaceId }),
    ).toThrow(
      expect.objectContaining({
        code: SecretEncryptionExceptionCode.ALREADY_ENCRYPTED,
      }),
    );
  });

  it('tolerates a legacy plaintext token (rollout-window read-through)', () => {
    expect(
      service.decrypt({
        ciphertext: 'raw-plaintext-no-prefix',
        workspaceId,
      }),
    ).toBe('raw-plaintext-no-prefix');
  });
});
