import { type I18n } from '@lingui/core';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { resolvePageLayoutTabTitle } from 'src/engine/metadata-modules/page-layout-tab/utils/resolve-page-layout-tab-title.util';

jest.mock('src/engine/core-modules/i18n/utils/generateMessageId');

const mockGenerateMessageId = generateMessageId as jest.MockedFunction<
  typeof generateMessageId
>;

describe('resolvePageLayoutTabTitle', () => {
  let mockI18n: jest.Mocked<I18n>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockI18n = {
      _: jest.fn(),
    } as unknown as jest.Mocked<I18n>;
  });

  it('should return translated title when catalog has a match', () => {
    mockGenerateMessageId.mockReturnValue('abc123');
    mockI18n._.mockReturnValue('Accueil');

    const result = resolvePageLayoutTabTitle('Home', mockI18n);

    expect(mockGenerateMessageId).toHaveBeenCalledWith('Home');
    expect(mockI18n._).toHaveBeenCalledWith('abc123');
    expect(result).toBe('Accueil');
  });

  it('should return original title when catalog returns the hash (no translation found)', () => {
    mockGenerateMessageId.mockReturnValue('xyz789');
    mockI18n._.mockReturnValue('xyz789');

    const result = resolvePageLayoutTabTitle('My Custom Tab', mockI18n);

    expect(mockGenerateMessageId).toHaveBeenCalledWith('My Custom Tab');
    expect(mockI18n._).toHaveBeenCalledWith('xyz789');
    expect(result).toBe('My Custom Tab');
  });

  it('should return original title for empty string', () => {
    mockGenerateMessageId.mockReturnValue('empty-hash');
    mockI18n._.mockReturnValue('empty-hash');

    const result = resolvePageLayoutTabTitle('', mockI18n);

    expect(result).toBe('');
  });

  it('should translate standard tab titles', () => {
    const standardTabs = [
      { source: 'Home', translated: 'Accueil' },
      { source: 'Timeline', translated: 'Chronologie' },
      { source: 'Tasks', translated: 'Tâches' },
      { source: 'Notes', translated: 'Notes' },
      { source: 'Files', translated: 'Fichiers' },
      { source: 'Emails', translated: 'E-mails' },
      { source: 'Calendar', translated: 'Calendrier' },
      { source: 'Note', translated: 'Note' },
      { source: 'Flow', translated: 'Flux' },
    ];

    standardTabs.forEach(({ source, translated }) => {
      jest.clearAllMocks();
      mockGenerateMessageId.mockReturnValue(`hash-${source}`);
      mockI18n._.mockReturnValue(translated);

      const result = resolvePageLayoutTabTitle(source, mockI18n);

      expect(result).toBe(translated);
    });
  });
});
