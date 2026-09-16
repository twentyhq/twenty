import { ViewVisibility } from 'twenty-shared/types';

import { isViewVisibleToUser } from 'src/engine/metadata-modules/view/utils/is-view-visible-to-user.util';

describe('isViewVisibleToUser', () => {
  it('allows a WORKSPACE view for anyone, including without an identity', () => {
    expect(
      isViewVisibleToUser(
        {
          visibility: ViewVisibility.WORKSPACE,
          createdByUserWorkspaceId: 'someone-else',
        },
        'me',
      ),
    ).toBe(true);
    expect(
      isViewVisibleToUser(
        {
          visibility: ViewVisibility.WORKSPACE,
          createdByUserWorkspaceId: null,
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
          createdByUserWorkspaceId: 'me',
        },
        'me',
      ),
    ).toBe(true);
  });

  it('denies an UNLISTED view to a non-owner', () => {
    expect(
      isViewVisibleToUser(
        {
          visibility: ViewVisibility.UNLISTED,
          createdByUserWorkspaceId: 'someone-else',
        },
        'me',
      ),
    ).toBe(false);
  });

  it('denies an UNLISTED view when there is no current identity', () => {
    expect(
      isViewVisibleToUser(
        { visibility: ViewVisibility.UNLISTED, createdByUserWorkspaceId: 'me' },
        undefined,
      ),
    ).toBe(false);
  });

  it('denies an ownerless UNLISTED view to everyone', () => {
    expect(
      isViewVisibleToUser(
        { visibility: ViewVisibility.UNLISTED, createdByUserWorkspaceId: null },
        'me',
      ),
    ).toBe(false);
  });
});
