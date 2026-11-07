import { computeAppMessageFolderSyncPlan } from 'src/engine/metadata-modules/message-channel/utils/compute-app-message-folder-sync-plan.util';

const SUPPORT_FOLDER = {
  id: 'folder-support',
  externalId: 'inb_support',
  name: 'Support',
  isSynced: true,
};

const SALES_FOLDER = {
  id: 'folder-sales',
  externalId: 'inb_sales',
  name: 'Sales',
  isSynced: false,
};

describe('computeAppMessageFolderSyncPlan', () => {
  it('creates unknown folders, synced unless the app says otherwise', () => {
    const plan = computeAppMessageFolderSyncPlan({
      existingFolders: [],
      requestedFolders: [
        { externalId: 'inb_support', name: 'Support' },
        { externalId: 'inb_sales', name: 'Sales', isSynced: false },
      ],
    });

    expect(plan).toEqual({
      foldersToCreate: [
        { externalId: 'inb_support', name: 'Support', isSynced: true },
        { externalId: 'inb_sales', name: 'Sales', isSynced: false },
      ],
      foldersToUpdate: [],
      folderIdsToDelete: [],
    });
  });

  it('keeps the stored isSynced when the app omits it', () => {
    const plan = computeAppMessageFolderSyncPlan({
      existingFolders: [SALES_FOLDER],
      requestedFolders: [{ externalId: 'inb_sales', name: 'Sales' }],
    });

    expect(plan.foldersToUpdate).toEqual([]);
  });

  it('renames and toggles existing folders matched on externalId', () => {
    const plan = computeAppMessageFolderSyncPlan({
      existingFolders: [SUPPORT_FOLDER, SALES_FOLDER],
      requestedFolders: [
        { externalId: 'inb_support', name: 'Customer support' },
        { externalId: 'inb_sales', name: 'Sales', isSynced: true },
      ],
    });

    expect(plan.foldersToUpdate).toEqual([
      { id: 'folder-support', update: { name: 'Customer support' } },
      { id: 'folder-sales', update: { isSynced: true } },
    ]);
    expect(plan.foldersToCreate).toEqual([]);
  });

  it('deletes folders missing from the request', () => {
    const plan = computeAppMessageFolderSyncPlan({
      existingFolders: [SUPPORT_FOLDER, SALES_FOLDER],
      requestedFolders: [{ externalId: 'inb_support', name: 'Support' }],
    });

    expect(plan.folderIdsToDelete).toEqual(['folder-sales']);
  });

  it('deletes every folder for an empty request', () => {
    const plan = computeAppMessageFolderSyncPlan({
      existingFolders: [SUPPORT_FOLDER, SALES_FOLDER],
      requestedFolders: [],
    });

    expect(plan.folderIdsToDelete).toEqual(['folder-support', 'folder-sales']);
  });
});
