import { ViewVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// An UNLISTED view is private to the user workspace that created it. A caller
// may resolve it only when it is not UNLISTED, or when it is UNLISTED and they
// own it. An UNLISTED view with no owner is resolvable by nobody.
export const canResolveView = (
  view: {
    visibility: ViewVisibility;
    createdByUserWorkspaceId?: string | null;
  },
  currentUserWorkspaceId?: string,
): boolean => {
  if (view.visibility !== ViewVisibility.UNLISTED) {
    return true;
  }

  return (
    isDefined(currentUserWorkspaceId) &&
    view.createdByUserWorkspaceId === currentUserWorkspaceId
  );
};
