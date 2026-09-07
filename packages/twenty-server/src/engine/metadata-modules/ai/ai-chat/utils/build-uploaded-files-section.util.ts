import { isNonEmptyArray } from 'twenty-shared/utils';

import { type UploadedFileReference } from 'src/engine/metadata-modules/ai/ai-chat/types/uploaded-file-reference.type';

export const buildUploadedFilesSection = ({
  uploadedFiles,
  codeInterpreterFiles,
}: {
  uploadedFiles: UploadedFileReference[];
  codeInterpreterFiles: UploadedFileReference[];
}): string => {
  const uploadedFilesJson = JSON.stringify(
    uploadedFiles.map((f) => ({ filename: f.filename, fileId: f.fileId })),
  );

  const sectionParts = [
    `
## Uploaded Files

The user has uploaded the following files in this conversation:
\`\`\`json
${uploadedFilesJson}
\`\`\`

To store an uploaded file on a record, put it directly in a files-type field value when creating or updating a single record: set the field to an array of \`{ "fileId": "<uploaded fileId>", "label": "<filename>" }\` entries. For example, to attach a document to a person, create an \`attachment\` record with \`file\` set that way and \`targetPersonId\` set. The file is copied automatically and the stored record references the copy's fileId. When updating an existing record, append the new entry to the field's current value: files missing from the new value are detached from the record.`,
  ];

  if (isNonEmptyArray(codeInterpreterFiles)) {
    const codeInterpreterFilesJson = JSON.stringify(
      codeInterpreterFiles.map((f) => ({
        filename: f.filename,
        fileId: f.fileId,
      })),
    );

    sectionParts.push(`
**IMPORTANT**: Use the \`code_interpreter\` tool to analyze these files:
\`\`\`json
${codeInterpreterFilesJson}
\`\`\`

When calling code_interpreter, include the files parameter with these values (use fileId to reference uploaded files).
In your Python code, access files at \`/home/user/{filename}\`. Other uploaded files are not available in the sandbox.`);
  }

  return sectionParts.join('\n');
};
