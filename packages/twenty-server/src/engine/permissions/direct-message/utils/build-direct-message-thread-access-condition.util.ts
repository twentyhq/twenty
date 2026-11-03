import { doNotTranslate } from 'twenty-shared/i18n';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import {
  type PermissionsRowAccessSqlRequest,
  type SqlCondition,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { buildPermissionsGrantCondition } from 'src/engine/permissions/combine/utils/build-permissions-grant-condition.util';
import { combineSqlConditions } from 'src/engine/permissions/combine/utils/combine-sql-conditions.util';
import { getPermissionsPrincipalWorkspaceMemberId } from 'src/engine/permissions/principal/utils/get-permissions-principal-workspace-member-id.util';
import { buildDirectMessageThreadPairCondition } from 'src/engine/permissions/direct-message/utils/build-direct-message-thread-pair-condition.util';

export const buildDirectMessageThreadAccessCondition = ({
  request,
  threadObjectMetadata,
  tableAlias,
}: {
  request: PermissionsRowAccessSqlRequest;
  threadObjectMetadata: FlatObjectMetadata;
  tableAlias: string;
}): SqlCondition => {
  const regularThreadCondition = buildDirectMessageThreadPairCondition({
    tableAlias,
    metadataMaps: request.metadataMaps,
  });
  const threadGrantCondition = buildPermissionsGrantCondition({
    ...request,
    flatObjectMetadata: threadObjectMetadata,
    tableAlias,
    operationType: request.operationType === 'select' ? 'select' : 'update',
    hypotheticalRecordShareAccessLevel: undefined,
  });

  if (threadGrantCondition === false) {
    return regularThreadCondition;
  }

  const pairCondition = buildDirectMessageThreadPairCondition({
    tableAlias,
    workspaceMemberId: getPermissionsPrincipalWorkspaceMemberId(
      request.principal,
    ),
    metadataMaps: request.metadataMaps,
  });

  if (threadGrantCondition === true) {
    return pairCondition;
  }

  return combineSqlConditions(
    [
      regularThreadCondition,
      combineSqlConditions([pairCondition, threadGrantCondition]),
    ],
    doNotTranslate('OR'),
  );
};
