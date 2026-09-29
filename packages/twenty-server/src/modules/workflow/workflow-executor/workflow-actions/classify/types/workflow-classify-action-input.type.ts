import { type WorkflowClassifyQuestion } from 'twenty-shared/workflow';

export type WorkflowClassifyActionInput = {
  state: string;
  questions: WorkflowClassifyQuestion[];
};
