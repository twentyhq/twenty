import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';
import {
  FieldMetadataType,
  type ObjectRecordsPermissions,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { buildRecordReadRestrictions } from 'src/engine/permissions/internal/role/utils/build-record-read-restrictions.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';
import { omitRestrictedFieldsFromTimelineActivityEvent } from 'src/modules/timeline/utils/omit-restricted-fields-from-timeline-activity-event.util';
import { omitRestrictedFieldsFromTimelineActivity } from 'src/modules/timeline/utils/omit-restricted-fields-from-timeline-activity.util';

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

const buildObjectRecordsPermissions = (
  overrides: Partial<ObjectRecordsPermissions>,
): ObjectRecordsPermissions => ({
  canCreateAllRecords: true,
  canReadAllRecords: true,
  canUpdateAllRecords: true,
  canSoftDeleteAllRecords: true,
  canDestroyAllRecords: true,
  unreadableFields: [],
  uneditableFields: [],
  ...overrides,
});

const PERSON_JOB_TITLE_DENIED: Pick<RoleRecordsPermissions, 'objects'> = {
  objects: {
    [PERSON_OBJECT.id]: buildObjectRecordsPermissions({
      unreadableFields: ['person-job-title-field-id'],
      uneditableFields: ['person-job-title-field-id'],
    }),
    [NOTE_OBJECT.id]: buildObjectRecordsPermissions({}),
  },
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
  properties: Record<string, unknown>;
};

const omitRestrictedFields = ({
  timelineActivity,
  recordsPermissions = PERSON_JOB_TITLE_DENIED,
}: {
  timelineActivity: TimelineActivityFixture;
  recordsPermissions?: Pick<RoleRecordsPermissions, 'objects'>;
}) =>
  omitRestrictedFieldsFromTimelineActivity({
    properties: timelineActivity.properties,
    timelineActivity,
    recordReadRestrictions: buildRecordReadRestrictions({ recordsPermissions }),
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
  });

describe('omitRestrictedFieldsFromTimelineActivity', () => {
  it('should keep the readable fields of the target object', () => {
    expect(
      omitRestrictedFields({
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
      omitRestrictedFields({
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
      omitRestrictedFields({
        timelineActivity: {
          linkedObjectMetadataId: NOTE_OBJECT.id,
          targetPersonId: 'person-id',
          properties: DIFF,
        },
        recordsPermissions: {
          objects: {
            ...PERSON_JOB_TITLE_DENIED.objects,
            [NOTE_OBJECT.id]: buildObjectRecordsPermissions({
              canReadAllRecords: false,
            }),
          },
        },
      }),
    ).toEqual({ diff: {} });
  });

  it('should keep no field when the activity object cannot be found', () => {
    expect(
      omitRestrictedFields({ timelineActivity: { properties: DIFF } }),
    ).toEqual({ diff: {} });
  });

  it('should keep no field when the linked object column was not selected', () => {
    expect(
      omitRestrictedFields({
        timelineActivity: { targetPersonId: 'person-id', properties: DIFF },
      }),
    ).toEqual({ diff: {} });
  });
});

type TimelineActivityRecord = {
  id: string;
  linkedObjectMetadataId: string | null;
  targetPersonId: string;
  properties: Record<string, unknown>;
};

describe('omitRestrictedFieldsFromTimelineActivityEvent', () => {
  it('should omit restricted fields from properties in the records and in the diff', () => {
    const before: TimelineActivityRecord = {
      id: 'activity-id',
      linkedObjectMetadataId: null,
      targetPersonId: 'person-id',
      properties: DIFF,
    };
    const after: TimelineActivityRecord = {
      ...before,
      properties: { diff: {} },
    };
    const event: ObjectRecordUpdateEvent<TimelineActivityRecord> = {
      recordId: 'activity-id',
      properties: {
        updatedFields: ['properties'],
        before,
        after,
        diff: { properties: { before: DIFF, after: { diff: {} } } },
      },
    };

    const readableDiff = { diff: { city: { before: 'Paris', after: 'Lyon' } } };

    expect(
      omitRestrictedFieldsFromTimelineActivityEvent({
        event,
        recordReadRestrictions: buildRecordReadRestrictions({
          recordsPermissions: PERSON_JOB_TITLE_DENIED,
        }),
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }).properties,
    ).toEqual({
      updatedFields: ['properties'],
      before: { ...before, properties: readableDiff },
      after: { ...after, properties: { diff: {} } },
      diff: { properties: { before: readableDiff, after: { diff: {} } } },
    });
  });
});
