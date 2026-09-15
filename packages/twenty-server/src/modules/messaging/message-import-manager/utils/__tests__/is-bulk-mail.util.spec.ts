import { isBulkMail } from 'src/modules/messaging/message-import-manager/utils/is-bulk-mail.util';

describe('isBulkMail', () => {
  it('should detect a List-Unsubscribe header regardless of casing', () => {
    expect(
      isBulkMail([
        { name: 'List-Unsubscribe', value: '<https://example.com/unsub>' },
      ]),
    ).toBe(true);

    expect(
      isBulkMail([
        { name: 'list-unsubscribe', value: '<mailto:unsub@example.com>' },
      ]),
    ).toBe(true);
  });

  it('should detect a List-Id header', () => {
    expect(
      isBulkMail([{ name: 'List-Id', value: '<newsletter.example.com>' }]),
    ).toBe(true);
  });

  it('should detect bulk precedence values only', () => {
    expect(isBulkMail([{ name: 'Precedence', value: 'bulk' }])).toBe(true);
    expect(isBulkMail([{ name: 'Precedence', value: ' List ' }])).toBe(true);
    expect(isBulkMail([{ name: 'Precedence', value: 'urgent' }])).toBe(false);
  });

  it('should treat Auto-Submitted as bulk unless it is "no"', () => {
    expect(
      isBulkMail([{ name: 'Auto-Submitted', value: 'auto-generated' }]),
    ).toBe(true);
    expect(isBulkMail([{ name: 'Auto-Submitted', value: 'no' }])).toBe(false);
  });

  it('should not flag a regular message', () => {
    expect(
      isBulkMail([
        { name: 'From', value: 'tim@apple.com' },
        { name: 'Subject', value: 'Lunch' },
        { name: 'List-Unsubscribe', value: '' },
      ]),
    ).toBe(false);
  });

  it('should not flag a message without headers', () => {
    expect(isBulkMail([])).toBe(false);
  });
});
