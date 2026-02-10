import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_WEBHOOK_EDITABLE_PROPERTIES = [
  'targetUrl',
  'operations',
  'description',
  'secret',
] as const satisfies MetadataEntityPropertyName<'webhook'>[];
