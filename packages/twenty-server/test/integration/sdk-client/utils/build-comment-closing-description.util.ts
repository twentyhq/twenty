// Descriptions are rendered as JSDoc either above a top-level type or above an
// interface member, so the payload has to be valid code in that position for
// the generated client to keep compiling.
export const buildCommentClosingDescription = ({
  canaryPath,
  position,
}: {
  canaryPath: string;
  position: 'type' | 'member';
}) => {
  const textImport = `import(${JSON.stringify(canaryPath)},{with:{type:"text"}})`;

  return position === 'type'
    ? `*/${textImport}/*`
    : `*/};${textImport};interface Pad{/*`;
};
