import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { assertUnreachable } from 'twenty-shared/utils';

import { CustomException } from 'src/utils/custom-exception';

export enum MessagingCampaignExceptionCode {
  EMAILING_DOMAIN_NOT_FOUND = 'EMAILING_DOMAIN_NOT_FOUND',
  EMAILING_DOMAIN_NOT_VERIFIED = 'EMAILING_DOMAIN_NOT_VERIFIED',
  FROM_ADDRESS_DOMAIN_MISMATCH = 'FROM_ADDRESS_DOMAIN_MISMATCH',
  NO_RECIPIENTS_WITH_EMAIL = 'NO_RECIPIENTS_WITH_EMAIL',
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
    case MessagingCampaignExceptionCode.FROM_ADDRESS_DOMAIN_MISMATCH:
      return msg`From address must match the verified emailing domain.`;
    case MessagingCampaignExceptionCode.NO_RECIPIENTS_WITH_EMAIL:
      return msg`None of the selected recipients have an email address.`;
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
