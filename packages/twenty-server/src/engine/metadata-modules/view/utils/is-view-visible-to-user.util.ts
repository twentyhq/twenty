import { isDefined } from 'twenty-shared/utils';

import {
  type OverridableFlatEntity,
  resolveEffectiveFlatEntityProperty,
} from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';

export const isViewVisibleToUser = (
  view: OverridableFlatEntity & {
    isPrivate: boolean;
    createdByUserWorkspaceId?: string | null;
  },
  userWorkspaceId?: string,
): boolean => {
  const isPrivate = resolveEffectiveFlatEntityProperty({
    metadataName: 'view',
    flatEntity: view,
    property: 'isPrivate',
  });

  if (!isPrivate) {
    return true;
  }

  return (
    isDefined(userWorkspaceId) &&
    view.createdByUserWorkspaceId === userWorkspaceId
  );
};
