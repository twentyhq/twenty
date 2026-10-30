import { type Monaco } from '@monaco-editor/react';
import { type editor } from 'monaco-editor';
import { type Dispatch, type SetStateAction, useEffect } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

type CodeEditorLifecycleEffectProps = {
  editor: editor.IStandaloneCodeEditor | undefined;
  setEditor: Dispatch<SetStateAction<editor.IStandaloneCodeEditor | undefined>>;
  setMonaco: Dispatch<SetStateAction<Monaco | undefined>>;
  setIsEditorFocused: Dispatch<SetStateAction<boolean>>;
};

export const CodeEditorLifecycleEffect = ({
  editor,
  setEditor,
  setMonaco,
  setIsEditorFocused,
}: CodeEditorLifecycleEffectProps) => {
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
  }, [editor, setEditor, setMonaco, setIsEditorFocused]);

  return null;
};
