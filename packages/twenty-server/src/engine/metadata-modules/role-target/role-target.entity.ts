import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_WEBHOOK_ID_TO_ROLE_TARGET_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-54/add-webhook-id-to-role-target-upgrade-command-name.constant';
import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WebhookEntity } from 'src/engine/metadata-modules/webhook/entities/webhook.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity('roleTarget')
@Unique('IDX_ROLE_TARGET_UNIQUE_USER_WORKSPACE', [
  'workspaceId',
  'userWorkspaceId',
])
@Unique('IDX_ROLE_TARGET_UNIQUE_AGENT', ['workspaceId', 'agentId'])
@Unique('IDX_ROLE_TARGET_UNIQUE_API_KEY', ['workspaceId', 'apiKeyId'])
@Unique('IDX_ROLE_TARGET_UNIQUE_WEBHOOK', ['workspaceId', 'webhookId'])
@Index('IDX_ROLE_TARGET_WORKSPACE_ID', ['userWorkspaceId', 'workspaceId'])
@Index('IDX_ROLE_TARGET_AGENT_ID', ['agentId'])
@Index('IDX_ROLE_TARGET_API_KEY_ID', ['apiKeyId'])
@Index('IDX_ROLE_TARGET_WEBHOOK_ID', ['webhookId'])
@Index('IDX_ROLE_TARGET_ROLE_ID', ['roleId'])
@Check(
  'CHK_role_target_single_entity',
  '(("agentId" IS NOT NULL)::int + ("userWorkspaceId" IS NOT NULL)::int + ("apiKeyId" IS NOT NULL)::int + ("webhookId" IS NOT NULL)::int) = 1',
)
export class RoleTargetEntity extends SyncableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  roleId: string;

  @ManyToOne(() => RoleEntity, (role) => role.roleTargets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role: Relation<RoleEntity>;

  @Column({ nullable: true, type: 'uuid' })
  userWorkspaceId: string | null;

  @Column({ nullable: true, type: 'uuid' })
  agentId: string | null;

  @ManyToOne(() => AgentEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'agentId' })
  agent: Relation<AgentEntity> | null;

  @Column({ nullable: true, type: 'uuid' })
  apiKeyId: string | null;

  @ManyToOne(() => ApiKeyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'apiKeyId' })
  apiKey: Relation<ApiKeyEntity>;

  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_WEBHOOK_ID_TO_ROLE_TARGET_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: true, type: 'uuid' })
  webhookId: string | null;

  @ManyToOne(() => WebhookEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'webhookId' })
  webhook: Relation<WebhookEntity> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
