import { Field, Float, ObjectType } from '@nestjs/graphql';

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

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

@Index('IDX_PAGE_LAYOUT_TAB_WORKSPACE_ID_PAGE_LAYOUT_ID', [
  'workspaceId',
  'pageLayoutId',
])
@Index('IDX_3763c4e8f942ff1e24040a13a9', [
  'workspaceId',
  'universalIdentifier',
])
@Entity({ name: 'pageLayoutTab', schema: 'core' })
@ObjectType('PageLayoutTab')
export class PageLayoutTabEntity extends SyncableEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: false })
  @Column({ nullable: false })
  title: string;

  @Field(() => Float, { nullable: false, defaultValue: 0 })
  @Column({ nullable: false, type: 'double precision', default: 0 })
  position: number;

  @Field(() => UUIDScalarType, { nullable: false })
  @Column({ nullable: false, type: 'uuid' })
  pageLayoutId: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @Field(() => [PageLayoutWidgetEntity], { nullable: true })
  @OneToMany(() => PageLayoutWidgetEntity, (widget) => widget.pageLayoutTab, {
    cascade: true,
  })
  widgets: Relation<PageLayoutWidgetEntity[]> | null;

  @ManyToOne(() => WorkspaceEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @ManyToOne(() => PageLayoutEntity, (pageLayout) => pageLayout.tabs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pageLayoutId' })
  pageLayout: Relation<PageLayoutEntity>;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt?: Date | null;
}
