import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import chunk from 'lodash.chunk';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { type WorkspaceTransactionScope } from 'src/engine/twenty-orm/types/workspace-transaction-scope.type';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import {
  type MatchParticipantsArgs,
  MatchParticipantService,
} from 'src/modules/match-participant/match-participant.service';
import { type MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { type ParticipantWithMessageId } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-message.type';

@Injectable()
export class MessagingMessageParticipantService {
  constructor(
    private readonly workspaceOrmManager: WorkspaceOrmManager,
    private readonly matchParticipantService: MatchParticipantService<MessageParticipantWorkspaceEntity>,
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

        // Paired once: the lookup is a scan of every existing row, and both
        // the insert list and the update list below need the same answer.
        const participantsWithExisting = participants.map((participant) => ({
          participant,
          existingParticipant: findExisting(participant),
        }));

        const participantsToCreate: Pick<
          MessageParticipantWorkspaceEntity,
          | 'messageId'
          | 'handle'
          | 'displayName'
          | 'role'
          | 'personId'
          | 'workspaceMemberId'
        >[] = participantsWithExisting
          .filter(({ existingParticipant }) => !isDefined(existingParticipant))
          .map(({ participant }) => {
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
        const identityUpdates = participantsWithExisting.flatMap(
          ({ participant, existingParticipant }) => {
            if (
              !isDefined(existingParticipant) ||
              !suppliesIdentity(participant)
            ) {
              return [];
            }

            const personId =
              participant.personId ?? existingParticipant.personId;
            const workspaceMemberId =
              participant.workspaceMemberId ??
              existingParticipant.workspaceMemberId;
            // Carried along because the row is no longer matched on it: without
            // this a rename would be silently dropped on every later delivery.
            // An omitted name arrives as an empty string though, and this is
            // the only branch that writes the column back, so taking that
            // literally would erase whatever an earlier delivery supplied — a
            // caller adding a person link should not have to resend the rest
            // of the row to keep it.
            const displayName = isNonEmptyString(participant.displayName)
              ? participant.displayName
              : existingParticipant.displayName;

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
          },
        );

        // One ingested batch is bounded by messages, not by participants, so
        // a conversation with many people in it can exceed what updateMany
        // accepts in a single call.
        for (const identityUpdatesChunk of chunk(
          identityUpdates,
          QUERY_MAX_RECORDS,
        )) {
          await messageParticipantRepository.updateMany(identityUpdatesChunk);
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

  public async matchMessageParticipants({
    participants,
    messageIds,
    workspaceId,
    matchWith = 'workspaceMemberAndPerson',
  }: {
    participants: MessageParticipantWorkspaceEntity[];
    messageIds: string[];
    workspaceId: string;
    matchWith?: MatchParticipantsArgs<MessageParticipantWorkspaceEntity>['matchWith'];
  }): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.workspaceOrmManager.executeInWorkspaceContext(
      async () => {
        await this.matchParticipantService.matchParticipants({
          participants,
          sourceRecordIds: messageIds,
          objectMetadataName: 'messageParticipant',
          matchWith,
        });
      },
      authContext,
      { lite: true },
    );
  }
}
