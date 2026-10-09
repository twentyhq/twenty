import { computeMessageImportProgress } from 'src/engine/metadata-modules/message-channel/utils/compute-message-import-progress.util';

describe('computeMessageImportProgress', () => {
  it('has no progress before a total is known', () => {
    expect(
      computeMessageImportProgress({
        importedMessagesCount: 50,
        totalMessagesToImportCount: undefined,
      }),
    ).toBeNull();
  });

  it('has no progress when there is nothing to import', () => {
    expect(
      computeMessageImportProgress({
        importedMessagesCount: 0,
        totalMessagesToImportCount: 0,
      }),
    ).toBeNull();
  });

  it('starts at zero before the first batch is saved', () => {
    expect(
      computeMessageImportProgress({
        importedMessagesCount: undefined,
        totalMessagesToImportCount: 445,
      }),
    ).toBe(0);
  });

  it('rounds down so an unfinished import never shows 100', () => {
    expect(
      computeMessageImportProgress({
        importedMessagesCount: 444,
        totalMessagesToImportCount: 445,
      }),
    ).toBe(99);
  });

  it('caps at 100 when more messages were imported than counted', () => {
    expect(
      computeMessageImportProgress({
        importedMessagesCount: 460,
        totalMessagesToImportCount: 445,
      }),
    ).toBe(100);
  });
});
