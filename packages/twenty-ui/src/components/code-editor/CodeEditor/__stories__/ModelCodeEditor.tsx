import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';

import { CodeEditor } from '../CodeEditor';
import { type CodeEditorProps } from '../types/CodeEditorProps';

const NOTES_MODEL_PATH = 'file:///code-editor-model-notes.txt';
const QUERY_MODEL_PATH = 'file:///code-editor-model-query.ts';
const NOTES_MODEL_VALUE = 'Workspace notes\nSeats: 12\nPlan: Pro';
const QUERY_MODEL_VALUE = 'export const seats = 12;';

export const ModelCodeEditor = (props: CodeEditorProps) => {
  const [isQueryModelSelected, setIsQueryModelSelected] = useState(false);

  return (
    <>
      <CodeEditor
        {...props}
        value={undefined}
        language={undefined}
        path={isQueryModelSelected ? QUERY_MODEL_PATH : NOTES_MODEL_PATH}
        defaultLanguage={isQueryModelSelected ? 'typescript' : 'plaintext'}
        defaultValue={
          isQueryModelSelected ? QUERY_MODEL_VALUE : NOTES_MODEL_VALUE
        }
      />
      <Button onClick={() => setIsQueryModelSelected(true)}>
        Open query.ts
      </Button>
      <Button onClick={() => setIsQueryModelSelected(false)}>
        Open notes.txt
      </Button>
    </>
  );
};
