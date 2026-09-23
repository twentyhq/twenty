import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import {
  type ObjectPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { canRolesUpdateField } from 'src/engine/metadata-modules/permissions/utils/can-roles-update-field.util';

describe('canRolesUpdateField', () => {
  const objectMetadataId = 'object-1';
  const fieldMetadataId = 'field-1';
  const userRoleId = 'user-role';
  const applicationRoleId = 'application-role';

  const customObject = {
    id: objectMetadataId,
    isSystem: false,
    universalIdentifier: 'custom-object-universal-identifier',
  } as FlatObjectMetadata;

  const systemObject = {
    id: objectMetadataId,
    isSystem: true,
    universalIdentifier: STANDARD_OBJECTS.attachment.universalIdentifier,
  } as FlatObjectMetadata;

  const workspaceMemberObject = {
    id: objectMetadataId,
    isSystem: true,
    universalIdentifier: STANDARD_OBJECTS.workspaceMember.universalIdentifier,
  } as FlatObjectMetadata;

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

  const canUpdate = ({
    roleIds = [userRoleId, applicationRoleId],
    rolesPermissions,
    objectMetadata = customObject,
  }: {
    roleIds?: string[];
    rolesPermissions: ObjectsPermissionsByRoleId;
    objectMetadata?: FlatObjectMetadata;
  }) =>
    canRolesUpdateField({
      roleIds,
      rolesPermissions,
      objectMetadata,
      fieldMetadataId,
    });

  it('should allow when every role can update the object', () => {
    expect(
      canUpdate({
        rolesPermissions: {
          [userRoleId]: { [objectMetadataId]: buildObjectPermissions() },
          [applicationRoleId]: {
            [objectMetadataId]: buildObjectPermissions(),
          },
        },
      }),
    ).toBe(true);
  });

  it('should refuse when the application role cannot update the object although the user role can', () => {
    expect(
      canUpdate({
        rolesPermissions: {
          [userRoleId]: { [objectMetadataId]: buildObjectPermissions() },
          [applicationRoleId]: {
            [objectMetadataId]: buildObjectPermissions({
              canUpdateObjectRecords: false,
            }),
          },
        },
      }),
    ).toBe(false);
  });

  it('should refuse when the user role cannot update the object although the application role can', () => {
    expect(
      canUpdate({
        rolesPermissions: {
          [userRoleId]: {
            [objectMetadataId]: buildObjectPermissions({
              canUpdateObjectRecords: false,
            }),
          },
          [applicationRoleId]: {
            [objectMetadataId]: buildObjectPermissions(),
          },
        },
      }),
    ).toBe(false);
  });

  it('should refuse when a role restricts updates on the field', () => {
    expect(
      canUpdate({
        rolesPermissions: {
          [userRoleId]: { [objectMetadataId]: buildObjectPermissions() },
          [applicationRoleId]: {
            [objectMetadataId]: buildObjectPermissions({
              restrictedFields: { [fieldMetadataId]: { canUpdate: false } },
            }),
          },
        },
      }),
    ).toBe(false);
  });

  it('should refuse an object a role does not know', () => {
    expect(
      canUpdate({
        rolesPermissions: {
          [userRoleId]: { [objectMetadataId]: buildObjectPermissions() },
          [applicationRoleId]: { 'other-object': buildObjectPermissions() },
        },
      }),
    ).toBe(false);
  });

  it('should exempt a system object the same way the attach step does', () => {
    expect(
      canUpdate({
        rolesPermissions: {
          [userRoleId]: {},
          [applicationRoleId]: {},
        },
        objectMetadata: systemObject,
      }),
    ).toBe(true);
  });

  it('should keep requiring update permission on the workspace member object', () => {
    expect(
      canUpdate({
        rolesPermissions: {
          [userRoleId]: { [objectMetadataId]: buildObjectPermissions() },
          [applicationRoleId]: {
            [objectMetadataId]: buildObjectPermissions({
              canUpdateObjectRecords: false,
            }),
          },
        },
        objectMetadata: workspaceMemberObject,
      }),
    ).toBe(false);
  });

  it('should refuse when no role could be resolved', () => {
    expect(
      canUpdate({
        roleIds: [],
        rolesPermissions: {
          [userRoleId]: { [objectMetadataId]: buildObjectPermissions() },
        },
        objectMetadata: systemObject,
      }),
    ).toBe(false);
  });
});
