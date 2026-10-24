import {
  FieldMetadataType,
  type ObjectPermissions,
  type ObjectsPermissions,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { keepReadableFieldsInTimelineActivities } from 'src/modules/timeline/utils/keep-readable-fields-in-timeline-activities.util';

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
}) => {
  keepReadableFieldsInTimelineActivities({
    timelineActivities: [timelineActivity],
    objectsPermissions,
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

  return timelineActivity.properties;
};

describe('keepReadableFieldsInTimelineActivities', () => {
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
});
