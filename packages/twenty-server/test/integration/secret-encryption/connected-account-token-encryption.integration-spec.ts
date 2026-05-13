import { getRepositoryToken } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { In, type Repository } from 'typeorm';

import {
  SECRET_ENCRYPTION_ENVELOPE_PREFIX,
  SECRET_ENCRYPTION_ENVELOPE_V2_PREFIX,
  SECRET_ENCRYPTION_KEY_ID_REGEX,
} from 'src/engine/core-modules/secret-encryption/constants/secret-encryption.constant';
import { SecretEncryptionExceptionCode } from 'src/engine/core-modules/secret-encryption/exceptions/secret-encryption.exception';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';

// Temporary: should be replaced by an integration test against a simpler
// HTTP/GraphQL surface once one exists for connected-account creation.
const TEST_HANDLE_PREFIX = 'enc-integration-test-';

describe('ConnectedAccountTokenEncryptionService (integration)', () => {
  let service: ConnectedAccountTokenEncryptionService;
  let connectedAccountRepository: Repository<ConnectedAccountEntity>;
  let userWorkspaceRepository: Repository<UserWorkspaceEntity>;
  let workspaceId: string;
  let userWorkspaceId: string;
  const seededRowIds: string[] = [];

  beforeAll(async () => {
    service = global.app.get(ConnectedAccountTokenEncryptionService);
    connectedAccountRepository = global.app.get<
      Repository<ConnectedAccountEntity>
    >(getRepositoryToken(ConnectedAccountEntity));
    userWorkspaceRepository = global.app.get<Repository<UserWorkspaceEntity>>(
      getRepositoryToken(UserWorkspaceEntity),
    );

    const seed = await userWorkspaceRepository.findOne({ where: {} });

    if (!isDefined(seed)) {
      throw new Error(
        'No seeded userWorkspace row found; run database:reset before the integration suite.',
      );
    }

    userWorkspaceId = seed.id;
    workspaceId = seed.workspaceId;
  });

  afterEach(async () => {
    if (seededRowIds.length === 0) {
      return;
    }

    await connectedAccountRepository.delete({ id: In(seededRowIds) });
    seededRowIds.length = 0;
  });

  const saveConnectedAccount = async (
    overrides: Partial<ConnectedAccountEntity> & {
      handleSuffix: string;
      accessToken: string | null;
      refreshToken: string | null;
    },
  ): Promise<ConnectedAccountEntity> => {
    const { handleSuffix, ...rest } = overrides;
    const row = await connectedAccountRepository.save({
      handle: `${TEST_HANDLE_PREFIX}${handleSuffix}`,
      provider: ConnectedAccountProvider.GOOGLE,
      userWorkspaceId,
      workspaceId,
      ...rest,
    } as ConnectedAccountEntity);

    seededRowIds.push(row.id);

    return row;
  };

  it('encrypts both tokens, stores them as enc:v2 in Postgres, and round-trips back to the original plaintext', async () => {
    const accessTokenPlaintext = 'integration-access-token';
    const refreshTokenPlaintext = 'integration-refresh-token';

    const { encryptedAccessToken, encryptedRefreshToken } =
      service.encryptTokenPair({
        accessToken: accessTokenPlaintext,
        refreshToken: refreshTokenPlaintext,
        workspaceId,
      });

    const saved = await saveConnectedAccount({
      handleSuffix: 'round-trip',
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
    });

    const storedRow = await connectedAccountRepository.findOneByOrFail({
      id: saved.id,
    });

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
      service.decrypt({
        ciphertext: storedRow.accessToken as string,
        workspaceId,
      }),
    ).toBe(accessTokenPlaintext);
    expect(
      service.decrypt({
        ciphertext: storedRow.refreshToken as string,
        workspaceId,
      }),
    ).toBe(refreshTokenPlaintext);
  });

  it('produces a different ciphertext for the same plaintext under a different workspaceId (HKDF context binding)', () => {
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

  it('rejects a plaintext insert at the Postgres CHECK constraint level', async () => {
    await expect(
      saveConnectedAccount({
        handleSuffix: 'rejected',
        accessToken: 'plaintext-should-be-rejected',
        refreshToken: null,
      }),
    ).rejects.toThrow(/check constraint/i);
  });

  it('rejects double-encryption: re-encrypting an already-v2 envelope throws ALREADY_ENCRYPTED', () => {
    const encrypted = service.encrypt({ plaintext: 'plain', workspaceId });

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
