import { styled } from '@linaria/react';
import { IconCalendar, IconDotsVertical } from '@tabler/icons-react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';

import { FILE_ICONS } from '../data/file-icons';
import { type FileEntry } from '../types/file-entry';

const Row = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  gap: 8px;
  height: 48px;
  padding: 0 16px;

  &:hover {
    background-color: ${THEME_LIGHT.background.transparent.light};
  }
`;

const Left = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: 12px;
  min-width: 0;
  overflow: hidden;
`;

const FileIconBox = styled.span`
  align-items: center;
  border-radius: ${THEME_LIGHT.border.radius.sm};
  color: ${THEME_LIGHT.font.color.inverted};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: 5px;

  &[data-category='document'] {
    background: ${THEME_LIGHT.color.blue};
  }
  &[data-category='image'] {
    background: ${THEME_LIGHT.color.amber};
  }
  &[data-category='presentation'] {
    background: ${THEME_LIGHT.color.orange};
  }
  &[data-category='spreadsheet'] {
    background: ${THEME_LIGHT.color.turquoise};
  }
`;

const FileName = styled.span`
  color: ${THEME_LIGHT.font.color.primary};
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Right = styled.div`
  align-items: center;
  color: ${THEME_LIGHT.font.color.light};
  display: inline-flex;
  flex-shrink: 0;
  gap: 2px;
`;

const DateText = styled.span`
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  white-space: nowrap;
`;

const CalendarIcon = styled.span`
  align-items: center;
  display: inline-flex;
`;

const Dots = styled.span`
  align-items: center;
  display: inline-flex;
  margin-left: 4px;
`;

export function FileRow({ file }: { file: FileEntry }) {
  const FileGlyphIcon = FILE_ICONS[file.category];
  return (
    <Row>
      <Left>
        <FileIconBox data-category={file.category}>
          <FileGlyphIcon size={14} stroke={1.6} />
        </FileIconBox>
        <FileName>{file.name}</FileName>
      </Left>
      <Right>
        <CalendarIcon>
          <IconCalendar size={16} stroke={2} />
        </CalendarIcon>
        <DateText>{file.date}</DateText>
        <Dots>
          <IconDotsVertical size={16} stroke={2} />
        </Dots>
      </Right>
    </Row>
  );
}
