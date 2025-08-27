import { Injectable, Logger } from '@nestjs/common';

import { isNumber } from 'class-validator';
import { ListResponse, type ImapFlow } from 'imapflow';

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

  public async findSentFolder(client: ImapFlow): Promise<string | null> {
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
  ): Promise<string | null> {
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
          return folder.path;
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
  ): Promise<string | null> {
    const regexCandidateFolders = this.getSentFolderCandidatesByRegex(list);

    for (const folder of regexCandidateFolders) {
      const messageCount = await this.getFolderMessageCount(client, folder);

      if (messageCount > 0) {
        this.logger.log(`Selected sent folder via pattern match: ${folder}`);

        return folder;
      }
    }

    if (regexCandidateFolders.length > 0) {
      this.logger.log(
        `Using first regex candidate sent folder: ${regexCandidateFolders[0]} (no messages found in any regex candidate)`,
      );

      return regexCandidateFolders[0];
    }

    return null;
  }

  private getSentFolderCandidatesByRegex(list: ListResponse[]): string[] {
    // Comprehensive regex pattern for legacy IMAP servers
    // Source: https://imapsync.lamiral.info/FAQ.d/FAQ.Folders_Mapping.txt
    // Based on imapsync's regextrans2 examples (originally "Sent|Sent Messages|Gesendet")
    // Extended with additional common localizations for broader provider/language support
    const sentFolderPattern =
      /^(.*\/)?(sent|sent[\s_-]?(items|mail|messages|elements)?|envoy[éê]s?|[ée]l[ée]ments[\s_-]?envoy[éê]s|gesendet|gesendete[\s_-]?elemente|enviados?|elementos[\s_-]?enviados|itens[\s_-]?enviados|posta[\s_-]?inviata|inviati|보낸편지함|\[gmail\]\/sent[\s_-]?mail)$/i;

    const regexCandidateFolders = [];

    for (const folder of list) {
      if (sentFolderPattern.test(folder.path)) {
        this.logger.debug(
          `Found potential sent folder via pattern match: ${folder.path}`,
        );
        regexCandidateFolders.push(folder.path);
      }
    }

    return regexCandidateFolders;
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
