import { isDefined } from 'twenty-shared/utils';

import type { ObjectRecordEvent } from 'twenty-shared/database-events';

import { removeSecretFromWebhookRecord } from 'src/utils/remove-secret-from-webhook-record';

export const transformEventToWebhookEvent = ({
  eventName,
  event,
}: {
  eventName: string;
  event: ObjectRecordEvent;
}) => {
  const [nameSingular, _] = eventName.split('.');

  const record =
    'after' in event.properties && isDefined(event.properties.after)
      ? event.properties.after
      : 'before' in event.properties && isDefined(event.properties.before)
        ? event.properties.before
        : {};
  const updatedFields =
    'updatedFields' in event.properties
      ? event.properties.updatedFields
      : undefined;

  const isWebhookEvent = nameSingular === 'webhook';

  const sanitizedRecord = removeSecretFromWebhookRecord(record, isWebhookEvent);

  return {
    record: sanitizedRecord,
    ...(updatedFields && { updatedFields }),
  };
};
