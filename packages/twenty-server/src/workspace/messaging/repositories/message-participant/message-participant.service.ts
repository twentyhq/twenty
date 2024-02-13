import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { MessageParticipantObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-participant.object-metadata';
import { ObjectRecord } from 'src/workspace/workspace-sync-metadata/types/object-record';
import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
import { Participant } from 'src/workspace/messaging/types/gmail-message';
import { CreateContactService } from 'src/workspace/messaging/services/create-contact/create-contact.service';
import { CreateCompanyService } from 'src/workspace/messaging/services/create-company/create-company.service';

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

    const alreadyCreatedContacts = await manager.query(
      `SELECT email FROM ${dataSourceMetadata.schema}."person" WHERE "email" = ANY($1)`,
      [participants.map((participant) => participant.handle)],
    );

    const alreadyCreatedContactEmails: string[] = alreadyCreatedContacts?.map(
      ({ email }) => email,
    );

    const filteredParticipants = participants.filter(
      (participant) =>
        !alreadyCreatedContactEmails.includes(participant.handle) &&
        participant.handle.includes('@'),
    );

    const filteredParticipantsWihCompanyDomainNames = filteredParticipants?.map(
      (participant) => ({
        handle: participant.handle,
        displayName: participant.displayName,
        companyDomainName: participant.handle
          .split('@')?.[1]
          .split('.')
          .slice(-2)
          .join('.')
          .toLowerCase(),
      }),
    );

    const domainNamesToCreate = filteredParticipantsWihCompanyDomainNames.map(
      (participant) => participant.companyDomainName,
    );

    const companiesObject = await this.createCompaniesService.createCompanies(
      domainNamesToCreate,
      dataSourceMetadata,
      manager,
    );

    const contactsToCreate = filteredParticipantsWihCompanyDomainNames.map(
      (participant) => ({
        handle: participant.handle,
        displayName: participant.displayName,
        companyId: companiesObject[participant.companyDomainName],
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
      [handles],
    );

    const participantWorkspaceMemberIds = await manager.query(
      `SELECT "workspaceMember"."id", "connectedAccount"."handle" AS email FROM ${dataSourceMetadata.schema}."workspaceMember"
          JOIN ${dataSourceMetadata.schema}."connectedAccount" ON ${dataSourceMetadata.schema}."workspaceMember"."id" = ${dataSourceMetadata.schema}."connectedAccount"."accountOwnerId"
          WHERE ${dataSourceMetadata.schema}."connectedAccount"."handle" = ANY($1)`,
      [handles],
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

    await manager.query(
      `INSERT INTO ${dataSourceMetadata.schema}."messageParticipant" ("messageId", "role", "handle", "displayName", "personId", "workspaceMemberId") VALUES ${valuesString}`,
      messageParticipantsToSave.flat(),
    );
  }
}
