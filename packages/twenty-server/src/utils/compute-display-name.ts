import { isDefined } from 'twenty-shared/utils';
import { type FullNameMetadata } from 'twenty-shared/types';

export const computeDisplayName = (
  name: FullNameMetadata | null | undefined,
) => {
  if (!name) {
    return '';
  }

  return Object.values(name).filter(isDefined).join(' ');
};
