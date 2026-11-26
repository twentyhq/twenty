import { arrangeMemberWithPermissionFlags } from 'test/integration/graphql/utils/arrange-member-with-permission-flags.util';
import { arrangeWorkspaceCustomApplicationToken } from 'test/integration/graphql/utils/arrange-workspace-custom-application-token.util';
import { readFrontMetadataDocument } from 'test/integration/graphql/utils/read-front-metadata-document.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

type Caller = {
  title: string;
  isUserSession: boolean;
  getToken: () => Promise<string>;
};

describe('Front documents should resolve every field for an admitted caller', () => {
  let memberWithoutPermissionFlags: Awaited<
    ReturnType<typeof arrangeMemberWithPermissionFlags>
  >;

  beforeAll(async () => {
    memberWithoutPermissionFlags = await arrangeMemberWithPermissionFlags({
      permissionFlagKeys: [],
    });
  });

  afterAll(async () => {
    await memberWithoutPermissionFlags.cleanup();
  });

  const CALLERS: Caller[] = [
    {
      title: 'an admin',
      isUserSession: true,
      getToken: async () => APPLE_JANE_ADMIN_ACCESS_TOKEN,
    },
    {
      title: 'a member whose role holds no permission flag',
      isUserSession: true,
      getToken: async () => memberWithoutPermissionFlags.token,
    },
    {
      title: 'a guest',
      isUserSession: true,
      getToken: async () => APPLE_PHIL_GUEST_ACCESS_TOKEN,
    },
    {
      title: 'an API key',
      isUserSession: false,
      getToken: async () => API_KEY_ACCESS_TOKEN,
    },
    {
      title: 'an application token bound to a user',
      isUserSession: false,
      getToken: () =>
        arrangeWorkspaceCustomApplicationToken({ isBoundToUser: true }),
    },
    {
      title: 'an application token without user',
      isUserSession: false,
      getToken: () =>
        arrangeWorkspaceCustomApplicationToken({ isBoundToUser: false }),
    },
  ];

  const expectDocumentToResolve = async ({
    documentName,
    token,
  }: {
    documentName: Parameters<typeof readFrontMetadataDocument>[0];
    token: string;
  }) => {
    const response = await makeMetadataApiRequest(
      { query: readFrontMetadataDocument(documentName) },
      token,
    );

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data).toBeDefined();
    expect(response.body.data).not.toBeNull();
  };

  it.each(CALLERS.filter(({ isUserSession }) => isUserSession))(
    'should answer GetCurrentUser for $title',
    async ({ getToken }) => {
      await expectDocumentToResolve({
        documentName: 'GetCurrentUser',
        token: await getToken(),
      });
    },
  );

  it.each(CALLERS)(
    'should answer ObjectMetadataItems for $title',
    async ({ getToken }) => {
      await expectDocumentToResolve({
        documentName: 'ObjectMetadataItems',
        token: await getToken(),
      });
    },
  );

  it.each(CALLERS)(
    'should answer FindAllViews for $title',
    async ({ getToken }) => {
      await expectDocumentToResolve({
        documentName: 'FindAllViews',
        token: await getToken(),
      });
    },
  );
});
