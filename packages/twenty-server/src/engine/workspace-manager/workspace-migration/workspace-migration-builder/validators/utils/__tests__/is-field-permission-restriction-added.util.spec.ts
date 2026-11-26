import { isFieldPermissionRestrictionAdded } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/is-field-permission-restriction-added.util';

const UNREADABLE_FIELD_PERMISSION = {
  roleUniversalIdentifier: 'role',
  objectMetadataUniversalIdentifier: 'company',
  fieldMetadataUniversalIdentifier: 'name',
  canReadFieldValue: false,
  canUpdateFieldValue: false,
};

describe('isFieldPermissionRestrictionAdded', () => {
  it.each([
    {
      title: 'lifts the read restriction',
      update: { canReadFieldValue: true },
    },
    {
      title: 'lifts both restrictions',
      update: { canReadFieldValue: true, canUpdateFieldValue: true },
    },
    {
      title: 'restates an unchanged property',
      update: { canReadFieldValue: false, canUpdateFieldValue: true },
    },
  ])('accepts an update that $title', ({ update }) => {
    expect(
      isFieldPermissionRestrictionAdded({
        existingFlatFieldPermission: UNREADABLE_FIELD_PERMISSION,
        flatEntityUpdate: update,
      }),
    ).toBe(false);
  });

  it.each([
    {
      title: 'moves the restriction to another field',
      update: { fieldMetadataUniversalIdentifier: 'domainName' },
    },
    {
      title: 'moves the restriction to another object',
      update: { objectMetadataUniversalIdentifier: 'person' },
    },
    {
      title: 'moves the restriction to another role',
      update: { roleUniversalIdentifier: 'other-role' },
    },
    {
      title: 'lifts one restriction while moving the other',
      update: {
        canReadFieldValue: true,
        fieldMetadataUniversalIdentifier: 'domainName',
      },
    },
  ])('refuses an update that $title', ({ update }) => {
    expect(
      isFieldPermissionRestrictionAdded({
        existingFlatFieldPermission: UNREADABLE_FIELD_PERMISSION,
        flatEntityUpdate: update,
      }),
    ).toBe(true);
  });

  it('refuses an update that turns a grant off', () => {
    expect(
      isFieldPermissionRestrictionAdded({
        existingFlatFieldPermission: {
          ...UNREADABLE_FIELD_PERMISSION,
          canReadFieldValue: true,
          canUpdateFieldValue: true,
        },
        flatEntityUpdate: { canUpdateFieldValue: false },
      }),
    ).toBe(true);
  });

  it('accepts moving a permission that restricts nothing', () => {
    expect(
      isFieldPermissionRestrictionAdded({
        existingFlatFieldPermission: {
          ...UNREADABLE_FIELD_PERMISSION,
          canReadFieldValue: true,
          canUpdateFieldValue: true,
        },
        flatEntityUpdate: { fieldMetadataUniversalIdentifier: 'domainName' },
      }),
    ).toBe(false);
  });
});
