import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

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

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import {
  WidgetConfiguration,
  WidgetConfigurationInterface,
} from 'src/engine/metadata-modules/page-layout-widget/dtos/widget-configuration.interface';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

registerEnumType(WidgetType, { name: 'WidgetType' });

@ObjectType('GridPosition')
export class GridPositionEntity {
  @Field()
  row: number;

  @Field()
  column: number;

  @Field()
  rowSpan: number;

  @Field()
  columnSpan: number;
}

@Index('IDX_PAGE_LAYOUT_WIDGET_WORKSPACE_ID_PAGE_LAYOUT_TAB_ID', [
  'workspaceId',
  'pageLayoutTabId',
])
@Index('IDX_2a33a0e7e44c393ca7bb578dae', [
  'workspaceId',
  'universalIdentifier',
])
@Entity({ name: 'pageLayoutWidget', schema: 'core' })
@ObjectType('PageLayoutWidget')
export class PageLayoutWidgetEntity extends SyncableEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => UUIDScalarType, { nullable: false })
  @Column({ nullable: false, type: 'uuid' })
  pageLayoutTabId: string;

  @Field({ nullable: false })
  @Column({ nullable: false })
  title: string;

  @Field(() => WidgetType, { nullable: false })
  @Column({
    nullable: false,
    type: 'enum',
    enum: WidgetType,
    default: WidgetType.VIEW,
  })
  type: WidgetType;

  @Field(() => UUIDScalarType, { nullable: true })
  @Column({ nullable: true, type: 'uuid' })
  objectMetadataId: string | null;

  @Field(() => GridPositionEntity, { nullable: false })
  @Column({ nullable: false, type: 'jsonb' })
  gridPosition: GridPositionEntity;

  @Field(() => WidgetConfiguration, { nullable: true })
  @Column({ nullable: true, type: 'jsonb' })
  configuration: WidgetConfigurationInterface | null;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @ManyToOne(() => PageLayoutTabEntity, (tab) => tab.widgets, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pageLayoutTabId' })
  pageLayoutTab: Relation<PageLayoutTabEntity>;

  @ManyToOne(() => ObjectMetadataEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'objectMetadataId' })
  objectMetadata: Relation<ObjectMetadataEntity> | null;

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
