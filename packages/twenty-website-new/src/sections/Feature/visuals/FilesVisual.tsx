'use client';

import { styled } from '@linaria/react';
import { useState } from 'react';

import {
  BG_PANEL,
  BORDER_COLOR,
  TEXT_MUTED,
  TEXT_PRIMARY,
  TEXT_SECONDARY,
} from './visual-tokens';
import { FILES } from './files-visual.data';
import { WindowChrome } from './WindowChrome';

const Grid = styled.div`
  display: grid;
  flex: 1;
  gap: 8px;
  grid-template-columns: repeat(3, 1fr);
  min-height: 0;
  overflow-y: auto;
  padding: 12px;

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const FileCard = styled.div`
  background-color: ${BG_PANEL};
  border: 1px solid ${BORDER_COLOR};
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  transition:
    border-color 0.15s ease,
    transform 0.15s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.12);
    transform: translateY(-1px);
  }

  &[data-selected='true'] {
    border-color: rgba(99, 102, 241, 0.5);
  }
`;

const FileIcon = styled.div`
  align-items: center;
  border-radius: 6px;
  display: flex;
  font-size: 10px;
  font-weight: 800;
  height: 36px;
  justify-content: center;
  letter-spacing: 0.04em;
  width: 36px;
`;

const FileName = styled.span`
  color: ${TEXT_PRIMARY};
  font-size: 11px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileSize = styled.span`
  color: ${TEXT_MUTED};
  font-size: 10px;
  font-variant-numeric: tabular-nums;
`;

type FilesVisualProps = {
  active: boolean;
};

export function FilesVisual({ active }: FilesVisualProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  return (
    <WindowChrome breadcrumb="Acme Corp" breadcrumbBold="Files" title="Apple">
      <Grid>
        {FILES.map((file, index) => (
          <FileCard
            data-selected={selectedIndex === index}
            key={index}
            onClick={() =>
              setSelectedIndex(selectedIndex === index ? null : index)
            }
          >
            <FileIcon
              style={{
                backgroundColor: `${file.color}18`,
                color: file.color,
              }}
            >
              {file.type}
            </FileIcon>
            <FileName>{file.name}</FileName>
            <FileSize>{file.size}</FileSize>
          </FileCard>
        ))}
      </Grid>
    </WindowChrome>
  );
}
