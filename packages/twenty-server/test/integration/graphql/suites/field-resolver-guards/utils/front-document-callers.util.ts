import { arrangeMemberWithPermissionFlags } from 'test/integration/graphql/utils/arrange-member-with-permission-flags.util';
import { arrangeWorkspaceCustomApplicationToken } from 'test/integration/graphql/utils/arrange-workspace-custom-application-token.util';

export type FrontDocumentName =
  | 'GetCurrentUser'
  | 'ObjectMetadataItems'
  | 'FindAllViews';

export type FrontDocumentCaller = {
  title: string;
  arrange: () => Promise<{ token: string; cleanup: () => Promise<void> }>;
};

const withoutCleanup = (token: string) => ({ token, cleanup: async () => {} });

export const FRONT_DOCUMENT_CALLERS = {
  admin: {
    title: 'an admin',
    arrange: async () => withoutCleanup(APPLE_JANE_ADMIN_ACCESS_TOKEN),
  },
  memberWithoutPermissionFlags: {
    title: 'a member whose role holds no permission flag',
    arrange: () => arrangeMemberWithPermissionFlags({ permissionFlagKeys: [] }),
  },
  guest: {
    title: 'a guest',
    arrange: async () => withoutCleanup(APPLE_PHIL_GUEST_ACCESS_TOKEN),
  },
  apiKey: {
    title: 'an API key',
    arrange: async () => withoutCleanup(API_KEY_ACCESS_TOKEN),
  },
  userBoundApplicationToken: {
    title: 'an application token bound to a user',
    arrange: async () =>
      withoutCleanup(
        await arrangeWorkspaceCustomApplicationToken({ isBoundToUser: true }),
      ),
  },
  unboundApplicationToken: {
    title: 'an application token without user',
    arrange: async () =>
      withoutCleanup(
        await arrangeWorkspaceCustomApplicationToken({ isBoundToUser: false }),
      ),
  },
} satisfies Record<string, FrontDocumentCaller>;
