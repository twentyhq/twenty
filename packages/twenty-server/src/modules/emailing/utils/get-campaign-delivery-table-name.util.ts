import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const getCampaignDeliveryTableName = (workspaceId: string): string =>
  `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier('campaignDelivery')}`;
