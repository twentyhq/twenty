import { atom, useAtom, type PrimitiveAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

const CODE_EDITOR_RESIZE_MIN_HEIGHT = 50;
const CODE_EDITOR_RESIZE_MAX_HEIGHT = 500;

const heightAtomCache = new Map<string, PrimitiveAtom<number>>();

const getHeightAtom = ({
  key,
  defaultHeight,
}: {
  key: string;
  defaultHeight: number;
}): PrimitiveAtom<number> => {
  const existing = heightAtomCache.get(key);

  if (isDefined(existing)) {
    return existing;
  }

  const heightAtom = atom(defaultHeight);
  heightAtom.debugLabel = `resizableEditorHeight__${key}`;
  heightAtomCache.set(key, heightAtom);
  return heightAtom;
};

export const useResizableEditor = ({
  initialHeight,
  componentInstanceId,
}: {
  initialHeight: number;
  componentInstanceId: string;
}) => {
  const heightAtom = getHeightAtom({
    key: componentInstanceId,
    defaultHeight: initialHeight,
  });

  const [height, setHeight] = useAtom(heightAtom);

  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartY, setResizeStartY] = useState(0);
  const [resizeStartHeight, setResizeStartHeight] = useState(0);

  useEffect(() => {
    if (!isResizing) {
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      const delta = event.clientY - resizeStartY;
      const newHeight = Math.min(
        CODE_EDITOR_RESIZE_MAX_HEIGHT,
        Math.max(CODE_EDITOR_RESIZE_MIN_HEIGHT, resizeStartHeight + delta),
      );
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeStartY, resizeStartHeight, setHeight]);

  const handleResizeStart = (event: React.MouseEvent) => {
    setResizeStartY(event.clientY);
    setResizeStartHeight(height);
    setIsResizing(true);
  };

  return {
    height,
    isResizing,
    handleResizeStart,
  };
};
