import { Test, type TestingModule } from '@nestjs/testing';

import { FieldMetadataType } from 'twenty-shared/types';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PIE_CHART_MAXIMUM_NUMBER_OF_SLICES } from 'src/modules/dashboard/chart-data/constants/pie-chart.constants';
import { ChartDataQueryService } from 'src/modules/dashboard/chart-data/services/chart-data-query.service';
import { PieChartDataService } from 'src/modules/dashboard/chart-data/services/pie-chart-data.service';
import { GraphColorMode } from 'src/modules/dashboard/chart-data/types/graph-color-mode.enum';

describe('PieChartDataService', () => {
  let service: PieChartDataService;
  let mockExecuteGroupByQuery: jest.Mock;
  let mockGetOrRecomputeManyOrAllFlatEntityMaps: jest.Mock;

  const workspaceId = 'test-workspace-id';
  const objectMetadataId = 'test-object-id';

  const mockGroupByField = {
    id: 'group-by-field-id',
    name: 'status',
    label: 'Status',
    type: FieldMetadataType.TEXT,
  };

  const mockSelectField = {
    id: 'select-field-id',
    name: 'stage',
    label: 'Stage',
    type: FieldMetadataType.SELECT,
    options: [
      { value: 'open', label: 'Open', color: 'green', position: 0 },
      { value: 'closed', label: 'Closed', color: 'red', position: 1 },
    ],
  };

  const mockAggregateField = {
    id: 'aggregate-field-id',
    name: 'id',
    label: 'Id',
    type: FieldMetadataType.UUID,
  };

  const mockObjectMetadata = {
    id: objectMetadataId,
    nameSingular: 'company',
    namePlural: 'companies',
  };

  beforeEach(async () => {
    mockExecuteGroupByQuery = jest.fn();
    mockGetOrRecomputeManyOrAllFlatEntityMaps = jest.fn().mockResolvedValue({
      flatObjectMetadataMaps: {
        byId: { [objectMetadataId]: mockObjectMetadata },
      },
      flatFieldMetadataMaps: {
        byId: {
          [mockGroupByField.id]: mockGroupByField,
          [mockSelectField.id]: mockSelectField,
          [mockAggregateField.id]: mockAggregateField,
        },
      },
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PieChartDataService,
        {
          provide: WorkspaceManyOrAllFlatEntityMapsCacheService,
          useValue: {
            getOrRecomputeManyOrAllFlatEntityMaps:
              mockGetOrRecomputeManyOrAllFlatEntityMaps,
          },
        },
        {
          provide: ChartDataQueryService,
          useValue: {
            executeGroupByQuery: mockExecuteGroupByQuery,
          },
        },
      ],
    }).compile();

    service = module.get<PieChartDataService>(PieChartDataService);
  });

  describe('getPieChartData', () => {
    const baseConfiguration = {
      configurationType: WidgetConfigurationType.PIE_CHART,
      groupByFieldMetadataId: mockGroupByField.id,
      aggregateFieldMetadataId: mockAggregateField.id,
      aggregateOperation: AggregateOperations.COUNT,
      displayLegend: true,
    };

    it('should transform simple pie chart data', async () => {
      mockExecuteGroupByQuery.mockResolvedValue([
        { groupByDimensionValues: ['Active'], aggregateValue: 10 },
        { groupByDimensionValues: ['Inactive'], aggregateValue: 5 },
      ]);

      const result = await service.getPieChartData({
        workspaceId,
        objectMetadataId,
        configuration: baseConfiguration as any,
      });

      expect(result.data).toHaveLength(2);
      expect(result.data[0]).toEqual({
        id: 'Active',
        value: 10,
        color: undefined,
      });
      expect(result.data[1]).toEqual({
        id: 'Inactive',
        value: 5,
        color: undefined,
      });
      expect(result.showLegend).toBe(true);
      expect(result.hasTooManyGroups).toBe(false);
    });

    it('should keep null group buckets aligned with their aggregate values', async () => {
      mockExecuteGroupByQuery.mockResolvedValue([
        { groupByDimensionValues: [null], aggregateValue: 2 },
        { groupByDimensionValues: ['Active'], aggregateValue: 5 },
      ]);

      const result = await service.getPieChartData({
        workspaceId,
        objectMetadataId,
        configuration: baseConfiguration as any,
      });

      expect(result.data).toEqual([
        { id: 'Not Set', value: 2, color: undefined },
        { id: 'Active', value: 5, color: undefined },
      ]);
      expect(result.formattedToRawLookup?.['Not Set']).toBeUndefined();
      expect(result.formattedToRawLookup?.['Active']).toBe('Active');
    });

    it('should hide empty category when hideEmptyCategory is true', async () => {
      mockExecuteGroupByQuery.mockResolvedValue([
        { groupByDimensionValues: [null], aggregateValue: 2 },
        { groupByDimensionValues: ['Active'], aggregateValue: 5 },
      ]);

      const result = await service.getPieChartData({
        workspaceId,
        objectMetadataId,
        configuration: {
          ...baseConfiguration,
          hideEmptyCategory: true,
        } as any,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe('Active');
    });

    it('should honor color configuration', async () => {
      mockExecuteGroupByQuery.mockResolvedValue([
        { groupByDimensionValues: ['Active'], aggregateValue: 10 },
      ]);

      const result = await service.getPieChartData({
        workspaceId,
        objectMetadataId,
        configuration: {
          ...baseConfiguration,
          color: 'red',
        } as any,
      });

      expect(result.data[0].color).toBe('red');
      expect(result.colorMode).toBe(GraphColorMode.EXPLICIT_SINGLE_COLOR);
    });

    it('should use select field option colors when grouping by select field', async () => {
      mockGetOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue({
        flatObjectMetadataMaps: {
          byId: { [objectMetadataId]: mockObjectMetadata },
        },
        flatFieldMetadataMaps: {
          byId: {
            [mockSelectField.id]: mockSelectField,
            [mockAggregateField.id]: mockAggregateField,
          },
        },
      });

      mockExecuteGroupByQuery.mockResolvedValue([
        { groupByDimensionValues: ['open'], aggregateValue: 10 },
        { groupByDimensionValues: ['closed'], aggregateValue: 5 },
      ]);

      const result = await service.getPieChartData({
        workspaceId,
        objectMetadataId,
        configuration: {
          ...baseConfiguration,
          groupByFieldMetadataId: mockSelectField.id,
        } as any,
      });

      expect(result.data[0].color).toBe('green');
      expect(result.data[1].color).toBe('red');
      expect(result.colorMode).toBe(GraphColorMode.SELECT_FIELD_OPTION_COLORS);
    });

    it('should flag too many groups and limit slices', async () => {
      const manyResults = Array.from(
        { length: PIE_CHART_MAXIMUM_NUMBER_OF_SLICES + 5 },
        (_, index) => ({
          groupByDimensionValues: [`Group ${index}`],
          aggregateValue: index + 1,
        }),
      );

      mockExecuteGroupByQuery.mockResolvedValue(manyResults);

      const result = await service.getPieChartData({
        workspaceId,
        objectMetadataId,
        configuration: baseConfiguration as any,
      });

      expect(result.hasTooManyGroups).toBe(true);
      expect(result.data).toHaveLength(PIE_CHART_MAXIMUM_NUMBER_OF_SLICES);
    });

    it('should respect displayLegend configuration', async () => {
      mockExecuteGroupByQuery.mockResolvedValue([
        { groupByDimensionValues: ['Active'], aggregateValue: 10 },
      ]);

      const result = await service.getPieChartData({
        workspaceId,
        objectMetadataId,
        configuration: {
          ...baseConfiguration,
          displayLegend: false,
        } as any,
      });

      expect(result.showLegend).toBe(false);
    });

    it('should respect displayDataLabel configuration', async () => {
      mockExecuteGroupByQuery.mockResolvedValue([
        { groupByDimensionValues: ['Active'], aggregateValue: 10 },
      ]);

      const result = await service.getPieChartData({
        workspaceId,
        objectMetadataId,
        configuration: {
          ...baseConfiguration,
          displayDataLabel: true,
        } as any,
      });

      expect(result.showDataLabels).toBe(true);
    });

    it('should respect showCenterMetric configuration', async () => {
      mockExecuteGroupByQuery.mockResolvedValue([
        { groupByDimensionValues: ['Active'], aggregateValue: 10 },
      ]);

      const result = await service.getPieChartData({
        workspaceId,
        objectMetadataId,
        configuration: {
          ...baseConfiguration,
          showCenterMetric: false,
        } as any,
      });

      expect(result.showCenterMetric).toBe(false);
    });
  });

  describe('Error handling', () => {
    it('should throw when configuration type is not PIE_CHART', async () => {
      await expect(
        service.getPieChartData({
          workspaceId,
          objectMetadataId,
          configuration: {
            configurationType: WidgetConfigurationType.BAR_CHART,
            groupByFieldMetadataId: mockGroupByField.id,
            aggregateFieldMetadataId: mockAggregateField.id,
            aggregateOperation: AggregateOperations.COUNT,
          } as any,
        }),
      ).rejects.toThrow();
    });

    it('should throw when object metadata is not found', async () => {
      mockGetOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue({
        flatObjectMetadataMaps: { byId: {} },
        flatFieldMetadataMaps: { byId: {} },
      });

      await expect(
        service.getPieChartData({
          workspaceId,
          objectMetadataId: 'non-existent-id',
          configuration: {
            configurationType: WidgetConfigurationType.PIE_CHART,
            groupByFieldMetadataId: mockGroupByField.id,
            aggregateFieldMetadataId: mockAggregateField.id,
            aggregateOperation: AggregateOperations.COUNT,
          } as any,
        }),
      ).rejects.toThrow();
    });

    it('should throw when field metadata is not found', async () => {
      mockGetOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue({
        flatObjectMetadataMaps: {
          byId: { [objectMetadataId]: mockObjectMetadata },
        },
        flatFieldMetadataMaps: { byId: {} },
      });

      await expect(
        service.getPieChartData({
          workspaceId,
          objectMetadataId,
          configuration: {
            configurationType: WidgetConfigurationType.PIE_CHART,
            groupByFieldMetadataId: 'non-existent-field',
            aggregateFieldMetadataId: mockAggregateField.id,
            aggregateOperation: AggregateOperations.COUNT,
          } as any,
        }),
      ).rejects.toThrow();
    });
  });

  describe('Boolean field formatting', () => {
    const booleanField = {
      id: 'boolean-field-id',
      name: 'isActive',
      label: 'Is Active',
      type: FieldMetadataType.BOOLEAN,
    };

    beforeEach(() => {
      mockGetOrRecomputeManyOrAllFlatEntityMaps.mockResolvedValue({
        flatObjectMetadataMaps: {
          byId: { [objectMetadataId]: mockObjectMetadata },
        },
        flatFieldMetadataMaps: {
          byId: {
            [booleanField.id]: booleanField,
            [mockAggregateField.id]: mockAggregateField,
          },
        },
      });
    });

    it('should format boolean values as Yes/No', async () => {
      mockExecuteGroupByQuery.mockResolvedValue([
        { groupByDimensionValues: [true], aggregateValue: 10 },
        { groupByDimensionValues: [false], aggregateValue: 5 },
      ]);

      const result = await service.getPieChartData({
        workspaceId,
        objectMetadataId,
        configuration: {
          configurationType: WidgetConfigurationType.PIE_CHART,
          groupByFieldMetadataId: booleanField.id,
          aggregateFieldMetadataId: mockAggregateField.id,
          aggregateOperation: AggregateOperations.COUNT,
        } as any,
      });

      expect(result.data[0].id).toBe('Yes');
      expect(result.data[1].id).toBe('No');
    });
  });
});
