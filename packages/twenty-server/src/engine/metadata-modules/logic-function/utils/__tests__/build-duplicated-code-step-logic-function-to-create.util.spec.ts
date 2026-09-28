import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { type FlatLogicFunction } from 'src/engine/metadata-modules/logic-function/types/flat-logic-function.type';
import { buildDuplicatedCodeStepLogicFunctionToCreate } from 'src/engine/metadata-modules/logic-function/utils/build-duplicated-code-step-logic-function-to-create.util';

const WORKFLOW_ACTION_TRIGGER_SETTINGS = {
  inputSchema: [{ type: 'object', properties: {} }],
  outputSchema: {},
};

const EXISTING_LOGIC_FUNCTION = {
  id: 'source-logic-function',
  universalIdentifier: 'source-universal-identifier',
  name: 'Prepare company',
  description: 'Prepares a company',
  timeoutSeconds: 30,
  handlerName: 'default.config.handler',
  sourceHandlerPath: 'src/prepare.function.ts',
  builtHandlerPath: 'src/prepare.function.mjs',
  checksum: 'source-checksum',
  isBuildUpToDate: true,
  executionMode: LogicFunctionExecutionMode.PREBUILT,
  applicationUniversalIdentifier: 'installed-application',
  cronTriggerSettings: { pattern: '0 * * * *' },
  databaseEventTriggerSettings: { eventName: 'company.created' },
  httpRouteTriggerSettings: { path: '/prepare', httpMethod: 'POST' },
  serverRouteTriggerSettings: { path: '/prepare' },
  toolTriggerSettings: { inputSchema: {} },
  workflowActionTriggerSettings: WORKFLOW_ACTION_TRIGGER_SETTINGS,
} as unknown as FlatLogicFunction;

describe('buildDuplicatedCodeStepLogicFunctionToCreate', () => {
  it('keeps the code step behavior and drops every non-workflow trigger', () => {
    const duplicated = buildDuplicatedCodeStepLogicFunctionToCreate({
      existingLogicFunction: EXISTING_LOGIC_FUNCTION,
      id: 'copy-logic-function',
      sourceHandlerPath: 'copy-logic-function/src/index.ts',
      builtHandlerPath: 'copy-logic-function/src/index.mjs',
      checksum: 'copy-checksum',
      isBuildUpToDate: true,
      applicationUniversalIdentifier: 'workspace-custom-application',
    });

    expect(duplicated).toMatchObject({
      id: 'copy-logic-function',
      name: 'Prepare company',
      description: 'Prepares a company',
      timeoutSeconds: 30,
      handlerName: 'default.config.handler',
      sourceHandlerPath: 'copy-logic-function/src/index.ts',
      builtHandlerPath: 'copy-logic-function/src/index.mjs',
      checksum: 'copy-checksum',
      isBuildUpToDate: true,
      executionMode: LogicFunctionExecutionMode.LIVE,
      applicationUniversalIdentifier: 'workspace-custom-application',
      workflowActionTriggerSettings: WORKFLOW_ACTION_TRIGGER_SETTINGS,
      cronTriggerSettings: null,
      databaseEventTriggerSettings: null,
      httpRouteTriggerSettings: null,
      serverRouteTriggerSettings: null,
      toolTriggerSettings: null,
    });
    expect(duplicated.universalIdentifier).not.toBe(
      'source-universal-identifier',
    );
  });
});
