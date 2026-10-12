import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';

import { CodeEditor } from '../CodeEditor';
import { type CodeEditorProps } from '../types/CodeEditorProps';

export const ControlledCodeEditor = (props: CodeEditorProps) => {
  const [value, setValue] = useState('Initial controlled value');
  const [language, setLanguage] = useState('plaintext');
  const [options, setOptions] = useState(props.options);

  return (
    <>
      <CodeEditor
        {...props}
        value={value}
        language={language}
        options={options}
      />
      <Button
        onClick={() => {
          setValue('export const seats = 24;');
          setLanguage('typescript');
          setOptions({ ...props.options, padding: { top: 7, bottom: 21 } });
        }}
      >
        Replace controlled value
      </Button>
    </>
  );
};
