import {
  FieldMetadataType,
  RelationType,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatRowLevelPermissionPredicateGroup } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group.type';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import { type RowLevelPermissionWorkspaceMember } from 'src/engine/permissions/internal/rls/types/row-level-permission-workspace-member.type';
import { UNSATISFIABLE_RECORD_FILTER } from 'src/engine/permissions/internal/rls/constants/unsatisfiable-record-filter.constant';
import {
  buildRecordFilterForRole,
  buildRowLevelPermissionRecordFilter,
} from 'src/engine/permissions/internal/rls/utils/build-row-level-permission-record-filter.util';

const OBJECT_ID = 'object-1';
const WORKSPACE_MEMBER_OBJECT_ID = 'workspace-member-object';
const FIELD_ID = 'field-1';
const STATUS_FIELD_ID = 'status-field';
const WORKSPACE_MEMBER_LOCALE_FIELD_ID = 'workspace-member-locale-field';
const WORKSPACE_MEMBER_TEAM_FIELD_ID = 'workspace-member-team-field';
const USER_ROLE_ID = 'user-role-1';
const APPLICATION_ROLE_ID = 'application-role-1';
const UNRESTRICTED_ROLE_ID = 'unrestricted-role-1';
const LOCALE_BOUND_ROLE_ID = 'locale-bound-role-1';
const TEAM_BOUND_ROLE_ID = 'team-bound-role-1';
const OR_GROUP_ROLE_ID = 'or-group-role-1';
const AND_GROUP_ROLE_ID = 'and-group-role-1';
const NESTED_GROUP_ROLE_ID = 'nested-group-role-1';
const OR_GROUP_ONLY_MEMBER_ROLE_ID = 'or-group-only-member-role-1';
const TEXT_IS_ROLE_ID = 'text-is-role-1';
const SELECT_CONTAINS_ROLE_ID = 'select-contains-role-1';
const RELATION_HOP_ROLE_ID = 'relation-hop-role-1';
const COMPANY_OBJECT_ID = 'company-object';
const PERSON_OBJECT_ID = 'person-object';
const OWNER_MORPH_ID = 'owner-morph';
const OWNER_COMPANY_FIELD_ID = 'owner-company-field';
const OWNER_PERSON_FIELD_ID = 'owner-person-field';
const MORPH_TARGET_ROLE_ID = 'morph-target-role-1';
const MORPH_HEAD_ROLE_ID = 'morph-head-role-1';
const OWNER_RECORD_ID = '11111111-1111-4111-8111-111111111111';

const buildMaps = <TFlatEntity extends SyncableFlatEntity>(
  entities: TFlatEntity[],
) =>
  entities.reduce<FlatEntityMaps<TFlatEntity>>(
    (maps, entity) =>
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: entity,
        flatEntityMaps: maps,
      }),
    createEmptyFlatEntityMaps(),
  );

const flatObjectMetadata = getFlatObjectMetadataMock({
  id: OBJECT_ID,
  universalIdentifier: OBJECT_ID,
  nameSingular: 'thing',
  namePlural: 'things',
  fieldIds: [
    FIELD_ID,
    STATUS_FIELD_ID,
    OWNER_MORPH_ID,
    OWNER_COMPANY_FIELD_ID,
    OWNER_PERSON_FIELD_ID,
  ],
});

const flatObjectMetadataMaps = buildMaps([
  flatObjectMetadata,
  getFlatObjectMetadataMock({
    id: COMPANY_OBJECT_ID,
    universalIdentifier: COMPANY_OBJECT_ID,
    nameSingular: 'company',
    namePlural: 'companies',
  }),
  getFlatObjectMetadataMock({
    id: PERSON_OBJECT_ID,
    universalIdentifier: PERSON_OBJECT_ID,
    nameSingular: 'person',
    namePlural: 'people',
  }),
]);

const buildOwnerMorphField = (
  field: Pick<FlatFieldMetadata, 'id' | 'name'> & Partial<FlatFieldMetadata>,
) =>
  getFlatFieldMetadataMock({
    universalIdentifier: field.id,
    type: FieldMetadataType.MORPH_RELATION,
    objectMetadataId: OBJECT_ID,
    morphId: OWNER_MORPH_ID,
    relationTargetFieldMetadataId: null,
    relationTargetObjectMetadataId: null,
    settings: { relationType: RelationType.MANY_TO_ONE },
    ...field,
  });

const flatFieldMetadataMaps = buildMaps([
  getFlatFieldMetadataMock({
    id: FIELD_ID,
    universalIdentifier: FIELD_ID,
    name: 'name',
    type: FieldMetadataType.TEXT,
    objectMetadataId: OBJECT_ID,
  }),
  getFlatFieldMetadataMock({
    id: STATUS_FIELD_ID,
    universalIdentifier: STATUS_FIELD_ID,
    name: 'status',
    type: FieldMetadataType.SELECT,
    objectMetadataId: OBJECT_ID,
    options: [
      {
        id: 'option-open',
        value: 'OPEN',
        label: 'Open',
        position: 0,
        color: 'green',
      },
      {
        id: 'option-closed',
        value: 'CLOSED',
        label: 'Closed',
        position: 1,
        color: 'red',
      },
    ],
  }),
  getFlatFieldMetadataMock({
    id: WORKSPACE_MEMBER_LOCALE_FIELD_ID,
    universalIdentifier: WORKSPACE_MEMBER_LOCALE_FIELD_ID,
    name: 'locale',
    type: FieldMetadataType.TEXT,
    objectMetadataId: WORKSPACE_MEMBER_OBJECT_ID,
  }),
  getFlatFieldMetadataMock({
    id: WORKSPACE_MEMBER_TEAM_FIELD_ID,
    universalIdentifier: WORKSPACE_MEMBER_TEAM_FIELD_ID,
    name: 'team',
    type: FieldMetadataType.SELECT,
    objectMetadataId: WORKSPACE_MEMBER_OBJECT_ID,
    options: [
      {
        id: 'option-open',
        value: 'OPEN',
        label: 'Open',
        position: 0,
        color: 'green',
      },
      {
        id: 'option-sales',
        value: 'SALES',
        label: 'Sales',
        position: 1,
        color: 'blue',
      },
    ],
  }),
  buildOwnerMorphField({ id: OWNER_MORPH_ID, name: 'owner' }),
  buildOwnerMorphField({
    id: OWNER_COMPANY_FIELD_ID,
    name: 'ownerCompany',
    relationTargetFieldMetadataId: 'company-owned-things-field',
    relationTargetObjectMetadataId: COMPANY_OBJECT_ID,
  }),
  buildOwnerMorphField({
    id: OWNER_PERSON_FIELD_ID,
    name: 'ownerPerson',
    relationTargetFieldMetadataId: 'person-owned-things-field',
    relationTargetObjectMetadataId: PERSON_OBJECT_ID,
  }),
]);

const FLAT_ENTITY_DEFAULTS = {
  applicationId: 'application-id',
  applicationUniversalIdentifier: 'application-universal-identifier',
  workspaceId: 'workspace-id',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const buildPredicate = (
  id: string,
  roleId: string,
  predicate: Partial<FlatRowLevelPermissionPredicate>,
): FlatRowLevelPermissionPredicate => ({
  id,
  universalIdentifier: id,
  ...FLAT_ENTITY_DEFAULTS,
  roleId,
  objectMetadataId: OBJECT_ID,
  fieldMetadataId: FIELD_ID,
  relationFieldMetadataId: null,
  fieldMetadataUniversalIdentifier: FIELD_ID,
  relationFieldMetadataUniversalIdentifier: null,
  objectMetadataUniversalIdentifier: OBJECT_ID,
  roleUniversalIdentifier: roleId,
  workspaceMemberFieldMetadataUniversalIdentifier: null,
  rowLevelPermissionPredicateGroupUniversalIdentifier: null,
  operand: RowLevelPermissionPredicateOperand.CONTAINS,
  value: null,
  subFieldName: null,
  workspaceMemberFieldMetadataId: null,
  workspaceMemberSubFieldName: null,
  rowLevelPermissionPredicateGroupId: null,
  positionInRowLevelPermissionPredicateGroup: null,
  deletedAt: null,
  ...predicate,
});

const flatRowLevelPermissionPredicateMaps = buildMaps([
  buildPredicate('predicate-user', USER_ROLE_ID, { value: 'visible-to-user' }),
  buildPredicate('predicate-application', APPLICATION_ROLE_ID, {
    value: 'visible-to-application',
  }),
  buildPredicate('predicate-locale', LOCALE_BOUND_ROLE_ID, {
    workspaceMemberFieldMetadataId: WORKSPACE_MEMBER_LOCALE_FIELD_ID,
  }),
  buildPredicate('predicate-team', TEAM_BOUND_ROLE_ID, {
    fieldMetadataId: STATUS_FIELD_ID,
    operand: RowLevelPermissionPredicateOperand.IS,
    workspaceMemberFieldMetadataId: WORKSPACE_MEMBER_TEAM_FIELD_ID,
  }),
  buildPredicate('predicate-or-static', OR_GROUP_ROLE_ID, {
    value: 'shared-with-everyone',
    rowLevelPermissionPredicateGroupId: 'or-group',
  }),
  buildPredicate('predicate-or-member', OR_GROUP_ROLE_ID, {
    workspaceMemberFieldMetadataId: WORKSPACE_MEMBER_LOCALE_FIELD_ID,
    rowLevelPermissionPredicateGroupId: 'or-group',
  }),
  buildPredicate('predicate-and-static', AND_GROUP_ROLE_ID, {
    value: 'shared-with-everyone',
    rowLevelPermissionPredicateGroupId: 'and-group',
  }),
  buildPredicate('predicate-and-member', AND_GROUP_ROLE_ID, {
    workspaceMemberFieldMetadataId: WORKSPACE_MEMBER_LOCALE_FIELD_ID,
    rowLevelPermissionPredicateGroupId: 'and-group',
  }),
  buildPredicate('predicate-nested-static', NESTED_GROUP_ROLE_ID, {
    value: 'kept-branch',
    rowLevelPermissionPredicateGroupId: 'nested-or-group',
  }),
  buildPredicate('predicate-nested-and-static', NESTED_GROUP_ROLE_ID, {
    value: 'denied-branch',
    rowLevelPermissionPredicateGroupId: 'nested-and-group',
  }),
  buildPredicate('predicate-nested-and-member', NESTED_GROUP_ROLE_ID, {
    workspaceMemberFieldMetadataId: WORKSPACE_MEMBER_LOCALE_FIELD_ID,
    rowLevelPermissionPredicateGroupId: 'nested-and-group',
  }),
  buildPredicate('predicate-only-member-first', OR_GROUP_ONLY_MEMBER_ROLE_ID, {
    workspaceMemberFieldMetadataId: WORKSPACE_MEMBER_LOCALE_FIELD_ID,
    rowLevelPermissionPredicateGroupId: 'or-group-only-member',
  }),
  buildPredicate('predicate-only-member-second', OR_GROUP_ONLY_MEMBER_ROLE_ID, {
    workspaceMemberFieldMetadataId: WORKSPACE_MEMBER_LOCALE_FIELD_ID,
    rowLevelPermissionPredicateGroupId: 'or-group-only-member',
  }),
  buildPredicate('predicate-morph-target', MORPH_TARGET_ROLE_ID, {
    fieldMetadataId: OWNER_COMPANY_FIELD_ID,
    operand: RowLevelPermissionPredicateOperand.IS,
    value: { selectedRecordIds: [OWNER_RECORD_ID] },
  }),
  buildPredicate('predicate-morph-head', MORPH_HEAD_ROLE_ID, {
    fieldMetadataId: OWNER_MORPH_ID,
    operand: RowLevelPermissionPredicateOperand.IS,
    value: { selectedRecordIds: [OWNER_RECORD_ID] },
  }),
  buildPredicate('predicate-text-is', TEXT_IS_ROLE_ID, {
    operand: RowLevelPermissionPredicateOperand.IS,
    value: 'stale-value',
  }),
  buildPredicate('predicate-select-contains', SELECT_CONTAINS_ROLE_ID, {
    fieldMetadataId: STATUS_FIELD_ID,
    operand: RowLevelPermissionPredicateOperand.CONTAINS,
    value: 'OPEN',
  }),
  buildPredicate('predicate-relation-hop', RELATION_HOP_ROLE_ID, {
    relationFieldMetadataId: 'relation-field',
    value: 'reached-through-relation',
  }),
]);

const buildPredicateGroup = (
  id: string,
  roleId: string,
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator,
  parentRowLevelPermissionPredicateGroupId: string | null = null,
): FlatRowLevelPermissionPredicateGroup => ({
  id,
  universalIdentifier: id,
  ...FLAT_ENTITY_DEFAULTS,
  objectMetadataId: OBJECT_ID,
  positionInRowLevelPermissionPredicateGroup: null,
  canReadRecords: true,
  canCreateRecords: true,
  canUpdateRecords: true,
  canSoftDeleteRecords: true,
  canDestroyRecords: true,
  childRowLevelPermissionPredicateGroupIds: [],
  rowLevelPermissionPredicateIds: [],
  childRowLevelPermissionPredicateGroupUniversalIdentifiers: [],
  rowLevelPermissionPredicateUniversalIdentifiers: [],
  objectMetadataUniversalIdentifier: OBJECT_ID,
  roleUniversalIdentifier: roleId,
  parentRowLevelPermissionPredicateGroupUniversalIdentifier:
    parentRowLevelPermissionPredicateGroupId,
  roleId,
  logicalOperator,
  parentRowLevelPermissionPredicateGroupId,
  deletedAt: null,
});

const flatRowLevelPermissionPredicateGroupMaps = buildMaps([
  buildPredicateGroup(
    'or-group',
    OR_GROUP_ROLE_ID,
    RowLevelPermissionPredicateGroupLogicalOperator.OR,
  ),
  buildPredicateGroup(
    'and-group',
    AND_GROUP_ROLE_ID,
    RowLevelPermissionPredicateGroupLogicalOperator.AND,
  ),
  buildPredicateGroup(
    'nested-or-group',
    NESTED_GROUP_ROLE_ID,
    RowLevelPermissionPredicateGroupLogicalOperator.OR,
  ),
  buildPredicateGroup(
    'nested-and-group',
    NESTED_GROUP_ROLE_ID,
    RowLevelPermissionPredicateGroupLogicalOperator.AND,
    'nested-or-group',
  ),
  buildPredicateGroup(
    'or-group-only-member',
    OR_GROUP_ONLY_MEMBER_ROLE_ID,
    RowLevelPermissionPredicateGroupLogicalOperator.OR,
  ),
]);

const buildWorkspaceMember = (workspaceMember: Record<string, unknown>) => ({
  id: 'workspace-member-1',
  ...workspaceMember,
});

const build = (
  roleIds: string[],
  workspaceMember?: RowLevelPermissionWorkspaceMember,
) =>
  buildRowLevelPermissionRecordFilter({
    isRelationHopEnabled: false,
    flatRowLevelPermissionPredicateMaps,
    flatRowLevelPermissionPredicateGroupMaps,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    objectMetadata: flatObjectMetadata,
    roleIds,
    workspaceMember,
  });

describe('buildRowLevelPermissionRecordFilter', () => {
  it('should return null when no role is given', () => {
    expect(build([])).toBeNull();
  });

  it('should return null when the role has no predicates', () => {
    expect(build([UNRESTRICTED_ROLE_ID])).toBeNull();
  });

  it('should return the role filter as-is for a single role', () => {
    expect(build([USER_ROLE_ID])).toEqual({
      name: { ilike: '%visible-to-user%' },
    });
  });

  it('should keep the restriction when the other role is unrestricted', () => {
    expect(build([USER_ROLE_ID, UNRESTRICTED_ROLE_ID])).toEqual({
      name: { ilike: '%visible-to-user%' },
    });
  });

  it('should require both roles to be satisfied when both restrict', () => {
    expect(build([USER_ROLE_ID, APPLICATION_ROLE_ID])).toEqual({
      and: [
        { name: { ilike: '%visible-to-user%' } },
        { name: { ilike: '%visible-to-application%' } },
      ],
    });
  });

  it('should compile an IS operand on a text field to a case-sensitive exact match', () => {
    expect(build([TEXT_IS_ROLE_ID])).toEqual({ name: { eq: 'stale-value' } });
  });

  describe('predicate whose operand is invalid for the field type', () => {
    it('should throw a meaningful error for a contains operand on a select field', () => {
      expect(() => build([SELECT_CONTAINS_ROLE_ID])).toThrow(
        /Operand CONTAINS is not supported for field status of type SELECT/,
      );
    });
  });

  it.each([
    ['a morph relation target', MORPH_TARGET_ROLE_ID],
    ['a morph relation head', MORPH_HEAD_ROLE_ID],
  ])(
    'should check every target join column for a predicate on %s',
    (_, roleId) => {
      expect(build([roleId])).toEqual({
        or: [
          { ownerCompanyId: { in: [OWNER_RECORD_ID] } },
          { ownerPersonId: { in: [OWNER_RECORD_ID] } },
        ],
      });
    },
  );

  it('should match nothing for a predicate reached through a relation hop', () => {
    expect(build([RELATION_HOP_ROLE_ID])).toEqual(UNSATISFIABLE_RECORD_FILTER);
  });

  describe('predicate bound to a workspace member field', () => {
    it('should filter on the value carried by the workspace member', () => {
      expect(
        build(
          [LOCALE_BOUND_ROLE_ID],
          buildWorkspaceMember({ locale: 'fr-FR' }),
        ),
      ).toEqual({ name: { ilike: '%fr-FR%' } });
    });

    it('should match nothing when no workspace member acts, as for an api key', () => {
      expect(build([LOCALE_BOUND_ROLE_ID])).toEqual(
        UNSATISFIABLE_RECORD_FILTER,
      );
    });

    it('should match nothing when the workspace member does not carry the value', () => {
      expect(
        build([LOCALE_BOUND_ROLE_ID], buildWorkspaceMember({ locale: null })),
      ).toEqual(UNSATISFIABLE_RECORD_FILTER);
    });

    it('should match nothing when the workspace member value does not fit the target field', () => {
      expect(
        build([TEAM_BOUND_ROLE_ID], buildWorkspaceMember({ team: 'SALES' })),
      ).toEqual(UNSATISFIABLE_RECORD_FILTER);
    });

    it('should filter on a workspace member value that fits the target field', () => {
      expect(
        build([TEAM_BOUND_ROLE_ID], buildWorkspaceMember({ team: 'OPEN' })),
      ).toEqual({ status: { in: ['OPEN'] } });
    });

    it('should keep matching nothing when the other role is unrestricted', () => {
      expect(build([LOCALE_BOUND_ROLE_ID, UNRESTRICTED_ROLE_ID])).toEqual(
        UNSATISFIABLE_RECORD_FILTER,
      );
    });

    it('should keep the other branches of an OR group it cannot satisfy', () => {
      expect(build([OR_GROUP_ROLE_ID])).toEqual({
        or: [{ name: { ilike: '%shared-with-everyone%' } }],
      });
    });

    it('should keep both branches of an OR group once the member carries the value', () => {
      expect(
        build([OR_GROUP_ROLE_ID], buildWorkspaceMember({ locale: 'fr-FR' })),
      ).toEqual({
        or: [
          { name: { ilike: '%shared-with-everyone%' } },
          { name: { ilike: '%fr-FR%' } },
        ],
      });
    });

    it('should match nothing when an AND group holds a branch it cannot satisfy', () => {
      expect(build([AND_GROUP_ROLE_ID])).toEqual(UNSATISFIABLE_RECORD_FILTER);
    });

    it('should drop a nested AND branch it cannot satisfy and keep its sibling', () => {
      expect(build([NESTED_GROUP_ROLE_ID])).toEqual({
        or: [{ name: { ilike: '%kept-branch%' } }],
      });
    });

    it('should match nothing when no branch of an OR group can be satisfied', () => {
      expect(build([OR_GROUP_ONLY_MEMBER_ROLE_ID])).toEqual(
        UNSATISFIABLE_RECORD_FILTER,
      );
    });

    it('should keep matching nothing when the other role restricts', () => {
      expect(build([LOCALE_BOUND_ROLE_ID, USER_ROLE_ID])).toEqual({
        and: [
          UNSATISFIABLE_RECORD_FILTER,
          { name: { ilike: '%visible-to-user%' } },
        ],
      });
    });
  });
});

describe('buildRecordFilterForRole with access group member values', () => {
  const buildForAccessGroup = ({
    roleId,
    memberFieldValues,
  }: {
    roleId: string;
    memberFieldValues: Record<string, string | string[] | null>;
  }) =>
    buildRecordFilterForRole({
      isRelationHopEnabled: false,
      flatRowLevelPermissionPredicateMaps,
      flatRowLevelPermissionPredicateGroupMaps,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      objectMetadata: flatObjectMetadata,
      roleId,
      memberFieldValues,
    });

  it('should filter on the group value as a member carrying it would', () => {
    expect(
      buildForAccessGroup({
        roleId: LOCALE_BOUND_ROLE_ID,
        memberFieldValues: {
          [`${WORKSPACE_MEMBER_LOCALE_FIELD_ID}:`]: 'fr-FR',
        },
      }),
    ).toEqual(
      build([LOCALE_BOUND_ROLE_ID], buildWorkspaceMember({ locale: 'fr-FR' })),
    );
  });

  it('should wrap the group value of a select member field into a list', () => {
    expect(
      buildForAccessGroup({
        roleId: TEAM_BOUND_ROLE_ID,
        memberFieldValues: { [`${WORKSPACE_MEMBER_TEAM_FIELD_ID}:`]: 'OPEN' },
      }),
    ).toEqual({ status: { in: ['OPEN'] } });
  });

  it('should use a whole list kept by the group as it is', () => {
    expect(
      buildForAccessGroup({
        roleId: TEAM_BOUND_ROLE_ID,
        memberFieldValues: { [`${WORKSPACE_MEMBER_TEAM_FIELD_ID}:`]: ['OPEN'] },
      }),
    ).toEqual({ status: { in: ['OPEN'] } });
  });

  it('should match nothing when the group holds no value', () => {
    expect(
      buildForAccessGroup({
        roleId: LOCALE_BOUND_ROLE_ID,
        memberFieldValues: { [`${WORKSPACE_MEMBER_LOCALE_FIELD_ID}:`]: null },
      }),
    ).toEqual(UNSATISFIABLE_RECORD_FILTER);
  });
});
