import { uncapitalize } from 'twenty-shared/utils';

import { type FlatEntityMapsKeyToMetadata } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps-key-to-metadata';

export const getMetadataNameFromFlatEntityMapsKey = <T extends string>(
  flatEntityMapsKey: T,
): FlatEntityMapsKeyToMetadata<T> => {
  const withoutPrefix = flatEntityMapsKey.replace(/^flat/, '');
  const withoutSuffix = withoutPrefix.replace(/Maps$/, '');

  return uncapitalize(withoutSuffix) as FlatEntityMapsKeyToMetadata<T>;
};
