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

To store an uploaded file on a record, call \`prepare_uploaded_file\` first, then use the fieldValue it returns when creating or updating the record. A record cannot reference an uploaded fileId directly. For example, to attach a document to a person: call \`prepare_uploaded_file\` for the \`file\` field of the \`attachment\` object, then create an \`attachment\` record with that fieldValue and \`targetPersonId\`.`,
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
