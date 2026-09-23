import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-09-22T00:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const findIndex = (
  indexName: keyof typeof STANDARD_OBJECTS.agentChatThreadTarget.indexes,
) =>
  allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier[
    STANDARD_OBJECTS.agentChatThreadTarget.indexes[indexName]
      .universalIdentifier
  ];

// Postgres only uses a composite btree for a predicate that matches its leading
// columns, so which columns an index carries and in what order is part of the
// contract the read and write paths depend on, not an implementation detail.
const getIndexedFieldUniversalIdentifiers = (
  indexName: keyof typeof STANDARD_OBJECTS.agentChatThreadTarget.indexes,
) =>
  findIndex(indexName)?.flatIndexFieldMetadatas.map(
    (indexField) =>
      allFlatEntityMaps.flatFieldMetadataMaps.universalIdentifierById[
        indexField.fieldMetadataId
      ],
  );

const fields = STANDARD_OBJECTS.agentChatThreadTarget.fields;

describe('agent chat thread target workspace metadata', () => {
  // Attach is ON CONFLICT DO NOTHING against this index, so losing its
  // uniqueness, its partial predicate or one of its columns would silently turn
  // a repeated attach into duplicate links rather than a no-op.
  it('keeps one live link per thread and record', () => {
    expect(findIndex('threadTargetUniqueIndex')).toMatchObject({
      isUnique: true,
      indexWhereClause: '"deletedAt" IS NULL',
    });
    expect(
      getIndexedFieldUniversalIdentifiers('threadTargetUniqueIndex'),
    ).toEqual([
      fields.thread.universalIdentifier,
      fields.objectMetadataId.universalIdentifier,
      fields.recordId.universalIdentifier,
    ]);
  });

  it('indexes the pair the record lookup filters on', () => {
    expect(findIndex('targetRecordIndex')).toMatchObject({ isUnique: false });
    expect(getIndexedFieldUniversalIdentifiers('targetRecordIndex')).toEqual([
      fields.objectMetadataId.universalIdentifier,
      fields.recordId.universalIdentifier,
    ]);
  });

  it('indexes the thread side the relation cascades from', () => {
    expect(getIndexedFieldUniversalIdentifiers('threadIdIndex')).toEqual([
      fields.thread.universalIdentifier,
    ]);
  });
});
