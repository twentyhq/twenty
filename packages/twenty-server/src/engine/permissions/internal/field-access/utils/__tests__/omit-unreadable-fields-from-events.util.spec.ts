import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';
import {
  FieldMetadataType,
  type ObjectRecordsPermissions,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { omitUnreadableFieldsFromEvents } from 'src/engine/permissions/internal/field-access/utils/omit-unreadable-fields-from-events.util';
import { type FieldsHiddenOnMatchingRecords } from 'src/engine/permissions/internal/field-access/types/fields-hidden-on-matching-records.type';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const OBJECT_METADATA_ID = 'invoice-object-id';

const invoice = getFlatObjectMetadataMock({
  id: OBJECT_METADATA_ID,
  universalIdentifier: OBJECT_METADATA_ID,
  fieldIds: ['name-field-id', 'secret-field-id'],
});

const flatObjectMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: invoice,
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const flatFieldMetadataMaps = [
  getFlatFieldMetadataMock({
    id: 'name-field-id',
    universalIdentifier: 'name-field-id',
    objectMetadataId: OBJECT_METADATA_ID,
    type: FieldMetadataType.TEXT,
    name: 'name',
  }),
  getFlatFieldMetadataMock({
    id: 'secret-field-id',
    universalIdentifier: 'secret-field-id',
    objectMetadataId: OBJECT_METADATA_ID,
    type: FieldMetadataType.TEXT,
    name: 'secret',
  }),
].reduce(
  (maps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps: maps }),
  createEmptyFlatEntityMaps(),
);

const READ_ACCESS: ObjectRecordsPermissions = {
  canCreateAllRecords: false,
  canReadAllRecords: true,
  canUpdateAllRecords: false,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: false,
  unreadableFields: [],
  uneditableFields: [],
};

const buildUpdateEvent = ({
  recordId,
  updatedFields,
}: {
  recordId: string;
  updatedFields: ('name' | 'secret')[];
}): ObjectRecordUpdateEvent => ({
  recordId,
  properties: {
    updatedFields,
    before: { id: recordId, name: 'Old', secret: 'old' },
    after: { id: recordId, name: 'New', secret: 'new' },
    diff: Object.fromEntries(
      updatedFields.map((fieldName) => [
        fieldName,
        { before: 'old', after: 'new' },
      ]),
    ),
  },
});

const filter = ({
  events,
  recordsPermissions,
  fieldsHiddenOnMatchingRecords = [],
}: {
  events: ObjectRecordUpdateEvent[];
  recordsPermissions: Pick<RoleRecordsPermissions, 'objects'>;
  fieldsHiddenOnMatchingRecords?: FieldsHiddenOnMatchingRecords[];
}) =>
  omitUnreadableFieldsFromEvents<ObjectRecordUpdateEvent>({
    events,
    objectMetadata: invoice,
    recordsPermissions,
    fieldsHiddenOnMatchingRecords,
    metadataMaps: {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      featureFlagsMap: {},
      rolesPermissions: {},
    },
  });

const SECRET_HIDDEN: Pick<RoleRecordsPermissions, 'objects'> = {
  objects: {
    [OBJECT_METADATA_ID]: {
      ...READ_ACCESS,
      unreadableFields: ['secret-field-id'],
      uneditableFields: ['secret-field-id'],
    },
  },
};

describe('omitUnreadableFieldsFromEvents', () => {
  it('should omit a field the principal cannot read', () => {
    const [event] = filter({
      events: [
        buildUpdateEvent({
          recordId: 'record-1',
          updatedFields: ['name', 'secret'],
        }),
      ],
      recordsPermissions: SECRET_HIDDEN,
    });

    expect(event.properties.after).toEqual({ id: 'record-1', name: 'New' });
    expect(event.properties.updatedFields).toEqual(['name']);
  });

  it('should drop an update that only changed hidden fields', () => {
    expect(
      filter({
        events: [
          buildUpdateEvent({ recordId: 'record-2', updatedFields: ['secret'] }),
        ],
        recordsPermissions: SECRET_HIDDEN,
      }),
    ).toEqual([]);
  });

  it('should omit a field unreadable on an RLS rule the record matches', () => {
    const [event] = filter({
      events: [
        buildUpdateEvent({
          recordId: 'record-1',
          updatedFields: ['name', 'secret'],
        }),
      ],
      recordsPermissions: { objects: { [OBJECT_METADATA_ID]: READ_ACCESS } },
      fieldsHiddenOnMatchingRecords: [
        {
          fieldMetadataIds: ['secret-field-id'],
          recordFilter: { name: { eq: 'New' } },
        },
      ],
    });

    expect(event.properties.after).toEqual({ id: 'record-1', name: 'New' });
    expect(event.properties.updatedFields).toEqual(['name']);
  });

  it('should add up object level and RLS rule unreadable fields', () => {
    const [event] = filter({
      events: [
        buildUpdateEvent({
          recordId: 'record-1',
          updatedFields: ['name', 'secret'],
        }),
      ],
      recordsPermissions: {
        objects: {
          [OBJECT_METADATA_ID]: {
            ...READ_ACCESS,
            unreadableFields: ['name-field-id'],
            uneditableFields: ['name-field-id'],
          },
        },
      },
      fieldsHiddenOnMatchingRecords: [
        {
          fieldMetadataIds: ['secret-field-id'],
          recordFilter: { name: { eq: 'New' } },
        },
      ],
    });

    expect(event).toBeUndefined();
  });

  it('should keep a field unreadable on an RLS rule the record does not match', () => {
    const [event] = filter({
      events: [
        buildUpdateEvent({
          recordId: 'record-1',
          updatedFields: ['name', 'secret'],
        }),
      ],
      recordsPermissions: { objects: { [OBJECT_METADATA_ID]: READ_ACCESS } },
      fieldsHiddenOnMatchingRecords: [
        {
          fieldMetadataIds: ['secret-field-id'],
          recordFilter: { name: { eq: 'Another' } },
        },
      ],
    });

    expect(event.properties.updatedFields).toEqual(['name', 'secret']);
  });
});
