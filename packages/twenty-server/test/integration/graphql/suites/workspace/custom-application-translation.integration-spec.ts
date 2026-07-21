import { randomUUID } from 'crypto';

import request from 'supertest';
import { activateWorkspace } from 'test/integration/graphql/utils/activate-workspace.util';
import { deleteUser } from 'test/integration/graphql/utils/delete-user.util';
import { getAuthTokensFromLoginToken } from 'test/integration/graphql/utils/get-auth-tokens-from-login-token.util';
import { getCurrentUser } from 'test/integration/graphql/utils/get-current-user.util';
import { signUpInNewWorkspace } from 'test/integration/graphql/utils/sign-up-in-new-workspace.util';
import { signUp } from 'test/integration/graphql/utils/sign-up.util';
import { createOneObjectMetadata } from 'test/integration/metadata/suites/object-metadata/utils/create-one-object-metadata.util';
import { jestExpectToBeDefined } from 'test/utils/jest-expect-to-be-defined.util.test';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { isDefined } from 'twenty-shared/utils';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';

const client = request(`http://localhost:${APP_PORT}`);

const SOURCE_LABEL_SINGULAR = 'My Robot';
const SOURCE_LABEL_PLURAL = 'My Robots';
const SOURCE_DESCRIPTION = 'A friendly robot';

const TRANSLATED_LABEL_SINGULAR = 'Translated Robot';
const TRANSLATED_LABEL_PLURAL = 'Translated Robots';
const TRANSLATED_DESCRIPTION = 'Translated robot description';

const CONTROL_LABEL_SINGULAR = 'My Gadget';
const CONTROL_LABEL_PLURAL = 'My Gadgets';

type ObjectNode = {
  nameSingular: string;
  labelSingular: string;
  labelPlural: string;
  description: string;
};

const queryObjects = (accessToken: string) =>
  client
    .post('/metadata')
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      query: `
        query CustomObjectsI18n {
          objects(paging: { first: 200 }) {
            edges {
              node {
                nameSingular
                labelSingular
                labelPlural
                description
              }
            }
          }
        }
      `,
    });

const findObjectByName = (
  edges: Array<{ node: ObjectNode }>,
  nameSingular: string,
): ObjectNode | undefined =>
  edges.find((edge) => edge.node.nameSingular === nameSingular)?.node;

describe('custom application translation resolve path', () => {
  let createdUserAccessToken: string | undefined;

  afterEach(async () => {
    if (!isDefined(createdUserAccessToken)) {
      return;
    }

    await deleteUser({
      accessToken: createdUserAccessToken,
      expectToFail: false,
    });

    createdUserAccessToken = undefined;
  });

  it('translates a custom object label from the application translation catalog, and falls back to the source label otherwise', async () => {
    // A fresh workspace guarantees its Custom application registration has never
    // had its translation catalog loaded, so the seeded row below is read
    // straight from the database rather than from a warm (empty) cache.
    const uniqueEmail = `test-custom-translation-${randomUUID()}@example.com`;

    const { data: signUpData } = await signUp({
      input: { email: uniqueEmail, password: 'Test123!@#' },
      expectToFail: false,
    });

    createdUserAccessToken =
      signUpData.signUp.tokens.accessOrWorkspaceAgnosticToken.token;

    await testDataSource.query(
      'UPDATE core."user" SET "isEmailVerified" = true WHERE email = $1',
      [uniqueEmail],
    );

    const {
      data: { signUpInNewWorkspace: signUpInNewWorkspaceData },
    } = await signUpInNewWorkspace({
      accessToken: createdUserAccessToken,
      expectToFail: false,
    });

    const {
      data: { getAuthTokensFromLoginToken: authTokensData },
    } = await getAuthTokensFromLoginToken({
      origin: signUpInNewWorkspaceData.workspace.workspaceUrls.subdomainUrl,
      loginToken: signUpInNewWorkspaceData.loginToken.token,
      expectToFail: false,
    });

    const workspaceAccessToken =
      authTokensData.tokens.accessOrWorkspaceAgnosticToken.token;

    await activateWorkspace({
      accessToken: workspaceAccessToken,
      expectToFail: false,
    });

    const {
      data: { currentUser },
    } = await getCurrentUser({
      accessToken: workspaceAccessToken,
      expectToFail: false,
    });

    jestExpectToBeDefined(currentUser.currentWorkspace);
    const workspaceId = currentUser.currentWorkspace.id;
    const workspaceCustomApplicationId =
      currentUser.currentWorkspace.workspaceCustomApplicationId;

    const [customApplicationRow] = await testDataSource.query(
      `SELECT "applicationRegistrationId"
         FROM core.application
        WHERE id = $1 AND "workspaceId" = $2`,
      [workspaceCustomApplicationId, workspaceId],
    );

    jestExpectToBeDefined(customApplicationRow);
    const applicationRegistrationId =
      customApplicationRow.applicationRegistrationId;

    expect(applicationRegistrationId).toEqual(expect.any(String));

    const messages = {
      [generateMessageId(SOURCE_LABEL_SINGULAR)]: TRANSLATED_LABEL_SINGULAR,
      [generateMessageId(SOURCE_LABEL_PLURAL)]: TRANSLATED_LABEL_PLURAL,
      [generateMessageId(SOURCE_DESCRIPTION)]: TRANSLATED_DESCRIPTION,
    };

    await testDataSource.query(
      `INSERT INTO core."applicationTranslation"
         ("applicationRegistrationId", locale, messages)
       VALUES ($1, $2, $3::jsonb)`,
      [applicationRegistrationId, SOURCE_LOCALE, JSON.stringify(messages)],
    );

    await createOneObjectMetadata({
      input: {
        nameSingular: 'myRobot',
        namePlural: 'myRobots',
        labelSingular: SOURCE_LABEL_SINGULAR,
        labelPlural: SOURCE_LABEL_PLURAL,
        description: SOURCE_DESCRIPTION,
        isLabelSyncedWithName: false,
      },
      token: workspaceAccessToken,
      expectToFail: false,
    });

    await createOneObjectMetadata({
      input: {
        nameSingular: 'myGadget',
        namePlural: 'myGadgets',
        labelSingular: CONTROL_LABEL_SINGULAR,
        labelPlural: CONTROL_LABEL_PLURAL,
        isLabelSyncedWithName: false,
      },
      token: workspaceAccessToken,
      expectToFail: false,
    });

    const response = await queryObjects(workspaceAccessToken);

    expect(response.body.errors).toBeUndefined();

    const edges = response.body.data.objects.edges;

    const myRobot = findObjectByName(edges, 'myRobot');

    jestExpectToBeDefined(myRobot);
    expect(myRobot.labelSingular).toBe(TRANSLATED_LABEL_SINGULAR);
    expect(myRobot.labelPlural).toBe(TRANSLATED_LABEL_PLURAL);
    expect(myRobot.description).toBe(TRANSLATED_DESCRIPTION);

    const myGadget = findObjectByName(edges, 'myGadget');

    jestExpectToBeDefined(myGadget);
    expect(myGadget.labelSingular).toBe(CONTROL_LABEL_SINGULAR);
    expect(myGadget.labelPlural).toBe(CONTROL_LABEL_PLURAL);
  });
});
