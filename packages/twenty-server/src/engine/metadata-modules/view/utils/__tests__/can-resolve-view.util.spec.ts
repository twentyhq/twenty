import { ViewVisibility } from 'twenty-shared/types';

import { canResolveView } from 'src/engine/metadata-modules/view/utils/can-resolve-view.util';

describe('canResolveView', () => {
  it('allows a WORKSPACE view for anyone, including without an identity', () => {
    expect(
      canResolveView(
        {
          visibility: ViewVisibility.WORKSPACE,
          createdByUserWorkspaceId: 'someone-else',
        },
        'me',
      ),
    ).toBe(true);
    expect(
      canResolveView(
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
      canResolveView(
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
      canResolveView(
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
      canResolveView(
        { visibility: ViewVisibility.UNLISTED, createdByUserWorkspaceId: 'me' },
        undefined,
      ),
    ).toBe(false);
  });

  it('denies an ownerless UNLISTED view to everyone', () => {
    expect(
      canResolveView(
        { visibility: ViewVisibility.UNLISTED, createdByUserWorkspaceId: null },
        'me',
      ),
    ).toBe(false);
  });
});
