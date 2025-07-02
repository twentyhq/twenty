import { Logger } from '@nestjs/common';

import { ImapFlow } from 'imapflow';

/**
 * Find sent folder using IMAP special-use flags
 *
 * This function uses IMAP special-use extension (RFC 6154) to identify
 * the sent folder by looking for the \Sent flag rather than relying on
 * folder names which can vary across providers and locales.
 *
 * Falls back to regex-based detection if special-use flags are not available.
 * The regex pattern is inspired by imapsync's comprehensive folder mapping.
 */
export async function findSentMailbox(
  client: ImapFlow,
  logger: Logger,
): Promise<string | null> {
  try {
    const list = await client.list();

    logger.debug(
      `Available folders: ${list.map((item) => item.path).join(', ')}`,
    );

    for (const folder of list) {
      if (folder.specialUse && folder.specialUse.includes('\\Sent')) {
        logger.log(`Found sent folder via special-use flag: ${folder.path}`);

        return folder.path;
      }
    }

    // Fallback: comprehensive regex pattern for legacy IMAP servers
    // Source: https://imapsync.lamiral.info/FAQ.d/FAQ.Folders_Mapping.txt
    // Based on imapsync's regextrans2 examples (originally "Sent|Sent Messages|Gesendet")
    // Extended with additional common localizations for broader provider/language support
    const sentFolderPattern =
      /^(.*\/)?(sent|sent[\s_-]?(items|mail|messages|elements)?|envoy[éê]s?|[ée]l[ée]ments[\s_-]?envoy[éê]s|gesendet|gesendete[\s_-]?elemente|enviados?|elementos[\s_-]?enviados|itens[\s_-]?enviados|posta[\s_-]?inviata|inviati|보낸편지함|\[gmail\]\/sent[\s_-]?mail)$/i;

    const availableFolders = list.map((item) => item.path);

    for (const folder of availableFolders) {
      if (sentFolderPattern.test(folder)) {
        logger.log(`Found sent folder via pattern match: ${folder}`);

        return folder;
      }
    }

    logger.warn('No sent folder found. Only inbox messages will be imported.');

    return null;
  } catch (error) {
    logger.warn(`Error listing mailboxes: ${error.message}`);

    return null;
  }
}
