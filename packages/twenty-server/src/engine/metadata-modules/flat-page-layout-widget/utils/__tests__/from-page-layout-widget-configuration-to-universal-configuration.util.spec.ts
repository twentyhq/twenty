import { fromPageLayoutWidgetConfigurationToUniversalConfiguration } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/from-page-layout-widget-configuration-to-universal-configuration.util';
import { FieldDisplayMode } from 'src/engine/metadata-modules/page-layout-widget/enums/field-display-mode.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

describe('fromPageLayoutWidgetConfigurationToUniversalConfiguration', () => {
  it('should preserve disabled widget content editing on field configurations', () => {
    const fieldMetadataId = '3e20d40a-0e85-44c1-8fa8-f802e8a1edce';
    const fieldMetadataUniversalIdentifier =
      'eb7b0329-4069-4de3-8f7c-6e6e3451e4f0';

    expect(
      fromPageLayoutWidgetConfigurationToUniversalConfiguration({
        configuration: {
          configurationType: WidgetConfigurationType.FIELD,
          fieldMetadataId,
          fieldDisplayMode: FieldDisplayMode.TABLE,
          isWidgetContentEditable: false,
        },
        fieldMetadataUniversalIdentifierById: {
          [fieldMetadataId]: fieldMetadataUniversalIdentifier,
        },
      }),
    ).toMatchObject({
      fieldMetadataId: fieldMetadataUniversalIdentifier,
      isWidgetContentEditable: false,
    });
  });

  it('should preserve disabled widget content editing on record table configurations', () => {
    expect(
      fromPageLayoutWidgetConfigurationToUniversalConfiguration({
        configuration: {
          configurationType: WidgetConfigurationType.RECORD_TABLE,
          isWidgetContentEditable: false,
        },
        fieldMetadataUniversalIdentifierById: {},
      }),
    ).toMatchObject({
      isWidgetContentEditable: false,
    });
  });
});
