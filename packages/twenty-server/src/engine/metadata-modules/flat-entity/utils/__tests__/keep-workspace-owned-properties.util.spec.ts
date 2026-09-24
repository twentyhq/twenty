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

  it('should keep a skill deactivated by the workspace', () => {
    const shippedSkill = {
      universalIdentifier: 'skill-universal-identifier',
      name: 'summarize',
      isActive: true,
    };

    const result = keepWorkspaceOwnedProperties({
      metadataName: 'skill',
      fromFlatEntityMaps: {
        byUniversalIdentifier: {
          'skill-universal-identifier': { ...shippedSkill, isActive: false },
        },
      },
      toFlatEntityMaps: {
        byUniversalIdentifier: {
          'skill-universal-identifier': shippedSkill,
        },
      },
    });

    expect(result.byUniversalIdentifier['skill-universal-identifier']).toEqual({
      ...shippedSkill,
      isActive: false,
    });
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
        'role-universal-identifier': { label: 'Manager' },
      },
    };

    const result = keepWorkspaceOwnedProperties({
      metadataName: 'role',
      fromFlatEntityMaps: {
        byUniversalIdentifier: {
          'role-universal-identifier': { label: 'Renamed by the workspace' },
        },
      },
      toFlatEntityMaps,
    });

    expect(result).toBe(toFlatEntityMaps);
  });
});
