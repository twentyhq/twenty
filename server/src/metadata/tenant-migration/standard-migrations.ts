import { addCompanyTable } from './migrations/1697618009-addCompanyTable';
import { addViewTable } from './migrations/1697618011-addViewTable';
import { addViewFieldTable } from './migrations/1697618012-addViewFieldTable';
import { addViewFilterTable } from './migrations/1697618013-addViewFilterTable';
import { addViewSortTable } from './migrations/1697618014-addViewSortTable';

// TODO: read the folder and return all migrations
export const standardMigrations = {
  '1697618009-addCompanyTable': addCompanyTable,
  '1697618011-addViewTable': addViewTable,
  '1697618012-addViewFieldTable': addViewFieldTable,
  '1697618013-addViewFilterTable': addViewFilterTable,
  '1697618014-addViewSortTable': addViewSortTable,
};
