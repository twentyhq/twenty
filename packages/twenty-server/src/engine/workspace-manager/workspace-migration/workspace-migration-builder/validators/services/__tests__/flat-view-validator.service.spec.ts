import { ViewKey, ViewType } from 'twenty-shared/types';

import { FlatViewValidatorService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/services/flat-view-validator.service';

const OBJECT_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000b1';
const VIEW_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000c1';
const OTHER_VIEW_UNIVERSAL_IDENTIFIER = '00000000-0000-4000-8000-0000000000c2';

type TestFlatView = {
  universalIdentifier: string;
  objectMetadataUniversalIdentifier: string;
  key: ViewKey | null;
  type: ViewType;
  isSystemSideEffect: boolean;
  deletedAt: string | null;
};

const buildFlatView = (
  overrides: Partial<TestFlatView> = {},
): TestFlatView => ({
  universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER,
  objectMetadataUniversalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  key: null,
  type: ViewType.TABLE,
  isSystemSideEffect: false,
  deletedAt: null,
  ...overrides,
});

const mapsFrom = (
  entities: { universalIdentifier: string; [key: string]: unknown }[],
) => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier, entity]),
  ),
});

const buildCreationArgs = ({
  flatViewToValidate,
  existingFlatViews = [],
}: {
  flatViewToValidate: TestFlatView;
  existingFlatViews?: TestFlatView[];
}) =>
  ({
    flatEntityToValidate: flatViewToValidate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewMaps: mapsFrom(existingFlatViews),
      flatFieldMetadataMaps: mapsFrom([]),
      flatObjectMetadataMaps: mapsFrom([
        {
          universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
          viewUniversalIdentifiers: existingFlatViews.map(
            (existingFlatView) => existingFlatView.universalIdentifier,
          ),
        },
      ]),
    },
    additionalCacheDataMaps: { featureFlagsMap: {} },
  }) as unknown as Parameters<
    FlatViewValidatorService['validateFlatViewCreation']
  >[0];

const buildUpdateArgs = ({
  flatEntityUpdate,
  existingFlatView,
}: {
  flatEntityUpdate: Record<string, unknown>;
  existingFlatView: TestFlatView;
}) =>
  ({
    universalIdentifier: existingFlatView.universalIdentifier,
    flatEntityUpdate,
    optimisticFlatEntityMapsAndRelatedFlatEntityMaps: {
      flatViewMaps: mapsFrom([existingFlatView]),
      flatFieldMetadataMaps: mapsFrom([]),
    },
    additionalCacheDataMaps: { featureFlagsMap: {} },
  }) as unknown as Parameters<
    FlatViewValidatorService['validateFlatViewUpdate']
  >[0];

describe('FlatViewValidatorService INDEX key reservation', () => {
  let service: FlatViewValidatorService;

  beforeEach(() => {
    service = new FlatViewValidatorService();
  });

  describe('creation', () => {
    it('rejects a caller-provided INDEX view', () => {
      const result = service.validateFlatViewCreation(
        buildCreationArgs({
          flatViewToValidate: buildFlatView({
            key: ViewKey.INDEX,
            isSystemSideEffect: false,
          }),
        }),
      );

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('reserved');
    });

    it('accepts an engine-emitted INDEX view', () => {
      const result = service.validateFlatViewCreation(
        buildCreationArgs({
          flatViewToValidate: buildFlatView({
            key: ViewKey.INDEX,
            isSystemSideEffect: true,
          }),
        }),
      );

      expect(result.errors).toEqual([]);
    });

    it('rejects a second INDEX view on the same object', () => {
      const result = service.validateFlatViewCreation(
        buildCreationArgs({
          flatViewToValidate: buildFlatView({
            key: ViewKey.INDEX,
            isSystemSideEffect: true,
          }),
          existingFlatViews: [
            buildFlatView({
              universalIdentifier: OTHER_VIEW_UNIVERSAL_IDENTIFIER,
              key: ViewKey.INDEX,
              isSystemSideEffect: true,
            }),
          ],
        }),
      );

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('already has an INDEX view');
    });

    it('ignores a soft-deleted INDEX view when checking the singleton', () => {
      const result = service.validateFlatViewCreation(
        buildCreationArgs({
          flatViewToValidate: buildFlatView({
            key: ViewKey.INDEX,
            isSystemSideEffect: true,
          }),
          existingFlatViews: [
            buildFlatView({
              universalIdentifier: OTHER_VIEW_UNIVERSAL_IDENTIFIER,
              key: ViewKey.INDEX,
              isSystemSideEffect: true,
              deletedAt: '2024-01-01T00:00:00.000Z',
            }),
          ],
        }),
      );

      expect(result.errors).toEqual([]);
    });

    it('accepts a caller-provided view without a key', () => {
      const result = service.validateFlatViewCreation(
        buildCreationArgs({
          flatViewToValidate: buildFlatView({ key: null }),
        }),
      );

      expect(result.errors).toEqual([]);
    });
  });

  describe('update', () => {
    // The key is not a comparable nor editable property, so promote/demote
    // attempts cannot reach the update validator; unrelated updates on an
    // INDEX view stay allowed.
    it('accepts an update on an INDEX view', () => {
      const result = service.validateFlatViewUpdate(
        buildUpdateArgs({
          flatEntityUpdate: { name: 'Renamed default view' },
          existingFlatView: buildFlatView({
            key: ViewKey.INDEX,
            isSystemSideEffect: true,
          }),
        }),
      );

      expect(result.errors).toEqual([]);
    });
  });
});
