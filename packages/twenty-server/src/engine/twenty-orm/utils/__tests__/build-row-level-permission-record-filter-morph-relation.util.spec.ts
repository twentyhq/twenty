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
const RELATION_FIELD_ID = 'relation-field-1';
const MORPH_RELATION_FIELD_ID = 'morph-relation-field-1';
const ROLE_ID = 'role-1';
const SELECTED_RECORD_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const buildMaps = <TEntity extends { id: string; universalIdentifier: string }>(
  entities: TEntity[],
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
  nameSingular: 'attachment',
  namePlural: 'attachments',
  fieldIds: [RELATION_FIELD_ID, MORPH_RELATION_FIELD_ID],
  fieldUniversalIdentifiers: [RELATION_FIELD_ID, MORPH_RELATION_FIELD_ID],
} as unknown as FlatObjectMetadata;

const flatFieldMetadataMaps = buildMaps([
  {
    id: RELATION_FIELD_ID,
    universalIdentifier: RELATION_FIELD_ID,
    name: 'owner',
    type: FieldMetadataType.RELATION,
    objectMetadataId: OBJECT_ID,
  },
  {
    id: MORPH_RELATION_FIELD_ID,
    universalIdentifier: MORPH_RELATION_FIELD_ID,
    name: 'target',
    type: FieldMetadataType.MORPH_RELATION,
    objectMetadataId: OBJECT_ID,
  },
]) as unknown as FlatEntityMaps<FlatFieldMetadata>;

const buildPredicateMaps = (fieldMetadataId: string) =>
  buildMaps([
    {
      id: 'predicate-1',
      universalIdentifier: 'predicate-1',
      roleId: ROLE_ID,
      objectMetadataId: OBJECT_ID,
      fieldMetadataId,
      operand: 'IS',
      value: JSON.stringify({ selectedRecordIds: [SELECTED_RECORD_ID] }),
      subFieldName: null,
      workspaceMemberFieldMetadataId: null,
      workspaceMemberSubFieldName: null,
      rowLevelPermissionPredicateGroupId: null,
      positionInRowLevelPermissionPredicateGroup: null,
      deletedAt: null,
    },
  ]) as unknown as FlatRowLevelPermissionPredicateMaps;

const build = (fieldMetadataId: string) =>
  buildRowLevelPermissionRecordFilter({
    flatRowLevelPermissionPredicateMaps: buildPredicateMaps(fieldMetadataId),
    flatRowLevelPermissionPredicateGroupMaps:
      createEmptyFlatEntityMaps() as unknown as FlatRowLevelPermissionPredicateGroupMaps,
    flatFieldMetadataMaps,
    objectMetadata: flatObjectMetadata,
    roleIds: [ROLE_ID],
  });

describe('buildRowLevelPermissionRecordFilter on relation predicates', () => {
  it('restricts records on a RELATION predicate', () => {
    expect(build(RELATION_FIELD_ID)).toEqual({
      ownerId: { in: [SELECTED_RECORD_ID] },
    });
  });

  // A MORPH_RELATION predicate resolves its join column by matching the morph
  // target against the current record, which row level permissions never
  // provide, so the predicate compiles to nothing and the role loses its
  // restriction entirely rather than matching no record.
  it('restricts records on a MORPH_RELATION predicate', () => {
    expect(build(MORPH_RELATION_FIELD_ID)).not.toBeNull();
  });
});
