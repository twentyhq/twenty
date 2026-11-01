import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';

import { CodeEditor } from '../CodeEditor';
import { type CodeEditorProps } from '../types/CodeEditorProps';

export const UnmountingCodeEditor = (props: CodeEditorProps) => {
  const [isEditorMounted, setIsEditorMounted] = useState(true);

  return (
    <>
      {isEditorMounted && <CodeEditor {...props} />}
      <Button onClick={() => setIsEditorMounted(false)}>Unmount editor</Button>
    </>
  );
};
