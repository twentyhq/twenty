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
  DEFAULT_SETTING_PAGE_POSITION,
  DEFAULT_SETTING_PAGE_SCOPE,
  SETTING_PAGE_SCOPES,
  type SettingPageScope,
} from 'twenty-shared/application';

import { FrontComponentEntity } from 'src/engine/metadata-modules/front-component/entities/front-component.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({ name: 'settingPage', schema: 'core' })
@Index('IDX_SETTING_PAGE_FRONT_COMPONENT_ID', ['frontComponentId'])
@Index('IDX_SETTING_PAGE_WORKSPACE_ID_APPLICATION_ID', [
  'workspaceId',
  'applicationId',
])
export class SettingPageEntity
  extends SyncableEntity
  implements Required<SettingPageEntity>
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

  // Float so a page can be slotted between two others without renumbering the
  // ones already installed.
  @Column({
    nullable: false,
    type: 'float',
    default: DEFAULT_SETTING_PAGE_POSITION,
  })
  position: number;

  @Column({
    nullable: false,
    type: 'enum',
    enum: SETTING_PAGE_SCOPES,
    default: DEFAULT_SETTING_PAGE_SCOPE,
  })
  scope: SettingPageScope;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
