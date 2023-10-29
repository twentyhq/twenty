import { addCompanyTable } from './migrations/1697618009-addCompanyTable';
import { addPeopleTable } from './migrations/1697618010-addPeopleTable';
import { addViewTable } from './migrations/1697618011-addViewTable';
import { addViewFieldTable } from './migrations/1697618012-addViewFieldTable';

// TODO: read the folder and return all migrations
export const standardMigrations = {
  '1697618009-addCompanyTable': addCompanyTable,
  '1697618010-addPeopleTable': addPeopleTable,
  '1697618011-addViewTable': addViewTable,
  '1697618012-addViewFieldTable': addViewFieldTable,
};
