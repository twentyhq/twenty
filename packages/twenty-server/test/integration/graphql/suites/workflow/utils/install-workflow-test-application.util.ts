import { randomUUID } from 'node:crypto';

import {
  buildTestApplicationManifest,
  type TestApplicationWorkflow,
} from 'test/integration/graphql/suites/workflow/utils/application-workflow-test.util';
import { findOneApplication } from 'test/integration/metadata/suites/application/utils/find-one-application.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';

export const installWorkflowTestApplication = async ({
  applicationUniversalIdentifier,
  name,
  workflows,
}: {
  applicationUniversalIdentifier: string;
  name: string;
  workflows: TestApplicationWorkflow[];
}): Promise<string> => {
  await setupApplicationForSync({
    applicationUniversalIdentifier,
    name,
    description: name,
    sourcePath: applicationUniversalIdentifier,
  });

  await syncApplication({
    manifest: buildTestApplicationManifest({
      applicationUniversalIdentifier,
      roleUniversalIdentifier: randomUUID(),
      companyPermissionUniversalIdentifier: randomUUID(),
      logicFunctionUniversalIdentifier: randomUUID(),
      workflows,
    }),
    expectToFail: false,
  });

  const { data } = await findOneApplication({
    input: { universalIdentifier: applicationUniversalIdentifier },
    expectToFail: false,
  });

  return data.findOneApplication.id;
};
