import { styled } from '@linaria/react';
import {
  IconCalendar,
  IconCalendarEvent,
  IconCheckbox,
  IconFileText,
  IconMail,
  IconNotes,
  IconPaperclip,
  IconPhoto,
  IconTable,
  IconTimelineEvent,
} from '@tabler/icons-react';

import { PRODUCT_FEATURE_PALETTE } from '@/tokens/feature-scenes/product-feature-palette';

const palette = PRODUCT_FEATURE_PALETTE;

// The product's six record tabs. Only Files is active here — the others are
// context (this visual owns its own tab content, nothing else).
const RECORD_TABS = [
  { icon: IconTimelineEvent, label: 'Timeline' },
  { icon: IconCheckbox, label: 'Tasks' },
  { icon: IconNotes, label: 'Notes' },
  { icon: IconPaperclip, label: 'Files' },
  { icon: IconMail, label: 'Emails' },
  { icon: IconCalendarEvent, label: 'Calendar' },
];

const ACTIVE_TAB = 'Files';

type FileKind = 'document' | 'spreadsheet' | 'image';

// twenty-front's file-type icon + colour (document -> blue, spreadsheet -> teal,
// image -> amber), the tone's strong colour as a solid box with a white glyph.
const FILE_KINDS: Record<
  FileKind,
  { color: string; icon: typeof IconFileText }
> = {
  document: { color: palette.tones.blue.text, icon: IconFileText },
  spreadsheet: { color: palette.tones.teal.text, icon: IconTable },
  image: { color: palette.tones.amber.text, icon: IconPhoto },
};

const FILES: { date: string; kind: FileKind; name: string }[] = [
  { date: 'Jul 1', kind: 'document', name: 'NDA - Anthropic.pdf' },
  { date: 'Jul 12', kind: 'spreadsheet', name: 'Pricing Q4.xlsx' },
  { date: 'Jul 18', kind: 'document', name: 'Onboarding deck.pdf' },
  { date: 'Jul 20', kind: 'image', name: 'Brand assets.png' },
  { date: 'Jul 24', kind: 'document', name: 'Security review.docx' },
];

const Root = styled.div`
  background-color: ${palette.background};
  display: flex;
  flex-direction: column;
  font-family: ${palette.font};
  height: 100%;
  overflow: hidden;
  width: 100%;
`;

const TabBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${palette.borderLight};
  display: flex;
  flex-shrink: 0;
  gap: 2px;
  padding: 0 12px;
`;

const Tab = styled.span`
  align-items: center;
  color: ${palette.textSecondary};
  display: flex;
  font-size: 12px;
  font-weight: 500;
  gap: 5px;
  padding: 11px 8px;
  white-space: nowrap;

  svg {
    height: 15px;
    width: 15px;
  }

  &[data-active] {
    box-shadow: inset 0 -1px 0 ${palette.textPrimary};
    color: ${palette.textPrimary};
  }
`;

const Body = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const Head = styled.div`
  align-items: baseline;
  display: flex;
  flex-shrink: 0;
  gap: 6px;
  padding: 14px 16px 12px;
`;

const HeadTitle = styled.span`
  color: ${palette.textPrimary};
  font-size: 13px;
  font-weight: 600;
`;

const HeadCount = styled.span`
  color: ${palette.textLight};
  font-size: 13px;
`;

const List = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding: 0 8px;
`;

const Row = styled.div`
  align-items: center;
  border-radius: 4px;
  display: flex;
  gap: 8px;
  height: 44px;
  padding: 0 8px;

  &:hover {
    background-color: ${palette.rowHoverBackground};
  }
`;

const Left = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: 12px;
  min-width: 0;
`;

const FileIconBox = styled.span`
  align-items: center;
  border-radius: 4px;
  color: ${palette.background};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  padding: 4px;

  svg {
    height: 13px;
    width: 13px;
  }
`;

const FileName = styled.span`
  color: ${palette.textPrimary};
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Meta = styled.span`
  align-items: center;
  color: ${palette.textLight};
  display: flex;
  flex-shrink: 0;
  font-size: 11px;
  gap: 4px;

  svg {
    height: 13px;
    width: 13px;
  }
`;

// A record's Files tab — the tab bar (Files active) over the product's file
// list with type-coloured icons.
export function FilesVisual() {
  return (
    <Root>
      <TabBar>
        {RECORD_TABS.map((recordTab) => {
          const TabIcon = recordTab.icon;
          return (
            <Tab
              data-active={recordTab.label === ACTIVE_TAB ? '' : undefined}
              key={recordTab.label}
            >
              <TabIcon />
              {recordTab.label}
            </Tab>
          );
        })}
      </TabBar>
      <Body>
        <Head>
          <HeadTitle>All</HeadTitle>
          <HeadCount>{FILES.length}</HeadCount>
        </Head>
        <List>
          {FILES.map((file) => {
            const FileIcon = FILE_KINDS[file.kind].icon;
            return (
              <Row key={file.name}>
                <Left>
                  <FileIconBox
                    style={{ backgroundColor: FILE_KINDS[file.kind].color }}
                  >
                    <FileIcon />
                  </FileIconBox>
                  <FileName>{file.name}</FileName>
                </Left>
                <Meta>
                  <IconCalendar />
                  {file.date}
                </Meta>
              </Row>
            );
          })}
        </List>
      </Body>
    </Root>
  );
}
