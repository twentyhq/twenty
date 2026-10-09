import gql from 'graphql-tag';
import { makeGraphqlApiRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { expectEventually } from 'test/integration/utils/expect-eventually.util';

import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const updateJaneLocale = (locale: string) =>
  makeGraphqlApiRequest(
    updateOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: 'id',
      recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.JANE,
      data: { locale },
    }),
  );

const getJaneUserWorkspaceLocale = async () => {
  const response = await makeMetadataApiRequest(
    {
      query: gql`
        query {
          currentUser {
            currentUserWorkspace {
              locale
            }
          }
        }
      `,
    },
    APPLE_JANE_ADMIN_ACCESS_TOKEN,
  );

  return response.body.data.currentUser.currentUserWorkspace.locale;
};

describe('workspace member locale sync (integration)', () => {
  let initialLocale: string;

  beforeAll(async () => {
    initialLocale = await getJaneUserWorkspaceLocale();
  });

  afterAll(async () => {
    await updateJaneLocale(initialLocale);
    await expectEventually(async () => {
      expect(await getJaneUserWorkspaceLocale()).toBe(initialLocale);
    });
  });

  it('applies a locale updated through the record API to the user workspace', async () => {
    const response = await updateJaneLocale('fr-FR');

    expect(response.body.errors).toBeUndefined();

    await expectEventually(async () => {
      expect(await getJaneUserWorkspaceLocale()).toBe('fr-FR');
    });
  });
});
