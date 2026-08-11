import { FlatEntityMapsException } from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type FlatView } from 'src/engine/metadata-modules/flat-view/types/flat-view.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout-widget/services/utils/from-universal-configuration-to-flat-page-layout-widget-configuration.util';

const VIEW_ID = '20202020-aaaa-4aaa-8aaa-000000000001';
const VIEW_UNIVERSAL_IDENTIFIER = '20202020-bbbb-4bbb-8bbb-000000000002';
const UNKNOWN_UNIVERSAL_IDENTIFIER = '20202020-cccc-4ccc-8ccc-000000000003';

const createEmptyFlatEntityMaps = <
  T extends 'fieldMetadata' | 'frontComponent' | 'viewFieldGroup',
>() =>
  ({
    byUniversalIdentifier: {},
    universalIdentifierById: {},
    universalIdentifiersByApplicationId: {},
  }) as MetadataFlatEntityMaps<T>;

const flatViewMaps = {
  byUniversalIdentifier: {
    [VIEW_UNIVERSAL_IDENTIFIER]: {
      id: VIEW_ID,
      universalIdentifier: VIEW_UNIVERSAL_IDENTIFIER,
    } as FlatView,
  },
  universalIdentifierById: {
    [VIEW_ID]: VIEW_UNIVERSAL_IDENTIFIER,
  },
  universalIdentifiersByApplicationId: {},
} as MetadataFlatEntityMaps<'view'>;

const convertUniversalConfiguration = (universalConfiguration: unknown) =>
  fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration({
    universalConfiguration:
      universalConfiguration as FlatPageLayoutWidget['universalConfiguration'],
    flatFieldMetadataMaps: createEmptyFlatEntityMaps<'fieldMetadata'>(),
    flatFrontComponentMaps: createEmptyFlatEntityMaps<'frontComponent'>(),
    flatViewMaps,
    flatViewFieldGroupMaps: createEmptyFlatEntityMaps<'viewFieldGroup'>(),
  });

describe('fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration', () => {
  describe.each([
    [WidgetConfigurationType.FIELDS],
    [WidgetConfigurationType.RECORD_TABLE],
  ])('%s view resolution', (configurationType) => {
    it('should resolve viewUniversalIdentifier to the view id', () => {
      const result = convertUniversalConfiguration({
        configurationType,
        viewUniversalIdentifier: VIEW_UNIVERSAL_IDENTIFIER,
      });

      expect(result).toMatchObject({ configurationType, viewId: VIEW_ID });
    });

    it('should return a null viewId when no view reference is provided', () => {
      const result = convertUniversalConfiguration({ configurationType });

      expect(result).toMatchObject({ configurationType, viewId: null });
    });

    it('should throw when the referenced view is not found', () => {
      expect(() =>
        convertUniversalConfiguration({
          configurationType,
          viewUniversalIdentifier: UNKNOWN_UNIVERSAL_IDENTIFIER,
        }),
      ).toThrow(FlatEntityMapsException);
    });

    it.each([[VIEW_UNIVERSAL_IDENTIFIER], [''], [null]])(
      'should reject the removed viewId key holding %p instead of storing an unbound widget',
      (legacyViewId) => {
        expect(() =>
          convertUniversalConfiguration({
            configurationType,
            viewId: legacyViewId,
          }),
        ).toThrow(/rename it to "viewUniversalIdentifier"/);
      },
    );

    it('should reject the removed viewId key even when viewUniversalIdentifier is set', () => {
      expect(() =>
        convertUniversalConfiguration({
          configurationType,
          viewUniversalIdentifier: VIEW_UNIVERSAL_IDENTIFIER,
          viewId: VIEW_UNIVERSAL_IDENTIFIER,
        }),
      ).toThrow(/rename it to "viewUniversalIdentifier"/);
    });
  });
});
