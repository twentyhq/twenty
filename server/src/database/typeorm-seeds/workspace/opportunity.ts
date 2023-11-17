import { DataSource } from 'typeorm';

const tableName = 'opportunity';

export const seedOpportunity = async (
  workspaceDataSource: DataSource,
  schemaName: string,
) => {
  await workspaceDataSource
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'amountAmountMicros',
      'amountCurrencyCode',
      'closeDate',
      'probability',
      'pipelineStepId',
      'pointOfContactId',
      'personId',
      'companyId',
    ])
    .orIgnore()
    .values([
      {
        id: '7c887ee3-be10-412b-a663-16bd3c2228e1',
        amountAmountMicros: 100000,
        amountCurrencyCode: 'USD',
        closeDate: new Date(),
        probability: 0.5,
        pipelineStepId: '6edf4ead-006a-46e1-9c6d-228f1d0143c9',
        pointOfContactId: '86083141-1c0e-494c-a1b6-85b1c6fefaa5',
        personId: '86083141-1c0e-494c-a1b6-85b1c6fefaa5',
        companyId: 'fe256b39-3ec3-4fe3-8997-b76aa0bfa408',
      },
    ])
    .execute();
};
