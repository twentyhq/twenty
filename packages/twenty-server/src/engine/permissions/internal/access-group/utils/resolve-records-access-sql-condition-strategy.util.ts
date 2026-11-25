/* @license Enterprise */

import { type RecordsAccessSQLConditionStrategy } from 'src/engine/permissions/internal/access-group/types/records-access-sql-condition-strategy.type';
import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { isMainRoleRestrictedByRlsRule } from 'src/engine/permissions/internal/rls/utils/is-main-role-restricted-by-rls-rule.util';

export const resolveRecordsAccessSQLConditionStrategy = ({
  principals,
  metadataMaps,
  flatObjectMetadata,
}: Pick<
  PermissionsObjectAccessRequest,
  'principals' | 'metadataMaps' | 'flatObjectMetadata'
>): RecordsAccessSQLConditionStrategy =>
  isMainRoleRestrictedByRlsRule({
    principals,
    metadataMaps,
    objectMetadataId: flatObjectMetadata.id,
  })
    ? 'accessGroups'
    : 'withoutRowLevelPermissions';
