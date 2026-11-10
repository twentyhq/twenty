import { ViewVisibility } from 'twenty-shared/types';

import { isViewVisibleToUser } from 'src/engine/metadata-modules/view/utils/is-view-visible-to-user.util';

describe('isViewVisibleToUser', () => {
  it('allows a WORKSPACE view for anyone, including without an identity', () => {
    expect(
      isViewVisibleToUser(
        {
          visibility: ViewVisibility.WORKSPACE,
          ownerUserWorkspaceId: 'someone-else',
        },
        'me',
      ),
    ).toBe(true);
    expect(
      isViewVisibleToUser(
        {
          visibility: ViewVisibility.WORKSPACE,
          ownerUserWorkspaceId: null,
        },
        undefined,
      ),
    ).toBe(true);
  });

  it('allows an UNLISTED view only for its owner', () => {
    expect(
      isViewVisibleToUser(
        {
          visibility: ViewVisibility.UNLISTED,
          ownerUserWorkspaceId: 'me',
        },
        'me',
      ),
    ).toBe(true);
  });

  it('does not use creator audit as private ownership', () => {
    const view = {
      visibility: ViewVisibility.UNLISTED,
      ownerUserWorkspaceId: 'owner',
      createdByUserWorkspaceId: 'creator',
    };

    expect(isViewVisibleToUser(view, 'owner')).toBe(true);
    expect(isViewVisibleToUser(view, 'creator')).toBe(false);
    expect(
      isViewVisibleToUser({ ...view, ownerUserWorkspaceId: null }, 'creator'),
    ).toBe(false);
  });

  it('denies an UNLISTED view to a non-owner', () => {
    expect(
      isViewVisibleToUser(
        {
          visibility: ViewVisibility.UNLISTED,
          ownerUserWorkspaceId: 'someone-else',
        },
        'me',
      ),
    ).toBe(false);
  });

  it('denies an UNLISTED view when there is no current identity', () => {
    expect(
      isViewVisibleToUser(
        { visibility: ViewVisibility.UNLISTED, ownerUserWorkspaceId: 'me' },
        undefined,
      ),
    ).toBe(false);
  });

  it('denies an ownerless UNLISTED view to everyone', () => {
    expect(
      isViewVisibleToUser(
        { visibility: ViewVisibility.UNLISTED, ownerUserWorkspaceId: null },
        'me',
      ),
    ).toBe(false);
  });
});
