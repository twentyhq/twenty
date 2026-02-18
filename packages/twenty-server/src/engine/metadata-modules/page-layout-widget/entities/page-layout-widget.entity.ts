import { ObjectType } from '@nestjs/graphql';

import {
  PageLayoutWidgetConditionalDisplay,
  PageLayoutWidgetPosition,
  type GridPosition,
} from 'twenty-shared/types';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  type Relation,
} from 'typeorm';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { PageLayoutWidgetConfigurationTypeSettings } from 'src/engine/metadata-modules/page-layout-widget/types/page-layout-widget-configuration.type';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { type JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

@Entity({ name: 'pageLayoutWidget', schema: 'core' })
@ObjectType('PageLayoutWidget')
@Index(
  'IDX_PAGE_LAYOUT_WIDGET_WORKSPACE_ID_PAGE_LAYOUT_TAB_ID',
  ['workspaceId', 'pageLayoutTabId'],
  { where: '"deletedAt" IS NULL' },
)
@Index('IDX_PAGE_LAYOUT_WIDGET_OBJECT_METADATA_ID', ['objectMetadataId'])
export class PageLayoutWidgetEntity<
    TWidgetConfigurationType extends
      WidgetConfigurationType = WidgetConfigurationType,
  >
  extends SyncableEntity
  implements Required<PageLayoutWidgetEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'uuid' })
  pageLayoutTabId: string;

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

  @Column({ type: 'jsonb', nullable: true })
  conditionalDisplay: JsonbProperty<PageLayoutWidgetConditionalDisplay | null>;

  @Column({ type: 'jsonb', nullable: false })
  gridPosition: JsonbProperty<GridPosition>;

  @Column({ type: 'jsonb', nullable: true })
  position: JsonbProperty<PageLayoutWidgetPosition | null>;

  @Column({ type: 'jsonb', nullable: false })
  configuration: JsonbProperty<
    PageLayoutWidgetConfigurationTypeSettings<TWidgetConfigurationType>
  >;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
