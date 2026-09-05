import { FieldMetadataType } from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatRowLevelPermissionPredicateGroupMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-group-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import {
  SHARING_RULE_MATCH_ALL_SQL,
  compileSharingRuleCriteriaToSql,
} from 'src/engine/record-share/utils/compile-sharing-rule-criteria-to-sql.util';

const OBJECT_ID = 'object-1';
const FIELD_ID = 'field-1';
const CRITERIA_RULE_ID = 'criteria-rule-1';
const OPEN_RULE_ID = 'open-rule-1';

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
]) as unknown as FlatEntityMaps<OrmFlatFieldMetadata>;

const flatRowLevelPermissionPredicateMaps = buildMaps([
  {
    id: 'predicate-1',
    universalIdentifier: 'predicate-1',
    roleId: null,
    sharingRuleId: CRITERIA_RULE_ID,
    objectMetadataId: OBJECT_ID,
    fieldMetadataId: FIELD_ID,
    operand: 'CONTAINS',
    value: 'visible',
    subFieldName: null,
    workspaceMemberFieldMetadataId: null,
    workspaceMemberSubFieldName: null,
    rowLevelPermissionPredicateGroupId: null,
    positionInRowLevelPermissionPredicateGroup: null,
    deletedAt: null,
  },
]) as unknown as FlatRowLevelPermissionPredicateMaps;

const flatRowLevelPermissionPredicateGroupMaps =
  createEmptyFlatEntityMaps() as unknown as FlatRowLevelPermissionPredicateGroupMaps;

const compile = (sharingRuleId: string) =>
  compileSharingRuleCriteriaToSql({
    sharingRuleId,
    tableAlias: 'r',
    objectMetadata: flatObjectMetadata,
    flatFieldMetadataMaps,
    flatRowLevelPermissionPredicateMaps,
    flatRowLevelPermissionPredicateGroupMaps,
  });

describe('compileSharingRuleCriteriaToSql', () => {
  it('should match every record for a rule without criteria', () => {
    expect(compile(OPEN_RULE_ID)).toEqual({
      sql: SHARING_RULE_MATCH_ALL_SQL,
      parameters: {},
    });
  });

  it('should render the criteria of a rule against the given alias', () => {
    const { sql, parameters } = compile(CRITERIA_RULE_ID);

    expect(sql).toMatch(/^\("r"\."name"::text ILIKE :name[0-9a-f]{10}\)$/);
    expect(Object.values(parameters)).toEqual(['%visible%']);
  });
});
