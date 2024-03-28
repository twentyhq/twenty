import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { MessageParticipantObjectMetadata } from 'src/modules/messaging/standard-objects/message-participant.object-metadata';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { ParticipantWithId } from 'src/modules/messaging/types/gmail-message';

@Injectable()
export class MessageParticipantRepository {
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

  public async getByMessageChannelIdWithoutPersonIdAndWorkspaceMemberIdAndMessageOutgoing(
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
        AND "messageParticipant"."workspaceMemberId" IS NULL
        AND ${dataSourceSchema}."message"."direction" = 'outgoing'`,
        [messageChannelId],
        workspaceId,
        transactionManager,
      );

    return messageParticipants;
  }

  public async getWithoutPersonIdAndWorkspaceMemberId(
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ParticipantWithId[]> {
    if (!workspaceId) {
      throw new Error('WorkspaceId is required');
    }

    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const messageParticipants: ParticipantWithId[] =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT "messageParticipant".*
        FROM ${dataSourceSchema}."messageParticipant" "messageParticipant"
        WHERE "messageParticipant"."personId" IS NULL
        AND "messageParticipant"."workspaceMemberId" IS NULL`,
        [],
        workspaceId,
        transactionManager,
      );

    return messageParticipants;
  }
}
