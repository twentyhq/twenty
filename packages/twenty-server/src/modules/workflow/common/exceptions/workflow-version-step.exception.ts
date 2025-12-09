import { CustomException } from 'src/utils/custom-exception';

export class WorkflowVersionStepException extends CustomException<WorkflowVersionStepExceptionCode> {}

export enum WorkflowVersionStepExceptionCode {
  INVALID_REQUEST = 'INVALID_REQUEST',
  NOT_FOUND = 'NOT_FOUND',
  CODE_STEP_FAILURE = 'CODE_STEP_FAILURE',
  AI_AGENT_STEP_FAILURE = 'AI_AGENT_STEP_FAILURE',
}
