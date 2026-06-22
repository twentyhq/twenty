import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';

import {
  WebhookSubscriptionDriverException,
  WebhookSubscriptionDriverExceptionCode,
} from 'src/modules/connected-account/webhook-subscription-manager/drivers/exceptions/webhook-subscription-driver.exception';
import { GoogleWebhookSubscriptionDriver } from 'src/modules/connected-account/webhook-subscription-manager/drivers/google/google-webhook-subscription.driver';
import { MicrosoftWebhookSubscriptionDriver } from 'src/modules/connected-account/webhook-subscription-manager/drivers/microsoft/microsoft-webhook-subscription.driver';
import { type WebhookSubscriptionDriver } from 'src/modules/connected-account/webhook-subscription-manager/types/webhook-subscription-driver.type';

@Injectable()
export class WebhookSubscriptionDriverFactory {
  private readonly driversByProvider: Partial<
    Record<ConnectedAccountProvider, WebhookSubscriptionDriver>
  >;

  constructor(
    private readonly googleWebhookSubscriptionDriver: GoogleWebhookSubscriptionDriver,
    private readonly microsoftWebhookSubscriptionDriver: MicrosoftWebhookSubscriptionDriver,
  ) {
    this.driversByProvider = {
      [ConnectedAccountProvider.GOOGLE]: this.googleWebhookSubscriptionDriver,
      [ConnectedAccountProvider.MICROSOFT]:
        this.microsoftWebhookSubscriptionDriver,
    };
  }

  isProviderSupported(provider: ConnectedAccountProvider): boolean {
    return provider in this.driversByProvider;
  }

  getDriver(provider: ConnectedAccountProvider): WebhookSubscriptionDriver {
    const driver = this.driversByProvider[provider];

    if (!driver) {
      throw new WebhookSubscriptionDriverException(
        `Webhook subscriptions are not supported for provider ${provider}`,
        WebhookSubscriptionDriverExceptionCode.UNSUPPORTED_PROVIDER,
      );
    }

    return driver;
  }
}
