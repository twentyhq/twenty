/* @license Enterprise */

import { RECORD_SHARE_OBJECT_METADATA_NAME } from 'src/engine/permissions/internal/record-permission-repository/constants/record-share-object-metadata-name.constant';
import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';

export const buildRecordShareTableExpression = ({
  workspaceId,
}: {
  workspaceId: string;
}): string =>
  buildWorkspaceTableExpression({
    workspaceId,
    tableName: RECORD_SHARE_OBJECT_METADATA_NAME,
  });
