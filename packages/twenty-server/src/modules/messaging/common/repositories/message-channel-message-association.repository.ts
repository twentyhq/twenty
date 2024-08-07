import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';

@Injectable()
export class MessageChannelMessageAssociationRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  public async deleteByMessageParticipantHandleAndMessageChannelIdAndRoles(
    messageParticipantHandle: string,
    messageChannelId: string,
    rolesToDelete: ('from' | 'to' | 'cc' | 'bcc')[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const isHandleDomain = messageParticipantHandle.startsWith('@');

    const messageChannel =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT * FROM ${dataSourceSchema}."messageChannel"
        WHERE "id" = $1`,
        [messageChannelId],
        workspaceId,
        transactionManager,
      );

    const messageChannelHandle = messageChannel[0].handle;

    const messageChannelMessageAssociationIdsToDelete =
      await this.workspaceDataSourceService.executeRawQuery(
        `SELECT "messageChannelMessageAssociation".id
      FROM ${dataSourceSchema}."messageChannelMessageAssociation" "messageChannelMessageAssociation"
      JOIN ${dataSourceSchema}."message" ON "messageChannelMessageAssociation"."messageId" = ${dataSourceSchema}."message"."id"
      JOIN ${dataSourceSchema}."messageParticipant" "messageParticipant" ON ${dataSourceSchema}."message"."id" = "messageParticipant"."messageId"
      WHERE "messageParticipant"."handle" != $1
      AND "messageParticipant"."handle" ${isHandleDomain ? '~*' : '='} $2
      AND "messageParticipant"."role" = ANY($3)
      AND "messageChannelMessageAssociation"."messageChannelId" = $4`,
        [
          messageChannelHandle,
          isHandleDomain
            ? // eslint-disable-next-line no-useless-escape
              `.+@(.+\.)?${messageParticipantHandle.slice(1)}`
            : messageParticipantHandle,
          rolesToDelete,
          messageChannelId,
        ],
        workspaceId,
        transactionManager,
      );

    const messageChannelMessageAssociationIdsToDeleteArray =
      messageChannelMessageAssociationIdsToDelete.map(
        (messageChannelMessageAssociation: { id: string }) =>
          messageChannelMessageAssociation.id,
      );

    await this.deleteByIds(
      messageChannelMessageAssociationIdsToDeleteArray,
      workspaceId,
      transactionManager,
    );
  }

  public async deleteByIds(
    ids: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ) {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    await this.workspaceDataSourceService.executeRawQuery(
      `DELETE FROM ${dataSourceSchema}."messageChannelMessageAssociation" WHERE "id" = ANY($1)`,
      [ids],
      workspaceId,
      transactionManager,
    );
  }
}
