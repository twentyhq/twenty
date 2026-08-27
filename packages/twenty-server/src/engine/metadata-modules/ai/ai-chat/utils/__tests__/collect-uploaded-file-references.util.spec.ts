import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { collectUploadedFileReferences } from 'src/engine/metadata-modules/ai/ai-chat/utils/collect-uploaded-file-references.util';

describe('collectUploadedFileReferences', () => {
  const buildFilePart = (fileId: string, filename?: string) => ({
    type: 'file' as const,
    mediaType: 'application/pdf',
    filename,
    url: 'https://example.com/file',
    fileId,
  });

  it('should collect file parts from user messages across the thread', () => {
    const messages = [
      {
        id: '1',
        role: 'user',
        parts: [
          { type: 'text', text: 'here is a file' },
          buildFilePart('file-1', 'contract.pdf'),
        ],
      },
      {
        id: '2',
        role: 'assistant',
        parts: [{ type: 'text', text: 'thanks' }],
      },
      {
        id: '3',
        role: 'user',
        parts: [buildFilePart('file-2', 'data.csv')],
      },
    ] as unknown as ExtendedUIMessage[];

    expect(collectUploadedFileReferences(messages)).toEqual([
      { filename: 'contract.pdf', fileId: 'file-1' },
      { filename: 'data.csv', fileId: 'file-2' },
    ]);
  });

  it('should deduplicate by fileId and default missing filenames', () => {
    const messages = [
      {
        id: '1',
        role: 'user',
        parts: [buildFilePart('file-1'), buildFilePart('file-1')],
      },
    ] as unknown as ExtendedUIMessage[];

    expect(collectUploadedFileReferences(messages)).toEqual([
      { filename: 'uploaded_file', fileId: 'file-1' },
    ]);
  });

  it('should ignore file parts on assistant messages', () => {
    const messages = [
      {
        id: '1',
        role: 'assistant',
        parts: [buildFilePart('file-1', 'generated.pdf')],
      },
    ] as unknown as ExtendedUIMessage[];

    expect(collectUploadedFileReferences(messages)).toEqual([]);
  });
});
