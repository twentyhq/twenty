import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';

// TODO: Move outside of the messaging module
@Injectable()
export class PersonService {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  async createPeople(
    peopleToCreate: {
      id: string;
      handle: string;
      firstName: string;
      lastName: string;
      companyId: string;
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
