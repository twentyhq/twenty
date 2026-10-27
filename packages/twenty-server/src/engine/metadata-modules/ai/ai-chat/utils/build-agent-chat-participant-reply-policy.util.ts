import { RecordShareAccessLevel } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type WorkspaceRepository } from 'src/engine/twenty-orm/repository/workspace-repository';
import {
  type RowAccessPolicy,
  type RowAccessPolicySubject,
} from 'src/engine/twenty-orm/types/row-access-policy.type';

const AGENT_CHAT_REPLY_OPERATION_TYPES: ('select' | 'update')[] = [
  'select',
  'update',
];

export const buildAgentChatParticipantReplyPolicy = ({
  repository,
  subject,
  canManageSharing,
}: {
  repository: Pick<WorkspaceRepository, 'buildRowAccessPolicy'>;
  subject: RowAccessPolicySubject;
  canManageSharing: boolean;
}): RowAccessPolicy => {
  if (!isDefined(subject.objectsPermissions)) {
    return { kind: 'denied' };
  }

  const policies = AGENT_CHAT_REPLY_OPERATION_TYPES.map((operationType) =>
    repository.buildRowAccessPolicy({
      subject,
      operationType,
      hypotheticalRecordShareAccessLevel: canManageSharing
        ? RecordShareAccessLevel.READ_WRITE
        : undefined,
    }),
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
};
