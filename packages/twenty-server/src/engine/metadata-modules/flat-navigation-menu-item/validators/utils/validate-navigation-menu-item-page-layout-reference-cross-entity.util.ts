import { msg, t } from '@lingui/core/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { NavigationMenuItemExceptionCode } from 'src/engine/metadata-modules/navigation-menu-item/navigation-menu-item.exception';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import {
  type OrchestratorActionsReport,
  type OrchestratorFailureReport,
} from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';

export const validateNavigationMenuItemPageLayoutReferenceCrossEntity = ({
  optimisticUniversalFlatMaps,
  orchestratorActionsReport,
}: {
  optimisticUniversalFlatMaps: Pick<
    AllUniversalFlatEntityMaps,
    'flatNavigationMenuItemMaps' | 'flatPageLayoutMaps'
  >;
  orchestratorActionsReport: Pick<
    OrchestratorActionsReport,
    'navigationMenuItem' | 'pageLayout'
  >;
}): Pick<OrchestratorFailureReport, 'navigationMenuItem'> => {
  const validationErrors: Pick<
    OrchestratorFailureReport,
    'navigationMenuItem'
  > = {
    navigationMenuItem: [],
  };

  const createdNavigationMenuItemUniversalIdentifiers = new Set(
    orchestratorActionsReport.navigationMenuItem.create.map(
      (action) => action.flatEntity.universalIdentifier,
    ),
  );

  const updatedNavigationMenuItemUniversalIdentifiers = new Set<string>(
    orchestratorActionsReport.navigationMenuItem.update.map(
      (action) => action.universalIdentifier,
    ),
  );

  const touchedPageLayoutUniversalIdentifiers = new Set<string>([
    ...orchestratorActionsReport.pageLayout.create.map(
      (action) => action.flatEntity.universalIdentifier,
    ),
    ...orchestratorActionsReport.pageLayout.update.map(
      (action) => action.universalIdentifier,
    ),
  ]);

  const navigationMenuItemUniversalIdentifiersToValidate = new Set<string>([
    ...createdNavigationMenuItemUniversalIdentifiers,
    ...updatedNavigationMenuItemUniversalIdentifiers,
  ]);

  if (touchedPageLayoutUniversalIdentifiers.size > 0) {
    for (const navigationMenuItem of Object.values(
      optimisticUniversalFlatMaps.flatNavigationMenuItemMaps
        .byUniversalIdentifier,
    )) {
      if (
        isDefined(navigationMenuItem) &&
        isDefined(navigationMenuItem.pageLayoutUniversalIdentifier) &&
        touchedPageLayoutUniversalIdentifiers.has(
          navigationMenuItem.pageLayoutUniversalIdentifier,
        )
      ) {
        navigationMenuItemUniversalIdentifiersToValidate.add(
          navigationMenuItem.universalIdentifier,
        );
      }
    }
  }

  for (const universalIdentifier of navigationMenuItemUniversalIdentifiersToValidate) {
    const navigationMenuItem = findFlatEntityByUniversalIdentifier({
      universalIdentifier,
      flatEntityMaps: optimisticUniversalFlatMaps.flatNavigationMenuItemMaps,
    });

    if (
      !isDefined(navigationMenuItem) ||
      navigationMenuItem.type !== NavigationMenuItemType.PAGE_LAYOUT ||
      !isDefined(navigationMenuItem.pageLayoutUniversalIdentifier)
    ) {
      continue;
    }

    const referencedPageLayout = findFlatEntityByUniversalIdentifier({
      universalIdentifier: navigationMenuItem.pageLayoutUniversalIdentifier,
      flatEntityMaps: optimisticUniversalFlatMaps.flatPageLayoutMaps,
    });

    if (
      !isDefined(referencedPageLayout) ||
      referencedPageLayout.type === PageLayoutType.STANDALONE_PAGE
    ) {
      continue;
    }

    const failedValidation = getEmptyFlatEntityValidationError({
      flatEntityMinimalInformation: {
        universalIdentifier: navigationMenuItem.universalIdentifier,
      },
      metadataName: 'navigationMenuItem',
      type: createdNavigationMenuItemUniversalIdentifiers.has(
        universalIdentifier,
      )
        ? 'create'
        : 'update',
    });

    failedValidation.errors.push({
      code: NavigationMenuItemExceptionCode.INVALID_NAVIGATION_MENU_ITEM_INPUT,
      message: t`PAGE_LAYOUT navigation menu item must reference a STANDALONE_PAGE page layout`,
      userFriendlyMessage: msg`A page layout navigation menu item can only point to a standalone page`,
    });

    validationErrors.navigationMenuItem.push(failedValidation);
  }

  return validationErrors;
};
