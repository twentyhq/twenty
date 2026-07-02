import isEmpty from 'lodash.isempty';

import { isDefined } from 'twenty-shared/utils';

export const ENTERPRISE_INSTANCE_TYPE = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development',
} as const;

export type EnterpriseInstanceType =
  (typeof ENTERPRISE_INSTANCE_TYPE)[keyof typeof ENTERPRISE_INSTANCE_TYPE];

export const SERVER_BINDING_OUTCOME = {
  ALLOWED: 'allowed',
  REJECTED: 'rejected',
} as const;

export type ServerBindingOutcome =
  (typeof SERVER_BINDING_OUTCOME)[keyof typeof SERVER_BINDING_OUTCOME];

export const BOUND_SERVER_ID_KEY = 'boundServerId';
export const BOUND_SERVER_LAST_SEEN_AT_KEY = 'boundServerLastSeenAt';
export const DEV_SERVER_ID_KEY = 'devServerId';
export const DEV_SERVER_LAST_SEEN_AT_KEY = 'devServerLastSeenAt';

export const ENTERPRISE_KEY_BOUND_TO_ANOTHER_SERVER_CODE =
  'ENTERPRISE_KEY_BOUND_TO_ANOTHER_SERVER';

export const ENTERPRISE_RELEASE_RATE_LIMITED_CODE =
  'ENTERPRISE_RELEASE_RATE_LIMITED';

export const ENTERPRISE_VALIDITY_TOKEN_RATE_LIMITED_CODE =
  'ENTERPRISE_VALIDITY_TOKEN_RATE_LIMITED';

export const RELEASE_TIMESTAMPS_KEY = 'releaseTimestamps';

export const VALIDITY_TOKEN_EMISSIONS_KEY_BY_INSTANCE_TYPE = {
  [ENTERPRISE_INSTANCE_TYPE.PRODUCTION]: 'validityTokenEmissionsProduction',
  [ENTERPRISE_INSTANCE_TYPE.DEVELOPMENT]: 'validityTokenEmissionsDevelopment',
} as const satisfies Record<EnterpriseInstanceType, string>;

const DEFAULT_AUTO_RELEASE_DAYS = 14;
const SECONDS_PER_DAY = 24 * 60 * 60;

const DEFAULT_RELEASE_LIMIT_PER_WINDOW = 10;
const RELEASE_RATE_WINDOW_DAYS = 30;

const DEFAULT_VALIDITY_TOKEN_EMISSIONS_PER_WINDOW = 2;
const VALIDITY_TOKEN_EMISSION_WINDOW_HOURS = 24;

export function getAutoReleaseDays(): number {
  const value = process.env.ENTERPRISE_AUTO_RELEASE_DAYS;

  if (value === undefined || value === '') {
    return DEFAULT_AUTO_RELEASE_DAYS;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return DEFAULT_AUTO_RELEASE_DAYS;
  }

  return parsed;
}

export function getReleaseLimitPerWindow(): number {
  const value = process.env.ENTERPRISE_RELEASE_LIMIT_PER_MONTH;

  if (value === undefined || value === '') {
    return DEFAULT_RELEASE_LIMIT_PER_WINDOW;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return DEFAULT_RELEASE_LIMIT_PER_WINDOW;
  }

  return parsed;
}

export function getValidityTokenEmissionLimitPerWindow(): number {
  const value = process.env.ENTERPRISE_VALIDITY_TOKEN_EMISSIONS_PER_DAY;

  if (value === undefined || value === '') {
    return DEFAULT_VALIDITY_TOKEN_EMISSIONS_PER_WINDOW;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return DEFAULT_VALIDITY_TOKEN_EMISSIONS_PER_WINDOW;
  }

  return parsed;
}

type StripeMetadata = Record<string, string> | null | undefined;

export type RateLimitDecision =
  | { allowed: true; metadataPatch: Record<string, string> }
  | { allowed: false; retryAfter: Date };

export type ReleaseRateLimitDecision = RateLimitDecision;

const parseRecentTimestamps = (
  raw: string | undefined,
  now: Date,
  windowMs: number,
): number[] => {
  if (!isDefined(raw) || raw.length === 0) {
    return [];
  }

  const cutoffMs = now.getTime() - windowMs;

  return raw
    .split(',')
    .map((entry) => Number.parseInt(entry, 10))
    .filter(
      (timestampMs) => !Number.isNaN(timestampMs) && timestampMs > cutoffMs,
    )
    .sort((a, b) => a - b);
};

const evaluateSlidingWindowRateLimit = ({
  raw,
  metadataKey,
  limit,
  windowMs,
  now,
}: {
  raw: string | undefined;
  metadataKey: string;
  limit: number;
  windowMs: number;
  now: Date;
}): RateLimitDecision => {
  const recentTimestamps = parseRecentTimestamps(raw, now, windowMs);

  if (recentTimestamps.length >= limit) {
    const oldestTimestampMs = recentTimestamps[0];

    return {
      allowed: false,
      retryAfter: new Date(oldestTimestampMs + windowMs),
    };
  }

  const updatedTimestamps = [...recentTimestamps, now.getTime()];

  return {
    allowed: true,
    metadataPatch: {
      [metadataKey]: updatedTimestamps.join(','),
    },
  };
};

export function evaluateReleaseRateLimit({
  stripeMetadata,
  limit = getReleaseLimitPerWindow(),
  windowDays = RELEASE_RATE_WINDOW_DAYS,
  now = new Date(),
}: {
  stripeMetadata: StripeMetadata;
  limit?: number;
  windowDays?: number;
  now?: Date;
}): RateLimitDecision {
  return evaluateSlidingWindowRateLimit({
    raw: stripeMetadata?.[RELEASE_TIMESTAMPS_KEY],
    metadataKey: RELEASE_TIMESTAMPS_KEY,
    limit,
    windowMs: windowDays * SECONDS_PER_DAY * 1000,
    now,
  });
}

export function evaluateValidityTokenEmissionRateLimit({
  stripeMetadata,
  instanceType,
  limit = getValidityTokenEmissionLimitPerWindow(),
  windowHours = VALIDITY_TOKEN_EMISSION_WINDOW_HOURS,
  now = new Date(),
}: {
  stripeMetadata: StripeMetadata;
  instanceType: EnterpriseInstanceType;
  limit?: number;
  windowHours?: number;
  now?: Date;
}): RateLimitDecision {
  const metadataKey =
    VALIDITY_TOKEN_EMISSIONS_KEY_BY_INSTANCE_TYPE[instanceType];

  return evaluateSlidingWindowRateLimit({
    raw: stripeMetadata?.[metadataKey],
    metadataKey,
    limit,
    windowMs: windowHours * 60 * 60 * 1000,
    now,
  });
}

export type ResolveServerBindingInput = {
  stripeMetadata: StripeMetadata;
  serverId: string | null | undefined;
  instanceType: EnterpriseInstanceType;
  autoReleaseDays: number;
  now?: Date;
};

export type ServerBindingDecision =
  | {
      outcome: typeof SERVER_BINDING_OUTCOME.ALLOWED;
      isBillable: boolean;
      metadataPatch: Record<string, string>;
    }
  | {
      outcome: typeof SERVER_BINDING_OUTCOME.REJECTED;
      reason: string;
    };

const isStale = (
  lastSeenAt: string | undefined,
  autoReleaseDays: number,
  now: Date,
): boolean => {
  if (!isDefined(lastSeenAt) || isEmpty(lastSeenAt)) {
    return false;
  }

  const lastSeenMs = Date.parse(lastSeenAt);

  if (Number.isNaN(lastSeenMs)) {
    return false;
  }

  const ageSeconds = (now.getTime() - lastSeenMs) / 1000;

  return ageSeconds > autoReleaseDays * SECONDS_PER_DAY;
};

export function resolveServerBinding({
  stripeMetadata,
  serverId,
  instanceType,
  autoReleaseDays,
  now = new Date(),
}: ResolveServerBindingInput): ServerBindingDecision {
  if (!isDefined(serverId)) {
    if (instanceType === ENTERPRISE_INSTANCE_TYPE.DEVELOPMENT) {
      return {
        outcome: SERVER_BINDING_OUTCOME.REJECTED,
        reason:
          'A development instance must report a server identifier. Set SERVER_ID on this instance.',
      };
    }

    const boundServerId = stripeMetadata?.[BOUND_SERVER_ID_KEY];

    if (isDefined(boundServerId)) {
      return {
        outcome: SERVER_BINDING_OUTCOME.REJECTED,
        reason:
          'This enterprise key is bound to a server instance, but this instance did not report a server identifier. Set SERVER_ID on this instance or release the binding to rebind it.',
      };
    }

    return {
      outcome: SERVER_BINDING_OUTCOME.ALLOWED,
      isBillable: true,
      metadataPatch: {},
    };
  }

  const nowIso = now.toISOString();

  if (instanceType === ENTERPRISE_INSTANCE_TYPE.DEVELOPMENT) {
    const productionServerId = stripeMetadata?.[BOUND_SERVER_ID_KEY];
    const productionLastSeenAt =
      stripeMetadata?.[BOUND_SERVER_LAST_SEEN_AT_KEY];

    const hasActiveProductionBinding =
      !isEmpty(productionServerId) &&
      !isStale(productionLastSeenAt, autoReleaseDays, now);

    if (!hasActiveProductionBinding) {
      return {
        outcome: SERVER_BINDING_OUTCOME.REJECTED,
        reason:
          'A free development instance requires an active production instance on this enterprise subscription.',
      };
    }

    const expectedDevServerId = stripeMetadata?.[DEV_SERVER_ID_KEY];
    const devLastSeenAt = stripeMetadata?.[DEV_SERVER_LAST_SEEN_AT_KEY];

    if (
      isEmpty(expectedDevServerId) ||
      expectedDevServerId === serverId ||
      isStale(devLastSeenAt, autoReleaseDays, now)
    ) {
      return {
        outcome: SERVER_BINDING_OUTCOME.ALLOWED,
        isBillable: false,
        metadataPatch: {
          [DEV_SERVER_ID_KEY]: serverId,
          [DEV_SERVER_LAST_SEEN_AT_KEY]: nowIso,
        },
      };
    }

    return {
      outcome: SERVER_BINDING_OUTCOME.REJECTED,
      reason:
        'The development instance slot for this enterprise key is already in use on another server.',
    };
  }

  const boundServerId = stripeMetadata?.[BOUND_SERVER_ID_KEY];
  const boundLastSeenAt = stripeMetadata?.[BOUND_SERVER_LAST_SEEN_AT_KEY];

  if (
    isEmpty(boundServerId) ||
    boundServerId === serverId ||
    isStale(boundLastSeenAt, autoReleaseDays, now)
  ) {
    return {
      outcome: SERVER_BINDING_OUTCOME.ALLOWED,
      isBillable: true,
      metadataPatch: {
        [BOUND_SERVER_ID_KEY]: serverId,
        [BOUND_SERVER_LAST_SEEN_AT_KEY]: nowIso,
      },
    };
  }

  return {
    outcome: SERVER_BINDING_OUTCOME.REJECTED,
    reason:
      'This enterprise key is already in use on another server instance. Release it from that server or transfer it to this one.',
  };
}

export function isBillableSeatReporter({
  stripeMetadata,
  serverId,
}: {
  stripeMetadata: StripeMetadata;
  serverId?: string;
}): boolean {
  const boundServerId = stripeMetadata?.[BOUND_SERVER_ID_KEY];

  if (isEmpty(boundServerId)) {
    return isEmpty(serverId);
  }

  return serverId === boundServerId;
}

export function parseInstanceType(value?: string): EnterpriseInstanceType {
  return value === ENTERPRISE_INSTANCE_TYPE.DEVELOPMENT
    ? ENTERPRISE_INSTANCE_TYPE.DEVELOPMENT
    : ENTERPRISE_INSTANCE_TYPE.PRODUCTION;
}
