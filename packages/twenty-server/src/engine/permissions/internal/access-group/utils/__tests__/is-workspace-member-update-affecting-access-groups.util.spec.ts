import { FieldMetadataType } from 'twenty-shared/types';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatRowLevelPermissionPredicateMaps } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate-maps.type';
import { isWorkspaceMemberUpdateAffectingAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-workspace-member-update-affecting-access-groups.util';

const FIELD_ID = 'team-field-id';

const flatFieldMetadataMaps = {
  byId: {
    [FIELD_ID]: {
      id: FIELD_ID,
      name: 'team',
      type: FieldMetadataType.RELATION,
    },
  },
  byUniversalIdentifier: {
    [FIELD_ID]: {
      id: FIELD_ID,
      name: 'team',
      type: FieldMetadataType.RELATION,
    },
  },
  universalIdentifierById: { [FIELD_ID]: FIELD_ID },
  universalIdentifiersByApplicationId: {},
} as unknown as FlatEntityMaps<OrmFlatFieldMetadata>;

const buildPredicateMaps = (
  predicate: Record<string, unknown>,
): FlatRowLevelPermissionPredicateMaps =>
  ({
    byUniversalIdentifier: { predicate },
  }) as unknown as FlatRowLevelPermissionPredicateMaps;

const isAffecting = (
  updatedFields: string[],
  predicate: Record<string, unknown> = {
    workspaceMemberFieldMetadataId: FIELD_ID,
    deletedAt: null,
  },
) =>
  isWorkspaceMemberUpdateAffectingAccessGroups({
    updatedFields,
    flatRowLevelPermissionPredicateMaps: buildPredicateMaps(predicate),
    flatFieldMetadataMaps,
  });

describe('isWorkspaceMemberUpdateAffectingAccessGroups', () => {
  it('should be true when a rule reads the changed field or its join column', () => {
    expect(isAffecting(['team'])).toBe(true);
    expect(isAffecting(['locale', 'teamId'])).toBe(true);
  });

  it('should be false when no rule reads a changed field', () => {
    expect(isAffecting(['locale'])).toBe(false);
  });

  it('should ignore deleted predicates and predicates without a member field', () => {
    expect(
      isAffecting(['team'], {
        workspaceMemberFieldMetadataId: FIELD_ID,
        deletedAt: 'now',
      }),
    ).toBe(false);
    expect(
      isAffecting(['team'], {
        workspaceMemberFieldMetadataId: null,
        deletedAt: null,
      }),
    ).toBe(false);
  });
});
