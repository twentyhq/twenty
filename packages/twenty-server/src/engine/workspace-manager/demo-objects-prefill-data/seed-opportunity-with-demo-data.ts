import { DEMO_SEED_WORKSPACE_MEMBER_IDS } from 'src/engine/workspace-manager/demo-objects-prefill-data/seed-workspace-member-with-demo-data';
import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

const tableName = 'opportunity';

const getRandomStage = () => {
  const stages = ['NEW', 'SCREENING', 'MEETING', 'PROPOSAL', 'CUSTOMER'];

  return stages[Math.floor(Math.random() * stages.length)];
};

const generateRandomAmountMicros = () => {
  const firstDigit = Math.floor(Math.random() * 9) + 1;

  return firstDigit * 10000000000;
};

const generateOpportunities = (companies) => {
  return companies.map((company) => ({
    id: v4(),
    name: company.name,
    amountAmountMicros: generateRandomAmountMicros(),
    amountCurrencyCode: 'USD',
    closeDate: new Date(),
    stage: getRandomStage(),
    pointOfContactId: company.personId,
    companyId: company.id,
    createdBySource: 'MANUAL',
    createdByWorkspaceMemberId: DEMO_SEED_WORKSPACE_MEMBER_IDS.NOAH,
    createdByName: 'Noah A',
  }));
};

export const seedOpportunityWithDemoData = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  const companiesWithPeople = await entityManager?.query(
    `SELECT company.*, person.id AS "personId"
     FROM ${schemaName}.company
     LEFT JOIN ${schemaName}.person ON company.id = "person"."companyId"
     LIMIT 50`,
  );

  const opportunities = generateOpportunities(companiesWithPeople);

  await entityManager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${tableName}`, [
      'id',
      'name',
      'amountAmountMicros',
      'amountCurrencyCode',
      'closeDate',
      'stage',
      'pointOfContactId',
      'companyId',
      'createdBySource',
      'createdByWorkspaceMemberId',
      'createdByName',
      'position',
    ])
    .orIgnore()
    .values(
      opportunities.map((opportunity, index) => ({
        ...opportunity,
        position: index,
      })),
    )
    .execute();
};
