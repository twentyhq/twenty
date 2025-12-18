import {
  INVALID_HORIZONTAL_BAR_CHART_CONFIG_MISSING_GROUP_BY,
  INVALID_IFRAME_CONFIG_BAD_URL,
  INVALID_IFRAME_CONFIG_EMPTY_URL,
  INVALID_NUMBER_CHART_CONFIG_BAD_UUID,
  INVALID_NUMBER_CHART_CONFIG_MISSING_FIELDS,
  INVALID_STANDALONE_RICH_TEXT_CONFIG_BODY_WRONG_TYPE,
  INVALID_STANDALONE_RICH_TEXT_CONFIG_INVALID_SUBFIELDS,
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

import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { validateAndTransformWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/utils/validate-and-transform-widget-configuration.util';

jest.mock(
  'src/engine/core-modules/record-transformer/utils/transform-rich-text-v2.util',
  () => ({
    transformRichTextV2Value: jest.fn((value) =>
      Promise.resolve({
        blocknote: value.blocknote ?? null,
        markdown: value.markdown ?? null,
      }),
    ),
  }),
);

describe('validateAndTransformWidgetConfiguration', () => {
  describe('IFRAME widget', () => {
    it('should validate and transform valid iframe configuration', async () => {
      const result = await validateAndTransformWidgetConfiguration({
        type: WidgetType.IFRAME,
        configuration: TEST_IFRAME_CONFIG,
        isDashboardV2Enabled: false,
      });

      expect(result).toMatchObject(TEST_IFRAME_CONFIG);
    });

    it('should throw error for invalid URL', async () => {
      await expect(
        validateAndTransformWidgetConfiguration({
          type: WidgetType.IFRAME,
          configuration: INVALID_IFRAME_CONFIG_BAD_URL,
          isDashboardV2Enabled: false,
        }),
      ).rejects.toThrow(/url must be a URL address/);
    });

    it('should throw error for empty URL', async () => {
      await expect(
        validateAndTransformWidgetConfiguration({
          type: WidgetType.IFRAME,
          configuration: INVALID_IFRAME_CONFIG_EMPTY_URL,
          isDashboardV2Enabled: false,
        }),
      ).rejects.toThrow(/url must be a URL address/);
    });
  });

  describe('STANDALONE_RICH_TEXT widget', () => {
    it('should validate and transform valid standalone rich text configuration', async () => {
      const result = await validateAndTransformWidgetConfiguration({
        type: WidgetType.STANDALONE_RICH_TEXT,
        configuration: TEST_STANDALONE_RICH_TEXT_CONFIG,
        isDashboardV2Enabled: false,
      });

      expect(result).toMatchObject(TEST_STANDALONE_RICH_TEXT_CONFIG);
    });

    it('should validate minimal standalone rich text configuration', async () => {
      const result = await validateAndTransformWidgetConfiguration({
        type: WidgetType.STANDALONE_RICH_TEXT,
        configuration: TEST_STANDALONE_RICH_TEXT_CONFIG_MINIMAL,
        isDashboardV2Enabled: false,
      });

      expect(result).toMatchObject(TEST_STANDALONE_RICH_TEXT_CONFIG_MINIMAL);
    });

    it('should throw error for missing body', async () => {
      await expect(
        validateAndTransformWidgetConfiguration({
          type: WidgetType.STANDALONE_RICH_TEXT,
          configuration: INVALID_STANDALONE_RICH_TEXT_CONFIG_MISSING_BODY,
          isDashboardV2Enabled: false,
        }),
      ).rejects.toThrow(/body/);
    });

    it('should throw error when body is wrong type', async () => {
      await expect(
        validateAndTransformWidgetConfiguration({
          type: WidgetType.STANDALONE_RICH_TEXT,
          configuration: INVALID_STANDALONE_RICH_TEXT_CONFIG_BODY_WRONG_TYPE,
          isDashboardV2Enabled: false,
        }),
      ).rejects.toThrow();
    });

    it('should strip invalid subfields from body', async () => {
      const result = await validateAndTransformWidgetConfiguration({
        type: WidgetType.STANDALONE_RICH_TEXT,
        configuration: INVALID_STANDALONE_RICH_TEXT_CONFIG_INVALID_SUBFIELDS,
        isDashboardV2Enabled: false,
      });

      expect(result).toBeDefined();
      expect((result as any).body.blocknote).toBeDefined();
      expect((result as any).body.markdown).toBe('valid');
      expect((result as any).body.invalidField).toBeUndefined();
    });
  });

  describe('GRAPH widget', () => {
    describe('NUMBER graph', () => {
      it('should validate full number graph configuration', async () => {
        const result = await validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_NUMBER_CHART_CONFIG,
          isDashboardV2Enabled: false,
        });

        expect(result).toMatchObject(TEST_NUMBER_CHART_CONFIG);
      });

      it('should validate minimal number graph configuration', async () => {
        const result = await validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_NUMBER_CHART_CONFIG_MINIMAL,
          isDashboardV2Enabled: false,
        });

        expect(result).toMatchObject(TEST_NUMBER_CHART_CONFIG_MINIMAL);
      });

      it('should throw error for partial number graph configuration with missing required fields', async () => {
        await expect(
          validateAndTransformWidgetConfiguration({
            type: WidgetType.GRAPH,
            configuration: INVALID_NUMBER_CHART_CONFIG_MISSING_FIELDS,
            isDashboardV2Enabled: false,
          }),
        ).rejects.toThrow(/aggregateFieldMetadataId.*aggregateOperation/);
      });

      it('should throw error for invalid UUID', async () => {
        await expect(
          validateAndTransformWidgetConfiguration({
            type: WidgetType.GRAPH,
            configuration: INVALID_NUMBER_CHART_CONFIG_BAD_UUID,
            isDashboardV2Enabled: false,
          }),
        ).rejects.toThrow(/aggregateFieldMetadataId must be a UUID/);
      });
    });

    describe('VERTICAL_BAR graph', () => {
      it('should validate full vertical bar graph configuration', async () => {
        const result = await validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_VERTICAL_BAR_CHART_CONFIG,
          isDashboardV2Enabled: false,
        });

        expect(result).toMatchObject(TEST_VERTICAL_BAR_CHART_CONFIG);
      });

      it('should validate minimal vertical bar graph configuration', async () => {
        const result = await validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_VERTICAL_BAR_CHART_CONFIG_MINIMAL,
          isDashboardV2Enabled: false,
        });

        expect(result).toMatchObject(TEST_VERTICAL_BAR_CHART_CONFIG_MINIMAL);
      });

      it('should throw error for partial vertical bar graph configuration with missing required fields', async () => {
        await expect(
          validateAndTransformWidgetConfiguration({
            type: WidgetType.GRAPH,
            configuration: INVALID_VERTICAL_BAR_CHART_CONFIG_MISSING_GROUP_BY,
            isDashboardV2Enabled: false,
          }),
        ).rejects.toThrow(/primaryAxisGroupByFieldMetadataId/);
      });
    });

    describe('HORIZONTAL_BAR graph', () => {
      it('should validate full horizontal bar graph configuration', async () => {
        const result = await validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_HORIZONTAL_BAR_CHART_CONFIG,
          isDashboardV2Enabled: false,
        });

        expect(result).toMatchObject(TEST_HORIZONTAL_BAR_CHART_CONFIG);
      });

      it('should validate minimal horizontal bar graph configuration', async () => {
        const result = await validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_HORIZONTAL_BAR_CHART_CONFIG_MINIMAL,
          isDashboardV2Enabled: false,
        });

        expect(result).toMatchObject(TEST_HORIZONTAL_BAR_CHART_CONFIG_MINIMAL);
      });

      it('should throw error for partial horizontal bar graph configuration with missing required fields', async () => {
        await expect(
          validateAndTransformWidgetConfiguration({
            type: WidgetType.GRAPH,
            configuration: INVALID_HORIZONTAL_BAR_CHART_CONFIG_MISSING_GROUP_BY,
            isDashboardV2Enabled: false,
          }),
        ).rejects.toThrow(/primaryAxisGroupByFieldMetadataId/);
      });
    });

    it('should return null for unsupported graph type', async () => {
      const configuration = {
        graphType: 'UNSUPPORTED',
        viewId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = await validateAndTransformWidgetConfiguration({
        type: WidgetType.GRAPH,
        configuration: configuration,
        isDashboardV2Enabled: false,
      });

      expect(result).toBeNull();
    });

    it('should return null for missing graph type', async () => {
      const configuration = {
        viewId: '550e8400-e29b-41d4-a716-446655440000',
      };

      const result = await validateAndTransformWidgetConfiguration({
        type: WidgetType.GRAPH,
        configuration: configuration,
        isDashboardV2Enabled: false,
      });

      expect(result).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should throw error for null configuration', async () => {
      await expect(
        validateAndTransformWidgetConfiguration({
          type: WidgetType.IFRAME,
          configuration: null,
          isDashboardV2Enabled: false,
        }),
      ).rejects.toThrow('Invalid configuration: not an object');
    });

    it('should throw error for undefined configuration', async () => {
      await expect(
        validateAndTransformWidgetConfiguration({
          type: WidgetType.IFRAME,
          configuration: undefined,
          isDashboardV2Enabled: false,
        }),
      ).rejects.toThrow('Invalid configuration: not an object');
    });

    it('should throw error for non-object configuration', async () => {
      await expect(
        validateAndTransformWidgetConfiguration({
          type: WidgetType.IFRAME,
          configuration: 'string',
          isDashboardV2Enabled: false,
        }),
      ).rejects.toThrow('Invalid configuration: not an object');
    });

    it('should return null for unsupported widget type', async () => {
      const configuration = { someField: 'value' };

      const result = await validateAndTransformWidgetConfiguration({
        type: 'UNSUPPORTED' as WidgetType,
        configuration: configuration,
        isDashboardV2Enabled: false,
      });

      expect(result).toBeNull();
    });
  });

  describe('Error messages', () => {
    it('should include validation details in error message', async () => {
      await expect(
        validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: INVALID_NUMBER_CHART_CONFIG_BAD_UUID,
          isDashboardV2Enabled: false,
        }),
      ).rejects.toThrow(/aggregateFieldMetadataId must be a UUID/);
    });
  });

  describe('Feature flags', () => {
    it('should throw error for GAUGE chart type when IS_DASHBOARD_V2_ENABLED is false', async () => {
      await expect(
        validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_GAUGE_CHART_CONFIG,
          isDashboardV2Enabled: false,
        }),
      ).rejects.toThrow(/IS_DASHBOARD_V2_ENABLED feature flag/);
    });

    it('should not throw error for GAUGE chart type when IS_DASHBOARD_V2_ENABLED is true', async () => {
      await expect(
        validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_GAUGE_CHART_CONFIG,
          isDashboardV2Enabled: true,
        }),
      ).resolves.not.toThrow();
    });

    it('should not throw error for PIE chart type regardless of IS_DASHBOARD_V2_ENABLED', async () => {
      await expect(
        validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_PIE_CHART_CONFIG,
          isDashboardV2Enabled: false,
        }),
      ).resolves.not.toThrow();

      await expect(
        validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_PIE_CHART_CONFIG,
          isDashboardV2Enabled: true,
        }),
      ).resolves.not.toThrow();
    });

    it('should not throw error for LINE chart type regardless of IS_DASHBOARD_V2_ENABLED', async () => {
      await expect(
        validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_LINE_CHART_CONFIG,
          isDashboardV2Enabled: false,
        }),
      ).resolves.not.toThrow();

      await expect(
        validateAndTransformWidgetConfiguration({
          type: WidgetType.GRAPH,
          configuration: TEST_LINE_CHART_CONFIG,
          isDashboardV2Enabled: true,
        }),
      ).resolves.not.toThrow();
    });
  });
});
