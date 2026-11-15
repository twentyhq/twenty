import { ViewVisibility } from 'twenty-shared/types';

import { inheritScopeViewOwnerVisibility } from 'src/engine/metadata-modules/flat-view/utils/inherit-scope-view-owner-visibility.util';

describe('inheritScopeViewOwnerVisibility', () => {
  it('gives the scope view the visibility and creator of its owner view', () => {
    const scopeView = inheritScopeViewOwnerVisibility({
      flatViewToCreate: {
        id: 'scope-view-id',
        visibility: ViewVisibility.WORKSPACE,
        createdByUserWorkspaceId: 'scope-creator-id',
      },
      ownerParentFlatView: {
        visibility: ViewVisibility.UNLISTED,
        createdByUserWorkspaceId: 'owner-creator-id',
      },
    });

    expect(scopeView).toEqual({
      id: 'scope-view-id',
      visibility: ViewVisibility.UNLISTED,
      createdByUserWorkspaceId: 'owner-creator-id',
    });
  });
});
