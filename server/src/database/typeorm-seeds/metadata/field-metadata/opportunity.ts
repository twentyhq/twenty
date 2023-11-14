import { DataSource } from 'typeorm';

import { SeedObjectMetadataIds } from 'src/database/typeorm-seeds/metadata/object-metadata';
import { SeedWorkspaceId } from 'src/database/seeds/metadata';

const fieldMetadataTableName = 'fieldMetadata';

export enum SeedOpportunityFieldMetadataIds {
  Amount = '20202020-8c1f-4c83-9a89-7843e586564d',
  CloseDate = '20202020-de52-4e7b-a298-db7a7553500f',
  Probability = '20202020-3b9c-4e58-a3d2-c617d3b596b1',

  PipelineStep = '20202020-0a2e-4676-8011-3fdb2c30c258',
  PointOfContact = '20202020-618e-42da-b3c3-bcd7af76e355',
  Company = '20202020-31d5-4af5-b016-c61c1c265706',
  Person = '20202020-0655-41df-b938-15d71e589307',
}

export const seedOpportunityFieldMetadata = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${fieldMetadataTableName}`, [
      'id',
      'objectMetadataId',
      'isCustom',
      'workspaceId',
      'isActive',
      'type',
      'name',
      'label',
      'targetColumnMap',
      'description',
      'icon',
      'isNullable',
    ])
    .orIgnore()
    .values([
      // Scalar fields
      {
        id: SeedOpportunityFieldMetadataIds.Amount,
        objectMetadataId: SeedObjectMetadataIds.Opportunity,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'NUMBER',
        name: 'amount',
        label: 'Amount',
        targetColumnMap: {
          value: 'amount',
        },
        description: 'Opportunity amount',
        icon: 'IconCurrencyDollar',
        isNullable: true,
      },
      {
        id: SeedOpportunityFieldMetadataIds.CloseDate,
        objectMetadataId: SeedObjectMetadataIds.Opportunity,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'DATE',
        name: 'closeDate',
        label: 'Close date',
        targetColumnMap: {
          value: 'closeDate',
        },
        description: 'Opportunity close date',
        icon: 'IconCalendarEvent',
        isNullable: true,
      },
      {
        id: SeedOpportunityFieldMetadataIds.Probability,
        objectMetadataId: SeedObjectMetadataIds.Opportunity,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'TEXT',
        name: 'probability',
        label: 'Probability',
        targetColumnMap: {
          value: 'probability',
        },
        description: 'Opportunity amount',
        icon: 'IconProgressCheck',
        isNullable: true,
      },
      {
        id: SeedOpportunityFieldMetadataIds.PipelineStep,
        objectMetadataId: SeedObjectMetadataIds.Opportunity,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'pipelineStep',
        label: 'Pipeline Step',
        targetColumnMap: {
          value: 'pipelineStepId',
        },
        description: 'Opportunity pipeline step',
        icon: 'IconKanban',
        isNullable: true,
      },
      {
        id: SeedOpportunityFieldMetadataIds.PointOfContact,
        objectMetadataId: SeedObjectMetadataIds.Opportunity,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'pointOfContact',
        label: 'Point of Contact',
        targetColumnMap: {
          value: 'pointOfContactId',
        },
        description: 'Opportunity point of contact',
        icon: 'IconUser',
        isNullable: true,
      },
      {
        id: SeedOpportunityFieldMetadataIds.Person,
        objectMetadataId: SeedObjectMetadataIds.Opportunity,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'person',
        label: 'Person',
        targetColumnMap: {
          value: 'personId',
        },
        description: 'Opportunity person',
        icon: 'IconUser',
        isNullable: true,
      },
      {
        id: SeedOpportunityFieldMetadataIds.Company,
        objectMetadataId: SeedObjectMetadataIds.Opportunity,
        isCustom: false,
        workspaceId: SeedWorkspaceId,
        isActive: true,
        type: 'RELATION',
        name: 'company',
        label: 'Company',
        targetColumnMap: {
          value: 'companyId',
        },
        description: 'Opportunity company',
        icon: 'IconBuildingSkyscraper',
        isNullable: true,
      },
    ])
    .execute();
};
