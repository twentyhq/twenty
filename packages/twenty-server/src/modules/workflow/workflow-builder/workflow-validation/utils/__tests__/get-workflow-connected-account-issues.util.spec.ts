import { ConnectedAccountProvider } from 'twenty-shared/types';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { getWorkflowConnectedAccountIssues } from 'src/modules/workflow/workflow-builder/workflow-validation/utils/get-workflow-connected-account-issues.util';
import {
  type WorkflowCreateCalendarEventAction,
  type WorkflowSendEmailAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const CONNECTED_ACCOUNT_ID = '20202020-9ac0-4390-9a1a-ab4d2c4e1bb7';

const ERROR_HANDLING_OPTIONS = {
  retryOnFailure: { value: 0 },
  continueOnFailure: { value: false },
};

const buildCreateCalendarEventStep = (
  connectedAccountId: string,
): WorkflowCreateCalendarEventAction => ({
  id: 'calendar-step',
  name: 'Create Calendar Event',
  type: WorkflowActionType.CREATE_CALENDAR_EVENT,
  valid: true,
  settings: {
    input: {
      connectedAccountId,
      title: 'Review',
      startsAt: '2026-10-01T09:00:00.000Z',
      endsAt: '2026-10-01T10:00:00.000Z',
      isFullDay: false,
      attendees: '',
      sendInvitations: false,
      addConferencing: false,
    },
    outputSchema: {},
    errorHandlingOptions: ERROR_HANDLING_OPTIONS,
  },
});

const buildSendEmailStep = (
  connectedAccountId: string,
): WorkflowSendEmailAction => ({
  id: 'email-step',
  name: 'Send Email',
  type: WorkflowActionType.SEND_EMAIL,
  valid: true,
  settings: {
    input: {
      connectedAccountId,
      recipients: { to: 'tim@apple.dev', cc: '', bcc: '' },
      files: [],
    },
    outputSchema: {},
    errorHandlingOptions: ERROR_HANDLING_OPTIONS,
  },
});

const buildConnectedAccount = ({
  provider = ConnectedAccountProvider.GOOGLE,
  scopes = ['https://www.googleapis.com/auth/calendar.events'],
  archivedAt = null,
}: {
  provider?: ConnectedAccountProvider;
  scopes?: string[];
  archivedAt?: Date | null;
} = {}) => ({
  id: CONNECTED_ACCOUNT_ID,
  handle: 'billy@flux.tv',
  provider,
  scopes,
  archivedAt,
  connectionParameters: null,
});

describe('getWorkflowConnectedAccountIssues', () => {
  it('leaves empty and variable account ids to be resolved at run time', () => {
    const issues = getWorkflowConnectedAccountIssues({
      steps: [
        buildCreateCalendarEventStep(''),
        buildSendEmailStep('{{trigger.workspaceMemberId}}'),
      ],
      connectedAccounts: [],
    });

    expect(issues).toEqual([]);
  });

  it('accepts an account that can do the step', () => {
    const issues = getWorkflowConnectedAccountIssues({
      steps: [buildCreateCalendarEventStep(CONNECTED_ACCOUNT_ID)],
      connectedAccounts: [buildConnectedAccount()],
    });

    expect(issues).toEqual([]);
  });

  it('blocks a step whose account was removed', () => {
    const issues = getWorkflowConnectedAccountIssues({
      steps: [buildCreateCalendarEventStep(CONNECTED_ACCOUNT_ID)],
      connectedAccounts: [],
    });

    expect(issues).toEqual([
      expect.objectContaining({
        code: 'CONNECTED_ACCOUNT_UNUSABLE',
        stepId: 'calendar-step',
      }),
    ]);
  });

  it('blocks a step whose account was archived', () => {
    const issues = getWorkflowConnectedAccountIssues({
      steps: [buildSendEmailStep(CONNECTED_ACCOUNT_ID)],
      connectedAccounts: [
        buildConnectedAccount({ archivedAt: new Date('2026-09-01') }),
      ],
    });

    expect(issues).toEqual([
      expect.objectContaining({
        code: 'CONNECTED_ACCOUNT_UNUSABLE',
        stepId: 'email-step',
      }),
    ]);
  });

  it('blocks a calendar step whose account cannot create events', () => {
    const issues = getWorkflowConnectedAccountIssues({
      steps: [buildCreateCalendarEventStep(CONNECTED_ACCOUNT_ID)],
      connectedAccounts: [
        buildConnectedAccount({ scopes: ['email', 'profile'] }),
      ],
    });

    expect(issues).toEqual([
      expect.objectContaining({
        code: 'CONNECTED_ACCOUNT_UNUSABLE',
        message: expect.stringContaining('billy@flux.tv'),
      }),
    ]);
  });

  it('blocks an email step whose IMAP account has no SMTP settings', () => {
    const issues = getWorkflowConnectedAccountIssues({
      steps: [buildSendEmailStep(CONNECTED_ACCOUNT_ID)],
      connectedAccounts: [
        buildConnectedAccount({
          provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
        }),
      ],
    });

    expect(issues).toEqual([
      expect.objectContaining({ code: 'CONNECTED_ACCOUNT_UNUSABLE' }),
    ]);
  });
});
