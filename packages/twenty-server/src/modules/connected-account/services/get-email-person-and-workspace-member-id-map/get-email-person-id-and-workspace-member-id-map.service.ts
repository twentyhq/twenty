import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { PersonRepository } from 'src/modules/person/repositories/person.repository';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';

@Injectable()
export class GetEmailPersonIdAndWorkspaceMemberIdMapService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    @InjectObjectMetadataRepository(PersonObjectMetadata)
    private readonly personRepository: PersonRepository,
  ) {}

  public async getEmailPersonIdMap(
    handles: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<Map<string, string>> {
    const personIds = await this.personRepository.getByEmails(
      handles,
      workspaceId,
      transactionManager,
    );

    return new Map(personIds.map((person) => [person.email, person.id]));
  }

  public async getEmailWorkspaceMemberIdMap(
    handles: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<Map<string, string>> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const workspaceMemberIds: {
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

    return new Map(
      workspaceMemberIds.map((workspaceMember) => [
        workspaceMember.email,
        workspaceMember.id,
      ]),
    );
  }
}
