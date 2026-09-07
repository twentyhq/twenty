import { generateMessageId } from '@/i18n/generate-message-id';

// These ids are not arbitrary: each pair below was lifted from the
// `js-lingui-id` comments in twenty-server's committed en.po, so this suite
// asserts our implementation still agrees with what the Lingui CLI actually
// emits. If it goes red, every persisted metadata label has silently stopped
// resolving against its catalog.
describe('generateMessageId', () => {
  it.each([
    ['A company', 'kZR6+h'],
    ['12HRS', '0eYXBl'],
    ['{fieldType} fields cannot be unique.', 'ZkHTHm'],
  ])('matches the Lingui-generated id for %p', (message, expectedId) => {
    expect(generateMessageId(message)).toBe(expectedId);
  });

  it('returns a six-character id', () => {
    expect(generateMessageId('Export View')).toHaveLength(6);
  });

  it('treats an omitted context and an empty context as the same message', () => {
    expect(generateMessageId('Export')).toBe(generateMessageId('Export', ''));
  });

  it('distinguishes the same message under different contexts', () => {
    expect(generateMessageId('Export', 'commandMenuItem.shortLabel')).not.toBe(
      generateMessageId('Export', 'view.name'),
    );
  });
});
