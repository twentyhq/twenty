import { isDefined } from 'twenty-shared/utils';

import {
  type DiscoveredMessageFolder,
  type MessageFolder,
} from 'src/modules/messaging/message-folder-manager/interfaces/message-folder-driver.interface';

export interface FolderMatchingResult {
  matches: Map<string, DiscoveredMessageFolder>; // existingFolderId -> discoveredFolder
  toCreate: DiscoveredMessageFolder[];
  toDelete: string[]; // existingFolderId
}

export const matchFolders = ({
  discoveredFolders,
  existingFolders,
}: {
  discoveredFolders: DiscoveredMessageFolder[];
  existingFolders: MessageFolder[];
}): FolderMatchingResult => {
  const matches = new Map<string, DiscoveredMessageFolder>();
  const toCreate: DiscoveredMessageFolder[] = [];
  const existingFolderIdsMatched = new Set<string>();
  const discoveredFoldersMatched = new Set<DiscoveredMessageFolder>();

  // 1. Exact externalId match
  const existingFoldersByExternalId = new Map(
    existingFolders.map((folder) => [folder.externalId, folder]),
  );

  for (const discoveredFolder of discoveredFolders) {
    const existingFolder = existingFoldersByExternalId.get(
      discoveredFolder.externalId,
    );

    if (existingFolder) {
      matches.set(existingFolder.id, discoveredFolder);
      existingFolderIdsMatched.add(existingFolder.id);
      discoveredFoldersMatched.add(discoveredFolder);
    }
  }

  // 2. Fallback: Match by name + parentFolderId (Robust Matching)
  // This helps when externalId changes (e.g. IMAP UIDValidity) but folder identity is same.
  for (const discoveredFolder of discoveredFolders) {
    if (discoveredFoldersMatched.has(discoveredFolder)) {
      continue;
    }

    const existingFolderMatch = existingFolders.find(
      (existingFolder) =>
        !existingFolderIdsMatched.has(existingFolder.id) &&
        existingFolder.name === discoveredFolder.name &&
        existingFolder.parentFolderId === discoveredFolder.parentFolderId,
    );

    if (existingFolderMatch) {
      matches.set(existingFolderMatch.id, discoveredFolder);
      existingFolderIdsMatched.add(existingFolderMatch.id);
      discoveredFoldersMatched.add(discoveredFolder);
    }
  }

  // 3. Fallback: Match by IMAP path (prefix match)
  // Only if externalId follows the path:uidValidity pattern
  for (const discoveredFolder of discoveredFolders) {
    if (discoveredFoldersMatched.has(discoveredFolder)) {
      continue;
    }

    const discoveredPath = discoveredFolder.externalId.split(':')[0];

    if (isDefined(discoveredPath)) {
      const existingFolderMatch = existingFolders.find((existingFolder) => {
        if (existingFolderIdsMatched.has(existingFolder.id)) {
          return false;
        }

        const existingPath = existingFolder.externalId.split(':')[0];

        return existingPath === discoveredPath;
      });

      if (existingFolderMatch) {
        matches.set(existingFolderMatch.id, discoveredFolder);
        existingFolderIdsMatched.add(existingFolderMatch.id);
        discoveredFoldersMatched.add(discoveredFolder);
      }
    }
  }

  // 4. Finalize toCreate and toDelete
  for (const discoveredFolder of discoveredFolders) {
    if (!discoveredFoldersMatched.has(discoveredFolder)) {
      toCreate.push(discoveredFolder);
    }
  }

  const toDelete = existingFolders
    .filter((folder) => !existingFolderIdsMatched.has(folder.id))
    .map((folder) => folder.id);

  return {
    matches,
    toCreate,
    toDelete,
  };
};
