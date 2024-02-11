import { EntityManager } from 'typeorm';
import { v4 } from 'uuid';

const tableName = 'opportunity';

const getRandomProbability = () => {
  const firstDigit = Math.floor(Math.random() * 9) + 1;

  return firstDigit / 10;
};

const getRandomPipelineStepId = (pipelineStepIds: { id: string }[]) =>
  pipelineStepIds[Math.floor(Math.random() * pipelineStepIds.length)].id;

const getRandomStage = () => {
  const stages = ['NEW', 'SCREENING', 'MEETING', 'PROPOSAL', 'CUSTOMER'];

  return stages[Math.floor(Math.random() * stages.length)];
};

const generateRandomAmountMicros = () => {
  const firstDigit = Math.floor(Math.random() * 9) + 1;

  return firstDigit * 10000000000;
};

// Function to generate the array of opportunities
// companiesWithPeople - selecting from the db companies and 1 person related to the company.id to use companyId, pointOfContactId and personId
// pipelineStepIds - selecting from the db pipeline, getting random id from selected to use as pipelineStepId

const generateOpportunities = (
  companies,
  pipelineStepIds: { id: string }[],
) => {
  return companies.map((company) => ({
    id: v4(),
    amountAmountMicros: generateRandomAmountMicros(),
    amountCurrencyCode: 'USD',
    closeDate: new Date(),
    stage: getRandomStage(),
    probability: getRandomProbability(),
    pipelineStepId: getRandomPipelineStepId(pipelineStepIds),
    pointOfContactId: company.personId,
    companyId: company.id,
  }));
};

export const seedDemoOpportunity = async (
  entityManager: EntityManager,
  schemaName: string,
) => {
  const companiesWithPeople = await entityManager?.query(
    `SELECT company.*, person.id AS "personId"
     FROM ${schemaName}.company
     LEFT JOIN ${schemaName}.person ON company.id = "person"."companyId"
     LIMIT 50`,
  );
  const pipelineStepIds = await entityManager?.query(
    `SELECT id FROM ${schemaName}."pipelineStep"`,
  );

  const opportunities = generateOpportunities(
    companiesWithPeople,
    pipelineStepIds,
  );

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
      'pipelineStepId',
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
