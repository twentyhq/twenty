import { resolveMessageAttachmentMimeType } from 'src/modules/messaging/message-import-manager/utils/resolve-message-attachment-mime-type.util';

describe('resolveMessageAttachmentMimeType', () => {
  it('should keep the provider type without its parameters or casing', () => {
    expect(
      resolveMessageAttachmentMimeType({
        contentType: 'Text/CSV; charset="utf-8"; name="export.dat"',
        filename: 'export.dat',
      }),
    ).toBe('text/csv');
  });

  it('should prefer the provider type over the file extension', () => {
    expect(
      resolveMessageAttachmentMimeType({
        contentType: 'text/plain',
        filename: 'report.pdf',
      }),
    ).toBe('text/plain');
  });

  it('should use the file extension when the provider sends no type', () => {
    expect(
      resolveMessageAttachmentMimeType({
        contentType: '',
        filename: 'report.pdf',
      }),
    ).toBe('application/pdf');
  });

  it('should use the file extension when the provider sends the generic type', () => {
    expect(
      resolveMessageAttachmentMimeType({
        contentType: 'application/octet-stream; name="report.pdf"',
        filename: 'report.pdf',
      }),
    ).toBe('application/pdf');
  });

  it('should fall back to the generic type for an unknown extension', () => {
    expect(
      resolveMessageAttachmentMimeType({
        contentType: '',
        filename: 'archive.unknownextension',
      }),
    ).toBe('application/octet-stream');
  });

  it('should fall back to the generic type when the extension is an object property name', () => {
    expect(
      resolveMessageAttachmentMimeType({
        contentType: '',
        filename: 'payload.constructor',
      }),
    ).toBe('application/octet-stream');
  });
});
