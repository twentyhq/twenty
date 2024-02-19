import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { MessageParticipantObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-participant.object-metadata';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';
import {
  ParticipantWithId,
  Participant,
} from 'src/workspace/messaging/types/gmail-message';

@Injectable()
export class MessageParticipantService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async getByHandles(
    handles: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<MessageParticipantObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}."messageParticipant" WHERE "handle" = ANY($1)`,
      [handles],
      workspaceId,
      transactionManager,
    );
  }

  public async updateParticipantsPersonId(
    participantIds: string[],
    personId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."messageParticipant" SET "personId" = $1 WHERE "id" = ANY($2)`,
      [personId, participantIds],
      workspaceId,
      transactionManager,
    );
  }

  public async updateParticipantsWorkspaceMemberId(
    participantIds: string[],
    workspaceMemberId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."messageParticipant" SET "workspaceMemberId" = $1 WHERE "id" = ANY($2)`,
      [workspaceMemberId, participantIds],
      workspaceId,
      transactionManager,
    );
  }

  public async getByMessageChannelIdWithoutPersonIdAndWorkspaceMemberId(
    messageChannelId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ParticipantWithId[]> {
    if (!messageChannelId || !workspaceId) {
      return [];
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const messageParticipants: ParticipantWithId[] =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT "messageParticipant".id,
        "messageParticipant"."role",
        "messageParticipant"."handle",
        "messageParticipant"."displayName",
        "messageParticipant"."personId",
        "messageParticipant"."workspaceMemberId",
        "messageParticipant"."messageId"
        FROM ${dataSourceSchema}."messageParticipant" "messageParticipant"
        LEFT JOIN ${dataSourceSchema}."message" ON "messageParticipant"."messageId" = ${dataSourceSchema}."message"."id"
        LEFT JOIN ${dataSourceSchema}."messageChannelMessageAssociation" ON ${dataSourceSchema}."messageChannelMessageAssociation"."messageId" = ${dataSourceSchema}."message"."id"
        WHERE ${dataSourceSchema}."messageChannelMessageAssociation"."messageChannelId" = $1
        AND "messageParticipant"."personId" IS NULL
        AND "messageParticipant"."workspaceMemberId" IS NULL`,
        [messageChannelId],
        workspaceId,
        transactionManager,
      );

    return messageParticipants;
  }

  public async saveMessageParticipants(
    participants: Participant[],
    messageId: string,
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    if (!participants) return;

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const handles = participants.map((participant) => participant.handle);

    const participantPersonIds =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT id, email FROM ${dataSourceSchema}."person" WHERE "email" = ANY($1)`,
        [handles],
        workspaceId,
        transactionManager,
      );

    const participantWorkspaceMemberIds =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT "workspaceMember"."id", "connectedAccount"."handle" AS email FROM ${dataSourceSchema}."workspaceMember"
          JOIN ${dataSourceSchema}."connectedAccount" ON ${dataSourceSchema}."workspaceMember"."id" = ${dataSourceSchema}."connectedAccount"."accountOwnerId"
          WHERE ${dataSourceSchema}."connectedAccount"."handle" = ANY($1)`,
        [handles],
        workspaceId,
        transactionManager,
      );

    const messageParticipantsToSave = participants.map((participant) => [
      messageId,
      participant.role,
      participant.handle,
      participant.displayName,
      participantPersonIds.find((e) => e.email === participant.handle)?.id,
      participantWorkspaceMemberIds.find((e) => e.email === participant.handle)
        ?.id,
    ]);

    const valuesString = messageParticipantsToSave
      .map(
        (_, index) =>
          `($${index * 6 + 1}, $${index * 6 + 2}, $${index * 6 + 3}, $${
            index * 6 + 4
          }, $${index * 6 + 5}, $${index * 6 + 6})`,
      )
      .join(', ');

    if (messageParticipantsToSave.length === 0) return;

    await this.workspaceDataSourceService.executeRawQuery(
      `INSERT INTO ${dataSourceSchema}."messageParticipant" ("messageId", "role", "handle", "displayName", "personId", "workspaceMemberId") VALUES ${valuesString}`,
      messageParticipantsToSave.flat(),
      workspaceId,
      transactionManager,
    );
  }

  public async updateMessageParticipantsAfterPeopleCreation(
    participants: ParticipantWithId[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    if (!participants) return;

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const handles = participants.map((participant) => participant.handle);

    const participantPersonIds =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT id, email FROM ${dataSourceSchema}."person" WHERE "email" = ANY($1)`,
        [handles],
        workspaceId,
        transactionManager,
      );

    const messageParticipantsToUpdate = participants.map((participant) => [
      participant.id,
      participantPersonIds.find(
        (e: { id: string; email: string }) => e.email === participant.handle,
      )?.id,
    ]);

    if (messageParticipantsToUpdate.length === 0) return;

    const valuesString = messageParticipantsToUpdate
      .map((_, index) => `($${index * 2 + 1}::uuid, $${index * 2 + 2}::uuid)`)
      .join(', ');

    await this.workspaceDataSourceService.executeRawQuery(
      `UPDATE ${dataSourceSchema}."messageParticipant" AS "messageParticipant" SET "personId" = "data"."personId"
      FROM (VALUES ${valuesString}) AS "data"("id", "personId")
      WHERE "messageParticipant"."id" = "data"."id"`,
      messageParticipantsToUpdate.flat(),
      workspaceId,
      transactionManager,
    );
  }
}
