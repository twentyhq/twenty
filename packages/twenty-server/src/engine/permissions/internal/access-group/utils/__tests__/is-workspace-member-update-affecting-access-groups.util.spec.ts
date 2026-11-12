import {
  FieldMetadataType,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';

import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { isWorkspaceMemberUpdateAffectingAccessGroups } from 'src/engine/permissions/internal/access-group/utils/is-workspace-member-update-affecting-access-groups.util';

const FIELD_ID = 'team-field-id';

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

const isAffecting = ({
  updatedFields,
  workspaceMemberFieldMetadataId = FIELD_ID,
}: {
  updatedFields: string[];
  workspaceMemberFieldMetadataId?: string | null;
}) =>
  isWorkspaceMemberUpdateAffectingAccessGroups({
    updatedFields,
    rolesPermissions: {
      'role-id': {
        canReadAllRecords: false,
        canUpdateAllRecords: false,
        canSoftDeleteAllRecords: false,
        canDestroyAllRecords: false,
        objects: {
          'object-id': {
            canCreateAllRecords: false,
            canReadAllRecords: false,
            canUpdateAllRecords: false,
            canSoftDeleteAllRecords: false,
            canDestroyAllRecords: false,
            unreadableFields: [],
            uneditableFields: [],
            rowLevelRecordsPermissions: [
              {
                ruleId: 'rule-id',
                canCreateRecords: true,
                canReadRecords: true,
                canUpdateRecords: true,
                canSoftDeleteRecords: true,
                canDestroyRecords: true,
                predicateGroups: [],
                predicates: [
                  {
                    id: 'predicate-id',
                    roleId: 'role-id',
                    objectMetadataId: 'object-id',
                    fieldMetadataId: 'field-id',
                    relationFieldMetadataId: null,
                    rowLevelPermissionPredicateGroupId: null,
                    operand: RowLevelPermissionPredicateOperand.IS,
                    value: null,
                    subFieldName: null,
                    workspaceMemberFieldMetadataId,
                    workspaceMemberSubFieldName: null,
                  },
                ],
                unreadableFields: [],
                uneditableFields: [],
              },
            ],
          },
        },
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

  it('should ignore predicates without a member field', () => {
    expect(
      isAffecting({
        updatedFields: ['team'],
        workspaceMemberFieldMetadataId: null,
      }),
    ).toBe(false);
  });
});
