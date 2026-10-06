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

import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { ADD_IS_SYSTEM_SIDE_EFFECT_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-15/is-system-side-effect-upgrade-command-name.constant';
import { ADD_PAGE_LAYOUT_IS_FIRST_TAB_PINNED_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-38/add-page-layout-is-first-tab-pinned-upgrade-command-name.constant';
import { ADD_DASHBOARD_FILTERS_TO_PAGE_LAYOUT_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-46/add-dashboard-filters-to-page-layout-upgrade-command-name.constant';
import { NavigationMenuItemEntity } from 'src/engine/metadata-modules/navigation-menu-item/entities/navigation-menu-item.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { type DashboardFilterSlot, PageLayoutType } from 'twenty-shared/types';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { type JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

@Entity({ name: 'pageLayout', schema: 'core' })
@Index('IDX_PAGE_LAYOUT_APPLICATION_ID', ['applicationId'])
@ObjectType('PageLayout')
@Index(
  'IDX_PAGE_LAYOUT_OBJECT_METADATA_ID_WORKSPACE_ID',
  ['objectMetadataId', 'workspaceId'],
  { where: '"objectMetadataId" IS NOT NULL' },
)
@Index(
  'IDX_PAGE_LAYOUT_DEFAULT_TAB_TO_FOCUS_ID',
  ['defaultTabToFocusOnMobileAndSidePanelId'],
  { where: '"defaultTabToFocusOnMobileAndSidePanelId" IS NOT NULL' },
)
export class PageLayoutEntity
  extends SyncableEntity
  implements Required<PageLayoutEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({
    type: 'enum',
    enum: Object.values(PageLayoutType),
    nullable: false,
    default: PageLayoutType.RECORD_PAGE,
  })
  type: PageLayoutType;

  @Column({ nullable: true, type: 'uuid' })
  objectMetadataId: string | null;

  @ManyToOne(() => ObjectMetadataEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'objectMetadataId' })
  objectMetadata: Relation<ObjectMetadataEntity> | null;

  @OneToMany(() => PageLayoutTabEntity, (tab) => tab.pageLayout, {
    cascade: true,
  })
  tabs: Relation<PageLayoutTabEntity[]>;

  @OneToMany(
    () => NavigationMenuItemEntity,
    (navigationMenuItem) => navigationMenuItem.pageLayout,
  )
  navigationMenuItems: Relation<NavigationMenuItemEntity[]>;

  @Column({ nullable: true, type: 'uuid' })
  defaultTabToFocusOnMobileAndSidePanelId: string | null;

  @ManyToOne(() => PageLayoutTabEntity, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'defaultTabToFocusOnMobileAndSidePanelId' })
  defaultTabToFocusOnMobileAndSidePanel: Relation<PageLayoutTabEntity> | null;

  @WasIntroducedInUpgrade({
    upgradeCommandName: ADD_IS_SYSTEM_SIDE_EFFECT_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: false, default: false, type: 'boolean' })
  isSystemSideEffect: boolean;

  // Record pages render their first tab as a pinned side column; unpinning it
  // hands that tab back to the tab list without picking another one.
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_PAGE_LAYOUT_IS_FIRST_TAB_PINNED_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: false, default: true, type: 'boolean' })
  isFirstTabPinned: boolean;

  // null means the dashboard still relies on the built-in filters the front derives from its charts.
  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_DASHBOARD_FILTERS_TO_PAGE_LAYOUT_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: true, type: 'jsonb', default: null })
  dashboardFilters: JsonbProperty<DashboardFilterSlot[]> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
