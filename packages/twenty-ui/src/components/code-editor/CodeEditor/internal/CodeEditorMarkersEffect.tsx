import { type Monaco } from '@monaco-editor/react';
import { type editor } from 'monaco-editor';
import { useEffect } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type CodeEditorProps } from '../types/CodeEditorProps';

type CodeEditorMarkersEffectProps = {
  editor: editor.IStandaloneCodeEditor | undefined;
  monaco: Monaco | undefined;
  setMarkers: CodeEditorProps['setMarkers'];
};

export const CodeEditorMarkersEffect = ({
  editor,
  monaco,
  setMarkers,
}: CodeEditorMarkersEffectProps) => {
  useEffect(() => {
    if (!isDefined(editor) || !isDefined(monaco) || !isDefined(setMarkers)) {
      return;
    }

    const updateMarkers = () => {
      const model = editor.getModel();

      if (!isDefined(model)) {
        return;
      }

      monaco.editor.setModelMarkers(
        model,
        'customMarker',
        setMarkers(model.getValue()),
      );
    };

    updateMarkers();

    const subscriptions = [
      editor.onDidChangeModel(updateMarkers),
      editor.onDidChangeModelContent(updateMarkers),
    ];

    return () => {
      for (const subscription of subscriptions) {
        subscription.dispose();
      }
    };
  }, [editor, monaco, setMarkers]);

  return null;
};
