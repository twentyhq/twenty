'use client';

import { styled } from '@linaria/react';
import {
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from 'react';

import {
  CARD_BG,
  CARD_FONT,
  CARD_TEXT,
  CARD_TEXT_SECONDARY,
  CARD_TEXT_TERTIARY,
} from './visual-tokens';

const Root = styled.div`
  background: ${CARD_BG};
  border: 1.5px dashed rgba(255, 255, 255, 0.12);
  border-radius: 0;
  display: flex;
  flex-direction: column;
  font-family: ${CARD_FONT};
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const Header = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: 12px 14px;
`;

const HeaderLeft = styled.div`
  align-items: center;
  display: flex;
  gap: 6px;
`;

const HeaderLabel = styled.span`
  color: ${CARD_TEXT};
  font-size: 12px;
  font-weight: 500;
`;

const HeaderCount = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  font-size: 12px;
`;

const AddButton = styled.span`
  color: ${CARD_TEXT_SECONDARY};
  font-size: 11px;
  font-weight: 500;
`;

const FileList = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;
  min-height: 0;
  padding: 0 10px;
`;

const FileRow = styled.div<{ $dragging?: boolean }>`
  align-items: center;
  border-radius: 6px;
  cursor: grab;
  display: flex;
  gap: 10px;
  opacity: ${({ $dragging }) => ($dragging ? 0.4 : 1)};
  padding: 6px 8px;
  touch-action: none;
  transition: background-color 0.1s ease;
  user-select: none;

  &:hover {
    background-color: rgba(255, 255, 255, 0.03);
  }

  &:active {
    cursor: grabbing;
  }
`;

const FileIcon = styled.div<{ $bg: string; $color: string }>`
  align-items: center;
  background: ${({ $bg }) => $bg};
  border-radius: 6px;
  color: ${({ $color }) => $color};
  display: flex;
  flex-shrink: 0;
  font-size: 8px;
  font-weight: 700;
  height: 28px;
  justify-content: center;
  letter-spacing: 0.02em;
  width: 28px;
`;

const FileName = styled.span`
  color: ${CARD_TEXT};
  flex: 1;
  font-size: 12px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const UploadArea = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
  justify-content: center;
  margin: auto 14px 14px;
  padding: 20px;

  &[data-over='true'] {
    background-color: rgba(59, 130, 246, 0.05);
  }
`;

const UploadIcon = styled.div`
  color: ${CARD_TEXT_TERTIARY};
  margin-bottom: 4px;
`;

const UploadTitle = styled.span`
  color: ${CARD_TEXT_SECONDARY};
  font-size: 11px;
  font-weight: 500;
`;

const UploadHint = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  font-size: 10px;
`;

const FloatingFile = styled.div`
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  z-index: 100;
`;

const FloatingFileInner = styled.div`
  align-items: center;
  background: #2a2a34;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  display: flex;
  gap: 10px;
  padding: 6px 12px;
`;

type FileData = {
  bg: string;
  color: string;
  ext: string;
  name: string;
};

const FILES: FileData[] = [
  {
    name: 'meeting_record.mp3',
    ext: 'MP3',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.15)',
  },
  {
    name: 'invoice2023_04_02(2).pdf',
    ext: 'PDF',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.15)',
  },
  {
    name: 'mapping01.xls',
    ext: 'XLS',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.15)',
  },
];

type FilesVisualProps = {
  active: boolean;
};

export function FilesVisual({ active: _active }: FilesVisualProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [fileOrder] = useState([0, 1, 2]);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const rootRef = useRef<HTMLDivElement>(null);
  const activePointerRef = useRef<number | null>(null);
  const dragStateRef = useRef<{
    fileIndex: number;
    originX: number;
    originY: number;
    pointerX: number;
    pointerY: number;
  } | null>(null);

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
    fileIndex: number,
  ) => {
    event.preventDefault();
    const rootRect = rootRef.current?.getBoundingClientRect();
    const rowRect = event.currentTarget.getBoundingClientRect();
    if (!rootRect || dragStateRef.current) return;

    dragStateRef.current = {
      fileIndex,
      originX: rowRect.left - rootRect.left,
      originY: rowRect.top - rootRect.top,
      pointerX: event.clientX,
      pointerY: event.clientY,
    };
    setDraggedIndex(fileIndex);
    setDragOffset({
      x: rowRect.left - rootRect.left,
      y: rowRect.top - rootRect.top,
    });
    activePointerRef.current = event.pointerId;
    rootRef.current?.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointerRef.current) return;
    event.preventDefault();
    const state = dragStateRef.current;
    if (!state) return;

    setDragOffset({
      x: state.originX + event.clientX - state.pointerX,
      y: state.originY + event.clientY - state.pointerY,
    });
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointerRef.current) return;
    event.preventDefault();
    dragStateRef.current = null;
    setDraggedIndex(null);
    activePointerRef.current = null;
    if (rootRef.current?.hasPointerCapture(event.pointerId)) {
      rootRef.current.releasePointerCapture(event.pointerId);
    }
  };

  const handlePointerCancel = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointerRef.current) return;
    dragStateRef.current = null;
    setDraggedIndex(null);
    activePointerRef.current = null;
    if (rootRef.current?.hasPointerCapture(event.pointerId)) {
      rootRef.current.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <Root
      ref={rootRef}
      onPointerCancel={handlePointerCancel}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <Header>
        <HeaderLeft>
          <HeaderLabel>All</HeaderLabel>
          <HeaderCount>{FILES.length}</HeaderCount>
        </HeaderLeft>
        <AddButton>+ Add file</AddButton>
      </Header>

      <FileList>
        {fileOrder.map((fileIdx) => {
          const file = FILES[fileIdx];
          return (
            <FileRow
              key={fileIdx}
              $dragging={draggedIndex === fileIdx}
              onPointerDown={(e) => handlePointerDown(e, fileIdx)}
            >
              <FileIcon $bg={file.bg} $color={file.color}>
                {file.ext}
              </FileIcon>
              <FileName>{file.name}</FileName>
            </FileRow>
          );
        })}
      </FileList>

      <UploadArea
        data-over={isDragOver}
        onDragEnter={() => setIsDragOver(true)}
        onDragLeave={() => setIsDragOver(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={() => setIsDragOver(false)}
      >
        <UploadIcon>
          <svg
            fill="none"
            height="20"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            viewBox="0 0 24 24"
            width="20"
          >
            <path d="M12 15V3m0 0l-4 4m4-4l4 4" />
            <path d="M2 17l.621 2.485A2 2 0 0 0 4.561 21h14.878a2 2 0 0 0 1.94-1.515L22 17" />
          </svg>
        </UploadIcon>
        <UploadTitle>Upload a file</UploadTitle>
        <UploadHint>Drag and Drop Here</UploadHint>
      </UploadArea>

      {draggedIndex !== null && (
        <FloatingFile
          style={{
            transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
          }}
        >
          <FloatingFileInner>
            <FileIcon
              $bg={FILES[draggedIndex].bg}
              $color={FILES[draggedIndex].color}
            >
              {FILES[draggedIndex].ext}
            </FileIcon>
            <FileName>{FILES[draggedIndex].name}</FileName>
          </FloatingFileInner>
        </FloatingFile>
      )}
    </Root>
  );
}
