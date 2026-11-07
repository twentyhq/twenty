import {
  Check,
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

import { type OAuthDiscoveryState } from '@modelcontextprotocol/sdk/client/auth.js';

import { ADD_MCP_SERVER_OAUTH_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-57/add-mcp-server-oauth-upgrade-command-name.constant';
import { type EncryptedString } from 'src/engine/core-modules/secret-encryption/branded-strings/encrypted-string.type';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { McpServerEntity } from 'src/engine/metadata-modules/mcp-server/entities/mcp-server.entity';
import { type McpServerOAuthRegistrationMethod } from 'src/engine/metadata-modules/mcp-server/types/mcp-server-oauth-registration-method.type';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity.type';

// The OAuth client Twenty uses with an MCP server's authorization server, found through discovery.
@Entity({ name: 'mcpServerOAuthClient', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_MCP_SERVER_OAUTH_UPGRADE_COMMAND_NAME,
})
@Index('IDX_MCP_SERVER_OAUTH_CLIENT_MCP_SERVER_ID_UNIQUE', ['mcpServerId'], {
  unique: true,
})
@Check(
  'CHK_mcpServerOAuthClient_clientSecret_encrypted',
  `"clientSecret" IS NULL OR "clientSecret" LIKE 'enc:v2:%'`,
)
export class McpServerOAuthClientEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: false })
  mcpServerId: string;

  @ManyToOne(() => McpServerEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'mcpServerId' })
  mcpServer: Relation<McpServerEntity>;

  @Column({ type: 'varchar', nullable: false })
  registrationMethod: McpServerOAuthRegistrationMethod;

  @Column({ type: 'varchar', nullable: false })
  clientId: string;

  @Column({ type: 'varchar', nullable: true })
  clientSecret: EncryptedString | null;

  @Column({ type: 'timestamptz', nullable: true })
  clientSecretExpiresAt: Date | null;

  @Column({ type: 'varchar', nullable: true })
  tokenEndpointAuthMethod: string | null;

  // A client registered for another callback URL cannot complete our redirects.
  @Column({ type: 'varchar', nullable: false })
  redirectUri: string;

  @Column({ type: 'jsonb', nullable: false })
  discoveryState: OAuthDiscoveryState;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
