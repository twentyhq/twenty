import { styled } from '@linaria/react';
import {
  IconCalendar,
  IconDots,
  IconFile,
  IconFileText,
  IconPlus,
  IconTable,
} from '@tabler/icons-react';

import { THEME_LIGHT as theme } from 'twenty-ui/theme';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { PREVIEW_COLORS } from '../../preview-colors';
import { type RecordFile } from '../../types';
import { RECORD_PANEL_CHROME } from './record-panel-chrome';

const FILE_ICONS: Record<
  RecordFile['category'],
  { Icon: typeof IconFile; color: string }
> = {
  pdf: { Icon: IconFileText, color: PREVIEW_COLORS.accent },
  doc: { Icon: IconFileText, color: PREVIEW_COLORS.accent },
  sheet: { Icon: IconTable, color: APP_PREVIEW_TONES.recordFileSheetInk },
  other: { Icon: IconFile, color: PREVIEW_COLORS.textTertiary },
};

const FileIconChip = styled.span<{ $color: string }>`
  align-items: center;
  background: ${({ $color }) => $color};
  border-radius: 4px;
  color: ${theme.font.color.inverted};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: 5px;
`;

const FileName = styled.span`
  color: ${PREVIEW_COLORS.text};
  flex: 1;
  font-family: ${theme.font.family};
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileDate = styled.span`
  align-items: center;
  color: ${PREVIEW_COLORS.textLight};
  display: flex;
  flex-shrink: 0;
  gap: 2px;
  margin-left: auto;
`;

const FileDateText = styled.span`
  color: ${PREVIEW_COLORS.text};
  font-family: ${theme.font.family};
  font-size: 13px;
  white-space: nowrap;
`;

const FileDots = styled.span`
  align-items: center;
  color: ${PREVIEW_COLORS.textTertiary};
  display: flex;
  flex-shrink: 0;
`;

const {
  ActivityRowBox,
  ListCard,
  TabAddButton,
  TabHeader,
  TabHeaderCount,
  TabHeaderLabel,
  TabHeaderTitle,
  TabSection,
} = RECORD_PANEL_CHROME;

export function RecordFiles({ files }: { files: RecordFile[] }) {
  return (
    <TabSection>
      <TabHeader>
        <TabHeaderLabel>
          <TabHeaderTitle>All</TabHeaderTitle>
          <TabHeaderCount>{files.length}</TabHeaderCount>
        </TabHeaderLabel>
        <TabAddButton>
          <IconPlus size={14} stroke={2} />
          Add file
        </TabAddButton>
      </TabHeader>
      <ListCard>
        {files.map((file, index) => {
          const { Icon, color } = FILE_ICONS[file.category];

          return (
            <ActivityRowBox $index={index} key={file.id}>
              <FileIconChip $color={color}>
                <Icon size={14} stroke={theme.icon.stroke.sm} />
              </FileIconChip>
              <FileName>{file.name}</FileName>
              <FileDate>
                <IconCalendar size={16} stroke={theme.icon.stroke.sm} />
                <FileDateText>{file.date}</FileDateText>
              </FileDate>
              <FileDots>
                <IconDots size={16} stroke={theme.icon.stroke.sm} />
              </FileDots>
            </ActivityRowBox>
          );
        })}
      </ListCard>
    </TabSection>
  );
}
