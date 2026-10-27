import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';
import { validate as uuidValidate } from 'uuid';

import { MAX_SUBSCRIPTIONS_PER_MEMBER_STREAM } from 'src/engine/metadata-modules/event-metadata/constants/event-stream.constant';
import {
  EventMetadataException,
  EventMetadataExceptionCode,
} from 'src/engine/metadata-modules/event-metadata/event-metadata.exception';
import { type MemberEventSubscriptionInput } from 'src/engine/metadata-modules/event-metadata/types/member-event-subscription-input.type';

const throwInvalidSubscription = (message: string): never => {
  throw new EventMetadataException(
    message,
    EventMetadataExceptionCode.INVALID_EVENT_SUBSCRIPTION,
  );
};

export const parseMemberEventSubscriptionsOrThrow = (
  body: unknown,
): MemberEventSubscriptionInput[] => {
  const subscriptions = isPlainObject(body) ? body.subscriptions : undefined;

  if (
    !Array.isArray(subscriptions) ||
    subscriptions.length === 0 ||
    subscriptions.length > MAX_SUBSCRIPTIONS_PER_MEMBER_STREAM
  ) {
    return throwInvalidSubscription(
      `subscriptions must be an array of 1 to ${MAX_SUBSCRIPTIONS_PER_MEMBER_STREAM} items`,
    );
  }

  return subscriptions.map((subscription: unknown) => {
    if (!isPlainObject(subscription)) {
      return throwInvalidSubscription('Each subscription must be an object');
    }

    const { event, recordId, property } = subscription;

    if (!isNonEmptyString(event)) {
      return throwInvalidSubscription('Each subscription must name an event');
    }

    if (!isString(recordId) || !uuidValidate(recordId)) {
      return throwInvalidSubscription(
        'Each subscription must have a UUID recordId',
      );
    }

    if (isDefined(property) && !isNonEmptyString(property)) {
      return throwInvalidSubscription('property must be a non-empty string');
    }

    return isDefined(property)
      ? { event, recordId, property }
      : { event, recordId };
  });
};
