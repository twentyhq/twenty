import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_AGENT_CHAT_CHANNEL_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-51/add-agent-chat-channel-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { FieldPermissionEntity } from 'src/engine/metadata-modules/object-permission/field-permission/field-permission.entity';
import { AgentChatChannelRoleEntity } from 'src/engine/metadata-modules/agent-chat-channel/entities/agent-chat-channel-role.entity';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';
import { RolePermissionFlagEntity } from 'src/engine/metadata-modules/role-permission-flag/role-permission-flag.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RowLevelPermissionPredicateGroupEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate-group.entity';
import { RowLevelPermissionPredicateEntity } from 'src/engine/metadata-modules/row-level-permission-predicate/entities/row-level-permission-predicate.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity('role')
@Unique('IDX_ROLE_LABEL_WORKSPACE_ID_UNIQUE', ['label', 'workspaceId'])
export class RoleEntity extends SyncableEntity implements Required<RoleEntity> {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  label: string;

  @Column({ nullable: false, default: false })
  canUpdateAllSettings: boolean;

  @Column({ nullable: false, default: false })
  canAccessAllTools: boolean;

  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_AGENT_CHAT_CHANNEL_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: false, default: false })
  canAccessAllAgentChatChannels: boolean;

  @Column({ nullable: false, default: false })
  canReadAllObjectRecords: boolean;

  @Column({ nullable: false, default: false })
  canUpdateAllObjectRecords: boolean;

  @Column({ nullable: false, default: false })
  canSoftDeleteAllObjectRecords: boolean;

  @Column({ nullable: false, default: false })
  canDestroyAllObjectRecords: boolean;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: false, default: true })
  isEditable: boolean;

  @Column({ nullable: false, default: true })
  canBeAssignedToUsers: boolean;

  @Column({ nullable: false, default: true })
  canBeAssignedToAgents: boolean;

  @Column({ nullable: false, default: true })
  canBeAssignedToApiKeys: boolean;

  @OneToMany(
    () => RoleTargetEntity,
    (roleTargets: RoleTargetEntity) => roleTargets.role,
  )
  roleTargets: Relation<RoleTargetEntity[]>;

  @OneToMany(
    () => AgentChatChannelRoleEntity,
    (agentChatChannelRole: AgentChatChannelRoleEntity) =>
      agentChatChannelRole.role,
  )
  agentChatChannelRoles: Relation<AgentChatChannelRoleEntity[]>;

  @OneToMany(
    () => ObjectPermissionEntity,
    (objectPermission: ObjectPermissionEntity) => objectPermission.role,
  )
  objectPermissions: Relation<ObjectPermissionEntity[]>;

  @OneToMany(
    () => RolePermissionFlagEntity,
    (rolePermissionFlag: RolePermissionFlagEntity) => rolePermissionFlag.role,
  )
  rolePermissionFlags: Relation<RolePermissionFlagEntity[]>;

  @OneToMany(
    () => FieldPermissionEntity,
    (fieldPermission: FieldPermissionEntity) => fieldPermission.role,
  )
  fieldPermissions: Relation<FieldPermissionEntity[]>;

  @OneToMany(
    () => RowLevelPermissionPredicateEntity,
    (rowLevelPermissionPredicate: RowLevelPermissionPredicateEntity) =>
      rowLevelPermissionPredicate.role,
  )
  rowLevelPermissionPredicates: Relation<RowLevelPermissionPredicateEntity[]>;

  @OneToMany(
    () => RowLevelPermissionPredicateGroupEntity,
    (
      rowLevelPermissionPredicateGroup: RowLevelPermissionPredicateGroupEntity,
    ) => rowLevelPermissionPredicateGroup.role,
  )
  rowLevelPermissionPredicateGroups: Relation<
    RowLevelPermissionPredicateGroupEntity[]
  >;
}
