'use client';

import { styled } from '@linaria/react';
import {
  IconFileText,
  IconFileTypePdf,
  IconPhoto,
  IconPlus,
} from '@tabler/icons-react';

import {
  CARD_BORDER,
  CARD_TEXT,
  CARD_TEXT_SECONDARY,
  CARD_TEXT_TERTIARY,
} from '../visual-tokens';

const Wrap = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
`;

const Head = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  padding: 14px 16px 10px;
`;

const HeadLeft = styled.div`
  align-items: baseline;
  display: flex;
  gap: 6px;
`;

const HeadTitle = styled.span`
  color: ${CARD_TEXT};
  font-size: 13px;
  font-weight: 600;
`;

const HeadCount = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  font-size: 13px;
`;

const UploadBtn = styled.span`
  align-items: center;
  border: 1px solid ${CARD_BORDER};
  border-radius: 6px;
  color: ${CARD_TEXT_SECONDARY};
  display: inline-flex;
  font-size: 11px;
  gap: 4px;
  padding: 4px 8px;

  svg {
    height: 13px;
    width: 13px;
  }
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
  border-radius: 6px;
  display: flex;
  gap: 10px;
  height: 40px;
  padding: 0 8px;
`;

const FileIcon = styled.span<{ $color: string }>`
  align-items: center;
  color: ${({ $color }) => $color};
  display: inline-flex;
  flex-shrink: 0;

  svg {
    height: 18px;
    width: 18px;
  }
`;

const FileName = styled.span`
  color: ${CARD_TEXT};
  font-size: 12px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const FileMeta = styled.span`
  color: ${CARD_TEXT_TERTIARY};
  flex-shrink: 0;
  font-size: 11px;
  margin-left: auto;
  padding-left: 12px;
  white-space: nowrap;
`;

const FILES: {
  name: string;
  icon: typeof IconFileText;
  color: string;
  meta: string;
}[] = [
  {
    name: 'NDA - Anthropic.pdf',
    icon: IconFileTypePdf,
    color: '#f87171',
    meta: '128 KB · Jul 1',
  },
  {
    name: 'Pricing Q4.xlsx',
    icon: IconFileText,
    color: '#4ade80',
    meta: '64 KB · Jul 12',
  },
  {
    name: 'Onboarding deck.pdf',
    icon: IconFileTypePdf,
    color: '#f87171',
    meta: '2.4 MB · Jul 18',
  },
  {
    name: 'Brand assets.png',
    icon: IconPhoto,
    color: '#93c5fd',
    meta: '512 KB · Jul 20',
  },
  {
    name: 'Security review.docx',
    icon: IconFileText,
    color: '#93c5fd',
    meta: '96 KB · Jul 24',
  },
];

export function FilesTab() {
  return (
    <Wrap>
      <Head>
        <HeadLeft>
          <HeadTitle>All</HeadTitle>
          <HeadCount>{FILES.length}</HeadCount>
        </HeadLeft>
        <UploadBtn>
          <IconPlus />
          Upload
        </UploadBtn>
      </Head>
      <List>
        {FILES.map((file) => {
          const Icon = file.icon;
          return (
            <Row key={file.name}>
              <FileIcon $color={file.color}>
                <Icon />
              </FileIcon>
              <FileName>{file.name}</FileName>
              <FileMeta>{file.meta}</FileMeta>
            </Row>
          );
        })}
      </List>
    </Wrap>
  );
}
