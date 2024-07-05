import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { InjectObjectMetadataRepository } from 'src/engine/object-metadata-repository/object-metadata-repository.decorator';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { PersonRepository } from 'src/modules/person/repositories/person.repository';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';

// TODO: Move inside person module and workspace-member module

@Injectable()
export class AddPersonIdAndWorkspaceMemberIdService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    @InjectObjectMetadataRepository(PersonWorkspaceEntity)
    private readonly personRepository: PersonRepository,
  ) {}

  private async getEmailPersonIdMap(
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

  private async getEmailWorkspaceMemberIdMap(
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

  public async addPersonIdAndWorkspaceMemberId<T extends { handle: string }>(
    objects: T[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<
    (T & {
      personId: string | null;
      workspaceMemberId: string | null;
    })[]
  > {
    const handles = objects.map((object) => object.handle);

    const personIdMap = await this.getEmailPersonIdMap(
      handles,
      workspaceId,
      transactionManager,
    );

    const workspaceMemberIdMap = await this.getEmailWorkspaceMemberIdMap(
      handles,
      workspaceId,
      transactionManager,
    );

    return objects.map((object) => ({
      ...object,
      personId: personIdMap.get(object.handle) || null,
      workspaceMemberId: workspaceMemberIdMap.get(object.handle) || null,
    }));
  }
}
