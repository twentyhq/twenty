import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import {
  DEFAULT_FRONT_COMPONENT_AVAILABLE_ON,
  type FrontComponentSurface,
} from 'twenty-shared/application';

import { ADD_AVAILABLE_ON_TO_FRONT_COMPONENT_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-47/add-available-on-to-front-component-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
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

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_AVAILABLE_ON_TO_FRONT_COMPONENT_UPGRADE_COMMAND_NAME,
  })
  @Column({
    type: 'text',
    array: true,
    nullable: false,
    default: DEFAULT_FRONT_COMPONENT_AVAILABLE_ON,
  })
  availableOn: FrontComponentSurface[];

  @Column({ default: false })
  usesSdkClient: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
