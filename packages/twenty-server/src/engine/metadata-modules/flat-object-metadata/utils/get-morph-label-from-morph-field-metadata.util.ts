import { type FieldMetadataType, RelationType } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

import { getMorphNameFromMorphFieldMetadataName } from './get-morph-name-from-morph-field-metadata-name.util';

export const getMorphLabelFromMorphFieldMetadata = ({
  morphRelationFlatFieldMetadata,
  nameSingular,
  namePlural,
}: {
  morphRelationFlatFieldMetadata: Pick<
    FlatFieldMetadata<FieldMetadataType.MORPH_RELATION>,
    'name' | 'settings'
  >;
  nameSingular: string;
  namePlural: string;
}): string => {
  const morphName = getMorphNameFromMorphFieldMetadataName({
    morphRelationFlatFieldMetadata,
    nameSingular,
    namePlural,
  });

  const isManyToOneRelationType =
    morphRelationFlatFieldMetadata.settings.relationType ===
    RelationType.MANY_TO_ONE;

  // Return capitalized morph name as label (e.g., "target" -> "Target", "targets" -> "Targets")
  // For many-to-one, use singular form; for one-to-many, the name is already plural
  if (isManyToOneRelationType) {
    return capitalize(morphName);
  }

  return capitalize(morphName);
};

