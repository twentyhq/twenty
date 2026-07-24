import {
  AggregateOperations,
  FieldMetadataType,
  OrderByDirection,
  RelationType,
} from 'twenty-shared/types';

import { type CommonGroupByQueryRunnerService } from 'src/engine/api/common/common-query-runners/common-group-by-query-runner.service';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GraphOrderBy } from 'src/engine/metadata-modules/page-layout-widget/enums/graph-order-by.enum';
import { ChartDataQueryService } from 'src/modules/dashboard/chart-data/services/chart-data-query.service';

const createMockFieldMetadata = (
  overrides: Partial<FlatFieldMetadata>,
): FlatFieldMetadata =>
  ({
    id: 'test-field-id',
    name: 'testField',
    type: FieldMetadataType.TEXT,
    universalIdentifier: 'test-field-universal-id',
    ...overrides,
  }) as FlatFieldMetadata;

const createMockObjectMetadata = (
  overrides: Partial<FlatObjectMetadata>,
): FlatObjectMetadata =>
  ({
    id: 'test-object-id',
    nameSingular: 'testObject',
    namePlural: 'testObjects',
    fieldIds: [],
    universalIdentifier: 'test-object-universal-id',
    ...overrides,
  }) as FlatObjectMetadata;

const buildFlatEntityMaps = <
  TEntity extends FlatFieldMetadata | FlatObjectMetadata,
>(
  entities: TEntity[],
): FlatEntityMaps<TEntity> => ({
  byUniversalIdentifier: Object.fromEntries(
    entities.map((entity) => [entity.universalIdentifier as string, entity]),
  ),
  universalIdentifierById: Object.fromEntries(
    entities.map((entity) => [entity.id, entity.universalIdentifier as string]),
  ),
  universalIdentifiersByApplicationId: {},
});

describe('ChartDataQueryService', () => {
  const aggregateField = createMockFieldMetadata({
    id: 'amount-field-id',
    name: 'amount',
    type: FieldMetadataType.NUMBER,
    universalIdentifier: 'amount-field-universal-id',
  });

  const companyNameField = createMockFieldMetadata({
    id: 'company-name-field-id',
    name: 'name',
    type: FieldMetadataType.TEXT,
    universalIdentifier: 'company-name-universal-id',
  });

  const companyObject = createMockObjectMetadata({
    id: 'company-object-id',
    nameSingular: 'company',
    namePlural: 'companies',
    labelIdentifierFieldMetadataId: companyNameField.id,
    universalIdentifier: 'company-object-universal-id',
  });

  const companyRelationField = createMockFieldMetadata({
    id: 'company-relation-field-id',
    name: 'company',
    type: FieldMetadataType.RELATION,
    relationTargetObjectMetadataId: companyObject.id,
    universalIdentifier: 'company-relation-universal-id',
    settings: {
      relationType: RelationType.MANY_TO_ONE,
      joinColumnName: 'companyId',
    },
  } as Partial<FlatFieldMetadata>);

  const assigneeNameField = createMockFieldMetadata({
    id: 'assignee-name-field-id',
    name: 'name',
    type: FieldMetadataType.FULL_NAME,
    universalIdentifier: 'assignee-name-universal-id',
  });

  const assigneeObject = createMockObjectMetadata({
    id: 'assignee-object-id',
    nameSingular: 'workspaceMember',
    namePlural: 'workspaceMembers',
    labelIdentifierFieldMetadataId: assigneeNameField.id,
    universalIdentifier: 'assignee-object-universal-id',
  });

  const assigneeRelationField = createMockFieldMetadata({
    id: 'assignee-relation-field-id',
    name: 'assignee',
    type: FieldMetadataType.RELATION,
    relationTargetObjectMetadataId: assigneeObject.id,
    universalIdentifier: 'assignee-relation-universal-id',
    settings: {
      relationType: RelationType.MANY_TO_ONE,
      joinColumnName: 'assigneeId',
    },
  } as Partial<FlatFieldMetadata>);

  const sourceObject = createMockObjectMetadata({
    id: 'source-object-id',
    nameSingular: 'opportunity',
    namePlural: 'opportunities',
    fieldIds: [
      aggregateField.id,
      companyRelationField.id,
      assigneeRelationField.id,
    ],
    universalIdentifier: 'source-object-universal-id',
  });

  const flatObjectMetadataMaps = buildFlatEntityMaps([
    sourceObject,
    companyObject,
    assigneeObject,
  ]);

  const flatFieldMetadataMaps = buildFlatEntityMaps([
    aggregateField,
    companyRelationField,
    assigneeRelationField,
    companyNameField,
    assigneeNameField,
  ]);

  const executeMock = jest.fn();

  const service = new ChartDataQueryService({
    execute: executeMock,
  } as unknown as CommonGroupByQueryRunnerService);

  beforeEach(() => {
    jest.clearAllMocks();
    executeMock.mockResolvedValue({ results: [] });
  });

  const executeGroupByQueryForRelation = async (
    groupByFieldMetadataId: string,
  ) =>
    service.executeGroupByQuery({
      flatObjectMetadata: sourceObject,
      flatFieldMetadataMaps,
      flatObjectMetadataMaps,
      objectIdByNameSingular: {},
      authContext: {} as WorkspaceAuthContext,
      groupByFieldMetadataId,
      aggregateFieldMetadataId: aggregateField.id,
      aggregateOperation: AggregateOperations.SUM,
      userTimezone: 'UTC',
      firstDayOfTheWeek: 1,
      limit: 101,
      primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
    });

  it('should order by the target label then id when grouping by a bare relation', async () => {
    await executeGroupByQueryForRelation(companyRelationField.id);

    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [
          { company: { name: OrderByDirection.AscNullsLast } },
          { company: { id: OrderByDirection.AscNullsLast } },
        ],
      }),
      expect.anything(),
    );
  });

  it('should order by FULL_NAME subfields then id when grouping by a bare relation', async () => {
    await executeGroupByQueryForRelation(assigneeRelationField.id);

    expect(executeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [
          { assignee: { name: { firstName: OrderByDirection.AscNullsLast } } },
          { assignee: { name: { lastName: OrderByDirection.AscNullsLast } } },
          { assignee: { id: OrderByDirection.AscNullsLast } },
        ],
      }),
      expect.anything(),
    );
  });
});
