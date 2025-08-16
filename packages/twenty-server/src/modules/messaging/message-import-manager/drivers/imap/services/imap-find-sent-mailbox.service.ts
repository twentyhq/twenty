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
export class ImapFindSentMailboxService {
  private readonly logger = new Logger(ImapFindSentMailboxService.name);

  public async findSentMailbox(client: ImapFlow): Promise<string | null> {
    try {
      const list = await client.list();

      this.logger.debug(
        `Available folders: ${list.map((item) => item.path).join(', ')}`,
      );

      const specialUseSentFolder = await this.findSpecialUseSentFolder(
        client,
        list,
      );

      if (specialUseSentFolder) {
        return specialUseSentFolder;
      }

      const candidateSentFolder = await this.findSentFolderByCandidates(
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
      this.logger.warn(`Error listing mailboxes: ${error.message}`);

      return null;
    }
  }

  private async findSpecialUseSentFolder(
    client: ImapFlow,
    list: ListResponse[],
  ): Promise<string | null> {
    for (const folder of list) {
      if (folder.specialUse && folder.specialUse.includes('\\Sent')) {
        this.logger.log(
          `Found sent folder via special-use flag: ${folder.path}`,
        );

        const hasMessages = await this.validateFolderHasMessages(
          client,
          folder.path,
        );

        if (hasMessages) {
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

  private async findSentFolderByCandidates(
    client: ImapFlow,
    list: ListResponse[],
  ): Promise<string | null> {
    const candidateFolders = this.getSentFolderCandidates(list);

    for (const folder of candidateFolders) {
      const hasMessages = await this.validateFolderHasMessages(client, folder);

      if (hasMessages) {
        this.logger.log(`Selected sent folder via pattern match: ${folder}`);

        return folder;
      }
    }

    if (candidateFolders.length > 0) {
      this.logger.log(
        `Using first candidate sent folder: ${candidateFolders[0]} (no messages found in any candidate)`,
      );

      return candidateFolders[0];
    }

    return null;
  }

  private getSentFolderCandidates(list: ListResponse[]): string[] {
    // Comprehensive regex pattern for legacy IMAP servers
    // Source: https://imapsync.lamiral.info/FAQ.d/FAQ.Folders_Mapping.txt
    // Based on imapsync's regextrans2 examples (originally "Sent|Sent Messages|Gesendet")
    // Extended with additional common localizations for broader provider/language support
    const sentFolderPattern =
      /^(.*\/)?(sent|sent[\s_-]?(items|mail|messages|elements)?|envoy[éê]s?|[ée]l[ée]ments[\s_-]?envoy[éê]s|gesendet|gesendete[\s_-]?elemente|enviados?|elementos[\s_-]?enviados|itens[\s_-]?enviados|posta[\s_-]?inviata|inviati|보낸편지함|\[gmail\]\/sent[\s_-]?mail)$/i;

    const candidateFolders = [];

    for (const folder of list) {
      if (sentFolderPattern.test(folder.path)) {
        this.logger.debug(
          `Found potential sent folder via pattern match: ${folder.path}`,
        );
        candidateFolders.push(folder.path);
      }
    }

    return candidateFolders;
  }

  private async validateFolderHasMessages(
    client: ImapFlow,
    folderPath: string,
  ): Promise<boolean> {
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

        return isNumber(messageCount) && messageCount > 0;
      } finally {
        lock.release();
      }
    } catch (error) {
      this.logger.warn(
        `Error checking folder "${folderPath}": ${error.message}`,
      );

      return false;
    }
  }
}
