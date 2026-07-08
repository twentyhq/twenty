import {
  evaluateSlidingWindowRateLimit,
  type RateLimitDecision,
} from './evaluate-sliding-window-rate-limit';
import { getReleaseLimitPerWindow } from './get-release-limit-per-window';
import { STRIPE_METADATA_KEY } from './stripe-metadata-key';
import { type StripeMetadata } from './stripe-metadata';

export type ReleaseRateLimitDecision = RateLimitDecision;

const SECONDS_PER_DAY = 24 * 60 * 60;
const RELEASE_RATE_WINDOW_DAYS = 30;

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
    raw: stripeMetadata?.[STRIPE_METADATA_KEY.RELEASE_TIMESTAMPS],
    metadataKey: STRIPE_METADATA_KEY.RELEASE_TIMESTAMPS,
    limit,
    windowMs: windowDays * SECONDS_PER_DAY * 1000,
    now,
  });
}
