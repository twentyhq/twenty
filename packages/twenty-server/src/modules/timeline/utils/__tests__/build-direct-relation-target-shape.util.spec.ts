import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';

import { addAllFlatEntitiesToFlatEntityMaps } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/add-all-flat-entities-to-flat-entity-maps.test-util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { buildDirectRelationTargetShape } from 'src/modules/timeline/utils/build-direct-relation-target-shape.util';

const buildFlatEntityMaps = <TFlatEntity extends SyncableFlatEntity>(
  flatEntities: TFlatEntity[],
) =>
  addAllFlatEntitiesToFlatEntityMaps({
    flatEntities,
    flatEntityMaps: createEmptyFlatEntityMaps(),
  });

const ATTACHMENT_OBJECT = getFlatObjectMetadataMock({
  id: 'attachment-object',
  universalIdentifier: 'attachment-object-uid',
  nameSingular: 'attachment',
  fieldIds: [
    'target-person-field',
    'target-company-field',
    'target-message-field',
  ],
});

const PERSON_OBJECT = getFlatObjectMetadataMock({
  id: 'person-object',
  universalIdentifier: 'person-object-uid',
  nameSingular: 'person',
  fieldIds: [],
});

const COMPANY_OBJECT = getFlatObjectMetadataMock({
  id: 'company-object',
  universalIdentifier: 'company-object-uid',
  nameSingular: 'company',
  fieldIds: [],
});

const MESSAGE_OBJECT = getFlatObjectMetadataMock({
  id: 'message-object',
  universalIdentifier: 'message-object-uid',
  nameSingular: 'message',
  fieldIds: [],
});

const TIMELINE_ACTIVITY_OBJECT = getFlatObjectMetadataMock({
  id: 'timeline-activity-object',
  universalIdentifier: STANDARD_OBJECTS.timelineActivity.universalIdentifier,
  nameSingular: 'timelineActivity',
  fieldIds: ['timeline-target-person-field', 'timeline-target-company-field'],
});

const buildTimelineActivityTargetField = ({
  id,
  relationTargetObjectMetadataId,
}: {
  id: string;
  relationTargetObjectMetadataId: string;
}) =>
  getFlatFieldMetadataMock({
    id,
    universalIdentifier: `${id}-uid`,
    type: FieldMetadataType.MORPH_RELATION,
    objectMetadataId: TIMELINE_ACTIVITY_OBJECT.id,
    morphId: STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId,
    relationTargetObjectMetadataId,
    settings: { relationType: RelationType.MANY_TO_ONE },
  });

const TARGET_PERSON_FIELD = getFlatFieldMetadataMock({
  id: 'target-person-field',
  universalIdentifier: 'target-person-field-uid',
  name: 'targetPerson',
  type: FieldMetadataType.MORPH_RELATION,
  objectMetadataId: ATTACHMENT_OBJECT.id,
  morphId: 'target-morph-id',
  relationTargetObjectMetadataId: PERSON_OBJECT.id,
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'targetPersonId',
  },
});

const TARGET_COMPANY_FIELD = getFlatFieldMetadataMock({
  id: 'target-company-field',
  universalIdentifier: 'target-company-field-uid',
  name: 'targetCompany',
  type: FieldMetadataType.MORPH_RELATION,
  objectMetadataId: ATTACHMENT_OBJECT.id,
  morphId: 'target-morph-id',
  relationTargetObjectMetadataId: COMPANY_OBJECT.id,
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'targetCompanyId',
  },
});

const TARGET_MESSAGE_FIELD = getFlatFieldMetadataMock({
  id: 'target-message-field',
  universalIdentifier: 'target-message-field-uid',
  name: 'targetMessage',
  type: FieldMetadataType.MORPH_RELATION,
  objectMetadataId: ATTACHMENT_OBJECT.id,
  morphId: 'target-morph-id',
  relationTargetObjectMetadataId: MESSAGE_OBJECT.id,
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'targetMessageId',
  },
});

const flatObjectMetadataMaps = buildFlatEntityMaps([
  ATTACHMENT_OBJECT,
  PERSON_OBJECT,
  COMPANY_OBJECT,
  MESSAGE_OBJECT,
  TIMELINE_ACTIVITY_OBJECT,
]);

const flatFieldMetadataMaps = buildFlatEntityMaps([
  TARGET_PERSON_FIELD,
  TARGET_COMPANY_FIELD,
  TARGET_MESSAGE_FIELD,
  buildTimelineActivityTargetField({
    id: 'timeline-target-person-field',
    relationTargetObjectMetadataId: PERSON_OBJECT.id,
  }),
  buildTimelineActivityTargetField({
    id: 'timeline-target-company-field',
    relationTargetObjectMetadataId: COMPANY_OBJECT.id,
  }),
]);

describe('buildDirectRelationTargetShape', () => {
  it('expands every target in a direct morph relation', () => {
    expect(
      buildDirectRelationTargetShape({
        relationFlatFieldMetadata: TARGET_PERSON_FIELD,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).toEqual({
      kind: 'DIRECT_RELATION',
      targetJoinColumns: [
        {
          joinColumnName: 'targetPersonId',
          targetObjectNameSingular: 'person',
        },
        {
          joinColumnName: 'targetCompanyId',
          targetObjectNameSingular: 'company',
        },
      ],
    });
  });

  it('skips a morph target the timeline has no target field for', () => {
    expect(
      buildDirectRelationTargetShape({
        relationFlatFieldMetadata: TARGET_MESSAGE_FIELD,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).toEqual({
      kind: 'DIRECT_RELATION',
      targetJoinColumns: [
        {
          joinColumnName: 'targetPersonId',
          targetObjectNameSingular: 'person',
        },
        {
          joinColumnName: 'targetCompanyId',
          targetObjectNameSingular: 'company',
        },
      ],
    });
  });

  it('does not treat a one-to-many field as a direct relation', () => {
    expect(
      buildDirectRelationTargetShape({
        relationFlatFieldMetadata: {
          ...TARGET_PERSON_FIELD,
          settings: { relationType: RelationType.ONE_TO_MANY },
        },
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
    ).toBeUndefined();
  });

  it('isolates incomplete morph metadata as an invalid target shape', () => {
    const objectMapsWithMissingMorphField = buildFlatEntityMaps([
      {
        ...ATTACHMENT_OBJECT,
        fieldIds: [...ATTACHMENT_OBJECT.fieldIds, 'missing-morph-field'],
      },
      PERSON_OBJECT,
      COMPANY_OBJECT,
      MESSAGE_OBJECT,
      TIMELINE_ACTIVITY_OBJECT,
    ]);

    expect(
      buildDirectRelationTargetShape({
        relationFlatFieldMetadata: TARGET_PERSON_FIELD,
        flatObjectMetadataMaps: objectMapsWithMissingMorphField,
        flatFieldMetadataMaps,
      }),
    ).toBeUndefined();
  });
});
