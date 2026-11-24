import { ViewVisibility } from 'twenty-shared/types';

export const getViewVisibilityFromIsPrivate = (
  isPrivate: boolean,
): ViewVisibility =>
  isPrivate ? ViewVisibility.UNLISTED : ViewVisibility.WORKSPACE;
