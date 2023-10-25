import { addCompanyTable } from './migrations/1697618009-addCompanyTable';
import { updateCompanyTable } from './migrations/1698229753-updateCompanyTable';
import { addUserTable } from './migrations/1698230772-addUserTable';

// TODO: read the folder and return all migrations
export const standardMigrations = {
  '1697618009-addCompanyTable': addCompanyTable,
  '1698229753-updateCompanyTable': updateCompanyTable,
  '1698230772-addUserTable': addUserTable,
};
