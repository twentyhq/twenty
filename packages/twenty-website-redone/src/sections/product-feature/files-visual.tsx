'use client';

import { styled } from '@linaria/react';
import {
  IconCalendar,
  IconDotsVertical,
  IconFileText,
  IconPhoto,
  IconPlus,
  IconPresentation,
  IconTable,
} from '@tabler/icons-react';
import { type ComponentType } from 'react';
import { THEME_LIGHT } from 'twenty-ui/theme';

import { previewFontSize } from '@/app-preview/preview-font-size';

import { RecordTabHeader } from './record-tab-header';

type FileCategory = 'document' | 'image' | 'presentation' | 'spreadsheet';

type FileGlyph = ComponentType<{ size?: number; stroke?: number }>;

// twenty-front's file-type icon by category: a solid colour box (document blue,
// spreadsheet turquoise, presentation orange, image amber) with a white glyph.
const FILE_ICONS: Record<FileCategory, FileGlyph> = {
  document: IconFileText,
  image: IconPhoto,
  presentation: IconPresentation,
  spreadsheet: IconTable,
};

const FILES: { category: FileCategory; date: string; name: string }[] = [
  { category: 'document', date: 'Jul 1', name: 'NDA - Anthropic.pdf' },
  { category: 'spreadsheet', date: 'Jul 12', name: 'Pricing Q4.xlsx' },
  { category: 'presentation', date: 'Jul 18', name: 'Onboarding deck.pptx' },
  { category: 'image', date: 'Jul 20', name: 'Brand assets.png' },
  { category: 'document', date: 'Jul 24', name: 'Security review.docx' },
];

const Root = styled.div`
  background-color: ${THEME_LIGHT.background.primary};
  display: flex;
  flex-direction: column;
  font-family: ${THEME_LIGHT.font.family};
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const Panel = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding-top: 8px;
`;

const TitleBar = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  padding: 8px 16px 12px;
`;

const Title = styled.span`
  align-items: baseline;
  color: ${THEME_LIGHT.font.color.primary};
  display: flex;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.md)};
  font-weight: ${THEME_LIGHT.font.weight.semiBold};
`;

const Count = styled.span`
  color: ${THEME_LIGHT.font.color.light};
  font-weight: ${THEME_LIGHT.font.weight.regular};
  margin-left: 8px;
`;

const AddButton = styled.span`
  align-items: center;
  border: 1px solid ${THEME_LIGHT.border.color.medium};
  border-radius: ${THEME_LIGHT.border.radius.sm};
  color: ${THEME_LIGHT.font.color.secondary};
  display: inline-flex;
  font-size: ${previewFontSize(THEME_LIGHT.font.size.sm)};
  font-weight: ${THEME_LIGHT.font.weight.medium};
  gap: 4px;
  padding: 4px 8px;
`;

const List = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
`;

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

export function FilesVisual({ active: _active }: { active: boolean }) {
  return (
    <Root>
      <RecordTabHeader active="Files" />
      <Panel>
        <TitleBar>
          <Title>
            All
            <Count>{FILES.length}</Count>
          </Title>
          <AddButton>
            <IconPlus size={12} stroke={2} />
            Add file
          </AddButton>
        </TitleBar>
        <List>
          {FILES.map((file) => {
            const FileGlyphIcon = FILE_ICONS[file.category];
            return (
              <Row key={file.name}>
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
          })}
        </List>
      </Panel>
    </Root>
  );
}
