import { ObjectType } from '@nestjs/graphql';

import { PageLayoutTabLayoutMode } from 'twenty-shared/types';
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
import { ADD_IS_SYSTEM_SIDE_EFFECT_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-15/is-system-side-effect-upgrade-command-name.constant';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { OverridableEntity } from 'src/engine/workspace-manager/types/overridable-entity';

export type PageLayoutTabOverrides = {
  title?: string;
  position?: number;
  icon?: string | null;
};

@Entity({ name: 'pageLayoutTab', schema: 'core' })
@ObjectType('PageLayoutTab')
@Index(
  'IDX_PAGE_LAYOUT_TAB_WORKSPACE_ID_PAGE_LAYOUT_ID',
  ['workspaceId', 'pageLayoutId'],
  { where: '"deletedAt" IS NULL' },
)
export class PageLayoutTabEntity
  extends OverridableEntity<PageLayoutTabOverrides>
  implements Required<PageLayoutTabEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false, type: 'float', default: 0 })
  position: number;

  @Column({ nullable: false, type: 'uuid' })
  pageLayoutId: string;

  @ManyToOne(() => PageLayoutEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pageLayoutId' })
  pageLayout: Relation<PageLayoutEntity>;

  @OneToMany(() => PageLayoutWidgetEntity, (widget) => widget.pageLayoutTab, {
    cascade: true,
  })
  widgets: Relation<PageLayoutWidgetEntity[]>;

  @Column({ nullable: true, type: 'varchar' })
  icon: string | null;

  @Column({
    type: 'enum',
    enum: Object.values(PageLayoutTabLayoutMode),
    nullable: false,
    default: PageLayoutTabLayoutMode.GRID,
  })
  layoutMode: PageLayoutTabLayoutMode;

  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_IS_SYSTEM_SIDE_EFFECT_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: false, default: false, type: 'boolean' })
  isSystemSideEffect: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
