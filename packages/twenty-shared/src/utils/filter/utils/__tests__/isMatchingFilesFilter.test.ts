import { isMatchingFilesFilter } from '@/utils/filter/utils/isMatchingFilesFilter';

describe('isMatchingFilesFilter', () => {
  describe('is filter', () => {
    it('should return true when checking for NULL and value is null', () => {
      expect(
        isMatchingFilesFilter({
          filesFilter: { is: 'NULL' },
          value: null,
        }),
      ).toBe(true);
    });

    it('should return true when checking for NULL and value is empty array', () => {
      expect(
        isMatchingFilesFilter({
          filesFilter: { is: 'NULL' },
          value: [],
        }),
      ).toBe(true);
    });

    it('should return false when checking for NULL and value has files', () => {
      expect(
        isMatchingFilesFilter({
          filesFilter: { is: 'NULL' },
          value: [
            {
              fileId: '1',
              label: 'file.pdf',
              url: 'http://example.com/file.pdf',
              extension: 'pdf',
            },
          ],
        }),
      ).toBe(false);
    });

    it('should return true when checking for NOT_NULL and value has files', () => {
      expect(
        isMatchingFilesFilter({
          filesFilter: { is: 'NOT_NULL' },
          value: [
            {
              fileId: '1',
              label: 'file.pdf',
              url: 'http://example.com/file.pdf',
              extension: 'pdf',
            },
          ],
        }),
      ).toBe(true);
    });

    it('should return false when checking for NOT_NULL and value is null', () => {
      expect(
        isMatchingFilesFilter({
          filesFilter: { is: 'NOT_NULL' },
          value: null,
        }),
      ).toBe(false);
    });

    it('should return false when checking for NOT_NULL and value is empty array', () => {
      expect(
        isMatchingFilesFilter({
          filesFilter: { is: 'NOT_NULL' },
          value: [],
        }),
      ).toBe(false);
    });
  });

  describe('like filter', () => {
    it('should match files when like pattern matches JSON representation', () => {
      expect(
        isMatchingFilesFilter({
          filesFilter: { like: '%file.pdf%' },
          value: [
            {
              fileId: '1',
              label: 'file.pdf',
              url: 'http://example.com/file.pdf',
              extension: 'pdf',
            },
          ],
        }),
      ).toBe(true);
    });

    it('should not match when like pattern does not match', () => {
      expect(
        isMatchingFilesFilter({
          filesFilter: { like: '%document.docx%' },
          value: [
            {
              fileId: '1',
              label: 'file.pdf',
              url: 'http://example.com/file.pdf',
              extension: 'pdf',
            },
          ],
        }),
      ).toBe(false);
    });

    it('should be case insensitive', () => {
      expect(
        isMatchingFilesFilter({
          filesFilter: { like: '%FILE.PDF%' },
          value: [
            {
              fileId: '1',
              label: 'file.pdf',
              url: 'http://example.com/file.pdf',
              extension: 'pdf',
            },
          ],
        }),
      ).toBe(true);
    });

    it('should match partial file names', () => {
      expect(
        isMatchingFilesFilter({
          filesFilter: { like: '%myfile%' },
          value: [
            {
              fileId: '1',
              label: 'myfile.pdf',
              url: 'http://example.com/myfile.pdf',
              extension: 'pdf',
            },
          ],
        }),
      ).toBe(true);
    });

    it('should match when any file in array matches', () => {
      expect(
        isMatchingFilesFilter({
          filesFilter: { like: '%report%' },
          value: [
            {
              fileId: '1',
              label: 'invoice.pdf',
              url: 'http://example.com/invoice.pdf',
              extension: 'pdf',
            },
            {
              fileId: '2',
              label: 'annual_report.pdf',
              url: 'http://example.com/report.pdf',
              extension: 'pdf',
            },
          ],
        }),
      ).toBe(true);
    });

    it('should match by file extension', () => {
      expect(
        isMatchingFilesFilter({
          filesFilter: { like: '%pdf%' },
          value: [
            {
              fileId: '1',
              label: 'document',
              url: 'http://example.com/doc.pdf',
              extension: 'pdf',
            },
          ],
        }),
      ).toBe(true);
    });

    it('should match by URL', () => {
      expect(
        isMatchingFilesFilter({
          filesFilter: { like: '%example.com%' },
          value: [
            {
              fileId: '1',
              label: 'file.pdf',
              url: 'http://example.com/file.pdf',
              extension: 'pdf',
            },
          ],
        }),
      ).toBe(true);
    });

    it('should match by fileId', () => {
      expect(
        isMatchingFilesFilter({
          filesFilter: { like: '%file-123%' },
          value: [
            {
              fileId: 'file-123',
              label: 'document.pdf',
              url: 'http://example.com/doc.pdf',
              extension: 'pdf',
            },
          ],
        }),
      ).toBe(true);
    });

    it('should not match when value is null', () => {
      expect(
        isMatchingFilesFilter({
          filesFilter: { like: '%file%' },
          value: null,
        }),
      ).toBe(false);
    });

    it('should not match when value is empty array', () => {
      expect(
        isMatchingFilesFilter({
          filesFilter: { like: '%file%' },
          value: [],
        }),
      ).toBe(false);
    });
  });
});
