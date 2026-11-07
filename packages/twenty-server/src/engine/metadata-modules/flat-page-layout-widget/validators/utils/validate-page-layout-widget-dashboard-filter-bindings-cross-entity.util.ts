import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { validatePageLayoutWidgetDashboardFilterBindings } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-page-layout-widget-dashboard-filter-bindings.util';
import {
  type OrchestratorActionsReport,
  type OrchestratorFailureReport,
} from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { getEmptyFlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/utils/get-flat-entity-validation-error.util';

export const validatePageLayoutWidgetDashboardFilterBindingsCrossEntity = ({
  optimisticUniversalFlatMaps,
  orchestratorActionsReport,
  orchestratorFailureReport,
}: {
  optimisticUniversalFlatMaps: Pick<
    AllUniversalFlatEntityMaps,
    | 'flatPageLayoutMaps'
    | 'flatPageLayoutTabMaps'
    | 'flatPageLayoutWidgetMaps'
    | 'flatFieldMetadataMaps'
  >;
  orchestratorActionsReport: Pick<
    OrchestratorActionsReport,
    'pageLayout' | 'pageLayoutWidget'
  >;
  orchestratorFailureReport: Pick<
    OrchestratorFailureReport,
    'pageLayoutWidget'
  >;
}): Pick<OrchestratorFailureReport, 'pageLayoutWidget'> => {
  const {
    flatPageLayoutMaps,
    flatPageLayoutTabMaps,
    flatPageLayoutWidgetMaps,
  } = optimisticUniversalFlatMaps;
  const validationErrors: Pick<OrchestratorFailureReport, 'pageLayoutWidget'> =
    {
      pageLayoutWidget: [],
    };

  const alreadyValidatedWidgetUniversalIdentifiers = new Set([
    ...orchestratorActionsReport.pageLayoutWidget.create.map(
      (action) => action.flatEntity.universalIdentifier,
    ),
    ...orchestratorActionsReport.pageLayoutWidget.update.map(
      (action) => action.universalIdentifier,
    ),
    ...orchestratorFailureReport.pageLayoutWidget.map(
      (failedValidation) =>
        failedValidation.flatEntityMinimalInformation.universalIdentifier,
    ),
  ]);

  for (const {
    universalIdentifier: pageLayoutUniversalIdentifier,
  } of orchestratorActionsReport.pageLayout.update) {
    const pageLayout =
      flatPageLayoutMaps.byUniversalIdentifier[pageLayoutUniversalIdentifier];

    if (!isDefined(pageLayout)) {
      continue;
    }

    const widgetsToRevalidate = pageLayout.tabUniversalIdentifiers
      .flatMap(
        (tabUniversalIdentifier) =>
          flatPageLayoutTabMaps.byUniversalIdentifier[tabUniversalIdentifier]
            ?.widgetUniversalIdentifiers ?? [],
      )
      .filter(
        (widgetUniversalIdentifier) =>
          !alreadyValidatedWidgetUniversalIdentifiers.has(
            widgetUniversalIdentifier,
          ),
      )
      .map(
        (widgetUniversalIdentifier) =>
          flatPageLayoutWidgetMaps.byUniversalIdentifier[
            widgetUniversalIdentifier
          ],
      )
      .filter(isDefined);

    for (const widget of widgetsToRevalidate) {
      const failedValidation = getEmptyFlatEntityValidationError({
        flatEntityMinimalInformation: {
          universalIdentifier: widget.universalIdentifier,
        },
        metadataName: 'pageLayoutWidget',
        type: 'update',
      });

      failedValidation.errors.push(
        ...validatePageLayoutWidgetDashboardFilterBindings({
          widget,
          flatEntityMaps: optimisticUniversalFlatMaps,
        }),
      );

      if (isNonEmptyArray(failedValidation.errors)) {
        validationErrors.pageLayoutWidget.push(failedValidation);
      }
    }
  }

  return validationErrors;
};
