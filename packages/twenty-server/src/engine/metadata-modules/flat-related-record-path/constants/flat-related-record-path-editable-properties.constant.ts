/* @license Enterprise */

import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_RELATED_RECORD_PATH_EDITABLE_PROPERTIES = [
  'isInherent',
  'isActive',
] as const satisfies MetadataEntityPropertyName<'relatedRecordPath'>[];
