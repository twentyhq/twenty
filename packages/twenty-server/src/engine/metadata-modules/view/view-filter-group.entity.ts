import { registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view/enums/view-filter-group-logical-operator';
import { View } from 'src/engine/metadata-modules/view/view.entity';

registerEnumType(ViewFilterGroupLogicalOperator, {
  name: 'ViewFilterGroupLogicalOperator',
});

@Entity({ name: 'viewFilterGroup', schema: 'core' })
@Index('IDX_VIEW_FILTER_GROUP_WORKSPACE_ID_VIEW_ID', ['workspaceId', 'viewId'])
export class ViewFilterGroup {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true, type: 'uuid' })
  parentViewFilterGroupId?: string | null;

  @Column({
    type: 'enum',
    enum: ViewFilterGroupLogicalOperator,
    nullable: false,
    default: ViewFilterGroupLogicalOperator.NOT,
  })
  logicalOperator: ViewFilterGroupLogicalOperator;

  @Column({ nullable: true, type: 'int' })
  positionInViewFilterGroup?: number | null;

  @Column({ nullable: false, type: 'uuid' })
  viewId: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date | null;

  @ManyToOne(() => Workspace, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;

  @ManyToOne(() => View, (view) => view.viewFilterGroups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'viewId' })
  view: Relation<View>;
}
