import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';
import {
  FieldMetadataType,
  type ObjectRecordsPermissions,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { filterReadableEvents } from 'src/engine/permissions/internal/combine/utils/filter-readable-events.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

const OBJECT_METADATA_ID = 'invoice-object-id';

const invoice = getFlatObjectMetadataMock({
  id: OBJECT_METADATA_ID,
  universalIdentifier: OBJECT_METADATA_ID,
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
  restrictedFields: {},
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
}: {
  events: ObjectRecordUpdateEvent[];
  recordsPermissions: Pick<RoleRecordsPermissions, 'objects'>;
}) =>
  filterReadableEvents({
    events,
    readableRecordIds: new Set(['record-1', 'record-2']),
    objectMetadata: invoice,
    recordsPermissions,
    metadataMaps: { flatObjectMetadataMaps, flatFieldMetadataMaps },
  });

const SECRET_HIDDEN: Pick<RoleRecordsPermissions, 'objects'> = {
  objects: {
    [OBJECT_METADATA_ID]: {
      ...READ_ACCESS,
      restrictedFields: {
        'secret-field-id': { canRead: false, canUpdate: false },
      },
    },
  },
};

describe('filterReadableEvents', () => {
  it('should drop events on records that are not readable', () => {
    const events = filter({
      events: [
        buildUpdateEvent({ recordId: 'record-1', updatedFields: ['name'] }),
        buildUpdateEvent({ recordId: 'record-3', updatedFields: ['name'] }),
      ],
      recordsPermissions: { objects: { [OBJECT_METADATA_ID]: READ_ACCESS } },
    });

    expect(events.map((event) => event.recordId)).toEqual(['record-1']);
  });

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
});
