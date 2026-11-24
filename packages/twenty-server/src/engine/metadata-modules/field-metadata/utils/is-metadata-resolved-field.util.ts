import { METADATA_RESOLVED_FIELD_UNIVERSAL_IDENTIFIERS } from 'src/engine/metadata-modules/field-metadata/constants/metadata-resolved-field-universal-identifiers.constant';

export const isMetadataResolvedField = ({
  universalIdentifier,
}: {
  universalIdentifier: string;
}): boolean =>
  METADATA_RESOLVED_FIELD_UNIVERSAL_IDENTIFIERS.includes(universalIdentifier);
