import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability, MetadataWritability } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const WORKSPACE_ID = '20202020-1111-4111-8111-111111111111';
const TWENTY_STANDARD_APPLICATION_ID = '20202020-2222-4222-8222-222222222222';
const NOW = '2024-01-01T00:00:00.000Z';

describe('RecordShare standard metadata build', () => {
  const { allFlatEntityMaps } =
    computeTwentyStandardApplicationAllFlatEntityMaps({
      now: NOW,
      workspaceId: WORKSPACE_ID,
      twentyStandardApplicationId: TWENTY_STANDARD_APPLICATION_ID,
    });

  const recordShare =
    allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.recordShare.universalIdentifier
    ];

  it('builds recordShare as a hidden system object with SYSTEM readability and writability', () => {
    expect(recordShare).toMatchObject({
      nameSingular: 'recordShare',
      isSystem: true,
      isSearchable: false,
      isAuditLogged: false,
      isUICreatable: false,
      isUIEditable: false,
      writability: MetadataWritability.SYSTEM,
      readability: MetadataReadability.SYSTEM,
    });
  });

  const getIndexedFieldUniversalIdentifiers = (
    indexName: keyof typeof STANDARD_OBJECTS.recordShare.indexes,
  ) =>
    allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.recordShare.indexes[indexName].universalIdentifier
    ]?.flatIndexFieldMetadatas
      .map((indexField) =>
        Object.values(
          allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
        )
          .filter(isDefined)
          .find(
            (flatFieldMetadata) =>
              flatFieldMetadata.id === indexField.fieldMetadataId,
          ),
      )
      .filter(isDefined)
      .map((flatFieldMetadata) => flatFieldMetadata.universalIdentifier);

  it('enforces one share row per object, record, principal, cause and source', () => {
    expect(
      allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier[
        STANDARD_OBJECTS.recordShare.indexes
          .recordPrincipalCauseSourceUniqueIndex.universalIdentifier
      ],
    ).toMatchObject({ isUnique: true, indexWhereClause: null });
    expect(
      getIndexedFieldUniversalIdentifiers(
        'recordPrincipalCauseSourceUniqueIndex',
      ),
    ).toEqual([
      STANDARD_OBJECTS.recordShare.fields.objectMetadataId.universalIdentifier,
      STANDARD_OBJECTS.recordShare.fields.recordId.universalIdentifier,
      STANDARD_OBJECTS.recordShare.fields.principalId.universalIdentifier,
      STANDARD_OBJECTS.recordShare.fields.rowCause.universalIdentifier,
      STANDARD_OBJECTS.recordShare.fields.sourceId.universalIdentifier,
    ]);
  });

  it('indexes the lookups the read gate and the writers need', () => {
    expect(getIndexedFieldUniversalIdentifiers('objectRecordIndex')).toEqual([
      STANDARD_OBJECTS.recordShare.fields.objectMetadataId.universalIdentifier,
      STANDARD_OBJECTS.recordShare.fields.recordId.universalIdentifier,
    ]);
    expect(getIndexedFieldUniversalIdentifiers('principalIdIndex')).toEqual([
      STANDARD_OBJECTS.recordShare.fields.principalId.universalIdentifier,
    ]);
    expect(getIndexedFieldUniversalIdentifiers('sourceIdIndex')).toEqual([
      STANDARD_OBJECTS.recordShare.fields.sourceId.universalIdentifier,
    ]);
  });

  it('declares no view for recordShare', () => {
    const recordShareViews = Object.values(
      allFlatEntityMaps.flatViewMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((view) => view.objectMetadataId === recordShare?.id);

    expect(Object.keys(STANDARD_OBJECTS.recordShare.views)).toHaveLength(0);
    expect(recordShareViews).toHaveLength(0);
  });
});
