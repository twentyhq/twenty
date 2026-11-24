import { isViewVisibleToUser } from 'src/engine/metadata-modules/view/utils/is-view-visible-to-user.util';

const OVERRIDING_APPLICATION_UNIVERSAL_IDENTIFIER =
  '20202020-aaaa-4aaa-8aaa-000000000001';

describe('isViewVisibleToUser', () => {
  it('allows a non-private view for anyone, including without an identity', () => {
    expect(
      isViewVisibleToUser(
        {
          isPrivate: false,
          createdByUserWorkspaceId: 'someone-else',
        },
        'me',
      ),
    ).toBe(true);
    expect(
      isViewVisibleToUser(
        {
          isPrivate: false,
          createdByUserWorkspaceId: null,
        },
        undefined,
      ),
    ).toBe(true);
  });

  it('allows a private view only for its owner', () => {
    expect(
      isViewVisibleToUser(
        {
          isPrivate: true,
          createdByUserWorkspaceId: 'me',
        },
        'me',
      ),
    ).toBe(true);
  });

  it('denies a private view to a non-owner', () => {
    expect(
      isViewVisibleToUser(
        {
          isPrivate: true,
          createdByUserWorkspaceId: 'someone-else',
        },
        'me',
      ),
    ).toBe(false);
  });

  it('denies a private view when there is no current identity', () => {
    expect(
      isViewVisibleToUser(
        { isPrivate: true, createdByUserWorkspaceId: 'me' },
        undefined,
      ),
    ).toBe(false);
  });

  it('denies an ownerless private view to everyone', () => {
    expect(
      isViewVisibleToUser(
        { isPrivate: true, createdByUserWorkspaceId: null },
        'me',
      ),
    ).toBe(false);
  });

  it('denies a non-private view overridden to private to a non-owner', () => {
    expect(
      isViewVisibleToUser(
        {
          isPrivate: false,
          createdByUserWorkspaceId: 'someone-else',
          overrides: {
            [OVERRIDING_APPLICATION_UNIVERSAL_IDENTIFIER]: {
              isPrivate: true,
            },
          },
        },
        'me',
      ),
    ).toBe(false);
  });

  it('allows a private view overridden to non-private for anyone', () => {
    expect(
      isViewVisibleToUser(
        {
          isPrivate: true,
          createdByUserWorkspaceId: 'someone-else',
          overrides: {
            [OVERRIDING_APPLICATION_UNIVERSAL_IDENTIFIER]: {
              isPrivate: false,
            },
          },
        },
        'me',
      ),
    ).toBe(true);
  });
});
