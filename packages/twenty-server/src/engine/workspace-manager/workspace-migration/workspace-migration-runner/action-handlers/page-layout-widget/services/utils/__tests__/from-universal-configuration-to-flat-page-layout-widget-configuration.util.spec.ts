import { type MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/action-handlers/page-layout-widget/services/utils/from-universal-configuration-to-flat-page-layout-widget-configuration.util';

describe('fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration', () => {
  const flatViewMaps = {
    byUniversalIdentifier: {
      'view-universal-identifier': {
        id: 'view-id',
      },
    },
  } as unknown as MetadataFlatEntityMaps<'view'>;

  const commonArgs = {
    flatFieldMetadataMaps: {
      byUniversalIdentifier: {},
    } as unknown as MetadataFlatEntityMaps<'fieldMetadata'>,
    flatFrontComponentMaps: {
      byUniversalIdentifier: {},
    } as unknown as MetadataFlatEntityMaps<'frontComponent'>,
    flatViewMaps,
    flatViewFieldGroupMaps: {
      byUniversalIdentifier: {},
    } as unknown as MetadataFlatEntityMaps<'viewFieldGroup'>,
  };

  it('should resolve FIELDS legacy viewId as fallback when viewUniversalIdentifier is absent', () => {
    const result =
      fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration({
        universalConfiguration: {
          configurationType: WidgetConfigurationType.FIELDS,
          viewId: 'view-universal-identifier',
          shouldAllowUserToSeeHiddenFields: true,
        } as unknown as FlatPageLayoutWidget['universalConfiguration'],
        ...commonArgs,
      });

    expect(result).toEqual({
      configurationType: WidgetConfigurationType.FIELDS,
      viewId: 'view-id',
      shouldAllowUserToSeeHiddenFields: true,
    });
  });

  it('should prioritize viewUniversalIdentifier over legacy viewId when both are provided', () => {
    const result =
      fromUniversalConfigurationToFlatPageLayoutWidgetConfiguration({
        universalConfiguration: {
          configurationType: WidgetConfigurationType.FIELDS,
          viewUniversalIdentifier: 'view-universal-identifier',
          viewId: 'unused-legacy-view-universal-identifier',
          newFieldDefaultVisibility: true,
        } as unknown as FlatPageLayoutWidget['universalConfiguration'],
        ...commonArgs,
      });

    expect(result).toEqual({
      configurationType: WidgetConfigurationType.FIELDS,
      viewId: 'view-id',
      newFieldDefaultVisibility: true,
    });
  });
});
