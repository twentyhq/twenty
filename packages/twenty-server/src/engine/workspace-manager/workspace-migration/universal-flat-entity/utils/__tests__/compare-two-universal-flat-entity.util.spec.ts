import { extractRecordIdsAndDatesAsExpectAny } from 'test/utils/extract-record-ids-and-dates-as-expect-any';
import { type AllMetadataName } from 'twenty-shared/metadata';
import {
  eachTestingContextFilter,
  type EachTestingContext,
} from 'twenty-shared/testing';
import {
  FieldMetadataType,
  type FromTo,
  PageLayoutTabLayoutMode,
} from 'twenty-shared/types';

import { type MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type UniversalFlatPageLayoutTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-tab.type';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const getUniversalFlatPageLayoutTabMock = (
  overrides: Partial<UniversalFlatPageLayoutTab>,
): UniversalFlatPageLayoutTab => ({
  universalIdentifier: 'page-layout-tab-universal-identifier',
  applicationUniversalIdentifier: 'application-universal-identifier',
  title: 'Tab title',
  position: 0,
  pageLayoutUniversalIdentifier: 'page-layout-universal-identifier',
  icon: null,
  layoutMode: PageLayoutTabLayoutMode.GRID,
  isActive: true,
  isSystemSideEffect: false,
  widgetUniversalIdentifiers: [],
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  deletedAt: null,
  overrides: null,
  ...overrides,
});

type TestContext<T extends AllMetadataName = AllMetadataName> = FromTo<
  MetadataUniversalFlatEntity<T>,
  'universalFlatEntity'
> & { metadataName: T };

describe('compareTwoFlatEntity', () => {
  const testCases = [
    {
      title:
        'It should detect flat field metadata isActive diff from true to false',
      context: {
        fromUniversalFlatEntity: getFlatFieldMetadataMock({
          objectMetadataId: 'object-metadata-id',
          type: FieldMetadataType.TEXT,
          universalIdentifier: 'universal-identifier',
          isActive: true,
        }),
        metadataName: 'fieldMetadata',
        toUniversalFlatEntity: getFlatFieldMetadataMock({
          objectMetadataId: 'object-metadata-id',
          type: FieldMetadataType.TEXT,
          universalIdentifier: 'universal-identifier',
          isActive: false,
        }),
      },
    },
    {
      title:
        'It should detect flat field metadata isActive diff from true to false',
      context: {
        fromUniversalFlatEntity: getFlatFieldMetadataMock({
          objectMetadataId: 'object-metadata-id',
          type: FieldMetadataType.TEXT,
          universalIdentifier: 'universal-identifier',
          isActive: false,
        }),
        metadataName: 'fieldMetadata',
        toUniversalFlatEntity: getFlatFieldMetadataMock({
          objectMetadataId: 'object-metadata-id',
          type: FieldMetadataType.TEXT,
          universalIdentifier: 'universal-identifier',
          isActive: true,
        }),
      },
    },
  ] as const satisfies EachTestingContext<TestContext>[];

  test.each(eachTestingContextFilter(testCases))(
    '$title',
    ({
      context: { metadataName, fromUniversalFlatEntity, toUniversalFlatEntity },
    }) => {
      const result = compareTwoFlatEntity({
        fromUniversalFlatEntity,
        toUniversalFlatEntity,
        metadataName,
      });

      expect(result).toMatchSnapshot(
        extractRecordIdsAndDatesAsExpectAny({ ...result }),
      );
    },
  );

  describe('non updatable property divergence reporting', () => {
    it('should report a divergence when only layoutMode differs on pageLayoutTab', () => {
      const result = compareTwoFlatEntity({
        fromUniversalFlatEntity: getUniversalFlatPageLayoutTabMock({}),
        toUniversalFlatEntity: getUniversalFlatPageLayoutTabMock({
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        }),
        metadataName: 'pageLayoutTab',
      });

      expect(result).toEqual({
        update: {},
        nonUpdatablePropertyDivergences: [
          {
            property: 'layoutMode',
            fromValue: PageLayoutTabLayoutMode.GRID,
            toValue: PageLayoutTabLayoutMode.VERTICAL_LIST,
          },
        ],
      });
    });

    it('should report a divergence alongside a comparable property update', () => {
      const result = compareTwoFlatEntity({
        fromUniversalFlatEntity: getUniversalFlatPageLayoutTabMock({}),
        toUniversalFlatEntity: getUniversalFlatPageLayoutTabMock({
          title: 'Renamed tab title',
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        }),
        metadataName: 'pageLayoutTab',
      });

      expect(result).toEqual({
        update: { title: 'Renamed tab title' },
        nonUpdatablePropertyDivergences: [
          {
            property: 'layoutMode',
            fromValue: PageLayoutTabLayoutMode.GRID,
            toValue: PageLayoutTabLayoutMode.VERTICAL_LIST,
          },
        ],
      });
    });

    it('should report a divergence when pageLayoutUniversalIdentifier differs on pageLayoutTab', () => {
      const result = compareTwoFlatEntity({
        fromUniversalFlatEntity: getUniversalFlatPageLayoutTabMock({}),
        toUniversalFlatEntity: getUniversalFlatPageLayoutTabMock({
          pageLayoutUniversalIdentifier:
            'another-page-layout-universal-identifier',
        }),
        metadataName: 'pageLayoutTab',
      });

      expect(result).toEqual({
        update: {},
        nonUpdatablePropertyDivergences: [
          {
            property: 'pageLayoutUniversalIdentifier',
            fromValue: 'page-layout-universal-identifier',
            toValue: 'another-page-layout-universal-identifier',
          },
        ],
      });
    });

    it('should return undefined when only silently ignored non-comparable properties differ', () => {
      const result = compareTwoFlatEntity({
        fromUniversalFlatEntity: getUniversalFlatPageLayoutTabMock({}),
        toUniversalFlatEntity: getUniversalFlatPageLayoutTabMock({
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
          isSystemSideEffect: true,
        }),
        metadataName: 'pageLayoutTab',
      });

      expect(result).toBeUndefined();
    });

    it('should not report any divergence when only comparable properties differ', () => {
      const result = compareTwoFlatEntity({
        fromUniversalFlatEntity: getUniversalFlatPageLayoutTabMock({}),
        toUniversalFlatEntity: getUniversalFlatPageLayoutTabMock({
          title: 'Renamed tab title',
        }),
        metadataName: 'pageLayoutTab',
      });

      expect(result).toEqual({
        update: { title: 'Renamed tab title' },
        nonUpdatablePropertyDivergences: [],
      });
    });
  });
});
