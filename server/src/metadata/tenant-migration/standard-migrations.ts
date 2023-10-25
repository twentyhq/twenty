import { addCompanyTable } from './migrations/1697618009-addCompanyTable';
import { updateCompanyTable } from './migrations/1698229753-updateCompanyTable';
import { addUserTable } from './migrations/1698230772-addUserTable';
import { addUserSettingsTable } from './migrations/1698232282-addUserSettingsTable';
import { addWorkspaceTable } from './migrations/1698232939-addWorkspaceTable';
import { addWorkspaceMemberTable } from './migrations/1698233517-addWorkspaceMemberTable';
import { addPersonTable } from './migrations/1698234333-addPersonTable';
import { addRefreshTokensTable } from './migrations/1698234996-addRefreshTokenTable';

// TODO: read the folder and return all migrations
export const standardMigrations = {
  '1697618009-addCompanyTable': addCompanyTable,
  '1698229753-updateCompanyTable': updateCompanyTable,
  '1698230772-addUserTable': addUserTable,
  '1698232282-addUserSettingsTable': addUserSettingsTable,
  '1698232939-addWorkspaceTable': addWorkspaceTable,
  '1698233517-addWorkspaceMemberTable': addWorkspaceMemberTable,
  '1698234333-addPersonTable': addPersonTable,
  '1698234996-addRefreshTokenTable': addRefreshTokensTable,
};
