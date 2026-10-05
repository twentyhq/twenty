import { randomUUID } from 'node:crypto';

import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';

import { type BindValidationRuleExpressionsToFieldSymbolsCommand } from 'src/database/commands/upgrade-version-command/2-46/2-46-workspace-command-1791210946811-bind-validation-rule-expressions-to-field-symbols.command';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const LEGACY_EXPRESSION =
  'stage != "WON" or (isDefined(company) and isNonEmptyString(company.name) and not isEmpty(amount.amountMicros))';

describe('2-46 workspace command - bind validation rule expressions to field symbols (integration)', () => {
  let command: BindValidationRuleExpressionsToFieldSymbolsCommand;
  let workspaceCacheService: WorkspaceCacheService;
  let legacyBindings: Record<string, string>;
  let fieldUniversalIdentifierByPath: Record<string, string>;

  const validationRuleId = randomUUID();

  const runCommand = (direction: 'up' | 'down') =>
    command[direction]({
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      options: {},
      dataSource: global.testDataSource,
      index: 0,
      total: 1,
    });

  const readValidationRule = async () => {
    const [validationRule] = await global.testDataSource.query(
      `SELECT expression, bindings FROM core."validationRule" WHERE id = $1`,
      [validationRuleId],
    );

    return validationRule;
  };

  beforeAll(async () => {
    command =
      getAppProviderByClassName<BindValidationRuleExpressionsToFieldSymbolsCommand>(
        'BindValidationRuleExpressionsToFieldSymbolsCommand',
      );
    workspaceCacheService = getAppProviderByClassName<WorkspaceCacheService>(
      'WorkspaceCacheService',
    );

    const fieldRows: {
      objectMetadataId: string;
      nameSingular: string;
      name: string;
      universalIdentifier: string;
    }[] = await global.testDataSource.query(
      `SELECT field."objectMetadataId", object."nameSingular", field.name, field."universalIdentifier"
       FROM core."fieldMetadata" field
       JOIN core."objectMetadata" object ON object.id = field."objectMetadataId"
       WHERE field."workspaceId" = $1
         AND ((object."nameSingular" = 'opportunity' AND field.name IN ('stage', 'amount', 'company'))
           OR (object."nameSingular" = 'company' AND field.name = 'name'))`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    fieldUniversalIdentifierByPath = Object.fromEntries(
      fieldRows.map(({ nameSingular, name, universalIdentifier }) => [
        nameSingular === 'company' ? `company.${name}` : name,
        universalIdentifier,
      ]),
    );
    legacyBindings = {
      stage: fieldUniversalIdentifierByPath.stage,
      company: fieldUniversalIdentifierByPath.company,
      'company.name': fieldUniversalIdentifierByPath['company.name'],
      amount: fieldUniversalIdentifierByPath.amount,
    };

    const opportunityObjectMetadataId = fieldRows.find(
      ({ nameSingular }) => nameSingular === 'opportunity',
    )?.objectMetadataId;

    const [workspace] = await global.testDataSource.query(
      `SELECT "workspaceCustomApplicationId" FROM core."workspace" WHERE id = $1`,
      [SEED_APPLE_WORKSPACE_ID],
    );

    await global.testDataSource.query(
      `INSERT INTO core."validationRule"
         (id, "universalIdentifier", "workspaceId", "applicationId", "objectMetadataId", name, expression, bindings, message, "isActive")
       VALUES ($1, $1, $2, $3, $4, 'Won opportunity needs a company and an amount', $5, $6::jsonb, 'Add a company and an amount', false)`,
      [
        validationRuleId,
        SEED_APPLE_WORKSPACE_ID,
        workspace.workspaceCustomApplicationId,
        opportunityObjectMetadataId,
        LEGACY_EXPRESSION,
        JSON.stringify(legacyBindings),
      ],
    );
  });

  afterAll(async () => {
    await runCommand('up');

    await global.testDataSource.query(
      `DELETE FROM core."validationRule" WHERE id = $1`,
      [validationRuleId],
    );
    await workspaceCacheService.invalidateAndRecompute(
      SEED_APPLE_WORKSPACE_ID,
      ['flatValidationRuleMaps'],
    );
  });

  it('binds every field path of an existing rule to a field symbol', async () => {
    await runCommand('up');

    expect(await readValidationRule()).toEqual({
      expression:
        '$f1 != "WON" or (isDefined($f2) and isNonEmptyString($f2.$f3) and not isEmpty($f4.amountMicros))',
      bindings: {
        $f1: fieldUniversalIdentifierByPath.stage,
        $f2: fieldUniversalIdentifierByPath.company,
        $f3: fieldUniversalIdentifierByPath['company.name'],
        $f4: fieldUniversalIdentifierByPath.amount,
      },
    });
  });

  it('changes nothing when run again', async () => {
    const convertedValidationRule = await readValidationRule();

    await runCommand('up');

    expect(await readValidationRule()).toEqual(convertedValidationRule);
  });

  it('writes the rule back with field names', async () => {
    await runCommand('down');

    expect(await readValidationRule()).toEqual({
      expression: LEGACY_EXPRESSION,
      bindings: legacyBindings,
    });
  });
});
