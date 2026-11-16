import { HttpStatus } from '@nestjs/common';

import { msg } from '@lingui/core/macro';

import { CustomException } from 'src/utils/custom-exception';

// A remote endpoint being down is not a Twenty bug: the sub-500 status keeps it out of Sentry.
export class WebhookDeliveryRetryException extends CustomException<'WEBHOOK_DELIVERY_FAILED'> {
  constructor(message: string) {
    super(message, 'WEBHOOK_DELIVERY_FAILED', {
      userFriendlyMessage: msg`Webhook delivery failed and will be retried.`,
      statusCode: HttpStatus.FAILED_DEPENDENCY,
    });
  }
}
