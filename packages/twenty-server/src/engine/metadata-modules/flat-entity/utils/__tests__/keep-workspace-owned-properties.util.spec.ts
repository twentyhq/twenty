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

  it('should return the standard entities untouched for a metadata without workspace-owned properties', () => {
    const toFlatEntityMaps = {
      byUniversalIdentifier: {
        'view-universal-identifier': { name: 'All Companies' },
      },
    };

    const result = keepWorkspaceOwnedProperties({
      metadataName: 'view',
      fromFlatEntityMaps: {
        byUniversalIdentifier: {
          'view-universal-identifier': { name: 'Renamed by the workspace' },
        },
      },
      toFlatEntityMaps,
    });

    expect(result).toBe(toFlatEntityMaps);
  });
});
