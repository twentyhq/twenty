import { EmailOperation } from 'twenty-shared/types';
import {
  canConnectedAccountPerformEmailOperation,
  isDefined,
} from 'twenty-shared/utils';
import {
  WorkflowActionType,
  type WorkflowValidationIssue,
} from 'twenty-shared/workflow';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { getMissingCreateEventScopes } from 'src/modules/calendar/calendar-event-creation-manager/utils/get-missing-create-event-scopes.util';
import { getWorkflowStepConnectedAccountId } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-workflow-step-connected-account-id.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

type ValidatableConnectedAccount = Pick<
  ConnectedAccountEntity,
  | 'id'
  | 'handle'
  | 'provider'
  | 'scopes'
  | 'archivedAt'
  | 'connectionParameters'
>;

const getUnusableAccountReason = ({
  step,
  connectedAccount,
}: {
  step: WorkflowAction;
  connectedAccount: ValidatableConnectedAccount;
}): string | undefined => {
  switch (step.type) {
    case WorkflowActionType.CREATE_CALENDAR_EVENT:
      return getMissingCreateEventScopes(connectedAccount).length > 0
        ? 'is missing permission to create calendar events. Reconnect it to grant calendar access'
        : undefined;
    case WorkflowActionType.SEND_EMAIL:
      return canConnectedAccountPerformEmailOperation({
        connectedAccount,
        operation: EmailOperation.SEND,
      })
        ? undefined
        : 'cannot send email';
    case WorkflowActionType.DRAFT_EMAIL:
      return canConnectedAccountPerformEmailOperation({
        connectedAccount,
        operation: EmailOperation.DRAFT,
      })
        ? undefined
        : 'cannot draft email';
    default:
      return undefined;
  }
};

export const getWorkflowConnectedAccountIssues = ({
  steps,
  connectedAccounts,
}: {
  steps: WorkflowAction[];
  connectedAccounts: ValidatableConnectedAccount[];
}): WorkflowValidationIssue[] =>
  steps.flatMap((step) => {
    const connectedAccountId = getWorkflowStepConnectedAccountId(step);

    if (!isDefined(connectedAccountId)) {
      return [];
    }

    const stepName = step.name ?? step.id;

    const connectedAccount = connectedAccounts.find(
      (account) => account.id === connectedAccountId,
    );

    if (
      !isDefined(connectedAccount) ||
      isDefined(connectedAccount.archivedAt)
    ) {
      return [
        {
          severity: 'error',
          code: 'CONNECTED_ACCOUNT_UNUSABLE',
          message: `Step "${stepName}" uses a connected account that was removed. Pick another account.`,
          stepId: step.id,
        },
      ];
    }

    const unusableAccountReason = getUnusableAccountReason({
      step,
      connectedAccount,
    });

    if (!isDefined(unusableAccountReason)) {
      return [];
    }

    return [
      {
        severity: 'error',
        code: 'CONNECTED_ACCOUNT_UNUSABLE',
        message: `Step "${stepName}" uses ${connectedAccount.handle}, which ${unusableAccountReason}.`,
        stepId: step.id,
      },
    ];
  });
