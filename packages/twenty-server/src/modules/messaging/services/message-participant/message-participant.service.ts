import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import {
  ParticipantWithId,
  ParticipantWithMessageId,
} from 'src/modules/messaging/types/gmail-message';
import { PersonRepository } from 'src/modules/person/repositories/person.repository';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { getFlattenedValuesAndValuesStringForBatchRawQuery } from 'src/modules/calendar/utils/getFlattenedValuesAndValuesStringForBatchRawQuery.util';

@Injectable()
export class MessageParticipantService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    @InjectObjectMetadataRepository(PersonObjectMetadata)
    private readonly personRepository: PersonRepository,
  ) {}

  public async updateMessageParticipantsAfterPeopleCreation(
    participants: ParticipantWithId[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
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

    const handles = participants.map((participant) => participant.handle);

    const participantPersonIds: {
      id: string;
      email: string;
    }[] = await this.workspaceDataSourceService.executeRawQuery(
      `SELECT id, email FROM ${dataSourceSchema}."person" WHERE "email" = ANY($1)`,
      [handles],
      workspaceId,
      transactionManager,
    );

    const emailPersonIdsMap = new Map(
      participantPersonIds.map((person) => [person.email, person.id]),
    );

    const participantWorkspaceMemberIds: {
      id: string;
      email: string;
    }[] = await this.workspaceDataSourceService.executeRawQuery(
      `SELECT "workspaceMember"."id", "connectedAccount"."handle" AS email FROM ${dataSourceSchema}."workspaceMember"
          JOIN ${dataSourceSchema}."connectedAccount" ON ${dataSourceSchema}."workspaceMember"."id" = ${dataSourceSchema}."connectedAccount"."accountOwnerId"
          WHERE ${dataSourceSchema}."connectedAccount"."handle" = ANY($1)`,
      [handles],
      workspaceId,
      transactionManager,
    );

    const emailWorkspaceMemberIdsMap = new Map(
      participantWorkspaceMemberIds.map((workspaceMember) => [
        workspaceMember.email,
        workspaceMember.id,
      ]),
    );

    const messageParticipantsToSave = participants.map((participant) => ({
      ...participant,
      personId: emailPersonIdsMap.get(participant.handle),
      workspaceMemberId: emailWorkspaceMemberIdsMap.get(participant.handle),
    }));

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
}
