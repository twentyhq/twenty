import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { GRAPHQL_URL, loginAndGetAccessToken, writeJson } from './common.mjs';
import { runScenario } from './scenario.mjs';

export const run = async ({ consumerDir, flavor, outputFile }) => {
  const token = await loginAndGetAccessToken();

  const coreModuleUrl = pathToFileURL(
    resolve(consumerDir, 'node_modules', 'twenty-client-sdk', 'dist', 'core.mjs'),
  );
  const { CoreApiClient } = await import(coreModuleUrl.href);

  const client = new CoreApiClient({
    url: GRAPHQL_URL,
    headers: { Authorization: `Bearer ${token}` },
  });

  const results = await runScenario({ client, flavor });

  await writeJson(outputFile, results);
  console.log(`Scenario '${flavor}' via ${consumerDir} succeeded -> ${outputFile}`);
};
