import { isDefined } from 'twenty-shared/utils';

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

describe('createStandardPageLayoutWidgetFlatMetadata', () => {
  it('should store a tree for every built-in widget that declares a text rule', () => {
    const {
      allFlatEntityMaps: { flatPageLayoutWidgetMaps },
    } = computeTwentyStandardApplicationAllFlatEntityMaps({
      now: '2026-11-23T10:00:00.000Z',
      workspaceId: '20202020-1c25-4d02-bf25-6aeccf7ea419',
      twentyStandardApplicationId: '20202020-64aa-4b6f-b003-9c74b97cee20',
    });

    const pageLayoutWidgetsWithTextRule = Object.values(
      flatPageLayoutWidgetMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((flatPageLayoutWidget) =>
        isDefined(flatPageLayoutWidget.conditionalAvailabilityExpression),
      );

    expect(pageLayoutWidgetsWithTextRule.length).toBeGreaterThan(0);

    const pageLayoutWidgetsMissingTree = pageLayoutWidgetsWithTextRule
      .filter(
        (flatPageLayoutWidget) =>
          !isDefined(flatPageLayoutWidget.conditionalAvailability),
      )
      .map((flatPageLayoutWidget) => ({
        title: flatPageLayoutWidget.title,
        conditionalAvailabilityExpression:
          flatPageLayoutWidget.conditionalAvailabilityExpression,
      }));

    expect(pageLayoutWidgetsMissingTree).toEqual([]);
  });
});
