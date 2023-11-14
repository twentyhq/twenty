import { addActivityTargetTable } from 'src/metadata/tenant-migration/migrations/1697618015-addActivityTargetTable';
import { addActivityTable } from 'src/metadata/tenant-migration/migrations/1697618016-addActivityTable';
import { addApiKeyTable } from 'src/metadata/tenant-migration/migrations/1697618017-addApiKeyTable';
import { addAttachmentTable } from 'src/metadata/tenant-migration/migrations/1697618018-addAttachmentTable';
import { addCommentTable } from 'src/metadata/tenant-migration/migrations/1697618019-addCommentTable';
import { addFavoriteTable } from 'src/metadata/tenant-migration/migrations/1697618020-addFavoriteTable';
import { addOpportunityTable } from 'src/metadata/tenant-migration/migrations/1697618021-addOpportunityTable';
import { addPersonTable } from 'src/metadata/tenant-migration/migrations/1697618022-addPersonTable';
import { addPipelineStepTable } from 'src/metadata/tenant-migration/migrations/1697618023-addPipelineStepTable';
import { addWebhookTable } from 'src/metadata/tenant-migration/migrations/1697618024-addWebhookTable';
import { addWorkspaceMemberSettingTable } from 'src/metadata/tenant-migration/migrations/1697618025-addWorkspaceMemberSettingTable';
import { addWorkspaceMemberTable } from 'src/metadata/tenant-migration/migrations/1697618026-addWorspaceMemberTable';
import { addCompanyRelations } from 'src/metadata/tenant-migration/migrations/1697618027-addCompanyRelations';
import { addAttachmentRelations } from 'src/metadata/tenant-migration/migrations/1697618028-addAttachmentRelations';
import { addPersonRelations } from 'src/metadata/tenant-migration/migrations/1697618029-addPersonRelations';
import { addFavoriteRelations } from 'src/metadata/tenant-migration/migrations/1697618030-addFavoriteRelations';
import { addActivityTargetRelations } from 'src/metadata/tenant-migration/migrations/1697618032-addActivityTargetRelations';
import { addActivityRelations } from 'src/metadata/tenant-migration/migrations/1697618033-addActivityRelations';
import { addCommentRelations } from 'src/metadata/tenant-migration/migrations/1697618034-addCommentRelations';
import { addOpportunityRelations } from 'src/metadata/tenant-migration/migrations/1697618031-addOpportunityRelations';
import { addWorkspaceMemberSettingRelations } from 'src/metadata/tenant-migration/migrations/1697618035-addWorkspaceMemberSettingRelations';
import { addWorkspaceMemberRelations } from 'src/metadata/tenant-migration/migrations/1697618036-addWorkspaceMemberRelations';

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

  '1697618015-addActivityTargetTable': addActivityTargetTable,
  '1697618016-addActivityTable': addActivityTable,
  '1697618017-addApiKeyTable': addApiKeyTable,
  '1697618018-addAttachmentTable': addAttachmentTable,
  '1697618019-addCommentTable': addCommentTable,
  '1697618020-addFavoriteTable': addFavoriteTable,
  '1697618021-addOpportunityTable': addOpportunityTable,
  '1697618022-addPersonTable': addPersonTable,
  '1697618023-addPipelineStepTable': addPipelineStepTable,
  '1697618024-addWebhookTable': addWebhookTable,
  '1697618025-addWorkspaceMemberSettingTable': addWorkspaceMemberSettingTable,
  '1697618026-addWorkspaceMemberTable': addWorkspaceMemberTable,
  '1697618027-addCompanyRelations': addCompanyRelations,
  '1697618028-addAttachmentRelations': addAttachmentRelations,
  '1697618029-addPersonRelations': addPersonRelations,
  '1697618030-addFavoriteRelations': addFavoriteRelations,
  '1697618031-addOpportunitiesRelations': addOpportunityRelations,
  '1697618032-addActivityTargetRelations': addActivityTargetRelations,
  '1697618033-addActivityRelations': addActivityRelations,
  '1697618034-addCommentRelations': addCommentRelations,
  '1697618035-addWorkspaceMemberSettingRelations':
    addWorkspaceMemberSettingRelations,
  '1697618036-addWorkspaceMemberRelations': addWorkspaceMemberRelations,
};
