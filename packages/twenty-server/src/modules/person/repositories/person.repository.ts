import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';

import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { ObjectRecord } from 'src/engine/workspace-manager/workspace-sync-metadata/types/object-record';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { getFlattenedValuesAndValuesStringForBatchRawQuery } from 'src/modules/calendar/utils/get-flattened-values-and-values-string-for-batch-raw-query.util';

@Injectable()
export class PersonRepository {
  constructor(
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {}

  async getByEmails(
    emails: string[],
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<ObjectRecord<PersonWorkspaceEntity>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    return await this.workspaceDataSourceService.executeRawQuery(
      `SELECT * FROM ${dataSourceSchema}.person WHERE email = ANY($1)`,
      [emails],
      workspaceId,
      transactionManager,
    );
  }

  async getLastPersonPosition(
    workspaceId: string,
    transactionManager?: EntityManager,
  ): Promise<number> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const result = await this.workspaceDataSourceService.executeRawQuery(
      `SELECT MAX(position) FROM ${dataSourceSchema}.person`,
      [],
      workspaceId,
      transactionManager,
    );

    return result[0].max ?? 0;
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
  ): Promise<ObjectRecord<PersonWorkspaceEntity>[]> {
    const dataSourceSchema =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const lastPersonPosition = await this.getLastPersonPosition(
      workspaceId,
      transactionManager,
    );

    peopleToCreate = peopleToCreate.map((contact, index) => ({
      ...contact,
      position: lastPersonPosition + index + 1,
    }));

    const { flattenedValues, valuesString } =
      getFlattenedValuesAndValuesStringForBatchRawQuery(peopleToCreate, {
        id: 'uuid',
        handle: 'text',
        firstName: 'text',
        lastName: 'text',
        companyId: 'uuid',
        position: 'double precision',
      });

    return await this.workspaceDataSourceService.executeRawQuery(
      `INSERT INTO ${dataSourceSchema}.person (id, email, "nameFirstName", "nameLastName", "companyId", "position") VALUES ${valuesString} RETURNING *`,
      flattenedValues,
      workspaceId,
      transactionManager,
    );
  }
}
