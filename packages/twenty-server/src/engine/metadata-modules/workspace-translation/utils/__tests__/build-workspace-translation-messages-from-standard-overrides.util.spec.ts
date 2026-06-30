import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { buildWorkspaceTranslationMessagesFromStandardOverrides } from 'src/engine/metadata-modules/workspace-translation/utils/build-workspace-translation-messages-from-standard-overrides.util';

describe('buildWorkspaceTranslationMessagesFromStandardOverrides', () => {
  it('builds value-keyed messages per workspace and locale, skipping null values', () => {
    const entries = buildWorkspaceTranslationMessagesFromStandardOverrides({
      objectRows: [
        {
          workspaceId: 'workspace-1',
          labelSingular: 'Company',
          labelPlural: 'Companies',
          description: 'A company',
          standardOverrides: {
            translations: {
              'fr-FR': { labelSingular: 'Société', description: null },
            },
          },
        },
      ],
      fieldRows: [
        {
          workspaceId: 'workspace-1',
          label: 'Name',
          description: 'The name',
          standardOverrides: {
            translations: {
              'fr-FR': { label: 'Nom' },
              'de-DE': { label: 'Name (DE)' },
            },
          },
        },
      ],
    });

    const frEntry = entries.find(
      (entry) =>
        entry.workspaceId === 'workspace-1' && entry.locale === 'fr-FR',
    );
    const deEntry = entries.find((entry) => entry.locale === 'de-DE');

    expect(frEntry?.messages[generateMessageId('Company')]).toBe('Société');
    expect(frEntry?.messages[generateMessageId('Name')]).toBe('Nom');
    // null override is skipped
    expect(frEntry?.messages[generateMessageId('A company')]).toBeUndefined();
    expect(deEntry?.messages[generateMessageId('Name')]).toBe('Name (DE)');
  });

  it('collapses the same source string across elements onto one message id', () => {
    const entries = buildWorkspaceTranslationMessagesFromStandardOverrides({
      objectRows: [],
      fieldRows: [
        {
          workspaceId: 'workspace-1',
          label: 'Status',
          description: null,
          standardOverrides: {
            translations: { 'fr-FR': { label: 'Statut A' } },
          },
        },
        {
          workspaceId: 'workspace-1',
          label: 'Status',
          description: null,
          standardOverrides: {
            translations: { 'fr-FR': { label: 'Statut B' } },
          },
        },
      ],
    });

    const frEntry = entries.find((entry) => entry.locale === 'fr-FR');

    expect(Object.keys(frEntry?.messages ?? {})).toHaveLength(1);
    expect(frEntry?.messages[generateMessageId('Status')]).toBe('Statut B');
  });

  it('returns nothing when there are no translation overrides', () => {
    const entries = buildWorkspaceTranslationMessagesFromStandardOverrides({
      objectRows: [
        {
          workspaceId: 'workspace-1',
          labelSingular: 'Company',
          labelPlural: 'Companies',
          description: null,
          standardOverrides: null,
        },
      ],
      fieldRows: [],
    });

    expect(entries).toEqual([]);
  });
});
