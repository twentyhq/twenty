import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { ImapService } from '../services/imap.service';
import {
  ImapCredentialsInput,
  ImapConnectionTestResult,
  ImapFolder,
  ImapSyncResult,
} from '../dtos/imap-credentials.dto';
import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { AuthUser } from 'src/decorators/auth/auth-user.decorator';
import { User } from 'src/engine/core-modules/user/user.entity';

@Resolver()
@UseGuards(JwtAuthGuard)
export class ImapResolver {
  constructor(private readonly imapService: ImapService) {}

  @Mutation(() => ImapConnectionTestResult)
  async testImapConnection(
    @Args('input') input: ImapCredentialsInput,
  ): Promise<ImapConnectionTestResult> {
    try {
      const result = await this.imapService.testConnection({
        host: input.imapHost,
        port: input.imapPort,
        secure: input.useTls,
        auth: {
          user: input.email,
          pass: input.password,
          accessToken: input.accessToken,
        },
      });

      return {
        success: result,
        message: result ? 'Connection successful' : 'Connection failed',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }

  @Mutation(() => String)
  async connectImapAccount(
    @AuthUser() user: User,
    @Args('input') input: ImapCredentialsInput,
  ): Promise<string> {
    return this.imapService.authenticateAndSave(user.id, {
      email: input.email,
      password: input.password,
      imapHost: input.imapHost,
      imapPort: input.imapPort,
      useTls: input.useTls,
      accessToken: input.accessToken,
    });
  }

  @Query(() => [ImapFolder])
  async getImapFolders(
    @Args('accountId') accountId: string,
  ): Promise<ImapFolder[]> {
    const folders = await this.imapService.getFolders(accountId);
    return folders.map((f) => ({
      path: f.path,
      name: f.name,
      delimiter: f.delimiter,
      flags: f.flags,
      specialUse: f.specialUse,
    }));
  }

  @Mutation(() => ImapSyncResult)
  async syncImapMailbox(
    @Args('accountId') accountId: string,
    @Args('channelId') channelId: string,
    @Args('fullSync', { nullable: true, defaultValue: false }) fullSync: boolean,
  ): Promise<ImapSyncResult> {
    const result = await this.imapService.syncMailbox(accountId, channelId, {
      fullSync,
    });

    return {
      synced: result.synced,
      errors: result.errors,
    };
  }

  @Mutation(() => Boolean)
  async disconnectImapAccount(
    @Args('accountId') accountId: string,
  ): Promise<boolean> {
    await this.imapService.disconnect(accountId);
    return true;
  }
}
