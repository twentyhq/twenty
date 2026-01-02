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

import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/types/syncable-entity.interface';

@Entity('roleTarget')
@Unique('IDX_ROLE_TARGET_UNIQUE_USER_WORKSPACE', [
  'workspaceId',
  'userWorkspaceId',
])
@Unique('IDX_ROLE_TARGET_UNIQUE_AGENT', ['workspaceId', 'agentId'])
@Unique('IDX_ROLE_TARGET_UNIQUE_API_KEY', ['workspaceId', 'apiKeyId'])
@Index('IDX_ROLE_TARGET_WORKSPACE_ID', ['userWorkspaceId', 'workspaceId'])
@Index('IDX_ROLE_TARGET_AGENT_ID', ['agentId'])
@Index('IDX_ROLE_TARGET_API_KEY_ID', ['apiKeyId'])
@Check(
  'CHK_role_target_single_entity',
  '("agentId" IS NOT NULL AND "userWorkspaceId" IS NULL AND "apiKeyId" IS NULL) OR ("agentId" IS NULL AND "userWorkspaceId" IS NOT NULL AND "apiKeyId" IS NULL) OR ("agentId" IS NULL AND "userWorkspaceId" IS NULL AND "apiKeyId" IS NOT NULL)',
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

  @Column({ nullable: true, type: 'uuid' })
  apiKeyId: string | null;

  @ManyToOne(() => ApiKeyEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'apiKeyId' })
  apiKey: Relation<ApiKeyEntity>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
