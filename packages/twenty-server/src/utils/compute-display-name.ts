import { isDefined } from 'twenty-shared';

import { FullNameMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/full-name.composite-type';

export const computeDisplayName = (
  name: FullNameMetadata | null | undefined,
) => {
  if (!name) {
    return '';
  }

  return Object.values(name).filter(isDefined).join(' ');
};
