import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getOneToManyChildrenApplicationIds } from 'src/engine/workspace-manager/workspace-migration/services/utils/get-one-to-many-children-application-ids.util';

const TWENTY_STANDARD_APPLICATION_ID = '20202020-0000-0000-0000-000000000001';
const WORKSPACE_CUSTOM_APPLICATION_ID = '20202020-0000-0000-0000-000000000002';

const STANDARD_VIEW_FIELD_UNIVERSAL_IDENTIFIER = 'view-field-standard';
const CUSTOM_VIEW_FIELD_UNIVERSAL_IDENTIFIER = 'view-field-custom-country';
const CUSTOM_VIEW_SORT_UNIVERSAL_IDENTIFIER = 'view-sort-custom-country';

// A standard view that also holds a custom-application view field and view sort
// (the canonical "custom field added to a standard object" case).
const buildStandardViewFlatEntity = () => ({
  universalIdentifier: 'view-all-workspace-members',
  applicationId: TWENTY_STANDARD_APPLICATION_ID,
  viewFieldUniversalIdentifiers: [
    STANDARD_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
    CUSTOM_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
  ],
  viewFilterUniversalIdentifiers: [],
  viewFilterGroupUniversalIdentifiers: [],
  viewGroupUniversalIdentifiers: [],
  viewFieldGroupUniversalIdentifiers: [],
  viewSortUniversalIdentifiers: [CUSTOM_VIEW_SORT_UNIVERSAL_IDENTIFIER],
});

const buildAllRelatedFlatEntityMaps = (): Partial<AllFlatEntityMaps> =>
  ({
    flatViewFieldMaps: {
      byUniversalIdentifier: {
        [STANDARD_VIEW_FIELD_UNIVERSAL_IDENTIFIER]: {
          universalIdentifier: STANDARD_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
          applicationId: TWENTY_STANDARD_APPLICATION_ID,
        },
        [CUSTOM_VIEW_FIELD_UNIVERSAL_IDENTIFIER]: {
          universalIdentifier: CUSTOM_VIEW_FIELD_UNIVERSAL_IDENTIFIER,
          applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
        },
      },
    },
    flatViewSortMaps: {
      byUniversalIdentifier: {
        [CUSTOM_VIEW_SORT_UNIVERSAL_IDENTIFIER]: {
          universalIdentifier: CUSTOM_VIEW_SORT_UNIVERSAL_IDENTIFIER,
          applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
        },
      },
    },
  }) as unknown as Partial<AllFlatEntityMaps>;

describe('getOneToManyChildrenApplicationIds', () => {
  it('returns the applications owning a parent’s children across applications', () => {
    const result = getOneToManyChildrenApplicationIds({
      metadataName: 'view',
      flatEntity: buildStandardViewFlatEntity(),
      allRelatedFlatEntityMaps: buildAllRelatedFlatEntityMaps(),
    });

    // Regression: the custom-application view field and view sort that live
    // inside the standard view must surface their owning application.
    expect(result).toEqual(
      expect.arrayContaining([
        TWENTY_STANDARD_APPLICATION_ID,
        WORKSPACE_CUSTOM_APPLICATION_ID,
      ]),
    );
    expect(result).toHaveLength(2);
  });

  it('returns an empty array for a metadata type without one-to-many relations', () => {
    const result = getOneToManyChildrenApplicationIds({
      metadataName: 'agent',
      flatEntity: { universalIdentifier: 'agent-1' },
      allRelatedFlatEntityMaps: buildAllRelatedFlatEntityMaps(),
    });

    expect(result).toEqual([]);
  });

  it('returns an empty array when the parent has no children', () => {
    const result = getOneToManyChildrenApplicationIds({
      metadataName: 'view',
      flatEntity: {
        universalIdentifier: 'empty-view',
        applicationId: TWENTY_STANDARD_APPLICATION_ID,
        viewFieldUniversalIdentifiers: [],
        viewFilterUniversalIdentifiers: [],
        viewFilterGroupUniversalIdentifiers: [],
        viewGroupUniversalIdentifiers: [],
        viewFieldGroupUniversalIdentifiers: [],
        viewSortUniversalIdentifiers: [],
      },
      allRelatedFlatEntityMaps: buildAllRelatedFlatEntityMaps(),
    });

    expect(result).toEqual([]);
  });

  it('skips child maps that are not loaded without throwing', () => {
    const allRelatedFlatEntityMaps = buildAllRelatedFlatEntityMaps();

    delete (allRelatedFlatEntityMaps as Record<string, unknown>)
      .flatViewSortMaps;

    const result = getOneToManyChildrenApplicationIds({
      metadataName: 'view',
      flatEntity: buildStandardViewFlatEntity(),
      allRelatedFlatEntityMaps,
    });

    // The view-field maps are still present, so both apps owning view fields are
    // returned; the missing view-sort map is simply skipped.
    expect(result).toEqual(
      expect.arrayContaining([
        TWENTY_STANDARD_APPLICATION_ID,
        WORKSPACE_CUSTOM_APPLICATION_ID,
      ]),
    );
  });
});
