import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { MatchParticipantService } from 'src/modules/match-participant/match-participant.service';
import { ParticipantTargetReconciliationService } from 'src/modules/match-participant/participant-target-reconciliation.service';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type ParticipantWithMessageId } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-message.type';

@Injectable()
export class MessagingMessageParticipantService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly matchParticipantService: MatchParticipantService<MessageParticipantWorkspaceEntity>,
    private readonly participantTargetReconciliationService: ParticipantTargetReconciliationService,
  ) {}

  public async saveMessageParticipants(
    participants: ParticipantWithMessageId[],
    workspaceId: string,
    transactionScope: WorkspaceTransactionScope,
  ): Promise<MessageParticipantWorkspaceEntity[]> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const messageParticipantRepository =
          transactionScope.getRepository<MessageParticipantWorkspaceEntity>(
            'messageParticipant',
          );

        const existingParticipantsBasedOnMessageIds =
          await messageParticipantRepository.find({
            where: {
              messageId: In(
                participants.map((participant) => participant.messageId),
              ),
            },
          });

        const suppliesIdentity = (participant: ParticipantWithMessageId) =>
          isDefined(participant.personId) ||
          isDefined(participant.workspaceMemberId);

        // A caller that states who a participant is owns that row, so it is
        // matched on what cannot drift between deliveries: the message, the
        // handle and the role. Keying on displayName as well would make a
        // provider that renames someone — or simply omits the name on a later
        // delivery — insert a rival row instead, leaving the original behind
        // with its stale person link and the thread attached to both records.
        //
        // Callers that supply no identity keep the exact match, so the email
        // path, where the matcher fills these in afterwards, is unchanged.
        const findExisting = (participant: ParticipantWithMessageId) =>
          existingParticipantsBasedOnMessageIds.find(
            (existingParticipant) =>
              existingParticipant.messageId === participant.messageId &&
              existingParticipant.handle === participant.handle &&
              existingParticipant.role === participant.role &&
              (suppliesIdentity(participant) ||
                existingParticipant.displayName === participant.displayName),
          );

        const participantsToCreate: Pick<
          MessageParticipantWorkspaceEntity,
          | 'messageId'
          | 'handle'
          | 'displayName'
          | 'role'
          | 'personId'
          | 'workspaceMemberId'
        >[] = participants
          .filter((participant) => !isDefined(findExisting(participant)))
          .map((participant) => {
            return {
              messageId: participant.messageId,
              handle: participant.handle,
              displayName: participant.displayName,
              role: participant.role,
              personId: participant.personId ?? null,
              workspaceMemberId: participant.workspaceMemberId ?? null,
            };
          });

        // A re-ingested participant whose caller now knows the person it
        // belongs to would otherwise keep its original, unlinked row forever.
        // Only callers that supply an identity can trigger this, so the email
        // path — which leaves both undefined and relies on the matcher — is
        // untouched.
        const identityUpdates = participants.flatMap((participant) => {
          const existingParticipant = findExisting(participant);

          if (
            !isDefined(existingParticipant) ||
            (!isDefined(participant.personId) &&
              !isDefined(participant.workspaceMemberId))
          ) {
            return [];
          }

          const personId = participant.personId ?? existingParticipant.personId;
          const workspaceMemberId =
            participant.workspaceMemberId ??
            existingParticipant.workspaceMemberId;
          // Carried along because the row is no longer matched on it: without
          // this a rename would be silently dropped on every later delivery.
          const displayName = participant.displayName;

          if (
            personId === existingParticipant.personId &&
            workspaceMemberId === existingParticipant.workspaceMemberId &&
            displayName === existingParticipant.displayName
          ) {
            return [];
          }

          return [
            {
              criteria: existingParticipant.id,
              partialEntity: { personId, workspaceMemberId, displayName },
            },
          ];
        });

        if (identityUpdates.length > 0) {
          await messageParticipantRepository.updateMany(identityUpdates);
        }

        const { identifiers } =
          await messageParticipantRepository.insert(participantsToCreate);

        const touchedIds = [
          ...identifiers.map(({ id }) => id),
          ...identityUpdates.map(({ criteria }) => criteria),
        ];

        return messageParticipantRepository.find({
          where: { id: In(touchedIds) },
        });
      },
      authContext,
      { lite: true },
    );
  }

  // For a source whose handles are not email addresses, the matcher would
  // look every handle up as an email, find nothing, and write personId back
  // to null — erasing the identities the caller just supplied. Reconciling
  // directly keeps those links and still builds the thread targets that put
  // the conversation on a Person, Company or Opportunity record.
  public async reconcileMessageParticipantTargets({
    messageIds,
    workspaceId,
  }: {
    messageIds: string[];
    workspaceId: string;
  }): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        await this.participantTargetReconciliationService.reconcileParticipantTargets(
          {
            sourceRecordIds: messageIds,
            objectMetadataName: 'messageParticipant',
          },
        );
      },
      authContext,
      { lite: true },
    );
  }

  public async matchMessageParticipants({
    participants,
    messageIds,
    workspaceId,
  }: {
    participants: MessageParticipantWorkspaceEntity[];
    messageIds: string[];
    workspaceId: string;
  }): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        await this.matchParticipantService.matchParticipants({
          participants,
          sourceRecordIds: messageIds,
          objectMetadataName: 'messageParticipant',
          matchWith: 'workspaceMemberAndPerson',
        });
      },
      authContext,
      { lite: true },
    );
  }
}
