import {
  FieldMetadataType,
  type ObjectRecordsPermissions,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { NO_ROLE_RECORDS_PERMISSIONS } from 'src/engine/permissions/constants/no-role-records-permissions.constant';
import { resolveFieldsHiddenOnMatchingRecords } from 'src/engine/permissions/internal/field-access/utils/resolve-fields-hidden-on-matching-records.util';

const OBJECT_METADATA_ID = 'invoice-object-id';
const MEMBER_ROLE_ID = 'member-role-id';
const AGENT_ROLE_ID = 'agent-role-id';

const invoice = getFlatObjectMetadataMock({
  id: OBJECT_METADATA_ID,
  universalIdentifier: OBJECT_METADATA_ID,
  fieldIds: ['name-field-id', 'secret-field-id', 'amount-field-id'],
});

const flatFieldMetadataMaps = [
  { id: 'name-field-id', name: 'name' },
  { id: 'secret-field-id', name: 'secret' },
  { id: 'amount-field-id', name: 'amount' },
].reduce(
  (maps, { id, name }) =>
    addFlatEntityToFlatEntityMapsOrThrow({
      flatEntity: getFlatFieldMetadataMock({
        id,
        universalIdentifier: id,
        objectMetadataId: OBJECT_METADATA_ID,
        type: FieldMetadataType.TEXT,
        name,
      }),
      flatEntityMaps: maps,
    }),
  createEmptyFlatEntityMaps(),
);

const buildObjectRecordsPermissions = ({
  roleId,
  value,
  rlsRuleUnreadableFields,
}: {
  roleId: string;
  value: string;
  rlsRuleUnreadableFields: string[];
}): ObjectRecordsPermissions => ({
  canCreateAllRecords: false,
  canReadAllRecords: false,
  canUpdateAllRecords: false,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: false,
  unreadableFields: [],
  uneditableFields: [],
  rowLevelRecordsPermissions: {
    canCreateRecords: false,
    canReadRecords: true,
    canUpdateRecords: false,
    canSoftDeleteRecords: false,
    canDestroyRecords: false,
    predicateGroups: [],
    predicates: [
      {
        id: `${roleId}-predicate`,
        roleId,
        objectMetadataId: OBJECT_METADATA_ID,
        fieldMetadataId: 'name-field-id',
        relationFieldMetadataId: null,
        rowLevelPermissionPredicateGroupId: null,
        operand: RowLevelPermissionPredicateOperand.IS,
        value,
        subFieldName: null,
        workspaceMemberFieldMetadataId: null,
        workspaceMemberSubFieldName: null,
      },
    ],
    unreadableFields: rlsRuleUnreadableFields,
    uneditableFields: rlsRuleUnreadableFields,
  },
});

describe('resolveFieldsHiddenOnMatchingRecords', () => {
  it('should take the hidden fields and filter of the main role only', async () => {
    const fieldsHiddenOnMatchingRecords =
      await resolveFieldsHiddenOnMatchingRecords({
        principals: {
          workspaceId: 'workspace-id',
          mainPrincipal: {
            type: 'workspaceMember',
            roleId: MEMBER_ROLE_ID,
            workspaceMemberId: 'member-id',
          },
          limitingPrincipal: {
            type: 'agent',
            agentId: 'agent-id',
            roleId: AGENT_ROLE_ID,
          },
          applicationPrincipal: { type: 'customApplication' },
        },
        metadataMaps: {
          flatObjectMetadataMaps: addFlatEntityToFlatEntityMapsOrThrow({
            flatEntity: invoice,
            flatEntityMaps: createEmptyFlatEntityMaps(),
          }),
          flatFieldMetadataMaps,
          flatApplicationMaps: { byId: {} },
          featureFlagsMap: {},
          rolesPermissions: {
            [MEMBER_ROLE_ID]: {
              ...NO_ROLE_RECORDS_PERMISSIONS,
              objects: {
                [OBJECT_METADATA_ID]: buildObjectRecordsPermissions({
                  roleId: MEMBER_ROLE_ID,
                  value: 'member-invoice',
                  rlsRuleUnreadableFields: ['secret-field-id'],
                }),
              },
            },
            [AGENT_ROLE_ID]: {
              ...NO_ROLE_RECORDS_PERMISSIONS,
              objects: {
                [OBJECT_METADATA_ID]: buildObjectRecordsPermissions({
                  roleId: AGENT_ROLE_ID,
                  value: 'agent-invoice',
                  rlsRuleUnreadableFields: ['amount-field-id'],
                }),
              },
            },
          },
        },
        flatObjectMetadata: invoice,
        fieldList: 'unreadableFields',
        records: [],
        findRelationJoinValues: jest.fn(),
      });

    expect(fieldsHiddenOnMatchingRecords).toEqual([
      {
        fieldMetadataIds: ['secret-field-id'],
        recordFilter: { name: { eq: 'member-invoice' } },
      },
    ]);
  });
});
