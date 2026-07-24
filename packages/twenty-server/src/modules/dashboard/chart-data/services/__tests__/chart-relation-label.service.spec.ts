import { Test, type TestingModule } from '@nestjs/testing';

import { FieldMetadataType } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { formatResult } from 'src/engine/twenty-orm/utils/format-result.util';
import { ChartRelationLabelService } from 'src/modules/dashboard/chart-data/services/chart-relation-label.service';

jest.mock(
  'src/engine/twenty-orm/storage/orm-workspace-context.storage',
  () => ({
    getWorkspaceContext: jest.fn(() => ({
      authContext: {},
      userWorkspaceRoleMap: {},
      apiKeyRoleMap: {},
    })),
  }),
);

jest.mock(
  'src/engine/twenty-orm/utils/resolve-role-permission-config.util',
  () => ({
    resolveRolePermissionConfig: jest.fn(() => ({ shouldBypass: false })),
  }),
);

jest.mock('src/engine/twenty-orm/utils/format-result.util', () => ({
  formatResult: jest.fn((rawRow) => rawRow),
}));

jest.mock(
  'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util',
  () => ({
    isMorphOrRelationFlatFieldMetadata: jest.fn(
      (fieldMetadata: FlatFieldMetadata) =>
        fieldMetadata.type === FieldMetadataType.RELATION ||
        fieldMetadata.type === FieldMetadataType.MORPH_RELATION,
    ),
  }),
);

const workspaceId = 'test-workspace-id';
const mockAuthContext = {
  type: 'system',
  workspace: { id: workspaceId },
} as unknown as WorkspaceAuthContext;

const targetObjectMetadataId = 'agent-object-id';
const labelFieldMetadataId = 'agent-name-field-id';
const idFieldMetadataId = 'agent-id-field-id';

const mockIdField = {
  id: idFieldMetadataId,
  name: 'id',
  type: FieldMetadataType.UUID,
  universalIdentifier: 'agent-id-field-universal-id',
};

const mockLabelField = {
  id: labelFieldMetadataId,
  name: 'name',
  type: FieldMetadataType.TEXT,
  universalIdentifier: 'agent-name-field-universal-id',
};

const mockTargetObjectMetadata = {
  id: targetObjectMetadataId,
  nameSingular: 'agent',
  labelIdentifierFieldMetadataId: labelFieldMetadataId,
  universalIdentifier: 'agent-object-universal-id',
  fieldIds: [idFieldMetadataId, labelFieldMetadataId],
};

const flatObjectMetadataMaps = {
  byUniversalIdentifier: {
    'agent-object-universal-id': mockTargetObjectMetadata,
  },
  universalIdentifierById: {
    [targetObjectMetadataId]: 'agent-object-universal-id',
  },
  universalIdentifiersByApplicationId: {},
} as never;

const flatFieldMetadataMaps = {
  byUniversalIdentifier: {
    'agent-id-field-universal-id': mockIdField,
    'agent-name-field-universal-id': mockLabelField,
  },
  universalIdentifierById: {
    [idFieldMetadataId]: 'agent-id-field-universal-id',
    [labelFieldMetadataId]: 'agent-name-field-universal-id',
  },
  universalIdentifiersByApplicationId: {},
} as never;

const relationGroupByField = {
  id: 'relation-field-id',
  name: 'agent',
  type: FieldMetadataType.RELATION,
  relationTargetObjectMetadataId: targetObjectMetadataId,
} as unknown as FlatFieldMetadata;

describe('ChartRelationLabelService', () => {
  let service: ChartRelationLabelService;
  let mockGetRawMany: jest.Mock;
  let mockGetRepository: jest.Mock;

  beforeEach(async () => {
    mockGetRawMany = jest.fn().mockResolvedValue([]);

    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawMany: mockGetRawMany,
    };

    mockGetRepository = jest.fn().mockResolvedValue({
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChartRelationLabelService,
        {
          provide: GlobalWorkspaceOrmManager,
          useValue: {
            executeInWorkspaceContext: jest.fn((callback) => callback()),
            getRepository: mockGetRepository,
          },
        },
      ],
    }).compile();

    service = module.get<ChartRelationLabelService>(ChartRelationLabelService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should resolve labels for a bare relation axis', async () => {
    mockGetRawMany.mockResolvedValue([
      { id: 'agent-id-1', name: 'Alice' },
      { id: 'agent-id-2', name: 'Bob' },
    ]);

    const { primary } = await service.resolveRelationLabels({
      rawResults: [
        { groupByDimensionValues: ['agent-id-1'], aggregateValue: 3 },
        { groupByDimensionValues: ['agent-id-2'], aggregateValue: 1 },
      ],
      primaryAxis: { groupByField: relationGroupByField, subFieldName: null },
      workspaceId,
      authContext: mockAuthContext,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(primary?.labelByRecordId.get('agent-id-1')).toBe('Alice');
    expect(primary?.labelByRecordId.get('agent-id-2')).toBe('Bob');
    expect(primary?.unresolvedRecordIds.size).toBe(0);
  });

  it('should preserve the record id through the real formatResult so labels resolve', async () => {
    const actualFormatResult = jest.requireActual(
      'src/engine/twenty-orm/utils/format-result.util',
    ).formatResult;

    (formatResult as jest.Mock).mockImplementationOnce((...args) =>
      actualFormatResult(...args),
    );

    mockGetRawMany.mockResolvedValue([{ id: 'agent-id-1', name: 'Alice' }]);

    const { primary } = await service.resolveRelationLabels({
      rawResults: [
        { groupByDimensionValues: ['agent-id-1'], aggregateValue: 3 },
      ],
      primaryAxis: { groupByField: relationGroupByField, subFieldName: null },
      workspaceId,
      authContext: mockAuthContext,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(primary?.labelByRecordId.get('agent-id-1')).toBe('Alice');
    expect(primary?.unresolvedRecordIds.size).toBe(0);
  });

  it('should suffix duplicate labels', async () => {
    mockGetRawMany.mockResolvedValue([
      { id: 'agent-id-1', name: 'John Smith' },
      { id: 'agent-id-2', name: 'John Smith' },
    ]);

    const { primary } = await service.resolveRelationLabels({
      rawResults: [
        { groupByDimensionValues: ['agent-id-1'], aggregateValue: 3 },
        { groupByDimensionValues: ['agent-id-2'], aggregateValue: 1 },
      ],
      primaryAxis: { groupByField: relationGroupByField, subFieldName: null },
      workspaceId,
      authContext: mockAuthContext,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(primary?.labelByRecordId.get('agent-id-1')).toBe('John Smith (1)');
    expect(primary?.labelByRecordId.get('agent-id-2')).toBe('John Smith (2)');
  });

  it('should mark records missing from the query result as unresolved', async () => {
    mockGetRawMany.mockResolvedValue([{ id: 'agent-id-1', name: 'Alice' }]);

    const { primary } = await service.resolveRelationLabels({
      rawResults: [
        { groupByDimensionValues: ['agent-id-1'], aggregateValue: 3 },
        { groupByDimensionValues: ['agent-id-2'], aggregateValue: 1 },
      ],
      primaryAxis: { groupByField: relationGroupByField, subFieldName: null },
      workspaceId,
      authContext: mockAuthContext,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(primary?.labelByRecordId.has('agent-id-2')).toBe(false);
    expect(primary?.unresolvedRecordIds).toEqual(new Set(['agent-id-2']));
  });

  it('should degrade to unresolved labels when the query throws', async () => {
    mockGetRepository.mockRejectedValue(new Error('permission denied'));

    const { primary } = await service.resolveRelationLabels({
      rawResults: [
        { groupByDimensionValues: ['agent-id-1'], aggregateValue: 3 },
      ],
      primaryAxis: { groupByField: relationGroupByField, subFieldName: null },
      workspaceId,
      authContext: mockAuthContext,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(primary?.labelByRecordId.has('agent-id-1')).toBe(false);
    expect(primary?.unresolvedRecordIds).toEqual(new Set(['agent-id-1']));
  });

  it('should not resolve an axis with a subFieldName', async () => {
    const resolutions = await service.resolveRelationLabels({
      rawResults: [{ groupByDimensionValues: ['Acme'], aggregateValue: 3 }],
      primaryAxis: { groupByField: relationGroupByField, subFieldName: 'name' },
      workspaceId,
      authContext: mockAuthContext,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(resolutions).toEqual({});
    expect(mockGetRepository).not.toHaveBeenCalled();
  });

  it('should not resolve a non-relation axis', async () => {
    const resolutions = await service.resolveRelationLabels({
      rawResults: [{ groupByDimensionValues: ['Active'], aggregateValue: 3 }],
      primaryAxis: {
        groupByField: {
          id: 'text-field-id',
          name: 'status',
          type: FieldMetadataType.TEXT,
        } as unknown as FlatFieldMetadata,
        subFieldName: null,
      },
      workspaceId,
      authContext: mockAuthContext,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(resolutions).toEqual({});
    expect(mockGetRepository).not.toHaveBeenCalled();
  });

  it('should issue a single query when both axes target the same object', async () => {
    mockGetRawMany.mockResolvedValue([
      { id: 'agent-id-1', name: 'Alice' },
      { id: 'agent-id-2', name: 'Bob' },
    ]);

    const { primary, secondary } = await service.resolveRelationLabels({
      rawResults: [
        {
          groupByDimensionValues: ['agent-id-1', 'agent-id-2'],
          aggregateValue: 3,
        },
      ],
      primaryAxis: { groupByField: relationGroupByField, subFieldName: null },
      secondaryAxis: { groupByField: relationGroupByField, subFieldName: null },
      workspaceId,
      authContext: mockAuthContext,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(mockGetRepository).toHaveBeenCalledTimes(1);
    expect(primary?.labelByRecordId.get('agent-id-1')).toBe('Alice');
    expect(secondary?.labelByRecordId.get('agent-id-2')).toBe('Bob');
  });

  it('should resolve labels when the group by field is a morph relation', async () => {
    mockGetRawMany.mockResolvedValue([{ id: 'agent-id-1', name: 'Alice' }]);

    const morphRelationGroupByField = {
      id: 'morph-relation-field-id',
      name: 'morphAgent',
      type: FieldMetadataType.MORPH_RELATION,
      relationTargetObjectMetadataId: targetObjectMetadataId,
    } as unknown as FlatFieldMetadata;

    const { primary } = await service.resolveRelationLabels({
      rawResults: [
        { groupByDimensionValues: ['agent-id-1'], aggregateValue: 3 },
      ],
      primaryAxis: {
        groupByField: morphRelationGroupByField,
        subFieldName: null,
      },
      workspaceId,
      authContext: mockAuthContext,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(primary?.labelByRecordId.get('agent-id-1')).toBe('Alice');
    expect(primary?.unresolvedRecordIds.size).toBe(0);
  });

  it('should treat a label falling back to the record id as unresolved', async () => {
    mockGetRawMany.mockResolvedValue([{ id: 'agent-id-1', name: null }]);

    const { primary } = await service.resolveRelationLabels({
      rawResults: [
        { groupByDimensionValues: ['agent-id-1'], aggregateValue: 3 },
      ],
      primaryAxis: { groupByField: relationGroupByField, subFieldName: null },
      workspaceId,
      authContext: mockAuthContext,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    });

    expect(primary?.labelByRecordId.has('agent-id-1')).toBe(false);
    expect(primary?.unresolvedRecordIds).toEqual(new Set(['agent-id-1']));
  });
});
