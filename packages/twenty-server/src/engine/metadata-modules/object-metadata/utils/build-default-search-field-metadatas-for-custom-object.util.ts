import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type DefaultFlatFieldForCustomObjectMaps } from 'src/engine/metadata-modules/object-metadata/utils/build-default-flat-field-metadatas-for-custom-object.util';
import { type UniversalFlatObjectMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-object-metadata.type';
import { type UniversalFlatSearchFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-search-field-metadata.type';

// The custom object searchVector asExpression is built from the name field only
// (see build-default-flat-field-metadatas-for-custom-object.util.ts). Mirror that
// here by creating a single searchFieldMetadata row for the name field. Junction
// objects created with skipNameField have no name field and therefore no row.
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

  const createdAt = new Date().toISOString();

  const nameSearchFieldMetadata: UniversalFlatSearchFieldMetadata = {
    universalIdentifier: v4(),
    createdAt,
    updatedAt: createdAt,
    applicationUniversalIdentifier:
      flatObjectMetadata.applicationUniversalIdentifier,
    objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
    fieldMetadataUniversalIdentifier: nameField.universalIdentifier,
  };

  return {
    searchFieldMetadatas: [nameSearchFieldMetadata],
  };
};
