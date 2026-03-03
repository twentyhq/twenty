import { useEffect, useState } from 'react';

const CODE_EDITOR_RESIZE_MIN_HEIGHT = 50;
const CODE_EDITOR_RESIZE_MAX_HEIGHT = 500;

export const useResizableEditor = ({
  initialHeight,
  onHeightChange,
}: {
  initialHeight: number;
  onHeightChange?: (height: number) => void;
}) => {
  const [currentHeight, setCurrentHeight] = useState(initialHeight);
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
      setCurrentHeight(newHeight);
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
  }, [isResizing, resizeStartY, resizeStartHeight]);

  useEffect(() => {
    if (!isResizing) {
      return;
    }
    onHeightChange?.(currentHeight);
  }, [currentHeight, isResizing, onHeightChange]);

  const handleResizeStart = (event: React.MouseEvent) => {
    setResizeStartY(event.clientY);
    setResizeStartHeight(currentHeight);
    setIsResizing(true);
  };

  return {
    currentHeight,
    isResizing,
    handleResizeStart,
  };
};
