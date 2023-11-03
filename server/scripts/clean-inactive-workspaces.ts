import console from 'console';

import peopleSeed from '../src/core/person/seed-data/people.json';
import companiesSeed from '../src/core/company/seed-data/companies.json';
import pipelineStagesSeed from '../src/core/pipeline/seed-data/pipeline-stages.json';
import pipelinesSeed from '../src/core/pipeline/seed-data/sales-pipeline.json';

import { connectionSource, performQuery } from './utils';

const getWorkspaces = async () => {
  return await performQuery(
    `
    SELECT id FROM workspaces;
    `,
    'List public workspaces',
  );
};

const getTables = async () => {
  return await performQuery(
    `
    SELECT * FROM pg_tables WHERE schemaname='public';
    `,
    'List tables',
  );
};

const getTableMaxUpdatedAt = async (table, workspace) => {
  const workspaceId = table.tablename === 'workspaces' ? 'id' : 'workspaceId';
  return await performQuery(
    `
        SELECT MAX("updatedAt") FROM ${table.tablename}
        WHERE "${workspaceId}"='${workspace.id}'
      `,
    'Get List of tables',
    false,
  );
};

const updateResult = (result, workspace, newUpdatedAt) => {
  if (!result.activityReport[workspace.id])
    result.activityReport[workspace.id] = null;
  if (
    newUpdatedAt &&
    newUpdatedAt[0].max &&
    new Date(result.activityReport[workspace.id]) <
      new Date(newUpdatedAt[0].max)
  ) {
    result.activityReport[workspace.id] = newUpdatedAt[0].max;
  }
};

const getWorkspaceMaxUpdatedAt = async (result) => {
  const workspaces = await getWorkspaces();
  const tables = await getTables();
  for (const workspace of workspaces) {
    await addOnlySeedDataWorkspaces(result, workspace);
    for (const table of tables) {
      const maxUpdatedAt = await getTableMaxUpdatedAt(table, workspace);
      updateResult(result, workspace, maxUpdatedAt);
    }
  }
};

const enrichResults = (result) => {
  Object.keys(result.activityReport).forEach((key) => {
    const timeDifferenceInSeconds = Math.abs(
      new Date().getTime() - new Date(result.activityReport[key]).getTime(),
    );
    const timeDifferenceInDays = Math.ceil(
      timeDifferenceInSeconds / (1000 * 3600 * 24),
    );
    result.activityReport[key] = `${result.activityReport[
      key
    ].toISOString()} -> Inactive since ${timeDifferenceInDays} days`;
  });
};

//https://stackoverflow.com/questions/27030/comparing-arrays-of-objects-in-javascript
const objectsEqual = (o1, o2) => {
  return (
    Object.keys(o1).length === Object.keys(o2).length &&
    Object.keys(o1).every((p) => o1[p] === o2[p])
  );
};

const arraysEqual = (a1, a2) => {
  return (
    a1.length === a2.length && a1.every((o, idx) => objectsEqual(o, a2[idx]))
  );
};

const addOnlySeedDataWorkspaces = async (result, workspace) => {
  const companies = await performQuery(
    `
        SELECT name, "domainName", address, employees FROM companies
        WHERE "workspaceId"='${workspace.id}'
      `,
    'List companies',
  );
  const people = await performQuery(
    `
        SELECT "firstName", "lastName", city, email, "avatarUrl" FROM people
        WHERE "workspaceId"='${workspace.id}'
      `,
    'List People',
  );
  const pipelineStages = await performQuery(
    `
        SELECT "name", "color", "position", "type" FROM pipeline_stages
        WHERE "workspaceId"='${workspace.id}'
      `,
    'List Pipeline Stages',
  );
  const pipelines = await performQuery(
    `
        SELECT "name", "icon", "pipelineProgressableType" FROM pipelines
        WHERE "workspaceId"='${workspace.id}'
      `,
    'List Pipelines',
  );
  if (
    arraysEqual(people, peopleSeed) &&
    arraysEqual(companies, companiesSeed) &&
    arraysEqual(pipelineStages, pipelineStagesSeed) &&
    arraysEqual(pipelines, [pipelinesSeed])
  ) {
    result.sameAsSeedWorkspaces.push(workspace.id);
  }
};
connectionSource
  .initialize()
  .then(async () => {
    const result = { activityReport: {}, sameAsSeedWorkspaces: [] };
    await getWorkspaceMaxUpdatedAt(result);
    enrichResults(result);
    console.log(result);
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });
