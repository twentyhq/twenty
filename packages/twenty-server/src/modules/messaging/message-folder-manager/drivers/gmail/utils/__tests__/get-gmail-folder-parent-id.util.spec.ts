import { getGmailFolderParentId } from 'src/modules/messaging/message-folder-manager/drivers/gmail/utils/get-gmail-folder-parent-id.util';

describe('getGmailFolderParentId', () => {
  it('should return null for top-level folders without slash', () => {
    const labelNameToIdMap = new Map<string, string>([
      ['Inbox', 'INBOX'],
      ['Sent', 'SENT'],
    ]);

    expect(getGmailFolderParentId('Inbox', labelNameToIdMap)).toBeNull();
  });

  it('should return parent ID for nested folder', () => {
    const labelNameToIdMap = new Map<string, string>([
      ['Work', 'work-id'],
      ['Work/Projects', 'projects-id'],
    ]);

    expect(getGmailFolderParentId('Work/Projects', labelNameToIdMap)).toBe(
      'work-id',
    );
  });

  it('should return parent ID for deeply nested folder', () => {
    const labelNameToIdMap = new Map<string, string>([
      ['Work', 'work-id'],
      ['Work/Projects', 'projects-id'],
      ['Work/Projects/2024', '2024-id'],
    ]);

    expect(getGmailFolderParentId('Work/Projects/2024', labelNameToIdMap)).toBe(
      'projects-id',
    );
  });

  it('should return null if parent folder does not exist in map', () => {
    const labelNameToIdMap = new Map<string, string>([
      ['Work/Projects', 'projects-id'],
    ]);

    expect(
      getGmailFolderParentId('Work/Projects', labelNameToIdMap),
    ).toBeNull();
  });

  it('should handle Gmail-style nested labels', () => {
    const labelNameToIdMap = new Map<string, string>([
      ['[Gmail]', 'gmail-id'],
      ['[Gmail]/Sent Mail', 'sent-id'],
    ]);

    expect(getGmailFolderParentId('[Gmail]/Sent Mail', labelNameToIdMap)).toBe(
      'gmail-id',
    );
  });
});
