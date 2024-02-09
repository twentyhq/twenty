import { Injectable } from '@nestjs/common';

import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

import { DataSourceEntity } from 'src/metadata/data-source/data-source.entity';
import { capitalize } from 'src/utils/capitalize';
import { CreateCompanyService } from 'src/workspace/messaging/services/create-company.service';
@Injectable()
export class CreateContactService {
  constructor(private readonly createCompaniesService: CreateCompanyService) {}

  async createContactFromHandleAndDisplayName(
    handle: string,
    displayName: string,
    dataSourceMetadata: DataSourceEntity,
    manager: EntityManager,
  ): Promise<string | undefined> {
    if (!handle) {
      return;
    }

    const contactFirstName = displayName.split(' ')[0];
    const contactLastName = displayName.split(' ')[1];

    const contactFullNameFromHandle = handle.split('@')[0];
    const contactFirstNameFromHandle = contactFullNameFromHandle.split('.')[0];
    const contactLastNameFromHandle = contactFullNameFromHandle.split('.')[1];

    const id = v4();

    const companyDomainName = handle
      .split('@')?.[1]
      .split('.')
      .slice(-2)
      .join('.')
      .toLowerCase();

    const companyId =
      await this.createCompaniesService.createCompanyFromDomainName(
        companyDomainName,
        dataSourceMetadata,
        manager,
      );

    await manager.query(
      `INSERT INTO ${dataSourceMetadata.schema}.person (id, email, "nameFirstName", "nameLastName", "companyId") VALUES ($1, $2, $3, $4, $5)`,
      [
        id,
        handle,
        capitalize(contactFirstName || contactFirstNameFromHandle || ''),
        capitalize(contactLastName || contactLastNameFromHandle || ''),
        companyId,
      ],
    );

    return id;
  }
}
