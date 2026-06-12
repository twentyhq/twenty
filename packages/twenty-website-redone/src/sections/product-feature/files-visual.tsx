'use client';

import { styled } from '@linaria/react';
import {
  type PointerEvent as ReactPointerEvent,
  useRef,
  useState,
} from 'react';

import { PRODUCT_FEATURE_SCENE } from '@/tokens/feature-scenes/product-feature-scene';

const card = PRODUCT_FEATURE_SCENE.card;
const filesScene = PRODUCT_FEATURE_SCENE.files;

const Root = styled.div`
  background: ${card.background};
  border: 1.5px dashed ${filesScene.dashedBorder};
  display: flex;
  flex-direction: column;
  font-family: ${card.font};
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
  color: ${card.text};
  font-size: 12px;
  font-weight: 500;
`;

const HeaderCount = styled.span`
  color: ${card.textTertiary};
  font-size: 12px;
`;

const AddButton = styled.span`
  color: ${card.textSecondary};
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

const FileRow = styled.div`
  align-items: center;
  border-radius: 6px;
  cursor: grab;
  display: flex;
  gap: 10px;
  padding: 6px 8px;
  touch-action: none;
  transition: background-color 0.1s ease;
  user-select: none;

  &:hover {
    background-color: ${filesScene.rowHoverWash};
  }

  &:active {
    cursor: grabbing;
  }

  &[data-dragging] {
    opacity: 0.4;
  }
`;

const FileIcon = styled.div<{ $ink: string; $wash: string }>`
  align-items: center;
  background: ${({ $wash }) => $wash};
  border-radius: 6px;
  color: ${({ $ink }) => $ink};
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
  color: ${card.text};
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

  &[data-over] {
    background-color: ${filesScene.uploadOverWash};
  }
`;

const UploadIcon = styled.div`
  color: ${card.textTertiary};
  margin-bottom: 4px;
`;

const UploadTitle = styled.span`
  color: ${card.textSecondary};
  font-size: 11px;
  font-weight: 500;
`;

const UploadHint = styled.span`
  color: ${card.textTertiary};
  font-size: 10px;
`;

const FloatingFile = styled.div`
  box-shadow: ${filesScene.ghostShadow};
  left: 0;
  pointer-events: none;
  position: absolute;
  top: 0;
  z-index: 100;
`;

const FloatingFileInner = styled.div`
  align-items: center;
  background: ${filesScene.ghostBackground};
  border: 1px solid ${filesScene.ghostBorder};
  border-radius: 6px;
  display: flex;
  gap: 10px;
  padding: 6px 12px;
`;

type FileTone = keyof typeof filesScene.tones;

type FileData = {
  ext: string;
  name: string;
  tone: FileTone;
};

const FILES: FileData[] = [
  { name: 'meeting_record.mp3', ext: 'MP3', tone: 'audio' },
  { name: 'invoice2023_04_02(2).pdf', ext: 'PDF', tone: 'document' },
  { name: 'mapping01.xls', ext: 'XLS', tone: 'sheet' },
];

// A picked-up row dims while its ghost follows the pointer; release snaps
// back (the rows never reorder — the old site's order state was dead).
// The ghost transform writes straight to the element per frame; React
// renders only on pick-up/release.
export function FilesVisual({ active: _active }: { active: boolean }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedNumber, setDraggedNumber] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const activePointerRef = useRef<number | null>(null);
  const dragStateRef = useRef<{
    originX: number;
    originY: number;
    pointerX: number;
    pointerY: number;
  } | null>(null);

  const moveGhost = (x: number, y: number) => {
    ghostRef.current?.style.setProperty(
      'transform',
      `translate3d(${x}px, ${y}px, 0)`,
    );
  };

  const handlePointerDown = (
    event: ReactPointerEvent<HTMLDivElement>,
    fileNumber: number,
  ) => {
    event.preventDefault();
    const rootRect = rootRef.current?.getBoundingClientRect();
    const rowRect = event.currentTarget.getBoundingClientRect();

    if (!rootRect || dragStateRef.current) {
      return;
    }

    dragStateRef.current = {
      originX: rowRect.left - rootRect.left,
      originY: rowRect.top - rootRect.top,
      pointerX: event.clientX,
      pointerY: event.clientY,
    };
    setDraggedNumber(fileNumber);
    activePointerRef.current = event.pointerId;
    rootRef.current?.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointerRef.current) {
      return;
    }
    event.preventDefault();
    const state = dragStateRef.current;

    if (!state) {
      return;
    }

    moveGhost(
      state.originX + event.clientX - state.pointerX,
      state.originY + event.clientY - state.pointerY,
    );
  };

  const releasePointer = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerId !== activePointerRef.current) {
      return;
    }
    dragStateRef.current = null;
    setDraggedNumber(null);
    activePointerRef.current = null;
    if (rootRef.current?.hasPointerCapture(event.pointerId)) {
      rootRef.current.releasePointerCapture(event.pointerId);
    }
  };

  const files = FILES.map((file, fileNumber) => ({ file, fileNumber }));
  const draggedFile = draggedNumber === null ? null : FILES[draggedNumber];
  const dragOrigin = dragStateRef.current;

  return (
    <Root
      ref={rootRef}
      onPointerCancel={releasePointer}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => {
        event.preventDefault();
        releasePointer(event);
      }}
    >
      <Header>
        <HeaderLeft>
          <HeaderLabel>All</HeaderLabel>
          <HeaderCount>{FILES.length}</HeaderCount>
        </HeaderLeft>
        <AddButton>+ Add file</AddButton>
      </Header>

      <FileList>
        {files.map(({ file, fileNumber }) => (
          <FileRow
            data-dragging={draggedNumber === fileNumber ? '' : undefined}
            key={fileNumber}
            onPointerDown={(event) => handlePointerDown(event, fileNumber)}
          >
            <FileIcon
              $ink={filesScene.tones[file.tone].ink}
              $wash={filesScene.tones[file.tone].wash}
            >
              {file.ext}
            </FileIcon>
            <FileName>{file.name}</FileName>
          </FileRow>
        ))}
      </FileList>

      <UploadArea
        data-over={isDragOver ? '' : undefined}
        onDragEnter={() => setIsDragOver(true)}
        onDragLeave={() => setIsDragOver(false)}
        onDragOver={(event) => event.preventDefault()}
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

      {draggedFile && dragOrigin ? (
        <FloatingFile
          ref={ghostRef}
          style={{
            transform: `translate3d(${dragOrigin.originX}px, ${dragOrigin.originY}px, 0)`,
          }}
        >
          <FloatingFileInner>
            <FileIcon
              $ink={filesScene.tones[draggedFile.tone].ink}
              $wash={filesScene.tones[draggedFile.tone].wash}
            >
              {draggedFile.ext}
            </FileIcon>
            <FileName>{draggedFile.name}</FileName>
          </FloatingFileInner>
        </FloatingFile>
      ) : null}
    </Root>
  );
}
