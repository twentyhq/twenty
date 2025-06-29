import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

@Entity('roleTargets')
@Unique('IDX_ROLE_TARGETS_UNIQUE', ['userWorkspaceId', 'roleId', 'agentId'])
@Index('IDX_ROLE_TARGETS_WORKSPACE_ID', ['userWorkspaceId', 'workspaceId'])
@Index('IDX_ROLE_TARGETS_AGENT_ID', ['agentId'])
@Check(
  'CHK_role_targets_either_agent_or_user',
  '("agentId" IS NOT NULL AND "userWorkspaceId" IS NULL) OR ("agentId" IS NULL AND "userWorkspaceId" IS NOT NULL)',
)
export class RoleTargetsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @Column({ nullable: false, type: 'uuid' })
  roleId: string;

  @ManyToOne(() => RoleEntity, (role) => role.roleTargets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'roleId' })
  role: Relation<RoleEntity>;

  @Column({ nullable: true, type: 'uuid' })
  userWorkspaceId: string;

  @Column({ nullable: true, type: 'uuid' })
  agentId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
