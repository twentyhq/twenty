import { computeRichTextFieldFileChanges } from 'src/engine/twenty-orm/field-operations/rich-text-field-file-sync/utils/compute-rich-text-field-file-changes.util';

describe('computeRichTextFieldFileChanges', () => {
  it('should claim the referenced files the record does not own yet', () => {
    expect(
      computeRichTextFieldFileChanges({
        ownedFileIds: ['owned'],
        referencedFileIds: ['owned', 'uploaded'],
      }).fileIdsToClaim,
    ).toEqual(['uploaded']);
  });

  it('should restore the owned files the document references', () => {
    expect(
      computeRichTextFieldFileChanges({
        ownedFileIds: ['owned', 'removed'],
        referencedFileIds: ['owned'],
      }).fileIdsToRestore,
    ).toEqual(['owned']);
  });

  it('should release the owned files the document no longer references', () => {
    expect(
      computeRichTextFieldFileChanges({
        ownedFileIds: ['owned', 'removed'],
        referencedFileIds: ['owned'],
      }).fileIdsToRelease,
    ).toEqual(['removed']);
  });
});
