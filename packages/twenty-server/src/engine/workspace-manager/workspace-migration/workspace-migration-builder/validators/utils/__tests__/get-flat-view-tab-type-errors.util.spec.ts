import { ViewTabType } from 'twenty-shared/types';

import { type MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { type UniversalFlatViewTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-tab.type';
import { getFlatViewTabTypeErrors } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-flat-view-tab-type-errors.util';

type ViewTabInput = Pick<
  UniversalFlatViewTab,
  'universalIdentifier' | 'type' | 'fieldValue' | 'name'
> &
  Partial<Pick<UniversalFlatViewTab, 'deletedAt'>>;

const buildViewTab = (viewTab: Partial<ViewTabInput>): ViewTabInput => ({
  universalIdentifier: 'new-tab',
  type: ViewTabType.FIELD_VALUE,
  fieldValue: 'won',
  name: null,
  ...viewTab,
});

const validate = ({
  viewTab,
  existingViewTabs = [],
}: {
  viewTab: ViewTabInput;
  existingViewTabs?: ViewTabInput[];
}) =>
  getFlatViewTabTypeErrors({
    viewTab,
    flatView: {
      viewTabUniversalIdentifiers: existingViewTabs.map(
        ({ universalIdentifier }) => universalIdentifier,
      ),
    },
    flatViewTabMaps: {
      byUniversalIdentifier: Object.fromEntries(
        existingViewTabs.map((existingViewTab) => [
          existingViewTab.universalIdentifier,
          { deletedAt: null, ...existingViewTab },
        ]),
      ),
    } as unknown as MetadataUniversalFlatEntityMaps<'viewTab'>,
  }).map(({ message }) => message);

describe('getFlatViewTabTypeErrors', () => {
  describe('FIELD_VALUE', () => {
    it('accepts a tab with a field value and no name', () => {
      expect(validate({ viewTab: buildViewTab({}) })).toEqual([]);
    });

    it('rejects a tab without a field value', () => {
      expect(validate({ viewTab: buildViewTab({ fieldValue: null }) })).toEqual(
        ['Field value is required for a field value tab'],
      );
    });

    it('rejects a tab with an empty field value', () => {
      expect(validate({ viewTab: buildViewTab({ fieldValue: '' }) })).toEqual([
        'Field value is required for a field value tab',
      ]);
    });

    it('rejects a tab with a name', () => {
      expect(validate({ viewTab: buildViewTab({ name: 'Won' }) })).toEqual([
        'A field value tab cannot have a name',
      ]);
    });

    it('rejects a second tab for the same field value of the view', () => {
      expect(
        validate({
          viewTab: buildViewTab({}),
          existingViewTabs: [buildViewTab({ universalIdentifier: 'other' })],
        }),
      ).toEqual(['This view already has a tab for this value']);
    });

    it('accepts tabs for different field values of the view', () => {
      expect(
        validate({
          viewTab: buildViewTab({}),
          existingViewTabs: [
            buildViewTab({ universalIdentifier: 'other', fieldValue: 'lost' }),
          ],
        }),
      ).toEqual([]);
    });

    it('ignores the tab itself when it is already in the view', () => {
      const viewTab = buildViewTab({});

      expect(validate({ viewTab, existingViewTabs: [viewTab] })).toEqual([]);
    });

    it('ignores a soft-deleted tab for the same field value', () => {
      expect(
        validate({
          viewTab: buildViewTab({}),
          existingViewTabs: [
            buildViewTab({
              universalIdentifier: 'other',
              deletedAt: '2026-01-01T00:00:00.000Z',
            }),
          ],
        }),
      ).toEqual([]);
    });
  });

  describe.each([ViewTabType.NO_VALUE, ViewTabType.ALL])('%s', (type) => {
    const buildTypedViewTab = (viewTab: Partial<ViewTabInput> = {}) =>
      buildViewTab({ type, fieldValue: null, name: null, ...viewTab });

    it('accepts a tab without field value nor name', () => {
      expect(validate({ viewTab: buildTypedViewTab() })).toEqual([]);
    });

    it('rejects a tab with a field value', () => {
      expect(
        validate({ viewTab: buildTypedViewTab({ fieldValue: 'won' }) }),
      ).toEqual(['This tab type cannot have a field value or a name']);
    });

    it('rejects a tab with a name', () => {
      expect(validate({ viewTab: buildTypedViewTab({ name: 'Tab' }) })).toEqual(
        ['This tab type cannot have a field value or a name'],
      );
    });

    it('rejects a second tab of this type on the view', () => {
      expect(
        validate({
          viewTab: buildTypedViewTab(),
          existingViewTabs: [
            buildTypedViewTab({ universalIdentifier: 'other' }),
          ],
        }),
      ).toEqual(['This view already has a tab for this value']);
    });
  });

  it('accepts one NO_VALUE and one ALL tab on the same view', () => {
    expect(
      validate({
        viewTab: buildViewTab({
          type: ViewTabType.ALL,
          fieldValue: null,
        }),
        existingViewTabs: [
          buildViewTab({
            universalIdentifier: 'other',
            type: ViewTabType.NO_VALUE,
            fieldValue: null,
          }),
        ],
      }),
    ).toEqual([]);
  });

  describe('CUSTOM', () => {
    const buildCustomViewTab = (viewTab: Partial<ViewTabInput> = {}) =>
      buildViewTab({
        type: ViewTabType.CUSTOM,
        fieldValue: null,
        name: 'Big deals',
        ...viewTab,
      });

    it('accepts a tab with a name and no field value', () => {
      expect(validate({ viewTab: buildCustomViewTab() })).toEqual([]);
    });

    it('rejects a tab without a name', () => {
      expect(validate({ viewTab: buildCustomViewTab({ name: null }) })).toEqual(
        ['Name is required for a custom tab'],
      );
    });

    it('rejects a tab with an empty name', () => {
      expect(validate({ viewTab: buildCustomViewTab({ name: '' }) })).toEqual([
        'Name is required for a custom tab',
      ]);
    });

    it('rejects a tab with a field value', () => {
      expect(
        validate({ viewTab: buildCustomViewTab({ fieldValue: 'won' }) }),
      ).toEqual(['A custom tab cannot have a field value']);
    });

    it('accepts several custom tabs with the same name on a view', () => {
      expect(
        validate({
          viewTab: buildCustomViewTab(),
          existingViewTabs: [
            buildCustomViewTab({ universalIdentifier: 'other' }),
          ],
        }),
      ).toEqual([]);
    });
  });
});
