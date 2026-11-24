import { DYNAMIC_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/engine/metadata-modules/field-metadata/constants/dynamic-field-universal-identifiers.constant';

export const isDynamicField = ({
  universalIdentifier,
}: {
  universalIdentifier: string;
}): boolean =>
  DYNAMIC_FIELD_UNIVERSAL_IDENTIFIERS.includes(universalIdentifier);
