import { Test } from '@nestjs/testing';

import { WorkflowActionType } from 'twenty-shared/workflow';

import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowCommonWorkspaceService } from 'src/modules/workflow/common/workspace-services/workflow-common.workspace-service';
import { WorkflowRunFindOnePostQueryHook } from 'src/modules/workflow/workflow-builder/workflow-schema/query-hooks/workflow-run-find-one.post-query.hook';
import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { WorkflowTriggerType } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

describe('WorkflowRunFindOnePostQueryHook', () => {
  it('returns a run whose stored flow has no schemas with the computed ones', async () => {
    const testingModule = await Test.createTestingModule({
      providers: [
        WorkflowRunFindOnePostQueryHook,
        WorkflowSchemaWorkspaceService,
        { provide: WorkflowCommonWorkspaceService, useValue: {} },
        { provide: WorkspaceManyOrAllFlatEntityMapsCacheService, useValue: {} },
      ],
    }).compile();

    const workflowRun = Object.assign(new WorkflowRunWorkspaceEntity(), {
      state: {
        flow: {
          trigger: {
            name: 'Webhook',
            type: WorkflowTriggerType.WEBHOOK,
            settings: {
              outputSchema: {},
              httpMethod: 'POST',
              authentication: null,
              expectedBody: { message: 'hello' },
            },
          },
          steps: [
            {
              id: 'code-step',
              name: 'Code',
              type: WorkflowActionType.CODE,
              valid: true,
              settings: {
                input: { logicFunctionInput: {} },
                outputSchema: {},
                expectedOutputSchema: { total: 3 },
                errorHandlingOptions: {
                  retryOnFailure: { value: 0 },
                  continueOnFailure: { value: false },
                },
              },
            },
          ],
        },
        stepInfos: {},
      },
    });
    await testingModule
      .get(WorkflowRunFindOnePostQueryHook)
      .execute(buildSystemAuthContext('workspace-id'), 'workflowRun', [
        workflowRun,
      ]);

    expect(workflowRun.state.flow.trigger.settings.outputSchema).toEqual({
      message: {
        isLeaf: true,
        type: 'string',
        label: 'message',
        value: 'hello',
      },
    });
    expect(workflowRun.state.flow.steps[0].settings.outputSchema).toEqual({
      total: { isLeaf: true, type: 'number', label: 'total', value: 3 },
    });
  });
});
