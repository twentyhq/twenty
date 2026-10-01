import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import {
  DEFAULT_SETTINGS_MENU_ITEM_POSITION,
  DEFAULT_SETTINGS_MENU_ITEM_SCOPE,
  SETTINGS_MENU_ITEM_SCOPES,
  type SettingsMenuItemScope,
} from 'twenty-shared/application';

import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({ name: 'settingsMenuItem', schema: 'core' })
@Index('IDX_SETTINGS_MENU_ITEM_FRONT_COMPONENT_ID', ['frontComponentId'])
@Index('IDX_SETTINGS_MENU_ITEM_WORKSPACE_ID_APPLICATION_ID', [
  'workspaceId',
  'applicationId',
])
export class SettingsMenuItemEntity
  extends SyncableEntity
  implements Required<SettingsMenuItemEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  frontComponentId: string;

  @ManyToOne(() => FrontComponentEntity, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'frontComponentId' })
  frontComponent: Relation<FrontComponentEntity>;

  @Column({ nullable: false, type: 'varchar' })
  title: string;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  // Float so an item can be slotted between two others without renumbering the
  // ones already installed.
  @Column({
    nullable: false,
    type: 'float',
    default: DEFAULT_SETTINGS_MENU_ITEM_POSITION,
  })
  position: number;

  @Column({
    nullable: false,
    type: 'enum',
    enum: SETTINGS_MENU_ITEM_SCOPES,
    default: DEFAULT_SETTINGS_MENU_ITEM_SCOPE,
  })
  scope: SettingsMenuItemScope;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
