import { type FieldMetadataType, RelationType } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { searchAndReplaceLast } from 'src/engine/metadata-modules/flat-object-metadata/utils/search-and-replace-last.util';

export const getMorphNameFromMorphFieldMetadataName = ({
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
  const isManyToOneRelationType =
    morphRelationFlatFieldMetadata.settings.relationType ===
    RelationType.MANY_TO_ONE;

  return searchAndReplaceLast({
    source: morphRelationFlatFieldMetadata.name,
    replace: '',
    search: isManyToOneRelationType
      ? capitalize(nameSingular)
      : capitalize(namePlural),
  });
};
