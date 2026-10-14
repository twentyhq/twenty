export const getCurrentCodeEditorHeight = ({
  height,
  resizableHeight,
  contentHeight,
  shouldUseResizableHeight,
  shouldAutoHeight,
}: {
  height: number | string;
  resizableHeight: number;
  contentHeight: number | undefined;
  shouldUseResizableHeight: boolean;
  shouldAutoHeight: boolean;
}) => {
  if (shouldUseResizableHeight) {
    return resizableHeight;
  }

  if (shouldAutoHeight) {
    return contentHeight ?? height;
  }

  return height;
};
