import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';

import { CodeEditor } from '../CodeEditor';
import { type CodeEditorProps } from '../types/CodeEditorProps';

export const ThemedCodeEditor = (props: CodeEditorProps) => {
  const [themeSource, setThemeSource] = useState<
    'explicit' | 'options' | 'default'
  >('explicit');

  return (
    <>
      <CodeEditor
        {...props}
        theme={themeSource === 'explicit' ? props.theme : undefined}
        options={{
          ...props.options,
          theme: themeSource === 'default' ? undefined : props.options?.theme,
        }}
      />
      <Button onClick={() => setThemeSource('options')}>
        Use option theme
      </Button>
      <Button onClick={() => setThemeSource('default')}>
        Use Twenty theme
      </Button>
    </>
  );
};
