import { isNonEmptyArray } from 'twenty-shared/utils';

import { WORKSPACE_SETUP_SNAPSHOT_EMAIL_WINDOW_DAYS } from 'src/engine/metadata-modules/ai/ai-chat/constants/workspace-setup-snapshot-email-window-days.constant';
import {
  type WorkspaceSetupEmailCompany,
  type WorkspaceSetupEmailContact,
  type WorkspaceSetupMailbox,
  type WorkspaceSetupSnapshot,
} from 'src/engine/metadata-modules/ai/ai-chat/types/workspace-setup-snapshot.type';
import { sanitizePromptContextLine } from 'src/utils/sanitize-prompt-context-line.util';

const SNAPSHOT_VALUE_MAX_LENGTH = 80;

// Names come from email headers, so brackets are stripped to keep them from breaking the chip syntax.
const sanitizeSnapshotValue = (value: string | null): string =>
  (
    sanitizePromptContextLine({
      value,
      maxLength: SNAPSHOT_VALUE_MAX_LENGTH,
    }) ?? ''
  ).replace(/[[\]]/g, '') || 'Unnamed';

const formatDate = (date: Date): string =>
  new Date(date).toISOString().slice(0, 10);

const formatMailbox = ({
  handle,
  syncStatus,
  syncStage,
}: WorkspaceSetupMailbox) =>
  `${sanitizeSnapshotValue(handle)} (sync status ${syncStatus}, stage ${syncStage})`;

const formatEmailCompany = ({
  companyId,
  name,
  threadCount,
  lastEmailAt,
  opportunityCount,
}: WorkspaceSetupEmailCompany) =>
  `- [[record:company:${companyId}:${sanitizeSnapshotValue(name)}]]: ${threadCount} threads, last email ${formatDate(lastEmailAt)}, ${opportunityCount === 0 ? 'no opportunity' : `${opportunityCount} opportunities`}`;

const formatEmailContact = ({
  personId,
  name,
  companyName,
  threadCount,
  lastEmailAt,
}: WorkspaceSetupEmailContact) =>
  `- [[record:person:${personId}:${sanitizeSnapshotValue(name)}]]${companyName === null ? '' : ` at ${sanitizeSnapshotValue(companyName)}`}: ${threadCount} threads, last email ${formatDate(lastEmailAt)}`;

export const buildWorkspaceSnapshotMessageText = (
  snapshot: WorkspaceSetupSnapshot,
): string => {
  const lines = [
    `Workspace data, read on ${formatDate(snapshot.readAt)}. The record references below are real and can be copied as chips.`,
    isNonEmptyArray(snapshot.mailboxes)
      ? `Mailbox connected: ${snapshot.mailboxes.map(formatMailbox).join('; ')}.`
      : 'No mailbox is connected.',
    `Emails imported: ${snapshot.importedMessageCount}.`,
    `Records they own, sample data excluded: ${snapshot.ownPersonCount} people, ${snapshot.ownCompanyCount} companies, ${snapshot.ownOpportunityCount} opportunities.`,
  ];

  if (isNonEmptyArray(snapshot.sampleCompanyNames)) {
    lines.push(
      `Sample data added when the workspace was created, not theirs: ${snapshot.sampleCompanyNames.map(sanitizeSnapshotValue).join(', ')}, with their people and opportunities.`,
    );
  }

  if (snapshot.importedMessageCount === 0) {
    return lines.join('\n');
  }

  if (isNonEmptyArray(snapshot.topEmailCompanies)) {
    lines.push(
      `Companies they email the most over the last ${WORKSPACE_SETUP_SNAPSHOT_EMAIL_WINDOW_DAYS} days:`,
      ...snapshot.topEmailCompanies.map(formatEmailCompany),
    );
  } else {
    lines.push(
      `No company stands out in their emails over the last ${WORKSPACE_SETUP_SNAPSHOT_EMAIL_WINDOW_DAYS} days.`,
    );
  }

  if (isNonEmptyArray(snapshot.topEmailContacts)) {
    lines.push(
      `People they email the most over the last ${WORKSPACE_SETUP_SNAPSHOT_EMAIL_WINDOW_DAYS} days:`,
      ...snapshot.topEmailContacts.map(formatEmailContact),
    );
  }

  return lines.join('\n');
};
