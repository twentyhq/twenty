import {
  getSystemViewUniversalIdentifier,
  getViewFieldUniversalIdentifier,
  TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} from 'twenty-shared/application';
import { ViewKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

// Guards that the twenty-standard INDEX view + view-field universal identifier
// literals pinned in standard-object.constant.ts stay equal to the deterministic
// derivation (getSystemViewUniversalIdentifier / getViewFieldUniversalIdentifier),
// so the standard application sync and the custom-object side-effect engine
// converge on the same scheme. If an object or field universal identifier
// changes, regenerate the pinned literals so this test passes.
describe('twenty-standard INDEX view derived identifiers', () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: new Date().toISOString(),
      workspaceId: v4(),
      twentyStandardApplicationId: v4(),
    });

  const { flatViewMaps, flatViewFieldMaps } = allFlatEntityMaps;

  const indexFlatViews = Object.values(flatViewMaps.byUniversalIdentifier)
    .filter(isDefined)
    .filter((flatView) => flatView.key === ViewKey.INDEX);

  it('should provision at least one INDEX view for the standard application', () => {
    expect(indexFlatViews.length).toBeGreaterThan(0);
  });

  it('should derive every INDEX view universal identifier and mark it as a system side effect', () => {
    for (const flatView of indexFlatViews) {
      const derivedUniversalIdentifier = getSystemViewUniversalIdentifier({
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        objectUniversalIdentifier: flatView.objectMetadataUniversalIdentifier,
        viewKey: ViewKey.INDEX,
      });

      expect(flatView.universalIdentifier).toBe(derivedUniversalIdentifier);
      expect(flatView.isSystemSideEffect).toBe(true);
    }
  });

  it('should derive every INDEX view-field universal identifier and mark it as a system side effect', () => {
    const indexViewUniversalIdentifiers = new Set(
      indexFlatViews.map((flatView) => flatView.universalIdentifier),
    );

    const indexFlatViewFields = Object.values(
      flatViewFieldMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((flatViewField) =>
        indexViewUniversalIdentifiers.has(
          flatViewField.viewUniversalIdentifier,
        ),
      );

    expect(indexFlatViewFields.length).toBeGreaterThan(0);

    for (const flatViewField of indexFlatViewFields) {
      const derivedUniversalIdentifier = getViewFieldUniversalIdentifier({
        applicationUniversalIdentifier:
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        viewUniversalIdentifier: flatViewField.viewUniversalIdentifier,
        fieldMetadataUniversalIdentifier:
          flatViewField.fieldMetadataUniversalIdentifier,
      });

      expect(flatViewField.universalIdentifier).toBe(
        derivedUniversalIdentifier,
      );
      expect(flatViewField.isSystemSideEffect).toBe(true);
    }
  });
});
