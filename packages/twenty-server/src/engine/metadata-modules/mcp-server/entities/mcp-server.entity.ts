import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_MCP_SERVER_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-53/add-mcp-server-upgrade-command-name.constant';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({ name: 'mcpServer', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_MCP_SERVER_UPGRADE_COMMAND_NAME,
})
@Index('IDX_MCP_SERVER_WORKSPACE_ID_NAME_UNIQUE', ['workspaceId', 'name'], {
  unique: true,
})
@Index('IDX_MCP_SERVER_CONNECTION_PROVIDER_ID', ['connectionProviderId'])
export class McpServerEntity
  extends SyncableEntity
  implements Required<McpServerEntity>
{
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, type: 'varchar' })
  name: string;

  @Column({ nullable: false, type: 'varchar' })
  label: string;

  @Column({ nullable: false, type: 'varchar' })
  url: string;

  @ManyToOne(() => ConnectionProviderEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'connectionProviderId' })
  connectionProvider: Relation<ConnectionProviderEntity> | null;

  @Column({ nullable: true, type: 'uuid' })
  connectionProviderId: string | null;

  @Column({ nullable: false, type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
