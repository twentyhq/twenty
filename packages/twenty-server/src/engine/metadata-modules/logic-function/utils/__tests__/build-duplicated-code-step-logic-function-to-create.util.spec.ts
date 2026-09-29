import { type WorkflowActionTriggerSettings } from 'twenty-shared/application';

import { LogicFunctionExecutionMode } from 'src/engine/metadata-modules/logic-function/logic-function.entity';
import { buildDuplicatedCodeStepLogicFunctionToCreate } from 'src/engine/metadata-modules/logic-function/utils/build-duplicated-code-step-logic-function-to-create.util';

const WORKFLOW_ACTION_TRIGGER_SETTINGS: WorkflowActionTriggerSettings = {
  inputSchema: [{ type: 'object', properties: {} }],
};

const EXISTING_LOGIC_FUNCTION = {
  name: 'Prepare company',
  description: 'Prepares a company',
  timeoutSeconds: 30,
  handlerName: 'default.config.handler',
  workflowActionTriggerSettings: WORKFLOW_ACTION_TRIGGER_SETTINGS,
  cronTriggerSettings: { pattern: '0 * * * *' },
  databaseEventTriggerSettings: { eventName: 'company.created' },
  httpRouteTriggerSettings: { path: '/prepare', httpMethod: 'POST' },
  toolTriggerSettings: { inputSchema: {} },
};

describe('buildDuplicatedCodeStepLogicFunctionToCreate', () => {
  it('keeps the code step behavior and drops every non-workflow trigger', () => {
    expect(
      buildDuplicatedCodeStepLogicFunctionToCreate({
        existingLogicFunction: EXISTING_LOGIC_FUNCTION,
        id: 'copy-logic-function',
        sourceHandlerPath: 'copy-logic-function/src/index.ts',
        builtHandlerPath: 'copy-logic-function/src/index.mjs',
        checksum: 'copy-checksum',
        isBuildUpToDate: true,
        applicationUniversalIdentifier: 'workspace-custom-application',
      }),
    ).toMatchObject({
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
  });
});
