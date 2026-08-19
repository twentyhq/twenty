import { In } from 'typeorm';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { UserSessionEntity } from 'src/engine/core-modules/user-session/user-session.entity';
import { UserSessionRevokedReason } from 'src/engine/core-modules/user-session/types/user-session-revoked-reason.type';
import { generateUserSessionToken } from 'src/engine/core-modules/user-session/utils/generate-user-session-token.util';
import { hashUserSessionToken } from 'src/engine/core-modules/user-session/utils/hash-user-session-token.util';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

const daysAgo = (days: number): Date => new Date(Date.now() - days * ONE_DAY_MS);
const daysFromNow = (days: number): Date =>
  new Date(Date.now() + days * ONE_DAY_MS);

type SeededSessionFixture = {
  label: string;
  tokenHash: string;
  overrides: Partial<UserSessionEntity>;
};

// The retention boundary is 30 days after a session ended, where "ended"
// means absolute expiry or revocation. The cron runs against the same table
// the suite's other specs write to, so fixtures carry their own token hashes
// and are matched individually rather than by table counts.
describe('user session cleanup cron (integration)', () => {
  const fixtures: SeededSessionFixture[] = [
    {
      label: 'expired beyond retention',
      tokenHash: hashUserSessionToken(generateUserSessionToken()),
      overrides: { expiresAt: daysAgo(31), lastActiveAt: daysAgo(31) },
    },
    {
      label: 'revoked beyond retention',
      tokenHash: hashUserSessionToken(generateUserSessionToken()),
      overrides: {
        expiresAt: daysFromNow(90),
        lastActiveAt: daysAgo(31),
        revokedAt: daysAgo(31),
        revokedReason: UserSessionRevokedReason.UserSignOut,
      },
    },
    {
      label: 'active',
      tokenHash: hashUserSessionToken(generateUserSessionToken()),
      overrides: { expiresAt: daysFromNow(90), lastActiveAt: new Date() },
    },
    {
      label: 'expired within retention',
      tokenHash: hashUserSessionToken(generateUserSessionToken()),
      overrides: { expiresAt: daysAgo(1), lastActiveAt: daysAgo(1) },
    },
    {
      // Idle-expired sessions are unusable but carry no ended marker, so the
      // current predicate retains them until absolute expiry. Pinned here as
      // documented behavior; tightening the predicate should flip this case.
      label: 'idle-expired but not absolutely expired',
      tokenHash: hashUserSessionToken(generateUserSessionToken()),
      overrides: { expiresAt: daysFromNow(60), lastActiveAt: daysAgo(120) },
    },
  ];

  const allFixtureHashes = fixtures.map((fixture) => fixture.tokenHash);

  const findRemainingFixtureHashes = async (): Promise<string[]> => {
    const rows = await getCoreRepository<UserSessionEntity>(
      UserSessionEntity,
    ).findBy({ tokenHash: In(allFixtureHashes) });

    return rows.map((row) => row.tokenHash);
  };

  beforeAll(async () => {
    const userSessionRepository =
      getCoreRepository<UserSessionEntity>(UserSessionEntity);

    for (const fixture of fixtures) {
      await userSessionRepository.save(
        userSessionRepository.create({
          tokenHash: fixture.tokenHash,
          userId: USER_DATA_SEED_IDS.TIM,
          workspaceId: null,
          userWorkspaceId: null,
          authProvider: AuthProviderEnum.Password,
          ...fixture.overrides,
        }),
      );
    }
  });

  afterAll(async () => {
    await getCoreRepository<UserSessionEntity>(UserSessionEntity).delete({
      tokenHash: In(allFixtureHashes),
    });
  });

  it('should delete sessions ended beyond retention and keep the rest', async () => {
    const cleanupJob = getAppProviderByClassName<{
      handle: () => Promise<void>;
    }>('UserSessionCleanupCronJob');

    await cleanupJob.handle();

    const remainingHashes = await findRemainingFixtureHashes();

    // Strict lookup: a mistyped label must fail the test here, not slip
    // through as not.toContain(undefined).
    const getFixtureTokenHash = (label: string): string => {
      const fixture = fixtures.find((candidate) => candidate.label === label);

      if (!fixture) {
        throw new Error(`Unknown user session fixture: ${label}`);
      }

      return fixture.tokenHash;
    };

    const expectDeleted = (label: string) => {
      expect(remainingHashes).not.toContain(getFixtureTokenHash(label));
    };
    const expectKept = (label: string) => {
      expect(remainingHashes).toContain(getFixtureTokenHash(label));
    };

    expectDeleted('expired beyond retention');
    expectDeleted('revoked beyond retention');
    expectKept('active');
    expectKept('expired within retention');
    expectKept('idle-expired but not absolutely expired');
  });

  describe('refresh-token half', () => {
    type SeededAppTokenFixture = {
      label: string;
      type: AppTokenType;
      overrides: Partial<Pick<AppTokenEntity, 'expiresAt' | 'revokedAt'>>;
    };

    const appTokenFixtures: SeededAppTokenFixture[] = [
      {
        label: 'refresh token expired beyond retention',
        type: AppTokenType.RefreshToken,
        overrides: { expiresAt: daysAgo(31) },
      },
      {
        label: 'refresh token revoked beyond retention',
        type: AppTokenType.RefreshToken,
        overrides: { expiresAt: daysFromNow(30), revokedAt: daysAgo(31) },
      },
      {
        label: 'active refresh token',
        type: AppTokenType.RefreshToken,
        overrides: { expiresAt: daysFromNow(30) },
      },
      // The retention boundary itself: without these two, a regression that
      // deleted every ended refresh token rather than only those past
      // retention would still pass the assertions above.
      {
        label: 'refresh token expired within retention',
        type: AppTokenType.RefreshToken,
        overrides: { expiresAt: daysAgo(1) },
      },
      {
        label: 'refresh token revoked within retention',
        type: AppTokenType.RefreshToken,
        overrides: { expiresAt: daysFromNow(30), revokedAt: daysAgo(1) },
      },
      {
        // The type filter is the safety predicate: appToken is a shared table
        // and other token types are routinely long-expired. Losing the filter
        // would silently hard-delete password-reset or invitation history.
        label: 'long-expired token of another type',
        type: AppTokenType.PasswordResetToken,
        overrides: { expiresAt: daysAgo(31) },
      },
    ];

    const seededAppTokenIds = new Map<string, string>();

    beforeAll(async () => {
      const appTokenRepository =
        getCoreRepository<AppTokenEntity>(AppTokenEntity);

      for (const fixture of appTokenFixtures) {
        const saved = await appTokenRepository.save(
          appTokenRepository.create({
            userId: USER_DATA_SEED_IDS.TIM,
            type: fixture.type,
            value: '',
            ...fixture.overrides,
          }),
        );

        seededAppTokenIds.set(fixture.label, saved.id);
      }
    });

    afterAll(async () => {
      await getCoreRepository<AppTokenEntity>(AppTokenEntity).delete({
        id: In([...seededAppTokenIds.values()]),
      });
    });

    it('should delete only refresh tokens ended beyond retention', async () => {
      const cleanupJob = getAppProviderByClassName<{
        handle: () => Promise<void>;
      }>('UserSessionCleanupCronJob');

      await cleanupJob.handle();

      const remainingRows = await getCoreRepository<AppTokenEntity>(
        AppTokenEntity,
      ).findBy({ id: In([...seededAppTokenIds.values()]) });
      const remainingIds = remainingRows.map((row) => row.id);

      const getSeededAppTokenId = (label: string): string => {
        const id = seededAppTokenIds.get(label);

        if (id === undefined) {
          throw new Error(`Unknown app token fixture: ${label}`);
        }

        return id;
      };

      expect(remainingIds).not.toContain(
        getSeededAppTokenId('refresh token expired beyond retention'),
      );
      expect(remainingIds).not.toContain(
        getSeededAppTokenId('refresh token revoked beyond retention'),
      );
      expect(remainingIds).toContain(getSeededAppTokenId('active refresh token'));
      expect(remainingIds).toContain(
        getSeededAppTokenId('refresh token expired within retention'),
      );
      expect(remainingIds).toContain(
        getSeededAppTokenId('refresh token revoked within retention'),
      );
      expect(remainingIds).toContain(
        getSeededAppTokenId('long-expired token of another type'),
      );
    });
  });
});
