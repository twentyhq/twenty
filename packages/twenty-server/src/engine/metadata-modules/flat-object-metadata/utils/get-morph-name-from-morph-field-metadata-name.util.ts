import { type FieldMetadataType, RelationType } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import { searchAndReplaceLast } from 'src/engine/metadata-modules/flat-object-metadata/utils/search-and-replace-last.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export const getMorphNameFromMorphFieldMetadataName = ({
  morphRelationFlatFieldMetadata,
  nameSingular,
  namePlural,
}: {
  morphRelationFlatFieldMetadata: Pick<
    UniversalFlatFieldMetadata<FieldMetadataType.MORPH_RELATION>,
    'name' | 'universalSettings'
  >;
  nameSingular: string;
  namePlural: string;
}): string => {
  const isManyToOneRelationType =
    morphRelationFlatFieldMetadata.universalSettings.relationType ===
    RelationType.MANY_TO_ONE;

  return searchAndReplaceLast({
    source: morphRelationFlatFieldMetadata.name,
    replace: '',
    search: isManyToOneRelationType
      ? capitalize(nameSingular)
      : capitalize(namePlural),
  });
};
