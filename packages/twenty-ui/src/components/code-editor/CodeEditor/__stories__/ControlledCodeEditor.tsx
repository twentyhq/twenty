import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { CodeEditor } from '../CodeEditor';
import { type CodeEditorProps } from '../types/CodeEditorProps';

export const ControlledCodeEditor = (props: CodeEditorProps) => {
  const [value, setValue] = useState('Initial controlled value');
  const [language, setLanguage] = useState('plaintext');
  const [options, setOptions] = useState(props.options);

  const handleChange: NonNullable<CodeEditorProps['onChange']> = (
    ...change
  ) => {
    const [nextValue] = change;

    if (isDefined(nextValue)) {
      setValue(nextValue);
    }

    props.onChange?.(...change);
  };

  return (
    <>
      <CodeEditor
        {...props}
        value={value}
        onChange={handleChange}
        language={language}
        options={options}
      />
      <Button
        onClick={() => setValue((currentValue) => `${currentValue} (updated)`)}
      >
        Append controlled value
      </Button>
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
