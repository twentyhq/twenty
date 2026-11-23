import { computeRichTextFieldWrittenDocuments } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/utils/compute-rich-text-field-written-documents.util';

const RICH_TEXT_FIELDS = [
  { name: 'body', universalIdentifier: 'body-universal-identifier' },
  { name: 'summary', universalIdentifier: 'summary-universal-identifier' },
];

const FIRST_FILE_ID = '0e4f6c34-5d0e-4d5c-9d0a-3f0a7b1f5a01';
const SECOND_FILE_ID = '0e4f6c34-5d0e-4d5c-9d0a-3f0a7b1f5a02';

const buildRichTextValue = (fileIds: string[]) => ({
  tiptap: JSON.stringify({
    type: 'doc',
    content: fileIds.map((fileId) => ({
      type: 'image',
      attrs: { src: `http://localhost:3000/file/files-field/${fileId}` },
    })),
  }),
});

describe('computeRichTextFieldWrittenDocuments', () => {
  it('should list every referenced file as added when the record is new', () => {
    expect(
      computeRichTextFieldWrittenDocuments({
        payload: { body: buildRichTextValue([FIRST_FILE_ID, SECOND_FILE_ID]) },
        recordBeforeWrite: undefined,
        richTextFields: RICH_TEXT_FIELDS,
      }),
    ).toEqual([
      {
        fieldName: 'body',
        fieldUniversalIdentifier: 'body-universal-identifier',
        referencedFileIds: [FIRST_FILE_ID, SECOND_FILE_ID],
        addedFileIds: [FIRST_FILE_ID, SECOND_FILE_ID],
        removedFileIds: [],
      },
    ]);
  });

  it('should list only the files whose reference changed', () => {
    expect(
      computeRichTextFieldWrittenDocuments({
        payload: { body: buildRichTextValue([SECOND_FILE_ID]) },
        recordBeforeWrite: { body: buildRichTextValue([FIRST_FILE_ID]) },
        richTextFields: RICH_TEXT_FIELDS,
      }),
    ).toEqual([
      {
        fieldName: 'body',
        fieldUniversalIdentifier: 'body-universal-identifier',
        referencedFileIds: [SECOND_FILE_ID],
        addedFileIds: [SECOND_FILE_ID],
        removedFileIds: [FIRST_FILE_ID],
      },
    ]);
  });

  it('should still list the referenced files of a save that keeps the same files', () => {
    expect(
      computeRichTextFieldWrittenDocuments({
        payload: { body: buildRichTextValue([FIRST_FILE_ID]) },
        recordBeforeWrite: { body: buildRichTextValue([FIRST_FILE_ID]) },
        richTextFields: RICH_TEXT_FIELDS,
      }),
    ).toEqual([
      {
        fieldName: 'body',
        fieldUniversalIdentifier: 'body-universal-identifier',
        referencedFileIds: [FIRST_FILE_ID],
        addedFileIds: [],
        removedFileIds: [],
      },
    ]);
  });

  it('should return nothing for a document that references no file and drops none', () => {
    expect(
      computeRichTextFieldWrittenDocuments({
        payload: { body: buildRichTextValue([]) },
        recordBeforeWrite: { body: buildRichTextValue([]) },
        richTextFields: RICH_TEXT_FIELDS,
      }),
    ).toEqual([]);
  });

  it('should treat a cleared field as a document referencing no file', () => {
    expect(
      computeRichTextFieldWrittenDocuments({
        payload: { summary: null },
        recordBeforeWrite: { summary: buildRichTextValue([FIRST_FILE_ID]) },
        richTextFields: RICH_TEXT_FIELDS,
      }),
    ).toEqual([
      {
        fieldName: 'summary',
        fieldUniversalIdentifier: 'summary-universal-identifier',
        referencedFileIds: [],
        addedFileIds: [],
        removedFileIds: [FIRST_FILE_ID],
      },
    ]);
  });

  it('should ignore a write that leaves the stored TipTap document alone', () => {
    expect(
      computeRichTextFieldWrittenDocuments({
        payload: { name: 'Meeting', body: { markdown: 'Notes' } },
        recordBeforeWrite: { body: buildRichTextValue([FIRST_FILE_ID]) },
        richTextFields: RICH_TEXT_FIELDS,
      }),
    ).toEqual([]);
  });
});
