import { type MetadataEntityPropertyName } from 'src/engine/metadata-modules/flat-entity/constant/all-entity-properties-configuration-by-metadata-name.constant';

export const FLAT_SHARING_RULE_EDITABLE_PROPERTIES = [
  'name',
  'description',
  'granteePrincipalType',
  'granteePrincipalId',
  'granteeRoleId',
  'accessLevel',
  'isActive',
] as const satisfies MetadataEntityPropertyName<'sharingRule'>[];
