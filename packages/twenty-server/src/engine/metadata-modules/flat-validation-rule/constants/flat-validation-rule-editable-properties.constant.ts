import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_VALIDATION_RULE_EDITABLE_PROPERTIES = [
  'name',
  'description',
  'icon',
  'expression',
  'bindings',
  'message',
  'errorFieldMetadataId',
  'isActive',
] as const satisfies MetadataEntityPropertyName<'validationRule'>[];
