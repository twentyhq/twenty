import { extractMicrosoftFileAttachments } from 'src/modules/messaging/message-import-manager/drivers/microsoft/utils/extract-microsoft-file-attachments.util';

describe('extractMicrosoftFileAttachments', () => {
  it('should return an empty list when the message has no attachments', () => {
    expect(extractMicrosoftFileAttachments(undefined)).toEqual([]);
  });

  it('should map file attachments to metadata with their attachment id', () => {
    expect(
      extractMicrosoftFileAttachments([
        {
          '@odata.type': '#microsoft.graph.fileAttachment',
          id: 'AAMkAGI2THVSAAABEgAQAMwtBGCS1-1GkHyP4w8r4DY=',
          name: 'Quarterly report.pdf',
          contentType: 'application/pdf',
          size: 184320,
          isInline: false,
        },
      ]),
    ).toEqual([
      {
        filename: 'Quarterly report.pdf',
        size: 184320,
        contentType: 'application/pdf',
        isInline: false,
        externalId: 'AAMkAGI2THVSAAABEgAQAMwtBGCS1-1GkHyP4w8r4DY=',
      },
    ]);
  });

  it('should keep inline file attachments flagged and skip attached items and cloud links', () => {
    expect(
      extractMicrosoftFileAttachments([
        {
          '@odata.type': '#microsoft.graph.fileAttachment',
          id: 'inline-signature-logo',
          name: 'image001.png',
          contentType: 'image/png',
          size: 4096,
          isInline: true,
        },
        {
          '@odata.type': '#microsoft.graph.itemAttachment',
          id: 'forwarded-meeting',
          name: 'Kickoff meeting',
          size: 20480,
          isInline: false,
        },
        {
          '@odata.type': '#microsoft.graph.referenceAttachment',
          id: 'onedrive-link',
          name: 'Roadmap.docx',
          size: 0,
          isInline: false,
        },
      ]).map(({ filename, isInline }) => ({ filename, isInline })),
    ).toEqual([{ filename: 'image001.png', isInline: true }]);
  });
});
