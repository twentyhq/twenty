import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { ParticipantWithMessageId } from 'src/modules/messaging/types/gmail-message';
import { PersonRepository } from 'src/modules/person/repositories/person.repository';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { getFlattenedValuesAndValuesStringForBatchRawQuery } from 'src/modules/calendar/utils/get-flattened-values-and-values-string-for-batch-raw-query.util';
import { MessageParticipantRepository } from 'src/modules/messaging/repositories/message-participant.repository';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-participant.workspace-entity';
import { AddPersonIdAndWorkspaceMemberIdService } from 'src/modules/calendar-messaging-participant/services/add-person-id-and-workspace-member-id/add-person-id-and-workspace-member-id.service';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';

@Injectable()
export class MessageParticipantService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    @InjectObjectMetadataRepository(MessageParticipantWorkspaceEntity)
    private readonly messageParticipantRepository: MessageParticipantRepository,
    @InjectObjectMetadataRepository(PersonWorkspaceEntity)
    private readonly personRepository: PersonRepository,
    private readonly addPersonIdAndWorkspaceMemberIdService: AddPersonIdAndWorkspaceMemberIdService,
  ) {}

  public async updateMessageParticipantsAfterPeopleCreation(
    createdPeople: ObjectRecord<PersonWorkspaceEntity>[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const participants = await this.messageParticipantRepository.getByHandles(
      createdPeople.map((person) => person.email),
      workspaceId,
      transactionManager,
    );

    if (!participants) return;

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

    if (messageParticipantsToUpdate.length === 0) return;

    const { flattenedValues, valuesString } =
      getFlattenedValuesAndValuesStringForBatchRawQuery(
        messageParticipantsToUpdate,
        {
          id: 'uuid',
          personId: 'uuid',
        },
      );

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."messageParticipant" AS "messageParticipant" SET "personId" = "data"."personId"
      FROM (VALUES ${valuesString}) AS "data"("id", "personId")
      WHERE "messageParticipant"."id" = "data"."id"`,
      flattenedValues,
      workspaceId,
      transactionManager,
    );
  }

  public async saveMessageParticipants(
    participants: ParticipantWithMessageId[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    if (!participants) return;

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const messageParticipantsToSave =
      await this.addPersonIdAndWorkspaceMemberIdService.addPersonIdAndWorkspaceMemberId(
        participants,
        workspaceId,
        transactionManager,
      );

    const { flattenedValues, valuesString } =
      getFlattenedValuesAndValuesStringForBatchRawQuery(
        messageParticipantsToSave,
        {
          messageId: 'uuid',
          role: `${dataSourceSchema}."messageParticipant_role_enum"`,
          handle: 'text',
          displayName: 'text',
          personId: 'uuid',
          workspaceMemberId: 'uuid',
        },
      );

    if (messageParticipantsToSave.length === 0) return;

    await this.workspaceDataSourceService.executeRawQuery(
      `INSERT INTO ${dataSourceSchema}."messageParticipant" ("messageId", "role", "handle", "displayName", "personId", "workspaceMemberId") VALUES ${valuesString}`,
      flattenedValues,
      workspaceId,
      transactionManager,
    );
  }

  public async matchMessageParticipants(
    workspaceId: string,
    email: string,
    personId?: string,
    workspaceMemberId?: string,
  ) {
    const messageParticipantsToUpdate =
      await this.messageParticipantRepository.getByHandles(
        [email],
        workspaceId,
      );

    const messageParticipantIdsToUpdate = messageParticipantsToUpdate.map(
      (participant) => participant.id,
    );

    if (personId) {
      await this.messageParticipantRepository.updateParticipantsPersonId(
        messageParticipantIdsToUpdate,
        personId,
        workspaceId,
      );
    }
    if (workspaceMemberId) {
      await this.messageParticipantRepository.updateParticipantsWorkspaceMemberId(
        messageParticipantIdsToUpdate,
        workspaceMemberId,
        workspaceId,
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
