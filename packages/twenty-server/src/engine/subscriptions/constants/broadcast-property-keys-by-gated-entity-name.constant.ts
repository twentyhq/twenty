import { type AllMetadataName } from 'twenty-shared/metadata';

export const BROADCAST_PROPERTY_KEYS_BY_GATED_ENTITY_NAME = {
  workflow: ['id'],
  workflowVersion: ['id', 'coreWorkflowId'],
} as const satisfies Partial<Record<AllMetadataName, readonly string[]>>;

export const getBroadcastPropertyKeysForGatedEntityName = (
  entityName: string,
): readonly string[] | undefined =>
  BROADCAST_PROPERTY_KEYS_BY_GATED_ENTITY_NAME[
    entityName as keyof typeof BROADCAST_PROPERTY_KEYS_BY_GATED_ENTITY_NAME
  ];
