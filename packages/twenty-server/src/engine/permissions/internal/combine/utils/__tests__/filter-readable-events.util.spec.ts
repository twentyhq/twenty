import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';
import {
  FieldMetadataType,
  type ObjectRecordsPermissions,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';
import { filterReadableEvents } from 'src/engine/permissions/internal/combine/utils/filter-readable-events.util';
import { resolveRlsRuleRecordFilter } from 'src/engine/permissions/internal/rls/utils/resolve-rls-rule-record-filter.util';
import { type RoleRecordsPermissions } from 'src/engine/permissions/types/role-records-permissions.type';

jest.mock(
  'src/engine/permissions/internal/rls/utils/resolve-rls-rule-record-filter.util',
);

const OBJECT_METADATA_ID = 'invoice-object-id';
const ROLE_ID = 'role-id';

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
  rlsRuleUnreadableFields,
}: {
  events: ObjectRecordUpdateEvent[];
  recordsPermissions: Pick<RoleRecordsPermissions, 'objects'>;
  rlsRuleUnreadableFields?: string[];
}) =>
  filterReadableEvents({
    events,
    readableRecordIds: new Set(['record-1', 'record-2']),
    principals: {
      workspaceId: 'workspace-id',
      mainPrincipal: {
        type: 'workspaceMember',
        roleId: ROLE_ID,
        workspaceMemberId: 'member-id',
      },
      applicationPrincipal: { type: 'customApplication' },
    },
    objectMetadata: invoice,
    recordsPermissions,
    rlsRuleFilterByRoleId: new Map(),
    metadataMaps: {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatRowLevelPermissionPredicateMaps: createEmptyFlatEntityMaps(),
      flatRowLevelPermissionPredicateGroupMaps: createEmptyFlatEntityMaps(),
      flatApplicationMaps: { byId: {} },
      featureFlagsMap: {},
      rolesPermissions: {
        [ROLE_ID]: {
          ...NO_ROLE_RECORDS_PERMISSIONS,
          objects: {
            [OBJECT_METADATA_ID]: {
              ...READ_ACCESS,
              rowLevelRecordsPermissions: {
                canCreateRecords: false,
                canReadRecords: true,
                canUpdateRecords: false,
                canSoftDeleteRecords: false,
                canDestroyRecords: false,
                predicates: [],
                predicateGroups: [],
                unreadableFields: rlsRuleUnreadableFields,
                uneditableFields: rlsRuleUnreadableFields,
              },
            },
          },
        },
      },
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

  it('should omit a field unreadable on an RLS rule the record matches', () => {
    jest
      .mocked(resolveRlsRuleRecordFilter)
      .mockReturnValue({ name: { eq: 'New' } });

    const [event] = filter({
      events: [
        buildUpdateEvent({
          recordId: 'record-1',
          updatedFields: ['name', 'secret'],
        }),
      ],
      recordsPermissions: { objects: { [OBJECT_METADATA_ID]: READ_ACCESS } },
      rlsRuleUnreadableFields: ['secret-field-id'],
    });

    expect(event.properties.after).toEqual({ id: 'record-1', name: 'New' });
    expect(event.properties.updatedFields).toEqual(['name']);
  });

  it('should add up object level and RLS rule unreadable fields', () => {
    jest
      .mocked(resolveRlsRuleRecordFilter)
      .mockReturnValue({ name: { eq: 'New' } });

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
      rlsRuleUnreadableFields: ['secret-field-id'],
    });

    expect(event).toBeUndefined();
  });

  it('should keep a field unreadable on an RLS rule the record does not match', () => {
    jest
      .mocked(resolveRlsRuleRecordFilter)
      .mockReturnValue({ name: { eq: 'Another' } });

    const [event] = filter({
      events: [
        buildUpdateEvent({
          recordId: 'record-1',
          updatedFields: ['name', 'secret'],
        }),
      ],
      recordsPermissions: { objects: { [OBJECT_METADATA_ID]: READ_ACCESS } },
      rlsRuleUnreadableFields: ['secret-field-id'],
    });

    expect(event.properties.updatedFields).toEqual(['name', 'secret']);
  });
});
