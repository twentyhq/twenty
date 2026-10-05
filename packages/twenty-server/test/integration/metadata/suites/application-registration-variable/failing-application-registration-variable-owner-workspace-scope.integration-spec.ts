import { randomUUID } from 'crypto';

import gql from 'graphql-tag';
import {
  findApplicationRegistrationVariables,
  updateApplicationRegistrationVariable,
} from 'test/integration/metadata/suites/application-registration-variable/utils/application-registration-variable-api.util';
import { insertApplicationRegistrationVariable } from 'test/integration/metadata/suites/application-registration-variable/utils/insert-application-registration-variable.util';
import { expectOneNotInternalServerErrorSnapshot } from 'test/integration/graphql/utils/expect-one-not-internal-server-error-snapshot.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import {
  type EachTestingContext,
  eachTestingContextFilter,
} from 'twenty-shared/testing';

import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

type TestContext = {
  ownerWorkspaceId: string | null;
};

// The metadata API requests below authenticate as Jane, in the Apple workspace,
// and each case seeds the registration under another owner.
const ownerWorkspaceTestCases: EachTestingContext<TestContext>[] = [
  {
    title: 'a registration owned by another workspace',
    context: { ownerWorkspaceId: SEED_YCOMBINATOR_WORKSPACE_ID },
  },
  {
    title: 'a registration owned by no workspace',
    context: { ownerWorkspaceId: null },
  },
];

const readEncryptedValue = async (
  variableId: string,
): Promise<string | null> => {
  const [row] = await globalThis.testDataSource.query(
    `SELECT "encryptedValue" FROM core."applicationRegistrationVariable" WHERE id = $1`,
    [variableId],
  );

  return row?.encryptedValue ?? null;
};

describe('Application registration variable access outside the owner workspace should fail', () => {
  describe.each(eachTestingContextFilter(ownerWorkspaceTestCases))(
    '$title',
    ({ context }) => {
      let foreignRegistrationId: string;
      let foreignVariableId: string;
      let encryptedValueBeforeAttempt: string | null;

      const normalizeMessage = (message: string) =>
        message
          .replace(foreignRegistrationId, '<applicationRegistrationId>')
          .replace(foreignVariableId, '<applicationRegistrationVariableId>');

      beforeAll(async () => {
        foreignRegistrationId = randomUUID();

        await globalThis.testDataSource.query(
          `INSERT INTO core."applicationRegistration"
            (id, "universalIdentifier", name, "oAuthClientId",
             "oAuthRedirectUris", "oAuthScopes", "workspaceId")
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            foreignRegistrationId,
            randomUUID(),
            `owner-workspace-scope-${foreignRegistrationId}`,
            randomUUID(),
            ['http://localhost:3000/callback'],
            ['read'],
            context.ownerWorkspaceId,
          ],
        );

        foreignVariableId = await insertApplicationRegistrationVariable({
          applicationRegistrationId: foreignRegistrationId,
          key: 'FOREIGN_API_KEY',
          value: 'foreign-secret-value',
        });

        encryptedValueBeforeAttempt =
          await readEncryptedValue(foreignVariableId);
      });

      afterAll(async () => {
        await globalThis.testDataSource.query(
          `DELETE FROM core."applicationRegistration" WHERE id = $1`,
          [foreignRegistrationId],
        );
      });

      it('should fail to read its variables', async () => {
        const { errors } = await findApplicationRegistrationVariables({
          applicationRegistrationId: foreignRegistrationId,
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors, normalizeMessage });
      });

      it('should fail to update one of its variables', async () => {
        const { errors } = await updateApplicationRegistrationVariable({
          id: foreignVariableId,
          value: 'value-from-a-non-owner-workspace',
          expectToFail: true,
        });

        expectOneNotInternalServerErrorSnapshot({ errors, normalizeMessage });

        expect(await readEncryptedValue(foreignVariableId)).toBe(
          encryptedValueBeforeAttempt,
        );
      });

      it('should fail to reset one of its variables', async () => {
        const response = await makeMetadataApiRequest({
          query: gql`
            mutation UpdateApplicationRegistrationVariable(
              $input: UpdateApplicationRegistrationVariableInput!
            ) {
              updateApplicationRegistrationVariable(input: $input) {
                id
                isFilled
              }
            }
          `,
          variables: {
            input: { id: foreignVariableId, update: { resetValue: true } },
          },
        });

        expectOneNotInternalServerErrorSnapshot({
          errors: response.body.errors,
          normalizeMessage,
        });

        expect(await readEncryptedValue(foreignVariableId)).toBe(
          encryptedValueBeforeAttempt,
        );
      });
    },
  );
});
