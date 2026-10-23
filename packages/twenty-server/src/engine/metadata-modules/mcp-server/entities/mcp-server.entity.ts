import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_MCP_SERVER_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-52/add-mcp-server-upgrade-command-name.constant';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Entity({ name: 'mcpServer', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_MCP_SERVER_UPGRADE_COMMAND_NAME,
})
@Index('IDX_MCP_SERVER_WORKSPACE_ID_NAME_UNIQUE', ['workspaceId', 'name'], {
  unique: true,
})
@Check(
  'CHK_mcpServer_authorizationHeaderValue_encrypted',
  `"authorizationHeaderValue" IS NULL OR "authorizationHeaderValue" LIKE 'enc:v2:%'`,
)
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

  @Column({ nullable: true, type: 'varchar' })
  authorizationHeaderValue: EncryptedString | null;

  @Column({ nullable: false, type: 'boolean', default: true })
  isEnabled: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
