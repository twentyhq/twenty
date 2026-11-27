import { type UniversalFlatEntityUpdate } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-update.type';

const FIELD_GRANTS = ['canReadFieldValue', 'canUpdateFieldValue'];

// An installed restriction may only be lifted, not moved to another role, object or field
export const isFieldPermissionRestrictionAdded = ({
  existingFlatFieldPermission,
  flatEntityUpdate,
}: {
  existingFlatFieldPermission: UniversalFlatEntityUpdate<'fieldPermission'>;
  flatEntityUpdate: UniversalFlatEntityUpdate<'fieldPermission'>;
}): boolean => {
  const existingProperties: Record<string, unknown> =
    existingFlatFieldPermission;
  const { canReadFieldValue, canUpdateFieldValue } = {
    ...existingFlatFieldPermission,
    ...flatEntityUpdate,
  };
  const isRestricting =
    canReadFieldValue === false || canUpdateFieldValue === false;
  const isOnlyLiftingGrants = Object.entries(flatEntityUpdate)
    .filter(([property, value]) => existingProperties[property] !== value)
    .every(
      ([property, value]) => FIELD_GRANTS.includes(property) && value !== false,
    );

  return isRestricting && !isOnlyLiftingGrants;
};
