import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

export const resolveWorkflowRunApplicationOrThrow = <
  TApplication extends Pick<
    FlatApplication,
    'name' | 'deletedAt' | 'defaultRoleId'
  >,
>({
  applicationId,
  applicationsById,
}: {
  applicationId: string;
  applicationsById: Partial<Record<string, TApplication>>;
}): TApplication => {
  const application = applicationsById[applicationId];

  if (!isDefined(application) || isDefined(application.deletedAt)) {
    throw new WorkflowStepExecutorException(
      'The application this run acts through is no longer installed',
      WorkflowStepExecutorExceptionCode.FORBIDDEN,
    );
  }

  if (!isDefined(application.defaultRoleId)) {
    throw new WorkflowStepExecutorException(
      `Application "${application.name}" has no role, so its workflow steps cannot run`,
      WorkflowStepExecutorExceptionCode.FORBIDDEN,
    );
  }

  return application;
};
