/* @license Enterprise */

import { canAllRecordsAccessOperation } from 'src/engine/permissions/internal/all-records/utils/can-all-records-access-operation.util';
import { type PermissionsRowAccessSqlRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';

export const buildAllRecordsAccessSQLCondition = (
  request: PermissionsRowAccessSqlRequest,
): boolean => canAllRecordsAccessOperation(request);
