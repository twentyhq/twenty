import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  FieldMetadataType,
  MetadataWritability,
  type ObjectPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type OrmFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/orm-flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { PermissionsException } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { assertAuthContextCanUpdateFieldOrThrow } from 'src/engine/metadata-modules/permissions/utils/assert-auth-context-can-update-field-or-throw.util';

const WORKSPACE = { id: 'workspace-1' };
const OBJECT_METADATA_ID = 'object-1';
const FIELD_METADATA_ID = 'field-1';
const USER_WORKSPACE_ID = 'user-workspace-1';
const USER_ROLE_ID = 'user-role';
const APPLICATION_ROLE_ID = 'application-role';
const CALLING_APPLICATION_ID = 'calling-application';
const OWNING_APPLICATION_ID = 'owning-application';

const buildObjectMetadata = (
  overrides: Partial<FlatObjectMetadata> = {},
): FlatObjectMetadata =>
  ({
    id: OBJECT_METADATA_ID,
    universalIdentifier: 'object-universal-identifier',
    nameSingular: 'uploadHolder',
    isSystem: false,
    writability: MetadataWritability.OPEN,
    applicationId: OWNING_APPLICATION_ID,
    fieldIds: [FIELD_METADATA_ID],
    ...overrides,
  }) as FlatObjectMetadata;

const buildFieldMetadata = (
  overrides: Partial<OrmFlatFieldMetadata> = {},
): OrmFlatFieldMetadata =>
  ({
    id: FIELD_METADATA_ID,
    universalIdentifier: 'field-universal-identifier',
    name: 'documents',
    type: FieldMetadataType.FILES,
    objectMetadataId: OBJECT_METADATA_ID,
    writability: MetadataWritability.OPEN,
    applicationId: OWNING_APPLICATION_ID,
    settings: null,
    ...overrides,
  }) as OrmFlatFieldMetadata;

const buildFlatEntityMaps = <
  TFlatEntity extends { id: string; universalIdentifier: string },
>(
  flatEntities: TFlatEntity[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.id,
      flatEntity.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildObjectPermissions = (
  overrides: Partial<ObjectPermissions> = {},
): ObjectPermissions => ({
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: false,
  canDestroyObjectRecords: false,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
  ...overrides,
});

const buildApplicationActingForUserContext = (): WorkspaceAuthContext =>
  ({
    type: 'user',
    workspace: WORKSPACE,
    userWorkspaceId: USER_WORKSPACE_ID,
    user: { id: 'user-1' },
    workspaceMemberId: 'workspace-member-1',
    workspaceMember: { id: 'workspace-member-1' },
    application: {
      id: CALLING_APPLICATION_ID,
      defaultRoleId: APPLICATION_ROLE_ID,
    },
  }) as unknown as WorkspaceAuthContext;

const buildApplicationContext = (
  defaultRoleId: string | null,
): WorkspaceAuthContext =>
  ({
    type: 'application',
    workspace: WORKSPACE,
    application: { id: CALLING_APPLICATION_ID, defaultRoleId },
  }) as unknown as WorkspaceAuthContext;

const bothRolesCanUpdate: ObjectsPermissionsByRoleId = {
  [USER_ROLE_ID]: { [OBJECT_METADATA_ID]: buildObjectPermissions() },
  [APPLICATION_ROLE_ID]: { [OBJECT_METADATA_ID]: buildObjectPermissions() },
};

const assertCanUpdate = ({
  authContext = buildApplicationActingForUserContext(),
  rolesPermissions = bothRolesCanUpdate,
  objectMetadata = buildObjectMetadata(),
  fieldMetadata = buildFieldMetadata(),
  fieldMetadataId = FIELD_METADATA_ID,
}: {
  authContext?: WorkspaceAuthContext;
  rolesPermissions?: ObjectsPermissionsByRoleId;
  objectMetadata?: FlatObjectMetadata;
  fieldMetadata?: OrmFlatFieldMetadata;
  fieldMetadataId?: string;
} = {}) =>
  assertAuthContextCanUpdateFieldOrThrow({
    authContext,
    fieldMetadataId,
    rolesPermissions,
    flatObjectMetadataMaps: buildFlatEntityMaps([
      objectMetadata,
    ]) as unknown as FlatEntityMaps<FlatObjectMetadata>,
    flatFieldMetadataMaps: buildFlatEntityMaps([
      fieldMetadata,
    ]) as unknown as FlatEntityMaps<OrmFlatFieldMetadata>,
    userWorkspaceRoleMap: { [USER_WORKSPACE_ID]: USER_ROLE_ID },
    apiKeyRoleMap: {},
  });

describe('assertAuthContextCanUpdateFieldOrThrow', () => {
  it('should allow an application acting for a user when both roles can update the object', () => {
    expect(() => assertCanUpdate()).not.toThrow();
  });

  it('should refuse when the application role cannot update the object although the user role can', () => {
    expect(() =>
      assertCanUpdate({
        rolesPermissions: {
          ...bothRolesCanUpdate,
          [APPLICATION_ROLE_ID]: {
            [OBJECT_METADATA_ID]: buildObjectPermissions({
              canUpdateObjectRecords: false,
            }),
          },
        },
      }),
    ).toThrow(PermissionsException);
  });

  it('should refuse when the user role cannot update the object although the application role can', () => {
    expect(() =>
      assertCanUpdate({
        rolesPermissions: {
          ...bothRolesCanUpdate,
          [USER_ROLE_ID]: {
            [OBJECT_METADATA_ID]: buildObjectPermissions({
              canUpdateObjectRecords: false,
            }),
          },
        },
      }),
    ).toThrow(PermissionsException);
  });

  it('should evaluate an application acting on its own against its role alone', () => {
    expect(() =>
      assertCanUpdate({
        authContext: buildApplicationContext(APPLICATION_ROLE_ID),
        rolesPermissions: {
          [APPLICATION_ROLE_ID]: {
            [OBJECT_METADATA_ID]: buildObjectPermissions(),
          },
        },
      }),
    ).not.toThrow();
  });

  it('should refuse an application acting on its own that declares no role', () => {
    expect(() =>
      assertCanUpdate({ authContext: buildApplicationContext(null) }),
    ).toThrow(PermissionsException);
  });

  it('should refuse when a role restricts updates on the field', () => {
    expect(() =>
      assertCanUpdate({
        rolesPermissions: {
          ...bothRolesCanUpdate,
          [APPLICATION_ROLE_ID]: {
            [OBJECT_METADATA_ID]: buildObjectPermissions({
              restrictedFields: {
                [FIELD_METADATA_ID]: { canRead: null, canUpdate: false },
              },
            }),
          },
        },
      }),
    ).toThrow(PermissionsException);
  });

  it('should enforce a role that denies updates on a system object like the attach step does', () => {
    expect(() =>
      assertCanUpdate({
        rolesPermissions: {
          ...bothRolesCanUpdate,
          [APPLICATION_ROLE_ID]: {
            [OBJECT_METADATA_ID]: buildObjectPermissions({
              canUpdateObjectRecords: false,
            }),
          },
        },
        objectMetadata: buildObjectMetadata({
          isSystem: true,
          universalIdentifier: STANDARD_OBJECTS.attachment.universalIdentifier,
        }),
      }),
    ).toThrow(PermissionsException);
  });

  it('should refuse a field only its owning application may write', () => {
    expect(() =>
      assertCanUpdate({
        fieldMetadata: buildFieldMetadata({
          writability: MetadataWritability.APPLICATION,
        }),
      }),
    ).toThrow(PermissionsException);
  });

  it('should let the owning application write a field reserved to it', () => {
    expect(() =>
      assertCanUpdate({
        fieldMetadata: buildFieldMetadata({
          writability: MetadataWritability.APPLICATION,
          applicationId: CALLING_APPLICATION_ID,
        }),
      }),
    ).not.toThrow();
  });

  it('should refuse an object only the platform may write', () => {
    expect(() =>
      assertCanUpdate({
        objectMetadata: buildObjectMetadata({
          writability: MetadataWritability.SYSTEM,
        }),
      }),
    ).toThrow(PermissionsException);
  });

  it('should refuse an unknown field', () => {
    expect(() => assertCanUpdate({ fieldMetadataId: 'unknown-field' })).toThrow(
      PermissionsException,
    );
  });

  it('should not restrict a system context', () => {
    expect(() =>
      assertCanUpdate({
        authContext: {
          type: 'system',
          workspace: WORKSPACE,
        } as unknown as WorkspaceAuthContext,
        rolesPermissions: {},
      }),
    ).not.toThrow();
  });
});
