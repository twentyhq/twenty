import {
  INVALID_HORIZONTAL_BAR_CHART_CONFIG_MISSING_GROUP_BY,
  INVALID_IFRAME_CONFIG_BAD_URL,
  INVALID_IFRAME_CONFIG_EMPTY_URL,
  INVALID_NUMBER_CHART_CONFIG_BAD_UUID,
  INVALID_NUMBER_CHART_CONFIG_MISSING_FIELDS,
  INVALID_STANDALONE_RICH_TEXT_CONFIG_BODY_WRONG_TYPE,
  INVALID_STANDALONE_RICH_TEXT_CONFIG_MISSING_BODY,
  INVALID_VERTICAL_BAR_CHART_CONFIG_MISSING_GROUP_BY,
  TEST_HORIZONTAL_BAR_CHART_CONFIG,
  TEST_HORIZONTAL_BAR_CHART_CONFIG_MINIMAL,
  TEST_IFRAME_CONFIG,
  TEST_LINE_CHART_CONFIG,
  TEST_NUMBER_CHART_CONFIG,
  TEST_NUMBER_CHART_CONFIG_MINIMAL,
  TEST_PIE_CHART_CONFIG,
  TEST_STANDALONE_RICH_TEXT_CONFIG,
  TEST_STANDALONE_RICH_TEXT_CONFIG_MINIMAL,
  TEST_VERTICAL_BAR_CHART_CONFIG,
  TEST_VERTICAL_BAR_CHART_CONFIG_MINIMAL,
} from 'test/integration/constants/widget-configuration-test-data.constants';

import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { validateWidgetConfigurationInputOrThrow } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-widget-configuration-input-or-throw.util';

describe('validateWidgetConfigurationInputOrThrow', () => {
  describe('EMAIL_THREAD widget', () => {
    it('should not throw for valid email thread configuration', () => {
      expect(() =>
        validateWidgetConfigurationInputOrThrow({
          configuration: {
            configurationType: WidgetConfigurationType.EMAIL_THREAD,
          },
        }),
      ).not.toThrow();
    });
  });

  describe('MESSAGE_CAMPAIGN_BODY widget', () => {
    it('should not throw for valid message campaign body configuration', () => {
      expect(() =>
        validateWidgetConfigurationInputOrThrow({
          configuration: {
            configurationType: WidgetConfigurationType.MESSAGE_CAMPAIGN_BODY,
          },
        }),
      ).not.toThrow();
    });
  });

  describe('MESSAGE_CAMPAIGN_DETAILS widget', () => {
    it('should not throw for valid message campaign details configuration', () => {
      expect(() =>
        validateWidgetConfigurationInputOrThrow({
          configuration: {
            configurationType: WidgetConfigurationType.MESSAGE_CAMPAIGN_DETAILS,
          },
        }),
      ).not.toThrow();
    });
  });

  describe('CALL_RECORDING_SUMMARY widget', () => {
    it('should not throw for valid call recording summary configuration', () => {
      expect(() =>
        validateWidgetConfigurationInputOrThrow({
          configuration: {
            configurationType: WidgetConfigurationType.CALL_RECORDING_SUMMARY,
          },
        }),
      ).not.toThrow();
    });
  });

  describe('CALL_RECORDING_TRANSCRIPT widget', () => {
    it('should not throw for valid call recording transcript configuration', () => {
      expect(() =>
        validateWidgetConfigurationInputOrThrow({
          configuration: {
            configurationType:
              WidgetConfigurationType.CALL_RECORDING_TRANSCRIPT,
          },
        }),
      ).not.toThrow();
    });
  });

  describe('CHAT_THREADS widget', () => {
    it('should not throw for valid chat threads configuration', () => {
      expect(() =>
        validateWidgetConfigurationInputOrThrow({
          configuration: {
            configurationType: WidgetConfigurationType.CHAT_THREADS,
          },
        }),
      ).not.toThrow();
    });
  });

  describe('IFRAME widget', () => {
    it('should not throw for valid iframe configuration', () => {
      expect(() =>
        validateWidgetConfigurationInputOrThrow({
          configuration: TEST_IFRAME_CONFIG,
        }),
      ).not.toThrow();
    });

    it('should throw error for invalid URL', () => {
      expect(() =>
        validateWidgetConfigurationInputOrThrow({
          configuration: {
            ...INVALID_IFRAME_CONFIG_BAD_URL,
            configurationType: WidgetConfigurationType.IFRAME,
          },
        }),
      ).toThrow(/url must be a URL address/);
    });

    it('should throw error for empty URL', () => {
      expect(() =>
        validateWidgetConfigurationInputOrThrow({
          configuration: {
            ...INVALID_IFRAME_CONFIG_EMPTY_URL,
            configurationType: WidgetConfigurationType.IFRAME,
          },
        }),
      ).toThrow(/url must be a URL address/);
    });
  });

  describe('STANDALONE_RICH_TEXT widget', () => {
    it('should not throw for valid standalone rich text configuration', () => {
      expect(() =>
        validateWidgetConfigurationInputOrThrow({
          configuration: TEST_STANDALONE_RICH_TEXT_CONFIG,
        }),
      ).not.toThrow();
    });

    it('should not throw for minimal standalone rich text configuration', () => {
      expect(() =>
        validateWidgetConfigurationInputOrThrow({
          configuration: TEST_STANDALONE_RICH_TEXT_CONFIG_MINIMAL,
        }),
      ).not.toThrow();
    });

    it('should throw error for missing body', () => {
      expect(() =>
        validateWidgetConfigurationInputOrThrow({
          configuration: {
            ...INVALID_STANDALONE_RICH_TEXT_CONFIG_MISSING_BODY,
            configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
          },
        }),
      ).toThrow(/body/);
    });

    it('should throw error when body is wrong type', () => {
      expect(() =>
        validateWidgetConfigurationInputOrThrow({
          configuration: {
            ...INVALID_STANDALONE_RICH_TEXT_CONFIG_BODY_WRONG_TYPE,
            configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
          },
        }),
      ).toThrow();
    });
  });

  describe('GRAPH widget', () => {
    describe('AGGREGATE_CHART graph', () => {
      it('should not throw for full aggregate chart configuration', () => {
        expect(() =>
          validateWidgetConfigurationInputOrThrow({
            configuration: TEST_NUMBER_CHART_CONFIG,
          }),
        ).not.toThrow();
      });

      it('should not throw for minimal aggregate chart configuration', () => {
        expect(() =>
          validateWidgetConfigurationInputOrThrow({
            configuration: TEST_NUMBER_CHART_CONFIG_MINIMAL,
          }),
        ).not.toThrow();
      });

      it('should throw error for partial aggregate chart configuration with missing required fields', () => {
        expect(() =>
          validateWidgetConfigurationInputOrThrow({
            configuration: INVALID_NUMBER_CHART_CONFIG_MISSING_FIELDS,
          }),
        ).toThrow(/aggregateFieldMetadataId.*aggregateOperation/);
      });

      it('should throw error for invalid UUID', () => {
        expect(() =>
          validateWidgetConfigurationInputOrThrow({
            configuration: INVALID_NUMBER_CHART_CONFIG_BAD_UUID,
          }),
        ).toThrow(/aggregateFieldMetadataId must be a UUID/);
      });
    });

    describe('BAR_CHART graph', () => {
      describe('VERTICAL layout', () => {
        it('should not throw for full vertical bar chart configuration', () => {
          expect(() =>
            validateWidgetConfigurationInputOrThrow({
              configuration: TEST_VERTICAL_BAR_CHART_CONFIG,
            }),
          ).not.toThrow();
        });

        it('should not throw for minimal vertical bar chart configuration', () => {
          expect(() =>
            validateWidgetConfigurationInputOrThrow({
              configuration: TEST_VERTICAL_BAR_CHART_CONFIG_MINIMAL,
            }),
          ).not.toThrow();
        });

        it('should throw error for partial vertical bar chart configuration with missing required fields', () => {
          expect(() =>
            validateWidgetConfigurationInputOrThrow({
              configuration: INVALID_VERTICAL_BAR_CHART_CONFIG_MISSING_GROUP_BY,
            }),
          ).toThrow(/primaryAxisGroupByFieldMetadataId/);
        });
      });

      describe('HORIZONTAL layout', () => {
        it('should not throw for full horizontal bar chart configuration', () => {
          expect(() =>
            validateWidgetConfigurationInputOrThrow({
              configuration: TEST_HORIZONTAL_BAR_CHART_CONFIG,
            }),
          ).not.toThrow();
        });

        it('should not throw for minimal horizontal bar chart configuration', () => {
          expect(() =>
            validateWidgetConfigurationInputOrThrow({
              configuration: TEST_HORIZONTAL_BAR_CHART_CONFIG_MINIMAL,
            }),
          ).not.toThrow();
        });

        it('should throw error for partial horizontal bar chart configuration with missing required fields', () => {
          expect(() =>
            validateWidgetConfigurationInputOrThrow({
              configuration:
                INVALID_HORIZONTAL_BAR_CHART_CONFIG_MISSING_GROUP_BY,
            }),
          ).toThrow(/primaryAxisGroupByFieldMetadataId/);
        });
      });
    });

    describe('PIE_CHART graph', () => {
      it('should not throw for pie chart configuration', () => {
        expect(() =>
          validateWidgetConfigurationInputOrThrow({
            configuration: TEST_PIE_CHART_CONFIG,
          }),
        ).not.toThrow();
      });
    });

    describe('LINE_CHART graph', () => {
      it('should not throw for line chart configuration', () => {
        expect(() =>
          validateWidgetConfigurationInputOrThrow({
            configuration: TEST_LINE_CHART_CONFIG,
          }),
        ).not.toThrow();
      });
    });
  });

  describe('Edge cases', () => {
    it('should throw error for null configuration', () => {
      expect(() =>
        validateWidgetConfigurationInputOrThrow({
          configuration: null,
        }),
      ).toThrow('Invalid configuration: not an object');
    });

    it('should throw error for undefined configuration', () => {
      expect(() =>
        validateWidgetConfigurationInputOrThrow({
          configuration: undefined,
        }),
      ).toThrow('Invalid configuration: not an object');
    });

    it('should throw error for non-object configuration', () => {
      expect(() =>
        validateWidgetConfigurationInputOrThrow({
          configuration: 'string',
        }),
      ).toThrow('Invalid configuration: not an object');
    });

    it('should throw error for missing configurationType', () => {
      const configuration = { someField: 'value' };

      expect(() =>
        validateWidgetConfigurationInputOrThrow({
          configuration: configuration,
        }),
      ).toThrow('Invalid configuration: missing configuration type');
    });

    it('should throw error for unsupported configurationType', () => {
      const configuration = {
        configurationType: 'UNSUPPORTED_TYPE',
        someField: 'value',
      };

      expect(() =>
        validateWidgetConfigurationInputOrThrow({
          configuration: configuration,
        }),
      ).toThrow(/Invalid configuration type: UNSUPPORTED_TYPE/);
    });
  });

  describe('Configuration keys', () => {
    it('should throw error for a setting left from another chart type', () => {
      expect(() =>
        validateWidgetConfigurationInputOrThrow({
          configuration: {
            ...TEST_PIE_CHART_CONFIG,
            layout: 'VERTICAL',
          },
        }),
      ).toThrow(/property layout should not exist/);
    });

    it('should throw error for a null setting whose type does not allow null', () => {
      expect(() =>
        validateWidgetConfigurationInputOrThrow({
          configuration: {
            ...TEST_NUMBER_CHART_CONFIG_MINIMAL,
            label: null,
          },
        }),
      ).toThrow('label: label should not be null');
    });

    it('should throw error for null on a setting another configuration type allows to be null', () => {
      expect(() =>
        validateWidgetConfigurationInputOrThrow({
          configuration: {
            configurationType: WidgetConfigurationType.FIELD,
            fieldMetadataId: '20202020-0000-4000-8000-000000000001',
            fieldDisplayMode: 'FIELD',
            viewId: null,
          },
        }),
      ).toThrow('viewId: viewId should not be null');
    });

    it.each([
      {
        configurationType: WidgetConfigurationType.RECORD_TABLE,
        viewId: null,
      },
      {
        configurationType: WidgetConfigurationType.FIELD,
        fieldMetadataId: '20202020-0000-4000-8000-000000000001',
        fieldDisplayMode: 'FIELD',
        nestedRelationFieldMetadataId: null,
      },
    ])(
      'should not throw for null on a setting whose type allows it ($configurationType)',
      (configuration) => {
        expect(() =>
          validateWidgetConfigurationInputOrThrow({ configuration }),
        ).not.toThrow();
      },
    );

    it('should throw error for widget types without an input DTO', () => {
      expect(() =>
        validateWidgetConfigurationInputOrThrow({
          configuration: {
            configurationType: WidgetConfigurationType.FIELDS,
            viewId: null,
            newFieldDefaultVisibility: null,
          },
        }),
      ).toThrow('Fields configuration is not supported yet');
    });
  });
});
