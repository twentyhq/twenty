import { isDefined } from 'twenty-shared/utils';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { type UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';

export const filterSystemSideEffectFlatViewFieldsToDelete = ({
  viewFieldUniversalIdentifiers,
  flatViewFieldMaps,
}: {
  viewFieldUniversalIdentifiers: string[];
  flatViewFieldMaps: UniversalFlatEntityMaps<
    MetadataUniversalFlatEntity<'viewField'>
  >;
}): Record<string, MetadataUniversalFlatEntity<'viewField'>> => {
  const viewFieldToDelete: Record<
    string,
    MetadataUniversalFlatEntity<'viewField'>
  > = {};

  for (const viewFieldUniversalIdentifier of viewFieldUniversalIdentifiers) {
    const flatViewField =
      flatViewFieldMaps.byUniversalIdentifier[viewFieldUniversalIdentifier];

    if (
      !isDefined(flatViewField) ||
      flatViewField.isSystemSideEffect !== true
    ) {
      continue;
    }

    viewFieldToDelete[flatViewField.universalIdentifier] = flatViewField;
  }

  return viewFieldToDelete;
};
