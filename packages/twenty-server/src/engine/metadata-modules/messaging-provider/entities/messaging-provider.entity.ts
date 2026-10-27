import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_MESSAGING_PROVIDER_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-52/add-messaging-provider-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({ name: 'messagingProvider', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_MESSAGING_PROVIDER_UPGRADE_COMMAND_NAME,
})
@Unique('IDX_MESSAGING_PROVIDER_NAME_APPLICATION_UNIQUE', [
  'name',
  'applicationId',
])
@Index('IDX_MESSAGING_PROVIDER_APPLICATION_ID', ['applicationId'])
export class MessagingProviderEntity
  extends SyncableEntity
  implements Required<MessagingProviderEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'varchar' })
  name: string;

  @Column({ nullable: false, type: 'varchar' })
  displayName: string;

  @Column({ nullable: false, type: 'uuid' })
  connectionProviderUniversalIdentifier: string;

  @Column({ nullable: true, type: 'uuid' })
  sendMessageLogicFunctionUniversalIdentifier: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
