import { Logger } from '@nestjs/common';

import { ImapFlow } from 'imapflow';

/**
 * Find sent folder names that might exist on different IMAP servers
 *
 * Different email providers use different names for the sent folder:
 * - "Sent" (common)
 * - "Sent Items" (Microsoft)
 * - "Sent Mail" (Gmail)
 * - "[Gmail]/Sent Mail" (some Gmail IMAP configurations)
 * - "Sent Messages"
 * - Localized versions in different languages
 *
 * This function tries to find a matching sent folder from the available mailboxes.
 */
export async function findSentMailbox(
  client: ImapFlow,
  logger: Logger,
): Promise<string | null> {
  const possibleSentFolders = [
    'Sent',
    'Sent Items',
    'Sent Mail',
    '[Gmail]/Sent Mail',
    'Sent Messages',
  ];

  try {
    const list = await client.list();
    const availableFolders = list.map((item) => item.path);

    logger.debug(`Available folders: ${availableFolders.join(', ')}`);

    for (const folderName of possibleSentFolders) {
      if (availableFolders.includes(folderName)) {
        logger.log(`Found sent folder: ${folderName}`);

        return folderName;
      }
    }

    // If no exact match, try case-insensitive partial match
    // This helps with localized versions or slight variations
    const sentFolderPattern = /sent|envoy|outbox|outgoing|versendet/i;

    for (const folder of availableFolders) {
      if (sentFolderPattern.test(folder)) {
        logger.log(`Found potential sent folder via pattern match: ${folder}`);

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
