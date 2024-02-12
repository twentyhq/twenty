import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { MessageParticipantObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-participant.object-metadata';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
import { Participant } from 'src/workspace/messaging/types/gmail-message';
import { CreateContactService } from 'src/workspace/messaging/create-contact/create-contact.service';
import { CreateCompanyService } from 'src/workspace/messaging/create-company/create-company.service';

@Injectable()
export class MessageParticipantService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly createContactService: CreateContactService,
    private readonly createCompaniesService: CreateCompanyService,
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

  public async saveMessageParticipants(
    participants: Participant[],
    messageId: string,
    dataSourceMetadata: DataSourceEntity,
    manager: EntityManager,
  ): Promise<void> {
    if (!participants) return;

    const contactsToCreate = await Promise.all(
      participants.map(async (participant) => {
        const companyDomainName = participant.handle
          .split('@')?.[1]
          .split('.')
          .slice(-2)
          .join('.')
          .toLowerCase();

        const companyId = await this.createCompaniesService.createCompany(
          companyDomainName,
          dataSourceMetadata,
          manager,
        );

        return {
          handle: participant.handle,
          displayName: participant.displayName,
          companyId,
        };
      }),
    );

    await this.createContactService.createContacts(
      contactsToCreate,
      dataSourceMetadata,
      manager,
    );

    const handles = participants.map((participant) => participant.handle);

    const participantPersonIds = await manager.query(
      `SELECT id, email FROM ${dataSourceMetadata.schema}."person" WHERE "email" = ANY($1)`,
      handles,
    );

    const participantWorkspaceMemberIds = await manager.query(
      `SELECT "workspaceMember"."id", "connectedAccount"."handle" AS email FROM ${dataSourceMetadata.schema}."workspaceMember"
          JOIN ${dataSourceMetadata.schema}."connectedAccount" ON ${dataSourceMetadata.schema}."workspaceMember"."id" = ${dataSourceMetadata.schema}."connectedAccount"."accountOwnerId"
          WHERE ${dataSourceMetadata.schema}."connectedAccount"."handle" = ANY($1)`,
      handles,
    );

    const messageParticipantsToSave = participants.map((participant) => [
      messageId,
      participant.role,
      participant.handle,
      participant.displayName,
      participantPersonIds.find((e) => e.email === participant.handle).id,
      participantWorkspaceMemberIds.find((e) => e.email === participant.handle)
        .id,
    ]);

    await manager.query(
      `INSERT INTO ${dataSourceMetadata.schema}."messageParticipant" ("messageId", "role", "handle", "displayName", "personId", "workspaceMemberId") VALUES ($1, $2, $3, $4, $5, $6)`,
      messageParticipantsToSave,
    );
  }
}
