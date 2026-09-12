import {
  getSystemPageLayoutTabUniversalIdentifier,
  getSystemRecordFormPageLayoutUniversalIdentifier,
} from 'twenty-shared/application';
import { PageLayoutTabLayoutMode, WidgetType } from 'twenty-shared/types';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

import { computeRecordFormWidgetForExistingObject } from '../compute-record-form-widget-for-existing-object.util';

type RecordFormFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  'flatPageLayoutTabMaps' | 'flatPageLayoutWidgetMaps'
>;

const applicationUniversalIdentifier = 'a1a2a3a4-a5a6-4000-8000-000000000001';
const objectUniversalIdentifier = 'b1b2b3b4-b5b6-4000-8000-000000000001';
const fieldUniversalIdentifier = 'c1c2c3c4-c5c6-4000-8000-000000000001';
const otherFieldUniversalIdentifier = 'c1c2c3c4-c5c6-4000-8000-000000000002';

const pageLayoutTabUniversalIdentifier =
  getSystemPageLayoutTabUniversalIdentifier({
    objectMetadataApplicationUniversalIdentifier:
      applicationUniversalIdentifier,
    pageLayoutUniversalIdentifier:
      getSystemRecordFormPageLayoutUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier:
          applicationUniversalIdentifier,
        objectUniversalIdentifier,
      }),
    title: 'Fields',
  });

const buildFlatFieldMetadata = (universalIdentifier: string) =>
  ({
    universalIdentifier,
    applicationUniversalIdentifier,
    objectMetadataUniversalIdentifier: objectUniversalIdentifier,
  }) as unknown as UniversalFlatFieldMetadata;

const sourceFlatFieldMetadata = buildFlatFieldMetadata(
  fieldUniversalIdentifier,
);

const secondFlatFieldMetadata = buildFlatFieldMetadata(
  otherFieldUniversalIdentifier,
);

const buildFlatPageLayoutTab = (overrides: Record<string, unknown> = {}) => ({
  universalIdentifier: pageLayoutTabUniversalIdentifier,
  isSystemSideEffect: true,
  deletedAt: null,
  widgetUniversalIdentifiers: [],
  ...overrides,
});

const buildFormFieldWidget = ({
  universalIdentifier,
  fieldMetadataId,
  index,
  deletedAt = null,
}: {
  universalIdentifier: string;
  fieldMetadataId: string;
  index: number;
  deletedAt?: string | null;
}) => ({
  universalIdentifier,
  type: WidgetType.FORM_FIELD,
  deletedAt,
  position: {
    layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    index,
  },
  universalConfiguration: {
    configurationType: WidgetConfigurationType.FORM_FIELD,
    fieldMetadataId,
  },
});

const buildMaps = ({
  flatPageLayoutTab,
  flatPageLayoutWidgets = {},
}: {
  flatPageLayoutTab?: ReturnType<typeof buildFlatPageLayoutTab>;
  flatPageLayoutWidgets?: Record<
    string,
    ReturnType<typeof buildFormFieldWidget>
  >;
}): RecordFormFlatEntityMaps =>
  ({
    flatPageLayoutTabMaps: {
      byUniversalIdentifier: flatPageLayoutTab
        ? { [pageLayoutTabUniversalIdentifier]: flatPageLayoutTab }
        : {},
    },
    flatPageLayoutWidgetMaps: {
      byUniversalIdentifier: flatPageLayoutWidgets,
    },
  }) as unknown as RecordFormFlatEntityMaps;

describe('computeRecordFormWidgetForExistingObject', () => {
  it('should append at index 0 on a tab with no widget', () => {
    const result = computeRecordFormWidgetForExistingObject({
      sourceFlatFieldMetadata,
      recordFormPageLayoutTabUniversalIdentifier:
        pageLayoutTabUniversalIdentifier,
      orderedFormFlatFieldMetadatasInBatch: [sourceFlatFieldMetadata],
      ...buildMaps({ flatPageLayoutTab: buildFlatPageLayoutTab() }),
    });

    expect(result?.position).toEqual({
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index: 0,
    });
  });

  it('should append after the last existing widget of the tab', () => {
    const result = computeRecordFormWidgetForExistingObject({
      sourceFlatFieldMetadata,
      recordFormPageLayoutTabUniversalIdentifier:
        pageLayoutTabUniversalIdentifier,
      orderedFormFlatFieldMetadatasInBatch: [sourceFlatFieldMetadata],
      ...buildMaps({
        flatPageLayoutTab: buildFlatPageLayoutTab({
          widgetUniversalIdentifiers: ['widget-1', 'widget-2'],
        }),
        flatPageLayoutWidgets: {
          'widget-1': buildFormFieldWidget({
            universalIdentifier: 'widget-1',
            fieldMetadataId: otherFieldUniversalIdentifier,
            index: 0,
          }),
          'widget-2': buildFormFieldWidget({
            universalIdentifier: 'widget-2',
            fieldMetadataId: 'c1c2c3c4-c5c6-4000-8000-000000000003',
            index: 4,
          }),
        },
      }),
    });

    expect(result?.position).toEqual({
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index: 5,
    });
  });

  it('should give each field of one batch a distinct index', () => {
    const maps = buildMaps({
      flatPageLayoutTab: buildFlatPageLayoutTab({
        widgetUniversalIdentifiers: ['widget-1'],
      }),
      flatPageLayoutWidgets: {
        'widget-1': buildFormFieldWidget({
          universalIdentifier: 'widget-1',
          fieldMetadataId: 'c1c2c3c4-c5c6-4000-8000-000000000009',
          index: 2,
        }),
      },
    });
    const orderedFormFlatFieldMetadatasInBatch = [
      sourceFlatFieldMetadata,
      secondFlatFieldMetadata,
    ];

    const indexes = orderedFormFlatFieldMetadatasInBatch.map(
      (flatFieldMetadata) =>
        computeRecordFormWidgetForExistingObject({
          sourceFlatFieldMetadata: flatFieldMetadata,
          orderedFormFlatFieldMetadatasInBatch,
          recordFormPageLayoutTabUniversalIdentifier:
            pageLayoutTabUniversalIdentifier,
          ...maps,
        })?.position,
    );

    expect(indexes).toEqual([
      { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 3 },
      { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 4 },
    ]);
  });

  it('should noop when the field already has a widget on the tab', () => {
    const result = computeRecordFormWidgetForExistingObject({
      sourceFlatFieldMetadata,
      recordFormPageLayoutTabUniversalIdentifier:
        pageLayoutTabUniversalIdentifier,
      orderedFormFlatFieldMetadatasInBatch: [sourceFlatFieldMetadata],
      ...buildMaps({
        flatPageLayoutTab: buildFlatPageLayoutTab({
          widgetUniversalIdentifiers: ['widget-1'],
        }),
        flatPageLayoutWidgets: {
          'widget-1': buildFormFieldWidget({
            universalIdentifier: 'widget-1',
            fieldMetadataId: fieldUniversalIdentifier,
            index: 0,
          }),
        },
      }),
    });

    expect(result).toBeUndefined();
  });

  it('should ignore a soft deleted widget for both idempotency and indexing', () => {
    const result = computeRecordFormWidgetForExistingObject({
      sourceFlatFieldMetadata,
      recordFormPageLayoutTabUniversalIdentifier:
        pageLayoutTabUniversalIdentifier,
      orderedFormFlatFieldMetadatasInBatch: [sourceFlatFieldMetadata],
      ...buildMaps({
        flatPageLayoutTab: buildFlatPageLayoutTab({
          widgetUniversalIdentifiers: ['widget-1'],
        }),
        flatPageLayoutWidgets: {
          'widget-1': buildFormFieldWidget({
            universalIdentifier: 'widget-1',
            fieldMetadataId: fieldUniversalIdentifier,
            index: 6,
            deletedAt: '2026-08-28T00:00:00.000Z',
          }),
        },
      }),
    });

    expect(result?.position).toEqual({
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index: 0,
    });
  });

  it('should not count another field soft deleted widget toward the append index', () => {
    const result = computeRecordFormWidgetForExistingObject({
      sourceFlatFieldMetadata,
      recordFormPageLayoutTabUniversalIdentifier:
        pageLayoutTabUniversalIdentifier,
      orderedFormFlatFieldMetadatasInBatch: [sourceFlatFieldMetadata],
      ...buildMaps({
        flatPageLayoutTab: buildFlatPageLayoutTab({
          widgetUniversalIdentifiers: ['widget-1'],
        }),
        flatPageLayoutWidgets: {
          'widget-1': buildFormFieldWidget({
            universalIdentifier: 'widget-1',
            fieldMetadataId: otherFieldUniversalIdentifier,
            index: 6,
            deletedAt: '2026-08-28T00:00:00.000Z',
          }),
        },
      }),
    });

    expect(result?.position).toEqual({
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index: 0,
    });
  });

  it('should noop when the object has no engine record form tab', () => {
    const result = computeRecordFormWidgetForExistingObject({
      sourceFlatFieldMetadata,
      recordFormPageLayoutTabUniversalIdentifier:
        pageLayoutTabUniversalIdentifier,
      orderedFormFlatFieldMetadatasInBatch: [sourceFlatFieldMetadata],
      ...buildMaps({}),
    });

    expect(result).toBeUndefined();
  });

  it.each([
    ['not engine owned', { isSystemSideEffect: false }],
    ['soft deleted', { deletedAt: '2026-08-28T00:00:00.000Z' }],
  ])('should noop when the record form tab is %s', (_label, overrides) => {
    const result = computeRecordFormWidgetForExistingObject({
      sourceFlatFieldMetadata,
      recordFormPageLayoutTabUniversalIdentifier:
        pageLayoutTabUniversalIdentifier,
      orderedFormFlatFieldMetadatasInBatch: [sourceFlatFieldMetadata],
      ...buildMaps({
        flatPageLayoutTab: buildFlatPageLayoutTab(overrides),
      }),
    });

    expect(result).toBeUndefined();
  });
});
