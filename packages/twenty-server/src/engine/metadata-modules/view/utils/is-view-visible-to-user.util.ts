import { ViewVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isViewVisibleToUser = (
  view: {
    visibility: ViewVisibility;
    ownerUserWorkspaceId?: string | null;
  },
  userWorkspaceId?: string,
): boolean => {
  if (view.visibility === ViewVisibility.WORKSPACE) {
    return true;
  }

  return (
    view.visibility === ViewVisibility.UNLISTED &&
    isDefined(userWorkspaceId) &&
    view.ownerUserWorkspaceId === userWorkspaceId
  );
};
