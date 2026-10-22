import {
  Check,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { type McpServerTool } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-tool.type';
import { SyncableEntity } from 'src/engine/workspace-manager/types/syncable-entity.interface';

@Index('IDX_MCP_SERVER_WORKSPACE_ID', ['workspaceId'])
@Index('IDX_MCP_SERVER_WORKSPACE_ID_NAME_UNIQUE', ['workspaceId', 'name'], {
  unique: true,
  where: '"deletedAt" IS NULL',
})
@Check(
  'CHK_mcpServer_authorizationHeaderValue_encrypted',
  `"authorizationHeaderValue" IS NULL OR "authorizationHeaderValue" LIKE 'enc:v2:%'`,
)
@Entity({ name: 'mcpServer', schema: 'core' })
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

  @Column({ nullable: true, type: 'text' })
  authorizationHeaderValue: EncryptedString | null;

  @Column({ nullable: false, type: 'boolean', default: true })
  isEnabled: boolean;

  @Column({ nullable: false, type: 'jsonb', default: [] })
  tools: McpServerTool[];

  @Column({ nullable: true, type: 'timestamptz' })
  toolsSyncedAt: Date | null;

  @Column({ nullable: true, type: 'text' })
  toolsSyncError: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamptz' })
  deletedAt: Date | null;
}
