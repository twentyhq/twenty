import { extractGmailFolderName } from 'src/modules/messaging/message-folder-manager/drivers/gmail/utils/extract-gmail-folder-name.util';

describe('extractGmailFolderName', () => {
  it('should return full name for top-level folders', () => {
    expect(extractGmailFolderName('Inbox')).toBe('Inbox');
    expect(extractGmailFolderName('Sent')).toBe('Sent');
  });

  it('should extract folder name from nested folder', () => {
    expect(extractGmailFolderName('Work/Projects')).toBe('Projects');
  });

  it('should extract folder name from deeply nested folder', () => {
    expect(extractGmailFolderName('Work/Projects/2024')).toBe('2024');
  });

  it('should handle Gmail-style nested labels', () => {
    expect(extractGmailFolderName('[Gmail]/Sent Mail')).toBe('Sent Mail');
  });

  it('should handle single character names', () => {
    expect(extractGmailFolderName('A/B/C')).toBe('C');
  });

  it('should handle special characters', () => {
    expect(extractGmailFolderName('Work/Client - ABC Corp')).toBe(
      'Client - ABC Corp',
    );
  });
});
