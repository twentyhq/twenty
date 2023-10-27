import { addCompanyTable } from './migrations/1697618009-addCompanyTable';
import { addPeopleTable } from './migrations/1697618010-addPeopleTable';

// TODO: read the folder and return all migrations
export const standardMigrations = {
  '1697618009-addCompanyTable': addCompanyTable,
  '1697618010-addPeopleTable': addPeopleTable,
};
