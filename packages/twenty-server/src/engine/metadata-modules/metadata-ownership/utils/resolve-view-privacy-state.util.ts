import { isNonEmptyString, isString } from '@sniptt/guards';
import { ViewVisibility } from 'twenty-shared/types';

import { resolveEffectiveFlatEntityProperty } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-flat-entity-property.util';
import { type OwnableRootPrivacyState } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-privacy-state.type';
import { type OwnableRootRow } from 'src/engine/metadata-modules/metadata-ownership/types/ownable-root-row.type';

export const resolveViewPrivacyState = (
  view: OwnableRootRow,
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
