import { addCompanyTable } from './migrations/1697618009-addCompanyTable';
import { updateCompanyTable } from './migrations/1698229753-updateCompanyTable';
import { addUserSettingsTable } from './migrations/1698232282-addUserSettingsTable';
import { addWorkspaceMemberTable } from './migrations/1698233517-addWorkspaceMemberTable';
import { addPersonTable } from './migrations/1698234333-addPersonTable';
import { addActivityTable } from './migrations/1698236977-addActivityTable';
import { addCommentTable } from './migrations/1698242641-addCommentTable';
import { addPipelineTable } from './migrations/1698243640-addPipelineTable';
import { addPipelineStageTable } from './migrations/1698244014-addPipelineStageTable';
import { addPipelineProgressTable } from './migrations/1698244460-addPipelineProgressTable';
import { addAttachmentTable } from './migrations/1698244907-addAttachmentTable';
import { addFavoriteTable } from './migrations/1698245284-addFavoriteTable';
import { addWebHookTable } from './migrations/1698250308-addWebHookTable';
import { addViewTable } from './migrations/1697618011-addViewTable';
import { addViewFieldTable } from './migrations/1697618012-addViewFieldTable';
import { addViewSortTable } from './migrations/1697618014-addViewSortTable';
import { addViewFilterTable } from './migrations/1697618013-addViewFilterTable';

// TODO: read the folder and return all migrations
export const standardMigrations = {
  '1697618009-addCompanyTable': addCompanyTable,
  '1698229753-updateCompanyTable': updateCompanyTable,
  '1698232282-addUserSettingsTable': addUserSettingsTable,
  '1698233517-addWorkspaceMemberTable': addWorkspaceMemberTable,
  '1698234333-addPersonTable': addPersonTable,
  '1698236977-addActivityTable': addActivityTable,
  '1698242641-addCommentTable': addCommentTable,
  '1698243640-addPipelineTable': addPipelineTable,
  '1698244014-addPipelineStageTable': addPipelineStageTable,
  '1698244460-addPipelineProgressTable': addPipelineProgressTable,
  '1698244907-addAttachmentTable': addAttachmentTable,
  '1698245284-addFavoriteTable': addFavoriteTable,
  '1698248037-addViewTable': addViewTable,
  '1698248505-addViewFilterTable': addViewFilterTable,
  '1698248852-addViewSortTable': addViewSortTable,
  '1698249378-addViewFieldTable': addViewFieldTable,
  '1698250308-addWebHookTable': addWebHookTable,
};
