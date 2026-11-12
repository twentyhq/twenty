import { Injectable } from '@nestjs/common';

import { isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { RecordShareSystemWriteService } from 'src/engine/permissions/record-share/services/record-share-system-write.service';
import { PrivateRecordSystemWriteService } from 'src/engine/permissions/private-record/services/private-record-system-write.service';
import { AGENT_CHAT_THREAD_PARTICIPANT_COLUMN_NAMES } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-participant-column-names.constant';
import { AgentChatInboxDeliveryReason } from 'src/engine/metadata-modules/ai/ai-chat/enums/agent-chat-inbox-delivery-reason.enum';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadParticipantEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant-event.service';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { type AgentChatThreadParticipantRow } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-participant-row.type';
import { type AgentChatThreadParticipantWrite } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-participant-write.type';
import { buildAgentChatThreadParticipantOwnerShares } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-participant-owner-shares.util';
import { buildNextAgentChatLastMentionedAt } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-next-agent-chat-last-mentioned-at.util';
import { buildNextAgentChatThreadParticipantUpdatedAt } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-next-agent-chat-thread-participant-updated-at.util';
import { findAgentChatFlatObjectMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-flat-object-metadata.util';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AgentChatInboxParticipantWriterService {
  constructor(
    private readonly sharingService: AgentChatSharingService,
    private readonly participantEventService: AgentChatThreadParticipantEventService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly recordShareSystemWriteService: RecordShareSystemWriteService,
    private readonly privateRecordSystemWriteService: PrivateRecordSystemWriteService,
  ) {}

  async writeParticipantInboxState({
    workspaceMemberIds,
    reason,
    ...access
  }: AgentChatThreadAccessArgs & {
    workspaceMemberIds: string[];
    reason: AgentChatInboxDeliveryReason;
  }): Promise<void> {
    const participantWorkspaceMemberIds = [...new Set(workspaceMemberIds)];

    if (!isNonEmptyArray(participantWorkspaceMemberIds)) {
      return;
    }

    await this.assertCanDeliverToWorkspaceMembers({
      ...access,
      memberIds: participantWorkspaceMemberIds.filter(
        (workspaceMemberId) => workspaceMemberId !== access.workspaceMemberId,
      ),
    });

    const { workspaceId, threadId } = access;

    await this.sharingService.getParticipantObjectMetadataId(workspaceId);

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'featureFlagsMap',
      ]);
    const participantObjectMetadata =
      findAgentChatFlatObjectMetadata(
        flatObjectMetadataMaps,
        'agentChatThreadParticipant',
      ) ?? throwAgentChatThreadNotFound();

    const participantWrites =
      await this.workspaceOrmManager.executeTransactionInWorkspaceContext(
        (scope) =>
          this.upsertParticipantInboxState({
            scope,
            workspaceId,
            threadId,
            memberIds: participantWorkspaceMemberIds,
            reason,
            participantObjectMetadata,
          }),
        buildSystemAuthContext(workspaceId),
        { lite: true },
      );

    for (const participantWrite of participantWrites) {
      await this.participantEventService.emitParticipantWritten({
        workspaceId,
        ...participantWrite,
      });
    }
  }

  private async assertCanDeliverToWorkspaceMembers({
    memberIds: participantWorkspaceMemberIds,
    ...access
  }: AgentChatThreadAccessArgs & {
    memberIds: string[];
  }): Promise<void> {
    await this.sharingService.getThreadWithAccess({
      ...access,
      operationType: 'update',
    });

    const eligibleWorkspaceMemberIds =
      await this.sharingService.findEligibleParticipantWorkspaceMemberIds({
        ...access,
        memberIds: participantWorkspaceMemberIds,
        shouldConsiderNewShares: false,
      });

    if (
      eligibleWorkspaceMemberIds.length !== participantWorkspaceMemberIds.length
    ) {
      throwAgentChatThreadNotFound();
    }
  }

  private async upsertParticipantInboxState({
    scope,
    workspaceId,
    threadId,
    memberIds: participantWorkspaceMemberIds,
    reason,
    participantObjectMetadata,
  }: Pick<AgentChatThreadAccessArgs, 'workspaceId' | 'threadId'> & {
    scope: WorkspaceTransactionScope;
    memberIds: string[];
    reason: AgentChatInboxDeliveryReason;
    participantObjectMetadata: FlatObjectMetadata;
  }): Promise<AgentChatThreadParticipantWrite[]> {
    const participantRepository =
      scope.getRepositoryWithoutPermissionChecks<AgentChatThreadParticipantRow>(
        'agentChatThreadParticipant',
        { shouldSkipEventEmission: true },
      );
    const findParticipants = () =>
      participantRepository.find({
        select: AGENT_CHAT_THREAD_PARTICIPANT_COLUMN_NAMES,
        where: {
          threadId,
          workspaceMemberId: In(participantWorkspaceMemberIds),
        },
        withDeleted: true,
      });

    let participantsBefore = await findParticipants();
    const existingParticipantWorkspaceMemberIds = new Set(
      participantsBefore.map(({ workspaceMemberId }) => workspaceMemberId),
    );
    const missingParticipantWorkspaceMemberIds =
      participantWorkspaceMemberIds.filter(
        (workspaceMemberId) =>
          !existingParticipantWorkspaceMemberIds.has(workspaceMemberId),
      );
    const insertedParticipantIds = new Set<string>();
    const shouldMarkAsMentioned =
      reason === AgentChatInboxDeliveryReason.MENTION;

    if (isNonEmptyArray(missingParticipantWorkspaceMemberIds)) {
      const lastMentionedAt = shouldMarkAsMentioned
        ? new Date().toISOString()
        : null;
      const { identifiers } = await participantRepository.insert(
        missingParticipantWorkspaceMemberIds.map((workspaceMemberId) => ({
          threadId,
          workspaceMemberId,
          lastMentionedAt,
        })),
        { onConflictDoNothing: true },
      );

      for (const { id } of identifiers) {
        insertedParticipantIds.add(id);
      }

      await this.privateRecordSystemWriteService.setRecordsPrivacy({
        workspaceId,
        objectMetadataId: participantObjectMetadata.id,
        recordIds: identifiers.map(({ id }) => id),
        isPrivate: true,
        transactionScope: scope,
      });

      participantsBefore = await findParticipants();
    }

    const participantBeforeByWorkspaceMemberId = new Map(
      participantsBefore
        .filter(({ id }) => !insertedParticipantIds.has(id))
        .map((participant) => [participant.workspaceMemberId, participant]),
    );

    for (const participantBefore of participantBeforeByWorkspaceMemberId.values()) {
      await participantRepository.update(
        { id: participantBefore.id },
        {
          lastReadAt: null,
          archivedAt: null,
          snoozedUntil: null,
          isSubscribed: true,
          ...(shouldMarkAsMentioned
            ? {
                lastMentionedAt:
                  buildNextAgentChatLastMentionedAt(participantBefore),
              }
            : {}),
          updatedAt: buildNextAgentChatThreadParticipantUpdatedAt(
            participantBefore.updatedAt,
          ),
        },
      );
    }

    const participantsAfter = await findParticipants();

    await this.recordShareSystemWriteService.insertRecordShares({
      workspaceId,
      recordShares: buildAgentChatThreadParticipantOwnerShares({
        participants: participantsAfter,
        objectMetadataId: participantObjectMetadata.id,
      }),
      transactionScope: scope,
    });

    return participantsAfter.map((participantAfter) => ({
      before:
        participantBeforeByWorkspaceMemberId.get(
          participantAfter.workspaceMemberId,
        ) ?? null,
      after: participantAfter,
    }));
  }
}
