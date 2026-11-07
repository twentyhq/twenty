import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type ReplaceWithdrawnCurrencyCodeCommand } from 'src/database/commands/upgrade-version-command/2-57/2-57-workspace-command-1794064503000-replace-withdrawn-currency-code.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const SCHEMA = getWorkspaceSchemaName(SEED_APPLE_WORKSPACE_ID);

const DEFAULT_VALUE_FIELDS = [
  {
    objectNameSingular: 'opportunity',
    fieldName: 'amount',
    tableName: 'opportunity',
  },
  {
    objectNameSingular: 'pet',
    fieldName: 'averageCostOfKibblePerMonth',
    tableName: '_pet',
  },
];

const buildDatabaseEventTrigger = ({
  amountFieldMetadataId,
  currencyCode,
}: {
  amountFieldMetadataId: string;
  currencyCode: string;
}) => ({
  type: 'DATABASE_EVENT',
  settings: {
    eventName: 'opportunity.updated',
    outputSchema: {},
    filter: {
      stepFilterGroups: [],
      stepFilters: [
        {
          id: 'step-filter-id',
          type: 'CURRENCY',
          stepOutputKey: '{{trigger.properties.after.amount}}',
          operand: 'IS',
          value: JSON.stringify([currencyCode]),
          stepFilterGroupId: 'step-filter-group-id',
          fieldMetadataId: amountFieldMetadataId,
          compositeFieldSubFieldName: 'currencyCode',
        },
      ],
    },
  },
});

const buildCreateOpportunityStep = (currencyCode: string) => ({
  id: 'create-opportunity-step-id',
  name: 'Create opportunity',
  type: 'CREATE_RECORD',
  valid: true,
  settings: {
    input: {
      objectName: 'opportunity',
      objectRecord: { amount: { amountMicros: 1000000, currencyCode } },
    },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: false },
      continueOnFailure: { value: false },
    },
  },
});

describe('2-57 workspace command - replace withdrawn currency code (integration)', () => {
  let command: ReplaceWithdrawnCurrencyCodeCommand;
  let amountFieldMetadataId: string;
  let opportunityCompanyFieldMetadataId: string;
  let annualRevenueFieldMetadataId: string;
  let chartWidgetId: string;
  let chartWidgetOriginalConfiguration: Record<string, unknown>;

  const withdrawnOpportunityId = randomUUID();
  const otherCurrencyOpportunityId = randomUUID();
  const directViewFilterId = randomUUID();
  const relatedViewFilterId = randomUUID();
  const coreWorkflowVersionId = randomUUID();
  const workspaceWorkflowVersionId = randomUUID();
  const rowLevelPermissionPredicateId = randomUUID();
  const chartWidgetRecordFilterId = randomUUID();

  const runOnWorkspace = (options: { dryRun?: boolean } = {}) =>
    command.runOnWorkspace({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options,
      index: 0,
      total: 1,
      dataSource: global.testDataSource,
    });

  const findFieldMetadataId = async ({
    objectNameSingular,
    fieldName,
  }: {
    objectNameSingular: string;
    fieldName: string;
  }): Promise<string> => {
    const [{ id }] = await global.testDataSource.query(
      `SELECT field.id FROM core."fieldMetadata" field
         JOIN core."objectMetadata" object ON object.id = field."objectMetadataId"
       WHERE field."workspaceId" = $1 AND object."nameSingular" = $2 AND field.name = $3`,
      [SEED_APPLE_WORKSPACE_ID, objectNameSingular, fieldName],
    );

    return id;
  };

  const findOpportunityCurrencyCodes = async () =>
    Object.fromEntries(
      (
        await global.testDataSource.query(
          `SELECT id, "amountCurrencyCode" FROM "${SCHEMA}"."opportunity" WHERE id = ANY($1)`,
          [[withdrawnOpportunityId, otherCurrencyOpportunityId]],
        )
      ).map(
        ({
          id,
          amountCurrencyCode,
        }: {
          id: string;
          amountCurrencyCode: string;
        }) => [id, amountCurrencyCode],
      ),
    );

  const findViewFilterValues = async () =>
    Object.fromEntries(
      (
        await global.testDataSource.query(
          `SELECT id, value FROM core."viewFilter" WHERE id = ANY($1)`,
          [[directViewFilterId, relatedViewFilterId]],
        )
      ).map(({ id, value }: { id: string; value: string }) => [id, value]),
    );

  const findCoreWorkflowVersion = async () => {
    const [{ triggers, steps }] = await global.testDataSource.query(
      `SELECT triggers, steps FROM core."workflowVersion" WHERE id = $1`,
      [coreWorkflowVersionId],
    );

    return { triggers, steps };
  };

  const findWorkspaceWorkflowVersionTrigger = async () => {
    const [{ trigger }] = await global.testDataSource.query(
      `SELECT trigger FROM "${SCHEMA}"."workflowVersion" WHERE id = $1`,
      [workspaceWorkflowVersionId],
    );

    return trigger;
  };

  const findDefaultValueCurrencyCodes = async () =>
    Promise.all(
      DEFAULT_VALUE_FIELDS.map(async ({ objectNameSingular, fieldName }) => {
        const [{ defaultValue }] = await global.testDataSource.query(
          `SELECT field."defaultValue" FROM core."fieldMetadata" field
             JOIN core."objectMetadata" object ON object.id = field."objectMetadataId"
           WHERE field."workspaceId" = $1 AND object."nameSingular" = $2 AND field.name = $3`,
          [SEED_APPLE_WORKSPACE_ID, objectNameSingular, fieldName],
        );

        return defaultValue?.currencyCode;
      }),
    );

  const findRowLevelPermissionPredicateValue = async () => {
    const [{ value }] = await global.testDataSource.query(
      `SELECT value FROM core."rowLevelPermissionPredicate" WHERE id = $1`,
      [rowLevelPermissionPredicateId],
    );

    return value;
  };

  const findChartWidgetRecordFilterValue = async () => {
    const [{ value }] = await global.testDataSource.query(
      `SELECT recordFilter ->> 'value' AS value
         FROM core."pageLayoutWidget",
           jsonb_array_elements(configuration -> 'filter' -> 'recordFilters') AS recordFilter
       WHERE id = $1 AND recordFilter ->> 'id' = $2`,
      [chartWidgetId, chartWidgetRecordFilterId],
    );

    return value;
  };

  const expectWithdrawnCurrencyCode = async (currencyCode: string) => {
    expect(await findDefaultValueCurrencyCodes()).toEqual([
      `'${currencyCode}'`,
      `'${currencyCode}'`,
    ]);
    expect(await findRowLevelPermissionPredicateValue()).toBe(
      JSON.stringify([currencyCode]),
    );
    expect(await findChartWidgetRecordFilterValue()).toBe(
      JSON.stringify([currencyCode]),
    );
    expect(await findOpportunityCurrencyCodes()).toEqual({
      [withdrawnOpportunityId]: currencyCode,
      [otherCurrencyOpportunityId]: 'USD',
    });
    expect(await findViewFilterValues()).toEqual({
      [directViewFilterId]: JSON.stringify([currencyCode, 'USD']),
      [relatedViewFilterId]: JSON.stringify([currencyCode]),
    });
    expect(await findCoreWorkflowVersion()).toEqual({
      triggers: [
        buildDatabaseEventTrigger({ amountFieldMetadataId, currencyCode }),
      ],
      steps: [buildCreateOpportunityStep(currencyCode)],
    });
    expect(await findWorkspaceWorkflowVersionTrigger()).toEqual(
      buildDatabaseEventTrigger({ amountFieldMetadataId, currencyCode }),
    );
  };

  beforeAll(async () => {
    command = getAppProviderByClassName<ReplaceWithdrawnCurrencyCodeCommand>(
      'ReplaceWithdrawnCurrencyCodeCommand',
    );

    amountFieldMetadataId = await findFieldMetadataId({
      objectNameSingular: 'opportunity',
      fieldName: 'amount',
    });
    opportunityCompanyFieldMetadataId = await findFieldMetadataId({
      objectNameSingular: 'opportunity',
      fieldName: 'company',
    });
    annualRevenueFieldMetadataId = await findFieldMetadataId({
      objectNameSingular: 'company',
      fieldName: 'annualRevenue',
    });

    for (const { objectNameSingular, fieldName } of DEFAULT_VALUE_FIELDS) {
      await global.testDataSource.query(
        `UPDATE core."fieldMetadata" field SET "defaultValue" = $4::jsonb
           FROM core."objectMetadata" object
         WHERE object.id = field."objectMetadataId" AND field."workspaceId" = $1
           AND object."nameSingular" = $2 AND field.name = $3`,
        [
          SEED_APPLE_WORKSPACE_ID,
          objectNameSingular,
          fieldName,
          JSON.stringify({ amountMicros: null, currencyCode: "'ANG'" }),
        ],
      );
    }

    const [{ id: roleId, applicationId: roleApplicationId }] =
      await global.testDataSource.query(
        `SELECT id, "applicationId" FROM core.role WHERE "workspaceId" = $1 AND label = 'Member'`,
        [SEED_APPLE_WORKSPACE_ID],
      );

    await global.testDataSource.query(
      `INSERT INTO core."rowLevelPermissionPredicate"
         (id, "workspaceId", "universalIdentifier", "applicationId", "roleId", "objectMetadataId", "fieldMetadataId", operand, "subFieldName", value)
       SELECT $1, $2, $3, $4, $5, field."objectMetadataId", field.id, 'IS', 'currencyCode', $7::jsonb
         FROM core."fieldMetadata" field WHERE field.id = $6`,
      [
        rowLevelPermissionPredicateId,
        SEED_APPLE_WORKSPACE_ID,
        randomUUID(),
        roleApplicationId,
        roleId,
        amountFieldMetadataId,
        JSON.stringify(JSON.stringify(['ANG'])),
      ],
    );

    [{ id: chartWidgetId, configuration: chartWidgetOriginalConfiguration }] =
      await global.testDataSource.query(
        `SELECT id, configuration FROM core."pageLayoutWidget"
         WHERE "workspaceId" = $1 AND configuration ->> 'aggregateFieldMetadataId' = $2
           AND configuration -> 'filter' -> 'recordFilters' IS NOT NULL
         LIMIT 1`,
        [SEED_APPLE_WORKSPACE_ID, amountFieldMetadataId],
      );

    await global.testDataSource.query(
      `UPDATE core."pageLayoutWidget"
         SET configuration = jsonb_insert(configuration, '{filter,recordFilters,-1}', $2::jsonb, true)
       WHERE id = $1`,
      [
        chartWidgetId,
        JSON.stringify({
          id: chartWidgetRecordFilterId,
          value: JSON.stringify(['ANG']),
          operand: 'IS',
          fieldMetadataId: amountFieldMetadataId,
          subFieldName: 'currencyCode',
        }),
      ],
    );

    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatFieldMetadataMaps',
      'flatRowLevelPermissionPredicateMaps',
      'flatPageLayoutWidgetMaps',
    ]);

    await global.testDataSource.query(
      `INSERT INTO "${SCHEMA}"."opportunity" (id, "amountAmountMicros", "amountCurrencyCode")
       VALUES ($1, 1000000, 'ANG'), ($2, 1000000, 'USD')`,
      [withdrawnOpportunityId, otherCurrencyOpportunityId],
    );

    const [{ id: viewId, applicationId: viewApplicationId }] =
      await global.testDataSource.query(
        `SELECT view.id, view."applicationId" FROM core.view view
           JOIN core."objectMetadata" object ON object.id = view."objectMetadataId"
         WHERE view."workspaceId" = $1 AND object."nameSingular" = 'opportunity'
         LIMIT 1`,
        [SEED_APPLE_WORKSPACE_ID],
      );

    await global.testDataSource.query(
      `INSERT INTO core."viewFilter"
         (id, "workspaceId", "universalIdentifier", "applicationId", "viewId", "fieldMetadataId", "relationTargetFieldMetadataId", operand, "subFieldName", value)
       VALUES
         ($1, $3, $4, $6, $7, $8, NULL, 'IS', 'currencyCode', $10::jsonb),
         ($2, $3, $5, $6, $7, $9, $11, 'IS', 'currencyCode', $12::jsonb)`,
      [
        directViewFilterId,
        relatedViewFilterId,
        SEED_APPLE_WORKSPACE_ID,
        randomUUID(),
        randomUUID(),
        viewApplicationId,
        viewId,
        amountFieldMetadataId,
        opportunityCompanyFieldMetadataId,
        JSON.stringify(JSON.stringify(['ANG', 'USD'])),
        annualRevenueFieldMetadataId,
        JSON.stringify(JSON.stringify(['ANG'])),
      ],
    );

    const [{ id: coreWorkflowId, applicationId: workflowApplicationId }] =
      await global.testDataSource.query(
        `SELECT id, "applicationId" FROM core.workflow WHERE "workspaceId" = $1 LIMIT 1`,
        [SEED_APPLE_WORKSPACE_ID],
      );

    await global.testDataSource.query(
      `INSERT INTO core."workflowVersion"
         (id, "workspaceId", "coreWorkflowId", status, "universalIdentifier", "applicationId", triggers, steps)
       VALUES ($1, $2, $3, 'DRAFT', $4, $5, $6::jsonb, $7::jsonb)`,
      [
        coreWorkflowVersionId,
        SEED_APPLE_WORKSPACE_ID,
        coreWorkflowId,
        randomUUID(),
        workflowApplicationId,
        JSON.stringify([
          buildDatabaseEventTrigger({
            amountFieldMetadataId,
            currencyCode: 'ANG',
          }),
        ]),
        JSON.stringify([buildCreateOpportunityStep('ANG')]),
      ],
    );

    await global.testDataSource.query(
      `INSERT INTO "${SCHEMA}"."workflowVersion" (id, trigger) VALUES ($1, $2::jsonb)`,
      [
        workspaceWorkflowVersionId,
        JSON.stringify(
          buildDatabaseEventTrigger({
            amountFieldMetadataId,
            currencyCode: 'ANG',
          }),
        ),
      ],
    );
  });

  afterAll(async () => {
    for (const {
      objectNameSingular,
      fieldName,
      tableName,
    } of DEFAULT_VALUE_FIELDS) {
      await global.testDataSource.query(
        `UPDATE core."fieldMetadata" field SET "defaultValue" = NULL
           FROM core."objectMetadata" object
         WHERE object.id = field."objectMetadataId" AND field."workspaceId" = $1
           AND object."nameSingular" = $2 AND field.name = $3`,
        [SEED_APPLE_WORKSPACE_ID, objectNameSingular, fieldName],
      );
      await global.testDataSource.query(
        `ALTER TABLE "${SCHEMA}"."${tableName}" ALTER COLUMN "${fieldName}CurrencyCode" DROP DEFAULT`,
      );
    }
    await global.testDataSource.query(
      `DELETE FROM core."rowLevelPermissionPredicate" WHERE id = $1`,
      [rowLevelPermissionPredicateId],
    );
    await global.testDataSource.query(
      `UPDATE core."pageLayoutWidget" SET configuration = $2::jsonb WHERE id = $1`,
      [chartWidgetId, JSON.stringify(chartWidgetOriginalConfiguration)],
    );
    await global.testDataSource.query(
      `DELETE FROM "${SCHEMA}"."workflowVersion" WHERE id = $1`,
      [workspaceWorkflowVersionId],
    );
    await global.testDataSource.query(
      `DELETE FROM core."workflowVersion" WHERE id = $1`,
      [coreWorkflowVersionId],
    );
    await global.testDataSource.query(
      `DELETE FROM core."viewFilter" WHERE id = ANY($1)`,
      [[directViewFilterId, relatedViewFilterId]],
    );
    await global.testDataSource.query(
      `DELETE FROM "${SCHEMA}"."opportunity" WHERE id = ANY($1)`,
      [[withdrawnOpportunityId, otherCurrencyOpportunityId]],
    );
    await getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    ).invalidateAndRecompute(SEED_APPLE_WORKSPACE_ID, [
      'flatFieldMetadataMaps',
      'flatRowLevelPermissionPredicateMaps',
      'flatPageLayoutWidgetMaps',
      'flatViewFilterMaps',
      'flatWorkflowVersionMaps',
      'workflowAutomatedTriggerMaps',
    ]);
  });

  it('changes nothing on a dry run', async () => {
    await runOnWorkspace({ dryRun: true });

    await expectWithdrawnCurrencyCode('ANG');
  });

  it('replaces the withdrawn currency code everywhere it is stored', async () => {
    await runOnWorkspace();

    await expectWithdrawnCurrencyCode('XCG');
  });

  it('is idempotent', async () => {
    await runOnWorkspace();

    await expectWithdrawnCurrencyCode('XCG');
  });
});
