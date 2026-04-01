import { registerEnumType } from '@nestjs/graphql';

export enum MarketplaceIntegrationStatus {
  AVAILABLE = 'AVAILABLE',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
  DISABLED = 'DISABLED',
}

registerEnumType(MarketplaceIntegrationStatus, {
  name: 'MarketplaceIntegrationStatus',
  description: 'Integration status',
});
