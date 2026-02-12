import { type ApplicationVariableEntity } from 'src/engine/core-modules/applicationVariable/application-variable.entity';
import { type BillingMeterEntity } from 'src/engine/core-modules/billing/entities/billing-meter.entity';
import { type BillingPriceEntity } from 'src/engine/core-modules/billing/entities/billing-price.entity';
import { type BillingProductEntity } from 'src/engine/core-modules/billing/entities/billing-product.entity';
import { type BillingSubscriptionItemEntity } from 'src/engine/core-modules/billing/entities/billing-subscription-item.entity';
import { type TwoFactorAuthenticationMethodEntity } from 'src/engine/core-modules/two-factor-authentication/entities/two-factor-authentication-method.entity';
import { type UserEntity } from 'src/engine/core-modules/user/user.entity';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type AgentMessagePartEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message-part.entity';
import { type AgentMessageEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-message.entity';
import { type AgentTurnEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-turn.entity';
import { type AgentTurnEvaluationEntity } from 'src/engine/metadata-modules/ai/ai-agent-monitor/entities/agent-turn-evaluation.entity';
import { type AgentChatThreadEntity } from 'src/engine/metadata-modules/ai/ai-chat/entities/agent-chat-thread.entity';
import { type IndexFieldMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-field-metadata.entity';

/**
 * Union of all entities that don't have a direct `workspaceId` field
 * (i.e., they don't extend `WorkspaceRelatedEntity`).
 *
 * This type is used alongside `WorkspaceRelatedEntity` to enable TypeScript
 * to properly extract entity relation properties for dynamic typing purposes.
 *
 * @see ExtractEntityRelatedEntityProperties
 * @see ExtractEntityManyToOneEntityRelationProperties
 * @see ExtractEntityOneToManyEntityRelationProperties
 */
export type AllNonWorkspaceRelatedEntity =
  | AgentChatThreadEntity
  | AgentMessagePartEntity
  | AgentMessageEntity
  | AgentTurnEntity
  | AgentTurnEvaluationEntity
  | IndexFieldMetadataEntity
  | ApplicationVariableEntity
  | BillingMeterEntity
  | BillingPriceEntity
  | BillingProductEntity
  | BillingSubscriptionItemEntity
  | TwoFactorAuthenticationMethodEntity
  | UserEntity
  | WorkspaceEntity;
