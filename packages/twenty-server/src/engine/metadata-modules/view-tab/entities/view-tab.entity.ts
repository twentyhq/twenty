import { ViewTabType } from 'twenty-shared/types';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { ADD_VIEW_TAB_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-59/add-view-tab-upgrade-command-name.constant';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({ name: 'viewTab', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_VIEW_TAB_UPGRADE_COMMAND_NAME,
})
@Index('IDX_VIEW_TAB_APPLICATION_ID', ['applicationId'])
@Index('IDX_VIEW_TAB_WORKSPACE_ID_VIEW_ID', ['workspaceId', 'viewId'])
@Index('IDX_VIEW_TAB_VIEW_ID', ['viewId'])
export class ViewTabEntity
  extends SyncableEntity
  implements Required<ViewTabEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    nullable: false,
    type: 'enum',
    enum: Object.values(ViewTabType),
  })
  type: ViewTabType;

  @Column({ nullable: true, type: 'text' })
  fieldValue: string | null;

  @Column({ nullable: true, type: 'text' })
  name: string | null;

  @Column({ nullable: false, type: 'double precision', default: 0 })
  position: number;

  @Column({ nullable: false, default: true })
  isVisible: boolean;

  @Column({ nullable: false, type: 'uuid' })
  viewId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;

  @ManyToOne(() => ViewEntity, (view) => view.viewTabs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'viewId' })
  view: Relation<ViewEntity>;

  @OneToMany(() => ViewFilterEntity, (viewFilter) => viewFilter.viewTab)
  viewFilters: Relation<ViewFilterEntity[]>;
}
