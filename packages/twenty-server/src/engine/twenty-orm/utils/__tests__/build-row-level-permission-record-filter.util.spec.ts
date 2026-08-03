import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { buildRowLevelPermissionRecordFilter } from 'src/engine/twenty-orm/utils/build-row-level-permission-record-filter.util';

const OBJECT_ID = 'object-1';
const FIELD_ID = 'field-1';
const USER_ROLE_ID = 'user-role-1';
const APPLICATION_ROLE_ID = 'application-role-1';
const UNRESTRICTED_ROLE_ID = 'unrestricted-role-1';

// The fixtures below are deliberately partial: the builder only reads a
// handful of fields, and a full FlatEntityMaps entity would be pure noise.
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

const flatFieldMetadataMaps = buildMaps([
  {
    id: FIELD_ID,
    universalIdentifier: FIELD_ID,
    name: 'name',
    type: FieldMetadataType.TEXT,
    objectMetadataId: OBJECT_ID,
  },
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

const build = (roleIds: string[]) =>
  buildRowLevelPermissionRecordFilter({
    flatRowLevelPermissionPredicateMaps,
    flatRowLevelPermissionPredicateGroupMaps,
    flatFieldMetadataMaps,
    objectMetadata: flatObjectMetadata,
    roleIds,
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

  // The bug this guards: intersecting used to drop row-level predicates
  // entirely, so an application acting as a restricted user saw every record.
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
});
