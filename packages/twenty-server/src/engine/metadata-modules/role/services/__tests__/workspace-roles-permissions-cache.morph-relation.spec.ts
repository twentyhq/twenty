import { FieldMetadataType } from 'twenty-shared/types';

import { WorkspaceRolesPermissionsCacheService } from 'src/engine/metadata-modules/role/services/workspace-roles-permissions-cache.service';

const OBJECT_ID = 'noteTarget';
const HEAD_ID = 'target';
const PERSON_TARGET_ID = 'targetPerson';
const COMPANY_TARGET_ID = 'targetCompany';

const morphField = (id: string, universalIdentifier: string) => ({
  id,
  universalIdentifier,
  morphId: HEAD_ID,
  type: FieldMetadataType.MORPH_RELATION,
});

const fieldPermission = (
  fieldMetadataId: string,
  {
    canRead = null,
    canUpdate = null,
  }: { canRead?: boolean | null; canUpdate?: boolean | null },
) => ({
  objectMetadataId: OBJECT_ID,
  fieldMetadataId,
  canReadFieldValue: canRead,
  canUpdateFieldValue: canUpdate,
});

const computeRestrictedFields = (
  fieldPermissions: ReturnType<typeof fieldPermission>[],
) =>
  new WorkspaceRolesPermissionsCacheService().computeForCache({
    workspaceId: 'workspace',
    rows: {
      role: [{ id: 'role' }],
      objectMetadata: [
        {
          id: OBJECT_ID,
          isSystem: false,
          universalIdentifier: OBJECT_ID,
          labelIdentifierFieldMetadataId: 'name',
        },
      ],
      objectPermission: { byRoleId: new Map() },
      rolePermissionFlag: { byRoleId: new Map() },
      permissionFlag: [],
      fieldPermission: { byRoleId: new Map([['role', fieldPermissions]]) },
      rowLevelPermissionPredicate: { byRoleId: new Map() },
      rowLevelPermissionPredicateGroup: { byRoleId: new Map() },
      fieldMetadata: [
        morphField(HEAD_ID, HEAD_ID),
        morphField(PERSON_TARGET_ID, 'target-person-uid'),
        morphField(COMPANY_TARGET_ID, 'target-company-uid'),
      ],
    },
  } as never).role[OBJECT_ID].restrictedFields;

describe('Morph relation field permissions', () => {
  it('applies a head permission to every target column', () => {
    expect(
      computeRestrictedFields([fieldPermission(HEAD_ID, { canRead: false })]),
    ).toEqual({
      [HEAD_ID]: { canRead: false, canUpdate: null },
      [PERSON_TARGET_ID]: { canRead: false, canUpdate: null },
      [COMPANY_TARGET_ID]: { canRead: false, canUpdate: null },
    });
  });

  it('lets neither a head row nor a target row weaken the other', () => {
    expect(
      computeRestrictedFields([
        fieldPermission(PERSON_TARGET_ID, { canUpdate: false }),
        fieldPermission(HEAD_ID, { canRead: false }),
      ])[PERSON_TARGET_ID],
    ).toEqual({ canRead: false, canUpdate: false });
  });

  it('keeps a target permission that has no head permission', () => {
    expect(
      computeRestrictedFields([
        fieldPermission(COMPANY_TARGET_ID, { canRead: false }),
      ]),
    ).toEqual({ [COMPANY_TARGET_ID]: { canRead: false, canUpdate: null } });
  });
});
