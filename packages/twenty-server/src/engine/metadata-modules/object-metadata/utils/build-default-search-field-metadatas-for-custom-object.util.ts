import { isDefined } from 'twenty-shared/utils';

import { buildFlatSearchFieldMetadataForField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/build-flat-search-field-metadata-for-field.util';
import { type DefaultFlatFieldForCustomObjectMaps } from 'src/engine/metadata-modules/object-metadata/utils/build-default-flat-field-metadatas-for-custom-object.util';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatSearchFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-search-field-metadata.type';

// Mirrors the custom-object searchVector, which indexes the name field only. Junction
// objects (skipNameField) have no name field and therefore get no row.
export const buildDefaultSearchFieldMetadatasForCustomObject = ({
  flatObjectMetadata,
  defaultFlatFieldForCustomObjectMaps,
}: {
  flatObjectMetadata: UniversalFlatObjectMetadata & { id: string };
  defaultFlatFieldForCustomObjectMaps: DefaultFlatFieldForCustomObjectMaps;
}): {
  searchFieldMetadatas: UniversalFlatSearchFieldMetadata[];
} => {
  const nameField = defaultFlatFieldForCustomObjectMaps.fields.nameField;

  if (!isDefined(nameField)) {
    return {
      searchFieldMetadatas: [],
    };
  }

  const nameSearchFieldMetadata = buildFlatSearchFieldMetadataForField({
    flatObjectMetadata,
    flatFieldMetadata: nameField,
    tsVectorFlatFieldMetadata: defaultFlatFieldForCustomObjectMaps.fields.searchVector,
    position: 0,
  });

  return {
    searchFieldMetadatas: [nameSearchFieldMetadata],
  };
};
