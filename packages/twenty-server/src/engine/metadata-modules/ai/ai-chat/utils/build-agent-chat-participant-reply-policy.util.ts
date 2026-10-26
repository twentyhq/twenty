import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import {
  type RowAccessPolicy,
  type RowAccessPolicySubject,
} from 'src/engine/twenty-orm/types/row-access-policy.type';
import { isMetadataWritePermitted } from 'src/engine/twenty-orm/utils/is-metadata-write-permitted.util';
import { isObjectOperationPermitted } from 'src/engine/twenty-orm/utils/is-object-operation-permitted.util';
import { renderRowLevelPermissionFilterToSql } from 'src/engine/twenty-orm/utils/render-row-level-permission-filter-to-sql.util';

const AGENT_CHAT_REPLY_OPERATION_TYPES: ('select' | 'update')[] = [
  'select',
  'update',
];

export const buildAgentChatParticipantReplyPolicy = ({
  repository,
  subject,
  objectMetadata,
  flatFieldMetadataMaps,
  canManageSharing,
  canShareBeyondRole,
}: {
  repository: Pick<WorkspaceRepository, 'buildRowAccessPolicy'>;
  subject: RowAccessPolicySubject;
  objectMetadata: FlatObjectMetadata;
  flatFieldMetadataMaps: Parameters<
    typeof renderRowLevelPermissionFilterToSql
  >[0]['flatFieldMetadataMaps'];
  canManageSharing: boolean;
  canShareBeyondRole: boolean;
}): RowAccessPolicy => {
  const objectsPermissions = subject.objectsPermissions;

  if (!isDefined(objectsPermissions)) {
    return { kind: 'denied' };
  }

  if (!canManageSharing) {
    const policies = AGENT_CHAT_REPLY_OPERATION_TYPES.map((operationType) =>
      repository.buildRowAccessPolicy({ subject, operationType }),
    );

    if (policies.some(({ kind }) => kind === 'denied')) {
      return { kind: 'denied' };
    }

    const operands = policies.flatMap((policy) =>
      policy.kind === 'gated' ? [policy.expression] : [],
    );

    return isNonEmptyArray(operands)
      ? { kind: 'gated', expression: { kind: 'and', operands } }
      : { kind: 'open' };
  }

  if (
    !isMetadataWritePermitted({
      writability: objectMetadata.writability,
      isSystemContext: false,
      isOwningApplication: false,
    })
  ) {
    return { kind: 'denied' };
  }

  if (canShareBeyondRole) {
    return { kind: 'open' };
  }

  const canReadAndUpdate = AGENT_CHAT_REPLY_OPERATION_TYPES.every(
    (operationType) =>
      isObjectOperationPermitted({
        objectMetadata,
        operationType,
        objectsPermissions,
      }),
  );

  if (!canReadAndUpdate) {
    return { kind: 'denied' };
  }

  const recordFilter =
    subject.resolveRowLevelPermissionRecordFilter(objectMetadata);

  if (!isDefined(recordFilter)) {
    return { kind: 'open' };
  }

  const condition = renderRowLevelPermissionFilterToSql({
    recordFilter,
    tableAlias: objectMetadata.nameSingular,
    objectMetadata,
    flatFieldMetadataMaps,
  });

  if (!isDefined(condition)) {
    return { kind: 'open' };
  }

  return {
    kind: 'gated',
    expression: {
      kind: 'roleFilter',
      tableAlias: objectMetadata.nameSingular,
      flatObjectMetadata: objectMetadata,
      recordFilter,
      condition,
    },
  };
};
