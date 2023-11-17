import { DataSource } from 'typeorm';

import { SeedViewIds } from 'src/database/typeorm-seeds/workspace/views';
import { SeedCompanyFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/company';
import { SeedPersonFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/person';
import { SeedOpportunityFieldMetadataIds } from 'src/database/typeorm-seeds/metadata/field-metadata/opportunity';

const tableName = 'viewField';

export const seedViewFields = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'fieldMetadataId',
      'viewId',
      'position',
      'isVisible',
      'size',
    ])
    .orIgnore()
    .values([
      {
        fieldMetadataId: SeedCompanyFieldMetadataIds.Name,
        viewId: SeedViewIds.Company,
        position: 0,
        isVisible: true,
        size: 180,
      },
      {
        fieldMetadataId: SeedCompanyFieldMetadataIds.DomainName,
        viewId: SeedViewIds.Company,
        position: 1,
        isVisible: true,
        size: 100,
      },
      {
        fieldMetadataId: SeedCompanyFieldMetadataIds.AccountOwner,
        viewId: SeedViewIds.Company,
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: SeedCompanyFieldMetadataIds.CreatedAt,
        viewId: SeedViewIds.Company,
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: SeedCompanyFieldMetadataIds.Employees,
        viewId: SeedViewIds.Company,
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: SeedCompanyFieldMetadataIds.LinkedinLink,
        viewId: SeedViewIds.Company,
        position: 5,
        isVisible: true,
        size: 170,
      },
      {
        fieldMetadataId: SeedCompanyFieldMetadataIds.Address,
        viewId: SeedViewIds.Company,
        position: 6,
        isVisible: true,
        size: 170,
      },
      {
        fieldMetadataId: SeedPersonFieldMetadataIds.Name,
        viewId: SeedViewIds.Person,
        position: 0,
        isVisible: true,
        size: 210,
      },
      {
        fieldMetadataId: SeedPersonFieldMetadataIds.Email,
        viewId: SeedViewIds.Person,
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: SeedPersonFieldMetadataIds.Company,
        viewId: SeedViewIds.Person,
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: SeedPersonFieldMetadataIds.Phone,
        viewId: SeedViewIds.Person,
        position: 3,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: SeedPersonFieldMetadataIds.CreatedAt,
        viewId: SeedViewIds.Person,
        position: 4,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: SeedPersonFieldMetadataIds.City,
        viewId: SeedViewIds.Person,
        position: 5,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: SeedPersonFieldMetadataIds.JobTitle,
        viewId: SeedViewIds.Person,
        position: 6,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: SeedPersonFieldMetadataIds.LinkedinLink,
        viewId: SeedViewIds.Person,
        position: 7,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: SeedPersonFieldMetadataIds.XLink,
        viewId: SeedViewIds.Person,
        position: 8,
        isVisible: true,
        size: 150,
      },

      {
        fieldMetadataId: SeedOpportunityFieldMetadataIds.Amount,
        viewId: SeedViewIds.Opportunity,
        position: 0,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: SeedOpportunityFieldMetadataIds.CloseDate,
        viewId: SeedViewIds.Opportunity,
        position: 1,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: SeedOpportunityFieldMetadataIds.Probability,
        viewId: SeedViewIds.Opportunity,
        position: 2,
        isVisible: true,
        size: 150,
      },
      {
        fieldMetadataId: SeedOpportunityFieldMetadataIds.PointOfContact,
        viewId: SeedViewIds.Opportunity,
        position: 3,
        isVisible: true,
        size: 150,
      },
    ])
    .execute();
};
