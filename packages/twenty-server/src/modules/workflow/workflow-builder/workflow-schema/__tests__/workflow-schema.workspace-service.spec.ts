import { WorkflowActionType } from 'twenty-shared/workflow';

import { WorkflowSchemaWorkspaceService } from 'src/modules/workflow/workflow-builder/workflow-schema/workflow-schema.workspace-service';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  type WorkflowTrigger,
  WorkflowTriggerType,
} from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const ERROR_HANDLING_OPTIONS = {
  continueOnFailure: { value: false },
  retryOnFailure: { value: 0 },
};

const trigger: WorkflowTrigger = {
  name: 'Manual Trigger',
  type: WorkflowTriggerType.MANUAL,
  settings: { outputSchema: {} },
  nextStepIds: ['iterator'],
};

const iteratorStepWithoutSchema = {
  id: 'iterator',
  name: 'Loop',
  type: WorkflowActionType.ITERATOR,
  valid: true,
  nextStepIds: [],
  settings: {
    input: { items: ['a', 'b'] },
    outputSchema: {},
    errorHandlingOptions: ERROR_HANDLING_OPTIONS,
  },
} as WorkflowAction;

const sendEmailStep = {
  id: 'send-email',
  name: 'Send Email',
  type: WorkflowActionType.SEND_EMAIL,
  valid: true,
  nextStepIds: [],
  settings: {
    input: {
      connectedAccountId: '',
      recipients: { to: '', cc: '', bcc: '' },
      subject: '',
      body: '',
    },
    outputSchema: { kept: { isLeaf: true, type: 'string', value: 'as is' } },
    errorHandlingOptions: ERROR_HANDLING_OPTIONS,
  },
} as WorkflowAction;

describe('WorkflowSchemaWorkspaceService', () => {
  const workflowCommonWorkspaceService = {
    getObjectMetadataInfo: jest
      .fn()
      .mockRejectedValue(new Error('Object deletedObject not found')),
  };

  const service = new WorkflowSchemaWorkspaceService(
    workflowCommonWorkspaceService as never,
    {} as never,
  );

  describe('enrichStepsOutputSchema', () => {
    it('should rebuild the iterator output schema instead of keeping an incomplete one', async () => {
      const steps = await service.enrichStepsOutputSchema({
        trigger,
        steps: [iteratorStepWithoutSchema, sendEmailStep],
        workspaceId: 'workspace-id',
      });

      expect(steps?.[0].settings.outputSchema).toEqual({
        currentItem: expect.objectContaining({
          label: 'Current Item',
          type: 'string',
        }),
        currentItemIndex: expect.objectContaining({ type: 'number' }),
        hasProcessedAllItems: expect.objectContaining({ type: 'boolean' }),
      });
    });

    it('should keep the output schema of steps the server does not enrich', async () => {
      const steps = await service.enrichStepsOutputSchema({
        trigger,
        steps: [iteratorStepWithoutSchema, sendEmailStep],
        workspaceId: 'workspace-id',
      });

      expect(steps?.[1]).toBe(sendEmailStep);
    });

    it('should fall back to the default item when the iterated source no longer resolves', async () => {
      const findRecordsStep = {
        id: 'find-records',
        name: 'Find Records',
        type: WorkflowActionType.FIND_RECORDS,
        valid: true,
        nextStepIds: ['iterator'],
        settings: {
          input: { objectName: 'deletedObject', limit: 10 },
          outputSchema: {},
          errorHandlingOptions: ERROR_HANDLING_OPTIONS,
        },
      } as WorkflowAction;

      const iteratorOverFindRecords = {
        ...iteratorStepWithoutSchema,
        settings: {
          ...iteratorStepWithoutSchema.settings,
          input: { items: '{{find-records.all}}' },
        },
      } as WorkflowAction;

      const steps = await service.enrichStepsOutputSchema({
        trigger,
        steps: [findRecordsStep, iteratorOverFindRecords],
        workspaceId: 'workspace-id',
      });

      expect(
        workflowCommonWorkspaceService.getObjectMetadataInfo,
      ).toHaveBeenCalledWith('deletedObject', 'workspace-id');
      expect(steps?.[1].settings.outputSchema).toEqual(
        expect.objectContaining({
          currentItem: {
            label: 'Current Item',
            isLeaf: true,
            type: 'unknown',
            value: null,
          },
        }),
      );
    });

    it('should return null when the version has no steps', async () => {
      await expect(
        service.enrichStepsOutputSchema({
          trigger,
          steps: null,
          workspaceId: 'workspace-id',
        }),
      ).resolves.toBeNull();
    });
  });
});
