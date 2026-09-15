import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_IS_SYSTEM_TO_SKILL_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-40/add-is-system-to-skill-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity('skill')
@Index('IDX_SKILL_ID_IS_ACTIVE', ['id', 'isActive'])
@Index('IDX_SKILL_NAME_WORKSPACE_ID_UNIQUE', ['name', 'workspaceId'], {
  unique: true,
  where: '"isActive" = true',
})
export class SkillEntity
  extends SyncableEntity
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

  @Column({ default: false })
  isCustom: boolean;

  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_IS_SYSTEM_TO_SKILL_UPGRADE_COMMAND_NAME,
  })
  @Column({ default: false })
  isSystem: boolean;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
