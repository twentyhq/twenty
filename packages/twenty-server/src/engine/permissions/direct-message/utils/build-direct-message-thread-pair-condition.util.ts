import { isNonEmptyString } from '@sniptt/guards';
import { doNotTranslate } from 'twenty-shared/i18n';

import {
  type PermissionsMetadataMaps,
  type SqlCondition,
} from 'src/engine/permissions/combine/types/row-access-policy.type';
import { hasDirectMessageIdentityStorage } from 'src/engine/permissions/direct-message/utils/has-direct-message-identity-storage.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const buildDirectMessageThreadPairCondition = ({
  tableAlias,
  workspaceMemberId,
  metadataMaps,
}: {
  tableAlias: string;
  workspaceMemberId?: string;
  metadataMaps: Pick<PermissionsMetadataMaps, 'featureFlagsMap'>;
}): SqlCondition => {
  const alias = escapeIdentifier(tableAlias);
  const regularConversationCondition = doNotTranslate(
    `${alias}."conversationType" IS DISTINCT FROM 'DIRECT_MESSAGE'`,
  );
  const hasIdentityStorage = hasDirectMessageIdentityStorage(
    metadataMaps.featureFlagsMap,
  );

  if (!hasIdentityStorage) {
    return { sql: regularConversationCondition, parameters: {} };
  }

  const firstMemberColumn = doNotTranslate(
    `${alias}."directMessageFirstWorkspaceMemberId"`,
  );
  const secondMemberColumn = doNotTranslate(
    `${alias}."directMessageSecondWorkspaceMemberId"`,
  );
  const regularThreadCondition = doNotTranslate(
    `(${regularConversationCondition} AND ${firstMemberColumn} IS NULL AND ${secondMemberColumn} IS NULL)`,
  );

  if (!isNonEmptyString(workspaceMemberId)) {
    return { sql: regularThreadCondition, parameters: {} };
  }

  return {
    sql: doNotTranslate(
      `(${regularThreadCondition} OR (${firstMemberColumn} IS NOT NULL AND ${secondMemberColumn} IS NOT NULL AND ${firstMemberColumn} <> ${secondMemberColumn} AND (${firstMemberColumn} = :directMessageWorkspaceMemberId OR ${secondMemberColumn} = :directMessageWorkspaceMemberId)))`,
    ),
    parameters: { directMessageWorkspaceMemberId: workspaceMemberId },
  };
};
