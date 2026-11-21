import { computeRichTextFieldFileReferenceChange } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/utils/compute-rich-text-field-file-reference-change.util';

const KEPT_FILE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const ADDED_FILE_ID = '20202020-9e3b-46d4-a556-88b9ddc2b034';
const REMOVED_FILE_ID = '20202020-3ec3-4fe3-8997-15f0b8a3d1c6';
const RECORD_ID = '20202020-a305-41e7-8c72-ba44072a4c58';

const buildRichTextValue = (fileIds: string[]) => ({
  tiptap: JSON.stringify({
    type: 'doc',
    content: fileIds.map((fileId) => ({
      type: 'image',
      attrs: { src: `https://app.twenty.com/file/files-field/${fileId}` },
    })),
  }),
  blocknote: null,
  markdown: null,
});

const computeChange = ({
  payload,
  recordBeforeWrite,
}: {
  payload: Record<string, unknown>;
  recordBeforeWrite: Record<string, unknown> | undefined;
}) =>
  computeRichTextFieldFileReferenceChange({
    recordIndex: 0,
    fieldName: 'brief',
    fieldUniversalIdentifier: 'brief-field',
    payload,
    recordBeforeWrite,
  });

describe('computeRichTextFieldFileReferenceChange', () => {
  it('should list the file ids a write adds to and removes from the body', () => {
    expect(
      computeChange({
        payload: { brief: buildRichTextValue([KEPT_FILE_ID, ADDED_FILE_ID]) },
        recordBeforeWrite: {
          id: RECORD_ID,
          brief: buildRichTextValue([KEPT_FILE_ID, REMOVED_FILE_ID]),
        },
      }),
    ).toEqual({
      recordIndex: 0,
      recordId: RECORD_ID,
      fieldUniversalIdentifier: 'brief-field',
      addedFileIds: [ADDED_FILE_ID],
      removedFileIds: [REMOVED_FILE_ID],
    });
  });

  it('should take the record id from the payload on insert', () => {
    expect(
      computeChange({
        payload: { id: RECORD_ID, brief: buildRichTextValue([ADDED_FILE_ID]) },
        recordBeforeWrite: undefined,
      }),
    ).toMatchObject({ recordId: RECORD_ID, addedFileIds: [ADDED_FILE_ID] });
  });

  it('should remove every file when the body is cleared', () => {
    expect(
      computeChange({
        payload: { brief: null },
        recordBeforeWrite: {
          id: RECORD_ID,
          brief: buildRichTextValue([REMOVED_FILE_ID]),
        },
      }),
    ).toMatchObject({ addedFileIds: [], removedFileIds: [REMOVED_FILE_ID] });
  });

  it('should return no change when the payload leaves the field out', () => {
    expect(
      computeChange({
        payload: { name: 'Quarterly review' },
        recordBeforeWrite: {
          id: RECORD_ID,
          brief: buildRichTextValue([KEPT_FILE_ID]),
        },
      }),
    ).toBeUndefined();
  });

  it('should return no change when the body references the same files', () => {
    expect(
      computeChange({
        payload: { brief: buildRichTextValue([KEPT_FILE_ID]) },
        recordBeforeWrite: {
          id: RECORD_ID,
          brief: buildRichTextValue([KEPT_FILE_ID]),
        },
      }),
    ).toBeUndefined();
  });
});
