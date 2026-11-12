import {
  FieldMetadataType,
  type ObjectRecordsPermissions,
  RowLevelPermissionPredicateOperand,
  type RowLevelRecordsPermissions,
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

const buildRule = ({
  roleId,
  ruleId,
  value,
  unreadableFields,
}: {
  roleId: string;
  ruleId: string;
  value: string;
  unreadableFields: string[];
}): RowLevelRecordsPermissions => ({
  ruleId,
  canCreateRecords: false,
  canReadRecords: true,
  canUpdateRecords: false,
  canSoftDeleteRecords: false,
  canDestroyRecords: false,
  predicateGroups: [],
  predicates: [
    {
      id: `${ruleId}-predicate`,
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
  unreadableFields,
  uneditableFields: unreadableFields,
});

const buildObjectRecordsPermissions = (
  rowLevelRecordsPermissions: RowLevelRecordsPermissions[],
): ObjectRecordsPermissions => ({
  canCreateAllRecords: false,
  canReadAllRecords: false,
  canUpdateAllRecords: false,
  canSoftDeleteAllRecords: false,
  canDestroyAllRecords: false,
  unreadableFields: [],
  uneditableFields: [],
  rowLevelRecordsPermissions,
});

const resolve = ({
  memberRules,
  agentRules = [],
}: {
  memberRules: RowLevelRecordsPermissions[];
  agentRules?: RowLevelRecordsPermissions[];
}) =>
  resolveFieldsHiddenOnMatchingRecords({
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
      featureFlagsMap: {},
      rolesPermissions: {
        [MEMBER_ROLE_ID]: {
          ...NO_ROLE_RECORDS_PERMISSIONS,
          objects: {
            [OBJECT_METADATA_ID]: buildObjectRecordsPermissions(memberRules),
          },
        },
        [AGENT_ROLE_ID]: {
          ...NO_ROLE_RECORDS_PERMISSIONS,
          objects: {
            [OBJECT_METADATA_ID]: buildObjectRecordsPermissions(agentRules),
          },
        },
      },
    },
    flatObjectMetadata: invoice,
    fieldList: 'unreadableFields',
    records: [],
    findRelationJoinValues: jest.fn(),
  });

describe('resolveFieldsHiddenOnMatchingRecords', () => {
  it('should take the hidden fields and filter of the main role only', async () => {
    expect(
      await resolve({
        memberRules: [
          buildRule({
            roleId: MEMBER_ROLE_ID,
            ruleId: 'member-rule-id',
            value: 'member-invoice',
            unreadableFields: ['secret-field-id'],
          }),
        ],
        agentRules: [
          buildRule({
            roleId: AGENT_ROLE_ID,
            ruleId: 'agent-rule-id',
            value: 'agent-invoice',
            unreadableFields: ['amount-field-id'],
          }),
        ],
      }),
    ).toEqual([
      {
        fieldMetadataIds: ['secret-field-id'],
        recordFilter: { name: { eq: 'member-invoice' } },
      },
    ]);
  });

  it('should hide each rule fields on the records matching that rule only', async () => {
    expect(
      await resolve({
        memberRules: [
          buildRule({
            roleId: MEMBER_ROLE_ID,
            ruleId: 'first-rule-id',
            value: 'first-invoice',
            unreadableFields: ['secret-field-id'],
          }),
          buildRule({
            roleId: MEMBER_ROLE_ID,
            ruleId: 'second-rule-id',
            value: 'second-invoice',
            unreadableFields: [],
          }),
          buildRule({
            roleId: MEMBER_ROLE_ID,
            ruleId: 'third-rule-id',
            value: 'third-invoice',
            unreadableFields: ['amount-field-id'],
          }),
        ],
      }),
    ).toEqual([
      {
        fieldMetadataIds: ['secret-field-id'],
        recordFilter: { name: { eq: 'first-invoice' } },
      },
      {
        fieldMetadataIds: ['amount-field-id'],
        recordFilter: { name: { eq: 'third-invoice' } },
      },
    ]);
  });
});
