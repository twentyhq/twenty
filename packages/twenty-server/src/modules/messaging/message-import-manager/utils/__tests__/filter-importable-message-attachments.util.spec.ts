import { filterImportableMessageAttachments } from 'src/modules/messaging/message-import-manager/utils/filter-importable-message-attachments.util';

describe('filterImportableMessageAttachments', () => {
  it('should keep regular file attachments, including inline documents', () => {
    const attachments = [
      {
        filename: 'Q3 forecast.xlsx',
        size: 48213,
        contentType:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        isInline: false,
        externalId: '1',
      },
      {
        filename: 'contract.pdf',
        size: 182044,
        contentType: 'application/pdf',
        isInline: true,
        externalId: '2',
      },
      {
        filename: 'site-photo.jpg',
        size: 912384,
        contentType: 'image/jpeg',
        isInline: false,
        externalId: '1',
      },
    ];

    expect(filterImportableMessageAttachments(attachments)).toEqual(
      attachments,
    );
  });

  it('should drop calendar invites by extension or content type', () => {
    expect(
      filterImportableMessageAttachments([
        {
          filename: 'invite.ICS',
          size: 2310,
          contentType: 'application/octet-stream',
          isInline: false,
          externalId: '1',
        },
        {
          filename: 'meeting',
          size: 1840,
          contentType: 'text/calendar; method=REQUEST; charset=UTF-8',
          isInline: false,
          externalId: '1',
        },
      ]),
    ).toEqual([]);
  });

  it('should drop Outlook TNEF containers by name or content type', () => {
    expect(
      filterImportableMessageAttachments([
        {
          filename: 'winmail.dat',
          size: 30412,
          contentType: 'application/octet-stream',
          isInline: false,
          externalId: '1',
        },
        {
          filename: 'unnamed-attachment',
          size: 30412,
          contentType: 'application/ms-tnef',
          isInline: false,
          externalId: '1',
        },
      ]),
    ).toEqual([]);
  });

  it('should drop inline images such as signature logos', () => {
    expect(
      filterImportableMessageAttachments([
        {
          filename: 'image001.png',
          size: 6042,
          contentType: 'image/png',
          isInline: true,
          externalId: '2',
        },
        {
          filename: 'report.pdf',
          size: 74213,
          contentType: 'application/pdf',
          isInline: false,
          externalId: '1',
        },
      ]).map(({ filename }) => filename),
    ).toEqual(['report.pdf']);
  });
});
