/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { getRelatedRecordPathFieldMetadataUniversalIdentifiers } from 'src/engine/metadata-modules/related-record-path/utils/get-related-record-path-field-metadata-universal-identifiers.util';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

const computeStandardFlatEntityMaps = () =>
  computeTwentyStandardApplicationAllFlatEntityMaps({
    now: NOW,
    workspaceId: WORKSPACE_ID,
    twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
  }).allFlatEntityMaps;

describe('Standard related record paths', () => {
  const {
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    flatRelatedRecordPathMaps,
  } = computeStandardFlatEntityMaps();

  it('declares the standard paths and their inherent flag', () => {
    const describedPaths = Object.values(
      flatRelatedRecordPathMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .map((flatRelatedRecordPath) => {
        const objectName =
          flatObjectMetadataMaps.byUniversalIdentifier[
            flatRelatedRecordPath.objectMetadataUniversalIdentifier
          ]?.nameSingular;
        const fieldNames =
          getRelatedRecordPathFieldMetadataUniversalIdentifiers(
            flatRelatedRecordPath,
          ).map(
            (universalIdentifier) =>
              flatFieldMetadataMaps.byUniversalIdentifier[universalIdentifier]
                ?.name,
          );

        return `${[objectName, ...fieldNames].join('.')} ${flatRelatedRecordPath.isInherent ? 'inherent' : 'regular'}`;
      })
      .sort();

    expect(describedPaths).toMatchSnapshot();
  });

  it('keeps the same universal identifiers across computations', () => {
    expect(
      Object.keys(
        computeStandardFlatEntityMaps().flatRelatedRecordPathMaps
          .byUniversalIdentifier,
      ),
    ).toEqual(Object.keys(flatRelatedRecordPathMaps.byUniversalIdentifier));
  });
});
