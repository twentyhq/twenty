import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { PersonObjectMetadata } from 'src/modules/person/standard-objects/person.object-metadata';

@Injectable()
export class PersonRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  async getByEmails(
    emails: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<PersonObjectMetadata>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}.person WHERE email = ANY($1)`,
      [emails],
      workspaceId,
      transactionManager,
    );
  }

  async createPeople(
    peopleToCreate: {
      id: string;
      handle: string;
      firstName: string;
      lastName: string;
      companyId?: string;
    }[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<void> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const valuesString = peopleToCreate
      .map(
        (_, index) =>
          `($${index * 5 + 1}, $${index * 5 + 2}, $${index * 5 + 3}, $${
            index * 5 + 4
          }, $${index * 5 + 5})`,
      )
      .join(', ');

    return await this.workspaceDataSourceService.executeRawQuery(
      `INSERT INTO ${dataSourceSchema}.person (id, email, "nameFirstName", "nameLastName", "companyId") VALUES ${valuesString}`,
      peopleToCreate
        .map((contact) => [
          contact.id,
          contact.handle,
          contact.firstName,
          contact.lastName,
          contact.companyId,
        ])
        .flat(),
      workspaceId,
      transactionManager,
    );
  }
}
