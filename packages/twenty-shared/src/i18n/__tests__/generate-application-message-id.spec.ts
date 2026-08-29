import { generateApplicationMessageId } from '@/i18n/generate-application-message-id';

// These ids are frozen, not merely current. They key application catalogs that
// are baked into published app manifests and persisted in
// `application_translation.messages`, so the requirement is that this function
// never changes -- which is exactly what hardcoded vectors assert.
//
// If this suite goes red, the change under review breaks every installed
// application. Do NOT update these values to make it pass, and in particular do
// not update them to agree with Lingui: Lingui 6 emits URL-safe base64
// (`-`/`_`) where this emits `+`/`/`, and that divergence is intentional.
describe('generateApplicationMessageId', () => {
  it.each([
    ['A company', '', 'kZR6+h'],
    ['12HRS', '', '0eYXBl'],
    ['{fieldType} fields cannot be unique.', '', 'ZkHTHm'],
    // Cases whose ids carry the base64 characters Lingui 6 replaced; these are
    // what pin the divergence.
    ['Monthly', '', '+8Nek/'],
    ['Admin Panel', 'commandMenuItem.shortLabel', '/fcRNd'],
  ])('keeps the frozen id for %p in context %p', (message, context, id) => {
    expect(generateApplicationMessageId(message, context)).toBe(id);
  });

  it('returns a six-character id', () => {
    expect(generateApplicationMessageId('Export View')).toHaveLength(6);
  });

  it('treats an omitted context and an empty context as the same message', () => {
    expect(generateApplicationMessageId('Export')).toBe(
      generateApplicationMessageId('Export', ''),
    );
  });

  it('distinguishes the same message under different contexts', () => {
    expect(
      generateApplicationMessageId('Export', 'commandMenuItem.shortLabel'),
    ).not.toBe(generateApplicationMessageId('Export', 'view.name'));
  });
});
