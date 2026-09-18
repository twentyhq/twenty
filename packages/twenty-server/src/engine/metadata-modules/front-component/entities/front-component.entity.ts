import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { type FrontComponentSettingsTabManifest } from 'twenty-shared/application';

import { ADD_FRONT_COMPONENT_SETTINGS_TAB_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-42/add-front-component-settings-tab-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { type JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity('frontComponent')
export class FrontComponentEntity
  extends SyncableEntity
  implements Required<FrontComponentEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true, type: 'varchar' })
  description: string | null;

  @Column({ nullable: false })
  sourceComponentPath: string;

  @Column({ nullable: false })
  builtComponentPath: string;

  @Column({ nullable: false })
  componentName: string;

  @Column({ nullable: false })
  builtComponentChecksum: string;

  @Column({ default: false })
  isHeadless: boolean;

  @Column({ default: false })
  usesSdkClient: boolean;

  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_FRONT_COMPONENT_SETTINGS_TAB_UPGRADE_COMMAND_NAME,
  })
  @Column({ type: 'jsonb', nullable: true })
  settingsTab: JsonbProperty<FrontComponentSettingsTabManifest | null>;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
