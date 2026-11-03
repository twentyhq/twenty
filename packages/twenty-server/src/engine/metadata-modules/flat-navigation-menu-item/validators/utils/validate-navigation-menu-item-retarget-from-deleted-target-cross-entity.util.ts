import { msg, t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { NavigationMenuItemExceptionCode } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import {
  type OrchestratorActionsReport,
  type OrchestratorFailureReport,
} from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';

type OptimisticMaps = Pick<
  AllUniversalFlatEntityMaps,
  'flatViewMaps' | 'flatObjectMetadataMaps' | 'flatPageLayoutMaps'
>;

const isObjectGone = (
  objectMetadataUniversalIdentifier: string,
  maps: OptimisticMaps,
) =>
  !isDefined(
    findFlatEntityByUniversalIdentifier({
      universalIdentifier: objectMetadataUniversalIdentifier,
      flatEntityMaps: maps.flatObjectMetadataMaps,
    }),
  );

// A view also goes when its object is deleted, through the database cascade.
const isViewGone = (viewUniversalIdentifier: string, maps: OptimisticMaps) => {
  const view = findFlatEntityByUniversalIdentifier({
    universalIdentifier: viewUniversalIdentifier,
    flatEntityMaps: maps.flatViewMaps,
  });

  return (
    !isDefined(view) ||
    isObjectGone(view.objectMetadataUniversalIdentifier, maps)
  );
};

const isPageLayoutGone = (
  pageLayoutUniversalIdentifier: string,
  maps: OptimisticMaps,
) =>
  !isDefined(
    findFlatEntityByUniversalIdentifier({
      universalIdentifier: pageLayoutUniversalIdentifier,
      flatEntityMaps: maps.flatPageLayoutMaps,
    }),
  );

const TARGET_CHECKS = [
  ['viewUniversalIdentifier', isViewGone],
  ['targetObjectMetadataUniversalIdentifier', isObjectGone],
  ['pageLayoutUniversalIdentifier', isPageLayoutGone],
] as const;

// Deletes run before navigation menu item updates and cascade to items still
// pointing at the deleted target, so the update would silently find no row.
export const validateNavigationMenuItemRetargetFromDeletedTargetCrossEntity = ({
  optimisticUniversalFlatMaps,
  orchestratorActionsReport,
}: {
  optimisticUniversalFlatMaps: OptimisticMaps;
  orchestratorActionsReport: Pick<
    OrchestratorActionsReport,
    'navigationMenuItem'
  >;
}): Pick<OrchestratorFailureReport, 'navigationMenuItem'> => {
  const validationErrors: Pick<
    OrchestratorFailureReport,
    'navigationMenuItem'
  > = { navigationMenuItem: [] };

  for (const updateAction of orchestratorActionsReport.navigationMenuItem
    .update) {
    const isRetargetedFromDeletedTarget = TARGET_CHECKS.some(
      ([property, isGone]) => {
        const previousTarget = updateAction.diff?.[property]?.before;

        return (
          isDefined(previousTarget) &&
          previousTarget !== updateAction.diff?.[property]?.after &&
          isGone(previousTarget, optimisticUniversalFlatMaps)
        );
      },
    );

    if (!isRetargetedFromDeletedTarget) {
      continue;
    }

    const failedValidation = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: updateAction.universalIdentifier,
      },
      metadataName: 'navigationMenuItem',
      type: 'update',
    });

    failedValidation.errors.push({
      code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      message: t`Cannot re-point a navigation menu item away from a target deleted in the same sync`,
      userFriendlyMessage: msg`Re-point this menu item first, then remove its previous target in a later sync`,
    });

    validationErrors.navigationMenuItem.push(failedValidation);
  }

  return validationErrors;
};
