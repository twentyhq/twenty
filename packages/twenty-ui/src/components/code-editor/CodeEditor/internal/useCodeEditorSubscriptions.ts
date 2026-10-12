import { type Monaco } from '@monaco-editor/react';
import { type editor } from 'monaco-editor';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

import { type CodeEditorProps } from '../types/CodeEditorProps';

export const useCodeEditorSubscriptions = ({
  editor,
  monaco,
  setMarkers,
  setEditor,
  setMonaco,
}: {
  editor: editor.IStandaloneCodeEditor | undefined;
  monaco: Monaco | undefined;
  setMarkers: CodeEditorProps['setMarkers'];
  setEditor: Dispatch<SetStateAction<editor.IStandaloneCodeEditor | undefined>>;
  setMonaco: Dispatch<SetStateAction<Monaco | undefined>>;
}) => {
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  useEffect(() => {
    if (!isDefined(editor)) {
      setIsEditorFocused(false);
      return;
    }

    setIsEditorFocused(editor.hasWidgetFocus());

    const subscriptions = [
      editor.onDidFocusEditorWidget(() => setIsEditorFocused(true)),
      editor.onDidBlurEditorWidget(() => setIsEditorFocused(false)),
      editor.onDidDispose(() => {
        setEditor(undefined);
        setMonaco(undefined);
      }),
    ];

    return () => {
      for (const subscription of subscriptions) {
        subscription.dispose();
      }
    };
  }, [editor, setEditor, setMonaco]);

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

  return isEditorFocused;
};
