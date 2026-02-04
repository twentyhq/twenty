import { FieldMetadataType } from 'twenty-shared/types';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { createBuildDashboardWidgetConfigTool } from 'src/modules/dashboard/tools/build-dashboard-widget-config.tool';
import { widgetConfigurationSchema } from 'src/modules/dashboard/tools/schemas/widget.schema';

const mockWorkspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';

const COMPANY_OBJECT_ID = '20202020-f3ad-452e-b5b6-2d49d3ea88b1';
const AMOUNT_FIELD_ID = '20202020-bc64-4148-8a79-b3144f743694';
const STAGE_FIELD_ID = '20202020-0487-4c26-a58c-95cda3823a74';
const ADDRESS_FIELD_ID = '20202020-1111-4148-8a79-b3144f743694';
const OWNER_FIELD_ID = '20202020-2222-4148-8a79-b3144f743694';
const PERSON_OBJECT_ID = '20202020-3333-4148-8a79-b3144f743694';
const PERSON_NAME_FIELD_ID = '20202020-4444-4148-8a79-b3144f743694';
const ACCOUNT_RELATION_FIELD_ID = '20202020-5555-4148-8a79-b3144f743694';

type ObjectMapEntry = {
  id: string;
  nameSingular: string;
  namePlural: string;
  labelSingular: string;
  labelPlural: string;
  isActive: boolean;
};

type FieldMapEntry = {
  id: string;
  name: string;
  label: string;
  objectMetadataId: string;
  isActive: boolean;
  type: FieldMetadataType;
  relationTargetObjectMetadataId?: string | null;
  morphId?: string | null;
};

type FlatEntityMaps<T> = {
  byUniversalIdentifier: Record<string, T>;
  universalIdentifierById: Record<string, string>;
  universalIdentifiersByApplicationId: Record<string, string[]>;
};

type BuiltWidgetResult = {
  objectMetadataId?: string;
  configuration?: {
    primaryAxisGroupBySubFieldName?: string;
  };
  resolvedFieldMetadataIds?: {
    aggregateFieldMetadataId?: string;
  };
};

const assertSuccess: (result: {
  success: boolean;
  message?: string;
}) => asserts result is {
  success: true;
  result: Record<string, unknown>;
  warnings?: string[];
} = (result) => {
  expect(result.success).toBe(true);
  if (!result.success) {
    throw new Error(result.message ?? 'Expected success');
  }
};

const assertFailure: (result: {
  success: boolean;
  message?: string;
}) => asserts result is {
  success: false;
  message: string;
  candidates?: unknown;
} = (result) => {
  expect(result.success).toBe(false);
  if (result.success) {
    throw new Error('Expected failure');
  }
};

const baseObjectMaps: FlatEntityMaps<ObjectMapEntry> = {
  byUniversalIdentifier: {
    'object-company': {
      id: COMPANY_OBJECT_ID,
      nameSingular: 'company',
      namePlural: 'companies',
      labelSingular: 'Company',
      labelPlural: 'Companies',
      isActive: true,
    },
    'object-person': {
      id: PERSON_OBJECT_ID,
      nameSingular: 'person',
      namePlural: 'people',
      labelSingular: 'Person',
      labelPlural: 'People',
      isActive: true,
    },
  },
  universalIdentifierById: {
    [COMPANY_OBJECT_ID]: 'object-company',
    [PERSON_OBJECT_ID]: 'object-person',
  },
  universalIdentifiersByApplicationId: {},
};

const baseFieldMaps: FlatEntityMaps<FieldMapEntry> = {
  byUniversalIdentifier: {
    'field-amount': {
      id: AMOUNT_FIELD_ID,
      name: 'amount',
      label: 'Amount',
      objectMetadataId: COMPANY_OBJECT_ID,
      isActive: true,
      type: FieldMetadataType.NUMBER,
    },
    'field-stage': {
      id: STAGE_FIELD_ID,
      name: 'stage',
      label: 'Stage',
      objectMetadataId: COMPANY_OBJECT_ID,
      isActive: true,
      type: FieldMetadataType.TEXT,
    },
    'field-address': {
      id: ADDRESS_FIELD_ID,
      name: 'address',
      label: 'Address',
      objectMetadataId: COMPANY_OBJECT_ID,
      isActive: true,
      type: FieldMetadataType.ADDRESS,
    },
    'field-owner': {
      id: OWNER_FIELD_ID,
      name: 'owner',
      label: 'Owner',
      objectMetadataId: COMPANY_OBJECT_ID,
      isActive: true,
      type: FieldMetadataType.RELATION,
      relationTargetObjectMetadataId: PERSON_OBJECT_ID,
    },
    'field-person-name': {
      id: PERSON_NAME_FIELD_ID,
      name: 'name',
      label: 'Name',
      objectMetadataId: PERSON_OBJECT_ID,
      isActive: true,
      type: FieldMetadataType.TEXT,
    },
    'field-account': {
      id: ACCOUNT_RELATION_FIELD_ID,
      name: 'account',
      label: 'Account',
      objectMetadataId: PERSON_OBJECT_ID,
      isActive: true,
      type: FieldMetadataType.RELATION,
      relationTargetObjectMetadataId: COMPANY_OBJECT_ID,
    },
  },
  universalIdentifierById: {
    [AMOUNT_FIELD_ID]: 'field-amount',
    [STAGE_FIELD_ID]: 'field-stage',
    [ADDRESS_FIELD_ID]: 'field-address',
    [OWNER_FIELD_ID]: 'field-owner',
    [PERSON_NAME_FIELD_ID]: 'field-person-name',
    [ACCOUNT_RELATION_FIELD_ID]: 'field-account',
  },
  universalIdentifiersByApplicationId: {},
};

const buildTool = ({
  objectMaps = baseObjectMaps,
  fieldMaps = baseFieldMaps,
}: {
  objectMaps?: typeof baseObjectMaps;
  fieldMaps?: typeof baseFieldMaps;
}) => {
  const deps = {
    flatEntityMapsCacheService: {
      getOrRecomputeManyOrAllFlatEntityMaps: jest.fn().mockResolvedValue({
        flatObjectMetadataMaps: objectMaps,
        flatFieldMetadataMaps: fieldMaps,
      }),
    },
  };

  return createBuildDashboardWidgetConfigTool(deps as any, {
    workspaceId: mockWorkspaceId,
  });
};

describe('build_dashboard_widget_config tool', () => {
  it('resolves object by singular name and label', async () => {
    const tool = buildTool({});

    const result = await tool.execute({
      object: 'Company',
      configurationType: WidgetConfigurationType.AGGREGATE_CHART,
      aggregateOperation: AggregateOperations.SUM,
      aggregateField: 'Amount',
    });

    assertSuccess(result);
    const payload = result.result as BuiltWidgetResult;

    expect(payload.objectMetadataId).toBe(COMPANY_OBJECT_ID);
  });

  it('resolves fields by label', async () => {
    const tool = buildTool({});

    const result = await tool.execute({
      object: 'company',
      configurationType: WidgetConfigurationType.AGGREGATE_CHART,
      aggregateOperation: AggregateOperations.SUM,
      aggregateField: 'Amount',
    });

    assertSuccess(result);
    const payload = result.result as BuiltWidgetResult;

    expect(payload.resolvedFieldMetadataIds?.aggregateFieldMetadataId).toBe(
      AMOUNT_FIELD_ID,
    );
  });

  it('returns ambiguity when multiple fields match', async () => {
    const tool = buildTool({
      fieldMaps: {
        ...baseFieldMaps,
        byUniversalIdentifier: {
          ...baseFieldMaps.byUniversalIdentifier,
          'field-amount-duplicate': {
            id: '20202020-7d2e-4178-8a79-c512d8ef89ab',
            name: 'amountDuplicate',
            label: 'Amount',
            objectMetadataId: COMPANY_OBJECT_ID,
            isActive: true,
            type: FieldMetadataType.NUMBER,
          },
        },
        universalIdentifierById: {
          ...baseFieldMaps.universalIdentifierById,
          '20202020-7d2e-4178-8a79-c512d8ef89ab': 'field-amount-duplicate',
        },
      },
    });

    const result = await tool.execute({
      object: 'company',
      configurationType: WidgetConfigurationType.AGGREGATE_CHART,
      aggregateOperation: AggregateOperations.SUM,
      aggregateField: 'Amount',
    });

    assertFailure(result);
    expect(result.candidates?.fields?.aggregateField).toHaveLength(2);
  });

  it('returns error when object not found', async () => {
    const tool = buildTool({});

    const result = await tool.execute({
      object: 'unknown',
      configurationType: WidgetConfigurationType.AGGREGATE_CHART,
      aggregateOperation: AggregateOperations.SUM,
      aggregateField: 'Amount',
    });

    assertFailure(result);
    expect(result.message).toMatch('No object found');
  });

  it('returns configuration that passes widget schema', async () => {
    const tool = buildTool({});

    const result = await tool.execute({
      object: 'company',
      configurationType: WidgetConfigurationType.AGGREGATE_CHART,
      aggregateOperation: AggregateOperations.SUM,
      aggregateField: 'Amount',
    });

    assertSuccess(result);
    const payload = result.result as BuiltWidgetResult;
    const validation = widgetConfigurationSchema.safeParse(
      payload.configuration,
    );

    expect(validation.success).toBe(true);
  });

  it('resolves composite subfield from dot path', async () => {
    const tool = buildTool({});

    const result = await tool.execute({
      object: 'company',
      configurationType: WidgetConfigurationType.BAR_CHART,
      aggregateOperation: AggregateOperations.COUNT,
      aggregateField: 'Amount',
      groupByField: 'address.addressCity',
    });

    assertSuccess(result);
    const payload = result.result as BuiltWidgetResult;

    expect(payload.configuration?.primaryAxisGroupBySubFieldName).toBe(
      'addressCity',
    );
  });

  it('returns candidates when composite subfield is missing', async () => {
    const tool = buildTool({});

    const result = await tool.execute({
      object: 'company',
      configurationType: WidgetConfigurationType.BAR_CHART,
      aggregateOperation: AggregateOperations.COUNT,
      aggregateField: 'Amount',
      groupByField: 'address',
    });

    assertFailure(result);
    const candidates = (
      result as {
        candidates?: { subFields?: string[] };
      }
    ).candidates;

    expect(candidates?.subFields).toContain('addressCity');
  });

  it('resolves relation subfield', async () => {
    const tool = buildTool({});

    const result = await tool.execute({
      object: 'company',
      configurationType: WidgetConfigurationType.BAR_CHART,
      aggregateOperation: AggregateOperations.COUNT,
      aggregateField: 'Amount',
      groupByField: 'owner.name',
    });

    assertSuccess(result);
    const payload = result.result as BuiltWidgetResult;

    expect(payload.configuration?.primaryAxisGroupBySubFieldName).toBe('name');
  });

  it('resolves relation composite subfield', async () => {
    const tool = buildTool({});

    const result = await tool.execute({
      object: 'person',
      configurationType: WidgetConfigurationType.BAR_CHART,
      aggregateOperation: AggregateOperations.COUNT,
      aggregateField: 'name',
      groupByField: 'account.address.addressCity',
    });

    assertSuccess(result);
    const payload = result.result as BuiltWidgetResult;

    expect(payload.configuration?.primaryAxisGroupBySubFieldName).toBe(
      'address.addressCity',
    );
  });

  it('returns warning when relation subfield is missing', async () => {
    const tool = buildTool({});

    const result = await tool.execute({
      object: 'company',
      configurationType: WidgetConfigurationType.BAR_CHART,
      aggregateOperation: AggregateOperations.COUNT,
      aggregateField: 'Amount',
      groupByField: 'owner',
    });

    assertSuccess(result);
    expect(result.warnings?.length).toBeGreaterThan(0);
  });
});
