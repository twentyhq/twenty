import {
  INVALID_HORIZONTAL_BAR_CHART_CONFIG_MISSING_GROUP_BY,
  INVALID_IFRAME_CONFIG_BAD_URL,
  INVALID_IFRAME_CONFIG_EMPTY_URL,
  INVALID_NUMBER_CHART_CONFIG_BAD_UUID,
  INVALID_NUMBER_CHART_CONFIG_MISSING_FIELDS,
  INVALID_STANDALONE_RICH_TEXT_CONFIG_BODY_WRONG_TYPE,
  INVALID_STANDALONE_RICH_TEXT_CONFIG_MISSING_BODY,
  INVALID_VERTICAL_BAR_CHART_CONFIG_MISSING_GROUP_BY,
  TEST_GAUGE_CHART_CONFIG,
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
import { validateWidgetConfigurationInput } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-widget-configuration-input.util';

describe('validateWidgetConfigurationInput', () => {
  describe('IFRAME widget', () => {
    it('should not throw for valid iframe configuration', () => {
      expect(() =>
        validateWidgetConfigurationInput({
          configuration: TEST_IFRAME_CONFIG,
        }),
      ).not.toThrow();
    });

    it('should throw error for invalid URL', () => {
      expect(() =>
        validateWidgetConfigurationInput({
          configuration: {
            ...INVALID_IFRAME_CONFIG_BAD_URL,
            configurationType: WidgetConfigurationType.IFRAME,
          },
        }),
      ).toThrow(/url must be a URL address/);
    });

    it('should throw error for empty URL', () => {
      expect(() =>
        validateWidgetConfigurationInput({
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
        validateWidgetConfigurationInput({
          configuration: TEST_STANDALONE_RICH_TEXT_CONFIG,
        }),
      ).not.toThrow();
    });

    it('should not throw for minimal standalone rich text configuration', () => {
      expect(() =>
        validateWidgetConfigurationInput({
          configuration: TEST_STANDALONE_RICH_TEXT_CONFIG_MINIMAL,
        }),
      ).not.toThrow();
    });

    it('should throw error for missing body', () => {
      expect(() =>
        validateWidgetConfigurationInput({
          configuration: {
            ...INVALID_STANDALONE_RICH_TEXT_CONFIG_MISSING_BODY,
            configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
          },
        }),
      ).toThrow(/body/);
    });

    it('should throw error when body is wrong type', () => {
      expect(() =>
        validateWidgetConfigurationInput({
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
          validateWidgetConfigurationInput({
            configuration: TEST_NUMBER_CHART_CONFIG,
          }),
        ).not.toThrow();
      });

      it('should not throw for minimal aggregate chart configuration', () => {
        expect(() =>
          validateWidgetConfigurationInput({
            configuration: TEST_NUMBER_CHART_CONFIG_MINIMAL,
          }),
        ).not.toThrow();
      });

      it('should throw error for partial aggregate chart configuration with missing required fields', () => {
        expect(() =>
          validateWidgetConfigurationInput({
            configuration: INVALID_NUMBER_CHART_CONFIG_MISSING_FIELDS,
          }),
        ).toThrow(/aggregateFieldMetadataId.*aggregateOperation/);
      });

      it('should throw error for invalid UUID', () => {
        expect(() =>
          validateWidgetConfigurationInput({
            configuration: INVALID_NUMBER_CHART_CONFIG_BAD_UUID,
          }),
        ).toThrow(/aggregateFieldMetadataId must be a UUID/);
      });
    });

    describe('BAR_CHART graph', () => {
      describe('VERTICAL layout', () => {
        it('should not throw for full vertical bar chart configuration', () => {
          expect(() =>
            validateWidgetConfigurationInput({
              configuration: TEST_VERTICAL_BAR_CHART_CONFIG,
            }),
          ).not.toThrow();
        });

        it('should not throw for minimal vertical bar chart configuration', () => {
          expect(() =>
            validateWidgetConfigurationInput({
              configuration: TEST_VERTICAL_BAR_CHART_CONFIG_MINIMAL,
            }),
          ).not.toThrow();
        });

        it('should throw error for partial vertical bar chart configuration with missing required fields', () => {
          expect(() =>
            validateWidgetConfigurationInput({
              configuration: INVALID_VERTICAL_BAR_CHART_CONFIG_MISSING_GROUP_BY,
            }),
          ).toThrow(/primaryAxisGroupByFieldMetadataId/);
        });
      });

      describe('HORIZONTAL layout', () => {
        it('should not throw for full horizontal bar chart configuration', () => {
          expect(() =>
            validateWidgetConfigurationInput({
              configuration: TEST_HORIZONTAL_BAR_CHART_CONFIG,
            }),
          ).not.toThrow();
        });

        it('should not throw for minimal horizontal bar chart configuration', () => {
          expect(() =>
            validateWidgetConfigurationInput({
              configuration: TEST_HORIZONTAL_BAR_CHART_CONFIG_MINIMAL,
            }),
          ).not.toThrow();
        });

        it('should throw error for partial horizontal bar chart configuration with missing required fields', () => {
          expect(() =>
            validateWidgetConfigurationInput({
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
          validateWidgetConfigurationInput({
            configuration: TEST_PIE_CHART_CONFIG,
          }),
        ).not.toThrow();
      });
    });

    describe('LINE_CHART graph', () => {
      it('should not throw for line chart configuration', () => {
        expect(() =>
          validateWidgetConfigurationInput({
            configuration: TEST_LINE_CHART_CONFIG,
          }),
        ).not.toThrow();
      });
    });

    describe('GAUGE_CHART graph', () => {
      it('should not throw for gauge chart configuration', () => {
        expect(() =>
          validateWidgetConfigurationInput({
            configuration: TEST_GAUGE_CHART_CONFIG,
          }),
        ).not.toThrow();
      });
    });
  });

  describe('Edge cases', () => {
    it('should throw error for null configuration', () => {
      expect(() =>
        validateWidgetConfigurationInput({
          configuration: null,
        }),
      ).toThrow('Invalid configuration: not an object');
    });

    it('should throw error for undefined configuration', () => {
      expect(() =>
        validateWidgetConfigurationInput({
          configuration: undefined,
        }),
      ).toThrow('Invalid configuration: not an object');
    });

    it('should throw error for non-object configuration', () => {
      expect(() =>
        validateWidgetConfigurationInput({
          configuration: 'string',
        }),
      ).toThrow('Invalid configuration: not an object');
    });

    it('should throw error for missing configurationType', () => {
      const configuration = { someField: 'value' };

      expect(() =>
        validateWidgetConfigurationInput({
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
        validateWidgetConfigurationInput({
          configuration: configuration,
        }),
      ).toThrow(/Invalid configuration type: UNSUPPORTED_TYPE/);
    });
  });
});
