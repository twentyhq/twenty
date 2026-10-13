import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { type FrontComponentWidgetPageLayoutType } from 'twenty-shared/application';
import { type SerializedRelation } from 'twenty-shared/types';

import { ADD_WIDGET_AVAILABILITY_TO_FRONT_COMPONENT_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-47/add-widget-availability-to-front-component-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';
import { type JsonbProperty } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/jsonb-property.type';

export type FrontComponentWidgetAvailability = {
  pageLayoutType: FrontComponentWidgetPageLayoutType;
  objectMetadataId?: SerializedRelation;
};

@Entity('frontComponent')
export class FrontComponentEntity
  extends SyncableEntity
  implements Required<FrontComponentEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true, type: 'varchar' })
  description: string | null;

  @Column({ nullable: false })
  sourceComponentPath: string;

  @Column({ nullable: false })
  builtComponentPath: string;

  @Column({ nullable: false })
  componentName: string;

  @Column({ nullable: false })
  builtComponentChecksum: string;

  @Column({ default: false })
  isHeadless: boolean;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_WIDGET_AVAILABILITY_TO_FRONT_COMPONENT_UPGRADE_COMMAND_NAME,
  })
  @Column({
    type: 'jsonb',
    nullable: false,
    default: [],
  })
  widgetAvailability: JsonbProperty<FrontComponentWidgetAvailability[]>;

  @Column({ default: false })
  usesSdkClient: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
