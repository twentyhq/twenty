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
import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view-filter-group/enums/view-filter-group-logical-operator';
import { ViewFilterEntity } from 'src/engine/metadata-modules/view-filter/entities/view-filter.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

@Entity({ name: 'viewFilterGroup', schema: 'core' })
@Index('IDX_VIEW_FILTER_GROUP_WORKSPACE_ID_VIEW_ID', ['workspaceId', 'viewId'])
@Index('IDX_VIEW_FILTER_GROUP_VIEW_ID', ['viewId'], {
  where: '"deletedAt" IS NULL',
})
export class ViewFilterGroupEntity extends SyncableEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'uuid' })
  parentViewFilterGroupId?: string | null;

  @Column({
    type: 'enum',
    enum: Object.values(ViewFilterGroupLogicalOperator),
    nullable: false,
    default: ViewFilterGroupLogicalOperator.AND,
  })
  logicalOperator: ViewFilterGroupLogicalOperator;

  @Column({ nullable: true, type: 'double precision' })
  positionInViewFilterGroup: number | null;

  @Column({ nullable: false, type: 'uuid' })
  viewId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date | null;

  @ManyToOne(() => ViewEntity, (view) => view.viewFilterGroups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'viewId' })
  view: Relation<ViewEntity>;

  @OneToMany(() => ViewFilterEntity, (viewFilter) => viewFilter.viewFilterGroup)
  viewFilters: Relation<ViewFilterEntity[]>;

  @ManyToOne(
    () => ViewFilterGroupEntity,
    (viewFilterGroup) => viewFilterGroup.childViewFilterGroups,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'parentViewFilterGroupId' })
  parentViewFilterGroup: Relation<ViewFilterGroupEntity>;

  @OneToMany(
    () => ViewFilterGroupEntity,
    (viewFilterGroup) => viewFilterGroup.parentViewFilterGroup,
  )
  childViewFilterGroups: Relation<ViewFilterGroupEntity[]>;
}
