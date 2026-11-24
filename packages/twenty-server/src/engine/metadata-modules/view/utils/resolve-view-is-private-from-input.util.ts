import { ViewVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const resolveViewIsPrivateFromInput = ({
  isPrivate,
  visibility,
}: {
  isPrivate?: boolean | null;
  visibility?: ViewVisibility | null;
}): boolean | undefined => {
  if (isDefined(isPrivate)) {
    return isPrivate;
  }

  return isDefined(visibility)
    ? visibility === ViewVisibility.UNLISTED
    : undefined;
};
