import { keepExistingIdentifiersByNaturalKey } from 'src/engine/metadata-modules/flat-entity/utils/keep-existing-identifiers-by-natural-key.util';

type ViewFlatEntityMaps = {
  byUniversalIdentifier: Partial<
    Record<string, { universalIdentifier: string; name: string }>
  >;
};

const EXISTING_PERMISSION = {
  universalIdentifier: 'existing-universal-identifier',
  roleUniversalIdentifier: 'role-universal-identifier',
  objectMetadataUniversalIdentifier: 'object-universal-identifier',
  canReadObjectRecords: true,
};

describe('keepExistingIdentifiersByNaturalKey', () => {
  it('should move a manifest row onto the identifier of the workspace row with the same natural key', () => {
    const result = keepExistingIdentifiersByNaturalKey({
      metadataName: 'objectPermission',
      fromFlatEntityMaps: {
        byUniversalIdentifier: {
          'existing-universal-identifier': EXISTING_PERMISSION,
        },
      },
      toFlatEntityMaps: {
        byUniversalIdentifier: {
          'reminted-universal-identifier': {
            ...EXISTING_PERMISSION,
            universalIdentifier: 'reminted-universal-identifier',
            canReadObjectRecords: false,
          },
        },
      },
    });

    expect(result.byUniversalIdentifier).toEqual({
      'existing-universal-identifier': {
        ...EXISTING_PERMISSION,
        canReadObjectRecords: false,
      },
    });
  });

  it('should leave a manifest row that already carries the workspace identifier untouched', () => {
    const toFlatEntityMaps = {
      byUniversalIdentifier: {
        'existing-universal-identifier': EXISTING_PERMISSION,
      },
    };

    const result = keepExistingIdentifiersByNaturalKey({
      metadataName: 'objectPermission',
      fromFlatEntityMaps: {
        byUniversalIdentifier: {
          'existing-universal-identifier': EXISTING_PERMISSION,
        },
      },
      toFlatEntityMaps,
    });

    expect(result.byUniversalIdentifier).toEqual(
      toFlatEntityMaps.byUniversalIdentifier,
    );
  });

  it('should not re-key a row whose natural key is unknown to the workspace', () => {
    const result = keepExistingIdentifiersByNaturalKey({
      metadataName: 'rolePermissionFlag',
      fromFlatEntityMaps: {
        byUniversalIdentifier: {
          'existing-universal-identifier': {
            universalIdentifier: 'existing-universal-identifier',
            roleUniversalIdentifier: 'role-universal-identifier',
            permissionFlagUniversalIdentifier: 'workflows-flag',
          },
        },
      },
      toFlatEntityMaps: {
        byUniversalIdentifier: {
          'new-universal-identifier': {
            universalIdentifier: 'new-universal-identifier',
            roleUniversalIdentifier: 'role-universal-identifier',
            permissionFlagUniversalIdentifier: 'settings-flag',
          },
        },
      },
    });

    expect(Object.keys(result.byUniversalIdentifier)).toEqual([
      'new-universal-identifier',
    ]);
  });

  it('should leave both rows alone when the workspace identifier is already taken in the manifest', () => {
    const toByUniversalIdentifier = {
      'existing-universal-identifier': EXISTING_PERMISSION,
      'reminted-universal-identifier': {
        ...EXISTING_PERMISSION,
        universalIdentifier: 'reminted-universal-identifier',
      },
    };

    const result = keepExistingIdentifiersByNaturalKey({
      metadataName: 'objectPermission',
      fromFlatEntityMaps: {
        byUniversalIdentifier: {
          'existing-universal-identifier': EXISTING_PERMISSION,
        },
      },
      toFlatEntityMaps: { byUniversalIdentifier: toByUniversalIdentifier },
    });

    expect(result.byUniversalIdentifier).toEqual(toByUniversalIdentifier);
  });

  it('should return the manifest maps untouched for a metadata without natural key', () => {
    const toFlatEntityMaps: ViewFlatEntityMaps = {
      byUniversalIdentifier: {
        'view-universal-identifier': {
          universalIdentifier: 'view-universal-identifier',
          name: 'All Companies',
        },
      },
    };
    const fromFlatEntityMaps: ViewFlatEntityMaps = {
      byUniversalIdentifier: {},
    };

    const result = keepExistingIdentifiersByNaturalKey({
      metadataName: 'view',
      fromFlatEntityMaps,
      toFlatEntityMaps,
    });

    expect(result).toBe(toFlatEntityMaps);
  });
});
