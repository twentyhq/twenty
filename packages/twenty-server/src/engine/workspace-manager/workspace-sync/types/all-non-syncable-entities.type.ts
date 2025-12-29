import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { type AppTokenEntity } from 'src/engine/core-modules/app-token/app-token.entity';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import { type ApprovedAccessDomainEntity } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.entity';
import { type BillingCustomerEntity } from 'src/engine/core-modules/billing/entities/billing-customer.entity';
import { type BillingEntitlementEntity } from 'src/engine/core-modules/billing/entities/billing-entitlement.entity';
import { type BillingMeterEntity } from 'src/engine/core-modules/billing/entities/billing-meter.entity';
import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { type BillingProductEntity } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { type BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { type BillingSubscriptionEntity } from 'src/engine/core-modules/billing/entities/billing-subscription.entity';
import { type EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { type FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';
import { type KeyValuePairEntity } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { type PostgresCredentialsEntity } from 'src/engine/core-modules/postgres-credentials/postgres-credentials.entity';
import { type PublicDomainEntity } from 'src/engine/core-modules/public-domain/public-domain.entity';
import { type WorkspaceSSOIdentityProviderEntity } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { type TwoFactorAuthenticationMethodEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { type UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WebhookEntity } from 'src/engine/core-modules/webhook/webhook.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import { type AgentMessageEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { type AgentTurnEvaluationEntity } from 'src/engine/metadata-modules/ai/ai-agent-monitor/entities/agent-turn-evaluation.entity';
import { type AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { type DataSourceEntity } from 'src/engine/metadata-modules/data-source/data-source.entity';
import { type IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';
import { type FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { type ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { type PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';
import {
  type RemoteServerType,
  type RemoteServerEntity,
} from 'src/engine/metadata-modules/remote-server/remote-server.entity';
import { type RemoteTableEntity } from 'src/engine/metadata-modules/remote-server/remote-table/remote-table.entity';
import { type SearchFieldMetadataEntity } from 'src/engine/metadata-modules/search-field-metadata/search-field-metadata.entity';
import { type ServerlessFunctionLayerEntity } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.entity';
import { type WorkspaceMigrationEntity } from 'src/engine/metadata-modules/workspace-migration/workspace-migration.entity';

export type AllNonSyncableEntity =
  | AgentChatThreadEntity
  | AgentMessagePartEntity
  | AgentMessageEntity
  | AgentTurnEntity
  | AgentTurnEvaluationEntity
  | DataSourceEntity
  | IndexFieldMetadataEntity
  | FieldPermissionEntity
  | ObjectPermissionEntity
  | PermissionFlagEntity
  | RemoteServerEntity<RemoteServerType>
  | RemoteTableEntity
  | SearchFieldMetadataEntity
  | ServerlessFunctionLayerEntity
  | WorkspaceMigrationEntity
  | ApiKeyEntity
  | AppTokenEntity
  | ApplicationEntity
  | ApplicationVariableEntity
  | ApprovedAccessDomainEntity
  | BillingCustomerEntity
  | BillingEntitlementEntity
  | BillingMeterEntity
  | BillingPriceEntity
  | BillingProductEntity
  | BillingSubscriptionItemEntity
  | BillingSubscriptionEntity
  | EmailingDomainEntity
  | FeatureFlagEntity
  | FileEntity
  | KeyValuePairEntity
  | PostgresCredentialsEntity
  | PublicDomainEntity
  | WorkspaceSSOIdentityProviderEntity
  | TwoFactorAuthenticationMethodEntity
  | UserEntity
  | UserWorkspaceEntity
  | WebhookEntity
  | WorkspaceEntity;
