export type RichTextFieldFileReferenceChange = {
  recordIndex: number;
  recordId: string | undefined;
  fieldUniversalIdentifier: string;
  addedFileIds: string[];
  removedFileIds: string[];
};
