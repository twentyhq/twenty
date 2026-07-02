import {
  BOUND_SERVER_ID_KEY,
  BOUND_SERVER_LAST_SEEN_AT_KEY,
  DEV_SERVER_ID_KEY,
  DEV_SERVER_LAST_SEEN_AT_KEY,
  evaluateReleaseRateLimit,
  isBillableSeatReporter,
  parseInstanceType,
  RELEASE_TIMESTAMPS_KEY,
  resolveServerBinding,
} from './resolve-server-binding';

const NOW = new Date('2026-06-30T12:00:00.000Z');
const AUTO_RELEASE_DAYS = 14;

const daysAgoIso = (days: number): string =>
  new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

describe('resolveServerBinding', () => {
  it('claims a free production slot and persists the binding in stripe', () => {
    const decision = resolveServerBinding({
      stripeMetadata: {},
      serverId: 'server-a',
      instanceType: 'production',
      autoReleaseDays: AUTO_RELEASE_DAYS,
      now: NOW,
    });

    expect(decision).toEqual({
      outcome: 'allowed',
      isBillable: true,
      metadataPatch: {
        [BOUND_SERVER_ID_KEY]: 'server-a',
        [BOUND_SERVER_LAST_SEEN_AT_KEY]: NOW.toISOString(),
      },
    });
  });

  it('allows the already-bound production server (refreshes lastSeenAt)', () => {
    const decision = resolveServerBinding({
      stripeMetadata: {
        [BOUND_SERVER_ID_KEY]: 'server-a',
        [BOUND_SERVER_LAST_SEEN_AT_KEY]: daysAgoIso(1),
      },
      serverId: 'server-a',
      instanceType: 'production',
      autoReleaseDays: AUTO_RELEASE_DAYS,
      now: NOW,
    });

    expect(decision.outcome).toBe('allowed');
    if (decision.outcome === 'allowed') {
      expect(decision.isBillable).toBe(true);
      expect(decision.metadataPatch[BOUND_SERVER_LAST_SEEN_AT_KEY]).toBe(
        NOW.toISOString(),
      );
    }
  });

  it('rejects a foreign production server while the binding is fresh', () => {
    const decision = resolveServerBinding({
      stripeMetadata: {
        [BOUND_SERVER_ID_KEY]: 'server-a',
        [BOUND_SERVER_LAST_SEEN_AT_KEY]: daysAgoIso(1),
      },
      serverId: 'server-b',
      instanceType: 'production',
      autoReleaseDays: AUTO_RELEASE_DAYS,
      now: NOW,
    });

    expect(decision.outcome).toBe('rejected');
  });

  it('auto-releases a stale binding to a new production server', () => {
    const decision = resolveServerBinding({
      stripeMetadata: {
        [BOUND_SERVER_ID_KEY]: 'server-a',
        [BOUND_SERVER_LAST_SEEN_AT_KEY]: daysAgoIso(AUTO_RELEASE_DAYS + 1),
      },
      serverId: 'server-b',
      instanceType: 'production',
      autoReleaseDays: AUTO_RELEASE_DAYS,
      now: NOW,
    });

    expect(decision.outcome).toBe('allowed');
    if (decision.outcome === 'allowed') {
      expect(decision.metadataPatch[BOUND_SERVER_ID_KEY]).toBe('server-b');
    }
  });

  it('binds a development instance into the dev slot as non-billable', () => {
    const decision = resolveServerBinding({
      stripeMetadata: {
        [BOUND_SERVER_ID_KEY]: 'server-a',
        [BOUND_SERVER_LAST_SEEN_AT_KEY]: daysAgoIso(1),
      },
      serverId: 'server-dev',
      instanceType: 'development',
      autoReleaseDays: AUTO_RELEASE_DAYS,
      now: NOW,
    });

    expect(decision).toEqual({
      outcome: 'allowed',
      isBillable: false,
      metadataPatch: {
        [DEV_SERVER_ID_KEY]: 'server-dev',
        [DEV_SERVER_LAST_SEEN_AT_KEY]: NOW.toISOString(),
      },
    });
  });

  it('rejects a second development instance while the dev slot is fresh', () => {
    const decision = resolveServerBinding({
      stripeMetadata: {
        [DEV_SERVER_ID_KEY]: 'server-dev',
        [DEV_SERVER_LAST_SEEN_AT_KEY]: daysAgoIso(1),
      },
      serverId: 'server-dev-2',
      instanceType: 'development',
      autoReleaseDays: AUTO_RELEASE_DAYS,
      now: NOW,
    });

    expect(decision.outcome).toBe('rejected');
  });

  it('rejects a production instance that lost its serverId while a binding exists', () => {
    const decision = resolveServerBinding({
      stripeMetadata: {
        [BOUND_SERVER_ID_KEY]: 'server-a',
        [BOUND_SERVER_LAST_SEEN_AT_KEY]: daysAgoIso(1),
      },
      serverId: null,
      instanceType: 'production',
      autoReleaseDays: AUTO_RELEASE_DAYS,
      now: NOW,
    });

    expect(decision.outcome).toBe('rejected');
  });

  it('allows legacy instances without a serverId without binding', () => {
    const decision = resolveServerBinding({
      stripeMetadata: {},
      serverId: null,
      instanceType: 'production',
      autoReleaseDays: AUTO_RELEASE_DAYS,
      now: NOW,
    });

    expect(decision).toEqual({
      outcome: 'allowed',
      isBillable: true,
      metadataPatch: {},
    });
  });
});

describe('isBillableSeatReporter', () => {
  it('bills the bound production server', () => {
    expect(
      isBillableSeatReporter({
        stripeMetadata: { [BOUND_SERVER_ID_KEY]: 'server-a' },
        serverId: 'server-a',
      }),
    ).toBe(true);
  });

  it('does not bill a foreign server', () => {
    expect(
      isBillableSeatReporter({
        stripeMetadata: { [BOUND_SERVER_ID_KEY]: 'server-a' },
        serverId: 'server-b',
      }),
    ).toBe(false);
  });

  it('does not bill a development instance (no production binding)', () => {
    expect(
      isBillableSeatReporter({
        stripeMetadata: { [DEV_SERVER_ID_KEY]: 'server-dev' },
        serverId: 'server-dev',
      }),
    ).toBe(false);
  });

  it('bills legacy instances with no serverId and no binding', () => {
    expect(
      isBillableSeatReporter({ stripeMetadata: {}, serverId: undefined }),
    ).toBe(true);
  });
});

describe('parseInstanceType', () => {
  it('returns development only for the development literal', () => {
    expect(parseInstanceType('development')).toBe('development');
    expect(parseInstanceType('production')).toBe('production');
    expect(parseInstanceType(undefined)).toBe('production');
    expect(parseInstanceType('something-else')).toBe('production');
  });
});

describe('evaluateReleaseRateLimit', () => {
  const RELEASE_WINDOW_DAYS = 30;
  const msDaysAgo = (days: number): number =>
    NOW.getTime() - days * 24 * 60 * 60 * 1000;

  it('allows a release under the limit and records the new timestamp', () => {
    const decision = evaluateReleaseRateLimit({
      stripeMetadata: {
        [RELEASE_TIMESTAMPS_KEY]: [msDaysAgo(1), msDaysAgo(2)].join(','),
      },
      limit: 10,
      windowDays: RELEASE_WINDOW_DAYS,
      now: NOW,
    });

    expect(decision.allowed).toBe(true);
    if (decision.allowed) {
      const recorded =
        decision.metadataPatch[RELEASE_TIMESTAMPS_KEY].split(',').map(Number);
      expect(recorded).toHaveLength(3);
      expect(recorded).toContain(NOW.getTime());
    }
  });

  it('allows the first ever release (no prior timestamps)', () => {
    const decision = evaluateReleaseRateLimit({
      stripeMetadata: {},
      limit: 10,
      windowDays: RELEASE_WINDOW_DAYS,
      now: NOW,
    });

    expect(decision.allowed).toBe(true);
    if (decision.allowed) {
      expect(decision.metadataPatch[RELEASE_TIMESTAMPS_KEY]).toBe(
        String(NOW.getTime()),
      );
    }
  });

  it('blocks a release when the limit is reached within the window', () => {
    const timestamps = Array.from({ length: 10 }, (_, index) =>
      msDaysAgo(index + 1),
    );

    const decision = evaluateReleaseRateLimit({
      stripeMetadata: { [RELEASE_TIMESTAMPS_KEY]: timestamps.join(',') },
      limit: 10,
      windowDays: RELEASE_WINDOW_DAYS,
      now: NOW,
    });

    expect(decision.allowed).toBe(false);
    if (!decision.allowed) {
      const expectedRetry = new Date(
        msDaysAgo(10) + RELEASE_WINDOW_DAYS * 24 * 60 * 60 * 1000,
      );
      expect(decision.retryAfter.toISOString()).toBe(
        expectedRetry.toISOString(),
      );
    }
  });

  it('ignores releases older than the window (rolling)', () => {
    const timestamps = [
      ...Array.from({ length: 9 }, (_, index) => msDaysAgo(index + 1)),
      msDaysAgo(40),
      msDaysAgo(45),
    ];

    const decision = evaluateReleaseRateLimit({
      stripeMetadata: { [RELEASE_TIMESTAMPS_KEY]: timestamps.join(',') },
      limit: 10,
      windowDays: RELEASE_WINDOW_DAYS,
      now: NOW,
    });

    expect(decision.allowed).toBe(true);
    if (decision.allowed) {
      const recorded =
        decision.metadataPatch[RELEASE_TIMESTAMPS_KEY].split(',').map(Number);
      expect(recorded).toHaveLength(10);
      expect(recorded).not.toContain(msDaysAgo(40));
      expect(recorded).not.toContain(msDaysAgo(45));
    }
  });
});
