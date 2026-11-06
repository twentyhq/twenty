import { DASHBOARD_DATE_RANGE_FILTER } from 'twenty-shared/constants';
import { ViewFilterOperand } from 'twenty-shared/types';

import { keepWorkspaceOwnedProperties } from 'src/engine/metadata-modules/flat-entity/utils/keep-workspace-owned-properties.util';

describe('keepWorkspaceOwnedProperties', () => {
  const standardPageLayout = {
    universalIdentifier: 'page-layout-universal-identifier',
    name: 'Default Company Layout',
    isFirstTabPinned: true,
  };

  it('should keep the value the workspace chose for a workspace-owned property', () => {
    const result = keepWorkspaceOwnedProperties({
      metadataName: 'pageLayout',
      fromFlatEntityMaps: {
        byUniversalIdentifier: {
          'page-layout-universal-identifier': {
            ...standardPageLayout,
            isFirstTabPinned: false,
          },
        },
      },
      toFlatEntityMaps: {
        byUniversalIdentifier: {
          'page-layout-universal-identifier': standardPageLayout,
        },
      },
    });

    expect(
      result.byUniversalIdentifier['page-layout-universal-identifier'],
    ).toEqual({ ...standardPageLayout, isFirstTabPinned: false });
  });

  it('should keep the standard value for an entity the workspace does not have yet', () => {
    const result = keepWorkspaceOwnedProperties({
      metadataName: 'pageLayout',
      fromFlatEntityMaps: { byUniversalIdentifier: {} },
      toFlatEntityMaps: {
        byUniversalIdentifier: {
          'page-layout-universal-identifier': standardPageLayout,
        },
      },
    });

    expect(
      result.byUniversalIdentifier['page-layout-universal-identifier'],
    ).toEqual(standardPageLayout);
  });

  it('should keep the standard value when the workspace entity predates the property', () => {
    const result = keepWorkspaceOwnedProperties({
      metadataName: 'pageLayout',
      fromFlatEntityMaps: {
        byUniversalIdentifier: {
          'page-layout-universal-identifier': {
            universalIdentifier: 'page-layout-universal-identifier',
            name: 'Default Company Layout',
          },
        },
      },
      toFlatEntityMaps: {
        byUniversalIdentifier: {
          'page-layout-universal-identifier': standardPageLayout,
        },
      },
    });

    expect(
      result.byUniversalIdentifier['page-layout-universal-identifier'],
    ).toEqual(standardPageLayout);
  });

  it('should keep the dashboard filters the workspace chose over the none an application ships', () => {
    const workspaceFilters = [
      {
        ...DASHBOARD_DATE_RANGE_FILTER,
        defaultValue: {
          conditions: [
            { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_1_MONTH' },
          ],
        },
      },
    ];

    const result = keepWorkspaceOwnedProperties({
      metadataName: 'pageLayout',
      fromFlatEntityMaps: {
        byUniversalIdentifier: {
          'page-layout-universal-identifier': {
            ...standardPageLayout,
            filters: workspaceFilters,
          },
        },
      },
      toFlatEntityMaps: {
        byUniversalIdentifier: {
          'page-layout-universal-identifier': {
            ...standardPageLayout,
            filters: null,
          },
        },
      },
    });

    expect(
      result.byUniversalIdentifier['page-layout-universal-identifier'],
    ).toEqual({ ...standardPageLayout, filters: workspaceFilters });
  });

  it('should keep the creator of a view the workspace already has', () => {
    const shippedView = {
      universalIdentifier: 'view-universal-identifier',
      name: 'All Companies',
      createdByUserWorkspaceId: null,
    };

    const result = keepWorkspaceOwnedProperties({
      metadataName: 'view',
      fromFlatEntityMaps: {
        byUniversalIdentifier: {
          'view-universal-identifier': {
            ...shippedView,
            createdByUserWorkspaceId: 'user-workspace-id',
          },
        },
      },
      toFlatEntityMaps: {
        byUniversalIdentifier: {
          'view-universal-identifier': shippedView,
        },
      },
    });

    expect(result.byUniversalIdentifier['view-universal-identifier']).toEqual({
      ...shippedView,
      createdByUserWorkspaceId: 'user-workspace-id',
    });
  });

  it('should return the standard entities untouched for a metadata without workspace-owned properties', () => {
    const toFlatEntityMaps = {
      byUniversalIdentifier: {
        'webhook-universal-identifier': { targetUrl: 'https://example.com' },
      },
    };

    const result = keepWorkspaceOwnedProperties({
      metadataName: 'webhook',
      fromFlatEntityMaps: {
        byUniversalIdentifier: {
          'webhook-universal-identifier': {
            targetUrl: 'https://workspace.example.com',
          },
        },
      },
      toFlatEntityMaps,
    });

    expect(result).toBe(toFlatEntityMaps);
  });
});
