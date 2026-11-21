import { computeRichTextFieldWrittenDocuments } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/utils/compute-rich-text-field-written-documents.util';

const RICH_TEXT_FIELDS = [
  { name: 'body', universalIdentifier: 'body-universal-identifier' },
  { name: 'summary', universalIdentifier: 'summary-universal-identifier' },
];

const buildTipTapDocument = (fileIds: string[]) =>
  JSON.stringify({
    type: 'doc',
    content: fileIds.map((fileId) => ({
      type: 'image',
      attrs: { src: `http://localhost:3000/file/files-field/${fileId}` },
    })),
  });

describe('computeRichTextFieldWrittenDocuments', () => {
  it('should list the files each rewritten document references', () => {
    expect(
      computeRichTextFieldWrittenDocuments({
        payload: {
          body: {
            tiptap: buildTipTapDocument([
              '0e4f6c34-5d0e-4d5c-9d0a-3f0a7b1f5a01',
              '0e4f6c34-5d0e-4d5c-9d0a-3f0a7b1f5a02',
            ]),
          },
        },
        richTextFields: RICH_TEXT_FIELDS,
      }),
    ).toEqual([
      {
        fieldName: 'body',
        fieldUniversalIdentifier: 'body-universal-identifier',
        referencedFileIds: [
          '0e4f6c34-5d0e-4d5c-9d0a-3f0a7b1f5a01',
          '0e4f6c34-5d0e-4d5c-9d0a-3f0a7b1f5a02',
        ],
      },
    ]);
  });

  it('should treat a cleared field as a document referencing no file', () => {
    expect(
      computeRichTextFieldWrittenDocuments({
        payload: { summary: null },
        richTextFields: RICH_TEXT_FIELDS,
      }),
    ).toEqual([
      {
        fieldName: 'summary',
        fieldUniversalIdentifier: 'summary-universal-identifier',
        referencedFileIds: [],
      },
    ]);
  });

  it('should ignore a write that leaves the stored TipTap document alone', () => {
    expect(
      computeRichTextFieldWrittenDocuments({
        payload: { name: 'Meeting', body: { markdown: 'Notes' } },
        richTextFields: RICH_TEXT_FIELDS,
      }),
    ).toEqual([]);
  });
});
