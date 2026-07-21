import { type EnterpriseInstanceType } from './enterprise-instance-type';
import {
  evaluateSlidingWindowRateLimit,
  type RateLimitDecision,
} from './evaluate-sliding-window-rate-limit';
import { getValidityTokenEmissionLimitPerWindow } from './get-validity-token-emission-limit-per-window';
import { type StripeMetadata } from './stripe-metadata';
import { VALIDITY_TOKEN_EMISSIONS_KEY_BY_INSTANCE_TYPE } from './validity-token-emissions-key';

const VALIDITY_TOKEN_EMISSION_WINDOW_HOURS = 24;

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
