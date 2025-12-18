import { ObjectType } from '@nestjs/graphql';

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

import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { AllWidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/types/all-widget-configuration-type.type';
import { GridPosition } from 'src/engine/metadata-modules/page-layout-widget/types/grid-position.type';

@Entity({ name: 'pageLayoutWidget', schema: 'core' })
@ObjectType('PageLayoutWidget')
@Index(
  'IDX_PAGE_LAYOUT_WIDGET_WORKSPACE_ID_PAGE_LAYOUT_TAB_ID',
  ['workspaceId', 'pageLayoutTabId'],
  { where: '"deletedAt" IS NULL' },
)
export class PageLayoutWidgetEntity
  extends SyncableEntity
  implements Required<PageLayoutWidgetEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  pageLayoutTabId: string;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @ManyToOne(() => PageLayoutTabEntity, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'pageLayoutTabId' })
  pageLayoutTab: Relation<PageLayoutTabEntity>;

  @Column({ nullable: false })
  title: string;

  @Column({
    type: 'enum',
    enum: Object.values(WidgetType),
    nullable: false,
    default: WidgetType.VIEW,
  })
  type: WidgetType;

  @Column({ nullable: true, type: 'uuid' })
  objectMetadataId: string | null;

  @ManyToOne(() => ObjectMetadataEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'objectMetadataId' })
  objectMetadata: Relation<ObjectMetadataEntity> | null;

  @Column({ type: 'jsonb', nullable: false })
  gridPosition: GridPosition;

  @Column({ type: 'jsonb', nullable: false })
  configuration: AllWidgetConfigurationType;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
