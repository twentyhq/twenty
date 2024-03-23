import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

const tableName = 'opportunity';

const getRandomProbability = () => {
  const firstDigit = Math.floor(Math.random() * 9) + 1;

  return firstDigit / 10;
};

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
    amountAmountMicros: generateRandomAmountMicros(),
    amountCurrencyCode: 'USD',
    closeDate: new Date(),
    stage: getRandomStage(),
    probability: getRandomProbability(),
    pointOfContactId: company.personId,
    companyId: company.id,
  }));
};

export const opportunityPrefillDemoData = async (
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
      'amountAmountMicros',
      'amountCurrencyCode',
      'closeDate',
      'stage',
      'probability',
      'pointOfContactId',
      'companyId',
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
