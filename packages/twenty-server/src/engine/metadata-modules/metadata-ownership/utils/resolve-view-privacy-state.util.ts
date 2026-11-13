import { isNonEmptyString, isString } from '@sniptt/guards';
import { ViewVisibility } from 'twenty-shared/types';

import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';
import { type OwnableRootPrivacyState } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-privacy-state.type';

type ViewPrivacyRow = {
  visibility?: unknown;
  overrides?: unknown;
  applicationUniversalIdentifier?: unknown;
  createdByUserWorkspaceId?: unknown;
};

export const resolveViewPrivacyState = (
  view: ViewPrivacyRow,
): OwnableRootPrivacyState => {
  const effectiveVisibility = resolveEffectiveFlatEntityProperty({
    metadataName: 'view',
    flatEntity: {
      visibility: view.visibility,
      overrides: view.overrides,
      applicationUniversalIdentifier: isNonEmptyString(
        view.applicationUniversalIdentifier,
      )
        ? view.applicationUniversalIdentifier
        : undefined,
    },
    property: 'visibility',
  });

  return {
    isPrivate:
      !isString(effectiveVisibility) ||
      effectiveVisibility !== ViewVisibility.WORKSPACE,
    ownerUserWorkspaceId: isNonEmptyString(view.createdByUserWorkspaceId)
      ? view.createdByUserWorkspaceId
      : null,
  };
};
