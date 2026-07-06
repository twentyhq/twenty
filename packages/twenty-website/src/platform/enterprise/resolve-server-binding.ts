import isEmpty from 'lodash.isempty';

import { isDefined } from 'twenty-shared/utils';

import {
  ENTERPRISE_INSTANCE_TYPE,
  type EnterpriseInstanceType,
} from './enterprise-instance-type';
import { normalizeServerId } from './normalize-server-id';
import { SERVER_BINDING_OUTCOME } from './server-binding-outcome';
import {
  SERVER_BINDING_REJECTION_CODE,
  type ServerBindingRejectionCode,
} from './server-binding-rejection-code';
import { STRIPE_METADATA_KEY } from './stripe-metadata-key';
import { type StripeMetadata } from './stripe-metadata';

const SECONDS_PER_DAY = 24 * 60 * 60;

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
      code: ServerBindingRejectionCode;
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
  const normalizedServerId = normalizeServerId(serverId);

  if (!isDefined(normalizedServerId)) {
    if (instanceType === ENTERPRISE_INSTANCE_TYPE.DEVELOPMENT) {
      return {
        outcome: SERVER_BINDING_OUTCOME.REJECTED,
        code: SERVER_BINDING_REJECTION_CODE.MISSING_SERVER_ID,
        reason:
          'A development instance must report a server identifier. Set SERVER_ID on this instance.',
      };
    }

    const boundServerId = stripeMetadata?.[STRIPE_METADATA_KEY.BOUND_SERVER_ID];

    if (isDefined(boundServerId)) {
      return {
        outcome: SERVER_BINDING_OUTCOME.REJECTED,
        code: SERVER_BINDING_REJECTION_CODE.MISSING_SERVER_ID,
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
    const productionServerId =
      stripeMetadata?.[STRIPE_METADATA_KEY.BOUND_SERVER_ID];
    const productionLastSeenAt =
      stripeMetadata?.[STRIPE_METADATA_KEY.BOUND_SERVER_LAST_SEEN_AT];

    const hasActiveProductionBinding =
      !isEmpty(productionServerId) &&
      !isStale(productionLastSeenAt, autoReleaseDays, now);

    if (!hasActiveProductionBinding) {
      return {
        outcome: SERVER_BINDING_OUTCOME.REJECTED,
        code: SERVER_BINDING_REJECTION_CODE.DEV_REQUIRES_ACTIVE_PRODUCTION,
        reason:
          'A free development instance requires an active production instance on this enterprise subscription.',
      };
    }

    const expectedDevServerId = normalizeServerId(
      stripeMetadata?.[STRIPE_METADATA_KEY.DEV_SERVER_ID],
    );
    const devLastSeenAt =
      stripeMetadata?.[STRIPE_METADATA_KEY.DEV_SERVER_LAST_SEEN_AT];

    if (
      isEmpty(expectedDevServerId) ||
      expectedDevServerId === normalizedServerId ||
      isStale(devLastSeenAt, autoReleaseDays, now)
    ) {
      return {
        outcome: SERVER_BINDING_OUTCOME.ALLOWED,
        isBillable: false,
        metadataPatch: {
          [STRIPE_METADATA_KEY.DEV_SERVER_ID]: normalizedServerId,
          [STRIPE_METADATA_KEY.DEV_SERVER_LAST_SEEN_AT]: nowIso,
        },
      };
    }

    return {
      outcome: SERVER_BINDING_OUTCOME.REJECTED,
      code: SERVER_BINDING_REJECTION_CODE.DEV_SLOT_IN_USE,
      reason:
        'The development instance slot for this enterprise key is already in use on another server.',
    };
  }

  const boundServerId = normalizeServerId(
    stripeMetadata?.[STRIPE_METADATA_KEY.BOUND_SERVER_ID],
  );
  const boundLastSeenAt =
    stripeMetadata?.[STRIPE_METADATA_KEY.BOUND_SERVER_LAST_SEEN_AT];

  if (
    isEmpty(boundServerId) ||
    boundServerId === normalizedServerId ||
    isStale(boundLastSeenAt, autoReleaseDays, now)
  ) {
    return {
      outcome: SERVER_BINDING_OUTCOME.ALLOWED,
      isBillable: true,
      metadataPatch: {
        [STRIPE_METADATA_KEY.BOUND_SERVER_ID]: normalizedServerId,
        [STRIPE_METADATA_KEY.BOUND_SERVER_LAST_SEEN_AT]: nowIso,
      },
    };
  }

  return {
    outcome: SERVER_BINDING_OUTCOME.REJECTED,
    code: SERVER_BINDING_REJECTION_CODE.BOUND_TO_ANOTHER_SERVER,
    reason:
      'This enterprise key is already in use on another server instance. Release it from that server or transfer it to this one.',
  };
}
