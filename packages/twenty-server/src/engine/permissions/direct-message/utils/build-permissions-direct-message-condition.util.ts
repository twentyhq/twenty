import { doNotTranslate } from 'twenty-shared/i18n';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import {
  type PermissionsRowAccessSqlRequest,
  type SqlCondition,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { buildDirectMessageTableExpression } from 'src/engine/permissions/direct-message/utils/build-direct-message-table-expression.util';
import { buildDirectMessageThreadAccessCondition } from 'src/engine/permissions/direct-message/utils/build-direct-message-thread-access-condition.util';
import { buildDirectMessageThreadPairCondition } from 'src/engine/permissions/direct-message/utils/build-direct-message-thread-pair-condition.util';
import { findDirectMessagePermissionObject } from 'src/engine/permissions/direct-message/utils/find-direct-message-permission-object.util';
import { isDirectMessageMessageChild } from 'src/engine/permissions/direct-message/utils/is-direct-message-message-child.util';
import { getPermissionsPrincipalWorkspaceMemberId } from 'src/engine/permissions/principal/utils/get-permissions-principal-workspace-member-id.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

const DIRECT_MESSAGE_THREAD_ALIAS = doNotTranslate(
  'directMessagePermissionThread',
);
const DIRECT_MESSAGE_MESSAGE_ALIAS = doNotTranslate(
  'directMessagePermissionMessage',
);

export const buildPermissionsDirectMessageCondition = (
  request: PermissionsRowAccessSqlRequest,
): SqlCondition | false | undefined => {
  const objectName = findDirectMessagePermissionObject(request);

  if (!isDefined(objectName)) {
    return undefined;
  }

  if (objectName === 'agentChatThread') {
    return buildDirectMessageThreadPairCondition({
      tableAlias: request.tableAlias,
      workspaceMemberId: getPermissionsPrincipalWorkspaceMemberId(
        request.principal,
      ),
      metadataMaps: request.metadataMaps,
    });
  }

  const threadObjectMetadata =
    request.metadataMaps.flatObjectMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.agentChatThread.universalIdentifier
    ];

  if (!isDefined(threadObjectMetadata)) {
    return false;
  }

  const threadTable = buildDirectMessageTableExpression({
    workspaceId: request.principal.workspaceId,
    flatObjectMetadata: threadObjectMetadata,
  });
  const threadAlias = escapeIdentifier(DIRECT_MESSAGE_THREAD_ALIAS);
  const sourceAlias = escapeIdentifier(request.tableAlias);
  const pairCondition = buildDirectMessageThreadAccessCondition({
    tableAlias: DIRECT_MESSAGE_THREAD_ALIAS,
    request,
    threadObjectMetadata,
  });
  if (!isDirectMessageMessageChild(objectName)) {
    return {
      sql: doNotTranslate(
        `EXISTS (SELECT 1 FROM ${threadTable} AS ${threadAlias} WHERE ${threadAlias}."id" = ${sourceAlias}."threadId" AND (${pairCondition.sql}))`,
      ),
      parameters: pairCondition.parameters,
    };
  }

  const messageObjectMetadata =
    request.metadataMaps.flatObjectMetadataMaps.byUniversalIdentifier[
      STANDARD_OBJECTS.agentMessage.universalIdentifier
    ];

  if (!isDefined(messageObjectMetadata)) {
    return false;
  }

  const messageTable = buildDirectMessageTableExpression({
    workspaceId: request.principal.workspaceId,
    flatObjectMetadata: messageObjectMetadata,
  });
  const messageAlias = escapeIdentifier(DIRECT_MESSAGE_MESSAGE_ALIAS);

  return {
    sql: doNotTranslate(
      `EXISTS (SELECT 1 FROM ${messageTable} AS ${messageAlias} INNER JOIN ${threadTable} AS ${threadAlias} ON ${threadAlias}."id" = ${messageAlias}."threadId" WHERE ${messageAlias}."id" = ${sourceAlias}."messageId" AND (${pairCondition.sql}))`,
    ),
    parameters: pairCondition.parameters,
  };
};
