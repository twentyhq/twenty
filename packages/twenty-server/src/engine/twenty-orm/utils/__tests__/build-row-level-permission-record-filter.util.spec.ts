import {
  FieldMetadataType,
  RowLevelPermissionPredicateGroupLogicalOperator,
} from 'twenty-shared/types';

import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { UNSATISFIABLE_RECORD_FILTER } from 'src/engine/twenty-orm/constants/unsatisfiable-record-filter.constant';
import { buildRowLevelPermissionRecordFilter } from 'src/engine/twenty-orm/utils/build-row-level-permission-record-filter.util';

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

const buildMaps = (
  entities: ({ id: string; universalIdentifier: string } & Record<
    string,
    unknown
  >)[],
) =>
  entities.reduce(
    (maps, entity) =>
      addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: entity as never,
        flatEntityMaps: maps,
      }),
    createEmptyFlatEntityMaps(),
  );

const flatObjectMetadata = {
  id: OBJECT_ID,
  nameSingular: 'thing',
  namePlural: 'things',
  fieldIds: [FIELD_ID, STATUS_FIELD_ID],
  fieldUniversalIdentifiers: [FIELD_ID, STATUS_FIELD_ID],
} as unknown as FlatObjectMetadata;

const flatFieldMetadataMaps = buildMaps([
  {
    id: FIELD_ID,
    universalIdentifier: FIELD_ID,
    name: 'name',
    type: FieldMetadataType.TEXT,
    objectMetadataId: OBJECT_ID,
  },
  {
    id: STATUS_FIELD_ID,
    universalIdentifier: STATUS_FIELD_ID,
    name: 'status',
    type: FieldMetadataType.SELECT,
    objectMetadataId: OBJECT_ID,
    options: [
      { value: 'OPEN', label: 'Open' },
      { value: 'CLOSED', label: 'Closed' },
    ],
  },
  {
    id: WORKSPACE_MEMBER_LOCALE_FIELD_ID,
    universalIdentifier: WORKSPACE_MEMBER_LOCALE_FIELD_ID,
    name: 'locale',
    type: FieldMetadataType.TEXT,
    objectMetadataId: WORKSPACE_MEMBER_OBJECT_ID,
  },
  {
    id: WORKSPACE_MEMBER_TEAM_FIELD_ID,
    universalIdentifier: WORKSPACE_MEMBER_TEAM_FIELD_ID,
    name: 'team',
    type: FieldMetadataType.SELECT,
    objectMetadataId: WORKSPACE_MEMBER_OBJECT_ID,
    options: [
      { value: 'OPEN', label: 'Open' },
      { value: 'SALES', label: 'Sales' },
    ],
  },
]) as unknown as FlatEntityMaps<FlatFieldMetadata>;

const buildPredicate = (
  id: string,
  roleId: string,
  predicate: Record<string, unknown>,
) => ({
  id,
  universalIdentifier: id,
  roleId,
  objectMetadataId: OBJECT_ID,
  fieldMetadataId: FIELD_ID,
  operand: 'CONTAINS',
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
    operand: 'IS',
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
]) as unknown as FlatRowLevelPermissionPredicateMaps;

const buildPredicateGroup = (
  id: string,
  roleId: string,
  logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator,
  parentRowLevelPermissionPredicateGroupId: string | null = null,
) => ({
  id,
  universalIdentifier: id,
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
]) as unknown as FlatRowLevelPermissionPredicateGroupMaps;

const buildWorkspaceMember = (workspaceMember: Record<string, unknown>) =>
  ({
    id: 'workspace-member-1',
    ...workspaceMember,
  }) as unknown as UserWorkspaceAuthContext['workspaceMember'];

const build = (
  roleIds: string[],
  workspaceMember?: UserWorkspaceAuthContext['workspaceMember'],
) =>
  buildRowLevelPermissionRecordFilter({
    flatRowLevelPermissionPredicateMaps,
    flatRowLevelPermissionPredicateGroupMaps,
    flatFieldMetadataMaps,
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
