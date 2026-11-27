import { ACCESS_GROUP_IDS_COLUMN_NAME } from 'src/engine/permissions/internal/record-permission-repository/constants/access-group-column-names.constant';
import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/is-private-column-name.constant';

// Columns every object table carries for record permissions, beyond its fields
export const PERMISSION_STORAGE_COLUMN_NAMES = [
  ACCESS_GROUP_IDS_COLUMN_NAME,
  IS_PRIVATE_COLUMN_NAME,
];
