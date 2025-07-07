import { Injectable } from '@nestjs/common';

import { isString } from '@sniptt/guards';
import axios, { AxiosRequestConfig } from 'axios';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { resolveInput } from 'src/modules/workflow/workflow-executor/utils/variable-resolver.util';

import { isWorkflowHttpRequestAction } from './guards/is-workflow-http-request-action.guard';
import { WorkflowHttpRequestActionInput } from './types/workflow-http-request-action-input.type';

@Injectable()
export class HttpRequestWorkflowAction implements WorkflowAction {
  async execute({
    currentStepId,
    steps,
    context,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = steps.find((step) => step.id === currentStepId);

    if (!step) {
      throw new WorkflowStepExecutorException(
        'Step not found',
        WorkflowStepExecutorExceptionCode.STEP_NOT_FOUND,
      );
    }
    if (!isWorkflowHttpRequestAction(step)) {
      throw new WorkflowStepExecutorException(
        'Step is not an HTTP Request action',
        WorkflowStepExecutorExceptionCode.INVALID_STEP_TYPE,
      );
    }

    const workflowActionInput = resolveInput(
      step.settings.input,
      context,
    ) as WorkflowHttpRequestActionInput;

    const { url, method, headers, body } = workflowActionInput;

    try {
      const axiosConfig: AxiosRequestConfig = {
        url,
        method: method,
        headers,
      };

      if (['POST', 'PUT', 'PATCH'].includes(method) && body) {
        const parsedBody = isString(body) ? JSON.parse(body) : body;

        axiosConfig.data = parsedBody;
      }

      const response = await axios(axiosConfig);

      return { result: response.data };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          error: error.response?.data || error.message || 'HTTP request failed',
        };
      }

      return {
        error: error instanceof Error ? error.message : 'HTTP request failed',
      };
    }
  }
}
