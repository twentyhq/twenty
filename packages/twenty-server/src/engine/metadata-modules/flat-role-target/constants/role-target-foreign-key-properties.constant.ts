import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const ROLE_TARGET_FOREIGN_KEY_PROPERTIES = [
  'userWorkspaceId',
  'apiKeyId',
  'agentId',
] as const satisfies MetadataEntityPropertyName<'roleTarget'>[];
