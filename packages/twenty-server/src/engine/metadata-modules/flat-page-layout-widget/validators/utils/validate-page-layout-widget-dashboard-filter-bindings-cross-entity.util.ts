import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { validatePageLayoutWidgetDashboardFilterBindings } from 'src/engine/metadata-modules/flat-page-layout-widget/validators/utils/validate-page-layout-widget-dashboard-filter-bindings.util';
import { type OrchestratorFailureReport } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';
import { type UniversalFlatPageLayout } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout.type';

type MapsOf<TEntity> = {
  byUniversalIdentifier: Partial<Record<string, TEntity>>;
};

type UniversalIdentifierHolder = { universalIdentifier: string };

export const validatePageLayoutWidgetDashboardFilterBindingsCrossEntity = ({
  optimisticUniversalFlatMaps: {
    flatPageLayoutMaps,
    flatPageLayoutTabMaps,
    flatPageLayoutWidgetMaps,
    flatFieldMetadataMaps,
  },
  orchestratorActionsReport,
}: {
  optimisticUniversalFlatMaps: {
    flatPageLayoutMaps: MapsOf<
      Pick<
        UniversalFlatPageLayout,
        'type' | 'filters' | 'tabUniversalIdentifiers'
      >
    >;
    flatPageLayoutTabMaps: MapsOf<
      Pick<UniversalFlatPageLayoutTab, 'widgetUniversalIdentifiers'>
    >;
    flatPageLayoutWidgetMaps: MapsOf<
      Pick<
        UniversalFlatPageLayoutWidget,
        'universalIdentifier' | 'title' | 'objectMetadataUniversalIdentifier'
      > & { universalConfiguration: object }
    >;
    flatFieldMetadataMaps: MetadataUniversalFlatEntityMaps<'fieldMetadata'>;
  };
  orchestratorActionsReport: {
    pageLayout: { update: UniversalIdentifierHolder[] };
    pageLayoutWidget: {
      create: { flatEntity: UniversalIdentifierHolder }[];
      update: UniversalIdentifierHolder[];
    };
  };
}): Pick<OrchestratorFailureReport, 'pageLayoutWidget'> => {
  const validationErrors: Pick<OrchestratorFailureReport, 'pageLayoutWidget'> =
    {
      pageLayoutWidget: [],
    };

  const alreadyValidatedWidgetUniversalIdentifiers = new Set<string>([
    ...orchestratorActionsReport.pageLayoutWidget.create.map(
      (action) => action.flatEntity.universalIdentifier,
    ),
    ...orchestratorActionsReport.pageLayoutWidget.update.map(
      (action) => action.universalIdentifier,
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
      const errors = validatePageLayoutWidgetDashboardFilterBindings({
        widget,
        pageLayout,
        flatFieldMetadataMaps,
      });

      if (isNonEmptyArray(errors)) {
        validationErrors.pageLayoutWidget.push({
          type: 'update',
          metadataName: 'pageLayoutWidget',
          flatEntityMinimalInformation: {
            universalIdentifier: widget.universalIdentifier,
          },
          errors,
        });
      }
    }
  }

  return validationErrors;
};
