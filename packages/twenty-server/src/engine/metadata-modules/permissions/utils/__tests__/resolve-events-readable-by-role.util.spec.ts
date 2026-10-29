import { type ObjectRecordUpdateEvent } from 'twenty-shared/database-events';
import { FieldMetadataType, type ObjectPermissions } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { resolveEventsReadableByRole } from 'src/engine/metadata-modules/permissions/utils/resolve-events-readable-by-role.util';
import { type RoleIdsBySource } from 'src/engine/twenty-orm/types/role-permission-config.type';

const OBJECT_METADATA_ID = 'invoice-object-id';
const OWNING_APPLICATION_ID = 'stripe-application-id';
const OTHER_APPLICATION_ID = 'other-application-id';
const ROLE_ID = 'role-id';

const invoice = getFlatObjectMetadataMock({
  id: OBJECT_METADATA_ID,
  universalIdentifier: OBJECT_METADATA_ID,
  applicationId: OWNING_APPLICATION_ID,
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
    applicationId: OWNING_APPLICATION_ID,
  }),
  getFlatFieldMetadataMock({
    id: 'secret-field-id',
    universalIdentifier: 'secret-field-id',
    objectMetadataId: OBJECT_METADATA_ID,
    type: FieldMetadataType.TEXT,
    name: 'secret',
    applicationId: OWNING_APPLICATION_ID,
    disabledFieldPermissionActions: ['canReadFieldValue'],
  }),
].reduce(
  (maps, flatEntity) =>
    addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps: maps }),
  createEmptyFlatEntityMaps(),
);

const FULL_ACCESS: ObjectPermissions = {
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
};

const buildUpdateEvent = (
  updatedFields: string[],
): ObjectRecordUpdateEvent => ({
  recordId: 'record-1',
  properties: {
    updatedFields,
    before: { id: 'record-1', name: 'Old', secret: 'old' },
    after: { id: 'record-1', name: 'New', secret: 'new' },
    diff: Object.fromEntries(
      updatedFields.map((field) => [field, { before: 'old', after: 'new' }]),
    ),
  },
});

const resolveEvents = ({
  intersectionOf,
  applicationIdOfRole = OWNING_APPLICATION_ID,
  events = [buildUpdateEvent(['name', 'secret'])],
}: {
  intersectionOf: RoleIdsBySource;
  applicationIdOfRole?: string;
  events?: ObjectRecordUpdateEvent[];
}) =>
  resolveEventsReadableByRole({
    intersectionOf,
    owningApplicationId: OWNING_APPLICATION_ID,
    workspaceEventBatch: {
      name: 'invoice.updated',
      workspaceId: 'workspace-id',
      objectMetadata: invoice,
      events,
    },
    eventRecordAccessGate: {
      resolveAdmittedRecordIds: async () => new Set(['record-1']),
    },
    rolesPermissions: { [ROLE_ID]: { [OBJECT_METADATA_ID]: FULL_ACCESS } },
    roleIdsWithAllRecordsAccess: [ROLE_ID],
    flatRowLevelPermissionPredicateMaps: createEmptyFlatEntityMaps(),
    flatRowLevelPermissionPredicateGroupMaps: createEmptyFlatEntityMaps(),
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    flatApplicationMaps: {
      byId: {
        [applicationIdOfRole]: {
          id: applicationIdOfRole,
          defaultRoleId: ROLE_ID,
          deletedAt: null,
        },
      },
    },
  });

describe('resolveEventsReadableByRole', () => {
  it('should omit a field whose read is disabled from another application', async () => {
    const [event] = await resolveEvents({
      intersectionOf: { applicationRoleId: ROLE_ID },
      applicationIdOfRole: OTHER_APPLICATION_ID,
    });

    expect(event.properties.after).toEqual({ id: 'record-1', name: 'New' });
    expect(event.properties.updatedFields).toEqual(['name']);
  });

  it('should keep the field for the application that owns it', async () => {
    const [event] = await resolveEvents({
      intersectionOf: { applicationRoleId: ROLE_ID },
    });

    expect(event.properties.after).toEqual({
      id: 'record-1',
      name: 'New',
      secret: 'new',
    });
  });

  it('should omit the field for an agent, even of the owning application', async () => {
    const [event] = await resolveEvents({
      intersectionOf: { agentRoleId: ROLE_ID },
    });

    expect(event.properties.after).toEqual({ id: 'record-1', name: 'New' });
  });

  it('should drop an update that only touches a read-disabled field', async () => {
    const events = await resolveEvents({
      intersectionOf: { agentRoleId: ROLE_ID },
      events: [buildUpdateEvent(['secret'])],
    });

    expect(events).toEqual([]);
  });

  it('should return nothing without a role', async () => {
    const events = await resolveEvents({
      intersectionOf: { applicationRoleId: null },
    });

    expect(events).toEqual([]);
  });
});
