export const buildUploadedFilesSection = (
  storedFiles: Array<{ filename: string; fileId: string }>,
): string => {
  const fileList = storedFiles.map((f) => `- ${f.filename}`).join('\n');

  const filesJson = JSON.stringify(
    storedFiles.map((f) => ({ filename: f.filename, fileId: f.fileId })),
  );

  return `
## Uploaded Files

The user has uploaded the following files:
${fileList}

**IMPORTANT**: Use the \`code_interpreter\` tool to analyze these files.
When calling code_interpreter, include the files parameter with these values (use fileId to reference uploaded files):
\`\`\`json
${filesJson}
\`\`\`

In your Python code, access files at \`/home/user/{filename}\`.`;
};
