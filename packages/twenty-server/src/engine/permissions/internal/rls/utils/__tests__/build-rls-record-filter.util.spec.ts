import {
  FieldMetadataType,
  RelationType,
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type RlsWorkspaceMember } from 'src/engine/permissions/internal/rls/types/rls-workspace-member.type';
import { UNSATISFIABLE_RECORD_FILTER } from 'src/engine/permissions/internal/rls/constants/unsatisfiable-record-filter.constant';
import { isRecordMatchingFilter } from 'src/engine/permissions/utils/is-record-matching-filter.util';
import { buildMemberFieldValuesOrThrow } from 'src/engine/permissions/internal/rls/utils/build-member-field-values-or-throw.util';
import {
  buildRecordFilterForRule,
  buildRlsRecordFilter,
} from 'src/engine/permissions/internal/rls/utils/build-rls-record-filter.util';

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
const TWO_ROOT_GROUPS_ROLE_ID = 'two-root-groups-role-1';
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

const buildPredicate = (
  id: string,
  roleId: string,
  predicate: Partial<RowLevelPermissionPredicate>,
): RowLevelPermissionPredicate => ({
  id,
  roleId,
  objectMetadataId: OBJECT_ID,
  fieldMetadataId: FIELD_ID,
  relationFieldMetadataId: null,
  operand: RowLevelPermissionPredicateOperand.CONTAINS,
  value: null,
  subFieldName: null,
  workspaceMemberFieldMetadataId: null,
  workspaceMemberSubFieldName: null,
  rowLevelPermissionPredicateGroupId: null,
  ...predicate,
});

const predicates = [
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
  buildPredicate('predicate-root-b', TWO_ROOT_GROUPS_ROLE_ID, {
    value: 'from-root-b',
    rowLevelPermissionPredicateGroupId: 'root-b',
  }),
  buildPredicate('predicate-root-a', TWO_ROOT_GROUPS_ROLE_ID, {
    value: 'from-root-a',
    rowLevelPermissionPredicateGroupId: 'root-a',
  }),
  buildPredicate('predicate-relation-hop', RELATION_HOP_ROLE_ID, {
    relationFieldMetadataId: 'relation-field',
    value: 'reached-through-relation',
  }),
];

const buildPredicateGroup = (
  id: string,
  roleId: string,
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator,
  parentRowLevelPermissionPredicateGroupId: string | null = null,
): RowLevelPermissionPredicateGroup => ({
  id,
  objectMetadataId: OBJECT_ID,
  positionInRowLevelPermissionPredicateGroup: null,
  canReadRecords: true,
  canUpdateRecords: true,
  canSoftDeleteRecords: true,
  canDestroyRecords: true,
  roleId,
  logicalOperator,
  parentRowLevelPermissionPredicateGroupId,
});

const predicateGroups = [
  buildPredicateGroup(
    'root-a',
    TWO_ROOT_GROUPS_ROLE_ID,
    RowLevelPermissionPredicateGroupLogicalOperator.AND,
  ),
  buildPredicateGroup(
    'root-b',
    TWO_ROOT_GROUPS_ROLE_ID,
    RowLevelPermissionPredicateGroupLogicalOperator.AND,
  ),
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
];

const findRule = (roleId: string) => {
  return {
    predicates: predicates.filter((predicate) => predicate.roleId === roleId),
    predicateGroups: predicateGroups.filter(
      (predicateGroup) => predicateGroup.roleId === roleId,
    ),
  };
};

const buildWorkspaceMember = (workspaceMember: Record<string, unknown>) => ({
  id: 'workspace-member-1',
  ...workspaceMember,
});

const build = (roleIds: string[], workspaceMember?: RlsWorkspaceMember) =>
  buildRlsRecordFilter({
    isRelationHopEnabled: false,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    rowLevelPermissionRules: roleIds.map(findRule),
    memberFieldValues: buildMemberFieldValuesOrThrow({
      workspaceMember,
      predicates,
      flatFieldMetadataMaps,
    }),
    currentWorkspaceMemberId: workspaceMember?.id,
  });

describe('buildRlsRecordFilter', () => {
  it('should match nothing when no rule is given', () => {
    expect(build([])).toEqual(UNSATISFIABLE_RECORD_FILTER);
  });

  it('should match nothing when the only rule has no predicates', () => {
    expect(build([UNRESTRICTED_ROLE_ID])).toEqual(UNSATISFIABLE_RECORD_FILTER);
  });

  it('should return the rule filter as-is for a single rule', () => {
    expect(build([USER_ROLE_ID])).toEqual({
      name: { ilike: '%visible-to-user%' },
    });
  });

  it('should ignore a rule without predicates next to another rule', () => {
    expect(build([USER_ROLE_ID, UNRESTRICTED_ROLE_ID])).toEqual({
      name: { ilike: '%visible-to-user%' },
    });
  });

  it('should match a record matching any of two rules', () => {
    const filter = build([USER_ROLE_ID, APPLICATION_ROLE_ID]);
    const isMatching = (name: string) =>
      isRecordMatchingFilter({
        record: { name, deletedAt: null },
        filter,
        flatObjectMetadata,
        flatFieldMetadataMaps,
      });

    expect(filter).toEqual({
      or: [
        { name: { ilike: '%visible-to-user%' } },
        { name: { ilike: '%visible-to-application%' } },
      ],
    });
    expect(isMatching('visible-to-user')).toBe(true);
    expect(isMatching('visible-to-application')).toBe(true);
    expect(isMatching('visible-to-nobody')).toBe(false);
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

  it('should require every root group of a rule', () => {
    expect(build([TWO_ROOT_GROUPS_ROLE_ID])).toEqual({
      and: [
        { and: [{ name: { ilike: '%from-root-a%' } }] },
        { and: [{ name: { ilike: '%from-root-b%' } }] },
      ],
    });
  });

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

    it('should match nothing when the workspace member carries an empty list', () => {
      expect(
        build([LOCALE_BOUND_ROLE_ID], buildWorkspaceMember({ locale: [] })),
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

    it('should keep matching nothing next to a rule without predicates', () => {
      expect(build([LOCALE_BOUND_ROLE_ID, UNRESTRICTED_ROLE_ID])).toEqual(
        UNSATISFIABLE_RECORD_FILTER,
      );
    });

    it('should leave a never-matching branch in an OR group so the others still match', () => {
      expect(build([OR_GROUP_ROLE_ID])).toEqual({
        or: [
          { name: { ilike: '%shared-with-everyone%' } },
          UNSATISFIABLE_RECORD_FILTER,
        ],
      });
    });

    it.each([
      [OR_GROUP_ROLE_ID, true],
      [AND_GROUP_ROLE_ID, false],
      [NESTED_GROUP_ROLE_ID, false],
    ])(
      'should evaluate the never-matching branch of %s as false',
      (roleId, isMatching) => {
        expect(
          isRecordMatchingFilter({
            record: { name: 'shared-with-everyone', deletedAt: null },
            filter: build([roleId]),
            flatObjectMetadata,
            flatFieldMetadataMaps,
          }),
        ).toBe(isMatching);
      },
    );

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

    it('should leave a never-matching branch in an AND group so the group matches nothing', () => {
      expect(build([AND_GROUP_ROLE_ID])).toEqual({
        and: [
          { name: { ilike: '%shared-with-everyone%' } },
          UNSATISFIABLE_RECORD_FILTER,
        ],
      });
    });

    it('should keep the sibling of a nested AND branch that matches nothing', () => {
      expect(build([NESTED_GROUP_ROLE_ID])).toEqual({
        or: [
          { name: { ilike: '%kept-branch%' } },
          {
            and: [
              { name: { ilike: '%denied-branch%' } },
              UNSATISFIABLE_RECORD_FILTER,
            ],
          },
        ],
      });
    });

    it('should match nothing when every branch of an OR group matches nothing', () => {
      expect(build([OR_GROUP_ONLY_MEMBER_ROLE_ID])).toEqual({
        or: [UNSATISFIABLE_RECORD_FILTER, UNSATISFIABLE_RECORD_FILTER],
      });
    });

    it('should still match through another rule when the member does not carry the value', () => {
      expect(build([LOCALE_BOUND_ROLE_ID, USER_ROLE_ID])).toEqual({
        or: [
          UNSATISFIABLE_RECORD_FILTER,
          { name: { ilike: '%visible-to-user%' } },
        ],
      });
    });
  });
});

describe('buildRecordFilterForRule with access group member values', () => {
  const buildForAccessGroup = ({
    roleId,
    memberFieldValues,
  }: {
    roleId: string;
    memberFieldValues: Record<string, string | string[] | null>;
  }) =>
    buildRecordFilterForRule({
      isRelationHopEnabled: false,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      rowLevelPermissionRule: findRule(roleId),
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

  it('should keep only the member values that are options of the target field', () => {
    expect(
      buildForAccessGroup({
        roleId: TEAM_BOUND_ROLE_ID,
        memberFieldValues: {
          [`${WORKSPACE_MEMBER_TEAM_FIELD_ID}:`]: ['OPEN', 'SALES'],
        },
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

  it.each([
    [RowLevelPermissionPredicateOperand.IS, ['sales'], 'sales', true],
    [RowLevelPermissionPredicateOperand.IS, ['sales'], 'support', false],
    [
      RowLevelPermissionPredicateOperand.IS,
      ['sales', 'support'],
      'sales',
      false,
    ],
    [
      RowLevelPermissionPredicateOperand.IS_NOT,
      ['sales', 'support'],
      'legal',
      false,
    ],
    [
      RowLevelPermissionPredicateOperand.CONTAINS,
      ['sal', 'sup'],
      'sales',
      false,
    ],
    [RowLevelPermissionPredicateOperand.IS, [''], 'sales', false],
  ])(
    'should give a text field a single member value and match nothing for several (%s %j on "%s")',
    (operand, memberValues, name, expected) => {
      const filter = buildRecordFilterForRule({
        isRelationHopEnabled: false,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
        rowLevelPermissionRule: {
          predicates: [
            buildPredicate('predicate-text-member-list', USER_ROLE_ID, {
              operand,
              workspaceMemberFieldMetadataId: WORKSPACE_MEMBER_TEAM_FIELD_ID,
            }),
          ],
          predicateGroups: [],
        },
        memberFieldValues: {
          [`${WORKSPACE_MEMBER_TEAM_FIELD_ID}:`]: memberValues,
        },
      });

      if (!isDefined(filter)) {
        throw new Error('Expected a filter to be built');
      }

      expect(
        isRecordMatchingFilter({
          record: { id: 'record-1', name, deletedAt: null },
          filter,
          flatObjectMetadata,
          flatFieldMetadataMaps,
        }),
      ).toBe(expected);
    },
  );

  it('should give a select field a single member value as a one item list', () => {
    expect(
      buildRecordFilterForRule({
        isRelationHopEnabled: false,
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
        rowLevelPermissionRule: {
          predicates: [
            buildPredicate('predicate-select-member-text', USER_ROLE_ID, {
              fieldMetadataId: STATUS_FIELD_ID,
              operand: RowLevelPermissionPredicateOperand.IS,
              workspaceMemberFieldMetadataId: WORKSPACE_MEMBER_LOCALE_FIELD_ID,
            }),
          ],
          predicateGroups: [],
        },
        memberFieldValues: { [`${WORKSPACE_MEMBER_LOCALE_FIELD_ID}:`]: 'OPEN' },
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
