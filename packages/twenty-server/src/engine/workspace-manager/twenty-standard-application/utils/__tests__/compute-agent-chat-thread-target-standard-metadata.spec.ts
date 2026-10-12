import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';

import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const { allFlatEntityMaps } = computeTwentyStandardApplicationAllFlatEntityMaps(
  {
    now: '2026-09-22T00:00:00.000Z',
    workspaceId: '20202020-1111-4111-8111-111111111111',
    twentyStandardApplicationId: '20202020-2222-4222-8222-222222222222',
  },
);

const findField = (universalIdentifier: string) =>
  allFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier[
    universalIdentifier
  ];

const findIndex = (
  indexName: keyof typeof STANDARD_OBJECTS.agentChatThreadTarget.indexes,
) =>
  allFlatEntityMaps.flatIndexMaps.byUniversalIdentifier[
    STANDARD_OBJECTS.agentChatThreadTarget.indexes[indexName]
      .universalIdentifier
  ];

// Postgres uses a composite btree only for predicates matching its leading columns, so column order is contract
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

const LEGS = [
  {
    objectName: 'person',
    leg: fields.targetPerson,
    joinColumnName: 'targetPersonId',
    idIndexName: 'personIdIndex',
    uniqueIndexName: 'threadPersonUniqueIndex',
  },
  {
    objectName: 'company',
    leg: fields.targetCompany,
    joinColumnName: 'targetCompanyId',
    idIndexName: 'companyIdIndex',
    uniqueIndexName: 'threadCompanyUniqueIndex',
  },
  {
    objectName: 'opportunity',
    leg: fields.targetOpportunity,
    joinColumnName: 'targetOpportunityId',
    idIndexName: 'opportunityIdIndex',
    uniqueIndexName: 'threadOpportunityUniqueIndex',
  },
] as const;

describe('agent chat thread target workspace metadata', () => {
  // One shared morphId is what default-relation tooling extends to custom objects;
  // CASCADE is the only thing that removes a destroyed record's links
  it.each(LEGS)(
    'attaches to a $objectName through its own leg of the target morph',
    ({ objectName, leg, joinColumnName }) => {
      expect(findField(leg.universalIdentifier)).toMatchObject({
        type: FieldMetadataType.MORPH_RELATION,
        morphId:
          STANDARD_OBJECTS.agentChatThreadTarget.morphIds.targetMorphId.morphId,
        isUIEditable: false,
        relationTargetObjectMetadataUniversalIdentifier:
          STANDARD_OBJECTS[objectName].universalIdentifier,
        relationTargetFieldMetadataUniversalIdentifier:
          STANDARD_OBJECTS[objectName].fields.agentChatThreadTargets
            .universalIdentifier,
        universalSettings: {
          relationType: RelationType.MANY_TO_ONE,
          onDelete: RelationOnDeleteAction.CASCADE,
          joinColumnName,
        },
      });
    },
  );

  it.each(LEGS)(
    'gives the $objectName the reverse side of its leg',
    ({ objectName, leg }) => {
      expect(
        findField(
          STANDARD_OBJECTS[objectName].fields.agentChatThreadTargets
            .universalIdentifier,
        ),
      ).toMatchObject({
        type: FieldMetadataType.RELATION,
        relationTargetObjectMetadataUniversalIdentifier:
          STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier,
        relationTargetFieldMetadataUniversalIdentifier: leg.universalIdentifier,
        universalSettings: { relationType: RelationType.ONE_TO_MANY },
      });
    },
  );

  it.each(LEGS)(
    'keeps one live link per thread and $objectName',
    ({ leg, uniqueIndexName }) => {
      expect(findIndex(uniqueIndexName)).toMatchObject({
        isUnique: true,
        indexWhereClause: '"deletedAt" IS NULL',
      });
      expect(getIndexedFieldUniversalIdentifiers(uniqueIndexName)).toEqual([
        fields.thread.universalIdentifier,
        leg.universalIdentifier,
      ]);
    },
  );

  it.each(LEGS)(
    'indexes the $objectName join column the record lookup filters on',
    ({ leg, idIndexName }) => {
      expect(findIndex(idIndexName)).toMatchObject({ isUnique: false });
      expect(getIndexedFieldUniversalIdentifiers(idIndexName)).toEqual([
        leg.universalIdentifier,
      ]);
    },
  );

  it('indexes the thread side the relation cascades from', () => {
    expect(getIndexedFieldUniversalIdentifiers('threadIdIndex')).toEqual([
      fields.thread.universalIdentifier,
    ]);
  });
});
