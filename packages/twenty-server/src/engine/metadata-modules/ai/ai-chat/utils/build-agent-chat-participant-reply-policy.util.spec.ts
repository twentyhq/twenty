import { RecordShareAccessLevel } from 'twenty-shared/types';

import { buildAgentChatParticipantReplyPolicy } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-participant-reply-policy.util';
import { type OperationType } from 'src/engine/twenty-orm/repository/permissions.utils';
import {
  type RowAccessExpression,
  type RowAccessPolicy,
  type RowAccessPolicySubject,
} from 'src/engine/twenty-orm/types/row-access-policy.type';

const SELECT_EXPRESSION: RowAccessExpression = { kind: 'and', operands: [] };
const UPDATE_EXPRESSION: RowAccessExpression = { kind: 'or', operands: [] };

const subject: RowAccessPolicySubject = {
  isSystemContext: false,
  objectsPermissions: {},
  principalIds: ['member-id'],
  canAccessAllRecords: false,
  isOwningApplication: () => false,
  resolveRowLevelPermissionRecordFilter: () => null,
};

const buildRepository = (
  policyByOperationType: Partial<Record<OperationType, RowAccessPolicy>>,
) => ({
  buildRowAccessPolicy: jest.fn(
    ({ operationType }: { operationType: OperationType }): RowAccessPolicy =>
      policyByOperationType[operationType] ?? { kind: 'open' },
  ),
});

describe('buildAgentChatParticipantReplyPolicy', () => {
  it('denies a subject whose role has no object permissions', () => {
    const repository = buildRepository({});

    expect(
      buildAgentChatParticipantReplyPolicy({
        repository,
        subject: { ...subject, objectsPermissions: undefined },
        canManageSharing: true,
      }),
    ).toEqual({ kind: 'denied' });
    expect(repository.buildRowAccessPolicy).not.toHaveBeenCalled();
  });

  it('requires both reading and replying', () => {
    const repository = buildRepository({});

    buildAgentChatParticipantReplyPolicy({
      repository,
      subject,
      canManageSharing: false,
    });

    expect(repository.buildRowAccessPolicy).toHaveBeenCalledTimes(2);
    expect(repository.buildRowAccessPolicy).toHaveBeenCalledWith(
      expect.objectContaining({ operationType: 'select' }),
    );
    expect(repository.buildRowAccessPolicy).toHaveBeenCalledWith(
      expect.objectContaining({ operationType: 'update' }),
    );
  });

  it('previews the edit share a sharing manager would grant', () => {
    const repository = buildRepository({});

    buildAgentChatParticipantReplyPolicy({
      repository,
      subject,
      canManageSharing: true,
    });

    expect(repository.buildRowAccessPolicy).toHaveBeenCalledWith(
      expect.objectContaining({
        hypotheticalRecordShareAccessLevel: RecordShareAccessLevel.READ_WRITE,
      }),
    );
  });

  it('previews no share when the sender cannot manage sharing', () => {
    const repository = buildRepository({});

    buildAgentChatParticipantReplyPolicy({
      repository,
      subject,
      canManageSharing: false,
    });

    expect(repository.buildRowAccessPolicy).toHaveBeenCalledWith(
      expect.objectContaining({
        hypotheticalRecordShareAccessLevel: undefined,
      }),
    );
  });

  it('is open when both operations are open', () => {
    expect(
      buildAgentChatParticipantReplyPolicy({
        repository: buildRepository({}),
        subject,
        canManageSharing: false,
      }),
    ).toEqual({ kind: 'open' });
  });

  it('is denied when either operation is denied', () => {
    expect(
      buildAgentChatParticipantReplyPolicy({
        repository: buildRepository({
          select: { kind: 'gated', expression: SELECT_EXPRESSION },
          update: { kind: 'denied' },
        }),
        subject,
        canManageSharing: false,
      }),
    ).toEqual({ kind: 'denied' });
  });

  it('requires every gated operation at once', () => {
    expect(
      buildAgentChatParticipantReplyPolicy({
        repository: buildRepository({
          select: { kind: 'gated', expression: SELECT_EXPRESSION },
          update: { kind: 'gated', expression: UPDATE_EXPRESSION },
        }),
        subject,
        canManageSharing: false,
      }),
    ).toEqual({
      kind: 'gated',
      expression: {
        kind: 'and',
        operands: [SELECT_EXPRESSION, UPDATE_EXPRESSION],
      },
    });
  });

  it('keeps only the gated operation when the other is open', () => {
    expect(
      buildAgentChatParticipantReplyPolicy({
        repository: buildRepository({
          update: { kind: 'gated', expression: UPDATE_EXPRESSION },
        }),
        subject,
        canManageSharing: false,
      }),
    ).toEqual({
      kind: 'gated',
      expression: { kind: 'and', operands: [UPDATE_EXPRESSION] },
    });
  });
});
