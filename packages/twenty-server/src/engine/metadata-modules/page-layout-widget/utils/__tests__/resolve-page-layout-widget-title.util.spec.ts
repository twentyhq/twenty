import { type I18n } from '@lingui/core';

import { generateMessageId } from 'src/engine/core-modules/i18n/utils/generateMessageId';
import { resolvePageLayoutWidgetTitle } from 'src/engine/metadata-modules/page-layout-widget/utils/resolve-page-layout-widget-title.util';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';

jest.mock('src/engine/core-modules/i18n/utils/generateMessageId');

const mockGenerateMessageId = generateMessageId as jest.MockedFunction<
  typeof generateMessageId
>;

describe('resolvePageLayoutWidgetTitle', () => {
  let mockI18n: jest.Mocked<I18n>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockI18n = {
      _: jest.fn(),
    } as unknown as jest.Mocked<I18n>;
  });

  it('should return translated title when catalog has a match', () => {
    mockGenerateMessageId.mockReturnValue('abc123');
    mockI18n._.mockReturnValue('Champs');

    const result = resolvePageLayoutWidgetTitle({
      title: 'Fields',
      applicationId: TWENTY_STANDARD_APPLICATION.universalIdentifier,
      pageLayoutType: PageLayoutType.RECORD_PAGE,
      i18nInstance: mockI18n,
    });

    expect(mockGenerateMessageId).toHaveBeenCalledWith('Fields');
    expect(mockI18n._).toHaveBeenCalledWith('abc123');
    expect(result).toBe('Champs');
  });

  it('should return original title when catalog returns the hash (no translation found)', () => {
    mockGenerateMessageId.mockReturnValue('xyz789');
    mockI18n._.mockReturnValue('xyz789');

    const result = resolvePageLayoutWidgetTitle({
      title: 'My Custom Widget',
      applicationId: TWENTY_STANDARD_APPLICATION.universalIdentifier,
      pageLayoutType: PageLayoutType.RECORD_PAGE,
      i18nInstance: mockI18n,
    });

    expect(mockGenerateMessageId).toHaveBeenCalledWith('My Custom Widget');
    expect(mockI18n._).toHaveBeenCalledWith('xyz789');
    expect(result).toBe('My Custom Widget');
  });

  it('should return original title for empty string', () => {
    mockGenerateMessageId.mockReturnValue('empty-hash');
    mockI18n._.mockReturnValue('empty-hash');

    const result = resolvePageLayoutWidgetTitle({
      title: '',
      applicationId: TWENTY_STANDARD_APPLICATION.universalIdentifier,
      pageLayoutType: PageLayoutType.RECORD_PAGE,
      i18nInstance: mockI18n,
    });

    expect(result).toBe('');
  });

  it('should translate standard widget titles', () => {
    const standardWidgets = [
      { source: 'Fields', translated: 'Champs' },
      { source: 'Timeline', translated: 'Chronologie' },
      { source: 'Tasks', translated: 'Tâches' },
      { source: 'Notes', translated: 'Notes' },
      { source: 'Files', translated: 'Fichiers' },
      { source: 'Emails', translated: 'E-mails' },
      { source: 'Calendar', translated: 'Calendrier' },
      { source: 'Note', translated: 'Note' },
      { source: 'Task', translated: 'Tâche' },
      { source: 'Flow', translated: 'Flux' },
    ];

    standardWidgets.forEach(({ source, translated }) => {
      jest.clearAllMocks();
      mockGenerateMessageId.mockReturnValue(`hash-${source}`);
      mockI18n._.mockReturnValue(translated);

      const result = resolvePageLayoutWidgetTitle({
        title: source,
        applicationId: TWENTY_STANDARD_APPLICATION.universalIdentifier,
        pageLayoutType: PageLayoutType.RECORD_PAGE,
        i18nInstance: mockI18n,
      });

      expect(result).toBe(translated);
    });
  });

  it('should not translate title when applicationId is not from standard app', () => {
    mockGenerateMessageId.mockReturnValue('abc123');
    mockI18n._.mockReturnValue('Champs');

    const customAppId = '11111111-1111-1111-1111-111111111111';

    const result = resolvePageLayoutWidgetTitle({
      title: 'Fields',
      applicationId: customAppId,
      pageLayoutType: PageLayoutType.RECORD_PAGE,
      i18nInstance: mockI18n,
    });

    expect(mockGenerateMessageId).not.toHaveBeenCalled();
    expect(mockI18n._).not.toHaveBeenCalled();
    expect(result).toBe('Fields');
  });

  it('should not translate title when pageLayoutType is DASHBOARD', () => {
    mockGenerateMessageId.mockReturnValue('abc123');
    mockI18n._.mockReturnValue('Champs');

    const result = resolvePageLayoutWidgetTitle({
      title: 'Fields',
      applicationId: TWENTY_STANDARD_APPLICATION.universalIdentifier,
      pageLayoutType: PageLayoutType.DASHBOARD,
      i18nInstance: mockI18n,
    });

    expect(mockGenerateMessageId).not.toHaveBeenCalled();
    expect(mockI18n._).not.toHaveBeenCalled();
    expect(result).toBe('Fields');
  });

  it('should not translate title when pageLayoutType is RECORD_INDEX', () => {
    mockGenerateMessageId.mockReturnValue('abc123');
    mockI18n._.mockReturnValue('Champs');

    const result = resolvePageLayoutWidgetTitle({
      title: 'Fields',
      applicationId: TWENTY_STANDARD_APPLICATION.universalIdentifier,
      pageLayoutType: PageLayoutType.RECORD_INDEX,
      i18nInstance: mockI18n,
    });

    expect(mockGenerateMessageId).not.toHaveBeenCalled();
    expect(mockI18n._).not.toHaveBeenCalled();
    expect(result).toBe('Fields');
  });
});
