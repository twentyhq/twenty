import { formatUnsupportedFilePlaceholder } from 'src/engine/metadata-modules/ai/ai-models/utils/format-unsupported-file-placeholder.util';

describe('formatUnsupportedFilePlaceholder', () => {
  it('names the file and its type', () => {
    expect(
      formatUnsupportedFilePlaceholder({
        filename: 'report.pdf',
        mediaType: 'application/pdf',
      }),
    ).toBe(
      '[Attached file: report.pdf (type: application/pdf) — file type is not supported for direct analysis]',
    );
  });

  it('falls back to a generic name when the file carries none', () => {
    expect(
      formatUnsupportedFilePlaceholder({
        filename: undefined,
        mediaType: 'application/pdf',
      }),
    ).toBe(
      '[Attached file: uploaded_file (type: application/pdf) — file type is not supported for direct analysis]',
    );
  });

  it('labels a missing media type as unknown', () => {
    expect(
      formatUnsupportedFilePlaceholder({
        filename: 'mystery.bin',
        mediaType: '',
      }),
    ).toBe(
      '[Attached file: mystery.bin (type: unknown) — file type is not supported for direct analysis]',
    );
  });
});
