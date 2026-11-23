import { ViewVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  type OverridableFlatEntity,
  resolveEffectiveFlatEntityProperty,
} from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';

export const isViewVisibleToUser = (
  view: OverridableFlatEntity & {
    visibility: ViewVisibility;
    createdByUserWorkspaceId?: string | null;
  },
  userWorkspaceId?: string,
): boolean => {
  const visibility = resolveEffectiveFlatEntityProperty({
    metadataName: 'view',
    flatEntity: view,
    property: 'visibility',
  });

  if (visibility === ViewVisibility.WORKSPACE) {
    return true;
  }

  return (
    visibility === ViewVisibility.UNLISTED &&
    isDefined(userWorkspaceId) &&
    view.createdByUserWorkspaceId === userWorkspaceId
  );
};
