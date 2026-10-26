import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';
import {
  FieldMetadataType,
  type ObjectPermissions,
  type ObjectsPermissions,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { redactTimelineActivityEvent } from 'src/modules/timeline/utils/redact-timeline-activity-event.util';
import { redactTimelineActivityProperties } from 'src/modules/timeline/utils/redact-timeline-activity-properties.util';

const PERSON_OBJECT = getFlatObjectMetadataMock({
  id: 'person-object-id',
  universalIdentifier: 'person-object-id',
  nameSingular: 'person',
  fieldIds: ['person-job-title-field-id', 'person-city-field-id'],
});

const NOTE_OBJECT = getFlatObjectMetadataMock({
  id: 'note-object-id',
  universalIdentifier: 'note-object-id',
  nameSingular: 'note',
  fieldIds: ['note-title-field-id'],
});

const flatObjectMetadataMaps = [PERSON_OBJECT, NOTE_OBJECT].reduce(
  (maps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps: maps }),
  createEmptyFlatEntityMaps(),
);

const flatFieldMetadataMaps = [
  {
    id: 'person-job-title-field-id',
    objectMetadataId: PERSON_OBJECT.id,
    name: 'jobTitle',
  },
  {
    id: 'person-city-field-id',
    objectMetadataId: PERSON_OBJECT.id,
    name: 'city',
  },
  {
    id: 'note-title-field-id',
    objectMetadataId: NOTE_OBJECT.id,
    name: 'title',
  },
]
  .map(({ id, objectMetadataId, name }) =>
    getFlatFieldMetadataMock({
      id,
      universalIdentifier: id,
      objectMetadataId,
      type: FieldMetadataType.TEXT,
      name,
    }),
  )
  .reduce(
    (maps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity,
        flatEntityMaps: maps,
      }),
    createEmptyFlatEntityMaps(),
  );

const buildObjectPermissions = (
  overrides: Partial<ObjectPermissions>,
): ObjectPermissions => ({
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
  ...overrides,
});

const PERSON_JOB_TITLE_DENIED = {
  [PERSON_OBJECT.id]: buildObjectPermissions({
    restrictedFields: {
      'person-job-title-field-id': { canRead: false, canUpdate: false },
    },
  }),
  [NOTE_OBJECT.id]: buildObjectPermissions({}),
};

const DIFF = {
  diff: {
    jobTitle: { before: 'Engineer', after: 'Manager' },
    city: { before: 'Paris', after: 'Lyon' },
    title: { before: 'Old', after: 'New' },
  },
};

type TimelineActivityFixture = {
  linkedObjectMetadataId?: string | null;
  targetPersonId?: string | null;
  properties: unknown;
};

const keepReadableFields = ({
  timelineActivity,
  objectsPermissions = PERSON_JOB_TITLE_DENIED,
}: {
  timelineActivity: TimelineActivityFixture;
  objectsPermissions?: ObjectsPermissions;
}) =>
  redactTimelineActivityProperties({
    properties: timelineActivity.properties,
    timelineActivity,
    objectsPermissions,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

describe('redactTimelineActivityProperties', () => {
  it('should keep the readable fields of the target object', () => {
    expect(
      keepReadableFields({
        timelineActivity: {
          linkedObjectMetadataId: null,
          targetPersonId: 'person-id',
          properties: DIFF,
        },
      }),
    ).toEqual({ diff: { city: { before: 'Paris', after: 'Lyon' } } });
  });

  it('should keep the readable fields of the linked object', () => {
    expect(
      keepReadableFields({
        timelineActivity: {
          linkedObjectMetadataId: NOTE_OBJECT.id,
          targetPersonId: 'person-id',
          properties: DIFF,
        },
      }),
    ).toEqual({ diff: { title: { before: 'Old', after: 'New' } } });
  });

  it('should keep no field of a linked object the role cannot read', () => {
    expect(
      keepReadableFields({
        timelineActivity: {
          linkedObjectMetadataId: NOTE_OBJECT.id,
          targetPersonId: 'person-id',
          properties: DIFF,
        },
        objectsPermissions: {
          ...PERSON_JOB_TITLE_DENIED,
          [NOTE_OBJECT.id]: buildObjectPermissions({
            canReadObjectRecords: false,
          }),
        },
      }),
    ).toEqual({ diff: {} });
  });

  it('should keep no field when the activity object cannot be found', () => {
    expect(
      keepReadableFields({ timelineActivity: { properties: DIFF } }),
    ).toEqual({ diff: {} });
  });

  it('should keep no field when the linked object column was not selected', () => {
    expect(
      keepReadableFields({
        timelineActivity: { targetPersonId: 'person-id', properties: DIFF },
      }),
    ).toEqual({ diff: {} });
  });
});

describe('redactTimelineActivityEvent', () => {
  it('should redact properties in the records and in the diff', () => {
    const before = {
      id: 'activity-id',
      linkedObjectMetadataId: null,
      targetPersonId: 'person-id',
      properties: DIFF,
    };
    const after = { ...before, properties: { diff: {} } };
    const event = {
      recordId: 'activity-id',
      properties: {
        updatedFields: ['properties'],
        before,
        after,
        diff: { properties: { before: DIFF, after: { diff: {} } } },
      },
    } as unknown as ObjectRecordUpdateEvent;

    const redactedDiff = { diff: { city: { before: 'Paris', after: 'Lyon' } } };

    expect(
      redactTimelineActivityEvent({
        event,
        objectsPermissions: PERSON_JOB_TITLE_DENIED,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }).properties,
    ).toEqual({
      updatedFields: ['properties'],
      before: { ...before, properties: redactedDiff },
      after: { ...after, properties: { diff: {} } },
      diff: { properties: { before: redactedDiff, after: { diff: {} } } },
    });
  });
});
