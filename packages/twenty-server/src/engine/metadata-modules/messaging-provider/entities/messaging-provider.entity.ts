import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { type MessagingProviderConversationStyle } from 'twenty-shared/application';

import { ADD_MARK_THREAD_AS_READ_TO_MESSAGING_PROVIDER_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-58/add-mark-thread-as-read-to-messaging-provider-upgrade-command-name.constant';
import { ADD_MESSAGING_PROVIDER_CONVERSATION_STYLE_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-58/add-messaging-provider-conversation-style-upgrade-command-name.constant';
import { ADD_START_CONVERSATION_LOGIC_FUNCTION_TO_MESSAGING_PROVIDER_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-58/add-start-conversation-logic-function-to-messaging-provider-upgrade-command-name.constant';
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

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_START_CONVERSATION_LOGIC_FUNCTION_TO_MESSAGING_PROVIDER_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: true, type: 'uuid' })
  startConversationLogicFunctionUniversalIdentifier: string | null;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_MARK_THREAD_AS_READ_TO_MESSAGING_PROVIDER_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: true, type: 'uuid' })
  markThreadAsReadLogicFunctionUniversalIdentifier: string | null;

  @WasIntroducedInUpgrade({
    upgradeCommandName:
      ADD_MESSAGING_PROVIDER_CONVERSATION_STYLE_UPGRADE_COMMAND_NAME,
  })
  @Column({ nullable: true, type: 'varchar' })
  conversationStyle: MessagingProviderConversationStyle | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
