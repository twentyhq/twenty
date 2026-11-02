import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_IS_SYSTEM_TO_SKILL_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-40/add-is-system-to-skill-upgrade-command-name.constant';
import { AGENT_AND_SKILL_OVERRIDABLE_ENTITY_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-53/agent-and-skill-overridable-entity-upgrade-command-name.constant';
import { DROP_IS_CUSTOM_FROM_AGENT_SKILL_VIEW_INDEX_AND_AGENT_CHAT_CHANNEL_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-54/drop-is-custom-from-agent-skill-view-index-and-agent-chat-channel-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { WasRemovedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-removed-in-upgrade.decorator';
import { OverridableEntity } from 'src/engine/workspace-manager/types/overridable-entity.type';

export type SkillOverrides = {
  label?: string;
  icon?: string | null;
  description?: string | null;
  content?: string;
  isActive?: boolean;
};

@Entity('skill')
@Index('IDX_SKILL_APPLICATION_ID', ['applicationId'])
@Index('IDX_SKILL_ID_IS_ACTIVE', ['id', 'isActive'])
@Index('IDX_SKILL_NAME_WORKSPACE_ID_UNIQUE', ['name', 'workspaceId'], {
  unique: true,
  where: '"isActive" = true',
})
export class SkillEntity
  extends OverridableEntity<SkillOverrides>
  implements Required<SkillEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  label: string;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  @Column({ nullable: true, type: 'text' })
  description: string | null;

  @Column({ nullable: false, type: 'text' })
  content: string;

  @WasRemovedInUpgrade({
    upgradeCommandName:
      DROP_IS_CUSTOM_FROM_AGENT_SKILL_VIEW_INDEX_AND_AGENT_CHAT_CHANNEL_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'boolean', default: false })
  isCustom: WasRemovedInUpgrade<boolean>;

  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_IS_SYSTEM_TO_SKILL_UPGRADE_COMMAND_NAME,
  })
  @Column({ default: false })
  isSystem: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

WasIntroducedInUpgrade({
  upgradeCommandName: AGENT_AND_SKILL_OVERRIDABLE_ENTITY_UPGRADE_COMMAND_NAME,
})(SkillEntity.prototype, 'overrides');
