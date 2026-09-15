import {
  FieldMetadataType,
  RowLevelPermissionPredicateGroupLogicalOperator,
} from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { PermissionsExceptionCode } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { buildRowLevelPermissionRecordFilter } from 'src/engine/twenty-orm/utils/build-row-level-permission-record-filter.util';

const OBJECT_ID = 'object-1';
const FIELD_ID = 'field-1';
const USER_ROLE_ID = 'user-role-1';
const APPLICATION_ROLE_ID = 'application-role-1';
const UNRESTRICTED_ROLE_ID = 'unrestricted-role-1';
const WORKSPACE_MEMBER_FIELD_ID = 'workspace-member-field-1';

type BuildRecordFilterArgs = Parameters<
  typeof buildRowLevelPermissionRecordFilter
>[0];

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
  fieldIds: [FIELD_ID],
  fieldUniversalIdentifiers: [FIELD_ID],
} as unknown as FlatObjectMetadata;

const fieldMetadata = {
  id: FIELD_ID,
  universalIdentifier: FIELD_ID,
  name: 'name',
  type: FieldMetadataType.TEXT,
  objectMetadataId: OBJECT_ID,
};
const workspaceMemberFieldMetadata = {
  id: WORKSPACE_MEMBER_FIELD_ID,
  universalIdentifier: WORKSPACE_MEMBER_FIELD_ID,
  name: 'region',
  type: FieldMetadataType.TEXT,
  objectMetadataId: 'workspace-member-object',
};

const flatFieldMetadataMaps = buildMaps([
  fieldMetadata,
  workspaceMemberFieldMetadata,
]) as unknown as FlatEntityMaps<FlatFieldMetadata>;

const buildPredicate = (id: string, roleId: string, value: string) => ({
  id,
  universalIdentifier: id,
  roleId,
  objectMetadataId: OBJECT_ID,
  fieldMetadataId: FIELD_ID,
  operand: 'CONTAINS',
  value,
  subFieldName: null,
  workspaceMemberFieldMetadataId: null,
  workspaceMemberSubFieldName: null,
  rowLevelPermissionPredicateGroupId: null,
  positionInRowLevelPermissionPredicateGroup: null,
  deletedAt: null,
});

const flatRowLevelPermissionPredicateMaps = buildMaps([
  buildPredicate('predicate-user', USER_ROLE_ID, 'visible-to-user'),
  buildPredicate(
    'predicate-application',
    APPLICATION_ROLE_ID,
    'visible-to-application',
  ),
]) as unknown as FlatRowLevelPermissionPredicateMaps;

const flatRowLevelPermissionPredicateGroupMaps =
  createEmptyFlatEntityMaps() as unknown as FlatRowLevelPermissionPredicateGroupMaps;

const build = (
  roleIds: string[],
  overrides: Partial<BuildRecordFilterArgs> = {},
) =>
  buildRowLevelPermissionRecordFilter({
    flatRowLevelPermissionPredicateMaps,
    flatRowLevelPermissionPredicateGroupMaps,
    flatFieldMetadataMaps,
    objectMetadata: flatObjectMetadata,
    roleIds,
    ...overrides,
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

  describe('member-dependent predicates', () => {
    const memberDependentPredicate = {
      ...buildPredicate('predicate-member', USER_ROLE_ID, ''),
      workspaceMemberFieldMetadataId: WORKSPACE_MEMBER_FIELD_ID,
    };

    const buildWithMember = (
      workspaceMember: Record<string, unknown> | undefined,
      overrides: Partial<BuildRecordFilterArgs> = {},
    ) =>
      build([USER_ROLE_ID], {
        flatRowLevelPermissionPredicateMaps: buildMaps([
          memberDependentPredicate,
        ]) as unknown as FlatRowLevelPermissionPredicateMaps,
        workspaceMember:
          workspaceMember as BuildRecordFilterArgs['workspaceMember'],
        ...overrides,
      });

    const permissionDenied = expect.objectContaining({
      code: PermissionsExceptionCode.PERMISSION_DENIED,
    });

    it('should keep a valid member-dependent restriction', () => {
      expect(buildWithMember({ region: 'east' })).toEqual({
        name: { ilike: '%east%' },
      });
    });

    it.each([undefined, {}, { region: null }])(
      'should deny when the configured member value cannot resolve from %p',
      (workspaceMember) => {
        expect(() => buildWithMember(workspaceMember)).toThrow(
          permissionDenied,
        );
      },
    );

    it('should deny when the configured member relation is empty', () => {
      expect(() =>
        buildWithMember(
          { regionId: null },
          {
            flatFieldMetadataMaps: buildMaps([
              fieldMetadata,
              {
                ...workspaceMemberFieldMetadata,
                type: FieldMetadataType.RELATION,
                settings: { relationType: RelationType.MANY_TO_ONE },
              },
            ]) as unknown as FlatEntityMaps<FlatFieldMetadata>,
          },
        ),
      ).toThrow(permissionDenied);
    });

    it('should deny when the resolved value is incompatible with the target field', () => {
      expect(() =>
        buildWithMember(
          { region: 'east' },
          {
            flatFieldMetadataMaps: buildMaps([
              {
                ...fieldMetadata,
                type: FieldMetadataType.SELECT,
                options: [{ value: 'west' }],
              },
              {
                ...workspaceMemberFieldMetadata,
                type: FieldMetadataType.SELECT,
              },
            ]) as unknown as FlatEntityMaps<FlatFieldMetadata>,
          },
        ),
      ).toThrow(permissionDenied);
    });

    it.each([
      RowLevelPermissionPredicateGroupLogicalOperator.AND,
      RowLevelPermissionPredicateGroupLogicalOperator.OR,
    ])(
      'should preserve valid %s groups and deny unresolved groups',
      (operator) => {
        const groupId = 'predicate-group';
        const overrides = {
          flatRowLevelPermissionPredicateMaps: buildMaps([
            {
              ...memberDependentPredicate,
              rowLevelPermissionPredicateGroupId: groupId,
            },
            {
              ...buildPredicate('predicate-static', USER_ROLE_ID, 'static'),
              rowLevelPermissionPredicateGroupId: groupId,
            },
          ]) as unknown as FlatRowLevelPermissionPredicateMaps,
          flatRowLevelPermissionPredicateGroupMaps: buildMaps([
            {
              id: groupId,
              universalIdentifier: groupId,
              roleId: USER_ROLE_ID,
              logicalOperator: operator,
              parentRowLevelPermissionPredicateGroupId: null,
            },
          ]) as unknown as FlatRowLevelPermissionPredicateGroupMaps,
        };

        expect(buildWithMember({ region: 'east' }, overrides)).toEqual({
          [operator.toLowerCase()]: [
            { name: { ilike: '%east%' } },
            { name: { ilike: '%static%' } },
          ],
        });
        expect(() => buildWithMember(undefined, overrides)).toThrow(
          permissionDenied,
        );
      },
    );

    it('should not drop an unresolved role when another role has a valid filter', () => {
      const overrides = {
        roleIds: [APPLICATION_ROLE_ID, USER_ROLE_ID],
        flatRowLevelPermissionPredicateMaps: buildMaps([
          buildPredicate('predicate-application', APPLICATION_ROLE_ID, 'app'),
          memberDependentPredicate,
        ]) as unknown as FlatRowLevelPermissionPredicateMaps,
      };

      expect(buildWithMember({ region: 'east' }, overrides)).toEqual({
        and: [{ name: { ilike: '%app%' } }, { name: { ilike: '%east%' } }],
      });
      expect(() => buildWithMember(undefined, overrides)).toThrow(
        permissionDenied,
      );
    });
  });
});
