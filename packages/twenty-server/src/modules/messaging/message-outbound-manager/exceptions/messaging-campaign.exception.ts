import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum MessagingCampaignExceptionCode {
  EMAILING_DOMAIN_NOT_FOUND = 'EMAILING_DOMAIN_NOT_FOUND',
  EMAILING_DOMAIN_NOT_VERIFIED = 'EMAILING_DOMAIN_NOT_VERIFIED',
  EMAILING_DOMAIN_NOT_ACTIVE = 'EMAILING_DOMAIN_NOT_ACTIVE',
  FROM_ADDRESS_DOMAIN_MISMATCH = 'FROM_ADDRESS_DOMAIN_MISMATCH',
  NO_RECIPIENTS_WITH_EMAIL = 'NO_RECIPIENTS_WITH_EMAIL',
  EMPTY_RECIPIENT_FILTER = 'EMPTY_RECIPIENT_FILTER',
  MATERIALIZATION_FAILED = 'MATERIALIZATION_FAILED',
  CAMPAIGN_NOT_FOUND = 'CAMPAIGN_NOT_FOUND',
  MESSAGE_NOT_FOUND = 'MESSAGE_NOT_FOUND',
}

const getMessagingCampaignExceptionUserFriendlyMessage = (
  code: MessagingCampaignExceptionCode,
): MessageDescriptor => {
  switch (code) {
    case MessagingCampaignExceptionCode.EMAILING_DOMAIN_NOT_FOUND:
      return msg`Emailing domain not found.`;
    case MessagingCampaignExceptionCode.EMAILING_DOMAIN_NOT_VERIFIED:
      return msg`Emailing domain has not been verified yet.`;
    case MessagingCampaignExceptionCode.EMAILING_DOMAIN_NOT_ACTIVE:
      return msg`Sending is currently suspended for this emailing domain.`;
    case MessagingCampaignExceptionCode.FROM_ADDRESS_DOMAIN_MISMATCH:
      return msg`From address must match the verified emailing domain.`;
    case MessagingCampaignExceptionCode.NO_RECIPIENTS_WITH_EMAIL:
      return msg`None of the selected recipients have an email address.`;
    case MessagingCampaignExceptionCode.EMPTY_RECIPIENT_FILTER:
      return msg`Recipient selection cannot be empty.`;
    case MessagingCampaignExceptionCode.MATERIALIZATION_FAILED:
      return msg`Failed to materialize campaign recipients.`;
    case MessagingCampaignExceptionCode.CAMPAIGN_NOT_FOUND:
      return msg`Campaign not found.`;
    case MessagingCampaignExceptionCode.MESSAGE_NOT_FOUND:
      return msg`Message not found.`;
    default:
      return assertUnreachable(code);
  }
};

export class MessagingCampaignException extends CustomException<MessagingCampaignExceptionCode> {
  constructor(
    message: string,
    code: MessagingCampaignExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: MessageDescriptor } = {},
  ) {
    super(message, code, {
      userFriendlyMessage:
        userFriendlyMessage ??
        getMessagingCampaignExceptionUserFriendlyMessage(code),
    });
  }
}
