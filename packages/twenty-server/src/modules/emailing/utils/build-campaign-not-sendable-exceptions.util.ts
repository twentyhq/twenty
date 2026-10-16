import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type z } from 'zod';

import {
  EmailingDomainException,
  EmailingDomainExceptionCode,
} from 'src/engine/core-modules/emailing-domain/exceptions/emailing-domain.exception';

const getNotSendableFieldUserFriendlyMessage = (
  field: PropertyKey | undefined,
): MessageDescriptor | undefined => {
  switch (field) {
    case 'status':
      return msg`Only a draft or scheduled campaign can be sent.`;
    case 'listId':
      return msg`Pick a list in the To field first.`;
    case 'fromAddress':
      return msg`Add a sender to this campaign first.`;
    case 'subject':
      return msg`Add a subject to this campaign first.`;
    case 'bodyTemplate':
      return msg`Write the email content first.`;
    default:
      return undefined;
  }
};

export const buildCampaignNotSendableExceptions = ({
  campaignId,
  issues,
}: {
  campaignId: string;
  issues: z.ZodError['issues'];
}): EmailingDomainException[] => {
  const firstIssuePerField = issues.filter(
    (issue, issueIndex) =>
      issues.findIndex((otherIssue) => otherIssue.path[0] === issue.path[0]) ===
      issueIndex,
  );

  return firstIssuePerField.map(
    (issue) =>
      new EmailingDomainException(
        `Campaign ${campaignId} is not sendable: ${issue.path.join('.')} ${issue.message}`,
        EmailingDomainExceptionCode.MESSAGE_CAMPAIGN_NOT_SENDABLE,
        {
          userFriendlyMessage: getNotSendableFieldUserFriendlyMessage(
            issue.path[0],
          ),
        },
      ),
  );
};
