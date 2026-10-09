import {
  type CodeInterpreterSandboxTokens,
  captureCodeInterpreterSandboxTokens,
} from 'test/integration/graphql/suites/user-session/utils/capture-code-interpreter-sandbox-tokens.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { ADMINISTRATION_OPERATION_QUERY_FACTORIES } from 'test/integration/metadata/suites/application/utils/administration-operation-query-factories.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import {
  type ApplicationWithVariable,
  setupApplicationWithVariable,
} from 'test/integration/metadata/suites/application/utils/setup-application-with-variable.util';
import { updateOneRoleQueryFactory } from 'test/integration/metadata/suites/role/utils/update-one-role-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { getCoreRepository } from 'test/integration/utils/get-core-repository.util';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { MEMBER_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/member-role-label.constants';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type TestContext = {
  token: (globalContext: CodeInterpreterSandboxTokens) => string;
};

const sandboxTokenTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'for an agent an application runs as Jane',
    context: {
      token: (globalContext) => globalContext.applicationRunAsJaneToken,
    },
  },
  {
    title: 'for Jane running the interpreter directly',
    context: { token: (globalContext) => globalContext.janeDirectRunToken },
  },
];

const findMemberRole = async (): Promise<{
  id: string;
  canUpdateAllSettings: boolean;
}> => {
  const [role] = await globalThis.testDataSource.query(
    `SELECT id, "canUpdateAllSettings" FROM core."role"
     WHERE label = $1 AND "workspaceId" = $2`,
    [MEMBER_ROLE_LABEL, SEED_APPLE_WORKSPACE_ID],
  );

  return role;
};

describe('Administration operations with a code interpreter sandbox token should fail', () => {
  let application: ApplicationWithVariable;
  let globalTestContext: CodeInterpreterSandboxTokens;

  beforeAll(async () => {
    application = await setupApplicationWithVariable({
      name: 'Code Interpreter Administration Probe',
      variableKey: 'CODE_INTERPRETER_ADMINISTRATION_PROBE',
      permissionFlagUniversalIdentifiers: [
        SystemPermissionFlag.APPLICATIONS,
        SystemPermissionFlag.ROLES,
        SystemPermissionFlag.WORKSPACE,
      ],
    });

    globalTestContext = await captureCodeInterpreterSandboxTokens({
      applicationId: application.id,
    });
  }, 120000);

  afterAll(async () => {
    if (!isDefined(application)) {
      return;
    }

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });
  });

  describe.each(eachTestingContextFilter(sandboxTokenTestCases))(
    '$title',
    ({ context }) => {
      it('should refuse to raise the Member role, which stays unchanged', async () => {
        const memberRoleBeforeAttempt = await findMemberRole();

        const response = await makeMetadataApiRequest(
          updateOneRoleQueryFactory({
            input: {
              idToUpdate: memberRoleBeforeAttempt.id,
              updatePayload: { canUpdateAllSettings: true },
            },
          }),
          context.token(globalTestContext),
        );

        expectOneNotInternalServerErrorSnapshot({
          errors: response.body.errors,
        });

        expect(await findMemberRole()).toEqual(memberRoleBeforeAttempt);
      });

      it('should refuse to delete the workspace, which still exists', async () => {
        const response = await makeMetadataApiRequest(
          ADMINISTRATION_OPERATION_QUERY_FACTORIES.deleteCurrentWorkspace(),
          context.token(globalTestContext),
        );

        expectOneNotInternalServerErrorSnapshot({
          errors: response.body.errors,
        });

        const workspace = await getCoreRepository<WorkspaceEntity>(
          WorkspaceEntity,
        ).findOne({
          where: { id: SEED_APPLE_WORKSPACE_ID },
          withDeleted: true,
        });

        expect(workspace?.deletedAt).toBeNull();
      });
    },
  );
});
