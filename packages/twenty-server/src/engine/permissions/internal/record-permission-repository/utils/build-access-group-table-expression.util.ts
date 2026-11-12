/* @license Enterprise */

import { buildWorkspaceTableExpression } from 'src/engine/permissions/internal/record-permission-repository/utils/build-workspace-table-expression.util';

export const buildAccessGroupTableExpression = (workspaceId: string): string =>
  buildWorkspaceTableExpression({ workspaceId, tableName: 'accessGroup' });
