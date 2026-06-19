import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import { WebhookSubscriptionDriverExceptionCode } from 'src/modules/connected-account/webhook-subscription-manager/drivers/exceptions/webhook-subscription-driver-exception-code.enum';
import { WebhookSubscriptionDriverException } from 'src/modules/connected-account/webhook-subscription-manager/drivers/exceptions/webhook-subscription-driver.exception';
import { GoogleWebhookSubscriptionDriver } from 'src/modules/connected-account/webhook-subscription-manager/drivers/google/google-webhook-subscription.driver';
import { MicrosoftWebhookSubscriptionDriver } from 'src/modules/connected-account/webhook-subscription-manager/drivers/microsoft/microsoft-webhook-subscription.driver';
import { type WebhookSubscriptionDriver } from 'src/modules/connected-account/webhook-subscription-manager/types/webhook-subscription-driver.type';

export const WEBHOOK_SUBSCRIPTION_SUPPORTED_PROVIDERS = [
  ConnectedAccountProvider.GOOGLE,
  ConnectedAccountProvider.MICROSOFT,
];

@Injectable()
export class WebhookSubscriptionDriverFactory {
  constructor(
    private readonly googleWebhookSubscriptionDriver: GoogleWebhookSubscriptionDriver,
    private readonly microsoftWebhookSubscriptionDriver: MicrosoftWebhookSubscriptionDriver,
  ) {}

  isProviderSupported(provider: ConnectedAccountProvider): boolean {
    return WEBHOOK_SUBSCRIPTION_SUPPORTED_PROVIDERS.includes(provider);
  }

  getDriver(provider: ConnectedAccountProvider): WebhookSubscriptionDriver {
    switch (provider) {
      case ConnectedAccountProvider.GOOGLE:
        return this.googleWebhookSubscriptionDriver;
      case ConnectedAccountProvider.MICROSOFT:
        return this.microsoftWebhookSubscriptionDriver;
      default:
        throw new WebhookSubscriptionDriverException(
          `Webhook subscriptions are not supported for provider ${provider}`,
          WebhookSubscriptionDriverExceptionCode.UNSUPPORTED_PROVIDER,
        );
    }
  }
}
