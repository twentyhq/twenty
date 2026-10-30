/* @license Enterprise */

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

const computeStandardFlatRelatedRecordPathMaps = () =>
  computeTwentyStandardApplicationAllFlatEntityMaps({
    now: NOW,
    workspaceId: WORKSPACE_ID,
    twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
  }).allFlatEntityMaps.flatRelatedRecordPathMaps;

describe('Standard related record paths', () => {
  it('keeps the same universal identifiers across computations', () => {
    expect(
      Object.keys(
        computeStandardFlatRelatedRecordPathMaps().byUniversalIdentifier,
      ),
    ).toEqual(
      Object.keys(
        computeStandardFlatRelatedRecordPathMaps().byUniversalIdentifier,
      ),
    );
  });
});
