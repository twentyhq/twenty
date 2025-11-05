import { Injectable, Logger } from '@nestjs/common';

import { isNumber } from 'class-validator';
import { ListResponse, type ImapFlow } from 'imapflow';

import { getImapSentFolderCandidatesByRegex } from 'src/modules/messaging/message-import-manager/drivers/imap/utils/get-sent-folder-candidates-by-regex.util';

type SentFolderResult = {
  name: string;
  path: string;
} | null;

/**
 * Service to find sent folder using IMAP special-use flags
 *
 * This service uses IMAP special-use extension (RFC 6154) to identify
 * the sent folder by looking for the \Sent flag rather than relying on
 * folder names which can vary across providers and locales.
 *
 * Falls back to regex-based detection if special-use flags are not available.
 * The regex pattern is inspired by imapsync's comprehensive folder mapping.
 */
@Injectable()
export class ImapFindSentFolderService {
  private readonly logger = new Logger(ImapFindSentFolderService.name);

  public async findSentFolder(client: ImapFlow): Promise<SentFolderResult> {
    try {
      const list = await client.list();

      this.logger.debug(
        `Available folders: ${list.map((item) => item.path).join(', ')}`,
      );

      const specialUseSentFolder = await this.findSentFolderBySpecialUse(
        client,
        list,
      );

      if (specialUseSentFolder) {
        return specialUseSentFolder;
      }

      const candidateSentFolder = await this.findSentFolderByRegexCandidates(
        client,
        list,
      );

      if (candidateSentFolder) {
        return candidateSentFolder;
      }

      this.logger.warn(
        'No sent folder found. Only inbox messages will be imported.',
      );

      return null;
    } catch (error) {
      this.logger.warn(`Error listing folders: ${error.message}`);

      return null;
    }
  }

  private async findSentFolderBySpecialUse(
    client: ImapFlow,
    list: ListResponse[],
  ): Promise<SentFolderResult> {
    for (const folder of list) {
      if (folder.specialUse && folder.specialUse.includes('\\Sent')) {
        this.logger.log(
          `Found sent folder via special-use flag: ${folder.path}`,
        );

        const messageCount = await this.getFolderMessageCount(
          client,
          folder.path,
        );

        if (messageCount > 0) {
          return {
            name: folder.name,
            path: folder.path,
          };
        }

        this.logger.warn(
          `Special-use sent folder "${folder.path}" is empty, checking other candidates`,
        );

        break;
      }
    }

    return null;
  }

  private async findSentFolderByRegexCandidates(
    client: ImapFlow,
    list: ListResponse[],
  ): Promise<SentFolderResult> {
    const regexCandidateFolders = getImapSentFolderCandidatesByRegex(list);

    for (const folder of regexCandidateFolders) {
      const messageCount = await this.getFolderMessageCount(
        client,
        folder.path,
      );

      if (messageCount > 0) {
        this.logger.log(
          `Selected sent folder via pattern match: ${folder.path}`,
        );

        return {
          name: folder.name,
          path: folder.path,
        };
      }
    }

    if (regexCandidateFolders.length > 0) {
      this.logger.log(
        `Using first regex candidate sent folder: ${regexCandidateFolders[0].path} (no messages found in any regex candidate)`,
      );

      const folder = regexCandidateFolders[0];

      return {
        name: folder.name,
        path: folder.path,
      };
    }

    return null;
  }

  private async getFolderMessageCount(
    client: ImapFlow,
    folderPath: string,
  ): Promise<number> {
    try {
      const lock = await client.getMailboxLock(folderPath);

      try {
        const status = await client.status(folderPath, {
          messages: true,
        });

        const messageCount = status?.messages;

        this.logger.debug(
          `Folder "${folderPath}" has ${messageCount} messages`,
        );

        return isNumber(messageCount) ? messageCount : 0;
      } finally {
        lock.release();
      }
    } catch (error) {
      this.logger.warn(
        `Error checking folder "${folderPath}": ${error.message}`,
      );

      return 0;
    }
  }
}
