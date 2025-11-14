import { shouldCreateFolderByDefault } from 'src/modules/messaging/message-folder-manager/utils/should-create-folder-by-default.util';
import { StandardFolder } from 'src/modules/messaging/message-import-manager/drivers/types/standard-folder';

describe('shouldCreateFolderByDefault', () => {
  it('should allow creating user folders', () => {
    expect(shouldCreateFolderByDefault(StandardFolder.INBOX)).toBe(true);
    expect(shouldCreateFolderByDefault(StandardFolder.SENT)).toBe(true);
  });

  it('should allow creating custom folders', () => {
    expect(shouldCreateFolderByDefault(null)).toBe(true);
    expect(shouldCreateFolderByDefault(undefined)).toBe(true);
  });

  it('should prevent creating system-excluded folders', () => {
    expect(shouldCreateFolderByDefault(StandardFolder.DRAFTS)).toBe(false);
    expect(shouldCreateFolderByDefault(StandardFolder.TRASH)).toBe(false);
    expect(shouldCreateFolderByDefault(StandardFolder.JUNK)).toBe(false);
  });
});
