import { IDField } from '@ptc-org/nestjs-query-graphql';
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
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ViewField } from 'src/engine/metadata-modules/view/view-field.entity';
import { ViewFilterGroup } from 'src/engine/metadata-modules/view/view-filter-group.entity';
import { ViewFilter } from 'src/engine/metadata-modules/view/view-filter.entity';
import { ViewGroup } from 'src/engine/metadata-modules/view/view-group.entity';
import { ViewSort } from 'src/engine/metadata-modules/view/view-sort.entity';

export enum ViewOpenRecordInType {
  SIDE_PANEL = 'SIDE_PANEL',
  RECORD_PAGE = 'RECORD_PAGE',
}

@Entity({ name: 'view', schema: 'core' })
@Index('IDX_VIEW_WORKSPACE_ID', ['workspaceId'])
@Index('IDX_VIEW_OBJECT_METADATA_ID_WORKSPACE_ID', [
  'objectMetadataId',
  'workspaceId',
])
export class View {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'text' })
  name: string;

  @Column({ nullable: false, type: 'uuid' })
  objectMetadataId: string;

  @Column({ nullable: false, default: 'table' })
  type: string;

  @Column({ nullable: true, type: 'text' })
  key: string;

  @Column({ nullable: false, type: 'text' })
  icon: string;

  @Column({ nullable: false, type: 'uuid' })
  kanbanFieldMetadataId: string;

  @Column({ nullable: false, type: 'int', default: 0 })
  position: number;

  @Column({ nullable: false, default: false, type: 'boolean' })
  isCompact: boolean;

  @Column({
    type: 'enum',
    enum: ViewOpenRecordInType,
    nullable: false,
    default: ViewOpenRecordInType.SIDE_PANEL,
  })
  openRecordIn: ViewOpenRecordInType;

  @Column({
    type: 'enum',
    enum: AggregateOperations,
    nullable: true,
  })
  kanbanAggregateOperation?: AggregateOperations | null;

  @Column({ nullable: true, type: 'uuid' })
  kanbanAggregateOperationFieldMetadataId?: string | null;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date | null;

  // Relations
  @ManyToOne(() => Workspace, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;

  @OneToMany(() => ViewField, (viewField) => viewField.view)
  viewFields: Relation<ViewField[]>;

  @OneToMany(() => ViewFilter, (viewFilter) => viewFilter.view)
  viewFilters: Relation<ViewFilter[]>;

  @OneToMany(() => ViewSort, (viewSort) => viewSort.view)
  viewSorts: Relation<ViewSort[]>;

  @OneToMany(() => ViewGroup, (viewGroup) => viewGroup.view)
  viewGroups: Relation<ViewGroup[]>;

  @OneToMany(() => ViewFilterGroup, (viewFilterGroup) => viewFilterGroup.view)
  viewFilterGroups: Relation<ViewFilterGroup[]>;
}
