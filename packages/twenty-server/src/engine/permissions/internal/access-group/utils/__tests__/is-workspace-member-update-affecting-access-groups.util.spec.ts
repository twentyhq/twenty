import {
  FieldMetadataType,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatRowLevelPermissionPredicate } from 'src/engine/metadata-modules/row-level-permission-predicate/types/flat-row-level-permission-predicate.type';
import { isWorkspaceMemberUpdateAffectingAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-workspace-member-update-affecting-access-groups.util';

const FIELD_ID = 'team-field-id';
const TIMESTAMP = '2026-01-01T00:00:00.000Z';

const flatFieldMetadataMaps = addFlatEntityToFlatEntityMapsOrThrow({
  flatEntity: getFlatFieldMetadataMock({
    id: FIELD_ID,
    universalIdentifier: FIELD_ID,
    objectMetadataId: 'workspace-member-object-id',
    type: FieldMetadataType.RELATION,
    name: 'team',
  }),
  flatEntityMaps: createEmptyFlatEntityMaps(),
});

const buildPredicate = (
  overrides: Pick<
    FlatRowLevelPermissionPredicate,
    'workspaceMemberFieldMetadataId' | 'deletedAt'
  >,
): FlatRowLevelPermissionPredicate => ({
  id: 'predicate-id',
  universalIdentifier: 'predicate-id',
  applicationId: 'application-id',
  applicationUniversalIdentifier: 'application-id',
  workspaceId: 'workspace-id',
  createdAt: TIMESTAMP,
  updatedAt: TIMESTAMP,
  roleId: 'role-id',
  roleUniversalIdentifier: 'role-id',
  objectMetadataId: 'object-id',
  objectMetadataUniversalIdentifier: 'object-id',
  fieldMetadataId: 'field-id',
  fieldMetadataUniversalIdentifier: 'field-id',
  relationFieldMetadataId: null,
  relationFieldMetadataUniversalIdentifier: null,
  workspaceMemberFieldMetadataUniversalIdentifier: null,
  rowLevelPermissionPredicateGroupId: null,
  rowLevelPermissionPredicateGroupUniversalIdentifier: null,
  positionInRowLevelPermissionPredicateGroup: null,
  operand: RowLevelPermissionPredicateOperand.IS,
  value: null,
  subFieldName: null,
  workspaceMemberSubFieldName: null,
  ...overrides,
});

const isAffecting = ({
  updatedFields,
  workspaceMemberFieldMetadataId = FIELD_ID,
  deletedAt = null,
}: {
  updatedFields: string[];
  workspaceMemberFieldMetadataId?: string | null;
  deletedAt?: string | null;
}) =>
  isWorkspaceMemberUpdateAffectingAccessGroups({
    updatedFields,
    flatRowLevelPermissionPredicateMaps: {
      byUniversalIdentifier: {
        predicate: buildPredicate({
          workspaceMemberFieldMetadataId,
          deletedAt,
        }),
      },
    },
    flatFieldMetadataMaps,
  });

describe('isWorkspaceMemberUpdateAffectingAccessGroups', () => {
  it('should be true when a rule reads the changed field or its join column', () => {
    expect(isAffecting({ updatedFields: ['team'] })).toBe(true);
    expect(isAffecting({ updatedFields: ['locale', 'teamId'] })).toBe(true);
  });

  it('should be false when no rule reads a changed field', () => {
    expect(isAffecting({ updatedFields: ['locale'] })).toBe(false);
  });

  it('should ignore deleted predicates and predicates without a member field', () => {
    expect(isAffecting({ updatedFields: ['team'], deletedAt: TIMESTAMP })).toBe(
      false,
    );
    expect(
      isAffecting({
        updatedFields: ['team'],
        workspaceMemberFieldMetadataId: null,
      }),
    ).toBe(false);
  });
});
