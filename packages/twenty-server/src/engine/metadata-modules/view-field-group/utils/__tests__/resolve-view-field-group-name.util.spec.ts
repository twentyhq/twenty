import { type I18n } from '@lingui/core';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { resolveViewFieldGroupName } from 'src/engine/metadata-modules/view-field-group/utils/resolve-view-field-group-name.util';

jest.mock('src/engine/core-modules/i18n/utils/generateMessageId');

const mockGenerateMessageId = generateMessageId as jest.MockedFunction<
  typeof generateMessageId
>;

const STANDARD_APPLICATION_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';

describe('resolveViewFieldGroupName', () => {
  let mockI18n: jest.Mocked<I18n>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockI18n = {
      _: jest.fn(),
    } as unknown as jest.Mocked<I18n>;
  });

  it('should return translated name when catalog has a match', () => {
    mockGenerateMessageId.mockReturnValue('abc123');
    mockI18n._.mockReturnValue('Général');

    const result = resolveViewFieldGroupName({
      name: 'General',
      applicationId: STANDARD_APPLICATION_ID,
      twentyStandardApplicationId: STANDARD_APPLICATION_ID,
      i18nInstance: mockI18n,
    });

    expect(mockGenerateMessageId).toHaveBeenCalledWith('General');
    expect(mockI18n._).toHaveBeenCalledWith('abc123');
    expect(result).toBe('Général');
  });

  it('should return original name when catalog returns the hash (no translation found)', () => {
    mockGenerateMessageId.mockReturnValue('xyz789');
    mockI18n._.mockReturnValue('xyz789');

    const result = resolveViewFieldGroupName({
      name: 'My Custom Group',
      applicationId: STANDARD_APPLICATION_ID,
      twentyStandardApplicationId: STANDARD_APPLICATION_ID,
      i18nInstance: mockI18n,
    });

    expect(mockGenerateMessageId).toHaveBeenCalledWith('My Custom Group');
    expect(mockI18n._).toHaveBeenCalledWith('xyz789');
    expect(result).toBe('My Custom Group');
  });

  it('should return original name for empty string', () => {
    mockGenerateMessageId.mockReturnValue('empty-hash');
    mockI18n._.mockReturnValue('empty-hash');

    const result = resolveViewFieldGroupName({
      name: '',
      applicationId: STANDARD_APPLICATION_ID,
      twentyStandardApplicationId: STANDARD_APPLICATION_ID,
      i18nInstance: mockI18n,
    });

    expect(result).toBe('');
  });

  it('should translate standard view field group names', () => {
    const standardGroups = [
      { source: 'General', translated: 'Général' },
      { source: 'System', translated: 'Système' },
      { source: 'Work', translated: 'Travail' },
      { source: 'Social', translated: 'Social' },
      { source: 'Deal', translated: 'Affaire' },
      { source: 'Relations', translated: 'Relations' },
      { source: 'Business', translated: 'Entreprise' },
      { source: 'Contact', translated: 'Contact' },
    ];

    standardGroups.forEach(({ source, translated }) => {
      jest.clearAllMocks();
      mockGenerateMessageId.mockReturnValue(`hash-${source}`);
      mockI18n._.mockReturnValue(translated);

      const result = resolveViewFieldGroupName({
        name: source,
        applicationId: STANDARD_APPLICATION_ID,
        twentyStandardApplicationId: STANDARD_APPLICATION_ID,
        i18nInstance: mockI18n,
      });

      expect(result).toBe(translated);
    });
  });

  it('should not translate name when applicationId is not from standard app', () => {
    mockGenerateMessageId.mockReturnValue('abc123');
    mockI18n._.mockReturnValue('Général');

    const customAppId = '11111111-1111-1111-1111-111111111111';

    const result = resolveViewFieldGroupName({
      name: 'General',
      applicationId: customAppId,
      twentyStandardApplicationId: STANDARD_APPLICATION_ID,
      i18nInstance: mockI18n,
    });

    expect(mockGenerateMessageId).not.toHaveBeenCalled();
    expect(mockI18n._).not.toHaveBeenCalled();
    expect(result).toBe('General');
  });

  it('should not translate name when overrides.name is defined', () => {
    mockGenerateMessageId.mockReturnValue('abc123');
    mockI18n._.mockReturnValue('Général');

    const result = resolveViewFieldGroupName({
      name: 'General',
      applicationId: STANDARD_APPLICATION_ID,
      twentyStandardApplicationId: STANDARD_APPLICATION_ID,
      overrides: { name: 'General' },
      i18nInstance: mockI18n,
    });

    expect(mockGenerateMessageId).not.toHaveBeenCalled();
    expect(mockI18n._).not.toHaveBeenCalled();
    expect(result).toBe('General');
  });

  it('should translate name when overrides is defined but overrides.name is not', () => {
    mockGenerateMessageId.mockReturnValue('abc123');
    mockI18n._.mockReturnValue('Général');

    const result = resolveViewFieldGroupName({
      name: 'General',
      applicationId: STANDARD_APPLICATION_ID,
      twentyStandardApplicationId: STANDARD_APPLICATION_ID,
      overrides: { position: 3 },
      i18nInstance: mockI18n,
    });

    expect(mockGenerateMessageId).toHaveBeenCalledWith('General');
    expect(mockI18n._).toHaveBeenCalledWith('abc123');
    expect(result).toBe('Général');
  });
});
