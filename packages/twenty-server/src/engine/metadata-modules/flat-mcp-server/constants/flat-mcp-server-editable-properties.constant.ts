import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_MCP_SERVER_EDITABLE_PROPERTIES = [
  'name',
  'label',
  'url',
  'connectionProviderId',
  'isActive',
] as const satisfies MetadataEntityPropertyName<'mcpServer'>[];
