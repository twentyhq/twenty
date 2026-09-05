import { type ObjectRecordBaseEvent } from 'twenty-shared/database-events';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatSharingRuleMaps } from 'src/engine/metadata-modules/flat-sharing-rule/types/flat-sharing-rule-maps.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { resolveSharingRuleIdsAffectedByRecordEvents } from 'src/engine/record-share/utils/resolve-sharing-rule-ids-affected-by-record-events.util';

const OBJECT_ID = 'object-1';
const OTHER_OBJECT_ID = 'object-2';
const NAME_FIELD_ID = 'field-name';
const STAGE_FIELD_ID = 'field-stage';
const NAME_RULE_ID = 'rule-on-name';
const INACTIVE_NAME_RULE_ID = 'inactive-rule-on-name';
const OPEN_RULE_ID = 'rule-without-criteria';
const OTHER_OBJECT_RULE_ID = 'rule-on-other-object';

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

const buildSharingRule = (
  id: string,
  objectMetadataId: string,
  isActive = true,
) => ({
  id,
  universalIdentifier: id,
  objectMetadataId,
  isActive,
  deletedAt: null,
});

const buildPredicate = (
  id: string,
  sharingRuleId: string,
  fieldMetadataId: string,
) => ({
  id,
  universalIdentifier: id,
  roleId: null,
  sharingRuleId,
  objectMetadataId: OBJECT_ID,
  fieldMetadataId,
  deletedAt: null,
});

const flatSharingRuleMaps = buildMaps([
  buildSharingRule(NAME_RULE_ID, OBJECT_ID),
  buildSharingRule(INACTIVE_NAME_RULE_ID, OBJECT_ID, false),
  buildSharingRule(OPEN_RULE_ID, OBJECT_ID),
  buildSharingRule(OTHER_OBJECT_RULE_ID, OTHER_OBJECT_ID),
]) as unknown as FlatSharingRuleMaps;

const flatRowLevelPermissionPredicateMaps = buildMaps([
  buildPredicate('predicate-name', NAME_RULE_ID, NAME_FIELD_ID),
  buildPredicate('predicate-inactive', INACTIVE_NAME_RULE_ID, NAME_FIELD_ID),
]) as unknown as FlatRowLevelPermissionPredicateMaps;

const flatFieldMetadataMaps = buildMaps([
  {
    id: NAME_FIELD_ID,
    universalIdentifier: NAME_FIELD_ID,
    name: 'name',
    objectMetadataId: OBJECT_ID,
  },
  {
    id: STAGE_FIELD_ID,
    universalIdentifier: STAGE_FIELD_ID,
    name: 'stage',
    objectMetadataId: OBJECT_ID,
  },
]) as unknown as FlatEntityMaps<FlatFieldMetadata>;

const buildEvent = (updatedFields?: string[]): ObjectRecordBaseEvent => ({
  recordId: 'record-1',
  properties: { after: {}, ...(updatedFields ? { updatedFields } : {}) },
});

const resolve = (
  action: DatabaseEventAction,
  events: ObjectRecordBaseEvent[],
) =>
  resolveSharingRuleIdsAffectedByRecordEvents({
    objectMetadataId: OBJECT_ID,
    action,
    events,
    flatSharingRuleMaps,
    flatRowLevelPermissionPredicateMaps,
    flatFieldMetadataMaps,
  });

describe('resolveSharingRuleIdsAffectedByRecordEvents', () => {
  it('should affect the rules whose criteria reference a changed field', () => {
    expect(
      resolve(DatabaseEventAction.UPDATED, [buildEvent(['name'])]),
    ).toEqual([NAME_RULE_ID]);
  });

  it('should ignore a change on a field no criteria reference', () => {
    expect(
      resolve(DatabaseEventAction.UPDATED, [buildEvent(['stage'])]),
    ).toEqual([]);
  });

  it('should never affect an inactive rule', () => {
    expect(resolve(DatabaseEventAction.CREATED, [buildEvent()])).not.toContain(
      INACTIVE_NAME_RULE_ID,
    );
    expect(
      resolve(DatabaseEventAction.UPDATED, [buildEvent(['name'])]),
    ).not.toContain(INACTIVE_NAME_RULE_ID);
  });

  it('should affect every active rule of the object on creation, criteria or not', () => {
    expect(resolve(DatabaseEventAction.CREATED, [buildEvent()])).toEqual([
      NAME_RULE_ID,
      OPEN_RULE_ID,
    ]);
  });

  it('should not affect a rule without criteria on an update', () => {
    expect(
      resolve(DatabaseEventAction.UPDATED, [buildEvent(['name', 'stage'])]),
    ).not.toContain(OPEN_RULE_ID);
  });
});
