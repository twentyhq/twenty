import { isDefined } from 'twenty-shared/utils';

import { getBroadcastPropertyKeysForGatedEntityName } from 'src/engine/subscriptions/constants/broadcast-property-keys-by-gated-entity-name.constant';
import { type WorkspaceBroadcastEvent } from 'src/engine/subscriptions/workspace-event-broadcaster/types/workspace-broadcast-event.type';

const pickRecordProperties = (
  record: Record<string, unknown> | undefined,
  propertyKeys: readonly string[],
): Record<string, unknown> | undefined =>
  isDefined(record)
    ? Object.fromEntries(
        propertyKeys
          .filter((propertyKey) => propertyKey in record)
          .map((propertyKey) => [propertyKey, record[propertyKey]]),
      )
    : undefined;

export const pickBroadcastEventProperties = ({
  entityName,
  properties,
}: {
  entityName: string;
  properties: WorkspaceBroadcastEvent['properties'];
}): WorkspaceBroadcastEvent['properties'] => {
  const propertyKeys = getBroadcastPropertyKeysForGatedEntityName(entityName);

  if (!isDefined(propertyKeys)) {
    return properties;
  }

  return {
    updatedFields: properties.updatedFields,
    before: pickRecordProperties(properties.before, propertyKeys),
    after: pickRecordProperties(properties.after, propertyKeys),
  };
};
