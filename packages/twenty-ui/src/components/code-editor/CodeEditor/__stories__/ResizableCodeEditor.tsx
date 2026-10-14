import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';

import { CodeEditor } from '../CodeEditor';
import { type CodeEditorProps } from '../types/CodeEditorProps';

export const ResizableCodeEditor = (props: CodeEditorProps) => {
  const [height, setHeight] = useState(props.height);

  return (
    <>
      <div style={{ height: 220, width: '100%' }}>
        <CodeEditor {...props} height={height} />
      </div>
      <Button onClick={() => setHeight(240)}>Set height to 240</Button>
    </>
  );
};
