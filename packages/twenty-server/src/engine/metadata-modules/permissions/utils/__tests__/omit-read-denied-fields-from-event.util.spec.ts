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
const TIMELINE_ACTIVITY_OBJECT_ID = 'timeline-activity-object-id';
const JOB_TITLE_FIELD_ID = 'job-title-field-id';
const PROPERTIES_FIELD_ID = 'properties-field-id';

const flatFieldMetadataMaps = [
  getFlatFieldMetadataMock({
    id: JOB_TITLE_FIELD_ID,
    universalIdentifier: JOB_TITLE_FIELD_ID,
    objectMetadataId: PERSON_OBJECT_ID,
    type: FieldMetadataType.TEXT,
    name: 'jobTitle',
  }),
  getFlatFieldMetadataMock({
    id: PROPERTIES_FIELD_ID,
    universalIdentifier:
      STANDARD_OBJECTS.timelineActivity.fields.properties.universalIdentifier,
    objectMetadataId: TIMELINE_ACTIVITY_OBJECT_ID,
    type: FieldMetadataType.RAW_JSON,
    name: 'properties',
  }),
].reduce(
  (maps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps: maps }),
  createEmptyFlatEntityMaps(),
);

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

const OBJECTS_PERMISSIONS_WITH_JOB_TITLE_DENIED = {
  [PERSON_OBJECT_ID]: buildObjectPermissions({
    [JOB_TITLE_FIELD_ID]: { canRead: false, canUpdate: false },
  }),
  [TIMELINE_ACTIVITY_OBJECT_ID]: buildObjectPermissions({}),
};

const JOB_TITLE_AND_CITY_DIFF = {
  diff: {
    jobTitle: { before: 'Engineer', after: 'Manager' },
    city: { before: 'Paris', after: 'Lyon' },
  },
};

const CITY_DIFF = { diff: { city: { before: 'Paris', after: 'Lyon' } } };

describe('omitReadDeniedFieldsFromEvent', () => {
  it('should omit read-denied fields from a created timeline activity', () => {
    const createdEvent: ObjectRecordCreateEvent = {
      recordId: 'timeline-activity-id',
      properties: { after: { properties: JOB_TITLE_AND_CITY_DIFF } },
    };

    expect(
      omitReadDeniedFieldsFromEvent({
        event: createdEvent,
        objectMetadataId: TIMELINE_ACTIVITY_OBJECT_ID,
        objectsPermissions: OBJECTS_PERMISSIONS_WITH_JOB_TITLE_DENIED,
        flatFieldMetadataMaps,
      }).properties,
    ).toEqual({ after: { properties: CITY_DIFF } });
  });

  it('should omit read-denied fields from an updated timeline activity', () => {
    const updatedEvent: ObjectRecordUpdateEvent = {
      recordId: 'timeline-activity-id',
      properties: {
        updatedFields: ['properties'],
        before: { properties: JOB_TITLE_AND_CITY_DIFF },
        after: { properties: JOB_TITLE_AND_CITY_DIFF },
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
        objectMetadataId: TIMELINE_ACTIVITY_OBJECT_ID,
        objectsPermissions: OBJECTS_PERMISSIONS_WITH_JOB_TITLE_DENIED,
        flatFieldMetadataMaps,
      }).properties,
    ).toEqual({
      updatedFields: ['properties'],
      before: { properties: CITY_DIFF },
      after: { properties: CITY_DIFF },
      diff: { properties: { before: CITY_DIFF, after: CITY_DIFF } },
    });
  });

  it('should still omit the restricted fields of the event object', () => {
    const createdEvent: ObjectRecordCreateEvent = {
      recordId: 'person-id',
      properties: { after: { jobTitle: 'Manager', city: 'Lyon' } },
    };

    expect(
      omitReadDeniedFieldsFromEvent({
        event: createdEvent,
        objectMetadataId: PERSON_OBJECT_ID,
        objectsPermissions: OBJECTS_PERMISSIONS_WITH_JOB_TITLE_DENIED,
        flatFieldMetadataMaps,
      }).properties,
    ).toEqual({ after: { city: 'Lyon' } });
  });

  it('should keep a timeline activity unchanged without read-denied fields', () => {
    const createdEvent: ObjectRecordCreateEvent = {
      recordId: 'timeline-activity-id',
      properties: { after: { properties: JOB_TITLE_AND_CITY_DIFF } },
    };

    expect(
      omitReadDeniedFieldsFromEvent({
        event: createdEvent,
        objectMetadataId: TIMELINE_ACTIVITY_OBJECT_ID,
        objectsPermissions: {
          [PERSON_OBJECT_ID]: buildObjectPermissions({}),
        },
        flatFieldMetadataMaps,
      }),
    ).toBe(createdEvent);
  });
});
