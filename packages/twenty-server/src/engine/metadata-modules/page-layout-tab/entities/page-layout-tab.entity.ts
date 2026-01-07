import { ObjectType } from '@nestjs/graphql';

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

import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/types/syncable-entity.interface';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';

@Entity({ name: 'pageLayoutTab', schema: 'core' })
@ObjectType('PageLayoutTab')
@Index(
  'IDX_PAGE_LAYOUT_TAB_WORKSPACE_ID_PAGE_LAYOUT_ID',
  ['workspaceId', 'pageLayoutId'],
  { where: '"deletedAt" IS NULL' },
)
export class PageLayoutTabEntity
  extends SyncableEntity
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

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
