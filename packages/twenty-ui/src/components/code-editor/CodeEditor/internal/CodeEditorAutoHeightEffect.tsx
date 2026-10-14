import { type editor } from 'monaco-editor';
import { type Dispatch, type SetStateAction, useEffect } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

type CodeEditorAutoHeightEffectProps = {
  shouldAutoHeight: boolean;
  editor: editor.IStandaloneCodeEditor | undefined;
  setContentHeight: Dispatch<SetStateAction<number | undefined>>;
};

export const CodeEditorAutoHeightEffect = ({
  shouldAutoHeight,
  editor,
  setContentHeight,
}: CodeEditorAutoHeightEffectProps) => {
  useEffect(() => {
    if (!shouldAutoHeight || !isDefined(editor)) {
      setContentHeight(undefined);
      return;
    }

    const updateContentHeight = () => {
      const nextHeight = editor.getContentHeight();

      if (!Number.isFinite(nextHeight) || nextHeight <= 0) {
        return;
      }

      setContentHeight(nextHeight);
    };

    updateContentHeight();

    const subscription = editor.onDidContentSizeChange(updateContentHeight);

    return () => subscription.dispose();
  }, [editor, shouldAutoHeight, setContentHeight]);

  return null;
};
