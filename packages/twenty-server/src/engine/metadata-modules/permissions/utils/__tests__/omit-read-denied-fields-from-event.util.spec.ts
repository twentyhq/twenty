import {
  type ObjectRecordCreateEvent,
  type ObjectRecordUpdateEvent,
} from 'twenty-shared/database-events';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { FieldMetadataType, type ObjectPermissions } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { omitReadDeniedFieldsFromEvent } from 'src/engine/metadata-modules/permissions/utils/omit-read-denied-fields-from-event.util';

const PERSON_OBJECT_ID = 'person-object-id';
const NOTE_OBJECT_ID = 'note-object-id';
const TIMELINE_ACTIVITY_OBJECT_ID = 'timeline-activity-object-id';
const PERSON_JOB_TITLE_FIELD_ID = 'person-job-title-field-id';
const NOTE_JOB_TITLE_FIELD_ID = 'note-job-title-field-id';

const flatFieldMetadataMaps = [
  getFlatFieldMetadataMock({
    id: PERSON_JOB_TITLE_FIELD_ID,
    universalIdentifier: PERSON_JOB_TITLE_FIELD_ID,
    objectMetadataId: PERSON_OBJECT_ID,
    type: FieldMetadataType.TEXT,
    name: 'jobTitle',
  }),
  getFlatFieldMetadataMock({
    id: NOTE_JOB_TITLE_FIELD_ID,
    universalIdentifier: NOTE_JOB_TITLE_FIELD_ID,
    objectMetadataId: NOTE_OBJECT_ID,
    type: FieldMetadataType.TEXT,
    name: 'jobTitle',
  }),
  getFlatFieldMetadataMock({
    id: 'properties-field-id',
    universalIdentifier:
      STANDARD_OBJECTS.timelineActivity.fields.properties.universalIdentifier,
    objectMetadataId: TIMELINE_ACTIVITY_OBJECT_ID,
    type: FieldMetadataType.RAW_JSON,
    name: 'properties',
  }),
  getFlatFieldMetadataMock({
    id: 'linked-object-metadata-id-field-id',
    universalIdentifier:
      STANDARD_OBJECTS.timelineActivity.fields.linkedObjectMetadataId
        .universalIdentifier,
    objectMetadataId: TIMELINE_ACTIVITY_OBJECT_ID,
    type: FieldMetadataType.UUID,
    name: 'linkedObjectMetadataId',
  }),
  getFlatFieldMetadataMock({
    id: 'target-person-field-id',
    universalIdentifier: 'target-person-field-id',
    objectMetadataId: TIMELINE_ACTIVITY_OBJECT_ID,
    type: FieldMetadataType.MORPH_RELATION,
    name: 'targetPerson',
    morphId: STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId,
    relationTargetObjectMetadataId: PERSON_OBJECT_ID,
  }),
].reduce(
  (maps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps: maps }),
  createEmptyFlatEntityMaps(),
);

const TIMELINE_ACTIVITY_OBJECT = {
  id: TIMELINE_ACTIVITY_OBJECT_ID,
  fieldIds: [
    'properties-field-id',
    'linked-object-metadata-id-field-id',
    'target-person-field-id',
  ],
};

const PERSON_OBJECT = {
  id: PERSON_OBJECT_ID,
  fieldIds: [PERSON_JOB_TITLE_FIELD_ID],
};

const buildObjectPermissions = (
  restrictedFields: ObjectPermissions['restrictedFields'],
): ObjectPermissions => ({
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
  restrictedFields,
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
});

const OBJECTS_PERMISSIONS_WITH_PERSON_JOB_TITLE_DENIED = {
  [PERSON_OBJECT_ID]: buildObjectPermissions({
    [PERSON_JOB_TITLE_FIELD_ID]: { canRead: false, canUpdate: false },
  }),
  [NOTE_OBJECT_ID]: buildObjectPermissions({}),
};

const JOB_TITLE_AND_CITY_DIFF = {
  diff: {
    jobTitle: { before: 'Engineer', after: 'Manager' },
    city: { before: 'Paris', after: 'Lyon' },
  },
};

const CITY_DIFF = { diff: { city: { before: 'Paris', after: 'Lyon' } } };

const PERSON_ACTIVITY = {
  targetPersonId: 'person-id',
  linkedObjectMetadataId: null,
  properties: JOB_TITLE_AND_CITY_DIFF,
};

const omitForTimelineActivity = <TEvent extends ObjectRecordCreateEvent>(
  event: TEvent,
) =>
  omitReadDeniedFieldsFromEvent({
    event,
    flatObjectMetadata: TIMELINE_ACTIVITY_OBJECT,
    objectsPermissions: OBJECTS_PERMISSIONS_WITH_PERSON_JOB_TITLE_DENIED,
    flatFieldMetadataMaps,
  }).properties;

describe('omitReadDeniedFieldsFromEvent', () => {
  it('should omit fields of the target object the role cannot read', () => {
    expect(
      omitForTimelineActivity({
        recordId: 'timeline-activity-id',
        properties: { after: PERSON_ACTIVITY },
      }),
    ).toEqual({ after: { ...PERSON_ACTIVITY, properties: CITY_DIFF } });
  });

  it('should keep a same-named field of a linked object the role can read', () => {
    const noteActivity = {
      ...PERSON_ACTIVITY,
      linkedObjectMetadataId: NOTE_OBJECT_ID,
    };

    expect(
      omitForTimelineActivity({
        recordId: 'timeline-activity-id',
        properties: { after: noteActivity },
      }),
    ).toEqual({ after: noteActivity });
  });

  it('should keep the diff when the activity object is unknown', () => {
    const orphanActivity = { ...PERSON_ACTIVITY, targetPersonId: null };

    expect(
      omitForTimelineActivity({
        recordId: 'timeline-activity-id',
        properties: { after: orphanActivity },
      }),
    ).toEqual({ after: orphanActivity });
  });

  it('should omit fields from the properties diff of an updated activity', () => {
    const updatedEvent: ObjectRecordUpdateEvent = {
      recordId: 'timeline-activity-id',
      properties: {
        updatedFields: ['properties'],
        before: PERSON_ACTIVITY,
        after: PERSON_ACTIVITY,
        diff: {
          properties: {
            before: JOB_TITLE_AND_CITY_DIFF,
            after: JOB_TITLE_AND_CITY_DIFF,
          },
        },
      },
    };

    expect(
      omitReadDeniedFieldsFromEvent({
        event: updatedEvent,
        flatObjectMetadata: TIMELINE_ACTIVITY_OBJECT,
        objectsPermissions: OBJECTS_PERMISSIONS_WITH_PERSON_JOB_TITLE_DENIED,
        flatFieldMetadataMaps,
      }).properties,
    ).toEqual({
      updatedFields: ['properties'],
      before: { ...PERSON_ACTIVITY, properties: CITY_DIFF },
      after: { ...PERSON_ACTIVITY, properties: CITY_DIFF },
      diff: { properties: { before: CITY_DIFF, after: CITY_DIFF } },
    });
  });

  it('should still omit the restricted fields of the event object', () => {
    expect(
      omitReadDeniedFieldsFromEvent({
        event: {
          recordId: 'person-id',
          properties: { after: { jobTitle: 'Manager', city: 'Lyon' } },
        },
        flatObjectMetadata: PERSON_OBJECT,
        objectsPermissions: OBJECTS_PERMISSIONS_WITH_PERSON_JOB_TITLE_DENIED,
        flatFieldMetadataMaps,
      }).properties,
    ).toEqual({ after: { city: 'Lyon' } });
  });
});
