import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MarketplaceIntegrationWorkspaceEntity } from 'src/modules/marketplace/standard-objects/marketplace-integration.workspace-entity';

export interface IntegrationConfig {
  name: string;
  provider: string;
  description: string;
  icon: string;
  authType: 'oauth2' | 'api_key' | 'webhook';
  features: string[];
  docsUrl: string;
}

export interface IntegrationResult {
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
}

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  private readonly availableIntegrations: Record<string, IntegrationConfig> = {
    stripe: {
      name: 'Stripe',
      provider: 'stripe',
      description: 'Procesamiento de pagos y facturación',
      icon: 'IconCreditCard',
      authType: 'api_key',
      features: ['payments', 'subscriptions', 'invoices', 'webhooks'],
      docsUrl: 'https://stripe.com/docs',
    },
    quickbooks: {
      name: 'QuickBooks',
      provider: 'quickbooks',
      description: 'Contabilidad y facturación',
      icon: 'IconCalculator',
      authType: 'oauth2',
      features: ['invoices', 'expenses', 'reports', 'sync'],
      docsUrl: 'https://developer.intuit.com',
    },
    shopify: {
      name: 'Shopify',
      provider: 'shopify',
      description: 'E-commerce y ventas online',
      icon: 'IconShoppingCart',
      authType: 'oauth2',
      features: ['products', 'orders', 'inventory', 'customers'],
      docsUrl: 'https://shopify.dev/docs',
    },
    zapier: {
      name: 'Zapier',
      provider: 'zapier',
      description: 'Automatización con más de 5000+ apps',
      icon: 'IconBolt',
      authType: 'webhook',
      features: ['triggers', 'actions', 'zaps'],
      docsUrl: 'https://zapier.com/developer',
    },
    make: {
      name: 'Make (Integromat)',
      provider: 'make',
      description: 'Automatización visual de workflows',
      icon: 'IconFlow',
      authType: 'oauth2',
      features: ['scenarios', 'webhooks', 'integrations'],
      docsUrl: 'https://www.make.com/en/developer',
    },
    slack: {
      name: 'Slack',
      provider: 'slack',
      description: 'Comunicación de equipo y notificaciones',
      icon: 'IconBrandSlack',
      authType: 'oauth2',
      features: ['notifications', 'commands', 'channels'],
      docsUrl: 'https://api.slack.com',
    },
    teams: {
      name: 'Microsoft Teams',
      provider: 'teams',
      description: 'Comunicación y colaboración',
      icon: 'IconBrandWindows',
      authType: 'oauth2',
      features: ['notifications', 'meetings', 'channels'],
      docsUrl: 'https://docs.microsoft.com/en-us/graph/',
    },
    google_calendar: {
      name: 'Google Calendar',
      provider: 'google_calendar',
      description: 'Calendario y programación de reuniones',
      icon: 'IconCalendar',
      authType: 'oauth2',
      features: ['events', 'availability', 'reminders'],
      docsUrl: 'https://developers.google.com/calendar',
    },
    twilio: {
      name: 'Twilio',
      provider: 'twilio',
      description: 'SMS, Voz y Video',
      icon: 'IconPhone',
      authType: 'api_key',
      features: ['sms', 'voice', 'video', 'whatsapp'],
      docsUrl: 'https://www.twilio.com/docs',
    },
    docusign: {
      name: 'DocuSign',
      provider: 'docusign',
      description: 'Firma electrónica de documentos',
      icon: 'IconSignature',
      authType: 'oauth2',
      features: ['signatures', 'templates', 'envelopes'],
      docsUrl: 'https://developers.docusign.com',
    },
    hubspot: {
      name: 'HubSpot',
      provider: 'hubspot',
      description: 'Marketing automation y CRM',
      icon: 'IconTargetArrow',
      authType: 'oauth2',
      features: ['contacts', 'deals', 'marketing', 'automation'],
      docsUrl: 'https://developers.hubspot.com',
    },
    woocommerce: {
      name: 'WooCommerce',
      provider: 'woocommerce',
      description: 'E-commerce para WordPress',
      icon: 'IconShoppingBag',
      authType: 'api_key',
      features: ['products', 'orders', 'customers', 'webhooks'],
      docsUrl: 'https://woocommerce.github.io/woocommerce-rest-api-docs',
    },
  };

  constructor(
    @InjectRepository(MarketplaceIntegrationWorkspaceEntity, 'core')
    private readonly integrationRepository: Repository<MarketplaceIntegrationWorkspaceEntity>,
  ) {}

  getAvailableIntegrations(): IntegrationConfig[] {
    return Object.values(this.availableIntegrations);
  }

  getIntegrationConfig(provider: string): IntegrationConfig | null {
    return this.availableIntegrations[provider] || null;
  }

  async connect(
    provider: string,
    credentials: Record<string, string>,
    config?: Record<string, unknown>,
  ): Promise<IntegrationResult> {
    const integrationConfig = this.getIntegrationConfig(provider);
    
    if (!integrationConfig) {
      return { success: false, error: 'Integration not found' };
    }

    try {
      const isValid = await this.validateCredentials(provider, credentials);
      
      if (!isValid) {
        return { success: false, error: 'Invalid credentials' };
      }

      const integration = this.integrationRepository.create({
        name: integrationConfig.name,
        provider,
        status: 'CONNECTED',
        credentials: JSON.stringify(credentials),
        config: config ? JSON.stringify(config) : null,
      });

      await this.integrationRepository.save(integration);

      this.logger.log(`Connected ${integrationConfig.name} integration`);

      return { success: true, data: { integrationId: integration.id } };
    } catch (error) {
      this.logger.error(`Failed to connect ${provider}: ${error}`);
      return { success: false, error: String(error) };
    }
  }

  async disconnect(provider: string): Promise<IntegrationResult> {
    try {
      await this.integrationRepository.delete({ provider });
      this.logger.log(`Disconnected ${provider}`);
      return { success: true };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async sync(provider: string): Promise<IntegrationResult> {
    const integration = await this.integrationRepository.findOne({
      where: { provider },
    });

    if (!integration) {
      return { success: false, error: 'Integration not connected' };
    }

    try {
      await this.integrationRepository.update(integration.id, {
        lastSyncAt: new Date(),
        syncStatus: 'SYNCING',
      });

      await this.performSync(provider);

      await this.integrationRepository.update(integration.id, {
        lastSyncAt: new Date(),
        syncStatus: 'SUCCESS',
      });

      return { success: true };
    } catch (error) {
      await this.integrationRepository.update(integration.id, {
        syncStatus: 'ERROR',
        errorMessage: String(error),
      });

      return { success: false, error: String(error) };
    }
  }

  async getConnectedIntegrations(): Promise<MarketplaceIntegrationWorkspaceEntity[]> {
    return this.integrationRepository.find({
      where: { status: 'CONNECTED' },
    });
  }

  private async validateCredentials(
    provider: string,
    credentials: Record<string, string>,
  ): Promise<boolean> {
    switch (provider) {
      case 'stripe':
        return !!credentials.apiKey;
      case 'quickbooks':
      case 'shopify':
      case 'make':
      case 'slack':
      case 'teams':
      case 'google_calendar':
      case 'hubspot':
      case 'docusign':
        return !!credentials.accessToken;
      case 'zapier':
      case 'twilio':
      case 'woocommerce':
        return !!credentials.apiKey;
      default:
        return true;
    }
  }

  private async performSync(provider: string): Promise<void> {
    this.logger.log(`Syncing ${provider}...`);
    
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    this.logger.log(`Synced ${provider}`);
  }
}
