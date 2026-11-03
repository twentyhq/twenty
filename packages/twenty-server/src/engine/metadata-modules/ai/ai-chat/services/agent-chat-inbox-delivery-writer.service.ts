import { Inject, Injectable } from '@nestjs/common';

import { isNonEmptyArray } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { AGENT_CHAT_THREAD_PARTICIPANT_COLUMN_NAMES } from 'src/engine/metadata-modules/ai/ai-chat/constants/agent-chat-thread-participant-column-names.constant';
import { AgentChatSharingService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-sharing.service';
import { AgentChatThreadParticipantEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-participant-event.service';
import { type AgentChatInboxDeliveryReason } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-inbox-delivery-reason.type';
import { type AgentChatThreadAccessArgs } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-access-args.type';
import { type AgentChatThreadParticipantRow } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-participant-row.type';
import { type AgentChatThreadParticipantWrite } from 'src/engine/metadata-modules/ai/ai-chat/types/agent-chat-thread-participant-write.type';
import { buildAgentChatThreadParticipantOwnerShares } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-agent-chat-thread-participant-owner-shares.util';
import { buildNextAgentChatLastMentionedAt } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-next-agent-chat-last-mentioned-at.util';
import { buildNextAgentChatThreadParticipantUpdatedAt } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-next-agent-chat-thread-participant-updated-at.util';
import { findAgentChatFlatObjectMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-flat-object-metadata.util';
import { throwAgentChatThreadNotFound } from 'src/engine/metadata-modules/ai/ai-chat/utils/throw-agent-chat-thread-not-found.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { PrivateRecordStorageService } from 'src/engine/permissions/private-record/services/private-record-storage.service';
import { RecordShareStorageService } from 'src/engine/permissions/record-share/services/record-share-storage.service';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AgentChatInboxDeliveryWriterService {
  @Inject(AgentChatSharingService)
  private readonly sharingService: AgentChatSharingService;

  @Inject(AgentChatThreadParticipantEventService)
  private readonly participantEventService: AgentChatThreadParticipantEventService;

  @Inject(WorkspaceOrmManager)
  private readonly workspaceOrmManager: WorkspaceOrmManager;

  @Inject(WorkspaceCacheService)
  private readonly workspaceCacheService: WorkspaceCacheService;

  @Inject(PrivateRecordStorageService)
  private readonly privateRecordStorageService: PrivateRecordStorageService;

  @Inject(RecordShareStorageService)
  private readonly recordShareStorageService: RecordShareStorageService;

  async write({
    workspaceMemberIds,
    reason,
    ...access
  }: AgentChatThreadAccessArgs & {
    workspaceMemberIds: string[];
    reason: AgentChatInboxDeliveryReason;
  }): Promise<void> {
    const memberIds = [...new Set(workspaceMemberIds)].filter(
      (memberId) => memberId !== access.workspaceMemberId,
    );

    if (!isNonEmptyArray(memberIds)) {
      return;
    }

    await this.assertCanDeliverToMembers({ ...access, memberIds });

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

    const writes = await this.workspaceOrmManager.executeInWorkspaceContext(
      () =>
        this.workspaceOrmManager.runInWorkspaceTransaction((scope) =>
          this.writeParticipants({
            scope,
            workspaceId,
            threadId,
            memberIds,
            reason,
            participantObjectMetadata,
          }),
        ),
      buildSystemAuthContext(workspaceId),
      { lite: true },
    );

    for (const write of writes) {
      await this.participantEventService.emitParticipantWritten({
        workspaceId,
        ...write,
      });
    }
  }

  private async assertCanDeliverToMembers({
    memberIds,
    ...access
  }: AgentChatThreadAccessArgs & {
    memberIds: string[];
  }): Promise<void> {
    await this.sharingService.getThreadWithAccess({
      ...access,
      operationType: 'update',
    });

    const eligibleMemberIds =
      await this.sharingService.findEligibleParticipantWorkspaceMemberIds({
        ...access,
        memberIds,
        shouldConsiderNewShares: false,
      });

    if (eligibleMemberIds.length !== memberIds.length) {
      throwAgentChatThreadNotFound();
    }
  }

  private async writeParticipants({
    scope,
    workspaceId,
    threadId,
    memberIds,
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
        where: { threadId, workspaceMemberId: In(memberIds) },
        withDeleted: true,
      });

    let participantsBefore = await findParticipants();
    const existingMemberIds = new Set(
      participantsBefore.map(({ workspaceMemberId }) => workspaceMemberId),
    );
    const missingMemberIds = memberIds.filter(
      (memberId) => !existingMemberIds.has(memberId),
    );
    const insertedParticipantIds = new Set<string>();
    const isMention = reason === 'mention';

    if (isNonEmptyArray(missingMemberIds)) {
      const lastMentionedAt = isMention ? new Date().toISOString() : null;
      const { identifiers } = await participantRepository.insert(
        missingMemberIds.map((workspaceMemberId) => ({
          threadId,
          workspaceMemberId,
          lastMentionedAt,
        })),
        { onConflictDoNothing: true },
      );

      for (const { id } of identifiers) {
        insertedParticipantIds.add(id);
      }

      await this.privateRecordStorageService.setPrivate({
        workspaceId,
        flatObjectMetadata: participantObjectMetadata,
        recordIds: identifiers.map(({ id }) => id),
        isPrivate: true,
        transactionScope: scope,
      });

      participantsBefore = await findParticipants();
    }

    const participantBeforeByMemberId = new Map(
      participantsBefore
        .filter(({ id }) => !insertedParticipantIds.has(id))
        .map((participant) => [participant.workspaceMemberId, participant]),
    );

    for (const participantBefore of participantBeforeByMemberId.values()) {
      await participantRepository.update(
        { id: participantBefore.id },
        {
          lastReadAt: null,
          archivedAt: null,
          snoozedUntil: null,
          isSubscribed: true,
          ...(isMention
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

    await this.recordShareStorageService.insertMany({
      workspaceId,
      recordShares: buildAgentChatThreadParticipantOwnerShares({
        participants: participantsAfter,
        objectMetadataId: participantObjectMetadata.id,
      }),
      transactionScope: scope,
    });

    return participantsAfter.map((participantAfter) => ({
      before:
        participantBeforeByMemberId.get(participantAfter.workspaceMemberId) ??
        null,
      after: participantAfter,
    }));
  }
}
