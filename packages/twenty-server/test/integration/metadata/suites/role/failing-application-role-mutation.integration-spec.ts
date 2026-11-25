import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import {
  findApplicationDefaultRoleId,
  findApplicationIdByUniversalIdentifier,
} from 'test/integration/metadata/suites/application-grant-role/utils/find-application-grant-role.util';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { deleteOneRole } from 'test/integration/metadata/suites/role/utils/delete-one-role.util';
import { updateOneRole } from 'test/integration/metadata/suites/role/utils/update-one-role.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { type BaseGraphQLError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

const APPLICATION_UNIVERSAL_IDENTIFIER = uuidv4();
const ROLE_UNIVERSAL_IDENTIFIER = uuidv4();

type TestContext = {
  attempt: (
    applicationRoleId: string,
  ) => Promise<{ errors: BaseGraphQLError[] }>;
};

const testCases: EachTestingContext<TestContext>[] = [
  {
    title: 'updating the requested role of an application',
    context: {
      attempt: (applicationRoleId) =>
        updateOneRole({
          input: {
            idToUpdate: applicationRoleId,
            updatePayload: { description: 'Edited by the workspace' },
          },
          expectToFail: true,
        }),
    },
  },
  {
    title: 'deleting the requested role of an application',
    context: {
      attempt: (applicationRoleId) =>
        deleteOneRole({
          input: { idToDelete: applicationRoleId },
          expectToFail: true,
        }),
    },
  },
];

describe('Workspace mutations on a role owned by an application should fail', () => {
  let applicationRoleId: string;

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      name: 'Application Role Mutation',
      description: 'App for testing workspace mutations on its role',
      sourcePath: 'test-application-role-mutation',
    });

    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: APPLICATION_UNIVERSAL_IDENTIFIER,
        roleId: ROLE_UNIVERSAL_IDENTIFIER,
      }),
      expectToFail: false,
    });

    expect(errors).toBeUndefined();

    const applicationId = await findApplicationIdByUniversalIdentifier({
      universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });

    if (!isDefined(applicationId)) {
      throw new Error('Synced application not found');
    }

    applicationRoleId = await findApplicationDefaultRoleId({ applicationId });
  }, 60000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
    });
  });

  it.each(eachTestingContextFilter(testCases))(
    'should refuse $title',
    async ({ context }) => {
      const { errors } = await context.attempt(applicationRoleId);

      expectOneNotInternalServerErrorSnapshot({ errors });
    },
  );
});
