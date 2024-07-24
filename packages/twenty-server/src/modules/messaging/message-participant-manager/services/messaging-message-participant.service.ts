import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Any, EntityManager } from 'typeorm';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { TwentyORMManager } from 'src/engine/twenty-orm/twenty-orm.manager';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { getFlattenedValuesAndValuesStringForBatchRawQuery } from 'src/modules/calendar/calendar-event-import-manager/utils/get-flattened-values-and-values-string-for-batch-raw-query.util';
import { MessageParticipantRepository } from 'src/modules/messaging/common/repositories/message-participant.repository';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { ParticipantWithMessageId } from 'src/modules/messaging/message-import-manager/drivers/gmail/types/gmail-message';
import { PersonRepository } from 'src/modules/person/repositories/person.repository';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class MessagingMessageParticipantService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    @InjectObjectMetadataRepository(MessageParticipantWorkspaceEntity)
    private readonly messageParticipantRepository: MessageParticipantRepository,
    @InjectObjectMetadataRepository(PersonWorkspaceEntity)
    private readonly personRepository: PersonRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly twentyORMManager: TwentyORMManager,
  ) {}

  public async updateMessageParticipantsAfterPeopleCreation(
    createdPeople: PersonWorkspaceEntity[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<MessageParticipantWorkspaceEntity[]> {
    const participants = await this.messageParticipantRepository.getByHandles(
      createdPeople.map((person) => person.email),
      workspaceId,
      transactionManager,
    );

    if (!participants) return [];

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const handles = participants.map((participant) => participant.handle);

    const participantPersonIds = await this.personRepository.getByEmails(
      handles,
      workspaceId,
      transactionManager,
    );

    const messageParticipantsToUpdate = participants.map((participant) => ({
      id: participant.id,
      personId: participantPersonIds.find(
        (e: { id: string; email: string }) => e.email === participant.handle,
      )?.id,
    }));

    if (messageParticipantsToUpdate.length === 0) return [];

    const { flattenedValues, valuesString } =
      getFlattenedValuesAndValuesStringForBatchRawQuery(
        messageParticipantsToUpdate,
        {
          id: 'uuid',
          personId: 'uuid',
        },
      );

    return (
      await this.workspaceDataSourceService.executeRawQuery(
        `UPDATE ${dataSourceSchema}."messageParticipant" AS "messageParticipant" SET "personId" = "data"."personId"
      FROM (VALUES ${valuesString}) AS "data"("id", "personId")
      WHERE "messageParticipant"."id" = "data"."id"
      RETURNING *`,
        flattenedValues,
        workspaceId,
        transactionManager,
      )
    ).flat();
  }

  public async saveMessageParticipants(
    participants: ParticipantWithMessageId[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<MessageParticipantWorkspaceEntity[]> {
    if (!participants) return [];

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const { flattenedValues, valuesString } =
      getFlattenedValuesAndValuesStringForBatchRawQuery(participants, {
        messageId: 'uuid',
        role: `${dataSourceSchema}."messageParticipant_role_enum"`,
        handle: 'text',
        displayName: 'text',
      });

    if (participants.length === 0) return [];

    const messageParticipants =
      await this.workspaceDataSourceService.executeRawQuery(
        `INSERT INTO ${dataSourceSchema}."messageParticipant" ("messageId", "role", "handle", "displayName") VALUES ${valuesString} RETURNING *`,
        flattenedValues,
        workspaceId,
        transactionManager,
      );

    await this.matchMessageParticipants(
      messageParticipants,
      workspaceId,
      transactionManager,
    );

    return messageParticipants;
  }

  private async matchMessageParticipants(
    messageParticipants: MessageParticipantWorkspaceEntity[],
    workspaceId: string,
    transactionManager?: any,
  ) {
    const uniqueParticipantsHandles = [
      ...new Set(messageParticipants.map((participant) => participant.handle)),
    ];

    const messageParticipantRepository =
      await this.twentyORMManager.getRepository<MessageParticipantWorkspaceEntity>(
        'messageParticipant',
      );

    const personRepository =
      await this.twentyORMManager.getRepository<PersonWorkspaceEntity>(
        'person',
      );

    const persons = await personRepository.find(
      {
        where: {
          email: Any(uniqueParticipantsHandles),
        },
      },
      transactionManager,
    );

    const workspaceMemberRepository =
      await this.twentyORMManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        'workspaceMember',
      );

    const workspaceMembers = await workspaceMemberRepository.find(
      {
        where: {
          userEmail: Any(uniqueParticipantsHandles),
        },
      },
      transactionManager,
    );

    for (const handle of uniqueParticipantsHandles) {
      const person = persons.find((person) => person.email === handle);

      const workspaceMember = workspaceMembers.find(
        (workspaceMember) => workspaceMember.userEmail === handle,
      );

      await messageParticipantRepository.update(
        {
          handle,
        },
        {
          personId: person?.id,
          workspaceMemberId: workspaceMember?.id,
        },
        transactionManager,
      );
    }

    this.eventEmitter.emit(`messageParticipant.matched`, {
      workspaceId,
      workspaceMemberId: null,
      messageParticipants,
    });
  }

  public async matchMessageParticipantAfterPersonOrWorkspaceMemberCreation(
    handle: string,
    workspaceId: string,
    personId?: string,
    workspaceMemberId?: string,
  ) {
    const messageParticipantRepository =
      await this.twentyORMManager.getRepository<MessageParticipantWorkspaceEntity>(
        'messageParticipant',
      );

    const messageParticipantsToUpdate = await messageParticipantRepository.find(
      {
        where: {
          handle,
        },
      },
    );

    const messageParticipantIdsToUpdate = messageParticipantsToUpdate.map(
      (participant) => participant.id,
    );

    if (personId) {
      await messageParticipantRepository.update(
        {
          id: Any(messageParticipantIdsToUpdate),
        },
        {
          person: {
            id: personId,
          },
        },
      );

      const updatedMessageParticipants =
        await messageParticipantRepository.find({
          where: {
            id: Any(messageParticipantIdsToUpdate),
          },
        });

      this.eventEmitter.emit(`messageParticipant.matched`, {
        workspaceId,
        workspaceMemberId: null,
        messageParticipants: updatedMessageParticipants,
      });
    }

    if (workspaceMemberId) {
      await messageParticipantRepository.update(
        {
          id: Any(messageParticipantIdsToUpdate),
        },
        {
          workspaceMember: {
            id: workspaceMemberId,
          },
        },
      );
    }
  }

  public async unmatchMessageParticipants(
    workspaceId: string,
    handle: string,
    personId?: string,
    workspaceMemberId?: string,
  ) {
    if (personId) {
      await this.messageParticipantRepository.removePersonIdByHandle(
        handle,
        workspaceId,
      );
    }
    if (workspaceMemberId) {
      await this.messageParticipantRepository.removeWorkspaceMemberIdByHandle(
        handle,
        workspaceId,
      );
    }
  }
}
